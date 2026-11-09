const route = {
	name: 'test-page',
	path: '/test',
	meta: {
		title: 'Prueba',
	},
	component: () => import('@/pages/test-page/test-page'),
};

export default route;
