import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const isAvailable = searchParams.get("isAvailable");
    const sort = searchParams.get("sort");

    // Build Prisma query filters
    const where: any = {};
    const andConditions: any[] = [];

    if (category) {
      where.category = category;
    }

    if (subcategory) {
      where.subcategory = subcategory;
    }

    if (isAvailable === "true") {
      where.isAvailable = true;
    }

    // Free text search (name and description)
    const search = searchParams.get("search");
    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      });
    }

    // Advanced price filtering (checking both regular and discount price)
    if (minPrice || maxPrice) {
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : 99999999;

      andConditions.push({
        OR: [
          // Case 1: Product has discount and the discount price is in range
          {
            AND: [
              { discountPrice: { not: null } },
              { discountPrice: { gte: min, lte: max } }
            ]
          },
          // Case 2: Product has no discount and regular price is in range
          {
            AND: [
              { discountPrice: null },
              { price: { gte: min, lte: max } }
            ]
          }
        ]
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Sorting
    let orderBy: any = { createdAt: "desc" }; // default sorting: newest
    if (sort === "price-asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price-desc") {
      orderBy = { price: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    // Optional pagination
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const page = pageParam ? Math.max(1, parseInt(pageParam) || 1) : 1;
    const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam) || 20)) : undefined;
    const skip = limit ? (page - 1) * limit : undefined;

    const products = await prisma.product.findMany({
      where,
      orderBy,
      ...(limit ? { take: limit, skip } : {}),
      include: {
        reviews: {
          select: { rating: true },
        },
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    // Format products for frontend consumption
    const formattedProducts = products.map((p) => {
      const reviewCount = p.reviews.length;
      // Default to 4.8 if there are no reviews to match mock visual design
      const rating = reviewCount > 0
        ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
        : 4.8;

      return {
        id: p.id,
        name: p.name,
        description: p.description ?? undefined,
        price: Number(p.price),
        discount_price: p.discountPrice ? Number(p.discountPrice) : undefined,
        is_available: p.isAvailable,
        image_url: p.imageUrl,
        image_urls: [p.imageUrl, ...p.images.map((image) => image.url)],
        category: p.category,
        subcategory: p.subcategory ?? undefined,
        rating,
        reviewCount,
      };
    });

    return NextResponse.json(formattedProducts, { status: 200 });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { error: "Error interno al consultar catálogo" },
      { status: 500 }
    );
  }
}
