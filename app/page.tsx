import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Truck, Heart, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { mockProducts } from "@/data/mockProducts";

export default function Home() {
  // Select a subset of products as featured (e.g. first 3-4 items)
  const featuredProducts = mockProducts.slice(0, 4);

  const categories = [
    {
      name: "Accesorios & Joyería",
      description: "Collares, manillas, aretes hechos a mano.",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=500&auto=format&fit=crop",
      href: "/catalog?category=accesorios",
    },
    {
      name: "Cuarzos & Minerales",
      description: "Cristales naturales seleccionados con intención.",
      image: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?q=80&w=500&auto=format&fit=crop",
      href: "/catalog?category=cuarzos",
    },
    {
      name: "Aromas & Velas",
      description: "Velas de cera de soya aromatizadas.",
      image: "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=500&auto=format&fit=crop",
      href: "/catalog?category=aromas",
    },
    {
      name: "Rituales & Bienestar",
      description: "Sahumerios, sets de meditación y guías.",
      image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=500&auto=format&fit=crop",
      href: "/catalog?category=rituales",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-stone-900 px-4 py-20 text-center">
          {/* Hero background image */}
          <div className="absolute inset-0 z-0 opacity-40">
            <Image
              src="https://images.unsplash.com/photo-1551269901-5c5e14c25df7?q=80&w=1600&auto=format&fit=crop"
              alt="Ambiente místico y cuarzos"
              fill
              priority
              className="object-cover object-center"
            />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 mx-auto max-w-3xl space-y-6">
            <span className="block font-sans text-xs font-semibold uppercase tracking-[0.3em] text-primary-hover">
              Conexión & Energía Natural
            </span>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
              Joyería con Intención & Cristales del Alma
            </h1>
            <p className="mx-auto max-w-lg font-sans text-base text-stone-200 sm:text-lg leading-relaxed">
              Cada pieza es seleccionada y creada a mano para capturar la esencia mística y el poder de la naturaleza, acompañando tu camino de bienestar.
            </p>
            <div className="pt-6">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-x-2 rounded-md bg-primary px-8 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-hover hover:-translate-y-0.5 duration-200"
              >
                Explorar catálogo
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Brand Values Section */}
        <section className="bg-bg-secondary py-16 border-b border-divider/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-0">
              <div className="flex flex-col items-center text-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface/50 text-primary mb-4">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-title">Hecho a Mano</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed max-w-xs">
                  Piezas exclusivas con acabados artesanales únicos. Ningún accesorio es idéntico a otro, lo que lo hace verdaderamente especial.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface/50 text-primary mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-title">Energía Intencional</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed max-w-xs">
                  Trabajamos con cristales 100% naturales, limpiados energéticamente y cargados con intenciones positivas de sanación y paz.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface/50 text-primary mb-4">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-title">Envíos a todo Colombia</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed max-w-xs">
                  Llevamos la energía de Almarte a la puerta de tu hogar de forma rápida y segura en cualquier lugar de Colombia.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="font-serif text-3xl font-bold text-title">Explora por Categorías</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Encuentra la pieza o ritual ideal alineado con tu momento presente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group relative flex flex-col overflow-hidden rounded-lg border border-divider/40 bg-white p-3 transition duration-300 hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-md bg-stone-100">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-4 pb-2 text-center">
                    <h3 className="font-serif text-base font-bold text-title group-hover:text-primary transition duration-150">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-1">
                      {category.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="bg-bg-secondary py-20 border-t border-b border-divider/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Nuestras Piezas Clave
              </span>
              <h2 className="mt-1 font-serif text-3xl font-bold text-title">Colecciones Destacadas</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Una curaduría de nuestros productos favoritos elegidos por la comunidad.
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
                href="/catalog"
                className="inline-flex items-center justify-center gap-x-2 rounded-md border border-primary text-primary px-8 py-3 text-sm font-semibold hover:bg-primary hover:text-white transition duration-200"
              >
                Ver catálogo completo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </>
  );
}
