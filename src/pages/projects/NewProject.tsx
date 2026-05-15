import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Github, FileArchive, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { FRAMEWORKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function NewProject() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    framework: "flutter",
    sourceType: "github" as const,
    githubUrl: "",
    branch: "main",
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error("Failed to create project");
      
      toast.success("Project created successfully");
      navigate("/projects");
    } catch (error) {
      toast.error("Error creating project");
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-12 py-16 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between border-b border-white/10 pb-12">
        <div className="flex items-baseline gap-6">
          <Button variant="ghost" size="icon" asChild className="text-white/30 hover:text-white hover:bg-transparent -ml-4">
            <Link to="/projects"><ChevronLeft size={24} strokeWidth={3} /></Link>
          </Button>
          <div className="space-y-4">
            <h1 className="text-5xl font-black uppercase tracking-tighter">Initialize Pipeline</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F27D26]">
              PHASE_{step} // {step === 1 ? "SOURCE_SELECTION" : step === 2 ? "METADATA_CONFIG" : "SYSTEM_READY"}
            </p>
          </div>
        </div>
      </div>

      <div className="h-1 lg:h-2 w-full bg-white/5 overflow-hidden">
        <div 
          className="h-full bg-[#F27D26] transition-all duration-700 ease-out" 
          style={{ width: `${(step / 3) * 100}%` }} 
        />
      </div>

      <div className="space-y-10">
        {step === 1 && (
          <div className="space-y-10 animate-in fade-in translate-y-4 duration-500">
            <RadioGroup 
              defaultValue="github" 
              className="grid grid-cols-1 gap-8 md:grid-cols-2"
              onValueChange={(val) => setFormData(prev => ({ ...prev, sourceType: val as any }))}
            >
              <Label
                htmlFor="github"
                className={cn(
                  "flex cursor-pointer flex-col p-10 transition-all border border-white/5 relative group rounded-none",
                  formData.sourceType === 'github' ? "bg-white/5 border-[#F27D26]" : "bg-[#0A0A0A] hover:bg-white/2"
                )}
              >
                <RadioGroupItem value="github" id="github" className="sr-only" />
                <Github size={32} className={cn("transition-colors", formData.sourceType === 'github' ? "text-[#F27D26]" : "text-white/20")} strokeWidth={3} />
                <div className="mt-8 space-y-2">
                  <div className="text-xl font-black uppercase tracking-tighter">Remote Core</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Direct GitHub Action Integration</div>
                </div>
                {formData.sourceType === 'github' && <div className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-[0.4em] text-[#F27D26]">CONNECTED</div>}
              </Label>
              <Label
                htmlFor="zip"
                className={cn(
                  "flex cursor-pointer flex-col p-10 transition-all border border-white/5 relative group rounded-none",
                  formData.sourceType === 'zip' ? "bg-white/5 border-[#F27D26]" : "bg-[#0A0A0A] hover:bg-white/2"
                )}
              >
                <RadioGroupItem value="zip" id="zip" className="sr-only" />
                <FileArchive size={32} className={cn("transition-colors", formData.sourceType === 'zip' ? "text-[#F27D26]" : "text-white/20")} strokeWidth={3} />
                <div className="mt-8 space-y-2">
                  <div className="text-xl font-black uppercase tracking-tighter">Local Blob</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Binary ZIP Source Transfer</div>
                </div>
                {formData.sourceType === 'zip' && <div className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-[0.4em] text-[#F27D26]">STAGED</div>}
              </Label>
            </RadioGroup>

            {formData.sourceType === 'github' && (
              <div className="space-y-6 bg-white/2 border border-white/10 p-10 rounded-none animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-3">
                  <Label htmlFor="repo" className="text-[10px] font-black uppercase tracking-widest text-white/40">Nexus Repository URL</Label>
                  <Input 
                    id="repo" 
                    placeholder="HL_NEXUS://github.com/..." 
                    className="bg-transparent border-white/10 h-12 text-sm font-mono focus-visible:ring-[#F27D26] rounded-none px-4"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="branch" className="text-[10px] font-black uppercase tracking-widest text-white/40">Target Branch</Label>
                    <Input 
                      id="branch" 
                      placeholder="main" 
                      className="bg-transparent border-white/10 h-12 text-sm font-mono focus-visible:ring-[#F27D26] rounded-none px-4"
                      value={formData.branch}
                      onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in fade-in translate-y-4 duration-500">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-white/40">Segment Identifier</Label>
                <Input 
                  id="name" 
                  placeholder="MY_NEW_PROJECT_MOD" 
                  className="bg-[#0A0A0A] border-white/10 h-12 text-sm font-mono focus-visible:ring-[#F27D26] rounded-none px-4"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="framework" className="text-[10px] font-black uppercase tracking-widest text-white/40">Production Framework</Label>
                <Select 
                  defaultValue={formData.framework}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, framework: val }))}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-white/10 h-12 text-[10px] font-black uppercase tracking-widest px-4 rounded-none focus-visible:ring-[#F27D26]">
                    <SelectValue placeholder="AUTO_DETECT" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-white/10 text-white rounded-none">
                    {FRAMEWORKS.map(fw => (
                      <SelectItem key={fw.id} value={fw.id} className="text-[10px] font-black uppercase tracking-widest focus:bg-[#F27D26] focus:text-black">{fw.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-white/40">Infrastructure Metadata</Label>
              <Textarea 
                id="description" 
                placeholder="Declare project objectives..." 
                className="bg-[#0A0A0A] border-white/10 min-h-[150px] p-4 text-sm focus-visible:ring-[#F27D26] rounded-none"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 bg-white/2 border border-white/10 p-12 rounded-none animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F27D26] opacity-[0.03] blur-3xl -mr-32 -mt-32" />
            <div className="flex items-center gap-6">
              <CheckCircle2 size={32} className="text-[#00FF41]" strokeWidth={3} />
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Manifest Verified</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-2">All parameters successfully parsed and validated</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-white/5">
              {[
                { label: "Pipeline Name", value: formData.name },
                { label: "Framework Vector", value: formData.framework.toUpperCase() },
                { label: "Source Topology", value: formData.sourceType.toUpperCase() },
                { label: "Remote Endpoint", value: formData.githubUrl || "LOCAL_BLOB", mono: true },
                { label: "Execution Branch", value: formData.branch, mono: true }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">{item.label}</div>
                  <div className={cn("text-sm font-bold uppercase tracking-widest", item.mono && "font-mono text-xs text-[#F27D26]")}>{item.value || "---"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-12 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={() => setStep(prev => prev - 1)}
            disabled={step === 1}
            className="text-white/30 hover:text-white uppercase font-black tracking-widest text-[10px] h-12 px-8 rounded-none hover:bg-transparent"
          >
            Previous
          </Button>
          
          {step < 3 ? (
            <Button 
              className="bg-white text-black font-black uppercase text-[10px] tracking-tight h-12 px-10 rounded-none hover:bg-[#F27D26] hover:text-white transition-all shadow-xl"
              onClick={() => {
                if (step === 1 && formData.sourceType === 'github' && !formData.githubUrl) {
                  return toast.error("REPOSITORY_URL_REQUIRED");
                }
                if (step === 2 && !formData.name) {
                  return toast.error("PROJECT_ID_REQUIRED");
                }
                setStep(prev => prev + 1);
              }}
            >
              Continue Pulse <ChevronRight className="ml-2 h-4 w-4" strokeWidth={3} />
            </Button>
          ) : (
            <Button 
              className="bg-[#F27D26] text-black font-black uppercase text-[10px] tracking-tight h-12 px-12 rounded-none hover:bg-white transition-all shadow-2xl shadow-[#F27D26]/50"
              onClick={handleSubmit}
            >
              Initialize Node
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
