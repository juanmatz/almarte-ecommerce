"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatCOP } from "@/lib/currency";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ChevronRight,
  Sparkles,
  Key,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

interface VerifiedItem {
  id: number;
  quantity: number;
  priceAtPurchase: number;
  product: {
    id: number;
    name: string;
    imageUrl: string;
  };
}

interface OrderVerification {
  orderId: number;
  status: "pending" | "paid" | "shipped" | "cancelled";
  wompiStatus?: "APPROVED" | "PENDING" | "DECLINED" | "VOIDED" | "ERROR" | null;
  total: number;
  paymentMethodType?: string | null;
  paymentIntentId?: string | null;
  items?: VerifiedItem[];
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const transactionId = searchParams.get("id");
  const reference = searchParams.get("reference");

  const { user, register } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderVerification | null>(null);

  // Activación de cuenta de invitado
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [activationPassword, setActivationPassword] = useState("");
  const [activationSubmitting, setActivationSubmitting] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!orderId && !transactionId && !reference) {
        setError("No se proporcionó información de orden o transacción.");
        setLoading(false);
        return;
      }

      try {
        const query = new URLSearchParams();
        if (transactionId) query.set("id", transactionId);
        if (orderId) query.set("orderId", orderId);
        if (reference) query.set("reference", reference);

        const res = await fetch(`/api/checkout/wompi/verify?${query.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "No se pudo verificar el estado del pago.");
        }

        setOrderData(data);
      } catch (err: any) {
        console.error("Error al verificar orden:", err);
        setError(err.message || "Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [orderId, transactionId, reference]);

  const handleAccountActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationPassword || !guestEmail || !guestName) return;
    setActivationError(null);
    setActivationSubmitting(true);

    try {
      const res = await register(guestName, guestEmail, activationPassword);
      if (!res.success) {
        setActivationError(res.error || "Error al activar la cuenta.");
      } else {
        setActivationSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setActivationError("Error al registrar contraseña de acceso.");
    } finally {
      setActivationSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-24 px-4 bg-background">
        <div className="w-full max-w-md bg-bg-secondary rounded-xl border border-divider/60 shadow-md p-8 text-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
          <h2 className="font-serif text-xl font-bold text-title">
            Verificando tu Pago...
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Estamos confirmando la transacción con la pasarela segura de Wompi Bancolombia. Esto toma solo unos instantes.
          </p>
        </div>
      </main>
    );
  }

  if (error || !orderData) {
    return (
      <main className="flex-1 flex items-center justify-center py-20 px-4 bg-background">
        <div className="w-full max-w-lg bg-bg-secondary rounded-xl border border-rose-200 shadow-md p-8 text-center space-y-5">
          <div className="mx-auto h-14 w-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 border border-rose-100">
            <XCircle className="h-8 w-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-title">
            No se pudo verificar el pedido
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            {error || "No encontramos los detalles de la orden solicitada. Si realizaste un pago, por favor conserva tu comprobante."}
          </p>
          <div className="pt-2">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition"
            >
              Volver a la tienda
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isApproved =
    orderData.status === "paid" || orderData.wompiStatus === "APPROVED";
  const isPending =
    orderData.status === "pending" &&
    (orderData.wompiStatus === "PENDING" || !orderData.wompiStatus);
  const isDeclined =
    orderData.wompiStatus === "DECLINED" ||
    orderData.wompiStatus === "ERROR" ||
    orderData.status === "cancelled";

  return (
    <main className="flex-1 py-12 px-4 bg-background">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Main Status Card */}
        <div className="bg-bg-secondary rounded-xl border border-divider/60 shadow-md p-8 text-center space-y-6">
          {/* Icon Badge */}
          {isApproved && (
            <div className="mx-auto h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-xs animate-fade-in">
              <CheckCircle2 className="h-9 w-9" />
            </div>
          )}

          {isPending && (
            <div className="mx-auto h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 border border-amber-100 shadow-xs animate-fade-in">
              <Clock className="h-9 w-9" />
            </div>
          )}

          {isDeclined && (
            <div className="mx-auto h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 border border-rose-100 shadow-xs animate-fade-in">
              <XCircle className="h-9 w-9" />
            </div>
          )}

          {/* Heading and Summary */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold text-title">
              {isApproved && "¡Pago Confirmado con Éxito!"}
              {isPending && "Pago en Proceso de Aprobación"}
              {isDeclined && "El Pago no Pudo Completarse"}
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              {isApproved && (
                <>
                  Tu orden <strong className="text-title">#{orderData.orderId}</strong> ha sido verificada y pagada exitosamente por un total de{" "}
                  <strong className="text-[#C6764B] font-bold">
                    {formatCOP(orderData.total)}
                  </strong>.
                </>
              )}
              {isPending && (
                <>
                  Tu orden <strong className="text-title">#{orderData.orderId}</strong> por{" "}
                  <strong className="text-[#C6764B] font-bold">
                    {formatCOP(orderData.total)}
                  </strong>{" "}
                  está siendo procesada por la entidad financiera (PSE / Nequi / Corresponsal).
                </>
              )}
              {isDeclined && (
                <>
                  La transacción de tu orden <strong className="text-title">#{orderData.orderId}</strong> no fue autorizada por el banco. Tu carrito se encuentra a salvo para que puedas reintentar.
                </>
              )}
            </p>
          </div>

          {/* Details Pill Box */}
          <div className="bg-stone-50 border border-divider/40 rounded-lg p-4 text-xs space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Número de Pedido:</span>
              <span className="font-mono font-bold text-title">#{orderData.orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Estado del Pedido:</span>
              <span
                className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                  isApproved
                    ? "bg-emerald-100 text-emerald-800"
                    : isPending
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {isApproved ? "Pagado" : isPending ? "Pendiente" : "No Completado"}
              </span>
            </div>
            {orderData.paymentMethodType && (
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Método de Pago:</span>
                <span className="font-medium text-text-primary">
                  {orderData.paymentMethodType} (Wompi Bancolombia)
                </span>
              </div>
            )}
            {transactionId && (
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">ID Transacción Wompi:</span>
                <span className="font-mono text-[11px] text-text-secondary truncate max-w-[200px]">
                  {transactionId}
                </span>
              </div>
            )}
          </div>

          {/* Purchased Items List if available */}
          {orderData.items && orderData.items.length > 0 && (
            <div className="text-left space-y-3 border-t border-divider/40 pt-4">
              <h3 className="font-serif text-sm font-bold text-title flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Piezas Incluidas en la Orden
              </h3>
              <div className="divide-y divide-divider/30 max-h-48 overflow-y-auto space-y-2 pr-1">
                {orderData.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-xs pt-2 first:pt-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-10 w-10 rounded bg-stone-100 border border-divider overflow-hidden shrink-0">
                        {item.product.imageUrl && (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-serif font-bold text-title line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-text-secondary">
                          {item.quantity} {item.quantity === 1 ? "unidad" : "unidades"}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-text-primary">
                      {formatCOP(Number(item.priceAtPurchase) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps Card */}
          {isApproved && (
            <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-lg p-4 text-left text-xs space-y-2 text-emerald-950">
              <h4 className="font-serif text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                Próximos Pasos para tu Despacho
              </h4>
              <p className="text-[11px] leading-relaxed text-emerald-900/90">
                Nuestro taller artesanal ha comenzado la preparación y empaque ceremonial de tus piezas. Tan pronto el paquete sea entregado a la transportadora, recibirás tu número de guía de seguimiento.
              </p>
            </div>
          )}

          {isPending && (
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-4 text-left text-xs space-y-2 text-amber-950">
              <h4 className="font-serif text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-700" />
                ¿Qué sucede a continuación?
              </h4>
              <p className="text-[11px] leading-relaxed text-amber-900/90">
                Si pagaste mediante PSE o Nequi, tu banco está finalizando la transferencia. No es necesario realizar otro intento; te notificaremos de inmediato en cuanto la pasarela confirme la transacción.
              </p>
            </div>
          )}

          {isDeclined && (
            <div className="pt-2">
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center gap-2 w-full rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-3 px-4 transition shadow-xs"
              >
                <CreditCard className="h-4 w-4" />
                Reintentar Pago Seguro con Wompi
              </Link>
            </div>
          )}

          {/* Guest Account Activation if not logged in */}
          {!user && isApproved && (
            <div className="border-t border-divider/40 pt-6 text-left space-y-4">
              {activationSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-md text-xs font-medium">
                  ¡Cuenta activada con éxito! Ya puedes iniciar sesión con tu correo para consultar tus compras anteriores e información de despacho.
                </div>
              ) : (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 space-y-3.5">
                  <h4 className="font-serif text-sm font-bold text-title flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Activa tu cuenta de cliente en Almarte
                  </h4>
                  <p className="text-xs text-text-primary leading-relaxed">
                    Realizaste esta compra como invitado. Ingresa una contraseña para activar tu cuenta y poder dar seguimiento a tu guía de despacho en tiempo real:
                  </p>

                  {activationError && (
                    <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded-md">
                      {activationError}
                    </div>
                  )}

                  <form onSubmit={handleAccountActivation} className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Tu Nombre"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="email"
                        required
                        placeholder="tu@correo.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary/60">
                          <Key className="h-4 w-4" />
                        </span>
                        <input
                          type="password"
                          required
                          placeholder="Crea una contraseña segura"
                          value={activationPassword}
                          onChange={(e) => setActivationPassword(e.target.value)}
                          className="w-full rounded-md border border-divider bg-white py-2 pl-9 pr-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={activationSubmitting}
                        className="bg-primary text-white rounded-md px-5 py-2 text-xs font-semibold hover:bg-primary-hover transition flex items-center justify-center gap-1.5 disabled:bg-divider cursor-pointer"
                      >
                        {activationSubmitting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Activar Cuenta"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <div className="pt-4 flex items-center justify-between text-xs font-semibold border-t border-divider/40">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1 text-primary hover:text-primary-hover transition"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Explorar más piezas
            </Link>

            <Link
              href="/cuenta"
              className="inline-flex items-center gap-1 text-title hover:text-primary transition"
            >
              Ir a mi cuenta
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <main className="flex-1 flex items-center justify-center py-24 px-4 bg-background">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </main>
        }
      >
        <ConfirmationContent />
      </Suspense>
      <Footer />
    </>
  );
}
