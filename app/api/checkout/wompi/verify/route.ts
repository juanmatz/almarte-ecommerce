import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWompiTransaction } from "@/lib/wompi";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("id");
    const orderIdParam = searchParams.get("orderId");
    const referenceParam = searchParams.get("reference");

    if (!transactionId && !orderIdParam && !referenceParam) {
      return NextResponse.json(
        { error: "Se requiere al menos el ID de transacción o de orden para verificar." },
        { status: 400 }
      );
    }

    const orderId = orderIdParam ? parseInt(orderIdParam, 10) : null;

    // 1. Si no hay transactionId, buscar la orden y devolver su estado actual
    if (!transactionId) {
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(orderId ? [{ id: orderId }] : []),
            ...(referenceParam ? [{ paymentIntentId: referenceParam }] : []),
          ],
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
          shipment: true,
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Orden no encontrada." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        orderId: order.id,
        status: order.status,
        total: Number(order.total),
        paymentIntentId: order.paymentIntentId,
        items: order.orderItems,
      });
    }

    // 2. Consultar directamente a la API de Wompi con transactionId
    let wompiTx;
    try {
      wompiTx = await getWompiTransaction(transactionId);
    } catch (apiErr: any) {
      console.warn("Error al consultar transacción en API de Wompi:", apiErr?.message);
    }

    // 3. Localizar la orden
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(orderId ? [{ id: orderId }] : []),
          ...(wompiTx?.reference ? [{ paymentIntentId: wompiTx.reference }] : []),
          { paymentIntentId: transactionId },
        ],
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        shipment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "No se encontró la orden vinculada a esta transacción." },
        { status: 404 }
      );
    }

    // 4. Si Wompi reporta APPROVED y la orden aún no está marcada como pagada, actualizarla
    if (wompiTx?.status === "APPROVED" && order.status !== "paid") {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paymentIntentId: wompiTx.id,
          shipment: {
            update: {
              notes: `Pago verificado en Wompi (${wompiTx.payment_method_type}). ID: ${wompiTx.id}.`,
            },
          },
        },
      });

      return NextResponse.json({
        orderId: updatedOrder.id,
        status: "paid",
        wompiStatus: "APPROVED",
        total: Number(updatedOrder.total),
        paymentMethodType: wompiTx.payment_method_type,
        items: order.orderItems,
      });
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      wompiStatus: wompiTx?.status || null,
      total: Number(order.total),
      paymentMethodType: wompiTx?.payment_method_type || null,
      items: order.orderItems,
    });
  } catch (error) {
    console.error("Error en verificación de transacción Wompi:", error);
    return NextResponse.json(
      { error: "Error interno al verificar la transacción." },
      { status: 500 }
    );
  }
}
