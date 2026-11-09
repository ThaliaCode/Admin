const route = {
	name: 'oip',
	path: '/oip',
	redirect: '/oip/list',
	component: () => import('@/components/oip/oip'),
	children: [
		{
			name: 'list-oip',
			path: 'list',
			meta: {
				title: 'ORDENES INTERNAS DE PRODUCCIÓN',
			},
			component: () => import('@/components/oip/components/list-of-oip'),
		},
		{
			name: 'new-oip',
			path: 'new',
			meta: {
				title: 'ORDEN INTERNA DE PRODUCCIÓN',
			},
			component: () => import('@/components/oip/components/new-oip'),
		},
		{
			name: 'oip-edit',
			path: ':id/edit',
			props: true,
			meta: {
				title: 'ORDEN INTERNA DE PRODUCCIÓN',
			},
			component: () => import('@/components/oip/components/new-oip'),
		},
	],
};

export default route;
