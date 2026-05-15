import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  Play, 
  Settings as SettingsIcon, 
  History, 
  FileBox, 
  Github, 
  ExternalLink,
  RefreshCw,
  Download,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Project, Build, Artifact } from "@/types";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { FRAMEWORKS } from "@/lib/constants";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, buildsRes, artsRes] = await Promise.all([
          fetch(`/api/projects/${id}`),
          fetch(`/api/projects/${id}/builds`),
          fetch(`/api/projects/${id}/artifacts`),
        ]);

        if (projRes.ok) setProject(await projRes.json());
        if (buildsRes.ok) setBuilds(await buildsRes.json());
        if (artsRes.ok) setArtifacts(await artsRes.json());
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const triggerBuild = async (type: 'apk' | 'aab') => {
    try {
      const res = await fetch("/api/builds/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: id, build_type: type }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${type.toUpperCase()} build triggered!`);
        // Refresh builds
        const buildsRes = await fetch(`/api/projects/${id}/builds`);
        if (buildsRes.ok) setBuilds(await buildsRes.json());
      } else {
        toast.error(data.error || "Failed to trigger build");
      }
    } catch (error) {
      toast.error("Error triggering build");
    }
  };

  const downloadArtifact = async (artifactId: string) => {
    try {
      const res = await fetch(`/api/artifacts/${artifactId}/download`);
      if (!res.ok) throw new Error("Failed to get download URL");
      const { url } = await res.json();
      window.open(url, '_blank');
    } catch (error) {
      toast.error("Error fetching artifact download link");
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4F8EF7] border-t-transparent" />
    </div>
  );

  if (!project) return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
      <h2 className="text-2xl font-bold">Project Not Found</h2>
      <Button asChild className="mt-4"><Link to="/projects">Back to Projects</Link></Button>
    </div>
  );

  const fw = FRAMEWORKS.find(f => f.id === project.framework);

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-8 md:flex-row md:items-baseline md:justify-between border-b border-white/10 pb-8 md:pb-12">
        <div className="flex items-baseline gap-4 md:gap-6">
          <Button variant="ghost" size="icon" asChild className="text-white/30 hover:text-white hover:bg-transparent -ml-2 md:-ml-4">
            <Link to="/projects"><ChevronLeft size={20} md:size={24} strokeWidth={3} /></Link>
          </Button>
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-4 md:gap-6">
              <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter">{project.name}</h1>
              <div className="px-3 py-1 bg-[#F27D26] text-black text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                {fw?.name || project.framework}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              {project.source_type === 'github' ? (
                <a href={project.github_repo_url} target="_blank" className="flex items-center gap-2 hover:text-[#F27D26] transition-colors">
                  <Github size={12} md:size={14} strokeWidth={3} /> {project.github_repo_url?.split('/').slice(-2).join('/')}
                </a>
              ) : (
                <span className="flex items-center gap-2"><FileBox size={12} md:size={14} strokeWidth={3} /> ZIP_BLOB_STORE</span>
              )}
              <span className="hidden sm:inline opacity-20">|</span>
              <span className="flex items-center gap-2 font-mono"><History size={12} md:size={14} strokeWidth={3} /> BRANCH::{project.github_branch}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" className="flex-1 md:flex-none border-white/10 bg-transparent text-white font-black uppercase text-[10px] tracking-tight px-6 md:px-8 py-6 rounded-none hover:bg-white hover:text-black">
            <SettingsIcon className="mr-2 h-4 w-4" strokeWidth={3} />
            Config
          </Button>
          <Button 
            className="flex-1 md:flex-none bg-[#F27D26] text-black font-black uppercase text-[10px] tracking-tight px-8 md:px-10 py-6 rounded-none hover:bg-white transition-all shadow-lg shadow-[#F27D26]/20"
            onClick={() => triggerBuild('apk')}
          >
            <Play className="mr-2 h-4 w-4 fill-current" />
            FORGE APK
          </Button>
        </div>
      </div>

      <Tabs defaultValue="builds" className="space-y-6 md:space-y-10">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-none w-full md:w-auto h-auto grid grid-cols-3 md:flex">
          <TabsTrigger value="builds" className="rounded-none font-black uppercase text-[8px] md:text-[10px] tracking-widest data-[state=active]:bg-[#F27D26] data-[state=active]:text-black py-3">Pipeline History</TabsTrigger>
          <TabsTrigger value="artifacts" className="rounded-none font-black uppercase text-[8px] md:text-[10px] tracking-widest data-[state=active]:bg-[#F27D26] data-[state=active]:text-black py-3">Stored Assets</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-none font-black uppercase text-[8px] md:text-[10px] tracking-widest data-[state=active]:bg-[#F27D26] data-[state=active]:text-black py-3">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="builds" className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <Card className="border-white/10 bg-[#0A0A0A] text-[#F5F5F5] rounded-none">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Recent Executions</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-2">Historical log of all build attempts on this node</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader className="border-white/10">
                  <TableRow className="hover:bg-transparent border-white/10">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/20">Vector</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/20">Target</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/20">Source</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/20">Duration</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/20">Age</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-white/20">Ops</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {builds.length > 0 ? builds.map((build) => (
                    <TableRow key={build.id} className="border-white/10 hover:bg-white/2">
                      <TableCell>
                        <Badge className={cn(
                          "rounded-none uppercase text-[8px] font-black tracking-widest px-2 py-0.5 border-none",
                          build.status === 'success' ? "bg-[#00FF41] text-black" :
                          build.status === 'failed' ? "bg-red-500 text-white" :
                          build.status === 'running' ? "bg-[#F27D26] text-black animate-pulse" :
                          "bg-white/10 text-white/50"
                        )}>
                          {build.status === 'running' ? 'EXECUTING' : build.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold uppercase text-[#F27D26]">{build.build_type}</TableCell>
                      <TableCell className="text-[10px] font-mono opacity-50 uppercase">{build.branch}</TableCell>
                      <TableCell className="text-[10px] font-mono opacity-50 uppercase">
                        {build.duration_seconds ? `${Math.floor(build.duration_seconds / 60)}m ${build.duration_seconds % 60}s` : "-- SEC"}
                      </TableCell>
                      <TableCell className="text-[10px] font-mono opacity-50 uppercase">
                        {formatDistanceToNow(new Date(build.created_at), { addSuffix: true }).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild className="h-10 px-4 border-white/10 bg-transparent text-white font-black uppercase text-[10px] tracking-tight rounded-none hover:bg-white hover:text-black">
                          <Link to={`/projects/${id}/builds/${build.id}`}>View Shell</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 italic">
                        No execution history found for this project segment.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artifacts" className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {artifacts.length > 0 ? artifacts.map((art) => (
              <Card key={art.id} className="border-white/10 bg-[#0A0A0A] text-[#F5F5F5] rounded-none group hover:border-[#F27D26]/50 transition-all">
                <CardHeader className="pb-3 border-b border-white/5 bg-white/2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#F27D26]">
                    <span>{art.artifact_type}</span>
                    <span className="text-white opacity-30">{(art.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <CardTitle className="text-lg font-black uppercase tracking-tight truncate mt-2">{art.file_name}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center pt-6">
                  <span className="text-[10px] font-mono opacity-30 uppercase">{formatDistanceToNow(new Date(art.created_at), { addSuffix: true })}</span>
                  <Button 
                    variant="outline" 
                    className="h-10 border-white/10 bg-transparent text-white font-black uppercase text-[10px] tracking-tight rounded-none hover:bg-white hover:text-black shadow-xl shadow-black/50"
                    onClick={() => downloadArtifact(art.id)}
                  >
                    <Download size={14} className="mr-2" strokeWidth={3} /> Fetch
                  </Button>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full flex flex-col items-center justify-center py-32 border border-white/10 bg-[#0A0A0A] space-y-6">
                <FileBox size={40} className="opacity-10" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">No output binaries have been persisted yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
