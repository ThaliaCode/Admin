const route = {
	name: 'page-generate-documents',
	path: '/generate-documents',
	meta: {
		title: 'GENERAR DOCUMENTO DE VENTA MASIVO',
	},
	component: () => import('@/pages/orders/page-generate-documents'),
};

export default route;
