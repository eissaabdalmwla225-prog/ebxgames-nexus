import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Tag, AlertCircle, CheckCircle2, Upload, Image as ImageIcon } from "lucide-react";
import type { Game, GamePackage } from "@/hooks/useGames";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import OrderConfirmation from "./OrderConfirmation";

interface GameDetailProps {
  game: Game & {
    input_placeholder?: string; // 🔥 جديد
    input_type?: string;        // 🔥 جديد (text / number / email)
  };
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

  const finalPrice = useMemo(() => {
    return selectedPkg ? selectedPkg.price * (1 - discount) : 0;
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

  const generateSaleId = () => `EBX-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleProceedToPayment = () => {
    if (!playerId.trim()) {
      setPlayerIdError(true);
      toast.error("Please fill the required field.");
      return;
    }
    if (!selectedPkg) {
      toast.error("Please select a package.");
      return;
    }
    if (!user) {
      toast.error("Please sign in first.");
      return;
    }

    setPlayerIdError(false);
    setShowPayment(true);
  };

  const handleScreenshotSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleSubmitOrder = async () => {
    if (!screenshotFile) {
      toast.error("Please attach a payment screenshot.");
      return;
    }

    if (!selectedPkg || !user) return;

    setSubmitting(true);
    const saleId = generateSaleId();

    const ext = screenshotFile.name.split(".").pop();
    const filePath = `${user.id}/${saleId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("order-screenshots")
      .upload(filePath, screenshotFile, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload screenshot.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      sale_id: saleId,
      game_id: game.id,
      game_name: game.name,
      package_amount: selectedPkg.amount,
      package_currency: selectedPkg.currency,
      original_price: selectedPkg.price,
      final_price: finalPrice,
      player_id: playerId,
      promo_code: promoApplied ? promoCode.trim().toUpperCase() : null,
      screenshot_url: filePath,
    });

    if (error) {
      toast.error("Failed to submit order.");
      console.error(error);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setShowPayment(false);

    setConfirmation({
      saleId,
      gameName: game.name,
      packageAmount: selectedPkg.amount,
      packageCurrency: selectedPkg.currency,
      finalPrice,
      playerId,
    });
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBER);
    toast.success("Number copied!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      <div className="px-4 py-3 flex items-center gap-3 border-b">
        <button onClick={onBack}>
          <ArrowLeft />
        </button>
        <h2>{game.name}</h2>
      </div>

      <div className="p-4 space-y-6">

        {/* Packages */}
        <div className="grid grid-cols-2 gap-3">
          {game.game_packages.map((pkg) => (
            <button key={pkg.id} onClick={() => setSelectedPkg(pkg)}>
              {pkg.amount} - {pkg.price} E£
            </button>
          ))}
        </div>

        {/* 🔥 INPUT المتطور */}
        <div>
          <label className="block mb-2 text-sm">
            {game.input_placeholder || "Player ID"}
          </label>

          <input
            type={game.input_type || "text"} // 🔥 نوع متغير
            placeholder={game.input_placeholder || "Enter Your Player ID"} // 🔥 نص متغير
            value={playerId}
            onChange={(e) => {
              setPlayerId(e.target.value);
              setPlayerIdError(false);
            }}
            className={`w-full p-3 border rounded ${
              playerIdError ? "border-red-500" : ""
            }`}
          />

          {playerIdError && (
            <p className="text-red-500 text-xs mt-1">
              This field is required
            </p>
          )}
        </div>

        {/* Promo */}
        <div>
          <input
            type="text"
            placeholder="Promo Code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <button onClick={handleApplyPromo}>Apply</button>
        </div>

        {/* Buy */}
        {selectedPkg && (
          <button onClick={handleProceedToPayment}>
            Buy - {finalPrice} E£
          </button>
        )}
      </div>

      {/* Payment */}
      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-4 rounded space-y-4">

              <p>Send to: {PAYMENT_NUMBER}</p>

              <input type="file" onChange={handleScreenshotSelect} />

              <button onClick={handleSubmitOrder} disabled={submitting}>
                Submit
              </button>

              <button onClick={() => setShowPayment(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation */}
      {confirmation && (
        <OrderConfirmation
          {...confirmation}
          onClose={() => {
            setConfirmation(null);
            onBack();
          }}
        />
      )}
    </motion.div>
  );
};

export default GameDetail;
