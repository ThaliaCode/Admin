const route = {
	name: 'vehicle-list',
	path: '/vehicles',
	meta: {
		title: 'Lista de Vehículos',
	},
	component: () => import('@/pages/vehicles/page-vehicles-list'),
	children: [
		{
			name: 'new-vehicle',
			path: 'new',
			meta: {
				title: 'Nuevo Vehículo',
			},
			component: () => import('@/pages/vehicles/page-new-vehicles'),
		},
		{
			name: 'edit-vehicle',
			path: ':id/edit',
			meta: {
				title: 'Editar Vehículo',
			},
			component: () => import('@/pages/vehicles/page-new-vehicles'),
			props: true,
		},
	],
};

export default route;
