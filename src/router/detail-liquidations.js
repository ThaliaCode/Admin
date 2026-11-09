const route = {
	name: 'page-detail-liquidations',
	path: 'liquidations/detail-liquidations/:id/:typeLiquidation',
	props: true,
	meta: {
		navigation: true,
		navigationText: 'Volver a Historial de Liquidación',
		navigationRoute: '/history-liquidations',
		title: 'Detalle de liquidación',
	},
	component: () => import('@/pages/liquidations/page-detail-history'),
};

export default route;
