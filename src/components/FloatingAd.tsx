import { useState } from "react";
import { X } from "lucide-react";
import AdBanner from "@/components/AdBanner";

/**
 * A dismissible floating banner pinned to the bottom of the screen,
 * sitting just above the BottomNav.
 */
const FloatingAd = () => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="fixed bottom-20 inset-x-0 z-30 px-4 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto relative">
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss ad"
          className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-background border border-glass-border grid place-items-center shadow-lg"
        >
          <X className="w-3 h-3 text-foreground" />
        </button>
        <AdBanner placement="floating" />
      </div>
    </div>
  );
};

export default FloatingAd;
