<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12>
				<v-text-field
					class="japi-input-text"
					name="new-product-name"
					label="Nombre"
					v-model="newProduct.name"
				></v-text-field>
			</v-flex>
			<v-flex xs12 md6 pr-2 v-if="!servicesActive">
				<v-select
					class="japi-input-select"
					item-text="name"
					:items="types"
					label="Tipo"
					v-model="newProduct.type"
				></v-select>
			</v-flex>
			<v-flex xs12 :class="{ 'md6 pl-2' : !servicesActive }">
				<v-select
					class="japi-input-select"
					item-text="name"
					:items="units"
					label="Unidad"
					v-model="newProduct.unit"
				></v-select>
			</v-flex>
			<v-flex xs12 md6 pr-2 v-if="showWarehouse === 1">
				<v-select
					class="japi-input-select"
					item-text="name"
					:items="warehouses"
					label="Almacen"
					v-model="newProduct.warehouse"
				></v-select>
			</v-flex>
			<v-flex xs12 md6 pl-2 v-if="showWarehouse === 1">
				<v-select
					class="japi-input-select"
					label="Marca"
					v-model="newProduct.brand"
					item-text="name"
					:items="brands"
				></v-select>
			</v-flex>
			<v-flex xs12>
				<v-select
					class="japi-input-select"
					item-text="name"
					:items="categories"
					label="Categorías"
					v-model="newProduct.category"
				></v-select>
			</v-flex>
			<v-flex xs12 mt-2>
				<p class="body-2 mb-0">Características</p>
			</v-flex>
			<v-flex xs12>
				<v-select
					v-for="(feature, index) in featuresSelected"
					:key="index"
					class="japi-input-select"
					item-text="name"
					:items="feature.features"
					:label="feature.name"
					@change="getCode($event.id)"
					v-model="newProduct.features[index]"
				></v-select>
			</v-flex>
			<v-flex xs12 md6 pr-2>
				<v-text-field
					class="japi-input-text"
					name="new-product-code"
					label="Código"
					v-model="newProduct.code"
					:disabled="!editCode"
				></v-text-field>
				<span
					class="text-not-code-blank"
					v-if="checkBlankCode(newProduct.code)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<v-flex xs12 md6 pl-2 pt-3>
				<v-checkbox
					class="fast-register-code-chk mt-1"
					color="primary"
					:label="'Cambiar Código'"
					v-model="editCode"
					hideDetails
				></v-checkbox>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				@cancel-button-clicked="closeModal || checkBlankCode(newProduct.code)"
				@accept-button-clicked="registerProduct"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from './../utils/modal-sidebar-button';

function created() {
	this.getData();
}

async function registerProduct() {
	if (this.actionCode === 'product-register' || this.servicesActive) {
		try {
			this.isLoading = true;
			const newFeatures = this.newProduct.category.features.map((el, index) => {
				const newFeaturesObject = {
					id: el.id,
					code: el.features[index].id,
					name: el.name,
					value: el.features[index].name,
					filterable: el.filterable,
					flagSeparator: el.flagSeparator > 0,
					includeInCode: el.includeInCode,
				};
				return newFeaturesObject;
			});
			this.newProduct.priceList[this.defaultPriceListId] = this.newProduct.defaultPriceList;
			const body = {
				brandId: this.newProduct.brand.id,
				categoryId: this.newProduct.category.id,
				code: this.newProduct.code,
				features: newFeatures,
				name: this.newProduct.name,
				unitId: this.newProduct.unit.id,
				type: this.newProduct.type.id,
				warehouseId: this.newProduct.warehouse.id,
				priceList: this.newProduct.priceList,
			};
			await this.$httpProducts.post('v2/products-fast', body);
			this.showNotification('El producto fue registrado con éxito');
			this.isLoading = false;
			this.closeModal();
			this.clearModal();
			this.$emit('on-register');
		} catch (error) {
			this.showNotification('error en los datos enviados. Verifique la información por favor', 'error');
			this.isLoading = false;
		}
	}
}

async function getData() {
	this.isLoading = true;
	const requests = [
		this.categoriesList(),
		this.listOfUnits(),
		this.$httpProducts.get('brands'),
		this.$httpProducts.get('warehouses'),
		this.listPricingPromise(),
		this.$httpProducts.get('/v2/type-products'),
	];
	try {
		[
			{ data: this.categories },
			{ data: this.brands },
			{ data: this.units },
			{ data: this.warehouses },
			{ data: this.priceList },
			{ data: this.types },
		] = await Promise.all(requests);
		this.newProduct.type = this.servicesActive ? this.types.find(t => t.code === 'servicios') :
			this.types[0];
		this.defaultPriceListId = this.priceList.filter(p => p.flagDefault === 1)[0].id;
		const unitLength = this.units.length;
		this.newProduct.unit = this.units[unitLength - 1];
		this.isLoading = false;
	} catch (e) {
		this.showNotification('Ocurrió un problema con el servidor, recargue la página.', 'error');
	}
}

function showWarehouse() {
	const type = this.newProduct.type.id;
	if (type === 2) {
		this.newProduct.brand = {};
		this.newProduct.warehouse = {};
	}
	return type;
}

function featuresSelected() {
	this.newProduct.features = [];
	const categories = this.categories.find(c => c.id === this.newProduct.category.id);
	if (categories) {
		return categories.features;
	}
	return [];
}

function getCode(id) {
	this.newProduct.code = this.newProduct.code + id;
}

function closeModal() {
	this.$emit('cancel-modal', false, { ...this.newProduct });
	this.clearModal();
}

function clearModal() {
	const newProduct = {
		name: '',
		warehouseId: {},
		brandId: {},
		unitId: {},
		type: {},
		categoryId: {},
		features: [],
		code: '',
	};
	this.newProduct = Object.assign(this.newProduct, newProduct);
}

function servicesActive() {
	return this.actionCode === 'new-services';
}

function data() {
	return {
		isLoading: true,
		editCode: false,
		defaultPriceListId: 0,
		newProduct: {
			name: '',
			warehouse: {},
			brand: {},
			unit: {},
			type: {},
			category: {},
			features: [],
			code: '',
			defaultPriceList: {
				price: 0,
				ranges: [
					{ price: 0, to: 0, from: 0 },
				],
			},
			priceList: {},
		},
		brands: [],
		categories: [],
		priceList: [],
		types: [],
		units: [],
		warehouses: [],
	};
}

export default {
	name: 'fast-register',
	components: {
		modalSidebarButton,
	},
	computed: {
		featuresSelected,
		servicesActive,
		showWarehouse,
	},
	created,
	data,
	methods: {
		clearModal,
		closeModal,
		getCode,
		getData,
		registerProduct,
	},
	props: {
		actionCode: {
			type: String,
			required: false,
		},
	},
};
</script>
