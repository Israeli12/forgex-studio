import { useState } from "react";
import { Check, CreditCard, Zap, Shield, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { PLAN_LIMITS } from "@/lib/constants";

export default function BillingPage() {
  const [currentPlan] = useState<'free' | 'pro' | 'team'>('free');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      description: 'Ideal for small personal projects.',
      features: ['10 Builds per month', '500 MB Artifact storage', 'APK + AAB builds', 'Standard support'],
      cta: 'Current Plan',
      variant: 'secondary' as const,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$12',
      description: 'For active freelance developers.',
      features: ['100 Builds per month', '5 GB Artifact storage', 'Everything in Free', 'Priority build queue', 'Faster runners'],
      cta: 'Upgrade to Pro',
      variant: 'default' as const,
      popular: true,
    },
    {
      id: 'team',
      name: 'Team',
      price: '$39',
      description: 'For small development teams.',
      features: ['500 Builds per month', '20 GB Artifact storage', 'Team collaboration', 'Shared projects', 'Dedicated support'],
      cta: 'Upgrade to Team',
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="max-w-6xl space-y-12 md:space-y-16 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between border-b border-white/10 pb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Credits & Scaling</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F27D26] mt-2">Resource Allocation Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <Card className="col-span-1 border-white/10 bg-[#0A0A0A] text-[#F5F5F5] md:col-span-2 rounded-none">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Current Cycle Load</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/30">Reset synchronized in 12 rotation cycles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-10 pt-4">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>Build Execution</span>
                <span className="text-white/40">8 / {PLAN_LIMITS[currentPlan].builds_per_month}</span>
              </div>
              <Progress value={8} max={PLAN_LIMITS[currentPlan].builds_per_month} className="h-1 bg-white/5 rounded-none" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>Sector Storage</span>
                <span className="text-white/40">124 MB / 500 MB</span>
              </div>
              <Progress value={24} className="h-1 bg-white/5 rounded-none" />
            </div>
          </CardContent>
          <CardFooter className="border-t border-white/5 pt-6 bg-white/[0.01]">
            <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.4em]">Integrated Pipeline Environment // Quota Monitoring Active</p>
          </CardFooter>
        </Card>

        <Card className="border-white/10 bg-[#0A0A0A] text-[#F5F5F5] rounded-none">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter">Nexus Core</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-6">
            <div className="rounded-none border border-white/10 bg-white/2 p-6 text-white/20">
              <CreditCard size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">No Funding Vector Stored</p>
              <Button variant="link" className="text-[#F27D26] text-[10px] font-black uppercase tracking-widest">Initialize Stripe Gateway</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={cn(
              "relative flex flex-col border-white/10 bg-[#0A0A0A] text-[#F5F5F5] transition-all hover:bg-white/[0.02] rounded-none group",
              plan.popular && "border-[#F27D26]/50"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-6 bg-[#F27D26] px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-black">
                Strategic Priority
              </div>
            )}
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{plan.name}</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/30">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-8 pt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-mono tracking-tighter">{plan.price}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">/ cycle</span>
              </div>
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/50">
                    <Check size={12} className="text-[#F27D26]" strokeWidth={4} />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-8">
              <Button 
                className={cn(
                  "w-full h-12 rounded-none font-black uppercase text-[10px] tracking-tight transition-all",
                  plan.id === currentPlan ? "bg-white/5 text-white/20 cursor-default" : "bg-white text-black hover:bg-[#F27D26] hover:text-white"
                )}
                disabled={plan.id === currentPlan}
                onClick={() => plan.id !== currentPlan && toast.info(`Initializing ${plan.name} Protocol...`)}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="rounded-none border border-white/10 bg-[#0A0A0A] p-8 md:p-12">
        <div className="flex items-center gap-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-none bg-white/5 text-[#F27D26]">
            <HelpCircle size={24} strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Strategic FAQ</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Intelligence on resource acquisition</p>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 pt-8 border-t border-white/5">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#F27D26]">Can I cancel anytime?</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-white/40">Yes, you can terminate your vector at any time. Features remain active until cycle termination.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#F27D26]">Quota Breach Protocol?</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-white/40">Build execution is throttled upon reaching limits. Upgrade node tier to restore strategic capacity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
