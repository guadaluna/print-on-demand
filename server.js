import express from "express";
import fs from "fs";

const app = express();

app.use(express.json());


app.get("/", (req, res) => {
    res.send("API PrintOnDemand funcionando correctamente");
});

//Productos
const productos = JSON.parse(
    fs.readFileSync("productos.json", "utf-8")
);

const clientes = JSON.parse(
    fs.readFileSync("clientes.json", "utf-8")
);

const pedidos = JSON.parse(
    fs.readFileSync("pedidos.json", "utf-8")
);

app.get("/productos", (req, res) => {
    res.json(productos);
});

app.get("/productos/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const producto = productos.find(producto => producto.id === id);

    if (!producto) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    res.json(producto);
});

app.post("/clientes", (req, res) => {
    const nuevoCliente = {
        id: clientes.length + 1,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        email: req.body.email,
        telefono: req.body.telefono,
        activo: true
    };

    clientes.push(nuevoCliente);

    res.status(201).json(nuevoCliente);
});

app.post("/pedidos", (req, res) => {
    const nuevoPedido = {
        id: pedidos.length + 1,
        idCliente: req.body.idCliente,
        fecha: req.body.fecha,
        estado: "Pendiente",
        total: req.body.total,
        metodoEntrega: req.body.metodoEntrega,
        codigoPostal: req.body.codigoPostal,
        productos: req.body.productos
    };

    pedidos.push(nuevoPedido);

    res.status(201).json(nuevoPedido);
});

app.put("/productos/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const producto = productos.find(producto => producto.id === id);

    if (!producto) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    producto.nombre = req.body.nombre;
    producto.precio = req.body.precio;
    producto.stock = req.body.stock;
    producto.disponible = req.body.disponible;

    res.json(producto);
});

app.delete("/clientes/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const cliente = clientes.find(cliente => cliente.id === id);

    if (!cliente) {
        return res.status(404).json({
            mensaje: "Cliente no encontrado"
        });
    }

    const tienePedidos = pedidos.some(pedido => pedido.idCliente === id);

    if (tienePedidos) {
        return res.status(400).json({
            mensaje: "No se puede eliminar el cliente porque tiene pedidos asociados"
        });
    }

    const indice = clientes.findIndex(cliente => cliente.id === id);

    clientes.splice(indice, 1);

    res.json({
        mensaje: "Cliente eliminado correctamente"
    });
});

//Server
app.listen(3000, () => {
    console.log("Servidor funcionando en http://localhost:3000");
});