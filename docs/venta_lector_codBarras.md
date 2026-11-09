FLUJO DE VENTA CON LECTOR DE CODIGO DE BARRAS
=============================================

1. Buscar variable `company.flagBarcodeReader` en respuesta del servicio `employees/current`. Si el valor es 1 es porque la compania va a usar el lector de codigo de barras.
2. Verificar que el usuario tenga rol `MAKI_VENDOR`.
	1.1 Buscar en el local-storage: admin::admin-user.roleCode
2. Crear variable para saber si el usuario es vendedor: `isSalesRole`
3. Extraer el `id` del almacen asignado al punto de venta
4. El usuario debe hacer click en campo de texto para buscar producto
5. Leer el codigo de barras para que aparezca en el campo de texto
6. Determinar si el codigo ingresado proviene del lector o del tecleo del usuario
7. Consumir servicio de busqueda de producto para determinar si el codigo le pertenece a una producto
8. Si no pertenece, validar que el codigo tenga 13 digitos
9. Si tiene 13 digitos, extraer codigo del producto y peso.
10. Consumir servicio de busqueda de producto para determinar si existe algun producto con ese codigo.
11. Si existe, obtener el producto y agregarlo al listado de productos a vender con la cantidad indicada en el codigo de barras (peso).
