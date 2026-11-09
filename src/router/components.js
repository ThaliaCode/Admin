const route = {
	name: 'components',
	path: 'components',
	meta: {
		title: 'Componentes',
	},
	component: () => import('@/pages/page-components'),
};

export default route;
