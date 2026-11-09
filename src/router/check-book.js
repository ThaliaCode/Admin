const route = {
	name: 'page-check-book',
	path: 'bank-accounts/check-book',
	redirect: '/bank-accounts/:bankAccountId/check-book',
	component: () => import('@/pages/check-book/page-check-book'),
	children: [
		{
			name: 'check-book',
			path: '/bank-accounts/:bankAccountId/check-book',
			meta: {
				title: 'BANCO / CUENTAS BANCARIAS / CHEQUERAS',
			},
			component: () => import('@/components/bank-account/check-book'),
			props: true,
		},
		{
			name: 'check',
			path: '/bank-accounts/:bankAccountId/check-book/:checkBookId/check',
			meta: {
				title: 'BANCO / CUENTAS BANCARIAS / CHEQUERAS / CHEQUES',
			},
			component: () => import('@/components/bank-account/check'),
			props: true,
		},
	],
};

export default route;
