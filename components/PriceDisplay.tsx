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
    <div className={`flex items-baseline gap-x-2 font-sans ${className}`}>
      {discountPrice ? (
        <>
          <span className="text-base font-bold text-foreground">
            {formatPrice(discountPrice)}
          </span>
          <span className="text-xs text-text-secondary line-through">
            {formatPrice(price)}
          </span>
        </>
      ) : (
        <span className="text-base font-bold text-foreground">
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
}
