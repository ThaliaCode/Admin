const route = {
	name: 'cost-centers',
	path: '/cost-centers',
	meta: {
		title: 'Centros de Costos',
	},
	component: () => import('@/pages/cost-centers/page-cost-centers'),
};

export default route;
