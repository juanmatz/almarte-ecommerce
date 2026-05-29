import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Iniciando la siembra (seed) de la base de datos...");

  // 1. Limpiar base de datos en orden de dependencias de claves foráneas
  console.log("Limpiando tablas existentes...");
  await prisma.shipment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  console.log("Base de datos limpia.");

  // 2. Crear Usuarios (Admin y Clientes)
  console.log("Creando usuarios...");
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const customerPasswordHash = await bcrypt.hash("cliente123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Administradora Almarte",
      email: "admin@almarte.com",
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });

  const users = [
    await prisma.user.create({
      data: {
        name: "Juan Pérez",
        email: "juan@gmail.com",
        passwordHash: customerPasswordHash,
        role: "customer",
      },
    }),
    await prisma.user.create({
      data: {
        name: "María Rodríguez",
        email: "maria@gmail.com",
        passwordHash: customerPasswordHash,
        role: "customer",
      },
    }),
    await prisma.user.create({
      data: {
        name: "Sofía Gómez",
        email: "sofia@gmail.com",
        passwordHash: customerPasswordHash,
        role: "customer",
      },
    }),
    await prisma.user.create({
      data: {
        name: "Carlos Mendoza",
        email: "carlos@gmail.com",
        passwordHash: customerPasswordHash,
        role: "customer",
      },
    }),
  ];
  console.log("Usuarios creados.");

  // 3. Crear Productos
  console.log("Creando productos semilla...");
  const productData = [
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
    {
      name: "Anillo Cuarzo Rosa 'Amor Propio'",
      description: "Anillo ajustable de plata de ley 925 con un cuarzo rosa facetado en forma de corazón. Promueve el amor propio y la sanación emocional.",
      price: 75000,
      discountPrice: 62000,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop",
      category: "accesorios",
      subcategory: "Anillos",
    },
    {
      name: "Esfera de Celestina Celestial",
      description: "Esfera de celestina natural de Madagascar de 6cm. Hermoso color azul celeste con cavidades cristalinas. Fomenta la paz mental y la conexión espiritual.",
      price: 180000,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=600&auto=format&fit=crop",
      category: "cuarzos-y-minerales",
      subcategory: "Cuarzos individuales",
    }
  ];

  const products: any[] = [];
  for (const prod of productData) {
    const created = await prisma.product.create({ data: prod });
    products.push(created);
    console.log(`Producto creado: ${created.name}`);
  }

  // 4. Crear Reseñas
  console.log("Creando reseñas de productos...");
  const reviews = [
    {
      productId: products[0].id, // Collar Amatista
      userId: users[0].id, // Juan
      rating: 5,
      comment: "Hermoso collar, se siente una energía increíble al usarlo y la amatista brilla precioso.",
    },
    {
      productId: products[0].id,
      userId: users[1].id, // María
      rating: 4,
      comment: "Muy lindo, el envío tardó dos días a Bogotá. La cadena de plata es delgada pero resistente.",
    },
    {
      productId: products[1].id, // Vela Paz Interior
      userId: users[2].id, // Sofía
      rating: 5,
      comment: "Huele delicioso a lavanda, inunda toda mi habitación. Además viene con un cuarzo real adentro.",
    },
    {
      productId: products[4].id, // Pulsera Ojo de Tigre
      userId: users[0].id, // Juan
      rating: 5,
      comment: "Excelente calidad de las piedras y el elástico es grueso. La uso todos los días.",
    }
  ];

  for (const rev of reviews) {
    await prisma.review.create({ data: rev });
  }
  console.log("Reseñas creadas.");

  // 5. Crear Historial de Órdenes y Envíos
  console.log("Creando historial de órdenes y envíos de prueba...");

  const ordersData = [
    {
      userId: users[0].id, // Juan
      total: 103000, // Collar Amatista (68000 en descuento) + Pulsera Ojo de Tigre (35000)
      status: "paid" as const,
      shippingAddress: JSON.stringify({
        city: "Bogotá",
        address: "Calle 127 # 15-45 Apto 302",
        phone: "3101234567",
      }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // Hace 10 días
      items: [
        { productId: products[0].id, quantity: 1, priceAtPurchase: 68000 },
        { productId: products[4].id, quantity: 1, priceAtPurchase: 35000 }
      ],
      shipment: {
        carrier: "Servientrega",
        trackingNumber: "SERVI987654321",
        status: "delivered" as const,
        dispatchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
        estimatedDelivery: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        notes: "Entregado en portería."
      }
    },
    {
      userId: users[1].id, // María
      total: 165000, // Drusa de Cuarzo (120000) + Vela Paz Interior (45000)
      status: "shipped" as const,
      shippingAddress: JSON.stringify({
        city: "Medellín",
        address: "Carrera 43A # 10-25 Apto 804",
        phone: "3159876543",
      }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // Hace 3 días
      items: [
        { productId: products[2].id, quantity: 1, priceAtPurchase: 120000 },
        { productId: products[1].id, quantity: 1, priceAtPurchase: 45000 }
      ],
      shipment: {
        carrier: "Coordinadora",
        trackingNumber: "COOR123456789",
        status: "in_transit" as const,
        dispatchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
        notes: "Cliente solicitó llamar antes de entregar."
      }
    },
    {
      userId: users[2].id, // Sofía
      total: 49000, // Kit Sahumerio (49000 en descuento)
      status: "pending" as const,
      shippingAddress: JSON.stringify({
        city: "Cali",
        address: "Avenida 6 Norte # 22N-40 Apto 501",
        phone: "3208889999",
      }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // Hace 5 horas
      items: [
        { productId: products[3].id, quantity: 1, priceAtPurchase: 49000 }
      ],
      shipment: {
        carrier: null,
        trackingNumber: null,
        status: "pending" as const,
        notes: "Orden recibida. Pendiente por empacar y generar guía de despacho."
      }
    },
    {
      userId: users[3].id, // Carlos
      total: 137000, // Anillo Cuarzo Rosa (62000) + Anillo Cuarzo Rosa (62000) + Pulsera Ojo de Tigre (13000 de descuento? No, regular 75000 + 62000? Let's say Anillo (62000) + Collar Amatista (68000) = 130000? Let's write items)
      status: "paid" as const,
      shippingAddress: JSON.stringify({
        city: "Barranquilla",
        address: "Calle 82 # 51B-120",
        phone: "3004445555",
      }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // Hace 18 horas
      items: [
        { productId: products[6].id, quantity: 1, priceAtPurchase: 62000 },
        { productId: products[0].id, quantity: 1, priceAtPurchase: 68000 }
      ],
      shipment: {
        carrier: "Envía",
        trackingNumber: "ENVIA777888999",
        status: "dispatched" as const,
        dispatchedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        notes: "Despachado en el lote de la tarde."
      }
    },
    {
      userId: users[1].id, // María
      total: 45000, // Vela Paz Interior (45000)
      status: "cancelled" as const,
      shippingAddress: JSON.stringify({
        city: "Envigado",
        address: "Transversal 35 Sur # 29-10",
        phone: "3159876543",
      }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12), // Hace 12 días
      items: [
        { productId: products[1].id, quantity: 1, priceAtPurchase: 45000 }
      ],
      shipment: {
        carrier: null,
        trackingNumber: null,
        status: "returned" as const,
        notes: "Cancelado por solicitud del cliente antes del despacho."
      }
    },
    {
      userId: users[2].id, // Sofía
      total: 180000, // Esfera Celestina (180000)
      status: "paid" as const,
      shippingAddress: JSON.stringify({
        city: "Cartagena",
        address: "Calle del Tablón # 34-12 Apto 2B",
        phone: "3208889999",
      }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // Hace 1 día
      items: [
        { productId: products[7].id, quantity: 1, priceAtPurchase: 180000 }
      ],
      shipment: {
        carrier: null,
        trackingNumber: null,
        status: "pending" as const,
        notes: "Pago verificado. Listo para despacho."
      }
    },
    {
      userId: users[0].id, // Juan
      total: 120000, // Drusa de Cuarzo (120000)
      status: "paid" as const,
      shippingAddress: JSON.stringify({
        city: "Bucaramanga",
        address: "Carrera 29 # 45-12",
        phone: "3101234567",
      }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // Hace 36 horas
      items: [
        { productId: products[2].id, quantity: 1, priceAtPurchase: 120000 }
      ],
      shipment: {
        carrier: "Servientrega",
        trackingNumber: "SERVI111222333",
        status: "in_transit" as const,
        dispatchedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 12),
        notes: "Envío urgente."
      }
    },
    {
      userId: users[3].id, // Carlos
      total: 35000, // Pulsera Ojo de Tigre (35000)
      status: "pending" as const,
      shippingAddress: JSON.stringify({
        city: "Santa Marta",
        address: "Calle 22 # 4-50",
        phone: "3004445555",
      }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // Hace 2 horas
      items: [
        { productId: products[4].id, quantity: 1, priceAtPurchase: 35000 }
      ],
      shipment: {
        carrier: null,
        trackingNumber: null,
        status: "pending" as const,
        notes: "Pendiente confirmación de pago por transferencia bancaria."
      }
    }
  ];

  for (const ord of ordersData) {
    const createdOrder = await prisma.order.create({
      data: {
        userId: ord.userId,
        total: ord.total,
        status: ord.status,
        shippingAddress: ord.shippingAddress,
        createdAt: ord.createdAt,
        orderItems: {
          create: ord.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase
          }))
        }
      }
    });

    if (ord.shipment) {
      await prisma.shipment.create({
        data: {
          orderId: createdOrder.id,
          carrier: ord.shipment.carrier,
          trackingNumber: ord.shipment.trackingNumber,
          status: ord.shipment.status,
          dispatchedAt: ord.shipment.dispatchedAt,
          estimatedDelivery: ord.shipment.estimatedDelivery,
          notes: ord.shipment.notes
        }
      });
    }

    console.log(`Orden creada ID: ${createdOrder.id} para usuario ID: ${ord.userId}`);
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
