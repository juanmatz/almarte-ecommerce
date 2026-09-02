"use client";
 
import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Compass } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error("Next.js Error caught by ErrorBoundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-background">
      <div className="max-w-md w-full text-center space-y-6 bg-bg-secondary p-8 rounded-xl border border-divider/60 shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
            Almarte Artesanos
          </span>
          <h2 className="font-serif text-2xl font-bold text-title">
            Ocurrió un contratiempo temporal
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
            Estamos teniendo dificultades para conectar con el servidor en este momento. Puedes reintentar la acción o volver a la tienda.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-text-secondary/60 pt-1">
              Código de referencia: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover transition duration-200 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md border border-divider bg-white px-5 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface/50 transition duration-200"
          >
            <Home className="h-4 w-4" />
            Ir al Inicio
          </Link>
        </div>

        <div className="pt-2 border-t border-divider/40 text-center">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition"
          >
            <Compass className="h-3.5 w-3.5" />
            Explorar catálogo de piezas
          </Link>
        </div>
      </div>
    </div>
  );
}
