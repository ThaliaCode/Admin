import axios from 'axios';
import helper from './shared/helper';

const version = '1.10.1';

/**
 * Crea una instancia de Axios:
 * 1. Busca primero en localStorage usando helper.getEndPointDynamic(key)
 * 2. Luego en process.env[key]
 * 3. Si no encuentra nada, baseURL será undefined
 *
 * @param {string|null} key - Clave compartida para localStorage y .env
 * @param {object} config - Configuración adicional para axios
 * @returns {AxiosInstance}
 */
function createAxiosInstance(key, onlyEnv = false, config = {}) {
	let dynamicUrl = helper.getEndPointDynamic(key);
	const envUrl = process.env[key];
	if (key === 'API_SEARCH' && dynamicUrl) {
		dynamicUrl = `${dynamicUrl}/api`;
	}

	const baseURL = onlyEnv ? envUrl : dynamicUrl || envUrl || undefined;

	return axios.create({
		baseURL,
		...config,
	});
}

// Instancias
export const productsInstance = createAxiosInstance('PRODUCTS_URL');
const settlementInstance = createAxiosInstance('SETTLEMENT_URL');
const middlewareInstance = createAxiosInstance('MIDDLEWARE_URL');
const productionInstance = createAxiosInstance('PRODUCTION_URL');
const cmsInstance = createAxiosInstance('CMS_URL') || productsInstance;
const productsReadInstance = createAxiosInstance('PRODUCTS_READ_URL');
const notificationsInstance = createAxiosInstance('NOTIFICATIONS_URL');
const salesReadInstance = createAxiosInstance('SALES_READ_URL');
const sunatInstance = createAxiosInstance('API_SEARCH');
const facturacionInstance = createAxiosInstance('FACTURACION_SUNAT_URL');
const motorInstance = createAxiosInstance('API_QUIPU');
const excelInstance = createAxiosInstance('PRODUCT_EXCEL_API');
const reportsInstance = createAxiosInstance('API_REPORTS');
const reportSales = createAxiosInstance('SALES_REPORT');
const reportProducts = createAxiosInstance('PRODUCTS_REPORT');
const japiExcelReport = createAxiosInstance('JAPI_EXCEL_URL');

const aclInstance = createAxiosInstance('ACL_URL', true);

export const salesInstance = createAxiosInstance('SALES_URL', false, {
	headers: {
		Accept: `application/vnd.appv${version}+json`,
	},
});

const accountInstance = axios.create({
	baseURL: 'https://jsonplaceholder.typicode.com',
});

export default function (Vue) {
	/* eslint-disable no-param-reassign */
	// Vue.prototype.$http = productsInstance;
	Vue.prototype.$httpProductsRead = productsReadInstance;
	Vue.prototype.$httpAcl = aclInstance;
	Vue.prototype.$httpMiddleware = middlewareInstance;
	Vue.prototype.$httpProduction = productionInstance;
	Vue.prototype.$httpSales = salesInstance;
	Vue.prototype.$httpSalesRead = salesReadInstance;
	Vue.prototype.$httpSunat = sunatInstance;
	Vue.prototype.$httpSettlement = settlementInstance;
	Vue.prototype.$httpFacSunat = facturacionInstance;
	Vue.prototype.$httpProducts = productsInstance;
	Vue.prototype.$httpQuipu = motorInstance;
	Vue.prototype.$httpAccount = accountInstance;
	Vue.prototype.$httpReports = reportsInstance;
	Vue.prototype.$httpNotifications = notificationsInstance;
	Vue.prototype.$httpReportSales = reportSales;
	Vue.prototype.$httpProductsSales = reportProducts;
	Vue.prototype.$httpExcel = excelInstance;
	Vue.prototype.$httpCMS = cmsInstance;
	Vue.prototype.$httpJapiExcel = japiExcelReport;
}
