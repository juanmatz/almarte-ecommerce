"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Lock, Mail, User, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setSubmitting(false);
      return;
    }

    try {
      const res = await register(name, email, password);
      if (!res.success) {
        setError(res.error || "Error al crear la cuenta");
      } else {
        router.push("/cuenta");
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-background">
        <div className="w-full max-w-md bg-bg-secondary rounded-lg border border-divider/60 shadow-xs overflow-hidden transition-all duration-300 hover:shadow-md">
          {/* Card Header */}
          <div className="bg-title/5 border-b border-divider/40 py-8 px-6 text-center">
            <span className="font-serif text-3xl font-bold tracking-wide text-title">
              ALMARTE
            </span>
            <span className="block font-sans text-[9px] uppercase tracking-[0.25em] text-primary font-bold">
              artesanos
            </span>
            <h2 className="mt-4 font-serif text-xl font-medium text-text-primary/95">
              Crea tu cuenta
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Únete a nosotros y descubre piezas cargadas de intención
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="block text-xs font-medium uppercase tracking-wider text-text-primary/80"
                >
                  Nombre Completo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-secondary/60">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    id="name"
                    required
                    placeholder="Tu nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-divider bg-white py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition duration-150"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium uppercase tracking-wider text-text-primary/80"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-secondary/60">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-divider bg-white py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition duration-150"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium uppercase tracking-wider text-text-primary/80"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-secondary/60">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    id="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-divider bg-white py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition duration-150"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-x-2 rounded-md bg-primary py-3 px-4 text-sm font-semibold text-white shadow-xs hover:bg-primary-hover transition duration-200 disabled:bg-divider disabled:text-text-secondary disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear Cuenta
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-xs text-text-secondary border-t border-divider/40 pt-6">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/cuenta/login"
                className="font-semibold text-primary hover:text-primary-hover transition"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
