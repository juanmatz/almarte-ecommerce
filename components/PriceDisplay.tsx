import React from "react";

interface PriceDisplayProps {
  price: number;
  discountPrice?: number;
  className?: string;
}

export default function PriceDisplay({ price, discountPrice, className = "" }: PriceDisplayProps) {
  const formatPrice = (value: number) => {
    return `$${value.toLocaleString("es-CO")}`;
  };

  return (
    <div className={`flex items-baseline gap-x-1.5 font-sans ${className}`}>
      {discountPrice ? (
        <>
          <span className="text-base font-bold text-primary">
            {formatPrice(discountPrice)}
          </span>
          <span className="text-xs text-text-secondary line-through">
            {formatPrice(price)}
          </span>
        </>
      ) : (
        <span className="text-base font-bold text-primary">
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
}
