const route = {
	name: 'daily-summary',
	path: 'daily-summary',
	meta: {
		title: 'Lista de Resumen Diario de Boletas',
	},
	component: () => import('@/pages/daily-summary/pages-daily-summary'),
};

export default route;
