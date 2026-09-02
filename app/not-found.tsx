import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Sparkles, ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20 bg-background">
        <div className="max-w-lg w-full text-center space-y-6 bg-bg-secondary p-10 rounded-2xl border border-divider/60 shadow-xs">
          <div className="space-y-2">
            <span className="font-serif text-6xl sm:text-7xl font-bold tracking-tight text-primary">
              404
            </span>
            <div className="flex items-center justify-center gap-1.5 text-[#DB9773] mt-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold">
                Página No Encontrada
              </span>
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold text-title">
              Esta pieza no se encuentra en el plano actual
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
              La página o artículo que estás buscando no existe, ha sido movido o no está disponible temporalmente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/catalogo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-primary px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover transition duration-200"
            >
              <Compass className="h-4 w-4" />
              Explorar Catálogo
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md border border-divider bg-white px-6 py-3 text-xs font-semibold text-text-primary hover:bg-surface/50 transition duration-200"
            >
              Volver al Inicio
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
