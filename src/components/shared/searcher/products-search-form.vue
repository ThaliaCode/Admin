<template>
	<div class="products-search-form">
		<v-layout wrap px-2 py-3>
			<v-flex xs12 px-4 v-if="showFilter">
				<v-radio-group name="typeSelect" row v-model="typeSelect" class="pt-0">
					<v-radio
						v-for="(type, index) in typeOptions"
						:key="index"
						:label="type.name"
						:value="type.id"
						color="success"
						hide-details
						@change="changeType($event)"
					></v-radio>
				</v-radio-group>
			</v-flex>
			<v-flex xs12>
				<app-table
					selectByArrow
					:isResponsive="true"
					:selectable="selectable"
					name="products-search-form"
					class="is-not-selectable mb-0"
					:check-all="checkAll"
					:clean-search="isClean"
					:columns="columns"
					:current-page="currentPage"
					:last-page="lastPage"
					local-storage
					:rows="products"
					:items-quantity="products.length"
					:items-total-quantity="itemsTotal"
					:disabled-search="disabledSearch"
					@on-search-event="search"
					@on-page="loadData"
					@enter-pressed="addProduct"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">
							{{ props.row.warehouseName }}
						</td>
						<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.autoBarcode }}</td>
						<td v-show="showRow(columns, 4)">
							{{ props.row.inlineAlternateCode }}
						</td>
						<td v-show="showRow(columns, 5)">
							<img
								class="pt-2 pb-2 px-1"
								v-if="props.row.urlImage"
								width="70px"
								height="70px"
								:src="props.row.urlImage"
							/>
						</td>
						<td v-show="showRow(columns, 6)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 7)">{{ props.row.categoryName }}</td>
						<td v-show="showRow(columns, 8)">{{ props.row.inlineFeatures || '-' }}</td>
						<td v-show="showRow(columns, 9)">{{ props.row.description }}</td>
						<td v-show="showRow(columns, 10)">{{ props.row.location }}</td>
						<td v-show="showRow(columns, 11)">{{ props.row.brandName }}</td>
						<td v-show="showRow(columns, 12)">
							{{ props.row.totalCost || props.row.priceCost | round }}
						</td>
						<td v-show="showRow(columns, 13)">{{ props.row.price | round }}</td>
						<td v-show="showRow(columns, 14)">{{ props.row.quantity }}</td>
						<td v-show="showRow(columns, 15)">{{ props.row.stock }}</td>
						<td v-show="showRow(columns, 16)">{{ props.row.stockReserved }}</td>
						<td v-show="showRow(columns, 17)">{{ props.row.minStock }}</td>
						<td v-show="showRow(columns, 18)">{{ props.row.unitCode }}</td>
						<td v-show="showRow(columns, 19)">{{ props.row.weigth }}</td>
						<td v-show="showRow(columns, 20)">
							<v-btn
								flat
								small
								type="button"
								class="table-icon"
								:color="props.row.flagActive === 1 ? 'success' : 'error'"
							>
								{{ statusInWord(props.row) }}
							</v-btn>
						</td>
						<td v-show="showRow(columns, 21)">
							<v-tooltip top>
								<span slot="activator">
									{{ productTypeVariant(props.row).typeSiglas }}
								</span>
								<span>
									{{ productTypeVariant(props.row).typeName }}
								</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 22)">{{ props.row.lot }}</td>
						<td v-show="showRow(columns, 23)">
							<v-layout v-if="freeProductBtnSelecction">
								<v-flex xs4 mr-2>
									<v-btn
										class="btn-action btn-auto btn-width-auto px-2 py-1"
										color="success"
										small
										@click.stop="addProduct(props.row)"
									>
										<v-icon id="add-icon" color="white">add</v-icon>
									</v-btn>
								</v-flex>
								<v-flex xs7>
									<v-btn
										class="btn-action btn-auto btn-width-auto px-2 py-1"
										color="success"
										:disabled="!isFree(props.row)"
										@click.stop="$emit('add-product', props.row, 'free')"
									>
										Gratis
									</v-btn>
								</v-flex>
							</v-layout>
							<template v-else>
								<template v-if="disabledAddBtn(props.row)">
									<v-tooltip left>
										<v-btn
											class="btn-action btn-auto btn-width-auto px-2 py-1"
											color="success"
											disabled
											small
											slot="activator"
										>
											{{ text }}
										</v-btn>
										<span>No se permite vender productos sin stock</span>
									</v-tooltip>
								</template>
								<template v-else>
									<v-btn
										class="btn-action btn-auto btn-width-auto px-2 py-1"
										:color="props.row.colorForm"
										:disabled="isAddModalDisabled(props.row)"
										small
										@click.stop="addProductModal(props.row)"
									>
										{{ props.row.textBtn }}
									</v-btn>
								</template>
							</template>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import helper from '@/shared/helper';
import TypeProduct from '@/shared/type-product';

async function created() {
	this.showBrandConfig = this.$userInfo.company.settings.flagUseSimpleBrand || false;
	const warehouseIndex = this.columns.findIndex((i) => i.value === 'warehouseName');
	this.columns[warehouseIndex].name = this.labelWarehouse();
	this.params.search = null;
	this.isClean = true;
	const warehouseColumnIndex = this.columns.findIndex((c) => c.value === 'warehouseName');
	const brandColumnIndex = this.columns.findIndex((c) => c.value === 'brandName');
	this.columns[warehouseColumnIndex].checked = !this.master;
	this.columns[warehouseColumnIndex].visible = !this.master;
	this.columns[warehouseColumnIndex].flagVisible = this.master;
	this.columns[brandColumnIndex].checked = !this.master;
	this.columns[brandColumnIndex].visible = !this.master;
	this.columns[brandColumnIndex].flagVisible = this.master;
	helper.removeLocalData('products-search-form::search');
	if (this.flagLoadTypes) {
		await this.loadTypes();
	}
	const showLot = this.$userInfo.company.settings.flagWorkWithBatches || false;
	const showImage = this.$userInfo.company.settings.showImageSearch || false;
	this.columns[18].visible = showLot;
	this.columns[18].checked = showLot;
	this.columns[18].flagVisible = !showLot;
	this.columns[19].visible = showLot;
	this.columns[19].checked = showLot;
	this.columns[19].flagVisible = !showLot;
	this.columns[4].visible = showImage;
	this.columns[4].flagVisible = !showImage;
	this.columns[4].checked = showImage;
	this.changeType(this.initialTypeSelect);
	// this.loadData();
}

async function loadTypes() {
	try {
		({ data: this.types } = await this.$httpProducts.get('products-types'));
		const index = this.types.findIndex((type) => type.id === 5);
		const indexNew = this.types.findIndex((type) => type.id === 7);
		if (index > -1) {
			this.types.splice(index, 1);
		}
		if (indexNew > -1 && !this.showLote) {
			this.types.splice(indexNew, 1);
		}
		if (this.quotation) {
			const indexQuation = this.types.findIndex((type) => type.id === 6);
			this.types.splice(indexQuation, 1);
		}
	} catch (err) {
		this.showNotification('Error al cargar los tipos de productos');
	}
}

async function loadData(page = 1) {
	this.disabledSearch = true;
	// this.params.typeId = this.typeId;
	this.currentPage = page;
	this.params.page = page;
	this.params.codeTaxes = this.codeTaxes;
	this.params.search = this.params.search || this.searchValue || null;
	this.params.warehouseId = this.params.typeId === 1 ? this.warehouseId || null : null;
	if (this.params.typeId === 8) {
		this.params.flagWarehouseRequired = null;
	}
	if (this.purchase) {
		this.params.flagSales = null;
		this.params.flagWarehouseRequired = null;
	}
	if (this.$route.name !== 'new-sale') {
		this.params.flagSales = null;
	}
	if (this.$route.name === 'series-control') {
		this.params.flagControlSerie = 1;
	}
	if (this.showConsolidated) {
		this.params.warehouseId = this.warehouseOrigin;
	}
	const urlProds = this.master ? 'products/master' : this.urlProducts;
	const url = this.ecommerce ? 'e-products' : urlProds;
	if (this.master) {
		delete this.params.relationAdd;
	} else {
		this.params.relationAdd = 'productFind,brand,warehouse';
	}

	try {
		const { data: response, headers } = await this.$httpProducts.get(url, {
			params: this.params,
		});
		this.products = response.map((product) => {
			const newProduct = { ...product };
			const productItem = product.product || product;
			const warehouseName =
				(product.warehouse && product.warehouse.name) || product.warehouseName || '';
			const productOfWarehouse = product.warehouseProduct || {};
			if (this.ecommerce) {
				newProduct.totalCost = productItem.totalCost;
				newProduct.brandName =
					productItem.warehouseProduct && productItem.warehouseProduct.brand
						? productItem.warehouseProduct.brand.name
						: '';
				newProduct.categoryName = productItem.category ? productItem.category.name : '';
				newProduct.priceCost = productItem.warehouseProduct
					? productItem.warehouseProduct.priceCost || 0
					: productOfWarehouse.priceCost || 0;
				newProduct.unitCode = productItem.unit ? productItem.unit.code : '';
				newProduct.unitConversion = 1;
				newProduct.unitName = productItem.unit ? productItem.unit.name : '';
				newProduct.unitQuantity = productItem.quantity || 1;
				newProduct.warehouseName = productItem.warehouse
					? productItem.warehouse.name
					: warehouseName;
				newProduct.warWarehouseProductBrandId = productItem.warehouseProduct
					? productItem.warehouseProduct.id
					: productItem.id;
			} else {
				newProduct.totalCost = productItem.totalCost;
				newProduct.textBtn = 'Seleccionar';
				newProduct.colorForm = 'success';
				newProduct.autoBarcode = productItem.autoBarcode;
				const validBrand = productItem.brandSimple ? productItem.brandSimple.id : '';
				const validBrandName =
					(productItem.brandSimple && productItem.brandSimple.name) ||
					productItem.brandName ||
					'';
				newProduct.brandSimpleId =
					this.showBrandConfig && productItem.brandSpId
						? productItem.brandSpId
						: validBrand;
				newProduct.brandNameHeader = newProduct.brand ? newProduct.brand.name : null;
				newProduct.brandName =
					this.showBrandConfig && productItem.brandSpId
						? validBrandName
						: newProduct.brandNameHeader;
				newProduct.categoryName = productItem.category ? productItem.category.name : '';
				newProduct.code = productItem.code;
				newProduct.description = productItem.description;
				newProduct.inlineAlternateCode = productItem.inlineAlternateCode;
				newProduct.inlineFeatures = productItem.inlineFeatures;
				newProduct.name = productItem.name;
				newProduct.price =
					this.$route.name === 'new-sale' ||
					this.$route.name === 'new-entry' ||
					this.$route.name === 'new-discharge'
						? this.getPriceFromDefaultPriceList(newProduct)
						: this.getPriceFromDefaultPriceListProd(productItem);
				newProduct.priceCost = productItem.priceCost
					? productItem.priceCost || 0
					: product.priceCost || 0;
				newProduct.unitCode = productItem.unit ? productItem.unit.code : '';
				newProduct.unitConversion = 1;
				newProduct.unitId = productItem.unitId;
				newProduct.unitName = productItem.unit ? productItem.unit.name : '';
				newProduct.unitQuantity = productItem.quantity;
				newProduct.warehouseName = productItem.warehouse
					? productItem.warehouse.name
					: warehouseName;
				newProduct.warWarehouseProductBrandId =
					productItem.warWarehouseProductBrandId || productItem.id;
				newProduct.groupType = productItem.groupType;
				newProduct.type = productItem.type || 1;
				newProduct.lot = productItem.lot || null;
				newProduct.urlImage = productItem.urlImage || null;
			}
			return newProduct;
		});
		this.lastPage = Number(headers['x-last-page']);
		this.itemsTotal = Number(headers['x-quantity']);
		if (this.products.length === 0) {
			this.$emit('no-results');
			this.showNotification('No se han encontrado coincidencias.', 'info');
		}
	} catch (err) {
		this.$emit('error', err);
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.checkAll = this.products.every((product) => product.isSelected);
		this.isClean = false;
		this.disabledSearch = false;
	}
}

function search(searchData) {
	if (searchData) {
		const searchVal = searchData.replace(/\?/g, '_');
		this.params.search = searchVal || null;
	}
	this.loadData();
}

function statusInWord({ flagActive }) {
	return flagActive === 1 ? 'ACTIVO' : 'DESACTIVADO';
}

function changeType(value) {
	// this.typeId = value;
	this.params.typeId = value;
	this.loadData();
}

function isFree({ product }) {
	if (this.isPeru) {
		const index = product.taxes.findIndex((t) => t.name === 'GRATUITO');
		return index > -1;
	}
	return true;
}

function disabledAddBtn({ stock, type }) {
	if (
		!['new-quotation', 'new-oip', 'detail-purchase'].some((route) =>
			this.$route.name.includes(route)
		)
	) {
		const { company } = this.$userInfo;
		const { settings } = company;
		const { stockNegative } = settings || {};
		return (
			type === TypeProduct.Products &&
			!this.notValidNegativeStock &&
			!stockNegative &&
			stock <= 0
		);
	}
	return false;
}

function getPriceFromDefaultPriceList(prodWarehouse) {
	const { priceList } = prodWarehouse;
	const {
		company: {
			salPriceListDefault: { id },
		},
	} = this.$userInfo;
	const { price } = prodWarehouse.product;

	const selectedPriceList = priceList && priceList[id] ? priceList[id] : { price };
	return typeof selectedPriceList === 'object' ? selectedPriceList.price : price;
}

function getPriceFromDefaultPriceListProd(prod) {
	const { price, priceList } = prod;
	const {
		company: {
			salPriceListDefault: { id },
		},
	} = this.$userInfo;

	const selectedPriceList = priceList && priceList[id] ? priceList[id] : { price };
	return typeof selectedPriceList === 'object' ? selectedPriceList.price : price;
}

function addProduct(row) {
	this.$emit('add-product', row, 'not-free');

	// if (!(row.product.flagLotsEnabled === 1)) {
	// 	this.$emit('add-product', row, 'not-free');
	// }
}

function addProductModal(row) {
	const index = this.products.findIndex((p) => p.id === row.id);
	if (index < 0) return;

	if (this.preventMultipleAddModal && this.isAddModalDisabled(this.products[index])) {
		return;
	}

	if (this.preventMultipleAddModal) {
		this.$set(this.products[index], 'isAddingModal', true);
	}

	this.$set(this.products[index], 'textBtn', 'Agregado');
	this.$set(this.products[index], 'colorForm', 'info');
	if (typeof row.location === 'undefined') {
		row.location = '';
	}
	this.$emit('add-product', row);
}

function isAddModalDisabled({ textBtn, isAddingModal }) {
	if (!this.preventMultipleAddModal) return false;
	return isAddingModal || textBtn === 'Agregado';
}

function freeProductBtnSelecction() {
	return this.isSale && this.showFree;
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

function data() {
	return {
		checkAll: false,
		isClean: false,
		itemsTotal: 0,
		columns: [
			{
				id: 1,
				name: 'Tienda',
				value: 'warehouseName',
				visible: true,
				checked: true,
			},
			{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
			{
				id: 3,
				name: 'Cod. interno',
				value: 'autoBarcode',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Otros códigos',
				value: 'alternateCode',
				visible: false,
				checked: false,
			},
			{
				id: 5,
				name: 'Imagen',
				visible: false,
				checked: true,
				flagVisible: true,
			},
			{ id: 6, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 7,
				name: 'Categorias',
				value: 'categories',
				visible: false,
				checked: false,
			},
			{
				id: 8,
				name: 'Características',
				value: 'inlineFeatures',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Descripción',
				value: 'description',
				visible: false,
				checked: false,
			},
			{
				id: 10,
				name: 'Ubicación',
				value: 'location',
				visible: false,
				checked: false,
			},
			{
				id: 11,
				name: 'Marca',
				value: 'brandName',
				visible: true,
				checked: true,
			},
			{
				id: 12,
				name: 'P. costo',
				value: 'priceCost',
				visible: !this.$userInfo.flagNotShowCostPrice,
				checked: !this.$userInfo.flagNotShowCostPrice,
				flagVisible: this.$userInfo.flagNotShowCostPrice,
			},
			{
				id: 13,
				name: 'P. venta',
				value: 'price',
				visible: true,
				checked: true,
			},
			{
				id: 14,
				name: 'Conteo',
				value: 'quantity',
				visible: false,
				checked: false,
			},
			{ id: 15, name: 'Stock', value: 'stock', visible: true, checked: true },
			{
				id: 16,
				name: 'Stock Reserv.',
				value: 'stock',
				tooltip: 'Stock Reservado',
				visible: false,
				checked: false,
			},
			{
				id: 17,
				name: 'Stock min',
				value: 'minStock',
				visible: false,
				checked: false,
			},
			{
				id: 18,
				name: 'Und.',
				value: 'unitCode',
				visible: false,
				checked: false,
			},
			{ id: 19, name: 'Kg', value: 'weigth', visible: false, checked: false },
			{
				id: 20,
				name: 'Estado',
				value: 'status',
				visible: false,
				checked: false,
			},
			{
				id: 21,
				name: 'T. Prod.',
				tooltip: 'Tipo de Producto',
				value: 'status',
				visible: false,
				checked: false,
			},
			{
				id: 22,
				name: 'Lote',
				tooltip: 'Número de Lote',
				value: 'lot',
				visible: false,
				checked: false,
			},
			{
				id: 23,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		disabledSearch: false,
		lastPage: 0,
		params: {
			flagActive: 1,
			flagSales: 1,
			flagWarehouseRequired: 1,
			limit: 22,
			page: 1,
			search: null,
			warehouseId: null,
			typeId: 1,
			relationAdd: 'productFind,brand,warehouse',
		},
		types: [],
		products: [],
		showBrandConfig: false,
		typeSelect: this.initialTypeSelect || 1,
	};
}

export default {
	name: 'products-search-form',
	components: {
		appTable,
	},
	computed: {
		freeProductBtnSelecction,
		typeOptions() {
			if (!this.onlyTypes.length) return this.types;
			return this.types.filter(({ id }) => this.onlyTypes.includes(id));
		},
	},
	created,
	data,
	methods: {
		addProduct,
		addProductModal,
		changeType,
		disabledAddBtn,
		getPriceFromDefaultPriceList,
		getPriceFromDefaultPriceListProd,
		loadData,
		loadTypes,
		search,
		statusInWord,
		isFree,
		productTypeVariant,
		isAddModalDisabled,
	},
	props: {
		preventMultipleAddModal: {
			type: Boolean,
			default: false,
		},
		initialTypeSelect: {
			default: 1,
			type: Number,
		},
		ecommerce: {
			default: false,
			type: Boolean,
		},
		master: {
			default: false,
			type: Boolean,
		},
		searchValue: String,
		warehouseId: [Number, String],
		text: {
			type: String,
			default: 'Agregar',
		},
		urlProducts: {
			type: String,
			default: 'products',
		},
		isSale: {
			type: Boolean,
			default: false,
		},
		selectable: {
			type: Boolean,
			default: true,
		},
		showFilter: {
			default: true,
			type: Boolean,
		},
		showFree: {
			default: false,
			type: Boolean,
		},
		showConsolidated: {
			default: false,
			type: Boolean,
		},
		purchase: {
			default: false,
			type: Boolean,
		},
		notValidNegativeStock: {
			default: false,
			type: Boolean,
		},
		quotation: {
			default: false,
			type: Boolean,
		},
		showLote: {
			default: false,
			type: Boolean,
		},
		warehouseOrigin: [String, Number],
		onlyTypes: {
			type: Array,
			default: () => [],
		},
		codeTaxes: {
			type: String,
		},
		typeId: {
			type: Number,
			default: 1,
		},
		flagLoadTypes: {
			type: Boolean,
			default: true,
		},
	},
};
</script>
