# Requerimientos pendientes para producción

## Propósito

Este documento reúne los requerimientos funcionales y no funcionales que deben completarse o validarse antes de publicar Almarte Ecommerce en producción. Está basado en el código actual, la documentación existente y los riesgos identificados en los flujos de autenticación, catálogo, checkout, órdenes, administración y despliegue.

## Prioridades

- **P0 - Bloqueador:** no debe publicarse sin resolverlo.
- **P1 - Alta:** necesario para una operación comercial confiable.
- **P2 - Media:** recomendable antes o inmediatamente después del lanzamiento.
- **P3 - Futura:** puede planificarse para una versión posterior.

---

# Requerimientos funcionales

## Autenticación y cuentas

### RF-001 - Registro seguro de clientes
**Prioridad:** P0  
El sistema debe registrar clientes validando nombre, email, contraseña y unicidad del email.

**Criterios de aceptación:**
- El email se normaliza y se compara sin distinguir mayúsculas.
- La contraseña cumple una política documentada y nunca se almacena en texto plano.
- No se permite registrar dos cuentas con el mismo email.
- La respuesta no expone información sensible.
- Se genera una sesión válida solo después de crear correctamente la cuenta.

### RF-002 - Inicio de sesión robusto
**Prioridad:** P0  
El sistema debe autenticar usuarios y distinguir correctamente entre clientes, invitados y administradores.

**Criterios de aceptación:**
- Credenciales inválidas producen un mensaje genérico.
- El token se firma usando un secreto de producción configurado externamente.
- Se valida expiración y firma en cada endpoint protegido.
- El acceso administrativo requiere rol `admin`.
- El cliente puede cerrar sesión y la sesión deja de ser utilizable según la estrategia elegida.

### RF-003 - Sesiones seguras
**Prioridad:** P0  
Debe reemplazarse o endurecerse el almacenamiento actual del JWT en `localStorage`.

**Criterios de aceptación:**
- La sesión se almacena preferiblemente en cookie `httpOnly`, `secure` y `sameSite`.
- Existe expiración de sesión y renovación controlada si se implementa refresh token.
- Se invalidan sesiones al cerrar sesión o ante una acción administrativa.
- No se guardan tokens en logs, URLs ni mensajes de error.

### RF-004 - Recuperación y verificación de cuenta
**Prioridad:** P1  
El sistema debe permitir verificar el email y recuperar el acceso mediante enlaces de un solo uso y expiración limitada.

**Criterios de aceptación:**
- El token de recuperación expira y no puede reutilizarse.
- No se revela si un email existe durante la solicitud.
- El usuario recibe confirmación después de cambiar la contraseña.
- Se registran los eventos relevantes de seguridad.

### RF-005 - Conversión de invitado a cliente
**Prioridad:** P1  
Un usuario invitado debe poder activar su cuenta sin perder sus órdenes anteriores.

**Criterios de aceptación:**
- La activación requiere verificación de identidad mediante un enlace enviado al email.
- Se conserva el historial de órdenes asociado.
- No se puede asociar una orden existente únicamente con conocer el email de otra persona.

## Catálogo y productos

### RF-006 - Catálogo paginado y filtrable
**Prioridad:** P1  
El catálogo debe soportar paginación, categoría, subcategoría, disponibilidad y descuento.

**Criterios de aceptación:**
- Los parámetros tienen límites y valores válidos.
- La respuesta informa total, página y tamaño de página.
- Los productos no disponibles no pueden agregarse al carrito.
- Los filtros se ejecutan en la base de datos y no cargan todo el catálogo en memoria.

### RF-007 - Administración completa de productos
**Prioridad:** P1  
Los administradores deben poder crear, editar, desactivar y consultar productos sin romper el historial de órdenes.

**Criterios de aceptación:**
- Los precios son números válidos y no negativos.
- El precio de descuento no puede ser mayor que el precio normal.
- Los nombres, descripciones y URLs tienen límites de longitud y formato.
- La eliminación es lógica cuando el producto tiene historial.
- Las operaciones quedan registradas con usuario, fecha y acción.

### RF-008 - Gestión segura de imágenes
**Prioridad:** P1  
El sistema debe permitir subir imágenes de productos mediante un proveedor configurado.

**Criterios de aceptación:**
- Se valida tamaño, extensión, MIME real y contenido del archivo.
- Se rechazan archivos ejecutables o con contenido no permitido.
- La URL retornada utiliza HTTPS.
- Se controla el número máximo de imágenes por producto.
- Las credenciales del proveedor no llegan al navegador.

## Carrito, checkout y pagos

### RF-009 - Validación server-side del carrito
**Prioridad:** P0  
El backend debe recalcular los precios, descuentos, disponibilidad y total usando datos actuales de la base de datos.

**Criterios de aceptación:**
- Nunca se confía en precio, descuento o total enviados por el cliente.
- Cada cantidad es un entero positivo dentro de un límite configurable.
- Se rechazan productos inexistentes, desactivados o sin stock.
- Se informa al cliente si el precio o disponibilidad cambió.
- El total final se calcula con precisión monetaria y reglas documentadas.

### RF-010 - Inventario y reserva de stock
**Prioridad:** P0  
El sistema debe controlar existencias reales y evitar ventas por encima del inventario.

**Criterios de aceptación:**
- Cada producto almacena cantidad disponible o una regla explícita de inventario.
- La reserva se realiza de forma atómica al iniciar el pago.
- Las reservas expiradas liberan el inventario.
- Una orden pagada descuenta definitivamente el inventario.
- Una orden cancelada o un pago fallido libera la reserva.

### RF-011 - Integración con pasarela de pagos
**Prioridad:** P0  
Debe implementarse una pasarela de pagos compatible con el país, moneda y modelo comercial de Almarte.

**Criterios de aceptación:**
- Existe un endpoint de creación de intención o transacción.
- El estado de pago se almacena separado del estado logístico de la orden.
- El servidor no almacena datos completos de tarjetas.
- Se manejan pagos aprobados, rechazados, pendientes, cancelados y reembolsados.
- El checkout no muestra una compra como confirmada antes de la confirmación requerida.

### RF-012 - Webhook de pagos verificable
**Prioridad:** P0  
El sistema debe recibir eventos de la pasarela y verificar su autenticidad.

**Criterios de aceptación:**
- La firma del webhook se valida antes de procesar el evento.
- Los eventos repetidos son idempotentes.
- Un evento no puede cambiar una orden arbitraria.
- Se guardan eventos recibidos y su resultado de procesamiento.
- El endpoint responde rápidamente y delega tareas pesadas a un proceso asíncrono cuando sea necesario.

### RF-013 - Idempotencia del checkout
**Prioridad:** P0  
El doble clic, reintento de red o reenvío de una solicitud no debe crear órdenes ni cobros duplicados.

**Criterios de aceptación:**
- Cada intento utiliza una clave de idempotencia.
- La misma clave devuelve el resultado original.
- Las restricciones únicas de base de datos respaldan esta garantía.

### RF-014 - Checkout como invitado
**Prioridad:** P1  
El invitado debe poder comprar sin crear una contraseña, proporcionando los datos mínimos de entrega y contacto.

**Criterios de aceptación:**
- Se validan email, identificación, nombre, teléfono, dirección y ciudad.
- Los datos se asocian exclusivamente a la orden correspondiente.
- El invitado recibe confirmación y un mecanismo seguro de seguimiento.
- Un email registrado no permite apropiarse de órdenes existentes.

### RF-015 - Confirmación de orden
**Prioridad:** P1  
El cliente debe recibir una confirmación consistente después de crear y/o pagar la orden.

**Criterios de aceptación:**
- Se muestra un identificador de orden.
- Se diferencia claramente orden creada, pago pendiente y pago confirmado.
- El resumen usa los precios finales almacenados en servidor.
- La página de confirmación no depende únicamente del estado local del navegador.

## Órdenes y envíos

### RF-016 - Estados de orden y pago separados
**Prioridad:** P0  
Debe existir una máquina de estados documentada para pago, orden y envío.

**Criterios de aceptación:**
- Solo se permiten transiciones válidas.
- No se puede marcar como enviada una orden no pagada, salvo un flujo manual explícitamente autorizado.
- Las cancelaciones y reembolsos tienen reglas claras.
- Se conserva el historial de cambios.

### RF-017 - Gestión administrativa de órdenes
**Prioridad:** P1  
El administrador debe listar, filtrar, consultar y actualizar órdenes.

**Criterios de aceptación:**
- Se soportan filtros por estado, fecha, cliente e identificador.
- La paginación evita consultas sin límite.
- Los cambios manuales exigen permisos adecuados.
- Se muestra el detalle de productos, cantidades, total y entrega sin errores de parseo.

### RF-018 - Gestión de envíos
**Prioridad:** P1  
El sistema debe permitir registrar transportadora, guía y estado del envío.

**Criterios de aceptación:**
- Existe consulta del envío por parte del cliente autenticado.
- Solo el propietario de la orden o un administrador puede consultarlo.
- Los estados permitidos y sus transiciones están documentados.
- La guía y transportadora se validan antes de guardar.
- Se registra fecha de despacho y entrega cuando corresponda.

### RF-019 - Notificaciones transaccionales
**Prioridad:** P1  
El sistema debe enviar notificaciones de registro, orden, pago, despacho y cambios relevantes.

**Criterios de aceptación:**
- Se configura un proveedor de correo real.
- Los envíos fallidos se reintentan sin duplicar mensajes.
- Las notificaciones no bloquean innecesariamente la respuesta HTTP.
- No se incluyen secretos ni datos innecesarios.

## Reseñas

### RF-020 - Reseñas verificadas
**Prioridad:** P2  
Solo un cliente con una compra pagada del producto puede publicar una reseña.

**Criterios de aceptación:**
- La calificación solo acepta valores de 1 a 5.
- Se limita longitud y contenido del comentario.
- Se impide más de una reseña por cliente y producto, salvo edición controlada.
- Se calcula rating promedio desde datos consistentes.
- Un administrador puede moderar o retirar contenido inapropiado.

## Administración y auditoría

### RF-021 - Autorización administrativa consistente
**Prioridad:** P0  
Todos los endpoints administrativos deben validar autenticación y rol en el servidor.

**Criterios de aceptación:**
- Sin credencial se responde `401`.
- Con credencial válida sin rol se responde `403`.
- No se confía en datos de rol enviados por el navegador.
- La protección cubre nuevas rutas automáticamente mediante una política centralizada.

### RF-022 - Auditoría de acciones sensibles
**Prioridad:** P1  
El sistema debe registrar cambios administrativos, pagos, estados de órdenes, productos y datos de envío.

**Criterios de aceptación:**
- Cada evento incluye actor, acción, recurso, fecha y resultado.
- Los registros no pueden ser modificados por usuarios normales.
- Se define retención y acceso a la auditoría.

### RF-023 - Métricas administrativas escalables
**Prioridad:** P1  
El dashboard debe mostrar métricas correctas sin cargar todas las órdenes en memoria.

**Criterios de aceptación:**
- Los totales se calculan mediante agregaciones de base de datos.
- Se documenta si las métricas incluyen órdenes pendientes, canceladas o reembolsadas.
- Los errores muestran un estado útil sin filtrar detalles internos.

### RF-024 - Importación y operación inicial
**Prioridad:** P1  
Debe existir un procedimiento seguro para cargar productos reales y crear el primer administrador.

**Criterios de aceptación:**
- El seed de desarrollo no se puede ejecutar accidentalmente contra producción.
- Las credenciales iniciales se cambian en el primer acceso o se crean mediante secreto seguro.
- La carga es repetible y no duplica productos.

---

# Requerimientos no funcionales

## Seguridad

### RNF-001 - Gestión de secretos
**Prioridad:** P0

- `JWT_SECRET`, credenciales de base de datos, pagos, correo y almacenamiento se configuran mediante el gestor de secretos del entorno.
- No se usan valores de ejemplo en producción.
- Los secretos no se suben al repositorio ni aparecen en logs.
- Se define un procedimiento de rotación.

### RNF-002 - Transporte seguro
**Prioridad:** P0

- Todo tráfico público usa HTTPS.
- Las cookies de sesión usan atributos seguros.
- La conexión a la base de datos usa TLS cuando el proveedor lo requiera.
- Se configuran HSTS y redirección de HTTP a HTTPS.

### RNF-003 - Protección contra abuso
**Prioridad:** P0

- Login, registro, recuperación de contraseña, checkout, reseñas y webhooks tienen rate limiting.
- Se limita tamaño de solicitudes y archivos.
- Se aplican timeouts a llamadas externas.
- Se consideran CAPTCHA o controles equivalentes si el abuso lo justifica.

### RNF-004 - Validación y sanitización
**Prioridad:** P0

- Todas las entradas se validan con esquemas compartidos en servidor.
- Se aplican límites de longitud, formato, rango y enumeraciones.
- Se previenen XSS, inyección, path traversal y manipulación de parámetros.
- Los mensajes al cliente no exponen stack traces ni detalles de infraestructura.

### RNF-005 - Protección de datos personales
**Prioridad:** P0

- Se documentan finalidad, retención y eliminación de datos personales.
- Se restringe el acceso a dirección, teléfono e identificación.
- Se publica política de privacidad y tratamiento de datos.
- Se implementa exportación o eliminación cuando la normativa aplicable lo requiera.

### RNF-006 - Dependencias seguras
**Prioridad:** P1

- Se ejecuta auditoría de dependencias antes de cada release.
- Se corrigen vulnerabilidades críticas y altas antes de publicar.
- Se fijan versiones mediante el lockfile.
- Se revisan dependencias sin mantenimiento o incompatibles con producción.

## Disponibilidad y recuperación

### RNF-007 - Base de datos productiva
**Prioridad:** P0

- Se usa una base de datos administrada o con operación equivalente.
- Se configuran backups automáticos y retención documentada.
- Se prueba periódicamente la restauración.
- Se ejecutan migraciones de forma controlada antes de iniciar la aplicación.

### RNF-008 - Recuperación ante fallos
**Prioridad:** P1

- Se documentan RPO y RTO.
- Existe procedimiento de rollback de aplicación y base de datos.
- Las migraciones incompatibles se dividen en pasos reversibles.
- Se define quién responde ante una caída o fallo de pagos.

### RNF-009 - Health checks
**Prioridad:** P1

- El despliegue verifica que la aplicación arranque correctamente.
- Se comprueba conectividad con base de datos y servicios esenciales.
- El balanceador o plataforma retira instancias no saludables.

## Rendimiento y escalabilidad

### RNF-010 - Rendimiento de APIs
**Prioridad:** P1

- Las listas usan paginación y límites máximos.
- Las métricas usan agregaciones eficientes.
- Se agregan índices para búsquedas y relaciones frecuentes.
- Se definen objetivos de latencia para catálogo, login, checkout y administración.

### RNF-011 - Concurrencia e integridad
**Prioridad:** P0

- Las operaciones de inventario y pago usan transacciones o mecanismos equivalentes.
- Se evitan condiciones de carrera entre dos compras del mismo producto.
- Las restricciones de base de datos respaldan unicidad e integridad referencial.

### RNF-012 - Caché y contenido estático
**Prioridad:** P2

- Las imágenes se sirven desde CDN o almacenamiento optimizado.
- Se definen políticas de caché para catálogo e imágenes.
- La invalidación de caché se prueba cuando cambia un producto.

## Calidad y pruebas

### RNF-013 - Pruebas automatizadas
**Prioridad:** P0

Debe existir una suite mínima que cubra:

- Unitarias: autenticación, validaciones, carrito y cálculos monetarios.
- API: `401`, `403`, `200`, `400`, `404` y `500` donde corresponda.
- Integración: Prisma, transacciones, inventario y pagos simulados.
- Componentes: login, carrito, checkout, catálogo y panel administrativo.
- E2E: registro, login, compra, pago, consulta de orden y operación admin.

### RNF-014 - Quality gates
**Prioridad:** P0

- El lint debe pasar.
- El typecheck debe pasar.
- El build de producción debe pasar.
- Las pruebas deben pasar en CI antes de fusionar o desplegar.
- Se define un umbral de cobertura para código crítico.

### RNF-015 - Staging
**Prioridad:** P0

- Existe un entorno de staging separado de producción.
- Usa base de datos y secretos distintos.
- Los pagos de staging usan modo sandbox.
- Cada release se valida en staging antes de producción.

## Observabilidad y operación

### RNF-016 - Logging estructurado
**Prioridad:** P1

- Los logs incluyen nivel, timestamp, request ID y contexto mínimo.
- No se registran contraseñas, JWT, datos de tarjeta ni secretos.
- Los errores de API se correlacionan con el request ID.
- Se define retención y acceso a logs.

### RNF-017 - Monitoreo y alertas
**Prioridad:** P1

Se deben monitorear y alertar al menos:

- Errores HTTP 5xx.
- Fallos de login y pagos.
- Webhooks rechazados o atrasados.
- Agotamiento de inventario.
- Latencia elevada.
- Uso de CPU, memoria, almacenamiento y conexiones de base de datos.

### RNF-018 - Métricas de negocio
**Prioridad:** P2

- Se monitorean órdenes creadas, pagadas, canceladas y reembolsadas.
- Se mide conversión del checkout.
- Se controla la diferencia entre pagos confirmados y órdenes registradas.
- Los dashboards no exponen PII innecesariamente.

## Despliegue y configuración

### RNF-019 - Despliegue reproducible
**Prioridad:** P0

- La aplicación se construye desde el lockfile (`yarn.lock`) y una versión fijada de Node/Bun.
- **Gestor de paquetes obligatorio en deployment:** En el entorno de despliegue y producción se debe utilizar **exclusivamente Yarn** (`yarn install --frozen-lockfile`, `yarn build`, `yarn start`). Queda estrictamente prohibido el uso de `npm` o `pnpm` en deployment.
- Se documentan comandos de build, migración y arranque.
- El contenedor, si se usa, incluye la aplicación y no solo la base de datos.
- No se ejecuta `seed` destructivo durante el despliegue.

### RNF-020 - Configuración por entorno
**Prioridad:** P0

- Desarrollo, staging y producción usan configuraciones separadas.
- Existe un `.env.example` sin secretos con todas las variables requeridas.
- La aplicación falla de forma explícita si falta una variable crítica.
- Las URLs públicas, CORS, cookies y proveedores se configuran por entorno.

### RNF-021 - Red y base de datos
**Prioridad:** P0

- La base de datos no queda expuesta públicamente sin necesidad.
- Se restringen puertos mediante firewall o red privada.
- Se usan usuarios de base de datos con privilegios mínimos.
- Se configura TLS y pool de conexiones apropiado.

### RNF-022 - Compatibilidad de navegador y móvil
**Prioridad:** P1

- Checkout, login, catálogo y panel admin funcionan en los navegadores soportados.
- La interfaz es usable en móvil y escritorio.
- Se prueban estados de carga, error, vacío y reintento.
- No hay texto, botones o tablas desbordados en viewport móvil.

### RNF-023 - Accesibilidad
**Prioridad:** P1

- Formularios tienen labels y mensajes de error asociados.
- La navegación principal funciona con teclado.
- Se mantienen contraste, foco visible y nombres accesibles para controles.
- Las imágenes tienen texto alternativo significativo.

### RNF-024 - Documentación operativa
**Prioridad:** P1

Debe documentarse:

- Variables de entorno.
- Instalación local y staging.
- Migraciones y rollback.
- Backups y restauración.
- Alta y recuperación del administrador.
- Configuración de pagos, correo e imágenes.
- Gestión de incidentes.
- Contactos y responsables de operación.

---

# Criterios mínimos de salida a producción

La primera versión comercial no debe publicarse hasta cumplir todos los requisitos **P0** y los siguientes **P1**:

- Checkout con pago real o flujo manual formalmente aprobado y documentado.
- Validación server-side de precios, cantidades e inventario.
- Idempotencia de órdenes y pagos.
- Autenticación y autorización verificadas.
- Secretos reemplazados y gestionados fuera del repositorio.
- Migraciones y backups probados.
- Staging funcional.
- Pruebas automatizadas de autenticación, checkout, órdenes y administración.
- `lint`, typecheck y build de producción exitosos.
- HTTPS, rate limiting, logs, monitoreo y alertas activos.
- Política de privacidad y tratamiento de datos publicada.
- Procedimiento de rollback probado.

# Matriz de pruebas de aceptación

| Flujo | Resultado esperado |
|---|---|
| Registro válido | Se crea la cuenta y se inicia una sesión segura |
| Registro duplicado | Se rechaza sin revelar datos innecesarios |
| Login inválido | Responde error genérico y aplica rate limiting |
| Acceso admin sin token | Responde `401` |
| Acceso admin como cliente | Responde `403` |
| Acceso admin válido | Permite consultar y operar según permisos |
| Carrito con cantidad negativa | Se rechaza |
| Carrito con precio manipulado | Se recalcula con datos del servidor |
| Compra sin stock | Se rechaza sin crear un cobro válido |
| Doble envío de checkout | No duplica orden ni pago |
| Webhook repetido | Se procesa de forma idempotente |
| Pago rechazado | La orden no queda como pagada y se libera la reserva |
| Orden pagada | Se descuenta stock y se notifica al cliente |
| Despacho | Se guarda guía y se notifica el cambio |
| Restauración de backup | Recupera la aplicación y datos según el RPO/RTO definido |

# Deuda documental detectada

La documentación existente debe actualizarse para distinguir entre funciones implementadas y pendientes. En particular, deben verificarse o implementarse los endpoints de logout, creación de intención de pago, webhook, consulta de envío, actualización de envío y administración de cargas de imágenes.
