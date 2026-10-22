import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWompiConfig, generateWompiSignature } from "@/lib/wompi";

interface CheckoutItem {
  product_id: number;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      documentId,
      phone,
      city,
      address,
      items,
    } = body;

    // 1. Validation
    if (!name || !email || !documentId || !phone || !city || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Todos los campos de datos de envío e ítems son obligatorios." },
        { status: 400 }
      );
    }

    // 1.1 Sanitize and validate text field lengths
    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim();
    const trimmedDocumentId = String(documentId).trim();
    const trimmedPhone = String(phone).trim();
    const trimmedCity = String(city).trim();
    const trimmedAddress = String(address).trim();

    if (trimmedName.length > 100 || trimmedEmail.length > 150 || trimmedDocumentId.length > 20 ||
        trimmedPhone.length > 20 || trimmedCity.length > 100 || trimmedAddress.length > 500) {
      return NextResponse.json(
        { error: "Uno o más campos exceden la longitud máxima permitida." },
        { status: 400 }
      );
    }

    // 1.2 Validate items array length and quantities
    if (items.length > 20) {
      return NextResponse.json(
        { error: "El carrito no puede contener más de 20 productos distintos." },
        { status: 400 }
      );
    }

    for (const item of items) {
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
        return NextResponse.json(
          { error: "La cantidad de cada producto debe ser un número entero entre 1 y 99." },
          { status: 400 }
        );
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "El correo electrónico no es válido." },
        { status: 400 }
      );
    }

    // 2. Fetch and validate all products
    const productIds = items.map((item: CheckoutItem) => item.product_id);
    const uniqueProductIds = Array.from(new Set(productIds));
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: uniqueProductIds },
      },
    });

    if (dbProducts.length !== uniqueProductIds.length) {
      return NextResponse.json(
        { error: "Uno o más productos del carrito no existen." },
        { status: 400 }
      );
    }

    // Agrupar cantidades solicitadas por producto
    const requestedQuantities = new Map<number, number>();
    for (const item of items) {
      const current = requestedQuantities.get(item.product_id) || 0;
      requestedQuantities.set(item.product_id, current + item.quantity);
    }

    // Validar disponibilidad y stock suficiente
    for (const dbProduct of dbProducts) {
      const requestedQty = requestedQuantities.get(dbProduct.id) || 0;
      if (!dbProduct.isAvailable || dbProduct.stock <= 0) {
        return NextResponse.json(
          { error: `El producto "${dbProduct.name}" se encuentra agotado.` },
          { status: 400 }
        );
      }
      if (dbProduct.stock < requestedQty) {
        return NextResponse.json(
          {
            error: `El producto "${dbProduct.name}" solo tiene ${dbProduct.stock} ${
              dbProduct.stock === 1 ? "unidad disponible" : "unidades disponibles"
            } (solicitaste ${requestedQty}).`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Calculate total and prepare items data
    let totalAmount = 0;
    const orderItemsToCreate: {
      productId: number;
      quantity: number;
      priceAtPurchase: number;
    }[] = [];

    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.product_id)!;
      const price = dbProduct.discountPrice ? Number(dbProduct.discountPrice) : Number(dbProduct.price);
      const subtotal = price * item.quantity;
      totalAmount += subtotal;

      orderItemsToCreate.push({
        productId: dbProduct.id,
        quantity: item.quantity,
        priceAtPurchase: price,
      });
    }

    // 4. Find or Create User (Safe Guest Handling)
    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail.toLowerCase() },
    });

    if (!user) {
      // Upsert prevents race condition error (P2002) on concurrent double-click
      user = await prisma.user.upsert({
        where: { email: trimmedEmail.toLowerCase() },
        create: {
          name: trimmedName,
          email: trimmedEmail.toLowerCase(),
          passwordHash: null,
          documentId: trimmedDocumentId || null,
          isGuest: true,
          role: "customer",
        },
        update: {},
      });
    } else if (user.isGuest) {
      // If user exists and is a guest, update their documentId or name
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: trimmedName,
          documentId: trimmedDocumentId || user.documentId,
        },
      });
    }
    // Registered accounts retain their existing verified profile data; the order links to user.id.

    // 5. Create Order and items with atomic stock decrement in a single transaction
    const shippingAddressJson = JSON.stringify({
      city: trimmedCity,
      address: trimmedAddress,
      phone: trimmedPhone,
    });

    const order = await prisma.$transaction(async (tx) => {
      // Decremento atómico con bloqueo de fila en MariaDB
      for (const [productId, qty] of requestedQuantities.entries()) {
        const updated = await tx.product.update({
          where: { id: productId },
          data: {
            stock: { decrement: qty },
          },
        });

        // Prevención de sobreventa concurrente
        if (updated.stock < 0) {
          throw new Error(`INSUFFICIENT_STOCK:${updated.name}`);
        }

        // Si el inventario llega a 0, marcar producto como no disponible
        if (updated.stock === 0) {
          await tx.product.update({
            where: { id: productId },
            data: { isAvailable: false },
          });
        }
      }

      return await tx.order.create({
        data: {
          userId: user.id,
          total: totalAmount,
          status: "pending",
          shippingAddress: shippingAddressJson,
          orderItems: {
            create: orderItemsToCreate,
          },
          shipment: {
            create: {
              status: "pending",
              notes: "Pedido registrado. Inventario descontado con éxito y pendiente de pago.",
            },
          },
        },
      });
    });

    // 6. Generate Wompi transaction parameters and update order reference
    const reference = `ALM-${order.id}-${Date.now()}`;
    const amountInCents = Math.round(totalAmount * 100);
    const wompiConfig = getWompiConfig();
    let wompiSignature = "";

    try {
      if (wompiConfig.integritySecret) {
        wompiSignature = generateWompiSignature(reference, amountInCents, "COP");
      }
    } catch (sigErr) {
      console.warn("No se pudo generar firma de integridad Wompi:", sigErr);
    }

    // Save generated reference in order.paymentIntentId for idempotency and lookup
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentIntentId: reference,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const redirectUrl = `${baseUrl}/checkout/confirmacion?orderId=${order.id}&reference=${encodeURIComponent(reference)}`;

    return NextResponse.json(
      {
        message: "Pedido registrado con éxito",
        orderId: order.id,
        total: totalAmount,
        amountInCents,
        reference,
        signature: wompiSignature,
        publicKey: wompiConfig.publicKey,
        currency: "COP",
        redirectUrl,
        checkoutUrl: wompiConfig.checkoutUrl,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.message?.startsWith("INSUFFICIENT_STOCK:")) {
      const productName = error.message.split(":")[1];
      return NextResponse.json(
        { error: `Lo sentimos, otro cliente acaba de adquirir las últimas unidades de "${productName}". Por favor ajusta tu carrito.` },
        { status: 409 }
      );
    }
    console.error("Error al registrar compra de invitado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el pedido." },
      { status: 500 }
    );
  }
}
