"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { LayoutDashboard, ClipboardList, LogOut, Store, Menu, X, Shield, Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "admin") {
        router.push("/cuenta/login");
      }
    }
  }, [user, loading, router]);

  // Prevent flash of content before checking authentication
  if (loading || !user || user.role !== "admin") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-text-secondary font-medium animate-pulse">
          Verificando credenciales de administrador...
        </p>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Productos", href: "/admin/productos", icon: Store },
    { name: "Órdenes", href: "/admin/ordenes", icon: ClipboardList },
  ];

  const handleLogout = () => {
    logout();
    router.push("/cuenta/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#43503C] text-stone-100 border-r border-divider/20 z-30">
        <div className="flex h-20 shrink-0 items-center px-6 border-b border-white/10">
          <Link href="/admin" className="block group">
            <span className="font-serif text-2xl font-bold tracking-wide text-[#FAF7F2]">
              ALMARTE
            </span>
            <span className="block font-sans text-[8px] uppercase tracking-[0.25em] text-[#DB9773] -mt-1 font-bold">
              artesanos · admin
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-x-3 rounded-md px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  active
                    ? "bg-[#C6764B] text-white shadow-xs"
                    : "text-stone-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-white" : "text-stone-400 group-hover:text-white"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-white/10 p-4 space-y-2">
          <div className="flex items-center gap-x-3 px-2 py-1.5">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-[#DB9773]">
              <Shield className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-[#FAF7F2]">{user.name}</p>
              <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
            </div>
          </div>

          <Link
            href="/"
            className="flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-xs font-medium text-stone-300 hover:bg-white/5 hover:text-white transition duration-150"
          >
            <Store className="h-4 w-4" />
            Ver Tienda Pública
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-xs font-medium text-rose-300 hover:bg-white/5 hover:text-rose-200 transition duration-150 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-20 bg-bg-secondary border-b border-divider/60 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20 sticky top-0 shadow-xs">
          {/* Mobile menu trigger */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 text-text-primary hover:bg-surface/40 rounded-md cursor-pointer"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 md:flex-none">
            <h1 className="font-serif text-lg font-bold text-title block md:hidden">
              Almarte Admin
            </h1>
            <span className="hidden md:inline-block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Sistema de Gestión Interna
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-xs font-medium text-text-primary">
              Bienvenido, <strong className="text-title">{user.name}</strong>
            </span>
            <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center text-title border border-divider">
              <Shield className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* Page children */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 3. Mobile Sidebar Overlay & Drawer */}
      {mobileSidebarOpen && (
        <div className="relative z-50 md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs bg-[#43503C] text-stone-100 flex-col shadow-2xl animate-slide-in">
            <div className="flex h-20 items-center justify-between px-6 border-b border-white/10 shrink-0">
              <Link href="/admin" onClick={() => setMobileSidebarOpen(false)} className="block">
                <span className="font-serif text-2xl font-bold tracking-wide text-[#FAF7F2]">
                  ALMARTE
                </span>
                <span className="block font-sans text-[8px] uppercase tracking-[0.25em] text-[#DB9773] -mt-1 font-bold">
                  artesanos · admin
                </span>
              </Link>
              <button
                type="button"
                className="p-1 rounded-md text-stone-400 hover:text-white"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 px-4 py-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-x-3 rounded-md px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      active
                        ? "bg-[#C6764B] text-white shadow-xs"
                        : "text-stone-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Sidebar Footer */}
            <div className="border-t border-white/10 p-4 space-y-2">
              <div className="flex items-center gap-x-3 px-2 py-1.5 mb-2">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-[#DB9773]">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold truncate text-[#FAF7F2]">{user.name}</p>
                  <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                </div>
              </div>

              <Link
                href="/"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-xs font-medium text-stone-300 hover:bg-white/5 hover:text-white transition duration-150"
              >
                <Store className="h-4 w-4" />
                Ver Tienda Pública
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-xs font-medium text-rose-300 hover:bg-white/5 hover:text-rose-200 transition duration-150 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
