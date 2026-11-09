const route = {
	name: 'detail-income',
	path: '/income/detail',
	meta: {
		title: 'DETALLE DE INGRESOS',
	},
	component: () => import('@/pages/inventories/page-detail-in-out'),
};

export default route;
