import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { parseCOPPrice, isValidCOPPrice } from "@/lib/currency";

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
      imageUrls,
    } = body;

    // 3. Validation
    const additionalImageUrls = Array.isArray(imageUrls) ? imageUrls.filter((url: unknown): url is string => typeof url === "string" && url.length > 0) : [];
    if (additionalImageUrls.length > 5) {
      return NextResponse.json({ error: "Cada producto puede tener como máximo 6 imágenes." }, { status: 400 });
    }

    if (!name || !price || !imageUrl || !category) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (nombre, precio, imagen o categoría)" },
        { status: 400 }
      );
    }

    const priceNum = parseCOPPrice(price);
    const discountPriceNum = discountPrice ? parseCOPPrice(discountPrice) : null;

    if (!isValidCOPPrice(priceNum)) {
      return NextResponse.json(
        { error: "El precio regular debe ser un valor válido en pesos colombianos de al menos $1.000 COP." },
        { status: 400 }
      );
    }

    if (discountPriceNum !== null && (!isValidCOPPrice(discountPriceNum) || discountPriceNum >= priceNum)) {
      return NextResponse.json(
        { error: "El precio de descuento debe ser menor al precio regular y de al menos $1.000 COP." },
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
        images: {
          create: additionalImageUrls.map((url, index) => ({ url, sortOrder: index + 1 })),
        },
      },
      include: { images: { orderBy: { sortOrder: "asc" } } },
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
