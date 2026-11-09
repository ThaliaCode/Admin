const route = {
	name: 'dashboard-sale-points',
	path: 'dashboard/:subsidiaryId/:subsidiaryName/:warehouseId/:warehouseName',
	meta: {
		title: 'Dashboard',
	},
	props: true,
	component: () => import('@/pages/dashboard/pages-sale-point-dashboard'),
};

export default route;
