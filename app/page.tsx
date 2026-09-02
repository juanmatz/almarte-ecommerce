import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Truck, Heart, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/db";
import { mockProducts } from "@/data/mockProducts";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Server Side query for featured products with safe fallback
  let featuredProducts: any[] = [];

  try {
    const products = await prisma.product.findMany({
      take: 4,
      where: { isAvailable: true },
      orderBy: { createdAt: "desc" },
    });

    if (products.length > 0) {
      featuredProducts = products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description ?? undefined,
        price: Number(p.price),
        discount_price: p.discountPrice ? Number(p.discountPrice) : undefined,
        is_available: p.isAvailable,
        image_url: p.imageUrl,
        category: p.category,
        subcategory: p.subcategory ?? undefined,
        rating: 4.8,
        reviewCount: 15,
      }));
    }
  } catch (error) {
    console.warn("Home: Database unreachable, loading mock products fallback:", error);
  }

  // If database returned no products or threw connection error, use mock products
  if (featuredProducts.length === 0) {
    featuredProducts = mockProducts.slice(0, 4);
  }

  const categories = [
    {
      name: "Accesorios & Joyería",
      description: "Collares, manillas, aretes y anillos hechos a mano.",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=500&auto=format&fit=crop",
      href: "/catalogo/accesorios",
    },
    {
      name: "Kits Energéticos",
      description: "Sets de cristales combinados para intenciones específicas.",
      image: "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=500&auto=format&fit=crop",
      href: "/catalogo/kits-energeticos",
    },
    {
      name: "Cuarzos y Minerales",
      description: "Cristales naturales seleccionados en bruto o pulidos.",
      image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=500&auto=format&fit=crop",
      href: "/catalogo/cuarzos-y-minerales",
    },
    {
      name: "Aromas & Velas",
      description: "Velas aromáticas artesanales con cera de soya y cuarzos.",
      image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=500&auto=format&fit=crop",
      href: "/catalogo/aromas-y-velas",
    },
    {
      name: "Rituales y Bienestar",
      description: "Sahumerios, sets de meditación y guías para el alma.",
      image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=500&auto=format&fit=crop",
      href: "/catalogo/rituales-y-bienestar",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-stone-900 px-4 py-20 text-center">
          {/* Hero background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1551269901-5c5e14c25df7?q=80&w=1600&auto=format&fit=crop"
              alt="Ambiente místico y cuarzos"
              fill
              priority
              className="object-cover object-center"
            />
            {/* Organic dark olive overlay */}
            <div className="absolute inset-0 bg-[#232B20]/40 z-1" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 mx-auto max-w-3xl space-y-6">
            <span className="block font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#DB9773]">
              JOYERÍA ARTESANAL · ENERGÍA INTENCIONAL
            </span>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[#FAF7F2] sm:text-5xl md:text-6xl leading-tight">
              Accesorios que elevan tu energía
            </h1>
            <p className="mx-auto max-w-lg font-sans text-base text-bg-secondary/90 sm:text-lg leading-relaxed">
              Piezas únicas elaboradas a mano, cargadas de intención para acompañar tu bienestar.
            </p>
            <div className="pt-6">
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center gap-x-2 rounded-md bg-primary px-8 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-hover hover:-translate-y-0.5 duration-200 cursor-pointer"
              >
                Explorar catálogo
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Brand Values Section */}
        <section className="bg-surface py-16 border-b border-divider/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-0">
              <div className="flex flex-col items-center text-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/40 text-title mb-4">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-title">✋ Hecho a mano</h3>
                <p className="mt-2 text-sm text-text-primary/80 leading-relaxed max-w-xs">
                  Piezas exclusivas creadas con amor y dedicación en cada detalle por artesanos locales.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/40 text-title mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-title">✨ Energía intencional</h3>
                <p className="mt-2 text-sm text-text-primary/80 leading-relaxed max-w-xs">
                  Cristales naturales, limpios y cargados con intenciones positivas para canalizar tu energía.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/40 text-title mb-4">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-title">🚚 Envío a todo Colombia</h3>
                <p className="mt-2 text-sm text-text-primary/80 leading-relaxed max-w-xs">
                  Despachos rápidos y empaques protegidos para que tus piezas lleguen perfectas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="font-serif text-3xl font-bold text-title">Encuentra tu intención</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Explora nuestras colecciones diseñadas para equilibrar tu energía y estilo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group relative flex flex-col overflow-hidden rounded-lg border border-divider bg-bg-secondary p-3 transition duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-md bg-stone-100">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className="object-cover object-center transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-4 pb-2 text-center flex-1 flex flex-col justify-between">
                    <h3 className="font-serif text-sm font-bold text-title group-hover:text-primary transition duration-150">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-[11px] text-text-secondary line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="bg-bg-secondary py-20 border-t border-b border-divider">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Colección Exclusiva
              </span>
              <h2 className="mt-1 font-serif text-3xl font-bold text-title">Productos Destacados</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Una selección de nuestras piezas favoritas cargadas de intención.
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center gap-x-2 rounded-md border border-primary text-primary px-8 py-3 text-sm font-semibold hover:bg-primary hover:text-white transition duration-200 cursor-pointer"
              >
                Ver catálogo completo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-title text-bg-secondary py-20">
          <div className="mx-auto max-w-md px-4 text-center space-y-6">
            <h2 className="font-serif text-3xl font-bold">Únete a nuestra comunidad</h2>
            <p className="text-sm text-bg-secondary/80 leading-relaxed">
              Recibe consejos sobre cómo usar tus cristales, ofertas exclusivas y entérate antes que nadie de nuestros nuevos lanzamientos.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 mt-4">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                required
                className="flex-1 rounded-md border border-divider/40 bg-white py-2.5 px-4 text-sm text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary-hover"
              />
              <button
                type="submit"
                className="bg-primary text-white rounded-md px-6 py-2.5 text-sm font-semibold hover:bg-primary-hover transition duration-200 cursor-pointer"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </>
  );
}
