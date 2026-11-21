
import mongoose from "mongoose";

const productoSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true
    },
    categoria: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    talles: {
        type: [String],
        default: []
    },
    personalizable: {
        type: Boolean,
        default: false
    },
    disponible: {
        type: Boolean,
        default: true
    }
}, {
    collection: "productos",
    versionKey: false
});

const Producto = mongoose.model("Producto", productoSchema);

export default Producto;