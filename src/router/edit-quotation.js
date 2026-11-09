const route = {
	name: 'edit-quotation',
	path: '/quotation/:id',
	meta: {
		title: 'Editar cotización',
		navigation: true,
		navigationText: 'Volver a Lista de Cotizaciones',
		navigationRoute: '/sales/quotation/list',
	},
	component: () => import('@/components/quotation/new-quotation'),
};

export default route;
