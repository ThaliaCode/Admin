const route = {
	name: 'new-account-bank',
	path: 'new-account-bank',
	meta: {
		title: 'Nueva Cuenta Bancaria',
	},
	component: () => import('@/components/bank-account/new-account-bank'),
};

export default route;
