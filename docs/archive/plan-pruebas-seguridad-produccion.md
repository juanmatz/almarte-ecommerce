# Plan de pruebas para aprobar producción

## 1. Objetivo y alcance

Este documento define las pruebas necesarias para validar Almarte Ecommerce antes de producción. Cubre autenticación, autorización, catálogo, carrito, checkout, pagos, órdenes, envíos, reseñas, administración, datos, infraestructura, rendimiento, accesibilidad y operación.

El alcance se basa en:

- [requisitos-produccion.md](requisitos-produccion.md)
- [documentation.md](documentation.md)
- Código de `app`, `components`, `context`, `lib`, `prisma` y `proxy.ts`.

### Precisión sobre "100% seguro"

No existe una prueba que demuestre seguridad absoluta. La aprobación debe significar que:

1. No quedan fallos conocidos de prioridad P0 o P1.
2. Los controles críticos tienen evidencia reproducible.
3. Las pruebas automatizadas pasan en CI.
4. Un entorno staging reproduce la configuración de producción.
5. Existe capacidad de detectar, contener y recuperar incidentes.

Un fallo P0 bloquea la publicación. Un fallo P1 bloquea la publicación salvo aceptación formal del riesgo por el responsable técnico y de negocio.

---

## 2. Preparación de pruebas

### Entornos

- **Desarrollo:** datos ficticios, sin secretos reales.
- **Staging:** configuración equivalente a producción, base de datos separada y pasarela en sandbox.
- **Producción:** solo datos y secretos reales; nunca se debe probar destructivamente.

### Datos mínimos

Crear datos controlados para:

- Administrador.
- Cliente registrado.
- Usuario invitado.
- Producto disponible con descuento.
- Producto disponible sin descuento.
- Producto agotado o desactivado.
- Orden en cada estado permitido.
- Envío en cada estado permitido.
- Reseña válida y casos sin reseñas.
- Producto con historial de órdenes.

### Evidencia obligatoria

Cada prueba debe guardar:

- ID de prueba.
- Fecha, entorno, versión y commit.
- Datos utilizados, sin contraseñas ni tokens reales.
- Pasos ejecutados.
- Resultado esperado y resultado obtenido.
- Capturas o logs sanitizados cuando aplique.
- Severidad, responsable y referencia al incidente si falla.

---

## 3. Pruebas funcionales y de seguridad

## 3.1 Autenticación y cuentas

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| AUTH-01 | P0 | Registrar con datos válidos y repetir el mismo email usando mayúsculas. | Se crea una sola cuenta; email normalizado y contraseña almacenada como hash. |
| AUTH-02 | P0 | Registrar con campos vacíos, email inválido, contraseña corta, valores excesivamente largos y JSON inválido. | Responde `400`, sin stack trace ni creación parcial. |
| AUTH-03 | P0 | Enviar dos registros simultáneos con el mismo email. | Solo una cuenta; la otra solicitud falla de forma controlada. |
| AUTH-04 | P0 | Iniciar sesión con credenciales válidas, contraseña incorrecta, email inexistente y usuario invitado. | Login válido solo cuando corresponde; errores genéricos sin enumerar usuarios. |
| AUTH-05 | P0 | Verificar firma, expiración, algoritmo y claims del token. Alterar payload y firma. | Token alterado, vencido o malformado es rechazado. |
| AUTH-06 | P0 | Cerrar sesión y reutilizar la sesión desde otra solicitud. | La sesión queda invalidada según la estrategia implementada. |
| AUTH-07 | P0 | Revisar almacenamiento del token en navegador y ataques XSS controlados. | La sesión usa cookie `httpOnly`, `secure`, `sameSite`; no existe token accesible desde JavaScript. |
| AUTH-08 | P1 | Solicitar recuperación con email existente y no existente. | Respuesta indistinguible; token de un solo uso y expiración limitada. |
| AUTH-09 | P1 | Verificar email, reutilizar enlace, modificar contraseña y usar contraseña anterior. | Enlace consumido no funciona; contraseña anterior queda invalidada. |
| AUTH-10 | P1 | Activar usuario invitado usando solo un email conocido. | Se exige verificación de identidad; no se apropian órdenes ajenas. |

## 3.2 Autorización y roles

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| ROLE-01 | P0 | Acceder a cada `/api/admin/*` sin token. | Responde `401`. |
| ROLE-02 | P0 | Usar token inválido, vencido, con firma incorrecta o secret distinto. | Responde `401`. |
| ROLE-03 | P0 | Acceder con token de cliente a rutas administrativas. | Responde `403`. |
| ROLE-04 | P0 | Modificar `almarte_user` en `localStorage` y cambiar el rol a `admin`. | La API continúa rechazando al usuario real. |
| ROLE-05 | P0 | Cambiar headers `x-user-id`, `x-user-email` y `x-user-role`. | El servidor no confía en valores enviados por el cliente. |
| ROLE-06 | P1 | Cliente intenta consultar o modificar órdenes, envíos y reseñas de otro cliente. | Responde `403` o `404` sin revelar información. |
| ROLE-07 | P1 | Administrador intenta acciones fuera de sus permisos definidos. | La operación se rechaza y queda auditada. |

## 3.3 Catálogo y productos

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| CAT-01 | P1 | Consultar catálogo paginado con filtros de categoría, subcategoría, disponibilidad y descuento. | Resultados correctos, combinables y limitados. |
| CAT-02 | P1 | Consultar producto válido, inexistente, desactivado, ID negativo, ID decimal y texto. | Respuestas `200`, `404` o `400` coherentes. |
| CAT-03 | P1 | Enviar precio negativo, descuento mayor que precio, `NaN`, infinito, strings largos y URL inválida. | Rechazo server-side sin persistir datos inválidos. |
| CAT-04 | P1 | Crear, editar, desactivar y eliminar un producto sin historial y otro con historial. | Validación correcta; borrado lógico cuando exista historial. |
| CAT-05 | P1 | Ejecutar listados con miles de productos y reseñas. | Paginación, límites e índices; no se carga todo en memoria. |
| CAT-06 | P2 | Consultar producto sin reseñas. | Se muestra ausencia de rating, no una valoración ficticia. |

## 3.4 Carrito y checkout

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| CART-01 | P0 | Agregar, eliminar, aumentar, disminuir y persistir artículos. | Cantidades y total local consistentes. |
| CART-02 | P0 | Corromper el carrito de `localStorage` con JSON inválido, IDs ajenos, precios alterados y cantidades negativas. | El cliente recupera estado seguro y el servidor rechaza datos inválidos. |
| CHECK-01 | P0 | Enviar checkout válido como invitado y como cliente autenticado. | Se crea la orden correcta y el estado se comunica claramente. |
| CHECK-02 | P0 | Omitir nombre, email, identificación, teléfono, ciudad, dirección o artículos. | Responde `400`; no se crean registros parciales. |
| CHECK-03 | P0 | Enviar cantidad cero, negativa, decimal, enorme, `NaN`, lista vacía y producto repetido. | Se rechaza o normaliza según regla documentada; nunca se genera total inválido. |
| CHECK-04 | P0 | Manipular precio, descuento, total, disponibilidad o ID desde el navegador. | El servidor recalcula usando la base de datos. |
| CHECK-05 | P0 | Comprar producto inexistente, desactivado o sin stock. | No se crea orden pagable ni se descuenta inventario. |
| CHECK-06 | P0 | Ejecutar dos compras simultáneas del último producto disponible. | No hay sobreventa; operación atómica. |
| CHECK-07 | P0 | Repetir la solicitud tras timeout, refresh, doble clic y navegación atrás. | No se duplican órdenes ni cobros. |
| CHECK-08 | P0 | Repetir la misma clave de idempotencia y cambiar el payload con la misma clave. | Se devuelve el resultado original y se rechaza el payload diferente. |
| CHECK-09 | P1 | Simular cambio de precio o stock entre mostrar carrito y confirmar. | Se informa el cambio y se solicita confirmación nueva. |
| CHECK-10 | P1 | Verificar datos de dirección válidos, campos extra, JSON corrupto y contenido malicioso. | Validación estricta, límites y almacenamiento seguro. |

## 3.5 Pagos

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| PAY-01 | P0 | Crear intención de pago en sandbox con pago aprobado, rechazado, pendiente, cancelado y reembolsado. | Cada resultado tiene estado de pago correcto y separado del estado logístico. |
| PAY-02 | P0 | Enviar webhook sin firma, con firma inválida, payload alterado y orden inexistente. | Se rechaza sin modificar órdenes. |
| PAY-03 | P0 | Reenviar el mismo webhook varias veces y en orden diferente. | Procesamiento idempotente y transiciones válidas. |
| PAY-04 | P0 | Intentar confirmar pago para otra orden cambiando el ID del payload. | Asociación protegida; operación rechazada. |
| PAY-05 | P0 | Revisar requests, logs y base de datos durante un pago. | Nunca se almacenan datos completos de tarjeta ni secretos. |
| PAY-06 | P0 | Simular caída después de crear intención, después de cobrar y antes de responder. | Reintento seguro; una sola orden y un solo cobro. |
| PAY-07 | P1 | Verificar que una orden no se muestre como pagada antes de confirmación confiable. | UI distingue creada, pendiente, pagada, rechazada y reembolsada. |

## 3.6 Órdenes e inventario

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| ORDER-01 | P0 | Probar transiciones válidas de orden, pago y envío. | Solo se permiten transiciones definidas. |
| ORDER-02 | P0 | Intentar marcar como `paid` o `shipped` una orden pendiente sin autorización de flujo. | Operación rechazada o exige flujo manual explícito y auditado. |
| ORDER-03 | P0 | Reservar, pagar, cancelar, expirar reserva y reembolsar. | Inventario reservado, descontado o liberado correctamente. |
| ORDER-04 | P1 | Cliente lista sus órdenes y solicita una orden ajena. | Solo ve sus propias órdenes y PII. |
| ORDER-05 | P1 | Administrador filtra por estado, fechas, cliente e ID con datos masivos. | Filtros server-side, paginación y límites. |
| ORDER-06 | P1 | Actualizar una orden desde dos sesiones administrativas. | No se pierden cambios; conflicto y auditoría controlados. |
| ORDER-07 | P1 | Parsear dirección válida, corrupta, incompleta y con campos peligrosos. | No hay error 500 ni exposición de datos internos. |

## 3.7 Envíos y notificaciones

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| SHIP-01 | P1 | Crear y actualizar envío con estados válidos e inválidos. | Estados, fechas, guía y transportadora validados. |
| SHIP-02 | P0 | Intentar despachar una orden no pagada. | Se rechaza salvo regla manual aprobada. |
| SHIP-03 | P1 | Cliente consulta guía propia y ajena. | Acceso solo al propietario o administrador. |
| NOTIF-01 | P1 | Generar registro, orden, pago, despacho, cancelación y bienvenida. | Correo correcto, sin secretos, con reintentos controlados. |
| NOTIF-02 | P1 | Simular caída del proveedor de correo. | La compra no queda inconsistente; tarea reintentable y visible. |

## 3.8 Reseñas

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| REVIEW-01 | P2 | Publicar sin login, sin compra, con orden pendiente, cancelada, pagada y enviada. | Solo compra elegible según regla definida. |
| REVIEW-02 | P2 | Enviar rating 0, 6, decimal, texto, comentario vacío, largo y HTML. | Validación `400`; contenido no ejecuta scripts. |
| REVIEW-03 | P2 | Publicar dos reseñas simultáneas del mismo producto. | Una sola reseña por cliente/producto. |
| REVIEW-04 | P2 | Cliente intenta borrar reseña ajena y administrador modera. | Permisos correctos y acción auditada. |

## 3.9 Subida de imágenes

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| UPLOAD-01 | P1 | Subir JPG, PNG y WEBP válidos. | Archivo seguro, tamaño permitido y URL HTTPS. |
| UPLOAD-02 | P1 | Subir archivo mayor al límite, extensión falsa, MIME falso, SVG, HTML y ejecutable. | Todo contenido peligroso es rechazado por validación real. |
| UPLOAD-03 | P1 | Intentar subir sin rol admin o con credenciales del proveedor expuestas. | Acceso rechazado; secretos solo server-side. |

---

## 4. Pruebas de seguridad ofensiva

Ejecutar en staging con autorización explícita y datos no reales.

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| SEC-01 | P0 | Inyección SQL/NoSQL en IDs, filtros, email, búsquedas y campos de producto. | Sin ejecución de comandos ni filtrado de datos. |
| SEC-02 | P0 | XSS almacenado y reflejado en nombres, comentarios, direcciones y errores. | Contenido escapado o rechazado; scripts no se ejecutan. |
| SEC-03 | P0 | CSRF en operaciones mutables si se usan cookies. | Peticiones sin origen/token válido son rechazadas. |
| SEC-04 | P0 | Path traversal y archivos maliciosos en upload. | No se accede a archivos del servidor ni se ejecuta contenido. |
| SEC-05 | P0 | Manipulación de Authorization, cookies y headers internos. | Firma y sesión se validan server-side. |
| SEC-06 | P0 | Enumeración de usuarios por tiempos y mensajes. | Respuestas equivalentes y rate limiting. |
| SEC-07 | P0 | Ráfaga contra login, registro, checkout, reseñas y webhooks. | Rate limiting, backoff, límites de cuerpo y alertas. |
| SEC-08 | P0 | Payloads anidados, JSON gigante, números extremos y Unicode malformado. | Respuesta controlada sin caída ni consumo excesivo. |
| SEC-09 | P1 | Revisión de CORS, CSP, HSTS, X-Content-Type-Options y Referrer-Policy. | Headers seguros y orígenes mínimos. |
| SEC-10 | P1 | Escaneo DAST/SAST y auditoría de dependencias. | Sin vulnerabilidades críticas o altas abiertas. |

---

## 5. Pruebas de base de datos e integridad

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| DATA-01 | P0 | Verificar unicidad de email, orden, pago, clave de idempotencia y relación orden-envío. | Restricciones de base de datos impiden duplicados. |
| DATA-02 | P0 | Probar cantidades, precios decimales, descuentos, impuestos y redondeo. | Cálculos exactos y consistentes entre API, DB y UI. |
| DATA-03 | P0 | Interrumpir transacciones en cada paso del checkout. | Commit completo o rollback completo; nunca registros huérfanos. |
| DATA-04 | P0 | Ejecutar migraciones sobre copia vacía y copia con datos reales anonimizados. | Migraciones reproducibles y sin pérdida. |
| DATA-05 | P0 | Ejecutar seed accidentalmente con `NODE_ENV=production`. | El proceso se bloquea; nunca borra datos productivos. |
| DATA-06 | P1 | Revisar permisos del usuario de base de datos. | Privilegios mínimos; sin usuario root desde la aplicación. |
| DATA-07 | P0 | Verificar TLS, pool, timeouts y exposición del puerto MySQL. | DB no pública y conexión cifrada/controlada. |

---

## 6. Pruebas de frontend y experiencia

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| UI-01 | P1 | E2E: catálogo, filtro, detalle, carrito, login, checkout y cuenta. | Flujo completo sin errores de navegación. |
| UI-02 | P1 | E2E admin: dashboard, productos, órdenes, envíos, imágenes y logout. | Cambios reflejados desde el servidor. |
| UI-03 | P0 | Doble clic, refresh, atrás, pérdida de red y respuesta lenta durante checkout. | No se duplica orden; estados claros y recuperables. |
| UI-04 | P1 | Estados de carga, vacío, error, reintento y sesión expirada. | Mensajes correctos sin filtrar detalles internos. |
| UI-05 | P1 | Viewports móviles y escritorio, orientación y zoom. | Sin desbordes ni controles inaccesibles. |
| UI-06 | P1 | Navegación por teclado, foco, labels, lector de pantalla y contraste. | Cumple el nivel de accesibilidad definido, idealmente WCAG 2.2 AA. |
| UI-07 | P1 | Compatibilidad en navegadores soportados. | Misma funcionalidad en Chrome, Edge, Safari y Firefox según alcance. |

---

## 7. Rendimiento, carga y resiliencia

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| PERF-01 | P1 | Carga del catálogo con dataset grande. | Paginación y latencia dentro del objetivo definido. |
| PERF-02 | P1 | Carga concurrente de login, catálogo y detalle. | Sin errores anómalos ni agotamiento de conexiones. |
| PERF-03 | P0 | Checkout concurrente del mismo producto. | Sin sobreventa, duplicados ni deadlocks no recuperados. |
| PERF-04 | P1 | Carga del dashboard con muchas órdenes. | Métricas agregadas; memoria y latencia estables. |
| PERF-05 | P1 | Simular caída de DB, correo, imágenes y pasarela. | Timeouts, reintentos, circuit breaker o error controlado. |
| PERF-06 | P1 | Prueba de duración prolongada. | Sin fuga de memoria ni degradación progresiva. |

Definir antes de probar objetivos de referencia, por ejemplo:

- P95 de APIs críticas.
- Tasa máxima aceptable de errores.
- Usuarios concurrentes esperados.
- Tiempo máximo de checkout.
- RPO y RTO.

---

## 8. Pruebas de despliegue y operación

| ID | Prioridad | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| OPS-01 | P0 | Construir desde entorno limpio usando el lockfile. | Build reproducible. |
| OPS-02 | P0 | Ejecutar lint, typecheck, pruebas unitarias, integración y E2E en CI. | Todos los quality gates pasan. |
| OPS-03 | P0 | Arrancar con cada variable crítica ausente o inválida. | Fallo explícito y seguro; no arranca parcialmente. |
| OPS-04 | P0 | Verificar que desarrollo, staging y producción usen DB y secretos distintos. | Aislamiento completo. |
| OPS-05 | P0 | Desplegar staging y ejecutar migraciones con aplicación compatible. | Release reproducible y reversible. |
| OPS-06 | P0 | Probar HTTPS, redirección HTTP, HSTS y acceso externo al puerto DB. | Solo HTTPS; DB no expuesta. |
| OPS-07 | P0 | Probar health check de aplicación y dependencia de DB. | Plataforma retira instancias no saludables. |
| OPS-08 | P0 | Restaurar backup en entorno aislado y medir RPO/RTO. | Recuperación dentro de objetivos documentados. |
| OPS-09 | P0 | Ejecutar rollback de aplicación y migración compatible. | Servicio recuperable sin pérdida no aceptada. |
| OPS-10 | P1 | Revisar logs de 4xx/5xx, login, pagos y webhooks. | Logs estructurados, con request ID y sin secretos/PII innecesaria. |
| OPS-11 | P1 | Generar alertas de 5xx, latencia, pagos, webhooks, CPU, memoria, DB y stock. | Alertas llegan al responsable correcto. |
| OPS-12 | P0 | Escanear imagen/container, dependencias y configuración IaC. | Sin vulnerabilidades críticas o altas sin aceptar. |

---

## 9. Automatización mínima requerida

El repositorio debe incluir, como mínimo:

- Unit tests para autenticación, validación, carrito y cálculos monetarios.
- API tests para `401`, `403`, `200`, `400`, `404` y `500`.
- Integration tests para Prisma, transacciones, inventario e idempotencia.
- Component tests para login, carrito, checkout, catálogo y administración.
- E2E para registro, login, checkout, pago sandbox, consulta de orden y flujo admin.
- Test de seguridad para autorización, XSS, inyección, rate limiting y upload.
- Coverage reportado en CI con umbral acordado para código crítico.
- Datos de prueba aislados y limpieza automática.

Los scripts de CI deben ejecutar al menos:

```text
lint
 typecheck
 unit tests
 integration tests
 e2e tests
 dependency audit
 production build
```

Los nombres exactos de los comandos deben documentarse en `package.json` y en el README operativo.

---

## 10. Criterios de bloqueo inmediato

La publicación debe detenerse si ocurre cualquiera de estos casos:

- El pago no tiene flujo real, webhook verificable o idempotencia.
- Se puede alterar precio, cantidad, total, rol o propietario desde el cliente.
- Hay sobreventa o duplicación de órdenes bajo concurrencia.
- Se puede acceder a información de otro cliente.
- Existe JWT, contraseña, secreto o dato de tarjeta en logs, URLs o almacenamiento inseguro.
- Una entrada maliciosa produce XSS, inyección, ejecución de archivo o acceso no autorizado.
- El seed puede borrar producción.
- La base de datos está expuesta innecesariamente.
- Falla una migración, restauración o rollback.
- No pasan build, typecheck, lint o pruebas críticas.
- Faltan HTTPS, rate limiting, backups, health checks o alertas críticas.
- Hay vulnerabilidades críticas o altas sin mitigación formal.

---

## 11. Checklist de aprobación final

- [ ] Requisitos P0 implementados y probados.
- [ ] Requisitos P1 implementados o riesgo aceptado formalmente.
- [ ] Contradicciones entre documentación y código resueltas.
- [ ] Flujo de pago sandbox aprobado.
- [ ] Flujo de pago productivo revisado con credenciales reales en entorno controlado.
- [ ] Stock, transacciones e idempotencia aprobados bajo concurrencia.
- [ ] Autenticación, autorización y gestión de sesiones aprobadas.
- [ ] Pruebas ofensivas sin hallazgos críticos o altos.
- [ ] Datos personales y política de privacidad revisados.
- [ ] Migración y restauración de backup demostradas.
- [ ] Rollback demostrado.
- [ ] Staging validado con la misma arquitectura de producción.
- [ ] HTTPS, headers, rate limiting y firewall activos.
- [ ] Logs, métricas, health checks y alertas activos.
- [ ] CI verde: lint, typecheck, tests, auditoría y build.
- [ ] Responsable técnico y responsable de negocio firman la salida.

## Veredicto

- **GO:** todos los P0 pasan, los P1 están resueltos o formalmente aceptados y existe evidencia.
- **NO-GO:** falla cualquier P0, falta evidencia de recuperación o existe una vulnerabilidad crítica/alta sin tratamiento.
- **GO CON RIESGO ACEPTADO:** solo para P1/P2, con responsable, fecha límite, impacto y plan de mitigación documentados.
