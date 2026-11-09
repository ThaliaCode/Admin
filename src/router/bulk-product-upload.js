const route = {
	name: 'bulk-product-upload',
	path: 'bulk-product-upload',
	meta: {
		title: 'Carga masiva de productos - Nuevo',
	},
	component: () => import('@/pages/field-sale/page-bulk-product-upload'),
};

export default route;
