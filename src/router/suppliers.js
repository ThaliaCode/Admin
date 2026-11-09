const route = {
	name: 'suppliers',
	path: '/suppliers',
	meta: {
		title: 'Proveedores',
	},
	component: () => import('@/pages/purchases/pages-suppliers'),
	children: [
		{
			name: 'suppliers-new',
			path: 'new',
			meta: {
				title: 'Nuevo Proveedor',
			},
			component: () => import('@/pages/purchases/pages-suppliers-new'),
		},
		{
			name: 'suppliers-edit',
			path: ':id/edit',
			meta: {
				title: 'Editar Proveedor',
			},
			props: true,
			component: () => import('@/pages/purchases/pages-suppliers-new'),
		},
		{
			name: 'suppliers-delete',
			path: ':id/delete',
			meta: {
				title: 'Eliminar Proveedor',
			},
			props: true,
			component: () => import('@/pages/purchases/pages-suppliers-delete'),
		},
		{
			name: 'suppliers-group',
			path: '/group/new',
			meta: {
				title: 'Proveedores',
			},
			component: () => import('@/pages/purchases/pages-suppliers-group'),
		},
		{
			name: 'suppliers-purchases-details',
			path: ':id/purchases/details',
			meta: {
				title: 'Proveedores',
			},
			props: true,
			component: () => import('@/pages/purchases/pages-suppliers-purchases-details'),
		},
		{
			name: 'suppliers-total',
			path: ':id/:type/total',
			meta: {
				title: 'Proveedores',
			},
			props: true,
			component: () => import('@/pages/purchases/pages-suppliers-total'),
		},
		{
			name: 'suppliers-documents',
			path: ':id/documents',
			meta: {
				title: 'Documentos',
			},
			props: true,
			component: () => import('@/pages/purchases/pages-suppliers-documents'),
		},
	],
};

export default route;
