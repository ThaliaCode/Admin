const route = {
	name: 'amortizations',
	path: 'amortizations',
	redirect: '/amortizations/list',
	component: () => import('@/components/amortizations/amortizations'),
	children: [
		{
			name: 'amortizations-list',
			path: 'list',
			meta: {
				title: 'Amortizaciones',
			},
			component: () => import('@/components/amortizations/amortizations-list'),
		},
		{
			name: 'amortizations-history',
			path: 'history',
			meta: {
				title: 'Historial de Amortizaciones',
			},
			props: true,
			component: () => import('@/pages/amortizations/pages-amortizations-history'),
		},
	],
};

export default route;
