import React from "react";

interface AvailabilityBadgeProps {
  isAvailable: boolean;
  price: number;
  discountPrice?: number;
}

export default function AvailabilityBadge({
  isAvailable,
  price,
  discountPrice,
}: AvailabilityBadgeProps) {
  if (!isAvailable) {
    return (
      <span className="inline-flex items-center rounded-md bg-divider px-2.5 py-1 text-xs font-semibold text-text-secondary">
        Agotado
      </span>
    );
  }

  if (discountPrice && discountPrice < price) {
    const discountPercent = Math.round(((price - discountPrice) / price) * 100);
    return (
      <span className="inline-flex items-center rounded-md bg-primary-hover/20 px-2.5 py-1 text-xs font-semibold text-primary">
        -{discountPercent}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md bg-surface/30 px-2.5 py-1 text-xs font-semibold text-title border border-divider/40">
      Disponible
    </span>
  );
}
