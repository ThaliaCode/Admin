<template>
	<div class="warehouse">
		<header-page
			:title="this.$route.meta.title"
			to-show
			:showExcel="false"
			:showClean="false"
		>
			<v-btn class="error" @click="cleanFilter">
				Limpiar filtros
			</v-btn>
		</header-page>
		<app-actions
			@run-action="runAction"
			:resource-uri="$route.name"
			:value-disabled="actionsDisabled"
		/>
		<v-layout row wrap align-end my-3 px-5>
			<v-flex xs3 ml-2>
				<app-select
					:items="typesCategory"
					item-text="name"
					item-value="value"
					label="Tipo de categoría"
					model="flagMain"
					:return-object="false"
					@input="setParamsData"
				>
				</app-select>
			</v-flex>
		</v-layout>
		<v-layout>
			<v-flex xs12 mt-5>
				<app-table
					name="features"
					:selectable="true"
					:inputSearch="true"
					:filterColumns="true"
					:rows="rows"
					:columns="columns"
					:last-page="lastPage"
					:current-page="currentPage"
					:check-all="checkAll"
					:items-quantity="rows.length"
					:items-total-quantity="itemsTotalQuantity"
					@on-search-event="callServiceAndSearch"
					@on-page="changePage"
					@row-is-selected="rowIsSelected"
					@on-selected-all="selectedAll"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">{{ props.row.id }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 3)">
							{{ props.row.category ? props.row.category.name : '' }}
						</td>
						<td v-show="showRow(columns, 4)">{{ props.row.createdAt | formatDate }}</td>
						<td v-show="showRow(columns, 5)">{{ props.row.updatedAt | formatDate }}</td>
						<td v-show="showRow(columns, 6)">
							<button
								:disabled="props.row.flagGeneric"
								@click="openIt(props.row)"
								class="table-icon ml-1"
							>
								<v-icon color="primary">edit</v-icon>
							</button>
							<button @click="deleteCategory(props.row)" class="table-icon ml-1">
								<v-icon color="pink" size="19">
									highlight_off
								</v-icon>
							</button>
							<app-tooltip-button
								v-if="props.row.flagMain === 1"
								class="ml-1"
								icon="verified"
								text="Agregar Subcategorias"
								color="primary"
								size="14"
								@click-icon="
									runAction(
										{
											code: 'new-category',
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
			:width="action.width"
			v-model="action.open"
			:code-action="action.code"
			:title="action.title"
			:active="action.active"
			:img-src="action.imgSrc"
			:is-loading="loading"
			:help-actions="actionsToHelp"
			:header-color="action.color"
			@close-modal="closeModal"
		>
			<div v-if="action.code === 'new-category'">
				<v-layout row wrap justify-center class="px-4 mt-4">
					<v-flex xs12 pr-3 class="form-input--height">
						<label class="caption">
							Nombre
						</label>
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
						<label class="caption" v-if="category && category.id">
							Código: <br />
							{{ category.code }}
						</label>
						<v-flex v-else>
							<label class="caption">
								Código:
							</label>
							<v-text-field
								class="filter-select shadow-inset"
								label="Código"
								single-line
								required
								v-model="category.code"
								@keyup.enter="saveData"
							>
							</v-text-field>
							<span class="form-group__message" v-if="$v.category.code.$invalid">
								El código es requerido.
							</span>
						</v-flex>
					</v-flex>
				</v-layout>
				<v-layout row px-4 v-if="$userInfo.company.settings.flagShowAccountingEngine">
					<v-subheader class="px-0">Cuentas Contables</v-subheader>
				</v-layout>
				<v-layout
					v-if="$userInfo.company.settings.flagShowAccountingEngine"
					row
					justify-center
					px-4
				>
					<v-flex xs12>
						<v-layout>
							<v-flex xs5>
								<app-input-text
									label="Codigo de la cuenta"
									:text="accountingAccount[0] ? accountingAccount[0].code : ''"
									@input="
										setProductData({ model: 'accountingAccountCode', value: $event })
									"
								></app-input-text>
							</v-flex>
							<v-flex ml-2 xs4>
								<app-input-text
									label="Nombre"
									:text="accountingAccount[0] ? accountingAccount[0].name : ''"
									@input="
										setProductData({ model: 'accountingAccountName', value: $event })
									"
								></app-input-text>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex
								xs12
								v-if="
									accountingAccount[0] &&
										((accountingAccount[0].code && !accountingAccount[0].name) ||
											(!accountingAccount[0].code && accountingAccount[0].name))
								"
							>
								<span class="form-group__message">
									El código y nombre de la cuenta contable son obligatorios.
								</span>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-layout row px-4>
					<v-subheader class="px-0">Características</v-subheader>
				</v-layout>
				<v-layout row justify-center px-4>
					<v-flex xs12 pb-3 class="features-checks">
						<div
							class="check-config"
							v-for="(feature, indexFeature) in features"
							:key="indexFeature"
						>
							<v-checkbox
								class="char-value-select"
								color="primary"
								size="small"
								v-bind:label="feature.name"
								hide-details
								v-model="feature.active"
								@change="showFeatures(feature)"
							>
							</v-checkbox>
						</div>
					</v-flex>
				</v-layout>

				<v-layout justify-center>
					<v-flex xs11>
						<app-table
							xs12
							:columns="columnsFeatures"
							:filter-columns="false"
							:input-search="false"
							:is-draggable="true"
							name="features-selected"
							padding="px-0"
							:rows="rowsFeatures"
							:selectable="false"
							@on-drag-start="startDrag"
							@on-drag-over="overDrag"
							@on-drag-end="endDrag"
						>
							<template slot="rows" slot-scope="props">
								<td class="is-not-selectable" v-show="showRow(columnsFeatures, 1)">
									{{ props.row.position }}
								</td>
								<td v-show="showRow(columnsFeatures, 2)">{{ props.row.name }}</td>
								<td>
									<v-checkbox
										class="chk-all ml-5"
										color="primary"
										v-model="props.row.showInMobile"
									></v-checkbox>
								</td>
							</template>
						</app-table>
					</v-flex>
				</v-layout>
				<section class="modal-filter-footer">
					<modal-sidebar-button
						:is-loading="loading || $v.$invalid || validating"
						@accept-button-clicked="saveData"
						@cancel-button-clicked="closeModal"
					/>
				</section>
			</div>
			<price-list-categories
				v-if="action.code === 'price-list'"
				:price-lists="priceLists"
				:id="idEdit"
				:category="dataSelected[0]"
				@update="updateCategories"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import priceListCategories from '@/components/categories/price-list-categories';
import appActions from '@/components/shared/app-actions';
import appTooltipButton from '@/components/shared/app-tooltip-button';
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
	this.loadFeatures();
	this.mainCategoriesMaster();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const { data: rows, headers } = await this.$httpProducts.get('categories', {
			params: this.params,
		});
		this.rows = [...rows];
		this.lastPage = Number(headers['x-last-page']);
		this.itemsTotalQuantity = Number(headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

async function mainCategoriesMaster() {
	try {
		const { data: categories } = await this.$httpProducts.get('categories');
		this.typesCategoryMaster = categories.filter((category) => category.flagMain === 1);
	} catch (error) {
		this.showGenericError();
	}
}

async function loadFeatures() {
	try {
		({ data: this.features } = await this.$httpProducts.get('features'));
	} catch (error) {
		this.showGenericError();
	}
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

function showFeatures(feature) {
	if (feature.active) {
		this.rowsFeatures.push(feature);
	} else {
		const index = this.rowsFeatures.findIndex((f) => f.id === feature.id);
		if (index >= 0) {
			this.rowsFeatures.splice(index, 1);
		}
	}
	this.rowsFeatures = this.rowsFeatures.map((f, index) => {
		const newF = {};
		newF.position = index + 1;
		newF.name = f.name;
		newF.id = f.id;
		newF.filterable = true;
		newF.includeInCode = true;
		newF.showInMobile = f.showInMobile;
		return newF;
	});
}

function setProductData({ model, value }) {
	if (model === 'accountingAccountCode') {
		if (this.accountingAccount.length === 0) {
			this.accountingAccount.push({ code: value.value, name: '' });
		} else {
			this.$set(this.accountingAccount[0], 'code', value.value);
		}
	} else if (model === 'accountingAccountName') {
		if (this.accountingAccount.length === 0) {
			this.accountingAccount.push({ code: '', name: value.value });
		} else {
			this.$set(this.accountingAccount[0], 'name', value.value);
		}
	}
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
	this.action.code = 'new-category';
	this.features = this.features.map((f) => {
		const newF = { ...f };
		newF.active = false;
		newF.showInMobile = f.showInMobile;
		return newF;
	});
	this.action.title = category.id ? `Editar: ${category.name}` : 'Agrega una categoría';
	this.rowsFeatures = [];
	if (category.id) {
		this.category = { ...category };
		this.categoryId = category.flagMain ? null : category.categoryId;
		this.category.features.map((f, index) => {
			const indexF = this.features.findIndex((elem) => elem.id === f.id);
			if (indexF >= 0) {
				this.features[indexF].active = true;
				this.features[indexF].position = index + 1;
				this.features[indexF].showInMobile = f.showInMobile;
				this.rowsFeatures.push(this.features[indexF]);
			}
			return f;
		});
	} else {
		this.category = { ...this.default };
	}
	this.accountingAccount = category.accountingAccount || [];
	this.action.open = true;
}

async function saveData() {
	const nameExist =
		this.rows &&
		this.rows.find(
			(r) => this.formatText(r.name) === this.formatText(this.category.name)
		);
	if (nameExist && !this.category.id) {
		this.showGenericError('Ya existe una categoría con el nombre ingresado.');
	} else if (!this.category.name) {
		this.showNotification('Ingrese un nombre para la categoría.', 'warning');
	} else {
		const id = this.category.id;
		const url = id ? `categories/${id}` : 'categories';
		const method = id ? 'patch' : 'post';
		const formatterFeatures = this.rowsFeatures.map((f) => {
			const newF = {};
			newF.name = f.name;
			newF.id = f.id;
			newF.filterable = true;
			newF.includeInCode = true;
			newF.showInMobile = f.showInMobile;
			return newF;
		});
		const newcode =
			this.category && this.category.code ? this.category.code.replace(/ /g, '') : null;
		const bodyCategory = {
			categoryId: this.category.flagMain ? undefined : this.categoryId || undefined,
			name: this.category.name,
			code: newcode,
			flagActive: true,
			features: formatterFeatures,
			accountingAccount:
				this.accountingAccount[0] &&
				this.accountingAccount[0].code &&
				this.accountingAccount[0].name
					? this.accountingAccount
					: [],
		};
		const body = bodyCategory;
		if (this.category.name !== '') {
			try {
				await this.$httpProducts[method](url, body);
				this.showNotification('Transacción exitosa');
				this.action.open = false;
				this.category = {};
				this.rowsFeatures = [];
				this.loadData();
			} catch (error) {
				if (error.status === 400) {
					if (error.data.message === 'CODE_CATEGORY_DUPLICATE') {
						this.showNotification(error.data.messageError || 'Ya existe una categoría con el código ingresado.', 'error');
					} else {
						this.showGenericError();
					}
				}
			}
		} else {
			this.showNotification('Verifique la categoría ingresada', 'warning');
		}
		this.categoryId = null;
	}
}

function closeModal() {
	this.action.open = false;
	this.action.code = null;
	this.idEdit = null;
	this.action.title = '';
	this.rowsFeatures = [];
	this.category = {
		name: '',
		flagActive: false,
		features: [],
	};
	this.accountingAccount = [];
}

function validating() {
	const flagShowAccountingEngine = this.$userInfo.company.settings
		.flagShowAccountingEngine;
	const acc = this.accountingAccount[0];
	const hasCode = acc && !!acc.code;
	const hasName = acc && !!acc.name;
	const invalidAcc =
		flagShowAccountingEngine && ((hasCode && !hasName) || (!hasCode && hasName));
	return invalidAcc;
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

function runAction({ code, name }, row = {}) {
	this.categoryId = row && row.id ? row.id : null;
	this.action.code = code;
	this.action.open = true;
	this.action.title = name;
	if (code === 'new-category') {
		this.features = this.features.map((f) => {
			const newF = { ...f };
			newF.active = false;
			newF.showInMobile = f.showInMobile;
			return newF;
		});
	}
	if (code === 'price-list') {
		this.idEdit = this.dataSelected[0].id;
	}
}

function actionsDisabled() {
	const disabledSelected = this.dataSelected.length === 1;
	const disabledActions = [
		{ code: 'price-list', disabled: !disabledSelected },
		{ code: 'new-category', disabled: false },
	];
	return disabledActions;
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

function updateCategories() {
	this.closeModal();
	this.loadData();
	this.dataSelected = [];
}

function formatText(text) {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim();
}

function cleanFilter() {
	this.params = {};
	this.loadData();
}
function setParamsData({ model, value }) {
	if (value !== null) {
		this.params[model] = value;
	}
	this.loadData();
	// loadData();
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
			{ id: 1, name: 'ID', value: 'id', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 3,
				name: 'Categoria Rel.',
				tooltip: 'Categoria Relacionada',
				value: 'name',
				visible: false,
				checked: false,
			},
			{ id: 4, name: 'Creado', value: 'createdAt', visible: true, checked: true },
			{ id: 5, name: 'Actualizado', value: 'updatedAt', visible: true, checked: true },
			{ id: 6, name: 'Acciones', visible: true, checked: true, flagVisible: true },
		],
		columnsFeatures: [
			{ id: 1, name: 'Posición', value: 'position', visible: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true },
			{ id: 3, name: 'Ver en móvil', visible: true, flagVisible: true },
		],
		currentPage: 1,
		category: {
			code: null,
			name: '',
			flagActive: false,
			features: [],
		},
		default: {
			name: '',
			flagActive: false,
			features: [],
		},
		features: [],
		index: 0,
		lastPage: 0,
		loading: false,
		typesCategory: [
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
		typesCategoryMaster: [],
		params: {
			relationAdd: 'category',
			page: null,
			limit: 20,
			search: null,
		},
		rows: [],
		rowsFeatures: [],
		searchData: '',
		tabs: [{ id: 1, name: 'Categoría' }],
		priceLists: [],
		dataSelected: [],
		checkAll: false,
		idEdit: null,
		accountingAccount: [],
		itemsTotalQuantity: 0,
	};
}

export default {
	name: 'categories',
	components: {
		actionSidebar,
		appTable,
		appActions,
		appTooltipButton,
		headerPage,
		modalSidebarButton,
		priceListCategories,
	},
	created,
	computed: {
		actionsDisabled,
		validating,
	},
	data,
	methods: {
		cleanFilter,
		mainCategoriesMaster,
		setParamsData,
		callServiceAndSearch,
		deleteCategory,
		changePage,
		closeModal,
		endDrag,
		formatText,
		loadData,
		loadFeatures,
		openIt,
		overDrag,
		saveData,
		showFeatures,
		startDrag,
		runAction,
		rowIsSelected,
		selectedAll,
		updateCategories,
		setProductData,
	},
	validations,
};
</script>

<style lang="scss" scoped>
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
</style>
