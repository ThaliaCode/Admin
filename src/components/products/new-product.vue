<template>
	<div>
		<header-page :title="$route.meta.title"/>
		<div class="new-product">
			<v-layout wrap px-5>
				<v-flex xs6 px-2 my-4 pt-2
					class="new-product-form"
					v-if="!isLoading">
					<v-layout wrap>
						<v-flex xs12>
							<label class="caption mt-3">Nombre</label>
							<v-text-field
								required
								class="filter-select shadow-inset"
								name="new-product-name"
								label="Nombre"
								single-line
								v-model="newProduct.name"
								@input="$v.newProduct.name.$touch()"
							></v-text-field>
							<span class="form-group__message" v-if="!$v.newProduct.name.required">
								El nombre del producto es requerido
							</span>
						</v-flex>
						<v-flex xs12>
							<label class="caption mt-3">Modelo</label>
							<v-text-field
								required
								class="filter-select shadow-inset"
								name="new-product-model"
								label="Modelo"
								single-line
								v-model="newProduct.model"
							></v-text-field>
							<span class="form-group__message" v-if="!$v.newProduct.model.required">
								El modelo del producto es requerido
							</span>
						</v-flex>
						<v-flex xs12>
							<label class="caption mt-3">Descripción</label>
							<v-text-field
								no-resize
								multi-line
								class="textarea-content filter-select shadow-inset"
								name="new-product-description"
								label="Descripción"
								single-line
								v-model="newProduct.description"
							></v-text-field>
						</v-flex>
						<v-flex xs12>
							<label class="caption mt-3">Categoría</label>
							<v-select
								required
								class="filter-select shadow-inset"
								item-text="name"
								item-value="id"
								label="Categoría"
								single-line
								v-jailai="jailai.category"
								v-model="newProduct.categoryId"
								:items="categories"
							></v-select>
							<span class="form-group__message" v-if="!$v.newProduct.categoryId.required">
								La categoría del producto es requerida
							</span>
						</v-flex>
						<v-flex xs6 pr-1>
							<label class="caption mt-3">Unidad</label>
							<v-select
								v-jailai="jailai.unit"
								required
								class="filter-select shadow-inset"
								item-text="name"
								item-value="id"
								label="Unidad"
								single-line
								v-model="newProduct.unitId"
								:items="units"
							></v-select>
							<span class="form-group__message" v-if="!$v.newProduct.unitId.required">
								La unidad del producto es requerida
							</span>
						</v-flex>
						<v-flex xs6 pl-1>
							<label class="caption mt-3">Tipo</label>
							<v-select
								class="filter-select shadow-inset"
								item-text="name"
								item-value="id"
								label="Tipo"
								single-line
								required
								:disabled="selectDisabled"
								v-model="newProduct.type"
								:items="types"
							></v-select>
							<span class="form-group__message" v-if="!$v.newProduct.type.required">
								El tipo del producto es requerido
							</span>
						</v-flex>
						<v-flex xs12 class="new-product-type"
							v-if="showWarehouse">
							<label class="caption mt-3">{{labelWarehouse()}}</label>
							<v-select
								chips
								class="filter-select shadow-inset"
								:disabled="selectDisabled"
								item-text="name"
								item-value="id"
								:label="labelWarehouse()"
								multiple
								single-line
								required
								v-model="newProduct.warehouseId"
								:items="warehouses"
							></v-select>
							<span class="form-group__message" v-if="!$v.newProduct.warehouseId.required">
								El almacén del producto es requerido
							</span>
						</v-flex>
						<v-flex xs12 v-if="!isServices">
							<label class="caption mt-3">Marca</label>
							<v-select
								required
								class="filter-select shadow-inset"
								item-text="name"
								item-value="id"
								label="Marca"
								single-line
								:disabled="selectDisabled"
								v-model="newProduct.brandId"
								v-jailai="jailai.brand"
								:items="brands"
							></v-select>
							<span class="form-group__message" v-if="!$v.newProduct.brandId.required">
								La marca del producto es requerida
							</span>
						</v-flex>
						<v-flex xs12>
							<v-layout wrap mt-2 justify-start align-center>
								<v-flex xs4>
									<span>Agregar cararcterísticas</span>
								</v-flex>
								<v-flex xs1>
									<button
										:disabled="!newProduct.categoryId"
										class="pl-add-container size"
										:class="{ 'opacyble': !newProduct.categoryId }"
										@click="openFeaturesModal">
										<v-icon id="add-icon" color="white">add</v-icon>
									</button>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs12>
							<label class="caption mt-3">Código</label>
							<v-text-field
								required
								class="filter-select shadow-inset"
								name="new-product-code"
								label="Código"
								single-line
								v-model="newProduct.code"
							></v-text-field>
							<span class="form-group__message"
								v-if="$v.newProduct.code.$invalid">
								El código del producto es requerido. Deben ser al menos 4 caracteres alfanuméricos.
							</span>
						</v-flex>
						<v-flex xs12>
							<label class="caption mt-3">Otros códigos</label>
							<v-select
								chips
								tags
								clearable
								solo
								class="select-chips_code"
								label="Otros códigos"
								v-model="alternateCode"
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
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs6 px-2 my-4 pt-2
					class="new-product-price-list"
					v-if="!isLoading">
					<div class="new-product-main-container"
						:style="biggerHeight">
						<div class="price-list-container"
							v-for="list in priceList"
							:key="list.id">
							<p class="price-list-name">{{ list.name }}</p>
							<v-layout row wrap align-center>
								<v-flex xs3>
									<v-subheader>Precio x unidad</v-subheader>
								</v-flex>
								<v-flex xs2>
									<v-text-field
										class="filter-select shadow-inset show-error"
										name="new-product-price"
										type="number"
										v-model.number="list[list.id].price"
										:rules="[list[list.id].price < maxNumber || errorMessage]"
										@update:error="captureError($event, 'price')"
									></v-text-field>
								</v-flex>
							</v-layout>
							<v-layout row wrap align-center
								v-for="(range, rangeIndex) in list[list.id].ranges"
								:key="rangeIndex">
								<v-flex xs3>
									<v-subheader>Precio x mayor</v-subheader>
								</v-flex>
								<v-flex xs2>
									<v-text-field
										class="filter-select shadow-inset show-error"
										name="new-product-ranges"
										type="number"
										v-model.number="range.price"
										:rules="[range.price < maxNumber || errorMessage]"
										@update:error="captureError($event, 'rangePrice')"
									></v-text-field>
								</v-flex>
								<v-flex xs1>
									<v-subheader>de</v-subheader>
								</v-flex>
								<v-flex xs1>
									<v-text-field
										class="filter-select shadow-inset show-error"
										name="new-product-from"
										type="number"
										v-model.number="range.from"
										:rules="[range.from < maxNumber || errorMessage]"
										@update:error="captureError($event, 'from')"
									></v-text-field>
								</v-flex>
								<v-flex xs1>
									<v-subheader>a</v-subheader>
								</v-flex>
								<v-flex xs1>
									<v-text-field
										class="filter-select shadow-inset show-error"
										name="new-product-to"
										type="number"
										v-model.number="range.to"
										:rules="[range.to < maxNumber || errorMessage]"
										@update:error="captureError($event, 'to')"
									></v-text-field>
								</v-flex>
								<v-flex xs1>
									<v-subheader>unid.</v-subheader>
								</v-flex>
								<v-flex xs1>
									<v-btn
										type="button"
										class="btn-list btn-list-remove"
										v-if="rangeIndex !== (list[list.id].ranges.length - 1)"
										@click="removePriceRange(list.id, rangeIndex)">
										<v-icon>remove</v-icon>
									</v-btn>
									<v-btn
										type="button"
										class="btn-list btn-list-add"
										v-if="rangeIndex === (list[list.id].ranges.length - 1)"
										@click="addPriceRange(list.id)">
										<v-icon>add</v-icon>
									</v-btn>
								</v-flex>
							</v-layout>
						</div>
					</div>
					<p class="price-list-see-all"
						@click="showAllPriceList"
						v-if="moorePriceList">Ver otras listas</p>
					<p class="price-list-see-all"
						@click="showAllPriceList"
						v-else>Ver menos listas</p>
				</v-flex>
			</v-layout>
			<v-layout row wrap justify-center align-center>
				<v-flex xs12 text-xs-center
					v-if="isLoading">
					<div class="new-product-log-japi">
						<img
							:src="`${$imageUrl}/place-holder.svg`"
							alt="logo-admin">
					</div>
				</v-flex>
				<v-flex xs12 text-xs-center>
					<v-btn
						type="button"
						color="pink"
						class="btn-action"
						:disabled="isLoading"
						@click.native="cancelProduct">
						Cancelar
						<v-icon
							color="white"
							size="16">
							highlight_off
						</v-icon>
					</v-btn>
					<v-btn
						type="button"
						color="success"
						class="btn-action"
						:disabled="disabledAcceptButton || isLoading || disabledByError"
						@click.native="registerProduct">
						Aceptar
						<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
					</v-btn>
				</v-flex>
			</v-layout>
			<quick-actions
				class="new-product-quick-actions"
				:actions="items"
				v-if="!isLoading"
				@open-modal="openModal"
			/>
			<action-sidebar
				:width="action.width"
				:code-action="action.code"
				:title="action.title"
				:active="action.active"
				:help-actions="actionsToHelp"
				v-model="action.open"
			>
				<new-category
					v-if="action.code === 'NC'"
					@update-category="updateCategory"
					@cancel-modal="cancelModal"
				/>
				<new-features
					v-if="action.code === 'NF'"
					@cancel-modal="cancelModal"
				/>
				<new-brand
					v-if="action.code === 'NB'"
					@update-brand="updateBrand"
					@cancel-modal="cancelModal"
				/>
				<units-form
					v-if="action.code === 'UND'"
					:code="newUnit.code"
					:color="newUnit.color"
					:name="newUnit.name"
					@close-modal="cancelModal"
					@save="updateUnity"
					@set-data="setData"
				/>
				<features-config
					v-if="action.code === 'CF'"
					:categories="categories"
					:loading="loading"
					:product="newProduct"
					@cancel-modal="cancelModal"
					@config-features="addFeatures"
				/>
			</action-sidebar>
		</div>
	</div>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import featuresConfig from '@/components/shared/product/features-config';
import headerPage from '@/components/shared/header-page';
import newBrand from '@/components/products/utils/new-brand';
import newCategory from '@/components/products/utils/new-category';
import newFeatures from '@/components/products/utils/new-features';
import newProductMixin from '@/mixins/new-product';
import quickActions from '@/components/shared/quick-actions';
import unitsForm from '@/components/units/units-form';

function biggerHeight() {
	const height = 48 * this.listRanges;
	return this.moorePriceList ? `height: ${150 + height}px` : 'height: 580px; overflow: auto';
}

function cancelModal() {
	this.action.active = false;
	this.action.code = '';
	this.action.open = false;
	this.action.title = '';
	this.action.width = 0;
	this.newUnit = {
		code: '',
		color: '#000000',
		flagActive: true,
		name: '',
	};
}

function cancelProduct() {
	const newProduct = {};
	this.newProduct = Object.assign(this.newProduct, newProduct);
	this.goTo('list-of-products');
}

function created() {
	this.getData();
}

function disabledAcceptButton() {
	return this.$v.newProduct.$invalid;
}

async function getData() {
	this.isLoading = true;
	const request = [
		this.categoriesList(),
		this.$httpProducts.get('brands'),
		this.$httpProducts.get('warehouses'),
		this.listPricingPromise(),
		this.$httpProducts.get('/v2/type-products'),
	];
	if (this.$route.params.id) {
		const id = this.$route.params.id;
		const warehouseId = this.$route.params.warehouseId;
		const brandId = this.$route.params.brandId;
		request.push(this.$httpProducts.get(`v2/products/${id}/${warehouseId}/${brandId}`));
	}
	try {
		const response = await Promise.all(request);
		this.categories = response[0].data;
		this.brands = response[1].data;
		this.warehouses = response[2].data;
		this.types = response[4].data;
		if (this.$route.params.id) {
			this.newProduct = response[5].data;
			this.priceList = response[3].data.map((price) => {
				const newPrice = { ...price };
				if (this.newProduct.priceList[price.id]) {
					newPrice[price.id] = this.newProduct.priceList[price.id];
				} else {
					const defaultPriceList = {
						price: 0,
						ranges: [
							{ from: 0, to: 0, price: 0 },
						],
					};
					newPrice[price.id] = defaultPriceList;
				}
				return newPrice;
			});
			this.listRanges = (this.priceList[0][this.priceList[0].id].ranges.length - 1);
			this.alternateCode = this.newProduct.alternateCode;
		} else {
			this.newProduct.type = this.types[0].id;
			this.priceList = response[3].data.map((list) => {
				const newList = { ...list };
				newList[list.id] = {
					price: 0,
					ranges: [
						{ from: 0, to: 0, price: 0 },
					],
				};
				return newList;
			});
		}
		this.isLoading = false;
		this.loadUnits();
	} catch (err) {
		this.showNotification('Ocurrió un problema con el servidor, recargue la página.', 'error');
		this.isLoading = false;
	}
}

function isServices() {
	return this.newProduct.type === 2;
}

function openModal(value) {
	if (!value.active) {
		if (value.code === 'TM') {
			this.showNotification('Primero debe seleccionar el almacén de origen y luego los productos', 'warning');
		} else {
			this.showNotification('Primero debe seleccionar productos', 'warning');
		}
	} else {
		this.action = value;
	}
}

async function registerProduct() {
	this.isLoading = true;
	const priceList = this.jsonPriceList();
	const method = this.$route.params.id ? 'patch' : 'post';
	const serviceUrl = this.$route.params.id ?
		`v2/products/${this.$route.params.id}` : 'v2/products';
	const messageSuccess = this.$route.params.id ?
		'El producto se actualizó correctamente' : 'El producto se registró correctamente';
	const body = {
		brandId: this.newProduct.brandId,
		categoryId: this.newProduct.categoryId,
		code: this.newProduct.code,
		description: this.newProduct.description,
		model: this.newProduct.model,
		name: this.newProduct.name,
		priceList,
		unitId: this.newProduct.unitId,
		type: this.newProduct.type,
		warehouseId: this.newProduct.warehouseId,
		alternateCode: this.alternateCode || [],
		features: this.newProduct.features,
	};
	if (this.newProduct.type === 2) {
		delete body.brandId;
		delete body.warehouseId;
	}
	try {
		await this.$httpProducts[method](serviceUrl, body);
		this.showNotification(messageSuccess);
		this.$bus.$emit('success-register');
		this.isLoading = false;
		this.goTo('list-of-products');
	} catch (error) {
		const message = error.data.message;
		if (message.match(/DUPLICATE/)) {
			this.showNotification(`El código de producto "${this.newProduct.code}" ya existe.`, 'error');
		} else {
			this.showNotification('Error en los datos enviados. Verifique la información por favor', 'error');
		}
		this.isLoading = false;
	}
}

function selectDisabled() {
	if (this.$route.params.id) {
		return true;
	}
	return false;
}

function showWarehouse() {
	if (this.newProduct.type === 2) {
		this.newProduct.warehouseId = [];
	}
	return !this.$route.params.id && this.newProduct.type !== 2;
}

async function updateCategory() {
	try {
		const response = await this.$httpProducts.get('categories');
		this.categories = response.data;
		this.jailai.category += 1;
	} catch (error) {
		this.showGenericError();
	}
}

async function updateBrand() {
	try {
		const response = await this.$httpProducts.get('brands');
		this.brands = response.data;
		this.jailai.brand += 1;
	} catch (error) {
		this.showGenericError();
	}
}

async function updateUnity() {
	try {
		await this.$httpProducts.post('units', this.newUnit);
		this.showNotification('La unidad ha sido creada correctamente.');
		this.loadUnits();
		this.cancelModal();
		this.jailai.unit += 1;
	} catch (error) {
		this.showGenericError();
	}
}

function openFeaturesModal() {
	this.action.active = true;
	this.action.code = 'CF';
	this.action.open = true;
	this.action.title = 'Agregar Características';
	this.action.width = 500;
}

function addFeatures(features) {
	this.loading = true;
	this.newProduct.features = features;
	this.newProduct.code = features.map(i => i.code.substr(0, 3)).join('');
	this.action.active = false;
	this.action.code = null;
	this.action.open = false;
	this.loading = false;
}

function $route() {
	this.newProduct.warehouseId = [];
}

async function loadUnits() {
	({ data: this.units } = await this.listOfUnits());
}

function setData({ model, value }) {
	this.newUnit[model] = value;
}

function validations() {
	if (this.newProduct.type === 1
		|| this.newProduct.type === 3
		|| this.newProduct.type === 4) {
		return {
			newProduct: {
				name: {
					required,
				},
				warehouseId: {
					required,
				},
				brandId: {
					required,
				},
				unitId: {
					required,
				},
				type: {
					required,
				},
				categoryId: {
					required,
				},
				code: {
					required,
					minLength: minLength(4),
				},
				model: {
					required,
				},
			},
		};
	}
	return {
		newProduct: {
			name: {
				required,
			},
			unitId: {
				required,
			},
			type: {
				required,
			},
			categoryId: {
				required,
			},
			code: {
				required,
				minLength: minLength(3),
			},
			model: {
				required,
			},
		},
	};
}

function data() {
	return {
		action: {
			active: false,
			code: null,
			open: false,
			title: 'titulo desde data',
			width: 500,
		},
		newProduct: {
			brandId: null,
			categoryId: null,
			code: '',
			description: '',
			features: [],
			model: '',
			name: '',
			type: null,
			unitId: null,
			warehouseId: null,
		},
		items: [
			{
				active: true,
				code: 'NB',
				color: '#2db6f5',
				img: `${this.$imageUrl}/traslado-mercaderia.svg`,
				text: 'MARCA NUEVA',
				width: 500,
			},
			{
				active: true,
				code: 'NC',
				color: '#1f87e5',
				img: `${this.$imageUrl}/venta-rapida.svg`,
				text: 'NUEVA CATEGORÍA',
				width: 550,
			},
			{
				active: true,
				code: 'NF',
				color: '#05579b',
				img: `${this.$imageUrl}/cotizacion.svg`,
				text: 'NUEVA CARACTERÍSTICA',
				width: 425,
			},
			{
				active: true,
				code: 'UND',
				color: '#18324e',
				img: `${this.$imageUrl}/registro-rapido.svg`,
				text: 'UNIDADES DE MEDIDA',
				width: 550,
				maxWidth: 54,
			},
		],
		jailai: {
			brand: 0,
			category: 0,
			unit: 0,
		},
		loading: false,
		newUnit: {
			code: '',
			color: '#000000',
			flagActive: true,
			name: '',
		},
		priceListNew: null,
		requiredData: true,
	};
}

export default {
	name: 'new-product',
	components: {
		actionSidebar,
		featuresConfig,
		headerPage,
		newBrand,
		newCategory,
		newFeatures,
		quickActions,
		unitsForm,
	},
	computed: {
		biggerHeight,
		disabledAcceptButton,
		selectDisabled,
		showWarehouse,
		isServices,
	},
	created,
	data,
	methods: {
		addFeatures,
		cancelModal,
		cancelProduct,
		getData,
		loadUnits,
		openFeaturesModal,
		openModal,
		registerProduct,
		setData,
		updateBrand,
		updateCategory,
		updateUnity,
	},
	mixins: [newProductMixin],
	validations,
	watch: {
		$route,
	},
};
</script>

<style lang="scss" scoped>
	.new-product {
		background: map-get($colors, background-even-modal);
		padding-bottom: 80px;

		.new-product-form {
			border-right: 1px solid map-get($colors, grey-border);
		}

		&-price-list {
			.new-product-main-container {
				@include vertical-displacement;
				height: 235px;
				overflow: hidden;

				.price-list-container {
					border-bottom: 2px solid map-get($colors, subheaderText);
					margin-left: 10px;
					padding-bottom: 7px;

					.price-list-name {
						border-bottom: 2px solid map-get($colors, subheaderText);
						color: map-get($colors, paginationText);
						font-family: map-get($fonts, open-semibold);
						font-size: 13px;
						padding-left: 10px;
						padding-top: 8px;
						text-transform: uppercase;
					}

					.price-list-content {
						border-bottom: 1px solid map-get($colors, grey-border);
						border-top: 1px solid map-get($colors, grey-border);
						display: grid;
						grid-template-columns: 1fr 1fr;
						grid-column-gap: 15px;
						grid-row-gap: 5px;
						padding: 10px 0;
						margin-bottom: 20px;
					}

					.end {
						grid-column-start: 2;
					}
				}
			}
		}

		.price-list-see-all {
			color: map-get($colors, blue-price);
			cursor: pointer;
			text-align: right;
		}

		&-footer {
			@include flex-center;
			background: map-get($colors, background-even-modal);
			margin-bottom: 55px;
		}

		&-log-japi {
			@include flex-center;
			background-color: white;
			border: 5px solid map-get($colors, primary);
			border-radius: 50%;
			height: 100px;
			margin: 20px auto;
			width: 100px;

			img {
				width: 65%;
			}
		}

		&-quick-actions {
			background-color: white;
			margin: auto;
			width: 80%;

			@media (min-width: 300px) {
				width: 215px;
			}

			@media (min-width: 425px) {
				width: 310px;
			}

			@media (min-width: 768px) {
				width: 610px;
			}
		}
	}

	.separation {
		margin-right: 10px;
	}
</style>
