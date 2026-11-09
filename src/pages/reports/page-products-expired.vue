<template>
	<div>
		<header-page
			:show-excel="false"
			:title="$route.meta.title"
			name="products-expired"
			to-show
			@clean-product-filter="cleanFilter"
		/>
		<v-flex pt-3 px-2>
			<general-filter class="layout wrap align-center">
				<v-flex xs12 md4 px-2>
					<app-select
						label="Reporte"
						item-text="name"
						item-value="code"
						model="selectReport"
						:items="reports"
						:item="selectReport"
						@input="setReport"
					/>
				</v-flex>
				<v-flex
					xs12
					md4
					px-2
					v-if="
						selectReport === 'product-expired' ||
						selectReport === 'warehouse-total-cost-products'
					"
				>
					<products-search-input :search-value="selectedProduct" @search="openSearch" />
				</v-flex>
				<v-flex
					xs12
					md2
					px-2
					v-if="subsidiaries.length > 0 && selectReport !== 'sale-points-pdf'"
				>
					<label class="caption">Empresa</label>
					<v-select
						:items="subsidiaries"
						v-model="subsidiaryId"
						class="filter-select shadow-inset"
						item-value="id"
						item-text="rzSocial"
						@input="setSubsidiary"
					>
					</v-select>
				</v-flex>
				<v-flex xs12 md2 px-2 v-if="selectReport === 'sale-points-pdf'">
					<app-select
						:item="params.comEmployeeId"
						item-text="fullname"
						item-value="id"
						:items="employees"
						label="Empleado"
						model="comEmployeeId"
						:return-object="false"
						@input="setParams"
						show-autocomplete
					></app-select>
				</v-flex>
				<v-flex xs12 md2 px-2>
					<app-select
						chips
						:disabled="!subsidiaryId && selectReport !== 'sale-points-pdf'"
						:item="selectReport === 'sale-points-pdf' ? params.warehouseId : warehouseIds"
						item-text="name"
						model="warehouseId"
						item-value="id"
						:items="warehouses"
						:multiple="selectReport !== 'sale-points-pdf'"
						:label="labelWarehouse()"
						:return-object="false"
						@input="setParams"
					/>
				</v-flex>
				<v-flex xs12 md2 px-2 v-if="showBrands">
					<app-select
						:item="params.brandId"
						item-text="name"
						item-value="id"
						:items="brands"
						label="Marca"
						model="brandId"
						:return-object="false"
						@input="setParams"
					/>
				</v-flex>
				<v-flex xs12 md2 px-2 v-if="showDates">
					<app-date-select
						label="Fecha de inicio"
						:date-formatted="params.startDate"
						model="startDate"
						@input="setDate"
					/>
				</v-flex>
				<v-flex xs12 md2 px-2 v-if="showDates">
					<app-date-select
						:date-formatted="params.endDate"
						label="Fecha de fin"
						:min-date="params.startDate"
						model="endDate"
						@input="setDate"
					/>
				</v-flex>
				<v-flex xs12 sm2 md2 px-2 pt-3 v-if="selectReport !== 'sale-points-pdf'">
					<v-btn
						:disabled="isLoading"
						:loading="isLoading"
						color="primary"
						block
						@click="downloadReportExcel"
					>
						<img src="/static/img/excel.svg" alt="download" height="20" />
					</v-btn>
				</v-flex>
				<v-flex xs12 sm2 md2 px-2 pt-3 v-else>
					<v-btn
						:disabled="isLoading"
						:loading="isLoading"
						color="primary"
						block
						@click="downloadReport"
					>
						<v-icon> cloud_download </v-icon>
					</v-btn>
				</v-flex>
			</general-filter>
			<div ref="viewer" id="result" class="hidden-sm-and-down"></div>
		</v-flex>
		<action-sidebar
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			:help-actions="actionsToHelp"
			:active="action.active"
		>
			<products-search-form
				not-valid-negative-stock
				:show-filter="false"
				:search-value="searchVal"
				v-if="action.code === 'product-searcher'"
				@add-product="setProduct"
				text="Seleccionar"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appDateSelect from '@/components/shared/app-date-select';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import format from 'date-fns/format';
import subDays from 'date-fns/sub_days';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import helper from '../../shared/helper';

async function created() {
	this.selectReport = this.reports[0].code;
	const requests = [
		this.brandsList(),
		this.subsidiariesList(),
		this.warehousesList(),
		this.globalEmployees(),
	];
	[
		{ data: this.brands },
		{ data: this.subsidiaries },
		{ data: this.warehouses },
		{ data: this.employees },
	] = await Promise.all(requests);
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	if (this.subsidiaries.length === 1) {
		this.subsidiaryId = this.subsidiaries[0].id;
	}
	if (this.warehouses.length === 1) {
		this.warehouseIds = this.warehouses.map((t) => t.id);
	}
}

function setDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function setParams({ model, value }) {
	if (typeof value === 'object') {
		const selectAllSelected = value.includes(0);
		if (selectAllSelected) {
			this.warehouseIds =
				this.warehouseIds.length === this.warehouses.length - 1
					? []
					: this.warehouses.map((w) => w.id).filter((id) => id !== 0);
		} else {
			this.warehouseIds = [...value];
		}
	} else {
		this.params[model] = value;
	}
}

async function downloadReportExcel() {
	if (this.params.productId || this.subsidiaryId) {
		try {
			const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
			const { name, lastname } = this.$userInfo;
			let nameFix = '';
			if (this.selectReport === 'product-expired') {
				nameFix = 'reporte_productos_vencer';
			} else if (this.selectReport === 'stock-products') {
				nameFix = 'reporte_stock_minimo_productos';
			} else if (this.selectReport === 'warehouse-total-cost-products') {
				nameFix = 'reporte_costo_total_productos';
			} else {
				nameFix = 'reporte_costo_general';
			}
			this.isLoading = true;
			let url = '';
			if (this.selectReport === 'product-expired') {
				url = 'documents/product-by-expiration-date';
			} else if (this.selectReport === 'stock-products') {
				url = 'documents/products-to-minimum-stock';
			} else if (this.selectReport === 'warehouse-total-cost-products') {
				url = 'documents/warehouse-total-cost-products';
			} else {
				url = 'documents/list-cost-general';
			}
			const body = {
				filename: `${nameFix} ${now}`,
				extension: 'xlsx',
				comment: `${nameFix} generado por ${name} ${lastname}`,
				params: {
					startDate: this.params.startDate || undefined,
					endDate: this.params.endDate || undefined,
					comSubsidiaryId: this.subsidiaryId || undefined,
					warehouseIds: this.warehouseIds.length
						? this.warehouseIds.join(',')
						: undefined,
					brandIds: this.params.brandId ? String(this.params.brandId) : undefined,
					flagActive: 1,
				}, 
			};
			if (this.params.productId !== null) {
				body.params.productId = this.params.productId;
			}
			await this.$httpReports.post(url, body);
			this.notificationReport();
		} catch (err) {
			if (err.status === 400) {
				if (err.data.message === 'NOT_FOUND_REPORT') {
					this.showNotification('Se debe configrar el reporte.', 'error');
				}
			} else if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.isLoading = false;
		}
	} else {
		this.showNotification('Selecciona una empresa', 'warning');
	}
}

function openSearch(value) {
	this.searchVal = value ? value.trim() : '';
	this.action.code = 'product-searcher';
	this.action.title = 'Productos';
	this.action.width = 739;
	this.action.open = true;
}

function setProduct(prod) {
	const { id, name } = prod.product;
	this.params.productId = id;
	this.selectedProduct = name;
	this.closeModal();
}

function closeModal() {
	this.action.open = false;
	this.action.code = '';
	this.action.title = '';
	this.searchVal = null;
	this.action.open = false;
	this.action.width = 0;
}

function setSubsidiary(value) {
	this.params.subsidiaryId = value;
	this.loadWarehouses(value);
}

async function loadWarehouses(subsidiaryId) {
	const params = {
		subsidiaryId,
	};
	try {
		const { data: response } = await this.$httpProducts.get('warehouses', {
			params,
		});
		this.warehouses = response;
		if (this.warehouses.length === 1) {
			this.warehouseIds = this.warehouses.map((t) => t.id);
		}
		this.warehouses.unshift({ id: 0, name: 'Seleccionar todos' });
	} catch (error) {
		this.showGenericError();
	}
}

function cleanFilter() {
	this.selectReport = this.reports[0].code;
	this.showDates =
		this.selectReport === 'product-expired' ||
		this.selectReport === 'warehouse-total-cost-products' ||
		this.selectReport === 'sale-points-pdf';
	this.showBrands = this.selectReport === 'list-cost-general';
	this.cleanParams();
}

function setReport({ model, value }) {
	this[model] = value.code;
	this.showDates =
		value.code === 'product-expired' ||
		value.code === 'warehouse-total-cost-products' ||
		value.code === 'sale-points-pdf';
	this.showBrands = value.code === 'list-cost-general';
	this.cleanParams();
}

function data() {
	return {
		action: {
			active: false,
			code: '',
			open: false,
			width: 0,
			title: '',
		},
		isLoading: false,
		subsidiaries: [],
		employees: [],
		params: {
			startDate: null,
			endDate: null,
			productId: null,
			comEmployeeId: null,
			warehouseId: null,
			brandId: null,
		},
		reports: [
			{
				id: 1,
				name: 'Reporte Productos a Vencer',
				code: 'product-expired',
			},
			{
				id: 2,
				name: 'Reporte Stock Minimo de Productos',
				code: 'stock-products',
			},
			{
				id: 3,
				name: 'Reporte Costo General',
				code: 'list-cost-general',
			},
			{
				id: 3,
				name: 'Reporte Costo Total de Productos por Almacén',
				code: 'warehouse-total-cost-products',
			},
			{
				id: 4,
				name: 'Reporte Puntos Canjeados',
				code: 'sale-points-pdf',
				url: 'sale-documents-points/pdf',
			},
		],
		searchVal: null,
		selectedProduct: '',
		selectReport: null,
		subsidiaryId: null,
		warehouses: [],
		warehouseIds: [],
		warehousesFiltered: [],
		brands: [],
		showBrands: false,
		showDates: true,
	};
}

export default {
	name: 'page-products-expired',
	created,
	data,
	components: {
		actionSidebar,
		appDateSelect,
		headerPage,
		generalFilter,
		productsSearchInput,
		productsSearchForm,
	},
	methods: {
		cleanFilter,
		closeModal,
		downloadReportExcel,
		loadWarehouses,
		setParams,
		openSearch,
		setDate,
		setProduct,
		setReport,
		setSubsidiary,
		async downloadReport() {
			const report = this.reports.find((d) => d.code === this.selectReport);
			const { code, url, name } = report;
			try {
				this.isLoading = true;
				const body = {
					code,
				};
				const { data: blobData } = await this.$httpSales.post(url, body, {
					params: this.params,
					responseType: 'blob',
				});
				const blob = helper.generateBlob(blobData);
				helper.showDownloadDialog(blob, name, 'pdf');
				this.notificationReport();
			} catch (err) {
				this.showGenericError();
			} finally {
				this.isLoading = false;
			}
		},
		cleanParams() {
			this.selectedProduct = null;
			this.params.productId = null;
			this.params.comEmployeeId = null;
			this.params.warehouseId = null;
			this.subsidiaryId = this.subsidiaries.length === 1 ? this.subsidiaries[0].id : null;
			this.warehouseIds =
				this.warehouses.length === 1
					? (this.warehouseIds = this.warehouses.map((t) => t.id))
					: [];
			if (this.showDates) {
				this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
				this.params.endDate = this.$today();
			} else {
				this.params.startDate = null;
				this.params.endDate = null;
			}
		},
	},
};
</script>
