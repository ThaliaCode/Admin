import Router from 'vue-router';
import login from './login';
import amortizations from './amortizations';
import brands from './brands';
import categories from './categories';
import checkBook from './check-book';
import commissions from './commissions';
import companies from './companies';
import customers from './customers';
import dashboardSubsidiaries from './dashboard-subsidiaries';
import dispatch from './dispatch';
import features from './features';
import guides from './guides';
import inventories from './inventories';
import newExpense from './new-expenses';
import listOfPrices from './list-of-prices';
import listOfTransfers from './list-of-transfers';
import newClient from './new-client';
import newQuotation from './new-quotation';
import newSale from './new-sale';
import products from './products';
import productEdit from './edit-product';
import productNew from './new-product';
import project from './project';
import oip from './oip';
import quotations from './quotations';
import referenceGuides from './reference-guides';
import referenceGuidesCarrier from './reference-guides-carrier';
import sales from './sales';
import settings from './settings';
import terminals from './terminals';
import typeExpenses from './type-expenses';
import units from './units';
import users from './users';
import warehousesTransfer from './warehouses-transfer';
import warehouses from './warehouses';
import work from './work';
import subsidiaries from './subsidiaries';
import cms from './cms';
import editQuotation from './edit-quotation';
import expenses from './expenses';
import reports from './reports';
import bankAccounts from './bank-account';
import newBankAccount from './new-accounts-bank';
import editBankAccount from './edit-accounts-bank';
import accounting from './accounting';
import cashClosing from './cash-closing';
import countableAuxiliary from './countable-auxiliary';
import quipuCustomers from './quipu-customers';
import testPage from './test-page';
import cashDeskClosing from './cash-desk-closing';
import purchases from './purchases';
import purchasesNew from './purchases-new';
import purchasesDetails from './purchases-details';
import groups from './groups';
import suppliers from './suppliers';
import suppliersListProduct from './suppliers-list-product';
import debtsToPay from './debts-to-pay';
import purchasesEdit from './purchases-edit';
import movements from './movements';
import bankReconciliations from './bank-reconciliations';
import bankReconciliationsHistory from './bank-reconciliations-history';
import documents from './documents';
import transfersDetails from './transfers-details';
import withholding from './withholding';
import customersNew from './customers-new';
import couriers from './couriers';
import customersEdit from './customers-edit';
import payroll from './payroll';
import ecommerce from './ecommerce';
import costCenter from './cost-center';
import controlSeries from './control-series';
import dailySummary from './daily-summary';
import dailySummaryCreate from './daily-summary-create';
import newTransferDetail from './new-transfers-detail';
import transfersStart from './transfers-start';
import rating from './rating';
import questionsAndAnswers from './questions-and-answers';
import listOfReturns from './list-of-returns';
import detailReturns from './returns-details';
import trackingTransfer from './transfers-tracking';
import fieldSale from './field-sale';
import components from './components';
import accountsReceivable from './accounts-receivable';
import accountsToPay from './accounts-to-pay';
import zones from './zones';
import zonesNew from './zones-new';
import newCompositeProduct from './new-composite-product';
import dashboardWarehouses from './dashboard-warehouses';
import dashboardSalePoints from './dashboard-sale-points';
import dailySummaryDetail from './daily-summary-detail';
import device from './device';
import sri from './sri';
import routes from './routes';
import newRoute from './new-route';
import cancelSummary from './cancel-summary';
import vendors from './vendors';
import newVendor from './new-vendor';
import cash from './cash';
import cancelSummaryDetail from './cancel-summary-detail';
import newMasterProduct from './new-master-product';
import editMasterProduct from './edit-master-product';
import masterProducts from './master-product';
import ecommerceEdit from './ecommerce-edit';
import customerAddress from './customer-address';
import editRoute from './edit-route';
import orders from './orders';
import vehicles from './vehicles';
import integration from './integration';
import notifications from './notifications';
import dashboardMibodega from './dashboard-report';
import dashboardGeneral from './dashboard';
import distributor from './distributor';
import attributes from './attributes';
import newDistributor from './new-distributor';
import accountantConfiguration from './accountant-configuration';
import detailIncome from './detail-income';
import detailExpenses from './detail-expenses';
import accountsPlan from './accounts-plan';
import distributorsTracking from './distributors-tracking';
import distributorsSellers from './distributors-sellers';
import plan from './plan';
import loyalty from './loyalty';
import listBankAccounts from './list-bank-account';
import pagePurchaseDetail from './purchase-detail';
import reportExternal from './report-external';
import reportInternal from './report-internal';
import cashClosingInternal from './cash-closing-inter';
import pointSaleTerminal from './point-sale-terminal';
import detailTerminal from './detail-terminal';
import pricesPerUtility from './prices-per-utility';
import createAgency from './create-agency';
import agencyTransport from './agency-transport';
import historyLiquidations from './history-liquidations';
import detailLiquidations from './detail-liquidations';
import liquidationDrivers from './liquidations-drivers';
import massiveTecking from './massive-tecking';
import generateDocuments from './generate-documents';
import resumenDocuments from './resumen-documents';
import productosExpired from './products-expired';
import promotions from './promotions';
import conditions from './condition';
import actions from './actions';
import newWarranty from './new-warranty';
import kardexFix from './kardex-fix';
import lotControl from './lot-control';
import dispatchHistory from './dispatch-history';
import detailOrder from './detail-order';
import consolidatedTransfer from './consolidated-transfer';
import listConsolidated from './list-of-consolidated';
import liquidation from './liquidation';
import purchasesPerception from './purchases-perception';
import productsBySeller from './products-by-seller';
import origens from './origens';
import allZones from './all-zones';
import attendanceControl from './attendance-control';
import documentsSuppliers from './documents-suppliers';
import bulkProductUpload from './bulk-product-upload';

export default function (Vue) {
	Vue.use(Router);
	const config = new Router({
		mode: 'history',
		routes: [
			{
				path: '/',
				name: 'admin-container',
				redirect: '/products',
				children: [
					accounting,
					agencyTransport,
					actions,
					amortizations,
					bankAccounts,
					brands,
					cashDeskClosing,
					categories,
					cashClosingInternal,
					checkBook,
					createAgency,
					commissions,
					companies,
					components,
					customers,
					conditions,
					dashboardSubsidiaries,
					dashboardWarehouses,
					detailLiquidations,
					detailOrder,
					detailTerminal,
					dispatch,
					dispatchHistory,
					documents,
					editBankAccount,
					editMasterProduct,
					editQuotation,
					expenses,
					features,
					kardexFix,
					generateDocuments,
					guides,
					historyLiquidations,
					inventories,
					listConsolidated,
					listOfPrices,
					listOfTransfers,
					liquidationDrivers,
					lotControl,
					massiveTecking,
					newBankAccount,
					newClient,
					newDistributor,
					newExpense,
					newMasterProduct,
					newQuotation,
					newTransferDetail,
					newSale,
					pointSaleTerminal,
					products,
					productEdit,
					productosExpired,
					productNew,
					project,
					oip,
					quotations,
					referenceGuides,
					referenceGuidesCarrier,
					reports,
					resumenDocuments,
					sales,
					settings,
					subsidiaries,
					cms,
					terminals,
					typeExpenses,
					units,
					users,
					newWarranty,
					warehousesTransfer,
					warehouses,
					withholding,
					work,
					cashClosing,
					countableAuxiliary,
					quipuCustomers,
					testPage,
					purchases,
					purchasesNew,
					purchasesDetails,
					transfersStart,
					groups,
					suppliers,
					suppliersListProduct,
					debtsToPay,
					purchasesEdit,
					movements,
					bankReconciliations,
					bankReconciliationsHistory,
					transfersDetails,
					customersNew,
					couriers,
					customersEdit,
					payroll,
					ecommerce,
					costCenter,
					controlSeries,
					dailySummary,
					dailySummaryCreate,
					rating,
					questionsAndAnswers,
					listOfReturns,
					detailReturns,
					trackingTransfer,
					fieldSale,
					accountsReceivable,
					accountsToPay,
					zones,
					zonesNew,
					newCompositeProduct,
					dashboardSalePoints,
					dailySummaryDetail,
					device,
					sri,
					routes,
					newRoute,
					cancelSummary,
					vendors,
					newVendor,
					cash,
					cancelSummaryDetail,
					masterProducts,
					ecommerceEdit,
					customerAddress,
					editRoute,
					orders,
					vehicles,
					notifications,
					integration,
					dashboardMibodega,
					dashboardGeneral,
					distributor,
					attributes,
					accountantConfiguration,
					detailIncome,
					detailExpenses,
					accountsPlan,
					distributorsSellers,
					distributorsTracking,
					plan,
					loyalty,
					listBankAccounts,
					pagePurchaseDetail,
					reportExternal,
					reportInternal,
					pricesPerUtility,
					promotions,
					consolidatedTransfer,
					liquidation,
					purchasesPerception,
					productsBySeller,
					origens,
					allZones,
					attendanceControl,
					documentsSuppliers,
					bulkProductUpload,
				],
				components: {
					default: () => import('@/components/admin-container'),
				},
			},
			login,
			{
				path: '/maintenance',
				name: 'maintenance',
				components: {
					default: () => import('@/pages/page-maintenance'),
				},
				meta: {
					title: 'Mantenimiento',
				},
			},
			{
				path: '/blocked-company',
				name: 'blocked-company',
				components: {
					default: () => import('@/pages/page-blocked-company'),
				},
				meta: {
					title: 'Falta de pago',
				},
			},
		],
	});
	config.beforeEach((to, from, next) => {
		if (to.meta) {
			const sidebar = JSON.parse(
				window.localStorage.getItem(`${process.env.STORAGE_USER_KEY}::sidebar`)
			);
			if (sidebar) {
				let currentRoute;
				sidebar.forEach((item) => {
					if (!currentRoute) {
						currentRoute = item.resource.data.find((r) => r.uri === to.name);
					}
				});
				const title = currentRoute ? currentRoute.title : to.meta.title;
				window.document.title = title;
				/* eslint-disable no-param-reassign */
				to.meta.title = title;
				to.meta.previous = from.name;
			}
		}
		if (to.name !== 'login') {
			const token = window.localStorage.getItem(`${process.env.STORAGE_USER_KEY}::token`);
			if (token) {
				return next();
			}
			if (to.name === 'maintenance' || to.name === 'blocked-company') {
				return next();
			}
			return next({ name: 'login' });
		}
		return next();
	});
	return config;
}
