import { useState, useEffect } from "react";
import { PlusCircle, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Project } from "@/types";
import { Link } from "react-router-dom";

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between border-b border-white/10 pb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Pipelines</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F27D26] mt-2">Active Mobile Build Infrastructure</p>
        </div>
        <Button asChild className="bg-white text-black font-black uppercase text-[10px] tracking-tight px-8 py-6 rounded-none hover:bg-[#F27D26] hover:text-white transition-all">
          <Link to="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" strokeWidth={3} />
            Initialize Project
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
          <Input 
            className="bg-white/5 border-white/10 pl-12 h-12 text-[10px] font-bold uppercase tracking-widest placeholder:text-white/20 rounded-none focus-visible:ring-[#F27D26]" 
            placeholder="Filter active modules..." 
          />
        </div>
        <Button variant="outline" className="border-white/10 bg-transparent text-white font-black uppercase text-[10px] tracking-tight h-12 px-6 rounded-none hover:bg-white hover:text-black">
          <SlidersHorizontal className="mr-2 h-4 w-4" strokeWidth={3} />
          Filters
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-2 w-32 bg-white/5 overflow-hidden">
            <div className="h-full bg-[#F27D26] animate-pulse w-1/2" />
          </div>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description}
              framework={project.framework}
              sourceType={project.source_type}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-white/10 bg-[#0A0A0A] py-32 text-center group">
          <h3 className="text-3xl font-black uppercase tracking-tighter text-white/20 group-hover:text-white transition-colors">Void State Detected</h3>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Launch your first pipeline to begin production</p>
          <Button asChild className="mt-12 bg-white text-black font-black uppercase text-[10px] tracking-tight px-12 py-6 rounded-none hover:bg-[#F27D26] hover:text-white transition-all">
            <Link to="/projects/new">Begin Integration</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
