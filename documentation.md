# ALMARTE ARTESANOS
### Documentación de Arquitectura y Sistema
**Versión 1.0 — Mayo 2025**

---

## Tabla de Contenidos

1. [Introducción del Proyecto](#1-introducción-del-proyecto)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Diseño de la Base de Datos](#3-diseño-de-la-base-de-datos)
4. [Diseño de la API REST](#4-diseño-de-la-api-rest)
5. [Flujo de Checkout Paso a Paso](#5-flujo-de-checkout-paso-a-paso)
6. [Sistema de Reseñas y Valoraciones](#6-sistema-de-reseñas-y-valoraciones)
7. [Sistema de Notificaciones](#7-sistema-de-notificaciones)
8. [Diseño Visual del Sistema](#8-diseño-visual-del-sistema)
9. [Estructura del Proyecto](#9-estructura-del-proyecto)
10. [Lista de Verificación para el Despliegue](#10-lista-de-verificación-para-el-despliegue)

---

## 1. Introducción del Proyecto

### 1.1. Descripción General

**Almarte Artesanos** es una plataforma de comercio electrónico a medida diseñada para capturar la esencia mística y el valor humano de la joyería artesanal, cuarzos, minerales y productos de bienestar hechos a mano. El sistema nace de la necesidad de superar las limitaciones de los constructores visuales genéricos, ofreciendo una experiencia de usuario fluida, una identidad visual única y un control absoluto sobre el proceso de compra.

### 1.2. Objetivos del Sistema

- Garantizar una gestión de estado de productos en tiempo real (disponible, agotado, en descuento) que evite la sobreventa.
- Implementar un flujo de pago seguro (pasarela de pagos pendiente por definir).
- Ofrecer un panel de administración privado para gestión de productos, órdenes y envíos.
- Maximizar el rendimiento y la eficiencia bajo un entorno de hosting compartido optimizado (Hostinger Business).
- Construir una base técnica extensible para futuras integraciones de notificaciones (email/WhatsApp).

### 1.3. Catálogo de Categorías

| Categoría | Subcategorías |
|---|---|
| Accesorios | Manillas, Collares, Aretes, Anillos |
| Kits Energéticos | Kits combinados de cristales y accesorios |
| Cuarzos y Minerales | Cuarzos individuales, minerales decorativos |
| Aromas & Velas | Velas artesanales, aceites esenciales, inciensos |
| Rituales y Bienestar | Sets de ritual, guías, productos de meditación |

---

## 2. Arquitectura del Sistema

El sistema adopta una **arquitectura desacoplada (API-First)**. Esta separación garantiza que el frontend sea extremadamente rápido y que el backend funcione como un servicio independiente y seguro, facilitando la portabilidad y escalabilidad futura.

### 2.1. Diagrama de Arquitectura

```
+----------------------------------------------------------+
|                    CAPA DE CLIENTE                       |
|   [ Frontend en React ]  →  Archivos estáticos (Vite)   |
|                         servidos desde public_html       |
+----------------------------------------------------------+
                            |
              Peticiones HTTP (REST API / JSON)
                            ↓
+----------------------------------------------------------+
|                   CAPA DE NEGOCIO                        |
|   [ Backend en Node.js / Express ]                       |
|        Instancia Node.js en Hostinger                    |
+----------------------------------------------------------+
        |                    |                   |
  Connection Pool         SDK / API           API REST
        ↓                    ↓                   ↓
+---------------+   +------------------+   +---------------+
| CAPA DE DATOS |   | PASARELA DE PAGO |   | CDN IMÁGENES  |
| [ MySQL ]     |   | [ Por definir ]  |   | [ Cloudinary] |
| Base de datos |   | Integración de   |   | Fotografías   |
| relacional    |   | pagos pendiente  |   | de productos  |
+---------------+   +------------------+   +---------------+
```

### 2.2. Desglose de Componentes

#### Frontend (React)
Compilado en archivos estáticos (HTML, CSS, JS) y servido desde el directorio público de Hostinger (`public_html`). Maneja:
- Estado global de la interfaz y carrito de compras mediante React Context.
- Persistencia local del carrito vía `LocalStorage`.
- Enrutamiento de vistas con React Router.
- Consumo de la API REST del backend para catálogo, checkout y reseñas.

#### Backend (Node.js / Express)
Ejecutado en una de las ranuras de aplicaciones Node.js del plan de hosting. Responsable de:
- Validación de reglas de negocio y autenticación JWT.
- Comunicación con MySQL mediante un pool de conexiones controlado.
- Integración de pasarela de pagos (pendiente por definir) y procesamiento de compras.
- Envío de notificaciones por correo electrónico (y futuro canal WhatsApp).

#### Base de Datos (MySQL)
Motor relacional nativo alojado en Hostinger. Encargado de la persistencia de usuarios, productos, órdenes, reseñas e historial de envíos.

#### CDN de Imágenes (Cloudinary)
Las imágenes de todos los productos se almacenan externamente en Cloudinary. La base de datos solo guarda la URL del recurso, mitigando el límite de inodos del hosting compartido y garantizando tiempos de carga óptimos. En el panel de administración, la carga es automatizada: el cliente arrastra la imagen y el servidor la procesa mediante un proxy seguro, renombrándola automáticamente bajo una convención SEO antes de subirla a la carpeta `almarte/productos`.

### 2.3. Decisiones de Infraestructura

> ⚠️ **Nota de Ingeniería:** Al operar sobre el plan Hostinger Business aplican límites técnicos que condicionan el diseño del código.

| Limitación | Solución Implementada |
|---|---|
| 75 conexiones máx. MySQL | Connection Pool (Prisma/Sequelize) con límite de 15 conexiones concurrentes reutilizables |
| 600,000 inodos (archivos) | Imágenes delegadas a Cloudinary CDN. MySQL solo almacena la URL del recurso |
| Consumo de Memoria/CPU | El carrito se procesa en `LocalStorage` del cliente. El servidor solo interviene en el checkout |

---

## 3. Diseño de la Base de Datos

La estructura de datos se modela bajo el principio de consistencia e integridad referencial, asegurando la trazabilidad de pagos frente a modificaciones futuras de precios o productos.

### 3.1. Diccionario de Tablas

#### Tabla: `users`
Almacena las credenciales, perfiles de clientes (registrados o invitados) y administradores.

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único del usuario |
| `name` | VARCHAR(100) | NOT NULL | Nombre completo |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | Correo para login y notificaciones |
| `password_hash` | VARCHAR(255) | NULL | Contraseña encriptada (Argon2/bcrypt). Puede ser `NULL` si el usuario compra como invitado |
| `document_id` | VARCHAR(20) | NULL | Número de identificación (Cédula o NIT) del cliente |
| `is_guest` | TINYINT(1) | NOT NULL, DEFAULT 0 | Indica si el usuario es invitado (`1`) o registrado (`0`) |
| `role` | ENUM | `'customer'`, `'admin'` | Rol del usuario en el sistema |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de registro / alta |

#### Tabla: `products`
Catálogo de todos los artículos disponibles en la tienda.

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador del producto |
| `name` | VARCHAR(150) | NOT NULL | Nombre comercial de la pieza |
| `description` | TEXT | NULL | Descripción artesanal y especificaciones |
| `price` | DECIMAL(10,2) | NOT NULL | Precio de venta regular |
| `discount_price` | DECIMAL(10,2) | NULL | Precio con descuento (`NULL` si no aplica) |
| `is_available` | TINYINT(1) | NOT NULL, DEFAULT 1 | `1` = disponible, `0` = agotado |
| `image_url` | VARCHAR(255) | NOT NULL | URL del recurso en Cloudinary CDN |
| `category` | VARCHAR(50) | NOT NULL | Categoría principal del producto |
| `subcategory` | VARCHAR(50) | NULL | Subcategoría (ej. Manillas, Collares) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de alta |

> ⚠️ El campo `is_available` reemplaza el manejo de stock numérico. La administradora marca manualmente si un producto está agotado desde el panel de administración, sin necesidad de llevar inventario cuantitativo.

#### Tabla: `orders`
Cabecera de cada transacción comercial realizada.

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Número de orden único |
| `user_id` | INT | FK → `users(id)` | Cliente que realiza la compra |
| `total` | DECIMAL(10,2) | NOT NULL | Monto total final pagado |
| `status` | ENUM | `pending/paid/shipped/cancelled` | Estado actual de la transacción |
| `payment_intent_id` | VARCHAR(255) | UNIQUE, NULL | ID de transacción del pago (pasarela por definir) |
| `shipping_address` | TEXT | NULL | Dirección de entrega en formato JSON |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha y hora de la compra |

#### Tabla: `order_items`
Detalle de los artículos incluidos en cada orden. Los precios se guardan al momento de la compra para inmutabilidad histórica.

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador de línea |
| `order_id` | INT | FK → `orders(id)` ON DELETE CASCADE | Vínculo a la cabecera de orden |
| `product_id` | INT | FK → `products(id)` ON DELETE RESTRICT | Vínculo al producto comprado |
| `quantity` | INT | NOT NULL | Unidades adquiridas |
| `price_at_purchase` | DECIMAL(10,2) | NOT NULL | Precio al momento de la compra (inmutable) |

#### Tabla: `reviews`
Reseñas y valoraciones dejadas por clientes sobre productos comprados.

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador de la reseña |
| `product_id` | INT | FK → `products(id)` ON DELETE CASCADE | Producto evaluado |
| `user_id` | INT | FK → `users(id)` SET NULL | Cliente que reseña (`NULL` si eliminó cuenta) |
| `rating` | TINYINT | NOT NULL, 1–5 | Puntuación de 1 a 5 estrellas |
| `comment` | TEXT | NULL | Comentario opcional del cliente |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de publicación |

#### Tabla: `shipments`
Registro de información de envío y seguimiento de cada orden despachada.

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador del envío |
| `order_id` | INT | FK → `orders(id)` CASCADE, UNIQUE | Orden asociada (1:1) |
| `carrier` | VARCHAR(100) | NULL | Transportadora (ej. Coordinadora, Servientrega) |
| `tracking_number` | VARCHAR(100) | NULL | Número de guía |
| `status` | ENUM | `pending/dispatched/in_transit/delivered/returned` | Estado del envío |
| `dispatched_at` | TIMESTAMP | NULL | Fecha y hora de despacho |
| `estimated_delivery` | DATE | NULL | Fecha estimada de entrega |
| `notes` | TEXT | NULL | Notas internas de la administradora |

### 3.2. Relaciones del Modelo

- Un **Usuario** puede generar muchas **Órdenes** `(1:N)`.
- Una **Orden** contiene muchos **Ítems de Orden** `(1:N)`.
- Un **Producto** puede aparecer en muchos **Ítems de Orden** `(1:N)`.
- Un **Producto** puede tener muchas **Reseñas** `(1:N)`.
- Una **Orden** tiene un único **Envío** asociado `(1:1)`.

---

## 4. Diseño de la API REST

El backend expone una interfaz estructurada bajo el estándar REST. Todas las respuestas viajan en formato JSON. Los endpoints protegidos requieren un token JWT válido en el header `Authorization: Bearer <token>`.

### 4.1. Módulo de Autenticación

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/auth/register` | POST | Registro de nuevos clientes. Encripta la contraseña con Argon2 y retorna un token JWT. |
| `/api/auth/login` | POST | Inicio de sesión. Valida credenciales y retorna token JWT con rol del usuario. |
| `/api/auth/logout` | POST | Invalida la sesión activa del cliente (blacklist del token). |

### 4.2. Módulo de Productos y Catálogo

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/products` | GET | Lista paginada del catálogo. Soporta filtros por categoría, subcategoría y estado (disponible/agotado/descuento). |
| `/api/products/:id` | GET | Detalle completo de un producto: precio, descuento, disponibilidad, imágenes y reseñas. |
| `/api/products/:id/reviews` | GET | Lista de reseñas y rating promedio de un producto. |
| `/api/products/:id/reviews` | POST *(auth)* | Publica una reseña. Solo permitido a clientes con al menos una orden del producto en estado `paid`. |

### 4.3. Módulo de Checkout y Pagos (Pasarela por definir)

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/checkout/create-intent` | POST *(auth)* | (Pendiente por definir) Recibe el carrito de compras, valida precios reales contra MySQL, y crea la transacción en la pasarela de pagos seleccionada. |
| `/api/checkout/webhook` | POST *(público)* | (Pendiente por definir) Escucha notificaciones asíncronas de la pasarela de pagos para actualizar el estado de la orden a `paid`. |

**Nota de diseño:** La integración de la pasarela de pagos automática (como Stripe, Wompi, Bold, etc.) queda pendiente por definir. En la versión actual, el flujo de compra procesa y registra la orden en la base de datos en estado `pending`, y el usuario recibe instrucciones para el pago manual o acuerdo directo.

### 4.4. Módulo de Envíos

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/orders/:id/shipment` | GET *(auth)* | Consulta el estado del envío de una orden. El cliente ve su número de guía y transportadora. |
| `/api/admin/shipments` | POST *(admin)* | Registra la información de despacho: transportadora, número de guía y fecha. |
| `/api/admin/shipments/:id` | PATCH *(admin)* | Actualiza el estado del envío (ej. de `dispatched` a `in_transit` o `delivered`). |

### 4.5. Módulo de Administración

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/admin/products` | GET *(admin)* | Lista todos los productos con controles de edición. |
| `/api/admin/products` | POST *(admin)* | Crea un nuevo producto. Acepta URL de Cloudinary, precio, descuento y estado. |
| `/api/admin/products/:id` | PATCH *(admin)* | Actualiza cualquier campo del producto (nombre, precio, descuento, disponibilidad). |
| `/api/admin/products/:id` | DELETE *(admin)* | Elimina un producto (soft delete para preservar historial de órdenes). |
| `/api/admin/orders` | GET *(admin)* | Lista todas las órdenes con filtros por estado y rango de fechas. |
| `/api/admin/orders/:id` | PATCH *(admin)* | Actualiza el estado de una orden manualmente (ej. a `shipped` o `cancelled`). |
| `/api/admin/upload` | POST *(admin)* | Sube un archivo de imagen al servidor, lo procesa y lo sube directamente a Cloudinary, retornando la URL segura. |

---

## 5. Flujo de Checkout Paso a Paso

### Paso 1 — Selección y Carrito
- El cliente navega el catálogo y agrega productos al carrito.
- El carrito se persiste en `LocalStorage` del navegador.
- Se muestran precio regular o precio con descuento según el campo `discount_price` del producto.
- Los productos agotados muestran el badge **«Agotado»** y no se pueden agregar al carrito.

### Paso 2 — Identificación en el Checkout (Opcional de Cuentas)
Al iniciar el checkout, el sistema ofrece dos alternativas claras:
1.  **Compra con Cuenta Existente:** El cliente inicia sesión. Sus datos básicos (nombre, correo, identificación, dirección) se autocompletan en el formulario.
2.  **Compra como Invitado:** El cliente continúa directamente sin iniciar sesión. Se le solicitan únicamente los siguientes datos esenciales:
    *   Correo Electrónico (para notificaciones y seguimiento).
    *   Número de Identificación (Cédula de Ciudadanía o NIT, requerido para facturación y guías de envío nacionales).
    *   Nombre Completo.
    *   Teléfono Celular de contacto.
    *   Dirección y Ciudad de entrega.

### Paso 3 — Procesamiento del Pedido y Creación del Usuario Invitado
- El frontend envía el carrito de compras junto con los datos del cliente al backend (`POST /api/checkout/guest-intent`).
- El backend valida el inventario de los productos y sus precios vigentes en la base de datos (nunca confía en el precio del frontend).
- **Lógica de Usuario Híbrido:**
    *   Si el correo ingresado no existe en la base de datos, el sistema crea un nuevo registro `User` marcado con `is_guest = true` y `password_hash = null`.
    *   Si el correo ya existe como invitado, se actualizan sus datos básicos si cambiaron.
    *   Si el correo ya pertenece a un cliente registrado, la compra se asocia a su ID de usuario para trazabilidad sin obligarlo a iniciar sesión.
- Se genera el registro de la compra (`Order`) en estado `pending` asociada a dicho usuario.
- Se crea el registro logístico (`Shipment`) en estado `pending` enlazado a la orden.

### Paso 4 — Pago o Acuerdo de Compra
- En la versión actual, al estar pendiente la integración de la pasarela de pagos automática, la orden se registra en la base de datos.
- El cliente recibe instrucciones en pantalla (ej: transferencia bancaria, pago contra entrega o acuerdo con el vendedor).
- La administradora puede cambiar el estado de pago de la orden manualmente a `paid` desde el Panel de Administración una vez confirmado el ingreso del dinero.

### Paso 5 — Post-Compra & Despacho
- El cliente ve la confirmación en pantalla con su número de orden.
- Si el cliente desea registrarse en ese momento, puede asignar una contraseña; el sistema actualizará su usuario (`is_guest = false`, guardando el `password_hash`), permitiéndole acceder en adelante a su historial de compras en `/cuenta`.
- La administradora gestiona el despacho en `/admin/ordenes`, asigna la transportadora y número de guía, y actualiza el estado del envío.
- El cliente puede consultar el estado de su envío desde su perfil en `/cuenta` si tiene su cuenta activada.

---

## 6. Sistema de Reseñas y Valoraciones

### 6.1. Reglas de Negocio
- Solo puede reseñar un producto un cliente que tenga al menos una orden de ese producto en estado `paid`.
- Cada cliente puede dejar únicamente una reseña por producto.
- Las reseñas incluyen una calificación de 1 a 5 estrellas y un comentario opcional.
- La administradora puede eliminar reseñas inapropiadas desde el panel de administración.

### 6.2. Visualización en el Catálogo
- Cada tarjeta de producto muestra el rating promedio (estrellas) y el número total de reseñas.
- La página de detalle del producto muestra las últimas reseñas con nombre del comprador, rating y comentario.

---

## 7. Sistema de Notificaciones

### 7.1. Notificaciones por Correo Electrónico

Se implementa un servicio de correo transaccional (Nodemailer + proveedor SMTP como Resend o SendGrid) para los siguientes eventos:

| Evento | Destinatario | Contenido |
|---|---|---|
| Orden confirmada (`paid`) | Cliente | Número de orden, resumen de productos, total pagado y dirección de entrega |
| Orden despachada | Cliente | Número de guía, transportadora y enlace de seguimiento |
| Nueva orden | Administradora | Notificación de compra con detalle completo para preparar el despacho |
| Registro de cuenta | Cliente | Bienvenida a Almarte con confirmación de email |

### 7.2. Integración Futura con WhatsApp

El sistema está diseñado para admitir en el futuro una integración con la API de WhatsApp Business (Meta) o una plataforma intermediaria como Twilio. Los eventos de notificación están encapsulados en un `NotificationService` independiente, lo que permite agregar el canal de WhatsApp sin modificar la lógica de negocio existente.

> ⚠️ Esta integración queda fuera del alcance de la versión 1.0. Se documenta aquí como decisión de diseño deliberada para facilitar la extensión futura.

---

## 8. Diseño Visual del Sistema

La identidad visual de Almarte Artesanos refleja la naturaleza orgánica, artesanal y mística de los productos. El diseño es minimalista y centrado en las piezas, dejando que cada producto sea el protagonista visual.

### 8.1. Paleta de Colores

| Rol | Nombre | Hex | Uso |
|---|---|---|---|
| Fondo principal | Crema Cálido | `#F5F0E8` | Background de páginas y layouts |
| Fondo secundario | Marfil Suave | `#FAF7F2` | Tarjetas, modales, secciones alternas |
| Superficie | Arena Natural | `#E8DFD0` | Headers de tablas, separadores, chips |
| Acento principal | Tierra Dorada | `#9B7E5A` | CTAs, iconos, bordes destacados |
| Acento suave | Camel Claro | `#C4A882` | Estados hover, badges de descuento |
| Texto principal | Carbón | `#2C2C2C` | Cuerpo de texto, títulos de productos |
| Texto secundario | Gris Piedra | `#6B6B6B` | Metadatos, precios originales, placeholders |
| Título principal | Café Oscuro | `#5C3D1E` | H1, logo, elementos de alta jerarquía |
| Divisor | Gris Beige | `#D4C9B8` | Bordes de tarjetas, líneas separadoras |
| Blanco | Blanco Puro | `#FFFFFF` | Texto sobre fondos oscuros, áreas de formulario |

### 8.2. Tipografía

| Familia | Rol | Pesos | Ejemplo de uso |
|---|---|---|---|
| Playfair Display | Serif — Títulos | Regular, Bold | Nombre de la marca, H1/H2, nombres de productos |
| DM Sans | Sans-serif — Cuerpo | 400, 500, 700 | Descripciones, precios, botones, metadatos |

> Google Fonts recomendadas para producción: **Playfair Display** (títulos) + **DM Sans** (cuerpo). Ambas con subset `latin` y `display:swap` para rendimiento óptimo.

### 8.3. Principios de Diseño

- **Minimalismo funcional:** espacio negativo generoso, máximo 2–3 elementos por área visual.
- Las fotografías de producto son el foco; los elementos de UI son discretos y no compiten.
- Sin uso de negro puro (`#000000`); se prefiere el carbón (`#2C2C2C`) para mayor calidez.
- Los botones primarios usan el color Tierra Dorada con texto blanco. Los secundarios son tipo `outline`.
- Los badges de «Agotado» usan un gris neutro. Los de «Descuento» usan el acento cálido.

### 8.4. Vistas Principales

#### Home / Landing
- Hero con imagen de ambiente artesanal, titular en serif grande y CTA «Explorar catálogo».
- Sección de categorías con íconos orgánicos o fotografías cuadradas.
- Productos destacados en grid de 3 columnas (desktop) / 2 columnas (móvil).
- Sección de valores de marca: «Hecho a mano», «Energía intencional», «Envío a todo Colombia».

#### Catálogo
- Filtros laterales: categoría, subcategoría, rango de precio, disponibilidad, con descuento.
- Grid de tarjetas de producto con foto, nombre, precio, badge de descuento/agotado y rating.
- Paginación o infinite scroll.

#### Detalle de Producto
- Galería de imágenes con zoom (imágenes desde Cloudinary).
- Precio regular tachado + precio con descuento si aplica.
- Badge «Agotado» con opción de lista de espera (futuro).
- Descripción artesanal, especificaciones y propiedades energéticas.
- Sección de reseñas con rating promedio y lista de comentarios verificados.

#### Checkout
- Vista limpia de 3 pasos: Carrito → Dirección de envío → Pago/Confirmación.
- Formulario de pago o confirmación de pedido (pasarela automática pendiente por definir).
- Resumen de orden persistente en el lateral durante todo el proceso.

#### Panel de Administración
- Acceso restringido por rol `admin`, ruta `/admin`.
- Dashboard con métricas básicas: órdenes del día, ingresos, productos activos.
- Gestión de productos: tabla con edición inline de disponibilidad y precio.
- Gestión de órdenes: tabla filtrable con acceso al detalle y formulario de despacho.

### 8.5. Componentes Reutilizables

| Componente | Descripción |
|---|---|
| `<ProductCard />` | Tarjeta de catálogo con imagen, nombre, precio, badges y botón de agregar |
| `<PriceDisplay />` | Muestra precio con descuento tachando el original, o solo el precio regular |
| `<AvailabilityBadge />` | Badge dinámico: «Disponible» / «Agotado» / «% Descuento» |
| `<StarRating />` | Renderiza estrellas llenas/medias/vacías según el rating promedio |
| `<CartDrawer />` | Panel lateral deslizante con el resumen del carrito |
| `<CheckoutStepper />` | Indicador de progreso de los 3 pasos del checkout |
| `<ShipmentTracker />` | Tarjeta de seguimiento de envío con estado visual |

---

## 9. Estructura del Proyecto

```
almarte-artesanos/
├── backend/
│   ├── src/
│   │   ├── config/          # Conexión MySQL, Pool y Cloudinary
│   │   ├── controllers/     # Auth, Products, Orders, Shipments, Admin
│   │   ├── middlewares/     # Validación JWT, roles, esquemas Zod/Joi
│   │   ├── models/          # Definiciones ORM (Prisma/Sequelize)
│   │   ├── services/        # StripeService, NotificationService, ShipmentService
│   │   ├── routes/          # Registro de rutas por módulo
│   │   └── app.js           # Punto de entrada Express
│   ├── package.json
│   └── passenger_wsgi.js    # Configuración de arranque en Hostinger
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/      # ProductCard, PriceDisplay, CartDrawer, etc.
    │   ├── context/         # CartContext, AuthContext
    │   ├── hooks/           # useProducts, useCheckout, useReviews
    │   ├── pages/           # Home, Catalog, Product, Checkout, Profile, Admin
    │   ├── services/        # api.js (cliente HTTP centralizado)
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## 10. Lista de Verificación para el Despliegue

### 10.1. Configuración del Servidor
- [ ] Variables de entorno (`.env`): `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (y variables de la pasarela de pagos cuando se defina).
- [ ] CORS configurado explícitamente en Express/Next.js para el dominio del frontend.
- [ ] Certificado SSL/HTTPS activo (obligatorio para pasarelas de pago y seguridad general).
- [ ] Configuración de Webhook/APIs de la pasarela de pagos en el entorno de producción (cuando se defina).

### 10.2. Frontend
- [ ] `npm run build` ejecutado antes del despliegue.
- [ ] Variable de entorno para URL de producción.
- [ ] Credenciales de la pasarela de pagos en producción (cuando se defina).

### 10.3. Base de Datos
- [ ] Migraciones ejecutadas en MySQL de producción con todas las tablas y relaciones.
- [ ] Usuario de base de datos con permisos mínimos necesarios (no root).
- [ ] Connection Pool con límite máximo de 15 conexiones configurado.

### 10.4. Pruebas Pre-Lanzamiento
- [ ] Prueba de flujo de compra completo en modo de prueba / manual.
- [ ] Verificar llegada de correo de confirmación al cliente tras orden pagada.
- [ ] Verificar notificación a la administradora por nueva orden.
- [ ] Probar flujo de despacho desde el panel de administración.
- [ ] Prueba en dispositivo móvil (iOS + Android) del flujo de checkout completo.
