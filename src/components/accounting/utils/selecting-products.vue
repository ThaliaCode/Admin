<template>
	<div>
		<app-table
			name="selecting-products"
			selectable
			local-storage
			:columns="columns"
			:current-page="currentPage"
			:rows="data"
			include-filter
			:key-value="keyValue"
			:check-all="checkAll"
			:last-page="lastPage"
			:clean-search="isClean"
			@on-toggle-columns="toggleColumns"
			@on-search-event="callServiceAndSearch"
			@on-page="changePage"
			@row-is-selected="rowIsSelected"
			@on-selected-all="selectedAll"
			@table-option-event="openModal">
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">{{ props.row.warehouseName }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.product.code }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.autoBarcode }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.inlineAlternateCode }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.product.name }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.categoryName }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.inlineFeatures }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.description }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.location }}</td>
				<td v-show="showRow(columns, 10)">{{ props.row.brandName }}</td>
				<td v-show="showRow(columns, 11)">{{ props.row.priceCost | round }}</td>
				<td v-show="showRow(columns, 12)">{{ props.row.price | round }}</td>
				<td v-show="showRow(columns, 13)">
					<v-text-field
						label="00"
						type="number"
						v-model.number="props.row.quantity"
						single-line
						hide-details
						@click.stop="stopClick"
						class="filter-select shadow-inset-table"
						@input="updateQuantity(props.row)"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 14)">{{ props.row.stock }}</td>
				<td v-show="showRow(columns, 15)">{{ props.row.minStock }}</td>
				<td v-show="showRow(columns, 16)">{{ props.row.weigth }}</td>
				<td v-show="showRow(columns, 17)">
					<v-btn
						flat
						small
						type="button"
						class="table-icon"
						:color="props.row.flagActive === 1 ? 'success' : 'error'"
						@click="inactiveAction(props.row)">
						{{ statusInWord(props.row) }}
					</v-btn>
				</td>
				<td v-show="showRow(columns, 18)">
					<router-link
						:to="{ name: 'edit-product', params:{
							id: props.row.id,
							warehouseId: props.row.warehouseId,
							brandId: props.row.brandId } }"
						class="table-icon">
						<v-icon
							color="primary"
							size="19">
							edit
						</v-icon>
					</router-link>
					<router-link
						v-if="props.row.type !== 2"
						:to="{ name: 'kardex', params: { code: props.row.code, productId: props.row.id,
							warehouseId: props.row.warehouseId, brandId: props.row.brandId } }"
						class="table-icon">
						<img :src="`${$imageUrl}/kardex.svg`" alt="" class="align-img">
					</router-link>
					<v-menu
						offset-x
						left
						:nudge-left="10"
						attach
						content-class="options-menu-content"
						class="options-menu">
						<v-btn color="transparent" slot="activator">
							<img :src="`${$imageUrl}/menu.svg`" alt="" class="align-img">
						</v-btn>
						<v-list>
							<v-list-tile v-on:click="configVariations(props.row)">
								<v-list-tile-title v-on:click="openModalSidebar(props.row, 'VP')">
									<v-tooltip left>
										<img slot="activator" :src="`${$imageUrl}/icon-variations.svg`" class="align-img">
										<span>variaciones de producto</span>
									</v-tooltip>
								</v-list-tile-title>
							</v-list-tile>
							<v-list-tile v-on:click="openModalSidebar(props.row, 'MS')">
								<v-list-tile-title>
									<v-tooltip left>
										<img slot="activator" :src="`${$imageUrl}/icon-min-stock.svg`" class="align-img">
										<span>agregar stock mínimo</span>
									</v-tooltip>
								</v-list-tile-title>
							</v-list-tile>
							<v-list-tile v-on:click="openModalSidebar(props.row, 'CF')">
								<v-list-tile-title>
									<v-tooltip left>
										<img slot="activator" :src="`${$imageUrl}/icon-features.svg`" class="align-img">
										<span>agregar caraterísticas</span>
									</v-tooltip>
								</v-list-tile-title>
							</v-list-tile>
						</v-list>
					</v-menu>
				</td>
			</template>
		</app-table>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="cancelModal"
				@accept-button-clicked="saveData" />
		</section>
	</div>
</template>

<script>
import appTable from './../../shared/table/app-table';
import helper from './../../../shared/helper';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';

function created() {
	if (this.warehouseId) this.params.warehouseId = this.warehouseId;
	if (this.brandId) this.params.brandId = this.brandId;
	this.loadData();
}

async function loadData() {
	const priceListId = helper.getLocalData('admin-user').salPriceList.id;
	this.params.page = this.currentPage;
	try {
		this.params.limit = 20;
		const response = await this.$httpProducts.get('products', { params: this.params });
		this.data = this.formattingData(response.data, priceListId);
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (err) {
		this.showNotification('Ocurrió un error al intentar cargar la data.', 'error');
	} finally {
		this.checkAll = this.data.every(d => d.isSelected);
		this.isClean = false;
	}
}

function formattingData(products, priceListId) {
	return products.map((rowData) => {
		const newData = { ...rowData };
		newData.isSelected = false;
		newData.price = rowData.priceList && rowData.priceList[priceListId] ?
			rowData.priceList[priceListId].price : 0;
		newData.priceList[priceListId].ranges =
			rowData.priceList[priceListId].ranges &&
			rowData.priceList[priceListId].ranges.length > 0 ?
				rowData.priceList[priceListId].ranges : [{ to: 0, from: 0, price: 0 }];
		if (this.dataSelected.length > 0) {
			this.dataSelected = this.dataSelected.map((rowSelected) => {
				let newRow = { ...rowSelected };
				if (rowSelected.product.autoBarcode === rowData.product.autoBarcode
					&& rowSelected.product.warProductId === rowData.product.warProductId) {
					newData.isSelected = rowSelected.isSelected;
					newData.quantity = rowSelected.quantity;
					newRow = newData;
				}
				return newRow;
			});
		}
		return newData;
	});
}

function selectedAll(value) {
	({ products: this.data, productsSelected: this.dataSelected, checkAll: this.checkAll }
	= this.selecteAll(value, this.data, this.dataSelected));
	if (!this.inventoryActive) this.updateFastActions();
	helper.setLocalData('products-selected', this.dataSelected);
}

function rowIsSelected(row) {
	({ products: this.data, productsSelected: this.dataSelected, checkAll: this.checkAll }
		= this.selectedRows(row, this.data, this.dataSelected));
	if (!this.inventoryActive) this.updateFastActions(row);
	helper.setLocalData('products-selected', this.dataSelected);
}

function updateFastActions(row = []) {
	this.fastActions = this.fastActions.map((action) => {
		const newAction = { ...action };
		if (action.code !== 'RP') {
			if (this.dataSelected.length === 0) {
				newAction.active = false;
			} else {
				if (row.isSelected) {
					newAction.active = true;
				}
				if ((action.code === 'IM' && !this.dataSelected.every(item => item.type !== 2))
					|| action.code === 'IN') {
					newAction.active = false;
				} else {
					newAction.active = true;
				}
				if (action.code === 'TM' && !this.params.warehouses) {
					newAction.active = false;
				}
			}
		} else {
			newAction.active = true;
		}
		return newAction;
	});
}

function configVariations() {}

function openModalSidebar() {}

function openModal() {}

function statusInWord({ flagActive }) {
	return flagActive === 1 ? 'ACTIVO' : 'DESACTIVADO';
}

function updateQuantity(row) {
	this.dataSelected = this.dataSelected.map((d) => {
		const newD = { ...d };
		if (row.id === newD.id
			&& row.warProductId === newD.warProductId
			&& row.brandId === newD.brandId) {
			newD.quantity = row.quantity;
		}
		return newD;
	});
}

function inactiveAction(product) {
	this.currentProduct = { ...product };
	this.productStatusWord = product.flagActive === 1 ? 'DESACTIVAR' : 'ACTIVAR';
	this.inactive = true;
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function callServiceAndSearch(search) {
	if (search) this.searchData = search.replace(/\?/g, '_');
	if (search && this.featuresSelected) {
		this.params.code = this.featuresSelected.concat(` ${this.searchData}`);
	} else if (this.featuresSelected) {
		this.params.code = this.featuresSelected;
	} else if (search) {
		this.params.code = this.searchData;
	} else {
		this.params.code = null;
	}
	this.currentPage = 1;
	this.loadData();
}

function toggleColumns() {
	return true;
}

function saveData() {
	this.$emit('send-selected-products', this.dataSelected);
}

function cancelModal() {
	this.$emit('close-modal');
}

function data() {
	return {
		checkAll: false,
		columns: [...this.columnsIn],
		currentPage: 1,
		currentProduct: {},
		data: [],
		dataSelected: [...this.productsAlreadySelected],
		fastActions: [
			{
				active: false,
				code: 'TM',
				color: '#2db6f5',
				img: `${this.$imageUrl}/traslado-mercaderia.svg`,
				text: 'TRASLADO DE PRODUCTOS',
				width: 680,
				maxWidth: 67,
			},
			{
				active: false,
				code: 'IM',
				color: '#1f87e5',
				img: `${this.$imageUrl}/icon-commodity-enter.svg`,
				text: 'INGRESO DE PRODUCTOS',
				link: { name: 'products-movement' },
			},
			{
				active: false,
				code: 'IN',
				color: '#0d6fc7',
				img: `${this.$imageUrl}/icon-commodity-enter.svg`,
				text: 'CREAR INVENTARIO',
				link: { name: 'new-inventory' },
			},
			{
				active: false,
				code: 'VR',
				color: '#1f87e5',
				img: `${this.$imageUrl}/venta-rapida.svg`,
				text: 'VENTA RÁPIDA',
				width: 649,
			},
			{
				active: false,
				code: 'CR',
				color: '#05579b',
				img: `${this.$imageUrl}/cotizacion.svg`,
				text: 'COTIZACIÓN RÁPIDA',
				width: 647,
			},
			{
				active: true,
				code: 'RP',
				color: '#18324e',
				img: `${this.$imageUrl}/registro-rapido.svg`,
				text: 'REGISTRO PRODUCTO',
				width: 650,
			},
			{
				active: false,
				code: 'LP',
				color: '#00b0ff',
				img: `${this.$imageUrl}/lista-precios.svg`,
				text: 'LISTA DE PRECIOS',
				width: 500,
				maxWidth: 41,
			},
			{
				active: false,
				code: 'NC',
				color: '#0091ea',
				img: `${this.$imageUrl}/compra.svg`,
				text: 'NUEVA COMPRA',
				width: 500,
			},
		],
		inactive: false,
		isClean: false,
		lastPage: 0,
		params: {
			page: null,
			brands: null,
			categories: null,
			code: null,
			typeView: null,
			warehouses: null,
			withStock: null,
			withOutStock: null,
		},
		priceListId: 0,
		productStatusWord: '',
		keyValue: 'id',
	};
}

export default {
	name: 'selecting-products',
	components: {
		appTable,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		callServiceAndSearch,
		cancelModal,
		changePage,
		configVariations,
		formattingData,
		inactiveAction,
		loadData,
		openModal,
		openModalSidebar,
		rowIsSelected,
		saveData,
		selectedAll,
		statusInWord,
		toggleColumns,
		updateFastActions,
		updateQuantity,
	},
	props: {
		columnsIn: {
			type: Array,
			default: () => [],
			required: true,
		},
		productsAlreadySelected: {
			type: Array,
			default: () => [],
			required: false,
		},
		warehouseId: {
			type: Number,
			default: 0,
			required: false,
		},
		brandId: {
			type: Number,
			default: 0,
			required: false,
		},
	},
};
</script>

