const route = {
	name: 'terminals',
	path: 'terminals',
	meta: {
		title: 'Lista de Terminales',
	},
	component: () => import('@/pages/terminals/pages-terminals'),
	children: [
		{
			name: 'terminals-new',
			path: 'new',
			meta: {
				title: 'Lista de Terminales',
			},
			component: () => import('@/pages/terminals/pages-terminals-new'),
		},
		{
			name: 'terminals-edit',
			path: ':id/edit',
			meta: {
				title: 'Lista de Terminales',
			},
			props: true,
			component: () => import('@/pages/terminals/pages-terminals-new'),
		},
		{
			name: 'terminals-delete',
			path: ':id/delete',
			meta: {
				title: 'Lista de Terminales',
			},
			props: true,
			component: () => import('@/pages/terminals/pages-terminals-delete'),
		},
	],
};

export default route;
