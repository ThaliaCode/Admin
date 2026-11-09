<template>
<div>
	<header-page 
		:title="$route.meta.title"/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<div class="mt-5">
			<app-table 
			name="table-costs-control"
			:columns="columns"
			:rows="rows"
			class="is-not-selectable"
			:lastPage="lastPage"
			:current-page="currentPage"
			@on-search-event="onSearch"
			@on-page="changePage"
			>
			<template slot="rows" slot-scope="props" class="is-not-selectable">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">{{props.row.code}}</td>
				<td v-show="showRow(columns, 2)">{{props.row.name}}</td>
				<td v-show="showRow(columns, 3)"> <p :class="{active: props.row.flagActive, inactive: !props.row.flagActive}">{{ validate(props.row.flagActive) }}</p></td>
				<td v-show="showRow(columns, 4)">
					<v-tooltip top>
						<v-btn
						slot="activator"
						icon
						@click="editCost(props.row.id)"
						>
						<v-icon color="green">create</v-icon>
						</v-btn>
						<span>Editar</span>
					</v-tooltip>
					<v-tooltip top>
						<v-btn
						slot="activator"
						icon
						@click="openDialog(props.row)"
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
		<create-costs
		@close-modal="closeModal"
		@update="updateModal"
		:id="idEdit"
		v-if="action.code === 'CC'"
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
					> Cancelar</v-btn>
					<v-btn
						class="btn-action"
						color="error"
						dark
						@click.native="deleteCosts"
					>Eliminar</v-btn>
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
import createCosts from '@/components/payroll/create-costs';
import groupTable from '@/shared/group-table';

function openDialog({ id, name }) {
	this.dialogMessage = `¿ Desea eliminar '${name}' ?`;
	this.dialog = true;
	this.idEdit = id;
}

function closeDialog() {
	this.dialog = false;
	this.idEdit = false;
}

async function deleteCosts() {
	try {
		await this.urlLoadData('delete', groupTable.CostCenter, null, this.idEdit);
		this.closeDialog();
		this.getCosts();
	} catch (err) {
		if (err.status === 400) {
			const error = err.data;
			if (error.message === 'EXISTING_EMPLOYEE_ERROR') {
				this.showGenericError('El centro de costo esta relacionado con uno ó mas empleados');
			}
		} else {
			this.showGenericError();
		}
	}
}

function editCost(value) {
	this.action.open = 	true;
	this.action.code = 'CC';
	this.action.title = 'Editar Centro de Costos';
	this.idEdit = value;
}

function validate(value) {
	const flag = value === 1 ? 'Activo' : 'Inactivo';
	return flag;
}

function updateModal() {
	this.getCosts();
	this.closeModal();
}

function created() {
	this.getCosts();
}

async function getCosts() {
	this.params.page = this.currentPage;
	try {
		const response = await this.urlLoadData('get', groupTable.CostCenter, this.params);
		this.lastPage = Number(response.headers['x-last-page']);
		this.rows = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function runAction({ code, name }) {
	if (code === 'CC') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 570;
		this.idEdit = null;
	}
}

function closeModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
	this.idEdit = null;
}

function changePage(page) {
	this.currentPage = page;
	this.getCosts();
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.currentPage = 1;
	this.getCosts();
}

function data() {
	return {
		active: 1,
		inactive: 0,
		idEdit: null,
		dialogMessage: '',
		dialog: false,
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 570,
		},
		currentPage: 1,
		rows: [],
		columns: [
			{ id: 1, name: 'Codigo', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Centro de Costos', value: 'cost', visible: true, checked: true },
			{ id: 3, name: 'Estados', value: 'state', visible: true, checked: true },
			{ id: 4, name: 'Acciones', value: 'actions', visible: true, checked: true },
		],
		lastPage: 0,
		params: {
			page: null,
			search: null,
		},
	};
}

export default {
	name: 'page-costs-control',
	data,
	created,
	components: {
		appActions,
		createCosts,
		headerPage,
		appTable,
		actionSidebar,
	},
	methods: {
		openDialog,
		deleteCosts,
		closeDialog,
		editCost,
		validate,
		updateModal,
		getCosts,
		closeModal,
		runAction,
		changePage,
		onSearch,
	},
};
</script>

<style lang="scss" scoped>
.active {
	color: map-get($colors, green-light);
	font-size: 13px;
	margin-top: 15px;
}

.inactive {
	color: map-get($colors, red-delete);
	font-size: 13px;
	margin-top: 15px;
}

</style>
