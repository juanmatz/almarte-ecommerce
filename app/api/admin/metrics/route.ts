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

    // 2. Fetch counts and aggregate revenue in parallel using DB aggregates
    const [totalProducts, totalOrders, revenueAggregate, pendingShipments] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { in: ["paid", "shipped"] },
        },
      }),
      prisma.shipment.count({
        where: {
          status: {
            in: ["pending", "dispatched", "in_transit"],
          },
        },
      }),
    ]);

    const totalRevenue = Number(revenueAggregate._sum.total || 0);

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
