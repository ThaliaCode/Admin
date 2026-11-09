const route = {
	name: 'transport-agency',
	path: 'agency-transport',
	meta: {
		title: 'Agencias de Transportes',
	},
	component: () => import('@/pages/orders/page-transport-agency'),
};

export default route;
