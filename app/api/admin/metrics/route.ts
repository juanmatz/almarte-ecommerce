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

    // 2. Fetch total count of products
    const totalProducts = await prisma.product.count();

    // 3. Fetch orders metrics
    const orders = await prisma.order.findMany({
      select: {
        total: true,
        status: true,
      },
    });

    const totalOrders = orders.length;

    // Revenue: sum of all orders that are paid or shipped
    const totalRevenue = orders
      .filter((o) => o.status === "paid" || o.status === "shipped")
      .reduce((acc, o) => acc + Number(o.total), 0);

    // Pending shipments: status not delivered/returned
    const pendingShipments = await prisma.shipment.count({
      where: {
        status: {
          in: ["pending", "dispatched", "in_transit"],
        },
      },
    });

    // 4. Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        shipment: {
          select: {
            status: true,
          },
        },
      },
    });

    const formattedRecentOrders = recentOrders.map((o) => ({
      id: o.id,
      customerName: o.user.name,
      customerEmail: o.user.email,
      total: Number(o.total),
      status: o.status,
      shipmentStatus: o.shipment?.status ?? "pending",
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json(
      {
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingShipments,
        recentOrders: formattedRecentOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener métricas de administrador:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al calcular estadísticas" },
      { status: 500 }
    );
  }
}
