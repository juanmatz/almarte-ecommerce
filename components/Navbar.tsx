"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { openCart, cartCount } = useCart();

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Catálogo", href: "/catalog" },
    { name: "Rituales y Bienestar", href: "/catalog?category=rituales" },
    { name: "Sobre Nosotros", href: "/about" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-divider/60 bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground/80 hover:bg-surface/50 hover:text-primary transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Abrir menú</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex md:gap-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative py-2 text-sm font-medium transition duration-200 hover:text-primary ${
                  isActive(link.href)
                    ? "text-primary font-semibold"
                    : "text-foreground/80"
                }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* Logo / Brand Name */}
          <div className="flex-1 text-center md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link href="/" className="inline-block">
              <span className="font-serif text-3xl font-bold tracking-wide text-title transition hover:text-primary">
                ALMARTE
              </span>
              <span className="block font-sans text-[9px] uppercase tracking-[0.25em] text-primary -mt-1 font-semibold">
                artesanos
              </span>
            </Link>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-x-2 sm:gap-x-4">
            {/* Search Button */}
            <button
              type="button"
              className="p-2 text-foreground/80 hover:text-primary rounded-full hover:bg-surface/30 transition duration-200"
              aria-label="Buscar productos"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Profile Button */}
            <Link
              href="/login"
              className="p-2 text-foreground/80 hover:text-primary rounded-full hover:bg-surface/30 transition duration-200"
              aria-label="Mi Cuenta"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Cart Button */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-2 text-foreground/80 hover:text-primary rounded-full hover:bg-surface/30 transition duration-200"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-background animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-divider/60 bg-background/95 backdrop-blur-md">
          <div className="space-y-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-md px-3 py-3 text-base font-medium transition ${
                  isActive(link.href)
                    ? "bg-surface/60 text-primary font-semibold"
                    : "text-foreground/80 hover:bg-surface/30 hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
