const route = {
	name: 'purchases',
	path: '/purchases',
	meta: {
		title: 'Compras',
	},
	component: () => import('@/pages/purchases/pages-purchases-list'),
};

export default route;
