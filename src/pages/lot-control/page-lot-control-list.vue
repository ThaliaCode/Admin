<template>
	<div>
		<header-page
			:clean-disabled="onLoadData"
			:columns="columns"
			name="lotes"
			:btns-column="'xs12 mb-3'"
			:rows="dataSelected"
			:title="$route.meta.title"
			to-show
			export-to-pdf
			show-excel
			:emit-excel="true"
			@emit-excel="emitExcel"
			@download-dispatch="downloadPdf"
			@clean-product-filter="onCleanData"
		></header-page>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			:value-disabled="actionsDisabled"
		/>
		<general-filter>
			<v-layout wrap justify-start align-center mt-4>
				<v-flex xs3 pl-2>
					<app-select
						:items="warehouses"
						item-text="name"
						item-value="id"
						model="warehouse"
						label="Almacén"
						autocomplete
						:item="params.warehousesId"
						@input="setData($event, 'warehousesId')"
					/>
				</v-flex>
				<v-flex xs3 px-1>
					<v-layout wrap align-center>
						<v-flex xs6 pr-2>
							<label class="caption">Vencimiento desde</label>
							<date-component
								:date="params.startDueDate"
								icon="/static/img/calendar.svg"
								@on-input="setDate({ model: 'startDueDate', value: $event })"
							></date-component>
						</v-flex>
						<v-flex xs6>
							<label class="caption">Vencimiento hasta</label>
							<date-component
								:date="params.endDueDate"
								icon="/static/img/calendar.svg"
								@on-input="setDate({ model: 'endDueDate', value: $event })"
							></date-component>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs3 px-1>
					<app-select
						item-text="name"
						item-value="id"
						:item="params.hasSale"
						label="Estado"
						:items="statesLote"
						model="hasSale"
						:return-object="false"
						@input="getData"
					/>
				</v-flex>
				<v-flex xs12 sm6 md1 ml-2>
					<v-layout wrap align-center>
						<v-flex xs12 pr-1 pt-3>
							<v-btn
								:disabled="onLoadData"
								type="button"
								color="primary"
								class="btn-action btn-action-block"
								@click="searchDataFiltered"
							>
								Buscar
								<v-icon color="white" size="16"> check_circle_outline </v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</general-filter>
		<v-flex mt-3>
			<app-table
				:columns="columns"
				include-filter
				selectable
				local-storage
				local-search
				:rows="rows"
				name="sales"
				:check-all="checkAll"
				:current-page="currentPage"
				:last-page="lastPage"
				:items-quantity="rows.length"
				:items-total-quantity="itemsTotalQuantity"
				@on-search-event="callServiceAndSearch"
				@on-local-search="callServiceAndSearch"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
				@on-page="changePage"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.product.code }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.productName }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.warehouse.name }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.oldQuantity }}</td>
					<td v-show="showRow(columns, 6)">
						{{ props.row.hasSale ? 'Apto para venta' : 'No apto para venta' }}
					</td>
					<td v-show="showRow(columns, 7)">{{ formatDate(props.row.date) }}</td>
					<td v-show="showRow(columns, 8)">{{ formatDate(props.row.dateDue) }}</td>
					<td v-show="showRow(columns, 9)">{{ props.row.stock }}</td>
					<!-- <td v-show="showRow(columns, 10)"></td> -->
				</template>
			</app-table>
			<action-sidebar
				:active="action.active"
				:code-action="action.code"
				:header-color="action.color"
				:is-loading="loading"
				:title="action.title"
				:width="action.width"
				:help-actions="actionsToHelp"
				v-model="action.open"
				@close-modal="cancelModal(false)"
			>
				<transfer-lots
					v-if="isActionCode('TL')"
					:columns="columnsToTransfer"
					:products="dataSelected"
					:warehouse-origin-id="params.warehousesId"
					:filtered-products="filteredProducts"
					@cancel-modal="closeDialogReturn"
					@transfer-product="clearSelectedProducts"
					@close-dialog-return="closeDialogReturn"
				/>
			</action-sidebar>
		</v-flex>
		<simple-modal
			:open="showChangeState"
			@cancel="toggleModalState"
			@confirm="onChangeState()"
			@close="toggleModalState"
		>
			<span slot="title">Cambio de Estado</span>
			<div slot="message">
				<div>Selecciona el estado nuevo a asignar</div>
				<div>
					<v-radio-group v-model="stateLoteSelected" row>
						<v-radio label="Apto para venta" :value="1" color="orange"></v-radio>
						<v-radio label="No apto para venta" :value="0" color="orange"></v-radio>
					</v-radio-group>
				</div>
			</div>
		</simple-modal>
	</div>
</template>

<script>
import { differenceInDays, format, subDays } from 'date-fns';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import dateComponent from '@/components/shared/date-component';
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import simpleModal from '@/components/field-sale/shared/simple-modal';
import transferLots from '@/components/products/transfer-lots';

function created() {
	this.loadResources();
	this.loadData();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const { data: response, headers } = await this.$httpProducts.get('products-lots', {
			params: this.params,
		});
		this.lastPage = Number(headers['x-last-page']);
		this.itemsTotalQuantity = Number(headers['x-quantity']);
		this.rowsComplete = (response || []).map((row) => {
			const isSelected = this.dataSelected.some((ds) => ds.id === row.id);
			return { ...row, isSelected };
		});
		if (this.currentLocalSearch) {
			this.callServiceAndSearchLocal(this.currentLocalSearch);
		} else {
			this.rows = [...this.rowsComplete];
			this.checkAll = this.rows.length > 0 && this.rows.every((r) => r.isSelected);
		}
	} catch (error) {
		this.showGenericError();
	}
}

async function loadResources() {
	const request = [
		this.$httpProducts.get('warehouses'),
		this.categoriesList(),
		this.$httpProducts.get('brands'),
	];
	try {
		const responses = await Promise.all(request);
		[{ data: this.warehouses }, { data: this.categories }, { data: this.brands }] =
			responses;
	} catch (error) {
		this.showGenericError();
	}
}

function onSearch(searchValue) {
	const searchTrim = searchValue ? searchValue.trim() : null;
	this.params.search = searchTrim;
	this.loadData();
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function setDate({ model, value }) {
	if (value) {
		this.params[model] = format(value, 'YYYY-MM-DD');
	} else if (model === 'startDueDate' && !value) {
		this.params.startDueDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	} else {
		this.params.endDueDate = this.$today();
	}
}

function setData(value, model) {
	if (value) {
		if (model === 'warehousesId' && value.value) {
			this.params[model] = value.value.id;
		}
	}
}

function getData({ model, value }) {
	if (model === 'hasSale') {
		this.params[model] = value;
	}
}

function rowIsSelected(row) {
	if (row.isSelected) {
		this.dataSelected.push(row);
	} else {
		const index = this.dataSelected.findIndex((ds) => ds.id === row.id);
		if (index > -1) {
			this.dataSelected.splice(index, 1);
		}
	}
}

function allIsSelected() {
	this.checkAll = this.data.every((check) => check.isSelected);
}

function callServiceAndSearch(search) {
	this.searchData = search;
	if (search) {
		this.params.search = search;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
	this.loadData();
}

function onCleanData() {
	this.params = {
		search: null,
		endDueDate: null,
		startDueDate: null,
		warehousesId: null,
		hasSale: null,
		limit: 20,
		page: 1,
		relationAdd: 'product,warehouse,warehouseProduct',
	};
	this.callServiceAndSearch();
}

function callServiceAndSearchLocal(search) {
	this.currentLocalSearch = search;
	const localSearch = search ? search.toLowerCase().trim() : '';

	if (localSearch) {
		this.rows = this.rowsComplete.filter(
			(p) =>
				(p.productName && p.productName.toLowerCase() === localSearch) ||
				(p.code && p.code.toLowerCase() === localSearch) ||
				(p.brandName && p.brandName.toLowerCase() === localSearch)
		);
	} else {
		this.rows = this.rowsComplete ? [...this.rowsComplete] : [];
	}
	this.checkAll = this.rows.length > 0 && this.rows.every((r) => r.isSelected);
}

function runAction({ code }) {
	if (code === 'TL') {
		/* Slider para la transferencia de lote */
		this.action = {
			code: 'TL',
			title: 'Traslado de Productos',
			open: true,
			width: 800,
		};
	} else if (code === 'edit-stat') {
		/* Pop up edicion multiple de estado del lote */
		this.showChangeState = true;
	}
}

async function onChangeState() {
	const idLots = this.dataSelected.map((ds) => ds.id);
	try {
		const payload = {
			ids: idLots,
			hasSale: this.stateLoteSelected,
			flagActive: 1,
		};
		const { data: response } = await this.$httpProducts.patch(
			'/products-lots/multiple',
			payload
		);
		this.showChangeState = false;
		this.clearSelectedProducts();
		if (response) {
			this.showNotification(
				'Se actualizó el estado de los lotes correctamente',
				'success'
			);
			this.loadData();
		}
	} catch (error) {
		this.showGenericError('Error al actualizar el estado de los lotes');
		this.showChangeState = false;
	}
}

function actionsDisabled() {
	const disabledTransfer =
		this.dataSelected.length >= 1 && this.params.warehousesId !== null;
	const disabledStateChange = this.dataSelected.length >= 1;
	return [
		{ code: 'TL', disabled: !disabledTransfer },
		{ code: 'edit-stat', disabled: !disabledStateChange },
	];
}

function selectedAll(value) {
	this.checkAll = value;
	this.rows = this.rows.map((dataSingle) => {
		const newData = Object.assign({}, dataSingle);
		newData.isSelected = value;
		if (newData.isSelected) {
			if (this.dataSelected.length > 0) {
				const dataToAdd = this.dataSelected.find(
					(rowSelected) => rowSelected.id === newData.id
				);
				if (!dataToAdd) {
					this.dataSelected.push(newData);
				}
			} else {
				this.dataSelected.push(newData);
			}
		} else {
			const index = this.dataSelected.findIndex((ds) => ds.id === newData.id);
			if (index > -1) {
				this.dataSelected.splice(index, 1);
			}
		}
		return newData;
	});
}

function searchDataFiltered() {
	const datesValid =
		differenceInDays(this.params.endDueDate, this.params.startDueDate) >= 0;
	if (datesValid) {
		this.currentPage = 1;
		this.dataSelected = [];
		this.checkAll = false;
		this.loadData();
	} else {
		this.showNotification('La fecha inicial no debe ser mayor a la fecha final', 'info');
	}
}

function isActionCode(code, anotherCode) {
	const equalToCode = this.action.code === code;
	if (anotherCode) {
		return equalToCode || this.action.code === anotherCode;
	}
	return equalToCode;
}

function cancelModal(value) {
	this.action.code = null;
	this.action.open = value;
	this.action.active = value;
	this.$bus.$emit('is-loading', false);
	this.onCleanData();
	this.clearSelectedProducts();
	this.loadData();
}

function clearSelectedProducts() {
	this.rows = this.rows.map((p) => {
		const newP = { ...p };
		newP.isSelected = false;
		return newP;
	});
	this.dataSelected = [];
	this.checkAll = false;
	this.currentLocalSearch = '';
	this.onCleanData();
}

function closeDialogReturn(productsWithStock) {
	const dataToLocalStorage = JSON.stringify(productsWithStock);
	localStorage.setItem(
		`${process.env.STORAGE_USER_KEY}::translate-product`,
		dataToLocalStorage
	);
	this.action = {
		code: null,
		open: false,
		title: '',
	};
	this.currentLocalSearch = '';
	this.onCleanData();
	this.clearSelectedProducts();
}

function data() {
	return {
		action: {
			active: false,
			code: null,
			open: false,
			title: 'titulo desde data',
			width: 500,
		},
		brands: [],
		categories: [],
		columns: [
			{
				id: 1,
				name: 'Código',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Cod. Producto',
				value: 'product?.code',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Producto',
				value: 'productName',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Almacén',
				value: 'warehouse.name',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Stock inicial',
				value: 'oldQuantity',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Estado',
				value: 'state',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'F. de Creación',
				toolip: 'Fecha de Creación',
				value: 'date',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'F. de Vencimiento',
				toolip: 'Fecha de Vencimiento',
				value: 'dateDue',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'Stock',
				value: 'stock',
				checked: true,
				visible: true,
			},
			// {
			// 	id: 10,
			// 	name: 'Acciones',
			// 	value: 'actions',
			// 	checked: true,
			// 	visible: true,
			// },
		],
		columnsToTransfer: [
			{
				id: 1,
				name: 'Tienda',
				value: 'warehouse.name',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Código',
				value: 'code',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Cod. interno',
				value: 'product.autoBarcode',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Nombre',
				value: 'product.name',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Descripción',
				value: 'product.description',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Marca',
				value: 'brandName',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Caracteristicas',
				value: 'brandName',
				visible: false,
				checked: false,
			},
			{
				id: 8,
				name: 'Categoria',
				value: 'brandName',
				visible: false,
				checked: false,
			},
			{
				id: 9,
				name: 'Stock',
				value: 'stock',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Kg',
				value: 'product.weigth',
				visible: true,
				checked: true,
			},
			{
				id: 11,
				name: 'Cantidad',
				value: 'quantity',
				visible: true,
				checked: true,
				isEditable: true,
				showInput: false,
			},
			{
				id: 12,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		itemsTotalQuantity: 0,
		lastPage: 0,
		loading: false,
		params: {
			search: null,
			endDueDate: null,
			startDueDate: null,
			warehousesId: null,
			hasSale: null,
			limit: 20,
			page: 1,
			relationAdd: 'product,warehouse,warehouseProduct',
		},
		onLoadData: false,
		showChangeState: false,
		rows: [],
		rowsComplete: [],
		currentLocalSearch: '',
		checkAll: false,
		dataSelected: [],
		filteredProducts: [],
		warehouses: [],
		stateLoteSelected: 1,
		statesLote: [
			{
				id: 0,
				name: 'No apto para venta',
			},
			{
				id: 1,
				name: 'Apto para venta',
			},
		],
	};
}

export default {
	name: 'page-lot-control-list',
	created,
	data,
	components: {
		appTable,
		headerPage,
		generalFilter,
		dateComponent,
		appActions,
		actionSidebar,
		simpleModal,
		transferLots,
	},
	computed: {
		actionsDisabled,
	},
	methods: {
		changePage,
		loadData,
		loadResources,
		onSearch,
		setDate,
		setData,
		getData,
		rowIsSelected,
		onCleanData,
		runAction,
		selectedAll,
		searchDataFiltered,
		callServiceAndSearch,
		allIsSelected,
		onChangeState,
		isActionCode,
		cancelModal,
		clearSelectedProducts,
		callServiceAndSearchLocal,
		closeDialogReturn,
		downloadPdf() {
			if (this.params.warehousesId) {
				const params = {
					endDueDate: this.params.endDueDate,
					startDueDate: this.params.startDueDate,
					warehousesId: this.params.warehousesId,
					hasSale: this.params.hasSale,
				};
				this.reportPdfLots(params);
			} else {
				this.showGenericError('Debe seleccionar un almacen para generar el reporte');
			}
		},
		emitExcel() {
			if (this.params.warehousesId) {
				const params = {
					endDueDate: this.params.endDueDate,
					startDueDate: this.params.startDueDate,
					warehousesId: this.params.warehousesId,
					hasSale: this.params.hasSale,
				};
				this.reportListLots(params);
			} else {
				this.showGenericError('Debe seleccionar un almacen para generar el reporte');
			}
		},
		toggleModalState() {
			this.showChangeState = !this.showChangeState;
		},
		formatDate(date) {
			if (!date) return '-';
			return date.split('T')[0];
		},
	},
};
</script>

<style lang="scss" scoped>
.headline {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(large) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding-top: 37px !important;
	text-align: center;
}

.subtext {
	color: color(grey-border);
	font-family: font(open-regular);
	font-size: size(x-large) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding: 0px !important;
	text-align: left;
}

.btn-block {
	padding-bottom: 24px !important;
	padding-top: 28px !important;
}
</style>
