import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import CatalogContent from "@/components/CatalogContent";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const VALID_CATEGORIES = [
  "accesorios",
  "kits-energeticos",
  "cuarzos-y-minerales",
  "aromas-y-velas",
  "rituales-y-bienestar",
];

const CATEGORY_TITLES: { [key: string]: string } = {
  "accesorios": "Accesorios y Joyería Artesanal | Almarte",
  "kits-energeticos": "Kits Energéticos Intencionados | Almarte",
  "cuarzos-y-minerales": "Cuarzos y Minerales Naturales | Almarte",
  "aromas-y-velas": "Aromas y Velas de Soya | Almarte",
  "rituales-y-bienestar": "Rituales y Bienestar | Almarte",
};

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await props.params;
  
  if (!VALID_CATEGORIES.includes(categoria)) {
    return {
      title: "Categoría no encontrada | Almarte",
    };
  }

  const categoryLabel = categoria.replace("-", " ");
  return {
    title: CATEGORY_TITLES[categoria],
    description: `Explora nuestra colección curada de ${categoryLabel} en Almarte Artesanos. Piezas hechas a mano con intenciones y cristales de alta vibración.`,
  };
}

export default async function CategoryCatalogPage(props: {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { categoria } = await props.params;
  const resolvedSearchParams = await props.searchParams;

  // Validate route parameter
  if (!VALID_CATEGORIES.includes(categoria)) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-background">
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogContent 
            searchParams={resolvedSearchParams} 
            initialCategory={categoria} 
          />
        </Suspense>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse font-sans">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-divider/40 pb-6 mb-8 gap-y-4">
        <div className="space-y-2">
          <div className="h-3 bg-surface/60 rounded-md w-24" />
          <div className="h-8 bg-surface rounded-md w-48" />
        </div>
        <div className="h-10 bg-surface rounded-lg w-full md:w-80" />
      </div>

      <div className="flex flex-col lg:flex-row gap-x-8 gap-y-6">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block w-64 shrink-0 h-96 bg-bg-secondary border border-divider/40 rounded-lg p-5" />

        {/* Grid skeleton */}
        <div className="flex-1 space-y-6">
          <div className="h-14 bg-bg-secondary border border-divider/40 rounded-lg" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-divider bg-bg-secondary p-3.5 space-y-4"
              >
                <div className="aspect-square w-full bg-surface/40 rounded-md" />
                <div className="space-y-2">
                  <div className="h-3 bg-surface/60 rounded-md w-1/3" />
                  <div className="h-4 bg-surface w-3/4 rounded-md" />
                  <div className="h-3.5 bg-surface/40 rounded-md w-1/4" />
                </div>
                <div className="pt-3 border-t border-divider/30 flex items-center justify-between">
                  <div className="h-5 bg-surface w-1/3 rounded-md" />
                  <div className="h-8 w-8 rounded-full bg-surface" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
