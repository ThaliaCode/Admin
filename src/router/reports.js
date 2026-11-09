const route = {
	name: 'reports',
	path: '/reports',
	redirect: '/reports/list',
	component: () => import('@/components/reports/reports'),
	children: [
		{
			name: 'reports-list',
			path: '/reports/list',
			meta: {
				title: 'Reportes',
			},
			component: () => import('@/components/reports/reports-list'),
		},
		{
			name: 'report-in-out',
			path: '/reports/in/out',
			meta: {
				title: 'Reporte IN/OUT',
			},
			component: () => import('@/pages/reports/pages-reports-in-out'),
		},
		{
			name: 'utilities-by-warehouse',
			path: '/reports/utilities-by-warehouse',
			meta: {
				title: 'Reporte de Utilidades por Tienda',
			},
			component: () => import('@/pages/reports/pages-reports-utilities-by-warehouse'),
		},
		{
			name: 'rotation-report',
			path: '/reports/rotation',
			meta: {
				title: 'Reporte de Rotación',
			},
			component: () => import('@/pages/reports/pages-reports-rotation'),
		},
		{
			name: 'reports-transfers-detail',
			path: '/reports/transfer-detail',
			meta: {
				title: 'REPORTE DE PRODUCTOS DEVUELTOS',
			},
			component: () => import('@/pages/reports/pages-reports-transfer-detail'),
		},
		{
			name: 'sales-category',
			path: '/reports/sales-category',
			component: () => import('@/pages/reports/pages-reports-sales-category'),
			meta: {
				title: 'Reporte de Venta por Categoría',
			},
		},
		{
			name: 'custom-report',
			path: '/reports/custom-report',
			component: () => import('@/pages/reports/pages-custom-report'),
			meta: {
				title: 'Reporte Personalizado',
			},
		},
		{
			name: 'detail-report-category',
			path: '/reports/detail-sales-category/:id?',
			meta: {
				title: 'Detalle de la Categoría',
			},
			component: () => import('@/pages/reports/pages-detail-reports-sales-category'),
			props: true,
		},
		{
			name: 'report-sales',
			path: 'sales-report',
			meta: {
				title: 'Reporte de Ventas',
			},
			component: () => import('@/pages/reports/page-sales-report'),
			props: true,
		},
		{
			name: 'report-purchases',
			path: 'purchases-report',
			meta: {
				title: 'Reporte de Compras',
			},
			component: () => import('@/pages/reports/page-purchases-report'),
		},
		{
			name: 'report-box',
			path: 'box-report',
			meta: {
				title: 'Reporte de Cajas',
			},
			component: () => import('@/pages/reports/page-box-cash'),
		},
		{
			name: 'reporte-clients',
			path: 'clients-report',
			meta: {
				title: 'Reporte de Clientes',
			},
			component: () => import('@/pages/reports/page-report-client'),
		},
		{
			name: 'report-vendors',
			path: 'vendors-report',
			meta: {
				title: 'Reporte de Proveedores',
			},
			component: () => import('@/pages/reports/page-vendors-report'),
		},
		{
			name: 'detail-sales',
			path: 'detail-sales',
			meta: {
				title: 'Detalle de Cobertura',
				navigation: true,
				navigationText: 'Volver a Reporte de Ventas',
				navigationRoute: '/reports/sales-report',
			},
			component: () => import('@/pages/reports/page-sales-report-detail'),
			props: true,
		},
	],
};

export default route;
