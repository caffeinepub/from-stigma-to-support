import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminPromotionBannerProps {
  onDismiss: () => void;
}

export default function AdminPromotionBanner({ onDismiss }: AdminPromotionBannerProps) {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <p className="font-semibold text-sm sm:text-base">
              ✅ Admin Mode Activated — Outreach Dashboard Unlocked
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="text-white hover:bg-white/20 flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
