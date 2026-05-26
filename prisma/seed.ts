import { prisma } from "../lib/db";

async function main() {
  console.log("Iniciando la siembra (seed) de la base de datos...");

  // Limpiar productos existentes
  await prisma.product.deleteMany();
  console.log("Base de datos limpia de productos anteriores.");

  // Productos semilla
  const products = [
    {
      name: "Collar Amatista del Alma",
      description: "Collar hecho a mano con piedra amatista natural pulida, ideal para la transmutación energética y la meditación profunda. Cadena de plata de ley 925.",
      price: 85000,
      discountPrice: 68000,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
      category: "accesorios",
      subcategory: "Collares",
    },
    {
      name: "Vela Cera de Soya 'Paz Interior'",
      description: "Vela artesanal de cera de soya aromatizada con aceites esenciales de lavanda y manzanilla. Decorada con cuarzo amatista y flores secas de lavanda.",
      price: 45000,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop",
      category: "aromas-y-velas",
      subcategory: "Velas",
    },
    {
      name: "Drusa de Cuarzo Blanco Grande",
      description: "Espectacular drusa de cuarzo blanco natural de alta pureza. Ideal para la limpieza energética de espacios y recarga de otros cristales y accesorios.",
      price: 120000,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=600&auto=format&fit=crop",
      category: "cuarzos-y-minerales",
      subcategory: "Cuarzos individuales",
    },
    {
      name: "Kit Sahumerio Sagrado de Limpieza",
      description: "Kit completo que incluye atado de salvia blanca californiana, palo santo originario, cuenco de barro artesanal y una pluma de sahumado para esparcir el humo sagrado.",
      price: 55000,
      discountPrice: 49000,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=600&auto=format&fit=crop",
      category: "rituales-y-bienestar",
      subcategory: "Sets de ritual",
    },
    {
      name: "Pulsera Ojo de Tigre & Obsidiana",
      description: "Manilla de protección elaborada con cuentas de ojo de tigre y obsidiana negra natural de 8mm. Hilo elástico ultra-resistente ajustable.",
      price: 35000,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
      category: "accesorios",
      subcategory: "Manillas",
    },
    {
      name: "Kit Cuarzos de los 7 Chakras",
      description: "Set de 7 cristales naturales pulidos seleccionados para equilibrar cada centro energético: Amatista, Sodalita, Cuarzo Azul, Aventurina Verde, Calcita Amarilla, Cornalina y Jaspe Rojo. Incluye bolsa de lino orgánico.",
      price: 65000,
      isAvailable: false, // Agotado
      imageUrl: "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=600&auto=format&fit=crop",
      category: "kits-energeticos",
      subcategory: "Kits combinados",
    },
  ];

  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: product,
    });
    console.log(`Producto creado: ${createdProduct.name} (ID: ${createdProduct.id})`);
  }

  console.log("Siembra completada con éxito.");
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
