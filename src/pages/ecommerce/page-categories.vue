<template>
	<div>
		<header-page 
			name="categories-ecommerce"
			:title="title"
		/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<div class="overflow-auto mt-5">
			<app-table
				name="categories-ecommerce"
				class="is-not-selectable"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="data"
				@on-page="onPage"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">{{getOrder(props.row)}}</td>
					<td v-show="showRow(columns, 2)" class="is-not-selectable">
						<img 
							v-if="props.row.mobileImage"
							:src="props.row.mobileImage"
							:alt="props.row.title"
							height="45"
						/>
					</td>
					<td v-show="showRow(columns, 3)">
						<img 
							v-if="props.row.webImage"
							:src="props.row.webImage"
							:alt="props.row.title" 
							height="45"
						/>
					</td>
					<td v-show="showRow(columns, 4)">{{props.row.title}}</td>
					<td v-show="showRow(columns, 5)">{{props.row.description}}</td>
					<td v-show="showRow(columns, 6)">
						<img
							v-if="props.row.urlImage"
							:src="props.row.urlImage" 
							:alt="props.row.title"
							width="51"
						>
					</td>
					<td v-show="showRow(columns, 7)">{{props.row.relationalName}}</td>
					<td v-show="showRow(columns, 8)">
						{{ props.row.rangeDates }}
					</td>
					<td
						v-show="showRow(columns, 9)"
						class="action-td text-xs-center"
						@click.stop="stopClick"
					>
						<v-tooltip top>
							<v-switch
								slot="activator"
								class="switch-inline"
								color="success"
								hide-details
								@change="changeFlagHome($event, props.row.id)"
								v-model="props.row.flagHome"
							></v-switch>
							<span>{{ stateName(props.row, 'flagHome') }}</span>
						</v-tooltip>
						<p class="caption ma-0">{{ stateName(props.row, 'flagHome') }}</p>
					</td>
					<td
						class="action-td"
						v-show="showRow(columns, 10)"
						@click.stop="stopClick"
					>
						<v-tooltip top>
							<v-switch
								slot="activator"
								class="switch-inline"
								color="success"
								hide-details
								@change="flagCategory($event, props.row.id)"
								v-model="props.row.virtualActive"
							></v-switch>
							<span>{{ stateName(props.row, 'virtualActive') }}</span>
						</v-tooltip>
						<app-tooltip-button
							color="success"
							icon="edit"
							text="Editar"
							@click-icon="edit(props.row)"
						/>
						<app-tooltip-button
							color="error"
							icon="delete"
							text="Eliminar"
							@click-icon="runAction(
								{ code: 'delete', name: 'Eliminar Categoría' },
								props.row,
							)"
						/>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			:title="action.title"
			:width="action.width"
			:value="action.open"
			@close-modal="cancelModal">
			<create-category
				v-if="isActionCode('create-category', 'edit')"
				:commerce-id="id"
				:id="categoryId"
				:loading="loading"
				@save="createCategories"
				@close="cancelModal" 
			/>
			<delete-category-form
				v-if="isActionCode('delete')"
				:name="categoryName"
				@on-close="cancelModal"
				@on-delete="deleteCategoty"
			/>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="390">
			<v-card>
				<v-card-title class="subheading">{{ dialogMessage }}</v-card-title>
				<v-card-actions class="justify-center">
					<v-btn
						class="btn-action"
						color="info"
						dark
						@click.native="closeDialog"
					>
						Cancelar
					</v-btn>
					<v-btn
						class="btn-action"
						color="error"
						dark
						@click.native="deleteCategory"
					>
						Eliminar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import createCategory from '@/components/ecommerce/create-category';
import deleteCategoryForm from '@/components/ecommerce/delete-category-form';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import lib from '@/shared/lib';

const { exactDate } = helper;
const { getDeeper } = lib;

function created() {
	this.showCategories();
}

function cancelModal() {
	this.action.open = false;
	this.action.code = '';
	this.action.title = '';
	this.categoryId = null;
	this.categoryName = null;
	this.editCategories = {};
}

async function changeFlagHome($event, id) {
	const body = {
		flagHome: $event,
	};
	try {
		await this.$httpProducts.patch(`e-categories/${id}`, { ...body });
		this.showNotification('El valor ha sido actualizado correctamente.');
		this.showCategories();
	} catch (error) {
		this.showGenericError();
	} finally {
		this.closeDialog();
	}
}

function closeDialog() {
	this.dialog = false;
	this.categoryId = 0;
	this.dialogMessage = '';
}

async function flagCategory($event, id) {
	const body = {
		flagActive: $event,
	};
	try {
		await this.$httpProducts.patch(`/e-categories/${id}/active`, { ...body });
		this.showNotification('El estado ha sido actualizado correctamente.');
		this.showCategories();
	} catch (error) {
		this.showGenericError();
	} finally {
		this.closeDialog();
	}
}

async function createCategories(model) {
	this.loading = true;
	const body = {
		commerceId: Number(this.$route.params.id),
		categoryId: model.categoryId,
		description: model.description,
		endDate: model.endDate,
		flagAutomatic: !!model.flagAutomatic,
		mobileImage: model.mobileImage,
		order: model.order,
		slug: model.slug,
		startDate: model.startDate,
		title: model.title,
		urlImage: model.urlImage,
		webImage: model.webImage,
	};
	const method = this.categoryId ? 'patch' : 'post';
	const url = this.categoryId ? `e-categories/${model.id}` : 'e-categories';
	const message = this.categoryId ? 'editada' : 'creada';
	try {
		await this.$httpProducts[method](url, body);
		this.showNotification(`La categoría ha sido ${message} correctamente.`);
		this.cancelModal();
		this.showCategories();
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

async function deleteCategoty() {
	try {
		await this.$httpProducts.delete(`/e-categories/${this.categoryId}`);
		this.showNotification('La categoría ha sido eliminada exitosamente');
		this.cancelModal();
		this.showCategories();
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		}
	}
}

function edit({ id }) {
	this.categoryId = id;
	this.action.code = 'edit';
	this.action.title = 'Editar Categoría';
	this.action.width = 450;
	this.action.open = true;
}

function isActionCode(code, anotherCode) {
	return this.action.code === code || this.action.code === anotherCode;
}

function onPage(page) {
	this.showCategories(page);
}

function onSearch(value) {
	this.params.search = value ? value.trim() : null;
	this.showCategories();
}

function runAction({ code, name }, row) {
	this.action.code = code;
	this.action.open = true;
	this.action.title = name;
	this.action.width = 500;
	if (row) {
		this.categoryId = row.id;
		this.categoryName = row.title;
	}
}

async function showCategories(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	if (this.id) {
		this.params.commerceId = this.id;
	}
	try {
		const { data: response, headers } = await this.$httpProducts.get(
			'e-categories', { params: this.params });
		this.data = response.map((row) => {
			const newRow = { ...row };
			const startDate = exactDate(row.startDate, 'DD/MM/YYYY') || row.startDate;
			const endDate = exactDate(row.endDate, 'DD/MM/YYYY') || row.endDate;
			newRow.rangeDates = row.flagAutomatic ? `${startDate} - ${endDate}` : '-';
			return newRow;
		});
		this.lastPage = Number(headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function stateName(row, prop) {
	const switchSuccessText = prop === 'virtualActive' ? 'Activo' : 'Mostrar';
	const switchErrorText = prop === 'virtualActive' ? 'Inactivo' : 'No Mostrar';
	return row[prop] ? switchSuccessText : switchErrorText;
}

function getOrder(row) {
	return getDeeper('order')(row);
}

function title() {
	if (this.$route.query.name) {
		return `${this.$route.meta.title} - ${this.$route.query.name}`;
	}
	return this.$route.meta.title;
}

function data() {
	return {
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 500,
		},
		categoryId: null,
		commerceId: null,
		categoryName: null,
		columns: [
			{
				id: 1,
				name: 'Orden',
				value: 'order',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Icono (App)',
				value: 'mobile-image',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Icono (Web)',
				value: 'web-image',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Título',
				value: 'title',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Descripción',
				value: 'description',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Imagen',
				value: 'url-image',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Categoría',
				value: 'category',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Activ. Auto.',
				tooltip: 'Activación Automática',
				value: 'flagAutomatic',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Home',
				value: 'flagHome',
				visible: false,
				checked: true,
			},
			{
				id: 10,
				name: 'Acciones',
				value: 'actions',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		commerceName: '',
		currentPage: 1,
		data: [],
		dialog: false,
		dialogMessage: '',
		lastPage: 0,
		loading: false,
		params: {
			limit: 20,
			page: 1,
		},
	};
}
export default {
	name: 'categories',
	data,
	created,
	components: {
		actionSidebar,
		appActions,
		appTable,
		createCategory,
		deleteCategoryForm,
		headerPage,
	},
	computed: {
		title,
	},
	methods: {
		cancelModal,
		changeFlagHome,
		closeDialog,
		createCategories,
		deleteCategoty,
		edit,
		flagCategory,
		getOrder,
		isActionCode,
		onPage,
		onSearch,
		runAction,
		showCategories,
		stateName,
	},
	props: {
		id: [Number, String],
	},
};
</script>

