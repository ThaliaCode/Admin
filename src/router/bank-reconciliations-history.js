const route = {
	name: 'bank-reconciliations-history',
	path: '/bank-reconciliations/history',
	meta: {
		title: 'Historial de Conciliaciones',
	},
	component: () => import('@/pages/movements/pages-bank-reconciliations-history'),
};

export default route;
