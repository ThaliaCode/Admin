const route = {
	path: '/ecommerce/:commerceId?/:commerceCode?/:subsidiaryId?/master-products',
	name: 'master-product-ecommerce',
	meta: {
		navigation: true,
		navigationText: 'Volver a Comercios',
		navigationRoute: '/ecommerce/commerce',
		title: 'Productos Maestros',
		navigationChange: true,
	},
	props: true,
	component: () => import('@/pages/products/master-product'),
};

export default route;
