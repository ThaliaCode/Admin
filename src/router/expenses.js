const route = {
	name: 'expenses',
	path: '/expenses',
	meta: {
		title: 'GASTOS',
	},
	component: () => import('@/components/expenses/expenses'),
};

export default route;
