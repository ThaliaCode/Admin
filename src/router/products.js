const route = {
	name: 'products',
	path: '/products',
	redirect: '/products/list',
	component: () => import('@/components/products/products'),
	children: [
		{
			name: 'list-of-products',
			path: 'list',
			meta: {
				title: 'PRODUCTOS',
			},
			component: () => import('@/components/products/list-of-products'),
		},
		{
			name: 'products-movement',
			path: 'movement',
			meta: {
				title: 'INGRESO DE PRODUCTOS',
				navigation: true,
				navigationText: 'Volver a Lista de Productos',
				navigationRoute: '/products/list',
			},
			component: () => import('@/components/products/movement'),
		},
		{
			name: 'products-history',
			path: 'history',
			meta: {
				title: 'LISTA DE INGRESOS',
			},
			component: () => import('@/components/products/history'),
		},
		{
			name: 'products-dispatch',
			path: 'dispatch',
			meta: {
				title: 'DESPACHO DE PRODUCTOS',
			},
			component: () => import('@/components/products/products-dispatch'),
		},
		{
			name: 'dispatch-detail',
			path: 'dispatch/:id/detail',
			meta: {
				title: 'PRODUCTOS POR ENTREGAR',
			},
			props: true,
			component: () => import('@/components/products/dispatch-detail'),
		},
		{
			name: 'min-stock',
			path: 'warehouse/:id/min-stock',
			meta: {
				title: 'PRODUCTOS CON STOCK MÍNIMO POR ALMACÉN',
			},
			props: true,
			component: () => import('@/components/products/min-stock'),
		},
		{
			name: 'sale-create',
			path: '/transfers/:id/new-sale',
			meta: {
				title: 'NUEVA VENTA DE TRANSFERENCIA',
			},
			props: true,
			component: () => import('@/components/products/sale-create'),
		},
		{
			name: 'master-product',
			path: 'master-product',
			meta: {
				title: 'Productos Maestros',
			},
			props: true,
			component: () => import('@/pages/products/master-product'),
		},
		{
			name: 'new-master-product',
			path: 'master-product/new',
			meta: {
				title: 'Nuevo Producto Maestro',
				navigation: true,
				navigationText: 'Volver a Lista de Productos',
				navigationRoute: '/products/master-product',
			},
			props: true,
			component: () => import('@/pages/master-product/page-new-master-product'),
		},
		{
			name: 'edit-master-product',
			path: 'master-product/edit/:id',
			meta: {
				title: 'Actualizar producto maestro',
				navigation: true,
				navigationText: 'Volver a Lista de Productos',
				navigationRoute: '/products/master-product',
			},
			props: true,
			component: () => import('@/pages/master-product/page-new-master-product'),
		},
		{
			name: 'warranty',
			path: '/warranty',
			meta: {
				title: 'Garantia',
			},
			props: true,
			component: () => import('@/pages/warranty/page-list-warranty'),
		},
	],
};

export default route;
