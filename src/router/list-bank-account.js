const route = {
	name: 'list-bank-accounts',
	path: 'bank-accounts',
	meta: {
		title: 'LISTA DE CUENTAS BANCARIAS',
	},
	component: () => import('@/components/bank-account/bank-accounts'),
};

export default route;
