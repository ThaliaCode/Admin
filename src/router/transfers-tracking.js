const route = {
	name: 'pages-transfers-tracking',
	path: '/transfers/:id/tracking',
	meta: {
		title: 'MOVIMIENTO DE PRODUCTO',
	},
	props: true,
	component: () => import('@/pages/transfers/page-transfers-tracking'),
};

export default route;
