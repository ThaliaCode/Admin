# dp6WebAdminMaki

> a vuetify template along to vue-router, axios and some other stuff..

> https://devquipu.netlify.com/ [DEV]

### Libraries Documentation

1. [VueJs](vuejs.org)
2. [Vue-Router](https://router.vuejs.org/en/)
3. [Vuetify](http://next.vuetifyjs.com)
4. [Axios replace to vue-resource](https://github.com/axios/axios)

### Basic Rules

Read our official [guide](https://style-guide.eperedo.com/)

## Environment

Before launching the server, please create a `.env` file with the following variables:

```bash
# App config
ADMIN_CODE=japisale
APP_CODE=japiadmin

ACL_URL=https://devacl.dominio.com/api
CMS_URL=https://cms.dominio1.com
SUNAT=https://datos.controlinn.com/api/
API_QUIPU=https://motor1.datos.com
FACEBOOK_URL=https://facebook.com/japisale
GOOGLE_MAP_KEY=your-google-map-api-key
ID_ANALYTICS=your-analytics-id
URL_POS=https://pos.japisale.com
AWS_S3_SUNAT_FILES=https://your-s3-bucket.amazonaws.com
NUMBER_SUPPORT=973275463
```

> ⚠️ **Note:** These environment variables act as **fallbacks only**.
> The application first checks for **dynamic endpoints** stored in `localStorage`, then falls back to these `.env` values if not found.

---

#### 🔄 Dynamic Endpoints via ACL

When a user logs in via the **ACL service** (`ACL_URL`), the server responds with a `domains` array that includes environment-specific endpoint configurations. File: `@/axios.js`

These endpoints are **stored in `localStorage`** and take **priority** over the static `.env` values.

#### ✅ Example ACL `domains` response:

```json
[
	{
		"id": 1,
		"code": "PRODUCTS_URL",
		"name": "PRODUCTS",
		"endPoint": "https://d.product2.cmarket.com"
	}
]
```

These dynamic keys (e.g. `PRODUCTS_URL`, `SALES_URL`, etc.) are then accessed internally in the app using:

```js
helper.getEndPointDynamic('PRODUCTS_URL');
```

And used to configure Axios instances. If the key is missing from localStorage, the app will fallback to the corresponding `.env` variable.

## Install NVM

```bash
# install nvm from github repository
https://github.com/coreybutler/nvm-windows/releases

# from the CMD check if it was installed correctly
nvm version

# install version 18
nvm install 18

# use the version you installed
nvm use 18
```

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:PORT
npm run dev

# build for production with minification
npm run build
```

## Build Setup 04/2024

```bash
# use node v18
nvm use 18

# install dependencies (package-lock.json)
npm ci

# serve with hot reload at localhost:PORT (.ENV)
npm run dev

# build for production with minification
npm run build
```

## Comandos para errores que ocurren al levantar el proyecto

```bash
# reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## Autoformat settings

Enter VSCode settings, search for Format on save and activate it, then install the Prettier – Code Formatter extension and do the following steps

1. Open the Command Palette: ⌘/Ctrl+⇧+P
2. Select Format Document With…
3. Select Configure Default Formatter…
4. Select Prettier - Code Formatter

## Extensions for the project (optional)

- JavaScript Debugger
- Babel JavaScript
- Conventional Commits
- Error Lens
- Git Graph
- Git Lens
- Snippets of JavaScript
- Snippets of Vue2
- Snippets of Vuetify

## Scope

0. MAQ - Maquetación

1. SAL - Ventas (sales)
   - Nueva Venta
   - Nueva Cotización
   - Lista de Ventas
   - Cuentas por Cobrar
   - Historial Cuentas por Cobrar
   - Despacho de Productos
   - Guías de Remisión
   - Lista de Precios
   - Lista de Transportistas
2. CUS - Clientes (customers)
   - Lista de Clientes
   - Nuevo Cliente
3. TRE - Tesorería (treasury)
   - Lista de Caja
   - Movimientos de Caja
   - Movimientos de Bancos
   - Conciliación Bancaria
   - Historial Conciliaciones
4. PUR - Compras (purchases)
   - Grupos
   - Proveedores
   - Nueva Compra
   - Lista de Compras
   - Cuentas por Pagar
5. PRO - Productos (products)
   - Nuevo Producto
   - Lista de Productos
   - Transferencias
   - Características
   - Categorías
   - Marcas
   - Unidades
6. PROJ - Proyectos (projects)
   - Requerimientos
   - Crear Cotización
   - Tipos de Requerimiento
   - OIT Técnico
7. INV - Inventarios (inventories) - Inventarios Maestros
   8 OPE - Operaciones (operations) - Operaciones - OIT
8. USE - Usuarios (users)
   - Lista de Usuarios
9. REP - Reportes (reports)
   - Reporte
   - Reporte IN/OUT
   - Utilidades por Tienda
   - Reporte de Rotación
   - Detalle de Transferencias
10. DOC - Documentos (documents)
    - Lista de Documentos
11. QUIPU - Quipu
    - Productos
    - Auxiliares Contables
    - Clientes
12. PAY - Nómina (payroll)
    - Control de Empleados
    - Tipo de Empleado
    - Tipo de Personal
    - Tipo de Remuneración
    - Tipo de Empleador
    - Datos Adicionales
    - Áreas
13. BACC - Cuentas Bancarias (bank accountings)
    - Crear Cuenta
    - Lista de Cuentas
    - Secuencia de cheques
14. ECO - Ecommerce (ecommerce)
    - Banner
    - Categorías
    - Productos Ecommerce
    - Pedidos
    - Filtros
    - Secciones de Productos
15. CONF - Configuración (configurations)
    - Configuración
    - Terminales
    - Tiendas
    - Sucursales
    - Template

<!-- ---- -->

export NODE_OPTIONS=--max-old-space-size=4096
