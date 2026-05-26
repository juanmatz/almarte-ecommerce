"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart, Product } from "@/context/CartContext";
import PriceDisplay from "./PriceDisplay";
import AvailabilityBadge from "./AvailabilityBadge";
import StarRating from "./StarRating";

interface ProductCardProps {
  product: Product & { rating?: number; reviewCount?: number };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.is_available) {
      addToCart(product);
    }
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-divider/40 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-bg-secondary">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-y-1">
          <AvailabilityBadge
            isAvailable={product.is_available}
            price={product.price}
            discountPrice={product.discount_price}
          />
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between pt-4">
        <div className="space-y-1.5">
          {/* Subcategory */}
          {product.subcategory && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {product.subcategory}
            </span>
          )}

          {/* Name */}
          <h3 className="font-serif text-base font-bold text-title line-clamp-1 group-hover:text-primary transition duration-150">
            {product.name}
          </h3>

          {/* Ratings */}
          {product.rating !== undefined && (
            <div className="flex items-center gap-x-2">
              <StarRating rating={product.rating} size={13} />
              <span className="text-xs text-text-secondary">
                ({product.reviewCount})
              </span>
            </div>
          )}
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-4 flex items-center justify-between pt-2 border-t border-divider/20">
          <PriceDisplay
            price={product.price}
            discountPrice={product.discount_price}
          />

          <button
            onClick={handleAddToCart}
            disabled={!product.is_available}
            className={`p-2 rounded-full transition duration-200 ${
              product.is_available
                ? "bg-primary text-white hover:bg-primary-hover hover:scale-105 active:scale-95"
                : "bg-stone-100 text-stone-400 cursor-not-allowed"
            }`}
            aria-label={product.is_available ? "Agregar al carrito" : "Agotado"}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
