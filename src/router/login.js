const route = {
	path: '/login',
	name: 'login',
	meta: {
		title: process.env.ADMIN_CODE === 'japisale' ? 'JapiSale' : 'CasaMarket',
	},
	components: {
		login: () => import('@/components/login'),
	},
};

export default route;
