const route = {
	name: 'cash',
	path: '/cash',
	component: () => import('@/pages/cash/page-cash'),
	children: [
		{
			name: 'cash-box-close',
			path: 'close',
			meta: {
				title: 'Caja',
			},
			component: () => import('@/pages/cash/pages-cash-box-close'),
		},
		{
			name: 'box-history',
			path: 'history',
			meta: {
				title: 'Historial Cierre de Caja',
			},
			component: () => import('@/pages/cash/pages-box-history'),
		},
		{
			name: 'box-history-detail',
			path: 'history/:id/detail',
			meta: {
				title: 'Detalle de Caja',
			},
			component: () => import('@/pages/cash/pages-box-history-detail'),
			props: true,
		},
		{
			name: 'box-detail',
			path: ':id/detail',
			meta: {
				title: 'Detalle de Caja',
			},
			component: () => import('@/pages/cash/pages-box-history-detail'),
			props: true,
		},
	],
};

export default route;
