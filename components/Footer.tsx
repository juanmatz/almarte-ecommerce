"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Heart } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="border-t border-divider/60 bg-bg-secondary text-foreground/90">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-12 gap-x-8">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-wide text-title">
                ALMARTE
              </span>
              <span className="block font-sans text-[8px] uppercase tracking-[0.25em] text-primary -mt-1 font-semibold">
                artesanos
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary max-w-xs">
              Joyería artesanal con intención mística, cristales naturales y aromas creados a mano para elevar tu bienestar espiritual.
            </p>
            <div className="mt-6 flex gap-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-surface/30 hover:bg-surface/75 text-primary hover:text-primary-hover rounded-full transition duration-300 flex items-center justify-center"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-surface/30 hover:bg-surface/75 text-primary hover:text-primary-hover rounded-full transition duration-300 flex items-center justify-center"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links: Compra */}
          <div>
            <h3 className="font-serif text-base font-semibold text-title tracking-wide">
              Compra
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/catalog" className="text-sm text-text-secondary hover:text-primary transition duration-200">
                  Ver Todo el Catálogo
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=accesorios" className="text-sm text-text-secondary hover:text-primary transition duration-200">
                  Accesorios & Joyería
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=cuarzos" className="text-sm text-text-secondary hover:text-primary transition duration-200">
                  Cuarzos y Cristales
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=aromas" className="text-sm text-text-secondary hover:text-primary transition duration-200">
                  Aromas y Velas
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Soporte */}
          <div>
            <h3 className="font-serif text-base font-semibold text-title tracking-wide">
              Información & Soporte
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/faq" className="text-sm text-text-secondary hover:text-primary transition duration-200">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm text-text-secondary hover:text-primary transition duration-200">
                  Políticas de Envío
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-text-secondary hover:text-primary transition duration-200">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-text-secondary hover:text-primary transition duration-200">
                  Contacto directo
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter signup */}
          <div>
            <h3 className="font-serif text-base font-semibold text-title tracking-wide">
              Boletín Almarte
            </h3>
            <p className="mt-4 text-sm text-text-secondary leading-relaxed">
              Únete a nuestra comunidad mística y recibe un 10% de descuento en tu primera compra, además de guías exclusivas de bienestar.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu correo electrónico"
                  required
                  className="w-full rounded-md border border-divider/60 bg-white py-2.5 pl-3 pr-10 text-sm placeholder-text-secondary/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-primary transition duration-200"
                  aria-label="Suscribirse"
                >
                  <Mail className="h-5 w-5" />
                </button>
              </div>
              {subscribed && (
                <span className="text-[12px] font-medium text-primary animate-fade-in">
                  ¡Gracias por suscribirte! Revisa tu bandeja de entrada.
                </span>
              )}
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-16 border-t border-divider/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-y-4">
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} Almarte Artesanos. Todos los derechos reservados.
          </p>
          <p className="text-xs text-text-secondary flex items-center gap-x-1">
            Creado a mano con <Heart className="h-3 w-3 fill-primary text-primary" /> en Colombia.
          </p>
        </div>
      </div>
    </footer>
  );
}
