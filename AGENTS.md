<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Reglas del Proyecto Almarte

## Despliegue (Deployment)
- **Gestor de paquetes exclusivo:** En deployment y producción se debe usar **únicamente `yarn`** (`yarn install`, `yarn build`, `yarn start`). No usar `npm` ni `pnpm`.

## Manejo de Moneda (COP)
- La moneda oficial de la tienda es **Pesos Colombianos (COP)**.
- Todos los precios en tienda, catálogo, carrito, checkout, órdenes y panel admin deben formatearse con `formatCOP` de `@/lib/currency`.
- Al ingresar o editar precios en el panel admin y endpoints, se debe usar `parseCOPPrice` y validar con `isValidCOPPrice` (mínimo $1.000 COP) para evitar que valores ingresados con puntuación colombiana como `85.000` se interpreten erróneamente como `85`.

## Estrategia de Ramas Git y Despliegue Continuo (Hostinger)
- **Auto-deploy en `main`:** La rama `main` en GitHub tiene configurado despliegue automático (auto-deploy) directo hacia Hostinger (producción).
- **Regla Inviolable de `main`:** La rama `main` **SOLO se toca, commitea o mergea si el usuario lo permite explícitamente**. Está terminantemente prohibido hacer commit o push directo a `main` sin autorización expresa.
- **Rama activa de desarrollo (`develop`):** Todos los desarrollos, correcciones, nuevas funcionalidades y tareas cotidianas deben subirse e integrarse exclusivamente en la rama `develop`.

