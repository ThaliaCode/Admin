const route = {
	name: 'edit-account-bank',
	path: 'edit-account-bank/:id',
	meta: {
		title: 'Editando cuenta bancaria',
	},
	props: true,
	component: () => import('@/components/bank-account/new-account-bank'),
};

export default route;
