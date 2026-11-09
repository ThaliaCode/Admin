<template>
	<div>
		<header-page
			title="RECONOCIMIENTOS"
			name="payroll-appreciation"
		/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<div class="overflow-auto mt-5">
			<app-table
				name="payroll-appreciation"
				:columns="columns"
				:rows="data"
				:last-page="lastPage"
				:current-page="currentPage"
				@on-page="changePage"
				@on-search-event="onSearch"
				class="is-not-selectable"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.dateReset }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.recognitions.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 4)">
						<v-tooltip top>
							<v-btn
								slot="activator"
								@click="editAppreciation(props.row.id)"
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
			@close-modal="cancelModal">
				<new-appreciation 
					@close="cancelModal"
					@update="updateData"
					v-if="action.code === 'payroll-new-appreciation'"
					:type-recognitions="typeRecognitions"
					:id="id"
					:id-edit="idEdit"
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
						@click.native="deleteTyeAppreciation"
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
import newAppreciation from '@/components/payroll/new-appreciation';
import helper from '@/shared/helper';

function runAction({ code, name }) {
	if (code === 'payroll-new-appreciation') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 500;
	}
}

function cancelModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
	this.idEdit = null;
}

function created() {
	this.loadData();
	this.loadTypeRecognitions();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpSales.get(`employee/${this.id}/recognitions`, { params: this.params });
		this.data = response.data.map((item) => {
			const newItem = { ...item };
			newItem.dateReset = helper.exactDate(item.date);
			return newItem;
		});
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

async function loadTypeRecognitions() {
	try {
		const response = await this.$httpSales.get('group/recognitions/table');
		this.typeRecognitions = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function updateData() {
	this.cancelModal();
	this.loadData();
}

function editAppreciation(value) {
	this.action.code = 'payroll-new-appreciation';
	this.action.open = true;
	this.action.title = 'Editar Remuneración';
	this.action.width = 570;
	this.idEdit = value;
}

function openConfirmDelete({ id, recognitions }) {
	this.dialogMessage = `¿Desea eliminar '${recognitions.name}'?`;
	this.dialog = true;
	this.typeId = id;
}

function closeDialog() {
	this.dialog = false;
	this.typeId = '';
}

async function deleteTyeAppreciation() {
	try {
		await this.$httpSales.delete(`/employee/${this.id}/recognitions/${this.typeId}`);
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
		columns: [
			{ id: 1, name: 'Fecha', value: 'date', visible: true },
			{ id: 2, name: 'Motivo', value: 'reason', visible: true },
			{ id: 3, name: 'Remitente', value: 'sender', visible: true },
			{ id: 4, name: 'Acciones', visible: true, checked: true },
		],
		data: [
			{
				id: 1,
				date: '12/11/2019',
				reason: 'Prueba',
				sender: 'Prueba Remitent',
			},
			{
				id: 2,
				date: '12/11/2019',
				reason: 'Prueba',
				sender: 'Prueba Remitent',
			},
			{
				id: 3,
				date: '12/11/2019',
				reason: 'Prueba',
				sender: 'Prueba Remitent',
			},
		],
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 500,
		},
		params: {
			page: null,
			search: null,
		},
		currentPage: 1,
		lastPage: 0,
		idEdit: null,
		dialog: false,
		dialogMessage: '',
		typeRecognitions: [],
		typeId: '',
	};
}

export default {
	name: 'appreciation',
	data,
	created,
	components: {
		appActions,
		headerPage,
		appTable,
		actionSidebar,
		newAppreciation,
	},
	methods: {
		cancelModal,
		runAction,
		loadData,
		changePage,
		loadTypeRecognitions,
		updateData,
		editAppreciation,
		deleteTyeAppreciation,
		closeDialog,
		openConfirmDelete,
		onSearch,
	},
	props: {
		id: {
			type: [String, Number],
		},
	},
};
</script>