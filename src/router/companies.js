const route = {
	name: 'companies',
	path: 'company',
	meta: {
		title: 'CONFIGURACIÓN DE EMPRESA',
	},
	component: () => import('@/components/companies/companies'),
	props: true,
};

export default route;
