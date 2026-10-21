# Bitácora de Cambios (CHANGELOG) — Almarte E-commerce

Registro cronológico de todas las características, correcciones, mejoras de seguridad y actualizaciones de documentación realizadas en el proyecto, conforme a las directrices de [GEMINI.md](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/GEMINI.md).

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
