const route = {
	name: 'purchases-perception',
	path: '/purchases-perception',
    meta: {
		title: 'Compras con Percepción',
	},
	component: () => import('@/pages/purchases/pages-purchases-perception'),
};

export default route;
