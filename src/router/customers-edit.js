const route = {
	name: 'customers-edit',
	path: '/customers/:id/edit',
	meta: {
		title: 'Editar Cliente',
	},
	props: true,
	component: () => import('@/pages/customers/pages-customers-new'),
};

export default route;
