import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Tag, AlertCircle, CheckCircle2, Upload, Image as ImageIcon } from "lucide-react";
import type { Game, GamePackage } from "@/hooks/useGames";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import OrderConfirmation from "./OrderConfirmation";

interface GameDetailProps {
  game: Game;
  onBack: () => void;
}

const PROMO_CODE = "EBX50";
const PAYMENT_NUMBER = "01206442534";

const GameDetail = ({ game, onBack }: GameDetailProps) => {
  const { user } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState<GamePackage | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [playerIdError, setPlayerIdError] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    saleId: string; gameName: string; packageAmount: number;
    packageCurrency: string; finalPrice: number; playerId: string;
  } | null>(null);

  const discount = promoApplied ? 0.5 : 0;
  const finalPrice = useMemo(() => selectedPkg ? selectedPkg.price * (1 - discount) : 0, [selectedPkg, discount]);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === PROMO_CODE) {
      setPromoApplied(true);
      toast.success("Promo code applied! 50% discount.");
    } else {
      setPromoApplied(false);
      toast.error("Invalid promo code.");
    }
  };

  const generateSaleId = () => `EBX-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleProceedToPayment = () => {
    if (!playerId.trim()) { setPlayerIdError(true); toast.error("Please enter your Player ID."); return; }
    if (!selectedPkg) { toast.error("Please select a package."); return; }
    if (!user) { toast.error("Please sign in first."); return; }
    setPlayerIdError(false);
    setShowPayment(true);
  };

  const handleScreenshotSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB."); return; }
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleSubmitOrder = async () => {
    if (!screenshotFile) { toast.error("Please attach a payment screenshot."); return; }
    if (!selectedPkg || !user) return;

    setSubmitting(true);
    const saleId = generateSaleId();

    // Upload screenshot
    const ext = screenshotFile.name.split(".").pop();
    const filePath = `${user.id}/${saleId}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("order-screenshots")
      .upload(filePath, screenshotFile, { upsert: true });

    if (uploadError) { toast.error("Failed to upload screenshot."); setSubmitting(false); return; }

    const screenshotUrl = filePath;

    const { error } = await supabase.from("orders").insert({
      user_id: user.id, sale_id: saleId, game_id: game.id,
      game_name: game.name, package_amount: selectedPkg.amount,
      package_currency: selectedPkg.currency, original_price: selectedPkg.price,
      final_price: finalPrice, player_id: playerId,
      promo_code: promoApplied ? promoCode.trim().toUpperCase() : null,
      screenshot_url: screenshotUrl,
    });

    if (error) { toast.error("Failed to submit order."); console.error(error); setSubmitting(false); return; }

    setSubmitting(false);
    setShowPayment(false);
    setConfirmation({
      saleId, gameName: game.name, packageAmount: selectedPkg.amount,
      packageCurrency: selectedPkg.currency, finalPrice, playerId,
    });
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBER);
    toast.success("Number copied!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%", borderRadius: "2rem" }}
      animate={{ opacity: 1, y: 0, borderRadius: "0rem" }}
      exit={{ opacity: 0, y: "100%", borderRadius: "2rem" }}
      transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      <div className="sticky top-0 z-50 glass-card backdrop-blur-2xl border-b border-glass-border px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="font-display text-sm font-bold text-foreground truncate">{game.name}</h2>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-32">
        <div className="relative rounded-2xl overflow-hidden mt-4 aspect-video">
          {game.image_url ? (
            <img src={game.image_url} alt={game.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="font-display text-5xl font-bold text-muted-foreground/20">{game.name.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">{game.name}</h1>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-4">Select Package</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {game.game_packages.map((pkg) => {
              const isSelected = selectedPkg?.id === pkg.id;
              const discountedPrice = pkg.price * (1 - discount);
              return (
                <motion.button key={pkg.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`relative p-4 rounded-xl text-left transition-all duration-300 ${isSelected ? "neon-glow border-2 border-primary bg-primary/10" : "glass-card hover:border-primary/30"}`}
                >
                  <div className="font-display text-lg font-bold text-foreground">{pkg.amount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{pkg.currency}</div>
                  <div className="mt-2 font-bold text-primary">
                    {discountedPrice.toLocaleString()} E£
                    {discount > 0 && <span className="ml-1.5 text-xs text-muted-foreground line-through">{pkg.price.toLocaleString()} E£</span>}
                  </div>
                  {isSelected && (
                    <motion.div layoutId="pkg-check" className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <label className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-2 block">Player ID</label>
          <input type="text" placeholder="Enter Your Player ID" value={playerId}
            onChange={(e) => { setPlayerId(e.target.value); setPlayerIdError(false); }}
            className={`w-full px-4 py-3 rounded-xl bg-card/60 backdrop-blur-xl border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${playerIdError ? "border-destructive" : "border-glass-border"}`}
          />
          {playerIdError && <p className="flex items-center gap-1 mt-2 text-xs text-destructive"><AlertCircle className="w-3 h-3" /> Player ID is required</p>}
        </div>

        <div className="mt-6">
          <label className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-2 block">Promo Code</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Enter Promo Code" value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value); if (promoApplied) setPromoApplied(false); }}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card/60 backdrop-blur-xl border border-glass-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <button onClick={handleApplyPromo} className="px-4 py-3 rounded-xl btn-glow text-sm font-semibold text-primary-foreground">Apply</button>
          </div>
          {promoApplied && <p className="flex items-center gap-1 mt-2 text-xs text-green-400"><CheckCircle2 className="w-3 h-3" /> 50% discount applied!</p>}
        </div>
      </div>

      {selectedPkg && !showPayment && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 glass-card backdrop-blur-2xl border-t border-glass-border"
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-display text-xl font-bold text-foreground">{finalPrice.toLocaleString()} E£</p>
            </div>
            <button onClick={handleProceedToPayment} className="btn-glow px-8 py-3 rounded-xl font-display text-sm font-bold text-primary-foreground">
              Buy Now
            </button>
          </div>
        </motion.div>
      )}

      {/* Payment Sheet */}
      <AnimatePresence>
        {showPayment && selectedPkg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-xl flex items-end sm:items-center justify-center"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full max-w-md glass-card rounded-t-2xl sm:rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center">
                <h2 className="font-display text-lg font-bold text-foreground">Complete Payment</h2>
                <p className="text-xs text-muted-foreground mt-1">Transfer the amount and attach the screenshot</p>
              </div>

              <div className="glass-card p-4 rounded-xl space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-primary font-display font-bold text-lg">{finalPrice.toLocaleString()} E£</span>
                </div>
                <div className="h-px bg-glass-border" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Transfer to this number:</p>
                  <button onClick={copyNumber} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors">
                    <span className="font-display text-xl font-bold text-primary tracking-wider">{PAYMENT_NUMBER}</span>
                  </button>
                  <p className="text-[10px] text-muted-foreground text-center mt-1">Tap to copy</p>
                </div>
              </div>

              <div>
                <label className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-2 block">
                  Payment Screenshot *
                </label>
                {screenshotPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-glass-border">
                    <img src={screenshotPreview} alt="Screenshot" className="w-full max-h-48 object-contain bg-card" />
                    <button
                      onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-destructive/20 transition-colors"
                    >
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-glass-border hover:border-primary/50 cursor-pointer transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tap to upload screenshot</span>
                    <input type="file" accept="image/*" onChange={handleScreenshotSelect} className="hidden" />
                  </label>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowPayment(false); setScreenshotFile(null); setScreenshotPreview(null); }}
                  className="flex-1 py-3 rounded-xl glass-card text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting || !screenshotFile}
                  className="flex-1 py-3 rounded-xl btn-glow font-display text-sm font-bold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? "Submitting..." : (
                    <><ImageIcon className="w-4 h-4" /> Submit Order</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmation && (
          <OrderConfirmation
            {...confirmation}
            onClose={() => { setConfirmation(null); onBack(); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GameDetail;
