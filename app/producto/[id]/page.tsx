import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductDetails from "@/components/ProductDetails";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

// Prevent static prerendering — this page queries the database at request time
export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return {
      title: "Producto no encontrado | Almarte",
    };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return {
      title: "Producto no encontrado | Almarte",
    };
  }

  return {
    title: `${product.name} | Almarte Artesanos`,
    description: product.description || `Encuentra ${product.name} y más artículos hechos a mano cargados de intenciones en Almarte.`,
  };
}

export default async function ProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    notFound();
  }

  // Direct server query to fetch the product and its reviews
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
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Format the product object for client serialization
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-background">
        <ProductDetails product={formattedProduct} />
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
