const route = {
	name: 'edit-master-product-ecommerce',
	path: '/commerce/:commerceId/:commerceCode/master-product/edit/:id/product-ecommerce',
	meta: {
		title: 'Ecommerce',
	},
	component: () => import('@/pages/products/products-ecommerce'),
	props: true,
};
export default route;
