const route = {
	name: 'massive-tecking',
	path: '/massive-tecking/:id',
	meta: {
		title: 'Boleteo Masivo',
	},
	component: () => import('@/pages/tecking/page-massive-tecking'),
};

export default route;
