"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShoppingBag, CreditCard, ChevronRight, User, Mail, MapPin, Phone, ShieldAlert, Loader2, Sparkles, CheckCircle2, Key, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user, token, loginWithCredentials, register } = useAuth();

  // Form Fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  // UI state
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Post-checkout Confirmation State
  const [createdOrder, setCreatedOrder] = useState<{ id: number; total: number } | null>(null);
  const [activationPassword, setActivationPassword] = useState("");
  const [activationSubmitting, setActivationSubmitting] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setName(user.name);
      setDocumentId(user.documentId || "");
      setShowLogin(false);
    }
  }, [user]);

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSubmitting(true);
    try {
      const res = await loginWithCredentials(loginEmail, loginPassword);
      if (!res.success) {
        setLoginError(res.error || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Error de red al intentar iniciar sesión.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setCheckoutError("Tu carrito está vacío.");
      return;
    }
    
    setCheckoutError(null);
    setCheckoutSubmitting(true);

    const payload = {
      name,
      email,
      documentId,
      phone,
      city,
      address,
      items: cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch("/api/checkout/guest-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al procesar tu pedido.");
      }

      // Success
      setCreatedOrder({ id: data.orderId, total: data.total });
      clearCart(); // Clear the client-side cart
    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || "Error al conectar con el servidor.");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleAccountActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder || !email || !name) return;
    setActivationError(null);
    setActivationSubmitting(true);

    try {
      const res = await register(name, email, activationPassword);
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

  const formatCOP = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // If order was successfully created, render the post-checkout confirmation screen!
  if (createdOrder) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16 px-4 bg-background">
          <div className="w-full max-w-xl bg-bg-secondary rounded-lg border border-divider/60 shadow-md p-8 text-center space-y-6 animate-fade-in">
            <div className="mx-auto h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-bold text-title">¡Pedido Confirmado!</h2>
              <p className="text-sm text-text-secondary">
                Tu orden <strong className="text-title">#{createdOrder.id}</strong> ha sido registrada con éxito en nuestro sistema por un total de <strong className="text-[#C6764B] font-bold">{formatCOP(createdOrder.total)}</strong>.
              </p>
            </div>

            {/* Instruction Box */}
            <div className="bg-stone-50 border border-divider/40 rounded-lg p-5 text-left text-xs space-y-3.5">
              <h4 className="font-serif text-sm font-bold text-title border-b border-divider/40 pb-2 flex items-center gap-1.5">
                <CreditCard className="h-4.5 w-4.5 text-primary" />
                Instrucciones para el Pago
              </h4>
              <p className="text-text-primary leading-relaxed">
                Para finalizar tu compra, realiza una transferencia bancaria a una de nuestras cuentas autorizadas y envía el comprobante por WhatsApp al número de contacto de Almarte:
              </p>
              <div className="space-y-1 bg-white p-3 rounded-md border border-divider/30 text-[11px] font-mono">
                <p><strong>Nequi / Ahorros Bancolombia:</strong> 310 123 4567</p>
                <p><strong>A nombre de:</strong> Almarte Artesanos SAS</p>
                <p><strong>Referencia de pago:</strong> Orden #{createdOrder.id}</p>
              </div>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                * Tu orden estará reservada por 24 horas. Una vez verificado el pago por administración, procederemos a realizar el despacho y recibirás tu número de guía de envío.
              </p>
            </div>

            {/* Onboarding Box if Guest checkout */}
            {!user && (
              <div className="border-t border-divider/40 pt-6 text-left space-y-4">
                {activationSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-md text-xs font-medium">
                    ¡Cuenta activada con éxito! Ya puedes iniciar sesión en tu perfil para consultar tus compras anteriores e información de despacho.
                  </div>
                ) : (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 space-y-3.5">
                    <h4 className="font-serif text-sm font-bold text-title flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-primary" />
                      Activa tu cuenta de cliente
                    </h4>
                    <p className="text-xs text-text-primary leading-relaxed">
                      Realizaste esta compra como invitado. Si deseas, puedes crear una contraseña para activar tu cuenta. Esto te permitirá ver el historial de tus pedidos y el estado de tu guía de envío en el futuro.
                    </p>

                    {activationError && (
                      <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded-md">
                        {activationError}
                      </div>
                    )}

                    <form onSubmit={handleAccountActivation} className="flex flex-col sm:flex-row gap-2">
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
                          className="w-full rounded-md border border-divider bg-white py-2 pl-9 pr-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={activationSubmitting}
                        className="bg-primary text-white rounded-md px-5 py-2 text-xs font-semibold hover:bg-primary-hover transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-divider"
                      >
                        {activationSubmitting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Activar Cuenta"
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition"
              >
                Volver a la tienda
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 bg-background">
        <h1 className="font-serif text-3xl font-bold text-title mb-8">Finalizar Compra</h1>

        {checkoutError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium max-w-4xl">
            {checkoutError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Inline Login Toggle if not logged in */}
            {!user && (
              <div className="bg-bg-secondary rounded-lg border border-divider/60 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-primary font-medium">¿Ya tienes una cuenta en Almarte?</span>
                  <button
                    onClick={() => {
                      setShowLogin(!showLogin);
                      setLoginError(null);
                    }}
                    className="text-primary font-bold hover:text-primary-hover transition cursor-pointer"
                  >
                    {showLogin ? "Comprar como Invitado" : "Iniciar Sesión"}
                  </button>
                </div>

                {showLogin && (
                  <form onSubmit={handleInlineLogin} className="mt-4 border-t border-divider/40 pt-4 space-y-3 animate-fade-in">
                    <h3 className="font-serif text-sm font-bold text-title">Iniciar Sesión Rápido</h3>
                    
                    {loginError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] rounded-md font-medium">
                        {loginError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary/60">
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          type="email"
                          required
                          placeholder="ejemplo@correo.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full rounded-md border border-divider bg-white py-2 pl-9 pr-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary/60">
                          <Key className="h-4 w-4" />
                        </span>
                        <input
                          type="password"
                          required
                          placeholder="Contraseña"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full rounded-md border border-divider bg-white py-2 pl-9 pr-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loginSubmitting}
                      className="rounded-md bg-[#43503C] hover:bg-[#43503C]/95 text-white text-xs font-semibold py-2 px-4 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-divider"
                    >
                      {loginSubmitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Ingresar"
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Main Shipping Details Form */}
            <div className="bg-bg-secondary rounded-lg border border-divider/60 p-6 shadow-xs">
              <h2 className="font-serif text-lg font-bold text-title flex items-center gap-2 border-b border-divider/40 pb-3 mb-6">
                <Truck className="h-5 w-5 text-primary" />
                Datos de Envío & Facturación
              </h2>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                
                {/* 2-Column Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Email (readonly if logged in) */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary/95">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary/60">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        required
                        disabled={!!user}
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border border-divider bg-white py-2.5 pl-9 pr-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-stone-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Document ID (Cédula) */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary/95">
                      Cédula / NIT de Identificación
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary/60">
                        <CreditCard className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 1020304050"
                        value={documentId}
                        onChange={(e) => setDocumentId(e.target.value)}
                        className="w-full rounded-md border border-divider bg-white py-2.5 pl-9 pr-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary/95">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary/60">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Nombre y apellidos del destinatario"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-md border border-divider bg-white py-2.5 pl-9 pr-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary/95">
                      Teléfono Celular
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary/60">
                        <Phone className="h-4 w-4" />
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 3101234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-md border border-divider bg-white py-2.5 pl-9 pr-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary/95">
                      Ciudad / Municipio
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary/60">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Medellín, Antioquia"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-md border border-divider bg-white py-2.5 pl-9 pr-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary/95">
                      Dirección Completa de Entrega
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary/60">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Calle 10 # 43-20 Apto 402, El Poblado"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-md border border-divider bg-white py-2.5 pl-9 pr-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={checkoutSubmitting || cartItems.length === 0}
                    className="w-full flex items-center justify-center gap-x-2 rounded-md bg-primary hover:bg-primary-hover py-3 px-4 text-sm font-semibold text-white shadow-xs transition duration-200 disabled:bg-divider disabled:cursor-not-allowed cursor-pointer"
                  >
                    {checkoutSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Procesando pedido...
                      </>
                    ) : (
                      <>
                        Confirmar e Ir al Pago
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Cart Summary Column (5 cols) */}
          <div className="lg:col-span-5 bg-bg-secondary rounded-lg border border-divider/60 p-6 shadow-xs space-y-6">
            <h2 className="font-serif text-lg font-bold text-title flex items-center gap-2 border-b border-divider/40 pb-3">
              <ShoppingBag className="h-5 w-5 text-[#43503C]" />
              Resumen del Pedido
            </h2>

            {cartItems.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-sm text-text-secondary">Tu carrito de compras está vacío.</p>
                <Link
                  href="/catalogo"
                  className="inline-flex text-xs font-semibold text-primary hover:text-primary-hover transition"
                >
                  Explorar catálogo de piezas →
                </Link>
              </div>
            ) : (
              <>
                <div className="divide-y divide-divider/30 max-h-[40vh] overflow-y-auto space-y-3.5 pr-2">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between gap-4 text-xs pt-3.5 first:pt-0">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-stone-100 border border-divider shrink-0">
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            sizes="48px"
                            className="object-cover object-center"
                          />
                        </div>
                        <div>
                          <p className="font-serif font-bold text-title line-clamp-1">{item.product.name}</p>
                          <p className="text-[10px] text-text-secondary mt-0.5">
                            {formatCOP(item.product.discount_price ?? item.product.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-text-primary shrink-0">
                        {formatCOP((item.product.discount_price ?? item.product.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-divider/40 pt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Subtotal del carrito</span>
                    <span className="font-semibold text-text-primary">{formatCOP(cartSubtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Costo de envío</span>
                    <span className="font-semibold text-emerald-600 uppercase text-[10px] tracking-wider font-bold">Gratuito</span>
                  </div>
                  <div className="border-t border-divider/40 pt-4 flex items-center justify-between text-sm font-bold">
                    <span className="font-serif text-title">Total a Pagar</span>
                    <span className="font-sans text-[#C6764B]">{formatCOP(cartSubtotal)}</span>
                  </div>
                </div>

                <div className="bg-surface/20 border border-divider/40 rounded-md p-3.5 text-[10px] text-text-secondary leading-relaxed flex gap-2">
                  <ShieldAlert className="h-4 w-4 text-title shrink-0 mt-0.5" />
                  <span>
                    <strong>Compra segura y protegida.</strong> Tus datos personales de envío están cifrados y solo se utilizarán para la logística y confirmación de este pedido.
                  </span>
                </div>
              </>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
