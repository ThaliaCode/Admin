const route = {
	name: 'groups',
	path: 'groups',
	meta: {
		title: 'GRUPOS',
	},
	component: () => import('@/pages/purchases/pages-groups'),
	children: [
		{
			name: 'groups-new',
			path: ':typeEntityId/new',
			meta: {
				title: 'Nuevo Grupo',
			},
			props: true,
			component: () => import('@/pages/purchases/pages-groups-new'),
		},
		{
			name: 'groups-edit',
			path: ':id/edit',
			meta: {
				title: 'Editar Grupo',
			},
			props: true,
			component: () => import('@/pages/purchases/pages-groups-new'),
		},
		{
			name: 'groups-delete',
			path: ':id/:name/delete',
			meta: {
				title: 'Eliminar Grupo',
			},
			props: true,
			component: () => import('@/pages/purchases/pages-groups-delete'),
		},
	],
};

export default route;
