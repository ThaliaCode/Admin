const route = {
	name: 'list-of-transfers',
	path: '/transfers',
	meta: {
		title: 'LISTA DE TRANSFERENCIAS',
	},
	component: () => import('@/components/inventories/list-of-transfers'),
};

export default route;
