import React from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [profile, setProfile] = React.useState({
    full_name: '',
    avatar_url: '',
    subscription_tier: 'free'
  });

  React.useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || '',
          subscription_tier: data.subscription_tier || 'free'
        });
      }
    }
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          avatar_url: profile.avatar_url
        })
      });

      if (!response.ok) throw new Error('Update failed');
      
      toast.success('PROFILE_UPDATED');
    } catch (error: any) {
      toast.error('SYNC_FAULT: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between border-b border-white/10 pb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Core Profile</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F27D26] mt-2">Personal Operative Synchrony</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-white/10 bg-[#0A0A0A] text-[#F5F5F5] rounded-none">
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Identity Parameters</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/30">Modify your tactical representation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="flex items-center gap-6 pb-6 border-b border-white/5">
              <div className="h-20 w-20 bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User size={40} strokeWidth={1} />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Avatar Vector URL</Label>
                <Input 
                  value={profile.avatar_url}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  placeholder="https://images.nexus.com/user.jpg"
                  className="bg-white/5 border-white/10 h-10 rounded-none focus-visible:ring-[#F27D26] text-[10px] font-mono w-[300px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nexus Identifier (Read-Only)</Label>
                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 h-12 px-4 text-white/40 font-mono text-xs">
                  <Mail size={14} />
                  {user?.email}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Operative Callsign</Label>
                <Input 
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="e.g. DUKE_STAR"
                  className="bg-white/5 border-white/10 h-12 rounded-none focus-visible:ring-[#F27D26] font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Node Tier</Label>
              <div className="flex items-center gap-3 bg-[#F27D26]/10 border border-[#F27D26]/20 h-12 px-4 text-[#F27D26] font-black uppercase tracking-[0.2em] text-xs">
                <Shield size={14} />
                {profile.subscription_tier} STRATEGIC NODE
              </div>
            </div>
          </CardContent>
          <div className="p-8 bg-white/[0.01] border-t border-white/5 flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-white text-black font-black uppercase text-[10px] tracking-widest h-12 px-10 rounded-none hover:bg-[#F27D26] hover:text-white transition-all"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />}
              Commit Changes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
