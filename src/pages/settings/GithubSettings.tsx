import { useState } from "react";
import { Github, Key, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function GithubSettings() {
  const [pat, setPat] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (!pat.startsWith("ghp_")) {
      return toast.error("Invalid GitHub PAT format. It should start with 'ghp_'.");
    }
    // Mock save
    toast.success("GitHub PAT saved successfully.");
    setIsSaved(true);
    setPat("");
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#F1F5F9]">GitHub Integration</h1>
        <p className="text-[#94A3B8]">Configure your Personal Access Token to enable builds from private repositories.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-[#2A2A3D] bg-[#12121A] text-[#F1F5F9]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-[#4F8EF7]" />
                Personal Access Token
              </CardTitle>
              <CardDescription className="text-[#94A3B8]">
                Required for ForgeX to dispatch GitHub Actions workflows on your behalf.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Your GitHub PAT</label>
                  {isSaved && (
                    <span className="flex items-center gap-1 text-xs text-green-500">
                      <CheckCircle2 size={12} /> Connected
                    </span>
                  )}
                </div>
                <Input
                  type="password"
                  placeholder={isSaved ? "ghp_••••••••••••••••••••" : "ghp_your_personal_access_token"}
                  className="bg-[#0A0A0F] border-[#2A2A3D] focus-visible:ring-[#4F8EF7]"
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSave}
                className="w-full bg-[#4F8EF7] hover:bg-[#3D7AE8]"
              >
                {isSaved ? "Update Token" : "Save Token"}
              </Button>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-400">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertCircle size={14} />
              Required Scopes
            </div>
            <p className="opacity-80">Your PAT needs the following scopes enabled:</p>
            <ul className="mt-2 list-inside list-disc opacity-80">
              <li><code>repo</code> (Full control of private repositories)</li>
              <li><code>workflow</code> (Update GitHub Action workflows)</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[#2A2A3D] bg-[#12121A] p-6">
            <h3 className="mb-4 text-lg font-bold">Why do we need this?</h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              ForgeX Studio doesn't host your code. Instead, we use your GitHub Actions to run the build pipeline. 
              This ensures your code stays in your infrastructure while we manage the complex build toolchain.
            </p>
            <Button variant="link" className="mt-4 h-auto p-0 text-[#4F8EF7] hover:text-[#3D7AE8]" asChild>
              <a href="https://github.com/settings/tokens" target="_blank" className="flex items-center gap-1">
                Generate a token on GitHub <ExternalLink size={12} />
              </a>
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A3D] p-10 text-center">
            <Github className="mb-4 h-12 w-12 text-[#475569]" />
            <h4 className="font-semibold">Project Workflows</h4>
            <p className="mt-2 text-xs text-[#475569]">
              Don't forget to add our workflow YAML files to your repository's <code>.github/workflows</code> folder.
            </p>
            <Button variant="outline" className="mt-4 border-[#2A2A3D] bg-[#12121A] text-xs">
              Download YAML Templates
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
