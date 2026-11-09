const route = {
	name: 'device',
	path: 'device',
	meta: {
		title: 'Dispositivos',
	},
	component: () => import('@/pages/device/page-device'),
};

export default route;
