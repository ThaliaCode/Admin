const route = {
	name: 'purchases-edit',
	path: '/purchases/:id/edit',
	props: true,
	meta: {
		title: 'Editar Compra',
	},
	component: () => import('@/pages/purchases/pages-purchases-new'),
};

export default route;
