<template>
	<div>
		<header-page
			name="create-banner-ecommerce"
			:title="$route.meta.title"
		></header-page>
		<v-layout wrap row justify-space-between mt-5>
			<v-flex xs12 md6 px-4>
				<v-layout wrap row>
					<v-flex xs12 mb-3>
						<v-text-field
							class="filter-select"
							label="Orden"
							v-model="model.order"
						>
						</v-text-field>
						<span class="form-group__message"
							v-if="$v.model.order.$invalid">
							El Orden es un número
						</span>
					</v-flex>
					<v-flex xs12 mb-3>
						<v-text-field
							class="filter-select"
							label="Título"
							v-model="model.title"
						>
						</v-text-field>
						<span class="form-group__message"
							v-if="$v.model.title.$invalid">
							El Título es requerido
						</span>
					</v-flex>
					<v-flex xs12 mb-3>
						<v-text-field
							class="filter-select"
							label="Descripción"
							v-model="model.description"
						>
						</v-text-field>
					</v-flex>
					<v-flex xs12 mb-3>
						<v-select
							:items="selectCategory"
							label="Tipo de Banner"
							single-line
							item-text="name"
							item-value="id"
							bottom
							hide-details
							class="filter-select"
							content-class="filter-select-content"
							v-model="model.typeId"
							@input="resetEntityId"
						></v-select>
						<span class="form-group__message"
							v-if="$v.model.typeId.$invalid">
							Tip de banner es requerido
						</span>
					</v-flex>
					<v-flex xs12 mb-3 v-if="model.typeId === 1">
						<v-select
							:items="categories"
							label="Escoge Categoría"
							single-line
							item-text="title"
							item-value="id"
							bottom
							hide-details
							class="filter-select"
							content-class="filter-select-content"
							v-model="model.entityId"
							:disabled="!disabledCategory"
							@input="loadProducts(false, $event)"
						></v-select>
						<span class="form-group__message"
							v-if="$v.model.entityId.$invalid">
							La categoría es requerida
						</span>
					</v-flex>
					<v-flex xs12 md12 mb-4>
						<v-layout row wrap class="title-section">
							<v-flex xs11 pt-2>
								<h5 class="fnt-14">ACTIVAR POR PERIODO DEFINIDO</h5>
							</v-flex>
							<v-flex xs1>
								<v-checkbox
									color="primary"
									v-model="model.flagAutomatic"
									hide-details
								></v-checkbox>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs6 md6 pr-2 mb-3 v-show="model.flagAutomatic">
						<app-date-mask
							id="date-initial"
							label="Fecha Inicio"
							v-model="startDate"
							@format-date="onDate($event, 'startDate')"
						/>
						<span class="form-group__message"
							v-if="$v.model.startDate.$invalid">
							La Fecha Inicio es requerido
						</span>
					</v-flex>
					<v-flex xs6 md6 pr-2 mb-3 v-show="model.flagAutomatic">
						<app-date-mask 
							id="date-end"
							label="Fecha Fin"
							v-model="endDate"
							@format-date="onDate($event, 'endDate')"
						/>
						<span class="form-group__message"
							v-if="$v.model.endDate.$invalid">
							La Fecha Fin es requerido
						</span>
					</v-flex>
					<v-flex xs12 md-12 v-if="!commerceId && listCommerce.length > 1">
						<label class="label">Comercio</label>
						<v-select
							:items="listCommerce"
							label="Comercio"
							single-line
							item-text="name"
							item-value="id"
							bottom
							hide-details
							class="filter-select"
							content-class="filter-select-content"
							v-model="model.commerceId"
						></v-select>
						<span class="form-group__message"
							v-if="$v.model.commerceId.$invalid">
							El comercio es requerido
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 md6 px-4>
				<div>
					<v-tabs
						align-with-title
						color="grey lighten-3"
						right
						slider-color="primary"
						class="br-8"
						v-model="active"
					>
						<v-tab
							v-for="tab in tabs"
							:key="tab.id"
							active-class="blue--text"
						>
							<span>{{ tab.name }}</span>
						</v-tab>
						<v-tab-item
							v-for="tab in tabs"
							:key="tab.id"
						>
							<div class="background-gray">
								<v-layout justify-center class="mb-3">
									<v-flex xs12 mb3 v-if="active === '0'">
										<autocomplete-component
											placeholder-value="ID"
											item-text="name"
											item-value="id"
											:items="products"
											local-search
											return-object
											:item="model.mobileLink"
											@return-data="setData($event, 'mobileLink')"
										></autocomplete-component>
									</v-flex>
									<v-flex xs12 mb3 v-else>
										<v-text-field
											class="filter-select"
											label="Link"
											v-model="model.webLink"
										></v-text-field>
									</v-flex>
								</v-layout>
								<tab-image 
									:image="image" 
									:suggestion = tab.suggestion
									:image-size="tab.imageSize"
									@see-real-image="seeRealImage"
									@upload="uploadImage"
								/>
							</div>
						</v-tab-item>
					</v-tabs>
					<span class="caption error--text"
						v-if="!isDisabledBanner">
						Debe subirse al menos una imagen
					</span>
				</div>
			</v-flex>
		</v-layout>
		<section class="mb-5">
			<div class="wrapper-buttons">
				<v-btn
					color="pink"
					class="btn-action"
					@click="cancel"
				>Cancelar</v-btn>
				<v-btn
					color="success"
					class="btn-action"
					:disabled="$v.model.$invalid || !isDisabledBanner"
					@click="createBanner"
				>Guardar</v-btn>
			</div>
		</section>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import tabImage from '@/components/ecommerce/tab-image';
import { required, requiredIf, numeric } from 'vuelidate/lib/validators';
import { differenceInDays } from 'date-fns';
import VueSixFour from 'vue-six-four';

function created() {
	this.loadCategories();
	this.loadCommerce();
}

function active(value) {
	const newVal = Number(value) === 0;
	this.image = newVal ? this.model.mobileImage : this.model.webImage;
}

function cancel() {
	if (this.commerceId) {
		this.goTo('banner', { params: { id: this.commerceId }, query: { name: this.$route.query.name, origin: this.$route.query.back } });
	} else {
		this.goTo('banner', { query: { navigationValidation: 1 } });
	}
}

async function createBanner() {
	const url = this.id ? `banners/${this.id}` : 'banners';
	const method = this.id ? 'patch' : 'post';
	const message = this.id ? 'actualizado' : 'creado';
	const commerceName = this.listCommerce.find(l => l.id === this.model.commerceId).name;
	const body = {
		title: this.model.title,
		description: this.model.description,
		typeId: this.model.typeId,
		entityId: this.model.entityId,
		order: this.model.order,
		webImage: this.model.webImage,
		mobileImage: this.model.mobileImage,
		webLink: this.model.webLink,
		mobileLink: this.model.mobileLink,
		flagAutomatic: !!this.model.flagAutomatic,
		startDate: this.model.startDate,
		endDate: this.model.endDate,
		commerceId: this.model.commerceId,
		commerceName,
	};
	const validDate = differenceInDays(this.model.endDate, this.model.startDate) < 0;
	if (validDate) {
		this.showNotification('La fecha final no puede ser menor a la inicial.', 'info');
	} else {
		try {
			await this.$httpProducts[method](url, body);
			this.showNotification(`El banner ha sido ${message} correctamente.`);
			this.cancel();
		} catch (error) {
			if (error.status === 500) {
				this.showGenericError('Error');
			}
		}
	}
}

function disabledCategory() {
	return this.model.typeId === 1;
}

async function getBanner() {
	const response = await this.$httpProducts.get(`banners/${this.id}`);
	const newData = response.data;
	newData.entityId = Number(response.data.entityId);
	this.active = newData.webImage || !newData.mobileImage ? '1' : '0';
	if (Number(this.active) === 0) {
		this.image = newData.mobileImage;
	} else {
		this.image = newData.webImage;
	}
	this.model = { ...newData };
}

async function getFile(fileInfo) {
	const name = fileInfo.name.replace(/\s/g, '-');
	const newFile = {
		base64: fileInfo.sixFour,
		newColumns: ['date', 'type', 'document', 'concept', 'amount'],
		replace: true,
	};
	this.fileLoading = true;
	try {
		const words = name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: file } = await this.$httpSales.post('bank-operation', newFile);
			const body = { model: 'excel', newValue: file };
			this.$emit('set-data', body);
		} else {
			this.showNotification(`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`, 'warning');
		}
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		} else if (error.status === 400) {
			if (error.data.message === 'READ_FILE_XLSX_ERROR') {
				this.showNotification('No se pudo leer el archivo excel. Recargue la página e inténtelo de nuevo.',
					'error');
			} else if (error.data.message === 'WRITE_FILE_XLSX_ERROR') {
				this.showNotification('Se produjo un error de escritura en el archivo. Recargue la página e inténtelo de nuevo.',
					'error');
			}
		}
	} finally {
		this.fileLoading = false;
	}
}

async function loadCategories() {
	({ data: this.categories } = await this.$httpProducts.get('e-categories'));
	this.loadProducts(true);
}

async function loadProducts(loadData, categoryId) {
	const params = { eCategories: categoryId, commerceId: this.commerceId };
	({ data: this.products } = await this.$httpProducts.get('e-products', { params }));
	this.model.mobileLink = null;
	if (this.id && loadData) {
		this.getBanner();
	} else {
		this.active = '1';
	}
}

function onDate(value, modelName) {
	this.model[modelName] = value;
}

function resetEntityId(val) {
	if (val === 2) {
		this.model.entityId = null;
	}
}

function setData(value, name) {
	if (value) {
		this.model[name] = value.id ? value.id : '';
	}
}

function uploadImage(linkImage) {
	const mobileTab = Number(this.active) === 0;
	if (mobileTab) {
		this.model.mobileImage = linkImage || '';
	} else {
		this.model.webImage = linkImage || '';
	}
	this.image = mobileTab ? this.model.mobileImage : this.model.webImage;
}

async function loadCommerce() {
	({ data: this.listCommerce } = await this.$httpSales.get('com-ecommerce-companies'));
	if (this.listCommerce.length === 1) {
		this.model.commerceId = this.listCommerce[0].id;
		this.model.commerceName = this.listCommerce[0].name;
	} else if (this.commerceId) {
		this.model.commerceId = Number(this.commerceId);
	}
}

function validations() {
	return {
		model: {
			title: {
				required,
			},
			typeId: {
				required,
			},
			startDate: {
				required: requiredIf(() => this.model.flagAutomatic),
			},
			endDate: {
				required: requiredIf(() => this.model.flagAutomatic),
			},
			order: {
				numeric,
			},
			entityId: {
				required: requiredIf(() => this.model.typeId === 1),
			},
			mobileImage: { required: requiredIf(() => !this.model.webImage) },
			webImage: { required: requiredIf(() => !this.model.mobileImage) },
			commerceId: { required },
		},
	};
}

function isDisabledBanner() {
	return Boolean(this.model.mobileImage || this.model.webImage);
}

function seeRealImage(urlImage) {
	window.open(urlImage, '_blank');
}

function data() {
	return {
		selectCategory: [
			{ id: 10, name: 'Aplicativo móvil' },
			{ id: 1, name: 'Categoría' },
			{ id: 2, name: 'Producto' },
			{ id: 3, name: 'Home' },
			{ id: 4, name: 'Top' },
			{ id: 5, name: 'Promoción' },
			{ id: 6, name: 'Promoción en detalle' },
			{ id: 7, name: 'Planes' },
			{ id: 8, name: 'Cupones' },
			{ id: 9, name: 'Crédito' },
		],
		categories: [],
		products: [],
		model: {
			order: null,
			title: '',
			description: '',
			typeId: '',
			mobileLink: null,
			entityId: null,
			webLink: null,
			flagAutomatic: false,
			startDate: null,
			endDate: null,
			webImage: null,
			mobileImage: null,
			commerceId: null,
			commerceName: null,
		},
		startDate: null,
		endDate: null,
		image: '',
		tabs: [
			{ id: 1, name: 'BANNER APP', imageSize: '1080px x 360px', suggestion: true },
			{ id: 2, name: 'BANNER WEB', imageSize: '998px x 431px', suggestion: false },
		],
		active: 0,
		listCommerce: [],
	};
}

export default {
	name: 'create-banner',
	props: {
		id: {
			type: [Number, String],
		},
		commerceId: [Number, String],
	},
	components: {
		headerPage,
		autocompleteComponent,
		tabImage,
		VueSixFour,
	},
	data,
	created,
	computed: {
		disabledCategory,
		isDisabledBanner,
	},
	methods: {
		cancel,
		createBanner,
		getFile,
		getBanner,
		loadCategories,
		loadProducts,
		onDate,
		resetEntityId,
		seeRealImage,
		setData,
		uploadImage,
		loadCommerce,
	},
	validations,
	watch: {
		active,
	},
};
</script>
<style lang="scss" scoped>
	.background-gray {
		background-color: #eee !important;
		padding: 15px;
		width: 100%;
	}

	.title-section {
		border-bottom: 1px solid map-get($colors, blue-grey);
		padding-bottom: 5px;
	}

	.fnt-14 {
		font-size: 14px;
	}

	.wrapper-buttons {
		align-items: center;
		display: flex;
		justify-content: center;
		margin-top: 50px;
		width: 100%;

		.btn-action {
			&:nth-child(1) {
				margin-right: 9px;
			}
		}
	}

	.label {
		font-size: size(small);
	}
</style>


