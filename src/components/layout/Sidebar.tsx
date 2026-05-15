import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Box, 
  Settings, 
  CreditCard, 
  Github, 
  ShieldCheck, 
  PlusCircle, 
  Terminal,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: Box },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "GitHub PAT", href: "/settings/github", icon: Github },
  { name: "API Keys", href: "/settings/api-keys", icon: ShieldCheck },
  { name: "General Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="flex h-full w-full flex-col bg-[#050505] text-[#F5F5F5]">
      <div className="flex h-20 items-baseline gap-2 border-b border-white/10 px-8 py-6">
        <Link to="/dashboard" className="flex items-baseline gap-2 font-black tracking-tighter" onClick={onClose}>
          <span className="text-3xl uppercase">FORGEX</span>
          <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">v1.0.0</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mb-6 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          Main Menu
        </div>
        <nav className="space-y-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-4 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                location.pathname === item.name.toLowerCase() || location.pathname === item.href
                  ? "text-[#F27D26]"
                  : "text-[#F5F5F5] opacity-60 hover:opacity-100"
              )}
            >
              <item.icon size={14} strokeWidth={3} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-12 mb-6 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          Admin Control
        </div>
        <nav className="space-y-4">
          <Link
            to="/admin"
            onClick={onClose}
            className={cn(
              "flex items-center gap-4 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
              location.pathname.startsWith("/admin") ? "text-[#F27D26]" : "text-[#F5F5F5] opacity-60 hover:opacity-100"
            )}
          >
            <ShieldCheck size={14} strokeWidth={3} />
            Admin Panel
          </Link>
        </nav>
      </div>

      <div className="border-t border-white/10 p-6">
        <div className="flex items-center gap-4 px-2">
          <div className="flex-1 overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Developer</div>
            <div className="truncate text-sm font-black uppercase tracking-tight">Moses Dukestar</div>
          </div>
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-transparent">
            <LogOut size={16} strokeWidth={3} />
          </Button>
        </div>
      </div>
    </div>
  );
}
