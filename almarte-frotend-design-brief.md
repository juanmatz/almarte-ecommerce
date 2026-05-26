# ALMARTE ARTESANOS — Frontend Design Brief

Guía completa para el agente de IA
Versión 1.1 — Actualizado con Identidad de Marca y Categorías Finales

## INSTRUCCIÓN MAESTRA

Eres el agente encargado de construir el frontend de Almarte Artesanos, una tienda de comercio electrónico de joyería artesanal, cuarzos, minerales y productos de bienestar hechos a mano, orientada al mercado colombiano.

**Stack técnico obligatorio:**

* React + Vite (build estático hacia `public_html`)
* React Router para enrutamiento
* React Context para estado global (carrito + autenticación)
* LocalStorage para persistencia del carrito
* Stripe Elements para el formulario de pago
* Tailwind CSS como sistema de utilidades base

---

## PARTE 1 — IDENTIDAD VISUAL

### 1.1. Paleta de Colores (Basada en Logotipo Oficial)

Usa estas variables CSS en `:root`. No uses ningún color fuera de esta paleta salvo blanco puro en texto sobre fondos oscuros.

```css
:root {
  --color-bg-primary:    #F5F0E8;  /* Crema Cálido — fondo de páginas */
  --color-bg-secondary:  #FAF7F2;  /* Marfil Suave — tarjetas, modales */
  --color-surface:       #E8DFD0;  /* Arena Natural — headers, chips, separadores */
  
  /* Colores extraídos del Logo */
  --color-brand-main:    #43503C;  /* Verde Olivo Almarte — Árbol, texto principal, alta jerarquía */
  --color-accent:        #C6764B;  /* Terracota Sol — CTAs principales, iconos, destacados */
  --color-accent-soft:   #DB9773;  /* Terracota Suave — hover states, badges de descuento */
  
  /* Textos y Separadores */
  --color-text-primary:  #2B2D29;  /* Carbón Oliva — cuerpo de texto premium */
  --color-text-secondary:#6E736A;  /* Gris Musgo — metadatos, precios tachados */
  --color-title:         #43503C;  /* Verde Olivo Profundo — H1, H2, títulos de producto */
  --color-divider:       #D4C9B8;  /* Gris Beige — bordes de tarjetas y líneas divisorias */
  --color-white:         #FFFFFF;  /* Texto sobre fondos oscuros */
}

```

> **Regla estricta:** Nunca uses negro puro (`#000000`). El texto más oscuro y de mayor jerarquía debe heredar `--color-title` (`#43503C`).

### 1.2. Tipografía

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">

```

```css
/* Aplicar globalmente */
body {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
}

h1, h2, .brand-name, .product-name {
  font-family: 'Playfair Display', serif;
  color: var(--color-title);
}

```

| Elemento | Fuente | Peso | Tamaño |
| --- | --- | --- | --- |
| **Logo / Marca** | Playfair Display | Bold (700) | Variable |
| **H1 Hero** | Playfair Display | Bold (700) | 48–64px |
| **H2 Sección** | Playfair Display | Regular (400) | 32–40px |
| **Nombre de producto** | Playfair Display | Regular (400) | 20–24px |
| **Precio, botones, nav** | DM Sans | Medium (500) | 14–16px |
| **Descripciones, body** | DM Sans | Regular (400) | 15–16px |
| **Metadatos, labels** | DM Sans | Regular (400) | 12–13px |

### 1.3. Botones

* **Primario:** Fondo `--color-accent` (`#C6764B`) · texto `#FFFFFF` · border-radius 4px · padding 12px 24px.
* **Secundario:** Fondo transparent · borde 1px solid `--color-brand-main` (`#43503C`) · texto `#43503C` · hover: fondo `#43503C` / texto `#FFFFFF`.
* **Destructivo:** Fondo transparent · borde 1px solid `#CC4444` · texto `#CC4444`.
* **Deshabilitado:** Fondo `#D4C9B8` · texto `#6E736A` · cursor not-allowed.

### 1.4. Tarjetas de Producto

* **Fondo:** `#FAF7F2`
* **Borde:** 1px solid `#D4C9B8`
* **Border-radius:** 8px
* **Sombra:** `0 2px 8px rgba(0,0,0,0.06)`
* **Hover:** Sombra aumenta a `0 4px 16px rgba(0,0,0,0.10)` · `translateY(-2px)`
* **Padding:** 0 (imagen al borde) + 12px en área de texto

---

## PARTE 2 — ARQUITECTURA DE VISTAS (RUTAS)

```
/                         → Home (Landing)
/catalogo                 → Catálogo con filtros
/catalogo/:categoria      → Catálogo pre-filtrado por categoría
/producto/:id             → Detalle de producto
/checkout/carrito         → Paso 1: Revisión del carrito
/checkout/envio           → Paso 2: Dirección de envío
/checkout/pago            → Paso 3: Pago con Stripe
/checkout/confirmacion    → Orden confirmada (post-pago)
/cuenta                   → Perfil + historial de órdenes
/cuenta/login             → Login
/cuenta/registro          → Registro
/cuenta/orden/:id         → Detalle de orden + estado de envío
/admin                    → Dashboard administración (rol admin)
/admin/productos          → Gestión de productos
/admin/ordenes            → Gestión de órdenes

```

---

## PARTE 3 — LAYOUT GLOBAL

### 3.1. Estructura de página

```
┌─────────────────────────────────────┐
│         ANNOUNCEMENT BAR            │  ← 36px, bg #43503C, texto blanco
│  "Envíos a todo Colombia · Pago seguro con Stripe"  │
├─────────────────────────────────────┤
│              HEADER                  │  ← sticky, bg #FAF7F2, borde inferior
│  Logo   Nav principal   Íconos       │
├─────────────────────────────────────┤
│                                      │
│           MAIN CONTENT               │
│                                      │
├─────────────────────────────────────┤
│              FOOTER                  │
└─────────────────────────────────────┘

```

### 3.2. Header

* **Estructura interna:**
`[Logo "ALMARTE ARTESANOS"] .......... [NUEVO] [ACCESORIOS ▾] [KITS ENERGÉTICOS] [CUARZOS Y MINERALES] [AROMAS & VELAS] [RITUALES Y BIENESTAR] .......... [🔍] [👤] [🛒 (2)]`
* **Logo:** Texto o SVG oficial de "Almarte Artesanos" aplicando tipografía serif de alta fidelidad, color `--color-brand-main` (`#43503C`).
* **Nav:** DM Sans 500, 13px, uppercase, letter-spacing 0.08em, color `#2B2D29`.
* "ACCESORIOS" despliega un mega-menú dropdown con las subcategorías oficiales: *Manillas, Collares, Aretes y Anillos*.
* Ícono del carrito muestra un badge numérico con fondo `--color-accent` (`#C6764B`) cuando contiene ítems.
* **En mobile (< 768px):** Hamburger menu, carrito siempre visible.
* **Comportamiento sticky:** Al hacer scroll > 80px, la barra de anuncios desaparece y el header se vuelve compacto con una sombra sutil.

### 3.3. Footer

* **4 columnas (desktop) / Acordeón (mobile):**
* **Col 1:** Logo + descripción breve de la marca + redes sociales.
* **Col 2:** Navegación — Accesorios / Kits Energéticos / Cuarzos / Aromas / Bienestar.
* **Col 3:** Ayuda — Preguntas frecuentes / Envíos / Devoluciones / Contacto.
* **Col 4:** Confianza — Íconos de pago aceptados (Visa, MC, PSE, etc.) + texto "Pago 100% seguro con Stripe".


* **Fondo footer:** `--color-brand-main` (`#43503C`), **Texto:** `#FAF7F2`.

---

## PARTE 4 — VISTAS DETALLADAS

### VISTA: Home / Landing (`/`)

* **Sección 1 — Hero (100vh)**
* Imagen de fondo: Fotografía artesanal en ambiente cálido y místico, oscurecida con un overlay orgánico `rgba(35,43,32,0.4)`.
* Contenido centrado:
* `[Eyebrow]` "JOYERÍA ARTESANAL · ENERGÍA INTENCIONAL" → DM Sans 500 12px, letter-spacing 0.15em, color `--color-accent-soft` (`#DB9773`).
* `[H1]` "Accesorios que elevan tu energía" → Playfair Display 700 56px, color `#FAF7F2`.
* `[Subtítulo]` "Piezas únicas elaboradas a mano, cargadas de intención" → DM Sans 400 18px, color `rgba(250,247,242,0.85)`.
* `[CTA]` Botón primario Terracota "Explorar catálogo" → href `/catalogo`.




* **Sección 2 — Categorías Principales Visuales**
* Título centrado: "Encuentra tu intención".
* Grid basado en las 5 colecciones de la marca utilizando tarjetas estilizadas.


* **Sección 3 — Productos Destacados**
* Grid de productos favoritos con componente `<ProductCard />`.


* **Sección 4 — Propuesta de Valor**
* Fondo `#E8DFD0`, 3 columnas con iconos limpios: `[✋ Hecho a mano]`, `[✨ Energía intencional]`, `[🚚 Envío a todo Colombia]`.


* **Sección 5 — Newsletter**
* Fondo `--color-brand-main` (`#43503C`), texto crema, botón en contraste Terracota.



### VISTA: Catálogo (`/catalogo`)

#### Panel de Filtros Estricto (Sidebar izquierdo en Desktop / Bottom sheet en Mobile)

* **CATEGORÍAS** (Estructura idéntica a la imagen):
* `[ ]` Accesorios
* `[ ]` Manillas
* `[ ]` Collares
* `[ ]` Aretes
* `[ ]` Anillos


* `[ ]` Kits Energéticos
* `[ ]` Cuarzos y Minerales
* `[ ]` Aromas & Velas
* `[ ]` Rituales y Bienestar


* **PRECIO:** Slider range de `$0` a `$500.000`.
* **DISPONIBILIDAD:** Checkbox para filtrar solo artículos con stock.

### COMPONENTE: `<ProductCard />`

```
┌─────────────────────┐
│                     │
│    [IMAGEN 1:1]     │  ← aspect-ratio: 1/1, object-fit: cover, hover zoom sutil
│                     │
│  [Badge descuento]  │  ← badge top-left: "-15%", fondo #DB9773, texto #FFF
│  [Badge agotado]    │  ← badge top-left: "Agotado", fondo #D4C9B8, texto #6E736A
├─────────────────────┤
│ Nombre del producto │  ← Playfair Display 16px, color #43503C
│ Subcategoría        │  ← DM Sans 12px, color #6E736A, uppercase
│ ★★★★☆ (4.2) · 18   │  ← StarRating (Estrellas llenas en #C6764B)
│ ~~$60.000~~ $50.000 │  ← precio tachado en gris, precio nuevo en color #C6764B Bold
│ [+ Agregar]         │  ← botón primario, transición suave en hover
└─────────────────────┘

```

---

## PARTE 5 — COMPONENTES REUTILIZABLES

* **`<PriceDisplay />`**
Muestra el precio regular. Si existe `discountPrice`, tacha el original en `--color-text-secondary` e ilumina el nuevo valor con `--color-accent` (`#C6764B`).
* **`<AvailabilityBadge />`**
Muestra dinámicamente "Agotado" en gris beige o el porcentaje de descuento en `--color-accent-soft` (`#DB9773`).
* **`<StarRating />`**
Renderiza estrellas para las reseñas. Las estrellas llenas adoptan el color activo `--color-accent` (`#C6764B`) o un tono dorado armónico, y las vacías `--color-divider`.
* **`<CheckoutStepper />`**
Control de pasos del checkout. El indicador activo se resalta en `--color-brand-main` o `--color-accent`.

---

## PARTE 6 — GESTIÓN DE ESTADO

*(Sin cambios. Mantiene la arquitectura limpia de `CartContext` y `AuthContext` conectados a LocalStorage y control de tokens JWT).*

---

## PARTE 7 — CONEXIÓN CON LA API

*(Sin cambios. Centralizado en `src/services/api.js` mapeando endpoints de productos, reseñas, checkout y administración).*

---

## PARTE 8 — COMPORTAMIENTOS UX IMPORTANTES

* **Precios y Acciones:** Los botones de compra y estados activos interactúan directamente con los tonos terracota, garantizando una excelente tasa de conversión visual sin perder la estética mística y limpia.
* **Skeletons:** Durante la carga del catálogo se renderizan bloques simulados con el fondo neutro `--color-bg-secondary` (`#FAF7F2`).

---

## PARTE 9 — CATEGORÍAS DEL CATÁLOGO (Estructura de Datos Exacta)

Utilizar este arreglo global estricto para inicializar filtros, validación de rutas y payload de la API:

```javascript
const CATEGORIES = [
  {
    name: "Accesorios",
    slug: "accesorios",
    subcategories: ["Manillas", "Collares", "Aretes", "Anillos"]
  },
  {
    name: "Kits Energéticos",
    slug: "kits-energeticos",
    subcategories: []
  },
  {
    name: "Cuarzos y Minerales",
    slug: "cuarzos-y-minerales",
    subcategories: []
  },
  {
    name: "Aromas & Velas",
    slug: "aromas-y-velas",
    subcategories: []
  },
  {
    name: "Rituales y Bienestar",
    slug: "rituales-y-bienestar",
    subcategories: []
  }
];

```

---

## PARTE 10 — CHECKLIST DE IMPLEMENTACIÓN

* [ ] Comprobar que ningún componente renderice color negro puro (`#000000`) o marrón antiguo (`#5C3D1E`).
* [ ] Verificar la navegación exacta y dropdowns del header con las 5 categorías de la marca.
* [ ] Validar el contraste de lectura sobre fondos oscuros (como el Footer Verde Olivo) usando siempre texto blanco o marfil suave.

