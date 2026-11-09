const route = {
	name: 'dashboard-warehouses',
	path: 'dashboard/:id/:subsidiaryName',
	meta: {
		title: 'Dashboard',
	},
	props: true,
	component: () => import('@/pages/dashboard/pages-warehouse-dashboard'),
};

export default route;
