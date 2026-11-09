const newMasterProductRoute = {
	name: 'new-master-product-ecommerce',
	path: '/commerce/:commerceId?/:commerceCode?/:subsidiaryId?/master-product/new',
	meta: {
		title: 'Nuevo producto maestro',
	},
	props: true,
	component: () => import('@/pages/master-product/page-new-master-product'),
};
export default newMasterProductRoute;
