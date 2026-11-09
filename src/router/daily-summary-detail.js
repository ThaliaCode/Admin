const route = {
	name: 'daily-summary-detail',
	path: 'daily-summary/:ballotSummaryId/detail',
	meta: {
		title: 'Lista de Ventas',
	},
	props: true,
	component: () => import('@/components/sales/list-of-sales'),
};

export default route;
