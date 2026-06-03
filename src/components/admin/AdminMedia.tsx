import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Save, X, Upload, Film, Tv, ListVideo, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAllMedia, useEpisodes, type Media, type Episode } from "@/hooks/useMedia";
import { useImageUpload } from "@/hooks/useImageUpload";
// useVideoUpload is consumed by VideoUploadField internally
import VideoUploadField from "@/components/VideoUploadField";
import AdminMediaAds from "@/components/admin/AdminMediaAds";


const emptyForm = {
  type: "movie" as "movie" | "series",
  title: "",
  description: "",
  poster_url: "",
  backdrop_url: "",
  category: "Other",
  year: new Date().getFullYear(),
  video_url: "",
  price: 0,
  is_free: true,
  sort_order: 0,
};

const AdminMedia = () => {
  const queryClient = useQueryClient();
  const { upload, uploading } = useImageUpload();
  const { data: media = [], isLoading } = useAllMedia();
  const [editing, setEditing] = useState<Media | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [episodesFor, setEpisodesFor] = useState<Media | null>(null);
  const [adsFor, setAdsFor] = useState<Media | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["media"] });
    queryClient.invalidateQueries({ queryKey: ["media-all"] });
  };


  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setEpisodesFor(null);
    setForm({ ...emptyForm, sort_order: media.length });
  };

  const startEdit = async (m: Media) => {
    setEditing(m);
    setCreating(false);
    setEpisodesFor(null);
    let vurl = "";
    const { data } = await supabase.rpc("get_video_url", { _media_id: m.id } as any);
    if (typeof data === "string") vurl = data;
    setForm({
      type: m.type,
      title: m.title,
      description: m.description || "",
      poster_url: m.poster_url || "",
      backdrop_url: m.backdrop_url || "",
      category: m.category,
      year: m.year || new Date().getFullYear(),
      video_url: vurl,
      price: Number(m.price),
      is_free: m.is_free,
      sort_order: m.sort_order,
    });
  };

  const cancel = () => { setCreating(false); setEditing(null); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "poster_url" | "backdrop_url") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file, "media");
    if (url) setForm({ ...form, [field]: url });
  };

  // (Single-file video upload is now handled by <VideoUploadField/> via useVideoUpload)


  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    const payload = {
      ...form,
      price: form.is_free ? 0 : Number(form.price),
      year: form.year || null,
      description: form.description || null,
      poster_url: form.poster_url || null,
      backdrop_url: form.backdrop_url || null,
      video_url: form.video_url || null,
    };
    try {
      if (creating) {
        const { error } = await supabase.from("media").insert(payload);
        if (error) throw error;
        toast.success("Created");
      } else if (editing) {
        const { error } = await supabase.from("media").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Updated");
      }
      invalidate();
      cancel();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleActive = async (m: Media) => {
    const { error } = await supabase.from("media").update({ is_active: !m.is_active }).eq("id", m.id);
    if (error) { toast.error(error.message); return; }
    invalidate();
  };

  const remove = async (m: Media) => {
    if (!confirm(`Delete "${m.title}"?`)) return;
    const { error } = await supabase.from("media").delete().eq("id", m.id);
    if (error) { toast.error(error.message); return; }
    invalidate();
    toast.success("Deleted");
  };

  if (episodesFor) {
    return <AdminEpisodes media={episodesFor} onBack={() => setEpisodesFor(null)} />;
  }

  if (adsFor) {
    return <AdsForMedia media={adsFor} onBack={() => setAdsFor(null)} />;
  }



  if (editing || creating) {
    return (
      <div className="space-y-4 pb-24">
        <div className="flex items-center justify-between sticky top-[100px] z-20 -mx-4 px-4 py-2 bg-background/80 backdrop-blur-xl border-b border-glass-border">
          <h3 className="font-display text-lg text-foreground tracking-wider truncate">
            {creating ? "NEW TITLE" : `EDIT · ${editing?.title}`}
          </h3>
          <button onClick={cancel} className="p-2 rounded-xl hover:bg-muted/60 active:bg-muted">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setForm({ ...form, type: "movie" })}
            className={`p-4 rounded-2xl border flex items-center justify-center gap-2 text-sm font-display tracking-widest transition ${form.type === "movie" ? "btn-glow border-transparent" : "glass-card text-muted-foreground border-glass-border"}`}>
            <Film className="w-4 h-4" /> MOVIE
          </button>
          <button onClick={() => setForm({ ...form, type: "series" })}
            className={`p-4 rounded-2xl border flex items-center justify-center gap-2 text-sm font-display tracking-widest transition ${form.type === "series" ? "btn-glow border-transparent" : "glass-card text-muted-foreground border-glass-border"}`}>
            <Tv className="w-4 h-4" /> SERIES
          </button>
        </div>

        <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />

        <div className="grid grid-cols-2 gap-2">
          <Input label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <Input label="Year" type="number" value={String(form.year)} onChange={(v) => setForm({ ...form, year: Number(v) })} />
        </div>

        <ImageField label="Poster" value={form.poster_url} onChange={(v) => setForm({ ...form, poster_url: v })}
          onUpload={(e) => handleImageUpload(e, "poster_url")} uploading={uploading} />
        <ImageField label="Backdrop (optional)" value={form.backdrop_url} onChange={(v) => setForm({ ...form, backdrop_url: v })}
          onUpload={(e) => handleImageUpload(e, "backdrop_url")} uploading={uploading} />

        {form.type === "movie" && (
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-display tracking-widest uppercase">
              Video source · paste or upload
            </label>
            <VideoUploadField
              value={form.video_url}
              onChange={(v) => setForm({ ...form, video_url: v })}
              folder="videos"
            />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Direct URLs use the native player. Iframe snippets are embedded as-is. Uploads stream straight to storage with a live progress bar.
            </p>
          </div>
        )}


        <div className="flex items-center gap-3 p-4 rounded-2xl glass-card">
          <input type="checkbox" checked={form.is_free} onChange={(e) => setForm({ ...form, is_free: e.target.checked })} className="w-5 h-5 accent-primary" id="free" />
          <label htmlFor="free" className="text-sm font-medium text-foreground flex-1">Free to watch</label>
          {!form.is_free && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">$</span>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-24 px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-foreground text-sm text-right" />
            </div>
          )}
        </div>

        <Input label="Sort order" type="number" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: Number(v) })} />

        {/* Sticky mobile save bar */}
        <div className="fixed bottom-16 inset-x-0 z-30 px-4 pb-3 pt-3 bg-background/90 backdrop-blur-xl border-t border-glass-border safe-bottom">
          <div className="max-w-4xl mx-auto flex gap-2">
            <button onClick={cancel} className="flex-1 py-3 rounded-full glass-card font-display tracking-widest text-sm text-muted-foreground">
              CANCEL
            </button>
            <button onClick={handleSave} className="flex-[2] py-3 rounded-full btn-glow font-display tracking-widest text-sm flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> SAVE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl text-foreground tracking-wider">LIBRARY</h3>
          <p className="text-[10px] text-muted-foreground font-display tracking-widest">{media.length} TITLES</p>
        </div>
        <button onClick={startCreate} className="flex items-center gap-2 px-5 py-3 rounded-full btn-glow font-display tracking-widest text-sm">
          <Plus className="w-4 h-4" /> ADD
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-8 font-display tracking-widest">LOADING…</div>
      ) : media.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 glass-card rounded-2xl">
          No movies or series yet. Tap <span className="text-primary font-display tracking-widest">ADD</span> to create one.
        </div>
      ) : (
        <div className="space-y-2">
          {media.map((m) => (
            <div key={m.id} className={`glass-card p-3 flex items-center gap-3 rounded-2xl ${!m.is_active ? "opacity-50" : ""}`}>
              {m.poster_url ? (
                <img src={m.poster_url} alt="" className="w-14 h-20 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-14 h-20 rounded-lg bg-muted grid place-items-center shrink-0">
                  {m.type === "movie" ? <Film className="w-5 h-5 text-muted-foreground" /> : <Tv className="w-5 h-5 text-muted-foreground" />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display text-base text-foreground truncate tracking-wide">{m.title}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="chip glass-card text-foreground text-[9px]">{m.type === "movie" ? "FILM" : "SERIES"}</span>
                  {m.is_free
                    ? <span className="chip bg-primary text-primary-foreground text-[9px]">FREE</span>
                    : <span className="chip bg-foreground/90 text-background text-[9px]">${Number(m.price).toFixed(0)}</span>}
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{m.category}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center">
                  {m.type === "series" && (
                    <button onClick={() => setEpisodesFor(m)} className="p-2 rounded-lg hover:bg-muted" title="Episodes">
                      <ListVideo className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  <button onClick={() => setAdsFor(m)} className="p-2 rounded-lg hover:bg-muted" title="In-stream ads">
                    <Megaphone className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => toggleActive(m)} className="p-2 rounded-lg hover:bg-muted" title={m.is_active ? "Hide" : "Show"}>
                    {m.is_active ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>

                <div className="flex items-center">
                  <button onClick={() => startEdit(m)} className="p-2 rounded-lg hover:bg-muted" title="Edit">
                    <Pencil className="w-4 h-4 text-primary" />
                  </button>
                  <button onClick={() => remove(m)} className="p-2 rounded-lg hover:bg-destructive/10" title="Delete">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
  </div>
);

const Textarea = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
      className="w-full px-3 py-2.5 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
  </div>
);

const ImageField = ({ label, value, onChange, onUpload, uploading }: {
  label: string; value: string; onChange: (v: string) => void; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; uploading: boolean;
}) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    {value && (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-2 bg-muted">
        <img src={value} alt="" className="w-full h-full object-cover" />
        <button onClick={() => onChange("")} className="absolute top-2 right-2 p-1 rounded-full bg-background/80"><X className="w-4 h-4" /></button>
      </div>
    )}
    <div className="flex gap-2">
      <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl glass-card cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
        <Upload className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{uploading ? "Uploading…" : "Upload"}</span>
        <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
      </label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="or paste URL"
        className="flex-1 px-3 py-2.5 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm" />
    </div>
  </div>
);

// Episodes sub-editor — single + bulk add
const AdminEpisodes = ({ media, onBack }: { media: Media; onBack: () => void }) => {
  const queryClient = useQueryClient();
  const { data: eps = [], isLoading } = useEpisodes(media.id);
  const [mode, setMode] = useState<"list" | "single" | "bulk">("list");
  const nextEp = (eps[eps.length - 1]?.episode_number ?? 0) + 1;
  const lastSeason = eps[eps.length - 1]?.season ?? 1;
  const [form, setForm] = useState({ season: lastSeason, episode_number: nextEp, title: "", video_url: "", description: "" });
  const [bulkRows, setBulkRows] = useState<{ id: string; title: string; video_url: string; status?: "idle" | "uploading" | "done" | "error"; progress?: number }[]>([]);
  const [bulkSeason, setBulkSeason] = useState(lastSeason);
  const [bulkSaving, setBulkSaving] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["episodes", media.id] });

  const save = async () => {
    if (!form.title || !form.video_url) { toast.error("Title and video URL required"); return; }
    const { error } = await supabase.from("episodes").insert({ media_id: media.id, ...form });
    if (error) { toast.error(error.message); return; }
    invalidate();
    setMode("list");
    setForm({ season: form.season, episode_number: form.episode_number + 1, title: "", video_url: "", description: "" });
    toast.success("Episode added");
  };

  const remove = async (ep: Episode) => {
    if (!confirm(`Delete "${ep.title}"?`)) return;
    const { error } = await supabase.from("episodes").delete().eq("id", ep.id);
    if (error) { toast.error(error.message); return; }
    invalidate();
  };

  // Bulk: pick multiple video files, upload in parallel, auto-create episodes
  const handleBulkFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const rows = files.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      title: f.name.replace(/\.[^.]+$/, ""),
      video_url: "",
      status: "idle" as const,
      _file: f,
    } as any));
    setBulkRows((prev) => [...prev, ...rows]);
  };

  const removeBulkRow = (id: string) => setBulkRows((prev) => prev.filter((r) => r.id !== id));

  const addBulkUrlRow = () => {
    setBulkRows((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, title: "", video_url: "" }]);
  };

  const runBulk = async () => {
    if (bulkRows.length === 0) { toast.error("Add files or URL rows first"); return; }
    setBulkSaving(true);
    try {
      // Upload any files first (parallel)
      const uploads = bulkRows.map(async (row: any, idx) => {
        if (row.video_url || !row._file) return row;
        const file: File = row._file;
        const ext = file.name.split(".").pop() || "mp4";
        const path = `episodes/${media.id}/${Date.now()}-${idx}.${ext}`;
        const { data: signed, error: sErr } = await supabase.storage.from("media-videos").createSignedUploadUrl(path);
        if (sErr || !signed) throw sErr;
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signed.signedUrl, true);
          xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
          xhr.setRequestHeader("x-upsert", "true");
          xhr.upload.onprogress = (ev) => {
            if (!ev.lengthComputable) return;
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setBulkRows((prev) => prev.map((r) => r.id === row.id ? { ...r, status: "uploading", progress: pct } : r));
          };
          xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error(`Upload ${xhr.status}`));
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(file);
        });
        const { data: pl } = await supabase.storage.from("media-videos").createSignedUrl(path, 60 * 60 * 24 * 365);
        const url = pl?.signedUrl || "";
        setBulkRows((prev) => prev.map((r) => r.id === row.id ? { ...r, video_url: url, status: "done", progress: 100 } : r));
        return { ...row, video_url: url };
      });
      const ready = await Promise.all(uploads);

      // Insert all episodes in one call
      const startNum = nextEp;
      const payload = ready
        .filter((r: any) => r.title && r.video_url)
        .map((r: any, i: number) => ({
          media_id: media.id,
          season: bulkSeason,
          episode_number: startNum + i,
          title: r.title,
          video_url: r.video_url,
        }));
      if (payload.length === 0) { toast.error("Nothing to insert"); setBulkSaving(false); return; }
      const { error } = await supabase.from("episodes").insert(payload);
      if (error) throw error;
      invalidate();
      toast.success(`${payload.length} episodes added`);
      setBulkRows([]);
      setMode("list");
    } catch (e: any) {
      toast.error(e.message || "Bulk add failed");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
      </div>
      <h3 className="font-display text-lg font-bold text-foreground tracking-wider">{media.title.toUpperCase()} · EPISODES</h3>

      {isLoading ? <div className="text-center text-muted-foreground py-4">Loading…</div> : (
        <div className="space-y-2">
          {eps.map((ep) => (
            <div key={ep.id} className="glass-card p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">S{ep.season}E{ep.episode_number}</p>
                <p className="font-display text-sm font-bold text-foreground truncate">{ep.title}</p>
              </div>
              <button onClick={() => remove(ep)} className="p-2 rounded-lg hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      {mode === "list" && (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setMode("single")} className="py-3 rounded-xl glass-card border border-dashed border-glass-border text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add one
          </button>
          <button onClick={() => setMode("bulk")} className="py-3 rounded-xl btn-glow text-sm font-display tracking-widest flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" /> BULK ADD
          </button>
        </div>
      )}

      {mode === "single" && (
        <div className="space-y-3 glass-card p-3 rounded-xl">
          <div className="grid grid-cols-2 gap-2">
            <Input label="Season" type="number" value={String(form.season)} onChange={(v) => setForm({ ...form, season: Number(v) })} />
            <Input label="Episode #" type="number" value={String(form.episode_number)} onChange={(v) => setForm({ ...form, episode_number: Number(v) })} />
          </div>
          <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Video source — paste or upload</label>
            <VideoUploadField
              value={form.video_url}
              onChange={(v) => setForm({ ...form, video_url: v })}
              folder={`episodes/${media.id}`}
              placeholder="https://…/episode.mp4  ·  YouTube link  ·  or <iframe …></iframe>"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMode("list")} className="flex-1 py-2.5 rounded-xl glass-card text-sm">Cancel</button>
            <button onClick={save} className="flex-1 py-2.5 rounded-xl btn-glow text-primary-foreground text-sm font-bold">Save</button>
          </div>
        </div>
      )}

      {mode === "bulk" && (
        <div className="space-y-3 glass-card p-3 rounded-xl border border-glass-border">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm tracking-widest text-foreground">BULK ADD</p>
            <button onClick={() => { setMode("list"); setBulkRows([]); }} className="p-1 rounded hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Season" type="number" value={String(bulkSeason)} onChange={(v) => setBulkSeason(Number(v))} />
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Episodes start at</label>
              <div className="px-3 py-2.5 rounded-xl glass-card text-foreground text-sm font-mono">#{nextEp}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl glass-card cursor-pointer text-xs font-display tracking-widest">
              <Upload className="w-3.5 h-3.5" /> PICK VIDEOS
              <input type="file" accept="video/*" multiple onChange={handleBulkFiles} className="hidden" />
            </label>
            <button onClick={addBulkUrlRow} className="px-3 py-2.5 rounded-xl glass-card text-xs font-display tracking-widest flex items-center justify-center gap-2">
              <Plus className="w-3.5 h-3.5" /> ADD URL ROW
            </button>
          </div>

          {bulkRows.length > 0 && (
            <div className="space-y-2">
              {bulkRows.map((row, i) => (
                <div key={row.id} className="space-y-1.5 rounded-xl bg-background/40 border border-glass-border p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">#{nextEp + i}</span>
                    <input
                      value={row.title}
                      onChange={(e) => setBulkRows((prev) => prev.map((r) => r.id === row.id ? { ...r, title: e.target.value } : r))}
                      placeholder="Episode title"
                      className="flex-1 px-2 py-1.5 rounded-lg bg-card/60 border border-glass-border text-foreground text-xs"
                    />
                    <button onClick={() => removeBulkRow(row.id)} className="p-1.5 rounded hover:bg-destructive/10">
                      <X className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                  {!(row as any)._file && (
                    <input
                      value={row.video_url}
                      onChange={(e) => setBulkRows((prev) => prev.map((r) => r.id === row.id ? { ...r, video_url: e.target.value } : r))}
                      placeholder="Video URL"
                      className="w-full px-2 py-1.5 rounded-lg bg-card/60 border border-glass-border text-foreground text-xs font-mono"
                    />
                  )}
                  {row.status === "uploading" && (
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${row.progress ?? 0}%` }} />
                    </div>
                  )}
                  {row.status === "done" && <p className="text-[10px] text-primary font-display tracking-widest">UPLOADED</p>}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={runBulk}
            disabled={bulkSaving || bulkRows.length === 0}
            className="w-full py-3 rounded-xl btn-glow text-sm font-display tracking-widest disabled:opacity-50"
          >
            {bulkSaving ? "WORKING…" : `CREATE ${bulkRows.length} EPISODES`}
          </button>
        </div>
      )}
    </div>
  );
};

// Wrapper to feed episodes into the in-stream ads editor
const AdsForMedia = ({ media, onBack }: { media: Media; onBack: () => void }) => {
  const { data: episodes = [] } = useEpisodes(media.type === "series" ? media.id : undefined);
  return <AdminMediaAds media={media} episodes={episodes} onBack={onBack} />;
};

export default AdminMedia;

