const route = {
	name: 'documents-suppliers',
	path: 'documents-suppliers',
	meta: {
		title: 'Documentos para proveedores',
	},
	props: true,
	component: () => import('@/pages/page-documents-suppliers'),
};

export default route;
