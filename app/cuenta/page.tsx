"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User as UserIcon, LogOut, Settings, ShieldAlert, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CuentaPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/cuenta/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-background min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-text-secondary">Cargando perfil...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 bg-background">
        <h1 className="font-serif text-3xl font-bold text-title mb-8">Mi Cuenta</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="md:col-span-1 bg-bg-secondary rounded-lg border border-divider/60 p-6 flex flex-col items-center text-center shadow-xs">
            <div className="h-20 w-20 rounded-full bg-surface flex items-center justify-center text-title mb-4">
              <UserIcon className="h-10 w-10" />
            </div>
            <h2 className="font-serif text-xl font-bold text-title">{user.name}</h2>
            <p className="text-xs text-text-secondary mt-1">{user.email}</p>
            <span className="mt-3 inline-block rounded-full bg-surface px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-primary">
              {user.role === "admin" ? "Administrador" : "Cliente"}
            </span>

            <button
              onClick={logout}
              className="mt-8 w-full flex items-center justify-center gap-x-2 rounded-md border border-rose-200 text-rose-700 py-2.5 px-4 text-xs font-semibold hover:bg-rose-50 transition duration-150 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>

          {/* Details / Action area */}
          <div className="md:col-span-2 space-y-6">
            {user.role === "admin" && (
              <div className="bg-[#43503C]/5 border border-[#43503C]/20 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-md bg-[#43503C]/10 flex items-center justify-center text-[#43503C]">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-title">Panel de Control</h3>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      Tienes acceso a las herramientas administrativas de Almarte Artesanos. Puedes gestionar el catálogo de productos, las órdenes de compra y los detalles de despacho.
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center gap-x-1.5 rounded-md bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover transition shrink-0"
                >
                  <Settings className="h-4 w-4" />
                  Administrar Tienda
                </Link>
              </div>
            )}

            <div className="bg-bg-secondary rounded-lg border border-divider/60 p-6">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-divider/40">
                <ShoppingBag className="h-5 w-5 text-title" />
                <h3 className="font-serif text-lg font-bold text-title">Mis Pedidos</h3>
              </div>
              
              <div className="text-center py-12">
                <p className="text-sm text-text-secondary">Aún no has realizado ninguna compra.</p>
                <Link
                  href="/catalogo"
                  className="mt-4 inline-flex text-xs font-semibold text-primary hover:text-primary-hover transition"
                >
                  Explorar catálogo de piezas →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
