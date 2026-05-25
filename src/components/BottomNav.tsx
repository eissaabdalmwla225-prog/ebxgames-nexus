import { Home, Film, Tv, Radio, User, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const tabs = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "movies", label: "Movies", icon: Film, path: "/movies" },
    { id: "series", label: "Series", icon: Tv, path: "/series" },
    { id: "live", label: "Live", icon: Radio, path: "/live" },
    ...(isAdmin ? [{ id: "admin", label: "Admin", icon: Shield, path: "/admin" }] : []),
    { id: "profile", label: "Profile", icon: User, path: user ? "/profile" : "/auth" },
  ];

  const active = (() => {
    const path = location.pathname;
    if (path === "/") return "home";
    const found = tabs.find((t) => t.path !== "/" && path.startsWith(t.path));
    return found?.id || "home";
  })();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card backdrop-blur-2xl border-t border-glass-border px-1 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-xl mx-auto">
        {tabs.map(({ id, label, icon: Icon, path }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-px left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-neon-purple to-neon-blue"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
