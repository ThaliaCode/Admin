<template>
    <div>
		<header-page :title="$route.meta.title"/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<div class="mt-5">
			<app-table
				name="table-type-person"
				:columns="columns"
				:rows="rows"
				@on-page="changePage"
				class="is-not-selectable"
				:last-page="lastPage"
				:current-page="currentPage"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props" class="is-not-selectable">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{props.row.code}}</td>
					<td v-show="showRow(columns, 2)">{{props.row.name}}</td>
					<td v-show="showRow(columns, 3)">{{props.row.description}}</td>
					<td v-show="showRow(columns, 4)">
						<v-tooltip top>
							<v-btn 	
								slot="activator"
								@click="goToTypePosition(props.row.id)"
								icon>
								<img :src="`https://s3.amazonaws.com/apprunn-acl/icons/tB6Va&f392BpE&3CCz7uerdJXAB2wb.svg`">
							</v-btn>
							<span>Tipo de cargo</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								@click="editTypePerson(props.row.id)"
								icon>
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
			<create-type-person
				@close="closeModal"
				@update="updateData"
				v-if="action.code === 'Crear Tipo de Personal'"
				:id="idEdit"
			></create-type-person>
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
						@click.native="deleteTypePerson"
					>
						Eliminar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import createTypePerson from '@/components/payroll/create-type-person';
import groupTable from '@/shared/group-table';

function runAction({ code, name }) {
	if (code === 'Crear Tipo de Personal') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 570;
		this.idEdit = null;
	}
}

function closeModal() {
	this.idEdit = null;
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
}

function created() {
	this.loadData();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.urlLoadData('get', groupTable.TypeStaff, this.params);
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function updateData() {
	this.closeModal();
	this.loadData();
}

function editTypePerson(value) {
	this.action.code = 'Crear Tipo de Personal';
	this.action.open = true;
	this.action.title = 'Crear Tipo de Personal';
	this.action.width = 570;
	this.idEdit = value;
}

function goToTypePosition(id) {
	this.goTo('cargo-type', { params: { id } });
}

async function deleteTypePerson() {
	try {
		await this.urlLoadData('delete', groupTable.TypeStaff, null, this.typeId);
		this.showNotification('Se eliminó correctamente.');
		this.closeDialog();
		this.loadData();
	} catch (err) {
		if (err.status === 400) {
			const error = err.data;
			if (error.message === 'EXISTING_EMPLOYEE_ERROR') {
				this.showGenericError('El tipo de empleado esta relacionado con uno ó mas empleados');
			}
		} else {
			this.showGenericError();
		}
	}
}

function closeDialog() {
	this.dialog = false;
	this.typeId = '';
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
			width: 570,
		},
		rows: [],
		columns: [
			{ id: 1, name: 'Código', visible: true, checked: true },
			{ id: 2, name: 'Nombre', visible: true, checked: true },
			{ id: 3, name: 'Descripción', visible: true, checked: true },
			{ id: 4, name: 'Acciones', visible: true, checked: true },
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
	};
}
export default {
	name: 'page-type-person',
	data,
	created,
	methods: {
		runAction,
		closeModal,
		loadData,
		changePage,
		updateData,
		editTypePerson,
		goToTypePosition,
		deleteTypePerson,
		closeDialog,
		openConfirmDelete,
		onSearch,
	},
	components: {
		appActions,
		createTypePerson,
		actionSidebar,
		appTable,
		headerPage,
	},
};
</script>