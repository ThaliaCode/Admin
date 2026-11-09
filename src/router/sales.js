const route = {
	name: 'sales',
	path: '/sales',
	redirect: '/sales/list',
	component: () => import('@/components/sales/sales'),
	children: [
		{
			name: 'list-of-sales',
			path: 'list',
			meta: {
				title: 'LISTA DE VENTAS',
			},
			component: () => import('@/components/sales/list-of-sales'),
		},
		{
			name: 'quotations-list',
			path: 'quotation/list',
			meta: {
				title: 'LISTA DE COTIZACIONES',
			},
			component: () => import('@/components/sales/list-of-quotation'),
		},
		{
			name: 'sale-detail',
			path: ':saleId/detail',
			props: true,
			meta: {
				title: 'DETALLE DE VENTA',
			},
			component: () => import('@/components/sales/sale-detail'),
		},
		{
			name: 'sales-closed',
			path: 'closed',
			meta: {
				title: 'CIERRE DE CAJAS',
			},
			component: () => import('@/components/sales/sales-closed'),
		},
		{
			name: 'sales-closed-detail',
			path: 'closed-detail',
			meta: {
				title: 'DETALLE DE CAJA',
			},
			props: true,
			component: () => import('@/components/sales/sales-closed-detail'),
		},
		{
			name: 'convert',
			path: 'convert/:id',
			meta: {
				title: 'DETALLE DE VENTA',
			},
			props: true,
			component: () => import('@/components/sales/convert-sale'),
		},
		{
			name: 'sales-cash-closing',
			path: 'cash-closing',
			props: true,
			component: () => import('@/components/sales/sales-cash-closing'),
		},
		{
			name: 'commissions-for-sale',
			path: 'commissions',
			props: true,
			component: () => import('@/pages/sales/page-commissions'),
		},
	],
};

export default route;
