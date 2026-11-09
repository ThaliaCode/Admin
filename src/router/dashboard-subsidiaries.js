const route = {
	name: 'dashboard',
	path: '/subsidiaries/dashboard',
	meta: {
		title: 'Dashboard',
	},
	component: () => import('@/pages/dashboard/pages-subsidiary-dashboard'),
};

export default route;
