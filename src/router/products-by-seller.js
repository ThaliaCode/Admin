const route = {
	name: 'products-by-seller',
	path: '/products-by-seller',
	meta: {
		title: 'Lista de Producto por Vendedor',
	},
	component: () => import('@/pages/sales/page-products-by-seller'),
    props: true,
};

export default route;
