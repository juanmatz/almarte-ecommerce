import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // 1. Authenticate user from JWT token
    const userPayload = await getAuthUser(request);
    if (!userPayload) {
      return NextResponse.json(
        { error: "No autorizado. Inicie sesión para ver sus pedidos." },
        { status: 401 }
      );
    }

    // 2. Fetch all orders for this user with items, products, and shipment status
    const orders = await prisma.order.findMany({
      where: { userId: userPayload.id },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        shipment: true,
      },
    });

    // 3. Format decimal values and parse shipping address
    const formattedOrders = orders.map((order) => {
      let parsedAddress = {};
      try {
        parsedAddress = JSON.parse(order.shippingAddress || "{}");
      } catch {
        parsedAddress = { raw: order.shippingAddress };
      }

      return {
        id: order.id,
        total: Number(order.total),
        status: order.status,
        shippingAddress: parsedAddress,
        createdAt: order.createdAt.toISOString(),
        items: order.orderItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          productImageUrl: item.product.imageUrl,
          quantity: item.quantity,
          priceAtPurchase: Number(item.priceAtPurchase),
        })),
        shipment: order.shipment
          ? {
              id: order.shipment.id,
              carrier: order.shipment.carrier,
              trackingNumber: order.shipment.trackingNumber,
              status: order.shipment.status,
              dispatchedAt: order.shipment.dispatchedAt ? order.shipment.dispatchedAt.toISOString() : null,
              estimatedDelivery: order.shipment.estimatedDelivery ? order.shipment.estimatedDelivery.toISOString().split("T")[0] : null,
              notes: order.shipment.notes,
            }
          : null,
      };
    });

    return NextResponse.json(formattedOrders, { status: 200 });
  } catch (error) {
    console.error("Error al obtener historial de órdenes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al consultar órdenes" },
      { status: 500 }
    );
  }
}
