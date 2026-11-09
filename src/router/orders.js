const route = {
	meta: {
		title: 'PEDIDOS',
	},
	name: 'orders-module',
	path: '/orders',
	redirect: '/orders/pending/list',
	component: () => import('@/pages/orders/page-pending-orders'),
	children: [
		{
			meta: {
				title: 'PEDIDOS PENDIENTES',
			},
			name: 'pending-orders-list',
			path: 'pending/list',
			component: () => import('@/pages/orders/page-pending-orders-list'),
		},
		{
			meta: {
				title: 'PEDIDOS PENDIENTES DE ENTREGA',
			},
			name: 'pending-orders-map',
			path: 'pending/map',
			component: () => import('@/pages/orders/page-pending-orders-map'),
		},
		{
			name: 'pending-routes-map',
			path: 'map-route',
			meta: {
				navigation: true,
				navigationText: 'Volver al listado de Ruta de Distribución',
				navigationRoute: '/orders/distribution-routes',
				title: 'PEDIDOS PENDIENTES DE RUTAS',
			},
			component: () => import('@/pages/orders/page-pending-orders-map'),
		},
		{
			name: 'pending-order-edit',
			path: 'pending/:id/edit',
			meta: {
				title: 'EDITAR PEDIDO',
			},
			props: true,
			component: () => import('@/pages/ecommerce/page-edit-order'),
		},
		{
			name: 'create-order',
			path: 'create',
			meta: {
				title: 'Nuevo Pedido',
			},
			component: () => import('@/pages/ecommerce/page-create-order'),
		},
		{
			name: 'pending-order-detail',
			path: 'pending/:id/detail',
			meta: {
				title: 'DETALLE DEL PEDIDO',
			},
			props: true,
			component: () => import('@/pages/orders/page-detail-order'),
		},
		{
			name: 'create-route-from-orders',
			path: 'pending/route/create/:id?',
			meta: {
				title: 'Crear ruta de distribución',
			},
			props: true,
			component: () => import('@/pages/orders/page-pending-orders-route-create'),
		},
		{
			meta: {
				title: 'RUTAS DE DISTRIBUCIÓN',
			},
			name: 'distribution-routes',
			path: 'distribution-routes',
			component: () => import('@/pages/orders/page-distribution-routes'),
		},
		{
			meta: {
				navigation: true,
				navigationText: 'Volver al listado de rutas de distribución',
				navigationRoute: '/orders/distribution-routes',
				title: 'Detalle Ruta de Distribución',
			},
			name: 'detail-route-distribution',
			path: 'detail-distribution/:id?',
			props: true,
			component: () => import('@/pages/orders/page-pending-orders-list'),
		},
		{
			name: 'consolidation-order',
			meta: {
				navigation: true,
				navigationText: 'Volver al listado de Ruta de Distribución',
				navigationRoute: '/orders/distribution-routes',
				title: 'Consolidación de Pedidos',
			},
			path: 'consolidation-order',
			component: () => import('@/pages/orders/page-consolidation-orders'),
		},
		{
			name: 'transaction-history',
			meta: {
				title: 'HISTORIAL DE TRANSACCIONES',
			},
			path: 'history-transactions',
			component: () => import('@/pages/orders/page-history-transactions'),
		},
		{
			meta: {
				title: 'PEDIDOS POR RECOGER',
			},
			name: 'pick-up-earrings',
			path: 'to-pick-up',
			component: () => import('@/pages/orders/page-orders-flow-two'),
		},
		{
			meta: {
				title: 'PEDIDOS POR ENTREGAR',
			},
			name: 'orders-to-deliver',
			path: 'to-deliver',
			component: () => import('@/pages/orders/page-orders-flow-two'),
		},
		{
			meta: {
				navigation: true,
				navigationText: 'Volver al listado de rutas de distribución',
				navigationRoute: '/orders/distribution-routes',
				title: 'Detalle Ruta de Distribución',
			},
			name: 'detail-new-route-distribution',
			path: 'detail/:id?',
			props: true,
			component: () => import('@/pages/orders/page-orders-flow-two'),
		},
		{
			meta: {
				title: 'LIQUIDACIONES',
			},
			name: 'liquidations-order',
			path: 'liquidations',
			component: () => import('@/pages/orders/page-orders-liquidations'),
		},
	],
};

export default route;
