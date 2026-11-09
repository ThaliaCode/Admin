const route = {
	name: 'project',
	path: '/project',
	redirect: '/project/list',
	component: () => import('@/components/project/project'),
	children: [
		{
			name: 'request-list',
			path: 'request-list',
			meta: {
				title: 'REQUERIMIENTOS',
			},
			component: () => import('@/components/project/components/request-list'),
		},
		{
			name: 'requirement-new',
			path: 'requirement/new',
			meta: {
				title: 'REQUERIMIENTO NUEVO',
			},
			component: () => import('@/components/project/components/requirement-new'),
		},
		{
			name: 'edit-requirement',
			path: 'requirement/:id',
			meta: {
				title: 'EDITAR REQUERIMIENTO',
			},
			component: () => import('@/components/project/components/requirement-new'),
		},
		{
			name: 'list-of-projects',
			path: 'list',
			meta: {
				title: 'Proyectos - Operaciones',
			},
			component: () => import('@/components/project/components/list-of-projects'),
		},
		{
			name: 'list-of-projects-op',
			path: 'list/op',
			meta: {
				title: 'Proyectos - Operaciones',
			},
			component: () => import('@/components/project/components/list-of-projects'),
		},
		{
			name: 'list-of-quotations',
			path: 'quotations',
			meta: {
				title: 'Proyectos - Cotizaciones',
			},
			component: () => import('@/components/project/components/list-of-quotations'),
		},
		{
			name: 'calendar-by-project',
			path: 'calendar/:projectId',
			meta: {
				title: 'Proyectos - Operaciones',
			},
			props: true,
			component: () => import('@/components/project/components/calendar-by-project'),
		},
		{
			name: 'employees',
			path: 'employees',
			meta: {
				title: 'Listado de Técnicos',
			},
			component: () => import('@/components/project/components/employees'),
		},
		{
			name: 'project-movements',
			path: 'project/:id-:autoCode/movements/:saleId',
			meta: {
				title: 'Movimientos de Productos',
			},
			props: true,
			component: () => import('@/components/project/components/project-movements'),
		},
		{
			name: 'project-transfer',
			path: 'project/:id-:autoCode/transfer/new/:type/:saleId',
			meta: {
				title: 'Ingreso/Salida de Productos',
			},
			props: true,
			component: () => import('@/components/project/components/project-transfer'),
		},
		{
			name: 'requirement-types',
			path: 'requirement-types',
			meta: {
				title: 'Tipos de Requerimiento',
			},
			component: () => import('@/components/project/components/requirement-type'),
		},
		{
			name: 'oit-edit',
			path: ':id/edit',
			props: true,
			meta: {
				title: 'Editar OIT',
			},
			component: () => import('@/components/project/components/oit-edit'),
		},
	],
};

export default route;
