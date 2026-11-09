const route = {
	name: 'new-warranty',
	path: '/new-warranty/:id?',
	meta: {
		title: 'Nueva Garantia',
	},
	component: () => import('@/pages/warranty/page-new-warranty'),
	props: true,
};

export default route;
