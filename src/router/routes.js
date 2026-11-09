const route = {
	name: 'routes',
	path: '/zones/:zoneId/routes',
	meta: {
		navigation: true,
		navigationText: 'Volver a zonas',
		navigationRoute: '/zones',
		title: 'Rutas',
	},
	props: true,
	component: () => import('@/pages/field-sale/page-routes'),
};

export default route;
