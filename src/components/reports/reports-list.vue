<template>
	<section>
		<header-page
			:title="$route.meta.title"
		/>
		<general-filter class="layout wrap align-center">
			<v-flex xs12 md2 px-2>
				<label class="caption">Reporte</label>
				<v-select
					:items="reports"
					v-model="selectedReport"
					class="filter-select shadow-inset"
					item-text="name"
					@input="changeSelect($event)"
				>
				</v-select>
			</v-flex>
			<v-flex v-if="showSubsidiary" xs12 md2 px-2>
				<label class="caption">{{labelSucursal()}}</label>
				<v-select
					:items="subsidiaries"
					v-model="subsidiaryId"
					class="filter-select shadow-inset"
					item-value="id"
					item-text="rzSocial"
				>
				</v-select>
			</v-flex>
			<v-flex
				v-if="showWarehouseMultiple"
				xs12 md4 px-2
			>
				<app-select
					chips
					:item="warehouseId"
					item-text="name"
					item-value="id"
					:items="warehousesFiltered"
					:label="labelWarehouse()"
					multiple
					:return-object="false"
					@input="getWarehouse"
				/>
			</v-flex>
			<v-flex
				v-if="showWarehouseMultiple"
				xs12 md3 px-2
			>
				<app-select
					chips
					:item="categoryIds"
					item-text="name"
					item-value="id"
					:items="categories"
					label="Categoría"
					multiple
					:return-object="false"
					@input="getCategory"
				/>
			</v-flex>
			<v-flex v-if="showWarehouse" xs12 md2 px-2>
				<label class="caption">{{labelWarehouse()}}</label>
				<v-select
					:items="warehouses"
					v-model="warehouseId"
					class="filter-select shadow-inset"
					item-value="id"
					item-text="name"
				>
				</v-select>
			</v-flex>
			<v-flex
				v-if="showWarehouseCategory"
				xs12 md4 px-2
			>
				<app-select
					chips
					:item="warehouseIds"
					item-text="name"
					item-value="id"
					:items="warehouses"
					:label="labelWarehouse()"
					multiple
					:return-object="false"
					@input="getWarehouseIds"
				/>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<app-date-mask
					:time="false"
					label="Fecha inicial"
					:picker="dateWithOutFormat"
					@format-date="onDate($event, 'startDate')"
					@input="setDate($event, 'dateWithOutFormat')"
				/>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<app-date-mask
					:time="false"
					label="Fecha final"
					:picker="dateWithOutFormatEnd"
					@format-date="onDate($event, 'endDate')"
					@input="setDate($event, 'dateWithOutFormatEnd')"
				/>
			</v-flex>
			<v-flex
				v-if="!showSubsidiary && !showWarehouseCategory"
				xs12 sm2 md1 px-2 pt-3
				hidden-sm-and-down>
				<v-btn
					@click="downloadReport('preview')"
					:disabled="isLoading"
					:loading="isLoading"
					color="primary"
					block
				>
					<v-icon>
						image_search
					</v-icon>
				</v-btn>
			</v-flex>
			<v-flex xs12 sm2 md1 px-2 pt-3>
				<v-btn
					@click="downloadReport('download')"
					:disabled="isLoading"
					:loading="isLoading"
					color="success"
					block
				>
					<v-icon>
						cloud_download
					</v-icon>
				</v-btn>
			</v-flex>
		</general-filter>
		<div ref="viewer" id="result" class="hidden-sm-and-down">
		</div>
	</section>
</template>

<script>

import format from 'date-fns/format';
import subDays from 'date-fns/sub_days';
import es from 'date-fns/locale/es';
import generalFilter from '../shared/general-filter';
import headerPage from './../shared/header-page';
import helper from '../../shared/helper';

function data() {
	return {
		categories: [],
		categoryIds: [],
		dateWithOutFormat: null,
		dateWithOutFormatEnd: null,
		endDate: this.$today(),
		isLoading: false,
		menuEnd: false,
		menuStart: false,
		selectedReport: null,
		subsidiaries: [],
		subsidiaryId: null,
		reportId: null,
		reports: [
			{
				id: 1,
				fileName: 'arqueo-caja',
				name: 'Arqueo de Caja',
				url: 'customers-sales-report',
				post: {
					code: 'arqueoCaja',
					date: format(subDays(this.$today(), 30), 'dddd, D [de] MMMM', { locale: es }),
				},
			},
			{
				id: 2,
				name: 'Vendidos por categoría',
				fileName: 'vendidos-categoria',
				url: 'sales-category-product',
				post: {
					code: 'articulosVendidos',
				},
			},
			{
				id: 3,
				name: 'Beneficio de Venta',
				fileName: 'beneficio-venta',
				url: 'customers-benefit',
				post: {
					code: 'beneficioVenta',
				},
			},
			{
				id: 4,
				name: 'Ventas con Stock',
				fileName: 'ventas-por-stock',
				url: 'report-sales-warehouses',
				extension: 'xlsx',
				post: {
					code: 'ventas-por-stock',
					subsidiaryId: null,
				},
			},
			{
				id: 5,
				name: 'Vendidos por categorías y tiendas',
				fileName: 'vendidos-por-categorías',
				url: 'report-category-warehouses',
				extension: 'xlsx',
				post: {
					code: 'xlsx',
				},
			},
		],
		startDate: null,
		warehouseId: null,
		warehouses: [],
		warehousesFiltered: [],
		warehouseIds: [],
	};
}

async function created() {
	const requests = [
		this.subsidiariesList(),
		this.warehousesList(),
		this.categoriesList(),
	];
	[
		{ data: this.subsidiaries },
		{ data: this.warehouses },
		{ data: this.categories },
	] = await Promise.all(requests);
	this.subsidiaryId = this.subsidiaries[0].id;
	this.categoryIds = [this.categories[0].id];
	this.selectedReport = this.reports[0];
	this.warehouseIds = [this.warehouses[0].id];
	this.warehouseId = this.selectedReport && this.selectedReport.fileName === 'ventas-por-stock' ?
		[this.warehouses[0].id] : this.warehouses[0].id;
	this.warehousesFiltered = this.warehouses.filter(w => w.subsidiaryId === this.subsidiaryId);
	const dateFormat = format(subDays(this.$today(), 30), 'DD/MM/YYYY');
	const dateFormatEnd = format(this.$today(), 'DD/MM/YYYY');
	this.onDate(this.endDate, 'endDate');
	this.onDate(format(subDays(this.endDate, 30), 'YYYY-MM-DD'), 'startDate');
	this.setDate(dateFormat, 'dateWithOutFormat');
	this.setDate(dateFormatEnd, 'dateWithOutFormatEnd');
}

async function downloadReport(type) {
	try {
		this.isLoading = true;
		const params = { responseType: 'blob', params: { startDate: this.startDate, endDate: this.endDate } };
		const { fileName, post, url, extension } = this.selectedReport;
		const name = `${fileName}-${this.startDate}-${this.endDate}`;
		if (this.showSubsidiary) {
			post.subsidiaryId = this.subsidiaryId;
			if (this.showWarehouseMultiple) {
				post.warehouseIds = this.warehouseId;
				post.categoryIds = this.categoryIds;
			}
		} else if (this.showWarehouse) {
			params.params.warehouseId = this.warehouseId;
		} else if (this.showWarehouseCategory) {
			post.warehouseIds = this.warehouseIds.length ? this.warehouseIds : null;
			post.categoryIds = null;
		}
		const { data: blobData } = await this.$httpReportSales.post(url, post, params);
		const blob = helper.generateBlob(blobData);
		if (type === 'preview') {
			const urlObject = URL.createObjectURL(blob);
			const iFrame = document.createElement('iframe');
			iFrame.setAttribute('src', urlObject);
			iFrame.setAttribute('style', 'height:100vh;width:100%');
			const childNodes = this.$refs.viewer.childNodes;
			if (childNodes.length > 0) {
				this.$refs.viewer.removeChild(this.$refs.viewer.childNodes[0]);
			}
			this.$refs.viewer.append(iFrame);
		} else if (this.showWarehouseCategory || this.reportId === 4) {
			const blobResponse = helper.generateBlob(blobData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			helper.showDownloadDialog(blobResponse, 'report-category-warehouses', 'xlsx');
		} else {
			helper.showDownloadDialog(blob, name, extension || 'pdf');
		}
		// this.$ga.event({
		// 	eventCategory: 'Reporte',
		// 	eventAction: type,
		// 	eventValue: post.code,
		// });
	} catch (error) {
		if (error.status === 400) {
			this.showNotification('Su compañía no cuenta con este reporte', 'primary');
		} else {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}

function getCategory({ value }) {
	this.categoryIds = [...value];
}

function getWarehouse({ value }) {
	this.warehouseId = [...value];
}

function onDate(value, model) {
	this[model] = value;
}

function selectedReport(value) {
	this.warehouseId = value && value.fileName === 'ventas-por-stock' ? [this.warehouses[0].id] :
		this.warehouses[0].id;
}

function setDate(input, model) {
	this[model] = input;
}

function showSubsidiary() {
	return this.selectedReport && this.selectedReport.url === 'report-sales-warehouses';
}

function showWarehouse() {
	return this.selectedReport && this.selectedReport.url === 'sales-category-product';
}

function showWarehouseMultiple() {
	return this.selectedReport && this.selectedReport.fileName === 'ventas-por-stock';
}

function showWarehouseCategory() {
	return this.selectedReport && this.selectedReport.fileName === 'vendidos-por-categorías';
}

function getWarehouseIds({ value }) {
	this.warehouseIds = [...value];
}

function changeSelect(select) {
	const number = select.fileName === 'vendidos-por-categorías' ? 7 : 30;
	const dateFormat = format(subDays(this.$today(), number), 'DD/MM/YYYY');
	this.reportId = select.id;
	this.onDate(format(subDays(this.endDate, number), 'YYYY-MM-DD'), 'startDate');
	this.setDate(dateFormat, 'dateWithOutFormat');
}

export default {
	name: 'report-list',
	components: {
		headerPage,
		generalFilter,
	},
	computed: {
		showSubsidiary,
		showWarehouse,
		showWarehouseMultiple,
		showWarehouseCategory,
	},
	created,
	data,
	methods: {
		downloadReport,
		getCategory,
		getWarehouse,
		onDate,
		setDate,
		getWarehouseIds,
		changeSelect,
	},
	watch: {
		selectedReport,
	},
};
</script>
