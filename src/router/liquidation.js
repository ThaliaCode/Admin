const route = {
	name: 'liquidation',
	path: '/liquidation',
	redirect: '/liquidation/list',
	component: () => import('@/pages/liquidation/liquidation'),
	children: [
		{
			name: 'liquidation-list',
			path: 'list',
			meta: {
				title: 'Lista de liquidaciones',
			},
			component: () => import('@/pages/liquidation/page-liquidation-list'),
		},
		{
			name: 'liquidation-detail',
			path: 'detail/:id',
			meta: {
				title: 'Detalles de Liquidación',
				navigation: true,
				navigationText: 'Volver a Lista de liquidaciones',
				navigationRoute: '/liquidation/list',
			},
			props: true,
			component: () => import('@/pages/liquidation/page-liquidation-detail'),
		},
		{
			name: 'liquidation-detail-vendor',
			path: 'detail-vendor/:id',
			meta: {
				title: 'Detalles de Liquidación del vendedor',
			},
			props: true,
			component: () => import('@/pages/liquidation/page-liquidation-detail-vendor'),
		},
	]
};

export default route;
