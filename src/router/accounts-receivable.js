const route = {
	name: 'accounts-receivable',
	path: 'accounts-receivable/:customerId?',
	meta: {
		title: 'CUENTAS POR COBRAR',
	},
	component: () => import('@/pages/accounts-receivable/page-accounts-receivable'),
};

export default route;
