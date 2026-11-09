
<template>
	<div>
		<header-page :title="$route.meta.title" />
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<div class="mt-5">
			<app-table
				name="table-position"
				:columns="columns"
				:rows="rows"
				:last-page="lastPage"
				:current-page="currentPage"
				@on-page="changePage"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props" class="is-not-selectable">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">{{props.row.areasCompany ? props.row.areasCompany.name : null }}</td>
					<td v-show="showRow(columns, 4)">{{props.row.amount}}</td>
					<td v-show="showRow(columns, 5)">{{props.row.description}}</td>
					<td v-show="showRow(columns, 6)">
					<v-tooltip top>
						<v-btn
							slot="activator"
							@click="editTypePosition(props.row.id)"
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
		<create-type-position
			v-if="action.code === 'Crear Tipo de Cargo'"
			@close="closeModal"
			@update="updateTypePosition"
			:id="id"
			:id-edit="idEdit">
		</create-type-position>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="390">
			<modal-items
				:title="dialogMessage"
				name-action="Eliminar"
				name-cancel="Cancelar"
				v-if="dialog"
				show-slot
				@close-modal="closeDialog"
				@action-modal="deleteTypePosition"
			></modal-items>
		</v-dialog>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import createTypePosition from '@/components/payroll/create-type-position';
import headerPage from '@/components/shared/header-page';
import modalItems from '@/components/shared/modal-items';

function runAction({ code, name }) {
	if (code === 'Crear Tipo de Cargo') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 570;
	}
}

function closeModal() {
	this.idEdit = null;
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
}

function updateTypePosition() {
	this.closeModal();
	this.loadData();
}
function created() {
	this.loadData();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpSales.get(`type-staff/${this.id}/changes`, { params: this.params });
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

function editTypePosition(value) {
	this.action.code = 'Crear Tipo de Cargo';
	this.action.open = true;
	this.action.title = 'Crear Tipo de Cargo';
	this.action.width = 570;
	this.idEdit = value;
}

function closeDialog() {
	this.dialog = false;
	this.typeId = '';
}

function openConfirmDelete({ id, name }) {
	this.typeId = id;
	this.dialogMessage = `¿Desea eliminar '${name}'?`;
	this.dialog = true;
}

async function deleteTypePosition() {
	try {
		await this.$httpSales.delete(`type-staff/${this.id}/changes/${this.typeId}`);
		this.showNotification('Se eliminó correctamente.');
		this.closeDialog();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
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
			{ id: 3, name: 'Área', visible: true, checked: true },
			{ id: 4, name: 'Valor Bono', visible: true, checked: true },
			{ id: 5, name: 'Descripción', visible: true, checked: true },
			{ id: 6, name: 'Acciones', visible: true, checked: true },
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
	name: 'page-type-position',
	data,
	methods: {
		runAction,
		closeModal,
		updateTypePosition,
		loadData,
		changePage,
		editTypePosition,
		closeDialog,
		openConfirmDelete,
		deleteTypePosition,
		onSearch,
	},
	created,
	components: {
		actionSidebar,
		appActions,
		appTable,
		createTypePosition,
		headerPage,
		modalItems,
	},
	props: {
		id: {
			type: [String, Number],
		},
	},
};
</script>