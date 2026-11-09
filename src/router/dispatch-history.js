const route = {
	name: 'picking-history',
	path: '/despacho-historico',
	meta: {
		title: 'DESPACHO HISTORICO',
	},
	component: () => import('@/pages/orders/page-dispatch-history'),
};

export default route;
