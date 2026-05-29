"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, User, Search, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accesoriosDropdownOpen, setAccesoriosDropdownOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { openCart, cartCount } = useCart();

  const handleScroll = () => {
    if (window.scrollY > 80) {
      setIsCompact(true);
    } else {
      setIsCompact(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccesoriosDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccesoriosDropdownOpen(false);
  }, [pathname]);

  const accesoriosSubcategories = [
    { name: "Ver Todo", href: "/catalogo/accesorios" },
    { name: "Manillas", href: "/catalogo/accesorios?subcategory=Manillas" },
    { name: "Collares", href: "/catalogo/accesorios?subcategory=Collares" },
    { name: "Aretes", href: "/catalogo/accesorios?subcategory=Aretes" },
    { name: "Anillos", href: "/catalogo/accesorios?subcategory=Anillos" },
  ];

  const mainLinks = [
    { name: "Nuevo", href: "/catalogo?sort=newest" },
    { name: "Kits Energéticos", href: "/catalogo/kits-energeticos" },
    { name: "Cuarzos y Minerales", href: "/catalogo/cuarzos-y-minerales" },
    { name: "Aromas & Velas", href: "/catalogo/aromas-y-velas" },
    { name: "Rituales y Bienestar", href: "/catalogo/rituales-y-bienestar" },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="w-full z-40 sticky top-0 flex flex-col">
      {/* Announcement Bar */}
      {!isCompact && (
        <div className="w-full h-9 bg-title flex items-center justify-center text-xs font-medium text-white tracking-wider px-4 transition-all duration-300">
          Envíos a todo Colombia · Pago seguro con Stripe
        </div>
      )}

      {/* Main Header */}
      <header className="w-full bg-bg-secondary border-b border-divider/60 transition-all duration-300 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between relative">
            
            {/* Column 1: Mobile Hamburger / Desktop Logo */}
            <div className="flex items-center lg:flex-1">
              {/* Mobile Menu Button */}
              <div className="flex lg:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md p-2 text-text-primary hover:bg-surface/50 hover:text-title transition cursor-pointer"
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

              {/* Desktop Logo */}
              <div className="hidden lg:flex items-center shrink-0">
                <Link href="/" className="inline-block group">
                  <span className="font-serif text-2xl font-bold tracking-wide text-title transition group-hover:text-primary">
                    ALMARTE
                  </span>
                  <span className="block font-sans text-[8px] uppercase tracking-[0.25em] text-primary -mt-1 font-bold group-hover:text-primary-hover">
                    artesanos
                  </span>
                </Link>
              </div>
            </div>

            {/* Column 2: Desktop Nav Links / Mobile Centered Logo */}
            <div className="flex items-center justify-center">
              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex lg:items-center lg:gap-x-5 xl:gap-x-6">
                {/* Accesorios Mega-Menu Dropdown Trigger */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setAccesoriosDropdownOpen(!accesoriosDropdownOpen)}
                    className={`inline-flex items-center gap-x-1 py-2 text-xs font-medium uppercase tracking-[0.08em] transition duration-200 hover:text-primary cursor-pointer ${
                      pathname.startsWith("/catalogo/accesorios")
                        ? "text-primary font-bold"
                        : "text-text-primary/95"
                    }`}
                  >
                    Accesorios
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${accesoriosDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {accesoriosDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md border border-divider/60 bg-bg-secondary shadow-lg py-2 z-50 animate-fade-in">
                      {accesoriosSubcategories.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setAccesoriosDropdownOpen(false)}
                          className="block px-4 py-2.5 text-xs text-text-primary hover:bg-surface hover:text-title transition font-medium"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {mainLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`py-2 text-xs font-medium uppercase tracking-[0.08em] transition duration-200 hover:text-primary ${
                      isActive(link.href)
                        ? "text-primary font-bold"
                        : "text-text-primary/95"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Centered Logo */}
              <div className="absolute left-1/2 -translate-x-1/2 text-center lg:hidden z-10">
                <Link href="/" className="inline-block group">
                  <span className="font-serif text-2xl font-bold tracking-wide text-title transition group-hover:text-primary">
                    ALMARTE
                  </span>
                  <span className="block font-sans text-[8px] uppercase tracking-[0.25em] text-primary -mt-1 font-bold group-hover:text-primary-hover">
                    artesanos
                  </span>
                </Link>
              </div>
            </div>

            {/* Column 3: Action Icons */}
            <div className="flex items-center justify-end lg:flex-1 gap-x-2 sm:gap-x-4 z-20">
              {/* Search Button */}
              <button
                type="button"
                onClick={() => router.push("/catalogo")}
                className="p-2 text-text-primary/90 hover:text-primary rounded-full hover:bg-surface/30 transition duration-200 cursor-pointer"
                aria-label="Buscar productos"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Profile Button */}
              <Link
                href="/cuenta"
                className="p-2 text-text-primary/90 hover:text-primary rounded-full hover:bg-surface/30 transition duration-200"
                aria-label="Mi Cuenta"
              >
                <User className="h-5 w-5" />
              </Link>

              {/* Cart Button */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2 text-text-primary/90 hover:text-primary rounded-full hover:bg-surface/30 transition duration-200 cursor-pointer"
                aria-label="Abrir carrito"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-bg-secondary animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-divider/60 bg-bg-secondary/95 backdrop-blur-md">
            <div className="space-y-1 px-4 py-4 sm:px-6">
              {/* Custom Accordion for Accesorios */}
              <div className="border-b border-divider/40 pb-2 mb-2">
                <span className="block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Accesorios
                </span>
                <div className="pl-4 grid grid-cols-2 gap-2 mt-1">
                  {accesoriosSubcategories.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface/40 hover:text-title transition"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>

              {mainLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block rounded-md px-3 py-3 text-sm font-medium uppercase tracking-[0.08em] transition ${
                    isActive(link.href)
                      ? "bg-surface/50 text-title font-bold"
                      : "text-text-primary/90 hover:bg-surface/30 hover:text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
