const route = {
	name: 'import-documents',
	path: '/import-documents',
	meta: {
		title: 'Listas de archivos txt',
	},
	component: () => import('@/pages/sri/pages-import-documents'),
	children: [
		{
			name: 'detail-import',
			path: ':id/:dateStart/:dateEnd/detail',
			meta: {
				title: 'Relación de Documentos',
			},
			component: () => import('@/pages/sri/pages-detail-import'),
			props: true,
			children: [
				{
					name: 'detail-purchase',
					path: ':purchaseId/detail',
					meta: {
						title: 'Detalle de',
					},
					component: () => import('@/pages/sri/pages-detail-purchase'),
					props: true,
				},
			],
		},
	],
};

export default route;
