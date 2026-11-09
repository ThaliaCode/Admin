const route = {
	name: 'accounts-plan',
	path: 'accounts-plan/:subsidiaryId?',
	meta: {
		title: 'PLAN DE CUENTAS',
	},
	component: () => import('@/pages/accountant/page-accounts-plan'),
	props: true,
};

export default route;
