<template>
	<div>
		<header-page
			name="loyalty-products"
			title="Lista de Productos"
			to-show
			:showExcel="false"
			@clean-product-filter="cleanFilter"
		/>
		<app-actions
			:value-disabled="disabledComputed"
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<v-layout row wrap my-3 px-5>
			<v-flex xs3>
				<!-- <app-select
					append-icon="search"
					autocomplete
					label="Categoria"
					item-text="name"
					item-value="id"
					:item="params.categoryId"
					:items="categories"
					@input="setData"
					model="categoryId"
				></app-select> -->
				<categories-autocomplete
					:item="params.categoryId"
					:items="categories"
					item-text="name"
					:slot-custom="true"
					item-value="id"
					label-value="Categoria"
					@return-data="setData({ model: 'categoryId', value: $event })"
				></categories-autocomplete>
			</v-flex>
			<v-flex xs3 ml-2>
				<app-select
					append-icon="search"
					autocomplete
					label="Tipos de Productos"
					item-text="name"
					item-value="id"
					:item="params.typeId"
					:items="types"
					model="typeId"
					@input="setData"
				></app-select>
			</v-flex>
		</v-layout>
		<div class="px-4 mt-4">
			<app-table
				name="loyalty-products"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="rows"
				:clean-search="isClean"
				:check-all="checkAll"
				:items-total-quantity="totalItems"
				:items-quantity="totalItemsVisible"
				selectable
				@on-page="changePage"
				@on-search-event="searchEvent"
				@on-selected-all="allSelected"
				@row-is-selected="rowSelected"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">
						{{ props.row.code }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.autoBarcode }}</td>
					<td v-show="showRow(columns, 3)">
						<v-tooltip top>
							<span slot="activator">
								{{ productTypeVariant(props.row).typeSiglas }}
							</span>
							<span>
								{{ productTypeVariant(props.row).typeName }}
							</span>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 4)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 5)">
						<span v-if="props.row.category">
							{{ props.row.category.name }}
						</span>
					</td>
					<td v-show="showRow(columns, 6)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.score || 0 }}</td>
					<td v-show="showRow(columns, 8)">
						{{ getAmountWithDiscount(props.row) }}
					</td>
					<td v-show="showRow(columns, 9)">{{ getPrice(props.row) }}</td>
					<td v-show="showRow(columns, 10)">{{ getStock(props.row) }}</td>
				</template>
			</app-table>
		</div>
		<v-dialog v-model="dialogScore" persistent max-width="410">
			<modal-items
				v-if="dialogScore"
				title="Asignar Puntos"
				name-action="Guardar"
				show-slot
				@close-modal="closeModal"
				@action-modal="saveScore"
			>
				<div class="pa-4">
					<app-input-text
						label="Puntos"
						model="score"
						:text="score"
						type="number"
						@input="setDataModel"
					></app-input-text>
				</div>
			</modal-items>
		</v-dialog>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import appActions from '@/components/shared/app-actions';
import modalItems from '@/components/shared/modal-items';
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import categoriesAutocomplete from '@/components/shared/autocomplete/categories-autocomplete';

const { round } = lib;
const twoDecimals = round(2);

async function loadData(page = 1) {
	this.dataSelected = [];
	this.currentPage = page;
	this.params.page = this.currentPage;
	const params = { ...this.params };
	try {
		const { data: response, headers } = await this.$httpProducts.get(
			'products/master',
			{ params }
		);
		this.rows = response.map((r) => {
			const newRow = { ...r };
			newRow.isSelected = false;
			return newRow;
		});
		this.lastPage = Number(headers['x-last-page']);
		this.totalItems = Number(headers['x-quantity']);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.isClean = false;
	}
}

async function loadCategories() {
	const params = { flagMain: 1, relationAdd: 'subCategories' };
	const requests = [
		this.$httpProducts.get('products-types'),
		this.categoriesList(params),
	];
	try {
		[{ data: this.types }, { data: this.categories }] = await Promise.all(
			requests
		);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function productTypeVariant({ typeInfo }) {
	if (typeInfo) {
		const varNameSplit = typeInfo.name.split(' ');
		const varSiglas =
			varNameSplit.length > 1
				? varNameSplit.reduce((a, vn) => a.concat(vn.split('')[0]), '')
				: varNameSplit[0].split('')[0];
		return {
			validVariations: typeInfo.code === 'variantes',
			typeName: typeInfo.name,
			typeSiglas: varSiglas,
		};
	}
	return {};
}

function getAmountWithDiscount(product) {
	const { priceList } = product;
	const { salPriceList } = this.$userInfo;
	if (this.idCommerce) {
		const price =
			priceList && priceList[this.selectedPriceList]
				? priceList[this.selectedPriceList].price
				: 0;
		const discount =
			priceList && priceList[this.selectedPriceList]
				? priceList[this.selectedPriceList].discount
				: 0;
		const percentageDiscount = discount / 100;
		return twoDecimals(price * percentageDiscount) || 0;
	} else if (priceList) {
		const price = priceList[salPriceList.id]
			? priceList[salPriceList.id].price
			: 0;
		const discount = priceList[salPriceList.id]
			? priceList[salPriceList.id].discount
			: 0;
		const percentageDiscount = discount / 100;
		return twoDecimals(price * percentageDiscount) || 0;
	}
	return 0;
}

function getPrice(product) {
	const { priceList } = product;
	const user = helper.getLocalData('admin-user');
	const idPriceList = user.salPriceList.id;
	if (this.idCommerce) {
		return priceList && priceList[this.selectedPriceList]
			? priceList[this.selectedPriceList].price
			: 0;
	} else if (priceList) {
		const l = priceList[idPriceList] ? priceList[idPriceList].price : 0;
		return priceList ? l : 0;
	}
	return 0;
}

function getStock({ typeInfo, stock }) {
	const { code: typeCode } = typeInfo || {};
	return typeCode !== 'servicios' ? stock : '-';
}

function setData({ model, value }) {
	if (typeof value === 'object' && value) {
		this.params[model] = value ? value.id || value.join() || null : null;
		this.loadData();
	} else if (model === 'categoryId') {
		this.params[model] = value || null;
		this.loadData();
	}
}

function cleanFilter() {
	this.params.categoryId = null;
	this.params.search = null;
	this.params.typeId = null;
	this.isClean = true;
	this.loadData();
}

function changePage(page) {
	this.loadData(page);
}

function disabledComputed() {
	return [{ code: 'assign-score', disabled: this.dataSelected.length === 0 }];
}

function searchEvent(search) {
	this.params.search = search ? search.trim() : null;
	this.loadData();
}

function runAction(item) {
	if (item.code === 'assign-score') {
		this.dialogScore = true;
	}
}

function allSelected(checked) {
	this.rows = this.rows.map((r) => {
		const newRow = { ...r };
		newRow.isSelected = checked;
		return newRow;
	});
	this.checkAll = this.rows.every((r) => r.isSelected);
	this.dataSelected = this.rows.filter((r) => r.isSelected);
}

function rowSelected(row) {
	this.rows = this.rows.map((r) => {
		const newR = { ...r };
		if (newR.id === row.id) {
			newR.isSelected = row.isSelected;
		}
		return newR;
	});
	this.checkAll = this.rows.every((r) => r.isSelected);
	this.dataSelected = this.rows.filter((r) => r.isSelected);
}

function setDataModel({ model, value }) {
	this[model] = value;
}

function closeModal() {
	this.score = null;
	this.dialogScore = false;
}

async function saveScore() {
	try {
		const products = this.dataSelected.map((d) => {
			const newD = {
				id: d.id,
				score: Number(this.score),
			};
			return newD;
		});
		const body = {
			products,
		};
		await this.$httpProducts.post('products/score', body);
		this.showNotification('Se actualizó correctamente');
		this.closeModal();
		this.loadData();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'PRODUCT_NOT_EXIST') {
				this.showNotification('No existe el producto', 'error');
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function totalItemsVisible() {
	return this.rows.length;
}

function created() {
	this.loadCategories();
	this.loadData();
}

function data() {
	return {
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
				name: 'Cod. interno',
				value: 'autoBarcode',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'T. Prod.',
				tooltip: 'Tipo de Producto',
				value: 'typeInfo',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Nombre',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Categoría',
				value: 'category.name',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Descripción',
				value: 'description',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Puntos',
				value: 'score',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'P. Dscto.',
				tooltip: 'Precio con Descuento',
				value: 'discount',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'P. Venta',
				value: 'price',
				tooltip: 'Precio de venta',
				checked: true,
				visible: true,
			},
			{
				id: 10,
				name: 'Stock',
				value: 'stock',
				checked: true,
				visible: true,
			},
		],
		currentPage: 1,
		lastPage: 0,
		params: {
			categoryId: null,
			flagSales: 1,
			typeId: null,
		},
		rows: [],
		isClean: false,
		dataSelected: [],
		checkAll: false,
		dialogScore: false,
		score: null,
		totalItems: 0,
		types: [],
	};
}

export default {
	name: 'pages-loyalty-products',
	data,
	created,
	components: {
		headerPage,
		appTable,
		appActions,
		modalItems,
		categoriesAutocomplete,
	},
	computed: {
		disabledComputed,
		totalItemsVisible,
	},
	methods: {
		setData,
		loadCategories,
		loadData,
		productTypeVariant,
		getStock,
		getPrice,
		getAmountWithDiscount,
		cleanFilter,
		changePage,
		searchEvent,
		runAction,
		rowSelected,
		allSelected,
		setDataModel,
		closeModal,
		saveScore,
	},
};
</script>
