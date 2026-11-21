
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "node:fs/promises";

import conectarDB from "./config/database.js";
import Producto from "./models/producto.js";
import Cliente from "./models/cliente.js";
import Pedido from "./models/pedido.js";

dotenv.config();

async function migrarDatos() {
    try {
        await conectarDB();

        // Leer los archivos JSON
        const productos = JSON.parse(
            await fs.readFile(new URL("./productos.json", import.meta.url), "utf-8")
        );

        const clientes = JSON.parse(
            await fs.readFile(new URL("./clientes.json", import.meta.url), "utf-8")
        );

        const pedidos = JSON.parse(
            await fs.readFile(new URL("./pedidos.json", import.meta.url), "utf-8")
        );

        // Comprobar que las colecciones estén vacías
        const [cantidadProductos, cantidadClientes, cantidadPedidos] =
            await Promise.all([
                Producto.countDocuments(),
                Cliente.countDocuments(),
                Pedido.countDocuments()
            ]);

        if (cantidadProductos > 0 || cantidadClientes > 0 || cantidadPedidos > 0) {
            throw new Error(
                "La migración se canceló: alguna colección ya contiene datos."
            );
        }

        // Insertar los datos en MongoDB
        await Producto.insertMany(productos);
        console.log(`Productos migrados: ${productos.length}`);

        await Cliente.insertMany(clientes);
        console.log(`Clientes migrados: ${clientes.length}`);

        await Pedido.insertMany(pedidos);
        console.log(`Pedidos migrados: ${pedidos.length}`);

        console.log("Migración completada correctamente.");

    } catch (error) {
        console.error("Error durante la migración:", error.message);

    } finally {
        await mongoose.disconnect();
    }
}

migrarDatos();
