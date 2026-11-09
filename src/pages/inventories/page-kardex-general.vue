<template>
	<div>
		<header-page
			caption-navigation="Gestiona tu inventario"
			column-class="xs12"
			justify-class="justify-end"
			:title="$route.meta.title"
			emit-excel
			show-excel
			to-show
			:show-clean="false"
			@emit-excel="downloadExcel"
		>
			<kardex-bar-info
				:product-code="detailProduct.code"
				:actual-stock="detailProduct.stock"
				:total-cost="detailProduct.cost || detailProduct.lastCost"
				:product-unity="detailProduct.unitCode"
			></kardex-bar-info>
		</header-page>
		<app-actions
			:resource-uri="$route.name"
			:value-disabled="actionsDisabled"
			@run-action="runAction"
		/>
		<v-layout wrap mt-2 px-5 row d-flex justify-space-between align-center>
			<v-flex xs2>
				<products-search-input
					flag-init
					:search-value="params.nameProduct"
					@search="openSearch"
					:ref-value="refValue"
					:clean-input="cleanInputValue"
				/>
			</v-flex>
			<v-flex xs2 mb-1>
				<autocomplete-component
					:items="typeDocuments"
					:item="filteredTypeDocuments"
					multiple
					item-text="name"
					item-value="id"
					placeholder-value="Movimiento"
					class="filter-select mt-4"
					return-object
					content-class="filter-select-content"
					@return-data="setData($event, 'documentTypeIds')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs2 pt-3>
				<v-layout row align-center>
					<v-tooltip top>
						<v-checkbox
							small
							slot="activator"
							class="checkbox-customers label-text mr-3"
							color="primary"
							hide-details
							label="Ignorar filas de pedido ecommerce"
							v-model="params.flagIgnoreOrdersMovements"
							style="width: 300px"
						/>
						<span>Ignorar historial de pedidos</span>
					</v-tooltip>
				</v-layout>
			</v-flex>
			<v-flex xs3>
				<v-layout wrap align-center>
					<v-flex xs6 pr-2>
						<label class="caption">Fecha Inicial</label>
						<date-component
							:date="params.startDate"
							icon="/static/img/calendar.svg"
							@on-input="setDate({ model: 'startDate', value: $event })"
						></date-component>
					</v-flex>
					<v-flex xs6>
						<label class="caption">Fecha Final</label>
						<date-component
							:date="params.endDate"
							icon="/static/img/calendar.svg"
							@on-input="setDate({ model: 'endDate', value: $event })"
						></date-component>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs1 mt-4>
				<v-btn
					:disabled="!params.productId"
					type="button"
					color="primary"
					class="btn-action"
					@click="updateKardex(true)"
				>
					Ver Kardex
				</v-btn>
			</v-flex>
			<v-flex xs1 mt-4>
				<v-btn type="button" color="pink" class="btn-action" @click="clearData">
					Limpiar
				</v-btn>
			</v-flex>
		</v-layout>
		<div class="mt-4 table-kardex-container">
			<table-kardex
				:caption="showIndicator ? caption : ''"
				:actions="actions"
				:columns="columns"
				:currentPage="currentPage"
				:last-purchase="newProduct.lastDatePurchase"
				:last-sale="newProduct.lastDateSale"
				:product="detailProduct"
				:rows="data"
				:totals="totals[0]"
				:warehouse-ids="params.warehouseIds"
				:last-page="lastPage"
				:show-pagination="showPagination"
				:by-product="showFlagKardexValued"
				:show-total-kardex="showTotalKardex"
				:show-role-warehouse="showRoleWarehouse"
				@load-kardex="loadKardexCost"
				@close-detail="showDetail($event, false)"
				@close-modal="closeModal"
				@filter-modal="filterModal"
				@open-detail="showDetail($event, true)"
				@on-page="changePage"
				@close-total="closeTotal"
				@open-slider="openList"
				@calc-stock="calStockRow($event)"
			/>
		</div>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<detail-warehouse
				v-if="detailWarehouseModal"
				@close-modal="closeModal"
				:information="detailProduct"
			/>
			<detail-product
				v-if="detailProductModal"
				:data="detailProduct"
				@close-modal="closeModal"
			/>
			<products-search-form
				v-if="isProductSearcher"
				not-valid-negative-stock
				master
				:search-value="searchVal"
				:warehouseId="params.warehouseId"
				@add-product="setProduct"
				text="Agregar"
			/>
			<select-brand-warehouse
				v-if="action.code === 'calc-stock-average-cost'"
				:warehouses="warehouses"
				:brands="brands"
				@close="closeModal"
				@send-information="sendInformation"
			/>
		</action-sidebar>
		<v-dialog v-model="modalOpen" persistent max-width="450">
			<v-card class="pa-2">
				<v-card-title class="headline justify-center">
					Estás intentando cargar la información de un rango de fechas mayor a 1 año. Para
					poder ver toda la información es necesario generar el reporte ya que en el
					listado solo mostraremos la información de un rango de fechas de hasta 1 año.
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-end>
						<v-btn
							class="btn-action btn-auto white--text py-2 px-4"
							@click.native="downloadExcel(true)"
							color="secondary"
						>
							Generar
						</v-btn>
						<v-btn
							class="btn-action btn-auto white--text py-2 px-4"
							@click.native="handleCloseModal"
							color="primary"
						>
							Entendido
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<screen-loading v-if="showLoading" />
	</div>
</template>

<script>
import { addDays, differenceInDays, subDays, format, subMonths } from 'date-fns';
import dateComponent from '@/components/shared/date-component';
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import detailProduct from '@/components/inventories/detail-product';
import detailWarehouse from '@/components/inventories/detail-warehouse';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import kardexBarInfo from '@/components/inventories/kardex-bar-info';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import tableKardex from '@/components/inventories/table-kardex';
import screenLoading from '@/components/shared/utils/screen-loading';
import selectBrandWarehouse from '@/components/inventories/select-brand-warehouse';
import typeProduct from '@/shared/type-product';

const { exactDate } = helper;

function rowIsSelected({ id, isSelected }) {
	this.checkAll = this.warehousesModal.every((row) => row.isSelected);
	if (isSelected) {
		this.dataSelected.push(this.warehousesModal.find((row) => row.id === id));
	} else {
		const index = this.dataSelected.findIndex((row) => row.id === id);
		this.dataSelected.splice(index, 1);
	}
}

function created() {
	this.showTotalKardex = this.$userInfo.company.settings.flagTotalKardex;
	this.showFlagKardexValued = !this.$userInfo.company.settings.flagKardexValued;
	this.showRoleWarehouse = !this.isWarehouse && !this.$userInfo.flagNotShowCostPrice;
	this.params.warehouseId = Number(this.warehouseId);
	this.params.brandId = Number(this.brandId);
	this.params.documentTypeIds = Number(this.documentTypeIds);
	this.params.startDate = format(subMonths(this.$today(), 1), 'YYYY-MM-DD');
	this.params.endDate = exactDate(this.$today(), 'YYYY-MM-DD');
	this.params.productId = this.productId;
	this.params.nameProduct = this.$route.query.name;
	this.startDate = format(subMonths(this.$today(), 1), 'YYYY-MM-DD');
	this.endDate = exactDate(this.$today(), 'YYYY-MM-DD');
	this.newObject.warehouseId = Number(this.warehouseId);
	this.newObject.brandId = this.brandId;
	this.newObject.startDate = format(subMonths(this.$today(), 1), 'YYYY-MM-DD');
	this.newObject.endDate = exactDate(this.$today(), 'YYYY-MM-DD');
	this.newObject.productId = Number(this.productId);
	this.loadResource();
	this.loadWarehouses();
	this.newObject.dateOne = this.startDate;
	this.newObject.dateTwo = this.endDate;
	this.data = [...this.dataDefault];
}

function openList() {
	this.action.code = 'filters-kardex';
	this.action.open = true;
	this.action.title = 'FILTROS';
	this.action.width = 570;
}

function clearData() {
	this.params = {
		startDate: this.newObject.startDate,
		endDate: this.newObject.endDate,
		warehouseId: this.newObject.warehouseId,
		productId: this.newObject.productId,
		brandId: this.newObject.brandId,
		nameProduct: this.newObject.nameProduct,
		documentTypeIds: this.newObject.documentTypeIds,
		warehouseIds: this.newObject.warehouseIds,
	};
	this.filteredTypeDocuments = [];
	this.warehousesModal = this.warehousesModal.map((p) => {
		const newArray = { ...p };
		newArray.isSelected = false;
		newArray.isFilter = false;
		return newArray;
	});
	this.startDate = this.newObject.dateOne;
	this.endDate = this.newObject.dateTwo;
	this.caption = 'Elige un producto para visualizar la información';
	this.showIndicator = true;
	this.detailProduct = {
		product: {},
		warehouse: {},
	};
	this.data = [...this.dataDefault];
}

function setData(value, model) {
	if (model === 'documentTypeIds' && value) {
		this.filteredTypeDocuments = value;
		this.params[model] = value.filter((p) => p.id !== null).map((p) => p.id);
	} else {
		if (value) {
			this.params[model] = value.id || null;
		}
		if (model === 'warehouseId') {
			this.params.nameProduct = null;
		}
	}
}

async function loadData(productId, warehouseId, brandId, warehouseIds, documentTypeIds) {
	// const differenceDates = differenceInCalendarMonths(this.params.endDate, this.params.startDate);
	// this.showPagination = differenceDates >= 3;
	const flagKardexOptimized = !!this.$userInfo.company.settings.flagKardexOptimized;

	const newParams = {};

	newParams.startDate = format(this.params.startDate, 'YYYY-MM-DD');
	newParams.endDate = format(this.params.endDate, 'YYYY-MM-DD');

	newParams.page = this.currentPage;
	const body = {
		brandId: brandId || undefined,
		documentTypeIds: documentTypeIds || undefined,
		productId: productId || undefined,
		warehouseId: warehouseId || undefined,
		warehouseIds: warehouseIds || undefined,
	};
	const newParamsList = newParams;
	newParamsList.limit = 100;
	if (flagKardexOptimized) {
		newParams.relationAdd =
			'products,kardexBalance,documentTypeData,brand,documentTypeData,warehouse';
	}

	try {
		const requests = [
			this.$httpProducts.post(
				'kardex/list',
				{
					...body,
					flagIgnoreOrdersMovements: this.params.flagIgnoreOrdersMovements,
				},
				{ params: newParamsList }
			),
			this.$httpProducts.post('kardex/list-total', body, {
				params: {
					page: this.currentPage,
					startDate: newParams.startDate,
					endDate: newParams.endDate,
				},
			}),
		];
		[{ data: this.data, headers: this.headers }, { data: this.totals }] =
			await Promise.all(requests);
		if (this.data.length > 0) {
			this.showIndicator = false;
			this.caption = '';
			this.data = this.data.map((row) => {
				const newRow = { ...row };
				newRow.warehouse = row.warehouse ? row.warehouse : {};
				newRow.brand = row.brand ? row.brand : {};
				newRow.product = row.product ? row.product : {};
				newRow.documentTypeCode = row.documentTypeData ? row.documentTypeData.code : '';
				newRow.documentTypeName = row.documentTypeData ? row.documentTypeData.name : '';
				newRow.isOpen = false;
				return newRow;
			});
			this.lastPage = Number(this.headers['x-last-page']);
		} else {
			this.showIndicator = true;
			this.caption =
				'El producto seleccionado no registra movimientos. Puedes elegir otro producto';
			this.data = [...this.dataDefault];
		}
	} catch (error) {
		console.error(error);
		this.showGenericError();
	} finally {
		this.showLoading = false;
	}
	this.isClean = false;
}

function cleanInputValue(val) {
	if (val) {
		this.searchVal = null;
	}
}

function setProduct(prod) {
	this.currentPage = 1;
	this.params.page = 1;
	this.setInformation(prod);
	this.closeModal();
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
	this.clearWarehouses();
}

function clearWarehouses() {
	this.dataSelected = [];
	this.warehousesModal = this.warehousesModal.map((p) => {
		const newArray = { ...p };
		if (p.isFilter === true) {
			newArray.isSelected = true;
		} else {
			newArray.isSelected = false;
		}
		return newArray;
	});
}

function isProductSearcher() {
	return this.action.code === 'product-searcher';
}

function openFiltersKardex() {
	return this.action.code === 'filters-kardex';
}

function detailProductModal() {
	return this.action.code === 'PD';
}

function detailWarehouseModal() {
	return this.action.code === 'SD';
}

function runAction({ code, name }) {
	if (code === 'SD') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 570;
	} else if (code === 'PD') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 570;
	} else if (code === 'product-searcher') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 570;
	} else if (code === 'calc-stock-average-cost') {
		const branId = this.detailProduct.brands.length
			? this.detailProduct.brands[0].id
			: null;
		const warehouseId = this.detailProduct.warehouseName.length
			? this.warehouses.find((w) => w.name === this.detailProduct.warehouseName).id ||
			  null
			: null;
		this.calcStockAverageCost(branId, warehouseId);
	}
}

function showDetail(row, open) {
	if (!open) {
		this.$set(row, 'isOpen', open);
	} else {
		this.data = this.data.map((r) => {
			const newR = { ...r };
			newR.isOpen = r.id === row.id ? open : !open;
			return newR;
		});
	}
}

async function loadResource() {
	const request = [
		this.$httpProducts.get('type-documents'),
		this.$httpProducts.get('brands'),
	];
	const responses = await Promise.all(request);
	this.typeDocuments = responses[0].data;
	this.brands = responses[1].data;
}

function setInformation(product) {
	this.detailProduct = product;
	this.params.nameProduct = product.name || product.product.name;
	this.params.productId = product.productId || product.id;
	this.params.brandId =
		product.brands && product.brands.length ? product.brands[0].id : product.brandId;
	this.params.warehouseIds = product.warehouseIds;
	this.newProduct = {
		code: product.code,
		stock: product.stock,
		unitName: product.unit ? product.unit.name : product.unitName,
	};
}

function updateKardex(resetCurrentPage = false) {
	const differenceDays = differenceInDays(this.params.endDate, this.params.startDate);
	const rangeExceeded = differenceDays > 365;
	this.noReloadingList = rangeExceeded;

	if (resetCurrentPage) {
		this.currentPage = 1;
		this.params.page = 1;
	}

	// si los filtros pasan mas de un dia
	if (rangeExceeded) {
		this.modalOpen = true;
		return;
	}
	this.loadData(
		this.params.productId,
		this.params.warehouseId,
		this.params.brandId,
		this.params.warehouseIds,
		this.params.documentTypeIds
	);
}

function setDate({ model, value }) {
	if (value) {
		this.params[model] = format(value, 'YYYY-MM-DD');
	} else if (model === 'startDate' && !value) {
		this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	} else {
		this.params.endDate = this.$today();
	}
	this[model] = format(value, 'YYYY-MM-DD');
}

function changePage(page) {
	this.currentPage = page;
	this.updateKardex();
}

function costUnit() {
	if (this.data.length) {
		return this.data[this.data.length - 1].balanceCost;
	}
	return 0;
}

function costTotal() {
	if (this.data.length) {
		return this.data[this.data.length - 1].balanceCost * this.detailProduct.stock;
	}
	return 0;
}

function closeTotal() {
	this.data = this.data.map((r) => {
		const newR = { ...r };
		newR.isOpen = false;
		return newR;
	});
}

function filterModal(warehousesSelected) {
	this.currentPage = 1;
	this.params.page = 1;
	this.warehousesModal = this.warehousesModal.map((o) => {
		const newWarehouse = { ...o };
		newWarehouse.isFilter = o.isSelected;
		return newWarehouse;
	});
	this.params.warehouseIds = warehousesSelected.map((p) => p.warehouse.id);
	this.action.open = false;
	this.updateKardex();
}

async function loadWarehouses(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	try {
		const { data: response } = await this.$httpProducts.get('warehouses');
		this.warehousesModal = response.map((p) => {
			const newArray = { ...p };
			newArray.isFilter = false;
			return newArray;
		});
	} catch (error) {
		this.showGenericError();
	}
}

function onPage(page) {
	this.loadWarehouses(page);
}

async function downloadExcel(close = false) {
	if (this.params.nameProduct) {
		const flagKardexOptimized = !!this.$userInfo.company.settings.flagKardexOptimized;
		if (flagKardexOptimized) {
			const body = {
				productId: this.params.productId,
				brandId: this.params.brandId,
				warehouseId: this.params.warehouseId || undefined,
			};
			try {
				this.showLoading = true;
				await this.$httpProducts.post('kardex/recalculate-product', body);
			} catch (error) {
				this.showLoading = false;
				this.showGenericError();
				return;
			}
			this.showLoading = false;
		}
		const params = {
			brandId: this.params.brandId,
			documentTypeIds: this.params.documentTypeIds || undefined,
			endDate: this.params.endDate,
			nameProduct: this.params.nameProduct,
			productId: this.params.productId,
			startDate: this.params.startDate,
			warehouseId: this.params.warehouseId || undefined,
			warehouseIds: this.params.warehouseIds,
			flagNotShowCostPrice: this.$userInfo.flagNotShowCostPrice,
		};
		this.onEmitExcel('list-kardex-report', 'kardex_general_', params);
	} else {
		this.showNotification(
			'Es necesario seleccionar un producto para realizar la descarga.',
			'info'
		);
	}
	if (close) {
		this.handleCloseModal();
	}
}

function handleCloseModal() {
	// close Modal
	this.modalOpen = false;

	// fix params
	this.params.endDate = format(addDays(this.params.startDate, 364), 'YYYY-MM-DD');

	// reload
	this.loadData(
		this.params.productId,
		this.params.warehouseId,
		this.params.brandId,
		this.params.warehouseIds,
		this.params.documentTypeIds
	);
}

function actionsDisabled() {
	const disabled = !this.params.productId;
	return [{ code: 'calc-stock-average-cost', disabled }];
}

function sendInformation({ brandId, warehouseId }) {
	this.closeModal();
	this.calcStockAverageCost(brandId, warehouseId);
}

function loadKardexCost() {
	this.updateKardex();
}

async function calStockRow(row) {
	this.showLoading = true;
	const body = {
		productId: this.params.productId,
		brandId: this.params.brandId,
		warehouseId: this.params.warehouseId || undefined,
		kardexId: row.id,
	};
	try {
		const response = await this.$httpProducts.post('kardex/recalculate-product', body);
		this.showNotification('El producto fue calculado correctamente.');
		if (response.status === 200) {
			this.updateKardex();
		}
	} catch (error) {
		this.showGenericError();
	}
}

async function calcStockAverageCost(brandId, warehouseId) {
	this.showLoading = true;
	const body = {
		productId: this.params.productId,
		brandId,
		warehouseId,
	};
	try {
		const response = await this.$httpProducts.post('kardex/recalculate-product', body);
		if (response.status === 200) {
			this.updateKardex();
		}
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		caption: 'Elige un producto para visualizar la información',
		checkAll: false,
		dataSelected: [],
		detailProduct: {
			product: {},
			warehouse: {},
		},
		typeProduct,
		detailProductInit: {},
		startDate: null,
		endDate: null,
		newObject: {
			startDate: null,
			endDate: null,
			brandId: 0,
			warehouseId: 0,
			warehouseIds: [],
			productId: null,
			nameProduct: null,
			dateOne: null,
			dateTwo: null,
			documentTypeIds: null,
		},
		isClean: false,
		data: [],
		dataDefault: [
			{
				id: 1,
				brand: {},
				isOpen: false,
				product: {},
				warehouse: {},
			},
			{
				id: 2,
				brand: {},
				isOpen: false,
				product: {},
				warehouse: {},
			},
			{
				id: 3,
				brand: {},
				isOpen: false,
				product: {},
				warehouse: {},
			},
			{
				id: 4,
				brand: {},
				isOpen: false,
				product: {},
				warehouse: {},
			},
			{
				id: 5,
				brand: {},
				isOpen: false,
				product: {},
				warehouse: {},
			},
			{
				id: 6,
				brand: {},
				isOpen: false,
				product: {},
				warehouse: {},
			},
			{
				id: 7,
				brand: {},
				isOpen: false,
				product: {},
				warehouse: {},
			},
			{
				id: 8,
				brand: {},
				isOpen: false,
				product: {},
				warehouse: {},
			},
			{
				id: 9,
				brand: {},
				isOpen: false,
				product: {},
				warehouse: {},
			},
			{
				id: 10,
				brand: {},
				isOpen: false,
				product: {},
				warehouse: {},
			},
		],
		newProduct: {},
		units: [],
		params: {
			startDate: null,
			endDate: null,
			brandId: 0,
			warehouseId: 0,
			warehouseIds: [],
			productId: null,
			nameProduct: null,
			documentTypeIds: null,
			page: null,
			flagIgnoreOrdersMovements: true,
		},
		warehouses: [],
		warehousesModal: [],
		rowsKardex: [],
		refValue: 'searcher-kardex',
		actions: [
			{
				id: 1,
				name: 'Referencia',
			},
			{
				id: 2,
				name: 'Tipo de Documento',
			},
			{
				id: 3,
				name: 'Origen',
			},
			{
				id: 4,
				name: 'Número',
			},
			{
				id: 5,
				name: 'Cantidad',
			},
			{
				id: 6,
				name: 'Costo',
			},
			{
				id: 7,
				name: 'Precio',
			},
			{
				id: 8,
				name: 'Empleado',
			},
			{
				id: 9,
				name: 'CC',
			},
		],
		cleanInputValue: false,
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 600,
		},
		showRoleWarehouse: true,
		selectedProduct: '',
		columns: [
			{
				id: 1,
				name: 'Cant',
				value: 'quantityEntry',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Costos',
				value: 'costsEntry',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Total',
				value: 'totalEntry',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Cant.',
				value: 'quantityEnd',
				visible: true,
				checkActions: true,
			},
			{
				id: 5,
				name: 'Costos',
				value: 'costsEnd',
				visible: true,
				checked: true,
			},
			{ id: 6, name: 'Total', value: 'totalEnd', visible: true, checked: true },
			{
				id: 7,
				name: 'Cant',
				value: 'quantityBalance',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Costos',
				value: 'costBalance',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Total',
				value: 'totalBalance',
				visible: true,
				checked: true,
			},
			{ id: 10, name: 'Acción', visible: true, checked: true },
		],
		showFlagKardexValued: false,
		showTotalKardex: false,
		rows: [],
		searchVal: null,
		typeDocuments: [],
		filteredTypeDocuments: [],
		lastPage: 0,
		currentPage: 1,
		movementsTypes: [
			{ id: 1, text: 'Entrada de productos' },
			{ id: 2, text: 'Salida de productos' },
		],
		totals: [],
		showIndicator: true,
		headers: {},
		showPagination: true,
		modalOpen: false,
		noReloadingList: false,
		showLoading: false,
	};
}

export default {
	name: 'page-kardex-general',
	components: {
		appActions,
		actionSidebar,
		autocompleteComponent,
		detailWarehouse,
		detailProduct,
		headerPage,
		kardexBarInfo,
		productsSearchForm,
		productsSearchInput,
		tableKardex,
		screenLoading,
		selectBrandWarehouse,
		dateComponent,
	},
	computed: {
		isProductSearcher,
		detailWarehouseModal,
		detailProductModal,
		costUnit,
		costTotal,
		openFiltersKardex,
		actionsDisabled,
	},
	created,
	data,
	watch: {
		cleanInputValue,
	},
	methods: {
		calStockRow,
		clearWarehouses,

		rowIsSelected,
		clearData,
		setData,
		filterModal,
		loadKardexCost,
		loadData,
		setProduct,
		openSearch,
		openList,
		runAction,
		closeModal,
		handleCloseModal,
		showDetail,
		loadWarehouses,
		loadResource,
		setInformation,
		updateKardex,
		setDate,
		changePage,
		closeTotal,
		onPage,
		calcStockAverageCost,
		sendInformation,
		downloadExcel,
	},
	props: {
		brandId: [Number, String],
		documentTypeIds: [Number, String],
		productId: [Number, String],
		warehouseId: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.border-kardex {
	border-bottom: 1px solid map-get($colors, summary);
	border-top: 1px solid map-get($colors, summary);
}

.item-blue {
	color: map-get($colors, background-sidebar);
	font-family: map-get($fonts, open-semibold);
	font-size: 14px;
	margin: 0;
}

.item-gray {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-regular);
	font-size: 14px;
	margin-bottom: 0;
}

.border-right {
	border-left: 1px solid map-get($colors, summary);
	padding-left: 20px;
}

.table-kardex-container {
	height: 680px;
	position: relative;
}

.headline {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 440px;
	padding-top: 37px !important;
	text-align: justify;
}

.subtext {
	color: color(grey-border);
	font-family: font(open-regular);
	font-size: size(small) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding: 0px !important;
	text-align: center;
}

.btn-block {
	padding-bottom: 24px !important;
	padding-top: 28px !important;
}
</style>
