import React from "react";

interface AvailabilityBadgeProps {
  isAvailable: boolean;
  price: number;
  discountPrice?: number;
  stock?: number;
  lowStockAlert?: number;
}

export default function AvailabilityBadge({
  isAvailable,
  price,
  discountPrice,
  stock,
  lowStockAlert = 2,
}: AvailabilityBadgeProps) {
  if (!isAvailable || (stock !== undefined && stock <= 0)) {
    return (
      <span className="inline-flex items-center rounded-md bg-stone-200 dark:bg-stone-800 px-2.5 py-1 text-xs font-semibold text-text-secondary border border-divider/60">
        Agotado
      </span>
    );
  }

  const isLowStock = stock !== undefined && stock > 0 && stock <= Math.max(3, lowStockAlert);

  return (
    <div className="flex flex-col gap-1 items-start">
      {isLowStock && (
        <span className="inline-flex items-center rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 backdrop-blur-xs">
          ¡Solo quedan {stock}!
        </span>
      )}
      {discountPrice && discountPrice < price ? (
        <span className="inline-flex items-center rounded-md bg-primary-hover/20 px-2.5 py-1 text-xs font-semibold text-primary backdrop-blur-xs">
          -{Math.round(((price - discountPrice) / price) * 100)}%
        </span>
      ) : !isLowStock ? (
        <span className="inline-flex items-center rounded-md bg-surface/80 px-2.5 py-1 text-xs font-semibold text-title border border-divider/40 backdrop-blur-xs">
          Disponible
        </span>
      ) : null}
    </div>
  );
}
