import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { Octokit } from "octokit";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import Stripe from "stripe";
import nodemailer from "nodemailer";

config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe Webhook needs raw body
  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        (req as any).body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Subscription completed for:", session.client_reference_id);
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Project Routes
  app.get("/api/projects", async (req, res) => {
    // User ID would normally come from session
    const userId = "dummy-user-id"; 
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
      
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  app.get("/api/projects/:id", async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", req.params.id)
      .single();
      
    if (error) return res.status(404).json({ error: "Project not found" });
    res.json(data);
  });

  app.post("/api/projects", async (req, res) => {
    const userId = "dummy-user-id";
    const { name, description, framework, sourceType, githubUrl, branch } = req.body;
    
    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert({
        user_id: userId,
        name,
        description,
        framework,
        source_type: sourceType,
        github_repo_url: githubUrl,
        github_branch: branch || "main",
        status: "active"
      })
      .select()
      .single();
      
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  });

  // Build Routes
  app.get("/api/projects/:id/builds", async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("builds")
      .select("*")
      .eq("project_id", req.params.id)
      .order("created_at", { ascending: false });
      
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  app.get("/api/builds/:id", async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("builds")
      .select("*")
      .eq("id", req.params.id)
      .single();
      
    if (error) return res.status(404).json({ error: "Build not found" });
    res.json(data);
  });

  app.post("/api/builds/trigger", async (req, res) => {
    const { project_id, build_type } = req.body;
    const userId = "dummy-user-id";

    try {
      // 1. Get project details
      const { data: project, error: pError } = await supabaseAdmin
        .from("projects")
        .select("*")
        .eq("id", project_id)
        .single();

      if (pError || !project) return res.status(404).json({ error: "Project not found" });

      // 2. Create build record
      const { data: build, error: bError } = await supabaseAdmin
        .from("builds")
        .insert({
          project_id,
          user_id: userId,
          build_type,
          status: "pending",
          branch: project.github_branch || "main"
        })
        .select()
        .single();

      if (bError) return res.status(500).json({ error: bError.message });

      // 3. Trigger GitHub Action
      if (project.source_type === 'github' && project.github_repo_url) {
        const repoUrl = project.github_repo_url;
        // Parse owner and repo from https://github.com/owner/repo
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
          const owner = match[1];
          const repo = match[2].replace(/\.git$/, "");
          
          try {
            await octokit.rest.actions.createWorkflowDispatch({
              owner,
              repo,
              workflow_id: "build.yml", // Assumed workflow file name
              ref: project.github_branch || "main",
              inputs: {
                build_id: build.id,
                build_type: build_type,
              },
            });
            
            // Update status to 'queued'
            await supabaseAdmin
              .from("builds")
              .update({ status: "queued", github_run_id: "queued" })
              .eq("id", build.id);
          } catch (gitError: any) {
            console.error("GitHub API Error:", gitError);
            await supabaseAdmin
              .from("builds")
              .update({ status: "failed", error_message: `GitHub Trigger Failed: ${gitError.message}` })
              .eq("id", build.id);
            return res.status(500).json({ error: "Failed to trigger GitHub workflow" });
          }
        }
      }

      res.json({ success: true, build_id: build.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Artifact Routes
  app.get("/api/artifacts/:id/download", async (req, res) => {
    try {
      const { data: artifact, error } = await supabaseAdmin
        .from("artifacts")
        .select("*")
        .eq("id", req.params.id)
        .single();

      if (error || !artifact) return res.status(404).json({ error: "Artifact not found" });

      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: artifact.storage_path,
      });

      const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
      res.json({ url });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/projects/:id/artifacts", async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("artifacts")
      .select("*")
      .eq("project_id", req.params.id) // Note: artifacts table might need project_id or join with builds
      .order("created_at", { ascending: false });
      
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  app.post("/api/billing/checkout", async (req, res) => {
    const { priceId } = req.body;
    const userId = "dummy-user-id"; // In real app, get from auth

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${process.env.APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/billing`,
        client_reference_id: userId,
      });

      res.json({ url: session.url });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // SMTP Test Route
  app.post("/api/admin/test-email", async (req, res) => {
    try {
      await mailer.sendMail({
        from: `"ForgeX Studio" <${process.env.SMTP_USER}>`,
        to: req.body.to || process.env.SMTP_USER,
        subject: "Nexus Pulse Test",
        text: "System communication operational.",
        html: "<b>System communication operational.</b>",
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});
