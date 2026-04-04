import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Tag, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Game, GamePackage } from "@/data/games";
import { toast } from "sonner";

interface GameDetailProps {
  game: Game;
  onBack: () => void;
}

const PROMO_CODE = "EBX50";
const WHATSAPP_NUMBER = "201206442534";

const GameDetail = ({ game, onBack }: GameDetailProps) => {
  const [selectedPkg, setSelectedPkg] = useState<GamePackage | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [playerIdError, setPlayerIdError] = useState(false);

  const discount = promoApplied ? 0.5 : 0;

  const finalPrice = useMemo(() => {
    if (!selectedPkg) return 0;
    return selectedPkg.price * (1 - discount);
  }, [selectedPkg, discount]);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === PROMO_CODE) {
      setPromoApplied(true);
      toast.success("Promo code applied! 50% discount.");
    } else {
      setPromoApplied(false);
      toast.error("Invalid promo code.");
    }
  };

  const generateSaleId = () => {
    const num = Math.floor(100000 + Math.random() * 900000);
    return `EBX-${num}`;
  };

  const handleBuyNow = () => {
    if (!playerId.trim()) {
      setPlayerIdError(true);
      toast.error("Please enter your Player ID.");
      return;
    }
    if (!selectedPkg) {
      toast.error("Please select a package.");
      return;
    }

    setPlayerIdError(false);
    const saleId = generateSaleId();

    toast.success(`Order created successfully! ID: ${saleId}`);

    const message = `Hello, I want to complete my order.

Game: ${game.name}
Player ID: ${playerId}
Package: ${selectedPkg.amount} ${selectedPkg.currency}
Price: $${finalPrice.toFixed(2)}

Order ID: ${saleId}

Please confirm and deliver to my account.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 glass-card backdrop-blur-2xl border-b border-glass-border px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="font-display text-sm font-bold text-foreground truncate">{game.name}</h2>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-32">
        {/* Game Banner */}
        <div className="relative rounded-2xl overflow-hidden mt-4 aspect-video">
          <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">{game.name}</h1>
          </div>
        </div>

        {/* Packages */}
        <div className="mt-8">
          <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-4">Select Package</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {game.packages.map((pkg, i) => {
              const isSelected = selectedPkg === pkg;
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`relative p-4 rounded-xl text-left transition-all duration-300 ${
                    isSelected
                      ? "neon-glow border-2 border-primary bg-primary/10"
                      : "glass-card hover:border-primary/30"
                  }`}
                >
                  <div className="font-display text-lg font-bold text-foreground">
                    {pkg.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">{pkg.currency}</div>
                  <div className="mt-2 font-bold text-primary">
                    ${(pkg.price * (1 - discount)).toFixed(2)}
                    {discount > 0 && (
                      <span className="ml-1.5 text-xs text-muted-foreground line-through">
                        ${pkg.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <motion.div
                      layoutId="pkg-check"
                      className="absolute top-2 right-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Player ID */}
        <div className="mt-8">
          <label className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-2 block">
            Player ID
          </label>
          <input
            type="text"
            placeholder="Enter Your Player ID"
            value={playerId}
            onChange={(e) => {
              setPlayerId(e.target.value);
              setPlayerIdError(false);
            }}
            className={`w-full px-4 py-3 rounded-xl bg-card/60 backdrop-blur-xl border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
              playerIdError ? "border-destructive" : "border-glass-border"
            }`}
          />
          {playerIdError && (
            <p className="flex items-center gap-1 mt-2 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" /> Player ID is required
            </p>
          )}
        </div>

        {/* Promo Code */}
        <div className="mt-6">
          <label className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-2 block">
            Promo Code
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter Promo Code"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  if (promoApplied) setPromoApplied(false);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card/60 backdrop-blur-xl border border-glass-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <button
              onClick={handleApplyPromo}
              className="px-4 py-3 rounded-xl btn-glow text-sm font-semibold text-primary-foreground"
            >
              Apply
            </button>
          </div>
          {promoApplied && (
            <p className="flex items-center gap-1 mt-2 text-xs text-green-400">
              <CheckCircle2 className="w-3 h-3" /> 50% discount applied!
            </p>
          )}
        </div>
      </div>

      {/* Floating Buy Button */}
      {selectedPkg && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 glass-card backdrop-blur-2xl border-t border-glass-border"
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-display text-xl font-bold text-foreground">
                ${finalPrice.toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleBuyNow}
              className="btn-glow px-8 py-3 rounded-xl font-display text-sm font-bold text-primary-foreground"
            >
              Buy Now
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GameDetail;
