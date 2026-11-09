const route = {
	name: 'edit-product',
	path: 'product/edit/:id/:warehouseId/:brandId',
	meta: {
		title: 'Editar Producto',
	},
	component: () => import('@/components/products/new-product'),
};

export default route;
