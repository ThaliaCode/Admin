import { format } from 'date-fns';
import { TOGGLE_SNACKBAR } from './../events';
import helper from '../shared/helper';
import flagType from '../shared/flag-type';
import typeRol from '../shared/type-rol';
import jsonCountries from '../i18n/constants/format-country.json';

function data() {
	return {
		banks: [],
		languages: {
			es: {
				id: 'es',
				name: 'Español',
			},
			en: {
				id: 'en',
				name: 'English',
			},
		},
		actionsToHelp: [],
		limit: 20,
		loadingExcel: false,
		snackbar: {
			text: '',
			isVisible: false,
			color: 'primary',
			timeout: 0,
		},
		table: {
			params: {
				currency: null,
				search: null,
				limit: 20,
				page: 1,
				sortField: 'created_at',
				sortDirection: 'desc',
			},
			lastPage: 1,
			rows: [],
		},
		statesEntity: [
			{
				id: 1,
				name: 'Sin Contabilizar',
			},
			{
				id: 4,
				name: 'Contabilizado',
			},
		],
		inventoriesType: [
			{
				id: 1,
				name: 'Parcial',
				msg: null,
			},
			{
				id: 2,
				name: 'Completo',
				msg: {
					title: 'NOTA IMPORTANTE',
					text: 'Los productos que no aparezcan en este inventario serán actualizados con stock = 0 al momento de hacer el cierre.',
				},
			},
		],
		documentMessage: '',
		maxDocument: 0,
		minDocument: 0,
		personTypes: [],
		personType: {},
		personValidations: null,
		notification: {
			colorDialog: 'error',
			colorText: 'error',
			show: false,
			text: '',
			title: '',
		},
	};
}

function calculateLimit() {
	const footerHeight = 29;
	const headerHeight = 62;
	const rowHeight = 30;
	const usedHeight = footerHeight + headerHeight;
	const availableHeight = document.body.clientHeight - usedHeight;
	const limit = Math.ceil(availableHeight / rowHeight);
	if (limit > 20) {
		this.limit = limit;
	}
}

function setProductPrice(product, products) {
	const newProduct = { ...product };
	const updateProducts = [...products];
	const selectedPriceList = newProduct.priceList[newProduct.selectedPriceListId];
	newProduct.price = this.getProductPrice(newProduct.quantity, selectedPriceList);
	if (!newProduct.price) {
		newProduct.price = product.price;
	}
	updateProducts.forEach((e) => {
		if (e.id === newProduct.id) {
			e.price = newProduct.price;
		}
		return e;
	});
	return updateProducts;
}

function getProductPrice(quantity, priceList) {
	if (priceList.ranges.length > 0) {
		const newPrice = priceList.ranges.filter(
			(el) => el.from <= quantity && el.to >= quantity
		);
		return newPrice.length > 0 ? newPrice[0].price : priceList.price;
	}
	return priceList.price;
}

function disabledDispatchMovement({ flagUse, typeDocument, flagIncomeStatus }) {
	const { settings } = typeDocument;
	let disabledItem = false;
	if (settings && settings.flagKardexMovement !== true) {
		disabledItem = true;
	}
	if (flagUse === 1) {
		disabledItem = true;
	}
	if (flagIncomeStatus === 1) {
		disabledItem = true;
	}
	return disabledItem;
}

function newAmountsCalculate(products, flagIgv) {
	const taxValue = 18 / 100;
	let total = 0;
	let tax = 0;
	let subtotal = products.reduce(
		(acum, currentProduct) =>
			acum +
			currentProduct.priceList[currentProduct.selectedPriceListId].price *
				currentProduct.quantity,
		0
	);
	const discount =
		products.reduce(
			(acum, currentProduct) => acum + currentProduct.discount * currentProduct.quantity,
			0
		) || 0;
	subtotal -= discount;
	if (flagIgv === 0) {
		tax = this.roundInNumber(subtotal * taxValue);
		total = this.roundInNumber(subtotal + tax);
	} else {
		total = this.roundInNumber(subtotal);
		subtotal = this.roundInNumber(total / (1 + taxValue));
		tax = this.roundInNumber(total - subtotal);
	}
	const amounts = {
		subtotal,
		tax,
		discount,
		total,
	};
	return amounts;
}
function amountsCalculate(rows, priceListId, flagIgv, pageCode, globalDiscount) {
	const taxValue = 18 / 100;
	let total = 0;
	let tax = 0;
	const newRows = rows.map((row) => {
		const newRow = { ...row };
		if (priceListId && pageCode !== 'TNV') {
			if (row.priceList && row.priceList[priceListId]) {
				newRow.priceToSubtotal = row.priceList[priceListId].price;
				row.priceList[priceListId].ranges.forEach((range) => {
					if (
						row.quantity &&
						row.quantity > range.from - 1 &&
						row.quantity < range.to + 1
					) {
						newRow.priceToSubtotal = range.price;
					}
				});
			} else if (
				row.product &&
				row.product.priceList &&
				row.product.priceList[priceListId]
			) {
				if (
					row.product.priceList[priceListId].quantity &&
					row.quantity >= row.product.priceList[priceListId].quantity
				) {
					newRow.priceToSubtotal = row.product.priceList[priceListId].wholeSalePrice;
				} else {
					newRow.priceToSubtotal = row.product.priceList[priceListId].price;
				}
			} else {
				newRow.priceToSubtotal = 0;
				newRow.discount = row.discount ? row.discount : 0;
			}
		} else {
			newRow.priceToSubtotal = row.price;
		}
		return newRow;
	});
	let subtotal = newRows.reduce(
		(acum, currentRow) => acum + currentRow.priceToSubtotal * currentRow.quantity,
		0
	);
	if (flagIgv === 0) {
		tax = this.roundInNumber(subtotal * taxValue);
		total = this.roundInNumber(subtotal + tax);
	} else {
		total = this.roundInNumber(subtotal);
		subtotal = this.roundInNumber(total / (1 + taxValue));
		tax = this.roundInNumber(total - subtotal);
	}
	const discount = newRows.reduce(
		(acum, currentRow) => acum + currentRow.discount * currentRow.quantity,
		0
	);
	if (pageCode === 'TNV') {
		total = globalDiscount
			? this.roundInNumber(subtotal + tax - globalDiscount)
			: this.roundInNumber(subtotal + tax);
	} else {
		total = discount
			? this.roundInNumber(subtotal + tax - discount)
			: this.roundInNumber(subtotal + tax);
	}
	const amounts = {
		newRows,
		subtotal,
		tax,
		discount,
		total,
	};
	return amounts;
}

function brandsList() {
	return this.$httpProducts.get('brands');
}

function customersList(params) {
	return this.$httpSales.get('customers', { params });
}

function customerSelections(value, flagSales) {
	if (flagSales) {
		return this.$httpSales.get('customers', {
			params: { search: value, flagSales },
		});
	}
	return this.$httpSales.get('customers', { params: { search: value } });
}

function globalEmployees() {
	return this.$httpSales.get('employees');
}

function globalList() {
	const getWarehouseStorage = helper.getLocalData('warehouses');
	if (getWarehouseStorage && getWarehouseStorage.length > 0) {
		return getWarehouseStorage;
	}
	this.warehousesGlobal();
	const getWarehouseState = helper.getLocalData('warehouses');
	return getWarehouseState;
}

async function warehousesGlobal() {
	try {
		const response = await this.$httpProducts.get('warehouses');
		helper.setLocalData('warehouses', response.data);
	} catch (error) {
		this.showGenericError();
	}
}

function goTo(name, options) {
	this.$router.push({ name, ...options });
}

function warehousesList(params) {
	return this.$httpProducts.get('warehouses', { params });
}

function expensesList(params, host = '$httpSales', url = 'expenses') {
	return this[host].get(url, { params });
}

function typeExpensesList() {
	return this.$httpSales.get('type-expenses');
}

function subsidiariesList(params) {
	return this.$httpSales.get('subsidiaries', { params });
}

function productsSelections(value, noServices = 1) {
	const params = { search: value };
	if (noServices === 1) {
		params.noServices = noServices;
	}
	return this.$httpProducts.get('products', { params });
}

function employeeSelections(value) {
	return this.$httpProduction.get('employees', { params: { search: value } });
}

function exchangeByDate() {
	const date = this.$today();
	return this.$httpSales.get(`exchange-rates/${date}`);
}

async function exportTable(columns, rows, name) {
	const code = 'xlsx';
	const model = {
		code,
		columns,
		rows,
	};
	if (rows.length > 0) {
		try {
			const response = await this.$httpReportSales.post('reports', model, {
				responseType: 'blob',
			});
			const blob = helper.generateBlob(
				response.data,
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			);
			helper.showDownloadDialog(blob, name, code);
		} catch (err) {
			this.showNotification(
				'Ocurrió un error en el servidor al intentar exportar la data',
				'error'
			);
		}
	} else {
		this.showNotification('Debe seleccionar una o más filas para exportar.', 'warning');
	}
}

function categoriesList(params) {
	return this.$httpProducts.get('categories', { params });
}

function getCheckSeries(params) {
	return this.$httpSales('check-series', { params });
}

function getChecks(params) {
	return this.$httpSales.get('check', { params });
}

function getAccountType() {
	return this.$httpSales.get('bank-account-type');
}

function listOfUnits() {
	return this.$httpProducts.get('units');
}

function listPricingPromise(params) {
	return this.$httpSales.get('sal-price-lists', { params });
}

function getPaymentsMethods() {
	return this.$httpSales.get('payments-methods');
}

function getTypePayments(type) {
	if (type) {
		const params = {
			flagType: type === 'sales' ? flagType.Sales : flagType.Purchases,
		};
		return this.$httpSales.get('type-payments', { params });
	}
	return this.$httpSales.get('type-payments');
}

function getTypeDocuments(type) {
	if (type) {
		const params = {
			flagType: type === 'sales' ? flagType.Sales : flagType.Purchases,
		};
		return this.$httpSales.get('type-documents', { params });
	}
	return this.$httpSales.get('type-documents');
}

function getBankAccount(id, params) {
	const url = id ? `bank-account/${id}` : 'bank-account';
	return this.$httpSales.get(url, { params });
}

function getBanks(params) {
	if (params) {
		return this.$httpSales.get('banks', { params });
	}
	return this.$httpSales.get('banks');
}

function roundInNumber(value) {
	return Math.round(value * 100) / 100;
}

function showNotification(text, color = 'primary', timeout = 5000) {
	this.$bus.$emit(TOGGLE_SNACKBAR, { color, text, timeout });
}

async function onEmitExcel(code, originName, params) {
	this.loadingExcel = true;
	const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
	const { name, lastname, companyId } = this.$userInfo;
	const documentData = {
		filename: `${originName}${now}_${companyId}`,
		extension: 'xlsx',
		comment: `${originName} generado por ${name} ${lastname}`,
		params,
	};
	try {
		await this.$httpReports.post(`documents/${code}`, documentData);
		this.showExcelGenerateMessage();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'NOT_FOUND_REPORT') {
				this.showGenericError('El reporte no se encuentra activado para su compañía.');
			}
		}
	} finally {
		this.loadingExcel = false;
	}
}

async function generateReportGlobalPdf(report, params) {
	const { code, originName } = report;
	const now = format(new Date(), 'YYYY_MM_HH_mm_ss');
	const { name, lastname, companyId } = this.$userInfo;
	const documentData = {
		filename: `${originName}_${now}_${companyId}`,
		extension: 'pdf',
		comment: `${originName} generado por ${name} ${lastname}`,
		params,
	};
	try {
		await this.$httpReports.post(`documents/${code}`, documentData);
		this.notificationReport(report.name);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'NOT_FOUND_REPORT') {
				this.showGenericError('El reporte no se encuentra activado para su compañía.');
			}
		}
	}
}

async function generalListKardex(params) {
	const now = format(new Date(), 'YYYY_MM_HH_mm_ss');
	const { fullname } = this.$userInfo;
	const document = {
		filename: `listado_general_de_kardex_${now}`,
		extension: 'xlsx',
		comment: `listado_general_de_kardex generado por ${fullname}`,
		params,
	};
	try {
		await this.$httpReports.post('documents/list-header-kardex-movements', document);
		this.notificationReport();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'NOT_FOUND_REPORT') {
				this.showGenericError('El reporte no se encuentra activado para su compañía.');
			}
		}
	}
}

async function onProductList(report, params) {
	const { code, name, originName } = report;
	const now = format(new Date(), 'YYYY_MM_HH_mm_ss');
	const { lastname, companyId } = this.$userInfo;
	const documentData = {
		filename: `${originName}${now}${companyId}`,
		extension: 'pdf',
		comment: `${originName} generado por ${this.$userInfo.name} ${lastname}`,
		params,
	};
	await this.$httpReports.post(`documents/${code}`, documentData);
	this.notificationReport(name);
}

async function onReportSale(params) {
	const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
	const { name, lastname, companyId } = this.$userInfo;
	const documentData = {
		filename: `Reporte_Lista_de_ventas_pdf ${now}_${companyId}`,
		extension: 'pdf',
		comment: `Reporte_Lista_de_ventas_pdf generado por ${name} ${lastname}_${companyId}`,
		params,
	};
	await this.$httpReports.post('documents/list-document-sale-pdf', documentData);
	this.notificationReport('reporte de ventas');
}

function onToggleSnackBar() {
	this.$bus.$on(TOGGLE_SNACKBAR, (snackbar) => {
		const newSnackbar = Object.assign({}, snackbar);
		newSnackbar.isVisible = true;
		this.snackbar = newSnackbar;
	});
}

function showExcelGenerateMessage() {
	this.notificationReport('excel');
	this.loadingExcel = false;
}

function showGenericError(text = 'Ups, ocurrió algún problema', timeout = 5000) {
	this.showNotification(text, 'error', timeout);
}

function showRow(columns, columnId) {
	const column = columns.find((h) => h.id === columnId);
	return column.visible;
}

function unSelectedRows(allProducts) {
	const products = allProducts.map((d) => {
		const newD = { ...d };
		newD.isSelected = false;
		return newD;
	});
	helper.setLocalData('master-products', []);
	return { products, productsSelected: [], checkAll: false };
}

function selectedRows(row, currentData, dataSelected, flag = false) {
	const prop = row.warWarehouseProductBrandId ? 'warWarehouseProductBrandId' : 'id';
	const products = currentData.map((product) => {
		const newProduct = { ...product };
		const propTwo = 'location';
		if (flag) {
			if (row[prop] === newProduct[prop] && row[propTwo] === newProduct[propTwo]) {
				newProduct.isSelected = row.isSelected;
			}
		} else if (row[prop] === newProduct[prop] && row.flagFree === newProduct.flagFree) {
			newProduct.isSelected = row.isSelected;
		}
		return newProduct;
	});
	const productsSelected = [...dataSelected];
	if (row.isSelected) {
		if (dataSelected.length > 0) {
			const dataToAdd = dataSelected.find(
				(rowSelected) => rowSelected[prop] === row[prop]
			);
			if (!dataToAdd) {
				productsSelected.push(row);
			}
		} else {
			productsSelected.push(row);
		}
	} else {
		const index = productsSelected.findIndex((rowData) => rowData[prop] === row[prop]);
		productsSelected.splice(index, 1);
	}
	const checkAll = products.every((check) => check.isSelected);
	return { products, productsSelected, checkAll };
}

function selecteAll(value, currentData, dataSelected) {
	const productsSelected = [...dataSelected];
	let products = [];
	if (currentData.length > 0) {
		products = currentData.map((dataSingle) => {
			const newData = { ...dataSingle };
			newData.isSelected = value;
			if (newData.isSelected) {
				if (dataSelected.length > 0) {
					const dataToAdd = dataSelected.some(
						(rowSelected) => rowSelected.id === newData.id
					);
					if (!dataToAdd) {
						productsSelected.push(newData);
					}
				} else {
					productsSelected.push(newData);
				}
			} else {
				const index = productsSelected.findIndex((rowData) => rowData.id === newData.id);
				productsSelected.splice(index, 1);
			}
			return newData;
		});
	}
	return { products, productsSelected, checkAll: value };
}

function goBack() {
	this.$router.back();
}

async function onReportSaleCommissions(params) {
	const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
	const { name, lastname } = this.$userInfo;
	const documentData = {
		filename: `Reporte_Comisiones_de_ventas_pdf ${now}`,
		extension: 'pdf',
		comment: `Reporte_Comisiones_de_ventas_pdf generado por ${name} ${lastname}`,
		params,
	};
	await this.$httpReports.post('documents/list-commission-sale-pdf', documentData);
	this.notificationReport('reporte de ventas');
}

async function reportListSeries(params) {
	const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
	const { name, lastname } = this.$userInfo;
	const documentData = {
		filename: `listado_de_series_agroupados por productos_${now}`,
		extension: 'xlsx',
		comment: `listado_de_series_agroupados por productos por '${name} ${lastname}'`,
		params,
	};
	try {
		await this.$httpReports.post('documents/list-products-series', documentData);
		this.notificationReport('reporte de series');
	} catch (error) {
		if (error.data.statusCode === 400) {
			this.showGenericError(
				'No esta habilitado el reporte de series, activelo en la sección de reporte externo'
			);
		}
	}
}

async function reportPdfSeries(params) {
	const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
	const { name, lastname } = this.$userInfo;
	const documentData = {
		filename: `listado_de_series por productos_${now}`,
		extension: 'pdf',
		comment: `listado_de_series por productos por '${name} ${lastname}'`,
		params,
	};
	try {
		await this.$httpReports.post('documents/list-products-series-pdf', documentData);
		this.notificationReport('reporte de series');
	} catch (error) {
		if (error.data.statusCode === 400) {
			this.showGenericError(
				'No esta habilitado el reporte de series, activelo en la sección de reporte externo'
			);
		}
	}
}

async function reportListLots(params) {
	const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
	const { name, lastname } = this.$userInfo;
	const documentData = {
		filename: `listado_de_lotes_${now}`,
		extension: 'xlsx',
		comment: `listado_de_lotes por '${name} ${lastname}'`,
		params,
	};
	try {
		await this.$httpReports.post('documents/list-products-lots', documentData);
		this.notificationReport('reporte de lotes');
	} catch (error) {
		if (error.data.statusCode === 400) {
			this.showGenericError(
				'No esta habilitado el reporte de lotes, activelo en la sección de reporte externo'
			);
		}
	}
}

async function reportPdfLots(params) {
	const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
	const { name, lastname } = this.$userInfo;
	const documentData = {
		filename: `listado_de_lotes_${now}`,
		extension: 'pdf',
		comment: `listado_de_lotes por '${name} ${lastname}'`,
		params,
	};
	try {
		await this.$httpReports.post('documents/list-products-lots-pdf', documentData);
		this.notificationReport('reporte de lotes');
	} catch (error) {
		if (error.data.statusCode === 400) {
			this.showGenericError(
				'No esta habilitado el reporte de lotes, activelo en la sección de reporte externo'
			);
		}
	}
}

async function reportCustomerDirection(params, code) {
	const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
	const { name, lastname } = this.$userInfo;
	const fileName =
		code === 'with_zones'
			? 'listado de direcciones de cliente por zona'
			: 'listado de direcciones de cliente sin zonas';
	const documentData = {
		filename: `${fileName} ${now}`,
		extension: 'xlsx',
		comment: `list-customers-address-xlsx generado por ${name} ${lastname}`,
		params,
	};
	try {
		await this.$httpReports.post('documents/list-customers-address-xlsx', documentData);
		this.notificationReport(`reporte del ${fileName}`);
	} catch (error) {
		if (error.data.statusCode === 400) {
			this.showGenericError(
				`No esta habilitado el reporte del ${fileName}, activelo en la sección de reporte externo`
			);
		}
	}
}

function isWarehouse() {
	return this.$userInfo.roleCode === 'WAREHOUSE_MANAGER';
}

function isRoleVendor() {
	return this.$userInfo.roleCode === 'MAKI_VENDOR' || false;
}

function isRoleAdmin() {
	return this.$userInfo.roleCode === 'ADMIN';
}

function isSupport() {
	return this.$userInfo.roleCode === 'SUPPORT';
}

function labelsByCountry() {
	const company = this.$userInfo.company;
	const country = company.country;
	const defaultCountryJson = jsonCountries[country.countryCode];
	const { geographicalDivisions, geoposition } = defaultCountryJson;
	const defaultCountry = {
		id: 1,
		name: 'Perú',
		currency: 'PEN',
		code: 'PER',
		coinValue: 'Soles',
		geoposition,
		percentage: 18,
		taxName: 'IGV',
		taxAgency: 'Sunat',
		rucLength: 11,
		subsidiaryValue: 'ruc',
		idLabel: 'Tipo de Documento',
		phoneCode: '51',
		labelProvince: 'Departamento',
		labelCity: 'Provincia',
		labelParish: 'Distrito',
	};
	if (country) {
		return {
			id: country.id,
			code: country.countryCode,
			currency: company.currency,
			geoposition,
			idLabel: country.countryCode === 'PER' ? 'Tipo de Documento' : 'Identificación',
			name: country.name,
			percentage:
				country.countryCode === 'PER'
					? country.percentage || 18
					: country.percentage || 12,
			taxName: country.taxName,
			taxAgency: country.countryCode === 'PER' ? 'Sunat' : 'SRI',
			rucLength: country.countryCode === 'PER' ? 11 : 13,
			subsidiaryValue: country.countryCode === 'PER' ? 'ruc' : 'id',
			phoneCode: country.countryCode === 'PER' ? '51' : '593',
			labelProvince: geographicalDivisions.countryLevel,
			labelCity: geographicalDivisions.regionLevel,
			labelParish: geographicalDivisions.localityLevel,
		};
	}
	return defaultCountry;
}

function coinValue() {
	return this.isPeru ? 'Soles' : 'Dolares';
}

function countryCurrencySymbol() {
	return this.isPeru ? 'S/' : '$';
}

function isEcuador() {
	return this.labelsByCountry.id === 2;
}

function isPeru() {
	return this.labelsByCountry.id === 1;
}

function isChile() {
	return this.labelsByCountry.id === 6;
}

function flagOutbox() {
	return this.$userInfo?.company?.settings?.flagOutbox;
}

async function loadTypePerson() {
	const typesPersons = await this.$httpSales.get('type-person');
	const personsLegal = typesPersons.data.filter((person) => person.flagLegal === 1);
	const personsNotLegal = typesPersons.data.filter(
		(person) => person.code !== 'ruc' && person.flagLegal === null
	);
	this.personTypes = personsLegal.concat(personsNotLegal);
}

function personType(value) {
	this.personValidations =
		value && value.configuration ? value.configuration.validations : value.configuration;
	if (this.personValidations) {
		this.maxDocument = this.personValidations.maxLength || 0;
		this.minDocument = this.personValidations.minLength || 0;
		if (this.maxDocument && this.minDocument) {
			if (this.maxDocument === this.minDocument) {
				this.documentMessage = `Es necesario ingresar ${this.minDocument} dígitos`;
			} else {
				this.documentMessage = `Es necesario ingresar entre ${this.minDocument} y ${this.maxDocument} dígitos`;
			}
		} else if (this.minDocument) {
			this.documentMessage = `Ingrese un mínimo de ${this.minDocument} dígitos`;
		} else if (this.maxDocument) {
			this.documentMessage = `Ingrese un máximo de ${this.maxDocument} dígitos`;
		} else {
			this.documentMessage = '';
		}
	} else {
		this.documentMessage = '';
	}
}

function openHelp({ code, actions }) {
	this.action.code = code;
	this.action.open = true;
	this.action.active = true;
	this.action.title = this.$route.meta.title;
	this.action.width = 500;
	this.actionsToHelp = [...actions];
}

function getCurrencies() {
	return this.$httpSales.get('currency-company', { params: { company: true } });
}

function currencyByCountry(currencies) {
	return this.isEcuador ? currencies.filter((c) => c.code === 'USD') : currencies;
}

function getCities() {
	return this.$httpSales.get('cities');
}

function stopClick() {
	return false;
}

function urlLoadData(method, code, params, id, model) {
	const url = id ? `group/${code}/table/${id}` : `group/${code}/table`;
	if (params && model) {
		return this.$httpSales[method](url, { params }, model);
	} else if (params) {
		return this.$httpSales[method](url, { params });
	} else if (model) {
		return this.$httpSales[method](url, model);
	}
	return this.$httpSales[method](url);
}

function getFlagUpdatePrice() {
	return this.$userInfo.additionalInformation &&
		this.$userInfo.additionalInformation.flagUpdatePrice
		? this.$userInfo.additionalInformation.flagUpdatePrice
		: false;
}

function currentWarehouseData() {
	const { codeTaxes: warehouseCodeTaxes, name: warehouseName } = this.$userInfo.warehouse;
	return { warehouseCodeTaxes, warehouseName };
}

function labelTerminal(plural = false) {
	if (plural) {
		return this.isPeru ? 'Puntos de Venta' : 'Terminales';
	}
	return this.isPeru ? 'Punto de Venta' : 'Terminal';
}

function labelSucursal(plural = false) {
	if (plural) {
		return this.isPeru ? 'Razones Sociales' : 'Empresas';
	}
	return this.isPeru ? 'Razón Social' : 'Empresa';
}

function labelWarehouse(plural = false, article = false) {
	if (plural) {
		if (article) {
			return this.isPeru ? 'Las tiendas' : 'Las tiendas';
		}
		return this.isPeru ? 'Tiendas' : 'Tiendas';
	} else if (article) {
		return this.isPeru ? 'La tienda' : 'La tienda';
	}
	return this.isPeru ? 'Tienda' : 'Tienda';
}

function isMibodega() {
	return true;
	// Ya no se trabaja con ecuador, asi que esta compración siempre debe ser true
	// const adminCode = process.env.ADMIN_CODE;
	// return adminCode === 'mibodega';
}

function isMovil() {
	return window.innerWidth <= 760;
}

function isDistributor() {
	if (this.$userInfo) {
		if (this.$userInfo.company) {
			if (this.$userInfo.company.settings) {
				return this.$userInfo.company.settings.flagGrouper;
			}
			return false;
		}
		return false;
	}
	return false;
}

function checkBlankCode(code) {
	return /\s/.test(code);
}

function isFlagKardexValued() {
	if (this.$userInfo) {
		if (this.$userInfo.company) {
			if (this.$userInfo.company.settings) {
				return this.$userInfo.company.settings.flagKardexValued;
			}
			return false;
		}
		return false;
	}
	return false;
}

function isAccounting() {
	const { configIntegrations } = this.$userInfo.subsidiary;
	const { accountingPlan, accountingConfiguration } = configIntegrations || {};
	const valueValid = accountingPlan || accountingConfiguration;
	return valueValid ? !!valueValid.flagConfig : false;
}

function isTwoDrivers() {
	if (this.$userInfo) {
		if (this.$userInfo.company) {
			if (this.$userInfo.company.settings) {
				return Boolean(this.$userInfo.company.settings.freeCourierTwoDrivers);
			}
			return false;
		}
		return false;
	}
	return false;
}

function showNotificationNew(
	colorDialog = 'error',
	colorHex = '#D5331A',
	title = 'Error',
	text = 'Ups, ocurrió algún problema.'
) {
	this.notification.colorDialog = colorDialog;
	this.notification.colorHex = colorHex;
	this.notification.title = title;
	this.notification.text = text;
	this.notification.show = true;
}

function closeNotification() {
	this.notification.show = false;
	this.notification.colorDialog = '';
	this.notification.colorText = '';
	this.notification.text = '';
	this.notification.title = '';
}

async function loadBanks() {
	const getBanksFromLocalStorage = helper.getLocalData('banks');
	if (getBanksFromLocalStorage && getBanksFromLocalStorage.length > 0) {
		this.banks = await new Promise((resolve) => resolve(getBanksFromLocalStorage));
	} else {
		({ data: this.banks } = await this.$httpSales.get('banks'));
		helper.setLocalData('banks', this.banks);
	}
}

function showAdditionalInfomatioQuotation() {
	const documents = helper.getLocalData('documents');
	if (documents) {
		const documentCOT = documents.find((d) => d.documentType.code === 'COT');
		if (documentCOT ? documentCOT.additionalInformation : false) {
			if (
				documentCOT.additionalInformation.aditionalInfo &&
				documentCOT.additionalInformation.aditionalInfo.guideData
			) {
				const template = documentCOT.additionalInformation.aditionalInfo.guideData;
				const arrayTemplate = Object.entries(template).sort(
					([, a], [, b]) => b.order - a.order
				);
				const arrayTemplateReverse = arrayTemplate.reverse();
				const objectOrder = Object.fromEntries(arrayTemplateReverse);
				return objectOrder;
			}
			return false;
		}
		return false;
	}
	return false;
}

function showColumnsDocuments() {
	const documents = helper.getLocalData('documents');
	if (documents) {
		const documentCOT = documents.find((d) => d.documentType.code === 'COT');
		if (documentCOT ? documentCOT.additionalInformation : false) {
			if (
				documentCOT.additionalInformation.aditionalInfo &&
				documentCOT.additionalInformation.aditionalInfo.salesTable
			) {
				const template =
					documentCOT.additionalInformation.aditionalInfo.salesTable.columns;
				const arrayTemplate = Object.entries(template).sort(
					([, a], [, b]) => b.order - a.order
				);
				const arrayTemplateReverse = arrayTemplate.reverse();
				const objectOrder = Object.fromEntries(arrayTemplateReverse);
				return objectOrder;
			}
			return false;
		}
		return false;
	}
	return false;
}

function showAdditionalInfomatioSales() {
	const documents = helper.getLocalData('documents');
	if (documents) {
		const documentCOT = documents.find((d) => d.documentType.name === 'BOLETA DE VENTA');
		if (documentCOT ? documentCOT.additionalInformation : false) {
			if (
				documentCOT.additionalInformation.aditionalInfo &&
				documentCOT.additionalInformation.aditionalInfo.saleData
			) {
				const template = documentCOT.additionalInformation.aditionalInfo.saleData;
				const arrayTemplate = Object.entries(template).sort(
					([, a], [, b]) => b.order - a.order
				);
				const arrayTemplateReverse = arrayTemplate.reverse();
				const objectOrder = Object.fromEntries(arrayTemplateReverse);
				return objectOrder;
			}
			return false;
		}
		return false;
	}
	return false;
}

function showAdditionalInfomatioTypePayment() {
	const documents = helper.getLocalData('documents');
	if (documents) {
		const documentCOT = documents.find((d) => d.documentType.code === 'COT');
		if (documentCOT ? documentCOT.additionalInformation : false) {
			if (
				documentCOT.additionalInformation.aditionalInfo &&
				documentCOT.additionalInformation.aditionalInfo.payment
			) {
				const template = documentCOT.additionalInformation.aditionalInfo.payment;
				const arrayTemplate = Object.entries(template).sort(
					([, a], [, b]) => b.order - a.order
				);
				const arrayTemplateReverse = arrayTemplate.reverse();
				const objectOrder = Object.fromEntries(arrayTemplateReverse);
				return objectOrder;
			}
			return false;
		}
		return false;
	}
	return false;
}

function showAdditionalInfomationFac() {
	const documents = helper.getLocalData('documents');
	if (documents) {
		const documentCOT = documents.find((d) => d.documentType.code === 'COT');
		if (documentCOT ? documentCOT.additionalInformation : false) {
			if (
				documentCOT.additionalInformation.aditionalInfo &&
				documentCOT.additionalInformation.aditionalInfo.dataFac
			) {
				const template = documentCOT.additionalInformation.aditionalInfo.dataFac;
				const arrayTemplate = Object.entries(template).sort(
					([, a], [, b]) => b.order - a.order
				);
				const arrayTemplateReverse = arrayTemplate.reverse();
				const objectOrder = Object.fromEntries(arrayTemplateReverse);
				return objectOrder;
			}
			return false;
		}
		return false;
	}
	return false;
}

function showConfigurationQuotation() {
	if (this.$userInfo) {
		if (this.$userInfo.company) {
			if (this.$userInfo.company.settings) {
				return this.$userInfo.company.settings.flagQuotation;
			}
			return false;
		}
		return false;
	}
	return false;
}

function showCashCxC() {
	return (
		this.$userInfo.codeTypeRol === typeRol.Admin ||
		this.$userInfo.codeTypeRol === typeRol.SuperAdmin ||
		this.$userInfo.codeTypeRol === typeRol.Accountant
	);
}

async function onReportPurchase(id) {
	const model = { code: 'pdf-purchase' };
	const downloadDialog = this.$userInfo.company.settings.downloadSale;
	const responseType = 'blob';
	const contentType = downloadDialog ? 'application/pdf' : 'text/html';
	const response = await this.$httpReportSales.post(
		`purchase-documents/${id}/pdf`,
		model,
		{ responseType }
	);
	const blob = helper.generateBlob(response.data, contentType);
	helper.showDownloadDialog(blob, 'Reporte detalle de compra', 'pdf', true);
}

function notificationReport(
	name = 'Reporte',
	color = 'primary',
	timeout = 8000,
	redirectTo = '/documents',
	fontSize = '16px'
) {
	const text = `El ${name} está siendo generado, puede descargar el reporte en la sección de Documentos <strong>presionando aca para ir.</strong>`;

	const onClick = () => {
		if (redirectTo) window.open(redirectTo, '_blank');
	};

	this.$bus.$emit(TOGGLE_SNACKBAR, { color, text, timeout, onClick, fontSize });
}

function roundFixedToNumber(number = 0, decimal = 2) {
	return Number(number.toFixed(decimal));
}

function $delay(time = 1000) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

const mixin = {
	data,
	computed: {
		coinValue,
		countryCurrencySymbol,
		isEcuador,
		isPeru,
		flagOutbox,
		isChile,
		labelsByCountry,
		currentWarehouseData,
		isMibodega,
		isMovil,
		isDistributor,
		isFlagKardexValued,
		isAccounting,
		isTwoDrivers,
		isRoleVendor,
		isRoleAdmin,
		isSupport,
		isWarehouse,
		showAdditionalInfomationFac,
		showAdditionalInfomatioTypePayment,
		showAdditionalInfomatioSales,
		showAdditionalInfomatioQuotation,
		showColumnsDocuments,
		showConfigurationQuotation,
		showCashCxC,
	},
	methods: {
		notificationReport,
		roundFixedToNumber,
		amountsCalculate,
		brandsList,
		calculateLimit,
		categoriesList,
		checkBlankCode,
		closeNotification,
		currencyByCountry,
		customerSelections,
		customersList,
		disabledDispatchMovement,
		employeeSelections,
		exchangeByDate,
		expensesList,
		exportTable,
		generalListKardex,
		getAccountType,
		getBankAccount,
		getBanks,
		getCheckSeries,
		getChecks,
		getCities,
		getCurrencies,
		getFlagUpdatePrice,
		getPaymentsMethods,
		getProductPrice,
		getTypeDocuments,
		getTypePayments,
		globalEmployees,
		globalList,
		goBack,
		goTo,
		labelSucursal,
		labelTerminal,
		labelWarehouse,
		listOfUnits,
		listPricingPromise,
		loadBanks,
		loadTypePerson,
		newAmountsCalculate,
		generateReportGlobalPdf,
		onEmitExcel,
		onProductList,
		onReportSale,
		onReportSaleCommissions,
		onReportPurchase,
		reportListSeries,
		reportPdfSeries,
		reportListLots,
		reportPdfLots,
		reportCustomerDirection,
		onToggleSnackBar,
		openHelp,
		productsSelections,
		roundInNumber,
		selecteAll,
		selectedRows,
		setProductPrice,
		showExcelGenerateMessage,
		showGenericError,
		showNotification,
		showNotificationNew,
		showRow,
		stopClick,
		subsidiariesList,
		typeExpensesList,
		unSelectedRows,
		urlLoadData,
		warehousesList,
		warehousesGlobal,
		$delay,
	},
	watch: {
		personType,
	},
};

export default mixin;
