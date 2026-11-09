const route = {
	name: 'detail-expenses',
	path: '/expenses/detail',
	meta: {
		title: 'DETALLE DE EGRESOS',
	},
	component: () => import('@/pages/inventories/page-detail-in-out'),
};

export default route;
