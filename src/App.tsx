import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Bell, Search, Menu, LayoutDashboard, Database, CreditCard, Settings as SettingsIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { AuthProvider, useAuth } from "@/lib/auth";
import ProjectsList from "@/pages/projects/ProjectsList";
import NewProject from "@/pages/projects/NewProject";
import ProjectDetail from "@/pages/projects/ProjectDetail";
import BuildDetail from "@/pages/projects/BuildDetail";
import BillingPage from "@/pages/billing/BillingPage";
import GithubSettings from "@/pages/settings/GithubSettings";
import ApiKeysSettings from "@/pages/settings/ApiKeysSettings";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#050505]">
      <div className="h-8 w-8 animate-spin rounded-none border-2 border-[#F27D26] border-t-transparent" />
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

function FloatingNavbar() {
  const location = useLocation();
  const navItems = [
    { icon: LayoutDashboard, href: "/dashboard", label: "Home" },
    { icon: Database, href: "/projects", label: "Nodes" },
    { icon: CreditCard, href: "/billing", label: "Nexus" },
    { icon: SettingsIcon, href: "/settings", label: "Core" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] max-w-[400px]">
      <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 p-2 flex items-center justify-around shadow-2xl shadow-[#F27D26]/10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-all min-w-[64px]",
                isActive ? "text-[#F27D26]" : "text-white/40"
              )}
            >
              <item.icon size={18} strokeWidth={3} />
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-[#F27D26]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

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
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-12 text-[#F5F5F5] selection:bg-[#F27D26] selection:text-black pb-32 md:pb-12">
          {children}
        </main>
        <FloatingNavbar />
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
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Layout><ProjectsList /></Layout></ProtectedRoute>} />
        <Route path="/projects/new" element={<ProtectedRoute><Layout><NewProject /></Layout></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><Layout><ProjectDetail /></Layout></ProtectedRoute>} />
        <Route path="/projects/:id/builds/:buildId" element={<ProtectedRoute><Layout><BuildDetail /></Layout></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Layout><BillingPage /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><div>General Settings (Profile, Notifications)</div></Layout></ProtectedRoute>} />
        <Route path="/settings/github" element={<ProtectedRoute><Layout><GithubSettings /></Layout></ProtectedRoute>} />
        <Route path="/settings/api-keys" element={<ProtectedRoute><Layout><ApiKeysSettings /></Layout></ProtectedRoute>} />
        
        {/* Admin route check is also handled inside AdminDashboard for extra safety, but protected globally here */}
        <Route path="/admin" element={<ProtectedRoute><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
