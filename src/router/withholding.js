const route = {
	name: 'withholding-list',
	path: '/withholding',
	meta: {
		title: 'Retenciones',
	},
	component: () => import('@/pages/withholding/pages-withholding-list'),
};

export default route;
