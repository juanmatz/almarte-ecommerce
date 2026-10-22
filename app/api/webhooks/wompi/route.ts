import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateWompiEventSignature, WompiWebhookPayload } from "@/lib/wompi";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let payload: WompiWebhookPayload;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Payload JSON malformado." },
        { status: 400 }
      );
    }

    // 1. Validar firma criptográfica (checksum)
    const isValid = validateWompiEventSignature(payload);
    if (!isValid) {
      console.warn("ADVERTENCIA DE SEGURIDAD: Firma de webhook Wompi inválida.", {
        checksum: payload?.signature?.checksum,
        properties: payload?.signature?.properties,
      });
      return NextResponse.json(
        { error: "Firma inválida del evento Wompi." },
        { status: 401 }
      );
    }

    // 2. Procesar evento
    const { event, data } = payload;
    if (event !== "transaction.updated" || !data?.transaction) {
      // Respondemos 200 para eventos informativos no manejados
      return NextResponse.json(
        { message: "Evento recibido pero no requiere acción.", event },
        { status: 200 }
      );
    }

    const txn = data.transaction;
    const reference = txn.reference;
    const wompiTxId = txn.id;
    const status = txn.status;

    // Extraer orderId de la referencia generada (Formato: ALM-{orderId}-{timestamp})
    let parsedOrderId: number | null = null;
    if (reference && reference.startsWith("ALM-")) {
      const parts = reference.split("-");
      if (parts.length >= 2) {
        const idNum = parseInt(parts[1], 10);
        if (!isNaN(idNum)) {
          parsedOrderId = idNum;
        }
      }
    }

    // 3. Localizar la orden por ID o referencia guardada
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(parsedOrderId ? [{ id: parsedOrderId }] : []),
          { paymentIntentId: reference },
          { paymentIntentId: wompiTxId },
        ],
      },
      include: {
        shipment: true,
      },
    });

    if (!order) {
      console.warn(
        `Webhook Wompi: No se encontró orden para la referencia ${reference} o ID ${wompiTxId}.`
      );
      return NextResponse.json(
        { error: "Orden no encontrada en Almarte." },
        { status: 404 }
      );
    }

    // 4. Idempotencia: Si ya está pagada y llega otro evento APPROVED, responder 200 de inmediato
    if (order.status === "paid" && status === "APPROVED") {
      return NextResponse.json(
        { message: "La orden ya se encuentra confirmada como pagada.", orderId: order.id },
        { status: 200 }
      );
    }

    // 5. Manejo según estado reportado por Wompi
    if (status === "APPROVED") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paymentIntentId: wompiTxId,
          shipment: {
            update: {
              notes: `Pago aprobado por Wompi (${txn.payment_method_type || "Pasarela"}). Transacción ID: ${wompiTxId}. Referencia: ${reference}.`,
            },
          },
        },
      });

      return NextResponse.json(
        { received: true, status: "paid", orderId: order.id },
        { status: 200 }
      );
    }

    if (status === "DECLINED" || status === "ERROR") {
      if (order.status === "pending") {
        await prisma.shipment.update({
          where: { orderId: order.id },
          data: {
            notes: `Intento de pago rechazado por Wompi (${txn.payment_method_type || "Pasarela"}). Motivo: ${txn.status_message || "Rechazado por entidad financiera"}.`,
          },
        });
      }

      return NextResponse.json(
        { received: true, status: order.status, orderId: order.id },
        { status: 200 }
      );
    }

    if (status === "VOIDED") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "cancelled",
          shipment: {
            update: {
              notes: `Pago anulado/reversado en Wompi. ID Transacción: ${wompiTxId}.`,
            },
          },
        },
      });

      return NextResponse.json(
        { received: true, status: "cancelled", orderId: order.id },
        { status: 200 }
      );
    }

    // Para transacciones PENDING u otros estados intermedios
    return NextResponse.json(
      { received: true, status: order.status, orderId: order.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al procesar webhook de Wompi:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el webhook." },
      { status: 500 }
    );
  }
}
