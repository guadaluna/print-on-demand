import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import conectarDB from "./config/database.js";
import Producto from "./models/producto.js";
import Cliente from "./models/cliente.js";
import Pedido from "./models/pedido.js";
import Usuario from "./models/usuario.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

function verificarToken(req, res, next) {
    // Obtener el token del encabezado Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            mensaje: "No se proporcionó un token"
        });
    }

    // Separar la palabra Bearer del token
    const token = authHeader.split(" ")[1];

    try {
        // Verificar que el token sea válido
        const usuario = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = usuario;

        next();

    } catch (error) {
        return res.status(403).json({
            mensaje: "Token inválido o vencido"
        });
    }
}

app.get("/", (req, res) => {
    res.send("API PrintOnDemand funcionando correctamente");
});

app.get("/productos", async (req, res) => {
    try {
        const productos = await Producto.find();

        res.json(productos);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener los productos"
        });
    }
});

app.get("/productos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const producto = await Producto.findOne({ id });

        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.json(producto);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener el producto"
        });
    }
});


app.post("/clientes", async (req, res) => {
    try {
        const { nombre, apellido, email, telefono } = req.body;

        if (!nombre || !apellido || !email || !telefono) {
            return res.status(400).json({
                mensaje: "Todos los datos del cliente son obligatorios"
            });
        }

        const ultimoCliente = await Cliente.findOne().sort({ id: -1 });

        const nuevoCliente = new Cliente({
            id: ultimoCliente ? ultimoCliente.id + 1 : 1,
            nombre,
            apellido,
            email,
            telefono,
            activo: true
        });

        await nuevoCliente.save();

        res.status(201).json(nuevoCliente);

    } catch (error) {
        console.error("Error al registrar el cliente:", error);

        res.status(500).json({
            mensaje: "Error al guardar el cliente"
        });
    }
});

app.post("/usuarios/registro", async (req, res) => {
    try {
        const { nombre, apellido, email, telefono, password } = req.body;

        // Verificar que todos los datos estén completos
        if (!nombre || !apellido || !email || !telefono || !password) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        // Verificar si el email ya está registrado
        const usuarioExiste = await Usuario.findOne({
            email: email.toLowerCase().trim()
        });

        if (usuarioExiste) {
            return res.status(409).json({
                mensaje: "El email ya está registrado"
            });
        }

        // Encriptar la contraseña
        const passwordEncriptada = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario
        const nuevoUsuario = new Usuario({
            nombre,
            apellido,
            email,
            telefono,
            password: passwordEncriptada
        });

        await nuevoUsuario.save();

        res.status(201).json({
            mensaje: "Usuario registrado correctamente",
            usuario: {
                id: nuevoUsuario._id,
                nombre: nuevoUsuario.nombre,
                apellido: nuevoUsuario.apellido,
                email: nuevoUsuario.email
            }
        });

    } catch (error) {
        console.error("Error al registrar el usuario:", error);

        res.status(500).json({
            mensaje: "Error al registrar el usuario"
        });
    }
});

app.post("/usuarios/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar que se hayan ingresado los datos
        if (!email || !password) {
            return res.status(400).json({
                mensaje: "El email y la contraseña son obligatorios"
            });
        }

        // Buscar el usuario
        const usuario = await Usuario.findOne({
            email: email.toLowerCase().trim()
        });

        if (!usuario) {
            return res.status(401).json({
                mensaje: "Email o contraseña incorrectos"
            });
        }

        // Comparar la contraseña ingresada con la encriptada
        const passwordValida = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordValida) {
            return res.status(401).json({
                mensaje: "Email o contraseña incorrectos"
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: usuario._id,
                email: usuario.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            mensaje: "Inicio de sesión correcto",
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email
            }
        });

    } catch (error) {
        console.error("Error al iniciar sesión:", error);

        res.status(500).json({
            mensaje: "Error al iniciar sesión"
        });
    }
});

app.get("/clientes", async (req, res) => {
    try {
        const clientes = await Cliente.find();

        res.json(clientes);

    } catch (error) {
        console.error("Error al obtener los clientes:", error);

        res.status(500).json({
            mensaje: "Error al obtener los clientes"
        });
    }
});


app.post("/pedidos", verificarToken, async (req, res) => {
    try {
        const {
            idCliente,
            fecha,
            total,
            metodoEntrega,
            codigoPostal,
            productos: productosPedido
        } = req.body;

        // Verificar que el cliente exista
        const clienteExiste = await Cliente.findOne({
            id: Number(idCliente)
        });

        if (!Number.isInteger(Number(idCliente)) || !clienteExiste) {
            return res.status(400).json({
                mensaje: "El cliente indicado no existe"
            });
        }

        // Verificar que el pedido tenga productos
        if (
            !Array.isArray(productosPedido) ||
            productosPedido.length === 0
        ) {
            return res.status(400).json({
                mensaje: "El pedido debe incluir productos"
            });
        }

        // Verificar cantidades e IDs
        const productosValidos = productosPedido.every(item =>
            Number.isInteger(Number(item.idProducto)) &&
            Number.isInteger(item.cantidad) &&
            item.cantidad > 0
        );

        if (!productosValidos) {
            return res.status(400).json({
                mensaje: "Hay productos inexistentes o cantidades inválidas"
            });
        }

        // Agrupar las cantidades por producto
        const cantidadesPorProducto = {};

        for (const item of productosPedido) {
            const idProducto = Number(item.idProducto);

            cantidadesPorProducto[idProducto] =
                (cantidadesPorProducto[idProducto] || 0) + item.cantidad;
        }

        // Comprobar existencia y stock en MongoDB
        const productosAActualizar = [];

        for (const idProducto in cantidadesPorProducto) {
            const producto = await Producto.findOne({
                id: Number(idProducto)
            });

            const cantidad = cantidadesPorProducto[idProducto];

            if (!producto) {
                return res.status(400).json({
                    mensaje: "Hay productos inexistentes en el pedido"
                });
            }

            if (!producto.disponible || cantidad > producto.stock) {
                return res.status(400).json({
                    mensaje: "No hay stock suficiente para uno o más productos"
                });
            }

            productosAActualizar.push({
                producto,
                cantidad
            });
        }

        // Validar total y método de entrega
        if (
            typeof total !== "number" ||
            !Number.isFinite(total) ||
            total < 0 ||
            !metodoEntrega
        ) {
            return res.status(400).json({
                mensaje: "El total y el método de entrega son obligatorios"
            });
        }

        // Obtener el siguiente ID
        const ultimoPedido = await Pedido.findOne().sort({ id: -1 });

        const nuevoPedido = new Pedido({
            id: ultimoPedido ? ultimoPedido.id + 1 : 1,
            idCliente: Number(idCliente),
            fecha: fecha || new Date().toISOString().slice(0, 10),
            estado: "Pendiente",
            total,
            metodoEntrega,
            codigoPostal: codigoPostal || "",
            productos: productosPedido.map(item => ({
                idProducto: Number(item.idProducto),
                cantidad: item.cantidad
            }))
        });

        // Actualizar el stock en MongoDB
        for (const item of productosAActualizar) {
            item.producto.stock -= item.cantidad;
            await item.producto.save();
        }

        // Guardar el pedido en MongoDB
        await nuevoPedido.save();

        res.status(201).json(nuevoPedido);

    } catch (error) {
        console.error("Error al registrar el pedido:", error);

        res.status(500).json({
            mensaje: "Error al guardar el pedido o actualizar el stock"
        });
    }
});

app.get("/pedidos", async (req, res) => {
    try {
        const pedidos = await Pedido.find();

        res.json(pedidos);

    } catch (error) {
        console.error("Error al obtener los pedidos:", error);

        res.status(500).json({
            mensaje: "Error al obtener los pedidos"
        });
    }
});

app.get("/pedidos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const pedido = await Pedido.findOne({ id });

        if (!pedido) {
            return res.status(404).json({
                mensaje: "Pedido no encontrado"
            });
        }

        res.json(pedido);

    } catch (error) {
        console.error("Error al obtener el pedido:", error);

        res.status(500).json({
            mensaje: "Error al obtener el pedido"
        });
    }
});

app.put("/productos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const producto = await Producto.findOne({ id });

        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        const { nombre, precio, stock, disponible } = req.body;

        if (
            (precio !== undefined &&
                (typeof precio !== "number" || precio < 0)) ||
            (stock !== undefined &&
                (!Number.isInteger(stock) || stock < 0)) ||
            (nombre !== undefined &&
                (typeof nombre !== "string" || !nombre.trim())) ||
            (disponible !== undefined &&
                typeof disponible !== "boolean")
        ) {
            return res.status(400).json({
                mensaje: "Los datos del producto no son válidos"
            });
        }

        if (nombre !== undefined) producto.nombre = nombre;
        if (precio !== undefined) producto.precio = precio;
        if (stock !== undefined) producto.stock = stock;
        if (disponible !== undefined) producto.disponible = disponible;

        await producto.save();

        res.json(producto);

    } catch (error) {
        console.error("Error al actualizar el producto:", error);

        res.status(500).json({
            mensaje: "Error al actualizar el producto"
        });
    }
});


app.delete("/clientes/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const cliente = await Cliente.findOne({ id });

        if (!cliente) {
            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });
        }

        const tienePedidos = await Pedido.exists({
            idCliente: id
        });

        if (tienePedidos) {
            return res.status(400).json({
                mensaje: "No se puede eliminar el cliente porque tiene pedidos asociados"
            });
        }

        await Cliente.deleteOne({ id });

        res.json({
            mensaje: "Cliente eliminado correctamente"
        });

    } catch (error) {
        console.error("Error al eliminar el cliente:", error);

        res.status(500).json({
            mensaje: "Error al eliminar el cliente"
        });
    }
});

conectarDB().then(() => {
    app.listen(3000, () => {
        console.log("Servidor funcionando en http://localhost:3000");
    });
});