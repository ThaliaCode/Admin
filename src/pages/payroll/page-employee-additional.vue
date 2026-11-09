<template>
	<div>
		<header-page
			:title="$route.meta.title"
			name="employee-additional"
		/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<div class="overflow-auto mt-5">
			<app-table
				name="employee-additional"
				:columns="columns"
				:rows="rows"
				class="is-not-selectable"
				:last-page="lastPage"
				:current-page="currentPage"
				@on-page="changePage"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.typeGeneral.name }}</td>
					<td v-show="showRow(columns, 4)">{{ validate(props.row.flagActive) }}</td>
					<td v-show="showRow(columns, 5)">{{ validate(props.row.flagEmpty) }}</td>
					<td v-show="showRow(columns, 6)">{{ validate(props.row.flagRole)}}</td>
					<td v-show="showRow(columns, 7)">{{props.row.observation }}</td>
					<td v-show="showRow(columns, 8)">
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click="editAdditonal(props.row.id)"
								>
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
			<create-additional
				v-if="action.code === 'AD'"
				@update="updateModal"
				@close="closeModal"
				:id="idAdditional"
			/>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="390">
			<v-card>
				<v-card-title class="subheading">{{dialogMessage}}</v-card-title>
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
					@click.native="deleteAdditional"
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
import createAdditional from '@/components/payroll/create-additional-data';

function validate(value) {
	const flag = value === 1 ? 'Si' : 'No';
	return flag;
}

function editAdditonal(value) {
	this.action.open = true;
	this.action.code = 'AD';
	this.action.title = 'Editar Dato Adicional';
	this.idAdditional = value;
}

function closeDialog() {
	this.dialog = false;
	this.idDelete = '';
}

function openConfirmDelete({ id, name }) {
	this.idDelete = id;
	this.dialogMessage = `¿Desea eliminar '${name}' ?`;
	this.dialog = true;
}

async function deleteAdditional() {
	try {
		await this.$httpSales.delete(`additional-fields/${this.idDelete}`);
		this.showNotification('Se eliminó correctament');
		this.loadAdditional();
		this.closeDialog();
	} catch (error) {
		this.showGenericError();
	}
}

function created() {
	this.loadAdditional();
}

function changePage(page) {
	this.currentPage = page;
	this.loadAdditional();
}

async function loadAdditional() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpSales.get('additional-fields', { params: this.params });
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function updateModal() {
	this.closeModal();
	this.loadAdditional();
}

function runAction({ code, name }) {
	if (code === 'AD') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 500;
		this.idAdditional = null;
	}
}

function closeModal() {
	this.idAdditional = null;
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.currentPage = 1;
	this.loadAdditional();
}

function data() {
	return {
		idAdditional: null,
		idDelete: '',
		dialogMessage: '',
		dialog: false,
		currentPage: 1,
		lastPage: 1,
		rows: [],
		columns: [
			{ id: 1, name: 'Codigo', value: 'additional-fields', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'numerical-value', visible: true, checked: true },
			{ id: 3, name: 'Tipo de Formato', value: 'role', visible: true, checked: true },
			{ id: 4, name: 'Activo', value: 'string', visible: true, checked: true },
			{ id: 5, name: 'Vaciar Datos', value: 'string', visible: true, checked: true },
			{ id: 6, name: 'Activo Rol', value: 'string', visible: true, checked: true },
			{ id: 7, name: 'Observaciones', value: 'observation', visible: true, checked: true },
			{ id: 8, name: 'Acciones', value: 'actions', visible: true, checked: true },
		],
		data: [],
		params: {
			page: null,
			search: null,
		},
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 500,
		},
	};
}
export default {
	name: 'employee-additional',
	components: {
		appActions,
		headerPage,
		appTable,
		actionSidebar,
		createAdditional,
	},
	data,
	created,
	methods: {
		validate,
		editAdditonal,
		closeDialog,
		openConfirmDelete,
		changePage,
		deleteAdditional,
		loadAdditional,
		updateModal,
		runAction,
		closeModal,
		onSearch,
	},
};
</script>

