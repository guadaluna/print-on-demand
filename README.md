# PrintOnDemand

Aplicación web de una tienda online de productos personalizables. Permite visualizar productos, filtrarlos por categoría, gestionar un carrito de compras y realizar pedidos mediante una cuenta de usuario.

El proyecto utiliza Node.js y Express para el desarrollo del backend, MongoDB como base de datos no relacional y HTML, CSS y JavaScript para el frontend.

## Tecnologías utilizadas

### Backend
- **Node.js:** entorno de ejecución de JavaScript.
- **Express 5:** framework para desarrollar la API REST.
- **MongoDB:** base de datos no relacional.
- **Mongoose:** modelado y gestión de datos en MongoDB.
- **Bcryptjs:** generación y comparación de hashes de contraseñas.
- **Jsonwebtoken (JWT):** autenticación y verificación de usuarios.
- **CORS:** configuración del acceso entre frontend y backend.
- **Dotenv:** gestión de variables de entorno.

### Frontend
- HTML5
- CSS3
- JavaScript

## Estructura del proyecto

```text
print-on-demand/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── cliente.js
│   │   ├── pedido.js
│   │   ├── producto.js
│   │   └── usuario.js
│   ├── index.js
│   ├── migrar.js
│   ├── clientes.json
│   ├── pedidos.json
│   ├── productos.json
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── .gitignore
└── README.md
```

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/guadaluna/print-on-demand.git
```

### 2. Ingresar a la carpeta del backend

```bash
cd print-on-demand/backend
```

### 3. Instalar las dependencias

```bash
npm install
```

### 4. Configurar las variables de entorno

Crear un archivo `.env` dentro de la carpeta `backend` con las siguientes variables:

```env
MONGO_URI=tu_cadena_de_conexion_mongodb
JWT_SECRET=tu_clave_secreta
```

Reemplazar los valores de ejemplo por los correspondientes a la configuración propia.

### 5. Iniciar el servidor

```bash
npm start
```

El servidor se ejecuta en:

```text
http://localhost:3000
```

### 6. Abrir el frontend

Abrir el archivo `frontend/index.html` mediante Live Server o un servidor local.

## Base de datos

El proyecto utiliza MongoDB como base de datos no relacional y Mongoose para definir los modelos y gestionar las operaciones.

Se utilizan las siguientes colecciones:

- **productos:** almacena la información de los productos disponibles.
- **clientes:** almacena los datos de los clientes.
- **pedidos:** registra las compras realizadas.
- **usuarios:** almacena los datos de las cuentas registradas.

Se desarrolló un proceso de migración mediante el archivo `migrar.js` para trasladar la información inicial almacenada en archivos JSON a MongoDB.

## Rutas de la API

La API utiliza los siguientes endpoints:

**URL base:** `http://localhost:3000`

### Productos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/productos` | Obtiene todos los productos. |
| GET | `/productos/:id` | Obtiene un producto por su ID. |
| PUT | `/productos/:id` | Actualiza los datos de un producto existente. |

### Clientes

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/clientes` | Registra un nuevo cliente. |
| GET | `/clientes` | Obtiene todos los clientes. |
| DELETE | `/clientes/:id` | Elimina un cliente si no tiene pedidos asociados. |

### Pedidos

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/pedidos` | Registra un pedido, valida el stock y descuenta las unidades compradas. Requiere autenticación. |
| GET | `/pedidos` | Obtiene todos los pedidos. |
| GET | `/pedidos/:id` | Obtiene un pedido por su ID. |

### Usuarios y autenticación

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/usuarios/registro` | Registra un usuario con su contraseña encriptada. |
| POST | `/usuarios/login` | Verifica las credenciales e inicia sesión mediante JWT. |

## Seguridad y autenticación

Se implementaron mecanismos de seguridad para proteger la información de los usuarios y restringir determinadas operaciones.

### Bcryptjs

Las contraseñas se procesan mediante `bcryptjs` antes de almacenarse en MongoDB.

Se utiliza `bcrypt.hash()` con 10 rondas de sal para generar el hash de la contraseña. Durante el inicio de sesión, `bcrypt.compare()` permite verificar la contraseña ingresada sin almacenar contraseñas en texto plano.

### JSON Web Token (JWT)

Al iniciar sesión correctamente, el sistema genera un token JWT que contiene información del usuario.

El token tiene una duración de 2 horas y se utiliza para verificar la identidad del usuario en operaciones protegidas.

Se implementó el middleware `verificarToken`, que comprueba la validez del token recibido en el encabezado `Authorization`.

La ruta de registro de pedidos requiere un token válido para permitir la compra.

## Funcionalidades principales

- Visualización del catálogo de productos.
- Filtrado de productos por categoría.
- Gestión del carrito de compras.
- Modificación de cantidades y cálculo del total.
- Registro de usuarios e inicio de sesión.
- Encriptación de contraseñas mediante bcrypt.
- Autenticación mediante JWT.
- Registro de clientes y pedidos.
- Validación de disponibilidad de stock.
- Actualización del stock después de una compra.
- Almacenamiento de la información en MongoDB.

## Mejoras implementadas en esta etapa

- Migración de la información almacenada en archivos JSON a MongoDB.
- Incorporación de modelos mediante Mongoose.
- Implementación del registro e inicio de sesión de usuarios.
- Encriptación de contraseñas mediante bcryptjs.
- Implementación de autenticación y verificación de tokens JWT.
- Protección de la operación de compra para usuarios autenticados.
- Adaptación del frontend para trabajar con el nuevo sistema de autenticación.
