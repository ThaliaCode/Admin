const route = {
	name: 'products-expired',
	path: '/report-products-expired',
	meta: {
		title: 'Reporte de Productos',
	},
	component: () => import('@/pages/reports/page-products-expired'),
};

export default route;
