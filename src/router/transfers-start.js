const route = {
	name: 'page-transfers-start',
	path: '/transfers/:id/start',
	meta: {
		title: 'LISTA DE PRODUCTOS DE LA TRANSFERENCIA',
	},
	props: true,
	component: () => import('@/pages/transfers/page-transfers-start'),
};

export default route;
