<template>
	<div>
		<header-page
			:columns="columns"
			name="accounting-products"
			:rows="dataSelected"
			:title="$route.meta.title"
			to-show
			v-on:clean-product-filter="onCleanData">
		</header-page>
		<app-actions
			:resource-uri="$route.name"
			:value-disabled="actionsDisabled"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<general-filter>
			<v-layout row wrap justify-center>
				<v-flex xs12 sm6 md3 px-1 class="align-col">
					<v-layout>
						<v-flex xs2>
							<v-tooltip top>
								<v-btn
									slot="activator"
									class="general-filter-button ma-0"
									:disabled="!warehouse"
									@click.native="goToMinStock"
									block>
									<v-icon>transfer_within_a_station</v-icon>
								</v-btn>
								<span>Solicitar productos con stock mínimo por almacén</span>
							</v-tooltip>
						</v-flex>
						<v-flex xs10 pl-2>
							<label class="caption">Almacén</label>
							<v-select
								v-bind:items="warehouses"
								v-model="warehouse"
								label="Almacén"
								item-text="name"
								single-line
								bottom
								hide-details
								class="filter-select"
								content-class="filter-select-content"
								v-on:input="filterRows"
							></v-select>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 sm6 md3 px-1 class="align-col">
					<label class="caption">Categorías</label>
					<!-- <v-select
						v-bind:items="categories"
						v-model="category"
						label="Categoría"
						item-text="name"
						single-line
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
						v-on:input="filterRows"
					></v-select> -->
					<categories-autocomplete
						:item="category"
						:items="categories"
						item-text="name"
						:slot-custom="true"
						:label="`Categoría`"
						@return-data="filterRows"
					></categories-autocomplete>
				</v-flex>
				<v-flex xs12 sm6 md3 px-1 class="align-col">
					<label class="caption">Marca</label>
					<v-select
						v-bind:items="brands"
						v-model="brand"
						label="Marca"
						item-text="name"
						single-line
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
						v-on:input="filterRows"
					></v-select>
				</v-flex>
				<v-flex xs12 sm6 md3 px-1 mt-4
					class="align-col">
					<v-btn
						type="button"
						class="general-filter-button"
						@click="openModal(featuresAction)">
						Características
						<v-icon>add</v-icon>
					</v-btn>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto">
			<app-table
				name="accounting-products"
				selectable
				include-filter
				local-storage
				:columns="columns"
				:current-page="currentPage"
				:rows="data"
				:key-value="keyValue"
				:check-all="checkAll"
				:last-page="lastPage"
				:clean-search="isClean"
				@on-search-event="callServiceAndSearch"
				@on-page="changePage"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
				@table-option-event="openModal">
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.warehouse.name }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.product.code }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.product.inlineAlternateCode }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.product.name }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.product.category.name }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.product.description }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.brand.name }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.account }}</td>
					<td v-show="showRow(columns, 9)">{{ props.row.priceCost | round }}</td>
					<td v-show="showRow(columns, 10)">{{ returnPriceList(props.row) | round }}</td>
					<td v-show="showRow(columns, 11)">{{ props.row.stock }}</td>
					<td>
						<router-link
							v-if="props.row.product.isCombo"
							:to="{ name: 'edit-composition-products', params: { id: props.row.id } }"
							class="table-icon">
							<v-icon
								color="primary"
								size="19">
								edit
							</v-icon>
						</router-link>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
			:code-action="action.code"
			@close-modal="closeModal">
		</action-sidebar>
	</div>
</template>

<script>
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import categoriesAutocomplete from '@/components/shared/autocomplete/categories-autocomplete';
import appActions from '@/components/shared/app-actions';
import actionSidebar from './../shared/action-sidebar';
import appTable from './../shared/table/app-table';
import generalFilter from './../shared/general-filter';
import headerPage from './../shared/header-page';
import helpAction from './../shared/help-action';
import productMixin from './../../mixins/products-mixins';

const { setNewProperty } = lib;

function created() {
	this.currentPage = helper.getLocalData('current-page') || 1;
	const indexWarehouse = this.columns.findIndex(k => k.value === 'warehouseName');
	this.columns[indexWarehouse].name = this.labelWarehouse();
	this.filterData();
	this.loadData();
	const localSelections = helper.getLocalData('accounting-products-selected') || [];
	if (localSelections.length > 0) {
		this.dataSelected = localSelections.map(setNewProperty('isSelected', true));
	}
}

function actionsDisabled() {
	const dataFiltered = this.data.filter(d => d.isSelected);
	const disabled = dataFiltered.length !== 1;
	return [{ code: 'edit-product', disabled }];
}

function callServiceAndSearch(search) {
	if (search) this.searchData = search.replace(/\?/g, '_');
	if (search && this.featuresSelected) {
		this.params.code = this.featuresSelected.concat(` ${this.searchData}`);
	} else if (this.featuresSelected) {
		this.params.search = this.featuresSelected;
	} else if (search) {
		this.params.search = this.searchData;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
	this.loadData();
}

function changePage(page) {
	helper.setLocalData('current-page', page);
	this.currentPage = page;
	this.loadData();
}

function cleanDataByWarehouseChange() {
	this.dataSelected = this.dataSelected.map((e) => {
		const newDataSelected = e;
		newDataSelected.isSelected = false;
		return newDataSelected;
	});
	this.dataSelected = [];
	this.checkAll = false;
}

function clearSelectedProducts() {
	this.data = this.data.map((p) => {
		const newP = { ...p };
		newP.isSelected = false;
		return newP;
	});
	this.dataSelected = [];
}

function closeModal() {
	this.action.open = false;
}

async function filterData() {
	const params = { flagSync: true };
	const request = [
		this.$httpProducts.get('warehouses'),
		this.categoriesList(params),
		this.$httpProducts.get('brands'),
	];
	try {
		const responses = await Promise.all(request);
		this.warehouses = responses[0].data.map((warehouse) => {
			const newWarehouse = { ...warehouse };
			newWarehouse.type = 'warehouses';
			return newWarehouse;
		});
		this.categories = responses[1].data.map((category) => {
			const newCategory = { ...category };
			newCategory.type = 'categories';
			return newCategory;
		});
		this.brands = responses[2].data.map((brand) => {
			const newBrand = { ...brand };
			newBrand.type = 'brands';
			return newBrand;
		});
	} catch (err) {
		this.showNotification('Ocurrió un error interno del servidor', 'error');
	}
}

function filterRows(filter) {
	if (filter.type === 'warehouses') {
		this.params.warehouseId = filter.id;
	} else if (filter.type === 'categories') {
		this.params.categoryId = filter.id;
	} else if (filter.type === 'brands') this.params.brandId = filter.id;
	this.currentPage = 1;
	this.loadData();
}

async function loadData() {
	const url = 'products';
	this.params.page = this.currentPage;
	this.params.limit = 20;
	try {
		const response = await this.$httpProducts.get(url, { params: this.params });
		this.data = response.data.map((row) => {
			const newRow = { ...row };
			newRow.warehouse = row.warehouse ? row.warehouse : {};
			newRow.brand = row.brand ? row.brand : {};
			newRow.product = row.product ? row.product : { category: {} };
			newRow.isSelected = this.dataSelected.findIndex(d =>
				d.warWarehouseProductBrandId === row.warWarehouseProductBrandId) > -1;
			return newRow;
		});
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (err) {
		this.showNotification('Ocurrió un error al intentar cargar la data.', 'error');
	} finally {
		this.checkAll = this.data.every(d => d.isSelected);
		this.isClean = false;
	}
}

function onCleanData() {
	this.params = {
		page: null,
		brands: null,
		categories: null,
		code: null,
		typeView: null,
		warehouses: null,
		withStock: null,
		withOutStock: null,
	};
	this.featuresSelected = null;
	this.brand = 0;
	this.category = 0;
	this.isClean = true;
	helper.removeLocalData('products::search');
	helper.removeLocalData('accounting-products-selected');
	this.callServiceAndSearch();
	this.clearSelectedProducts();
}

function openModal() {}

function rowIsSelected(row) {
	({ products: this.data, productsSelected: this.dataSelected, checkAll: this.checkAll }
	= this.selectedRows(row, this.data, this.dataSelected));
	helper.setLocalData('accounting-products-selected', this.dataSelected);
}

function runAction(item) {
	if (item.code === 'edit-product') {
		this.goTo('accounting-edit-product',
			{ params: { id: this.dataSelected[0][this.keyValue] } });
	} else {
		this.goTo(item.codeWeb, { params: { productsSelected: this.dataSelected } });
	}
}

function selectedAll(value) {
	({ products: this.data, productsSelected: this.dataSelected, checkAll: this.checkAll }
	= this.selecteAll(value, this.data, this.dataSelected));
	helper.setLocalData('accounting-products-selected', this.dataSelected);
}

function returnPriceList(item) {
	const arrayObject = Object.keys(item.priceList);
	if (arrayObject.length > 0) {
		return item.priceList[arrayObject[0]].price;
	}
	return 0;
}

function data() {
	return {
		action: {
			open: false,
			title: '',
			width: 553,
		},
		actions: [],
		brand: 0,
		brands: [],
		category: 0,
		categories: [],
		checkAll: false,
		currentPage: 1,
		columns: [
			{ id: 1, name: 'Tienda', value: 'warehouseName', visible: true, checked: true },
			{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 3, name: 'Otros códigos', value: 'alternateCode', visible: true, checked: true },
			{ id: 4, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 5, name: 'Categoría', value: 'category', visible: true, checked: true },
			{ id: 6, name: 'Descripción', value: 'description', visible: true, checked: true },
			{ id: 7, name: 'Marca', value: 'brandName', visible: true, checked: true },
			{ id: 8, name: 'Cuentas', value: 'account', visible: true, checked: true },
			{ id: 9, name: 'P. costo', value: 'priceCost', visible: true, checked: true },
			{ id: 10, name: 'P. venta', value: 'price', visible: true, checked: true },
			{ id: 11, name: 'Stock', value: 'stock', visible: true, checked: true },
			{ id: 12, name: 'Acciones', visible: true, checked: true, flagVisible: true },
		],
		data: [],
		dataSelected: [],
		featuresSelected: null,
		helpItems: [],
		isClean: false,
		keyValue: 'warWarehouseProductBrandId',
		lastPage: 0,
		params: {
			page: null,
			brandId: null,
			categoryId: null,
			code: null,
			typeView: null,
			warehouseId: null,
			withStock: null,
			withOutStock: null,
		},
		searchData: '',
		warehouses: [],
	};
}

export default {
	name: 'products-list',
	components: {
		actionSidebar,
		appActions,
		appTable,
		generalFilter,
		headerPage,
		helpAction,
		categoriesAutocomplete,
	},
	computed: {
		actionsDisabled,
	},
	created,
	data,
	methods: {
		callServiceAndSearch,
		cleanDataByWarehouseChange,
		clearSelectedProducts,
		closeModal,
		changePage,
		loadData,
		filterData,
		filterRows,
		onCleanData,
		openModal,
		rowIsSelected,
		runAction,
		selectedAll,
		returnPriceList,
	},
	mixins: [productMixin],
};
</script>

