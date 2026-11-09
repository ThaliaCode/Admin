const route = {
	name: 'page-closing-internal',
	path: 'cash-closing-internal/:cashId/:cashClosingId/:currency',
	meta: {
		title: 'Cierre de Caja',
		navigation: true,
		navigationText: 'Volver a Puntos de Venta',
		navigationRoute: '/terminal-point-sale',
	},
	component: () => import('@/pages/cash/page-closing-internal'),
	props: true,
};

export default route;
