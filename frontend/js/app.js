
const API_URL = "http://localhost:3000";

const contenedorProductos = document.getElementById("productos");
const filtroCategoria = document.getElementById("filtro-categoria");
const contenidoCarrito = document.getElementById("contenido-carrito");
const cantidadCarrito = document.getElementById("cantidad-carrito");
const totalCarrito = document.getElementById("total-carrito");
const botonFinalizar = document.getElementById("finalizar-compra");
const mensajeCarrito = document.getElementById("mensaje-carrito");

let productos = [];
let carrito = cargarCarrito();

function cargarCarrito() {
    try {
        const datos = JSON.parse(localStorage.getItem("carrito")) || [];
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function formatearPrecio(precio) {
    return precio.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    });
}

async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API_URL}/productos`);

        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener los productos");
        }

        productos = await respuesta.json();

        cargarCategorias();
        mostrarProductos(productos);
        mostrarCarrito();
    } catch (error) {
        console.error("Error al cargar productos:", error);
        contenedorProductos.textContent =
            "No pudimos cargar los productos. Verificá que el servidor esté funcionando.";
    }
}

function cargarCategorias() {
    const categorias = [
        ...new Set(productos.map(producto => producto.categoria))
    ];

    categorias.forEach(categoria => {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        filtroCategoria.appendChild(opcion);
    });
}

function obtenerIcono(categoria) {
    const iconos = {
        Remera: "👕",
        Buzo: "🧥",
        Taza: "☕",
        Gorra: "🧢"
    };

    return iconos[categoria] || "🛍️";
}

function mostrarProductos(listaProductos) {
    contenedorProductos.replaceChildren();

    if (listaProductos.length === 0) {
        contenedorProductos.textContent =
            "No hay productos en esta categoría.";
        return;
    }

    listaProductos.forEach(producto => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-producto";

        const imagen = document.createElement("div");
        imagen.className = "imagen-producto";

        const icono = document.createElement("span");
        icono.textContent = obtenerIcono(producto.categoria);
        icono.setAttribute("aria-hidden", "true");
        imagen.appendChild(icono);

        const informacion = document.createElement("div");
        informacion.className = "info-producto";

        const categoria = document.createElement("p");
        categoria.className = "categoria-producto";
        categoria.textContent = producto.categoria;

        const nombre = document.createElement("h3");
        nombre.textContent = producto.nombre;

        const descripcion = document.createElement("p");
        descripcion.className = "descripcion-producto";
        descripcion.textContent = producto.descripcion;

        const precio = document.createElement("p");
        precio.className = "precio-producto";
        precio.textContent = formatearPrecio(producto.precio);

        const stock = document.createElement("p");
        stock.className = "stock-producto";
        stock.textContent = producto.stock > 0
            ? `Stock disponible: ${producto.stock}`
            : "Sin stock";

        const boton = document.createElement("button");
        boton.className = "boton-agregar";
        boton.textContent = "Agregar al carrito";
        boton.disabled = !producto.disponible || producto.stock <= 0;

        boton.addEventListener("click", () => agregarAlCarrito(producto.id));

        informacion.append(
            categoria,
            nombre,
            descripcion,
            precio,
            stock,
            boton
        );

        tarjeta.append(imagen, informacion);
        contenedorProductos.appendChild(tarjeta);
    });
}

function agregarAlCarrito(idProducto) {
    const producto = productos.find(item => item.id === idProducto);

    if (!producto || !producto.disponible || producto.stock <= 0) {
        return;
    }

    const item = carrito.find(item => item.idProducto === idProducto);
    const cantidadActual = item ? item.cantidad : 0;

    if (cantidadActual >= producto.stock) {
        mensajeCarrito.textContent = "No hay más stock disponible.";
        return;
    }

    if (item) {
        item.cantidad++;
    } else {
        carrito.push({
            idProducto: producto.id,
            cantidad: 1
        });
    }

    guardarCarrito();
    mostrarCarrito();
    mensajeCarrito.textContent = `${producto.nombre} agregado al carrito.`;
}

function cambiarCantidad(idProducto, cambio) {
    const item = carrito.find(item => item.idProducto === idProducto);
    const producto = productos.find(item => item.id === idProducto);

    if (!item || !producto) return;

    const nuevaCantidad = item.cantidad + cambio;

    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(idProducto);
        return;
    }

    if (nuevaCantidad > producto.stock) {
        mensajeCarrito.textContent = "No hay más stock disponible.";
        return;
    }

    item.cantidad = nuevaCantidad;
    guardarCarrito();
    mostrarCarrito();
    mensajeCarrito.textContent = "";
}

function eliminarDelCarrito(idProducto) {
    carrito = carrito.filter(item => item.idProducto !== idProducto);

    guardarCarrito();
    mostrarCarrito();
    mensajeCarrito.textContent = "";
}

function mostrarCarrito() {
    contenidoCarrito.replaceChildren();

    let total = 0;
    let cantidadTotal = 0;

    if (carrito.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "Tu carrito está vacío.";
        contenidoCarrito.appendChild(mensaje);
    }

    carrito.forEach(item => {
        const producto = productos.find(
            producto => producto.id === item.idProducto
        );

        if (!producto) return;

        const subtotal = producto.precio * item.cantidad;
        total += subtotal;
        cantidadTotal += item.cantidad;

        const fila = document.createElement("div");
        fila.className = "item-carrito";

        const informacion = document.createElement("div");

        const nombre = document.createElement("h3");
        nombre.textContent = producto.nombre;

        const subtotalTexto = document.createElement("p");
        subtotalTexto.textContent = formatearPrecio(subtotal);

        informacion.append(nombre, subtotalTexto);

        const controles = document.createElement("div");
        controles.className = "controles-carrito";

        const botonMenos = document.createElement("button");
        botonMenos.textContent = "−";
        botonMenos.setAttribute("aria-label", "Reducir cantidad");
        botonMenos.addEventListener("click", () =>
            cambiarCantidad(producto.id, -1)
        );

        const cantidad = document.createElement("span");
        cantidad.textContent = item.cantidad;

        const botonMas = document.createElement("button");
        botonMas.textContent = "+";
        botonMas.setAttribute("aria-label", "Aumentar cantidad");
        botonMas.disabled = item.cantidad >= producto.stock;
        botonMas.addEventListener("click", () =>
            cambiarCantidad(producto.id, 1)
        );

        const botonEliminar = document.createElement("button");
        botonEliminar.className = "eliminar-item";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.addEventListener("click", () =>
            eliminarDelCarrito(producto.id)
        );

        controles.append(
            botonMenos,
            cantidad,
            botonMas,
            botonEliminar
        );

        fila.append(informacion, controles);
        contenidoCarrito.appendChild(fila);
    });

    cantidadCarrito.textContent = cantidadTotal;
    totalCarrito.textContent = total.toLocaleString("es-AR");
    botonFinalizar.disabled = carrito.length === 0;
}

filtroCategoria.addEventListener("change", () => {
    const categoria = filtroCategoria.value;

    const filtrados = categoria === "todos"
        ? productos
        : productos.filter(producto => producto.categoria === categoria);

    mostrarProductos(filtrados);
});

botonFinalizar.addEventListener("click", () => {
    mensajeCarrito.textContent =
        "El carrito funciona. En el próximo paso conectaremos la compra con el servidor.";
});

cargarProductos();

