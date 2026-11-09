const route = {
	name: 'categories',
	path: 'categories',
	meta: {
		title: 'Categorías',
	},
	component: () => import('@/components/products/categories'),
};

export default route;
