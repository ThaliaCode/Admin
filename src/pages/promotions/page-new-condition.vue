<template>
	<div>
		<header-page :title="$route.meta.title"></header-page>
		<v-layout row align-start justify-space-between pt-4 px-5>
			<v-flex xs5>
				<v-flex class="title-header">DATOS GENERALES</v-flex>
				<v-layout column>
					<v-flex xs5 mt-2>
						<app-input-text
							label="Código"
							:text="condition.code"
							:disabled="idCondition ? true : false"
							model="code"
							@input="setData"
						/>
						<span class="form-group__message" v-if="checkBlankCode(condition.code)">
							No se permite espacios en blanco
						</span>
					</v-flex>
					<v-flex xs12 mt-2>
						<app-input-text
							label="Descripción"
							:text="condition.description"
							model="description"
							@input="setData"
						/>
					</v-flex>
					<v-flex xs6>
						<app-select
							item-text="name"
							item-value="id"
							label="Tipo de Entidad"
							model="typeEntity"
							:items="typeEntity"
							:item="condition.typeEntity"
							@input="setDataTypeEntity"
						/>
					</v-flex>
					<v-flex mt-2>
						<v-layout row>
							<v-flex xs6>
								<app-select
									item-text="name"
									item-value="id"
									label="Tipo de Condición"
									model="typeTerms"
									:items="typeTerms"
									:item="condition.typeTerms"
									@input="setDataTypeTerms"
								/>
							</v-flex>
							<v-flex xs6 ml-2>
								<app-select
									item-text="name"
									item-value="id"
									label="Condición"
									:items="terms"
									:item="condition.terms"
									model="terms"
									@input="setDataTerms"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex mt-2>
						<v-layout row>
							<v-flex xs6>
								<app-input-text
									label="Cantidad"
									model="quantity"
									type="number"
									:text="condition.quantity"
									:disabled="activeQuantity"
									@input="setDataQuantity"
								/>
								<span v-if="decimalError" style="color: red; font-size: 12px">
									Solo se permiten hasta dos decimales.
								</span>
							</v-flex>
							<v-flex xs6 ml-2>
								<app-input-text
									label="Monto"
									model="amount"
									type="number"
									:text="condition.amount"
									:disabled="activeAmount"
									@input="setDataAmount"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mt-3>
						<v-layout>
							<v-flex xs4>
								<p class="company-text-regular ma-0">Productos acumulables</p>
							</v-flex>
							<v-flex xs2 pl-2>
								<v-layout>
									<v-flex>
										<v-switch
											color="success"
											hide-details
											v-model="condition.flagCumulative"
										></v-switch>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex mt-2 v-if="selectedTerm">
						<v-layout row>
							<v-flex xs6>
								<app-input-text
									label="Cantidad Mayor"
									model="quantityAux"
									type="number"
									:text="condition.quantityAux"
									:disabled="activeQuantity"
									@input="setDataQuantity"
								/>
							</v-flex>
							<v-flex xs6 ml-2>
								<app-input-text
									label="Monto Mayor"
									model="amountAux"
									type="number"
									:text="condition.amountAux"
									:disabled="activeAmount"
									@input="setDataAmount"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex mt-2 v-if="!idCondition">
						<v-switch
							hide-details
							color="success"
							v-model="condition.flagActive"
							:false-value="1"
							:true-value="2"
							label="Activa"
						></v-switch>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs5>
				<v-flex class="title-header">{{
					!condition.typeEntity
						? 'TIPO DE ENTIDAD'
						: condition.typeEntity === 1
						? 'PRODUCTOS'
						: 'ALMACENES'
				}}</v-flex>
				<v-flex xs8 md6 mt-2 v-if="condition.typeEntity === 1">
					<button class="product-add-btn mt-1" type="button" @click="addProductForm">
						<span>AGREGAR PRODUCTOS</span>
						<v-icon class="product-add-btn-icon" color="primary" size="17">
							add_circle
						</v-icon>
					</button>
				</v-flex>
				<v-flex xs8 md6 mt-2 v-if="condition.typeEntity === 2">
					<button class="warehouse-add-btn mt-1" type="button" @click="addWarehouseForm">
						<span>AGREGAR ALMACENES</span>
						<v-icon class="warehouse-add-btn-icon" color="primary" size="17">
							add_circle
						</v-icon>
					</button>
				</v-flex>
				<v-flex
					xs12
					mt-2
					class="section-products"
					v-if="condition.typeEntity === 1 && selectedProducts.length"
				>
					<v-layout align-center row justify-space-between>
						<v-flex xs3>
							<span class="title-for">Cod</span>
						</v-flex>
						<v-flex xs8 ml-1>
							<span class="title-for">Nombre</span>
						</v-flex>
					</v-layout>
					<v-layout
						mt-1
						align-center
						row
						justify-space-between
						v-for="(product, index) in selectedProducts"
						:key="index"
					>
						<v-flex xs3>
							<p class="content-for">
								{{ product.code }}
							</p>
						</v-flex>
						<v-flex xs8 ml-1>
							<p class="content-for">
								{{ product.name }}
							</p>
						</v-flex>
						<v-flex xs1 ml-1>
							<app-tooltip-button
								text="Eliminar Producto"
								icon="highlight_off"
								color="error"
								@click-icon="deleteProduct(index)"
							/>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mt-2 v-if="condition.typeEntity === 2 && selectedWarehouses.length">
					<v-layout align-center row justify-space-between>
						<v-flex xs3>
							<span class="title-for">Cod</span>
						</v-flex>
						<v-flex xs8 ml-1>
							<span class="title-for">Nombre</span>
						</v-flex>
					</v-layout>
					<v-layout
						mt-1
						align-center
						row
						justify-space-between
						v-for="(warehouse, index) in selectedWarehouses"
						:key="index"
					>
						<v-flex xs3>
							<p class="content-for">
								{{ warehouse.code }}
							</p>
						</v-flex>
						<v-flex xs8 ml-1>
							<p class="content-for">
								{{ warehouse.name }}
							</p>
						</v-flex>
						<v-flex xs1 ml-1>
							<app-tooltip-button
								text="Eliminar Almacen"
								icon="highlight_off"
								color="error"
								@click-icon="deleteWarehouse(index)"
							/>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-flex>
		</v-layout>
		<action-sidebar
			:title="action.title"
			:value="action.open"
			:width="action.width"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<products-search-form
				v-if="action.code === 'add-product'"
				not-valid-negative-stock
				master
				:selectable="false"
				:show-filter="false"
				@add-product="setProduct"
			/>
			<warehouses-search-form
				v-if="action.code === 'add-warehouse'"
				not-valid-negative-stock
				master
				:show-filter="false"
				text="Seleccionar"
				@add-warehouse="setWarehouse"
			/>
		</action-sidebar>
		<section class="modal-filter-footer py-0">
			<modal-sidebar-button
				:is-loading="$v.$invalid || checkBlankCode(condition.code) || decimalError"
				cancel-text="Atras"
				success-color="primary"
				@cancel-button-clicked="goBack"
				@accept-button-clicked="saveCondition"
			/>
		</section>
	</div>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import headerPage from '@/components/shared/header-page';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import warehousesSearchForm from '@/components/shared/searcher/warehouses-search-form';

function goBack() {
	this.$router.back();
}

function addProductForm() {
	this.action = {
		width: 850,
		open: true,
		code: 'add-product',
		title: 'Seleccionar Producto',
	};
}

function addWarehouseForm() {
	this.action = {
		width: 750,
		open: true,
		code: 'add-warehouse',
		title: 'Seleccionar Almacen',
	};
}

function closeModal() {
	this.action = {
		active: false,
		open: false,
		code: '',
		title: '',
		width: 0,
	};
}

function created() {
	this.idCondition = this.$route.params.id;
	this.condition.typeEntity = this.idCondition ? undefined : 1;
	if (this.idCondition) {
		this.loadCondition();
	}
}

async function loadCondition() {
	try {
		const response = await this.$httpProducts.get(`terms/${this.idCondition}`);
		this.condition.code = response.data.code;
		this.condition.description = response.data.description;
		this.condition.typeTerms = response.data.typeTerms;
		this.condition.terms = response.data.terms;
		this.condition.amount = response.data.amount;
		this.condition.amountAux = response.data.amountAux;
		this.condition.quantity = response.data.quantity;
		this.condition.quantityAux = response.data.quantityAux;
		this.condition.typeEntity = response.data.typeEntity;
		this.condition.flagCumulative = response.data.flagCumulative;
		response.data.products.forEach((product) => {
			this.setProduct(product);
		});
		if (
			response.data &&
			response.data.warehouses &&
			response.data.warehouses.length > 0
		) {
			response.data.warehouses.forEach((warehouse) => {
				this.setWarehouse(warehouse);
			});
		}
		this.validTerms();
	} catch (error) {
		this.showGenericError();
	}
}

async function saveCondition() {
	this.isLoading = true;
	const method = this.idCondition ? 'patch' : 'post';
	const url = this.idCondition ? `terms/${this.idCondition}` : 'terms';
	const update = 'se actualizó';
	const create = 'ha sido creado';
	const message = this.idCondition ? update : create;
	const body = this.getData();
	try {
		await this.$httpProducts[method](url, body);
		this.showNotification(`La Condición ${message} de manera exitosa`);
		this.goTo('conditions-list');
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'TERMS_DUPLICATE_CODE') {
				this.showGenericError('El código ya está asignado a otra Condición.');
			}
		} else {
			this.showGenericError();
		}
	}
}

function getData() {
	const conditionData = {
		description: this.condition.description,
		quantity: Number(this.condition.quantity),
		quantityAux: Number(this.condition.quantityAux),
		typeTerms: this.condition.typeTerms,
		terms: this.condition.terms,
		amount: Number(this.condition.amount),
		amountAux: Number(this.condition.amountAux),
		typeEntity: this.condition.typeEntity,
		flagCumulative: Boolean(this.condition.flagCumulative),
	};
	if (this.condition.typeEntity === 1) {
		conditionData.productIds = this.condition.productIds;
	} else {
		conditionData.warehouseIds = this.condition.warehouseIds;
	}
	if (!this.idCondition) {
		conditionData.code = this.condition.code;
	}
	return conditionData;
}

function setData({ model, value }) {
	this.condition[model] = value;
}

function setDataQuantity({ model, value }) {
	this.condition[model] = value;
	if (value === '' || value === 0 || value === '0') {
		this.activeAmount = false;
		this.activeQuantity = false;
	} else {
		this.activeAmount = true;
		this.condition.amount = 0;
		this.condition.amountAux = 0;
	}
	if (model === 'quantity') {
		const regex = /^\d+(\.\d{1,2})?$/;
		this.decimalError = this.condition.quantity && !regex.test(value);
	}
}

function setDataAmount({ model, value }) {
	this.condition[model] = value;
	if (value === '' || value === 0 || value === '0') {
		this.activeQuantity = false;
	} else {
		this.activeQuantity = true;
		this.condition.quantity = 0;
		this.condition.quantityAux = 0;
	}
}

function setDataTypeTerms({ model, value }) {
	this.condition[model] = value.id;
}

function setDataTypeEntity({ model, value }) {
	this.condition[model] = value.id;
}

function setDataTerms({ model, value }) {
	this.condition[model] = value.id;
	this.validTerms();
}

function setProduct(productList) {
	const newProduct = {
		id: productList.id,
		code: productList.code,
		name: productList.name,
	};
	// this.closeModal();
	const existProduct = this.condition.productIds.filter((item) => item === newProduct.id);
	if (!existProduct.length) {
		this.condition.productIds.push(newProduct.id);
		this.selectedProducts.push(newProduct);
	}
}
function setWarehouse(warehouseList) {
	const newWarehouse = {
		id: warehouseList.id,
		code: warehouseList.code,
		name: warehouseList.name,
	};
	this.closeModal();
	const existProduct = this.condition.warehouseIds.filter(
		(item) => item === newWarehouse.id
	);
	if (!existProduct.length) {
		this.condition.warehouseIds.push(newWarehouse.id);
		this.selectedWarehouses.push(newWarehouse);
	}
}

function deleteProduct(index) {
	this.selectedProducts.splice(index, 1);
	this.condition.productIds.splice(index, 1);
}
function deleteWarehouse(index) {
	this.selectedWarehouses.splice(index, 1);
	this.condition.warehouseIds.splice(index, 1);
}

function validTerms() {
	if (
		this.condition.terms &&
		(this.condition.terms === 6 || this.condition.terms === 7)
	) {
		this.selectedTerm = true;
		return;
	}
	this.selectedTerm = false;
	this.condition.amountAux = 0;
	this.condition.quantityAux = 0;
}

function validations() {
	return {
		condition: {
			code: { required },
			description: { required },
			typeTerms: { required },
			terms: { required },
			productIds: {
				required: requiredIf(() => this.condition.warehouseIds.length === 0),
			},
			warehouseIds: {
				required: requiredIf(() => this.condition.productIds.length === 0),
			},
		},
	};
}

function data() {
	return {
		action: {
			code: null,
			title: '',
			open: false,
			width: 0,
		},
		condition: {
			code: '',
			description: '',
			typeTerms: '',
			typeEntity: '',
			terms: '',
			amount: 0,
			quantity: 0,
			amountAux: 0,
			quantityAux: 0,
			productIds: [],
			warehouseIds: [],
			flagCumulative: false,
		},
		selectedProducts: [],
		selectedWarehouses: [],
		selectedTerm: false,
		activeQuantity: false,
		activeAmount: false,
		typeTerms: [
			{
				id: 1,
				name: 'En',
			},
			{
				id: 2,
				name: 'Todo en',
			},
			{
				id: 3,
				name: 'No En',
			},
			{
				id: 4,
				name: 'Excluir',
			},
			{
				id: 5,
				name: 'Cualquier en',
			},
		],
		typeEntity: [
			{
				id: 1,
				name: 'Producto',
			},
			{
				id: 2,
				name: 'Almacen',
			},
		],
		terms: [
			{
				id: 1,
				name: '>',
			},
			{
				id: 2,
				name: '>=',
			},
			{
				id: 3,
				name: '=',
			},
			{
				id: 4,
				name: '<=',
			},
			{
				id: 5,
				name: '<',
			},
			{
				id: 6,
				name: '> o <',
			},
			{
				id: 7,
				name: '>= o <=',
			},
			{
				id: 8,
				name: '!=',
			},
		],
		decimalError: false,
	};
}

export default {
	name: 'page-new-condition',
	data,
	components: {
		actionSidebar,
		headerPage,
		modalSidebarButton,
		productsSearchForm,
		warehousesSearchForm,
	},
	created,
	computed: {},
	methods: {
		addProductForm,
		addWarehouseForm,
		closeModal,
		deleteProduct,
		deleteWarehouse,
		getData,
		goBack,
		loadCondition,
		saveCondition,
		setData,
		setDataQuantity,
		setDataAmount,
		setDataTerms,
		setDataTypeTerms,
		setDataTypeEntity,
		setProduct,
		setWarehouse,
		validTerms,
	},
	validations,
};
</script>

<style lang="scss" scoped>
.title-for {
	color: color(primary);
	font-size: 10px;
}

.title-header {
	border-bottom: 1px solid #d9e8e9;
	color: color(sidebar);
	font-family: font(open-bold);
	font-size: 13px;
	padding-bottom: 8px;
}

.product-add-btn {
	align-items: center;
	border-color: color(primary);
	border-style: solid;
	border-width: 1px;
	border-radius: 2px;
	color: color(primary);
	cursor: pointer;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	font-family: font(open-semibold);
	font-size: size(small);
	height: 27px;
	justify-content: space-between;
	padding: 0px 9px;
	width: 100%;

	span {
		text-align: center;
		width: calc(100% - 23px);
	}

	&.product-add-btn-active {
		background-color: color(primary);
		color: color(white);
	}
}

.warehouse-add-btn {
	align-items: center;
	border-color: color(primary);
	border-style: solid;
	border-width: 1px;
	border-radius: 2px;
	color: color(primary);
	cursor: pointer;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	font-family: font(open-semibold);
	font-size: size(small);
	height: 27px;
	justify-content: space-between;
	padding: 0px 9px;
	width: 100%;

	span {
		text-align: center;
		width: calc(100% - 23px);
	}

	&.warehouse-add-btn-active {
		background-color: color(primary);
		color: color(white);
	}
}

.content-for {
	border-radius: 2px;
	background-color: rgba(195, 231, 232, 0.29);
	color: #4a4a4a;
	font-size: 12px;
	margin: 0;
	padding: 4px 14px;
}

.section-products {
	overflow: scroll;
	min-height: 650px;
}
</style>
