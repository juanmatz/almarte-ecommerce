"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex items-center justify-center bg-[#FAF7F2] text-[#2C2925] p-4 font-sans antialiased">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-[#EBE5DC] shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-bold text-[#43503C]">
              Error crítico del sistema
            </h1>
            <p className="text-xs text-[#7A7369] leading-relaxed">
              Ocurrió un error inesperado al cargar la aplicación. Por favor reintenta recargar la página.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-x-2 rounded-md bg-[#C6764B] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#B36338] transition duration-200 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar Aplicación
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
