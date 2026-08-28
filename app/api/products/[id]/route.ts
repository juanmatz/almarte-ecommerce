import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID de producto inválido" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const reviewCount = product.reviews.length;
    // Default to 4.8 if there are no reviews to match mock visual design
    const rating = reviewCount > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
      : 4.8;

    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description ?? undefined,
      price: Number(product.price),
      discount_price: product.discountPrice ? Number(product.discountPrice) : undefined,
      is_available: product.isAvailable,
      image_url: product.imageUrl,
      image_urls: [product.imageUrl, ...product.images.map((image) => image.url)],
      category: product.category,
      subcategory: product.subcategory ?? undefined,
      rating,
      reviewCount,
      reviews: product.reviews.map((r) => ({
        id: r.id,
        userId: r.userId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        userName: r.user?.name ?? "Usuario Anónimo",
      })),
    };

    return NextResponse.json(formattedProduct, { status: 200 });
  } catch (error) {
    console.error("Error al obtener detalle del producto:", error);
    return NextResponse.json(
      { error: "Error interno al consultar producto" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID de producto inválido" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Authenticate user
    const userPayload = await getAuthUser(request);
    if (!userPayload) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para dejar una valoración" },
        { status: 401 }
      );
    }

    // 1. Check if the user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: userPayload.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Ya has dejado una valoración para este producto." },
        { status: 400 }
      );
    }

    // 2. Check if the user has purchased the product (order is paid/shipped and contains the product)
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId: userPayload.id,
        status: { in: ["paid", "shipped"] },
        orderItems: {
          some: {
            productId: productId,
          },
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "Solo puedes calificar productos que hayas comprado y pagado en esta tienda." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rating, comment } = body;

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json(
        { error: "La valoración debe ser un número entero entre 1 y 5" },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: userPayload.id,
        rating: ratingVal,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Return the formatted review for the frontend
    const formattedReview = {
      id: review.id,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      userName: review.user?.name ?? "Usuario Anónimo",
    };

    return NextResponse.json(formattedReview, { status: 201 });
  } catch (error) {
    console.error("Error al crear reseña:", error);
    return NextResponse.json(
      { error: "Error interno al guardar la valoración" },
      { status: 500 }
    );
  }
}
