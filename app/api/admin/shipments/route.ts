import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { ShipmentStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const userPayload = await getAuthUser(request);
    if (!userPayload || userPayload.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const {
      orderId,
      carrier,
      trackingNumber,
      status,
      dispatchedAt,
      estimatedDelivery,
      notes,
    } = body;

    const orderIdNum = parseInt(orderId);
    if (isNaN(orderIdNum)) {
      return NextResponse.json(
        { error: "ID de orden inválido" },
        { status: 400 }
      );
    }

    // 3. Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderIdNum },
      include: { shipment: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // 4. Validate shipment status if provided
    const validStatuses: ShipmentStatus[] = [
      "pending",
      "dispatched",
      "in_transit",
      "delivered",
      "returned",
    ];
    if (status && !validStatuses.includes(status as ShipmentStatus)) {
      return NextResponse.json(
        { error: `Estado de envío inválido. Debe ser uno de: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Parse dates if provided
    const parsedDispatchedAt = dispatchedAt ? new Date(dispatchedAt) : undefined;
    const parsedEstimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : undefined;

    // 5. Upsert shipment
    let shipment;
    if (order.shipment) {
      // Update existing
      shipment = await prisma.shipment.update({
        where: { orderId: orderIdNum },
        data: {
          carrier: carrier !== undefined ? carrier : order.shipment.carrier,
          trackingNumber: trackingNumber !== undefined ? trackingNumber : order.shipment.trackingNumber,
          status: (status as ShipmentStatus) || order.shipment.status,
          dispatchedAt: parsedDispatchedAt !== undefined ? parsedDispatchedAt : order.shipment.dispatchedAt,
          estimatedDelivery: parsedEstimatedDelivery !== undefined ? parsedEstimatedDelivery : order.shipment.estimatedDelivery,
          notes: notes !== undefined ? notes : order.shipment.notes,
        },
      });
    } else {
      // Create new
      shipment = await prisma.shipment.create({
        data: {
          orderId: orderIdNum,
          carrier: carrier || null,
          trackingNumber: trackingNumber || null,
          status: (status as ShipmentStatus) || "pending",
          dispatchedAt: parsedDispatchedAt || null,
          estimatedDelivery: parsedEstimatedDelivery || null,
          notes: notes || null,
        },
      });
    }

    // 6. Automatically sync order status: if shipment is marked delivered, mark order as paid/shipped? Or if shipment is dispatched/delivered, sync order status to shipped?
    // In our design, if shipment status is dispatched or in_transit or delivered, let's sync order status to 'shipped' if it is currently 'paid' or 'pending'
    if (shipment.status !== "pending" && shipment.status !== "returned" && order.status !== "shipped" && order.status !== "cancelled") {
      await prisma.order.update({
        where: { id: orderIdNum },
        data: { status: "shipped" },
      });
    }

    return NextResponse.json(
      {
        message: "Información de despacho guardada exitosamente",
        shipment: {
          ...shipment,
          dispatchedAt: shipment.dispatchedAt ? shipment.dispatchedAt.toISOString() : null,
          estimatedDelivery: shipment.estimatedDelivery ? shipment.estimatedDelivery.toISOString().split("T")[0] : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al guardar información de envío:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al guardar el envío" },
      { status: 500 }
    );
  }
}
