const route = {
	name: 'new-vendor',
	path: '/field-sale/vendors/new/:id?',
	props: true,
	meta: {
		navigation: true,
		navigationText: 'Volver a Vendedores',
		navigationRoute: '/field-sale/vendors',
		title: 'NUEVO VENDEDOR',
	},
	component: () => import('@/pages/field-sale/page-new-vendor'),
};

export default route;
