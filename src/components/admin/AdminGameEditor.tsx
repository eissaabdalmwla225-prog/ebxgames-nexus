import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Save, X, Package, Upload, Image } from "lucide-react";
import { useAllGames, type Game, type GamePackage } from "@/hooks/useGames";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useImageUpload } from "@/hooks/useImageUpload";

interface Props {
  editingGame: Game | null;
  setEditingGame: (g: Game | null) => void;
  creatingGame: boolean;
  setCreatingGame: (v: boolean) => void;
}

const AdminGameEditor = ({ editingGame, setEditingGame, creatingGame, setCreatingGame }: Props) => {
  const { data: games = [], isLoading } = useAllGames();
  const queryClient = useQueryClient();
  const { upload, uploading } = useImageUpload();
  const [form, setForm] = useState({ name: "", category: "Other", image_url: "", sort_order: 0 });
  const [packages, setPackages] = useState<{ amount: string; currency: string; price: string }[]>([]);

  const startEdit = (game: Game) => {
    setEditingGame(game);
    setCreatingGame(false);
    setForm({ name: game.name, category: game.category, image_url: game.image_url || "", sort_order: game.sort_order });
    setPackages(game.game_packages.map((p) => ({ amount: String(p.amount), currency: p.currency, price: String(p.price) })));
  };

  const startCreate = () => {
    setCreatingGame(true);
    setEditingGame(null);
    setForm({ name: "", category: "Other", image_url: "", sort_order: games.length });
    setPackages([{ amount: "", currency: "Coins", price: "" }]);
  };

  const cancel = () => { setEditingGame(null); setCreatingGame(false); };
  const addPackage = () => setPackages([...packages, { amount: "", currency: "Coins", price: "" }]);
  const removePackage = (i: number) => setPackages(packages.filter((_, idx) => idx !== i));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file, "games");
    if (url) setForm({ ...form, image_url: url });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Game name is required"); return; }
    try {
      let gameId: string;
      if (creatingGame) {
        const { data, error } = await supabase.from("games").insert({
          name: form.name, category: form.category, image_url: form.image_url || null, sort_order: form.sort_order,
        }).select("id").single();
        if (error) throw error;
        gameId = data.id;
      } else if (editingGame) {
        const { error } = await supabase.from("games").update({
          name: form.name, category: form.category, image_url: form.image_url || null, sort_order: form.sort_order,
        }).eq("id", editingGame.id);
        if (error) throw error;
        gameId = editingGame.id;
        await supabase.from("game_packages").delete().eq("game_id", gameId);
      } else return;

      const pkgs = packages.filter((p) => p.amount && p.price).map((p, i) => ({
        game_id: gameId, amount: Number(p.amount), currency: p.currency, price: Number(p.price), sort_order: i,
      }));
      if (pkgs.length > 0) {
        const { error } = await supabase.from("game_packages").insert(pkgs);
        if (error) throw error;
      }

      toast.success(creatingGame ? "Game created!" : "Game updated!");
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["games-all"] });
      cancel();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  const toggleActive = async (game: Game) => {
    const { error } = await supabase.from("games").update({ is_active: !game.is_active }).eq("id", game.id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["games"] });
    queryClient.invalidateQueries({ queryKey: ["games-all"] });
    toast.success(game.is_active ? "Game hidden" : "Game visible");
  };

  const deleteGame = async (game: Game) => {
    if (!confirm(`Delete "${game.name}"?`)) return;
    const { error } = await supabase.from("games").delete().eq("id", game.id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["games"] });
    queryClient.invalidateQueries({ queryKey: ["games-all"] });
    toast.success("Game deleted");
  };

  if (editingGame || creatingGame) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            {creatingGame ? "New Game" : `Edit: ${editingGame?.name}`}
          </h3>
          <button onClick={cancel} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Game name"
            className="w-full px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category"
            className="w-full px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />

          {/* Image upload */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Game Image</label>
            {form.image_url && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-2">
                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                <button onClick={() => setForm({ ...form, image_url: "" })}
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background transition-colors">
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass-card cursor-pointer hover:border-primary/30 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Upload Image"}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Or paste URL"
                className="flex-1 px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} placeholder="Sort order"
            className="w-full px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4" /> Packages
            </h4>
            <button onClick={addPackage} className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          {packages.map((pkg, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={pkg.amount} onChange={(e) => { const p = [...packages]; p[i].amount = e.target.value; setPackages(p); }}
                placeholder="Amount" type="number"
                className="flex-1 px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <input value={pkg.currency} onChange={(e) => { const p = [...packages]; p[i].currency = e.target.value; setPackages(p); }}
                placeholder="Currency"
                className="w-24 px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <input value={pkg.price} onChange={(e) => { const p = [...packages]; p[i].price = e.target.value; setPackages(p); }}
                placeholder="Price (E£)" type="number"
                className="w-28 px-3 py-2 rounded-lg bg-card/60 border border-glass-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <button onClick={() => removePackage(i)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="w-full py-3 rounded-xl btn-glow font-display text-sm font-bold text-primary-foreground flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Save Game
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">Games ({games.length})</h3>
        <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg btn-glow text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Game
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : (
        <div className="space-y-2">
          {games.map((game) => (
            <div key={game.id} className={`glass-card p-4 flex items-center gap-3 ${!game.is_active ? "opacity-50" : ""}`}>
              {game.image_url ? (
                <img src={game.image_url} alt={game.name} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <Image className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-bold text-foreground truncate">{game.name}</p>
                <p className="text-xs text-muted-foreground">{game.category} · {game.game_packages.length} packages</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(game)} className="p-2 rounded-lg hover:bg-muted transition-colors" title={game.is_active ? "Hide" : "Show"}>
                  {game.is_active ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </button>
                <button onClick={() => startEdit(game)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => deleteGame(game)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGameEditor;
