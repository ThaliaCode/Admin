const route = {
	name: 'actions',
	path: 'actions',
	redirect: '/actions/list',
	component: () => import('@/pages/promotions/page-actions'),
	children: [
		{
			name: 'actions-list',
			path: 'list',
			meta: {
				title: 'Acciones',
			},
			component: () => import('@/pages/promotions/page-list-actions'),
		},
		{
			name: 'page-new-action',
			path: 'new',
			meta: {
				title: 'Nueva Acción',
				navigation: true,
				navigationText: 'Volver a Lista de Acciónes',
				navigationRoute: '/actions/list',
			},
			props: true,
			component: () => import('@/pages/promotions/page-new-action'),
		},
		{
			name: 'edit-action',
			path: ':id',
			meta: {
				title: 'Editar Acción',
				navigation: true,
				navigationText: 'Volver a Lista de Acciónes',
				navigationRoute: '/actions/list',
			},
			props: true,
			component: () => import('@/pages/promotions/page-new-action'),
		},
	],
};

export default route;
