const route = {
	name: 'bank-reconciliations',
	path: '/bank-reconciliations',
	meta: {
		title: 'Conciliación Bancaria',
	},
	component: () => import('@/pages/movements/pages-bank-reconciliations'),
};

export default route;
