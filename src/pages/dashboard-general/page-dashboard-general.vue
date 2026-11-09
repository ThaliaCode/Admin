<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			:label="`La carga terminará en un momento y podrás ver
				toda la información para dashboard de ventas.`"
		/>
		<header-page
			:caption-navigation="captionNavigation"
			btns-column="xs8"
			column-class="xs12"
			:title="$route.meta.title"
			to-show
			:show-clean="false"
			:show-excel="false"
		>
			<header-filter
				:currencies="currencies"
				:filters="filters"
				:period="period"
				:period-types="periodTypes"
				:show-range="showRange"
				:subsidiaries="subsidiaries"
				:type-transaction="typeTransaction"
				:types-transactions="typesTransactions"
				:typeDocuments="typeDocuments"
				@set-filter="setFilter"
				@set-period="setPeriod"
			></header-filter>
		</header-page>
		<v-layout row wrap align-center px-3 pt-3 pb-5>
			<div :class="{ 'flex xs3': currentWarehousesSelected.length === 0 }">
				<template v-if="!filters.subsidiaryCode">
					<v-tooltip top>
						<v-btn
							class="btn-dashboard-general"
							color="primary"
							disabled
							outline
							round
							slot="activator"
						>
							<span class="btn-dashboard-general-text">Seleccionar Tiendas</span>
						</v-btn>
						<span>Es necesario seleccionar una empresa</span>
					</v-tooltip>
				</template>
				<template v-else>
					<v-btn
						class="btn-auto btn-dashboard-general ma-0"
						:class="{
							'btn-dashboard-mini': currentWarehousesSelected.length > 0,
						}"
						color="primary"
						:disabled="!filters.subsidiaryCode"
						outline
						round
						@click="showSlide(true)"
					>
						<span class="btn-dashboard-general-text">
							<template v-if="currentWarehousesSelected.length === 0">
								Seleccionar Tiendas
							</template>
							<template v-else> + </template>
						</span>
					</v-btn>
				</template>
			</div>
			<v-flex v-if="currentWarehousesSelected.length > 0" xs11 pl-2>
				<template v-for="wSelected in currentWarehousesSelected">
					<v-chip
						class="warehouse-chip"
						:style="`background-color: ${wSelected.settings.color}`"
					>
						{{ wSelected.name }}
					</v-chip>
				</template>
			</v-flex>
			<v-flex xs12 mt-4>
				<v-layout row wrap align-center>
					<template v-for="info in statistics">
						<v-flex
							v-if="
								!isSalesProfit ||
								(isSalesProfit &&
									info.code !== 'canceled' &&
									info.code !== 'salAverageTicket')
							"
							class="container-statistics-cards"
							:class="isSalesProfit && info.code === 'total' ? 'xs9' : 'xs4'"
							:key="info.id"
						>
							<statistics-cards
								:show-icon="isSalesProfit"
								:items="isSalesProfit ? info.items : []"
								:info="info"
							></statistics-cards>
						</v-flex>
					</template>
				</v-layout>
			</v-flex>
			<v-flex xs12 mt-4>
				<v-layout row wrap>
					<v-flex xs6 pr-2>
						<template v-if="isSalesProfit">
							<graphics-box-dashboard
								:graphic-options="circleGraphicOptions"
								pie
								:show-more="circleGraphicOptions.sections.length > 7"
								:show-more-active="showMoreActive"
								title="Beneficio por categoría"
								@show-all="showAllCategories"
								@download-excel="downloadExcelBenefitCategor"
							></graphics-box-dashboard>
						</template>
						<template v-else>
							<graphics-box-dashboard
								circle
								:graphic-options="circleGraphicOptions"
								:show-more="circleGraphicOptions.sections.length > 7"
								:show-more-active="showMoreActive"
								title="Reporte de categorías"
								@show-all="showAllCategories"
								@download-excel="downloadExcelCategories"
							></graphics-box-dashboard>
						</template>
					</v-flex>
					<v-flex xs6 pl-2>
						<template v-if="saleByHours || isSalesProfit">
							<graphics-box-dashboard
								show-drop-down-value
								:drop-down-options="graphicOptions"
								:graphic-options="lineGraphicOptions"
								line
								:title="
									isSalesProfit ? 'Beneficio por punto de venta' : 'Ventas por horas'
								"
								@show-options="showOptions(1)"
								@change-graphic="changeGraphic"
								@download-excel="downloadPointSale"
							></graphics-box-dashboard>
						</template>
						<template v-else>
							<graphics-box-dashboard
								bar
								show-drop-down-value
								:drop-down-options="graphicOptions"
								:graphic-options="barGraphicOptions"
								title="Reporte de ventas"
								@show-options="showOptions(2)"
								@change-graphic="changeGraphic"
								@download-excel="downloadExcelSales"
							></graphics-box-dashboard>
						</template>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mt-4>
				<v-layout row wrap>
					<template v-if="isSalesProfit">
						<v-flex
							v-for="(item, index) in topProfit"
							:key="item.id"
							:class="{
								xs5: index === 0,
								xs3: index === 1,
								xs4: index === 2,
								'pr-3': index === 0,
								'pl-2 pr-2': index === 1,
								'pl-3': index === 2,
							}"
						>
							<top-list
								:currency="currencySymbol"
								:top-index="index"
								:top="item"
								@send-whatsapp="sendWhatsapp"
								@download-excel="downLoadExcelBenefit(item)"
							></top-list>
						</v-flex>
					</template>
					<template v-else>
						<v-flex
							v-for="(item, index) in top"
							:key="item.id"
							xs4
							:class="{
								'pr-3': index === 0,
								'pl-2 pr-2': index === 1,
								'pl-3': index === 2,
							}"
						>
							<top-list
								:top-index="index"
								:top="item"
								@on-sort="onSort"
								@send-whatsapp="sendWhatsapp"
								@download-excel="downLoadExcelList(item)"
							></top-list>
						</v-flex>
					</template>
				</v-layout>
			</v-flex>
		</v-layout>
		<action-sidebar
			:title="action.title"
			:value="action.open"
			:width="action.width"
			@close-modal="showSlide(false)"
		>
			<warehouses-slide
				v-if="isActionCode('warehouses')"
				:disabled="disabled"
				:warehouses="warehouses"
				@cancel="showSlide(false)"
				@save-selection="saveSelection"
			></warehouses-slide>
		</action-sidebar>
	</div>
</template>

<script>
import { differenceInDays, format, subDays, subMonths } from 'date-fns';
import actionSidebar from '@/components/shared/action-sidebar';
import graphicsBoxDashboard from '@/components/dashboard-general/graphics-box-dashboard';
import headerFilter from '@/components/dashboard-general/header-filter';
import headerPage from '@/components/shared/header-page';
import statisticsCards from '@/components/dashboard-report/statistics-cards';
import topList from '@/components/dashboard-general/top-list';
import warehousesSlide from '@/components/dashboard-general/warehouses-slide';
import helper from '@/shared/helper';

const isJapiSale = process.env.ADMIN_CODE === 'japisale';
const successColor = isJapiSale ? '#DB952B' : '#B2DD00';
const primaryColor = isJapiSale ? '#004D90' : '#DB952B';

function created() {
	this.loadResources();
}

function changeGraphic() {
	this.saleByHours = !this.saleByHours;
}

function disabled() {
	return this.warehouses.every((w) => !w.isSelected);
}

function isActionCode(code) {
	return this.action.code === code;
}

function isSalesProfit() {
	return this.typeTransaction === 'sales-profit';
}

async function loadData() {
	this.loadingGeneral = true;
	const url = this.isSalesProfit ? 'report-sales-benefits' : 'report-sales-subsidiary';
	const params = {
		...this.filters,
		documentTypesCodes: this.filters.documentTypesCodes.join(',') || undefined,
	};

	if (!this.isSalesProfit) {
		params.flagV2 = true;
	}

	const currencySelected = this.currencies.find((c) => c.code === this.filters.currency);
	const currencySelectedSymbol = currencySelected.symbol;
	this.currencySymbol = currencySelectedSymbol;
	try {
		({ data: this.generalData } = await this.$httpReportSales.post(url, {}, { params }));
		const {
			categories,
			customers,
			paymentState,
			products,
			productsPoint,
			storeCategory = [],
		} = this.generalData;
		this.setStatisticsData(paymentState);
		this.setCategoriesData(categories);
		if (storeCategory.length) {
			this.setLineGraphicData(storeCategory);
		}
		if (this.isSalesProfit) {
			this.setTopData(products, customers, productsPoint);
		} else {
			this.setTopData();
		}
		if (this.filters.warehouseIds) {
			this.setWarehousesData();
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loadingGeneral = false;
	}
}

async function loadResources() {
	try {
		// Ejecutar las promesas en paralelo y esperar a que todas se resuelvan
		const [subsidiariesResponse, currenciesResponse, typeDocumentsResponse] =
			await Promise.all([
				this.subsidiariesList(),
				this.getCurrencies(),
				this.getTypeDocuments('sales'),
			]);

		// Asignar los valores a las variables del componente
		this.subsidiaries = subsidiariesResponse.data;
		this.currencies = currenciesResponse.data;
		this.typeDocuments = typeDocumentsResponse.data.map((t) => t.documentType);

		// Buscar la moneda seleccionada y otros valores
		const currency = this.currencies.find(
			(c) => c.code === this.$userInfo.company.currency
		);
		const defaultSubsidiary = this.subsidiaries[0];
		const transaction = this.typesTransactions.find((t) => t.code === 'sales');
		const periodSelected = this.periodTypes.find((p) => p.code === 'today');

		// Actualizar los valores de los filtros y estadísticas
		this.top[0].columns[2].value = `(${currency.symbol})`;
		this.top[1].columns[2].value = `(${currency.symbol})`;
		this.statistics = this.statistics.map((s) => ({
			...s,
			currency: currency.code,
		}));

		const defaultsCode = ['BOL', 'FAC', 'NTV'];
		const defaultTypeDocument = this.typeDocuments
			.filter((t) => defaultsCode.includes(t.code))
			.map((c) => c.code);
		// Establecer los filtros y el periodo
		this.setPeriod({ model: 'period', value: periodSelected });
		this.setFilter({ model: 'currency', value: currency });
		this.setFilter({ model: 'typeTransaction', value: transaction });
		this.setFilter({ model: 'subsidiaryCode', value: defaultSubsidiary });
		this.setFilter({ model: 'documentTypesCodes', value: defaultTypeDocument });
	} catch (error) {
		console.error('Error al cargar los recursos:', error);
	}
}

async function loadWarehouses() {
	const params = { subsidiaryId: this.subsidiaryId };
	({ data: this.warehouses } = await this.warehousesList(params));
	this.currentWarehousesSelected = [];
	this.resetWarehouses();
}

function resetWarehouses() {
	this.warehouses = this.warehouses.map((w) => {
		const newWarehouse = { ...w };
		if (w.settings) {
			newWarehouse.settings.color = w.settings.color || this.setColorRandom();
		} else {
			newWarehouse.settings = w.settings || { color: this.setColorRandom() };
		}
		newWarehouse.isSelected = false;
		return newWarehouse;
	});
}

function saveSelection() {
	this.currentWarehousesSelected = this.warehouses.filter((w) => w.isSelected);
	const ids = this.currentWarehousesSelected.map((cw) => cw.id);
	this.filters.warehouseIds = ids.join(',');
	this.loadData();
	this.showSlide(false);
}

function sendWhatsapp({ phone }) {
	window.open(
		`https://web.whatsapp.com/send?phone=${this.labelsByCountry.phoneCode}${phone}`,
		'_blank'
	);
}

function setCategoriesData(categoriesData) {
	const percentageTotal = categoriesData.reduce((a, c) => a + c.salesAmount, 0);
	const percentageTotalFixed = percentageTotal.toFixed(2);
	this.circleGraphicOptions.datasets[0].data = categoriesData.map(
		(cd) => (cd.salesAmount * 100) / percentageTotalFixed
	);
	this.circleGraphicOptions.datasets[0].backgroundColor = categoriesData.map(
		(cd) => cd.backgroundColor
	);
	this.circleGraphicOptions.labels = categoriesData.map((cd) => cd.name);
	this.circleGraphicOptions.sections = categoriesData.map((c) => {
		const percentageByCategory = (c.salesAmount * 100) / percentageTotalFixed;
		const fixedPercentage = percentageByCategory.toFixed(2);
		return {
			id: c.id,
			color: c.backgroundColor,
			label: c.name,
			value: Number(fixedPercentage),
			totalBenefits: c.totalBenefits || 0,
		};
	});
}

function setCategoriesScroll() {
	const tag = document.getElementsByClassName('categories-collapse');
	if (tag.length > 0) {
		tag[0].scrollTop = 0;
	}
}

function setColorRandom() {
	let colorRandom = Math.floor(Math.random() * 16777215).toString(16);
	if (colorRandom.length !== 6) {
		colorRandom = setColorRandom();
	}
	return `#${colorRandom}`;
}

function setCurrencySelection(currencyData) {
	this.top[0].columns[2].value = `(${currencyData.symbol})`;
	this.top[1].columns[2].value = `(${currencyData.symbol})`;
	this.statistics[0].currency = currencyData.code;
	this.statistics[1].currency = currencyData.code;
	// this.statistics[2].currency = currencyData.code;
}

function setFilter({ model, value }) {
	if (model === 'typeTransaction') {
		this.setTypeTransaction(value);
		if (this.filters.warehouseIds) {
			this.loadData();
		}
	} else if (model === 'subsidiaryCode') {
		this.filters[model] = value.sucursalCode;
		this.subsidiaryId = value.id;
		this.loadWarehouses();
	} else if (model === 'documentTypesCodes') {
		this.filters[model] = value;
		if (this.filters.warehouseIds) {
			this.loadData();
		}
	} else {
		this.filters[model] =
			model === 'startDate' || model === 'endDate' ? value : value.code;
		if (model === 'currency') {
			this.setCurrencySelection(value);
		}
		this.validLoad(model);
	}
}

function setPeriod({ model, value }) {
	this[model] = value.code;
	this.showRange = this[model] === 'range';
	if (this[model] === 'today') {
		const startDate = this.$today();
		const endDate = this.$today();
		this.setFilter({ model: 'startDate', value: startDate });
		this.setFilter({ model: 'endDate', value: endDate });
	} else if (this[model] === 'yesterday') {
		const startDate = format(subDays(this.$today(), 1), 'YYYY-MM-DD');
		const endDate = format(subDays(this.$today(), 1), 'YYYY-MM-DD');
		this.setFilter({ model: 'startDate', value: startDate });
		this.setFilter({ model: 'endDate', value: endDate });
	} else if (this[model] !== 'range') {
		const endDate =
			this[model] === 'yesterday'
				? format(subDays(this.$today(), 1), 'YYYY-MM-DD')
				: this.$today();
		const startDate =
			this[model] === 'yesterday'
				? format(subDays(this.$today(), 1), 'YYYY-MM-DD')
				: format(subDays(this.$today(), 7), 'YYYY-MM-DD');
		this.setFilter({ model: 'startDate', value: startDate });
		this.setFilter({ model: 'endDate', value: endDate });
	} else {
		const endDate = this.$today();
		const startDate = format(subMonths(this.$today(), 1), 'YYYY-MM-DD');
		this.setFilter({ model: 'startDate', value: startDate });
		this.setFilter({ model: 'endDate', value: endDate });
	}
}

function setLineGraphicData(lineData) {
	if (lineData) {
		const lineDatasets = lineData.reduce((acum, cat) => {
			const newAcum = {};
			if (cat.data) {
				newAcum.data = cat.data.map((d) => ({ x: d.dataX, y: d.dataY }));
			}
			newAcum.borderColor = [cat.color];
			acum.push({ ...newAcum });
			return acum;
		}, []);
		const lineLabels = lineData[0].data.map((d) => d.dataX);
		this.lineGraphicOptions.categories = lineData.map((ld) => ld.name);
		this.lineGraphicOptions.datasets = [...lineDatasets];
		this.lineGraphicOptions.labels = [...lineLabels];
	}
}

function setStatisticsData(statisticsData) {
	this.statistics = this.statistics.map((s) => {
		const newStatistic = { ...s };
		newStatistic.total = statisticsData[s.code] || 0;
		if (this.isSalesProfit && s.items) {
			newStatistic.items = s.items.map((i) => {
				const newItem = { ...i };
				newItem.total = statisticsData[i.code] || 0;
				return newItem;
			});
		}
		return newStatistic;
	});
}

function setTopData(products, customers, productsPoint) {
	const rowsZero = products || this.generalData.employees;
	const rowsTop = this.isSalesProfit ? 'topProfit' : 'top';
	this[rowsTop][0].rows = rowsZero.map((e) => {
		const newEmployee = { ...e };
		if (!products) {
			delete newEmployee.code;
		}
		return newEmployee;
	});
	this[rowsTop][1].rows = this.isSalesProfit ? productsPoint : this.generalData.customers;
	this[rowsTop][2].rows = this.isSalesProfit ? customers : this.generalData.products;
}

function setTypeTransaction(value) {
	this.typeTransaction = value.code;
	if (this.typeTransaction === 'sales' || this.isSalesProfit) {
		this.captionNavigation = this.isSalesProfit
			? 'Mira los beneficios generados'
			: 'Mira tus ventas';
		// if (this.isSalesProfit) {
		// 	this.setFilter({
		// 		model: 'documentTypesCodes',
		// 		value: ['BOL', 'FAC', 'NTV', 'COT'],
		// 	});
		// } else {
		// 	this.setFilter({
		// 		model: 'documentTypesCodes',
		// 		value: ['BOL', 'FAC', 'NTV'],
		// 	});
		// }
	} else if (this.typeTransaction === 'quotations') {
		this.captionNavigation = 'Mira tus cotizaciones';
		// this.setFilter({ model: 'documentTypesCodes', value: ['COT'] });
	} else {
		this.goTo('dashboard-report', { query: { origin: 'dashboard' } });
	}
}

function setWarehousesData() {
	this.barGraphicOptions.data.datasets[0].data = this.currentWarehousesSelected.map(
		(cw) => {
			const storeData = this.generalData.stores.find(
				(store) => Number(cw.id) === Number(store.id)
			);
			const newWarehouse = { ...cw };
			newWarehouse.salesAmount = storeData ? storeData.salesAmount : 0;
			return newWarehouse.salesAmount;
		}
	);
	this.barGraphicOptions.data.datasets[0].backgroundColor =
		this.currentWarehousesSelected.map((cw) => cw.settings.color);
	this.barGraphicOptions.data.labels = this.currentWarehousesSelected.map(
		(cw) => cw.name
	);
}

function setWarehousesSelected() {
	this.warehouses = this.warehouses.map((w) => {
		const currentWarehouse = this.currentWarehousesSelected.find((cw) => cw.id === w.id);
		const newWarehouse = { ...w };
		if (currentWarehouse) {
			newWarehouse.settings = currentWarehouse.settings;
			newWarehouse.isSelected = currentWarehouse.isSelected;
		}
		return newWarehouse;
	});
}

function showAllCategories() {
	this.showMoreActive = !this.showMoreActive;
	this.setCategoriesScroll();
}

function showOptions(optionId) {
	const optionIdx = optionId === 1 ? optionId : optionId - 2;
	this.graphicOptions[optionId - 1].selected = false;
	this.graphicOptions[optionIdx].selected = false;
}

function showSlide(value) {
	this.action.open = value;
	this.action.code = value ? 'warehouses' : '';
	this.action.title = value ? 'SELECCIONAR TIENDAS' : '';
	if (value) {
		this.setWarehousesSelected();
	} else {
		this.resetWarehouses();
	}
}

function validLoad(model) {
	if (this.filters.warehouseIds) {
		if (this.period !== 'range' && model !== 'startDate') {
			this.loadData();
		} else if (this.period === 'range') {
			if (!this.filters.startDate || !this.filters.endDate) {
				this.showNotification(
					'En rango de fechas debes seleccionar una fecha inicial y una fecha final.',
					'warning'
				);
				return;
			}
			const valid = differenceInDays(this.filters.endDate, this.filters.startDate);
			if (valid >= 0 || this.typeTransaction === 'sales-profit') {
				this.loadData();
			} else {
				this.showNotification(
					'La fecha final no debe ser menor a la inicial.',
					'warning'
				);
				this.filters[model] = null;
			}
		}
	}
}

async function downloadExcelCategories() {
	const code = 'xlsx';
	const name = 'Reporte de Categorias';
	const body = {
		code: 'VENTAS_DASHBORD_CATEGORIES',
	};
	const params = { ...this.filters };
	params.documentTypesCodes = params.documentTypesCodes.join(',');
	try {
		const response = await this.$httpReportSales.post('reports-dashboard', body, {
			params,
			responseType: 'blob',
		});
		const blob = helper.generateBlob(
			response.data,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		helper.showDownloadDialog(blob, name, code);
		this.showNotification('El reporte de categorías fue descargado correctamente.');
	} catch (error) {
		this.showGenericError();
	}
}

async function downloadExcelSales() {
	const code = 'xlsx';
	const name = 'Reporte de Ventas';
	const body = {
		code: 'VENTAS_DASHBORD_STORE',
	};
	const params = { ...this.filters, flagV2: true };
	params.documentTypesCodes = params.documentTypesCodes.join(',');
	try {
		const response = await this.$httpReportSales.post('reports-dashboard', body, {
			params,
			responseType: 'blob',
		});
		const blob = helper.generateBlob(
			response.data,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		helper.showDownloadDialog(blob, name, code);
		this.showNotification('El reporte de ventas fue descargado correctamente.');
	} catch (error) {
		this.showGenericError();
	}
}

async function downLoadExcelList(row) {
	const code = 'xlsx';
	const name = `Reporte de ${row.title}`;
	const body = {
		code: row.code,
	};
	const params = { ...this.filters, flagV2: true };
	params.documentTypesCodes = params.documentTypesCodes.join(',');
	try {
		const response = await this.$httpReportSales.post('reports-dashboard', body, {
			params,
			responseType: 'blob',
		});
		const blob = helper.generateBlob(
			response.data,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		helper.showDownloadDialog(blob, name, code);
		this.showNotification(`El reporte de ${row.title} fue descargado correctamente.`);
	} catch (error) {
		this.showGenericError();
	}
}

async function downLoadExcelBenefit(report) {
	const code = 'xlsx';
	const name = `Reporte de ${report.title}`;
	const newReport = { ...report };
	const body = {
		columns: newReport.columns.reduce((acum, pl) => {
			const newAcum = [...acum];
			if (pl.value.length) {
				const newCol = {
					name: pl.value,
					value: pl.value === 'Cod' ? 'code' : pl.name,
				};
				newAcum.push(newCol);
			}
			return newAcum;
		}, []),
		rows: report.rows.map((row) => {
			const newRow = {};
			newRow.code = row.code;
			newRow.name = row.name;
			newRow.phone = row.phone;
			newRow.documentNumber = row.documentNumber;
			newRow.quantity = row.quantity;
			newRow.benefit = row.benefit;
			newRow.benefitsAmount = row.benefitsAmount;
			newRow.salesAmount = row.salesAmount;
			newRow.unitQuantity = row.unitQuantity;
			newRow.benefitsSales = row.benefitsSales;
			newRow.perProfitable = row.perProfitable;
			newRow.costPromd = row.costPromd;
			return newRow;
		}),
		code: 'xlsx',
	};
	if (newReport.title === 'Beneficio por Productos') {
		body.columns.splice(1, 0, { name: 'Nombre', value: 'name' });
	}
	const params = { ...this.filters };
	params.documentTypesCodes = params.documentTypesCodes.join(',');
	try {
		const response = await this.$httpReportSales.post('reports', body, {
			params,
			responseType: 'blob',
		});
		const blob = helper.generateBlob(
			response.data,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		helper.showDownloadDialog(blob, name, code);
		this.showNotification(`El reporte de ${report.title} fue descargado correctamente.`);
	} catch (error) {
		this.showGenericError();
	}
}

async function downloadExcelBenefitCategor() {
	const code = 'xlsx';
	const name = 'Reporte de Beneficio por Categorias';
	const body = {
		columns: this.columnsCategory,
		code: 'xlsx',
		rows: this.generalData.categories.map((row) => {
			const newRow = {};
			newRow.name = row.name;
			newRow.quantity = row.quantity;
			newRow.totalBenefits = row.totalBenefits;
			return newRow;
		}),
	};
	const params = { ...this.filters };
	params.documentTypesCodes = params.documentTypesCodes.join(',');
	try {
		const response = await this.$httpReportSales.post('reports', body, {
			params,
			responseType: 'blob',
		});
		const blob = helper.generateBlob(
			response.data,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		helper.showDownloadDialog(blob, name, code);
		this.showNotification(
			'El reporte de beneficio por categorías fue descargado correctamente.'
		);
	} catch (error) {
		this.showGenericError();
	}
}

async function downloadPointSale() {
	const code = 'xlsx';
	const name = 'Reporte de Beneficio por Punto de venta';
	const body = {
		columns: this.columnsSale,
		code: 'xlsx',
		rows:
			this.generalData && this.generalData.terminalsTop
				? this.generalData.terminalsTop.map((row) => {
						const newRow = {};
						newRow.name = row.name;
						newRow.salesAmount = row.salesAmount;
						newRow.totalBenefits = row.totalBenefits;
						return newRow;
				  })
				: [],
	};
	const params = { ...this.filters };
	params.documentTypesCodes = params.documentTypesCodes.join(',');
	try {
		const response = await this.$httpReportSales.post('reports', body, {
			params,
			responseType: 'blob',
		});
		const blob = helper.generateBlob(
			response.data,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		helper.showDownloadDialog(blob, name, code);
		this.showNotification(
			'El reporte de beneficio por punto de venta fue descargado correctamente.'
		);
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		action: {
			code: '',
			open: false,
			title: '',
			width: 531,
		},
		barGraphicOptions: {
			data: {
				datasets: [
					{
						barPercentage: 0,
						barThickness: 9,
						categoryPercentage: 0,
						maxBarThickness: 9,
						minBarLength: 2,
						data: [],
						backgroundColor: [],
					},
				],
				labels: [],
			},
			options: {
				legend: {
					display: false,
					labels: {
						fontColor: 'red',
					},
				},
			},
		},
		captionNavigation: 'Mira tus ventas',
		circleGraphicOptions: {
			background: 'white',
			datasets: [
				{
					data: [],
					backgroundColor: [],
				},
			],
			labels: [],
			foreground: 'grey',
			hasLegend: false,
			legendPlacement: 'right',
			options: {
				legend: {
					display: false,
				},
			},
			sections: [],
			size: 168,
			startAngle: 0,
			thickness: 10,
			total: 100,
			unit: 'px',
		},
		currencies: [],
		currencySymbol: '',
		currentWarehousesSelected: [],
		columnsSale: [
			{
				name: 'Nombre',
				value: 'name',
			},
			{
				name: 'Total de Venta',
				value: 'salesAmount',
			},
			{
				name: 'Beneficio Total',
				value: 'totalBenefits',
			},
		],
		columnsCategory: [
			{
				name: 'Nombre',
				value: 'name',
			},
			{
				name: 'Cantidad',
				value: 'quantity',
			},
			{
				name: 'Benefecio Total',
				value: 'totalBenefits',
			},
		],
		filters: {
			currency: null,
			endDate: null,
			startDate: null,
			subsidiaryCode: null,
			warehouseIds: null,
			documentTypesCodes: [],
		},
		loadingGeneral: false,
		generalData: {},
		graphicOptions: [
			{
				id: 1,
				name: 'Reporte de ventas',
				selected: true,
			},
			{
				id: 2,
				name: 'Ventas por horas',
				selected: true,
			},
		],
		lineGraphicOptions: {
			categories: [],
			datasets: [
				{
					data: [],
					backgroundColor: [],
				},
			],
			labels: [],
			legendPosition: 'top',
			options: {
				legend: {
					display: false,
				},
			},
			series: [],
			title: '',
			tooltipTemplate: '#= series.name #: S/.#= value #',
			tooltipVisible: true,
			valueAxis: [
				{
					max: 1000,
					min: 100,
					labels: {
						format: 'S/.{00}',
					},
				},
			],
		},
		period: null,
		periodTypes: [
			{
				id: 1,
				code: 'today',
				name: 'Hoy',
			},
			{
				id: 2,
				code: 'yesterday',
				name: 'Ayer',
			},
			{
				id: 3,
				code: 'lastweek',
				name: 'Última semana',
			},
			{
				id: 4,
				code: 'range',
				name: 'Rango de fechas',
			},
		],
		saleByHours: false,
		showMoreActive: false,
		showRange: false,
		statistics: [
			{
				id: 1,
				background: successColor,
				code: 'total',
				color: 'white',
				currency: '',
				title: 'Ventas',
				titleColor: 'white',
				total: 0,
				urlImage: '/static/img/icon-cards-1.svg',
				icon: 'trending_up',
				items: [
					{
						id: 1,
						code: 'totalBenefits',
						color: primaryColor,
						title: 'Beneficio Total',
						total: 0,
					},
					{
						id: 2,
						code: 'total',
						color: primaryColor,
						title: 'Venta Total',
						total: 0,
					},
					// {
					// 	id: 3,
					// 	code: 'totalIgv',
					// 	color: primaryColor,
					// 	title: 'Imp. de Venta',
					// 	total: 0,
					// },
					{
						id: 3,
						code: 'costsTotal',
						color: primaryColor,
						title: 'Costo Total (Con IGV)',
						total: 0,
					},
				],
			},
			// {
			// 	id: 2,
			// 	background: '#ddc219',
			// 	code: 'canceled',
			// 	color: '#ffffff',
			// 	currency: '',
			// 	title: 'Ventas Anulados',
			// 	titleColor: '#ffffff',
			// 	total: 0,
			// 	urlImage: '/static/img/icon-cards-2.svg',
			// },
			{
				id: 2,
				background: primaryColor,
				code: 'salAverageTicket',
				color: '#ffffff',
				currency: '',
				title: 'Promedio ticket',
				titleColor: '#ffffff',
				total: 0,
				urlImage: '/static/img/icon-cards-3.svg',
			},
		],
		subsidiaryId: null,
		subsidiaries: [],
		typeDocuments: [],
		top: [
			{
				id: 1,
				columns: [
					{
						id: 1,
						class: 'xs1 text-xs-right',
						name: '',
						value: '',
					},
					{
						id: 2,
						class: 'xs6 pl-2',
						name: 'name',
						value: 'Nombre',
					},
					{
						id: 3,
						amount: true,
						class: 'xs5 text-xs-center',
						name: 'salesAmount',
						value: '(S/)',
					},
				],
				rows: [],
				title: 'Top Vendedores',
				code: 'VENTAS_DASHBORD_EMPLOYEES',
			},
			{
				id: 2,
				columns: [
					{
						id: 1,
						class: 'xs1 text-xs-right',
						name: '',
						value: '',
					},
					{
						id: 2,
						class: 'xs5 pl-2',
						name: 'name',
						value: 'Nombre',
					},
					{
						id: 3,
						amount: true,
						class: 'xs3 text-xs-center',
						name: 'salesAmount',
						value: '(S/)',
					},
					{
						id: 4,
						class: 'xs3 text-xs-center',
						name: 'phone',
						value: 'Whatsapp',
					},
				],
				rows: [],
				title: 'Top Clientes',
				code: 'VENTAS_DASHBORD_CUSTOMERS',
			},
			{
				id: 3,
				columns: [
					{
						id: 1,
						class: 'xs1 text-xs-right',
						name: '',
						value: '',
					},
					{
						id: 2,
						class: 'xs3',
						name: 'name',
						value: 'Código y nombre',
					},
					{
						id: 3,
						class: 'xs3 text-xs-center',
						name: 'quantity',
						value: 'Cantidad Vendida',
						showSort: true,
						icon: 'arrow_drop_down',
					},
					{
						id: 4,
						class: 'xs2 text-xs-center',
						name: 'unitQuantity',
						value: 'Cant. Unidad',
						showSort: true,
						icon: 'arrow_drop_down',
					},
					{
						id: 5,
						class: 'xs3 text-xs-center',
						name: 'units',
						value: 'Presentaciones',
					},
				],
				rows: [],
				title: 'Top Productos',
				code: 'VENTAS_DASHBORD_PRODUCTS',
			},
		],
		topProfit: [
			{
				id: 1,
				columns: [
					{
						id: 1,
						class: 'xs1 text-xs-right',
						name: '',
						value: '',
					},
					{
						id: 2,
						class: 'xs2 pl-2',
						name: 'name',
						value: 'Cod',
					},
					{
						id: 3,
						amount: true,
						class: 'xs2 text-xs-center',
						name: 'salesAmount',
						value: 'T. venta',
					},
					{
						id: 4,
						class: 'xs1 text-xs-center',
						name: 'quantity',
						value: 'Cant.',
					},
					{
						id: 5,
						amount: true,
						class: 'xs2 text-xs-center',
						name: 'benefit',
						value: 'Bef.',
					},
					{
						id: 6,
						class: 'xs1 text-xs-center',
						name: 'perProfitable',
						value: 'Rent.',
					},
					{
						id: 7,
						class: 'xs2 text-xs-center',
						amount: true,
						value: 'Cost. Prom.',
						name: 'costPromd',
					},
				],
				rows: [],
				title: 'Beneficio por Productos',
			},
			{
				id: 2,
				columns: [
					{
						id: 1,
						class: 'xs1 text-xs-right',
						name: '',
						value: '',
					},
					{
						id: 2,
						class: 'xs4 pl-2',
						name: 'name',
						value: 'Cod',
					},
					{
						id: 3,
						amount: true,
						class: 'xs3 text-xs-center',
						name: 'price',
						value: 'Precios',
					},
					{
						id: 4,
						class: 'xs2 text-xs-center',
						name: 'quantity',
						value: 'Cant.',
					},
					{
						id: 5,
						amount: true,
						class: 'xs2 text-xs-center',
						name: 'benefitsSales',
						value: 'Bef.',
					},
				],
				rows: [],
				title: 'Canje de Producto',
			},
			{
				id: 3,
				columns: [
					{
						id: 1,
						class: 'xs1 text-xs-right',
						name: '',
						value: '',
					},
					{
						id: 2,
						class: 'xs2 pl-2',
						name: 'name',
						value: 'Nomb.',
					},
					{
						id: 3,
						class: 'xs2 text-xs-center',
						name: 'phone',
						value: 'Teléf.',
					},
					{
						id: 4,
						class: 'xs4 text-xs-center',
						name: 'documentNumber',
						value: 'Nro. Documento',
					},
					{
						id: 5,
						class: 'xs1 text-xs-center',
						name: 'quantity',
						value: 'Cant.',
					},
					{
						id: 6,
						amount: true,
						class: 'xs2 text-xs-center',
						name: 'benefitsAmount',
						value: 'Bef.',
					},
				],
				rows: [],
				title: 'Beneficio por clientes',
			},
		],
		typeTransaction: null,
		typesTransactions: [
			{
				id: 1,
				name: 'Ventas',
				code: 'sales',
			},
			{
				id: 2,
				name: 'Pedidos',
				code: 'orders',
			},
			{
				id: 3,
				name: 'Cotizaciones',
				code: 'quotations',
			},
			{
				id: 4,
				name: 'Benef. de Venta por Categoría',
				code: 'sales-profit',
			},
		],
		warehouses: [],
	};
}

export default {
	name: 'dashboard-general',
	components: {
		actionSidebar,
		graphicsBoxDashboard,
		headerFilter,
		headerPage,
		statisticsCards,
		topList,
		warehousesSlide,
	},
	computed: {
		disabled,
		isSalesProfit,
	},
	created,
	data,
	methods: {
		changeGraphic,
		isActionCode,
		downloadExcelSales,
		downLoadExcelBenefit,
		downloadExcelBenefitCategor,
		downloadExcelCategories,
		downLoadExcelList,
		downloadPointSale,
		loadData,
		loadResources,
		loadWarehouses,
		resetWarehouses,
		saveSelection,
		sendWhatsapp,
		setCategoriesData,
		setCategoriesScroll,
		setColorRandom,
		setCurrencySelection,
		setFilter,
		setPeriod,
		setLineGraphicData,
		setStatisticsData,
		setTopData,
		setTypeTransaction,
		setWarehousesData,
		setWarehousesSelected,
		showAllCategories,
		showOptions,
		showSlide,
		validLoad,
		onSort(top, index) {
			const column = this.top[2].columns[index];
			const isAsc = column.icon === 'arrow_drop_up';

			const key = index === 2 ? 'quantity' : 'unitQuantity';

			this.top[2].rows = [...top.rows].sort((a, b) =>
				isAsc ? b[key] - a[key] : a[key] - b[key]
			);

			column.icon = isAsc ? 'arrow_drop_down' : 'arrow_drop_up';
		},
	},
};
</script>

<style lang="scss" scoped>
.btn-dashboard-general {
	height: 40px !important;

	&-text {
		font-family: font(open-bold);
		font-size: size(medium);
		text-transform: none !important;
	}

	&.btn-dashboard-mini {
		border-radius: 100%;
		height: 37px !important;
		width: 38px !important;

		.btn-dashboard-general-text {
			font-size: size(large27);
			height: 27px;
			line-height: 1;
		}
	}
}

.warehouse-chip {
	border-radius: 10.5px !important;
	color: color(white) !important;
	font-family: font(open-regular) !important;
	font-size: size(small) !important;
	height: 20px !important;
}
</style>
