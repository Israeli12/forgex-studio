import React from 'react';
import { 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Database, 
  Github, 
  CreditCard,
  Smartphone,
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HowItWorks() {
  const sections = [
    {
      title: "The Forge Process",
      icon: Cpu,
      content: "ForgeX Studio is a high-performance mobile build infrastructure. We transform your source code (ZIP or GitHub) into production-ready Android (APK) and iOS binaries through isolated cloud pipelines.",
      points: ["Automated Build Queues", "Framework Auto-detection", "Secure Artifact Storage"]
    },
    {
      title: "Developer Workflow",
      icon: Database,
      content: "Initialize a 'Pipeline' by connecting your GitHub repository or uploading a source ZIP. Our system handles environment provisioning, dependency installation, and compilation.",
      points: ["Real-time Build Logs", "Version Control Integration", "Downloadable Assets"]
    },
    {
      title: "Nexus & Scaling",
      icon: CreditCard,
      content: "Different 'Nodes' (subscription tiers) provide varying resource allocations. Higher tiers offer faster build priority, increased storage for artifacts, and advanced enterprise features.",
      points: ["Quota Monitoring", "Stripe-backed Billing", "Tier Migration"]
    },
    {
      title: "Admin Oversight",
      icon: ShieldCheck,
      content: "System administrators with Level 4 clearance have access to the 'Strategic Deck', allowing them to monitor global health, manage user permissions, and oversee system communication.",
      points: ["Global Analytics", "SMTP Communication Tests", "Protocol Management"]
    }
  ];

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="relative overflow-hidden min-h-[160px]">
        <h1 className="text-[60px] md:text-[120px] font-black leading-[0.8] tracking-tighter uppercase text-white opacity-20 absolute -top-4 md:-top-12 -left-2 md:-left-4 select-none pointer-events-none whitespace-nowrap">
          Intelligence<br/>Briefing
        </h1>
        <div className="relative pt-16">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">System Operations Guide</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F27D26] mt-2">Operational Protocol v1.0.0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <Card key={idx} className="bg-[#0A0A0A] border-white/10 rounded-none group hover:border-[#F27D26]/40 transition-all duration-500">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 bg-white/5 text-[#F27D26] group-hover:bg-[#F27D26] group-hover:text-black transition-colors">
                <section.icon size={24} strokeWidth={2.5} />
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-tighter">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider leading-relaxed text-white/50">
                {section.content}
              </p>
              <div className="space-y-2">
                {section.points.map((point, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-[#F27D26]/70">
                    <ChevronRight size={12} strokeWidth={4} />
                    {point}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border border-white/10 bg-[#050505] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#F27D26]" />
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-1 space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-tighter">User Archetypes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[#F27D26] text-[10px] font-black uppercase tracking-widest border-b border-[#F27D26]/20 pb-2">The Operative (User)</h4>
                <ul className="text-[10px] font-bold uppercase tracking-widest leading-loose text-white/40 space-y-1">
                  <li>• Create & Manage Pipelines</li>
                  <li>• Trigger Strategic Builds</li>
                  <li>• Monitor Personal Quotas</li>
                  <li>• Access Individual Artifacts</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[#F27D26] text-[10px] font-black uppercase tracking-widest border-b border-[#F27D26]/20 pb-2">The Architect (Admin)</h4>
                <ul className="text-[10px] font-bold uppercase tracking-widest leading-loose text-white/40 space-y-1">
                  <li>• Global System Monitoring</li>
                  <li>• User Database Oversight</li>
                  <li>• Strategic Communication Control</li>
                  <li>• Level 4 Security Clearance</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="w-full md:w-64 space-y-4">
            <div className="bg-white/5 border border-white/10 p-6 space-y-4">
              <Smartphone size={32} className="text-[#F27D26]" strokeWidth={1.5} />
              <h4 className="text-[10px] font-black uppercase tracking-tighter">Cross-Platform Ready</h4>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 leading-relaxed">
                ForgeX Studio is optimized for Android, iOS, and Desktop environments with a specialized floating command interface.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center text-center">
        <div className="space-y-2 opacity-30 group cursor-crosshair">
          <p className="text-[9px] font-mono uppercase tracking-[0.5em]">ForgeX Studio // Strategic Mobile Infrastructure</p>
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <p className="text-[8px] font-mono uppercase tracking-[0.3em]">End of Briefing</p>
        </div>
      </div>
    </div>
  );
}
