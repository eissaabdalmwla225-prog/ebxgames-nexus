import { useState, useEffect } from "react";
import { Package, ChevronDown, ChevronUp, Save, Image as ImageIcon, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Order {
  id: string;
  sale_id: string;
  game_name: string;
  package_amount: number;
  package_currency: string;
  original_price: number;
  final_price: number;
  player_id: string;
  promo_code: string | null;
  status: string;
  admin_note: string | null;
  screenshot_url: string | null;
  created_at: string;
  user_id: string;
}

const STATUS_OPTIONS = ["pending", "confirmed", "delivered", "cancelled"];
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("all");
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const getSignedUrl = async (path: string): Promise<string> => {
    if (signedUrls[path]) return signedUrls[path];
    if (path.startsWith("http")) return path; // legacy public URL
    const { data } = await supabase.storage.from("order-screenshots").createSignedUrl(path, 3600);
    const url = data?.signedUrl || path;
    setSignedUrls((prev) => ({ ...prev, [path]: url }));
    return url;
  };

  const handleViewScreenshot = async (screenshotPath: string | null) => {
    if (!screenshotPath) return;
    const url = await getSignedUrl(screenshotPath);
    setViewingScreenshot(url);
  };

  const handleUpdateOrder = async (order: Order) => {
    const newStatus = editingStatus[order.id] ?? order.status;
    const newNote = editingNote[order.id] ?? order.admin_note ?? "";

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, admin_note: newNote || null })
      .eq("id", order.id);

    if (error) { toast.error(error.message); return; }

    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    toast.success(`Order ${order.sale_id} updated`);
    setExpandedId(null);
  };

  if (isLoading) return <div className="text-center text-muted-foreground py-8">Loading orders...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">Orders ({orders.length})</h3>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === s ? "btn-glow text-primary-foreground" : "glass-card text-muted-foreground"}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && ` (${orders.filter((o) => o.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No orders found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="glass-card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-sm font-bold text-foreground truncate">{order.game_name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                        {order.status}
                      </span>
                      {order.screenshot_url && <ImageIcon className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{order.sale_id}</span>
                      <span>{order.final_price.toLocaleString()} E£</span>
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-glass-border pt-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Player ID:</span> <span className="text-foreground font-mono">{order.player_id}</span></div>
                      <div><span className="text-muted-foreground">Package:</span> <span className="text-foreground">{order.package_amount.toLocaleString()} {order.package_currency}</span></div>
                      <div><span className="text-muted-foreground">Original:</span> <span className="text-foreground">{order.original_price.toLocaleString()} E£</span></div>
                      <div><span className="text-muted-foreground">Final:</span> <span className="text-primary font-bold">{order.final_price.toLocaleString()} E£</span></div>
                      {order.promo_code && <div><span className="text-muted-foreground">Promo:</span> <span className="text-green-400">{order.promo_code}</span></div>}
                    </div>

                    {order.screenshot_url && (
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Payment Screenshot</label>
                        <ScreenshotPreview path={order.screenshot_url} onView={handleViewScreenshot} />
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_OPTIONS.map((s) => (
                          <button key={s}
                            onClick={() => setEditingStatus({ ...editingStatus, [order.id]: s })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${(editingStatus[order.id] ?? order.status) === s ? "btn-glow text-primary-foreground" : "glass-card text-muted-foreground"}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Admin Note</label>
                      <textarea
                        value={editingNote[order.id] ?? order.admin_note ?? ""}
                        onChange={(e) => setEditingNote({ ...editingNote, [order.id]: e.target.value })}
                        rows={2}
                        placeholder="Add a note..."
                        className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                    </div>

                    <button
                      onClick={() => handleUpdateOrder(order)}
                      className="w-full py-2 rounded-xl btn-glow font-display text-xs font-bold text-primary-foreground flex items-center justify-center gap-2"
                    >
                      <Save className="w-3 h-3" /> Update Order
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Screenshot fullscreen viewer */}
      {viewingScreenshot && (
        <div
          className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setViewingScreenshot(null)}
        >
          <img src={viewingScreenshot} alt="Screenshot" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
};

const ScreenshotPreview = ({ path, onView }: { path: string; onView: (p: string) => void }) => {
  const [url, setUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (path.startsWith("http")) { setUrl(path); return; }
    supabase.storage.from("order-screenshots").createSignedUrl(path, 3600)
      .then(({ data }) => { if (data?.signedUrl) setUrl(data.signedUrl); });
  }, [path]);

  if (!url) return <div className="w-full h-20 rounded-xl bg-card animate-pulse" />;

  return (
    <button onClick={() => onView(path)} className="w-full rounded-xl overflow-hidden border border-glass-border hover:border-primary/50 transition-colors relative group">
      <img src={url} alt="Payment proof" className="w-full max-h-40 object-contain bg-card" />
      <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <ExternalLink className="w-5 h-5 text-primary" />
      </div>
    </button>
  );
};

export default AdminOrders;
