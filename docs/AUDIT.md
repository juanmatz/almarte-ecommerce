# Informe de Auditoría Integral del Repositorio (Ponytail Audit)
> **Fecha:** 21 de Octubre de 2026  
> **Auditor:** Ponytail Senior Dev Mode (`ponytail-audit`)  
> **Estado:** 18 hallazgos identificados (7 Must fix, 8 Should fix, 3 Nice to have)  
> **Carga asumida:** Tienda virtual de joyería artesanal y bienestar en crecimiento en Colombia, con decenas de compradores concurrentes en lanzamientos y una única instancia de base de datos MariaDB/MySQL.

---

## 1. Alcance y Resumen Ejecutivo

**Qué hace este repositorio:**  
Plataforma de e-commerce construida con Next.js (App Router), React 19, TailwindCSS y Prisma (MariaDB/MySQL). Gestiona catálogo público, checkout de invitados y registrados con instrucciones de pago por transferencia, cuentas de usuario, y un panel administrativo interno para inventario y órdenes.

**Veredicto General:**  
Corregir los puntos 1 y 2 de inmediato: el secuestro de cuentas de invitados sin verificación y el secreto JWT de respaldo cableado en código son fallas críticas de seguridad.

**Oportunidad Lean:**  
~106 líneas de código eliminables (esqueletos duplicados, badges duplicados de órdenes/envíos y estado redundante de autenticación en componentes).

---

## 2. Hallazgos Priorizados

### 🔴 Must Fix (Bugs, Seguridad, Pérdida de Datos y Fallas bajo Carga)

1. **Cualquier usuario puede apropiarse de cuentas de invitados y leer sus órdenes privadas**  
   *Archivo:* [`app/api/auth/register/route.ts:L52-61`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/api/auth/register/route.ts#L52-L61)
   - **Qué es:** Cuando un cliente compra como invitado, se crea un registro `User` con `isGuest: true` al que se enlazan sus pedidos, dirección física y teléfono.
   - **Problema:** El endpoint de registro público adopta cualquier cuenta existente con `isGuest: true` sin confirmación de correo ni validación de contraseña. Cualquiera que escriba el email de un comprador puede registrar una contraseña, reclamar la cuenta y consultar todo el historial de pedidos y direcciones vía `/api/orders`.
   - **Solución:** No sobreescribir usuarios invitados en el registro público a menos que presenten un token o código de reclamo seguro emitido durante su sesión de checkout.
   - **Riesgo si se ignora:** Nombres, teléfonos y direcciones residenciales de clientes quedan expuestos a cualquier atacante que ingrese sus correos.

2. **Secreto JWT de respaldo en código permite firmar tokens de administrador si falta `.env`**  
   *Archivos:* [`lib/auth.ts:L73`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/lib/auth.ts#L73), [`middleware.ts:L30`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/middleware.ts#L30), [`app/api/auth/login/route.ts:L49`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/api/auth/login/route.ts#L49)
   - **Qué es:** La autenticación y el middleware leen `JWT_SECRET`, pero recurren a una cadena por defecto si no está definida en el entorno.
   - **Problema:** Si `JWT_SECRET` no se carga en producción, el sistema utiliza `"almarte-default-jwt-super-secret-key-change-in-env-2026"`. Cualquiera que conozca esta cadena pública puede firmar su propio token con `role: "admin"` y obtener acceso administrativo total.
   - **Solución:** Lanzar un error fatal en el arranque o al verificar si `process.env.JWT_SECRET` no existe, y eliminar la cadena fija.
   - **Riesgo si se ignora:** Un fallo en las variables de entorno de producción entrega acceso de administrador a cualquier usuario malicioso.

3. **El checkout de invitados falla si el carrito incluye el mismo producto más de una vez**  
   *Archivo:* [`app/api/checkout/guest-intent/route.ts:L73-85`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/api/checkout/guest-intent/route.ts#L73-L85)
   - **Qué es:** El checkout comprueba que todos los IDs de productos enviados existan en la base de datos.
   - **Problema:** Evalúa `dbProducts.length !== productIds.length`. Si el payload contiene entradas repetidas del mismo producto (ej: `[1, 1]`), `findMany` devuelve 1 producto pero `productIds.length` es 2, rechazando la compra erróneamente con *"Uno o más productos del carrito no existen"*.
   - **Solución:** Comparar la cantidad de registros devueltos contra el tamaño del conjunto único (`new Set(productIds).size`).
   - **Riesgo si se ignora:** Carritos con líneas repetidas impiden completar compras legítimas.

4. **Compras concurrentes de invitados con el mismo correo rompen con error 500**  
   *Archivo:* [`app/api/checkout/guest-intent/route.ts:L114-129`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/api/checkout/guest-intent/route.ts#L114-L129)
   - **Qué es:** El checkout busca al usuario por correo y, si no existe, ejecuta `prisma.user.create`.
   - **Problema:** Si el usuario hace doble clic rápido en *"Finalizar Compra"*, ambas peticiones ven que el usuario no existe e intentan `create`, generando una colisión de clave única (`P2002`) en la segunda petición.
   - **Solución:** Usar `prisma.user.upsert` por correo electrónico para que peticiones concurrentes resuelvan al mismo registro.
   - **Riesgo si se ignora:** Clientes que pulsan dos veces ven un error interno y quedan en la incertidumbre sobre su pedido.

5. **Reseñas simultáneas causan duplicados y alteran la calificación del producto**  
   *Archivos:* [`app/api/products/[id]/route.ts:L139-151`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/api/products/%5Bid%5D/route.ts#L139-L151), [`prisma/schema.prisma:L101-112`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/prisma/schema.prisma#L101-L112)
   - **Qué es:** Antes de guardar una reseña, la API consulta con `prisma.review.findFirst` si el usuario ya opinó sobre ese producto.
   - **Problema:** El modelo `Review` carece de índice único compuesto `[productId, userId]`. Peticiones concurrentes superan el `findFirst` a la vez e insertan valoraciones duplicadas para el mismo producto.
   - **Solución:** Agregar `@@unique([productId, userId])` en `prisma/schema.prisma` y aplicar `prisma.review.upsert`.
   - **Riesgo si se ignora:** Envíos duplicados o scripts inflan artificialmente el puntaje de estrellas.

6. **Usuarios anónimos pueden sobrescribir documentos de identidad de clientes registrados**  
   *Archivo:* [`app/api/checkout/guest-intent/route.ts:L142-152`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/api/checkout/guest-intent/route.ts#L142-L152)
   - **Qué es:** El checkout asocia la orden a un usuario registrado si el correo coincide.
   - **Problema:** Si el usuario registrado no tiene `documentId`, el checkout público actualiza su registro en base de datos con el valor que ingresó el invitado, sin autenticación alguna.
   - **Solución:** Solo actualizar datos de clientes registrados si la petición contiene su token de sesión válido.
   - **Riesgo si se ignora:** Cualquier persona puede alterar el documento de identidad de otro cliente con solo conocer su email.

7. **La migración de base de datos durante `yarn build` bloquea despliegues en producción**  
   *Archivo:* [`package.json:L7`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/package.json#L7)
   - **Qué es:** El script de compilación ejecuta `"build": "prisma migrate deploy && prisma generate && next build"`.
   - **Problema:** Exige conexión activa a la base de datos durante la compilación. En entornos de CI o contenedores de compilación aislados de Hostinger, el build se cae por no alcanzar la base de datos.
   - **Solución:** Separar migraciones del build: `"build": "prisma generate && next build"` y correr `prisma migrate deploy` en el paso de release.
   - **Riesgo si se ignora:** Fallas de compilación al desplegar en entornos con aislamiento de red.

---

### 🟡 Should Fix (Riesgos sin Pruebas, Lentitud, Duplicación y Código Muerto)

8. **Cero pruebas automatizadas en lógica financiera y de negocio**  
   *Archivo:* [`package.json:L5-12`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/package.json#L5-L12)
   - **Qué es:** El repositorio no cuenta con suite de pruebas unitarias ni de integración.
   - **Problema:** Lógica crítica como `parseCOPPrice` (que maneja puntuación decimal y de miles colombiana) y los cálculos de checkout no tienen verificación contra regresiones.
   - **Solución:** Integrar Vitest con casos de prueba para [lib/currency.ts](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/lib/currency.ts) y liquidación de órdenes.
   - **Riesgo si se ignora:** Cualquier refactorización puede introducir errores silenciosos en cobros y precios.

9. **Productos nuevos muestran 4.8 estrellas ficticias cuando tienen 0 reseñas**  
   *Archivo:* [`app/producto/[id]/page.tsx:L130-135`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/producto/%5Bid%5D/page.tsx#L130-L135)
   - **Qué es:** La página de detalle calcula el promedio de estrellas de los comentarios recibidos.
   - **Problema:** Cuando `reviewCount === 0`, asigna `rating = 4.8` *"para coincidir con el diseño visual"*, mientras que las APIs retornan `0`.
   - **Solución:** Asignar `rating = 0` cuando no haya reseñas y mostrar *"Sin valoraciones aún"* en la interfaz.
   - **Riesgo si se ignora:** Publicidad engañosa al exhibir productos sin calificaciones como altamente calificados.

10. **Doble verificación de tokens JWT en cada petición a la API**  
    *Archivos:* [`middleware.ts:L39`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/middleware.ts#L39), [`app/api/admin/metrics/route.ts:L8`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/api/admin/metrics/route.ts#L8), [`app/api/admin/orders/route.ts:L8`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/api/admin/orders/route.ts#L8)
    - **Qué es:** El middleware verifica el token y genera encabezados `x-user-*`, pero las rutas API los ignoran y vuelven a llamar a `getAuthUser()`.
    - **Problema:** La verificación criptográfica HMAC se computa dos veces por solicitud, consumiendo ciclos de CPU innecesarios.
    - **Solución:** Confiar en los encabezados validados por el middleware en rutas internas o centralizar en una sola capa.
    - **Riesgo si se ignora:** Latencia adicional acumulada en todas las operaciones del panel administrativo y órdenes.

11. **Precios negativos en `parseCOPPrice` se convierten silenciosamente en números positivos**  
    *Archivo:* [`lib/currency.ts:L73-77`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/lib/currency.ts#L73-L77)
    - **Qué es:** [parseCOPPrice](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/lib/currency.ts#L29-L78) limpia los valores de precio ingresados por administradores.
    - **Problema:** El fallback `replace(/[^\d]/g, '')` elimina el signo menos. Un error tipográfico como `"-50000"` devuelve `50000` y pasa como válido.
    - **Solución:** Descartar o retornar 0 si la entrada contiene un signo menos antes de limpiar dígitos.
    - **Riesgo si se ignora:** Entradas numéricas erróneas se procesan como precios válidos en lugar de ser rechazadas.

12. **`CatalogSkeleton` está duplicado idénticamente en dos páginas del catálogo**  
    *Archivos:* [`app/catalogo/page.tsx:L37-80`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/catalogo/page.tsx#L37-L80), [`app/catalogo/[categoria]/page.tsx:L75-118`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/catalogo/%5Bcategoria%5D/page.tsx#L75-L118)
    - **Qué es:** Interfaz visual de esqueleto de carga mientras se obtienen los productos.
    - **Problema:** 44 líneas de JSX repetidas en ambos archivos. Cualquier cambio debe aplicarse manualmente dos veces.
    - **Solución:** Extraer `CatalogSkeleton` a un componente compartido `components/CatalogSkeleton.tsx`.
    - **Riesgo si se ignora:** Inconsistencias visuales en el catálogo si se actualiza una página y se olvida la otra.

13. **Funciones de etiquetas de estado duplicadas en el panel administrativo**  
    *Archivos:* [`app/admin/page.tsx:L87-122`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/admin/page.tsx#L87-L122), [`app/admin/ordenes/page.tsx:L229-255`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/admin/ordenes/page.tsx#L229-L255)
    - **Qué es:** Funciones `getOrderStatusBadge` y `getShipmentBadge` que devuelven componentes visuales de estado.
    - **Problema:** Mismos condicionales y clases Tailwind copiados textualmente en dos páginas del administrador.
    - **Solución:** Mover ambas utilidades a un componente común `components/StatusBadge.tsx`.
    - **Riesgo si se ignora:** Cambios de diseño en un estado no se reflejan uniformemente en el admin.

14. **Código muerto que exonera un webhook inexistente de Stripe**  
    *Archivo:* [`middleware.ts:L9`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/middleware.ts#L9)
    - **Qué es:** El middleware excluye `/api/checkout/webhook` de la validación de cabeceras de autorización.
    - **Problema:** No existe ninguna ruta de webhook en el proyecto. Stripe no está instalado y los pagos operan vía transferencia manual.
    - **Solución:** Eliminar `pathname === "/api/checkout/webhook"` de [middleware.ts](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/middleware.ts#L9).
    - **Riesgo si se ignora:** Rutas ficticias en el middleware generan confusión operativa.

15. **Detalle de producto lee `localStorage` directamente ignorando `AuthContext`**  
    *Archivo:* [`components/ProductDetails.tsx:L54-62`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/components/ProductDetails.tsx#L54-L62)
    - **Qué es:** Validación de sesión de usuario para permitirle calificar un producto.
    - **Problema:** Crea estados locales leyendo `localStorage` dentro de un `useEffect`, ignorando el hook existente `useAuth()`.
    - **Solución:** Consumir directamente `const { token, user } = useAuth()` y suprimir el estado duplicado.
    - **Riesgo si se ignora:** Desincronización de sesión y advertencias de renderizado en cascada de React 19.

---

### 🟢 Nice to Have (Optimizaciones Menores y Limpieza)

16. **Ordenamiento de productos en base de datos no considera precios de descuento**  
    *Archivo:* [`app/api/products/route.ts:L76-80`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/app/api/products/route.ts#L76-L80)
    - **Qué es:** Ordenamiento de productos por precio en el catálogo.
    - **Problema:** Ordena por `price` (precio regular), ignorando `discountPrice`. Un producto con descuento de $100.000 a $50.000 se posiciona después de uno de $80.000.
    - **Solución:** Ordenar por precio efectivo mediante campo calculado o consulta SQL representativa.
    - **Riesgo si se ignora:** Resultados de ordenamiento engañosos para el comprador.

17. **Llamadas síncronas a `setState` dentro de `useEffect` generan advertencias de React 19**  
    *Archivos:* [`context/AuthContext.tsx:L38-39`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/context/AuthContext.tsx#L38-L39), [`context/CartContext.tsx:L48`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/context/CartContext.tsx#L48)
    - **Qué es:** Carga inicial de datos de usuario y carrito desde `localStorage`.
    - **Problema:** Activa la regla `@typescript-eslint/react-hooks/set-state-in-effect`, causando renderizados en cascada.
    - **Solución:** Inicializar estado perezoso (`lazy state initialization`) con funciones dentro de `useState`.
    - **Riesgo si se ignora:** Renders extra en cada carga de página y alertas en el linter.

18. **Importaciones sin usar y tipado `any` disperso en endpoints**  
    *Archivos:* [`lib/auth.ts:L1`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/lib/auth.ts#L1), [`scripts/create-admin.ts:L27`](file:///c:/Users/juanm/OneDrive/Documentos/desarrollo/almarte/almarte-ecommerce/scripts/create-admin.ts#L27)
    - **Qué es:** Advertencias y errores reportados por `yarn lint` (58 problemas).
    - **Problema:** Variables no reasignadas declaradas con `let`, importaciones huérfanas (`NextResponse`) y abuso de `any`.
    - **Solución:** Limpiar importaciones, corregir declaraciones a `const` y tipar estrictamente.
    - **Riesgo si se ignora:** Fallo con código de salida 1 en pipelines de integración continua.

---

## 3. Plan de Acción Recomendado

1. **Sprint Inmediato (Hotfix de Seguridad):**
   - Corregir el secuestro de cuentas de invitados en `app/api/auth/register/route.ts`.
   - Eliminar el secreto JWT cableado en `lib/auth.ts` y `middleware.ts`.
   - Blindar el checkout contra carritos con IDs duplicados y carreras concurrentes en `app/api/checkout/guest-intent/route.ts`.

2. **Sprint de Calidad & Lean:**
   - Desacoplar `CatalogSkeleton` y `StatusBadge` para ahorrar ~106 líneas.
   - Corregir el 4.8 hardcodeado en `app/producto/[id]/page.tsx`.
   - Añadir tests unitarios en Vitest para `lib/currency.ts` y flujos de liquidación.
