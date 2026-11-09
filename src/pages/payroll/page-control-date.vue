<template>
	<div>
		<header-page
			title="CONTROL DE FECHAS"
			name="control-employee"
		/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<div class="overflow-auto mt-5">
			<app-table
				name="control-date"
				:columns="columns"
				:rows="data"
				class="is-not-selectable"
				:last-page="lastPage"
				:current-page="currentPage"
				@on-page="changePage"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.dateInputDate }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.dateOutputDate }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.retireMotivate ? props.row.retireMotivate.name : '' }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.flagInsured === 1 ? 'Si' : 'No' }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.insuredIngressDate }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.insuredExitDate }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.retireMotivateInsured ? props.row.retireMotivateInsured.name : ''}}</td>
					<td v-show="showRow(columns, 9)">{{ props.row.days }}</td>
					<td v-show="showRow(columns, 10)">{{ props.row.accumulatedDays }}</td>
					<td v-show="showRow(columns, 11)">
						<v-tooltip top>
							<v-btn
								slot="activator"
								@click="editControlDate(props.row.id)"
								icon>
								<v-icon color="green">create</v-icon>
							</v-btn>
							<span>Editar</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click="openConfirmDelete(props.row.id)"
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
				<new-control-date 
					@close="cancelModal"
					@update="updateRetire"
					:id="id"
					:retire-motive="retireMotive"
					:edit-id="idEdit"
					v-if="action.code === 'CPD'"
				/>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="390">
			<v-card>
				<v-card-title class="subheading">¿Desea eliminar?</v-card-title>
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
						@click.native="deleteControlDate"
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
import newControlDate from '@/components/payroll/new-control-date';
import groupTable from '@/shared/group-table';
import helper from '@/shared/helper';

function runAction({ code, name }) {
	if (code === 'CPD') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 500;
	}
}

function cancelModal() {
	this.action.open = false;
	this.action.code = null;
	this.idEdit = null;
}

function created() {
	this.loadData();
	this.loadTable();
}

async function loadData() {
	this.params.page = this.currentPage;
	const requests = [
		this.$httpSales.get(`employee/${this.id}/date-control`, { params: this.params }),
	];
	const [dateControl] = await Promise.all(requests);
	this.data = dateControl.data.map((element) => {
		const newRow = { ...element };
		newRow.dateInputDate = helper.exactDate(element.dateInput, 'DD/MM/YYYY') || null;
		newRow.dateOutputDate = helper.exactDate(element.dateOutput, 'DD/MM/YYYY') || null;
		newRow.insuredExitDate = helper.exactDate(element.insuredExit, 'DD/MM/YYYY') || null;
		newRow.insuredIngressDate = helper.exactDate(element.insuredIngress, 'DD/MM/YYYY') || null;
		return newRow;
	});
	this.lastPage = Number(dateControl.headers['x-last-page']);
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function updateRetire() {
	this.cancelModal();
	this.loadData();
}

function editControlDate(value) {
	this.action.code = 'CPD';
	this.action.open = true;
	this.action.title = 'Editar Control de Fechas';
	this.action.width = 570;
	this.idEdit = value;
}

async function deleteControlDate() {
	try {
		await this.$httpSales.delete(`employee/${this.id}/date-control/${this.typeId}`);
		this.showNotification('Se eliminó correctamente.');
		this.closeDialog();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function closeDialog() {
	this.dialog = false;
	this.typeId = '';
}

function openConfirmDelete(id) {
	this.dialog = true;
	this.typeId = id;
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.currentPage = 1;
	this.loadData();
}

async function loadTable() {
	const response = await this.urlLoadData('get', groupTable.RetireMotivate);
	this.retireMotive = response.data;
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Ing.Empresa', value: 'entry-to-company', visible: true, checked: true },
			{ id: 3, name: 'Sal. Empresa', value: 'exit-to-company', visible: true, checked: true },
			{ id: 4, name: 'Motivo de Salida Empresa', value: 'reason-leaving-company', visible: true, checked: true },
			{ id: 5, name: 'IESS', value: 'iess', visible: true, checked: true },
			{ id: 6, name: 'Ing. IEES', value: 'entry-iess', visible: true, checked: true },
			{ id: 7, name: 'Sal. IEES', value: 'exit-iess', visible: true, checked: true },
			{ id: 8, name: 'Motivo Sal. IEES', value: 'reason-exit-iess', visible: true, checked: true },
			{ id: 9, name: 'Días', value: 'days', visible: true, checked: true },
			{ id: 10, name: 'Días Acumulados', value: 'accumulated-days', visible: true, checked: true },
			{ id: 11, name: 'Acciones', visible: true, checked: true },
		],
		data: [],
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 500,
		},
		retireMotive: [],
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
	name: 'control-date',
	components: {
		appActions,
		headerPage,
		appTable,
		actionSidebar,
		newControlDate,
	},
	methods: {
		runAction,
		cancelModal,
		loadData,
		changePage,
		updateRetire,
		editControlDate,
		deleteControlDate,
		closeDialog,
		openConfirmDelete,
		onSearch,
		loadTable,
	},
	data,
	created,
	props: {
		id: {
			type: [String, Number],
		},
	},
};
</script>
