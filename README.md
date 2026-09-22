Rutas de la API - PrintOnDemand

GET

GET /productos
Obtiene la lista de todos los productos disponibles

GET /productos/:id
Obtiene un producto específico utilizando su ID

--

POST

POST /clientes
Crea un nuevo cliente

POST /pedidos
Crea un nuevo pedido

--

PUT

PUT /productos/:id

Actualiza los datos de un producto existente, como nombre, precio, stock y disponibilidad.

--

DELETE

DELETE /clientes/:id
Elimina un cliente si no posee pedidos asociados. Si el cliente tiene pedidos, la eliminación es rechazada para mantener la integridad de los datos
