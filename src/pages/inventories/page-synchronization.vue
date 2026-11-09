<template>
	<div>
		<header-page
			:title="$route.meta.title"
			to-show
			:show-clean="false"
			:show-excel="false"
		>
			<v-flex xs6>
				<v-layout column justify-end align-cente v-if="showSync">
					<v-flex class="ft-10" text-xs-right> Total: </v-flex>
					<v-flex text-xs-right class="primary--text semi-bold">
						{{ resultState }} {{ textState }}
					</v-flex>
				</v-layout>
			</v-flex>
		</header-page>
		<v-flex xs12 text-xs-right py-2 px-4>
			<v-btn
				class="btn-action"
				color="primary"
				:disabled="showBtnSync"
				@click="openDialogSync"
			>
				Sincronización
			</v-btn>
		</v-flex>
		<div class="px-4">
			<v-layout mt-3 row align-center>
				<v-flex xs4>
					<products-search-input
						flag-init
						:search-value="params.nameProduct"
						:ref-value="refValue"
						:clean-input="cleanInputValue"
						@search="openSearch"
					/>
				</v-flex>
				<v-flex xs3 ml-2>
					<autocomplete-component
						:items="typeDocuments"
						:item="params.documentTypeId"
						item-text="name"
						item-value="id"
						placeholder-value="Movimiento"
						class="filter-select mt-4"
						return-object
						content-class="filter-select-content"
						@return-data="setData($event, 'documentTypeId')"
					></autocomplete-component>
				</v-flex>
				<v-flex xs2 ml-2>
					<app-select
						label="Est. de Sincronización"
						model="syncStatus"
						item-text="name"
						item-value="id"
						:items="states"
						:item="syncStatus"
						@input="setSyncStatus"
					/>
				</v-flex>
				<v-flex xs2 ml-2>
					<app-date-select
						label="Fecha de Inicio"
						model="startDate"
						:date-formatted="startDate"
						@input="setDate"
					/>
				</v-flex>
				<v-flex xs2 ml-2>
					<app-date-select
						label="Fecha Final"
						model="endDate"
						:date-formatted="endDate"
						@input="setDate"
					/>
				</v-flex>
				<v-flex xs1 mt-4 ml-2>
					<v-btn
						type="button"
						color="primary"
						class="btn-action"
						@click="filterSyncronation('action')"
					>
						Filtrar
					</v-btn>
				</v-flex>
			</v-layout>
			<v-layout mt-4>
				<v-flex xs12>
					<table class="container-table">
						<thead>
							<tr class="header">
								<template>
									<th class="color-green">h</th>
									<th class="color-green">h</th>
									<th class="color-green">h</th>
									<th class="color-green">h</th>
									<th class="color-green">h</th>
									<th class="color-green">h</th>
									<th class="color-green">h</th>
									<th class="color-green">h</th>
									<th class="color-green">h</th>
									<th class="color-green">h</th>
									<th class="color-green">h</th>
									<th colspan="1" class="border-gray w-124">ENTRADAS</th>
									<th colspan="1" class="border-gray w-124">SALIDAS</th>
									<th class="width-filter">
										<v-btn
											v-if="detailProduct"
											class="btn-filter btn-list"
											type="button"
											@click="openSlider"
											:disabled="disabledFilter"
										>
											<v-icon color="success">filter_list</v-icon>
										</v-btn>
									</th>
								</template>
							</tr>
						</thead>
					</table>
					<app-table
						class="px-0"
						selectable
						:checkAll="checkAll"
						:current-page="currentPage"
						:last-page="lastPage"
						:columns="columns"
						:rows="rows"
						:filterColumns="false"
						:inputSearch="false"
						:items-total-quantity="itemsTotalQuantity"
						:items-quantity="rows.length"
						@row-is-selected="rowIsSelected"
						@on-selected-all="selectedAll"
					>
						<template slot="rows" slot-scope="props">
							<td class="is-not-selectable" v-show="showRow(columns, 1)">
								{{ props.row.warehouse.name }}
							</td>
							<td class="is-not-selectable" v-show="showRow(columns, 2)">
								{{ props.row.product ? props.row.product.code : null }}
							</td>
							<td class="is-not-selectable" v-show="showRow(columns, 3)">
								{{ props.row.product ? props.row.product.name : null }}
							</td>
							<td class="is-not-selectable" v-show="showRow(columns, 4)">
								{{ props.row.createdAt | formatDate('YYYY-MM-DD') }}
							</td>
							<td
								class="is-not-selectable"
								v-show="showRow(columns, 5)"
								v-if="isLink(props.row)"
							>
								<button @click="goToReference(props.row)" class="btn-link">
									{{ props.row.documentNumber }}
								</button>
							</td>
							<td v-else class="is-not-selectable" v-show="showRow(columns, 5)">
								{{ props.row.documentNumber }}
							</td>
							<td class="is-not-selectable" v-show="showRow(columns, 6)">
								{{ props.row.documentTypeData.name }}
							</td>
							<td
								class="is-not-selectable width-quantity"
								v-show="showRow(columns, 8)"
							>
								{{ props.row.quantityIn }}
							</td>
							<td
								class="is-not-selectable width-quantity"
								v-show="showRow(columns, 9)"
							>
								{{ props.row.quantityOut }}
							</td>
							<td class="is-not-selectable" v-show="showRow(columns, 7)">
								<document-state
									:tooltip="getTextStatus(props.row)"
									:color="getColorStatus(props.row)"
								/>
							</td>
						</template>
					</app-table>
				</v-flex>
			</v-layout>
		</div>
		<v-dialog v-model="dialogSync" max-width="500px">
			<v-card>
				<v-card-title>
					<v-layout d-flex justify-center>
						<p class="text-xs-center">¿Estas seguro que desea sincronizar?</p>
					</v-layout>
				</v-card-title>
				<v-divider></v-divider>
				<v-card-actions>
					<v-layout d-flex justify-space-between>
						<v-btn
							type="button"
							color="pink"
							class="btn-action mr-1"
							@click="closeDialog"
						>
							Cancelar
							<v-icon color="white" size="16"> highlight_off </v-icon>
						</v-btn>
						<v-btn
							type="button"
							color="primary"
							class="btn-action ml-1"
							@click="syncAction"
						>
							Aceptar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<filters-kardex
				v-if="isActive"
				:product-code="detailProduct.code"
				:product-description="detailProduct.description"
				:product-id="detailProduct.id"
				:product-stock="detailProduct.stock"
				:product-unit="detailProduct.unitCode"
				:warehouse-ids="params.warehouseIds"
				@filter-modal="filterWarehouse($event)"
			/>
			<products-search-form
				v-if="isProductSearcher"
				not-valid-negative-stock
				master
				:search-value="searchVal"
				:show-filter="false"
				:warehouseId="params.warehouseId"
				@add-product="setProduct"
				text="Agregar"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import { format, subMonths } from 'date-fns';
import helper from '@/shared/helper';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import documentState from '@/components/shared/document-state';
import filtersKardex from '@/components/inventories/filters-kardex';
import headerPage from '@/components/shared/header-page';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import productsSearchInput from '@/components/shared/searcher/products-search-input';

const { exactDate } = helper;

function created() {
	this.startDate = format(subMonths(this.$today(), 1), 'YYYY-MM-DD');
	this.endDate = exactDate(this.$today(), 'YYYY-MM-DD');
	this.syncStatus = this.states[0].id;
	this.filterSyncronation(null);
	this.loadtypeDocuments();
}

function setDate({ model, value }) {
	this[model] = format(value, 'YYYY-MM-DD');
}

async function loadtypeDocuments() {
	try {
		const response = await this.$httpProducts.get('type-documents');
		this.typeDocuments = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function cleanInputValue(val) {
	if (val) {
		this.searchVal = null;
	}
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
	this.action.code = '';
	this.action.title = '';
	this.searchVal = null;
	this.action.open = false;
	this.action.width = 0;
	// this.clearWarehouses();
}

function isProductSearcher() {
	return this.action.code === 'product-searcher';
}

function setProduct(prod) {
	this.currentPage = 1;
	this.setInformation(prod);
	this.closeModal();
}

function setInformation(product) {
	this.detailProduct = product;
	this.params.nameProduct = product.name || product.product.name;
	this.params.productId = product.productId || product.id;
	this.params.brandId = product.brands.length
		? product.brands[0].id
		: product.brandId;
	this.params.warehouseIds = product.warehouseIds;
}

async function filterSyncronation(action) {
	const params = {};
	params.startDate = this.startDate;
	params.endDate = this.endDate;
	const body = {
		brandId: this.params.brandId || undefined,
		documentTypeId: this.params.documentTypeId || undefined,
		productId: this.params.productId || undefined,
		warehouseId: this.params.warehouseId || undefined,
		syncStatus: this.syncStatus || undefined,
		warehouseIds: this.params.warehouseIds || undefined,
	};
	const requests = [
		this.$httpProducts.post('kardex/list', body, { params }),
		this.$httpProducts.post('kardex/list-total', body, { params }),
	];
	try {
		[{ data: this.rows, headers: this.headers }, { data: this.totals }] =
			await Promise.all(requests);
		this.lastPage = Number(this.headers['x-last-page']);
		this.itemsTotalQuantity = Number(this.headers['x-quantity']);
		this.showSync = !!action;
		if (this.syncStatus === 1) {
			this.resultState = this.totals[0].sumPendingSync || 0;
			this.textState = 'Pendientes';
		} else if (this.syncStatus === 2) {
			this.resultState = this.totals[0].sumProcessSync;
			this.textState = 'Sincronizados' || 0;
		} else {
			this.resultState = this.totals[0].sumErrorSync;
			this.textState = 'Sin Sincronizar' || 0;
		}
		this.disabledFilter = !action;
		this.showBtnSync = this.syncStatus !== 3;
	} catch (error) {
		this.showGenericError();
	}
}

function setData(value, model) {
	if (value) {
		this.params[model] = value.id || null;
	}
	if (model === 'warehouseId') {
		this.params.nameProduct = null;
	}
}

function setSyncStatus({ model, value }) {
	this[model] = value.id;
}

function getTextStatus(row) {
	if (row.syncStatus === 1) {
		return 'Pendiente';
	} else if (row.syncStatus === 2) {
		return 'Sincronizado';
	}
	return 'Error de Sincronización';
}

function getColorStatus(row) {
	if (row.syncStatus === 1) {
		return 'warning';
	} else if (row.syncStatus === 2) {
		return 'primary';
	}
	return 'error';
}

function openSlider() {
	this.isActive = true;
	this.action.width = 500;
	this.action.open = true;
}

function isLink({ moduleName }) {
	const isInventario = moduleName === 'INVENTARIO';
	const isIngreso = moduleName === 'INGRESO';
	const isVenta = moduleName === 'VENTAS';
	const isTransferencia = moduleName === 'TRANSFERENCIA';
	const isCompra = moduleName === 'COMPRAS';
	return isInventario || isIngreso || isVenta || isTransferencia || isCompra;
}

function goToReference(item) {
	let url = {};
	if (item.moduleId === 1 || item.moduleId === 2) {
		const pageOptions = {
			COMPRAS: 'purchase-detail',
			VENTAS: 'convert',
		};
		const pageName = pageOptions[item.moduleName] || 'convert';
		url = { name: pageName, params: { id: item.documentId } };
	} else if (item.moduleId === 9) {
		this.isStatusTransfer(item.documentId);
		return false;
	} else if (item.moduleId === 8) {
		url = { name: 'detail-child-inventory', params: { id: item.documentId } };
	}
	const routeData = this.$router.resolve(url);
	window.open(routeData.href, '_blank');
	return true;
}

function rowIsSelected(row) {
	({
		products: this.rows,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selectedRows(row, this.rows, this.dataSelected));
}

function selectedAll(value) {
	({
		products: this.rows,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.rows, this.dataSelected));
}

function openDialogSync() {
	this.dialogSync = true;
}

function closeDialog() {
	this.dialogSync = false;
}

async function syncAction() {
	const body = {
		ids: this.dataSelected.map((p) => p.id),
	};
	try {
		await this.$httpProducts.post('kardex/sync-sender', body);
		this.closeDialog();
		this.showNotification('Fueron Sincronizado correctamente.');
		this.dataSelected = [];
		this.filterSyncronation(null);
	} catch (error) {
		if (error.status === 400) {
			if (error.message === 'KARDEX_RECORD_NOT_FOUND_IN_GROUPS') {
				this.showGenericError(
					'Uno o mas registros no se encuentran pueden convertir a sincronizado.'
				);
			}
		} else {
			this.showGenericError();
		}
	}
}

function filterWarehouse(warehousesSelected) {
	this.params.warehouseIds = warehousesSelected.map((p) => p.warehouse.id);
	this.isActive = false;
	this.action.open = false;
	this.filterSyncronation(null);
}

function data() {
	return {
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 600,
		},
		cleanInputValue: false,
		columns: [
			{
				id: 1,
				name: 'Almacen',
				value: 'warehouse',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Código',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Producto',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Fecha',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Ref',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Mov.',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Cant',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Cant',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'Est. Sinc.',
				value: 'state',
				tooltip: 'Estado de Sincronización',
				checked: true,
				visible: true,
			},
		],
		dataSelected: [],
		detailProduct: {},
		disabledFilter: true,
		dialogSync: false,
		isActive: false,
		itemsTotalQuantity: 0,
		resultState: 0,
		checkAll: false,
		currentPage: 1,
		headers: {},
		endDate: null,
		lastPage: 0,
		refValue: 'searcher-kardex',
		startDate: null,
		syncStatus: null,
		showBtnSync: true,
		showSync: false,
		params: {
			brandId: 0,
			documentTypeId: null,
			nameProduct: null,
			productId: null,
		},
		textState: null,
		totals: {},
		rows: [],
		states: [
			{
				id: 1,
				name: 'Pendiente',
			},
			{
				id: 2,
				name: 'Sincronizado',
			},
			{
				id: 3,
				name: 'Error',
			},
		],
		typeDocuments: [],
	};
}

export default {
	name: 'page-synchronization',
	data,
	created,
	components: {
		actionSidebar,
		appTable,
		autocompleteComponent,
		documentState,
		filtersKardex,
		headerPage,
		productsSearchInput,
		productsSearchForm,
	},
	computed: {
		isProductSearcher,
	},
	methods: {
		filterWarehouse,
		closeDialog,
		closeModal,
		openDialogSync,
		getColorStatus,
		getTextStatus,
		goToReference,
		filterSyncronation,
		isLink,
		loadtypeDocuments,
		openSearch,
		setData,
		setDate,
		setInformation,
		selectedAll,
		setSyncStatus,
		setProduct,
		openSlider,
		rowIsSelected,
		syncAction,
	},
	wath: {
		cleanInputValue,
	},
};
</script>

<style lang="scss" scoped>
.semi-bold {
	font-weight: 600;
	font-size: 15px;
}

.ft-10 {
	font-size: 10px;
}

.header {
	background-color: color(primary);
}

.container-table {
	width: 100%;
	border-collapse: collapse;
}

.header {
	color: white;
	font-size: 13px;
	font-weight: 600;
	height: 35px;
	padding: 7px 0;
}

.px-0 {
	padding: 0 !important;
}

.w-124 {
	width: 125px;
}

.color-green {
	color: color(primary);
}

.btn-filter {
	background-color: #ffffff;
	border-radius: 4px;
	padding: 2px;
}

.width-filter {
	width: 60px;
}

.width-quantity {
	width: 125px;
}

.btn-link {
	border-bottom: 1px solid map-get($colors, primary);
	color: map-get($colors, primary);
}
</style>
