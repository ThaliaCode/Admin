import Vue from 'vue';
import Vuelidate from 'vuelidate';
import VueGtag from 'vue-gtag';
import Analytics from '@/plugins/analytics';
import format from 'date-fns/format';
import VueTheMask from 'vue-the-mask';
import VueShortKey from 'vue-shortkey';
import VueGoogleCharts from 'vue-google-charts';
import Donut from 'vue-css-donut-chart';
import VueTimepicker from 'vue2-timepicker';
import VueHotkey from 'v-hotkey';
import 'normalize.css';
import 'vue-css-donut-chart/dist/vcdonut.css';
import 'vue2-timepicker/dist/VueTimepicker.css';
import App from './App';
import registerVuetify from './vuetify';
import {
	httpRequestInterceptor,
	httpResponseInterceptor,
	httpResponseSuccessInterceptor,
} from './http';
import registerAxios from './axios';
import registerGoogleMap from './google-map';
import vueRouter from './router';
import globalMixin from './mixins/global';
import registerFilters from './filters/global';
import './directives/global';
import helper from './shared/helper';

import './config';

Vue.use(VueTimepicker);
Vue.use(Donut);
Vue.use(VueHotkey);
Vue.use(VueShortKey);
Vue.use(VueTheMask);
Vue.use(Vuelidate);
Vue.use(VueGoogleCharts);

const router = vueRouter(Vue);

Vue.use(
	VueGtag,
	{
		config: {
			id: process.env.ID_ANALYTICS || '',
			params: {
				send_page_view: false, // <-- evita el page_view automático
			},
		},
		debug: true, // Activar modo de depuración
		appName: 'CASAMARKET',
		pageTrackerScreenviewEnabled: false,
	},
	router
);

Vue.use(Analytics);

router.beforeEach((to, from, next) => {
	const user = helper.getLocalData('admin-user');

	// Enviar evento solo si hay user válido
	if (user && typeof user === 'object') {
		const { id, companyId, company = {} } = user;
		const { aclId = 'NO_ACL_ID', aclCode = 'NO_ACL_CODE' } = company || {
			aclId: 'NO_COMPANY',
			aclCode: 'NO_COMPANY',
		};

		if (Vue.$gtag) {
			Vue.$gtag.event('page_view', {
				page_path: to.path,
				page_title: (to.meta && to.meta.title) || '',
				userId: id || null,
				companyId: companyId || null,
				aclCode: aclCode || null,
				aclId: aclId || null,
			});

			Vue.$gtag.set({ user_id: id || null });
		}
	}

	next(); // siempre permitir la navegación
});

// Vue.use(VueAuthenticate, {
// 	baseUrl: process.env.ACL_URL,
// 	providers: {
// 		facebook: {
// 			clientId: process.env.FACEBOOK_API_KEY,
// 			redirectUri: 'http://localhost:9001',
// 		},
// 	},
// });

const userInfo = helper.getLocalData('admin-user');
registerFilters(Vue);
registerVuetify(Vue);
registerAxios(Vue);
registerGoogleMap(Vue);
Vue.prototype.$today = () => format(new Date(), 'YYYY-MM-DD');
Vue.prototype.$bus = new Vue();
// Vue.prototype.$imageUrl = process.env.S3_IMAGES_URL; PARECE QUE NO SIRVE
Vue.prototype.$imageUrl = '';
Vue.prototype.$isJapiSale = process.env.ADMIN_CODE === 'japisale';
Vue.prototype.$userInfo = userInfo;
Vue.prototype.$levelProgress = helper.getLocalData('level-progress');
//Vue.config.devtools = true;
Vue.config.productionTip = false;

Vue.config.errorHandler = (err, vm, info) => {
	const componentName = vm.$options.name || (vm.$vnode && vm.$vnode.tag) || 'Unidentified Component';
	console.error(`[VUE ERROR CHECK] In component <${componentName}>:`, err);
	console.error(`Error details: ${info}`);
};

Vue.mixin(globalMixin);

async function created() {
	this.$bus.$on('USER_INFO', (user) => {
		Vue.prototype.$isJapiSale = process.env.ADMIN_CODE === 'japisale';
		Vue.prototype.$userInfo = user;
	});
	this.$bus.$on('LEVEL_PROGRESS', (levelProgress) => {
		Vue.prototype.$levelProgress = levelProgress;
	});
	this.$bus.$on('DOMAINS', (domains) => {
		Vue.prototype.$domainsUser = domains;
	});
	this.$httpProductsRead.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpProduction.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpSales.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpSalesRead.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpProductsRead.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpAcl.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpAcl.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpJapiExcel.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpJapiExcel.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpMiddleware.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpSales.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpSalesRead.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpProduction.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpProducts.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpProducts.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpSettlement.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpSettlement.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpQuipu.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpQuipu.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpAccount.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpAccount.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpReports.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpReports.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpFacSunat.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpFacSunat.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpNotifications.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpNotifications.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpReportSales.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpReportSales.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpProductsSales.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpProductsSales.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	this.$httpCMS.interceptors.request.use(this.httpRequestInterceptor);
	this.$httpCMS.interceptors.response.use(
		this.httpResponseSuccessInterceptor,
		this.httpResponseInterceptor
	);
	const token = helper.getLocalToken();
	if (!token) return;

	let exchangeRates = helper.getLocalData('ms-exchange-rates');
	const lastUpdated = helper.getLocalData('ms-exchange-rates-last-updated');
	const today = new Date().toISOString().split('T')[0];

	if (!exchangeRates || lastUpdated !== today) {
		const response = await this.$httpSales.get('ms-exchange-rates');
		exchangeRates = response.data;
		helper.setLocalData('ms-exchange-rates', exchangeRates);
		helper.setLocalData('ms-exchange-rates-last-updated', today);
	}

	let userData = helper.getLocalAdminUser();
	if (!userData) {
		const responseJapi = await this.$httpSales.get('employees/current');
		userData = responseJapi.data;
	}
	// Admin User
	this.$bus.$emit('USER_INFO', userData);
	helper.setLocalData('admin-user', userData);
	helper.setLocalData('acl-id', userData.aclUserId);
	helper.setLocalData('acl-code', userData.aclUserCode);

	const localLevelProgress = helper.getLocalData('level-progress');
	if (localLevelProgress) {
		this.$bus.$emit('LEVEL_PROGRESS', localLevelProgress);
	} else if (userData && userData.companyId) {
		try {
			const { data: levelProgress } = await this.$httpAcl.get(
				`level-progress/${userData.company.aclId}`,
				{
					headers: {
						Accept: 'application/vnd.apiacl.v2+json',
					},
				}
			);
			helper.setLocalData('level-progress', levelProgress);
			this.$bus.$emit('LEVEL_PROGRESS', levelProgress);
		} catch (error) {
			console.error('Error loading level progress:', error);
		}
	}
}

/* eslint-disable no-new */
new Vue({
	created,
	el: '#app',
	methods: {
		httpRequestInterceptor,
		httpResponseInterceptor,
		httpResponseSuccessInterceptor,
	},
	router,
	render: (h) => h(App),
});
