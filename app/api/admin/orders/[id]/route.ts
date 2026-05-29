import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const userPayload = await getAuthUser(request);
    if (!userPayload || userPayload.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "ID de orden inválido" },
        { status: 400 }
      );
    }

    // 2. Parse and validate status
    const body = await request.json();
    const { status } = body;

    const validStatuses: OrderStatus[] = ["pending", "paid", "shipped", "cancelled"];
    if (!status || !validStatuses.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: `Estado inválido. Debe ser uno de: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // 3. Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // 4. Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status as OrderStatus,
      },
    });

    // 5. If status is updated to 'shipped', let's automatically check and update shipment status if needed
    if (status === "shipped") {
      const shipment = await prisma.shipment.findUnique({
        where: { orderId },
      });
      if (shipment && shipment.status === "pending") {
        await prisma.shipment.update({
          where: { orderId },
          data: {
            status: "dispatched",
            dispatchedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json(
      {
        message: "Estado de orden actualizado exitosamente",
        order: {
          id: updatedOrder.id,
          status: updatedOrder.status,
          total: Number(updatedOrder.total),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar estado de orden:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al actualizar orden" },
      { status: 500 }
    );
  }
}
