"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { ClipboardList, User, MapPin, Package, Truck, Save, X, Loader2, Calendar } from "lucide-react";
import Image from "next/image";
import { formatCOP } from "@/lib/currency";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  quantity: number;
  priceAtPurchase: number;
}

interface Shipment {
  id: number;
  carrier: string | null;
  trackingNumber: string | null;
  status: "pending" | "dispatched" | "in_transit" | "delivered" | "returned";
  dispatchedAt: string | null;
  estimatedDelivery: string | null;
  notes: string | null;
}

interface Order {
  id: number;
  total: number;
  status: "pending" | "paid" | "shipped" | "cancelled";
  shippingAddress: {
    city: string;
    address: string;
    phone: string;
  };
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  shipment: Shipment | null;
}

export default function AdminOrdenesPage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selected Order for Management Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingShipment, setSavingShipment] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Shipment Form states
  const [formCarrier, setFormCarrier] = useState("");
  const [formTrackingNumber, setFormTrackingNumber] = useState("");
  const [formShipmentStatus, setFormShipmentStatus] = useState<Shipment["status"]>("pending");
  const [formEstimatedDelivery, setFormEstimatedDelivery] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, [token]);

  // Open modal if URL query param `id` is present
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam && orders.length > 0) {
      const orderId = parseInt(idParam);
      const match = orders.find((o) => o.id === orderId);
      if (match) {
        handleManageOrder(match);
      }
    }
  }, [searchParams, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!token) return;
      const res = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("No se pudo cargar el listado de órdenes.");
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al obtener órdenes");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleManageOrder = (order: Order) => {
    setSelectedOrder(order);
    setFormCarrier(order.shipment?.carrier || "");
    setFormTrackingNumber(order.shipment?.trackingNumber || "");
    setFormShipmentStatus(order.shipment?.status || "pending");
    setFormEstimatedDelivery(order.shipment?.estimatedDelivery || "");
    setFormNotes(order.shipment?.notes || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    // Clear url query param if present
    if (searchParams.get("id")) {
      router.push("/admin/ordenes");
    }
  };

  const handleUpdateOrderStatus = async (status: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar estado");
      }

      showNotification("Estado de la orden actualizado.", "success");
      // Update local states
      const updatedOrders = orders.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: status as Order["status"] } : o
      );
      setOrders(updatedOrders);
      setSelectedOrder({ ...selectedOrder, status: status as Order["status"] });
    } catch (err: any) {
      console.error(err);
      showNotification(err.message, "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSavingShipment(true);

    const payload = {
      orderId: selectedOrder.id,
      carrier: formCarrier || null,
      trackingNumber: formTrackingNumber || null,
      status: formShipmentStatus,
      estimatedDelivery: formEstimatedDelivery || null,
      notes: formNotes || null,
    };

    try {
      const res = await fetch("/api/admin/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar guía de envío");
      }

      showNotification("Detalles de envío guardados.", "success");
      
      // Update local states
      const updatedShipment = data.shipment;
      const updatedOrders = orders.map((o) =>
        o.id === selectedOrder.id 
          ? { 
              ...o, 
              shipment: updatedShipment,
              // Backend auto-syncs order to shipped if shipment dispatched
              status: (formShipmentStatus !== "pending" && formShipmentStatus !== "returned" && o.status !== "cancelled")
                ? "shipped" as const
                : o.status
            } 
          : o
      );
      setOrders(updatedOrders);
      setSelectedOrder({
        ...selectedOrder,
        shipment: updatedShipment,
        status: (formShipmentStatus !== "pending" && formShipmentStatus !== "returned" && selectedOrder.status !== "cancelled")
          ? "shipped" as const
          : selectedOrder.status
      });
    } catch (err: any) {
      console.error(err);
      showNotification(err.message, "error");
    } finally {
      setSavingShipment(false);
    }
  };



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

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-title">Gestión de Pedidos</h2>
          <p className="text-xs text-text-secondary mt-1">
            Revisa compras registradas, actualiza estados de pago y coordina los envíos nacionales.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Filtrar:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-divider bg-white py-1.5 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
          >
            <option value="all">Todas las órdenes</option>
            <option value="pending">Pendientes de Pago</option>
            <option value="paid">Pagadas</option>
            <option value="shipped">Despachadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Main Table Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-bg-secondary border border-divider/60 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-text-secondary mt-4 font-medium">Cargando órdenes...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-lg text-center max-w-xl mx-auto my-6">
          <p className="font-serif text-lg font-bold">Error al cargar datos</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      ) : (
        <div className="bg-bg-secondary rounded-lg border border-divider/60 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-divider/40">
              <thead className="bg-surface/30">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Orden ID
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Cliente / Email
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Fecha de Compra
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Estado Pago
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Guía / Envío
                  </th>
                  <th scope="col" className="relative px-6 py-3.5 text-right w-24">
                    <span className="sr-only">Gestionar</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-bg-secondary divide-y divide-divider/30 text-xs">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                      No hay órdenes que coincidan con el filtro seleccionado.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface/10 transition duration-150">
                      <td className="px-6 py-4 font-semibold text-title">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-primary">{order.user.name}</div>
                        <div className="text-[10px] text-text-secondary mt-0.5">{order.user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {new Date(order.createdAt).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 font-bold text-text-primary">
                        {formatCOP(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        {getOrderStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          {getShipmentBadge(order.shipment?.status || "pending")}
                          {order.shipment?.trackingNumber && (
                            <span className="text-[9px] font-medium text-text-secondary font-mono tracking-tighter">
                              {order.shipment.carrier}: {order.shipment.trackingNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        <button
                          onClick={() => handleManageOrder(order)}
                          className="text-primary hover:text-primary-hover transition cursor-pointer"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Order Management Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-bg-secondary w-full max-w-4xl rounded-lg border border-divider shadow-2xl overflow-hidden my-8 animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-divider/60 flex items-center justify-between bg-title/5">
              <div>
                <h3 className="font-serif text-lg font-bold text-title flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Detalle de Pedido #{selectedOrder.id}
                </h3>
                <p className="text-[11px] text-text-secondary mt-0.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Creado el {new Date(selectedOrder.createdAt).toLocaleString("es-CO")}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-md text-text-secondary hover:text-text-primary transition cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Notification Alert within Modal */}
            {notification && (
              <div className={`mx-6 mt-4 p-3 rounded-md border text-xs font-semibold ${
                notification.type === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}>
                {notification.message}
              </div>
            )}

            {/* Modal Content Columns */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6 max-h-[65vh] overflow-y-auto">
              
              {/* Left Column: Order details & Address (3 columns) */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* User & Shipping details */}
                <div className="bg-stone-50 border border-divider/40 rounded-lg p-4 space-y-3.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-title flex items-center gap-1.5 border-b border-divider/40 pb-2">
                    <User className="h-4 w-4 text-primary" />
                    Información del Cliente
                  </h4>
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-text-primary">{selectedOrder.user.name}</p>
                    <p className="text-text-secondary">{selectedOrder.user.email}</p>
                  </div>
                  
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-title flex items-center gap-1.5 border-b border-divider/40 pb-2 pt-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Dirección de Despacho (Colombia)
                  </h4>
                  <div className="text-xs space-y-1 text-text-primary">
                    <p><strong className="text-text-secondary">Ciudad:</strong> {selectedOrder.shippingAddress.city}</p>
                    <p><strong className="text-text-secondary">Dirección:</strong> {selectedOrder.shippingAddress.address}</p>
                    <p><strong className="text-text-secondary">Teléfono:</strong> {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Items details */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-title flex items-center gap-1.5 border-b border-divider/40 pb-2">
                    <Package className="h-4 w-4 text-primary" />
                    Piezas Compradas
                  </h4>
                  
                  <div className="space-y-3.5">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 rounded-md overflow-hidden bg-stone-100 border border-divider shrink-0">
                            <Image
                              src={item.productImageUrl}
                              alt={item.productName}
                              fill
                              sizes="44px"
                              className="object-cover object-center"
                            />
                          </div>
                          <div>
                            <p className="font-serif font-bold text-title">{item.productName}</p>
                            <p className="text-[10px] text-text-secondary mt-0.5">
                              {formatCOP(item.priceAtPurchase)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-text-primary shrink-0">
                          {formatCOP(item.priceAtPurchase * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-divider/40 pt-4 flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-title">Monto Total Pagado</span>
                    <span className="font-sans text-base font-bold text-primary">
                      {formatCOP(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Status & Shipping form (2 columns) */}
              <div className="lg:col-span-2 space-y-6 border-t lg:border-t-0 lg:border-l border-divider/40 pt-6 lg:pt-0 lg:pl-6">
                
                {/* Payment Status controls */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-title">
                    Estado de la Transacción
                  </h4>
                  <div className="flex gap-2">
                    <select
                      value={selectedOrder.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleUpdateOrderStatus(e.target.value)}
                      className="flex-1 rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition disabled:bg-surface/50"
                    >
                      <option value="pending">Pendiente de Pago</option>
                      <option value="paid">Pagado (Verificado)</option>
                      <option value="shipped">Despachado / Enviado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                    {updatingStatus && <Loader2 className="h-5 w-5 animate-spin text-primary self-center" />}
                  </div>
                </div>

                {/* Shipment Tracker Form */}
                <form onSubmit={handleSaveShipment} className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-title flex items-center gap-1.5 border-b border-divider/40 pb-2">
                    <Truck className="h-4.5 w-4.5 text-primary" />
                    Detalles de Logística & Envío
                  </h4>

                  {/* Shipment Status select */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-semibold uppercase tracking-wider text-text-secondary">
                      Estado del Envío
                    </label>
                    <select
                      value={formShipmentStatus}
                      onChange={(e) => setFormShipmentStatus(e.target.value as Shipment["status"])}
                      className="w-full rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    >
                      <option value="pending">Pendiente de despacho</option>
                      <option value="dispatched">Despachado (En bodega transportadora)</option>
                      <option value="in_transit">En tránsito (En ruta nacional)</option>
                      <option value="delivered">Entregado al destinatario</option>
                      <option value="returned">Devuelto al remitente</option>
                    </select>
                  </div>

                  {/* Carrier field */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-semibold uppercase tracking-wider text-text-secondary">
                      Empresa Transportadora
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Servientrega, Coordinadora, Envía"
                      value={formCarrier}
                      onChange={(e) => setFormCarrier(e.target.value)}
                      className="w-full rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                  </div>

                  {/* Tracking Number field */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-semibold uppercase tracking-wider text-text-secondary">
                      Número de Guía (Tracking)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 1234567890"
                      value={formTrackingNumber}
                      onChange={(e) => setFormTrackingNumber(e.target.value)}
                      className="w-full rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                  </div>

                  {/* Estimated Delivery field */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-semibold uppercase tracking-wider text-text-secondary">
                      Fecha Estimada de Entrega
                    </label>
                    <input
                      type="date"
                      value={formEstimatedDelivery}
                      onChange={(e) => setFormEstimatedDelivery(e.target.value)}
                      className="w-full rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                  </div>

                  {/* Logistics Notes field */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-semibold uppercase tracking-wider text-text-secondary">
                      Notas Internas / Instrucciones
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Notas del despacho (Ej. Dejar en portería, dirección corregida...)"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                  </div>

                  {/* Save button */}
                  <button
                    type="submit"
                    disabled={savingShipment}
                    className="w-full rounded-md bg-[#43503C] hover:bg-[#43503C]/90 text-white py-2.5 px-4 text-xs font-semibold transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:bg-divider disabled:cursor-not-allowed"
                  >
                    {savingShipment ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        Guardar Información de Envío
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
