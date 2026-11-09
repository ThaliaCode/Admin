const route = {
	name: 'pages-couriers-list',
	path: '/couriers',
	meta: {
		title: 'Transportistas',
	},
	component: () => import('@/pages/couriers/pages-couriers-list'),
};

export default route;
