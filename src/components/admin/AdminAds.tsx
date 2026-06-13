import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Save, X, Upload, Megaphone, Image as ImageIcon, Film, Code2, FileCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useImageUpload } from "@/hooks/useImageUpload";
import VideoUploadField from "@/components/VideoUploadField";

type AdType = "image" | "video" | "embed" | "html";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: string;
  is_active: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  ad_type: AdType | null;
  embed_code: string | null;
  video_url: string | null;
  html_content: string | null;
}

const PLACEMENTS = [
  { value: "banner",            label: "Home · Top Banner" },
  { value: "hero",              label: "Home · Hero Overlay" },
  { value: "between-rows",      label: "Home · Between Rows" },
  { value: "footer",            label: "Home · Footer" },
  { value: "library-top",       label: "Library · Top" },
  { value: "library-footer",    label: "Library · Footer" },
  { value: "watch-top",         label: "Watch · Above Player" },
  { value: "watch-below",       label: "Watch · Below Player" },
  { value: "watch-footer",      label: "Watch · Bottom" },
  { value: "live-top",          label: "Live List · Top" },
  { value: "live-footer",       label: "Live List · Footer" },
  { value: "live-watch-top",    label: "Live Watch · Above Player" },
  { value: "live-watch-below",  label: "Live Watch · Below Player" },
  { value: "live-watch-footer", label: "Live Watch · Bottom" },
  { value: "auth-top",          label: "Sign-in · Top" },
  { value: "profile-top",       label: "Profile · Top" },
  { value: "floating",          label: "Floating · Bottom Sticky" },
];

const AD_TYPES: { value: AdType; label: string; Icon: any }[] = [
  { value: "image", label: "IMAGE / LINK", Icon: ImageIcon },
  { value: "video", label: "VIDEO",        Icon: Film },
  { value: "embed", label: "EMBED CODE",   Icon: Code2 },
  { value: "html",  label: "RAW HTML",     Icon: FileCode },
];

const emptyForm = {
  title: "",
  description: "",
  image_url: "",
  link_url: "",
  placement: "banner",
  sort_order: 0,
  starts_at: "",
  ends_at: "",
  ad_type: "image" as AdType,
  embed_code: "",
  video_url: "",
  html_content: "",
};

const AdminAds = () => {
  const queryClient = useQueryClient();
  const { upload, uploading } = useImageUpload();
  const [editing, setEditing] = useState<Ad | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ads").select("*").order("sort_order");
      if (error) throw error;
      return data as Ad[];
    },
  });

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ ...emptyForm, sort_order: ads.length });
  };

  const startEdit = (ad: Ad) => {
    setEditing(ad);
    setCreating(false);
    setForm({
      title: ad.title,
      description: ad.description || "",
      image_url: ad.image_url || "",
      link_url: ad.link_url || "",
      placement: ad.placement,
      sort_order: ad.sort_order,
      starts_at: ad.starts_at ? ad.starts_at.slice(0, 16) : "",
      ends_at: ad.ends_at ? ad.ends_at.slice(0, 16) : "",
      ad_type: (ad.ad_type || "image") as AdType,
      embed_code: ad.embed_code || "",
      video_url: ad.video_url || "",
      html_content: ad.html_content || "",
    });
  };

  const cancel = () => { setEditing(null); setCreating(false); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file, "ads");
    if (url) setForm({ ...form, image_url: url });
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const payload = {
      title: form.title,
      description: form.description || null,
      image_url: form.image_url || null,
      link_url: form.link_url || null,
      placement: form.placement,
      sort_order: form.sort_order,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      ad_type: form.ad_type,
      embed_code: form.embed_code || null,
      video_url: form.video_url || null,
      html_content: form.html_content || null,
    };
    try {
      if (creating) {
        const { error } = await supabase.from("ads").insert(payload);
        if (error) throw error;
      } else if (editing) {
        const { error } = await supabase.from("ads").update(payload).eq("id", editing.id);
        if (error) throw error;
      }
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      queryClient.invalidateQueries({ queryKey: ["active-ads"] });
      toast.success(creating ? "Ad created!" : "Ad updated!");
      cancel();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  const toggleActive = async (ad: Ad) => {
    const { error } = await supabase.from("ads").update({ is_active: !ad.is_active }).eq("id", ad.id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    queryClient.invalidateQueries({ queryKey: ["active-ads"] });
  };

  const deleteAd = async (ad: Ad) => {
    if (!confirm(`Delete ad "${ad.title}"?`)) return;
    const { error } = await supabase.from("ads").delete().eq("id", ad.id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    queryClient.invalidateQueries({ queryKey: ["active-ads"] });
    toast.success("Ad deleted");
  };

  if (editing || creating) {
    return (
      <div className="space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            {creating ? "New Ad" : `Edit: ${editing?.title}`}
          </h3>
          <button onClick={cancel} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ad title"
              className="w-full px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional caption" rows={2}
              className="w-full px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>

          {/* Ad type picker */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Ad Format</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AD_TYPES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setForm({ ...form, ad_type: value })}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-display tracking-widest transition ${
                    form.ad_type === value ? "btn-glow text-primary-foreground" : "glass-card text-muted-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Per-type fields */}
          {form.ad_type === "image" && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Banner Image (or link to image)</label>
              {form.image_url && (
                <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden mb-2">
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                  <button onClick={() => setForm({ ...form, image_url: "" })}
                    className="absolute top-2 right-2 p-1 rounded-full bg-background/80"><X className="w-4 h-4 text-foreground" /></button>
                </div>
              )}
              <div className="flex gap-2">
                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass-card cursor-pointer hover:border-primary/30 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Upload"}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Or paste URL"
                  className="flex-1 px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
          )}

          {form.ad_type === "video" && (
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Video (upload or paste URL)</label>
              <VideoUploadField
                value={form.video_url}
                onChange={(v) => setForm({ ...form, video_url: v })}
                folder="ads"
                rows={2}
                placeholder="https://…/promo.mp4"
              />
            </div>
          )}

          {form.ad_type === "embed" && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Embed code (iframe / script tag from ad network)</label>
              <textarea value={form.embed_code} onChange={(e) => setForm({ ...form, embed_code: e.target.value })}
                rows={5} placeholder='<iframe src="https://…"></iframe>'
                className="w-full px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            </div>
          )}

          {form.ad_type === "html" && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Raw HTML snippet</label>
              <textarea value={form.html_content} onChange={(e) => setForm({ ...form, html_content: e.target.value })}
                rows={6} placeholder='<div style="...">Custom ad markup</div>'
                className="w-full px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Click-through URL (optional)</label>
            <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Placement</label>
            <div className="flex gap-2 flex-wrap">
              {PLACEMENTS.map((p) => (
                <button key={p.value} onClick={() => setForm({ ...form, placement: p.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.placement === p.value ? "btn-glow text-primary-foreground" : "glass-card text-muted-foreground"}`}>
                  {p.label}
                </button>
              ))}
            </div>
            <input
              value={form.placement}
              onChange={(e) => setForm({ ...form, placement: e.target.value })}
              placeholder="…or type a custom placement key (e.g. my-page-top)"
              className="mt-2 w-full px-3 py-2 rounded-xl bg-card/60 border border-glass-border text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Use any custom key here, then drop <code>&lt;AdBanner placement="your-key" /&gt;</code> wherever you want it to appear.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
              <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-card/60 border border-glass-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
              <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-card/60 border border-glass-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>

        <button onClick={handleSave} className="w-full py-3 rounded-xl btn-glow font-display text-sm font-bold text-primary-foreground flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Save Ad
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Megaphone className="w-5 h-5" /> Ads ({ads.length})
        </h3>
        <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg btn-glow text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Ad
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : ads.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No ads yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ads.map((ad) => {
            const TypeIcon = AD_TYPES.find((t) => t.value === (ad.ad_type || "image"))?.Icon || ImageIcon;
            return (
              <div key={ad.id} className={`glass-card p-4 flex items-center gap-3 ${!ad.is_active ? "opacity-50" : ""}`}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                  <TypeIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-bold text-foreground truncate">{ad.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {(ad.ad_type || "image").toUpperCase()} · {PLACEMENTS.find((p) => p.value === ad.placement)?.label || ad.placement}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(ad)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                    {ad.is_active ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => startEdit(ad)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteAd(ad)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminAds;
