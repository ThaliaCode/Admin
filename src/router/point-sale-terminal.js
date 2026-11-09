const route = {
	name: 'terminal-point-sale',
	path: 'terminal-point-sale',
	meta: {
		title: 'Terminal de Punto de Venta (TPV)',
	},
	component: () => import('@/pages/point-of-sales/page-terminal-point-sale'),
};

export default route;
