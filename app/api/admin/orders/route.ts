import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // 1. Authenticate user
    const userPayload = await getAuthUser(request);
    if (!userPayload || userPayload.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    // 2. Fetch orders with associated items, products, user, and shipment (with optional pagination)
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const page = pageParam ? Math.max(1, parseInt(pageParam) || 1) : 1;
    const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam) || 50)) : undefined;
    const skip = limit ? (page - 1) * limit : undefined;

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: limit, skip } : {}),
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
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

    // 3. Format decimal values to numbers for safe JSON consumption
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      total: Number(order.total),
      status: order.status,
      shippingAddress: JSON.parse(order.shippingAddress),
      createdAt: order.createdAt.toISOString(),
      user: {
        name: order.user.name,
        email: order.user.email,
      },
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
    }));

    return NextResponse.json(formattedOrders, { status: 200 });
  } catch (error) {
    console.error("Error al obtener listado de órdenes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al consultar órdenes" },
      { status: 500 }
    );
  }
}
