const route = {
	name: 'new-product',
	path: 'new-product',
	meta: {
		title: 'Nuevo Producto',
	},
	component: () => import('@/components/products/new-product'),
};

export default route;
