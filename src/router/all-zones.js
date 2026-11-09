const route = {
	name: 'all-zones',
    path: 'all-zones',
	meta: {
		title: 'Mapa con zonas',
        navigation: true,
		navigationText: 'Volver a Zonas',
		navigationRoute: '/zones',
    },
    component: () => import('@/pages/field-sale/page-all-zones'),
};

export default route;
