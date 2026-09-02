import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mockProducts } from "@/data/mockProducts";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const isAvailable = searchParams.get("isAvailable");
  const sort = searchParams.get("sort");
  const search = searchParams.get("search");

  try {
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

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        reviews: true,
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
    console.warn("API products: Database unreachable, returning filtered mock products:", error);

    // Filter mockProducts gracefully
    let filtered = [...mockProducts];

    if (category) {
      const normalizedCategory = category.toLowerCase().replace(/-/g, "");
      filtered = filtered.filter((p) => {
        const pCat = p.category.toLowerCase().replace(/-/g, "");
        return pCat.includes(normalizedCategory) || normalizedCategory.includes(pCat);
      });
    }

    if (subcategory) {
      filtered = filtered.filter((p) => p.subcategory?.toLowerCase() === subcategory.toLowerCase());
    }

    if (isAvailable === "true") {
      filtered = filtered.filter((p) => p.is_available);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    if (minPrice || maxPrice) {
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : 99999999;
      filtered = filtered.filter((p) => {
        const effectivePrice = p.discount_price ?? p.price;
        return effectivePrice >= min && effectivePrice <= max;
      });
    }

    if (sort === "price-asc") {
      filtered.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
    } else if (sort === "price-desc") {
      filtered.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
    }

    return NextResponse.json(filtered, { status: 200 });
  }
}
