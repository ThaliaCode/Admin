<template>
  <div>
		<header-page :title="$route.meta.title" />
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<div class="mt-5">
			<app-table
				name="table-family"
				:columns="columns"
				:rows="rows"
				:last-page="lastPage"
				:current-page="currentPage"
				@on-page="changePage"
				@on-search-event="onSearch"
				class="is-not-selectable"
			>
				<template slot="rows" slot-scope="props" class="is-not-selectable">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{props.row.dataEmployee.fullName}}</td>
					<td v-show="showRow(columns, 2)">{{props.row.relationship.name}}</td>
					<td v-show="showRow(columns, 3)">{{flagBurden(props.row.flagBurden)}}</td>
					<td v-show="showRow(columns, 4)">{{props.row.dataEmployee.dateReset}}</td>
					<td v-show="showRow(columns, 5)">{{props.row.occupation ? props.row.occupation.name : null }}</td>
					<td v-show="showRow(columns, 6)">{{props.row.dataEmployee.address}}</td>
					<td v-show="showRow(columns, 7)">{{props.row.dataEmployee.phone}}</td>
					<td v-show="showRow(columns, 8)">{{props.row.dataEmployee.enterprise}}</td>
					<td v-show="showRow(columns, 9)">{{props.row.dataEmployee.profession}}</td>
					<td v-show="showRow(columns, 10)">
						<v-tooltip top>
							<v-btn
								slot="activator"
								@click="editFamily(props.row.id)"
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
			@close-modal="closeModal"
			v-model="action.open"
		>
			<family-create-employee
				@close = "closeModal" 
				:relation="relation"
				:id="id"
				:id-edit="idEdit"
				v-if="action.code === 'Nuevo Familiar'"
				@update="updateFamily"
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
						@click.native="deleteFamily"
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
import familyCreateEmployee from '@/components/payroll/family-create-employee';
import groupTable from '@/shared/group-table';
import helper from '@/shared/helper';

function runAction({ code, name }) {
	if (code === 'Nuevo Familiar') {
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

function created() {
	this.loadData();
	this.loadTable();
}

async function loadData() {
	this.params.page = this.currentPage;
	const request = [
		this.$httpSales.get(`employee/${this.id}/relationship`, { params: this.params }),
	];
	try {
		const responses = await Promise.all(request);
		this.rows = responses[0].data.map((row) => {
			const newRow = { ...row };
			newRow.dataEmployee.dateReset = helper.exactDate(newRow.dataEmployee.dateBirth);
			return newRow;
		});
		this.lastPage = Number(responses[0].headers['x-last-page']);
	} catch (err) {
		this.showGenericError();
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function flagBurden(value) {
	return value === 1 ? 'si' : 'no';
}

function editFamily(value) {
	this.action.code = 'Nuevo Familiar';
	this.action.open = true;
	this.action.title = 'Editar Tipo de Personal';
	this.action.width = 570;
	this.idEdit = value;
}

function updateFamily() {
	this.closeModal();
	this.loadData();
}

function openConfirmDelete({ dataEmployee, id }) {
	this.dialogMessage = `¿Desea eliminar a '${dataEmployee.fullName}'?`;
	this.dialog = true;
	this.typeId = id;
}

function closeDialog() {
	this.dialog = false;
	this.typeId = '';
}

async function deleteFamily() {
	try {
		await this.$httpSales.delete(`employee/${this.id}/relationship/${this.typeId}`);
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

async function loadTable() {
	const request = [
		this.urlLoadData('get', groupTable.Relationship),
	];
	try {
		const responses = await Promise.all(request);
		this.relation = responses[0].data;
	} catch (err) {
		this.showGenericError();
	}
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
		columns: [
			{ id: 1, name: 'Nombre', visible: true, checked: true },
			{ id: 2, name: 'Parentesco', visible: true, checked: true },
			{ id: 3, name: 'Carga', visible: true, checked: true },
			{ id: 4, name: 'Fecha de Nac.', visible: true, checked: true },
			{ id: 5, name: 'Ocupación', visible: true, checked: true },
			{ id: 6, name: 'Dirección', visible: true, checked: true },
			{ id: 7, name: 'Teléfono', visible: true, checked: true },
			{ id: 8, name: 'Empresa', visible: true, checked: true },
			{ id: 9, name: 'Profesión u Ocupación', visible: true, checked: true },
			{ id: 10, name: 'Acciones', visible: true, checked: true },
		],
		rows: [],
		params: {
			page: null,
			search: null,
		},
		currentPage: 1,
		lastPage: 0,
		relation: [],
		idEdit: null,
		dialog: false,
		dialogMessage: '',
		typeId: '',
	};
}

export default {
	name: 'page-family-employee',
	data,
	methods: {
		runAction,
		closeModal,
		loadData,
		changePage,
		flagBurden,
		editFamily,
		updateFamily,
		closeDialog,
		openConfirmDelete,
		deleteFamily,
		onSearch,
		loadTable,
	},
	created,
	components: {
		appActions,
		actionSidebar,
		headerPage,
		appTable,
		familyCreateEmployee,
	},
	props: {
		id: {
			type: [Number, String],
		},
	},
};
</script>