import { useState, useEffect } from "react";
import { 
  Users, 
  Box, 
  Activity, 
  CreditCard, 
  HardDrive, 
  ShieldAlert,
  Search,
  MoreVertical,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: "1,248", change: "+12%", icon: Users },
    { label: "Active Builds", value: "42", change: "Running", icon: Activity },
    { label: "Total Revenue", value: "$4,280", change: "+8%", icon: CreditCard },
    { label: "R2 Storage", value: "842 GB", change: "14% used", icon: HardDrive },
  ];

  const recentUsers = [
    { id: "1", name: "Alice Johnson", email: "alice@example.com", plan: "pro", joined: "2 hours ago" },
    { id: "2", name: "Bob Smith", email: "bob@example.com", plan: "free", joined: "5 hours ago" },
    { id: "3", name: "Charlie Davis", email: "char@example.com", plan: "team", joined: "1 day ago" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between border-b border-white/10 pb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Strategic Deck</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F27D26] mt-2">Level 4 Clearance Required</p>
        </div>
        <div className="bg-[#F27D26] text-black px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest w-fit">
          <ShieldAlert size={14} strokeWidth={3} /> Terminal Locked
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-white/10 bg-[#0A0A0A] text-[#F5F5F5] rounded-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-[#F27D26]" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-mono tracking-tighter tabular-nums">{stat.value}</div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                <span className="text-[#00FF41] mr-1">{stat.change}</span> Drift
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <Card className="col-span-1 border-white/10 bg-[#0A0A0A] text-[#F5F5F5] lg:col-span-2 rounded-none">
          <CardHeader className="flex flex-row items-baseline justify-between border-b border-white/5 pb-6">
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tighter">Database Records</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-2">Entities currently registered on-chain</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
              <Input 
                className="bg-white/5 border-white/10 pl-12 h-10 text-[10px] font-bold uppercase tracking-widest placeholder:text-white/20 rounded-none focus-visible:ring-[#F27D26]" 
                placeholder="Search index..." 
              />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader className="border-white/10">
                <TableRow className="hover:bg-transparent border-white/10">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/20">Ident</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/20">Vector</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/20">Timestamp</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-white/20">Cmd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id} className="border-white/10 hover:bg-white/2">
                    <TableCell>
                      <div className="font-black text-sm uppercase tracking-tight">{user.name}</div>
                      <div className="text-[10px] font-mono opacity-30 uppercase">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-none uppercase text-[8px] font-black tracking-widest px-2 py-0.5 border-none",
                        user.plan === 'pro' ? "bg-blue-500 text-white" :
                        user.plan === 'team' ? "bg-purple-500 text-white" :
                        "bg-white/10 text-white/50"
                      )}>
                        {user.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] font-mono opacity-50 uppercase">{user.joined}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-white hover:bg-transparent">
                            <MoreVertical size={16} strokeWidth={3} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-white/10 text-white rounded-none">
                          <DropdownMenuItem className="cursor-pointer text-[10px] font-bold uppercase tracking-widest hover:bg-white/5">View Node</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-[10px] font-bold uppercase tracking-widest hover:bg-white/5">Override Vector</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 text-red-500">Purge Key</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0A0A0A] text-[#F5F5F5] rounded-none">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Nexus Pulse</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-2">Realtime system telemetry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-10 pt-8">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>Signal Loss (API)</span>
                <span className="text-[#00FF41]">0.02%</span>
              </div>
              <div className="w-full bg-white/5 h-1">
                <div className="bg-[#00FF41] h-full w-[2%]"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>Pipeline Latency</span>
                <span className="text-[#00FF41]">840ms</span>
              </div>
              <div className="w-full bg-white/5 h-1">
                <div className="bg-[#00FF41] h-full w-[10%]"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>Nexus Bandwidth</span>
                <span className="text-[#F27D26]">48 MB/s</span>
              </div>
              <div className="w-full bg-white/5 h-1">
                <div className="bg-[#F27D26] h-full w-[65%]"></div>
              </div>
            </div>
            
            <div className="pt-8 mt-8 border-t border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-6">External Gateways</h4>
              <div className="grid grid-cols-1 gap-4">
                <Button variant="ghost" className="h-10 px-4 justify-between text-[10px] font-bold uppercase tracking-widest border border-white/5 rounded-none hover:bg-white hover:text-black" asChild>
                  <a href="#">Supabase <ExternalLink size={12} strokeWidth={3} /></a>
                </Button>
                <Button variant="ghost" className="h-10 px-4 justify-between text-[10px] font-bold uppercase tracking-widest border border-white/5 rounded-none hover:bg-white hover:text-black" asChild>
                  <a href="#">GitHub Actions <ExternalLink size={12} strokeWidth={3} /></a>
                </Button>
                <Button variant="ghost" className="h-10 px-4 justify-between text-[10px] font-bold uppercase tracking-widest border border-white/5 rounded-none hover:bg-white hover:text-black" asChild>
                  <a href="#">Cloudflare R2 <ExternalLink size={12} strokeWidth={3} /></a>
                </Button>
                <div className="pt-4">
                  <Button 
                    className="w-full bg-[#F27D26] text-black font-black uppercase text-[10px] tracking-widest h-12 rounded-none hover:bg-white transition-all"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/admin/test-email', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ to: 'admin@forgex.studio' })
                        });
                        if (res.ok) alert('SYSTEM_COMMUNICATION_BROADCAST_SUCCESS');
                        else alert('SYSTEM_COMMUNICATION_FAULT');
                      } catch (err) {
                        alert('CRITICAL_SYSTEM_FAULT');
                      }
                    }}
                  >
                    Test Strategic Comms
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
