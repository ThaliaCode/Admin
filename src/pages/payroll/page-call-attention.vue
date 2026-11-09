<template>
	<div>
		<header-page :title="$route.meta.title"></header-page>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<div class="mt-5">
			<app-table
				name="table-page-call-attention"
				:columns="columns"
				input-search
				:filter-columns="false"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="rows"
				@on-page="changePage"
				@on-search-event="onSearch"
				class="is-not-selectable">
				<template slot="rows" slot-scope="props" class="is-not-selectable">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.newDate | formatDate('DD-MM-YYYY') }}</td>
					<td v-show="showRow(columns, 2)">{{props.row.dataEmployee ? props.row.dataEmployee.reason : '' }}</td>
					<td v-show="showRow(columns, 3)">{{props.row.dataEmployee ? props.row.dataEmployee.sender : '' }}</td>
					<td v-show="showRow(columns, 4)">{{props.row.reprimands ? props.row.reprimands.name : '' }}</td>
					<td v-show="showRow(columns, 5)">
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click="editAttention(props.row.id)">
								<v-icon color="green">create</v-icon>
							</v-btn>
							<span>Editar</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click="confirmDelete(props.row)"
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
					@close-modal="closeModal">
				<create-call-attention
					@close-modal="closeModal"
					@update="updateAttetion"
					:id="id"
					:id-edit="idEdit"
					v-if="action.code === 'new-call-attention'"
				></create-call-attention>
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
						Cancelar </v-btn>
						<v-btn
						class="btn-action"
						color="error"
						dark
						@click.native="deleteAttention"
						>
						Eliminar</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</div>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import createCallAttention from '@/components/payroll/create-call-attention';
import helper from '@/shared/helper';

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function closeDialog() {
	this.dialog = false;
	this.dialogMessage = '';
	this.typeId = '';
}

async function deleteAttention() {
	try {
		await this.$httpSales.delete(`employee/${this.id}/reprimands/${this.typeId}`);
		this.showNotification('Se eliminó correctamente.');
		this.closeDialog();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function confirmDelete({ id, searchField }) {
	this.dialogMessage = `¿Desea eliminar '${searchField}'?`;
	this.dialog = true;
	this.typeId = id;
}

function editAttention(value) {
	this.action.code = 'new-call-attention';
	this.action.open = true;
	this.action.title = 'Editar Llamadas de Atención';
	this.action.width = 570;
	this.idEdit = value;
}

function updateAttetion() {
	this.closeModal();
	this.loadData();
}

function created() {
	this.loadData();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpSales.get(`employee/${this.id}/reprimands`, { params: this.params });
		this.lastPage = Number(response.headers['x-last-page']);
		this.rows = response.data.map((row) => {
			const newRow = { ...row };
			newRow.newDate = helper.exactDate(newRow.date);
			return newRow;
		});
	} catch (error) {
		this.showGenericError();
	}
}

function closeModal() {
	this.idEdit = null;
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
}

function runAction({ code, name }) {
	if (code === 'new-call-attention') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 570;
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
		typeId: '',
		dialog: false,
		dialogMessage: '',
		lastPage: 0,
		dateReset: null,
		currentPage: 1,
		params: {
			page: null,
			search: null,
		},
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 570,
		},
		rows: [],
		columns: [
			{ id: 1, name: 'Fecha', value: 'date', visible: true, checked: true },
			{ id: 2, name: 'Motivo', value: 'reason', visible: true, checked: true },
			{ id: 3, name: 'Remitente', value: 'sender', visible: true, checked: true },
			{ id: 4, name: 'Tipo', value: 'type', visible: true, checked: true },
			{ id: 5, name: 'Acciones', value: 'action', visible: true, checked: true },
		],
	};
}

export default {
	name: 'page-call-attention',
	data,
	created,
	props: {
		id: {
			type: [String, Number],
		},
	},
	methods: {
		changePage,
		closeDialog,
		deleteAttention,
		confirmDelete,
		editAttention,
		updateAttetion,
		runAction,
		closeModal,
		loadData,
		onSearch,
	},
	components: {
		appActions,
		createCallAttention,
		headerPage,
		appTable,
		actionSidebar,
	},
};
</script>

