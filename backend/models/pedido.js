
import mongoose from "mongoose";

const pedidoSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    idCliente: {
        type: Number,
        required: true
    },
    fecha: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    metodoEntrega: {
        type: String,
        required: true
    },
    codigoPostal: {
        type: String,
        default: ""
    },
    productos: [{
        idProducto: {
            type: Number,
            required: true
        },
        cantidad: {
            type: Number,
            required: true
        }
    }]
}, {
    collection: "pedidos",
    versionKey: false
});

const Pedido = mongoose.model("Pedido", pedidoSchema);

export default Pedido;
