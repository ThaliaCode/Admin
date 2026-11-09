const route = {
	name: 'new-sale',
	path: 'new-sale',
	meta: {
		title: 'NUEVA VENTA',
	},
	component: () => import('@/components/sales/new-sale'),
};

export default route;
