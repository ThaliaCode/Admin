<template>
	<div class="warehouse">
		<header-page
			caption-navigation="Configuración"
			:title="$route.meta.title"
			to-show
			:open-on-click="true"
			:showExcel="false"
			:showClean="false"
		>
			<v-btn class="error" @click="cleanFilter"> Limpiar filtros </v-btn>
			<v-btn class="primary" @click="openIt('RU')"> Crear marca </v-btn>
		</header-page>
		<v-layout row wrap align-end my-3 px-5>
			{{ this.params.flagActive }}
			<v-flex xs3 ml-2>
				<app-select
					:items="typesBrands"
					item-text="name"
					item-value="value"
					label="Tipo de marca"
					model="flagActive"
					:return-object="false"
					@input="setParamsData"
				>
				</app-select>
			</v-flex>
		</v-layout>
		<v-layout mt-5>
			<v-flex xs12>
				<app-table
					name="features"
					:selectable="false"
					:inputSearch="true"
					:filterColumns="true"
					:rows="rows"
					:columns="columns"
					:last-page="lastPage"
					:current-page="currentPage"
					@on-search-event="callServiceAndSearch"
					@on-page="changePage"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">{{ props.row.id }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 3)">
							<v-tooltip top>
								<template slot="activator">
									<img
										v-if="urlImageRow(props.row.dataImage)"
										class="pt-2 pb-2 px-1"
										width="55px"
										height="55px"
										:src="urlImageRow(props.row.dataImage)"
									/>
								</template>
								<img
									class="pt-2 pb-2 px-1"
									width="190px"
									height="195px"
									:src="urlImageRow(props.row.dataImage)"
								/>
							</v-tooltip>
							<!-- {{ props.row.dataImage && props.row.dataImage.length ? props.row.dataImage[0].urlImage : null }} -->
						</td>
						<!-- <td v-show="showRow(columns, 4)">{{ props.row.type === 1 ? 'Activo' : 'Inactivo' }}</td> -->
						<td v-show="showRow(columns, 4)">
							<document-state
								:color="getColorStatus(props.row)"
								icon="radio_button_checked"
								:tooltip="getTextStatus(props.row)"
							/>
						</td>
						<td v-show="showRow(columns, 5)">
							<button
								:disabled="props.row.flagGeneric"
								@click="openIt('EU', props.row)"
								class="table-icon ml-1"
							>
								<v-icon color="primary">edit</v-icon>
							</button>
							<!-- <button
								:disabled="props.row.flagGeneric"

								class="table-icon ml-1"
							>
								<v-icon color="primary">delete</v-icon>
							</button> -->
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<action-sidebar
			:width="action.width"
			v-model="action.open"
			:title="action.title"
			:active="action.active"
			:help-actions="actionsToHelp"
			:code-action="action.code"
			@close-modal="closeModal"
		>
			<v-layout
				row
				wrap
				px-4
				mt-4
				justify-center
				v-if="action.code === 'EU' || action.code === 'RU'"
			>
				<v-flex class="product-general-column image">
					<label ref="up" for="upload-image">
						<vue-six-four id="upload-image" hidden @vue-six-four="getFile" />
						<button
							class="product-image-container"
							:disabled="isLoadingImage"
							type="button"
							@click="actionUploadImage"
						>
							<template v-if="urlImage">
								<img
									:src="urlImage"
									class="product-image"
									alt="sube una imagen"
								/>
								<span class="product-image-hover">Cambiar foto</span>
								<button
									@click.stop="deleteImageUnit"
									class="product-image-hover-delete"
								>
									<v-icon color="white">clear</v-icon>
								</button>
							</template>
							<template v-else>
								<template v-if="isLoadingImage">
									<span class="product-image-loading"> CARGANDO... </span>
								</template>
								<template v-else>
									<img
										src="/static/img/image-default.svg"
										height="85"
										alt="sube una imagen"
									/>
									<p class="product-image-title mb-0">SUBIR FOTO</p>
									<p class="product-image-size mb-0">HASTA 500KB</p>
								</template>
							</template>
						</button>
					</label>
				</v-flex>
				<v-flex xs12 mt-1>
					<app-input-text
						label="Código"
						model="code"
						:text="brand.code"
						@input="setData"
					/>
					<span class="form-group__message" v-if="!$v.brand.code.required">
						El código de la unidad es requerido
					</span>
					<!-- <span class="form-group__message" v-if="!$v.brand.code.maxLength">
							Máximo 3 caracteres
						</span> -->
					<span class="form-group__message" v-if="checkBlankCode(brand.code)">
						No se permite espacios en blanco
					</span>
				</v-flex>
				<v-flex xs12 mt-1>
					<app-input-text
						label="Nombre"
						model="name"
						:text="brand.name"
						@input="setData"
					/>
					<span class="form-group__message" v-if="!$v.brand.name.required">
						El nombre de la unidad es requerido
					</span>
				</v-flex>
				<v-flex xs12 mt-1>
					<app-input-text
						label="Slug:"
						model="slug"
						:text="brand.slug"
						@input="setData"
					/>
				</v-flex>
				<v-flex xs12 mt-1>
					<label class="grey--text"> Descripción </label>
					<textarea class="textArea" v-model="brand.description"></textarea>
				</v-flex>
				<v-flex xs12 mb2 class="title-section">
					<span>CONFIGURACIÓN</span>
				</v-flex>
				<v-flex xs12 mt-2>
					<v-switch
						class="body-1"
						color="success"
						label="Activar o desactivar categoria"
						v-model="brand.flagActive"
					></v-switch>
				</v-flex>
				<v-flex>
					<section class="modal-filter-footer">
						<!-- {{ $v.brand.$invalid }} o {{ checkBlankCode(brand.code) }} -->
						<modal-sidebar-button
							:is-loading="checkBlankCode(brand.code)"
							@cancel-button-clicked="closeModal"
							@accept-button-clicked="confirAction"
						/>
					</section>
				</v-flex>
			</v-layout>
		</action-sidebar>
	</div>
</template>

<script>
import VueSixFour from 'vue-six-four';
import upLoadImageMixin from '@/mixins/upLoadImage';
import { required, maxLength } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appInputText from '@/components/shared/app-input-text';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import documentState from '@/components/shared/document-state';

function created() {
	this.loadData();
}

async function loadData() {
	try {
		const params = this.params;
		const { data: rows } = await this.$httpCMS.get('cms-brands', { params });
		this.rows = rows.map((brand) => ({
			...brand,
			dataImage: brand.dataImage || [],
		}));
	} catch (error) {
		this.showGenericError();
	}
}

function filteredUnits() {
	return this.rows;
}

function clearModal() {
	this.code = null;
	this.urlImage = null;
	this.brand = {
		id: null,
		code: null,
		name: null,
		slug: null,
		description: null,
		type: 1,
		dataImage: [],
		flagActive: 1,
	};
}

function closeModal() {
	this.action = { ...this.actionDefault };
	this.clearModal();
}

function changePage(page) {
	this.currentPage = page;
}

function callServiceAndSearch(search) {
	if (search) {
		this.params.search = search;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
	this.loadData();
}

function openIt(code, brand) {
	this.action.code = code;
	this.action.active = true;
	this.action.open = true;

	if (code === 'EU') {
		if (brand.code) {
			this.action.title = 'Editar Marca';
			this.code = brand.code;
			this.brand = { ...brand };
			const urlImage =
				brand.dataImage && brand.dataImage.length
					? brand.dataImage[0].urlImage
					: null;
			this.urlImage = urlImage;
		}
	} else if (code === 'RU') {
		this.action.title = 'Crear Marca';
		this.brand = {
			code: null,
			name: null,
			slug: null,
			description: null,
			dataImage: [],
			flagActive: 1,
		};
	}
}

function getColorStatus(product) {
	if (this.isMibodega && this.idCommerce) {
		if (product.isPublic && !product.flagActive) {
			return 'warning';
		} else if (product.isPublic) {
			return 'success';
		}
		return 'error';
	}
	return product.flagActive ? 'success' : 'error';
}

function getTextStatus(product) {
	if (this.isMibodega && this.idCommerce) {
		if (product.isPublic && !product.flagActive) {
			return 'Inactivo en producto maestro';
		} else if (product.isPublic) {
			return 'Activo';
		}
		return 'Inactivo';
	}
	return product.flagActive ? 'Activo' : 'Inactivo';
}

function deleteImageUnit() {
	this.brand.dataImage.shift();
	this.urlImage = null;
}

function cleanFilter() {
	this.params = {};
	this.loadData();
}

function runAction(item) {
	this.action.active = true;
	this.action.code = item.code;
	this.action.open = true;
	this.action.title = item.name;
	this.action.width = 400;
}

async function confirAction() {
	const message = this.code ? 'actualizada' : 'creada';
	try {
		const url = this.code ? `cms-brands/${this.code}` : 'cms-brands';
		const method = this.code ? 'patch' : 'post';
		let body;
		if (this.action.code === 'EU') {
			body = {
				dataImage: this.brand.dataImage,
				description: this.brand.description,
				name: this.brand.name,
				slug: this.brand.slug,
				flagActive: Boolean(this.brand.flagActive),
			};
		} else if (this.action.code === 'RU') {
			body = {
				...this.brand,
				flagActive: Boolean(this.brand.flagActive),
			};
		}

		await this.$httpCMS[method](url, body);
		this.showNotification(`Marca ${message} exitosamente`);
		this.closeModal();
		this.loadData();
	} catch (error) {
		const messageExist = `brand ${this.brand.name} already exists`;
		if (messageExist.toLowerCase() === error.data.message.toLowerCase()) {
			this.showNotification('Esta marca ya existe', 'error');
		}
		if (error.status === 400) {
			if (error.data.message === 'BRAND_DUPLICATE_CODE') {
				this.showNotification('Codigo duplicado.', 'error');
			}
		} else {
			this.showGenericError();
		}
	}
}

function setData({ model, value }) {
	this.brand[model] = value;
}

function setParamsData({ model, value }) {
	if (value !== null) {
		this.params[model] = value;
	}
	this.loadData();
	// loadData();
}

function validations() {
	return {
		brand: {
			code: {
				maxLength: maxLength(3),
				required,
			},
			name: {
				required,
			},
		},
	};
}

function data() {
	return {
		action: {
			code: '',
			open: false,
			active: false,
			width: 400,
			title: '',
		},
		actionDefault: {
			code: '',
			open: false,
			active: false,
			width: 400,
			title: '',
		},
		columns: [
			{ id: 1, name: 'ID', value: 'id', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 3,
				name: 'Imagen',
				value: 'urlImage',
				visible: true,
				checked: true,
			},
			{ id: 4, name: 'Estados', value: 'type', visible: true, checked: true },
			{
				id: 5,
				name: 'Acciones',
				visible: true,
				checked: false,
				flagVisible: true,
			},
		],
		items: [
			{
				text: 'Categorías',
				disabled: false,
				href: 'new-page',
			},
			{
				text: 'Link 1',
				disabled: false,
				href: 'breadcrumbs_link_1',
			},
			{
				text: 'Link 2',
				disabled: true,
				href: 'breadcrumbs_link_2',
			},
		],
		currentPage: 1,
		code: null,
		lastPage: 0,
		brand: {
			id: null,
			code: null,
			name: null,
			slug: null,
			description: null,
			dataImage: [],
			flagActive: 1,
		},
		rows: [],
		urlImage: null,
		typesBrands: [
			{
				name: 'Activo',
				value: 1,
				id: 1,
			},
			{
				name: 'Inactivo',
				value: 0,
				id: 2,
			},
		],
		params: {
			type: null,
		},
	};
}
export default {
	name: 'brands',
	components: {
		actionSidebar,
		appActions,
		appInputText,
		appTable,
		headerPage,
		modalSidebarButton,
		VueSixFour,
		documentState,
	},
	data,
	mixins: [upLoadImageMixin],
	created,
	computed: {
		filteredUnits,
	},
	methods: {
		changePage,
		clearModal,
		closeModal,
		loadData,
		openIt,
		getTextStatus,
		getColorStatus,
		runAction,
		confirAction,
		setData,
		callServiceAndSearch,
		deleteImageUnit,
		setParamsData,
		cleanFilter,
		urlImageRow(dataImage) {
			return dataImage && dataImage.length ? dataImage[0].urlImage : null;
		},
	},
	validations,
	watch: {
		captureLocation(urlImage) {
			// Se añade al array, con order 0
			this.urlImage = urlImage;
			const img = {
				name: '25x25',
				order: 0,
				// type: 1,
				urlImage,
			};
			this.brand.dataImage.unshift(img);
			this.brand.dataImage.map((e, i) => ({ ...e, order: i }));
		},
	},
};
</script>
<style lang="scss" scoped>
.title-section {
	margin-top: 10px;
	color: color(sidebar);
	font-family: 'Opens_bold';
	font-size: 13px;
	letter-spacing: normal;
}
.product-image {
	border-radius: 4px;
	max-height: 90%;
	max-width: 90%;

	&-hover {
		align-content: center;
		background-color: rgba(0, 0, 0, 0.35);
		border-radius: 4px;
		bottom: 0px;
		color: color(white);
		display: none;
		flex-direction: row;
		flex-wrap: wrap;
		font-family: font(open-bold);
		font-size: size(small13);
		height: 100%;
		justify-content: center;
		left: 0px;
		margin: auto;
		max-height: 90%;
		max-width: 90%;
		position: absolute;
		right: 0px;
		top: 0px;
		width: 100%;
	}

	&-hover-delete {
		display: none;
		position: absolute;
		top: 13px;
		right: 10px;
	}
}

.product-image-container {
	align-items: center;
	background-color: rgba(156, 166, 176, 0.07);
	border: 1px dashed #9ca6b0;
	border-radius: 5px;
	color: rgba(156, 166, 176, 0.4);
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	font-family: font(open-bold);
	font-size: size(medium15);
	height: 206px;
	justify-content: center;
	max-width: 232px;
	position: relative;
	width: 100%;

	&:hover > .product-image-hover {
		display: flex;
	}

	&:hover > .product-image-hover-delete {
		display: block;
	}
}

.product-image-loading {
	color: color(black);
}

.textArea {
	padding: 5px;
	width: 100%;
	min-height: 100px;
	overflow: hidden;
	background-color: transparent;
	background-color: white;
	// border: 2px solid #797979;
	border: 1px solid rgb(255, 255, 255);
	border-radius: 3px;
	font-size: 0.9rem;
	// color: #000;
}

.textArea:focus {
	outline: none;
}
</style>
