import { useState } from "react";
import { RefreshCw, Radio, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useMatches, type Match } from "@/hooks/useMatches";

const AdminMatches = () => {
  const queryClient = useQueryClient();
  const { data: matches = [], isLoading } = useMatches();
  const [syncing, setSyncing] = useState(false);
  const [editing, setEditing] = useState<Record<number, string>>({});

  const sync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-fixtures", { body: {} });
      if (error) throw error;
      toast.success(`Synced ${data?.upserted || 0} fixtures`);
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    } catch (e: any) {
      toast.error(e.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const saveStream = async (m: Match) => {
    const url = editing[m.id] ?? m.stream_url ?? "";
    const { error } = await supabase.from("matches").update({ stream_url: url || null }).eq("id", m.id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["matches"] });
    toast.success("Stream URL saved");
  };

  const toggleLive = async (m: Match) => {
    const { error } = await supabase.from("matches").update({ is_live: !m.is_live }).eq("id", m.id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["matches"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">Live Matches ({matches.length})</h3>
        <button onClick={sync} disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg btn-glow text-primary-foreground text-sm font-medium disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Refresh"}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">Loading…</div>
      ) : matches.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 glass-card rounded-xl">
          No fixtures yet. Hit "Refresh" to pull from API-Football.
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((m) => {
            const kickoff = new Date(m.kickoff_at);
            return (
              <div key={m.id} className="glass-card p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{m.league_name} · {kickoff.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                  <button onClick={() => toggleLive(m)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${m.is_live ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"}`}>
                    <Radio className="w-3 h-3" /> {m.is_live ? "LIVE" : "OFF"}
                  </button>
                </div>
                <p className="font-display text-sm font-bold text-foreground">{m.home_team} vs {m.away_team}</p>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-display tracking-widest uppercase">
                    Stream source
                  </label>
                  <textarea
                    placeholder={"Direct URL (m3u8 / mp4 / YouTube) — or paste full <iframe …></iframe> embed"}
                    defaultValue={m.stream_url || ""}
                    onChange={(e) => setEditing({ ...editing, [m.id]: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-foreground text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <div className="flex justify-end">
                    <button onClick={() => saveStream(m)} className="px-3 py-2 rounded-lg btn-glow text-primary-foreground text-xs font-bold flex items-center gap-1">
                      <Save className="w-3.5 h-3.5" /> Save stream
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminMatches;
