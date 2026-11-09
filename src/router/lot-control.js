const route = {
	name: 'lot-control',
	path: 'lot-control',
	meta: {
		title: 'Control de Lotes',
	},
	component: () => import('@/pages/lot-control/page-lot-control-list'),
};

export default route;
