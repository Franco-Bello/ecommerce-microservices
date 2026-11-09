# 🛒 E-Commerce Microservices Platform (`tp-final-ecommerce`)

Plataforma de comercio electrónico full-stack desarrollada bajo una arquitectura de **Microservicios con NestJS (TCP)**, **API Gateway (HTTP)**, persistencia políglota (**PostgreSQL, MySQL y MongoDB**) en contenedores **Docker**, y cliente web en **Angular**.

---

## 🏗️ Arquitectura del Sistema

El backend funciona como un monorepo gestionado con `pnpm` y se divide en cuatro aplicaciones principales que se comunican internamente mediante TCP:

| Servicio | Rol | Puerto | Base de Datos / ORM | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- |
| **`api-gateway`** | HTTP Gateway | `3000` | N/A (`ClientProxy`) | Punto de entrada único (`/api`), autenticación JWT, validación de roles (`USER`/`ADMIN`), documentación Scalar y orquestación. |
| **`users-ms`** | Microservicio TCP | `3001` | PostgreSQL 16 + Prisma v7 | Gestión de usuarios, validación de credenciales (bcrypt), perfiles y bajas lógicas (`isActive`). |
| **`products-ms`** | Microservicio TCP | `3002` | MySQL 8.0 + TypeORM | Catálogo de productos, motor de reservas temporales (carrito), control de stock transaccional (`pessimistic_write`) y limpieza automática (`node-cron`). |
| **`invoices-ms`** | Microservicio TCP | `3003` | MongoDB 7.0 + TypeORM | Emisión de facturas tras confirmación de compra e historial de órdenes. |

---

## 📋 Requisitos Previos

* **Node.js** (v20 LTS o superior)
* **pnpm** (v9 o superior) — `npm install -g pnpm`
* **Docker** y **Docker Compose**
* **Angular CLI** (para el frontend) — `pnpm add -g @angular/cli`

---

## ⚙️ Configuración e Instalación Paso a Paso

### 1. Clonar el repositorio

```bash
git clone <URL_DE_TU_REPOSITORIO>
cd tp-final-ecommerce
```

### 2. Levantar las Bases de Datos (Docker)

En la raíz del proyecto se encuentra el archivo `compose.yml` que inicializa los tres motores de base de datos:

```bash
docker compose up -d
```

Contenedores activos (`docker ps`):
* `ecommerce_postgres_users` — PostgreSQL 16 en puerto `5432` (DB: `Usuarios_table`)
* `ecommerce_mysql_products` — MySQL 8.0 en puerto `3306` (DB: `Productos_table`)
* `ecommerce_mongo_invoices` — MongoDB 7.0 en puerto `27017` (DB: `Facturas_collection`)

### 3. Configurar Variables de Entorno

Crea el archivo `backend/.env` (puedes copiar el archivo `backend/.env.example`) con las siguientes variables exactas:

```env
# API Gateway
PORT=3000
JWT_SECRET=super_secret_jwt_key_tp_2026

# Microservicios TCP Ports
USERS_MS_PORT=3001
PRODUCTS_MS_PORT=3002
INVOICES_MS_PORT=3003

# PostgreSQL (users-ms Prisma)
DATABASE_URL="postgresql://root:rootpassword@localhost:5432/Usuarios_table?schema=public"

# MySQL (products-ms TypeORM)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=rootpassword
MYSQL_DATABASE=Productos_table

# MongoDB (invoices-ms TypeORM)
MONGO_URI="mongodb://localhost:27017/Facturas_collection"
```

### 4. Instalar Dependencias del Backend y Configurar Prisma v7

Ingresa al directorio `backend/`, instala los paquetes y genera el cliente local de Prisma junto con las migraciones de PostgreSQL:

```bash
cd backend
pnpm install

# Generar el cliente de Prisma v7 y aplicar migraciones en PostgreSQL
pnpm prisma generate
pnpm prisma migrate dev
```

---

## 🚀 Ejecución del Backend

Abre **4 terminales** ubicadas en el directorio `backend/` y ejecuta cada servicio en modo desarrollo:

**Terminal 1 — Microservicio de Usuarios (Puerto TCP 3001):**
```bash
pnpm nest start users-ms --watch
```

**Terminal 2 — Microservicio de Productos (Puerto TCP 3002):**
```bash
pnpm nest start products-ms --watch
```

**Terminal 3 — Microservicio de Facturas (Puerto TCP 3003):**
```bash
pnpm nest start invoices-ms --watch
```

**Terminal 4 — API Gateway (Puerto HTTP 3000):**
```bash
pnpm nest start api-gateway --watch
```

---

## 📚 Documentación Interactiva de la API (Scalar)

Con el `api-gateway` en ejecución, accede a la referencia interactiva generada con OpenAPI y **Scalar**:

👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

Permite probar todos los endpoints desde el navegador, inyectar el token Bearer (`JWT`) e inspeccionar los modelos de datos.

---

## 🔑 Reglas de Negocio Implementadas

1. **Seguridad y Validación Remota:** `JwtStrategy` en el Gateway consulta en cada petición a `users-ms` vía `ClientProxy` para verificar que el usuario exista y permanezca activo (`isActive: true`).
2. **Reserva de Stock en Carrito:** Agregar productos al carrito (`POST /api/cart/items`) crea o actualiza una reserva en MySQL verificando `availableStock` (`stock físico - stock reservado`), sin descontar el inventario físico hasta la compra.
3. **Advertencia de Stock (`hasStockWarning`):** Al consultar el carrito (`GET /api/cart`), el sistema informa si algún producto reservado sufrió variaciones de disponibilidad o fue desactivado.
4. **Limpieza Automática con Cron Job:** `products-ms` ejecuta una tarea programada diaria (`0 0 * * *`) mediante `node-cron` que elimina reservas con más de 3 días de antigüedad.
5. **Confirmación de Compra Transaccional:** El endpoint `POST /api/cart/checkout` ejecuta una transacción con bloqueo pesimista (`pessimistic_write`) en MySQL para descontar el stock físico y vaciar el carrito, y luego emite la factura en MongoDB a través de `invoices-ms`.
6. **Cruce de Datos entre Microservicios:** Al listar facturas (`GET /api/invoices`), el Gateway obtiene los documentos de MongoDB, extrae los `userId` únicos y consulta en lote a `users-ms` (`find_users_by_ids`) para adjuntar los datos del comprador.

---

## 🌐 Mapa de Endpoints del API Gateway (`http://localhost:3000/api`)

| Módulo | Método | Endpoint | Permiso | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Público | Registra un usuario y retorna `{ user, accessToken }` |
| **Auth** | `POST` | `/api/auth/login` | Público | Autentica credenciales y retorna `{ user, accessToken }` |
| **Auth** | `GET` | `/api/auth/me` | Bearer | Retorna los datos del usuario autenticado |
| **Users** | `GET` | `/api/users/profile` | Bearer | Obtiene el perfil propio |
| **Users** | `PATCH` | `/api/users/profile` | Bearer | Actualiza nombre, email o contraseña propios |
| **Users** | `GET` | `/api/users` | Bearer (`ADMIN`) | Lista todos los usuarios activos |
| **Users** | `GET` | `/api/users/:id` | Bearer (`ADMIN`) | Obtiene el detalle de un usuario por ID |
| **Users** | `DELETE` | `/api/users/:id` | Bearer (`ADMIN`) | Realiza la baja lógica de un usuario (`isActive: false`) |
| **Products** | `GET` | `/api/products` | Público | Lista productos activos con `stock`, `reservedStock` y `availableStock` |
| **Products** | `GET` | `/api/products/:id` | Público | Obtiene el detalle de un producto |
| **Products** | `POST` | `/api/products` | Bearer (`ADMIN`) | Crea un nuevo producto en el catálogo |
| **Products** | `PATCH` | `/api/products/:id` | Bearer (`ADMIN`) | Actualiza datos o stock de un producto |
| **Products** | `DELETE` | `/api/products/:id` | Bearer (`ADMIN`) | Baja lógica del producto y liberación de sus reservas |
| **Cart** | `GET` | `/api/cart` | Bearer | Obtiene el carrito actual con subtotales, total y `hasStockWarning` |
| **Cart** | `POST` | `/api/cart/items` | Bearer | Agrega o actualiza la cantidad reservada de un producto |
| **Cart** | `DELETE` | `/api/cart/items/:productId` | Bearer | Elimina un producto específico del carrito |
| **Cart** | `DELETE` | `/api/cart` | Bearer | Vacía todas las reservas del carrito del usuario |
| **Cart** | `POST` | `/api/cart/checkout` | Bearer | Confirma la compra: descuenta stock físico, vacía carrito y crea factura |
| **Invoices** | `GET` | `/api/invoices/my-invoices` | Bearer | Lista el historial de facturas del usuario autenticado |
| **Invoices** | `GET` | `/api/invoices` | Bearer (`ADMIN`) | Lista todas las facturas del sistema enriquecidas con datos del usuario |
| **Invoices** | `GET` | `/api/invoices/:id` | Bearer | Obtiene el detalle de una factura por su `ObjectId` (propia o `ADMIN`) |