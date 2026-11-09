<template>
	<div>
		<header-page :title="$route.meta.title"></header-page>
		<v-layout row align-start justify-space-between pt-4 px-5>
			<v-flex xs5>
				<v-flex class="title-header">DATOS GENERALES</v-flex>
				<v-layout column>
					<v-flex xs5 mt-2>
						<v-layout row>
							<v-flex xs6>
								<app-input-text
									label="Código"
									:text="actionModel.code"
									:disabled="idAction ? true : false"
									model="code"
									@input="setData"
								/>
								<span class="form-group__message" v-if="checkBlankCode(actionModel.code)">
									No se permite espacios en blanco
								</span>
							</v-flex>
							<v-flex xs12 mt-2> </v-flex>
						</v-layout>
					</v-flex>
					<app-input-text
						label="Descripción"
						:text="actionModel.description"
						model="description"
						@input="setData"
					/>
					<!-- <v-flex xs6>
								<app-select
									item-text="name"
									item-value="id"
									label="Tipo de Entidad"
									model="typeEntity"
									:items="typeEntity"
									:item="actionModel.typeEntity"
									@input="setDataTypeEntity"
								/>
					</v-flex>	 -->
					<v-flex xs6>
						<app-select
							item-text="name"
							item-value="id"
							label="Tipo de Acción"
							model="typeAction"
							:items="typeAction"
							:item="actionModel.typeAction"
							@input="setDataTypeAction"
						/>
					</v-flex>
					<v-flex mt-2 v-if="!isGift">
						<v-layout row align-center>
							<v-flex xs4>
								<app-input-text
									label="Cantidad"
									model="quantity"
									type="number"
									:text="actionModel.quantity"
									@input="setData"
								/>
								<span v-if="decimalError" style="color: red; font-size: 12px">
									Solo se permiten hasta dos decimales.
								</span>
							</v-flex>
							<!-- <v-flex xs4 ml-2>
								<app-input-text
									label="Cant . Base"
									model="quantityBase"
									type="number"
									:text="actionModel.quantityBase"
									@input="setData"
								/>
							</v-flex> -->
							<v-flex xs3 ml-2>
								<app-select
									item-text="name"
									item-value="id"
									label="Unidad"
									model="unitId"
									:items="units"
									:item="actionModel.unitId"
									:return-object="false"
									@input="setData"
								/>
							</v-flex>
							<v-flex xs1 ml-2 pt-2>
								<app-tooltip-button
									:disabled="!actionModel.unitId"
									@click-icon="actionModel.unitId = null"
									text="Deseleccionar unidad"
									icon="close"
									height="18"
									color="error"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mt-2 v-if="isGift">
						<v-layout row>
							<v-flex xs6>
								<app-input-text
									:label="getAmountText"
									model="amount"
									type="number"
									:text="actionModel.amount"
									@input="setData"
								/>
								<span class="form-group__message" v-if="!$v.actionModel.amount.maxValue">
									Monto maximo es {{ maxValueAmount }}
								</span>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex mt-2 v-if="!idAction">
						<v-switch
							hide-details
							color="success"
							v-model="actionModel.flagActive"
							:false-value="1"
							:true-value="2"
							label="Activa"
						></v-switch>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs5>
				<v-flex class="title-header">{{ 'PRODUCTOS' }}</v-flex>
				<v-flex xs10 md7 mt-2>
					<button class="product-add-btn mt-1" type="button" @click="addProductForm">
						<span>AGREGAR PRODUCTOS</span>
						<v-icon class="product-add-btn-icon" color="primary" size="17">
							add_circle
						</v-icon>
					</button>
				</v-flex>
				<v-flex xs12 mt-2 v-if="selectedProducts.length">
					<v-layout align-center row justify-space-between>
						<v-flex xs3>
							<span class="title-for">Cod</span>
						</v-flex>
						<v-flex xs8 ml-1>
							<span class="title-for">Nombre</span>
						</v-flex>
						<v-flex xs1 ml-1>
							<span class="title-for">Remover</span>
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
						<v-flex xs8 pl-1>
							<p class="content-for">
								<app-tooltip-button
									v-if="!haveUnitSelected(product)"
									text="Este producto no tiene esta unidad asociada."
									icon="error_outline"
									height="18"
									color="error"
								/>
								{{ product.name }}
							</p>
						</v-flex>

						<v-flex xs1 pl-1>
							<app-tooltip-button
								text="Eliminar Producto"
								icon="delete_forever"
								color="error"
								@click-icon="deleteProduct(index)"
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
				:code-taxes="actionModel.typeAction === 1 ? '05' : null"
				:show-filter="false"
				:selectable="false"
				@add-product="setProduct"
				@no-results="handleNoResults"
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
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid || checkBlankCode(actionModel.code) || decimalError"
				cancel-text="Atras"
				success-color="primary"
				@cancel-button-clicked="goBack"
				@accept-button-clicked="saveAction"
			/>
		</section>
	</div>
</template>

<script>
import { required, maxValue } from 'vuelidate/lib/validators';
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
		width: 900,
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
		title: 'Seleccionar Warehouse',
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
	this.loadUnits();

	this.idAction = this.$route.params.id;
	if (this.idAction) {
		this.loadAction();
	}
}

function setProduct(productList) {
	const newProduct = {
		id: productList.id,
		code: productList.code,
		name: productList.name,
		unitId: productList.unitId,
		conversions: productList.conversions,
	};
	const existProduct = this.actionModel.productIds.filter(
		(item) => item === newProduct.id
	);
	if (!existProduct.length) {
		this.actionModel.productIds.push(newProduct.id);
		this.selectedProducts.push(newProduct);
	}
}

function setWarehouse(warehouseList) {
	const newWarehouse = {
		id: warehouseList.id,
		code: warehouseList.code,
		name: warehouseList.name,
	};

	const existProduct = this.actionModel.warehouseIds.filter(
		(item) => item === newWarehouse.id
	);
	if (!existProduct.length) {
		this.actionModel.warehouseIds.push(newWarehouse.id);
		this.selectedWarehouses.push(newWarehouse);
	}
}

function deleteProduct(index) {
	this.selectedProducts.splice(index, 1);
	this.actionModel.productIds.splice(index, 1);
}

function setData({ model, value }) {
	this.actionModel[model] = value;
	if (model === 'quantity') {
		const regex = /^\d+(\.\d{1,2})?$/;
		this.decimalError = this.actionModel.quantity && !regex.test(value);
	}
}

function setDataTypeAction({ model, value }) {
	if (value.id === 1) {
		this.selectedProducts = [];
		this.actionModel.productIds = [];
	}
	this.actionModel[model] = value.id;
	this.validTypeAction();
}

async function loadAction() {
	try {
		const response = await this.$httpProducts.get(`actions/${this.idAction}`);
		this.actionModel.code = response.data.code;
		this.actionModel.description = response.data.description;
		this.actionModel.typeAction = response.data.typeAction;
		this.actionModel.quantity = response.data.quantity;
		this.actionModel.quantityBase = response.data.quantityBase;
		this.actionModel.amount = response.data.amount;
		this.actionModel.unitId = response.data.unitId;
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
		this.validTypeAction();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'ACTION_DUPLICATE_CODE') {
				this.showGenericError('El código ya está asignado a otra Acción.');
			}
		} else {
			this.showGenericError();
		}
	}
}

async function saveAction() {
	this.isLoading = true;
	const method = this.idAction ? 'patch' : 'post';
	const url = this.idAction ? `actions/${this.idAction}` : 'actions';
	const update = 'se actualizó';
	const create = 'ha sido creado';
	const message = this.idAction ? update : create;
	const body = this.getData();
	try {
		await this.$httpProducts[method](url, body);
		this.showNotification(`La Condición ${message} de manera exitosa`);
		this.goTo('actions-list');
	} catch (error) {
		this.showGenericError();
	}
}

function getData() {
	const actionData = {
		description: this.actionModel.description,
		quantity: Number(this.actionModel.quantity),
		quantityBase: Number(this.actionModel.quantityBase),
		typeAction: this.actionModel.typeAction,
		terms: this.actionModel.terms,
		amount: Number(this.actionModel.amount),
		productIds: this.actionModel.productIds,
		unitId: this.actionModel.unitId,
	};

	if (!this.idAction) {
		actionData.code = this.actionModel.code;
	}
	return actionData;
}

function validTypeAction() {
	if (this.actionModel.typeAction === 3 || this.actionModel.typeAction === 2) {
		this.isGift = true;
		this.actionModel.quantity = 0;
		this.actionModel.quantityBase = 0;
		this.labelAmount = 'Monto';
		this.maxValueAmount = 1000000000;
		if (this.actionModel.typeAction === 2) {
			this.labelAmount = 'Porcentaje';
			this.maxValueAmount = 100;
		}
	} else {
		this.isGift = false;
		this.actionModel.amount = 0;
	}
}

function validations() {
	return {
		actionModel: {
			code: { required },
			description: { required },
			amount: {
				maxValue: maxValue(this.maxValueAmount),
			},
		},
	};
}

function getAmountText() {
	if (this.actionModel.typeAction === 2) {
		return 'Porcentaje';
	}
	return 'Monto';
}

function data() {
	return {
		model: {},
		action: {
			code: null,
			title: '',
			open: false,
			width: 0,
		},
		actionModel: {
			code: '',
			typeAction: '',
			description: '',
			quantity: 0,
			quantityBase: 0,
			amount: 0,
			productIds: [],
			unitId: undefined,
		},
		btnTextModal: 'Seleccionado',
		colorForm: 'success',
		isGift: false,
		labelAmount: 'Monto',
		maxValueAmount: 1000000000,
		selectedProducts: [],
		selectedWarehouses: [],
		units: [],
		typeAction: [
			{
				id: 3,
				name: 'Reemplazo de precio',
			},
			{
				id: 2,
				name: 'Porcentaje de descuento',
			},
			{
				id: 1,
				name: 'Regalar',
			},
		],
		decimalError: false,
	};
}

export default {
	name: 'page-new-action',
	data,
	created,
	components: {
		actionSidebar,
		headerPage,
		modalSidebarButton,
		productsSearchForm,
		warehousesSearchForm,
	},
	computed: {
		getAmountText,
	},
	methods: {
		addProductForm,
		addWarehouseForm,
		getData,
		goBack,
		closeModal,
		deleteProduct,
		loadAction,
		saveAction,
		setData,
		setDataTypeAction,
		setProduct,
		setWarehouse,
		validTypeAction,
		haveUnitSelected(prod) {
			const idUnit = this.actionModel.unitId;
			const isUnitBase = prod.unitId === idUnit;
			const hasUnitInConversion =
				prod.conversions && Object.keys(prod.conversions).includes(String(idUnit));
			return isUnitBase || hasUnitInConversion;
		},
		async loadUnits() {
			try {
				const { data: response } = await this.$httpProducts.get('units');
				this.units = response.map((unit) => {
					const newUnit = { ...unit };
					return newUnit;
				});
				if (this.units.length === 0) {
					this.showNotification('No se han encontrado coincidencias.', 'info');
				}
			} catch (err) {
				if (err.status === 500) {
					this.showGenericError();
				}
			}
		},
		async handleNoResults() {
			if (this.actionModel.typeAction === 1) {
				await this.$delay(10);
				this.showNotification(
					'No tiene productos con opción a vender en modo gratuito',
					'warning'
				);
				this.closeModal();
			}
		},
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

	&.product-add-btn-active {
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
</style>
