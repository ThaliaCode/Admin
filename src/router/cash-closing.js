const route = {
	name: 'cash-closing',
	path: 'cash-closing',
	meta: {
		title: 'Cierre de Caja',
	},
	component: () => import('@/pages/cash-closing/page-cash-closing'),
};

export default route;
