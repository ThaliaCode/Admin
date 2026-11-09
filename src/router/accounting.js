const route = {
	name: 'accounting',
	path: 'accounting',
	redirect: '/accounting/list',
	component: () => import('@/components/accounting/main-accounting'),
	children: [
		{
			name: 'accounting-products-list',
			path: 'list',
			meta: {
				title: 'Contabilidad - Listado de productos',
			},
			component: () => import('@/components/accounting/product-list'),
		},
		{
			name: 'accounting-new-product',
			path: 'new-product/:route?',
			meta: {
				title: 'Nuevo producto',
			},
			props: true,
			component: () => import('@/components/accounting/accounting-new-product'),
		},
		{
			name: 'accounting-edit-product',
			path: 'accounting-edit-product/:id/:route?',
			meta: {
				title: 'Editar producto',
				navigation: true,
				navigationText: 'Volver a Lista de Productos',
				navigationRoute: '/products/list',
			},
			props: true,
			component: () => import('@/components/accounting/accounting-new-product'),
		},
		{
			name: 'composition-products',
			path: 'composition-products',
			meta: {
				title: 'Composición de productos',
			},
			component: () => import('@/components/accounting/composition-products'),
		},
		{
			name: 'edit-composition-products',
			path: 'edit-composition-products/:id',
			meta: {
				title: 'Edición de producto combo',
			},
			component: () => import('@/components/accounting/composition-products'),
		},
		{
			name: 'accounting-taxes',
			path: 'accounting-taxes',
			meta: {
				title: 'Contabilidad',
			},
			props: true,
			component: () => import('@/components/accounting/accounting-taxes'),
		},
	],
};

export default route;
