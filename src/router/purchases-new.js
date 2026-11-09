const route = {
	name: 'purchases-new',
	path: '/purchases/new',
	meta: {
		title: 'Nueva Compra',
	},
	props: true,
	component: () => import('@/pages/purchases/pages-purchases-new'),
};

export default route;
