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
      <span className="inline-flex items-center rounded-md bg-stone-200 px-2 py-1 text-xs font-semibold text-stone-700">
        Agotado
      </span>
    );
  }

  if (discountPrice && discountPrice < price) {
    const discountPercent = Math.round(((price - discountPrice) / price) * 100);
    return (
      <span className="inline-flex items-center rounded-md bg-primary-hover/20 px-2 py-1 text-xs font-semibold text-primary">
        -{discountPercent}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 border border-green-200">
      Disponible
    </span>
  );
}
