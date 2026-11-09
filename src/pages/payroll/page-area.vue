<template>
    <div>
			<header-page
			name="areas"
			:title="$route.meta.title"
			/>
			<app-actions
				:resource-uri="$route.name"
				@run-action="runAction"
			/>
			<div class="overflow-auto mt-5">
				<app-table
				name="areas"
				class="is-not-selectable"
				:columns="columns"
				:rows="rows"
				:last-page="lastPage"
				:current-page="currentPage"
				@on-page="changePage"
				@on-search-event="onSearch"
				>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">{{props.row.code}}</td>
					<td v-show="(columns, 2)">{{props.row.name}}</td>
					<td v-show="(columns, 3)">{{props.row.description}}</td>
					<td v-show="(columns, 4)">
						<v-tooltip top>
							<v-btn
							slot="activator"
							icon
							@click="editArea(props.row.id)">
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
			<create-area
			@close="closeModal"
			@update="updatePage"
			:id="idEdit"
			v-if="action.code === 'NA'"
			></create-area>
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
						@click.native="deleteArea">
							Eliminar
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import actionSidebar from '@/components/shared/action-sidebar';
import createArea from '@/components/payroll/create-area';
import groupTable from '@/shared/group-table';

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function editArea(value) {
	this.action.code = 'NA';
	this.action.open = true;
	this.action.title = 'Editar Área';
	this.action.width = 570;
	this.idEdit = value;
}

async function deleteArea() {
	try {
		await this.urlLoadData('delete', groupTable.AreasCompany, null, this.areaId);
		this.closeDialog();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function closeDialog() {
	this.dialog = false;
	this.areaId = '';
}

function openConfirmDelete({ id, name }) {
	this.dialogMessage = `¿Desea eliminar '${name}?`;
	this.dialog = true;
	this.areaId = id;
}

function created() {
	this.loadData();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		this.params.page = this.currentPage;
		const response = await this.urlLoadData('get', groupTable.AreasCompany, this.params);
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function closeModal() {
	this.idEdit = null;
	this.action.open = false;
	this.action.code = null;
	this.action.width = 570;
	this.action.title = '';
}

function updatePage() {
	this.closeModal();
	this.loadData();
}

function runAction({ code, name }) {
	if (code === 'NA') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 570;
		this.idEdit = null;
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
		areaId: '',
		dialog: false,
		dialogMessage: '',
		currentPage: 1,
		lastPage: 0,
		params: {
			page: null,
			search: null,
		},
		idEdit: null,
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
	};
}

export default {
	name: 'page-areas',
	data,
	created,
	components: {
		appActions,
		appTable,
		headerPage,
		actionSidebar,
		createArea,
	},
	methods: {
		changePage,
		editArea,
		deleteArea,
		closeDialog,
		openConfirmDelete,
		loadData,
		updatePage,
		runAction,
		closeModal,
		onSearch,
	},
};
</script>

<style lang="scss" scoped>

</style>
