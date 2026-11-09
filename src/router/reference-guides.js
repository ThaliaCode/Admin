const route = {
	name: 'reference-guides',
	path: '/reference-guides',
	redirect: '/reference-guides/list',
	component: () => import('@/components/reference-guides/reference-guides'),
	children: [
		{
			name: 'list-of-guides',
			path: 'list',
			meta: {
				title: 'GUÍAS DE REMISIÓN',
			},
			component: () => import('@/components/reference-guides/list-of-guides'),
		},
		{
			name: 'reference-guide-detail',
			path: ':id?/detail/:saleId?/guide/:transportId?',
			meta: {
				navigation: true,
				title: 'GUÍA DE REMISIÓN',
				navigationText: 'Volver a Guías de Remisión',
				navigationRoute: '/reference-guides/list',
			},
			props: true,
			component: () => import('@/components/reference-guides/detail'),
		},
		{
			name: 'reference-guide-detail-dispatch',
			path: ':id?/detail/:saleId?',
			meta: {
				navigation: true,
				title: 'GUÍA DE REMISIÓN',
				navigationText: 'Volver a Despacho',
				navigationRoute: '/products/dispatch',
			},
			props: true,
			component: () => import('@/components/reference-guides/detail'),
		},
	],
};

export default route;
