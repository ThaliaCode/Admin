const route = {
	name: 'promotions',
	path: 'promotions',
	redirect: '/promotions/list',
	meta: {
		title: 'Promociones',
	},
	component: () => import('@/pages/promotions/page-promotions'),
	children: [
		{
			name: 'promotions-list',
			path: 'list',
			meta: {
				title: 'Promoción Lista',
			},
			component: () => import('@/pages/promotions/page-list-promotions'),
		},
		{
			name: 'page-new-promotion',
			path: 'new',
			meta: {
				title: 'Nueva Promoción',
				navigation: true,
				navigationText: 'Volver a Lista de Promociones',
				navigationRoute: '/promotions/list',
			},
			props: true,
			component: () => import('@/pages/promotions/page-new-promotion'),
		},
		{
			name: 'edit-promotion',
			path: ':id',
			meta: {
				title: 'Editar Promociones',
				navigation: true,
				navigationText: 'Volver a Lista de Promociones',
				navigationRoute: '/promotions/list',
			},
			props: true,
			component: () => import('@/pages/promotions/page-new-promotion'),
		},
	],
};

export default route;
