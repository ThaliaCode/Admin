const route = {
	name: 'new-route',
	path: '/zones/:zoneId/routes/new',
	props: true,
	meta: {
		navigation: true,
		navigationText: 'Volver a Zonas',
		navigationRoute: '/zones',
		title: 'NUEVA RUTA',
	},
	component: () => import('@/pages/field-sale/page-routes-new'),
};

export default route;
