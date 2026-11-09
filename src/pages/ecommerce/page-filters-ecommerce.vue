<template>
    <div>
		<header-page title="Filtros"></header-page>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<div class="mt-5">
			<app-table
				:columns="columns"
				:rows="rows"
				class="is-not-selectable"
				:current-page="currentPage"
				:last-page="lastPage"
				@on-page="changePage"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{props.row.order}}</td>
					<td v-show="showRow(columns, 2)">
						<img
							v-if="props.row.urlImage"
							:src="props.row.urlImage" 
							:alt="props.row.title"
							height="20"	
						>
					<td v-show="showRow(columns, 3)">{{props.row.title}}</td>
					<td v-show="showRow(columns, 4)">{{props.row.description}}</td>
					<td v-show="showRow(columns, 5)" class="td-link">{{props.row.link}}</td>
					<td
						class="td-action"
						v-show="showRow(columns, 6)"
						@click.stop="stopClick"
					>
						<v-tooltip top>
							<v-switch
								slot="activator"
								class="switch-inline"
								hide-details
								color="success"
								v-model="props.row.virtualActive"
								@change="changeActive(props.row.id, $event)"
							></v-switch>
							<span>{{ stateName(props.row) }}</span>
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
								{ code: 'delete', name: 'Eliminar Filtro' },
								props.row,
							)"
						/>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="closeModal"	
		>
			<create-filters
				v-if="isActionCode('filters-ecommerce')"
				@close="closeModal"
				@send="createFilter"
				:filter-id="editFilterId"
			></create-filters>
			<delete-filters-form
				v-if="isActionCode('delete')"
				:name="filterName"
				@on-close="closeModal"
				@on-delete="deleteFilters"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import createFilters from '@/components/ecommerce/create-filters';
import deleteFiltersForm from '@/components/ecommerce/delete-filters-form';

function closeModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
	this.editFilterId = null;
}

function runAction({ code, name }, row) {
	this.action.code = code;
	this.action.open = true;
	this.action.title = name;
	this.action.width = 450;
	if (row) {
		this.idFilter = row.id;
		this.filterName = row.title;
	}
}

async function createFilter(model, flagEdit) {
	const body = {
		description: model.description,
		flagAutomatic: !!(model.flagAutomatic),
		endDate: model.endDate,
		link: model.link,
		title: model.title,
		urlImage: model.urlImage,
		startDate: model.startDate,
		order: model.order,
	};
	const method = flagEdit ? 'patch' : 'post';
	const url = flagEdit ? `filters/${model.id}` : 'filters';
	const message = flagEdit ? 'El filtro se actualizó correctamente' : 'El filtro se creó correctamente';
	try {
		await this.$httpProducts[method](url, body);
		this.showNotification(message);
		this.closeModal();
		this.loadFilters();
	} catch (error) {
		if (error.data.message === 'FILTER_DATES_ARE_REQUIRED') {
			this.showNotification('Las fechas son requeridas', 'error');
		} else if (error.data.message === 'INVALID_DATE_RANGE') {
			this.showNotification('La fecha inicio es mayor a fecha fin', 'error');
		} else {
			this.showNotification('Ocurrió un error al intentar crear filtro', 'error');
		}
	}
}

function created() {
	this.loadFilters();
}

async function loadFilters(page = 1) {
	this.currentPage = page;
	this.params.page = page;
	try {
		const response = await this.$httpProducts.get('filters', { params: this.params });
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function changePage(page) {
	this.loadFilters(page);
}

async function deleteFilters() {
	try {
		await this.$httpProducts.delete(`filters/${this.idFilter}`);
		this.loadFilters();
		this.action.open = false;
		this.action.code = null;
		this.action.title = '';
		this.action.width = 570;
	} catch (error) {
		this.showGenericError();
	}
}

function edit({ id }) {
	this.editFilterId = id;
	this.action.title = 'Editar Filtro';
	this.action.width = 450;
	this.action.code = 'filters-ecommerce';
	this.action.open = true;
}

async function changeActive(id, flag) {
	const body = {
		flagActive: flag,
	};
	try {
		await this.$httpProducts.patch(`filters/${id}/active`, body);
		this.showNotification('Se actualizó correctamente');
		this.loadFilters();
	} catch (error) {
		this.showGenericError();
	}
}

function isActionCode(code) {
	return this.action.code === code;
}

function stateName({ virtualActive }) {
	return virtualActive ? 'Activo' : 'Inactivo';
}

function data() {
	return {
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 570,
		},
		rows: [],
		columns: [
			{ id: 1, name: 'Orden', value: 'order', visible: true, checked: true },
			{ id: 2, name: 'Icono', value: 'icon', visible: true, checked: true },
			{ id: 3, name: 'Titulo', value: 'title', visible: true, checked: true },
			{ id: 4, name: 'Descripción', value: 'description', visible: true, checked: true },
			{ id: 5, name: 'Link', value: 'link', visible: true, checked: true },
			{ id: 6, name: 'Acciones', value: 'action', visible: true, checked: true },
		],
		filterName: '',
		idFilter: null,
		params: {
			page: '',
		},
		lastPage: 0,
		currentPage: 1,
		editFilterId: null,
	};
}

export default {
	name: 'page-filters-ecommerce',
	data,
	created,
	methods: {
		runAction,
		closeModal,
		createFilter,
		loadFilters,
		changePage,
		deleteFilters,
		edit,
		changeActive,
		isActionCode,
		stateName,
	},
	components: {
		appActions,
		actionSidebar,
		appTable,
		createFilters,
		deleteFiltersForm,
		headerPage,
	},
};
</script>

<style lang="scss">
.td-link {
	text-overflow: ellipsis;
	width: 150px;
	white-space: nowrap; 
}
</style>