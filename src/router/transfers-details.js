const route = {
	name: 'pages-transfers-detail',
	path: '/transfers/:id/detail',
	meta: {
		title: 'LISTA DE PRODUCTOS DE LA TRANSFERENCIA',
	},
	props: true,
	component: () => import('@/pages/transfers/pages-transfers-detail'),
};

export default route;
