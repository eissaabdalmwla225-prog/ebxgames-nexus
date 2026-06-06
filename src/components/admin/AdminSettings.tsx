import { useState, useEffect } from "react";
import { Save, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useImageUpload } from "@/hooks/useImageUpload";

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { upload, uploading } = useImageUpload();
  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      const map: Record<string, any> = {};
      data.forEach((row: any) => {
        try {
          map[row.key] = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
        } catch {
          map[row.key] = row.value;
        }
      });
      return map;
    },
  });

  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (Object.keys(settings).length > 0) setForm(settings as Record<string, string>);
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file, "branding");
    if (url) setForm({ ...form, site_logo: url });
  };

  const handleSave = async () => {
    try {
      for (const [key, value] of Object.entries(form)) {
        await supabase.from("site_settings").upsert({ key, value: JSON.stringify(value) });
      }
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Settings saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  if (isLoading) return <div className="text-center text-muted-foreground py-8">Loading...</div>;

  const sections: { title: string; fields: { key: string; label: string; type?: string; textarea?: boolean; placeholder?: string }[] }[] = [
    {
      title: "Brand",
      fields: [
        { key: "site_name",       label: "Platform Name", placeholder: "EBX LV" },
        { key: "hero_title",      label: "Hero Title" },
        { key: "hero_subtitle",   label: "Hero Subtitle" },
        { key: "primary_color",   label: "Primary Color",  type: "color" },
        { key: "accent_color",    label: "Accent Color",   type: "color" },
        { key: "currency_symbol", label: "Currency Symbol" },
      ],
    },
    {
      title: "About & Footer",
      fields: [
        { key: "about_us",          label: "About Us",      textarea: true, placeholder: "Short paragraph about the platform" },
        { key: "footer_copyright",  label: "Copyright Line", placeholder: "© 2026 Your Platform. All rights reserved." },
      ],
    },
    {
      title: "Contact",
      fields: [
        { key: "contact_email",     label: "Contact Email" },
        { key: "whatsapp_number",   label: "WhatsApp Number" },
      ],
    },
    {
      title: "Social Media Links",
      fields: [
        { key: "social_facebook",  label: "Facebook URL" },
        { key: "social_instagram", label: "Instagram URL" },
        { key: "social_twitter",   label: "Twitter / X URL" },
        { key: "social_youtube",   label: "YouTube URL" },
        { key: "social_tiktok",    label: "TikTok URL" },
        { key: "social_telegram",  label: "Telegram URL" },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <h3 className="font-display text-lg font-bold text-foreground">Site Settings</h3>

      {/* Logo upload */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Platform Logo</label>
        {form.site_logo && (
          <div className="relative w-24 h-24 rounded-xl overflow-hidden mb-2">
            <img src={form.site_logo} alt="Logo" className="w-full h-full object-contain bg-card/60" />
            <button
              onClick={() => setForm({ ...form, site_logo: "" })}
              className="absolute top-1 right-1 p-0.5 rounded-full bg-background/80"
            >
              <X className="w-3 h-3 text-foreground" />
            </button>
          </div>
        )}
        <label
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-card cursor-pointer hover:border-primary/30 transition-all ${
            uploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{uploading ? "Uploading..." : "Upload Logo"}</span>
          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
        </label>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="space-y-3">
          <p className="font-display text-[11px] tracking-[0.3em] text-primary uppercase">{section.title}</p>
          <div className="space-y-3">
            {section.fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                <div className="flex gap-2 items-center">
                  {f.textarea ? (
                    <textarea
                      value={form[f.key] || ""}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      rows={3}
                      placeholder={f.placeholder}
                      className="flex-1 px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  ) : (
                    <input
                      value={form[f.key] || ""}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="flex-1 px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  )}
                  {f.type === "color" && (
                    <input
                      type="color"
                      value={form[f.key] || "#6366f1"}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-glass-border cursor-pointer"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        className="w-full py-3 rounded-xl btn-glow font-display text-sm font-bold text-primary-foreground flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" /> Save Settings
      </button>
    </div>
  );
};

export default AdminSettings;
