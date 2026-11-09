const route = {
	name: 'new-expenses',
	path: '/expenses/new',
	meta: {
		title: 'Nuevo Gasto',
	},
	component: () => import('@/components/expenses/new-expenses'),
	props: true,
	children: [
		{
			name: 'edit-expense',
			path: ':id/edit',
			meta: {
				title: 'Edición de Gasto',
			},
			component: () => import('@/components/expenses/new-expenses'),
			props: true,
		},
	],
};

export default route;
