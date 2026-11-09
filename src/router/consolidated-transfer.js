const route = {
	name: 'pages-consolidated-transfer',
	path: '/consolidated-transfers/:idConsolidated',
	meta: {
		title: 'CONSOLIDADO DE TRANSFERENCIAS',
	},
	props: true,
	component: () => import('@/pages/transfers/page-consolidated-transfer'),
};

export default route;
