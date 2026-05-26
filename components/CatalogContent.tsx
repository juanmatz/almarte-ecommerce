"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, Check, Search, RotateCcw } from "lucide-react";
import ProductCard from "./ProductCard";
import { Product } from "@/context/CartContext";

const CATEGORIES = [
  { name: "Todos los Productos", slug: "" },
  { name: "Accesorios & Joyería", slug: "accesorios" },
  { name: "Kits Energéticos", slug: "kits-energeticos" },
  { name: "Cuarzos y Minerales", slug: "cuarzos-y-minerales" },
  { name: "Aromas & Velas", slug: "aromas-y-velas" },
  { name: "Rituales y Bienestar", slug: "rituales-y-bienestar" },
];

const ACCESORIOS_SUBCATEGORIES = ["Manillas", "Collares", "Aretes", "Anillos"];

interface CatalogContentProps {
  searchParams?: { [key: string]: string | string[] | undefined };
  initialCategory?: string;
}

export default function CatalogContent({ searchParams = {}, initialCategory }: CatalogContentProps) {
  const router = useRouter();

  // Initial state derived from props (server values or fallback)
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Active filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || (typeof searchParams.category === "string" ? searchParams.category : "")
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    typeof searchParams.subcategory === "string" ? searchParams.subcategory : ""
  );
  const [minPrice, setMinPrice] = useState<number>(
    typeof searchParams.minPrice === "string" ? parseInt(searchParams.minPrice) || 0 : 0
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    typeof searchParams.maxPrice === "string" ? parseInt(searchParams.maxPrice) || 500000 : 500000
  );
  const [isAvailableOnly, setIsAvailableOnly] = useState<boolean>(
    searchParams.isAvailable === "true"
  );
  const [sortOrder, setSortOrder] = useState<string>(
    typeof searchParams.sort === "string" ? searchParams.sort : "newest"
  );
  const [searchVal, setSearchVal] = useState<string>(
    typeof searchParams.search === "string" ? searchParams.search : ""
  );

  // For immediate search input typing vs debounced actual search
  const [searchInput, setSearchInput] = useState<string>(searchVal);

  // Mobile filters panel state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchVal(searchInput);
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  // Sync category if initialCategory changes (e.g. dynamic category route transitions)
  useEffect(() => {
    if (initialCategory !== undefined) {
      setSelectedCategory(initialCategory);
      // Reset subcategory if we switch category, unless we are in accesorios
      if (initialCategory !== "accesorios") {
        setSelectedSubcategory("");
      }
    }
  }, [initialCategory]);

  // Reset subcategory if selectedCategory changes away from accesorios
  useEffect(() => {
    if (selectedCategory !== "accesorios") {
      setSelectedSubcategory("");
    }
  }, [selectedCategory]);

  // Sync url search parameters and fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (selectedCategory) queryParams.append("category", selectedCategory);
      if (selectedSubcategory) queryParams.append("subcategory", selectedSubcategory);
      if (minPrice > 0) queryParams.append("minPrice", minPrice.toString());
      if (maxPrice < 500000) queryParams.append("maxPrice", maxPrice.toString());
      if (isAvailableOnly) queryParams.append("isAvailable", "true");
      if (sortOrder) queryParams.append("sort", sortOrder);
      if (searchVal) queryParams.append("search", searchVal);

      // Update URL without triggering scroll or full server render
      const searchStr = queryParams.toString();
      const basePath = initialCategory ? `/catalogo/${initialCategory}` : "/catalogo";
      const newUrl = `${basePath}${searchStr ? `?${searchStr}` : ""}`;
      window.history.pushState(null, "", newUrl);

      // Fetch from API
      const res = await fetch(`/api/products?${searchStr}`);
      if (!res.ok) {
        throw new Error("Fallo al obtener catálogo");
      }
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching filtered products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedSubcategory, minPrice, maxPrice, isAvailableOnly, sortOrder, searchVal, initialCategory]);

  // Trigger fetch when filters modify
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Helper to clear all filters
  const handleResetFilters = () => {
    setSelectedCategory(initialCategory || "");
    setSelectedSubcategory("");
    setMinPrice(0);
    setMaxPrice(500000);
    setIsAvailableOnly(false);
    setSortOrder("newest");
    setSearchVal("");
    setSearchInput("");
  };

  const hasActiveFilters = 
    (!initialCategory && selectedCategory !== "") ||
    selectedSubcategory !== "" ||
    minPrice > 0 ||
    maxPrice < 500000 ||
    isAvailableOnly ||
    searchVal !== "";

  // Helper to format currency
  const formatCOP = (val: number) => {
    return `$${val.toLocaleString("es-CO")}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-divider/40 pb-6 mb-8 gap-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Nuestra Colección
          </span>
          <h1 className="font-serif text-3xl font-bold text-title mt-1">
            {initialCategory 
              ? CATEGORIES.find(c => c.slug === initialCategory)?.name 
              : "Catálogo Almarte"}
          </h1>
        </div>

        {/* Search input field */}
        <div className="relative max-w-md w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-bg-secondary rounded-lg border border-divider/60 text-foreground placeholder-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
          />
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-text-secondary/70" />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                setSearchVal("");
              }}
              className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-surface text-text-secondary transition"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-x-8 gap-y-6">
        
        {/* SIDEBAR FILTERS (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28 space-y-6 border border-divider/50 rounded-lg p-5 bg-bg-secondary shadow-xs">
            <div className="flex items-center justify-between border-b border-divider/40 pb-3">
              <span className="font-serif text-base font-bold text-title flex items-center gap-x-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Filtros
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-x-1 cursor-pointer transition"
                >
                  <RotateCcw className="h-3 w-3" />
                  Limpiar
                </button>
              )}
            </div>

            {/* Category Select (Only if we aren't inside a nested category page) */}
            {!initialCategory && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Categorías
                </h4>
                <div className="space-y-1.5 pl-0.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setSelectedSubcategory("");
                      }}
                      className={`w-full text-left py-1 text-xs transition flex items-center justify-between font-medium ${
                        selectedCategory === cat.slug
                          ? "text-primary font-bold"
                          : "text-text-primary hover:text-primary"
                      }`}
                    >
                      {cat.name}
                      {selectedCategory === cat.slug && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subcategories for Accesorios */}
            {selectedCategory === "accesorios" && (
              <div className="space-y-2 pt-2 border-t border-divider/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Tipo de Accesorio
                </h4>
                <div className="space-y-1.5 pl-0.5">
                  <button
                    onClick={() => setSelectedSubcategory("")}
                    className={`w-full text-left py-1 text-xs transition flex items-center justify-between font-medium ${
                      selectedSubcategory === ""
                        ? "text-primary font-bold"
                        : "text-text-primary hover:text-primary"
                    }`}
                  >
                    Ver Todo
                    {selectedSubcategory === "" && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </button>
                  {ACCESORIOS_SUBCATEGORIES.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`w-full text-left py-1 text-xs transition flex items-center justify-between font-medium ${
                        selectedSubcategory === sub
                          ? "text-primary font-bold"
                          : "text-text-primary hover:text-primary"
                      }`}
                    >
                      {sub}
                      {selectedSubcategory === sub && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Slider */}
            <div className="space-y-3 pt-4 border-t border-divider/30">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Precio Máximo
                </h4>
                <span className="text-xs font-bold text-primary">
                  {formatCOP(maxPrice)}
                </span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1.5 bg-surface rounded-lg appearance-none"
                />
                <div className="flex items-center justify-between gap-x-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-text-secondary block mb-0.5">Mínimo</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-center px-1 py-1 text-xs border border-divider rounded-md bg-bg-secondary text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-text-secondary block mb-0.5">Máximo</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.min(500000, parseInt(e.target.value) || 500000))}
                      className="w-full text-center px-1 py-1 text-xs border border-divider rounded-md bg-bg-secondary text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="pt-4 border-t border-divider/30 flex items-center gap-x-2.5">
              <input
                type="checkbox"
                id="isAvailableOnly"
                checked={isAvailableOnly}
                onChange={(e) => setIsAvailableOnly(e.target.checked)}
                className="h-4 w-4 rounded border-divider text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <label
                htmlFor="isAvailableOnly"
                className="text-xs font-semibold text-text-primary cursor-pointer select-none"
              >
                Mostrar solo disponibles
              </label>
            </div>
          </div>
        </aside>

        {/* MAIN PRODUCT GRID & BAR */}
        <div className="flex-1 space-y-6">
          
          {/* Controls Bar (Sort and Active Filters Chips) */}
          <div className="flex flex-wrap items-center justify-between gap-y-3 bg-bg-secondary border border-divider/55 rounded-lg p-3.5 shadow-xs">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-x-2 px-3 py-1.5 border border-divider rounded-md text-xs font-bold text-text-primary hover:bg-surface/30 transition cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filtros
            </button>

            {/* Product count indicator */}
            <p className="text-xs font-medium text-text-secondary">
              {isLoading ? (
                <span>Buscando productos...</span>
              ) : (
                <span>Mostrando <strong>{products.length}</strong> productos</span>
              )}
            </p>

            {/* Sort selector */}
            <div className="flex items-center gap-x-2">
              <label htmlFor="sortOrder" className="text-xs font-semibold text-text-secondary">
                Ordenar por:
              </label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="text-xs font-bold text-text-primary bg-transparent border border-divider/70 rounded-md py-1.5 pl-2 pr-6 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="newest">Más Nuevos</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          {/* Active Filters Chips Area */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-text-secondary">Filtros aplicados:</span>
              
              {/* Category chip */}
              {!initialCategory && selectedCategory && (
                <span className="inline-flex items-center gap-x-1.5 rounded-full bg-surface/50 border border-divider/70 px-2.5 py-0.5 text-xs text-title font-semibold">
                  Categoría: {CATEGORIES.find(c => c.slug === selectedCategory)?.name.replace(" & Joyería", "")}
                  <button onClick={() => setSelectedCategory("")} className="hover:bg-divider p-0.5 rounded-full transition">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Subcategory chip */}
              {selectedSubcategory && (
                <span className="inline-flex items-center gap-x-1.5 rounded-full bg-surface/50 border border-divider/70 px-2.5 py-0.5 text-xs text-title font-semibold">
                  Subcategoría: {selectedSubcategory}
                  <button onClick={() => setSelectedSubcategory("")} className="hover:bg-divider p-0.5 rounded-full transition">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Price range chip */}
              {(minPrice > 0 || maxPrice < 500000) && (
                <span className="inline-flex items-center gap-x-1.5 rounded-full bg-surface/50 border border-divider/70 px-2.5 py-0.5 text-xs text-title font-semibold">
                  Precio: {formatCOP(minPrice)} - {formatCOP(maxPrice)}
                  <button onClick={() => { setMinPrice(0); setMaxPrice(500000); }} className="hover:bg-divider p-0.5 rounded-full transition">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Availability chip */}
              {isAvailableOnly && (
                <span className="inline-flex items-center gap-x-1.5 rounded-full bg-surface/50 border border-divider/70 px-2.5 py-0.5 text-xs text-title font-semibold">
                  Solo Disponibles
                  <button onClick={() => setIsAvailableOnly(false)} className="hover:bg-divider p-0.5 rounded-full transition">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Search query chip */}
              {searchVal && (
                <span className="inline-flex items-center gap-x-1.5 rounded-full bg-surface/50 border border-divider/70 px-2.5 py-0.5 text-xs text-title font-semibold">
                  Búsqueda: &ldquo;{searchVal}&rdquo;
                  <button onClick={() => { setSearchInput(""); setSearchVal(""); }} className="hover:bg-divider p-0.5 rounded-full transition">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Limpiar todo button */}
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-primary hover:underline ml-1 cursor-pointer transition"
              >
                Limpiar todo
              </button>
            </div>
          )}

          {/* Skeletons loader or Product list */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-divider bg-bg-secondary p-3.5 space-y-4 animate-pulse"
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
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State Container */
            <div className="flex flex-col items-center justify-center text-center border border-divider/50 rounded-lg p-16 bg-bg-secondary space-y-5 shadow-xs">
              <div className="h-16 w-16 rounded-full bg-surface/50 text-title flex items-center justify-center border border-divider/40">
                <SlidersHorizontal className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-title">
                  No se encontraron productos
                </h3>
                <p className="text-xs text-text-secondary max-w-sm">
                  No hay artículos que coincidan con los filtros aplicados en este momento. Intenta modificando los criterios.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-x-2 rounded-md bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-98 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restaurar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTERS DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-foreground/60 backdrop-blur-xs animate-fade-in">
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-bg-secondary py-5 shadow-xl border-l border-divider overflow-y-auto">
            <div className="flex items-center justify-between px-5 border-b border-divider/40 pb-4">
              <h2 className="font-serif text-lg font-bold text-title flex items-center gap-x-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Filtros
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface text-text-primary transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-6 flex-1">
              {/* Category Select for mobile */}
              {!initialCategory && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Categorías
                  </h4>
                  <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          setSelectedSubcategory("");
                        }}
                        className={`w-full text-left py-2 px-3 rounded-md text-xs transition flex items-center justify-between font-semibold ${
                          selectedCategory === cat.slug
                            ? "bg-surface/50 text-primary font-bold"
                            : "text-text-primary hover:bg-surface/20"
                        }`}
                      >
                        {cat.name}
                        {selectedCategory === cat.slug && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subcategories for mobile */}
              {selectedCategory === "accesorios" && (
                <div className="space-y-3 pt-3 border-t border-divider/30">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Tipo de Accesorio
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedSubcategory("")}
                      className={`w-full text-left py-2 px-3 rounded-md text-xs transition flex items-center justify-between font-semibold ${
                        selectedSubcategory === ""
                          ? "bg-surface/50 text-primary font-bold"
                          : "text-text-primary hover:bg-surface/20"
                      }`}
                    >
                      Ver Todo
                      {selectedSubcategory === "" && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                    {ACCESORIOS_SUBCATEGORIES.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`w-full text-left py-2 px-3 rounded-md text-xs transition flex items-center justify-between font-semibold ${
                          selectedSubcategory === sub
                            ? "bg-surface/50 text-primary font-bold"
                            : "text-text-primary hover:bg-surface/20"
                        }`}
                      >
                        {sub}
                        {selectedSubcategory === sub && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Slider for mobile */}
              <div className="space-y-4 pt-4 border-t border-divider/30">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Precio Máximo
                  </h4>
                  <span className="text-xs font-bold text-primary">
                    {formatCOP(maxPrice)}
                  </span>
                </div>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-primary cursor-pointer h-1.5 bg-surface rounded-lg appearance-none"
                  />
                  <div className="flex items-center gap-x-2">
                    <div className="flex-1">
                      <label className="text-[9px] text-text-secondary block mb-0.5">Mínimo</label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-center py-1 text-xs border border-divider rounded-md bg-bg-secondary text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] text-text-secondary block mb-0.5">Máximo</label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Math.min(500000, parseInt(e.target.value) || 500000))}
                        className="w-full text-center py-1 text-xs border border-divider rounded-md bg-bg-secondary text-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability for mobile */}
              <div className="pt-4 border-t border-divider/30 flex items-center gap-x-2.5">
                <input
                  type="checkbox"
                  id="isAvailableOnlyMobile"
                  checked={isAvailableOnly}
                  onChange={(e) => setIsAvailableOnly(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-divider text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <label
                  htmlFor="isAvailableOnlyMobile"
                  className="text-xs font-semibold text-text-primary cursor-pointer select-none"
                >
                  Mostrar solo disponibles
                </label>
              </div>
            </div>

            {/* Footer controls inside drawer */}
            <div className="p-5 border-t border-divider/40 space-y-2 bg-surface/10">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-2.5 rounded-md bg-primary text-xs font-bold text-white shadow-xs hover:bg-primary-hover active:scale-98 transition cursor-pointer text-center"
              >
                Aplicar Filtros
              </button>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2.5 rounded-md border border-divider hover:bg-surface/20 text-xs font-bold text-text-primary transition cursor-pointer flex items-center justify-center gap-x-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-primary" />
                  Restablecer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
