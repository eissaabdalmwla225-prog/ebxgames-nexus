import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Film, Settings, Users, Megaphone, Shield, LogOut, Radio, LayoutGrid } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import AdminMedia from "@/components/admin/AdminMedia";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminAdmins from "@/components/admin/AdminAdmins";
import AdminAds from "@/components/admin/AdminAds";
import AdminStreams from "@/components/admin/AdminStreams";
import AdminNav from "@/components/admin/AdminNav";

type TabId = "library" | "streams" | "ads" | "nav" | "settings" | "admins";

const tabs: { id: TabId; label: string; icon: any; hint: string }[] = [
  { id: "library",  label: "Library",  icon: Film,       hint: "Movies & series" },
  { id: "streams",  label: "Streams",  icon: Radio,      hint: "Live streams" },
  { id: "ads",      label: "Ads",      icon: Megaphone,  hint: "Promotions" },
  { id: "nav",      label: "Nav",      icon: LayoutGrid, hint: "Bottom bar" },
  { id: "settings", label: "Settings", icon: Settings,   hint: "Site config" },
  { id: "admins",   label: "Admins",   icon: Users,      hint: "Access list" },
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [tab, setTab] = useState<TabId>("library");

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Shield className="w-12 h-12 text-primary" />
        <h1 className="font-display text-4xl text-foreground tracking-wider">ACCESS DENIED</h1>
        <p className="text-muted-foreground">You don't have admin privileges.</p>
        <button onClick={() => navigate("/")} className="btn-glow px-6 py-3 rounded-full font-display text-sm tracking-widest">
          BACK HOME
        </button>
      </div>
    );
  }

  const ActiveIcon = tabs.find((t) => t.id === tab)!.icon;
  const activeHint = tabs.find((t) => t.id === tab)!.hint;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-glass-border safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate("/")} aria-label="Back"
            className="p-2 -ml-2 rounded-xl hover:bg-muted/60 active:bg-muted">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg btn-glow grid place-items-center shrink-0">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-base text-foreground leading-none tracking-wider">EBX LV · CONTROL</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={signOut} aria-label="Sign out"
            className="p-2 rounded-xl hover:bg-muted/60 active:bg-muted">
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Section title strip */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <ActiveIcon className="w-4 h-4 text-primary" />
          <p className="font-display text-xs tracking-[0.3em] text-primary uppercase">{tab}</p>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">· {activeHint}</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pt-4 pb-32 max-w-4xl w-full mx-auto">
        {tab === "library"  && <AdminMedia />}
        {tab === "streams"  && <AdminStreams />}
        {tab === "ads"      && <AdminAds />}
        {tab === "nav"      && <AdminNav />}
        {tab === "settings" && <AdminSettings />}
        {tab === "admins"   && <AdminAdmins />}
      </main>

      {/* Mobile-first sticky tab bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 glass-panel border-t border-glass-border pb-[env(safe-area-inset-bottom)] overflow-x-auto">
        <div className="grid grid-cols-6 min-w-[480px] max-w-4xl mx-auto">
          {tabs.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="relative flex flex-col items-center justify-center gap-1 py-2.5 active:bg-muted/40 transition"
              >
                {isActive && (
                  <span className="absolute -top-px left-4 right-4 h-[3px] rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
                )}
                <t.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-display tracking-[0.18em] ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {t.label.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Admin;
