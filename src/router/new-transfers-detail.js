const route = {
	name: 'page-new-transfers-detail',
	path: '/new-transfers-detail',
	meta: {
		title: 'Movimiento de Producto',
	},
	props: true,
	component: () => import('@/pages/transfers/page-new-transfers-detail'),
};

export default route;
