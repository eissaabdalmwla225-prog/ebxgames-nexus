import { motion } from "framer-motion";
import { CheckCircle2, Copy, X } from "lucide-react";
import { toast } from "sonner";

interface OrderConfirmationProps {
  saleId: string;
  gameName: string;
  packageAmount: number;
  packageCurrency: string;
  finalPrice: number;
  playerId: string;
  onClose: () => void;
}

const OrderConfirmation = ({
  saleId, gameName, packageAmount, packageCurrency, finalPrice, playerId, onClose,
}: OrderConfirmationProps) => {
  const copySaleId = () => {
    navigator.clipboard.writeText(saleId);
    toast.success("Order ID copied!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-sm glass-card p-6 space-y-5 relative"
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex flex-col items-center gap-3 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </motion.div>
          <h2 className="font-display text-lg font-bold text-foreground">Order Submitted!</h2>
          <p className="text-xs text-muted-foreground">Your order and payment screenshot have been sent to the admin for confirmation.</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Order ID</span>
            <button onClick={copySaleId} className="flex items-center gap-1 text-primary font-mono text-xs">
              {saleId} <Copy className="w-3 h-3" />
            </button>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Game</span>
            <span className="text-foreground font-medium">{gameName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Package</span>
            <span className="text-foreground">{packageAmount.toLocaleString()} {packageCurrency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Player ID</span>
            <span className="text-foreground font-mono text-xs">{playerId}</span>
          </div>
          <div className="h-px bg-glass-border my-2" />
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Total</span>
            <span className="text-primary font-display font-bold text-lg">{finalPrice.toLocaleString()} E£</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <span className="text-yellow-400 text-xs">⏳</span>
          <p className="text-xs text-yellow-300">Status: <span className="font-bold">Pending</span> — awaiting admin confirmation</p>
        </div>

        <button onClick={onClose} className="w-full py-3 rounded-xl btn-glow font-display text-sm font-bold text-primary-foreground">
          Done
        </button>
      </motion.div>
    </motion.div>
  );
};

export default OrderConfirmation;
