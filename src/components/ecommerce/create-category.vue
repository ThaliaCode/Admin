<template>
	<div>
		<v-layout wrap px-4 py-4>
			<v-flex xs12 md12 pr-2 mb-4>
				<v-layout>
					<v-flex xs11>
						<v-select
							autocomplete
							label="Categoría Padre"
							:items="fathers"
							item-text="relationalName"
							item-value="id"
							bottom
							hide-details
							class="filter-select shadow-inset"
							v-model="model.categoryId"
							@click="getCategory"
						></v-select>
						<span class="form-group__message" v-if="$v.model.categoryId.$invalid">
							Categoría padre es requerido.
						</span>
					</v-flex>
					<v-flex xs1 text-xs-right>
						<v-tooltip top>
							<img 
								src="/static/img/pregunta-1.svg" 
								alt="signo de interrogación"
								slot="activator"
							>
							<span>Esta opción se utiliza en su Ecommerce, una categoría puede estar pertenecer a otra(Ejem. Prendas de Vestir puede tener subcategorias como Niños, Mujer, etc.)</span>
						</v-tooltip>
					</v-flex>
				</v-layout>
			</v-flex>	
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					class="filter-select shadow-inset"
					label="Título"
					v-model="model.title"
				>
				</v-text-field>
				<span class="form-group__message" v-if="$v.model.title.$invalid">
					Titulo de Categoria es requerido.
				</span>
			</v-flex>
			<v-flex xs12 pr-2 mb-4>
				<v-layout>
					<v-flex xs11>
						<slug-input
						:loading="slugLoading"
						:slug="model.slug"
						:validated="slugValidated"
						@on-input="setSlug"
					></slug-input>
					</v-flex>
					<v-flex xs1 text-xs-right pt-4>
						<v-tooltip top>
							<img 
								src="/static/img/pregunta-1.svg" 
								alt="signo de interrogación"
								slot="activator"
							>
							<span>Es un alias que se le da a la categoría que sirve para la busqueda de esta.</span>
						</v-tooltip>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					class="filter-select"
					label="Orden"
					v-model="model.order">
				</v-text-field>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					class="textarea-content filter-select"
					label="Descripción"
					v-model="model.description">
				</v-text-field>
			</v-flex>
			<v-flex xs12 md12 pr2 mb-3>
				<v-layout 
					row 
					wrap
					class="wrapper-check">
					<v-flex xs11 pt-2>
						<h5>MOSTRAR ICONOS</h5>
					</v-flex>
					<v-flex xs1>
						<v-checkbox
							v-model="showImages"
							hide-details
    					></v-checkbox>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 md12 pr2 mb-3 v-show="showImages">
				<v-layout row wrap>
					<v-flex xs11 pr2 mb-3>
					<label ref="label" for="upload-icon-app-ecommerce" class="w-100">
						<vue-six-four 
							id="upload-icon-app-ecommerce"
							ref="mobile-image-vuesixfour"
							hidden
							@vue-six-four="getFileUpdate('mobileImage', $event)"
						/>
						<v-layout wrap>
							<v-flex :class="model.mobileImage ? 'xs10' : 'xs11'" mt-1>
								<app-input-text
									label="Icono(App)"
									readonly
									:text="model.mobileImage"
								/>
							</v-flex>
							<v-flex xs1 text-xs-center class="wrapper-upload">
								<v-btn	
									@click="showDialog('label')"
									class="ma-0 pl-0 btn-auto"
									small
									color="primary">
									<v-icon color="white">camera_alt</v-icon>
								</v-btn>
							</v-flex>
							<v-flex
								v-if="model.mobileImage"
								class="wrapper-upload"
								justify-center
								xs1 text-xs-center
							>
								<app-tooltip-button
									color="error"
									height="30"
									icon="remove_circle"
									text="Eliminar"
									@click-icon="deleteImage('mobileImage', 'mobile-image-vuesixfour')"
								></app-tooltip-button>
							</v-flex>
						</v-layout>
					</label>
					</v-flex>
					<v-flex xs1 text-xs-right pt-4>
						<v-tooltip top>
							<img 
								src="/static/img/pregunta-1.svg" 
								alt="signo de interrogación"
								slot="activator"
							>
							<span>Es el icono que en su mostrará en su app.</span>
						</v-tooltip>
					</v-flex>
					<v-flex xs11 pr2 mb-3>
						<label ref="label-web" for="upload-icon-web-ecommerce" class="w-100">
							<vue-six-four 
								id="upload-icon-web-ecommerce"
								ref="web-image-vuesixfour"
								hidden
								@vue-six-four="getFileUpdate('webImage', $event)"
							/>
							<v-layout wrap>
								<v-flex :class="model.webImage ? 'xs10' : 'xs11'" mt-1>
									<app-input-text
										label="Icono(Web)"
										readonly
										:text="model.webImage"
									/>
								</v-flex>
								<v-flex xs1 text-xs-center class="wrapper-upload">
									<v-btn	
										@click="showDialog('label-web')"
										class="ma-0 pl-0 btn-auto"
										small
										color="primary">
										<v-icon color="white">camera_alt</v-icon>
									</v-btn>
								</v-flex>
								<v-flex
									v-if="model.webImage"
									class="wrapper-upload"
									xs1 justify-center
									text-xs-center
								>
									<app-tooltip-button
										color="error"
										height="30"
										icon="remove_circle"
										text="Eliminar"
										@click-icon="deleteImage('webImage', 'web-image-vuesixfour')"
									></app-tooltip-button>
								</v-flex>
							</v-layout>
						</label>
					</v-flex>
					<v-flex xs1 text-xs-right pt-4>
						<v-tooltip top>
							<img 
								src="/static/img/pregunta-1.svg" 
								alt="signo de interrogación"
								slot="activator"
							>
							<span>Es el icono que se mostrará en su Ecommerce.</span>
						</v-tooltip>
					</v-flex>
					<v-flex xs12 md12 pr2 mb-3>
						<v-layout>
							<v-flex xs11>
								<label ref="label-image" for="upload-image-ecommerce" class="w-100">
									<vue-six-four 
										id="upload-image-ecommerce"
										ref="url-image-vuesixfour"
										hidden
										@vue-six-four="getFileUpdate('urlImage', $event)"
									/>
									<v-layout wrap>
										<v-flex :class="model.urlImage ? 'xs10' : 'xs11'" mt-1>
											<app-input-text
												label="Imagen"
												readonly
												:text="model.urlImage"
											/>
										</v-flex>
										<v-flex xs1 text-xs-center class="wrapper-upload">
											<v-btn	
												@click="showDialog('label-image')"
												class="ma-0 pl-0 btn-auto"
												small
												color="primary">
												<v-icon color="white">camera_alt</v-icon>
											</v-btn>
										</v-flex>
										<v-flex
											v-if="model.urlImage"
											class="wrapper-upload"
											justify-center
											xs1 text-xs-center
										>
											<app-tooltip-button
												color="error"
												height="30"
												icon="remove_circle"
												text="Eliminar"
												@click-icon="deleteImage('urlImage', 'web-image-vuesixfour')"
											></app-tooltip-button>
										</v-flex>
									</v-layout>
								</label>
							</v-flex>
							<v-flex xs1 text-xs-right pt-4>
								<v-tooltip top>
									<img 
										src="/static/img/pregunta-1.svg" 
										alt="signo de interrogación"
										slot="activator"
									>
									<span>Es la imagen que representa la categoría en su Ecommerce.</span>
								</v-tooltip>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 md12 pr2 mb-3>
				<v-layout 
					row 
					wrap
					class="wrapper-check">
					<v-flex xs11 pt-2>
						<h5>ACTIVAR POR PERÍODO DEFINIDO</h5>
					</v-flex>
					<v-flex xs1>
						<v-checkbox
							v-model="model.flagAutomatic"
							hide-details
    					></v-checkbox>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 md12 pr2 mb-3 v-show="model.flagAutomatic">
				<v-layout row wrap justify-space-between>
					<v-flex xs5>
						<app-date-mask
							label="Fecha Inicio"
							v-model="startDate"
							@format-date="onDate($event, 'startDate')"
						></app-date-mask>
						<span class="form-group__message" v-if="$v.model.startDate.$invalid">
							La fecha de inicio es requerida
						</span>
					</v-flex>
					<v-flex xs5>
						<app-date-mask
							id="end-date"
							label="Fecha Fin"
							v-model="endDate"
							@format-date="onDate($event, 'endDate')"
						></app-date-mask>
						<span class="form-group__message" v-if="$v.model.endDate.$invalid">
							La fecha de fin es requerida
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="disabledBtn"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="save"
			/>
		</section>
	</div>
</template>
<script>
import VueSixFour from 'vue-six-four';
import { differenceInDays } from 'date-fns';
import { required, requiredIf } from 'vuelidate/lib/validators';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import slugInput from '@/components/ecommerce/slug-input';
import typeEntityEcommerce from '@/shared/type-entity-ecommerce';

const { debounce, exactDate } = helper;

function created() {
	this.loadCategories();
	this.getCategory();
}

function setNameCommerce(item) {
	this.model.commerceName = item.name;
	this.model.commerceId = item.id;
}

function clearModal() {
	this.model = {
		commerceName: '',
		commerceId: null,
		categoryId: null,
		description: '',
		endDate: null,
		flagAutomatic: false,
		mobileImage: '',
		order: 0,
		startDate: null,
		search: '',
		slug: null,
		title: '',
		urlImage: '',
		webImage: '',
	};
	this.startDate = null;
	this.endDate = null;
}

function closeModal() {
	this.$emit('close');
	this.clearModal();
}

function disabledBtn() {
	return this.$v.model.$invalid || this.loading || (this.model.slug && !this.slugValidated);
}

async function getCategory() {
	const params = {
		commerceId: this.$route.params.id,
	};
	const { data: fathers } = await this.$httpProducts.get('e-categories', { params });
	this.fathers = this.fathers.concat(fathers.filter(f =>
		f.categoryId !== Number(this.id) && f.id !== Number(this.id)));
	if (this.id) {
		this.loadData();
	}
}

async function getFileUpdate(name, fileInfo) {
	const newFile = {
		name: fileInfo.name.replace(/\s/g, '-'),
		base64data: fileInfo.sixFour,
	};
	try {
		const words = newFile.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: file } = await this.$httpProduction.post('upload-files', newFile);
			this.model[name] = file.Location;
		} else {
			this.showNotification(`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`, 'warning');
		}
	} catch (error) {
		this.showGenericError();
	}
}

async function loadData() {
	try {
		({ data: this.model } = await this.$httpProducts.get(`e-categories/${this.id}`));
		this.startDate = exactDate(this.model.startDate, 'DD/MM/YYYY');
		this.endDate = exactDate(this.model.endDate, 'DD/MM/YYYY');
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function onDate(value, modelName) {
	this.model[modelName] = value;
}

async function save() {
	const validDate = differenceInDays(this.model.endDate, this.model.startDate) < 0;
	// const value = this.commerceId ? 'relationalName' : 'name';
	// const nameExist = this.id ? this.rows.find(r => r.id !== this.id &&
	// 	this.formatText(r[value]) === this.formatText(this.model.title)) :
	// 	this.rows.find(r => this.formatText(r[value]) === this.formatText(this.model.title));
	if (validDate) {
		this.showNotification('La fecha final no puede ser menor a la inicial.', 'info');
	} else {
		this.$emit('save', this.model);
		this.clearModal();
	}
	// else if (nameExist) {
	// 	this.showGenericError('Ya existe una categoría con el nombre ingresado.');
	// }
}

function showDialog(name) {
	this.$refs[name].click();
}

function isRequiredFather(category) {
	return category !== '';
}

function validations() {
	return {
		model: {
			title: {
				required,
			},
			categoryId: {
				isRequiredFather: this.isRequiredFather,
			},
			startDate: {
				required: requiredIf(() => this.model.flagAutomatic),
			},
			endDate: {
				required: requiredIf(() => this.model.flagAutomatic),
			},
		},
	};
}

/* eslint-disable prefer-template */
/* eslint-disable no-useless-escape */
function setSlug(value) {
	const valueNormalize = value.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[0-9]/g, '')
		.replace(/\s+/g, ' ')
		.replace(/^(\s*)([\W\w]*)(\b\s*$)/g, '$2');
	this.model.slug = valueNormalize.toLowerCase();
	this.validateSlug(this.model.slug);
}

async function validateSlug(value) {
	if (value) {
		this.slugLoading = true;
		const entityId = typeEntityEcommerce.Category;
		const body = {
			entityId,
			slug: value || null,
		};
		this.model.slug = value || null;
		if (this.$route.params.id) {
			body.commerceId = this.$route.params.id;
		}
		try {
			await this.$httpProducts.post('slug', body);
			this.slugValidated = true;
		} catch (err) {
			this.slugValidated = false;
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.slugLoading = false;
		}
	}
}

function deleteImage(prop, refProp) {
	this.model[prop] = '';
	this.clear(prop, refProp);
}

function clear(prop, refProp) {
	this.model[prop] = '';
	this.$refs[refProp].$el.value = '';
}

function isShowFather() {
	const { settings: companySettings } = this.$userInfo.company;
	const settingsKeys = Object.keys(companySettings);
	const flagCatEcomFather = settingsKeys.find(k => k === 'flagCatEcomFather');
	if (!flagCatEcomFather) {
		return true;
	}
	return companySettings[flagCatEcomFather];
}

function watchModel(mod) {
	if (mod.title && !this.loading) {
		this.slugValidated = true;
	}
}

function formatText(text) {
	return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

async function loadCategories() {
	if (this.commerceId) {
		const params = { commerceId: this.commerceId };
		({ data: this.rows } = await this.$httpProducts.get('e-categories', { params }));
	} else {
		({ data: this.rows } = await this.categoriesList());
	}
}

function data() {
	return {
		list: [],
		model: {
			commerceName: '',
			commerceId: null,
			categoryId: null,
			description: '',
			endDate: null,
			flagAutomatic: false,
			mobileImage: '',
			order: 0,
			startDate: null,
			search: '',
			slug: null,
			title: '',
			urlImage: '',
			webImage: '',
		},
		fathers: [
			{ id: null, relationalName: 'Ninguna' },
		],
		allowedFiles: ['jpg', 'jpeg', 'png', 'svg'],
		startDate: null,
		endDate: null,
		slugLoading: false,
		slugValidated: true,
		showImages: false,
		rows: [],
	};
}

export default {
	name: 'create-category',
	data,
	components: {
		VueSixFour,
		modalSidebarButton,
		slugInput,
	},
	computed: {
		disabledBtn,
		isShowFather,
	},
	created,
	methods: {
		clear,
		clearModal,
		closeModal,
		deleteImage,
		formatText,
		getCategory,
		getFileUpdate,
		loadCategories,
		loadData,
		onDate,
		save,
		setSlug: debounce(setSlug),
		setNameCommerce,
		showDialog,
		validateSlug: debounce(validateSlug),
		isRequiredFather,
	},
	props: {
		id: [Number, String],
		loading: {
			default: false,
			type: Boolean,
		},
		commerceId: [Number, String],
	},
	validations,
	watch: {
		model: {
			deep: true,
			handler: watchModel,
		},
	},
};
</script>

<style lang="scss" scoped>
	.wrapper-check {
		border-bottom: 1px solid map-get($colors, blue-grey);
	}

	.wrapper-upload {
		align-self: flex-end;
		display: inline-flex;
		height: 30px;
	}
</style>


