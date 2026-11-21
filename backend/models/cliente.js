
import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    collection: "clientes",
    versionKey: false
});

const Cliente = mongoose.model("Cliente", clienteSchema);

export default Cliente;
