const route = {
	name: 'attendance-control',
    path: 'attendance-control',
	meta: {
		title: 'Control de asistencia',
    },
    component: () => import('@/components/users/page-attendance-control'),
};

export default route;
