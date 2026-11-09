const route = {
	name: 'customers-new',
	path: '/customers/new',
	meta: {
		title: 'Nuevo Cliente',
	},
	component: () => import('@/pages/customers/pages-customers-new'),
};

export default route;
