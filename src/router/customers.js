const route = {
	name: '',
	path: 'customers',
	meta: {
		title: 'Clientes',
	},
	component: () => import('@/components/customers/page-customer'),
	children: [
		{
			name: 'customers',
			path: '',
			meta: {
				title: 'Listado de direcciones',
			},
			component: () => import('@/components/customers/customers'),
		},
		{
			name: 'customer-direction',
			path: 'direction',
			meta: {
				title: 'Listado de direcciones',
			},
			component: () => import('@/components/customers/customers-direction'),
		},
	],
};

export default route;
