# Flujo: Nueva Venta - Nueva Cotizacion

La pantalla de **Nueva venta** y **Nueva Cotizacion** comparten gran parte de las funciones
por este motivo, cada cambio generado en alguno de ellos debe generar un proceso de revision en el otro.

Adicionalmente, es necesario realizar flujos completos en:

### Nueva venta
- Crear una venta con productos agregados desde listado de productos y desde nueva venta (a traves del buscador).Se deben agregar productos de los cuatro tipos: `compuestos`, `terminados`, `servicio` y `variantes`. Agregar productos con el lector de codigo de barras.
- Crear la venta con con pago a contado y otra a credito
- Verificar en ambos casos el detalle de venta y descargar el comprobante
- Buscar la venta y clonarla.
- Generar nueva venta a partir de la clonacion

## Nueva Cotizacion
- Crear una cotizacion con productos agregados desde listado de productos y desde nueva venta (a traves del buscador). Se deben agregar producto de los cuatro tipos: `compuestos`, `terminados`, `servicio` y `variantes`.
- Buscar la cotizacion recien creada y convertirla en venta.
- Verificar se muestren los productos con los valores correctos.
- Crear la venta
- Verificar Detalle de venta y descargar detalle