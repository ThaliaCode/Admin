const route = {
	name: 'conditions',
	path: 'conditions',
	redirect: '/conditions/list',
	meta: {
		title: 'Condición',
	},
	component: () => import('@/pages/promotions/page-conditions'),
	children: [
		{
			name: 'conditions-list',
			path: 'list',
			meta: {
				title: 'Condición Lista',
			},
			component: () => import('@/pages/promotions/page-list-conditions'),
		},
		{
			name: 'page-new-condition',
			path: 'new',
			meta: {
				title: 'Nueva Condición',
				navigation: true,
				navigationText: 'Volver a Lista de Condiciónes',
				navigationRoute: '/conditions/list',
			},
			props: true,
			component: () => import('@/pages/promotions/page-new-condition'),
		},
		{
			name: 'edit-condition',
			path: ':id',
			meta: {
				title: 'Editar Condición',
				navigation: true,
				navigationText: 'Volver a Lista de Condiciónes',
				navigationRoute: '/conditions/list',
			},
			props: true,
			component: () => import('@/pages/promotions/page-new-condition'),
		},
	],
};

export default route;
