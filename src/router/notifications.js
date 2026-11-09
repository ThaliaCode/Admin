const route = {
	name: 'notifications',
	path: '/notifications',
	component: () => import('@/pages/notifications/page-notifications'),
	children: [
		{
			name: 'type-notifications',
			path: 'type-notifications',
			meta: {
				title: 'Tipo de Notificaciones',
			},
			component: () => import('@/pages/notifications/type-notifications'),
		},
	],
};

export default route;
