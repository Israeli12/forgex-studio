import { Box, Github, FileArchive, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Framework } from "@/types";
import { FRAMEWORKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  framework: Framework;
  sourceType: 'github' | 'zip';
  lastBuildStatus?: string;
  lastBuildDate?: string;
}

export function ProjectCard({ 
  name, 
  description, 
  framework, 
  sourceType, 
  lastBuildStatus, 
  lastBuildDate 
}: ProjectCardProps) {
  const fw = FRAMEWORKS.find(f => f.id === framework);

  return (
    <Card className="border-white/10 bg-[#0A0A0A] text-[#F5F5F5] transition-all hover:border-[#F27D26] rounded-none group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {sourceType === 'github' ? <Github size={64} /> : <FileArchive size={64} />}
      </div>
      <CardHeader className="pb-3 border-b border-white/5 relative bg-white/2">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-2xl font-black uppercase tracking-tighter truncate">{name}</CardTitle>
          <div className="px-2 py-1 bg-[#F27D26] text-black text-[8px] font-black uppercase tracking-widest shrink-0">
            {fw?.name || framework}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 bg-transparent">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 line-clamp-2 leading-relaxed">
          {description || "No metadata description provided for this pipeline."}
        </p>
        
        <div className="flex items-center gap-3 py-3 border-y border-white/5">
          <div className="h-2 w-2 rounded-full bg-[#00FF41] animate-pulse" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#00FF41]">System Running</span>
          <span className="ml-auto text-[9px] font-mono opacity-30 uppercase">{sourceType === 'github' ? "GIT_REMOTE" : "ZIP_BLOB"}</span>
        </div>

        <div className="flex items-end justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-[8px] text-white/30 uppercase font-black tracking-[0.3em] mb-1">State Vector</span>
            <span className={cn(
              "text-xs font-mono font-bold tabular-nums",
              lastBuildStatus === 'success' ? "text-white" : "text-[#F27D26]"
            )}>
              {lastBuildStatus ? `STATUS_${lastBuildStatus.toUpperCase()}` : "UNINITIALIZED"}
            </span>
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 bg-transparent text-white rounded-none hover:bg-white hover:text-black transition-all">
            <ArrowRight size={14} strokeWidth={3} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
