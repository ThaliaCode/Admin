const route = {
	name: 'integration',
	path: 'integration',
	redirect: '/integration/configuration',
	component: () => import('@/pages/integration/page-integration'),
	children: [
		{
			name: 'int-configuration',
			path: 'configuration',
			meta: {
				title: 'Notificación',
			},
			component: () => import('@/pages/integration/page-configuration'),
		},
		{
			name: 'payment-gateway',
			path: 'payment-gateway',
			meta: {
				title: 'PASARELA DE PAGOS',
			},
			component: () => import('@/pages/integration/page-payment-gateway'),
		},
		{
			name: 'delivery-integration',
			path: 'delivery',
			meta: {
				title: 'DELIVERY',
			},
			component: () => import('@/pages/integration/page-delivery-integration'),
		},
		{
			name: 'external-apis-integration',
			path: 'external-apis/:subsidiaryId?',
			meta: {
				title: "API'S EXTERNAS",
			},
			component: () => import('@/pages/integration/page-external-apis'),
			props: true,
		},
		{
			name: 'list-of-process',
			path: 'list-of-process',
			meta: {
				title: 'Lista de procesos',
			},
			component: () => import('@/pages/notifications/process-list'),
		},
		{
			name: 'assign-notification-type',
			path: 'list-of-process/:id/assign-notification-type',
			meta: {
				navigation: true,
				navigationText: 'Volver al listado de procesos',
				navigationRoute: '/integration/list-of-process',
				title: 'Asignar Tipo de Notificación',
			},
			props: true,
			component: () => import('@/pages/notifications/page-assign-notification-type'),
		},
		{
			name: 'sync-process',
			path: 'list-of-process/:id/sync',
			meta: {
				navigation: true,
				navigationText: 'Volver al listado de procesos',
				navigationRoute: '/integration/list-of-process',
				title: 'SINCRONIZAR',
			},
			props: true,
			component: () => import('@/pages/integration/page-sync-process'),
		},
		{
			name: 'ecommerce-integration',
			path: 'ecommerce',
			meta: {
				title: 'Ecommerce',
			},
			component: () => import('@/pages/integration/page-ecommerce-integration'),
		},
	],
};

export default route;
