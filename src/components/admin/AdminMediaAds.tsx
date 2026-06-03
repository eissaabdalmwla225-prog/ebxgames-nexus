import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Save, X, Clock, Link2, Code, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import VideoUploadField from "@/components/VideoUploadField";
import type { Media, Episode } from "@/hooks/useMedia";

interface VideoAd {
  id: string;
  media_id: string | null;
  episode_id: string | null;
  title: string;
  ad_type: "link" | "embed" | "video";
  image_url: string | null;
  embed_code: string | null;
  video_url: string | null;
  click_url: string | null;
  start_at_seconds: number;
  skip_after_seconds: number;
  duration_seconds: number;
  is_active: boolean;
  sort_order: number;
}

const emptyForm = {
  title: "Ad",
  ad_type: "link" as "link" | "embed" | "video",
  image_url: "",
  embed_code: "",
  video_url: "",
  click_url: "",
  start_at_seconds: 0,
  skip_after_seconds: 5,
  duration_seconds: 15,
  episode_id: "" as string,
  is_active: true,
  sort_order: 0,
};

interface Props {
  media: Media;
  episodes?: Episode[];
  onBack: () => void;
}

const AdminMediaAds = ({ media, episodes = [], onBack }: Props) => {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [adding, setAdding] = useState(false);

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["admin-video-ads", media.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_ads")
        .select("*")
        .or(`media_id.eq.${media.id}${episodes.length ? `,episode_id.in.(${episodes.map((e) => e.id).join(",")})` : ""}`)
        .order("start_at_seconds");
      if (error) throw error;
      return (data || []) as VideoAd[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-video-ads", media.id] });
    qc.invalidateQueries({ queryKey: ["video-ads"] });
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("Title required");
      return;
    }
    const payload = {
      media_id: form.episode_id ? null : media.id,
      episode_id: form.episode_id || null,
      title: form.title,
      ad_type: form.ad_type,
      image_url: form.image_url || null,
      embed_code: form.embed_code || null,
      video_url: form.video_url || null,
      click_url: form.click_url || null,
      start_at_seconds: Math.max(0, Number(form.start_at_seconds) || 0),
      skip_after_seconds: Math.max(0, Number(form.skip_after_seconds) || 0),
      duration_seconds: Math.max(1, Number(form.duration_seconds) || 15),
      is_active: form.is_active,
      sort_order: form.sort_order,
    };
    const { error } = await supabase.from("video_ads").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    invalidate();
    setAdding(false);
    setForm(emptyForm);
    toast.success("Ad scheduled");
  };

  const toggle = async (ad: VideoAd) => {
    const { error } = await supabase.from("video_ads").update({ is_active: !ad.is_active }).eq("id", ad.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    invalidate();
  };

  const remove = async (ad: VideoAd) => {
    if (!confirm(`Delete "${ad.title}"?`)) return;
    const { error } = await supabase.from("video_ads").delete().eq("id", ad.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    invalidate();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </button>
      </div>
      <div>
        <h3 className="font-display text-lg text-foreground tracking-wider">{media.title.toUpperCase()} · IN-STREAM ADS</h3>
        <p className="text-[10px] text-muted-foreground font-display tracking-widest">{ads.length} SCHEDULED</p>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-4 text-sm">Loading…</p>
      ) : ads.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 glass-card rounded-2xl text-sm">
          No timed ads yet. Schedule one below.
        </div>
      ) : (
        <div className="space-y-2">
          {ads.map((ad) => (
            <div key={ad.id} className={`glass-card p-3 rounded-xl flex items-center gap-3 ${!ad.is_active ? "opacity-50" : ""}`}>
              <div className="w-10 h-10 rounded-lg bg-primary/15 grid place-items-center shrink-0">
                {ad.ad_type === "video" ? (
                  <Film className="w-4 h-4 text-primary" />
                ) : ad.ad_type === "embed" ? (
                  <Code className="w-4 h-4 text-primary" />
                ) : (
                  <Link2 className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm text-foreground truncate">{ad.title}</p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  @ {formatTime(ad.start_at_seconds)} · {ad.duration_seconds}s · skip in {ad.skip_after_seconds}s
                  {ad.episode_id && episodes.find((e) => e.id === ad.episode_id) && (
                    <> · S{episodes.find((e) => e.id === ad.episode_id)!.season}E{episodes.find((e) => e.id === ad.episode_id)!.episode_number}</>
                  )}
                </p>
              </div>
              <button onClick={() => toggle(ad)} className="p-2 rounded-lg hover:bg-muted">
                {ad.is_active ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button onClick={() => remove(ad)} className="p-2 rounded-lg hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="space-y-3 glass-card p-4 rounded-2xl border border-glass-border">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm text-foreground tracking-widest">NEW AD</p>
            <button onClick={() => { setAdding(false); setForm(emptyForm); }} className="p-1 rounded hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm"
            />
          </div>

          {/* Type tabs */}
          <div className="grid grid-cols-3 gap-2">
            {(["link", "embed", "video"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setForm({ ...form, ad_type: t })}
                className={`py-2.5 rounded-xl text-xs font-display tracking-widest transition ${
                  form.ad_type === t ? "btn-glow" : "glass-card text-muted-foreground"
                }`}
              >
                {t === "link" ? "LINK / IMAGE" : t === "embed" ? "EMBED CODE" : "VIDEO"}
              </button>
            ))}
          </div>

          {form.ad_type === "link" && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Image URL (banner / poster)</label>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://…/banner.jpg"
                  className="w-full px-3 py-2.5 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Click-through URL</label>
                <input
                  value={form.click_url}
                  onChange={(e) => setForm({ ...form, click_url: e.target.value })}
                  placeholder="https://advertiser.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm"
                />
              </div>
            </>
          )}

          {form.ad_type === "embed" && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Embed code (iframe / script / video tag)</label>
              <textarea
                value={form.embed_code}
                onChange={(e) => setForm({ ...form, embed_code: e.target.value })}
                rows={5}
                placeholder='<iframe src="…"></iframe>'
                className="w-full px-3 py-2.5 rounded-xl bg-card/60 border border-glass-border text-foreground text-xs font-mono resize-none"
              />
            </div>
          )}

          {form.ad_type === "video" && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Ad video — paste URL or upload</label>
              <VideoUploadField
                value={form.video_url}
                onChange={(v) => setForm({ ...form, video_url: v })}
                folder="ads"
                rows={2}
                placeholder="https://…/ad.mp4 or YouTube link"
              />
            </div>
          )}

          {/* Timing */}
          <div className="grid grid-cols-3 gap-2">
            <NumField label="Start (s)" value={form.start_at_seconds} onChange={(n) => setForm({ ...form, start_at_seconds: n })} />
            <NumField label="Duration (s)" value={form.duration_seconds} onChange={(n) => setForm({ ...form, duration_seconds: n })} />
            <NumField label="Skip after (s)" value={form.skip_after_seconds} onChange={(n) => setForm({ ...form, skip_after_seconds: n })} />
          </div>

          {/* Scope */}
          {episodes.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Scope</label>
              <select
                value={form.episode_id}
                onChange={(e) => setForm({ ...form, episode_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm"
              >
                <option value="">Whole series</option>
                {episodes.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    S{ep.season}E{ep.episode_number} · {ep.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={save}
            className="w-full py-3 rounded-xl btn-glow font-display tracking-widest text-sm flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> SCHEDULE AD
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full py-3 rounded-xl glass-card border border-dashed border-glass-border text-sm text-muted-foreground flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add timed ad
        </button>
      )}

      <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 flex gap-2 text-xs text-muted-foreground">
        <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p>
          Ads trigger at the chosen second of playback. Set <strong>Start = 0</strong> for a pre-roll. In-stream ads
          only work on direct video files (mp4 / m3u8) and supported hosts — not on raw iframe embeds.
        </p>
      </div>
    </div>
  );
};

const NumField = ({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) => (
  <div className="space-y-1">
    <label className="text-[10px] text-muted-foreground font-display tracking-widest">{label}</label>
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full px-3 py-2.5 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm tabular-nums"
    />
  </div>
);

export default AdminMediaAds;
