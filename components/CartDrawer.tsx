"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCOP } from "@/lib/currency";

export default function CartDrawer() {
  const {
    cartItems,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartCount,
  } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent background scrolling
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Cart Drawer content */}
      <div
        ref={drawerRef}
        className="relative flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out border-l border-divider/60"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-divider/60 px-6 py-5">
          <div className="flex items-center gap-x-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-lg font-bold text-title">
              Tu Carrito ({cartCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 text-foreground/80 hover:text-primary rounded-full hover:bg-surface/30 transition duration-200"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="flex h-3/4 flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-secondary border border-divider/40 text-text-secondary mb-6">
                <ShoppingBag className="h-10 w-10 text-primary/75" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-title">
                Tu carrito está vacío
              </h3>
              <p className="mt-2 text-sm text-text-secondary max-w-[240px]">
                Explora nuestras piezas únicas artesanales y encuentra la indicada para ti.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover shadow-xs"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <div className="divide-y divide-divider/40">
              {cartItems.map((item) => {
                const price = item.product.discount_price ?? item.product.price;
                const originalPrice = item.product.discount_price ? item.product.price : null;

                return (
                  <div key={item.product.id} className="flex py-5 gap-x-4 first:pt-0">
                    {/* Product Image */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-divider/50 bg-bg-secondary">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        sizes="96px"
                        className="object-cover object-center"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between text-base font-medium">
                          <h4 className="font-serif text-sm font-bold text-title line-clamp-1">
                            {item.product.name}
                          </h4>
                          <span className="font-sans text-sm font-bold text-foreground pl-2">
                            {formatCOP(price * item.quantity)}
                          </span>
                        </div>
                        {item.product.subcategory && (
                          <p className="mt-0.5 text-xs text-text-secondary uppercase tracking-wider">
                            {item.product.subcategory}
                          </p>
                        )}
                      </div>

                      {/* Controls (quantity & delete) */}
                      <div className="flex items-center justify-between">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-divider/80 rounded-md bg-bg-secondary overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 px-2 text-foreground/80 hover:text-primary hover:bg-surface/40 transition duration-150"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold font-sans w-6 text-center select-none text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 px-2 text-foreground/80 hover:text-primary hover:bg-surface/40 transition duration-150"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="flex items-center gap-x-1 text-xs text-text-secondary hover:text-red-600 transition duration-150 p-1.5 rounded-md hover:bg-red-50"
                          aria-label="Eliminar artículo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer (subtotal & checkout button) */}
        {cartItems.length > 0 && (
          <div className="border-t border-divider/60 bg-bg-secondary px-6 py-6 space-y-4">
            <div className="flex justify-between text-base font-medium">
              <span className="font-serif text-sm font-semibold text-title">Subtotal</span>
              <span className="font-sans text-lg font-bold text-foreground">
                {formatCOP(cartSubtotal)}
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Los costos de envío y los impuestos se calcularán en el siguiente paso.
            </p>
            <div className="pt-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex w-full items-center justify-center gap-x-2 rounded-md bg-primary py-3 text-sm font-medium text-white shadow-xs transition hover:bg-primary-hover duration-200"
              >
                Finalizar Compra
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={closeCart}
                className="text-xs font-medium text-primary hover:text-primary-hover underline transition duration-150"
              >
                o Continuar Comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
