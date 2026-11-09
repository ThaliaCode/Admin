const route = {
	name: 'new-distributor',
	path: '/distributor/new/:id?',
	props: true,
	meta: {
		navigation: true,
		navigationText: 'Volver a Repartidores',
		navigationRoute: '/distributor',
		title: 'Nuevo Repartidor',
	},
	component: () => import('@/pages/field-sale/page-new-vendor'),
};

export default route;
