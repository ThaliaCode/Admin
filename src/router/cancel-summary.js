const route = {
	name: 'cancel-summary',
	path: 'cancel-summary',
	meta: {
		title: 'Lista de Resumen de Documentos Anulados',
	},
	component: () => import('@/pages/daily-summary/pages-daily-summary'),
};

export default route;
