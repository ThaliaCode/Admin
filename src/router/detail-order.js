const route = {
	name: 'page-detail-order',
	path: '/detalle-pedido/:orderId',
	meta: {
		title: 'DETALLE DE PEDIDO',
	},
	component: () => import('@/pages/orders/page-detail-order'),
};

export default route;
