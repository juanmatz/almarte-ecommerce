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
yarn dev
```

---

## Variables de Entorno Requeridas (.env)

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/nombre_bd"
JWT_SECRET="tu_secreto_super_seguro_aqui"
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
```

