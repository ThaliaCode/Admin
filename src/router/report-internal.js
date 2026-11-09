const route = {
	name: 'report-internal',
	path: 'report-internal',
	meta: {
		title: 'Reportes Internos',
	},
	component: () => import('@/pages/config-report/page-config-report'),
};

export default route;
