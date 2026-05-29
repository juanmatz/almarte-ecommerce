import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El correo electrónico no es válido." },
        { status: 400 }
      );
    }

    // 2. Fetch and validate all products
    const productIds = items.map((item: CheckoutItem) => item.product_id);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: "Uno o más productos del carrito no existen." },
        { status: 400 }
      );
    }

    // Check if any product is unavailable
    const unavailableProduct = dbProducts.find((p) => !p.isAvailable);
    if (unavailableProduct) {
      return NextResponse.json(
        { error: `El producto "${unavailableProduct.name}" no está disponible.` },
        { status: 400 }
      );
    }

    // 3. Calculate total and prepare items data
    let totalAmount = 0;
    const orderItemsToCreate = [];

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

    // 4. Find or Create User (Hybrid Approach B)
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Create guest user
      user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash: null,
          documentId,
          isGuest: true,
          role: "customer",
        },
      });
      console.log(`Usuario invitado creado: ${user.email} (ID: ${user.id})`);
    } else {
      // If user exists and is guest, update their documentId or name if changed
      if (user.isGuest) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name,
            documentId: documentId || user.documentId,
          },
        });
        console.log(`Usuario invitado actualizado: ${user.email}`);
      } else {
        // If user is a registered user, we let them check out under their profile!
        // We might also save/update their documentId if they don't have it
        if (!user.documentId && documentId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { documentId },
          });
        }
        console.log(`Orden asociada a usuario registrado existente: ${user.email}`);
      }
    }

    // 5. Create Order and items in a transaction
    const shippingAddressJson = JSON.stringify({
      city,
      address,
      phone,
    });

    const order = await prisma.order.create({
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
            notes: "Pedido registrado mediante checkout de invitado. Pendiente de pago.",
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Pedido registrado con éxito",
        orderId: order.id,
        total: totalAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar compra de invitado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el pedido." },
      { status: 500 }
    );
  }
}
