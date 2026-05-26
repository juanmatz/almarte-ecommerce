"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShieldCheck, CreditCard } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-divider/60 bg-title text-bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-12 gap-x-8">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-wide text-bg-secondary">
                ALMARTE
              </span>
              <span className="block font-sans text-[8px] uppercase tracking-[0.25em] text-primary-hover -mt-1 font-bold">
                artesanos
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-bg-secondary/80 max-w-xs">
              Joyería artesanal con intención mística, cuarzos naturales y aromas creados a mano para acompañar tu camino de bienestar espiritual.
            </p>
            <div className="flex gap-x-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-bg-secondary/10 hover:bg-bg-secondary/20 text-bg-secondary rounded-full transition duration-300 flex items-center justify-center"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4.5 w-4.5"
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
                className="p-2 bg-bg-secondary/10 hover:bg-bg-secondary/20 text-bg-secondary rounded-full transition duration-300 flex items-center justify-center"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4.5 w-4.5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h3 className="font-serif text-base font-bold text-bg-secondary tracking-wide border-b border-bg-secondary/15 pb-2">
              Colecciones
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/catalogo/accesorios" className="text-sm text-bg-secondary/70 hover:text-bg-secondary transition duration-200">
                  Accesorios & Joyería
                </Link>
              </li>
              <li>
                <Link href="/catalogo/kits-energeticos" className="text-sm text-bg-secondary/70 hover:text-bg-secondary transition duration-200">
                  Kits Energéticos
                </Link>
              </li>
              <li>
                <Link href="/catalogo/cuarzos-y-minerales" className="text-sm text-bg-secondary/70 hover:text-bg-secondary transition duration-200">
                  Cuarzos y Minerales
                </Link>
              </li>
              <li>
                <Link href="/catalogo/aromas-y-velas" className="text-sm text-bg-secondary/70 hover:text-bg-secondary transition duration-200">
                  Aromas & Velas
                </Link>
              </li>
              <li>
                <Link href="/catalogo/rituales-y-bienestar" className="text-sm text-bg-secondary/70 hover:text-bg-secondary transition duration-200">
                  Rituales y Bienestar
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div>
            <h3 className="font-serif text-base font-bold text-bg-secondary tracking-wide border-b border-bg-secondary/15 pb-2">
              Ayuda & Políticas
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/faq" className="text-sm text-bg-secondary/70 hover:text-bg-secondary transition duration-200">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/envios" className="text-sm text-bg-secondary/70 hover:text-bg-secondary transition duration-200">
                  Políticas de Envío
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-sm text-bg-secondary/70 hover:text-bg-secondary transition duration-200">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm text-bg-secondary/70 hover:text-bg-secondary transition duration-200">
                  Contacto directo
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust Badge */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-bg-secondary tracking-wide border-b border-bg-secondary/15 pb-2">
              Pago Seguro
            </h3>
            <div className="flex items-start gap-x-2.5 bg-bg-secondary/5 border border-bg-secondary/10 rounded-md p-3.5">
              <ShieldCheck className="h-5 w-5 text-primary-hover flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-bg-secondary">
                  Pago 100% Seguro
                </p>
                <p className="text-[11px] text-bg-secondary/75 mt-0.5 leading-normal">
                  Transacciones encriptadas y procesadas a través de Stripe.
                </p>
              </div>
            </div>
            
            {/* Accepted Payments Icons */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-bg-secondary/65 font-bold">
                Medios Aceptados
              </span>
              <div className="flex items-center gap-x-2 text-bg-secondary/80 text-xs">
                <CreditCard className="h-4 w-4 text-primary-hover" />
                <span>Tarjeta Crédito/Débito, PSE, Wallet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="mt-16 border-t border-bg-secondary/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-y-4">
          <p className="text-xs text-bg-secondary/60">
            &copy; {new Date().getFullYear()} Almarte Artesanos. Todos los derechos reservados.
          </p>
          <p className="text-xs text-bg-secondary/60 flex items-center gap-x-1">
            Creado a mano con <Heart className="h-3 w-3 fill-primary-hover text-primary-hover" /> en Colombia.
          </p>
        </div>
      </div>
    </footer>
  );
}
