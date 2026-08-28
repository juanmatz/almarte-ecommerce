"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Loader2, Sparkles, UploadCloud, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  is_available: boolean;
  image_url: string;
  image_urls?: string[];
  category: string;
  subcategory?: string;
  rating?: number;
  reviewCount?: number;
}

const CATEGORIES = [
  { name: "Accesorios", slug: "accesorios", subcategories: ["Manillas", "Collares", "Aretes", "Anillos"] },
  { name: "Kits Energéticos", slug: "kits-energeticos", subcategories: [] },
  { name: "Cuarzos y Minerales", slug: "cuarzos-y-minerales", subcategories: [] },
  { name: "Aromas & Velas", slug: "aromas-y-velas", subcategories: [] },
  { name: "Rituales y Bienestar", slug: "rituales-y-bienestar", subcategories: [] },
];

export default function AdminProductosPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form fields
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDiscountPrice, setFormDiscountPrice] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formImageUrls, setFormImageUrls] = useState<string[]>([]);
  const [formCategory, setFormCategory] = useState("accesorios");
  const [formSubcategory, setFormSubcategory] = useState("");
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimes.includes(file.type)) {
      showNotification("Formato no permitido. Solo se aceptan imágenes JPG, PNG y WEBP.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification("La imagen excede el límite máximo de 5MB.", "error");
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productName", formName || "producto");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Fallo la subida de la imagen.");
      }

      if (!formImageUrl) {
        setFormImageUrl(data.url);
      } else {
        setFormImageUrls((current) => [...current, data.url]);
      }
      showNotification("Imagen subida exitosamente a Cloudinary.", "success");
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || "Error al subir la imagen", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("No se pudo cargar la lista de productos.");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al obtener productos");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 8000);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormDiscountPrice("");
    setFormImageUrl("https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop");
    setFormImageUrls([]);
    setFormCategory("accesorios");
    setFormSubcategory("Collares");
    setFormIsAvailable(true);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDescription(product.description || "");
    setFormPrice(product.price.toString());
    setFormDiscountPrice(product.discount_price ? product.discount_price.toString() : "");
    setFormImageUrl(product.image_url);
    setFormImageUrls((product.image_urls || []).slice(1));
    setFormCategory(product.category);
    setFormSubcategory(product.subcategory || "");
    setFormIsAvailable(product.is_available);
    setIsModalOpen(true);
  };

  const handleToggleAvailable = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: !product.is_available }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "No se pudo actualizar la disponibilidad.");
      }

      setProducts(products.map(p => p.id === product.id ? { ...p, is_available: !p.is_available } : p));
      showNotification(`Disponibilidad de "${product.name}" modificada.`, "success");
    } catch (err: any) {
      console.error(err);
      showNotification(err.message, "error");
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar el producto.");
      }

      // If it returns a soft delete warning
      if (data.product) {
        setProducts(products.map(p => p.id === product.id ? { ...p, is_available: false } : p));
        showNotification(data.message, "info");
      } else {
        setProducts(products.filter(p => p.id !== product.id));
        showNotification("Producto eliminado permanentemente de la base de datos.", "success");
      }
    } catch (err: any) {
      console.error(err);
      showNotification(err.message, "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const priceNum = parseFloat(formPrice);
    const discountPriceNum = formDiscountPrice ? parseFloat(formDiscountPrice) : undefined;

    if (isNaN(priceNum) || priceNum <= 0) {
      showNotification("El precio debe ser un número positivo.", "error");
      setSubmitting(false);
      return;
    }

    if (discountPriceNum !== undefined && (isNaN(discountPriceNum) || discountPriceNum >= priceNum || discountPriceNum < 0)) {
      showNotification("El precio de descuento debe ser menor al precio regular.", "error");
      setSubmitting(false);
      return;
    }

    const currentCategory = CATEGORIES.find(c => c.slug === formCategory);
    const selectedSubcategory = (currentCategory && currentCategory.subcategories.length > 0) 
      ? formSubcategory 
      : "";

    const payload = {
      name: formName,
      description: formDescription,
      price: priceNum,
      discountPrice: discountPriceNum || null,
      imageUrl: formImageUrl,
      imageUrls: formImageUrls,
      category: formCategory,
      subcategory: selectedSubcategory || null,
      isAvailable: formIsAvailable,
    };

    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar el producto.");
      }

      showNotification(data.message, "success");
      setIsModalOpen(false);
      fetchProducts(); // Refresh list
    } catch (err: any) {
      console.error(err);
      showNotification(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCOP = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const selectedCategoryObj = CATEGORIES.find(c => c.slug === formCategory);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-title">Gestión de Catálogo</h2>
          <p className="text-xs text-text-secondary mt-1">
            Administra los productos de Almarte Artesanos, actualiza precios, descuentos e inventario.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-x-2 rounded-md bg-primary hover:bg-primary-hover px-5 py-3 text-xs font-semibold text-white shadow-xs transition duration-200 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-md border text-xs font-medium flex items-start justify-between gap-2 shadow-xs transition duration-300 ${
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : notification.type === "info" 
            ? "bg-sky-50 border-sky-200 text-sky-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-text-secondary hover:text-text-primary">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Products Table Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-bg-secondary border border-divider/60 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-text-secondary mt-4 font-medium">Cargando catálogo...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-lg text-center max-w-xl mx-auto my-6">
          <p className="font-serif text-lg font-bold">Error de catálogo</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      ) : (
        <div className="bg-bg-secondary rounded-lg border border-divider/60 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-divider/40">
              <thead className="bg-surface/30">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary w-16">
                    Imagen
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Nombre / Colección
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Categoría
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Precio Regular
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Descuento
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-secondary text-center w-24">
                    Disponible
                  </th>
                  <th scope="col" className="relative px-6 py-3.5 text-right w-28">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-bg-secondary divide-y divide-divider/30 text-xs">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                      No se han encontrado productos creados. Haz clic en "Nuevo Producto" para agregar el primero.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-surface/10 transition duration-150">
                      <td className="px-6 py-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-stone-100 border border-divider">
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover object-center"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-serif font-bold text-title text-sm">{product.name}</div>
                        {product.subcategory && (
                          <div className="text-[10px] text-text-secondary font-medium uppercase mt-0.5 tracking-wider">
                            {product.subcategory}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-text-primary capitalize">
                        {product.category.replace("-", " ")}
                      </td>
                      <td className="px-6 py-3 font-semibold text-text-primary">
                        {formatCOP(product.price)}
                      </td>
                      <td className="px-6 py-3">
                        {product.discount_price ? (
                          <span className="font-semibold text-primary">
                            {formatCOP(product.discount_price)}
                          </span>
                        ) : (
                          <span className="text-text-secondary/50 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailable(product)}
                          className={`inline-flex p-1.5 rounded-full border transition cursor-pointer ${
                            product.is_available 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                              : "bg-stone-50 border-stone-200 text-stone-400 hover:bg-stone-100"
                          }`}
                        >
                          {product.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1.5 rounded-md text-text-primary hover:bg-surface/50 hover:text-title transition cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-bg-secondary w-full max-w-2xl rounded-lg border border-divider shadow-2xl overflow-hidden my-8 animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-divider/60 flex items-center justify-between bg-title/5">
              <div>
                <h3 className="font-serif text-lg font-bold text-title flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </h3>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {editingProduct ? "Modifica los campos del catálogo" : "Crea una nueva pieza de artesanía en la tienda"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-text-secondary hover:text-text-primary transition cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary/95">
                      Nombre de la Pieza
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Collar Cuarzo Ahumado Intuitivo"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                  </div>

                  {/* Category select */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary/95">
                      Categoría Principal
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        setFormCategory(e.target.value);
                        // Default first subcategory if accessories
                        if (e.target.value === "accesorios") {
                          setFormSubcategory("Manillas");
                        } else {
                          setFormSubcategory("");
                        }
                      }}
                      className="w-full rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory select */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary/95">
                      Subcategoría
                    </label>
                    {selectedCategoryObj && selectedCategoryObj.subcategories.length > 0 ? (
                      <select
                        value={formSubcategory}
                        onChange={(e) => setFormSubcategory(e.target.value)}
                        className="w-full rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition animate-fade-in"
                      >
                        {selectedCategoryObj.subcategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled
                        value="No aplica para esta categoría"
                        className="w-full rounded-md border border-divider bg-surface/50 py-2 px-3 text-xs text-text-secondary/70 cursor-not-allowed"
                      />
                    )}
                  </div>

                  {/* Price field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary/95">
                      Precio Regular (COP)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Ej. 85000"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                  </div>

                  {/* Discount Price field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary/95">
                      Precio de Descuento (Opcional)
                    </label>
                    <input
                      type="number"
                      placeholder="Ej. 68000 (Dejar en blanco si no tiene)"
                      value={formDiscountPrice}
                      onChange={(e) => setFormDiscountPrice(e.target.value)}
                      className="w-full rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                  </div>

                  {/* Image Upload Drag & Drop Zone */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary/95">
                      Fotografía del Producto (Cloudinary)
                    </label>

                    {formImageUrl ? (
                      /* Preview with Option to Remove / Replace */
                      <div className="relative rounded-lg border border-divider overflow-hidden bg-surface/30 p-3">
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {[formImageUrl, ...formImageUrls].map((url, index) => (
                            <div key={`${url}-${index}`} className="relative aspect-square rounded-md overflow-hidden bg-stone-100 border border-divider group">
                              <Image src={url} alt={`${formName || "Producto"} - foto ${index + 1}`} fill sizes="100px" className="object-cover object-center" />
                              <button
                                type="button"
                                aria-label={`Quitar foto ${index + 1}`}
                                onClick={() => {
                                  if (index === 0) {
                                    setFormImageUrl(formImageUrls[0] || "");
                                    setFormImageUrls((current) => current.slice(1));
                                  } else {
                                    setFormImageUrls((current) => current.filter((_, imageIndex) => imageIndex !== index - 1));
                                  }
                                }}
                                className="absolute top-1 right-1 rounded-full bg-stone-900/75 p-1 text-white opacity-0 group-hover:opacity-100 transition"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              {index === 0 && <span className="absolute bottom-0 inset-x-0 bg-stone-900/70 px-1 py-0.5 text-center text-[8px] font-bold uppercase text-white">Portada</span>}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={formImageUrls.length >= 5} className="text-[11px] font-bold text-primary hover:underline cursor-pointer disabled:text-text-secondary disabled:no-underline">
                            Añadir otra foto
                          </button>
                          <span className="text-[10px] text-text-secondary">{1 + formImageUrls.length}/6 fotos</span>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop Upload Zone */
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                          isDragging
                            ? "border-primary bg-primary/5 scale-[0.99]"
                            : "border-divider/80 hover:border-primary/50 hover:bg-surface/30"
                        }`}
                      >
                        {uploadingImage ? (
                          <div className="flex flex-col items-center gap-2 py-2">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-xs font-semibold text-title">Subiendo imagen a Cloudinary...</p>
                            <p className="text-[10px] text-text-secondary">Por favor espera un instante</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                              <UploadCloud className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-title">
                                Arrastra y suelta tu foto aquí, o <span className="text-primary hover:underline">haz clic para examinar</span>
                              </p>
                              <p className="text-[10px] text-text-secondary mt-1">
                                Formatos soportados: JPG, PNG, WEBP (Máx. 5MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).slice(0, 6 - (formImageUrl ? 1 + formImageUrls.length : formImageUrls.length)).reduce(
                            (chain, file) => chain.then(() => handleFileUpload(file)),
                            Promise.resolve()
                          );
                        }
                        e.target.value = "";
                      }}
                    />

                    {/* Fallback Manual URL Input */}
                    <div className="pt-1">
                      <details className="text-[11px] text-text-secondary cursor-pointer">
                        <summary className="hover:text-text-primary transition font-medium">
                          O bien ingresar URL manualmente
                        </summary>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          className="mt-2 w-full rounded-md border border-divider bg-white py-1.5 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                        />
                      </details>
                    </div>
                  </div>

                  {/* Description field */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary/95">
                      Descripción del Producto
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detalles sobre el material, propiedades energéticas, etc."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full rounded-md border border-divider bg-white py-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                  </div>

                  {/* Availability toggle */}
                  <div className="flex items-center gap-3 sm:col-span-2 pt-2">
                    <input
                      type="checkbox"
                      id="formIsAvailable"
                      checked={formIsAvailable}
                      onChange={(e) => setFormIsAvailable(e.target.checked)}
                      className="h-4 w-4 rounded-sm border-divider text-primary focus:ring-primary cursor-pointer"
                    />
                    <label
                      htmlFor="formIsAvailable"
                      className="text-xs font-semibold uppercase tracking-wider text-text-primary/90 cursor-pointer"
                    >
                      Disponible inmediatamente para la venta
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-divider/60 flex items-center justify-end gap-3 bg-bg-secondary">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-divider px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface/40 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition duration-200 flex items-center gap-2 cursor-pointer disabled:bg-divider disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      {editingProduct ? "Actualizar Producto" : "Crear Producto"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
