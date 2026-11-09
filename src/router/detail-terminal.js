const route = {
	name: 'detail-terminal',
	path: 'detail-terminal/:id',
	meta: {
		title: 'Movimiento de Cierre de Punto de Venta',
		navigation: true,
		navigationText: 'Volver a Puntos de Venta',
		navigationRoute: '/terminal-point-sale',
	},
	component: () => import('@/pages/point-of-sales/terminal-detail'),
};

export default route;
