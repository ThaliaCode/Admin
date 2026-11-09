<template>
  <div>
		<header-page :title="$route.meta.title" />
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
			<div class="mt-5">
				<app-table
					name="table-type-employee"
					:columns="columns"
					input-search
					:rows="rows"
					:last-page="lastPage"
					:current-page="currentPage"
					@on-page="changePage"
					@on-search-event="onSearch"
					>
					<template slot="rows" slot-scope="props" class="is-not-selectable">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.code }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.description }}</td>
						<td v-show="showRow(columns, 4)">
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click="editEmployee(props.row.id)">
								<v-icon color="green">create</v-icon>
							</v-btn>
							<span>Editar</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click="openConfirmDelete(props.row)"
							>
								<v-icon color="red">delete</v-icon>
								</v-btn>
								<span>Eliminar</span>
							</v-tooltip>
						</td>
					</template>
				</app-table>
				<action-sidebar
					:active="action.active"
					:code-action="action.code"
					:header-color="action.color"
					:title="action.title"
					:width="action.width"
					v-model="action.open"
					@close-modal="closeModal"
					>
				<create-employee
					:id="idEdit"
					v-if="action.code === 'create-type-of-employee'"
					@close="closeModal"
					@update="updateData">
				</create-employee>
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
								@click.native="deleteEmployee"
							>
								Eliminar
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</div>
		</div>
</template>
<script>
import appActions from '@/components/shared/app-actions';
import createEmployee from '@/components/payroll/create-employee';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import groupTable from '@/shared/group-table';

function closeModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
	this.idEdit = null;
}

function runAction({ code, name }) {
	if (code === 'create-type-of-employee') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 570;
	}
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.urlLoadData('get', groupTable.TypeEmployee, this.params);
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}
function created() {
	this.loadData();
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function editEmployee(id) {
	this.action.code = 'create-type-of-employee';
	this.action.open = true;
	this.action.title = 'Editar Tipo de Empleado';
	this.action.width = 570;
	this.idEdit = id;
}

function updateData() {
	this.closeModal();
	this.loadData();
}

function closeDialog() {
	this.dialog = false;
	this.typeId = '';
}

async function deleteEmployee() {
	try {
		await this.urlLoadData('delete', groupTable.TypeEmployee, null, this.typeId);
		this.showNotification('Se eliminó correctamente.');
		this.closeDialog();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function openConfirmDelete({ id, name }) {
	this.dialogMessage = `¿Desea eliminar '${name}'?`;
	this.dialog = true;
	this.typeId = id;
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.currentPage = 1;
	this.loadData();
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
		rows: [],
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Descripción', value: 'description', visible: true, checked: true },
			{ id: 4, name: 'Acciones', value: 'action', visible: true, checked: true },
		],
		params: {
			page: null,
			search: null,
		},
		currentPage: 1,
		lastPage: 0,
		idEdit: null,
		dialog: false,
		dialogMessage: '',
		typeId: '',
	};
}
export default {
	name: 'page-type-employee',
	data,
	methods: {
		closeModal,
		runAction,
		changePage,
		loadData,
		editEmployee,
		updateData,
		closeDialog,
		deleteEmployee,
		openConfirmDelete,
		onSearch,
	},
	created,
	components: {
		appActions,
		headerPage,
		appTable,
		createEmployee,
		actionSidebar,
	},
};
</script>