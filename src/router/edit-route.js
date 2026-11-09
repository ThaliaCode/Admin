const route = {
	name: 'edit-route',
	path: '/zones/:zoneId/routes/:id/:name/edit',
	props: true,
	meta: {
		navigation: true,
		navigationText: 'Volver a Zonas',
		navigationRoute: '/zones',
		title: 'EDITAR RUTA',
	},
	component: () => import('@/pages/field-sale/page-routes-new'),
};

export default route;
