const route = {
	name: 'debts-to-pay',
	path: '/debts-to-pay',
	meta: {
		title: 'Cuentas por Pagar',
	},
	component: () => import('@/pages/purchases/pages-debts-to-pay'),
};

export default route;
