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
			<v-btn class="primary" @click="openIt('RU')"> Crear unidad </v-btn>
		</header-page>
		<v-layout row wrap align-end my-3 px-5>
			<v-flex xs3 ml-2>
				<app-select
					:items="typesUnits"
					item-text="name"
					item-value="id"
					label="Tipo de unidad"
					model="type"
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
						<td v-show="showRow(columns, 4)">
							{{ props.row.type === 1 ? 'Fundamental' : 'Funcional' }}
						</td>
						<td v-show="showRow(columns, 5)">
							{{
								props.row.conversions && Array.isArray(props.row.conversions)
									? props.row.conversions.length
									: 0
							}}
						</td>
						<td v-show="showRow(columns, 6)">
							<button @click="openIt('CC', props.row)" class="table-icon ml-1">
								<v-icon color="primary">copyright</v-icon>
							</button>
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
						:text="unit.code"
						@input="setData"
					/>
					<span class="form-group__message" v-if="!$v.unit.code.required">
						El código de la unidad es requerido
					</span>
					<!-- <span class="form-group__message" v-if="!$v.unit.code.maxLength">
							Máximo 3 caracteres
						</span> -->
					<span class="form-group__message" v-if="checkBlankCode(unit.code)">
						No se permite espacios en blanco
					</span>
				</v-flex>
				<v-flex xs12 mt-1>
					<app-input-text
						label="Nombre"
						model="name"
						:text="unit.name"
						@input="setData"
					/>
					<span class="form-group__message" v-if="!$v.unit.name.required">
						El nombre de la unidad es requerido
					</span>
				</v-flex>

				<v-flex xs12 mt-1>
					<label class="grey--text"> Descripción </label>
					<textarea class="textArea" v-model="unit.description"></textarea>
				</v-flex>

				<!-- <v-flex xs12 px-2>
						<app-input-text
							label="Color"
							model="color"
							:text="unit.color"
							type="color"
							@input="setData"
						/>
					</v-flex> -->
				<v-flex xs12 mt-3>
					<app-select
						:item="unit.type"
						:items="typesUnits"
						item-text="name"
						item-value="id"
						label="Tipo:"
						model="type"
						:return-object="false"
						@input="setData"
					>
					</app-select>
				</v-flex>
				<v-flex xs12 mt-3>
					<app-input-text
						label="Orden:"
						model="order"
						placeholder="1"
						:min="1"
						type="number"
						@input="setData"
					/>
				</v-flex>
				<v-flex xs12 mt-3>
					<label class="grey--text"> Activo: </label>
					<v-switch
						color="success"
						hide-details
						v-model="unit.flagActive"
					></v-switch>
				</v-flex>
				<v-flex xs12 mt-3 mb-5 v-if="unit.type === 1">
					<autocomplete-component
						chips
						:items="unitsValidates"
						label-value="Tags"
						multiple
						item-text="name"
						item-value="code"
						:item="this.unit.tags || tagsCode"
						:return-object="false"
						@return-data="setDataMultiple($event, 'tagsCode')"
					></autocomplete-component>
				</v-flex>
				<v-flex>
					<section class="modal-filter-footer">
						<!-- {{ $v.unit.$invalid }} o {{ checkBlankCode(unit.code) }} -->
						<modal-sidebar-button
							:is-loading="checkBlankCode(unit.code)"
							@cancel-button-clicked="closeModal"
							@accept-button-clicked="confirAction"
						/>
					</section>
				</v-flex>
			</v-layout>
			<!-- SIDEBAR CONVERSIONES -->
			<v-layout row wrap class="pa-4" v-if="action.code === 'CC'">
				<v-flex xs12 mb2 class="title-section">
					<span>CONVERSIONES</span>
				</v-flex>
				<v-flex xs6 pr-2 mb-3>
					<v-btn
						class="primary px-2 py-1 mt-1"
						small
						type="button"
						@click="addRow('conversions')"
					>
						<span>Agregar conversiones</span>
						<v-icon class="ml-2 product-add-btn-icon" color="" size="17">
							add_circle
						</v-icon>
					</v-btn>
				</v-flex>
				<v-flex
					xs12
					mb-2
					pb-1
					class="conversions-container"
					text-xs-center
					v-for="(conversion, indexConversion) in conversionsUnits"
					:key="indexConversion"
				>
					<v-layout align-center>
						<v-flex xs11>
							<cms-unit-conversion
								class="unit-conversion"
								:units="filteredUnits"
								:conversion="conversion"
								:selected-unit="unit"
								only-conversion
								@set-conversion="setConversion($event, indexConversion)"
							/>
						</v-flex>
						<v-flex xs1 align-center>
							<app-tooltip-button
								color="pink"
								height="30"
								icon="delete"
								text="Eliminar conversión"
								@click-icon="removeConversion(conversion, indexConversion)"
							></app-tooltip-button>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex>
					<section class="modal-filter-footer">
						<modal-sidebar-button
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
import cmsUnitConversion from './cms-unit-conversion';

function created() {
	this.loadData();
	this.loadUnits();
}

async function loadData() {
	try {
		const params = this.params;
		const { data: rows } = await this.$httpCMS.get('cms-units', { params });
		this.rows = rows.map((unit) => ({
			...unit,
			dataImage: unit.dataImage || [],
		}));
	} catch (error) {
		console.log(error);
		this.showGenericError();
	}
}

function filteredUnits() {
	return this.rows;
}

function clearModal() {
	this.code = null;
	this.urlImage = null;
	this.conversionsUnits = [];
	this.unit = {
		id: null,
		code: null,
		name: null,
		slug: null,
		description: null,
		tags: [],
		type: 1,
		dataImage: [],
		flagActive: false,
		conversions: [],
		order: null,
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
	this.searchData = search;
	if (search) {
		this.search = search;
	} else {
		this.search = null;
	}
	this.currentPage = 1;
	this.loadData();
}

function openIt(code, unit) {
	console.log({ unit });
	this.action.code = code;
	this.action.active = true;
	this.action.open = true;

	if (code === 'EU') {
		if (unit.code) {
			this.action.title = 'Editar Unidad';
			this.code = unit.code;
			this.unit = { ...unit };
			const urlImage =
				unit.dataImage && unit.dataImage.length
					? unit.dataImage[0].urlImage
					: null;
			this.urlImage = urlImage;
		}
	} else if (code === 'RU') {
		this.action.title = 'Crear Unidad';
		this.unit = { ...unit };
	} else if (code === 'CC') {
		this.action.title = unit.name;
		this.unit = { ...unit };
		this.code = unit.code;
		this.conversionsUnits = unit.conversions ? [...unit.conversions] : [];
	}
}

function deleteImageUnit() {
	this.unit.dataImage.shift();
	this.urlImage = null;
}

function addRow(code) {
	// this.loadingAddAccount = code === 'accounting-accounts';
	// this.loadingAddConversion = code === 'conversions';
	// this.loadingAddVariations = code === 'variations';
	if (code === 'conversions') {
		// const unitCode = this.unit.code || null;
		this.conversionsUnits.push({
			name: '',
			quantity: 1,
			quantityTo: 1,
			code: null,
			// unitCode,
			// cost: 0,
			// barcode: null,
		});
		// this.loadingAddConversion = false;
	}
}

function setConversion(conversion, index) {
	const newConversion = { ...conversion };
	this.$set(this.conversionsUnits, index, newConversion);
}

function removeConversion(conver, converIndex) {
	if (conver.id) {
		this.conversionsUnits = this.conversionsUnits.filter(
			(c) => c.id !== conver.id
		);
		// this.removeUnitFromPriceList(conver);
	} else {
		this.conversionsUnits.splice(converIndex, 1);
	}
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
	const typeValidate = this.unit.type === 1;
	try {
		const url = this.code ? `cms-units/${this.code}` : 'cms-units';
		const method = this.code ? 'patch' : 'post';
		let body;
		if (this.action.code === 'EU') {
			body = {
				dataImage: this.unit.dataImage,
				description: this.unit.description,
				name: this.unit.name,
				type: this.unit.type,
				flagActive: Boolean(this.unit.flagActive),
				tags: typeValidate ? this.tagsCode : [],
				order: Number(this.unit.order) || undefined,
			};
			if (body.conversions && !body.conversions.length) delete body.conversions;
		} else if (this.action.code === 'RU') {
			body = {
				...this.unit,
			};
		} else if (this.action.code === 'CC') {
			body = {
				name: this.unit.name,
				conversions: [...this.conversionsUnits],
			};
			if (!body.conversions.length) {
				delete body.conversions;
			}
			// delete body.flagDefault;
		}

		await this.$httpCMS[method](url, body);
		this.showNotification(`Unidad ${message} exitosamente`);
		this.closeModal();
		this.loadData();
	} catch (error) {
		console.log(error);
		const messageExist = `Unit ${this.unit.name} already exists`;
		if (
			error.data &&
			messageExist.toLowerCase() === error.data.message.toLowerCase()
		) {
			this.showNotification('Esta unidad ya existe', 'error');
		}
		if (error.status === 400) {
			if (error.data.message === 'UNIT_DUPLICATE_CODE') {
				this.showNotification('Codigo duplicado.', 'error');
			}
		} else {
			this.showGenericError();
		}
	}
}

function setDataMultiple(value, model) {
	this[model] = value;
}

function setData({ model, value }) {
	this.unit[model] = value;
	console.log(this.unit);
}

function setParamsData({ model, value }) {
	if (value) {
		this.params[model] = value;
	}
	this.loadData();
	// loadData();
}

function validations() {
	return {
		unit: {
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
			{
				id: 4,
				name: 'Tipo de unidad',
				value: 'type',
				visible: true,
				checked: true,
			},
			{ id: 5, name: 'Conversión', value: '', visible: true, checked: true },
			{
				id: 6,
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
		tagsCode: [],
		unit: {
			id: null,
			code: null,
			name: null,
			slug: null,
			description: null,
			tags: [],
			type: 2,
			dataImage: [],
			flagActive: false,
			conversions: [],
			order: null,
		},
		rows: [],
		rowsUnit: [],
		conversionsUnits: [],
		urlImage: null,
		typesUnits: [
			{
				name: 'Unidad fundamental',
				id: 1,
			},
			{
				name: 'Unidad funcional',
				id: 2,
			},
		],
		params: {
			type: null,
		},
	};
}
export default {
	name: 'units',
	components: {
		actionSidebar,
		appActions,
		appInputText,
		appTable,
		headerPage,
		modalSidebarButton,
		cmsUnitConversion,
		VueSixFour,
	},
	data,
	mixins: [upLoadImageMixin],
	created,
	computed: {
		filteredUnits,
		unitsValidates() {
			const filteredRows = this.rowsUnit.filter((row) => row.type === 2);
			return filteredRows || [];
		},
	},
	methods: {
		async loadUnits() {
			const { data: rowsUnit } = await this.$httpCMS.get('cms-units');
			this.rowsUnit = rowsUnit;
		},
		changePage,
		clearModal,
		closeModal,
		loadData,
		openIt,
		runAction,
		confirAction,
		setData,
		setDataMultiple,
		callServiceAndSearch,
		addRow,
		setConversion,
		removeConversion,
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
			this.unit.dataImage.unshift(img);
			this.unit.dataImage.map((e, i) => ({ ...e, order: i }));
		},
	},
};
</script>

<style lang="scss" scoped>
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
