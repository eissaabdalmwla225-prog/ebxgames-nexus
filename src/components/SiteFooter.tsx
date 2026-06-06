import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Instagram, Twitter, Youtube, Mail, MessageCircle, Send, Music2 } from "lucide-react";

const useSettings = () =>
  useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      const map: Record<string, any> = {};
      (data || []).forEach((row: any) => {
        try {
          map[row.key] = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
        } catch {
          map[row.key] = row.value;
        }
      });
      return map;
    },
    staleTime: 5 * 60_000,
  });

const SOCIALS: { key: string; label: string; Icon: any }[] = [
  { key: "social_facebook",  label: "Facebook",  Icon: Facebook },
  { key: "social_instagram", label: "Instagram", Icon: Instagram },
  { key: "social_twitter",   label: "Twitter / X", Icon: Twitter },
  { key: "social_youtube",   label: "YouTube",   Icon: Youtube },
  { key: "social_tiktok",    label: "TikTok",    Icon: Music2 },
  { key: "social_telegram",  label: "Telegram",  Icon: Send },
];

const SiteFooter = () => {
  const { data: s = {} } = useSettings();
  const siteName = s.site_name || "EBX LV";
  const year = new Date().getFullYear();
  const aboutText = s.about_us || "A cinematic home for every story — handpicked movies and binge-worthy series, streaming in one premium player.";
  const contactEmail = s.contact_email || "";
  const whatsapp = s.whatsapp_number || "";
  const copyright = s.footer_copyright || `© ${year} ${siteName}. All rights reserved.`;

  return (
    <footer className="mt-16 border-t border-glass-border bg-card/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-3">
        <section>
          <h3 className="font-display text-lg tracking-widest text-foreground mb-3">ABOUT US</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{aboutText}</p>
        </section>

        <section>
          <h3 className="font-display text-lg tracking-widest text-foreground mb-3">CONTACT US</h3>
          <ul className="space-y-2 text-sm">
            {contactEmail && (
              <li>
                <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition">
                  <Mail className="w-4 h-4" /> {contactEmail}
                </a>
              </li>
            )}
            {whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp: {whatsapp}
                </a>
              </li>
            )}
            {!contactEmail && !whatsapp && (
              <li className="text-muted-foreground/70 text-xs">Add a contact email or WhatsApp number in admin settings.</li>
            )}
          </ul>
        </section>

        <section>
          <h3 className="font-display text-lg tracking-widest text-foreground mb-3">FOLLOW US</h3>
          <div className="flex flex-wrap gap-2">
            {SOCIALS.map(({ key, label, Icon }) => {
              const url = s[key];
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 grid place-items-center rounded-full glass-card hover:border-primary/50 hover:text-primary text-muted-foreground transition"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
            {SOCIALS.every((soc) => !s[soc.key]) && (
              <p className="text-xs text-muted-foreground/70">Add social links in admin settings.</p>
            )}
          </div>
        </section>
      </div>

      <div className="border-t border-glass-border pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground font-display tracking-widest uppercase">{copyright}</p>
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.3em]">{siteName}</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
