<template>
	<section>
		<header-page
			name="project-transfers"
			:title="$route.meta.title"
			selectable
		/>
		<general-filter class="layout row wrap">
			<v-flex xs12>
				<v-layout row wrap>
					<v-flex xs3 pr-1 class="align-col">
						<v-select
							single-line
							bottom
							hide-details
							v-model="model.movementType"
							class="filter-select shadow-inset"
							content-class="filter-select-content"
							item-text="text"
							item-value="id"
							:items="movementsTypes"
							label="Tipo Movimiento">
						</v-select>
						{{ model.movementsType }}
					</v-flex>
					<v-flex xs3 px-1 class="align-col">
						<v-select
							single-line
							bottom
							hide-details
							v-model="model.warehouseId"
							class="filter-select shadow-inset"
							content-class="filter-select-content"
							item-text="name"
							item-value="id"
							:items="warehouses"
							label="Almacén">
						</v-select>
						{{ model.movementsType }}
					</v-flex>
					<v-flex xs2 pl-1 class="align-col position">
						<v-menu
							lazy
							v-model="menuDate"
							transition="scale-transition"
							offset-y
							full-width
						>
							<v-text-field
								slot="activator"
								label="Fecha de inicio"
								v-model="entryDate"
								single-line
								append-icon="event"
								class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-end"
								readonly
							></v-text-field>
							<v-date-picker
								v-model="entryDate"
								no-title
								scrollable
							></v-date-picker>
						</v-menu>
					</v-flex>
					<v-flex xs2 pl-1 class="align-col position">
						<v-menu
							ref="menu"
							:close-on-content-click="false"
							v-model="menuHours"
							transition="scale-transition"
						>
							<v-text-field
								slot="activator"
								label="Hora de inicio"
								v-model="entryHours"
								single-line
								append-icon="event"
								class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-end"
								readonly
							></v-text-field>
							<v-time-picker
								color="primary"
								v-model="entryHours"
								format="24hr"
							>
          						<v-btn flat color="primary" @click="menuHours = false">Aceptar</v-btn>
							</v-time-picker>
						</v-menu>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12>
				<v-layout row wrap>
					<v-flex xs6 pr-1>
						<v-select
							autocomplete
							bottom
							cache-items
							class="filter-select shadow-inset"
							content-class="filter-select-content"
							hide-details
							item-text="fullName"
							label="Buscar Producto"
							single-line
							:items="products"
							:loading="loading"
							:search-input.sync="search"
							v-model="selectedProduct">
						</v-select>
					</v-flex>
					<v-flex xs2 pl-1>
						<v-layout row wrap>
							<v-flex xs9>
								<v-text-field
									class="filter-select shadow-inset"
									hide-details
									label="Cantidad"
									single-line
									type="number"
									v-model.number="quantity"
								></v-text-field>
							</v-flex>
							<v-flex xs3 pl-2>
								<v-btn
									class="btn-action white--text"
									color="primary"
									:disabled="thereIsNoProduct"
									@click="addProducts">
									<v-icon>add</v-icon>
								</v-btn>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</general-filter>
		<div class="overflow-auto">
			<app-table
				name="project-transfers"
				:columns="columns"
				:rows="localProducts"
				local-storage
				:input-search="false"
				:main-list="false"
				selectable
				@on-toggle-columns="toggleColumns"
				class="no-main-list">
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable"
						v-show="showRow(columns, 1)">
						{{ props.row.name }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.brandName }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.price | round }}</td>
					<td v-show="showRow(columns, 5)">
						<v-text-field
							label="00"
							type="number"
							v-model.number="props.row.quantity"
							single-line
							hide-details
							min="0"
							class="filter-select shadow-inset-table"
						></v-text-field>
					</td>
					<td v-show="showRow(columns, 6)">
						<v-text-field
							label="00"
							type="number"
							v-model.number="props.row.priceCost"
							single-line
							hide-details
							min="0"
							class="filter-select shadow-inset-table"
						></v-text-field>
					</td>
				</template>
			</app-table>
		</div>
		<v-layout row wrap justify-center>
			<v-flex xs2>
				<v-btn
					color="success"
					class="btn-action text-large white--text"
					:disabled="btnDisabled"
					@click="completeProcess">
					Crear {{ btnText }} de productos
				</v-btn>
			</v-flex>
		</v-layout>
	</section>
</template>

<script>
import helper from '@/shared/helper';
import appTable from './../../shared/table/app-table';
import generalFilter from './../../shared/general-filter';
import headerPage from './../../shared/header-page';

async function created() {
	const requests = [this.warehousesList()];
	const [warehouses] = await Promise.all(requests);
	this.warehouses = warehouses.data;
	this.model.warehouseId = this.warehouses[0].id;
	this.model.movementType = Number(this.type);
	this.loadData();
}

function addProducts() {
	const newSelectedProduct = { ...this.selectedProduct };
	let productExist = false;
	if (this.localProducts.length > 0) {
		this.localProducts.forEach((product) => {
			if (product.id === newSelectedProduct.id) {
				productExist = true;
			}
		});
		if (productExist) {
			this.showNotification('El producto ya se encuentra en la lista.',
				'primary');
		} else {
			newSelectedProduct.isSelected = false;
			newSelectedProduct.quantity = this.quantity;
			this.localProducts.push(newSelectedProduct);
		}
	} else {
		newSelectedProduct.isSelected = false;
		newSelectedProduct.quantity = this.quantity;
		this.localProducts.push(newSelectedProduct);
	}
	this.selectedProduct = {};
	this.quantity = 0;
}

function btnDisabled() {
	const producstSelected = this.localProducts.filter(p => p.isSelected);
	const productsEmpty = producstSelected.length === 0;
	return productsEmpty
		|| producstSelected.findIndex(prod => prod.quantity <= 0) > -1
		|| !this.entryDate || !this.entryHours;
}

function btnText() {
	return this.model.movementType === 1 ? 'ingreso' : 'salida';
}

async function completeProcess() {
	const article = this.model.movementType === 1 ? 'El' : 'La';
	const detailsFilter = this.localProducts.filter(product => product.isSelected);
	const details = detailsFilter.map((detail) => {
		const newLocal = { ...detail };
		const { brandId, quantity, priceCost } = detail;
		newLocal.detail = {
			brandId,
			productId: detail.id,
			quantity,
			priceCost,
		};
		return newLocal.detail;
	});
	this.model.entryDate = this.formatEntryDate();
	this.model.details = details;
	try {
		await this.$httpProduction.post(`transfer/${this.id}`, this.model);
		this.showNotification(`${article} ${this.btnText} de productos se completó correctamente.`);
		this.goTo('project-movements', { params: { id: this.id, code: this.code } });
	} catch (err) {
		this.showGenericError();
	}
}

function formatEntryDate() {
	return new Date(`${this.entryDate} ${this.entryHours}`);
}

async function loadData() {
	try {
		const { data: sale } = await this.$httpSales.get(`sale-documents/${this.saleId}`);
		this.localProducts = sale.details.map((detail) => {
			const newDetail = { ...detail };
			newDetail.product.quantity = detail.quantity || 0;
			newDetail.product.isSelected = false;
			const priceKey = Object.keys(detail.product.priceList)[0];
			newDetail.product.price = detail.product.priceList[priceKey].price;
			return newDetail.product;
		});
	} catch (err) {
		this.showGenericError();
	}
}

async function loadProducts(value) {
	const searchTrim = value ? value.trim() : '';
	if (searchTrim) {
		this.loading = true;
		try {
			const { data: products } = await this.productsSelections(searchTrim);
			this.products = products
				.filter(p => p.warehouseId === this.model.warehouseId)
				.map((p) => {
					const newP = { ...p };
					newP.fullName = `${p.name} - (${p.brandName}) - (${p.autoBarcode})`;
					return newP;
				});
		} catch (err) {
			this.showGenericError();
		} finally {
			this.loading = false;
		}
	}
}

function search(val) {
	return val && this.loadProducts(val);
}

function thereIsNoProduct() {
	return (Object.keys(this.selectedProduct).length === 0)
		|| !this.quantity;
}

function toggleColumns() {
	return true;
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 3, name: 'Marca', value: 'brandName', visible: true, checked: true },
			{ id: 4, name: 'Precio', value: 'price', visible: true, checked: true },
			{ id: 5, name: 'Cantidad', value: 'quantity', visible: true, checked: true },
			{ id: 6, name: 'Precio de costo', value: 'priceCost', visible: true, checked: true },
		],
		entryDate: '',
		entryHours: null,
		loading: false,
		localProducts: [],
		menuDate: false,
		menuHours: false,
		model: {
			entryDate: helper.formatDate(new Date(), 'YYYY-MM-DD'),
			warehouseId: null,
			movementType: 1,
			details: [],
		},
		movementsTypes: [
			{ id: 1, text: 'Entrada de productos' },
			{ id: 2, text: 'Salida de productos' },
		],
		products: [],
		quantity: 0,
		search: null,
		selectedProduct: {},
		warehouses: [],
	};
}

export default {
	name: 'project-transfer',
	components: {
		appTable,
		generalFilter,
		headerPage,
	},
	computed: {
		btnDisabled,
		btnText,
		thereIsNoProduct,
	},
	created,
	data,
	methods: {
		addProducts,
		completeProcess,
		formatEntryDate,
		loadData,
		loadProducts: helper.debounce(loadProducts),
		toggleColumns,
	},
	props: ['id', 'autoCode', 'type', 'saleId'],
	watch: {
		search,
	},
};
</script>

<style lang="scss" scoped>
	.btn-action {
		min-width: auto !important;
		width: 100% !important;
	}
</style>