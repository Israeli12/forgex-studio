import { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, Download, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { BuildLog } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LogsViewerProps {
  buildId: string;
  isCompleted: boolean;
}

export function LogsViewer({ buildId, isCompleted }: LogsViewerProps) {
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Initial fetch of logs
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("build_logs")
        .select("*")
        .eq("build_id", buildId)
        .order("timestamp", { ascending: true });

      if (data) setLogs(data);
    };

    fetchLogs();

    // Subscribe to new logs if not completed
    if (!isCompleted) {
      const channel = supabase
        .channel(`build_logs_${buildId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "build_logs",
            filter: `build_id=eq.${buildId}`,
          },
          (payload) => {
            setLogs((prev) => [...prev, payload.new as BuildLog]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [buildId, isCompleted]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const downloadLogs = () => {
    const text = logs.map(l => `[${format(new Date(l.timestamp), 'HH:mm:ss')}] ${l.log_line}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-${buildId}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[700px] border border-white/10 bg-[#050505] overflow-hidden relative group">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/2 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F27D26]">
            <TerminalIcon size={14} strokeWidth={3} />
            <span>ForgeX_Pulse_Shell_v1.0.4</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn("h-8 px-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-none", autoScroll ? "bg-[#F27D26] text-black" : "text-white/40 hover:text-white")}
          >
            Auto_Sync::{autoScroll ? "ON" : "OFF"}
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadLogs} className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white border border-white/5 rounded-none">
            Export_Archive
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-8 py-6 relative" ref={scrollRef}>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(242,125,38,0.03)_0%,transparent_100%)]" />
        <div className="space-y-1.5 font-mono text-[11px] relative">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-6 group/line hover:bg-white/2 -mx-4 px-4 py-0.5">
              <span className="text-white/20 shrink-0 select-none font-bold">
                {format(new Date(log.timestamp), 'HH:mm:ss:SSS')}
              </span>
              <span className={cn(
                "break-all flex-1",
                log.level === 'error' ? "text-[#FF0000] font-black" :
                log.level === 'success' ? "text-[#00FF41]" :
                log.level === 'warning' ? "text-[#F27D26]" :
                "text-white/70"
              )}>
                <span className="opacity-30 mr-2">❯</span>
                {log.log_line}
              </span>
            </div>
          ))}
          {!isCompleted && (
            <div className="flex gap-6 items-center py-4 text-[#F27D26]">
              <span className="text-white/20 shrink-0 font-bold">--:--:--:---</span>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-none bg-[#F27D26] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Pulse Streaming...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t border-white/10 bg-white/2 px-6 py-2 flex justify-between items-center">
        <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.4em]">Integrated Pipeline Environment // (C) 2026 FORGEX</div>
        <div className="text-[8px] font-mono text-[#F27D26] uppercase tracking-widest font-black">Connection::Secured</div>
      </div>
    </div>
  );
}
