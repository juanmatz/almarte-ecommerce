"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { DollarSign, ShoppingBag, Box, Truck, ArrowUpRight, ClipboardList, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatCOP } from "@/lib/currency";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

function MetricCard({ title, value, description, icon: Icon, colorClass }: MetricCardProps) {
  return (
    <div className="bg-bg-secondary rounded-lg border border-divider/60 p-6 hover:shadow-xs transition duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-title">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-lg ${colorClass} flex items-center justify-center`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="mt-4 text-xs text-text-secondary">{description}</p>
    </div>
  );
}

interface OrderItem {
  id: number;
  customerName: string;
  customerEmail: string;
  total: number;
  status: "pending" | "paid" | "shipped" | "cancelled";
  shipmentStatus: string;
  createdAt: string;
}

interface DashboardMetrics {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingShipments: number;
  recentOrders: OrderItem[];
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        if (!token) return;
        const res = await fetch("/api/admin/metrics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("No se pudieron cargar las estadísticas.");
        }
        const data = await res.json();
        setMetrics(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [token]);



  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">Pagado</span>;
      case "shipped":
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">Enviado</span>;
      case "cancelled":
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">Cancelado</span>;
      default:
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">Pendiente</span>;
    }
  };

  const getShipmentBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-medium px-2 py-0.5 rounded-md">Entregado</span>;
      case "in_transit":
        return <span className="bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-medium px-2 py-0.5 rounded-md">En tránsito</span>;
      case "dispatched":
        return <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-medium px-2 py-0.5 rounded-md">Despachado</span>;
      case "returned":
        return <span className="bg-stone-50 text-stone-700 border border-stone-100 text-[10px] font-medium px-2 py-0.5 rounded-md">Devuelto</span>;
      default:
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-medium px-2 py-0.5 rounded-md">Pendiente</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-surface/40 rounded-md w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-surface/30 rounded-lg border border-divider/40 animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-surface/30 rounded-lg border border-divider/40 animate-pulse" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-lg text-center max-w-xl mx-auto my-12">
        <p className="font-serif text-lg font-bold">Error en el Dashboard</p>
        <p className="text-sm mt-2">{error || "No se pudieron obtener los datos."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-md hover:bg-primary-hover transition"
        >
          Reintentar Carga
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-serif text-2xl font-bold text-title">Dashboard General</h2>
        <p className="text-xs text-text-secondary mt-1">Resumen del rendimiento comercial e inventario actual.</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ingresos Totales"
          value={formatCOP(metrics.totalRevenue)}
          description="Suma de pedidos pagados y enviados"
          icon={DollarSign}
          colorClass="bg-emerald-50 text-emerald-700"
        />
        <MetricCard
          title="Pedidos Totales"
          value={metrics.totalOrders}
          description="Órdenes de compra registradas"
          icon={ShoppingBag}
          colorClass="bg-primary/10 text-primary"
        />
        <MetricCard
          title="Catálogo de Productos"
          value={metrics.totalProducts}
          description="Total de piezas en la plataforma"
          icon={Box}
          colorClass="bg-amber-50 text-amber-700"
        />
        <MetricCard
          title="Envíos Activos"
          value={metrics.pendingShipments}
          description="Pedidos por entregar o en ruta"
          icon={Truck}
          colorClass="bg-sky-50 text-sky-700"
        />
      </div>

      {/* Recent Orders Section */}
      <div className="bg-bg-secondary rounded-lg border border-divider/60 overflow-hidden shadow-xs">
        <div className="px-6 py-5 border-b border-divider/40 flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <ClipboardList className="h-5 w-5 text-[#43503C]" />
            <h3 className="font-serif text-lg font-bold text-title">Pedidos Recientes</h3>
          </div>
          <Link
            href="/admin/ordenes"
            className="inline-flex items-center gap-x-1 text-xs font-semibold text-primary hover:text-primary-hover transition"
          >
            Ver todas las órdenes
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-divider/40">
            <thead className="bg-surface/30">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Orden ID
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Monto Total
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Estado Pago
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Despacho
                </th>
                <th scope="col" className="relative px-6 py-3.5">
                  <span className="sr-only">Detalles</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-bg-secondary divide-y divide-divider/30 text-xs">
              {metrics.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                    No se han registrado órdenes de compra en el sistema.
                  </td>
                </tr>
              ) : (
                metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface/10 transition duration-150">
                    <td className="px-6 py-4.5 font-semibold text-title">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-text-primary">{order.customerName}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4.5 text-text-secondary">
                      {new Date(order.createdAt).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4.5 font-bold text-text-primary">
                      {formatCOP(order.total)}
                    </td>
                    <td className="px-6 py-4.5">
                      {getOrderStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4.5">
                      {getShipmentBadge(order.shipmentStatus)}
                    </td>
                    <td className="px-6 py-4.5 text-right font-semibold">
                      <Link
                        href={`/admin/ordenes?id=${order.id}`}
                        className="text-primary hover:text-primary-hover transition"
                      >
                        Gestionar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
