const route = {
	name: 'page-composite-products-new',
	path: '/composite-products/new',
	meta: {
		title: 'Nuevo Producto Compuesto',
	},
	props: true,
	component: () => import('@/pages/composite-products/page-composite-products-new'),
};

export default route;
