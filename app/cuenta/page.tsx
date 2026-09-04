"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User as UserIcon, LogOut, Settings, ShieldAlert, ShoppingBag, Loader2, Package, Truck, Calendar } from "lucide-react";
import Link from "next/link";
import { formatCOP } from "@/lib/currency";

export default function CuentaPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/cuenta/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && token) {
      const fetchOrders = async () => {
        try {
          const res = await fetch("/api/orders", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setOrders(data);
          }
        } catch (error) {
          console.error("Error al cargar órdenes:", error);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    } else if (!loading) {
      setLoadingOrders(false);
    }
  }, [user, token, loading]);



  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
          <div className="md:col-span-1 md:sticky md:top-28 z-10 h-fit bg-bg-secondary rounded-lg border border-divider/60 p-6 flex flex-col items-center text-center shadow-xs">
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
              
              {loadingOrders ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs text-text-secondary">Cargando tus compras...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-text-secondary">Aún no has realizado ninguna compra.</p>
                  <Link
                    href="/catalogo"
                    className="mt-4 inline-flex text-xs font-semibold text-primary hover:text-primary-hover transition"
                  >
                    Explorar catálogo de piezas →
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-divider/40 rounded-lg p-5 bg-[#FAF7F2] hover:border-divider transition-all shadow-xs">
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-divider/30 mb-4">
                        <div>
                          <h4 className="font-serif text-base font-bold text-title flex items-center gap-1.5">
                            <Package className="h-4 w-4 text-primary" />
                            Pedido #{order.id}
                          </h4>
                          <p className="text-[11px] text-text-secondary flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            order.status === "paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            order.status === "shipped" ? "bg-sky-50 text-sky-700 border border-sky-100" :
                            order.status === "cancelled" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                            "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {
                              order.status === "paid" ? "Pagado" :
                              order.status === "shipped" ? "Enviado" :
                              order.status === "cancelled" ? "Cancelado" : "Pendiente"
                            }
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3 mb-4">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-xs py-1">
                            <Link href={`/producto/${item.productId}`} className="flex items-center gap-3 group hover:opacity-85 transition">
                              {item.productImageUrl ? (
                                <img
                                  src={item.productImageUrl}
                                  alt={item.productName}
                                  className="h-10 w-10 rounded object-cover border border-divider/30 shrink-0 group-hover:border-primary transition"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-surface flex items-center justify-center text-text-secondary border border-divider/30 shrink-0">
                                  <Package className="h-5 w-5" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-foreground leading-snug group-hover:text-primary transition">{item.productName}</p>
                                <p className="text-[10px] text-text-secondary mt-0.5">
                                  Cantidad: {item.quantity} × {formatCOP(item.priceAtPurchase)}
                                </p>
                              </div>
                            </Link>
                            <p className="font-semibold text-title">{formatCOP(item.priceAtPurchase * item.quantity)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between pt-3 border-t border-divider/30 text-sm font-bold text-foreground">
                        <span>Total pagado:</span>
                        <span className="text-base text-primary">{formatCOP(order.total)}</span>
                      </div>

                      {/* Shipment Section */}
                      {order.shipment && (
                        <div className="mt-4 p-3 bg-surface/20 rounded border border-divider/40 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-title mb-1.5">
                            <Truck className="h-4 w-4 text-title shrink-0" />
                            Detalle de Entrega / Envío
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-text-secondary">
                            <div>
                              <strong className="text-foreground">Estado del envío:</strong>{" "}
                              <span className="font-semibold text-title">
                                {
                                  order.shipment.status === "pending" ? "Preparando despacho" :
                                  order.shipment.status === "dispatched" ? "Despachado" :
                                  order.shipment.status === "in_transit" ? "En tránsito" :
                                  order.shipment.status === "delivered" ? "Entregado" :
                                  order.shipment.status === "returned" ? "Devuelto" : order.shipment.status
                                }
                              </span>
                            </div>
                            {order.shipment.carrier && (
                              <div>
                                <strong className="text-foreground">Transportadora:</strong> {order.shipment.carrier}
                              </div>
                            )}
                            {order.shipment.trackingNumber && (
                              <div className="sm:col-span-2">
                                <strong className="text-foreground">Número de guía:</strong>{" "}
                                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-divider/40 text-[11px] font-semibold text-foreground select-all">
                                  {order.shipment.trackingNumber}
                                </span>
                              </div>
                            )}
                            {order.shipment.estimatedDelivery && (
                              <div>
                                <strong className="text-foreground">Fecha estimada de entrega:</strong>{" "}
                                {formatDate(order.shipment.estimatedDelivery)}
                              </div>
                            )}
                            {order.shipment.notes && (
                              <div className="sm:col-span-2 italic text-[11px] mt-1 pt-1 border-t border-divider/20 leading-relaxed text-text-secondary/90">
                                Nota: {order.shipment.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
