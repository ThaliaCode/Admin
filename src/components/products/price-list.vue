<template>
	<div>
		<section class="price-list px-2 pt-3">
			<div
				class="price-list-component"
				v-for="(item, index) in priceLists"
				:key="index"
			>
				<app-new-pricelist
					:list="item"
					:open-container-from-outside="index === 0"
					@disabled-accept-button="wrongPriceList = $event"
					@add-price-range="addPriceRange"
					@remove-price-range="removePriceRange"
					@set-price-list="setPriceList"
				/>
			</div>
		</section>
		<section
			class="add-new-price-list"
			:class="{ 'add-price-list': bigContainer }"
		>
			<div
				class="new-price-list-icon"
				@click="bigContainer = !bigContainer"
			>
				<label
					for="add-icon"
					class="new-list-title"
				>
					Nueva lista de precios
				</label>
				<v-spacer></v-spacer>
				<div class="pl-add-container">
					<v-icon
						id="add-icon"
						color="white"
					>
						add
					</v-icon>
				</div>
			</div>
			<div class="add-new-price-list-form">
				<v-text-field
					class="filter-select shadow-inset my-3"
					v-model="newPriceListData.name"
					single-line
					label="Nombre"
				></v-text-field>
				<v-text-field
					class="filter-select shadow-inset"
					v-model="newPriceListData.description"
					single-line
					label="Descripción"
				></v-text-field>
			</div>
			<div class="register-new-price-list">
				<v-icon
					color="error"
					@click="cancelNewPriceList"
				>
					cancel
				</v-icon>
				<v-icon
					color="success"
					@click="addNewPriceList"
				>
					check_circle
				</v-icon>
			</div>
		</section>
		<section class="feature-footer">
			<modal-sidebar-button
				:is-loading="isLoading || bigContainer || wrongPriceList"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="registerPrices"
			/>
		</section>
	</div>
</template>

<script>
import BasePrice from '@/shared/basePrice';
import lib from '@/shared/lib';
import PriceListClass from '@/shared/class/PriceListInstance';
import modalSidebarButton from './../shared/utils/modal-sidebar-button';
import appNewPricelist from './utils/app-new-pricelist';

const { compose, setNewProperty, getDeeper } = lib;

function created() {
	this.loadData();
}

async function addNewPriceList() {
	const body = {
		warWarehousesId: null,
		comEmployeeId: null,
		comCustomersId: null,
		name: this.newPriceListData.name,
		description: this.newPriceListData.description,
		flagDefault: false,
	};
	try {
		const response = await this.$httpSales.post('sal-price-lists', body);
		const id = response.data.id;
		body.id = id;
		body[id] = {
			price: 0,
			ranges: [{ from: 0, price: 0, to: 0 }],
		};
		this.priceLists.push(body);
		this.newPriceListData = {
			name: '',
			description: '',
		};
	} catch (e) {
		this.showNotification('error en los datos enviados. Verifique la información por favor', 'error');
		this.newPriceListData = {
			name: '',
			description: '',
		};
	}
}

function setPriceList(priceListUpdated, index) {
	const dataSelected = this.filteredProducts[0];
	if (dataSelected.taxes) {
		const PriceList = new PriceListClass(
			priceListUpdated,
			this.basePriceUsed,
			this.basePriceComputed,
			dataSelected.taxes,
		);
		const pricesListUpdateUpdated = compose(
			setNewProperty('price', PriceList.price),
			setNewProperty('unitPrice', PriceList.unitPrice),
			setNewProperty('taxes', PriceList.tax),
			setNewProperty('units', priceListUpdated.units ? PriceList.units : []),
		)(priceListUpdated);
		this.$set(this.priceLists, index, { ...pricesListUpdateUpdated });
	} else {
		this.$set(this.priceLists, index, { ...priceListUpdated });
	}
}

function basePriceUsed() {
	return getDeeper('company', 'settings', 'flagBasePriceDefault')(this.$userInfo);
}

function addPriceRange(id) {
	this.priceLists = this.priceLists.map((list) => {
		const newList = Object.assign({}, list);
		if (list.id === id) {
			newList[id].ranges.push({ from: 0, to: 0, price: 0 });
		}
		return newList;
	});
}

function cancelNewPriceList() {
	this.bigContainer = false;
	this.newPriceListData = {};
}

function clearModal() {
	this.filteredProducts = [];
	this.priceLists = {};
	this.newPrices = [];
}

function closeModal() {
	this.$emit('cancel-modal', false);
	this.clearModal();
}

function filteredValues() {
	this.filteredProducts =
		this.products.filter(e => e.brandId !== null && e.warehouseId !== null);
	const sizeProducts = this.products.length;
	const sizeFilteredProducts = this.filteredProducts.length;
	if (sizeProducts > sizeFilteredProducts) {
		const rest = sizeProducts - sizeFilteredProducts;
		this.showNotification(`${rest} productos no tienen Marca y/o Almacén. Fueron rechazados`, 'warning');
	}
	if (sizeFilteredProducts === 1) {
		this.showPriceListValue();
	}
	this.verifyExistingPriceList();
}

function formattedBody() {
	const products = this.filteredProducts.map((e) => {
		const newPriceList = {};
		this.priceLists.forEach((list) => {
			const newList = list[list.id];
			const newListKeys = Object.keys(newList);
			const discountKey = newListKeys.find(k => k === 'discount');
			if (discountKey && !newList.discount) {
				delete newList.discount;
			}
			newPriceList[list.id] = newList;
		});
		const newBody = {
			brandId: e.brandId,
			id: e.id,
			warehouseId: e.warehouseId,
			priceList: newPriceList,
		};
		return newBody;
	});
	const objectToSend = {
		products,
	};
	return objectToSend;
}

async function loadData() {
	this.isLoading = true;
	try {
		const response = await this.$httpSales.get('sal-price-lists');
		this.priceLists = response.data.map((list) => {
			const newList = { ...list };
			const productSelected = this.products[0];
			const conversionsValid = productSelected ? productSelected.conversions : null;
			const formatConversions = this.setConversionFromProduct(conversionsValid);
			const conver = formatConversions.map((c) => {
				const newC = {
					discount: 0,
					name: c.name,
					price: 0,
					id: c.id,
					ranges: [],
					salePrice: 0,
					tax: null,
					taxes: 0,
					unitPrice: 0,
				};
				return newC;
			});
			newList.units = conver;
			newList[list.id] = {
				price: 0,
				ranges: [{ from: 0, price: 0, to: 0 }],
			};
			this.products.forEach((product) => {
				if (product.priceList[list.id]) {
					newList[list.id] = product.priceList[list.id];
					// newList[list.id].units = product.priceList[list.id].units;
				}
			});
			return newList;
		});
		this.priceListFormatting();
		this.isLoading = false;
	} catch (e) {
		this.showGenericError();
		this.isLoading = false;
	}
	this.filteredValues();
}

function setConversionFromProduct(conversions) {
	const conversionsFromProduct = conversions ? Object.keys(conversions).map((k) => {
		const newConversions = { ...conversions[k] };
		newConversions.id = Number(k);
		return newConversions;
	}) : [];
	return [].concat(conversionsFromProduct);
}

function priceListFormatting() {
	this.priceLists.forEach((pl) => {
		const newRow = { ...pl };
		newRow.name = pl.name;
		newRow.id = pl.id;
		newRow.tax = null;
		return newRow;
	});
	// this.pricesListsSlide = [...this.newProduct.pricesLists];
}

function oneProductPrice(id) {
	if (this.flagOneProduct) {
		return this.filteredProducts[0].priceList[id].price;
	}
	return null;
}

function oneProductQuantity(id) {
	if (this.flagOneProduct) {
		return this.filteredProducts[0].priceList[id].quantity;
	}
	return null;
}

function oneProductWholeSalePrice(id) {
	if (this.flagOneProduct) {
		return this.filteredProducts[0].priceList[id].wholeSalePrice;
	}
	return null;
}

async function registerPrices() {
	this.isLoading = true;
	const body = this.formattedBody();
	try {
		await this.$httpProducts.patch('v2/products/prices', body);
		this.isLoading = false;
		this.clearModal();
		this.closeModal();
		this.showNotification('Éxito al registar los datos');
		this.$emit('update-product-prices');
	} catch (e) {
		this.showNotification('error en los datos enviados. Verifique la información por favor', 'error');
		this.isLoading = false;
	}
}

function removePriceRange({ id, index }) {
	this.priceLists = this.priceLists.map((list) => {
		const newList = Object.assign({}, list);
		if (list.id === id) {
			newList[id].ranges.splice(index, 1);
			this.listRanges = (newList[id].ranges.length - 1);
		}
		return newList;
	});
}

function saleMajorPrice(price, id) {
	const newPrice = this.validate(price);
	this.filteredProducts.forEach((el) => {
		const newEl = el;
		newEl.priceList[id].wholeSalePrice = newPrice;
		return newEl;
	});
}

function saleMajorQuantity(quantity, id) {
	const newQuantity = this.validate(quantity);
	this.filteredProducts.forEach((el) => {
		const newEl = el;
		newEl.priceList[id].quantity = newQuantity;
		return newEl;
	});
}

function salePrice(price, id) {
	const newPrice = this.validate(price);
	this.filteredProducts.forEach((el) => {
		const newEl = el;
		newEl.priceList[id].price = newPrice;
		return newEl;
	});
}

function showPriceListValue() {
	this.completeContainer = true;
	this.flagOneProduct = true;
}

function validate(value) {
	const acceptanceValue = value >= 0;
	if (!acceptanceValue) {
		this.showNotification('Solo se permiten valores numéricos', 'error');
		return 0;
	}
	return value;
}

function verifyExistingPriceList() {
	this.filteredProducts = this.filteredProducts.map((el) => {
		if (!el.priceList) {
			const size = this.priceLists.length;
			const newObject = {};
			for (let i = 0; i < size; i += 1) {
				const id = this.priceLists[i].id;
				newObject[id] = {
					price: 0,
					quantity: 0,
					wholeSalePrice: 0,
				};
			}
			const newEl = el;
			newEl.priceList = newObject;
			return newEl;
		}
		return el;
	});
}

function data() {
	return {
		isLoading: false,
		priceLists: [],
		newPrices: {},
		completeContainer: false,
		filteredProducts: [],
		bigContainer: false,
		newPriceListData: {
			name: '',
			description: '',
		},
		flagOneProduct: false,
		wrongPriceList: false,
	};
}

function basePriceComputed() {
	return BasePrice;
}

export default {
	name: 'price-list',
	components: {
		appNewPricelist,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		addNewPriceList,
		addPriceRange,
		cancelNewPriceList,
		clearModal,
		closeModal,
		filteredValues,
		formattedBody,
		loadData,
		oneProductPrice,
		oneProductQuantity,
		oneProductWholeSalePrice,
		priceListFormatting,
		registerPrices,
		removePriceRange,
		saleMajorPrice,
		saleMajorQuantity,
		salePrice,
		setConversionFromProduct,
		setPriceList,
		showPriceListValue,
		validate,
		verifyExistingPriceList,
	},
	computed: {
		basePriceUsed,
		basePriceComputed,
	},
	props: {
		products: {
			type: Array,
			required: true,
			default: [],
		},
	},
};
</script>

<style lang="scss" scoped>
.add-new-price-list {
	@include vertical-displacement;
	height: 50px;
	margin-bottom: 30px;
	overflow: hidden;
	padding: 15px 30px;
}
.add-price-list {
	height: 190px;
}
.new-price-list-icon {
	align-items: center;
	cursor: pointer;
	display: flex;
	label {
		@include txt-config (open-regular, medium);
	}
}
.register-new-price-list {
	@include flex-around;
	margin-top: 19px;
	.icon {
		cursor: pointer;
	}
}
.price-list-component {
	width: 100%;
}
// .price-list-component:nth-child(even) {
// 	background-color: map-get($colors, background-sidebar);
// }
.new-list-title {
	color: black !important;
	font-family: map-get($fonts, open-semibold) !important;
	font-size: 13px !important;
}
</style>


