import { Product } from "@/context/CartContext";

export interface MockProduct extends Product {
  rating: number;
  reviewCount: number;
}

export const mockProducts: MockProduct[] = [
  {
    id: 1,
    name: "Collar Amatista del Alma",
    description: "Collar hecho a mano con piedra amatista natural pulida, ideal para la transmutación energética y la meditación profunda. Cadena de plata de ley 925.",
    price: 85000,
    discount_price: 68000,
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
    category: "accesorios",
    subcategory: "Collares",
    rating: 4.8,
    reviewCount: 12,
  },
  {
    id: 2,
    name: "Vela Cera de Soya 'Paz Interior'",
    description: "Vela artesanal de cera de soya aromatizada con aceites esenciales de lavanda y manzanilla. Decorada con cuarzo amatista y flores secas de lavanda.",
    price: 45000,
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop",
    category: "aromas",
    subcategory: "Velas",
    rating: 4.9,
    reviewCount: 8,
  },
  {
    id: 3,
    name: "Drusa de Cuarzo Blanco Grande",
    description: "Espectacular drusa de cuarzo blanco natural de alta pureza. Ideal para la limpieza energética de espacios y recarga de otros cristales y accesorios.",
    price: 120000,
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=600&auto=format&fit=crop",
    category: "cuarzos",
    subcategory: "Cuarzos individuales",
    rating: 5.0,
    reviewCount: 5,
  },
  {
    id: 4,
    name: "Kit Sahumerio Sagrado de Limpieza",
    description: "Kit completo que incluye atado de salvia blanca californiana, palo santo originario, cuenco de barro artesanal y una pluma de sahumado para esparcir el humo sagrado.",
    price: 55000,
    discount_price: 49000,
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=600&auto=format&fit=crop",
    category: "rituales",
    subcategory: "Sets de ritual",
    rating: 4.7,
    reviewCount: 15,
  },
  {
    id: 5,
    name: "Pulsera Ojo de Tigre & Obsidiana",
    description: "Manilla de protección elaborada con cuentas de ojo de tigre y obsidiana negra natural de 8mm. Hilo elástico ultra-resistente ajustable.",
    price: 35000,
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
    category: "accesorios",
    subcategory: "Manillas",
    rating: 4.6,
    reviewCount: 22,
  },
  {
    id: 6,
    name: "Kit Cuarzos de los 7 Chakras",
    description: "Set de 7 cristales naturales pulidos seleccionados para equilibrar cada centro energético: Amatista, Sodalita, Cuarzo Azul, Aventurina Verde, Calcita Amarilla, Cornalina y Jaspe Rojo. Incluye bolsa de lino orgánico.",
    price: 65000,
    is_available: false, // Agotado para probar la interfaz
    image_url: "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=600&auto=format&fit=crop",
    category: "kits",
    subcategory: "Kits combinados",
    rating: 4.8,
    reviewCount: 19,
  },
];
