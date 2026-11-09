const route = {
	name: 'reference-guides-carrier',
	path: '/reference-guides-carrier',
	redirect: '/reference-guides-carrier/list',
	meta: {
		isCarrier: true,
	},
	component: () => import('@/components/reference-guides/reference-guides'),
	children: [
		{
			name: 'list-of-guides-carrier',
			path: 'list',
			meta: {
				isCarrier: true,
				title: 'GUÍAS DE REMISIÓN TRANSPORTISTA',
			},
			component: () => import('@/components/reference-guides/list-of-guides'),
		},
		{
			name: 'reference-guide-carrier-detail',
			path: ':id?/detail/:saleId?/guide/:transportId?',
			meta: {
				isCarrier: true,
				navigation: true,
				title: 'GUÍA DE REMISIÓN DE TRANSPORTISTA',
				navigationText: 'Volver a Guías de Remisión',
				navigationRoute: '/reference-guides-carrier/list',
			},
			props: true,
			component: () => import('@/components/reference-guides/detail'),
		},
		{
			name: 'reference-guide-carrier-detail-dispatch',
			path: ':id?/detail/:saleId?',
			meta: {
				isCarrier: true,
				navigation: true,
				title: 'GUÍA DE REMISIÓN DE TRANSPORTISTA',
				navigationText: 'Volver a Despacho',
				navigationRoute: '/products/dispatch',
			},
			props: true,
			component: () => import('@/components/reference-guides/detail'),
		},
	],
};

export default route;
