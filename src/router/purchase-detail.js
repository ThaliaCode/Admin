const route = {
	name: 'purchase-detail',
	path: '/purchase/:id/detail',
	meta: {
		title: 'DETALLE DE COMPRA',
	},
	props: true,
	component: () => import('@/pages/purchases/page-purchase-detail'),
};

export default route;
