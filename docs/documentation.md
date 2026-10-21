# ALMARTE ARTESANOS — Manual Maestro de Arquitectura y Sistema
> **Versión:** 2.0 (Consolidada y Centralizada) — Octubre 2026  
> **Stack Oficial:** Next.js (App Router) + React 19 + TypeScript + TailwindCSS + Prisma (MariaDB / MySQL)  
> **Hosting de Despliegue:** Hostinger Business (Node.js runtime + MySQL administrado)  
> **Moneda Oficial:** Pesos Colombianos (COP)  

---

## Tabla de Contenidos

1. [Visión General y Propósito del Proyecto](#1-visión-general-y-propósito-del-proyecto)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
   - 2.1. [Diagrama de Arquitectura de Alto Nivel](#21-diagrama-de-arquitectura-de-alto-nivel)
   - 2.2. [Desglose de Capas y Tecnologías](#22-desglose-de-capas-y-tecnologías)
   - 2.3. [Restricciones de Hosting y Mitigaciones](#23-restricciones-de-hosting-y-mitigaciones)
3. [Modelo de Datos y Persistencia (Prisma)](#3-modelo-de-datos-y-persistencia-prisma)
   - 3.1. [Diagrama Entidad-Relación (Mermaid)](#31-diagrama-entidad-relación-mermaid)
   - 3.2. [Diccionario de Tablas y Atributos](#32-diccionario-de-tablas-y-atributos)
   - 3.3. [Estrategia de Pool de Conexiones (MariaDB)](#33-estrategia-de-pool-de-conexiones-mariadb)
4. [Catálogo de APIs REST (Next.js Route Handlers)](#4-catálogo-de-apis-rest-nextjs-route-handlers)
   - 4.1. [Autenticación](#41-autenticación)
   - 4.2. [Catálogo de Productos](#42-catálogo-de-productos)
   - 4.3. [Checkout y Creación de Órdenes](#43-checkout-y-creación-de-órdenes)
   - 4.4. [Reseñas y Calificaciones](#44-reseñas-y-calificaciones)
   - 4.5. [Panel Administrativo y Gestión](#45-panel-administrativo-y-gestión)
5. [Flujos de Negocio Críticos](#5-flujos-de-negocio-críticos)
   - 5.1. [Flujo de Checkout Híbrido (Registrado vs Invitado)](#51-flujo-de-checkout-híbrido-registrado-vs-invitado)
   - 5.2. [Ciclo de Vida de Órdenes y Envíos](#52-ciclo-de-vida-de-órdenes-y-envíos)
   - 5.3. [Estándar de Precios y Moneda (COP)](#53-estándar-de-precios-y-moneda-cop)
6. [Sistema de Diseño Visual e Identidad de Marca](#6-sistema-de-diseño-visual-e-identidad-de-marca)
   - 6.1. [Paleta Cromática Oficial](#61-paleta-cromática-oficial)
   - 6.2. [Tipografía y Estilos](#62-tipografía-y-estilos)
   - 6.3. [Componentes UI Esenciales](#63-componentes-ui-esenciales)
7. [Seguridad, Hardening y Cumplimiento Legal](#7-seguridad-hardening-y-cumplimiento-legal)
   - 7.1. [Seguridad de Pagos (PCI-DSS)](#71-seguridad-de-pagos-pci-dss)
   - 7.2. [Protección de Datos Personales (Habeas Data — Ley 1581 de 2012)](#72-protección-de-datos-personales-habeas-data--ley-1581-de-2012)
   - 7.3. [Estatuto del Consumidor (Ley 1480 de 2011)](#73-estatuto-del-consumidor-ley-1480-de-2011)
   - 7.4. [Hardening Web y Cabeceras HTTP](#74-hardening-web-y-cabeceras-http)
8. [Especificación de Requisitos y Criterios de Aceptación](#8-especificación-de-requisitos-y-criterios-de-aceptación)
9. [Plan de Pruebas y Validación Pre-Producción](#9-plan-de-pruebas-y-validación-pre-producción)
10. [Guía de Despliegue y Operaciones (Yarn Exclusivo)](#10-guía-de-despliegue-y-operaciones-yarn-exclusivo)
   - 10.1. [Estrategia de Ramas Git y Auto-deploy a Hostinger](#101-estrategia-de-ramas-git-y-auto-deploy-a-hostinger)
   - 10.2. [Comandos de Despliegue en Hostinger](#102-comandos-de-despliegue-en-hostinger)
   - 10.3. [Variables de Entorno Obligatorias (.env)](#103-variables-de-entorno-obligatorias-env)
   - 10.4. [Entorno de Desarrollo Local con Docker](#104-entorno-de-desarrollo-local-con-docker)

---

## 1. Visión General y Propósito del Proyecto

**Almarte Artesanos** es una plataforma de comercio electrónico a medida creada para resaltar el valor artístico y energético de la joyería artesanal, cristales naturales, velas intencionadas y rituales de bienestar hechos a mano en Colombia.

### Objetivos Clave del Sistema
- **Experiencia de usuario fluida:** Catálogo interactivo con filtrado dinámico, carrito persistente en cliente y checkout sin fricción.
- **Modelo de Usuario Híbrido:** Admite compras de usuarios registrados o invitados directos sin obligar a crear contraseñas antes del pago.
- **Rendimiento y Ligereza:** Arquitectura en Next.js (App Router) con Server Components, imágenes delegadas a CDN (Cloudinary) y control estricto de recursos para operar óptimamente sobre hosting compartido (Hostinger Business).
- **Cumplimiento Normativo Colombiano:** Precios transparentes en COP, derecho de retracto, canal formal de PQRs y consentimiento explícito de Habeas Data ante la SIC.

---

## 2. Arquitectura del Sistema

### 2.1. Diagrama de Arquitectura de Alto Nivel

```mermaid
flowchart TD
    Client["Navegador Web / Cliente (Desktop / Móvil)"]
    
    subgraph HostingerServer["Servidor Hostinger (Node.js Runtime)"]
        NextApp["Next.js App Router (React 19)"]
        Middleware["Security Middleware (JWT / Roles)"]
        APIRoutes["Route Handlers (/app/api/*)"]
        PrismaAdapter["Prisma ORM + MariaDB Adapter (Connection Pool)"]
        
        NextApp --> Middleware
        Middleware --> APIRoutes
        APIRoutes --> PrismaAdapter
    end

    subgraph ExternalServices["Servicios Externos / Nube"]
        MariaDB[("Base de Datos MariaDB / MySQL")]
        Cloudinary["Cloudinary CDN (Imágenes de Productos)"]
        PaymentGateway["Pasarela de Pagos (Stripe / Wompi)"]
    end

    Client -->|HTTPS / UI Rendering| NextApp
    Client -->|REST API / JSON| APIRoutes
    Client -->|Carga de Fotografías| Cloudinary
    PrismaAdapter -->|Pool máx 10 conn| MariaDB
    APIRoutes -->|Subida de Archivos| Cloudinary
    APIRoutes -->|Intención de Pago| PaymentGateway
```

### 2.2. Desglose de Capas y Tecnologías

1. **Frontend & Presentación (`app/` y `components/`):**
   * **Framework:** Next.js (App Router) sobre React 19.
   * **Server Components:** Renderizado por defecto en servidor para velocidad de carga inicial y SEO.
   * **Client Components (`'use client'`):** Utilizados exclusivamente para módulos interactivos (carrito, filtros, modal de imágenes, formularios de checkout).
   * **Estilos:** TailwindCSS configurado con la paleta de colores oficial de Almarte (tonos tierra, olivo y marfil).
   * **Iconografía:** Lucide React.
2. **Backend & Capa de Negocio (`app/api/` y `lib/`):**
   * **Rutas API:** Next.js Route Handlers en TypeScript con validación de entradas y respuestas HTTP semánticas (`NextResponse.json`).
   * **Middleware (`middleware.ts`):** Verificación de tokens JWT, inyección de encabezados de contexto de usuario (`x-user-id`, `x-user-role`) y protección estricta de rutas administrativas (`/api/admin/*`).
   * **Manejo de Moneda (`lib/currency.ts`):** Funciones centralizadas `formatCOP`, `parseCOPPrice` y validación de rangos.
3. **Capa de Datos y Persistencia (`prisma/` y `lib/db.ts`):**
   * **ORM:** Prisma Client integrado con `@prisma/adapter-mariadb`.
   * **Base de Datos:** MySQL / MariaDB en Hostinger.
4. **Almacenamiento de Multimedia:**
   * **Cloudinary:** Las imágenes se procesan y optimizan externamente. La base de datos únicamente almacena URLs seguras (`https://res.cloudinary.com/...`).

### 2.3. Restricciones de Hosting y Mitigaciones

El sistema está optimizado para operar dentro de los parámetros de **Hostinger Business**:

| Restricción del Hosting | Impacto Potencial | Mitigación Implementada |
|---|---|---|
| **Límite de 75 conexiones MySQL** | Saturación del socket y caídas `ECONNREFUSED` | `lib/db.ts` implementa un pool controlado con `@prisma/adapter-mariadb` limitado a **máximo 10 conexiones en producción** (5 en desarrollo) con timeout agresivo de 3 segundos. |
| **Límite de inodos (600,000 archivos)** | Agotamiento del espacio de archivos del hosting | Cero almacenamiento local de fotos. Se cargan directamente a Cloudinary vía `/api/admin/upload`. |
| **Memoria RAM compartida** | Consumo excesivo por cálculo de estados | El carrito se calcula y persiste en el cliente (`LocalStorage`). El servidor solo valida inventario y precios reales en el momento del checkout. |

---

## 3. Modelo de Datos y Persistencia (Prisma)

### 3.1. Diagrama Entidad-Relación (Mermaid)

```mermaid
erDiagram
    users ||--o{ orders : "realiza"
    users ||--o{ reviews : "escribe"
    orders ||--|{ order_items : "contiene"
    orders ||--o| shipments : "posee"
    products ||--|{ product_images : "tiene"
    products ||--o{ order_items : "incluido_en"
    products ||--o{ reviews : "recibe"

    users {
        int id PK
        string name
        string email UK
        string password_hash
        string document_id
        boolean is_guest
        enum role
        datetime created_at
    }

    products {
        int id PK
        string name
        string description
        decimal price
        decimal discount_price
        boolean is_available
        string image_url
        string category
        string subcategory
        datetime created_at
    }

    product_images {
        int id PK
        int product_id FK
        string url
        int sort_order
        datetime created_at
    }

    orders {
        int id PK
        int user_id FK
        decimal total
        enum status
        string payment_intent_id UK
        string shipping_address
        datetime created_at
    }

    order_items {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price_at_purchase
    }

    reviews {
        int id PK
        int product_id FK
        int user_id FK
        int rating
        string comment
        datetime created_at
    }

    shipments {
        int id PK
        int order_id FK,UK
        string carrier
        string tracking_number
        enum status
        datetime dispatched_at
        date estimated_delivery
        string notes
    }
```

### 3.2. Diccionario de Tablas y Atributos

#### Tabla: `users`
Gestiona clientes (registrados o invitados) y administradores.
* `id` (INT, PK, Auto): Identificador interno.
* `name` (VARCHAR 100): Nombre completo del comprador.
* `email` (VARCHAR 150, UNIQUE): Correo para notificaciones y trazabilidad.
* `password_hash` (VARCHAR 255, Nullable): Hash bcrypt/argon2. Es `NULL` para usuarios invitados (`is_guest = true`).
* `document_id` (VARCHAR 20, Nullable): Cédula de ciudadanía o NIT (requerido para facturación y guías de mensajería).
* `is_guest` (BOOLEAN, Default: false): Distingue compradores casuales de clientes registrados.
* `role` (ENUM: `'customer'`, `'admin'`): Nivel de privilegios.

#### Tabla: `products`
Catálogo central de artículos artesanales.
* `id` (INT, PK, Auto): Identificador único.
* `name` (VARCHAR 150): Nombre comercial de la pieza.
* `description` (TEXT): Descripción de propiedades, minerales y cuidados.
* `price` (DECIMAL 10,2): Precio regular en COP.
* `discount_price` (DECIMAL 10,2, Nullable): Precio promocional.
* `is_available` (BOOLEAN, Default: true): Control manual de stock (`true` = disponible, `false` = agotado).
* `image_url` (VARCHAR 255): Fotografía de portada (Cloudinary).
* `category` / `subcategory` (VARCHAR 50): Clasificación taxonómica.

#### Tabla: `product_images`
Galería de fotos adicionales para vista en carrusel/zoom.
* `id` (INT, PK, Auto).
* `product_id` (INT, FK → `products.id` ON DELETE CASCADE).
* `url` (VARCHAR 500): URL de la imagen en Cloudinary.
* `sort_order` (INT, Default: 0): Posición relativa en la galería.

#### Tabla: `orders`
Cabecera de cada compraventa.
* `id` (INT, PK, Auto): Número de pedido consecutivo.
* `user_id` (INT, FK → `users.id`): Comprador asociado.
* `total` (DECIMAL 10,2): Total liquidado en COP.
* `status` (ENUM: `'pending'`, `'paid'`, `'shipped'`, `'cancelled'`).
* `payment_intent_id` (VARCHAR 255, UNIQUE, Nullable): Identificador provisto por la pasarela de pagos.
* `shipping_address` (TEXT): Payload JSON con dirección, departamento, ciudad y teléfono de entrega.

#### Tabla: `order_items`
Líneas de pedido. Conservan inmutabilidad histórica del valor de compra.
* `id` (INT, PK, Auto).
* `order_id` (INT, FK → `orders.id` ON DELETE CASCADE).
* `product_id` (INT, FK → `products.id` ON DELETE RESTRICT): Evita borrar productos si tienen compras asociadas.
* `quantity` (INT): Cantidad de unidades.
* `price_at_purchase` (DECIMAL 10,2): Precio unitario congelado al momento del checkout.

#### Tabla: `reviews`
Evaluaciones verificadas sobre productos.
* `id` (INT, PK, Auto).
* `product_id` (INT, FK → `products.id` ON DELETE CASCADE).
* `user_id` (INT, FK → `users.id` ON DELETE SET NULL).
* `rating` (TINYINT): Calificación de 1 a 5 estrellas.
* `comment` (TEXT, Nullable): Reseña escrita.

#### Tabla: `shipments`
Trazabilidad logística del paquete.
* `id` (INT, PK, Auto).
* `order_id` (INT, FK → `orders.id` ON DELETE CASCADE, UNIQUE).
* `carrier` (VARCHAR 100): Empresa transportadora (ej. Coordinadora, Envia, Servientrega).
* `tracking_number` (VARCHAR 100): Número de guía de rastreo.
* `status` (ENUM: `'pending'`, `'dispatched'`, `'in_transit'`, `'delivered'`, `'returned'`).

---

## 4. Catálogo de APIs REST (Next.js Route Handlers)

Todas las rutas API residen en `app/api/` y responden en formato JSON.

### 4.1. Autenticación (`/api/auth`)
* `POST /api/auth/register`: Registro de nuevos clientes. Valida unicidad de correo, encripta contraseña y genera JWT.
* `POST /api/auth/login`: Autentica credenciales y emite token JWT con id, email y rol.

### 4.2. Catálogo de Productos (`/api/products`)
* `GET /api/products`: Lista filtrable y paginada del catálogo. Parámetros query: `category`, `subcategory`, `available`, `discount`.
* `GET /api/products/:id`: Detalle completo de la pieza, incluyendo galería de imágenes y calificaciones promedio.

### 4.3. Checkout y Creación de Órdenes (`/api/checkout` y `/api/orders`)
* `POST /api/checkout/guest-intent`: Recibe el carrito y datos del cliente invitado/registrado. Valida precios vigentes en BD, congela `price_at_purchase`, crea o enlaza el usuario `User`, y crea la `Order` y su `Shipment` en estado `pending`.
* `GET /api/orders`: *(Requiere autenticación)* Consulta el historial de órdenes del usuario logueado.
* `GET /api/orders/:id`: *(Requiere autenticación)* Retorna el desglose de la orden e información de envío asociada.

### 4.4. Reseñas y Calificaciones (`/api/reviews`)
* `GET /api/reviews?productId=:id`: Retorna las calificaciones públicas de un producto.
* `POST /api/reviews`: *(Requiere autenticación)* Publica una reseña tras verificar que el usuario compró previamente el producto con orden en estado `paid`.

### 4.5. Panel Administrativo y Gestión (`/api/admin`)
> **Protección:** Requiere token JWT con rol `admin`. Validado por middleware y por el controlador.
* `GET /api/admin/metrics`: Indicadores clave del dashboard (total ventas del mes en COP, órdenes pendientes, productos agotados).
* `GET /api/admin/products`: Inventario completo con opciones de gestión.
* `POST /api/admin/products`: Creación de productos con soporte para múltiples imágenes.
* `PUT /api/admin/products/:id`: Actualización de precios, descripción y disponibilidad.
* `DELETE /api/admin/products/:id`: Baja lógica o física si no tiene órdenes vinculadas.
* `GET /api/admin/orders`: Listado de pedidos con filtro por estado (`pending`, `paid`, `shipped`, `cancelled`).
* `PATCH /api/admin/orders/:id`: Cambio manual de estado de orden.
* `POST /api/admin/shipments`: Asignación de guía y despacho de paquete.
* `POST /api/admin/upload`: Carga de fotografías hacia Cloudinary (`folder: almarte/productos`).

---

## 5. Flujos de Negocio Críticos

### 5.1. Flujo de Checkout Híbrido (Registrado vs Invitado)

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    participant Frontend as Frontend (Checkout)
    participant API as API (/api/checkout/guest-intent)
    participant DB as MariaDB (Prisma)

    Cliente->>Frontend: Inicia checkout con ítems en Carrito
    alt ¿El cliente tiene sesión activa?
        Frontend->>Frontend: Autocompleta datos con su perfil
    else Compra como invitado
        Frontend->>Cliente: Solicita Nombre, Email, Cédula, Teléfono y Dirección
    end

    Cliente->>Frontend: Confirma pedido y acepta Política de Datos (Checkbox)
    Frontend->>API: Envía payload (items, email, datos personales, dirección)
    
    API->>DB: Consulta precios reales e inventario de los productos
    Note over API,DB: Nunca se confía en el total enviado por el cliente
    
    API->>DB: Verifica si el email ya existe
    alt Email no existe
        API->>DB: Crea User (is_guest = true, password_hash = null)
    else Email existe como invitado
        API->>DB: Actualiza datos de contacto
    else Email pertenece a cliente registrado
        API->>DB: Asocia la compra al ID de usuario existente
    end

    API->>DB: Crea registro Order (total calculado, status = pending)
    API->>DB: Crea OrderItems con precios congelados
    API->>DB: Crea Shipment (status = pending)
    
    API-->>Frontend: Retorna orderId y resumen confirmado
    Frontend-->>Cliente: Muestra confirmación e instrucciones de pago
```

### 5.2. Ciclo de Vida de Órdenes y Envíos

```mermaid
stateDiagram-v2
    [*] --> Pending: Creación de Orden
    Pending --> Paid: Pago verificado (Pasarela / Admin)
    Pending --> Cancelled: No concretada / Cancelada por cliente
    Paid --> Dispatched: Admin asigna guía en /admin/ordenes
    Dispatched --> InTransit: Paquete recibido por Transportadora
    InTransit --> Delivered: Entrega exitosa al Cliente
    InTransit --> Returned: Devolución por novedad
    Delivered --> [*]
    Cancelled --> [*]
    Returned --> [*]
```

### 5.3. Estándar de Precios y Moneda (COP)

Por mandato normativo del proyecto:
1. **Moneda Oficial:** Pesos Colombianos (**COP**).
2. **Formateo en Presentación:** Usar `formatCOP` de `@/lib/currency`. Produce formateo limpio sin decimales innecesarios (ej. `$85.000 COP`).
3. **Validación en Formularios Administrativos:**
   * Usar `parseCOPPrice` para procesar entradas de texto que incluyan puntos o símbolos.
   * Validar con `isValidCOPPrice(valor, 1000)` para impedir que `$85.000` se interprete erróneamente como `$85`.

---

## 6. Sistema de Diseño Visual e Identidad de Marca

*(Consolidado del Design Brief oficial)*

### 6.1. Paleta Cromática Oficial

El diseño evoca la calma, los minerales y la calidez artesanal:

```css
:root {
  /* Fondos y Superficies */
  --color-bg-primary:    #F5F0E8;  /* Crema Cálido — Fondo principal de páginas */
  --color-bg-secondary:  #FAF7F2;  /* Marfil Suave — Tarjetas, modales, drawers */
  --color-surface:       #E8DFD0;  /* Arena Natural — Headers, chips, separadores */
  
  /* Identidad y Acentos (Logo Almarte) */
  --color-brand-main:    #43503C;  /* Verde Olivo Almarte — Árbol, encabezados, alta jerarquía */
  --color-accent:        #C6764B;  /* Terracota Sol — Botones primarios, llamadas a la acción */
  --color-accent-soft:   #DB9773;  /* Terracota Suave — Hover states, badges de descuento */
  
  /* Textos y Divisores */
  --color-text-primary:  #2B2D29;  /* Carbón Oliva — Cuerpo de texto principal */
  --color-text-secondary:#6E736A;  /* Gris Musgo — Metadatos, precios tachados, subtítulos */
  --color-title:         #43503C;  /* Verde Olivo Profundo — H1, H2, nombres de productos */
  --color-divider:       #D4C9B8;  /* Gris Beige — Bordes sutiles y líneas divisorias */
  --color-white:         #FFFFFF;  /* Blanco puro — Texto sobre botones y fondos contrastados */
}
```

> **Regla Estricta:** Prohibido el uso de negro puro (`#000000`). La jerarquía más oscura debe emplear `--color-title` (`#43503C`) o `--color-text-primary` (`#2B2D29`).

### 6.2. Tipografía y Estilos
- **Títulos y Marca:** `Playfair Display` (Serif de alta elegancia para H1, H2, logotipos y nombres de piezas).
- **Cuerpo y UI:** `DM Sans` (Sans-serif legible, limpia y moderna para precios, botones y descripciones).

### 6.3. Componentes UI Esenciales
* `<ProductCard />`: Tarjeta de producto con hover sutil, fotografía cuadrada optimizada, precio COP formateado y badges condicionales.
* `<CartDrawer />`: Panel lateral desplegable con resumen de compras, control de cantidades y total en COP.
* `<PriceDisplay />`: Componente defensivo que renderiza precio regular tachado y precio de oferta cuando `discountPrice` está activo.
* `<AvailabilityBadge />`: Indicador visual («Disponible», «Agotado», «X% OFF»).

---

## 7. Seguridad, Hardening y Cumplimiento Legal

### 7.1. Seguridad de Pagos (PCI-DSS)
* **Principio de Cero Almacenamiento:** El sistema **NUNCA** almacena números de tarjeta de crédito, fechas de caducidad ni códigos CVV en bases de datos o archivos de registro.
* Toda transacción con tarjeta se tokeniza en el frontend mediante las librerías oficiales de la pasarela autorizada.

### 7.2. Protección de Datos Personales (Habeas Data — Ley 1581 de 2012 / Colombia)
* En todo formulario de captura (registro, checkout de invitados y suscripción al boletín), es obligatorio un **checkbox desmarcado por defecto**:
  > *"Autorizo el tratamiento de mis datos personales conforme a la Política de Privacidad."*
* Existencia de la página legal `/politica-privacidad` detallando finalidades, canales de atención y ejercicio de derechos ARCO.

### 7.3. Estatuto del Consumidor (Ley 1480 de 2011 / Colombia)
* **Derecho de Retracto:** Plazo legal garantizado de 5 días hábiles a partir de la entrega para devolver el producto y recibir la devolución del dinero.
* **Transparencia en Precios:** Todo costo (producto + flete de envío) debe estar discriminado antes de la confirmación final.
* **Datos Corporativos y Enlace SIC:** Publicación visible de razón social, NIT, correo de contacto y enlace oficial a la [Superintendencia de Industria y Comercio (SIC)](https://www.sic.gov.co).
* **Gestión de PQRs:** Canal formal para radicar Peticiones, Quejas y Reclamos con tiempo de respuesta máximo estipulado por ley (15 días hábiles).

### 7.4. Hardening Web y Cabeceras HTTP
Configuradas en `next.config.ts`:
* `Strict-Transport-Security` (HSTS): Fuerza el uso exclusivo de HTTPS.
* `X-Frame-Options: DENY`: Protección contra ataques de Clickjacking.
* `X-Content-Type-Options: nosniff`: Impide la interpretación errónea de tipos MIME.
* `Referrer-Policy: strict-origin-when-cross-origin`: Privacidad de cabeceras de navegación.
* **Sanitización de Consultas:** Todas las consultas a base de datos se ejecutan a través del motor parametrizado de Prisma ORM, blindando la aplicación contra inyecciones SQL.

---

## 8. Especificación de Requisitos y Criterios de Aceptación

*(Consolidado de requisitos de producción)*

### Requisitos Bloqueadores (P0)
* **RF-001 (Autenticación Segura):** Registro e inicio de sesión con normalización de emails (case-insensitive), passwords hasheados y JWTs firmados con secreto seguro configurado en variables de entorno.
* **RF-002 (Protección de Rutas Administrativas):** Bloqueo a nivel de middleware y API para cualquier acción que modifique inventario, precios o estados sin rol `admin`.
* **RF-003 (Integridad en Precios del Checkout):** Recálculo forzoso en servidor en cada orden; descarte de precios provenientes del payload del cliente.
* **RF-004 (Formateo y Validación COP):** Todo precio visible y editable debe respetar el estándar colombiano con `formatCOP` y `parseCOPPrice`.

### Requisitos Operacionales Críticos (P1)
* **RF-005 (Manejo de Invitados sin Fricción):** Creación fluida de órdenes para usuarios no registrados con captura de cédula y dirección completa.
* **RF-006 (Gestión Logística y Guías):** Registro de transportadora y número de rastreo en el panel administrativo.
* **RF-007 (Subida Segura de Archivos):** Validación de tipos MIME (JPG, PNG, WEBP) y límite de 5MB por imagen en subidas hacia Cloudinary.

---

## 9. Plan de Pruebas y Validación Pre-Producción

*(Consolidado de la matriz de pruebas de calidad y seguridad)*

| Módulo | Escenario de Prueba | Resultado Esperado | Severidad |
|---|---|---|---|
| **Auth** | Iniciar sesión con contraseña incorrecta | Error genérico `401`, sin revelar si el correo existe | P0 |
| **Admin** | Acceder a `/api/admin/*` con token de rol `customer` | Respuesta `403 Prohibido` inmediata | P0 |
| **Checkout** | Manipular el JSON del carrito enviando precio `$1` | La API ignora el precio del cliente y factura el valor de la BD | P0 |
| **Checkout** | Compra como invitado con email nuevo | Crea usuario `is_guest = true`, orden `pending` y shipment asociado | P0 |
| **Catálogo** | Visualización de producto agotado | Badge visible de «Agotado» y botón de añadir al carrito inhabilitado | P1 |
| **Precios** | Ingreso de precio `85.000` en panel admin | Se almacena como `85000.00` y no como `85.00` | P0 |
| **Cloudinary** | Intentar subir archivo ejecutable (`.exe` o `.sh`) | Rechazo inmediato `400 Formato no permitido` | P0 |
| **Reseñas** | Publicar reseña de producto sin haberlo comprado | Error `403 Solo clientes con compras verificadas pueden calificar` | P1 |

---

## 10. Guía de Despliegue y Operaciones (Yarn Exclusivo)

Por directriz técnica del proyecto, el gestor de paquetes exclusivo en cualquier entorno es **`yarn`** (`yarn install`, `yarn build`, `yarn start`). Queda prohibido el uso de `npm` o `pnpm`.

---

### 10.1. Estrategia de Ramas Git y Auto-deploy a Hostinger

El repositorio cuenta con integración continua vinculada a la infraestructura de producción en **Hostinger Business**:

```mermaid
flowchart TD
    subgraph Local["Entorno de Desarrollo Local"]
        DevLocal["Rama develop\n(Desarrollo activo)"]
        DockerDB[("Docker MySQL\n(almarte-db :3306)")]
        AppLocal["Next.js App\n(localhost:3000)"]
        AppLocal -->|Conexión Prisma| DockerDB
    end

    subgraph GitHub["Repositorio en GitHub"]
        GH_Develop["Rama develop\n(Integración de cambios)"]
        GH_Main["Rama main (PROTEGIDA)\n⚠️ SOLO se toca con autorización del usuario"]
    end

    subgraph Hostinger["Producción — Hostinger Business"]
        Webhook["Webhook / Auto-deploy de GitHub"]
        ProdNode["Runtime Node.js\n(yarn start)"]
        ProdDB[("MySQL Administrado\nHostinger")]
        Webhook -->|Gatilla Build & Start| ProdNode
        ProdNode -->|Pool controlado| ProdDB
    end

    DevLocal -->|git push origin develop| GH_Develop
    GH_Develop -.->|Merge a main (SOLO con autorización expresa)| GH_Main
    GH_Main -->|Dispara Auto-deploy| Webhook
```

#### Protocolo de Trabajo en Ramas:
1. **Rama `develop` (Desarrollo Activo):**
   - Es la rama por defecto para el trabajo diario, creación de componentes, nuevas funcionalidades y resolución de bugs.
   - Todo cambio o Pull Request debe enviarse e integrarse primero en `develop`.
2. **Rama `main` (Producción & Auto-deploy — REGLA ESTRICTA):**
   - La rama `main` tiene configurado el **despliegue automático (Auto-deploy)** directo hacia el servidor de producción en Hostinger.
   - **Regla Inviolable:** La rama `main` **SOLO se toca si el usuario lo autoriza explícitamente**. 
   - Queda estrictamente prohibido realizar commits directos, merges o pushes hacia `main` sin el permiso expreso del usuario ("esta rama solo se toca si yo lo permito").

---

### 10.2. Comandos de Despliegue en Hostinger

Cuando se autorice la promoción de cambios a `main`, el pipeline o script en Hostinger ejecuta el siguiente ciclo exclusivo con Yarn:

```bash
# 1. Instalación limpia de dependencias de producción
yarn install --frozen-lockfile

# 2. Generación del cliente de Prisma para MariaDB / MySQL
yarn prisma generate

# 3. Ejecución de migraciones en la base de datos de producción
yarn prisma migrate deploy

# 4. Compilación del proyecto Next.js para producción
yarn build

# 5. Inicio del servicio en la instancia Node.js de Hostinger
yarn start
```

---

### 10.3. Variables de Entorno Obligatorias (`.env`)

```env
# Base de datos relacional (MariaDB / MySQL en Hostinger)
DATABASE_URL="mysql://usuario:password@localhost:3306/almarte_prod"

# Firma y verificación de sesiones JWT
JWT_SECRET="clave_secreta_de_alta_entropia_para_produccion"

# Gestión de imágenes en CDN (Cloudinary)
CLOUDINARY_CLOUD_NAME="nombre_cloud"
CLOUDINARY_API_KEY="api_key"
CLOUDINARY_API_SECRET="api_secret"

# Entorno de ejecución
NODE_ENV="production"
```

---

### 10.4. Entorno de Desarrollo Local con Docker

Para desarrollo en local sin necesidad de instalar servicios de bases de datos directamente en el sistema operativo:

1. **Levantar base de datos MySQL en Docker:**
   ```bash
   docker compose up -d
   ```
2. **Aplicar migraciones y sembrar datos de prueba:**
   ```bash
   yarn prisma migrate deploy
   yarn seed
   ```
3. **Iniciar servidor de desarrollo Next.js:**
   ```bash
   yarn dev
   ```
   *Acceso local:* [http://localhost:3000](http://localhost:3000)

