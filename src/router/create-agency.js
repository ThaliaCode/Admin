const route = {
	name: 'page-new-agency',
	path: 'new-agency/:id',
	meta: {
		title: 'Agencias de transporte',
		navigation: true,
		navigationText: 'Volver a Listado de Agencias',
		navigationRoute: '/agency-transport',
	},
	component: () => import('@/pages/orders/page-new-agency'),
};

export default route;
