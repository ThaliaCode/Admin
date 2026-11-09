const route = {
	name: 'page-warehouses',
	path: '/warehouses',
	redirect: '/warehouses/list',
	component: () => import('@/pages/warehouses/page-warehouses'),
	children: [
		{
			name: 'warehouses',
			path: 'list',
			meta: {
				title: 'Listado de Tiendas',
			},
			component: () => import('@/pages/warehouses/page-warehouses-list'),
		},
		{
			name: 'page-warehouses-new',
			path: 'new',
			meta: {
				title: 'Nueva Tienda',
				navigation: true,
				navigationText: 'Volver a Lista de Tiendas',
				navigationRoute: '/warehouses/list',
			},
			component: () => import('@/pages/warehouses/page-warehouses-new'),
		},
		{
			name: 'page-warehouses-edit',
			path: ':id/edit',
			meta: {
				title: 'Editar Tienda',
				navigation: true,
				navigationText: 'Volver a Lista de Tiendas',
				navigationRoute: '/warehouses/list',
			},
			props: true,
			component: () => import('@/pages/warehouses/page-warehouses-new'),
		},
	],
};

export default route;
