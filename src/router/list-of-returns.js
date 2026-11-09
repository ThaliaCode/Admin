const route = {
	name: 'list-of-returns',
	path: '/returns',
	meta: {
		title: 'DEVOLUCIONES',
	},
	component: () => import('@/pages/transfers/page-returns'),
};

export default route;
