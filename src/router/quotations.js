const route = {
	name: 'quotations',
	path: '/quotations',
	meta: {
		title: 'Cotización',
	},
	component: () => import('@/components/sales/quotations'),
};

export default route;
