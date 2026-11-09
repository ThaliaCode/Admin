const route = {
	name: 'brands',
	path: 'brands',
	meta: {
		title: 'Marcas',
	},
	component: () => import('@/components/products/brands'),
};

export default route;
