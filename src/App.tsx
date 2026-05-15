import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ProjectsList from "@/pages/projects/ProjectsList";
import NewProject from "@/pages/projects/NewProject";
import ProjectDetail from "@/pages/projects/ProjectDetail";
import BuildDetail from "@/pages/projects/BuildDetail";
import BillingPage from "@/pages/billing/BillingPage";
import GithubSettings from "@/pages/settings/GithubSettings";
import ApiKeysSettings from "@/pages/settings/ApiKeysSettings";
import AdminDashboard from "@/pages/admin/AdminDashboard";

function Topbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#050505] px-4 md:px-8 text-[#F5F5F5]">
      <div className="flex items-center gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-white/60">
              <Menu size={20} strokeWidth={3} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r-white/10 bg-[#050505] w-72">
            <Sidebar onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        
        <div className="relative w-40 md:w-96 hidden sm:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input 
            className="bg-white/5 border-white/10 pl-12 text-[10px] font-bold uppercase tracking-widest placeholder:text-white/20 focus-visible:ring-[#F27D26] h-10 rounded-none" 
            placeholder="Search Nexus Command..." 
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-transparent">
          <Bell size={18} strokeWidth={3} />
        </Button>
        <div className="h-4 w-[1px] bg-white/10" />
        <div className="flex items-baseline gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#F27D26] hidden lg:block">Active Environment</span>
          <span className="text-xs font-mono tabular-nums opacity-60">09:55.05</span>
        </div>
      </div>
    </header>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#050505] font-sans">
      <div className="hidden border-r border-white/10 md:block md:w-64">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-12 text-[#F5F5F5] selection:bg-[#F27D26] selection:text-black">
          {children}
        </main>
      </div>
    </div>
  );
}

const Dashboard = () => (
  <div className="space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="relative overflow-hidden md:overflow-visible min-h-[120px] md:min-h-[160px]">
      <h1 className="text-[60px] md:text-[120px] font-black leading-[0.8] tracking-tighter uppercase text-white opacity-20 absolute -top-4 md:-top-12 -left-2 md:-left-4 select-none pointer-events-none whitespace-nowrap">
        ForgeX<br className="md:hidden" /> Studio
      </h1>
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pt-16 md:pt-0">
        <div>
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Command Center</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F27D26] mt-2">All Pipelines Operational</p>
        </div>
        <Button asChild className="bg-white text-black font-black uppercase text-[10px] tracking-tight px-6 py-6 rounded-none hover:bg-[#F27D26] hover:text-white transition-all w-fit shadow-xl">
          <Link to="/projects/new">Initialize New Pipeline</Link>
        </Button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8 pt-8 border-t border-white/10">
      {[
        { label: "Total Projects", value: "0", color: "blue" },
        { label: "Builds / Mo", value: "10 / 10", color: "green" },
        { label: "Egress Used", value: "0 MB", color: "orange" },
        { label: "Success Hub", value: "100%", color: "teal" },
      ].map((stat) => (
        <div key={stat.label} className="border border-white/10 bg-[#0A0A0A] p-4 md:p-8 group hover:border-[#F27D26]/50 transition-colors">
          <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-[#F27D26] transition-colors">{stat.label}</div>
          <div className="mt-2 md:mt-4 text-xl md:text-4xl font-mono tracking-tighter whitespace-nowrap">{stat.value}</div>
        </div>
      ))}
    </div>

    <div className="border border-white/10 bg-[#111] p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-8">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">No Active Deployments</h3>
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">Connect your source repository to begin the forge process</p>
      </div>
      <Button asChild variant="outline" className="border-white/10 bg-transparent text-white font-black uppercase text-[10px] tracking-tight px-8 md:px-12 py-6 rounded-none hover:bg-white hover:text-black transition-all">
        <Link to="/projects/new">Configure Source</Link>
      </Button>
    </div>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/projects" element={<Layout><ProjectsList /></Layout>} />
      <Route path="/projects/new" element={<Layout><NewProject /></Layout>} />
      <Route path="/projects/:id" element={<Layout><ProjectDetail /></Layout>} />
      <Route path="/projects/:id/builds/:buildId" element={<Layout><BuildDetail /></Layout>} />
      <Route path="/billing" element={<Layout><BillingPage /></Layout>} />
      <Route path="/settings" element={<Layout><div>General Settings (Profile, Notifications)</div></Layout>} />
      <Route path="/settings/github" element={<Layout><GithubSettings /></Layout>} />
      <Route path="/settings/api-keys" element={<Layout><ApiKeysSettings /></Layout>} />
      <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
