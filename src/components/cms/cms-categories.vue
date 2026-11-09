<template>
	<div class="warehouse">
		<header-page
			:title="this.$route.meta.title"
			to-show
			:showExcel="false"
			:showClean="false"
		>
			<v-btn class="error" @click="cleanFilter"> Limpiar filtros </v-btn>
			<v-btn class="primary" @click="openIt()"> Crear categoria </v-btn>
			<v-btn class="primary" @click="$router.push('categories/all')">
				Lista de productos
			</v-btn>
		</header-page>
		<v-layout row wrap align-end my-3 px-5>
			<v-flex xs2 ml-2>
				<app-select
					:items="typesEstatus"
					item-text="name"
					item-value="id"
					label="Tipo de estado"
					model="flagActive"
					:return-object="false"
					@input="setParamsData"
				>
				</app-select>
			</v-flex>
			<v-flex xs2 ml-2>
				<app-select
					item-text="desc"
					item-value="id"
					label="Tipo:"
					:items="typesCategory"
					model="type"
					:return-object="false"
					@input="setParamsData"
				>
				</app-select>
			</v-flex>
			<v-flex xs2 ml-2>
				<app-select
					:items="typesSubCategory"
					item-text="name"
					item-value="value"
					label="Tipo de categoría"
					model="flagMain"
					:return-object="false"
					@input="setParamsData"
				>
				</app-select>
			</v-flex>
			<v-flex xs2 ml-2>
				<app-select
					:items="typesCategoryMaster"
					item-text="name"
					item-value="id"
					label="Tipo de categoría maestra"
					model="cmsCategoryId"
					:disabled="
						!!this.params.flagMain || this.params.flagMain === undefined
					"
					:return-object="false"
					:class="{
						'disabled-select':
							this.params.flagMain || this.params.flagMain === undefined,
					}"
					@input="setParamsData"
				>
				</app-select>
			</v-flex>
		</v-layout>
		<v-layout>
			<v-flex xs12 mt-5>
				<app-table
					name="features"
					:selectable="false"
					:inputSearch="true"
					:filterColumns="true"
					:rows="rows"
					:columns="columns"
					:last-page="lastPage"
					:current-page="currentPage"
					:check-all="checkAll"
					@on-search-event="callServiceAndSearch"
					@on-page="changePage"
					@row-is-selected="rowIsSelected"
					@on-selected-all="selectedAll"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">{{ props.row.code }}</td>
						<td v-show="showRow(columns, 2)">
							<!-- :to="`/cms/categories/${props.row.id}` :params="{idCategory: to.params.idCategory, codeCategory: to.params.codeCategory} -->
							<router-link
								:to="{
									name: 'cms-category-detail',
									params: { id: props.row.id, code: props.row.code },
								}"
							>
								{{ props.row.name }}
							</router-link>
						</td>
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
						<td v-show="showRow(columns, 4)">{{ props.row.slug }}</td>
						<td v-show="showRow(columns, 5)">
							{{ props.row.subCategories.length || 0 }}
						</td>
						<td v-show="showRow(columns, 6)">
							{{ props.row.totalProducts || 0 }}
						</td>
						<!-- <td v-show="showRow(columns, 7)">{{ props.row.state }}</td> -->
						<td v-show="showRow(columns, 7)">
							<document-state
								:color="getColorStatus(props.row)"
								icon="radio_button_checked"
								:tooltip="getTextStatus(props.row)"
							/>
						</td>
						<td v-show="showRow(columns, 8)">
							<button
								:disabled="props.row.flagGeneric"
								@click="openIt(props.row)"
								class="table-icon ml-1"
							>
								<v-icon color="primary">edit</v-icon>
							</button>
							<app-tooltip-button
								v-if="props.row.flagMain === 1"
								class="ml-1"
								icon="subdirectory_arrow_right"
								text="Agregar Subcategorias"
								color="primary"
								size="14"
								@click-icon="
									runAction(
										{
											code: 'new-category-secondary',
											name: `Asignar Subcategoria: ${props.row.name}`,
										},
										props.row
									)
								"
							/>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<action-sidebar
			v-model="action.open"
			:code-action="action.code"
			:title="action.title"
			:is-loading="loading"
			@close-modal="closeModal"
		>
			<div>
				<v-layout row wrap justify-center class="px-4 mt-4">
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
										@click.stop="deleteImageCategory"
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
					<v-flex xs12 pr-3 class="form-input--height">
						<label class="caption"> Nombre </label>
						<v-text-field
							class="filter-select shadow-inset"
							label="Nombre"
							single-line
							required
							v-model="category.name"
							@keyup.enter="saveData"
						>
						</v-text-field>
						<span class="form-group__message" v-if="$v.category.name.$invalid">
							El nombre es requerido.
						</span>
					</v-flex>
					<v-flex xs12 mt-3 pr-3 class="form-input--height">
						<!-- <label class="caption" v-if="category && category.id">
							Código: <br> {{ category.code }}
						</label> -->
						<v-flex>
							<label class="caption"> Código: </label>
							<v-text-field
								:disabled="action.code === 'edit'"
								:readonly:="action.code === 'edit'"
								class="filter-select shadow-inset"
								label="Código"
								single-line
								required
								v-model="category.code"
								@keyup.enter="saveData"
							>
							</v-text-field>
							<span
								class="form-group__message"
								v-if="$v.category.code.$invalid"
							>
								El código es requerido.
							</span>
						</v-flex>
					</v-flex>
					<v-flex xs12 mt-3 pr-3 class="form-input--height">
						<label class="caption"> Slug: </label>
						<v-text-field
							class="filter-select shadow-inset"
							label="slug"
							single-line
							required
							v-model="category.slug"
							@keyup.enter="saveData"
						>
						</v-text-field>
					</v-flex>
					<v-flex xs12 mt-3 pr-3 class="form-input--height">
						<label class="caption"> Tipo: </label>
						<app-select
							model="type"
							item-text="desc"
							item-value="id"
							required
							class=""
							return-object
							:items="typesCategory"
							:item="category.type"
							@input="setCategory"
						/>
					</v-flex>
					<v-flex xs12 mt-3 pr-3 class="form-input--height">
						<app-input-text
							label="Orden:"
							model="order"
							:min="1"
							:text="category.order"
							placeholder="1"
							type="number"
							@input="setCategory"
						/>
					</v-flex>
					<v-flex xs12 mb2 class="title-section">
						<span>CONFIGURACIÓN</span>
					</v-flex>
					<v-flex xs12 mt-2>
						<v-switch
							class="body-1"
							color="success"
							label="Activar o desactivar categoria"
							v-model="category.flagActive"
						></v-switch>
					</v-flex>
				</v-layout>
				<section class="modal-filter-footer">
					<modal-sidebar-button
						:is-loading="$v.category.name.$invalid && $v.category.code.$invalid"
						@accept-button-clicked="saveData"
						@cancel-button-clicked="closeModal"
					/>
				</section>
			</div>
		</action-sidebar>
	</div>
</template>

<script>
import VueSixFour from 'vue-six-four';
import upLoadImageMixin from '@/mixins/upLoadImage';
import appTooltipButton from '@/components/shared/app-tooltip-button';
import documentState from '@/components/shared/document-state';
import { required } from 'vuelidate/lib/validators';
import headerPage from './../shared/header-page';
import appTable from './../shared/table/app-table';
import actionSidebar from './../shared/action-sidebar';
import modalSidebarButton from './../shared/utils/modal-sidebar-button';

async function deleteCategory(row) {
	try {
		await this.$httpProducts.delete(`categories/${row.id}`);
		this.showNotification('La categoría ha sido eliminada correctamente.');
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'CATEGORY_RELATED') {
				this.showNotification(
					'La categoría no puede ser eliminada, tiene productos asociados.',
					'error'
				);
			} else {
				this.showNotification('No se puede eliminar la categoria.', 'error');
			}
		}
	} finally {
		this.closeDialog();
	}
}

function created() {
	this.loadData();
	this.mainCategoriesMaster();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const params = { ...this.params };
		const { data: rows, headers } = await this.$httpCMS.get('cms-categories', {
			params,
		});
		this.rows = rows.map((cat) => ({ ...cat, dataImage: cat.dataImage || [] }));
		this.lastPage = Number(headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function runAction({ code, name }, row = {}) {
	if (code === 'new-category-secondary') {
		this.cmsCategoryId = row.id;
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
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

function callServiceAndSearch(search) {
	this.searchData = search;
	if (search) {
		this.params.search = search;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
	this.loadData();
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function startDrag(event) {
	if (this.canDrag) {
		const index = event.target.dataset.index;
		this.itemToDrag = this.rowsFeatures[index];
		if (this.itemToDrag !== undefined) {
			this.rowsFeatures.splice(index, 1);
		}
		this.canDrag = false;
	}
}

function overDrag(event) {
	if (!this.canDrag) {
		this.index = event.target.parentElement.dataset.index;
	}
}

function endDrag() {
	if (this.itemToDrag !== undefined) {
		this.rowsFeatures.splice(this.index, 0, this.itemToDrag);
		this.rowsFeatures = this.rowsFeatures.map((f, indexF) => {
			const newF = { ...f };
			newF.position = indexF + 1;
			return newF;
		});
	}
	this.canDrag = true;
}

function openIt(category) {
	this.action.code = category ? 'edit' : 'create';

	if (this.action.code === 'edit') {
		this.action.title = `Editar: ${category.name}`;
		this.category = { ...category };
		const urlImage =
			category.dataImage && category.dataImage.length
				? category.dataImage[0].urlImage
				: null;
		this.urlImage = urlImage;
	} else if (this.action.code === 'create') {
		this.action.title = 'Crear categoria';
		this.category = { ...this.templateCategory };
	}
	this.action.open = true;
}

function deleteImageCategory() {
	this.category.dataImage.shift();
	this.urlImage = null;
}

async function saveData() {
	const nameExist =
		this.rows &&
		this.rows.find(
			(r) => this.formatText(r.name) === this.formatText(this.category.name)
		);
	if (nameExist && !this.category.id) {
		this.showGenericError('Ya existe una categoría con el nombre ingresado.');
		return;
	}
	if (!this.category.name) {
		this.showNotification('Ingrese un nombre para la categoría.', 'warning');
		return;
	}
	const id = this.category.id;
	const code = this.category.code;
	const url = id ? `cms-categories/${code}` : 'cms-categories';
	const method = id ? 'patch' : 'post';
	const body = {
		name: this.category.name,
		flagActive: Boolean(this.category.flagActive),
		slug: this.category.slug,
		dataImage: this.category.dataImage,
		type: this.category.type || 1,
		order: Number(this.category.order) || undefined,
	};
	if (method === 'post') {
		body.code = this.category.code;
		body.cmsCategoryId = this.category.id || null;
	}
	if (this.action.code === 'new-category-secondary') {
		body.cmsCategoryId = this.cmsCategoryId || null;
	}
	try {
		await this.$httpCMS[method](url, body);
		this.showNotification('Categeoría guardada exitosamente');
		this.reset(true);
	} catch (error) {
		this.showNotification('Verifique la categoría ingresada', 'warning');
	}
}

function closeModal() {
	this.reset();
}

function reset(ld) {
	this.action.open = false;
	this.action.code = 'create';
	this.params = {
		page: 1,
		search: null,
	};
	this.category = { ...this.templateCategory };
	this.urlImage = null;
	if (ld) {
		this.loadData();
	}
}

function setParamsData({ model, value }) {
	if (model === 'flagMain') {
		this.params.cmsCategoryId = null;
	}
	if (value !== null) {
		this.params[model] = value;
	}
	this.loadData();
	// loadData();
}

function validations() {
	return {
		category: {
			name: {
				required,
			},
			code: {
				required,
			},
		},
	};
}

function setCategory({ model, value }) {
	this.category[model] = value.id || value;
}

function rowIsSelected(row) {
	({
		products: this.rows,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selectedRows(row, this.rows, this.dataSelected));
}

function selectedAll(value) {
	({
		products: this.rows,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.rows, this.dataSelected));
}

function formatText(text) {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim();
}

async function mainCategoriesMaster() {
	try {
		const { data: categories } = await this.$httpCMS.get('cms-categories', {
			params: { flagMain: 1 },
		});
		this.typesCategoryMaster = categories;
	} catch (error) {
		this.showGenericError();
	}
}

function cleanFilter() {
	this.params = {};
	this.loadData();
}

function data() {
	return {
		action: {
			active: false,
			open: false,
			title: '',
			width: 450,
		},
		active: '0',
		canDrag: true,
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 3,
				name: 'Imagen',
				value: 'dataImage',
				visible: true,
				checked: true,
			},
			{ id: 4, name: 'Slug', value: 'slug', visible: true, checked: true },
			{
				id: 5,
				name: 'Subcategoría',
				value: 'subCategories',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: '#Productos',
				value: 'totalProducts',
				visible: true,
				checked: true,
			},
			{ id: 7, name: 'Estado', value: 'state', visible: true, checked: true },
			{
				id: 8,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		category: {},
		templateCategory: {
			code: null,
			name: null,
			slug: null,
			description: null,
			tags: null,
			dataImage: [],
			flagActive: true,
			type: 1, // Type puede ser 1 o 2
			order: null,
		},
		typesEstatus: [
			{
				name: 'Activo',
				id: 1,
			},
			{
				name: 'Inactivo',
				id: 0,
			},
		],
		typesSubCategory: [
			{
				name: 'Categoría Padre',
				value: 1,
				id: 1,
			},
			{
				name: 'Categoría Hija',
				value: 0,
				id: 2,
			},
		],
		typesCategory: [
			{
				id: 1,
				desc: 'A código',
			},
			{
				id: 2,
				desc: 'A granel',
			},
		],
		typesCategoryMaster: [],
		urlImage: null,
		index: 0,
		lastPage: 0,
		loading: false,
		params: {
			page: null,
			search: null,
		},
		rows: [],
		searchData: '',
		tabs: [{ id: 1, name: 'Categoría' }],
		dataSelected: [],
		checkAll: false,
		idEdit: null,
	};
}

export default {
	name: 'categories',
	components: {
		actionSidebar,
		appTable,
		appTooltipButton,
		headerPage,
		modalSidebarButton,
		VueSixFour,
		documentState,
	},
	created,
	computed: {},
	data,
	mixins: [upLoadImageMixin],
	methods: {
		mainCategoriesMaster,
		cleanFilter,
		setParamsData,
		callServiceAndSearch,
		deleteCategory,
		changePage,
		closeModal,
		endDrag,
		formatText,
		loadData,
		openIt,
		overDrag,
		saveData,
		startDrag,
		rowIsSelected,
		selectedAll,
		reset,
		runAction,
		getTextStatus,
		getColorStatus,
		deleteImageCategory,
		setCategory,
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

			this.category.dataImage.unshift(img);
			this.category.dataImage.map((e, i) => ({ ...e, order: i }));
		},
	},
};
</script>

<style lang="scss" scoped>
.disabled-select {
	pointer-events: none;
	opacity: 0.5;
}
.title-section {
	margin-top: 10px;
	color: color(sidebar);
	font-family: 'Opens_bold';
	font-size: 13px;
	letter-spacing: normal;
}
.fonts {
	@include txt-config(lato-bold, medium);
}
.form-input--height {
	height: 60px;
}
.features-checks {
	display: flex;
	flex-wrap: wrap;
}
.check-config {
	width: 180px;
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
</style>
