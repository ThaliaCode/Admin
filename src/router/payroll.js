const route = {
	name: 'payroll',
	path: 'payroll',
	redirect: '',
	component: () => import('@/pages/payroll/page-payroll'),
	children: [
		{
			name: 'working-relationship',
			path: ':id?/:code?/working-relationship',
			meta: {
				title: 'Relacion de Trabajo',
			},
			component: () => import('@/pages/payroll/page-working-relationship'),
			props: true,
		},
		{
			name: 'call-attention',
			path: ':id?/call-attention',
			meta: {
				title: 'Llamadas Atención',
			},
			component: () => import('@/pages/payroll/page-call-attention'),
			props: true,
		},
		{
			name: 'type-of-employer',
			path: ':id?type-of-employer',
			meta: {
				title: 'Tipos de Empleador',
			},
			component: () => import('@/pages/payroll/page-type-of-employer'),
			props: true,
		},
		{
			name: 'cargo-type',
			path: ':id?/type-position',
			meta: {
				title: 'Tipo de Personal / Tipos de Cargo',
			},
			component: () => import('@/pages/payroll/page-type-position'),
			props: true,
		},
		{
			name: 'type-of-personnel',
			path: 'type-person',
			meta: {
				title: 'Tipos de Personal',
			},
			component: () => import('@/pages/payroll/page-type-person'),
			props: true,
		},
		{
			name: 'relatives',
			path: ':id?/family-employee',
			meta: {
				title: 'Control de Empleado Familia',
			},
			component: () => import('@/pages/payroll/page-family-employee'),
			props: true,
		},
		{
			name: 'remuneration',
			path: 'remuneration',
			meta: {
				title: 'Tipo de Remuneración',
			},
			component: () => import('@/pages/payroll/page-to-remuneration'),
			props: true,
		},
		{
			name: 'employee-control',
			path: 'employee-control',
			meta: {
				title: 'Control de Empleados',
			},
			component: () => import('@/pages/payroll/page-employee-control'),
			props: true,
		},
		{
			name: 'control-date-employee',
			path: ':id/control-date-employee',
			meta: {
				title: 'CONTROL DE FECHAS',
			},
			component: () => import('@/pages/payroll/page-control-date'),
			props: true,
		},
		{
			name: 'additional-data-employee',
			path: ':id?/additional-data',
			meta: {
				title: 'Datos Adicionales',
			},
			component: () => import('@/pages/payroll/page-employee-additional'),
			props: true,
		},
		{
			name: 'employee-create',
			path: ':id?/employee-create',
			meta: {
				title: 'Crear Empleado',
			},
			component: () => import('@/pages/payroll/page-employee-create'),
			props: true,
		},
		{
			name: 'appreciation',
			path: ':id/appreciation',
			meta: {
				title: 'RECONOCIMIENTO',
			},
			component: () => import('@/pages/payroll/page-appreciation'),
			props: true,
		},
		{
			name: 'type-of-employee',
			path: 'type-employee',
			meta: {
				title: 'Tipo de Empleado',
			},
			component: () => import('@/pages/payroll/page-type-employee'),
		},
		{
			name: 'areas',
			path: 'areas',
			meta: {
				title: 'Áreas',
			},
			component: () => import('@/pages/payroll/page-area'),
			props: true,
		},
		{
			name: 'costs-control',
			path: 'costs-control',
			meta: {
				title: 'Centro de Costos',
			},
			component: () => import('@/pages/payroll/page-costs-control'),
		},
		{
			name: 'concept',
			path: 'concept',
			meta: {
				title: 'Rubros',
			},
			component: () => import('@/pages/payroll/page-concept'),
		},
		{
			name: 'new-concept',
			path: ':id?/new-concept',
			meta: {
				title: 'Nuevo Rubro',
			},
			component: () => import('@/pages/payroll/page-new-concept'),
			props: true,
		},
		{
			name: 'role-of-payments',
			path: 'role-of-payments',
			meta: {
				title: 'Rol de Pagos',
			},
			component: () => import('@/pages/payroll/page-role-of-payments'),
			props: true,
		},
		{
			name: 'role-of-payments-details',
			path: ':id?/role-of-payments-details',
			meta: {
				title: 'Detalle de Rol de Pagos',
			},
			component: () => import('@/pages/payroll/page-role-of-payments-details'),
			props: true,
		},
	],
};

export default route;
