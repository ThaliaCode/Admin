const route = {
	name: 'main-cash-desk-closing',
	path: 'cash-desk-closing',
	redirect: 'cash-desk-closing/list',
	component: () => import('@/components/cash-desk-closing/cash-desk-closing'),
	children: [
		{
			name: 'cash-desk-closing-list',
			path: 'list',
			meta: {
				title: 'Cajas',
			},
			component: () => import('@/components/cash-desk-closing/list'),
		},
		{
			name: 'cash-desk-closing-movement',
			path: 'movement/:id',
			meta: {
				title: 'Arqueo de Caja',
			},
			props: true,
			component: () => import('@/components/cash-desk-closing/movement'),
		},
		{
			name: 'cash-desk-closing-transactions',
			path: 'transactions/:salCashDeskClosingId?/:cashId?',
			meta: {
				title: 'Movimiento de Caja',
			},
			props: true,
			component: () => import('@/components/cash-desk-closing/transactions'),
		},
	],
};

export default route;
