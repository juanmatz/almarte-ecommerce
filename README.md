# Almarte Artesanos - E-commerce

Plataforma de e-commerce de joyería artesanal, cristales naturales, velas intencionadas y rituales de bienestar construida sobre Next.js (App Router), React 19, TailwindCSS y Prisma con soporte MariaDB / MySQL para despliegues en Hostinger.

## Guía de Despliegue y Ejecución con Yarn

### 1. Instalación de dependencias
```bash
yarn install
```

### 2. Generar el cliente de Prisma
```bash
yarn prisma generate
```

### 3. Migraciones y Base de Datos (Opcional en Hostinger)
```bash
yarn prisma migrate deploy
yarn seed
```

### 4. Compilar para Producción
```bash
yarn build
```

### 5. Iniciar Servidor en Producción (Hostinger / Node.js)
```bash
yarn start
```

### 6. Servidor de Desarrollo Local
```bash
# Levantar base de datos en Docker
docker compose up -d

# Servidor de desarrollo Next.js
yarn dev
```

---

## 🌿 Flujo de Trabajo en Git y Despliegue (Hostinger)

* **Rama `develop` (Desarrollo e Integración):** Todo desarrollo, corrección de errores, componentes o nuevas funcionalidades deben subirse e integrarse exclusivamente en `develop`.
* **Rama `main` (Producción & Auto-deploy — PROTEGIDA):** Cuenta con despliegue automático configurado hacia el hosting de producción en Hostinger. **Regla de Oro:** La rama `main` **SOLO se toca si el usuario lo permite explícitamente**. Queda prohibido hacer push directo o merge a `main` sin autorización expresa.

---

## Variables de Entorno Requeridas (.env)

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/nombre_bd"
JWT_SECRET="tu_secreto_super_seguro_aqui"
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
```

---

## 📚 Documentación Centralizada del Proyecto

Toda la documentación técnica, diagramas de arquitectura, modelos de base de datos y bitácora de cambios se gestionan centralizadamente en [`docs/`](docs/):

* **[Centro de Documentación (Hub)](docs/README.md):** Mapa general de navegación.
* **[Manual Maestro de Arquitectura y Sistema (v2.0)](docs/documentation.md):** Fuente única de verdad técnica, APIs, modelos Prisma y reglas de negocio.
* **[Bitácora de Control de Cambios (CHANGELOG)](docs/CHANGELOG.md):** Trazabilidad de cada cambio, feature y fix.
* **[Directrices Operativas (GEMINI.md)](GEMINI.md):** Estándares de calidad, reglas obligatorias y matriz de skills.


