<template>
	<div>
		<general-filter class="layout wrap align-center my-3">
			<v-flex xs2 pr-2 v-if="showWarehouse">
				<app-select
					:item="warehouseId"
					item-text="name"
					item-value="id"
					:items="warehouses"
					:label="labelWarehouse()"
					model="warehouseId"
					:return-object="true"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs2 pr-2 v-if="$route.name === 'rotation-report'">
				<products-search-input
					:search-value="selectedProduct"
					@search="openSearch"
				/>
			</v-flex>
			<v-flex xs3 pr-2 :class="{ 'px-2': showWarehouse }" v-if="showCategories">
				<app-select
					chips
					:item="categoryIds"
					item-text="name"
					item-value="id"
					:items="categories"
					label="Categorías"
					model="categoryIds"
					multiple
					:return-object="true"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs2 pr-2>
				<app-select
					chips
					:item="modulesIds"
					item-text="name"
					item-value="id"
					:items="modules"
					label="Modulos"
					model="modulesIds"
					multiple
					:return-object="true"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs2 pr-2 v-if="showBrands">
				<app-select
					chips
					:item="brandIds"
					item-text="name"
					item-value="id"
					:items="brands"
					label="Marcas"
					model="brandIds"
					multiple
					:return-object="true"
					@input="getData"
				/>
			</v-flex>
			<v-flex
				xs2
				pr-2
				class="align-col"
				:class="{ 'px-2': showWarehouse || showCategories }"
			>
				<label class="caption">Fecha de Inicio</label>
				<date-component
					:date="startDate"
					icon="/static/img/calendar.svg"
					@on-input="onDate($event, 'startDate')"
				></date-component>
			</v-flex>
			<v-flex xs2 pr-2 class="align-col">
				<label class="caption">Fecha de Fin</label>
				<date-component
					:date="endDate"
					icon="/static/img/calendar.svg"
					@on-input="onDate($event, 'endDate')"
				></date-component>
			</v-flex>
			<v-flex xs2 pr-2 v-if="showWarehouseOrigin">
				<app-select
					:item="warehouseOriginId"
					item-text="name"
					item-value="id"
					:items="warehouses"
					label="T. Origen"
					model="warehouseOriginId"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs2 pr-2 v-if="showWarehouseSource">
				<app-select
					:item="warehouseSourceId"
					item-text="name"
					item-value="id"
					:items="warehouses"
					label="T. Destino"
					model="warehouseSourceId"
					:return-object="true"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs3 pr-2 v-if="showStatus">
				<app-select
					chips
					:item="flagDevolution"
					item-text="name"
					item-value="id"
					:items="status"
					label="Estados"
					model="flagDevolution"
					multiple
					:return-object="false"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs3 pr-2 v-if="showCodeProduct">
				<autocomplete-component
					item-text="code"
					item-value="id"
					:items="products"
					label-value="Cód. Prod."
					object-data="product"
					resource-url="/products"
					return-object
					:http-code="'$httpProducts'"
					:item="productId"
					@return-data="getFilterData($event, 'productId')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12 md1 pt-4 text-xs-center text-md-left>
				<v-btn class="btn-action" color="success" @click="$emit('search-data')">
					Buscar
				</v-btn>
			</v-flex>
		</general-filter>
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
import {
	differenceInDays,
	format,
	subDays,
	differenceInCalendarDays,
} from 'date-fns';
import actionSidebar from '@/components/shared/action-sidebar';
import appSelect from '@/components/shared/app-select';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import dateComponent from '@/components/shared/date-component';
import generalFilter from '@/components/shared/general-filter';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import productsSearchForm from '@/components/shared/searcher/products-search-form';

function created() {
	this.loadFilters();
}

function cleanFilters(clean) {
	if (clean) {
		this.defaultDates();
		if (this.showCodeProduct) {
			this.getData({ model: 'productId', value: { id: null } });
		}
		if (this.showWarehouseOrigin) {
			this.getData({ model: 'warehouseOriginId', value: { id: null } });
		}
		if (this.showWarehouseSource) {
			this.getData({ model: 'warehouseSourceId', value: { id: null } });
		}
		if (this.showCategories) {
			this.getData({ model: 'categoryIds', value: [] });
		}
		if (this.showWarehouse) {
			this.defaultWarehouse();
		}
		if (this.showBrands) {
			this.getData({ model: 'brandIds', value: [] });
		}
		this.getData({ model: 'modulesIds', value: [] });
		this.$emit('search-data');
	}
}

function defaultDates() {
	const dateFormat = format(subDays(this.$today(), 30), 'YYYY-MM-DD');
	const dateFormatEnd = format(this.$today(), 'YYYY-MM-DD');
	this.onDate(this.$today(), 'endDate');
	this.onDate(format(subDays(this.$today(), 30), 'YYYY-MM-DD'), 'startDate');
	this.getDate(dateFormat, 'dateWithOutFormat');
	this.getDate(dateFormatEnd, 'dateWithOutFormatEnd');
}

function defaultWarehouse() {
	const value = this.warehouses.find(
		(w) => w.id === this.$userInfo.warWarehousesId
	);
	this.getData({ model: 'warehouseId', value });
}

function getData(item) {
	if (item) {
		const { model, value } = item;
		if (value) {
			this[model] =
				model === 'categoryIds' ||
				model === 'modulesIds' ||
				model === 'brandIds'
					? value
					: value.id;
			this.$emit('return-data', { model, value });
		}
	}
}

function getDate(value, model) {
	this[model] = format(value, 'YYYY-MM-DD');
}

function getFilterData(filter, model) {
	if (filter) {
		this[model] = filter.id;
		this.$emit('return-data', { model, value: this[model] });
	}
}

async function loadCategories() {
	({ data: this.categories } = await this.categoriesList());
}

async function loadFilters() {
	if (
		this.showWarehouse ||
		this.showWarehouseOrigin ||
		this.showWarehouseSource
	) {
		this.loadWarehouses();
	}
	if (this.showCategories) {
		this.loadCategories();
	}
	this.defaultDates();
	if (
		!this.showWarehouse &&
		!this.showWarehouseOrigin &&
		!this.showWarehouseSource &&
		!this.showCategories &&
		!this.showCodeProduct
	) {
		this.$emit('search-data');
	}
	const { data: brands } = await this.brandsList();
	this.brands = brands;
}

async function loadWarehouses() {
	({ data: this.warehouses } = await this.$httpProducts.get('warehouses'));
	if (this.showWarehouse) {
		this.defaultWarehouse();
	}
	this.$emit('search-data');
}

function onDate(value, model) {
	this[model] = format(value, 'YYYY-MM-DD');
	const difDates = differenceInDays(this.endDate, this.startDate);
	const difCalendarDates =
		differenceInCalendarDays(this.endDate, this.startDate) >= 0;
	const validInitDate = difDates >= 0 && difDates <= 30;
	const validDates = this.validRange ? validInitDate : difCalendarDates;
	this.disabled = !validDates;
	this.$emit('return-data', { model, value: this[model] });
	this.$emit('valid-disabled', this.disabled);
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
	this.productId = id;
	this.selectedProduct = name;
	this.closeModal();
	this.$emit('return-data', {
		model: 'productId',
		value: this.productId,
		name: this.selectedProduct,
	});
}

function closeModal() {
	this.action.open = false;
	this.action.code = '';
	this.action.title = '';
	this.searchVal = null;
	this.action.open = false;
	this.action.width = 0;
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
		categories: [],
		modules: [
			{ id: 1, name: 'VENTAS' },
			{ id: 2, name: 'COMPRAS' },
			{ id: 7, name: 'PEDIDO ECOMMERCE' },
			{ id: 8, name: 'INVENTARIO' },
			{ id: 9, name: 'TRANSFERENCIA' },
			{ id: 10, name: 'GARANTIAS' },
			{ id: 12, name: 'PRODUCTS' },
		],
		categoryIds: [],
		brandIds: [],
		brands: [],
		modulesIds: [],
		dateWithOutFormat: null,
		dateWithOutFormatEnd: null,
		disabled: false,
		endDate: this.$today(),
		flagDevolution: [],
		products: [],
		productId: null,
		startDate: null,
		selectedProduct: null,
		status: [],
		warehouseId: null,
		warehouseOriginId: null,
		warehouseSourceId: null,
		warehouses: [],
	};
}

export default {
	name: 'reports-filters',
	components: {
		actionSidebar,
		appSelect,
		autocompleteComponent,
		dateComponent,
		generalFilter,
		productsSearchInput,
		productsSearchForm,
	},
	created,
	data,
	methods: {
		closeModal,
		defaultDates,
		defaultWarehouse,
		getData,
		getDate,
		getFilterData,
		loadCategories,
		loadFilters,
		loadWarehouses,
		setProduct,
		onDate,
		openSearch,
	},
	props: {
		cleanFilters: {
			default: false,
			type: Boolean,
		},
		showCategories: {
			default: false,
			type: Boolean,
		},
		showWarehouse: {
			default: false,
			type: Boolean,
		},
		validRange: {
			default: false,
			type: Boolean,
		},
		showWarehouseOrigin: {
			default: false,
			type: Boolean,
		},
		showWarehouseSource: {
			default: false,
			type: Boolean,
		},
		showStatus: {
			default: false,
			type: Boolean,
		},
		showCodeProduct: {
			default: false,
			type: Boolean,
		},
		showBrands: {
			default: false,
			type: Boolean,
		},
	},
	watch: {
		cleanFilters,
	},
};
</script>
