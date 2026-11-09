const route = {
	name: 'history-liquidations',
	path: 'history-liquidations',
	meta: {
		title: 'Historial de Liquidaciones',
	},
	component: () => import('@/pages/liquidations/page-history-liquidations'),
};

export default route;
