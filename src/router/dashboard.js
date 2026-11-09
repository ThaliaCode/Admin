const route = {
	name: 'dashboard-general',
	path: 'dashboard',
	meta: {
		title: 'REPORTES',
	},
	component: () => import('@/pages/dashboard-general/page-dashboard-general'),
};

export default route;
