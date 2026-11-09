<template>
	<div>
		<header-page
			name="control-series"
			:title="$route.meta.title"
			@clean-product-filter="clearFilter"
			to-show
			export-to-pdf
			show-excel
			:emit-excel="true"
			@emit-excel="emitExcel"
			@download-dispatch="downloadPdf"
		></header-page>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			:value-disabled="actionsDisabled"
		/>
		<general-filter>
			<v-layout>
				<v-flex xs12 sm4 md4 pr-2 class="align-col">
					<products-search-input :search-value="newProduct" @search="openSearch" />
				</v-flex>
				<v-flex xs12 sm3 md2 pr-2 class="align-col">
					<span class="ml-1 warehouse">Almacen de origen</span>
					<v-select
						v-model="warehouse"
						:items="warehouses"
						label="Almacen de origen"
						single-line
						item-text="name"
						item-value="id"
						return-object
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
						v-on:input="filterRows($event, 'warehouse')"
					>
					</v-select>
				</v-flex>
				<v-flex xs12 sm3 md2 pr-2 pt-4 class="align-col">
					<categories-autocomplete
						:is-multiple="true"
						multiple
						:label="`Categoría`"
						:item="category"
						:items="categories"
						item-text="name"
						:slot-custom="true"
						item-value="id"
						@return-data="filterRows($event, 'category')"
					></categories-autocomplete>
				</v-flex>
				<v-flex xs12 sm3 md2 pr-2 pt-4 class="align-col">
					<v-select
						v-model="state"
						label="Estado"
						:items="status"
						single-line
						item-text="name"
						item-value="id"
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
						v-on:input="filterRows($event, 'status')"
					>
					</v-select>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="text-xs-left mb-2 ml-4">
			<div class="value-container">
				<div class="label-container">
					<label class="label-detail secondary--text caption">Total de series:</label>
				</div>
				<p class="value-detail caption">
					<strong>{{ totalItems }}</strong>
				</p>
			</div>
		</div>
		<div class="overflow-auto">
			<app-table
				name="inventories-list-master"
				:columns="columns"
				selectable
				:rows="data"
				:current-page="currentPage"
				:last-page="lastPage"
				:items-quantity="totalItemsVisible"
				:items-total-quantity="totalItems"
				:check-all="checkAll"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
				@on-page="changePage"
				@on-search-event="searchSeries"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">
						{{ getValueByProp(props.row.product, 'code') }}
					</td>
					<td v-show="showRow(columns, 2)">
						{{ getValueByProp(props.row.product) }}
					</td>
					<td v-show="showRow(columns, 3)">
						{{ getValueByProp(props.row.warehouse) }}
					</td>
					<td v-show="showRow(columns, 4)">{{ props.row.serie }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.comments || '-' }}</td>
					<td v-show="showRow(columns, 6)">
						{{ props.row.observation || '-' }}
					</td>
					<td v-show="showRow(columns, 7)">
						{{ props.row.unit ? props.row.unit.name : '-' }}
					</td>
					<td v-show="showRow(columns, 8)">{{ props.row.quantity }}</td>
					<td v-show="showRow(columns, 9)">
						{{ props.row.statusDispatch.name }}
					</td>
					<td v-show="showRow(columns, 10)">
						<a @click="preGoTo(props.row)">
							{{ props.row.reference }}
						</a>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<transfer-series
				v-if="action.code === 'TS'"
				:data="dataSelected"
				:warehouse-id="params.warehousesId"
				:name-warehouse="nameWarehouseSelect"
				@close-modal="closeModal"
				@update-transfer="updateTransfer"
			/>
			<edit-serie
				v-if="action.code === 'ES'"
				@close-modal="closeModal"
				:id="idEdit"
				@update-serie="updateSerie"
			/>
			<products-search-form
				:search-value="searchVal"
				v-if="action.code === 'product-searcher'"
				@add-product="setProduct"
				text="Buscar"
			/>
			<!-- <add-series
				v-if="action.code === 'add-serie'"
				:data="productSelected"
				@close-modal="closeModal"
			/> -->
		</action-sidebar>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import helper from '@/shared/helper';
import categoriesAutocomplete from '@/components/shared/autocomplete/categories-autocomplete';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import transferSeries from '@/components/products/transfer-series';
import editSerie from '@/components/products/edit-series';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
// import addSeries from '@/components/products/add-series';

function data() {
	return {
		data: [],
		warehouses: [],
		warehouse: '',
		categories: [],
		category: '',
		status: [
			{
				name: 'Despachado',
				id: true,
			},
			{
				name: 'Sin despachar',
				id: false,
			},
		],
		state: '',
		params: {
			page: 1,
			limit: 20,
		},
		lastPage: 0,
		totalItems: 0,
		totalItemsVisible: 0,
		currentPage: 1,
		products: [],
		newProduct: null,
		search: null,
		columns: [
			{ id: 1, name: 'Código', visible: true, checked: true },
			{ id: 2, name: 'Nombre', visible: true, checked: true },
			{ id: 3, name: 'Almacén', visible: true, checked: true },
			{ id: 4, name: 'Serie', visible: true, checked: true },
			{ id: 5, name: 'Comentario 1', visible: true, checked: true },
			{ id: 6, name: 'Comentario 2', visible: true, checked: true },
			{ id: 7, name: 'UND', visible: true, checked: true },
			{ id: 8, name: 'Peso', visible: true, checked: true },
			{ id: 9, name: 'Estado', visible: true, checked: true },
			{ id: 10, name: 'Referencia', visible: true, checked: true },
		],
		checkAll: false,
		dataSelected: [],
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 600,
		},
		nameWarehouseSelect: '',
		idEdit: null,
		searchVal: null,
		currentProduct: {},
		currentProductName: '',
		productSelected: {},
		product: {},
	};
}

function clearFilter() {
	this.params = {
		page: 1,
		limit: 20,
		warehousesId: null,
		categoriesId: null,
		productId: null,
		flagDispatch: null,
	};
	this.warehouse = '';
	this.category = '';
	this.state = '';
	this.newProduct = null;
	this.productId = null;
	this.category = [];
	this.loadProducts();
}

function filterRows(filter, value) {
	if (value === 'warehouse') {
		this.params.warehousesId = filter.id;
		this.nameWarehouseSelect = filter.name;
	} else if (value === 'category') {
		this.params.categoriesId = filter.join(',');
	} else if (value === 'product') {
		this.params.productId = filter;
	} else {
		this.params.flagDispatch = filter;
	}
	this.currentPage = 1;
	this.dataSelected = [];
	this.productId = null;
	this.loadProducts();
}

async function loadData() {
	const params = { flagMain: 1, relationAdd: 'subCategories' };
	const requests = [this.$httpProducts.get('warehouses'), this.categoriesList(params)];
	const [warehouses, categories] = await Promise.all(requests);
	this.warehouses = warehouses.data;
	this.categories = categories.data;
}

function changePage(page) {
	this.currentPage = page;
	this.loadProducts();
}

function selectedAll(value) {
	({
		products: this.data,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.data, this.dataSelected));
}

function rowIsSelected({ id, isSelected }) {
	this.checkAll = this.data.every((row) => row.isSelected);
	if (isSelected) {
		this.dataSelected.push(this.data.find((row) => row.id === id));
	} else {
		const index = this.dataSelected.findIndex((row) => row.id === id);
		this.dataSelected.splice(index, 1);
	}
}

async function loadProducts() {
	this.params.page = this.currentPage;
	if (this.params.categoriesId === '') {
		delete this.params.categoriesId;
	}
	this.dataSelected = [];
	try {
		const response = await this.$httpProducts.get('/products-detail', {
			params: this.params,
		});
		this.data = response.data.map((row) => {
			const newRow = { ...row };
			newRow.dateFormat = helper.exactDate(row.date, 'DD/MM/YYYY');
			return newRow;
		});
		this.totalItemsVisible = this.data.length;
		this.lastPage = Number(response.headers['x-last-page']);
		this.totalItems = Number(response.headers['x-quantity']);
	} catch (error) {
		this.showGenericError('Error');
	}
}

function runAction({ code, name }) {
	if (code === 'TS') {
		this.action.width = 750;
	} else if (code === 'add-serie') {
		const productIdSerie = this.dataSelected[0] || this.data[0];
		this.$router.push({ name: 'new-entry', params: { productIdSerie } });
		return;
	} else {
		this.action.width = 400;
		this.idEdit = this.dataSelected[0].id;
	}
	this.action.code = code;
	this.action.open = true;
	this.action.title = name;
}

function actionsDisabled() {
	const isDispatch = this.dataSelected.some(
		(obj) => obj.statusDispatch && obj.statusDispatch.name === 'Despachado'
	);
	const disabledSelected =
		this.dataSelected.length >= 1 && this.params.warehousesId && !isDispatch;
	const flagControlSerie =
		this.product && this.product.product ? this.product.product.flagControlSerie : null;
	const disabledOne = this.dataSelected.length === 1 || flagControlSerie;
	const disabledEs = this.dataSelected.length === 1;
	// const validateProduct = this.dataSelected.every(
	// 	(obj) => obj.product.name === this.dataSelected[0].product.name
	// );
	const disabledActions = [
		{ code: 'TS', disabled: !disabledSelected },
		{ code: 'ES', disabled: !disabledEs },
		{ code: 'add-serie', disabled: !disabledOne },
	];
	return disabledActions;
}

function updateSerie() {
	this.closeModal();
	this.clearFilter();
	this.dataSelected = [];
}

function openSearch(value) {
	this.searchVal = value ? value.trim() : '';
	this.action.code = 'product-searcher';
	this.action.title = 'Productos';
	this.action.width = 739;
	this.action.open = true;
}

function closeModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
}

function setProduct(prod) {
	this.product = prod;
	this.closeModal();
	this.newProduct = prod.autocomplete;
	this.filterRows(prod.productId, 'product');
}

function searchSeries(value) {
	const search = value ? value.trim() : '';
	this.params.search = search || null;
	this.currentPage = 1;
	this.loadProducts();
}

function getValueByProp(row, prop = 'name') {
	return row ? row[prop] : null;
}

function updateTransfer() {
	this.closeModal();
	this.clearFilter();
}

export default {
	name: 'control-series',
	data,
	components: {
		appActions,
		headerPage,
		generalFilter,
		appTable,
		actionSidebar,
		transferSeries,
		editSerie,
		categoriesAutocomplete,
		productsSearchInput,
		productsSearchForm,
	},
	computed: {
		actionsDisabled,
	},
	created() {
		this.loadData();
		this.loadProducts();
	},
	methods: {
		clearFilter,
		filterRows,
		loadData,
		rowIsSelected,
		selectedAll,
		changePage,
		runAction,
		loadProducts,
		updateSerie,
		openSearch,
		closeModal,
		setProduct,
		searchSeries,
		getValueByProp,
		updateTransfer,
		downloadPdf() {
			if (this.warehouse.id) {
				const { id: warehouseId } = this.warehouse;
				const { id: priceListId } = this.$userInfo.salPriceList;
				const { flagDispatch } = this.params;
				const params = {
					warehouses: warehouseId,
					priceListId,
					flagActive: 1,
					employeeName: this.$userInfo.name,
					...(flagDispatch !== undefined && { flagDispatch }),
				};
				this.reportPdfSeries(params);
			} else {
				this.showGenericError('Debe seleccionar un almacen para generar el reporte');
			}
		},
		emitExcel() {
			if (this.warehouse.id) {
				const { id: priceListId } = this.$userInfo.salPriceList;
				const { categoriesId, productId, flagDispatch } = this.params;
				const { id: warehouseId } = this.warehouse;

				const params = {
					warehouses: warehouseId,
					priceListId,
					flagActive: 1,
					...(categoriesId && { categoriesId }),
					...(productId && { productId }),
					...(flagDispatch !== undefined && { flagDispatch }),
				};
				this.reportListSeries(params);
			} else {
				this.showGenericError('Debe seleccionar un almacen para generar el reporte');
			}
		},
		preGoTo(document) {
			const routeData = this.$router.resolve({
				name: 'convert',
				params: { id: document.saleDocumentId },
			});
			window.open(routeData.href, '_blank');
		},
	},
};
</script>
<style lang="scss" scoped>
.warehouse {
	color: #a2a2a2;
	font-size: 13px;
}

.label-container {
	background-color: color(border-green-light);
	display: inline-flex;
	height: 31px;
	line-height: 31px;
	padding-left: 5px;
	width: 100px;
}

.label-detail {
	font-family: font(open-semibold);
}

.value-container {
	align-items: center;
	background-color: color(green-extra-l);
	display: flex;
	height: 31px;
	min-width: 205px;
	padding-right: 11px;
	width: fit-content;
}

.value-detail {
	color: color(paginationText);
	font-family: font(open-regular);
	display: inline-flex;
	margin-bottom: 0px;
	padding-left: 11px;
}
</style>
