const route = {
	name: 'origens',
	path: '/origens',
	meta: {
		title: 'Origenes',
	},
	props: true,
	component: () => import('@/pages/origens/page-origens'),
};

export default route;
