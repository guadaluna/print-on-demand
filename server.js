import express from "express";
import fs from "fs";

const app = express();

app.use(express.json());

const productos = JSON.parse(
    fs.readFileSync("productos.json", "utf-8")
);


app.get("/", (req, res) => {
    res.send("API PrintOnDemand funcionando correctamente");
});

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

app.listen(3000, () => {
    console.log("Servidor funcionando en http://localhost:3000");
});