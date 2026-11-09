<template>
	<v-container>
		<app-actions
			:resource-uri="$route.name"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<v-layout row wrap mb-5>
			<v-flex xs12 mb-4 class="title-section">
				<span>DATOS GENERALES</span>
			</v-flex>
			<v-flex xs12>
				<v-form ref="combo-product">
					<v-flex xs12 d-flex>
						<v-flex xs6 mr-5>
							<v-layout xs12 mb-3 d-flex>
								<v-flex xs6 mr-4>
									<v-text-field
										class="filter-select shadow-inset"
										name="new-product-model"
										label="Tipo de producto"
									></v-text-field>
								</v-flex>
								<v-flex xs6>
									<v-select
										class="filter-select shadow-inset"
										label="Compuesto"
										item-text="name"
										item-value="id"
										:items="typeComposition"
										v-model="compositionProduct.product.type"
									></v-select>
								</v-flex>
							</v-layout>
							<v-layout mb-3 d-flex>
								<v-flex xs6 mr-4>
									<v-text-field
										class="filter-select shadow-inset"
										name="new-product-model"
										label="Código"
										v-model="compositionProduct.product.code"
									></v-text-field>
									<span class="form-group__message" v-if="!$v.compositionProduct.product.code.required">
										El Código del producto es requerido
									</span>
									<span
										class="text-not-code-blank"
										v-if="checkBlankCode(compositionProduct.product.code)">
										No se permite espacios en blanco
									</span>
								</v-flex>
								<v-flex xs6>
									<v-text-field
										class="filter-select shadow-inset"
										name="new-product-model"
										label="Nombre"
										v-model="compositionProduct.product.name"
									></v-text-field>
									<span class="form-group__message" v-if="!$v.compositionProduct.product.name.required">
										El Nombre del producto es requerido
									</span>
								</v-flex>
							</v-layout>
							<v-layout mb-3 d-flex>
								<v-flex xs12>
									<v-text-field
										no-resize
										multi-line
										class="textarea-content filter-select shadow-inset"
										label="Descripción"
										v-model="compositionProduct.product.description"
									></v-text-field>
									<span class="form-group__message" v-if="!$v.compositionProduct.product.description.required">
										La Descripción del producto es requerido
									</span>
								</v-flex>
							</v-layout>
							<v-layout mb-3 d-flex>
								<v-flex xs6 mr-4>
									<v-text-field
										class="filter-select shadow-inset"
										name="new-product-model"
										label="Modelo"
										v-model="compositionProduct.product.model"
									></v-text-field>
									<span class="form-group__message" v-if="!$v.compositionProduct.product.model.required">
										El Modelo del producto es requerido
									</span>
								</v-flex>
								<v-flex xs6>
									<v-flex xs12 d-flex>
										<v-select
											clearable
											class="filter-select shadow-inset"
											item-text="name"
											:disabled="compositionProduct.product.categories.length > 0"
											item-value="id"
											label="Categoría"
											:items="categories"
											v-model="compositionProduct.product.categoryId"
										></v-select>
										<button
											type="button"
											@click.stop="openSlideModal('NC', 'Nueva Categoría', 500)"
											class="pl-add-container size mr-adjust">
												<v-icon id="add-icon" color="white">add</v-icon>
										</button>
									</v-flex>
									<span class="fe"
										v-if="!$v.compositionProduct.product.categoryId.minValue
											|| !$v.compositionProduct.product.categoryId.required">
										La categoría del producto es requerida.
									</span>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs6>
							<v-layout row mb-3>
								<v-flex xs6 mr-3>
									<v-flex xs12 d-flex align-center>
										<v-select
											clearable
											class="filter-select shadow-inset"
											item-text="name"
											item-value="id"
											label="Unidad"
											:items="units"
											v-model="compositionProduct.product.unitId"
										></v-select>
										<button
											type="button"
											@click.stop="openSlideModal('UND', 'Nueva Unidad')"
											class="pl-add-container size mr-adjust">
											<v-icon id="add-icon" color="white">add</v-icon>
										</button>
									</v-flex>
									<span class="form-group__message"
										v-if="!$v.compositionProduct.product.unitId.minValue
											|| !$v.compositionProduct.product.unitId.required">
										La Unidad del producto es requerida.
									</span>
								</v-flex>
								<v-flex xs6
								:class="[compositionProduct.product.groups.length > 0 ? 'opacyble' : null]">
									<v-flex xs12 d-flex align-center>
										<v-select
											clearable
											:disabled="compositionProduct.product.groups.length > 0"
											class="filter-select shadow-inset"
											item-text="name"
											item-value="id"
											label="Marca"
											:items="brands"
											v-model="compositionProduct.brandId"
										></v-select>
										<button
											type="button"
											@click.stop="openSlideModal('NB', 'Nueva Marca')"
											class="pl-add-container size mr-adjust">
											<v-icon id="add-icon" color="white">add</v-icon>
										</button>
									</v-flex>
									<span class="form-group__message"
										v-if="!$v.compositionProduct.brandId.minValue
											|| !$v.compositionProduct.brandId.required">
										La Marca del producto es requerida.
									</span>
								</v-flex>
							</v-layout>
							<v-layout row mb-3>
								<v-flex xs12
								:class="[compositionProduct.product.groups.length > 0 ? 'opacyble' : null]">
									<v-flex xs12 d-flex align-center>
										<v-select
											clearable
											:disabled="compositionProduct.product.groups.length > 0"
											class="filter-select shadow-inset"
											item-text="name"
											item-value="id"
											:label="labelWarehouse()"
											:items="warehouses"
											v-model="compositionProduct.warehouseId"
										></v-select>
										<button
											type="button"
											@click="openSlideModal('WS', `Selecciona ${labelWarehouse()}`)"
											class="pl-add-container size mr-adjust">
											<v-icon id="add-icon" color="white">search</v-icon>
										</button>
									</v-flex>
									<span class="form-group__message"
										v-if="!$v.compositionProduct.warehouseId.minValue
											|| !$v.compositionProduct.warehouseId.required">
										El Almacén del producto es requerido.
									</span>
								</v-flex>
							</v-layout>
							<v-layout row>
								<v-flex xs12 d-flex justify-center>
									<v-text-field
										class="filter-select shadow-inset"
										name="new-product-model"
										label="Subir imagen"
										v-model="compositionProduct.product.image"
									></v-text-field>
									<v-layout row mr-3>
										<label ref="up" for="upload-image">
											<vue-six-four id="upload-image" hidden @vue-six-four="getFile" />
											<v-flex xs2 mx-2>
												<v-btn
													type="button"
													@click="actionUploadImage"
													:disabled="isLoadingImage"
													class="btn-action mr-3 pl-add-container">Adjuntar</v-btn>
											</v-flex>
										</label>
									</v-layout>
									<v-btn
										ref="image"
										type="button"
										class="btn-action image-button"
										@click="openSlideModal('VI', 'Imagen')">
										<img src="/static/img/view-image.svg" alt="" class="view-image">
									</v-btn>
								</v-flex>
							</v-layout>
							<v-layout row>
								<v-select
									chips
									tags
									clearable
									solo
									class="select-chips_code mt-3"
									label="Otros códigos"
									v-model="compositionProduct.product.alternateCode"
								>
									<template slot="selection" slot-scope="data">
									<v-chip
										close
										@input="removeAlternateCode(data.item)"
									>
										<strong>{{ data.item }}</strong>&nbsp;
									</v-chip>
									</template>
								</v-select>
							</v-layout>
						</v-flex>
					</v-flex>
				</v-form>
			</v-flex>
		</v-layout>
		<v-layout row wrap justify-center align-center mb-5>
			<v-flex xs12>
				<v-layout row mb-5>
					<v-flex xs12 class="title-section">
						<span>{{currentTitle}}</span>
					</v-flex>
				</v-layout>
				<transition name="fade" mode="out-in">
					<v-layout row mb-5 d-flex justify-start
					v-if="compositionProduct.type === 'Compuesto'">
						<v-flex xs3 mr-3>
							<v-text-field
								class="filter-select shadow-inset"
								name="new-product-model"
								label="Nombre"
								v-model="compositionProduct.otherName"
							></v-text-field>
						</v-flex>
						<v-flex xs3 mr-3>
							<v-select
								class="filter-select shadow-inset"
								label="Solo uno"
								:items="['Solo uno', 'Múltiples']"
								v-model="compositionProduct.howMany"
							></v-select>
						</v-flex>
						<v-flex xs1>
							<button
							class="pl-add-container size">
								<v-icon id="add-icon" color="white">add</v-icon>
							</button>
						</v-flex>
					</v-layout>
				</transition>
				<v-layout row d-flex justify-center mb-4>
					<transition name="fade" mode="out-in">
						<v-flex d-flex mr-3
							v-if="compositionProduct.product.type === 1">
							<v-select
								:disabled="typeof id !== 'number'"
								:class="['filter-select', 'shadow-inset', id ? 'opacyble' : null]"
								label="Lista de Precios"
								item-text="name"
								item-value="id"
								:items="priceList"
								v-model="selectedPriceListId"
								@input="updatePriceOrQuantity"
							></v-select>
						</v-flex>
					</transition>
					<v-flex d-flex mr-3>
						<v-text-field
							class="filter-select shadow-inset"
							name="new-product-model"
							label="Cuenta de Venta"
							v-model="saleAccount"
						></v-text-field>
						<button
							@click="openSlideModal('SA', 'Selecciona cuenta de venta', 450)"
							class="pl-add-container size mr-adjust">
							<v-icon id="add-icon" color="white">search</v-icon>
						</button>
					</v-flex>
					<v-flex d-flex mr-3>
						<v-text-field
							class="filter-select shadow-inset"
							name="new-product-model"
							label="Producto"
							v-model="addProduct"
						></v-text-field>
						<button
							type="button"
							:class="[disable ? 'disable-button' : '']"
							:disabled="disable"
							@click="openSlideModal('SP', 'Selecciona productos', 500)"
							class="pl-add-container size mr-adjust">
							<v-icon id="add-icon" color="white">search</v-icon>
						</button>
					</v-flex>
					<transition name="fade" mode="out-in">
						<v-flex xs3 d-flex v-if="compositionProduct.product.type === 2">
							<v-flex mr-3>
								<v-select
									class="filter-select shadow-inset"
									label="Unidad"
								></v-select>
							</v-flex>
							<v-flex xs1>
								<button
								type="button"
								class="pl-add-container size">
									<v-icon id="add-icon" color="white">add</v-icon>
								</button>
							</v-flex>
						</v-flex>
					</transition>
				</v-layout>
			</v-flex>
			<v-flex xs12>
				<app-table
				name="accounting-products"
				:inputSearch="false"
				:filterColumns="false"
				:selectable="false"
				:columns="columns"
				:rows="compositionProduct.product.groups">
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.product.code }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.product.name }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.sale }}</td>
						<td v-show="showRow(columns, 4)">
							<v-text-field
								class="filter-select shadow-inset show-error"
								name="accounting-new-product-price"
								single-line
								type="number"
								v-model.number="props.row.quantity"
								@input="updatePriceOrQuantity(selectedPriceListId)"
							></v-text-field>
						</td>
						<td v-show="showRow(columns, 5)">
							<v-text-field
								class="filter-select shadow-inset show-error"
								name="accounting-new-product-price"
								single-line
								type="number"
								v-model.number="props.row.price"
							></v-text-field>
						</td>
						<td v-show="showRow(columns, 6)">
							<app-tooltip-button
								text="Eliminar"
								color="pink"
								icon="delete"
								@click-icon="removeProduct(props.index)"
							></app-tooltip-button>
						</td>
					</template>
				</app-table>
			</v-flex>
			<v-flex xs12 class="price-resume">
				<v-layout row>
					<v-flex class="price-resume-border" py-1 px-3 xs7 text-xs-right>Base 0% IVA:</v-flex>
					<v-flex class="price-resume-border" py-1 px-3 xs5>{{comboSubTotal}}</v-flex>
				</v-layout>
				<v-layout row>
					<v-flex class="price-resume-border" py-1 px-3 xs7 text-xs-right>Base 12% IVA:</v-flex>
					<v-flex class="price-resume-border" py-1 px-3 xs5>3321123</v-flex>
				</v-layout>
				<v-layout row>
					<v-flex class="price-resume-border" py-1 px-3 xs7 text-xs-right>Base No Objecto IVA:</v-flex>
					<v-flex class="price-resume-border" py-1 px-3 xs5>1232123</v-flex>
				</v-layout>
				<v-layout row>
					<v-flex class="price-resume-border" py-1 px-3 xs7 text-xs-right>ICE:</v-flex>
					<v-flex class="price-resume-border" py-1 px-3 xs5>12321</v-flex>
				</v-layout>
				<v-layout row>
					<v-flex class="price-resume-border" py-1 px-3 xs7 text-xs-right>PVP del producto compuesto:</v-flex>
					<v-flex class="price-resume-border" py-1 px-3 xs5>S/. 123</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout row wrap justify-center align-center>
			<v-flex xs12 text-xs-center>
				<v-btn
					type="button"
					color="pink"
					class="btn-action"
					@click="cancel">
					Cancelar
					<v-icon
						color="white"
						size="16">
						highlight_off
					</v-icon>
				</v-btn>
				<v-btn
					:disabled="$v.$invalid || isLoadingImage || checkBlankCode(compositionProduct.product.code)"
					type="button"
					color="success"
					class="btn-action"
					@click="createComboProduct">
					Aceptar
					<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
		>
			<new-category
				v-if="action.code === 'NC'"
				@update-category="updateOneService('categories')"
				@cancel-modal="cancelModal"/>
			<new-brand
				v-if="action.code === 'NB'"
				@update-brand="updateOneService('brands')"
				@cancel-modal="cancelModal" />
			<new-unit
				v-if="action.code === 'UND'"
				@update-units="updateOneService('units')"
				@cancel-modal="cancelModal" />
			<select-warehouse
				v-if="action.code === 'WS'"
				@warehouse-selected="warehouseSelected($event, key)"
				@cancel-modal="cancelModal" />
			<help-component
				v-if="action.code === 'H'"
				:helps="helps"
				@cancel-modal="cancelModal" />
			<image-component
				v-if="action.code === 'VI'"
				:url="imageUpdated" />
			<selecting-products
				v-if="action.code === 'SP'"
				:brand-id="compositionProduct.brandId"
				:warehouse-id="compositionProduct.warehouseId"
				:columnsIn="productsColumns"
				:products-already-selected="compositionProduct.product.groups"
				@close-modal="cancelModal"
				@send-selected-products="addingProducts" />
			<selecting-sale-account
				v-if="action.code === 'SA'" />
			<help-action
				v-if="action.code === 'HELP'"
				:items="helpItems"
			/>
		</action-sidebar>
	</v-container>
</template>

<script>

import VueSixFour from 'vue-six-four';
import { required, minValue, minLength } from 'vuelidate/lib/validators';
import appActions from '@/components/shared/app-actions';
import actionSidebar from './../shared/action-sidebar';
import appTable from './../shared/table/app-table';
import helpAction from './../shared/help-action';
import imageComponent from './utils/image-component';
import newBrand from './../products/utils/new-brand';
import newCategory from './../products/utils/new-category';
import newUnit from './../products/utils/new-units';
import upLoadImageMixin from './../../mixins/upLoadImage';
import selectWarehouse from './utils/selecting-warehouse';
import selectingProducts from './utils/selecting-products';
import selectingSaleAccount from './utils/selecting-sale-account';
import lib from './../../shared/lib';

const { compose, setNewProperty, updatePrice } = lib;

function created() {
	this.id = Number(this.$route.params.id);
	this.productsColumns[0].name = this.labelWarehouse();
	this.loadData();
}
async function loadData() {
	this.isLoading = true;
	let requests = [
		this.categoriesList(),
		this.brandsList(),
		this.listOfUnits(),
		this.warehousesList(),
		this.listPricingPromise(),
	];
	if (this.id) {
		requests = requests.concat(this.$httpProducts.get(`products/${this.id}`));
	}
	try {
		const responses = await Promise.all(requests);
		[
			{ data: this.categories },
			{ data: this.brands },
			{ data: this.units },
			{ data: this.warehouses },
			{ data: this.priceList },
		] = responses;
		if (this.id) [, , , , , { data: this.compositionProduct }] = responses;
		this.selectedPriceListId = this.priceList.find(p => p.flagDefault === 1).id;
	} catch (error) {
		this.showGenericError();
	}
	this.isLoading = false;
}

function cancel() {
	this.goTo('accounting');
}

function imageUpdated() {
	this.compositionProduct.product.image = this.captureLocation;
	return this.compositionProduct.product.image || `${this.$imageUrl}/place-holder.svg`;
}

async function updateOneService(key) {
	try {
		({ data: this[key] } = await this.$httpProducts.get(key));
	} catch (error) {
		this.showGenericError();
	}
}
function runAction(item) {
	this.goTo(item.codeWeb);
}

function currentTitle() {
	return this.compositionProduct.type === 1 ? 'Combo' : 'Compuesto';
}

function disable() {
	return !(this.compositionProduct.brandId && this.compositionProduct.warehouseId);
}

function updatePriceOrQuantity(id) {
	this.compositionProduct.product.groups
		= this.compositionProduct.product.groups.map(
			updatePrice(id),
		);
}

function addingProducts(products) {
	const newPro = [...products];
	this.compositionProduct.product.groups
		= newPro.map(
			compose(
				updatePrice(this.selectedPriceListId),
				setNewProperty('quantity', 1),
			),
		);
	this.cancelModal();
}

function removeProduct(index) {
	this.compositionProduct.product.groups.splice(index, 1);
}

async function createComboProduct() {
	const urlPost = `products/groups/${this.compositionProduct.product.type}`;
	const urlPatch = `products/${this.id}/groups`;
	const url = this.id ? urlPatch : urlPost;
	const message = this.id ? 'actualizado' : 'creado';
	const method = this.id ? 'patch' : 'post';
	const body = this.buildBody(this.id, this.compositionProduct);
	try {
		await this.$httpProducts[method](url, body);
		this.showNotification(`El producto fue ${message} con éxito`);
		this.clearForm();
		this.goTo('accounting');
	} catch (error) {
		this.showGenericError();
	}
}

function clearForm() {
	this.compositionProduct = {
		brandId: 0,
		product: {
			alternateCode: '',
			categoryId: 0,
			code: '',
			description: '',
			model: '',
			name: '',
			type: 1,
			unitId: 0,
			groups: [],
		},
		howMany: '',
		image: '',
		otherName: '',
		warehouseId: 0,
	};
}

function comboSubTotal() {
	const amount = this.compositionProduct.product.groups.reduce((acc, amounts) => {
		const { quantity, price } = amounts;
		const total = price * quantity;
		return acc + total;
	}, 0);
	return amount || 0;
}

function getComboPriceList(priceId, subTotal) {
	const newPriceList = {};
	newPriceList[priceId] = {
		ranges: [],
		price: subTotal,
	};
	return newPriceList;
}

function getProductsGroups(id, product) {
	const { groups } = product;
	return groups.map((d) => {
		let newD = {};
		newD = id
			? setNewProperty('id', d.id)(newD)
			: setNewProperty('productId', d.product.id)(newD);
		newD = setNewProperty('price', d.price)(newD);
		newD = setNewProperty('quantity', d.quantity)(newD);
		newD = setNewProperty('type', product.type)(newD);
		return newD;
	});
}

function buildBody(id, product) {
	const newObject = {
		priceList: id
			? product.priceList
			: this.getComboPriceList(this.selectedPriceListId, this.comboSubTotal),
		product: {
			code: product.product.code,
			description: product.product.description,
			name: product.product.name,
			model: product.product.model,
			unitId: product.product.unitId,
			groups: this.getProductsGroups(id, product.product),
		},
	};
	if (id) {
		newObject.product.id = product.productId;
		newObject.product.conversions = product.product.conversions || {};
	} else {
		newObject.brandId = product.brandId;
		newObject.warehouseId = product.warehouseId;
		newObject.product.categoryId = product.product.categoryId;
		newObject.product.type = product.product.type;
	}
	return newObject;
}

function cancelModal() {
	this.action = { ...this.actionDefault };
}

function openSlideModal(code, title, width = 400) {
	this.action = {
		active: true,
		open: true,
		code,
		title,
		width,
	};
}

function showImageUploaded() {
	this.openSlideModal('VI', 'Imagen');
}

function openHelp({ code, actions }) {
	this.helpItems = Object.assign([], actions);
	this.action.code = code;
	this.action.open = true;
	this.action.title = '¿Necesitas Ayuda?';
	this.action.width = 553;
}

function validations() {
	return {
		compositionProduct: {
			brandId: {
				required,
				minValue: minValue(1),
			},
			product: {
				categoryId: {
					required,
					minValue: minValue(1),
				},
				code: { required },
				description: { required },
				model: { required },
				name: { required },
				unitId: {
					required,
					minValue: minValue(1),
				},
				groups: {
					required,
					minLength: minLength(1),
					$each: {
						price: { required },
						quantity: { required },
					},
				},
			},
			warehouseId: {
				required,
				minValue: minValue(1),
			},
		},
	};
}

function data() {
	return {
		action: {
			active: false,
			open: false,
			code: '',
			title: '',
			width: 0,
		},
		actionDefault: {
			active: false,
			open: false,
			code: '',
			title: '',
			width: 0,
		},
		actions: [
			{
				title: '¿NECESITAS AYUDA?',
				img: '/static/img/help.svg',
				width: 500,
				href: 'help',
			},
		],
		addProduct: '',
		brands: [],
		categories: [],
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Cuenta de Venta', value: 'saleAccount', visible: true, checked: true },
			{ id: 4, name: 'Cantidad', value: 'quantity', visible: true, checked: true },
			{ id: 5, name: 'P. venta', value: 'price', visible: true, checked: true },
			{ id: 6, name: 'Acciones', visible: true, checked: true, flagVisible: true },
		],
		compositionProduct: {
			brandId: 0,
			product: {
				alternateCode: '',
				categories: [],
				categoryId: 0,
				code: '',
				description: '',
				model: '',
				name: '',
				type: 1,
				unitId: 0,
				groups: [],
			},
			howMany: '',
			image: '',
			otherName: '',
			warehouseId: 0,
		},
		helpItems: [],
		id: null,
		isLoading: false,
		key: 'compositionProduct',
		priceList: [],
		productsColumns: [
			{ id: 1, name: 'Tienda', value: 'warehouseName', visible: false, checked: false },
			{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 3, name: 'Cod. interno', value: 'autoBarcode', visible: false, checked: false },
			{ id: 4, name: 'Otros códigos', value: 'alternateCode', visible: false, checked: false },
			{ id: 5, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 6, name: 'Categorias', value: 'categories', visible: false, checked: false },
			{ id: 7, name: 'Características', value: 'inlineFeatures', visible: false, checked: false },
			{ id: 8, name: 'Descripción', value: 'description', visible: false, checked: false },
			{ id: 9, name: 'Ubicación', value: 'location', visible: false, checked: false },
			{ id: 10, name: 'Marca', value: 'brandName', visible: false, checked: false },
			{ id: 11, name: 'P. costo', value: 'priceCost', visible: false, checked: false },
			{ id: 12, name: 'P. venta', value: 'price', visible: false, checked: false },
			{ id: 13, name: 'Conteo', value: 'quantity', visible: false, checked: false },
			{ id: 14, name: 'Stock', value: 'stock', visible: false, checked: false },
			{ id: 15, name: 'Stock min', value: 'minStock', visible: false, checked: false },
			{ id: 16, name: 'Kg', value: 'weigth', visible: false, checked: false },
			{ id: 17, name: 'Estado', value: 'status', visible: false, checked: false },
			{ id: 18, name: 'Acciones', visible: false, checked: false, flagVisible: false },
		],
		rows: [
			{
				code: 'xxx',
				name: 'Producto seleccionado',
				sale: '191 387648 1234',
				quantity: 5,
				pricePerSale: 80,
			},
		],
		saleAccount: '',
		selectedPriceListId: 0,
		selectedProducts: [],
		typeComposition: [
			{ id: 1, name: 'Combo' },
			{ id: 2, name: 'Compuesto' },
		],
		units: [],
		warehouses: [],
	};
}

export default {
	name: 'composition-products',
	components: {
		actionSidebar,
		appActions,
		appTable,
		helpAction,
		imageComponent,
		newBrand,
		newCategory,
		newUnit,
		selectingProducts,
		selectingSaleAccount,
		selectWarehouse,
		VueSixFour,
	},
	computed: {
		comboSubTotal,
		currentTitle,
		disable,
		imageUpdated,
	},
	created,
	data,
	methods: {
		addingProducts,
		buildBody,
		cancel,
		cancelModal,
		clearForm,
		createComboProduct,
		getComboPriceList,
		getProductsGroups,
		loadData,
		openHelp,
		openSlideModal,
		runAction,
		removeProduct,
		showImageUploaded,
		updateOneService,
		updatePrice,
		updatePriceOrQuantity,
	},
	mixins: [upLoadImageMixin],
	validations,
	watch: {
		captureLocation: showImageUploaded,
	},
};
</script>

<style lang="scss" scoped>
.price-resume {
	background-color: white;
}
	
.price-resume-border {
	border: 1px solid color(blue-grey);
}
.disable-button {
	opacity: 0.4;
}
.disable-button:hover {
	cursor: not-allowed;
}
</style>
