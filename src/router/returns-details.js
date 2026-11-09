const route = {
	name: 'pages-returns-detail',
	path: '/returns/:id/detail',
	meta: {
		title: 'LISTA DE PRODUCTOS DE LA TRANSFERENCIA',
	},
	props: true,
	component: () => import('@/pages/transfers/pages-returns-detail'),
};

export default route;
