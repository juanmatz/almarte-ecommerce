"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronRight, Star, Heart, Share2, Sparkles, Shield, RefreshCw, Trash2 } from "lucide-react";
import { useCart, Product } from "@/context/CartContext";
import PriceDisplay from "./PriceDisplay";
import StarRating from "./StarRating";
import AvailabilityBadge from "./AvailabilityBadge";

interface Review {
  id: number;
  userId: number | null;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string;
}

interface ProductWithReviews extends Product {
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

interface ProductDetailsProps {
  product: ProductWithReviews;
}

export default function ProductDetails({ product: initialProduct }: ProductDetailsProps) {
  const { addToCart } = useCart();
  
  // Client state to support real-time review additions
  const [product, setProduct] = useState<ProductWithReviews>(initialProduct);
  const [activeImage, setActiveImage] = useState(initialProduct.image_url);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "energy" | "care">("description");
  
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Review Form State
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isDeletingMap, setIsDeletingMap] = useState<Record<number, boolean>>({});

  // Load auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("almarte_token");
    const storedUser = localStorage.getItem("almarte_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const handleAddToCart = () => {
    if (product.is_available) {
      addToCart(product, quantity);
    }
  };

  // Submit new review to API
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess(false);
    setIsSubmittingReview(true);

    try {
      const activeToken = token || localStorage.getItem("almarte_token");
      if (!activeToken) {
        setReviewError("Debes iniciar sesión para dejar una valoración. Por favor ve a la página de Cuenta.");
        setIsSubmittingReview(false);
        return;
      }

      const res = await fetch(`/api/products/${product.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          rating: ratingInput,
          comment: commentInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar la reseña");
      }

      // Add new review to list
      const updatedReviews = [data, ...product.reviews];
      const newReviewCount = updatedReviews.length;
      const newRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / newReviewCount;

      setProduct({
        ...product,
        reviews: updatedReviews,
        reviewCount: newReviewCount,
        rating: parseFloat(newRating.toFixed(1)),
      });

      setCommentInput("");
      setRatingInput(5);
      setReviewSuccess(true);
    } catch (err: any) {
      setReviewError(err.message || "Ocurrió un error inesperado al enviar tu valoración.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta valoración?")) return;
    
    setReviewError("");
    setReviewSuccess(false);
    setIsDeletingMap(prev => ({ ...prev, [reviewId]: true }));

    try {
      const activeToken = token || localStorage.getItem("almarte_token");
      if (!activeToken) {
        throw new Error("Debes iniciar sesión para realizar esta acción.");
      }

      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${activeToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar la reseña");
      }

      // Update state: filter out the deleted review and recalculate average
      const updatedReviews = product.reviews.filter((r) => r.id !== reviewId);
      const newReviewCount = updatedReviews.length;
      // Default to 4.8 if no reviews remaining, same as default mock layout
      const newRating = newReviewCount > 0
        ? updatedReviews.reduce((acc, r) => acc + r.rating, 0) / newReviewCount
        : 4.8;

      setProduct({
        ...product,
        reviews: updatedReviews,
        reviewCount: newReviewCount,
        rating: parseFloat(newRating.toFixed(1)),
      });
      
    } catch (err: any) {
      setReviewError(err.message || "Ocurrió un error inesperado al eliminar la valoración.");
    } finally {
      setIsDeletingMap(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  // Helper categories for tabs
  const getCategoryDetails = () => {
    switch (product.category) {
      case "accesorios":
        return {
          energy: "Esta pieza de joyería artesanal ha sido limpiada con humo de salvia blanca y sahumado sagrado antes de ser empacada. El metal y los minerales naturales actúan como catalizadores de tu propia energía interior. Llévala como un recordatorio constante de tu intención.",
          care: "Para mantener el brillo de la plata de ley 925 y la vitalidad de los cristales, evita el contacto directo con perfumes, lociones o agua salada/clorada. Límpiala suavemente con un paño de microfibra seco. Puedes recargar los cristales dejándola sobre una drusa de cuarzo o bajo la luz de la luna llena.",
        };
      case "kits-energeticos":
        return {
          energy: "Nuestros kits combinan cristales seleccionados en una sinergia energética vibracional. Cada cuarzo resuena en una frecuencia específica diseñada para desbloquear, equilibrar y nutrir tus chakras o intenciones del hogar.",
          care: "Limpia tus cristales periódicamente pasándolos por el humo de un sahumerio de palo santo o salvia. Evita mojar piedras porosas como la selenita o malaquita. Recárgalos colocándolos en la tierra de tus plantas bajo la luz solar directa durante una mañana.",
        };
      case "cuarzos-y-minerales":
        return {
          energy: "Cuarzo natural en bruto o pulido de alta vibración. Los cuarzos actúan amplificando la energía, purificando la mente y desbloqueando canales estancados en los espacios donde se ubican.",
          care: "Límpialos sumergiéndolos en agua con sal marina (solo cristales duros como amatista, citrino o cuarzo transparente) durante 15 minutos. Enjuaga con agua fresca y sécalos al sol. No limpies selenita ni calcitas con agua.",
        };
      case "aromas-y-velas":
        return {
          energy: "Velas de soya vaciadas a mano e intencionadas con aceites esenciales botánicos puros y cristales reales. Al encender la llama, la cera libera el aroma terapéutico mientras el cuarzo potencia la energía de paz o abundancia en tu espacio.",
          care: "En el primer encendido, deja que la cera se derrita hasta los bordes del vaso para evitar la formación de túneles. Corta el pabilo a 0.5 cm antes de cada uso para una llama limpia. Una vez terminada la vela, puedes retirar los cristales, lavarlos con agua tibia y conservarlos contigo.",
        };
      default:
        return {
          energy: "Pieza hecha a mano creada de forma consciente y con respeto a los ciclos de la tierra. Aporta armonía y vibraciones positivas al cuerpo y el alma.",
          care: "Conserva tu artículo en un lugar seco y fresco, protegido del polvo y la luz solar directa prolongada para mantener sus colores naturales y aromas intactos.",
        };
    }
  };

  const categoryDetails = getCategoryDetails();

  // Price formatting helper
  const formatCOP = (val: number) => {
    return `$${val.toLocaleString("es-CO")}`;
  };

  // Review star distributions for rating visualization
  const starDistributions = [5, 4, 3, 2, 1].map((stars) => {
    const count = product.reviews.filter((r) => r.rating === stars).length;
    const percentage = product.reviewCount > 0 ? (count / product.reviewCount) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-x-2 text-xs font-semibold text-text-secondary/85 mb-8">
        <Link href="/" className="hover:text-primary transition">Inicio</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/catalogo" className="hover:text-primary transition">Catálogo</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/catalogo/${product.category}`} className="hover:text-primary transition capitalize">
          {product.category.replace("-", " ")}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-text-primary line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 mb-16">
        
        {/* LEFT COLUMN: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-divider bg-bg-secondary shadow-xs group">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
            />
            
            {/* Absolute overlay elements */}
            <div className="absolute top-4 left-4 z-10">
              <AvailabilityBadge
                isAvailable={product.is_available}
                price={product.price}
                discountPrice={product.discount_price}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {(product.image_urls || [product.image_url]).map((imageUrl, index) => (
              <button
                type="button"
                key={`${imageUrl}-${index}`}
                onClick={() => setActiveImage(imageUrl)}
                aria-label={`Ver foto ${index + 1}`}
                className={`relative aspect-square overflow-hidden rounded-lg border bg-bg-secondary cursor-pointer transition ${activeImage === imageUrl ? "border-primary ring-1 ring-primary" : "border-divider/60 opacity-70 hover:opacity-100"}`}
              >
                <Image
                  src={imageUrl}
                  alt={`${product.name} - Foto ${index + 1}`}
                  fill
                  sizes="100px"
                  className="object-cover object-center"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Info & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category / Subcategory Badge */}
            {product.subcategory && (
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-[0.12em] bg-surface/50 border border-divider px-2.5 py-0.5 rounded-full text-primary">
                {product.subcategory}
              </span>
            )}

            {/* Product Title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-title leading-tight">
              {product.name}
            </h1>

            {/* Review Summary */}
            <div className="flex items-center gap-x-2.5">
              <StarRating rating={product.rating} size={16} />
              <span className="text-xs font-bold text-text-primary">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-divider">·</span>
              <a
                href="#opiniones"
                className="text-xs font-semibold text-text-secondary hover:text-primary transition underline cursor-pointer"
              >
                {product.reviewCount} valoraciones
              </a>
            </div>

            {/* Price & Offer Display */}
            <div className="py-2.5 border-t border-b border-divider/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block mb-0.5">Precio</span>
                <PriceDisplay
                  price={product.price}
                  discountPrice={product.discount_price}
                  className="text-2xl"
                />
              </div>
              
              {product.discount_price && (
                <div className="text-right">
                  <span className="inline-block text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded-md">
                    ¡Ahorras {formatCOP(product.price - product.discount_price)} COP!
                  </span>
                </div>
              )}
            </div>

            {/* Product Description */}
            <p className="text-sm text-foreground/95 leading-relaxed font-sans pt-2">
              {product.description || "Esta hermosa pieza artesanal ha sido diseñada exclusivamente con intenciones de bienestar. Cada mineral natural es seleccionado y engastado a mano para que resuene de manera única en tu día a día."}
            </p>
          </div>

          {/* Action Area */}
          <div className="space-y-4 pt-4">
            
            {/* Quantity and Cart button */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              
              {/* Quantity Selector */}
              <div className="flex items-center border border-divider/70 rounded-lg overflow-hidden bg-bg-secondary w-full sm:w-32 justify-between">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={!product.is_available}
                  className="px-3.5 py-2.5 text-text-primary hover:bg-surface/50 active:bg-surface transition disabled:opacity-40 font-bold"
                >
                  -
                </button>
                <span className="text-sm font-bold text-title">{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={!product.is_available}
                  className="px-3.5 py-2.5 text-text-primary hover:bg-surface/50 active:bg-surface transition disabled:opacity-40 font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.is_available}
                className={`flex-1 flex items-center justify-center gap-x-2 rounded-lg py-3 px-8 text-sm font-bold shadow-md transition duration-200 ${
                  product.is_available
                    ? "bg-primary text-white hover:bg-primary-hover active:scale-98 cursor-pointer"
                    : "bg-divider text-text-secondary cursor-not-allowed"
                }`}
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                {product.is_available ? "Agregar al Carrito" : "Agotado Temporalmente"}
              </button>

              {/* Wishlist Button (Aesthetic) */}
              <button
                type="button"
                className="p-3 border border-divider rounded-lg text-text-primary hover:bg-surface/30 transition duration-150"
                aria-label="Agregar a favoritos"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 border-t border-divider/40">
              <div className="flex items-start gap-x-2 p-2.5 bg-bg-secondary border border-divider/40 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-title">Hecho a Mano</h4>
                  <p className="text-[9px] text-text-secondary mt-0.5 leading-tight">Pieza exclusiva por artesanos.</p>
                </div>
              </div>
              <div className="flex items-start gap-x-2 p-2.5 bg-bg-secondary border border-divider/40 rounded-lg">
                <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-title">Compra Segura</h4>
                  <p className="text-[9px] text-text-secondary mt-0.5 leading-tight">Respaldo y pasarela segura.</p>
                </div>
              </div>
              <div className="flex items-start gap-x-2 p-2.5 bg-bg-secondary border border-divider/40 rounded-lg">
                <RefreshCw className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-title">Garantía Real</h4>
                  <p className="text-[9px] text-text-secondary mt-0.5 leading-tight">Soporte total en tu pedido.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* TABS SECTION */}
      <div className="border border-divider/50 rounded-xl bg-bg-secondary p-6 sm:p-8 mb-16 shadow-xs">
        
        {/* Tab Headers */}
        <div className="flex border-b border-divider/40 pb-px gap-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3.5 text-xs font-bold uppercase tracking-wider transition border-b-2 shrink-0 ${
              activeTab === "description"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-title"
            }`}
          >
            Detalles Artesanales
          </button>
          <button
            onClick={() => setActiveTab("energy")}
            className={`pb-3.5 text-xs font-bold uppercase tracking-wider transition border-b-2 shrink-0 ${
              activeTab === "energy"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-title"
            }`}
          >
            Energía e Intención
          </button>
          <button
            onClick={() => setActiveTab("care")}
            className={`pb-3.5 text-xs font-bold uppercase tracking-wider transition border-b-2 shrink-0 ${
              activeTab === "care"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-title"
            }`}
          >
            Cuidado y Limpieza
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-6 text-sm text-foreground/95 leading-relaxed font-sans min-h-32">
          {activeTab === "description" && (
            <div className="space-y-4">
              <p>
                Cada una de nuestras creaciones en <strong>Almarte Artesanos</strong> es elaborada individualmente por artesanos locales en Colombia. Dado que empleamos cristales genuinos de la tierra y acabados hechos a mano, cada pieza posee ligeras variaciones de forma, tonalidad e inclusiones internas que la convierten en una joya única e irrepetible.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs font-medium text-text-primary">
                <li><strong>Origen:</strong> Handcrafted en Colombia.</li>
                <li><strong>Materiales:</strong> Cristales naturales de grado premium y materiales ecológicos.</li>
                <li><strong>Dimensiones promedio:</strong> Ajustable o de tamaño estándar para comodidad.</li>
                <li><strong>Empaque:</strong> Se entrega en bolsa de lino orgánico y caja rígida protectora Almarte.</li>
              </ul>
            </div>
          )}

          {activeTab === "energy" && (
            <p>{categoryDetails.energy}</p>
          )}

          {activeTab === "care" && (
            <p>{categoryDetails.care}</p>
          )}
        </div>

      </div>

      {/* REVIEWS SECTION */}
      <div id="opiniones" className="border-t border-divider/40 pt-12">
        <h2 className="font-serif text-2xl font-bold text-title mb-8">
          Opiniones de la Comunidad
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
          
          {/* Rating Summary Card */}
          <div className="bg-bg-secondary border border-divider/50 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-xs">
            <span className="text-5xl font-extrabold text-title font-serif">
              {product.rating.toFixed(1)}
            </span>
            <div className="mt-2.5">
              <StarRating rating={product.rating} size={20} />
            </div>
            <span className="text-xs font-bold text-text-secondary mt-2">
              Basado en {product.reviewCount} opiniones
            </span>

            {/* Bar distribution breakdown */}
            <div className="w-full mt-6 space-y-2">
              {starDistributions.map((row) => (
                <div key={row.stars} className="flex items-center text-xs font-semibold gap-x-2">
                  <span className="w-3 text-text-secondary">{row.stars}</span>
                  <Star className="h-3 w-3 text-primary fill-primary shrink-0" />
                  <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-text-secondary font-medium">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Submission Form */}
          <div className="lg:col-span-2 border border-divider/50 rounded-xl p-6 sm:p-8 bg-bg-secondary shadow-xs">
            <h3 className="font-serif text-lg font-bold text-title mb-1">
              Dejar una valoración
            </h3>
            <p className="text-xs text-text-secondary mb-6">
              Tu correo no será publicado. Los campos obligatorios están marcados con *
            </p>

            {reviewSuccess && (
              <div className="mb-6 p-4 bg-primary-hover/20 border border-primary/30 rounded-lg text-xs font-bold text-[#A8582C]">
                ✓ Tu valoración ha sido enviada e integrada exitosamente. ¡Muchas gracias por tu opinión!
              </div>
            )}

            {reviewError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700">
                ⚠ Error: {reviewError}
              </div>
            )}

            {token ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                
                {/* Rating Input selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-primary block">
                    Tu Calificación *
                  </label>
                  <div className="flex items-center gap-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingInput(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 hover:scale-110 active:scale-95 transition"
                        aria-label={`Calificar con ${star} estrellas`}
                      >
                        <Star
                          size={24}
                          className={`transition ${
                            star <= (hoverRating ?? ratingInput)
                              ? "fill-primary text-primary"
                              : "text-divider"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment textarea */}
                <div className="space-y-1.5">
                  <label htmlFor="commentInput" className="text-xs font-bold text-text-primary block">
                    Tu Comentario *
                  </label>
                  <textarea
                    id="commentInput"
                    required
                    rows={4}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Escribe tu opinión sobre el producto, los detalles de su artesanía o los efectos del cristal..."
                    className="w-full px-4 py-2.5 text-xs bg-bg-secondary rounded-lg border border-divider/70 text-foreground placeholder-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="inline-flex items-center gap-x-2 rounded-lg bg-primary hover:bg-primary-hover px-6 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingReview ? "Enviando..." : "Publicar Comentario"}
                  </button>
                </div>

              </form>
            ) : (
              /* Auth Prompt Empty State */
              <div className="text-center py-8 space-y-4 border border-dashed border-divider rounded-lg">
                <p className="text-xs font-semibold text-text-secondary max-w-sm mx-auto">
                  Necesitas haber iniciado sesión con tu cuenta de Almarte para poder dejar valoraciones sobre los productos.
                </p>
                <div>
                  <Link
                    href="/cuenta"
                    className="inline-flex items-center gap-x-2 rounded-md border border-primary px-5 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white transition duration-150"
                  >
                    Ir a Mi Cuenta
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Chronological Reviews List */}
        <div className="space-y-6">
          {product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-bg-secondary border border-divider/40 rounded-xl p-5 sm:p-6 space-y-3.5 shadow-xs font-sans transition hover:shadow-sm"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-x-3">
                    {/* User profile picture placeholder initials */}
                    <div className="h-8 w-8 rounded-full bg-surface text-primary flex items-center justify-center text-xs font-bold border border-divider/40">
                      {review.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-title">{review.userName}</h4>
                      <div className="mt-0.5">
                        <StarRating rating={review.rating} size={12} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Review Date & Action */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-text-secondary">
                      {new Date(review.createdAt).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    {currentUser && (currentUser.id === review.userId || currentUser.role === "admin") && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={isDeletingMap[review.id]}
                        className="text-rose-600 hover:text-rose-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition select-none ml-2 border border-rose-200/40 rounded px-1.5 py-0.5 bg-rose-50/20 hover:bg-rose-50 disabled:opacity-40"
                        title="Eliminar valoración"
                      >
                        <Trash2 className="h-3 w-3" />
                        {isDeletingMap[review.id] ? "Eliminando..." : "Eliminar"}
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed pl-11">
                  {review.comment || "El cliente no dejó un comentario escrito."}
                </p>
              </div>
            ))
          ) : (
            /* Empty reviews notice */
            <div className="text-center py-12 border border-divider/40 rounded-xl bg-bg-secondary">
              <p className="text-xs text-text-secondary font-medium">
                Aún no hay opiniones sobre este producto. ¡Sé el primero en compartir tu opinión!
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
