const route = {
	name: 'users',
	path: 'users',
	redirect: '/users/list',
	component: () => import('@/components/users/users'),
	children: [
		{
			name: 'users-list',
			path: 'list',
			meta: {
				title: 'Usuarios',
			},
			component: () => import('@/components/users/users-list'),
		},
	],
};

export default route;
