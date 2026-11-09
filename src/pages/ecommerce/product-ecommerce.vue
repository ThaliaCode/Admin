<template>
  <div>
		<header-page :title="$route.meta.title" />
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<v-layout wrap mt-3 ml-4 mr-4>
			<v-flex xs3>
				<autocomplete-component
					chips
					item-text="relationalName"
					item-value="id"
					:items="categories"
					label-value="Categorías"
					multiple
					clearable
					resource-url="/e-categories"
					:http-code="'$httpProducts'"
					:item="eCategories"
					:return-object="false"
					@return-data="setData($event, 'eCategories')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs3 pl-4>
				<autocomplete-component
					chips
					item-text="title"
					item-value="id"
					:items="filters"
					label-value="Filtros"
					clearable
					multiple
					resource-url="/filters"
					:http-code="'$httpProducts'"
					:item="filtersSelected"
					:return-object="false"
					@return-data="setData($event, 'filtersSelected')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs3 pl-4>
				<label class="caption">Comercios</label>
				<v-select
					bottom
					class="filter-select"
					content-class="filter-select-content"
					item-text="name"
					item-value="id"
					v-model="commerceId"
					:items="listCommerce"
					:item="commerceId"
					:return-object="false"
					label-value="Comercios"
					single-line
					hide-detils
					@input="loadData"
				></v-select>
			</v-flex>
			<v-flex xs3 mt-4 text-xs-right>
				<v-btn
				type="button"
				color="error"
				class="btn-action"
				@click="clearCommerce">
					Limpiar
				</v-btn>
			</v-flex>
		</v-layout>
		<div class="mt-3">
			<app-table
				:check-all="checkAll"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="rows"
				selectable
				@on-page="onPage"
				@on-search-event="onSearch"
				@on-selected-all="onSelectedAll"
				@row-is-selected="rowIsSelected"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 4)">
						<p class="td-max-width">
							{{ props.row.inlineCommerce }}
						</p>
					</td>
					<td v-show="showRow(columns, 5)">{{ props.row.numberVisit }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.stock }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.price | round }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.priceDiscount | round }}</td>
					<td
						v-show="showRow(columns, 9)"
						class="action-td"
						@click.stop="stopClick"
					>
						<v-tooltip top>
							<v-switch
								slot="activator"
								class="inline"
								hide-details
								color="success"
								v-model="props.row.isPublic"
								@change="updateState(props.row, $event)"
							></v-switch>
							<span>{{ stateName(props.row) }}</span>
						</v-tooltip>
						<app-tooltip-button
							color="green"
							icon="create"
							text="editar"
							@click-icon="runAction({ codeWeb: 'edit' }, props.row)"
						/>
						<app-tooltip-button 
							color="red"
							icon="delete"
							text="Eliminar"
							@click-icon="runAction({ codeWeb: 'delete' }, props.row)"
						/>
					</td>
				</template>
			</app-table>
			<action-sidebar
				:title="action.title"
				:value="action.open"
				:width="action.width"
				@close-modal="closeModal"
			>
				<assign-filters-form
					v-if="isActionCode('assign-filters')"
					:data-selected="dataSelected"
					@on-assign="assignFilter"
					@on-close="closeModal"
				/>
				<delete-product-form
					v-if="isActionCode('delete')"
					:product-name="productName"
					@on-delete="onDelete"
					@on-close="closeModal"
				/>
				<filter-product
					v-if="isActionCode('filter-by')"
					@close="closeModal"
				/>
				<assign-commerce-form
					:data-selected="dataSelected"
					@on-close="closeModal"
					@on-assign="assignCommerce"
					v-if="isActionCode('add-trade')"
				 />
			</action-sidebar>
		</div>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import appTable from '@/components/shared/table/app-table';
import assignCommerceForm from '@/components/ecommerce/assign-commerce-form';
import assignFiltersForm from '@/components/ecommerce/assign-filters-form';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import deleteProductForm from '@/components/ecommerce/delete-product-form';
import filterProduct from '@/components/ecommerce/filter-product';
import headerPage from '@/components/shared/header-page';

function created() {
	this.loadData();
	this.loadCommerce();
}

function actionsDisabled() {
	const disabled = this.dataSelected.length < 1;
	return [{ code: 'Assign Filters', disabled }, { code: 'AT', disabled }];
}

async function assignFilter(body) {
	try {
		await this.$httpProducts.patch('e-products/filters', body);
		this.showNotification('Los filtros han sido asignados correctamente.');
		this.closeModal();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function assignCommerce(body) {
	try {
		await this.$httpProducts.post('commerce-company', body);
		this.showNotification('Fueron asignados correctamente');
		this.closeModal();
		this.loadData();
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		}
	}
}


function closeModal() {
	this.action.open = false;
	this.action.code = '';
	this.action.title = '';
	this.productId = null;
	this.productName = null;
	const el = document.getElementById('html-main');
	el.style.overflow = null;
}

function isActionCode(code) {
	return this.action.code === code;
}

async function loadData() {
	this.params.page = this.currentPage;
	this.params.eCategories = this.eCategories && this.eCategories.length > 0 ?
		this.eCategories.join(',') : null;
	this.params.filters = this.filtersSelected && this.filtersSelected.length > 0 ?
		this.filtersSelected.join(',') : null;
	this.params.commerceId = this.commerceId;
	try {
		const { data: response, headers } = await this.$httpProducts.get('e-products',
			{ params: this.params });
		this.rows = response.map((e) => {
			const newRow = { ...e };
			newRow.inlineCommerce = e.commerce.map(p => p.code).join(', ');
			return newRow;
		});
		this.lastPage = Number(headers['x-last-page']);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function onDelete() {
	try {
		await this.$httpProducts.delete(`e-products/${this.productId}`);
		this.showNotification('El producto ha sido eliminado correctamente.');
		this.closeModal();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function onPage(page) {
	this.currentPage = page;
	this.loadData(page);
}

function onSearch(search) {
	this.params.search = search ? search.trim() : null;
	this.loadData();
}

function onSelectedAll(checked) {
	this.checkAll = checked;
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = checked;
		return newRow;
	});
	this.dataSelected = this.rows.filter(r => r.isSelected);
}

function rowIsSelected() {
	this.dataSelected = this.rows.filter(r => r.isSelected);
	this.checkAll = this.rows.every(r => r.isSelected);
}

function runAction({ codeWeb }, row) {
	this.action.code = codeWeb;
	this.action.width = 450;
	if (this.action.code === 'assign-filters') {
		this.action.title = 'Asignar Filtros';
		this.action.open = true;
		const el = document.getElementById('html-main');
		el.style.overflow = 'hidden';
	} else if (this.action.code === 'delete') {
		this.productId = row.id;
		this.productName = row.name;
		this.action.title = 'Eliminar Producto';
		this.action.open = true;
	} else if (this.action.code === 'create-products') {
		this.goTo('create-product');
	} else if (this.action.code === 'edit') {
		this.goTo('edit-product-ecommerce', { params: { id: row.id } });
	} else if (this.action.code === 'add-trade') {
		this.action.title = 'Asignar Comercio';
		this.action.open = true;
		const el = document.getElementById('html-main');
		el.style.overflow = 'hidden';
	}
}

function setData(value, modelName) {
	if (value) {
		this[modelName] = [...value];
		this.loadData();
	}
}

function stateName({ isPublic }) {
	return isPublic ? 'Activo' : 'Inactivo';
}

async function updateState({ id }, state) {
	const body = { isPublic: state };
	try {
		await this.$httpProducts.patch(`e-products/${id}/active`, body);
		this.showNotification('El estado del producto ha sido actualizado correctamente.');
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadCommerce() {
	const params = {
		search: 'mistore',
	};
	try {
		({ data: this.listCommerce } = await this.$httpSales.get('com-ecommerce-companies', { params }));
	} catch (error) {
		this.showGenericError();
	}
}

function clearCommerce() {
	this.params.commerceId = null;
	this.commerceId = null;
	this.loadData();
}

function data() {
	return {
		commerces: {
			commerceId: null,
		},
		newArray: [],
		array: [],
		action: {
			code: '',
			open: false,
			title: '',
			width: 450,
		},
		categories: [],
		checkAll: false,
		columns: [
			{ id: 1, name: 'Cód.', tooltip: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre de Producto', value: 'name-product', visible: true, checked: true },
			{ id: 3, name: 'Descripción', value: 'description', visible: true, checked: true },
			{ id: 4, name: 'Comercios', value: 'ecommerce', visible: true, checked: true },
			{ id: 5, name: 'Visitas', value: 'numberVisit', visible: true, checked: true },
			{ id: 6, name: 'Stock', value: 'stock', visible: true, checked: true },
			{ id: 7, name: 'Precio', value: 'price', visible: true, checked: true },
			{ id: 8, name: 'P. Dscto.', tooltip: 'Precio con Descuento', value: 'price-descount', visible: true, checked: true },
			{ id: 9, name: 'Acciones', value: 'actions', visible: true, checked: true },
		],
		currentPage: 1,
		dataSelected: [],
		eCategories: [],
		filters: [],
		filtersSelected: [],
		listCommerce: [],
		lastPage: 0,
		commerceId: null,
		params: {
			commerceId: null,
			eCategories: null,
			filters: null,
			limit: 20,
			page: 1,
		},
		productId: null,
		productName: null,
		rows: [],
	};
}

export default {
	name: 'product-ecommerce',
	data,
	components: {
		appActions,
		assignCommerceForm,
		actionSidebar,
		appTable,
		assignFiltersForm,
		autocompleteComponent,
		deleteProductForm,
		filterProduct,
		headerPage,
	},
	computed: {
		actionsDisabled,
	},
	created,
	methods: {
		assignCommerce,
		assignFilter,
		clearCommerce,
		closeModal,
		isActionCode,
		loadCommerce,
		loadData,
		onDelete,
		onPage,
		onSearch,
		onSelectedAll,
		rowIsSelected,
		runAction,
		setData,
		stateName,
		updateState,
	},
};
</script>

<style lang="scss" scoped>
	.action-td {
		min-width: 128px;
	}

	.inline {
		display: inline-block !important;
		margin-right: 8px;
		vertical-align: middle;
		width: auto !important;
	}

	.td-commerce {
		width: 15% !important;
	}

	.td-max-width {
		margin: 0 auto;
		width: 300px;
		word-break: break-all;
	}
</style>
