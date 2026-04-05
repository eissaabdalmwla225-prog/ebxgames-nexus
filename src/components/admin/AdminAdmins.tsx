import { useState } from "react";
import { Plus, Trash2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AdminAdmins = () => {
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState("");

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admin-emails"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_emails").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const addAdmin = async () => {
    if (!newEmail.trim() || !newEmail.includes("@")) { toast.error("Enter a valid email"); return; }
    const { error } = await supabase.from("admin_emails").insert({ email: newEmail.trim().toLowerCase() });
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["admin-emails"] });
    setNewEmail("");
    toast.success("Admin added!");
  };

  const removeAdmin = async (id: string, email: string) => {
    if (!confirm(`Remove admin: ${email}?`)) return;
    const { error } = await supabase.from("admin_emails").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["admin-emails"] });
    queryClient.invalidateQueries({ queryKey: ["admin-check"] });
    toast.success("Admin removed");
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
        <Shield className="w-5 h-5" /> Admin Users
      </h3>

      <div className="flex gap-2">
        <input
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="admin@email.com"
          onKeyDown={(e) => e.key === "Enter" && addAdmin()}
          className="flex-1 px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button onClick={addAdmin} className="px-4 py-3 rounded-xl btn-glow text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-4">Loading...</div>
      ) : admins.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No admins configured yet. Add your email above.</p>
      ) : (
        <div className="space-y-2">
          {admins.map((admin: any) => (
            <div key={admin.id} className="glass-card p-3 flex items-center justify-between">
              <span className="text-sm text-foreground">{admin.email}</span>
              <button onClick={() => removeAdmin(admin.id, admin.email)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAdmins;
