const route = {
	name: 'daily-summary-create',
	path: 'daily-summary/new',
	meta: {
		title: 'Enviar Resumen Diario de Boletas',
	},
	component: () => import('@/pages/daily-summary/pages-daily-summary-create'),
};

export default route;
