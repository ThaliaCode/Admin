const route = {
	name: 'prices-per-utility',
	path: 'prices-per-utility',
	meta: {
		title: 'Precio por unidad',
	},
	component: () => import('@/pages/products/page-prices-per-utility'),
};

export default route;
