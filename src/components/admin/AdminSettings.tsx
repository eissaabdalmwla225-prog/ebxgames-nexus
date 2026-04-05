import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      const map: Record<string, string> = {};
      data.forEach((row: any) => { map[row.key] = typeof row.value === "string" ? JSON.parse(row.value) : row.value; });
      return map;
    },
  });

  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (Object.keys(settings).length > 0) setForm(settings);
  }, [settings]);

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

  const fields = [
    { key: "site_name", label: "Site Name" },
    { key: "primary_color", label: "Primary Color" },
    { key: "accent_color", label: "Accent Color" },
    { key: "currency_symbol", label: "Currency Symbol" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold text-foreground">Site Settings</h3>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
            <div className="flex gap-2 items-center">
              <input
                value={form[f.key] || ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="flex-1 px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {f.key.includes("color") && (
                <input type="color" value={form[f.key] || "#6366f1"} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-glass-border cursor-pointer" />
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSave} className="w-full py-3 rounded-xl btn-glow font-display text-sm font-bold text-primary-foreground flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Settings
      </button>
    </div>
  );
};

export default AdminSettings;
