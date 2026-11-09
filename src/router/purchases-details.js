const route = {
	name: 'purchases-details',
	path: '/purchases/:id/details',
	meta: {
		title: 'Detalle de Compra',
	},
	props: true,
	component: () => import('@/pages/purchases/pages-purchases-details'),
};

export default route;
