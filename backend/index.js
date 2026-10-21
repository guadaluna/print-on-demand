
import express from "express";
import fs from "node:fs/promises";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const productos = JSON.parse(
    await fs.readFile("productos.json", "utf-8")
);

const clientes = JSON.parse(
    await fs.readFile("clientes.json", "utf-8")
);

const pedidos = JSON.parse(
    await fs.readFile("pedidos.json", "utf-8")
);

async function guardarJSON(archivo, datos) {
    await fs.writeFile(
        archivo,
        JSON.stringify(datos, null, 2),
        "utf-8"
    );
}

function siguienteId(datos) {
    return datos.reduce(
        (mayor, elemento) => Math.max(mayor, elemento.id),
        0
    ) + 1;
}

app.get("/", (req, res) => {
    res.send("API PrintOnDemand funcionando correctamente");
});

app.get("/productos", (req, res) => {
    res.json(productos);
});

app.get("/productos/:id", (req, res) => {
    const id = Number(req.params.id);

    const producto = productos.find(
        producto => producto.id === id
    );

    if (!producto) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    res.json(producto);
});


app.post("/clientes", async (req, res) => {
    const { nombre, apellido, email, telefono } = req.body;

    if (!nombre || !apellido || !email || !telefono) {
        return res.status(400).json({
            mensaje: "Todos los datos del cliente son obligatorios"
        });
    }

    const nuevoCliente = {
        id: siguienteId(clientes),
        nombre,
        apellido,
        email,
        telefono,
        activo: true
    };

    clientes.push(nuevoCliente);

    try {
        await guardarJSON("clientes.json", clientes);

        res.status(201).json(nuevoCliente);
    } catch (error) {
        clientes.pop();

        res.status(500).json({
            mensaje: "Error al guardar el cliente"
        });
    }
});

app.post("/pedidos", async (req, res) => {
    const {
        idCliente,
        fecha,
        total,
        metodoEntrega,
        codigoPostal,
        productos: productosPedido
    } = req.body;

    const clienteExiste = clientes.some(
        cliente => cliente.id === Number(idCliente)
    );

    if (!Number.isInteger(Number(idCliente)) || !clienteExiste) {
        return res.status(400).json({
            mensaje: "El cliente indicado no existe"
        });
    }

    if (
        !Array.isArray(productosPedido) ||
        productosPedido.length === 0
    ) {
        return res.status(400).json({
            mensaje: "El pedido debe incluir productos"
        });
    }

    const productosValidos = productosPedido.every(item =>
        Number.isInteger(Number(item.idProducto)) &&
        productos.some(
            producto => producto.id === Number(item.idProducto)
        ) &&
        Number.isInteger(item.cantidad) &&
        item.cantidad > 0
    );

    if (!productosValidos) {
        return res.status(400).json({
            mensaje: "Hay productos inexistentes o cantidades inválidas"
        });
    }

    const stockDisponible = productosPedido.every(item => {
    const producto = productos.find(
        producto => producto.id === Number(item.idProducto)
    );

    return producto.disponible &&
        item.cantidad <= producto.stock;
    });

    if (!stockDisponible) {
        return res.status(400).json({
            mensaje: "No hay stock suficiente para uno o más productos"
        });
    }

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

    const productosOriginales = JSON.parse(JSON.stringify(productos));

    const nuevoPedido = {
        id: siguienteId(pedidos),
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
    };

    productosPedido.forEach(item => {
        const producto = productos.find(
            producto => producto.id === Number(item.idProducto)
        );

        producto.stock -= item.cantidad;
    });

    pedidos.push(nuevoPedido);

    try {
        await guardarJSON("productos.json", productos);
        await guardarJSON("pedidos.json", pedidos);

        res.status(201).json(nuevoPedido);
    } catch (error) {
        productos.splice(0, productos.length, ...productosOriginales);
        pedidos.pop();

        try {
            await guardarJSON("productos.json", productos);
            await guardarJSON("pedidos.json", pedidos);
        } catch (errorRestauracion) {
            console.error("Error al restaurar los archivos JSON:", errorRestauracion);
        }

        res.status(500).json({
            mensaje: "Error al guardar el pedido o actualizar el stock"
        });
    }

    try {
        await guardarJSON("pedidos.json", pedidos);

        res.status(201).json(nuevoPedido);
    } catch (error) {
        pedidos.pop();

        res.status(500).json({
            mensaje: "Error al guardar el pedido"
        });
    }
});

app.put("/productos/:id", async (req, res) => {
    const id = Number(req.params.id);

    const producto = productos.find(
        producto => producto.id === id
    );

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

    const anterior = { ...producto };

    if (nombre !== undefined) producto.nombre = nombre;
    if (precio !== undefined) producto.precio = precio;
    if (stock !== undefined) producto.stock = stock;
    if (disponible !== undefined) producto.disponible = disponible;

    try {
        await guardarJSON("productos.json", productos);

        res.json(producto);
    } catch (error) {
        Object.assign(producto, anterior);

        res.status(500).json({
            mensaje: "Error al guardar el producto"
        });
    }
});

app.delete("/clientes/:id", async (req, res) => {
    const id = Number(req.params.id);

    const indice = clientes.findIndex(
        cliente => cliente.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensaje: "Cliente no encontrado"
        });
    }

    const tienePedidos = pedidos.some(
        pedido => pedido.idCliente === id
    );

    if (tienePedidos) {
        return res.status(400).json({
            mensaje: "No se puede eliminar el cliente porque tiene pedidos asociados"
        });
    }

    const [clienteEliminado] = clientes.splice(indice, 1);

    try {
        await guardarJSON("clientes.json", clientes);

        res.json({
            mensaje: "Cliente eliminado correctamente"
        });
    } catch (error) {
        clientes.splice(indice, 0, clienteEliminado);

        res.status(500).json({
            mensaje: "Error al guardar la eliminación"
        });
    }
});

app.listen(3000, () => {
    console.log("Servidor funcionando en http://localhost:3000");
});
