import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface NavRow {
  id: string;
  label: string;
  path: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

const ICONS = ["Home", "Film", "Tv", "Radio", "Play", "Star", "Heart", "Trophy", "Music", "Gamepad2", "Newspaper", "Tag", "Megaphone", "Compass"];

const empty = { label: "", path: "/", icon: "Film", sort_order: 0, is_active: true };

const AdminNav = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState<typeof empty>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-nav-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("nav_items").select("*").order("sort_order");
      if (error) throw error;
      return (data || []) as NavRow[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-nav-items"] });
    qc.invalidateQueries({ queryKey: ["nav-items"] });
  };

  const reset = () => { setForm(empty); setEditingId(null); };

  const save = async () => {
    if (!form.label.trim() || !form.path.trim()) return toast.error("Label and path required");
    const payload = { ...form, label: form.label.trim(), path: form.path.trim() };
    const { error } = editingId
      ? await supabase.from("nav_items").update(payload).eq("id", editingId)
      : await supabase.from("nav_items").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Updated" : "Added");
    reset(); refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this nav item?")) return;
    const { error } = await supabase.from("nav_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const toggle = async (row: NavRow) => {
    const { error } = await supabase.from("nav_items").update({ is_active: !row.is_active }).eq("id", row.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const edit = (row: NavRow) => {
    setEditingId(row.id);
    setForm({ label: row.label, path: row.path, icon: row.icon, sort_order: row.sort_order, is_active: row.is_active });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <p className="font-display text-sm tracking-widest text-primary">
          {editingId ? "EDIT NAV ITEM" : "ADD NAV ITEM"}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Label (e.g. Movies)"
            className="px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-sm"
          />
          <input
            value={form.path}
            onChange={(e) => setForm({ ...form, path: e.target.value })}
            placeholder="Path (e.g. /movies)"
            className="px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-sm font-mono"
          />
          <select
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-sm"
          >
            {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
            placeholder="Sort order"
            className="px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="btn-glow px-4 py-2 rounded-full font-display text-xs tracking-widest flex items-center gap-1.5">
            <Save className="w-4 h-4" /> {editingId ? "UPDATE" : "ADD"}
          </button>
          {editingId && (
            <button onClick={reset} className="px-4 py-2 rounded-full glass-card font-display text-xs tracking-widest flex items-center gap-1.5">
              <X className="w-4 h-4" /> CANCEL
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : items.map((row) => (
          <div key={row.id} className="glass-card p-3 rounded-xl flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm text-foreground">{row.label}</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">{row.path} · {row.icon} · #{row.sort_order}</p>
            </div>
            <button onClick={() => toggle(row)} className="p-2 rounded-lg hover:bg-muted">
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
        {!isLoading && !items.length && <p className="text-sm text-muted-foreground text-center py-6">No nav items yet.</p>}
      </div>
    </div>
  );
};

export default AdminNav;
