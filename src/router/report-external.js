const route = {
	name: 'report-external',
	path: 'report-external',
	meta: {
		title: 'Reportes Externos',
	},
	component: () => import('@/pages/config-report/page-config-report'),
};

export default route;
