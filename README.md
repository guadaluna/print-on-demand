# PrintOnDemand

Aplicación web de una tienda online de productos personalizables, desarrollada como proyecto académico. Permite visualizar productos, filtrarlos por categoría, gestionar un carrito y realizar compras mediante una cuenta de usuario.

## Tecnologías utilizadas

### Backend
- **Node.js:** entorno de ejecución de JavaScript.
- **Express:** framework para desarrollar la API REST.
- **MongoDB:** base de datos NoSQL.
- **Mongoose:** modelado y gestión de datos en MongoDB.
- **Bcryptjs:** encriptación de contraseñas.
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
│   └── .env
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

1. Clonar el repositorio:

```bash
git clone https://github.com/guadaluna/print-on-demand.git
```

2. Ingresar a la carpeta del backend:

```bash
cd print-on-demand/backend
```

3. Instalar las dependencias:

```bash
npm install
```

4. Configurar las variables de entorno necesarias para la conexión a MongoDB y la autenticación JWT en un archivo `.env`.

5. Iniciar el servidor:

```bash
npm start
```

6. Abrir el archivo `frontend/index.html` utilizando Live Server o un servidor local.

## Base de datos

El proyecto utiliza MongoDB como base de datos no relacional, con Mongoose para definir los modelos y gestionar las operaciones.

Se utilizan las siguientes colecciones:

- **productos:** almacena la información de los productos disponibles.
- **clientes:** almacena los datos de los clientes.
- **pedidos:** registra las compras realizadas.
- **usuarios:** almacena los datos de las cuentas registradas.

Se implementó un proceso de migración mediante `migrar.js` para trasladar la información de los archivos JSON a MongoDB.

## Rutas de la API

Las rutas permiten realizar operaciones CRUD sobre los recursos del sistema.

### Productos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/productos` | Obtiene todos los productos. |
| GET | `/productos/:id` | Obtiene un producto por su ID. |
| PUT | `/productos/:id` | Actualiza los datos de un producto. |

### Clientes

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/clientes` | Registra un nuevo cliente. |
| GET | `/clientes` | Obtiene la lista de clientes. |
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
| POST | `/usuarios/registro` | Registra un usuario y almacena su contraseña encriptada. |
| POST | `/usuarios/login` | Verifica las credenciales e inicia sesión mediante JWT. |

## Seguridad y autenticación

Se implementaron dos mecanismos para proteger la información de los usuarios:

**Bcryptjs**

Las contraseñas se encriptan mediante bcrypt antes de almacenarse en MongoDB. Durante el inicio de sesión, se verifica la contraseña ingresada comparándola con el hash almacenado.

**JSON Web Token (JWT)**

Al iniciar sesión correctamente, el sistema genera un token de autenticación. Este token se utiliza para verificar la identidad del usuario en operaciones protegidas.

La ruta de registro de pedidos requiere un token válido para permitir la compra.

## Funcionalidades principales

- Visualización del catálogo de productos.
- Filtrado de productos por categoría.
- Agregado y eliminación de productos del carrito.
- Modificación de cantidades y cálculo del total.
- Registro de usuarios e inicio de sesión.
- Encriptación de contraseñas con bcrypt.
- Autenticación mediante JWT.
- Registro de clientes y pedidos.
- Validación de stock y actualización de las unidades disponibles.
- Almacenamiento de la información en MongoDB.

## Mejoras implementadas en esta etapa

- Migración de la información almacenada en archivos JSON a MongoDB.
- Implementación de modelos mediante Mongoose.
- Incorporación del registro e inicio de sesión de usuarios.
- Encriptación de contraseñas mediante bcrypt.
- Implementación de autenticación y verificación de tokens JWT.
- Protección de la operación de compra para usuarios autenticados.
- Adaptación del frontend para trabajar con el nuevo sistema de autenticación.
