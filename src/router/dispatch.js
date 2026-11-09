const route = {
	name: 'dispatch-transfers',
	path: 'dispatch',
	meta: {
		title: 'DESPACHO',
	},
	component: () => import('@/components/inventories/list-of-transfers'),
};

export default route;
