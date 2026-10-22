# Centro de Documentación — Almarte E-commerce

Bienvenido al centro neurálgico de documentación técnica, arquitectura, diseño y control de cambios de la plataforma **Almarte Artesanos**.

Este repositorio sigue una estructura centralizada y modular conforme a las directrices de [GEMINI.md](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/GEMINI.md) y los estándares de las skills del proyecto ([documentation-and-adrs](file:///.agents/skills/documentation-and-adrs/SKILL.md) y [design-doc-mermaid](file:///.agents/skills/design-doc-mermaid/SKILL.md)).

---

## 🗺️ Mapa de Navegación de Documentación

| Documento | Descripción | Estado |
| :--- | :--- | :--- |
| **[documentation.md](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/docs/documentation.md)** | **Manual Maestro de Arquitectura y Sistema:** Fuente única de verdad técnica. Contiene arquitectura Next.js App Router, diagramas Mermaid, modelo de Prisma en MariaDB, catálogo de APIs REST, sistema de diseño, seguridad (PCI/Habeas Data) y guía de operaciones. | 🟢 Activo (v2.0) |
| **[ROADMAP.md](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/docs/ROADMAP.md)** | **Hoja de Ruta y Próximas Implementaciones:** Planificación estratégica y técnica en 5 fases (Pasarela Wompi, stock atómico, tarifas DANE, notificaciones y PQRs). | 🟢 Activo (v1.0) |
| **[AUDIT.md](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/docs/AUDIT.md)** | **Informe de Auditoría Integral (Ponytail Audit):** Diagnóstico senior de calidad, seguridad, carga concurrente, código muerto y riesgos técnicos clasificados (18 hallazgos). | 🟢 Activo (v1.0) |
| **[CHANGELOG.md](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/docs/CHANGELOG.md)** | **Bitácora de Control de Cambios:** Registro cronológico de todas las intervenciones, features, fixes y hardening aplicados en el repositorio. | 🟢 Activo |
| **[archive/](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/docs/archive/)** | **Archivo Histórico:** Contiene los borradores tempranos y briefs individuales (`design-brief`, `plan-pruebas`, `requisitos-produccion`) que fueron consolidados en el manual maestro. | 🗄️ Archivado |

---

## ⚙️ Reglas Inviolables del Sistema

1. **Gestor de Paquetes Exclusivo:** En cualquier entorno y en despliegue en Hostinger se usa exclusivamente **`yarn`** (`yarn install`, `yarn build`, `yarn start`).
2. **Moneda Oficial (COP):** Precios formateados en visualización con `formatCOP` (`@/lib/currency`) y parseados con `parseCOPPrice` / `isValidCOPPrice` (mínimo $1.000 COP).
3. **Seguridad en Pagos (PCI-DSS):** Prohibido recibir o almacenar números de tarjeta o códigos CVV en servidor o base de datos.
4. **Cumplimiento Legal Colombiano:** Consentimiento explícito de Habeas Data (Ley 1581 de 2012) y garantías de retracto del Estatuto del Consumidor (Ley 1480 de 2011).

---

## 🚀 Acceso Rápido para Desarrolladores

```bash
# Servidor de desarrollo local
yarn dev

# Generar cliente de Prisma tras cambios en schema.prisma
yarn prisma generate

# Validación de compilación para producción
yarn build
```
