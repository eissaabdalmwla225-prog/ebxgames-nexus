import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: string;
}

interface AdBannerProps {
  placement: string;
}

const AdBanner = ({ placement }: AdBannerProps) => {
  const { data: ads = [] } = useQuery({
    queryKey: ["active-ads", placement],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("ads")
        .select("id, title, description, image_url, link_url, placement")
        .eq("placement", placement)
        .eq("is_active", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("sort_order");
      if (error) throw error;
      return data as Ad[];
    },
    staleTime: 60000,
  });

  if (ads.length === 0) return null;

  return (
    <div className="space-y-3">
      {ads.map((ad, i) => (
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {ad.link_url ? (
            <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block">
              <AdCard ad={ad} />
            </a>
          ) : (
            <AdCard ad={ad} />
          )}
        </motion.div>
      ))}
    </div>
  );
};

const AdCard = ({ ad }: { ad: Ad }) => (
  <div className="glass-card overflow-hidden group cursor-pointer hover:border-primary/30 transition-all relative">
    {ad.image_url ? (
      <div className="relative">
        <img src={ad.image_url} alt={ad.title} className="w-full aspect-[3/1] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-display text-sm font-bold text-foreground">{ad.title}</p>
          {ad.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ad.description}</p>}
        </div>
        {ad.link_url && (
          <div className="absolute top-2 right-2 p-1.5 rounded-full bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-3 h-3 text-primary" />
          </div>
        )}
      </div>
    ) : (
      <div className="p-4 flex items-center gap-3">
        <div className="flex-1">
          <p className="font-display text-sm font-bold text-foreground">{ad.title}</p>
          {ad.description && <p className="text-xs text-muted-foreground mt-0.5">{ad.description}</p>}
        </div>
        {ad.link_url && <ExternalLink className="w-4 h-4 text-primary" />}
      </div>
    )}
    <div className="absolute top-2 left-2">
      <span className="text-[8px] uppercase tracking-widest text-muted-foreground/50 font-medium px-1.5 py-0.5 rounded bg-background/40 backdrop-blur-sm">Ad</span>
    </div>
  </div>
);

export default AdBanner;
