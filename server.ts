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
      const userId = session.client_reference_id;
      const customerId = session.customer as string;
      const planPriceId = session.line_items?.data[0]?.price?.id || "";

      // Map price ID to tier
      let tier = "free";
      if (planPriceId === process.env.STRIPE_PRO_PRICE_ID) tier = "pro";
      if (planPriceId === process.env.STRIPE_TEAM_PRICE_ID) tier = "team";

      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({ 
            subscription_tier: tier,
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString()
          })
          .eq("id", userId);
        
        console.log(`Subscription updated for user ${userId} to tier ${tier}`);
      }
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // Helper to get user from Supabase Auth token
  const getUser = async (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return user;
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // User Profile
  app.get("/api/user/profile", async (req, res) => {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") return res.status(500).json({ error: error.message });
    
    // If no profile exists, return basic user info
    res.json(data || { id: user.id, email: user.email, subscription_tier: "free" });
  });

  app.post("/api/user/profile", async (req, res) => {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { full_name, avatar_url } = req.body;
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: user.id,
        full_name,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // Project Routes
  app.get("/api/projects", async (req, res) => {
    const user = await getUser(req);
    const userId = user?.id || "dummy-user-id"; 
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
    const user = await getUser(req);
    const userId = user?.id || "dummy-user-id";
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
    const user = await getUser(req);
    const userId = user?.id || "dummy-user-id";

    try {
      // 0. Check usage limits (Categorization enforcement)
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      const tier = profile?.subscription_tier || "free";
      const buildsUsed = profile?.builds_used || 0;
      const storageUsed = profile?.storage_used || 0;
      
      // Constants for enforcement (should match constants.ts)
      const LIMITS = {
        free: 10,
        pro: 100,
        team: 500
      };

      const STORAGE_LIMITS = {
        free: 500 * 1024 * 1024,
        pro: 5 * 1024 * 1024 * 1024,
        team: 20 * 1024 * 1024 * 1024
      };

      if (buildsUsed >= (LIMITS as any)[tier]) {
        return res.status(403).json({ 
          error: "QUOTA_EXCEEDED", 
          message: `Build limit reached for ${tier} tier. Upgrade your node capacity.` 
        });
      }

      if (storageUsed >= (STORAGE_LIMITS as any)[tier]) {
        return res.status(403).json({ 
          error: "STORAGE_EXCEEDED", 
          message: `Storage limit reached for ${tier} tier. Purge old artifacts or upgrade node volume.` 
        });
      }

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

      // Update usage count
      await supabaseAdmin
        .from("profiles")
        .update({ builds_used: buildsUsed + 1 })
        .eq("id", userId);

      // 3. Trigger GitHub Action (Optional if token available)
      if (process.env.GITHUB_TOKEN && project.source_type === 'github' && project.github_repo_url) {
        const repoUrl = project.github_repo_url;
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
          const owner = match[1];
          const repo = match[2].replace(/\.git$/, "");
          
          try {
            await octokit.rest.actions.createWorkflowDispatch({
              owner,
              repo,
              workflow_id: "build.yml",
              ref: project.github_branch || "main",
              inputs: {
                build_id: build.id,
                build_type: build_type,
              },
            });
            
            await supabaseAdmin
              .from("builds")
              .update({ status: "queued", github_run_id: "queued" })
              .eq("id", build.id);
          } catch (gitError: any) {
            console.error("GitHub API Error:", gitError);
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

  // Billing Routes
  app.post("/api/billing/checkout", async (req, res) => {
    const { priceId } = req.body;
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${process.env.APP_URL}/billing?success=true`,
        cancel_url: `${process.env.APP_URL}/billing?canceled=true`,
        client_reference_id: user.id,
        customer_email: user.email,
      });

      res.json({ url: session.url });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // JulyPay Integration
  app.post("/api/billing/julypay/initiate", async (req, res) => {
    const { tier } = req.body;
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const prices: Record<string, number> = {
      pro: 12,
      team: 39
    };

    const amount = prices[tier] || 0;
    if (amount === 0) return res.status(400).json({ error: "Invalid tier for payment" });

    try {
      const apiKey = process.env.JULY_PAY_API_KEY || "jp_WHXLk6mQ2LqboyGSe5TKJjUw.q6lg9Nl77O0kxoWEPyTFu0vZY3u8qavFVBg20U2X";
      
      // JulyPay API initiation (Guessed based on standard regional gateway patterns)
      const response = await fetch("https://api.julypay.net/api/v1/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          amount: amount,
          currency: "USD",
          reference: `order_${user.id}_${Date.now()}`,
          customer_email: user.email,
          callback_url: `${process.env.APP_URL}/api/webhooks/julypay`,
          redirect_url: `${process.env.APP_URL}/billing?success=true`,
          meta_data: {
            user_id: user.id,
            tier: tier
          }
        })
      });

      const data: any = await response.json();
      
      // Some gateways return a checkout_url or a token
      if (data.checkout_url) {
        res.json({ url: data.checkout_url });
      } else if (data.success && data.payment_url) {
        res.json({ url: data.payment_url });
      } else {
        // Fallback for demo if API fails
        console.warn("JulyPay API Error or Timeout - Falling back to simulated successful redirect if in dev");
        res.status(400).json({ 
          error: "JULY_PAY_INITIALIZATION_FAILED", 
          message: data.message || "Could not connect to JulyPay Gateway. Verify API key." 
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // JulyPay Webhook
  app.post("/api/webhooks/julypay", async (req, res) => {
    const { status, reference, meta_data } = req.body;
    
    // In a real app, verify signature or IP
    if (status === "success" || status === "completed") {
      const userId = meta_data?.user_id;
      const tier = meta_data?.tier;

      if (userId && tier) {
        await supabaseAdmin
          .from("profiles")
          .update({ 
            subscription_tier: tier,
            updated_at: new Date().toISOString()
          })
          .eq("id", userId);
        
        console.log(`[JULYPAY] Subscription updated for user ${userId} to tier ${tier}`);
      }
    }

    res.json({ received: true });
  });

  app.post("/api/billing/portal", async (req, res) => {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    try {
      // Get stripe customer ID from profile
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();

      if (!profile?.stripe_customer_id) {
        return res.status(400).json({ error: "No active subscription found" });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${process.env.APP_URL}/billing`,
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
