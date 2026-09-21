import * as Icons from "lucide-react";
import { Home, User, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavItems } from "@/hooks/useNavItems";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { data: navItems = [] } = useNavItems();

  const dynamicTabs = navItems.map((n) => {
    const Icon = (Icons as any)[n.icon] || Home;
    return { id: n.id, label: n.label, icon: Icon, path: n.path };
  });

  const tabs = [
    ...dynamicTabs,
    ...(isAdmin ? [{ id: "admin", label: "Admin", icon: Shield, path: "/admin" }] : []),
    { id: "me", label: "Me", icon: User, path: user ? "/profile" : "/auth" },
  ];

  const active = (() => {
    const path = location.pathname;
    const found = tabs.find((t) => t.path !== "/" && path.startsWith(t.path));
    if (found) return found.id;
    const home = tabs.find((t) => t.path === "/");
    return home?.id || tabs[0]?.id;
  })();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-glass-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around h-16 max-w-2xl mx-auto px-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon, path }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[60px]"
              aria-label={label}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-px left-4 right-4 h-[3px] rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] font-display tracking-[0.15em] transition truncate max-w-full ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
