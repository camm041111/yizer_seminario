# Controladores para base de datos
_Exported on 4/10/2026 at 14:17:46 CST from Cursor (3.0.13)_

---

**User**

Como vez estoy creando mi servidor de base de datos, en el @database/database.txt esta la estructura de mi base de datos, lo que quiero ahora es crear los controllers para usar esa base de datos, haz los controllers que necesita el sistema

---

**Cursor**


Revisando la estructura de la base de datos y el proyecto para crear los controladores adecuados.




Creando controladores Express con MySQL2 (pool en `config/db.js`) y rutas REST coherentes con el esquema. Incluyendo transacciones para pedidos con detalles.




Corrigiendo `actualizar` en `productosController.js` (la actualización parcial tenía errores con `tipo_tela` y `COALESCE`).




Corrigiendo actualización en administradores y clientes: `telefono ?? null` borraba el teléfono si no se enviaba.




Simplificando la lógica del total en `crear` del pedido y comprobando que las conexiones se liberen correctamente.




Creando las rutas y conectándolas en `server.js`.




Resumen de lo que quedó montado:

## Estructura

En `servidor/controllers/` hay un controlador por área del esquema:

| Controlador | Tabla(s) | Funciones |
|-------------|-----------|-----------|
| `administradoresController.js` | `administradores` | CRUD |
| `clientesController.js` | `clientes` | CRUD |
| `productosController.js` | `productos_base` | CRUD; `GET /api/productos?activo=true` filtra activos |
| `variantesController.js` | `variantes_producto` | Listar por producto, CRUD por id; crear anidado bajo producto |
| `personalizacionesController.js` | `personalizaciones` | CRUD; valida `tipo_personalizacion` ∈ `texto`, `imagen`, `ambos` |
| `pedidosController.js` | `pedidos` + `detalle_pedidos` | CRUD pedidos; crear con `detalles[]` en transacción; total recalculado con la suma de `subtotal`; añadir/editar/borrar líneas de detalle |

Las rutas están en `servidor/routes/api.js` y el servidor las monta en **`/api`** (`server.js`).

## Endpoints principales

- **`/api/administradores`**, **`/api/clientes`**, **`/api/productos`**, **`/api/personalizaciones`**: REST estándar (`GET` lista, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`).
- **Variantes**: `GET` y `POST` `/api/productos/:idProducto/variantes`; `GET`/`PUT`/`DELETE` `/api/variantes/:id`.
- **Pedidos**: `POST /api/pedidos` con cuerpo como:
  - `id_cliente`, `estado` (opcional), `direccion_envio`, `notas`, `detalles: [{ id_variante, cantidad, precio_unitario, id_personalizacion? }]`
- **Líneas sueltas**: `POST /api/pedidos/:idPedido/detalles`, `PUT`/`DELETE` `/api/pedidos/detalles/:idDetalle` (el total del pedido se actualiza al sumar subtotales).

Consultas útiles: `GET /api/personalizaciones?id_cliente=...`, `GET /api/pedidos?id_cliente=...&estado=...`.

## Detalles de implementación

- Consultas parametrizadas para evitar inyección SQL.
- Emails duplicados devuelven `409` donde aplica el `UNIQUE`.
- Pedidos: transacción al crear y al tocar detalles; el `subtotal` generado en MySQL no se envía en `INSERT`.
- Actualizaciones `PUT` solo cambian campos enviados en el JSON (si el body va vacío, `400`).

Si quieres, el siguiente paso puede ser validación con un esquema (por ejemplo `zod`), autenticación para administradores o documentación OpenAPI.

---

**User**

Ahora hay que hacer la siguiente face aunque la verdad no se si sea necesario, dime tu, es que la verdad en la base de datos no cree roles ni usuario, pues solo queremos el sistema en si, auque seguro verdad: Control de acceso y roles de usuario (admin/clientes)	JWT + bcrypt para autenticación segura	Admin gestiona usuarios y roles

---

**Cursor**


Te resumo con criterio práctico.

## ¿Es necesaria esta fase?

**Depende de cómo vayas a usar el API.**

- **Sí conviene (casi obligatorio)** si:
  - El servidor va a estar expuesto en red o en internet.
  - Vas a guardar datos reales de clientes, pedidos y administración.
  - Quieres que solo ciertas personas creen/editen productos, variantes o pedidos.
  - Piensas cumplir mínimos de seguridad (no dejar CRUD abierto sin identidad).

En ese escenario, **autenticación (por ejemplo JWT + contraseñas con bcrypt)** y **algún tipo de rol** (admin vs cliente) no son “lujo”: son la forma habitual de no tratar tu API como base de datos pública.

- **Puedes posponerla o simplificarla** si:
  - Es solo desarrollo local o una demo sin datos sensibles.
  - El acceso ya lo corta otra capa (VPN, túnel, solo `localhost`) y aceptas que “cualquiera con acceso a la red” es de confianza.
  - El front y el back van empaquetados de forma que el “usuario” no existe aún como concepto de producto.

En ese caso **no es obligatorio** implementar JWT y roles *ahora*; puedes seguir construyendo catálogo, pedidos y flujos, y añadir auth cuando vayas a desplegar o a exponer el API.

## Sobre “no creé roles ni usuario” en la BD

Tu modelo ya separa **`administradores`** y **`clientes`**. Eso **ya es una base de roles a nivel de negocio** (dos tipos de actor). Lo que falta para “control de acceso” suele ser:

- Un campo tipo **`password_hash`** (y quizá `ultimo_login`, `activo`) en las tablas que correspondan, **o** una tabla única `usuarios` con `rol` y FK a admin/cliente (más normalizado).
- Middleware que verifique el JWT y restrinja rutas (`/api/admin/...` vs `/api/cliente/...` o mismas rutas con permisos distintos).

No hace falta una tabla `roles` con muchos registros si solo tienes **admin** y **cliente**; a veces basta con un enum o columna `rol`.

## Recomendación directa

- Si este proyecto va a ser **tienda/pedidos real o desplegado**: **sí, planifica auth** (JWT + bcrypt es una opción muy estándar); “admin gestiona usuarios” puede ser al principio solo **altas/bajas de administradores y políticas simples**, no un IAM enorme.
- Si ahora solo quieres **el sistema en sí** (modelo, pantallas, flujo) en entorno cerrado: **puedes no implementarlo todavía**, sabiendo que **antes de producción** deberás cerrar el API con autenticación y autorización.

En resumen: **no es siempre “necesario” en la fase actual de construcción**, pero **sí es necesario antes de exponer el sistema de verdad**; tus tablas de admin y cliente ya encajan bien con un diseño de roles sencillo cuando decidas hacerlo.

Si quieres que lo bajemos a tu repo concreto (qué rutas proteger, dónde poner `password_hash`, flujo login admin vs cliente), dímelo y lo implementamos encima de tu Express actual.

---

**User**

Entonces la puedes implementar sin cambiar nada en mi base de datos verdad?

---

**Cursor**


No del todo: **autenticación seria con bcrypt implica guardar el hash de la contraseña en algún sitio**. En tu esquema actual **no hay ningún campo para eso** (`administradores` y `clientes` solo tienen datos de perfil, sin contraseña).

Por tanto:

- **Sin tocar la base de datos** no puedes tener un sistema real de “cada admin/cliente con su usuario y contraseña” almacenado de forma normal. Lo que sí podrías hacer (y no suele valer para producción) sería algo como **un solo usuario definido en variables de entorno** (contraseña en `.env`) y generar JWT a partir de eso: **no escala**, no gestiona “usuarios” en BD y no es lo que suele entenderse por “admin gestiona usuarios”.

- **Lo mínimo y razonable** es **ampliar un poco el esquema**: por ejemplo **`password_hash`** (y opcionalmente `activo`) en `administradores` y en `clientes`. No hace falta una tabla nueva de “roles” si ya separas admin y cliente por tabla.

**Conclusión:** implementar JWT + bcrypt **como debe ser** implica **al menos** persistir hashes (casi siempre con **un pequeño cambio en la BD**). Si te parece bien ese cambio mínimo, el siguiente paso sería añadir esas columnas con `ALTER TABLE` y montar login/registro, middleware y protección de rutas encima de tu Express actual.

¿Quieres que lo hagamos con ese `ALTER` mínimo en las dos tablas?

---

**User**

ok, entonces dame los codigos para poner password en las tablas clientes y administradores y asi de simple lo implementare

---

**Cursor**


Añadiendo el SQL `ALTER TABLE` y actualizando `database.txt` para que coincida con el esquema.




Creando un archivo SQL ejecutable y actualizando `database.txt` para que el esquema documentado coincida.




Listo. Tienes dos cosas en el repo:

### 1. Script para ejecutar en MySQL

Archivo: `database/add_password_hash.sql`

```sql
ALTER TABLE administradores
  ADD COLUMN password_hash VARCHAR(255) NULL COMMENT 'hash bcrypt' AFTER email;

ALTER TABLE clientes
  ADD COLUMN password_hash VARCHAR(255) NULL COMMENT 'hash bcrypt' AFTER email;
```

Desde terminal (ajusta usuario, host y nombre de BD):

```bash
mysql -u root -p yizer_database < /home/Mario/Desktop/yizer_project/yizer_development/database/add_password_hash.sql
```

### 2. Documentación del esquema

En `database/database.txt` ya figuran `password_hash` en `administradores` y `clientes` para que coincida con instalaciones nuevas.

---

**Notas rápidas**

- **`NULL` al principio**: si ya tienes filas, no rompe el `ALTER`. Luego pones el hash con `UPDATE` cuando generes contraseñas con bcrypt.
- **`VARCHAR(255)`**: sobra para bcrypt (~60 caracteres), pero es lo habitual por si cambias de algoritmo más adelante.
- Cuando **todos** tengan contraseña, puedes exigir `NOT NULL` con los `ALTER` comentados al final del archivo `.sql`.

Cuando quieras, se puede enlazar esto con login JWT en el servidor y **no devolver** `password_hash` en los JSON de los controladores.

---

**User**

ok ya hice los combios, supongo que deben tener algunos cambios supongo los controllers y el routes

---

**Cursor**


Implementando autenticación JWT + bcrypt, excluyendo `password_hash` de las respuestas, manejando contraseñas en alta/edición y protegiendo rutas según rol. Revisando archivos actuales.




Implementando JWT + bcrypt, middleware de roles y ajustando controladores y rutas.




Añadiendo `dotenv` al inicio de `server.js` para cargar `JWT_SECRET` antes que cualquier ruta, y usando `bcrypt` 5.x por compatibilidad.




Sí: ya quedaron alineados **controllers**, **routes** y piezas nuevas de auth. Resumen:

## Qué se hizo

1. **`middleware/auth.js`**  
   - `requireAuth`: cabecera `Authorization: Bearer <token>`  
   - `requireAdmin`  
   - `requireAdminOrOwnCliente`: admin ve todo; cliente solo su `id` en `/clientes/:id`

2. **`controllers/authController.js`**  
   - `POST /api/auth/login/admin` — `email`, `password`  
   - `POST /api/auth/login/cliente` — igual  
   - `POST /api/auth/registro` — alta pública de cliente con contraseña + JWT

3. **`administradoresController` / `clientesController`**  
   - **Crear**: exigen `password` y guardan `password_hash` con bcrypt  
   - **Actualizar**: si envías `password` (no vacío), se actualiza el hash  
   - Las respuestas siguen **sin** incluir `password_hash` (solo `SELECT` de columnas públicas)

4. **`personalizacionesController`**  
   - Cliente: solo sus filas (`id_cliente` = usuario); no puede usar personalizaciones de otro en pedidos (comprobación en `pedidos`)

5. **`pedidosController`**  
   - Cliente: lista y ve solo sus pedidos; **crear** fuerza `id_cliente` = token y `estado` = `pendiente`; no puede colar `id_personalizacion` de otro cliente  
   - Admin: igual que antes para crear con `id_cliente` y `estado`  
   - **PUT/DELETE pedido** y **toda mutación de detalles**: solo admin

6. **`routes/api.js`**  
   - Catálogo **público**: `GET` productos y variantes  
   - Resto según la tabla de permisos anterior

7. **`server.js`**  
   - `require('dotenv').config()` al inicio  

8. **`package.json`**  
   - Dependencias: `bcrypt`, `jsonwebtoken`  

En tu máquina hace falta instalar dependencias (aquí no había `npm` en el PATH):

```bash
cd /home/Mario/Desktop/yizer_project/yizer_development/servidor && npm install
```

## `.env`

Añade al menos (mínimo **16 caracteres** en el secreto):

```env
JWT_SECRET=una_cadena_larga_y_aleatoria_minimo_16
# opcional:
# JWT_EXPIRES_IN=7d
```

## Primer administrador

`POST /api/administradores` va **protegido** (solo admin). El primero hay que crearlo en base de datos con un hash bcrypt, por ejemplo en Node:

```bash
node -e "require('bcrypt').hash('TuPasswordSegura',10).then(console.log)"
```

Luego:

```sql
UPDATE administradores SET password_hash = 'pega_el_hash_aqui' WHERE id_admin = 1;
```

Después ya puedes hacer `POST /api/auth/login/admin` y usar el token para el resto de rutas de admin.

Los clientes pueden registrarse con **`POST /api/auth/registro`** (`nombre_completo`, `email`, `password`, opcional `telefono`) sin ser admin.

---

**User**

OK, la siguiente fase es del contenido de imagenes, creo que igual necesitara modificar el controller de pedido y asi:
Carga y administración de archivos multimedia	Multer configurado en /server/multer.config.js	Admin sube imágenes de productos

---

**Cursor**


Implementando Multer para subida de imágenes de productos (solo admin), revisando el esquema y los controladores actuales.




Implementando Multer en `servidor/multer.config.js`, columna `imagen_url` en productos, endpoint de subida para admin y enriqueciendo los detalles de pedidos con la imagen del producto.




Aquí va lo implementado y cómo usarlo.

## 1. `servidor/multer.config.js`
- Carpeta `servidor/uploads/productos/` (se crea sola).
- Límite por defecto **5 MB** (variable `UPLOAD_MAX_MB` en `.env` si quieres otro valor).
- Solo **MIME `image/*`**.
- Nombres únicos con timestamp + aleatorio.
- Exporta: `uploadProducto`, **`singleImagenProducto`** (middleware con manejo de errores), `urlPublicaProducto`, `eliminarArchivoImagenProducto`.

## 2. Base de datos
- Script: `database/add_producto_imagen_url.sql` → columna **`imagen_url`** en `productos_base`.
- `database/database.txt` actualizado para nuevas instalaciones.

Ejecuta el `ALTER` en MariaDB si aún no lo tienes.

## 3. `productosController.js`
- Listados y detalle incluyen **`imagen_url`**.
- **`POST`** con JSON: puedes enviar opcional **`imagen_url`** (URL externa).
- **`POST /api/productos/:id/imagen`**: subida de archivo (campo **`imagen`**); sustituye la imagen anterior en disco si existía.
- **`DELETE /api/productos/:id/imagen`**: pone `imagen_url` a `NULL` y borra el fichero local.
- **`DELETE` producto**: borra también el archivo local si la URL era `/uploads/productos/...`.

## 4. `pedidosController.js`
- Los **detalles** del pedido hacen `JOIN` con variante y producto y devuelven, entre otros:
  - `producto_nombre`, **`producto_imagen_url`**, `id_producto`, `color`, `talla`.

Así el front puede mostrar la miniatura sin tocar más la lógica del pedido.

## 5. `server.js`
- Archivos estáticos: **`GET http://host:3036/uploads/productos/<archivo>`** sirve lo guardado por Multer.

## 6. `routes/api.js`
- Rutas nuevas **antes** del `PUT` genérico (ya ordenadas):
  - `POST /api/productos/:id/imagen` — admin + token + `singleImagenProducto`
  - `DELETE /api/productos/:id/imagen` — admin

## 7. Dependencia
En `package.json` está **`multer`**. En tu máquina:

```bash
cd servidor && npm install
```

## Uso de la subida (admin)
`Content-Type: multipart/form-data`, campo de archivo: **`imagen`**.

Ejemplo con `curl`:

```bash
curl -X POST "http://localhost:3036/api/productos/1/imagen" \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -F "imagen=@/ruta/a/foto.jpg"
```

La API responde con el producto actualizado; **`imagen_url`** será algo como `/uploads/productos/1739....jpg` (URL relativa al mismo host del servidor).

Si quieres después subir imágenes para **personalizaciones** (`url_imagen` en BD) o variantes por color, se puede reutilizar el mismo patrón con otra carpeta y rutas.

---

**User**

no tengo creada la ruta donde se guardan las imagnes, nose si se crea en automatico cuando gurado por primera vez, como sea, esta es la ultima fase: Comunicación de datos estructurados entre capas	API REST con formato JSON y CORS habilitado	Mobile consume catálogo vía API

---

**Cursor**


Confirmando la creación automática de la carpeta de uploads y añadiendo un endpoint de catálogo estructurado para móvil, con CORS explícito si hace falta.




Confirmando: la carpeta se crea al cargar `multer.config.js`. Asegurando su creación al arrancar el servidor, mejorando CORS para clientes móviles y añadiendo `GET /api/catalogo` (JSON con productos activos y variantes).




## Carpeta de imágenes

Sí: **se crea sola** en dos momentos:

1. **`multer.config.js`** hace `fs.mkdirSync(..., { recursive: true })` al cargarse el módulo.
2. Ahora **`server.js`** hace `require('./multer.config')` justo después de `dotenv`, así que al **arrancar el servidor** ya existe `servidor/uploads/productos/` aunque no hayas subido nada.

Además añadí **`servidor/uploads/productos/.gitkeep`** para que la ruta exista en el repo (vacía) y no dependas solo del código.

---

## Fase: API REST + JSON + CORS + móvil

Ya tenías **JSON** (`express.json()`) y **CORS**; quedó así:

- **CORS** más explícito para clientes móvil / web: `origin: true` (refleja el `Origin` de la petición), métodos habituales y cabeceras `Content-Type` y `Authorization`.

**Catálogo para la app móvil** (un solo JSON, sin auth):

- **`GET /api/catalogo`**  
  Respuesta estructurada, por ejemplo:

```json
{
  "ok": true,
  "generated_at": "2026-04-10T...",
  "base_url": "http://tu-host:3036",
  "productos": [
    {
      "id_producto": 1,
      "nombre": "...",
      "tipo_tela": "...",
      "imagen_url": "/uploads/productos/....jpg",
      "imagen_absoluta": "http://tu-host:3036/uploads/productos/....jpg",
      "precio_base": 99.9,
      "fecha_creacion": "...",
      "variantes": [
        { "id_variante": 1, "id_producto": 1, "color": "...", "talla": "M", "stock": 10 }
      ]
    }
  ]
}
```

- Solo **productos y variantes activos**.
- **`imagen_absoluta`** solo se rellena si defines en `.env`:

```env
PUBLIC_BASE_URL=http://192.168.1.x:3036
```

(Sin eso, el móvil puede armar la URL con la misma base que usa para la API + `imagen_url`.)

---

**Resumen:** la carpeta de subidas queda garantizada al arrancar; el móvil puede consumir el catálogo con **`GET /api/catalogo`** y las imágenes con **`GET {PUBLIC_BASE_URL o tu base}{imagen_url}`**.

---

**User**

me da error al inteantar mpn run dev

---

**Cursor**


Revisando la salida del terminal y el proyecto para identificar el error.




Instalando dependencias: falta el módulo `multer` (está en `package.json` pero no en `node_modules`).




El fallo que muestra el terminal es este:

```text
Error: Cannot find module 'multer'
```

En `package.json` **sí** está `multer`, pero en `node_modules` **no está instalado** (no se ejecutó `npm install` después de añadirlo, o se borró `node_modules`).

**Qué hacer:** en la carpeta del servidor instala dependencias:

```bash
cd ~/Desktop/yizer_project/yizer_development/servidor
npm install
```

Luego:

```bash
npm run dev
```

Eso instalará `multer` junto con el resto (`bcrypt`, `jsonwebtoken`, etc.). Si algo falla al instalar, copia el mensaje completo de `npm install` y lo vemos.

---

**User**

me salio esta advertencia que significa??
@/home/Mario/.cursor/projects/home-Mario-Desktop-yizer-project-yizer-development/terminals/6.txt:141-146 

---

**Cursor**


## Qué significa

Node.js te avisa con el código **DEP0169** de que la función antigua **`url.parse()`** del módulo `url` está **desaconsejada**: el comportamiento no está bien estandarizado y puede dar problemas de seguridad en algunos casos. Node recomienda usar la API moderna **`URL`** (WHATWG), por ejemplo:

```js
new URL('https://ejemplo.com/ruta?x=1')
```

en lugar de `url.parse(...)`.

## ¿Es grave?

- **No es un error**: el servidor sigue funcionando.
- Es una **advertencia de deprecación**: en el futuro Node podría cambiar o quitar `url.parse()`, pero eso aún no rompe tu app hoy.

## ¿De dónde sale?

Casi siempre **no es de tu `server.js`**, sino de alguna **dependencia** (`mysql2`, `express`, `multer`, etc.) que por dentro sigue usando `url.parse()`. Por eso a veces aparece al arrancar aunque tú no uses `url.parse()` en tu código.

## Qué puedes hacer

1. **Ignorarla** mientras desarrollas: es lo más habitual.
2. **Actualizar paquetes** de vez en cuando (`npm update` o versiones nuevas de `mysql2` / `express` cuando salgan sin ese uso).
3. Si quieres **ver qué archivo la dispara** (solo curiosidad):  
   `node --trace-deprecation server.js`  
   (o con nodemon, la variable de entorno `NODE_OPTIONS=--trace-deprecation`).

En resumen: **aviso de Node sobre código antiguo de URLs, normalmente en una librería; tu API puede seguir usándose con tranquilidad.**

