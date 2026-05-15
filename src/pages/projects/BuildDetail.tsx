import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ExternalLink, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Trash2,
  Github
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LogsViewer } from "@/components/builds/LogsViewer";
import { Build, Project } from "@/types";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

export default function BuildDetail() {
  const { id, buildId } = useParams<{ id: string, buildId: string }>();
  const [build, setBuild] = useState<Build | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [buildRes, projRes] = await Promise.all([
          fetch(`/api/builds/${buildId}`),
          fetch(`/api/projects/${id}`)
        ]);

        if (buildRes.ok) setBuild(await buildRes.json());
        if (projRes.ok) setProject(await projRes.json());
      } catch (error) {
        console.error("Error fetching build details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, buildId]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4F8EF7] border-t-transparent" />
    </div>
  );

  if (!build || !project) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <XCircle className="mb-4 h-12 w-12 text-red-500" />
      <h2 className="text-2xl font-bold">Build Not Found</h2>
      <Button asChild className="mt-4"><Link to={`/projects/${id}`}>Back to Project</Link></Button>
    </div>
  );

  const isCompleted = ['success', 'failed', 'cancelled'].includes(build.status);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between border-b border-white/10 pb-8">
        <div className="flex items-baseline gap-6">
          <Button variant="ghost" size="icon" asChild className="text-white/30 hover:text-white hover:bg-transparent -ml-4">
            <Link to={`/projects/${id}`}><ChevronLeft size={24} strokeWidth={3} /></Link>
          </Button>
          <div className="space-y-4">
            <div className="flex items-baseline gap-6">
              <h1 className="text-4xl font-black uppercase tracking-tighter shrink-0">EXECUTION::{buildId.slice(0, 8)}</h1>
              <Badge className={cn(
                "rounded-none uppercase px-3 font-black tracking-widest border-none shrink-0",
                build.status === 'success' ? "bg-[#00FF41] text-black" :
                build.status === 'failed' ? "bg-red-500 text-white" :
                build.status === 'running' ? "bg-[#F27D26] text-black animate-pulse" :
                "bg-white/10 text-white/50"
              )}>
                {build.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              <span className="text-[#F27D26]">{project.name}</span>
              <span className="opacity-20">|</span>
              <span className="font-mono">{build.build_type}</span>
              <span className="opacity-20">|</span>
              <span className="font-mono">SRC::{build.branch}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          {!isCompleted && (
            <Button variant="outline" className="border-red-500/20 text-red-500 bg-transparent font-black uppercase text-[10px] tracking-tight px-8 py-6 rounded-none hover:bg-red-500 hover:text-white transition-all">
              Abort Pulse
            </Button>
          )}
          {build.status === 'success' && (
            <Button className="bg-white text-black font-black uppercase text-[10px] tracking-tight px-10 py-6 rounded-none hover:bg-[#F27D26] hover:text-white transition-all">
              Fetch Payload
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {[
          { label: "Trigger Timestamp", value: format(new Date(build.created_at), 'HH:mm:ss.SSS'), icon: Calendar },
          { label: "Delta Time", value: build.duration_seconds ? `${build.duration_seconds}s` : build.status === 'running' ? "STREAMING..." : "N/A", icon: Clock },
          { label: "Nexus ID", value: build.github_run_id ? `#${build.github_run_id}` : "PENDING_HANDSHAKE", icon: Github, link: build.github_run_url }
        ].map((stat, i) => (
          <div key={i} className="border border-white/10 bg-[#0A0A0A] p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#F27D26] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">{stat.label}</div>
            <div className="text-lg font-mono font-bold tracking-tight">
              {stat.link ? (
                <a href={stat.link} target="_blank" className="hover:text-[#F27D26] flex items-center gap-2">
                  {stat.value} <ExternalLink size={12} strokeWidth={3} />
                </a>
              ) : stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="absolute -top-6 left-0 text-[10px] font-black uppercase tracking-[0.4em] text-white/10 select-none">Live Logs Stream</div>
        <LogsViewer buildId={buildId} isCompleted={isCompleted} />
      </div>
      
      {build.error_message && (
        <div className="border border-red-500/30 bg-red-500/5 p-8 flex gap-6 text-red-500 rounded-none relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
          <XCircle size={24} className="shrink-0" strokeWidth={3} />
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest mb-2">Critical Fault Detected</div>
            <div className="font-mono text-sm leading-relaxed">{build.error_message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
