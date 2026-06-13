import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, Radio, Upload, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import AdminStreamAds from "./AdminStreamAds";

interface StreamRow {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  stream_url: string;
  stream_type: string;
  category: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_live: boolean;
  is_active: boolean;
  sort_order: number;
}

const STREAM_TYPES = [
  { value: "iframe",  label: "Iframe / Embed URL" },
  { value: "hls",     label: "HLS (.m3u8)" },
  { value: "mp4",     label: "Direct MP4 / WebM" },
  { value: "youtube", label: "YouTube / Twitch / Vimeo" },
];

const empty = {
  title: "",
  description: "",
  thumbnail_url: "",
  stream_url: "",
  stream_type: "iframe",
  category: "",
  starts_at: "",
  ends_at: "",
  is_live: true,
  is_active: true,
  sort_order: 0,
};

const AdminStreams = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState<typeof empty>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adsFor, setAdsFor] = useState<{ id: string; title: string } | null>(null);
  const { upload, uploading } = useImageUpload();

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["admin-streams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("streams").select("*").order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as StreamRow[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-streams"] });
    qc.invalidateQueries({ queryKey: ["streams"] });
  };
  const reset = () => { setForm(empty); setEditingId(null); };

  const save = async () => {
    if (!form.title.trim() || !form.stream_url.trim()) return toast.error("Title and stream URL required");
    const payload: any = {
      ...form,
      title: form.title.trim(),
      stream_url: form.stream_url.trim(),
      description: form.description || null,
      thumbnail_url: form.thumbnail_url || null,
      category: form.category || null,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    };
    const { error } = editingId
      ? await supabase.from("streams").update(payload).eq("id", editingId)
      : await supabase.from("streams").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Stream updated" : "Stream added");
    reset(); refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this stream?")) return;
    const { error } = await supabase.from("streams").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const toggle = async (row: StreamRow, field: "is_active" | "is_live") => {
    const { error } = await supabase.from("streams").update({ [field]: !row[field] }).eq("id", row.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const edit = (row: StreamRow) => {
    setEditingId(row.id);
    setForm({
      title: row.title,
      description: row.description || "",
      thumbnail_url: row.thumbnail_url || "",
      stream_url: row.stream_url,
      stream_type: row.stream_type,
      category: row.category || "",
      starts_at: row.starts_at?.slice(0, 16) || "",
      ends_at: row.ends_at?.slice(0, 16) || "",
      is_live: row.is_live,
      is_active: row.is_active,
      sort_order: row.sort_order,
    });
  };

  const onThumb = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await upload(f, "stream-thumbs");
    if (url) setForm({ ...form, thumbnail_url: url });
  };

  if (adsFor) {
    return <AdminStreamAds streamId={adsFor.id} streamTitle={adsFor.title} onBack={() => setAdsFor(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <p className="font-display text-sm tracking-widest text-primary flex items-center gap-2">
          <Radio className="w-4 h-4" />
          {editingId ? "EDIT STREAM" : "ADD LIVE STREAM"}
        </p>

        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Stream title"
          className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-sm"
        />

        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          placeholder="Description (optional)"
          className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-sm resize-none"
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            value={form.stream_type}
            onChange={(e) => setForm({ ...form, stream_type: e.target.value })}
            className="px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-sm"
          >
            {STREAM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Category (Sports, News…)"
            className="px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-sm"
          />
        </div>

        <input
          value={form.stream_url}
          onChange={(e) => setForm({ ...form, stream_url: e.target.value })}
          placeholder="Stream URL or iframe src"
          className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-sm font-mono"
        />

        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px] text-muted-foreground font-display tracking-widest">
            STARTS
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-sm"
            />
          </label>
          <label className="text-[10px] text-muted-foreground font-display tracking-widest">
            ENDS
            <input
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-sm"
            />
          </label>
        </div>

        <div className="space-y-2">
          <input
            value={form.thumbnail_url}
            onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
            placeholder="Thumbnail URL"
            className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-sm"
          />
          <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg glass-card cursor-pointer text-xs font-display tracking-widest">
            <Upload className="w-4 h-4" /> {uploading ? "UPLOADING…" : "UPLOAD THUMBNAIL"}
            <input type="file" accept="image/*" onChange={onThumb} className="hidden" />
          </label>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={form.is_live} onChange={(e) => setForm({ ...form, is_live: e.target.checked })} />
            LIVE NOW
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            ACTIVE
          </label>
          <label className="flex items-center gap-1.5">
            SORT
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-16 px-2 py-1 rounded bg-card/60 border border-glass-border" />
          </label>
        </div>

        <div className="flex gap-2">
          <button onClick={save} className="btn-glow px-4 py-2 rounded-full font-display text-xs tracking-widest flex items-center gap-1.5">
            <Save className="w-4 h-4" /> {editingId ? "UPDATE" : "ADD STREAM"}
          </button>
          {editingId && (
            <button onClick={reset} className="px-4 py-2 rounded-full glass-card font-display text-xs tracking-widest flex items-center gap-1.5">
              <X className="w-4 h-4" /> CANCEL
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : streams.map((row) => (
          <div key={row.id} className="glass-card p-3 rounded-xl flex items-center gap-3">
            {row.thumbnail_url ? (
              <img src={row.thumbnail_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-muted grid place-items-center shrink-0">
                <Radio className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display text-sm text-foreground truncate">{row.title}</p>
                {row.is_live && <span className="chip bg-destructive/20 text-destructive text-[9px]">LIVE</span>}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{row.category || row.stream_type}</p>
            </div>
            <button onClick={() => toggle(row, "is_active")} className="p-2 rounded-lg hover:bg-muted">
              {row.is_active ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button onClick={() => edit(row)} className="p-2 rounded-lg hover:bg-muted">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => remove(row.id)} className="p-2 rounded-lg hover:bg-muted">
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
        ))}
        {!isLoading && !streams.length && (
          <p className="text-sm text-muted-foreground text-center py-6">No streams yet. Add one above.</p>
        )}
      </div>
    </div>
  );
};

export default AdminStreams;
