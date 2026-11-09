const route = {
	name: 'liquidations-drivers',
	path: '/liquidations-drivers',
	meta: {
		title: 'Liquidaciones de Repartidores',
	},
	component: () => import('@/pages/orders/page-orders-liquidations'),
};

export default route;
