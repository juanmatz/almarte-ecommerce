# Bitácora de Cambios (CHANGELOG) — Almarte E-commerce

Registro cronológico de todas las características, correcciones, mejoras de seguridad y actualizaciones de documentación realizadas en el proyecto, conforme a las directrices de [GEMINI.md](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/GEMINI.md).

---

### [2026-10-21] - [Feature] IMP-01 & IMP-02: Integración de Pasarela Oficial Wompi (Bancolombia) y Webhook Idempotente
- **Descripción:** Se integró la pasarela oficial de pagos para Colombia **Wompi (Bancolombia)** con soporte nativo para **Bancolombia (Botón/QR), Nequi, PSE y Tarjetas de Crédito/Débito**:
  1. **Skill Especializada y Descubrimiento:** Se localizó e instaló la skill oficial de Wompi (`noxai-co/wompi-skills@wompi`) en `.agents/skills/wompi` mediante `/find-skills` (`npx skills`).
  2. **Configuración de Entorno Sandbox:** Se configuraron las variables seguras de prueba en `.env` y se creó la plantilla oficial documentada [`.env.example`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/.env.example) (`NEXT_PUBLIC_WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`, `NEXT_PUBLIC_BASE_URL`).
  3. **Módulo Utilitario (`lib/wompi.ts`):** Generación de firma criptográfica de integridad SHA-256 (`reference + amountInCents + currency + integritySecret`), validación resistente a ataques de temporización de webhooks (`timingSafeEqual`), y cliente para consultar transacciones.
  4. **Generación de Firma en Servidor:** `app/api/checkout/guest-intent/route.ts` genera referencias únicas (`ALM-{orderId}-{timestamp}`), calcula el total en centavos COP (`total * 100`) y entrega la firma de integridad directamente al cliente, protegiendo las credenciales privadas.
  5. **Webhook Asíncrono e Idempotente (`app/api/webhooks/wompi/route.ts`):** Valida la firma del evento, procesa transiciones de estado (`APPROVED` -> `paid`, `DECLINED`, `VOIDED` -> `cancelled`), previene doble acreditación con verificación por transacción ID y actualiza notas de despacho.
  6. **Verificación Post-Redirección (`app/api/checkout/wompi/verify/route.ts`):** Consulta directa al API de Wompi para verificar el estado de la transacción ante redirecciones de clientes sin confiar únicamente en parámetros de URL.
  7. **Experiencia de Usuario en Checkout y Confirmación:** En [app/checkout/page.tsx](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/checkout/page.tsx), selector de pago (Wompi automático vs transferencia manual), invocación del widget modal interactivo con fallback a checkout web, y nueva pantalla ceremonial de confirmación de pedido en [app/checkout/confirmacion/page.tsx](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/checkout/confirmacion/page.tsx) con soporte para activación de cuentas de invitados.
  8. **Seguridad y Middleware:** En `middleware.ts`, se habilitó el bypass público defensivo para `/api/webhooks` y `/api/checkout/wompi/verify`.
- **Archivos Modificados:**
  - `lib/wompi.ts` (creado)
  - `.env`
  - `.env.example` (creado)
  - `middleware.ts`
  - `app/api/checkout/guest-intent/route.ts`
  - `app/api/webhooks/wompi/route.ts` (creado)
  - `app/api/checkout/wompi/verify/route.ts` (creado)
  - `app/checkout/page.tsx`
  - `app/checkout/confirmacion/page.tsx` (creado)
  - `docs/ROADMAP.md`
  - `docs/CHANGELOG.md`
- **Impacto / Pruebas:** Compilación de producción validada exitosamente con `yarn build` en Next.js Turbopack; las rutas de checkout, confirmación y endpoints API generados sin errores.

---

### [2026-10-21] - [Feature] IMP-03: Control de Inventario Cuantitativo Atómico (Stock)
- **Descripción:** Se implementó el sistema integral de inventario cuantitativo y prevención de sobreventa para la tienda Almarte:
  1. **Esquema de Base de Datos:** Se incorporaron los campos `stock` (default 0) y `low_stock_alert` (default 2) en el modelo `Product` de Prisma, aplicando la migración `20261021235000_add_product_stock_fields` a MariaDB.
  2. **Transaccionalidad Atómica y Bloqueo de Concurrencia:** En `app/api/checkout/guest-intent/route.ts`, se agruparon las cantidades del pedido y se ejecutó un decremento atómico con `$transaction`. Si el stock resultante es menor a 0, se revierte la transacción arrojando error 409 (`INSUFFICIENT_STOCK`). Si llega a 0, se conmuta automáticamente `isAvailable: false`.
  3. **Control y Límites en Carrito:** En `context/CartContext.tsx`, los métodos `addToCart` y `updateQuantity` restringen las cantidades añadidas al inventario físico real disponible.
  4. **Experiencia de Usuario (UI):** En `components/AvailabilityBadge.tsx`, `components/ProductCard.tsx` y `components/ProductDetails.tsx`, se añadieron distintivos dinámicos de escasez (*"¡Solo quedan X!"* / *"Agotado"*) e inhabilitación inmediata de compra cuando no hay existencias.
  5. **Panel Administrativo:** En `app/admin/productos/page.tsx` y sus APIs (`/api/admin/products`), se agregó la columna de stock con badges cromáticos y los campos de entrada de inventario y umbral de alerta en el modal de gestión.
- **Archivos Modificados:**
  - `prisma/schema.prisma`
  - `prisma/migrations/20261021235000_add_product_stock_fields/migration.sql`
  - `prisma/seed.ts`
  - `app/api/checkout/guest-intent/route.ts`
  - `app/api/products/route.ts`
  - `app/api/products/[id]/route.ts`
  - `app/api/admin/products/route.ts`
  - `app/api/admin/products/[id]/route.ts`
  - `context/CartContext.tsx`
  - `components/AvailabilityBadge.tsx`
  - `components/ProductCard.tsx`
  - `components/ProductDetails.tsx`
  - `app/admin/productos/page.tsx`
  - `docs/CHANGELOG.md`
- **Impacto / Pruebas:** Se verificó la migración en MariaDB, se ejecutó `yarn seed` con inventarios reales de prueba, y se validó la compilación de producción con `yarn build` pasando chequeo de tipos estricto en Turbopack.

---

### [2026-10-21] - [Security & Fix] Resolución de los 7 Fallos Críticos (Must Fix) de Auditoría Ponytail
- **Descripción:** Se resolvieron de forma exhaustiva y minimalista los 7 hallazgos clasificados como *Must Fix* en `docs/AUDIT.md`:
  1. **Secreto JWT blindado:** Eliminación de fallbacks inseguros en código y creación de `getJwtSecret()` en `lib/auth.ts`, `middleware.ts` y `app/api/auth/login/route.ts`.
  2. **Prevención de secuestro de cuentas:** Bloqueo de adopción no autorizada de cuentas de invitados vía registro público en `app/api/auth/register/route.ts`.
  3. **Corrección de productos repetidos en carrito:** Uso de `Set(productIds).size` en `app/api/checkout/guest-intent/route.ts` para evitar rechazos falsos.
  4. **Prevención de error 500 por doble clic:** Creación de usuarios invitados con `prisma.user.upsert` ante envíos concurrentes de checkout.
  5. **Protección de datos de clientes registrados:** Prohibición de sobrescritura de `documentId` desde el checkout anónimo.
  6. **Restricción única en reseñas:** Adición de `@@unique([productId, userId])` en `prisma/schema.prisma` y manejo del código `P2002` en `app/api/products/[id]/route.ts`.
  7. **Desacoplamiento de migración y build:** Separación de `prisma migrate deploy` en script propio `migrate:deploy` en `package.json`.
- **Archivos Modificados:**
  - `lib/auth.ts`
  - `middleware.ts`
  - `app/api/auth/login/route.ts`
  - `app/api/auth/register/route.ts`
  - `app/api/checkout/guest-intent/route.ts`
  - `app/api/products/[id]/route.ts`
  - `prisma/schema.prisma`
  - `prisma/migrations/20261021234500_add_unique_review_constraint/migration.sql`
  - `package.json`
  - `docs/CHANGELOG.md`
- **Impacto / Pruebas:** Migración de base de datos ejecutada con `yarn prisma migrate deploy`, tipos regenerados con `yarn prisma generate`, y validación exitosa de compilación limpia de producción con `yarn build` sin errores.

---

### [2026-10-21] - [Audit] Auditoría Integral del Repositorio con Ponytail Audit (18 Hallazgos)
- **Descripción:** Se ejecutó una auditoría exhaustiva en modo senior developer (`/ponytail-audit`) evaluando corrección, seguridad, concurrencia bajo carga, cobertura de pruebas, velocidad y oportunidades de código magro (lean/anti-bloat). Se identificaron 18 hallazgos categorizados en Must fix (7), Should fix (8) y Nice to have (3), documentados en profundidad con soluciones concretas, archivo, líneas y riesgos en [docs/AUDIT.md](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/docs/AUDIT.md).
- **Archivos Modificados:**
  - `docs/AUDIT.md` (creado)
  - `docs/README.md` (actualizado)
  - `docs/CHANGELOG.md` (actualizado)
- **Impacto / Pruebas:** Trazabilidad formal y visibilidad completa de vulnerabilidades críticas (secuestro de cuentas de invitados, secreto JWT fallback en código, carreras de checkout concurrentes) y ruta de mitigación priorizada antes del lanzamiento comercial.

---

### [2026-10-21] - [Feature] Instalación de la Suite Ponytail (Modo Senior Minimalista / Anti-bloat)
- **Descripción:** Se instaló la suite de skills de **Ponytail** (`DietrichGebert/ponytail`) tanto a nivel global del usuario (`C:\Users\juanm\.gemini\config\skills\`) como a nivel de proyecto (`.agents/skills/`), incluyendo `ponytail`, `ponytail-review`, `ponytail-audit` y `ponytail-debt`. Ponytail activa el modo "lazy senior dev", forzando al asistente a seleccionar siempre la solución más simple, corta y con menor código nuevo posible (YAGNI, sin wrappers innecesarios ni dependencias superfluas). Se actualizó la matriz de skills en `GEMINI.md`.
- **Archivos Modificados:**
  - `C:\Users\juanm\.gemini\config\skills\ponytail*` (globales)
  - `.agents/skills/ponytail/SKILL.md`
  - `.agents/skills/ponytail-review/SKILL.md`
  - `.agents/skills/ponytail-audit/SKILL.md`
  - `.agents/skills/ponytail-debt/SKILL.md`
  - `GEMINI.md`
  - `docs/CHANGELOG.md`
- **Impacto / Pruebas:** Disponibilidad inmediata del comando y modo `/ponytail` para controlar y prevenir la sobre-ingeniería en futuras sesiones de codificación.

---

### [2026-10-21] - [Docs] Creación de la Hoja de Ruta y Próximas Implementaciones (ROADMAP.md)
- **Descripción:** Se diseñó y formalizó el documento estratégico y técnico [docs/ROADMAP.md](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/docs/ROADMAP.md) que estructura la evolución del sistema en 5 fases priorizadas (P0 a P2). Detalla la integración de pasarela de pagos Wompi (PSE/Nequi/Tarjetas), webhooks con firma criptográfica, control de inventario cuantitativo atómico, normalización geográfica DANE para fletes, motor de emails transaccionales, módulo de PQRs bajo la Ley 1480 y SEO dinámico. Se incluyó diagrama Mermaid de dependencias y matriz de esfuerzo/impacto. Se indexó en [docs/README.md](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/docs/README.md).
- **Archivos Modificados:**
  - `docs/ROADMAP.md` (creado)
  - `docs/README.md` (actualizado)
  - `docs/CHANGELOG.md`
- **Impacto / Pruebas:** Guía unificada y consensuada para los próximos sprints de desarrollo, garantizando continuidad arquitectónica y cumplimiento normativo.

---

### [2026-10-21] - [Docs] Documentación de Estrategia de Ramas Git y Auto-deploy a Hostinger
- **Descripción:** Se formalizó e incorporó en toda la documentación operativa y técnica (`AGENTS.md`, `GEMINI.md`, `docs/documentation.md` y `README.md`) la regla estricta sobre el flujo de ramas: la rama `main` cuenta con auto-deploy hacia Hostinger y **únicamente se toca con autorización previa y expresa del usuario**. Todo desarrollo ordinario, correcciones y nuevas funcionalidades deben ser subidos exclusivamente a la rama `develop`. Se incluyó un diagrama de flujo Mermaid explicativo.
- **Archivos Modificados:**
  - `AGENTS.md`
  - `GEMINI.md`
  - `docs/documentation.md`
  - `README.md`
  - `docs/CHANGELOG.md`
- **Impacto / Pruebas:** Regla inviolable fijada en las instrucciones de conducta del agente y en el manual maestro de arquitectura para evitar despliegues accidentales no deseados a producción.

---

### [2026-10-21] - [Fix] Compatibilidad de Carga de Variables de Entorno en Scripts de Prisma y Seed
- **Descripción:** Se configuró `--env-file=.env` en los scripts de ejecución de `tsx` (`seed` y `create-admin`) dentro de `package.json` para garantizar que la conexión a la base de datos MySQL local levantada en Docker se resuelva correctamente sin depender de variables globales del sistema operativo.
- **Archivos Modificados:**
  - `package.json`
  - `docs/CHANGELOG.md`
- **Impacto / Pruebas:** Ejecución exitosa de `yarn prisma migrate deploy` y `yarn seed` contra el contenedor `almarte-db`, verificando la disponibilidad y carga de los 8 productos de catálogo y órdenes de prueba.

---

### [2026-10-20] - [Docs] Centralización y Modernización de la Documentación del Sistema (v2.0)
- **Descripción:** Siguiendo las directrices de las skills `documentation-and-adrs` y `design-doc-mermaid`, se consolidó la documentación del proyecto eliminando archivos sueltos y desactualizados. Se reescribió [docs/documentation.md](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/docs/documentation.md) como el Manual Maestro de Arquitectura y Sistema v2.0 (reflejando la arquitectura real Next.js App Router, MariaDB/Prisma, Hostinger, diagramas Mermaid interactivos, sistema de diseño, seguridad y pruebas). Se creó [docs/README.md](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/docs/README.md) como Hub Central de Navegación y se trasladaron los borradores previos obsoletos a `docs/archive/`.
- **Archivos Modificados:**
  - `docs/documentation.md` (reescrito y actualizado v2.0)
  - `docs/README.md` (creado como hub central)
  - `docs/archive/` (archivados `almarte-frotend-design-brief.md`, `plan-pruebas-seguridad-produccion.md`, `requisitos-produccion.md`)
  - `docs/CHANGELOG.md`
- **Impacto / Pruebas:** Eliminación de discrepancias arquitectónicas (se removieron referencias obsoletas a Vite/Express), centralizando una fuente única de verdad técnica con diagramas Mermaid estandarizados.

---

### [2026-10-20] - [Feature] Instalación de Skills de Ecosistema y Matriz de Activación Automática
- **Descripción:** Instalación local en el proyecto (`.agents/skills/`) de las skills `documentation-and-adrs`, `design-doc-mermaid` y `security-and-hardening`. Se actualizó `GEMINI.md` con la Matriz de Activación Obligatoria que vincula cada fase de desarrollo (inspección, hardening, diagramación y documentación de arquitectura) con su respectiva skill para garantizar ejecución profesional continua.
- **Archivos Modificados:**
  - `.agents/skills/documentation-and-adrs/`
  - `.agents/skills/design-doc-mermaid/`
  - `.agents/skills/security-and-hardening/`
  - `GEMINI.md`
  - `docs/CHANGELOG.md`
- **Impacto / Pruebas:** Las 4 skills locales quedan activas, indexadas por Antigravity y reguladas contractualmente en el flujo de trabajo del repositorio.

---

### [2026-10-20] - [Docs] Establecimiento de Directrices Operativas y Flujo de Trabajo
- **Descripción:** Creación del archivo normativo de cabecera `GEMINI.md` para estandarizar el flujo de trabajo del asistente, incluyendo el ciclo obligatorio de 5 pasos (Inspección, Planificación, Implementación, Verificación y Documentación), directrices inviolables de gestor (`yarn`), manejo de moneda (`COP`), estándares de seguridad (OWASP, PCI-DSS) y cumplimiento legal colombiano (Habeas Data Ley 1581 y Estatuto del Consumidor Ley 1480).
- **Archivos Modificados:**
  - `GEMINI.md`
  - `docs/CHANGELOG.md`
- **Impacto / Pruebas:** Establecimiento del protocolo formal de documentación continua para cada intervención futura en el proyecto.
