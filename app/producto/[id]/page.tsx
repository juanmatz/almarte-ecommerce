import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { mockProducts } from "@/data/mockProducts";
import ProductDetails from "@/components/ProductDetails";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await props.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return {
        title: "Producto no encontrado | Almarte",
      };
    }

    let product: any = null;
    try {
      product = await prisma.product.findUnique({
        where: { id: productId },
      });
    } catch (e) {
      console.warn("Product metadata: DB unreachable, falling back to mockProducts:", e);
    }

    if (!product) {
      const mock = mockProducts.find((p) => p.id === productId);
      if (mock) {
        return {
          title: `${mock.name} | Almarte Artesanos`,
          description: mock.description || `Encuentra ${mock.name} en Almarte.`,
        };
      }
      return {
        title: "Producto no encontrado | Almarte",
      };
    }

    return {
      title: `${product.name} | Almarte Artesanos`,
      description: product.description || `Encuentra ${product.name} y más artículos hechos a mano cargados de intenciones en Almarte.`,
    };
  } catch (err) {
    return {
      title: "Producto | Almarte Artesanos",
    };
  }
}

export default async function ProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    notFound();
  }

  let product: any = null;
  let reviews: any[] = [];
  let images: any[] = [];

  try {
    product = await prisma.product.findUnique({
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

    if (product) {
      reviews = product.reviews || [];
      images = product.images || [];
    }
  } catch (error) {
    console.warn("ProductPage: Database unreachable, checking mockProducts:", error);
  }

  // Fallback to mock product if DB didn't return one or failed
  if (!product) {
    const mock = mockProducts.find((p) => p.id === productId);
    if (mock) {
      product = {
        id: mock.id,
        name: mock.name,
        description: mock.description,
        price: mock.price,
        discountPrice: mock.discount_price,
        isAvailable: mock.is_available,
        imageUrl: mock.image_url,
        category: mock.category,
        subcategory: mock.subcategory,
      };
      reviews = [];
      images = [];
    }
  }

  if (!product) {
    notFound();
  }

  // Format the product object for client serialization
  const reviewCount = reviews.length;
  // Default to 4.8 if there are no reviews to match visual design
  const rating = reviewCount > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
    : 4.8;

  const formattedProduct = {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    price: Number(product.price),
    discount_price: product.discountPrice ? Number(product.discountPrice) : undefined,
    is_available: product.isAvailable,
    image_url: product.imageUrl,
    image_urls: [product.imageUrl, ...images.map((image) => image.url)],
    category: product.category,
    subcategory: product.subcategory ?? undefined,
    rating,
    reviewCount,
    reviews: reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
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
