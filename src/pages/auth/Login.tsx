import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('ACCESS_GRANTED');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'AUTHENTICATION_FAULT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 selection:bg-[#F27D26] selection:text-black">
      <div className="w-full max-w-md space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 border border-[#F27D26]/20 bg-[#F27D26]/5 text-[#F27D26]">
              <ShieldCheck size={40} strokeWidth={1} />
            </div>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Security Terminal</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Protocol Verification Required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Nexus Identifier (Email)</Label>
            <Input 
              type="email"
              required
              className="bg-white/10 border-white/20 h-12 rounded-none focus-visible:ring-[#F27D26] font-mono text-sm text-white placeholder:text-white/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Cipher Key (Password)</Label>
            <Input 
              type="password"
              required
              className="bg-white/10 border-white/20 h-12 rounded-none focus-visible:ring-[#F27D26] font-mono text-sm text-white placeholder:text-white/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#F27D26] text-black font-black uppercase text-[10px] tracking-widest h-14 rounded-none hover:bg-white transition-all shadow-xl shadow-[#F27D26]/10"
          >
            {loading ? 'VERIFYING...' : 'INITIALIZE UPLINK'}
            <ChevronRight className="ml-2 h-4 w-4" strokeWidth={3} />
          </Button>
        </form>

        <div className="text-center pt-8 border-t border-white/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            No Active Profile?{' '}
            <Link to="/signup" className="text-[#F27D26] hover:text-white transition-colors underline decoration-2">Register Command</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
