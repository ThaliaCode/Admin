<template>
	<div>
		<header-page
			:title="$route.meta.title"
			name="control-employee"
		/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			:value-disabled="actionsDisabled"
		/>
		<div class="overflow-auto mt-5">
			<app-table
				name="control-employee"
				:columns="columns"
				:rows="rows"
				:last-page="lastPage"
				:current-page="currentPage"
				:check-all="checkAll"
				selectable
				@on-page="changePage"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.documentNumber }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 4)">{{ activeName(props.row.flagActive) }}</td>
					<td v-show="showRow(columns, 5)">
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click.stop="family(props.row.id)">
								<img :src="`${urlImage}/b4yndE2XBweHndomhrn5CI1Io2eAIc.svg`">
							</v-btn>
							<span>Familiares</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								@click.stop="dateControl(props.row.id)"
								icon>
								<img :src="`${urlImage}/j5sV9j876uerVTFIB0w6ya&hTaqq&x.svg`">
							</v-btn>
							<span>Control de Fechas</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click.stop="additional(props.row.id)">
								<img :src="`${urlImage}/G7EynljCkwhf0Xbaxu3ATcmTxy67lZ.svg`">
							</v-btn>
							<span>Datos Adicionales</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click.stop="recognitions(props.row.id)">
								<img :src="`${urlImage}/86IvvrT7zmDngffXZdaGIpz&mqfJ9c.svg`">
							</v-btn>
							<span>Reconocimientos</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click.stop="attention(props.row.id)"
								>
								<img :src="`${urlImage}/5V0ypH2XcuaiV06CIjhG5AdsDbo3rh.svg`">
							</v-btn>
							<span>Llamadas de Atención</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click.stop="openEditEmployee(props.row.id)"
								>
								<v-icon color="primary">create</v-icon>
							</v-btn>
							<span>Editar</span>
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
				<assign-additional 
					v-if="action.code === 'AAD'"
					:id="idEmployee"
					:code="employeeCode"
					@close-modal="cancelModal"/>
		</action-sidebar>
	</div>
</template>
<script>
import appActions from '@/components/shared/app-actions';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import appTooltipButton from '@/components/shared/app-tooltip-button';
import actionSidebar from '@/components/shared/action-sidebar';
import assignAdditional from '@/components/payroll/assign-additional';

function attention(value) {
	this.goTo('call-attention', { params: { id: value } });
}

function additional(value) {
	this.goTo('additional-data-employee', { params: { id: value } });
}

function family(value) {
	this.goTo('relatives', { params: { id: value } });
}

function recognitions(value) {
	this.goTo('appreciation', { params: { id: value } });
}

function created() {
	this.loadData();
}

function openEditEmployee(value) {
	this.employeeCode = true;
	this.goTo('employee-create', { params: { id: value } });
}


function data() {
	return {
		employeeCode: false,
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Documento', value: 'document', visible: true, checked: true },
			{ id: 3, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 4, name: 'Activo', value: 'active', visible: true, checked: true },
			{ id: 5, name: 'Acción', value: 'action', visible: true, checked: true },
		],
		rows: [],
		urlImage: 'https://s3.amazonaws.com/apprunn-acl/icons',
		params: {
			page: null,
			search: null,
		},
		currentPage: 1,
		lastPage: 0,
		dialog: false,
		dialogMessage: '',
		typeId: '',
		checkAll: false,
		dataSelected: [],
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 600,
		},
		idEmployee: null,
	};
}

function dateControl(value) {
	this.goTo('control-date-employee', { params: { id: value } });
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpSales.get('employees-company', { params: this.params });
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function runAction({ code, name }) {
	if (code === 'new-employee') {
		this.goTo('employee-create');
	} else {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.idEmployee = this.dataSelected[0].id;
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function activeName(value) {
	return value === 1 ? 'Si' : 'No';
}

function openConfirmDelete({ id, name }) {
	this.dialogMessage = `¿Desea eliminar '${name}'?`;
	this.dialog = true;
	this.typeId = id;
}

function closeDialog() {
	this.dialog = false;
	this.typeId = '';
}

function rowIsSelected(row) {
	({ products: this.rows, productsSelected: this.dataSelected, checkAll: this.checkAll }
	= this.selectedRows(row, this.rows, this.dataSelected));
}

function selectedAll(value) {
	({ products: this.rows, productsSelected: this.dataSelected, checkAll: this.checkAll }
	= this.selecteAll(value, this.rows, this.dataSelected));
}

function actionsDisabled() {
	const asign = this.dataSelected.length === 1;
	const disabledActions = [
		{ code: 'new-inventory', disabled: false },
		{ code: 'AAD', disabled: !asign },
	];
	return disabledActions;
}

function cancelModal() {
	this.action.open = false;
	this.action.code = null;
	this.idEmployee = null;
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.currentPage = 1;
	this.loadData();
}

export default {
	name: 'employee-control',
	created,
	components: {
		appActions,
		headerPage,
		appTable,
		appTooltipButton,
		actionSidebar,
		assignAdditional,
	},
	computed: {
		actionsDisabled,
	},
	data,
	methods: {
		recognitions,
		attention,
		openEditEmployee,
		loadData,
		family,
		dateControl,
		additional,
		runAction,
		changePage,
		activeName,
		openConfirmDelete,
		closeDialog,
		rowIsSelected,
		selectedAll,
		cancelModal,
		onSearch,
	},
};
</script>
