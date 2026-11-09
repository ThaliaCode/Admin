const route = {
	name: 'new-quotation',
	path: '/new-quotation',
	meta: {
		title: 'Cotización',
	},
	component: () => import('@/components/quotation/new-quotation'),
};

export default route;
