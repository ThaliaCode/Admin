const route = {
	name: 'bank-movements',
	path: 'bank-movements',
	meta: {
		title: 'Movimientos de Banco',
	},
	props: true,
	component: () => import('@/pages/movements/pages-bank-movements'),
	children: [
		{
			name: 'bank-movements-new',
			path: 'new',
			meta: {
				title: 'Movimientos de Banco',
			},
			component: () => import('@/pages/movements/pages-bank-movements-new'),
		},
		{
			name: 'bank-to-bank',
			path: 'transfer',
			meta: {
				title: 'Movimientos de Banco',
			},
			component: () => import('@/pages/movements/pages-bank-movements-transfer'),
		},
	],
};

export default route;
