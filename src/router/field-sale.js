const route = {
	meta: {
		title: 'Venta de Campo',
	},
	name: 'field-sale',
	path: '/field-sale',
	redirect: 'zone-assignment',
	component: () => import('@/pages/field-sale/page-field-sale'),
	children: [
		{
			meta: {
				navigation: true,
				navigationText: 'Volver a Zonas',
				navigationRoute: '/zones',
				title: 'Nueva Zona',
			},
			name: 'page-zone-assignment',
			path: 'zone-assignment/:id?',
			props: true,
			component: () => import('@/pages/field-sale/page-zone-assignment'),
		},
		{
			meta: {
				title: 'Promedio de Ventas y Pedidos',
			},
			name: 'dashboard-vendor',
			path: 'dashboard',
			component: () => import('@/pages/field-sale/page-dashboard'),
		},
		{
			meta: {
				title: 'Pedidos',
			},
			name: 'orders-vendor',
			path: 'orders',
			component: () => import('@/pages/ecommerce/pages-ecommerce-order'),
		},
		{
			meta: {
				title: 'HISTORIAL DE RUTAS',
			},
			name: 'route-history',
			path: 'route-history/:id?',
			component: () => import('@/pages/field-sale/page-route-history'),
		},
		{
			meta: {
				navigation: true,
				navigationText: 'Volver a historial de rutas',
				navigationRoute: '/field-sale/route-history',
				title: 'DETALLE HISTORIAL DE RUTA',
			},
			name: 'route-history-detail',
			path: 'route-history/:id?/detail',
			props: true,
			component: () => import('@/pages/field-sale/page-route-history-detail'),
		},
		// NUEVO HISTORIAL DE RUTA
		{
			meta: {
				navigation: true,
				navigationText: 'Volver a historial de rutas',
				navigationRoute: '/field-sale/route-history',
				title: 'DETALLE HISTORIAL DE RUTA',
			},
			name: 'route-history-detail-new',
			path: 'route-history/:id?/detail-new',
			props: true,
			component: () => import('@/pages/field-sale/page-route-history-detail-new'),
		},
	],
};

export default route;
