import React from "react";
import { formatCOP } from "@/lib/currency";

interface PriceDisplayProps {
  price: number;
  discountPrice?: number;
  className?: string;
}

export default function PriceDisplay({ price, discountPrice, className = "" }: PriceDisplayProps) {
  return (
    <div className={`flex items-baseline gap-x-1.5 font-sans ${className}`}>
      {discountPrice ? (
        <>
          <span className="text-base font-bold text-primary">
            {formatCOP(discountPrice)}
          </span>
          <span className="text-xs text-text-secondary line-through">
            {formatCOP(price)}
          </span>
        </>
      ) : (
        <span className="text-base font-bold text-primary">
          {formatCOP(price)}
        </span>
      )}
    </div>
  );
}
