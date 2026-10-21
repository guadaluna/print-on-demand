Rutas de la API - PrintOnDemand

GET

GET /productos

Obtiene la lista de todos los productos.

GET /productos/:id

Obtiene un producto específico utilizando su ID.

---

POST

POST /clientes

Registra un nuevo cliente.

POST /pedidos

Registra un nuevo pedido, valida la disponibilidad del stock y descuenta las unidades compradas cuando el pedido se guarda correctamente.

---

PUT

PUT /productos/:id

Actualiza los datos de un producto existente, como nombre, precio, stock y disponibilidad.

---

DELETE

DELETE /clientes/:id

Elimina un cliente si no posee pedidos asociados. Si el cliente tiene pedidos, la eliminación es rechazada para mantener la integridad de los datos.