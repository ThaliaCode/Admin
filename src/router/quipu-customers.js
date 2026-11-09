const route = {
	name: 'quipu-customers',
	path: 'quipu/customers',
	meta: {
		title: 'Clientes',
	},
	component: () => import('@/components/quipu/customers/customers'),
};

export default route;
