const route = {
	name: 'cms',
	path: '/cms',
	meta: {
		title: 'CMS',
	},
	redirect: '/cms/categories',
	component: () => import('@/components/cms/cms'),
	children: [
		{
			path: 'categories',
			meta: {
				title: 'Categorias',
			},
			component: () => import('@/components/cms/cms-categories'),
		},
		{
			name: 'cms-category-detail',
			path: 'categories/:id/:code',
			meta: {
				title: 'Detalle categoria',
			},
			component: () => import('@/components/cms/cms-category-detail'),
		},
		{
			name: 'cms-categories',
			path: 'categories/all',
			meta: {
				title: 'Detalle categoria',
			},
			component: () => import('@/components/cms/cms-category-detail'),
		},
		{
			path: 'product',
			meta: {
				title: 'Crear producto',
			},
			component: () => import('@/components/cms/cms-product'),
		},
		{
			path: 'product/edit/:id',
			meta: {
				title: 'Editar productos',
			},
			component: () => import('@/components/cms/cms-product'),
		},
		{
			path: 'units',
			meta: {
				title: 'Lista de unidades',
			},
			component: () => import('@/components/cms/cms-units'),
		},
		{
			path: 'brands',
			meta: {
				title: 'Lista de marcas',
			},
			component: () => import('@/components/cms/cms-brands'),
		},
	],
};

export default route;
