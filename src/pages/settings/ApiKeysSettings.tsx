import { useState } from "react";
import { ShieldCheck, Plus, Trash2, Key, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ApiKeysSettings() {
  const [keys, setKeys] = useState([
    { id: "1", name: "Production App", prefix: "fxs_8b2...", lastUsed: "2024-05-14T10:00:00Z", created: "2024-01-10T15:30:00Z" }
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!newKeyName) return toast.error("Please enter a name for the key.");
    
    // Mock key generation
    const key = `fxs_${Math.random().toString(36).substring(2, 34)}`;
    setGeneratedKey(key);
    
    const newKey = {
      id: Math.random().toString(36).substring(7),
      name: newKeyName,
      prefix: `${key.substring(0, 8)}...`,
      lastUsed: "Never",
      created: new Date().toISOString()
    };
    
    setKeys([newKey, ...keys]);
    setNewKeyName("");
  };

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("API key copied to clipboard");
    }
  };

  const deleteKey = (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
    toast.success("API key revoked");
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F1F5F9]">API Keys</h1>
          <p className="text-[#94A3B8]">Programmatic access to the ForgeX pipeline for your own tools and CI.</p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) setGeneratedKey(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#4F8EF7] hover:bg-[#3D7AE8]">
              <Plus className="mr-2 h-4 w-4" />
              New API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#12121A] border-[#2A2A3D] text-[#F1F5F9]">
            <DialogHeader>
              <DialogTitle>{generatedKey ? "Key Generated" : "Create API Key"}</DialogTitle>
              <DialogDescription className="text-[#94A3B8]">
                {generatedKey 
                  ? "Copy this key now. For security reasons, you won't be able to see it again." 
                  : "Give your key a descriptive name to identify it later."}
              </DialogDescription>
            </DialogHeader>
            
            {!generatedKey ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g. My Custom GitHub Action"
                    className="bg-[#0A0A0F] border-[#2A2A3D]"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="relative">
                  <Input
                    readOnly
                    value={generatedKey}
                    className="bg-[#0A0A0F] border-[#2A2A3D] pr-20 font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    className="absolute right-1 top-1 h-8 bg-[#4F8EF7] hover:bg-[#3D7AE8]"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </Button>
                </div>
              </div>
            )}
            
            <DialogFooter>
              {!generatedKey ? (
                <Button onClick={handleGenerate} className="bg-[#4F8EF7] hover:bg-[#3D7AE8]">
                  Generate Key
                </Button>
              ) : (
                <Button onClick={() => setShowDialog(false)} className="bg-[#1A1A26] border-[#2A2A3D]">
                  Done
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-[#2A2A3D] bg-[#12121A] text-[#F1F5F9]">
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription className="text-[#94A3B8]">Manage existing keys and track their usage.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-[#2A2A3D]">
              <TableRow className="hover:bg-transparent border-[#2A2A3D]">
                <TableHead className="text-[#475569]">Name</TableHead>
                <TableHead className="text-[#475569]">Prefix</TableHead>
                <TableHead className="text-[#475569]">Created</TableHead>
                <TableHead className="text-[#475569]">Last Used</TableHead>
                <TableHead className="text-right text-[#475569]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id} className="border-[#2A2A3D] hover:bg-[#1A1A26]/50">
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell className="font-mono text-xs text-[#94A3B8]">{key.prefix}</TableCell>
                  <TableCell className="text-sm text-[#94A3B8]">
                    {format(new Date(key.created), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-sm text-[#94A3B8]">
                    {key.lastUsed === "Never" ? key.lastUsed : format(new Date(key.lastUsed), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => deleteKey(key.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {keys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-[#475569]">
                    No API keys generated yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-400">
        <div className="flex items-center gap-2 font-bold mb-1">
          <Key size={14} />
          API Documentation
        </div>
        <p className="opacity-80">Use your API key by passing it in the <code>Authorization</code> header:</p>
        <code className="mt-2 block rounded bg-black/40 p-2 font-mono text-xs">
          Authorization: Bearer fxs_your_key_here
        </code>
      </div>
    </div>
  );
}
