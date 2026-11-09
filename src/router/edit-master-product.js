const editMasterProductRoute = {
	name: 'edit-master-product-ecommerce-primary',
	path: '/commerce/:commerceId?/:commerceCode?/:subsidiaryId?/master-product/edit/:id',
	meta: {
		title: 'Actualizar producto maestro',
	},
	props: true,
	component: () => import('@/pages/master-product/page-new-master-product'),
};
export default editMasterProductRoute;
