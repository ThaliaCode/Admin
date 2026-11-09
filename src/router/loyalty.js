const route = {
	name: 'loyalty',
	path: '/loyalty',
	component: () => import('@/pages/loyalty/page-loyalty'),
	children: [
		{
			name: 'products-loyalty',
			path: 'products',
			meta: {
				title: 'Productos',
			},
			component: () => import('@/pages/loyalty/pages-loyalty-products'),
		},
		{
			name: 'earn-loyalty',
			path: 'earn',
			meta: {
				title: 'Premios',
			},
			component: () => import('@/pages/loyalty/page-earn'),
		},
		{
			name: 'prizes',
			path: 'prizes',
			meta: {
				title: 'Premios',
			},
			component: () => import('@/pages/loyalty/page-prizes'),
		},
		{
			name: 'new-prizes',
			path: 'new-prize',
			meta: {
				title: 'Premios',
			},
			component: () => import('@/pages/loyalty/page-new-prize'),
		},
		{
			name: 'customers-loyalty',
			path: 'customers',
			meta: {
				title: 'Clientes',
			},
			component: () => import('@/pages/loyalty/page-customers'),
		},
	],
};

export default route;
