const route = {
	name: 'cancel-summary-detail',
	path: 'cancel-summary/:summaryUnsubscribeId/detail',
	meta: {
		title: 'Lista de Ventas',
	},
	props: true,
	component: () => import('@/components/sales/list-of-sales'),
};

export default route;
