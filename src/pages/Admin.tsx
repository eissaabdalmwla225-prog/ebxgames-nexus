import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gamepad2, Settings, Users, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useAllGames, type Game } from "@/hooks/useGames";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import AdminGameEditor from "@/components/admin/AdminGameEditor";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminAdmins from "@/components/admin/AdminAdmins";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [tab, setTab] = useState<"games" | "settings" | "admins">("games");
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [creatingGame, setCreatingGame] = useState(false);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground text-center">You don't have admin privileges.</p>
        <button onClick={() => navigate("/")} className="btn-glow px-6 py-2 rounded-xl font-display text-sm font-bold text-primary-foreground">
          Go Home
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "games" as const, label: "Games", icon: Gamepad2 },
    { id: "settings" as const, label: "Settings", icon: Settings },
    { id: "admins" as const, label: "Admins", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 glass-card backdrop-blur-2xl border-b border-glass-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="font-display text-sm font-bold text-foreground">Admin Dashboard</h2>
      </div>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id ? "btn-glow text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8">
        {tab === "games" && (
          <AdminGameEditor
            editingGame={editingGame}
            setEditingGame={setEditingGame}
            creatingGame={creatingGame}
            setCreatingGame={setCreatingGame}
          />
        )}
        {tab === "settings" && <AdminSettings />}
        {tab === "admins" && <AdminAdmins />}
      </div>
    </div>
  );
};

export default Admin;
