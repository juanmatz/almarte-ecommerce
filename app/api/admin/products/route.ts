import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

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
      name,
      description,
      price,
      discountPrice,
      isAvailable,
      imageUrl,
      category,
      subcategory,
    } = body;

    // 3. Validation
    if (!name || !price || !imageUrl || !category) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (nombre, precio, imagen o categoría)" },
        { status: 400 }
      );
    }

    const priceNum = parseFloat(price);
    const discountPriceNum = discountPrice ? parseFloat(discountPrice) : null;

    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { error: "El precio regular debe ser un número mayor a cero" },
        { status: 400 }
      );
    }

    if (discountPriceNum !== null && (isNaN(discountPriceNum) || discountPriceNum < 0 || discountPriceNum >= priceNum)) {
      return NextResponse.json(
        { error: "El precio de descuento debe ser un número válido menor al precio regular" },
        { status: 400 }
      );
    }

    // 4. Create product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: priceNum,
        discountPrice: discountPriceNum,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        imageUrl,
        category,
        subcategory: subcategory || null,
      },
    });

    return NextResponse.json(
      {
        message: "Producto creado exitosamente",
        product: {
          ...product,
          price: Number(product.price),
          discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al crear el producto" },
      { status: 500 }
    );
  }
}
