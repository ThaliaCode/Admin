<template>
	<div>
		<header-page
			:title="$route.meta.title"
			show-excel
			to-show
			emit-excel
			@emit-excel="emitExcel"
			@clean-product-filter="clearData"
		/>
		<app-actions :resource-uri="$route.name" @run-action="runAction" />
		<div class="d-block text-xs-right ma-3">
			<router-link :to="pathOldKardex">
				<v-icon color="primary">visibility</v-icon>
				Ir a versión anterior de kardex
			</router-link>
		</div>
		<v-layout wrap px-5 row align-end>
			<v-flex xs2 mr-3>
				<autocomplete-component
					:items="warehouses"
					:item="params.warehouseId"
					label-value="Almacén"
					return-object
					item-text="name"
					item-value="id"
					@return-data="setData($event, 'warehouseId')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs2 mr-3>
				<products-search-input
					flag-init
					:search-value="params.nameProduct"
					@search="openSearch"
					:ref-value="refValue"
					:clean-input="cleanInputValue"
				/>
			</v-flex>
			<v-flex xs2 mr-3>
				<autocomplete-component
					:items="typeDocuments"
					:item="params.typeDocumentId"
					item-text="name"
					item-value="id"
					placeholder-value="Movimiento"
					class="filter-select mt-4"
					return-object
					content-class="filter-select-content"
					@return-data="setData($event, 'typeDocumentId')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs4 mr-3>
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
			<v-flex xs1>
				<v-btn type="button" color="primary" class="btn-action" @click="updateKardex">
					Ver Kardex
				</v-btn>
			</v-flex>
		</v-layout>
		<div class="border-kardex mt-3 px-5 pt-1 pb-2">
			<v-layout row wrap justify-around align-center gap-3>
				<v-flex xs7>
					<div style="display: flex; flex-wrap: wrap; flex-direction: row; gap: 10px">
						<p class="item-blue">
							Código:
							<span class="item-gray">{{
								detailProduct.product ? detailProduct.product.code : null
							}}</span>
						</p>
						<p class="item-blue">
							Stock Actual: <span class="item-gray">{{ balanceData.quantity || 0 }}</span>
						</p>
						<p class="item-blue">
							Costo U: <span class="item-gray">{{ balanceData.cost || 0 }}</span>
						</p>
						<p class="item-blue">
							Costo Total: <span class="item-gray">{{ balanceData.total || 0 }}</span>
						</p>
						<p class="item-blue">
							Unidad:
							<span class="item-gray">{{
								detailProduct.product ? detailProduct.product.unit.name : null
							}}</span>
						</p>
					</div>
				</v-flex>
			</v-layout>
		</div>
		<div class="mt-4">
			<table-kardex
				:columns="columns"
				:rows="data"
				:actions="actions"
				:warehouseIds="[params.warehouseId]"
				by-product
				:last-purchase="newProduct.lastDatePurchase"
				:last-sale="newProduct.lastDateSale"
				:lastPage="lastPage"
				:currentPage="currentPage"
				:showDescription="true"
				:totals="totals[0]"
				:product="detailProduct"
				:show-total-kardex="showTotalKardex"
				@close-detail="showDetail($event, false)"
				@open-detail="showDetail($event, true)"
				@on-page="changePage"
				@close-total="closeTotal"
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
				not-valid-negative-stock
				v-if="isProductSearcher"
				:search-value="searchVal"
				:warehouseId="params.warehouseId"
				@add-product="setProduct"
				text="Agregar"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import detailWarehouse from '@/components/inventories/detail-warehouse';
import detailProduct from '@/components/inventories/detail-product';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import format from 'date-fns/format';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import subMonths from 'date-fns/sub_months';
import tableKardex from '@/components/inventories/table-kardex';
import dateComponent from '@/components/shared/date-component';

const { exactDate } = helper;

function clearData() {
	this.params.typeDocumentId = null;
	this.params.startDate = format(subMonths(this.$today(), 1), 'YYYY-MM-DD');
	this.params.endDate = exactDate(this.$today(), 'YYYY-MM-DD');

	this.loadData(
		this.params.productId,
		this.params.warehouseId,
		this.params.brandId,
		this.params.typeDocumentId,
		this.params.nameProduct
	);
}

async function created() {
	this.setParams();
	if (this.params.brandId && this.params.warehouseId) {
		await this.loadData(
			this.params.productId,
			this.params.warehouseId,
			this.params.brandId,
			null,
			true
		);
	}
	await this.loadResource();
	if (this.$route.query.warProductId) {
		await this.loadProduct();
	}
	const code = this.detailProduct.product && this.detailProduct.product.code;
	this.pathOldKardex = `/${code}/${this.productId}/${this.warehouseId}/${this.brandId}/kardex`;
}

function setParams() {
	this.params.startDate = format(subMonths(this.$today(), 1), 'YYYY-MM-DD');
	this.params.endDate = exactDate(this.$today(), 'YYYY-MM-DD');
	const { warehouseId, brandId, productId } = this.$route.params;
	this.params.warehouseId = Number(warehouseId);
	this.params.brandId = Number(brandId);
	this.params.productId = Number(productId);
	this.params.warProductId = Number(this.$route.query.warProductId);
}

function setData(value, model) {
	if (value) {
		this.params[model] = value.id || null;
	}
	if (model === 'warehouseId') {
		this.params.nameProduct = null;
	}
}

async function loadData(
	productId,
	warehouseId,
	brandId,
	documentTypeId,
	useRecalProd = false
) {
	const flagKardexOptimized = !!this.$userInfo.company.settings.flagKardexOptimized;

	const params = {
		startDate: this.params.startDate || undefined,
		endDate: this.params.endDate || undefined,
	};
	const body = {};
	if (documentTypeId) {
		body.documentTypeId = documentTypeId;
	}
	if (brandId) {
		body.brandId = brandId;
	}
	if (warehouseId) {
		body.warehouseId = warehouseId;
	}
	if (productId) {
		body.productId = productId;
	}

	// Parametros para recalcular el stock promedio
	const bodyReCal = {
		productId: productId || this.params.productId,
		brandId,
		warehouseId,
	};
	try {
		if (useRecalProd) {
			await this.$httpProducts.post('kardex/recalculate-product', bodyReCal);
		}
		const configParams = params;

		if (flagKardexOptimized) {
			configParams.relationAdd =
				'products,kardexBalance,documentTypeData,brand,documentTypeData,warehouse';
		}

		const requests = [
			this.$httpProducts.post('kardex/list', body, { params }),
			this.$httpProducts.post('kardex/list-total', body, { params }),
		];
		[{ data: this.data }, { data: this.totals }] = await Promise.all(requests);
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
	} catch (error) {
		this.showGenericError();
	}
	this.isClean = false;
}

function cleanInputValue(val) {
	if (val) {
		this.searchVal = null;
	}
}

function setProduct(prod) {
	this.setInformation(prod, true);
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
}

function isProductSearcher() {
	return this.action.code === 'product-searcher';
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
		this.$httpProducts.get('warehouses'),
		this.$httpProducts.get('type-documents'),
	];
	const responses = await Promise.all(request);
	this.warehouses = responses[0].data;
	this.typeDocuments = responses[1].data;
}

function setInformation(product, flagSearch) {
	this.detailProduct = product;
	this.params.nameProduct = product.name || product.product.name;
	this.params.productId = flagSearch
		? product.warWarehouseProductBrandId
		: product.productId;
	this.params.brandId = product.brandId || product.brand.id;
	this.params.warProductId = flagSearch ? product.id : this.params.warProductId;
	this.newProduct = {
		code: product.code || product.product.code,
		stock: product.stock,
		unitName: product.unit ? product.unit.name : product.unitName,
	};
}

function updateKardex() {
	this.loadData(
		this.params.productId,
		this.params.warehouseId,
		this.params.brandId,
		this.params.typeDocumentId
	);
	this.updateUrl();
	this.loadProduct();
}

function updateUrl() {
	this.$router.push({
		name: 'page-new-kardex',
		params: {
			brandId: this.params.brandId,
			code: this.newProduct.code,
			productId: this.params.productId,
			warehouseId: this.params.warehouseId,
		},
		query: {
			warProductId: this.params.warProductId,
		},
	});
}

function changePage(page) {
	this.currentPage = page;
	this.loadData(
		this.params.productId,
		this.params.warehouseId,
		this.params.brandId,
		this.params.typeDocumentId
	);
}

async function loadProduct() {
	const productId =
		Number(this.$route.query.warProductId) ||
		this.productId ||
		Number(this.params.productId);
	const { data: response } = await this.$httpProducts.get(`products/${productId}`);
	this.setInformation(response);
	this.detailProductInit = response;
}

function closeTotal() {
	this.data = this.data.map((r) => {
		const newR = { ...r };
		newR.isOpen = false;
		return newR;
	});
}

function data() {
	return {
		detailProduct: {},
		detailProductInit: {},
		isClean: false,
		data: [],
		newProduct: {},
		units: [],
		params: {
			startDate: null,
			endDate: null,
			brandId: null,
			warehouseId: null,
			productId: null,
			nameProduct: null,
			typeDocumentId: null,
			warProductId: null,
		},
		warehouses: [],
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
		showTotalKardex: this.$userInfo.company.settings.flagTotalKardex,
		rows: [],
		searchVal: null,
		typeDocuments: [],
		lastPage: 0,
		currentPage: 1,
		movementsTypes: [
			{ id: 1, text: 'Entrada de productos' },
			{ id: 2, text: 'Salida de productos' },
		],
		totals: [],
		pathOldKardex: '',
		flagKardexValued: this.$userInfo.company.settings.flagKardexValued,
	};
}

export default {
	name: 'new-kardex',
	created,
	watch: {
		cleanInputValue,
	},
	methods: {
		changePage,
		clearData,
		closeModal,
		closeTotal,
		loadData,
		loadProduct,
		loadResource,
		openSearch,
		runAction,
		setData,
		setInformation,
		setParams,
		setProduct,
		showDetail,
		updateKardex,
		updateUrl,
		emitExcel(close) {
			if (close) {
				this.modal.open = false;
				this.modal.message = '';
				this.loadData(
					this.params.productId,
					this.params.warehouseId,
					this.params.brandId,
					this.params.warehouseIds,
					this.params.typeDocumentId
				);
			}
			if (this.params.nameProduct) {
				const params = {
					brandId: this.params.brandId,
					documentTypeIds: this.params.typeDocumentId || undefined,
					endDate: this.params.endDate,
					nameProduct: this.params.nameProduct,
					productId: this.params.productId,
					startDate: this.params.startDate,
					warehouseId: this.params.warehouseId || undefined,
					// warehouseIds: this.params.warehouseIds,
					flagNotShowCostPrice: this.$userInfo.flagNotShowCostPrice,
				};
				this.onEmitExcel('list-kardex-report', 'list_kardex_', params);
			} else {
				this.showNotification(
					'Es necesario seleccionar un producto para realizar la descarga.',
					'info'
				);
			}
		},
		setDate({ model, value }) {
			const today = this.$today();
			if (value) {
				this.params[model] = format(value, 'YYYY-MM-DD');
			} else if (model === 'startDate' && !value) {
				this.params.startDate = format(subMonths(today, 1), 'YYYY-MM-DD');
			} else {
				this.params.endDate = today;
			}
		},
	},
	computed: {
		isProductSearcher,
		detailWarehouseModal,
		detailProductModal,

		balanceData() {
			const item = this.data.length ? this.data[this.data.length - 1] : null;
			if (!item) return { quantity: 0, cost: 0, total: 0 };
			const flagKardexOptimized = !!this.$userInfo.company.settings.flagKardexOptimized;
			const dataBalance = flagKardexOptimized ? item.kardexBalance : item;
			const { balanceQuantity = 0, balanceCost = 0, balanceTotal = 0 } = dataBalance;

			return {
				quantity: balanceQuantity,
				cost: balanceCost,
				total: balanceTotal,
			};
		},
	},
	components: {
		actionSidebar,
		appActions,
		autocompleteComponent,
		detailWarehouse,
		detailProduct,
		headerPage,
		productsSearchForm,
		productsSearchInput,
		tableKardex,
		dateComponent,
	},
	data,
	props: {
		brandId: [Number, String],
		code: [Number, String],
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
</style>
