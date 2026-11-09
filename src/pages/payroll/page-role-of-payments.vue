<template>
	<div>
		<header-page
			:title="$route.meta.title"
			name="role-of-payments"
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
				:current-page="currentPage"
				:last-page="lastPage"
				@on-page="changePage"
				selectable
				:check-all="checkAll"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.date }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.decimal }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.typePayroll ? props.row.typePayroll.name : null }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.observation }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.accountingSeat }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.flagActive ?  'Activo' : 'No Activo' }}</td>
					<td v-show="showRow(columns, 9)">
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click.stop="goToDetails(props.row.id)"
							>
									<img src="https://s3.amazonaws.com/apprunn-acl/icons/5skeVv1lj4wC8um&GC5ZBa2F6XEXCH.svg">
							</v-btn>
							<span>Detalle</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click.stop="editRole(props.row.id)"
							>
								<v-icon color="success">create</v-icon>
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
			<create-role-payments 
				v-if="action.code === 'create-role-payments'"
				@close-modal="cancelModal"
				@update-role="updateRole"
				:id="idEdit"
			/>
			<assign-employee 
				v-if="action.code === 'assign-employees'"
				@close-modal="cancelModal"
				@update="updateRole"
				:data="dataSelected[0]"
			/>
		</action-sidebar>
	</div>
</template>
<script>
import appActions from '@/components/shared/app-actions';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import createRolePayments from '@/components/payroll/create-role-payments';
import assignEmployee from '@/components/payroll/assign-employee';
import helper from '@/shared/helper';

function runAction({ code, name }) {
	this.action.code = code;
	this.action.open = true;
	this.action.title = name;
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpSales.get('payroll-heading', { params: this.params });
		this.rows = response.data.map((row) => {
			const newRow = { ...row };
			newRow.date = helper.exactDate(row.dateStart, 'DD-MM-YYYY');
			return newRow;
		});
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function cancelModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
	this.idEdit = null;
}

function editRole(id) {
	this.action.code = 'create-role-payments';
	this.action.open = true;
	this.action.title = 'Editar Rol';
	this.idEdit = id;
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
	const disabledSelected = this.dataSelected.length === 1;
	const disabledActions = [
		{ code: 'assign-employees', disabled: !disabledSelected },
		{ code: 'create-role-payments', disabled: false },
	];
	return disabledActions;
}

function goToDetails(id) {
	this.goTo('role-of-payments-details', { params: { id } });
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.currentPage = 1;
	this.loadData();
}

function data() {
	return {
		rows: [],
		columns: [
			{ id: 1, name: 'Código', visible: true, checked: true },
			{ id: 2, name: 'Descripción', visible: true, checked: true },
			{ id: 3, name: 'Fecha', visible: true, checked: true },
			{ id: 4, name: 'Num. de decimales', visible: true, checked: true },
			{ id: 5, name: 'Tipo de Rol', visible: true, checked: true },
			{ id: 6, name: 'Observación', visible: true, checked: true },
			{ id: 7, name: 'Asiento Método ', visible: true, checked: true },
			{ id: 8, name: 'Estado', visible: true, checked: true },
			{ id: 9, name: 'Acciones', visible: true, checked: true },
		],
		params: {
			page: '',
		},
		lastPage: 0,
		currentPage: 1,
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 500,
		},
		dataSelected: [],
		checkAll: false,
		idEdit: null,
	};
}

function created() {
	this.loadData();
}

function updateRole() {
	this.cancelModal();
	this.dataSelected = [];
	this.loadData();
}

export default {
	name: 'role-of-payments',
	components: {
		appActions,
		headerPage,
		appTable,
		actionSidebar,
		createRolePayments,
		assignEmployee,
	},
	computed: {
		actionsDisabled,
	},
	data,
	created,
	methods: {
		runAction,
		changePage,
		loadData,
		cancelModal,
		rowIsSelected,
		selectedAll,
		goToDetails,
		updateRole,
		editRole,
		onSearch,
	},
};
</script>

