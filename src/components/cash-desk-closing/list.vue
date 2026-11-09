<template>
	<div class="cash-desk-closing">
		<app-actions
			:resource-uri="$route.name"
			:value-disabled="actionDisabled"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<v-layout wrap mt-5>
			<v-flex xs12>
				<app-table
					name="cash-desk-closing-list"
					include-filter
					:check-all="checkAll"
					:current-page="currentPage"
					:last-page="lastPage"
					:columns="columns"
					:rows="data"
					:items-quantity="data.length"
					:items-total-quantity="itemsTotalQuantity"
					selectable
					class="is-not-selectable"
					@on-page="onPage"
					@on-selected-all="selectedAll"
					@row-is-selected="rowIsSelected"
					@on-search-event="onSearch"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.description || '-' }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.warehouse.name || '-' }}</td>
						<td v-show="showRow(columns, 4)">
							{{ props.row.currencySymbol }}
							{{ props.row.balanceCurrency | round }}
						</td>
						<td v-show="showRow(columns, 5)">
							{{ props.row.currencySymbol }}
							{{ props.row.balanceClosing | round }}
						</td>
						<td v-show="showRow(columns, 6)">
							{{
								(props.row.accountingAccount && props.row.accountingAccount.name) || '-'
							}}
						</td>

						<td class="is-not-selectable" v-show="showRow(columns, 7)">
							{{ props.row.createdAt | formatDate }}
						</td>
						<td v-show="showRow(columns, 8)">
							<app-tooltip-button
								v-if="showBalanceSupport"
								text="Balancear Caja"
								color="primary"
								icon="open_in_browser"
								@click-icon="balanceCash(props.row)"
							/>
							<app-tooltip-button
								text="Editar"
								icon="edit"
								color="success"
								@click-icon="openEditCash(props.row)"
							/>
							<app-tooltip-button
								text="Eliminar"
								icon="close"
								color="error"
								@click-icon="openConfirmDelete(props.row)"
							/>
							<v-tooltip top>
								<v-switch
									slot="activator"
									class="switch-inline"
									hide-details
									color="success"
									v-model="props.row.flagActive"
									@change="changeActive($event, props.row.id)"
								></v-switch>
								<span>{{ stateName(props.row) }}</span>
							</v-tooltip>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<action-sidebar
			:width="action.width"
			:code-action="action.code"
			:title="action.title"
			:active="action.active"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<new-cash-desk-closing
				v-if="isCashClosingData"
				:account="model.account"
				:accounting-account="accountingAccount"
				:accounting-accounts="accountingAccounts"
				:cash-id="cashId"
				:code="model.code"
				:description="model.description"
				:name="model.name"
				:account-code="model.accountCode"
				:account-name="model.accountName"
				:flag-active="model.flagActive"
				:flag-control="model.flagControl"
				:loading="loading"
				:subsidiary-id="model.subsidiaryId"
				:war-warehouses-id="model.warWarehousesId"
				:disabled-edit="disabledEditCash"
				@accept="applyAction"
				@close-modal="closeModal"
				@set-value="getValue"
				@set-account="getAccount"
			/>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="390">
			<v-card>
				<v-card-title class="subheading">{{ dialogMessage }}</v-card-title>
				<v-card-actions class="justify-center">
					<v-btn class="btn-action" color="info" dark @click.native="closeDialog">
						Cancelar
					</v-btn>
					<v-btn class="btn-action" color="error" dark @click.native="deleteCash">
						Eliminar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import actionSidebar from './../shared/action-sidebar';
import appTable from './../shared/table/app-table';
import newCashDeskClosing from './sub-components/new-cash-desk-closing';

function created() {
	this.showBalanceSupport = this.$userInfo.roleCode === 'SUPPORT';
	this.currencyCode = this.$userInfo.company.currencyDefault.code;
	const indexWarehouse = this.columns.findIndex((l) => l.value === 'warehouse');
	this.columns[indexWarehouse].name = this.labelWarehouse();
	this.actionInitData();
	const { subsidiary: subsidiaryUser } = this.$userInfo;
	const { configIntegrations } = subsidiaryUser || null;
	this.subsidiaryConfigIntegrations =
		configIntegrations &&
		((configIntegrations.accountingPlan &&
			configIntegrations.accountingPlan.flagConfig) ||
			(configIntegrations.accountingConfiguration &&
				configIntegrations.accountingConfiguration.flagConfig));
	if (this.subsidiaryConfigIntegrations) {
		this.loadAccountingAccounts();
	}
	this.loadData();
}

function actionInitData() {
	this.action = { ...this.actionDefault };
}

async function applyAction({ body, message, method, url }) {
	this.loading = true;
	const newBody = { ...body, code: body.code || this.generateTimeCode6Improved() };
	try {
		await this.$httpSales[method](url, newBody);
		this.showNotification(`La caja ha sido ${message} correctamente`);
		this.closeModal();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'EMPLOYEE_ADMIN_REQUIRED') {
				this.showNotification(
					'El rol de usuario no tiene permisos para esta acción.',
					'error'
				);
			} else if (err.data.message === 'CASH_CODE_REPEATED') {
				const retryBody = { ...newBody, code: this.generateTimeCode6Improved() };
				this.applyAction({ body: retryBody, message, method, url });
			}
		}
	} finally {
		this.loading = false;
	}
}

function actionDisabled() {
	const disabled = this.dataSelected.length === 0;
	const closingDisabled = this.dataSelected.length !== 1;
	return [
		{ code: 'GTM', disabled },
		{ code: 'cash-desk-closing-movement', disabled: closingDisabled },
	];
}

function closeDialog() {
	this.dialog = false;
	this.cashId = 0;
}

function closeModal() {
	this.actionInitData();
	this.cashId = 0;
	this.model = {
		account: '',
		code: '',
		description: '',
		name: '',
		subsidiaryId: null,
		warWarehousesId: null,
		flagActive: 1,
		accountingAccount: {
			code: null,
			name: null,
		},
	};
	this.disabledEditCash = false;
}

async function deleteCash() {
	try {
		await this.$httpSales.delete(`cash/${this.cashId}`);
		this.showNotification('La caja ha sido eliminada correctamente');
		this.loadData();
	} catch (err) {
		if (err.status === 400) {
			const { message } = err.data;
			const optMessage = {
				EMPLOYEE_ADMIN_REQUIRED: 'El rol de usuario no tiene permisos para esta acción.',
				CASH_DELETE_EMPLOYEE_INVALID:
					'No es posible eliminar esta caja porque está relacionada a un empleado.',
				CASH_DELETE_ERROR_TRANSCTION_EXIST:
					'No es posible eliminar esta caja porque tiene transacciones asociadas',
				CASH_DELETE_ERROR_SALES_CASH_DESK_EXIST:
					'No es posible eliminar esta caja porque tiene ventas asociadas',
				CASH_DELETE_ERROR_SALES_EXIST:
					'No es posible eliminar esta caja porque tiene ventas asociadas',
				CASH_DELETE_ERROR_SAL_SERIE_EXIST:
					'No es posible eliminar esta cja porque tiene una serie asociada',
			};
			this.showNotification(optMessage[message], 'error');
		} else if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.closeDialog();
	}
}

function getValue({ model, value }) {
	if (model === 'account') {
		this.accountingAccount = { ...value };
		this.model[model] = value.account;
	} else {
		this.model[model] = value;
	}
}

function goToPage(name, { id = 1 }) {
	const params = { id };
	this.goTo(name, { params });
}

function isCashClosingData() {
	return this.action.code === 'NCD' || this.action.code === 'ECDC';
}

async function loadData(page = 1) {
	this.table.params.page = this.table.params.page ? this.table.params.page : page;

	const params = this.table.params;
	delete params.sortField;
	delete params.sortDirection;
	try {
		({ data: this.data, headers: this.headers } = await this.$httpSales.get('cash', {
			params,
		}));
		this.data = this.data.map((row) => {
			const newRow = { ...row };
			newRow.warehouse = row.warehouse ? row.warehouse : {};
			newRow.isSelected = false;
			return newRow;
		});
		this.lastPage = Number(this.headers['x-last-page']);
		this.itemsTotalQuantity = Number(this.headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

function onPage(page) {
	this.currentPage = page;
	this.table.params.page = page;
	this.loadData();
}

function openConfirmDelete({ id, name }) {
	this.cashId = id;
	this.dialogMessage = `¿Desea eliminar la caja '${name}'?`;
	this.dialog = true;
}

async function openEditCash({ id }) {
	this.cashId = id;
	const { data: cash } = await this.$httpSales.get(`cash/${id}`);
	this.model.account = cash.accountingAccount ? cash.accountingAccount.name : null;
	this.model.accountName = cash.accountingAccount ? cash.accountingAccount.name : null;
	this.model.accountCode = cash.accountingAccount ? cash.accountingAccount.code : null;
	if (this.subsidiaryConfigIntegrations && cash.account) {
		this.accountingAccount = this.accountingAccounts.find(
			(aa) => aa.account === cash.account
		);
	}
	this.model.code = cash.code;
	this.model.description = cash.description;
	this.model.name = cash.name;
	this.model.subsidiaryId = cash.subsidiaryId;
	this.model.warWarehousesId = cash.warWarehousesId;
	this.model.flagActive = cash.flagActive;
	this.model.flagControl = cash.flagControl;
	this.action = { ...this.actionEditCashDeskClosing };
	this.disabledEditCash = Object.keys(cash.balance).length > 0;
}

function rowIsSelected({ id, isSelected }) {
	this.checkAll = this.data.every((row) => row.isSelected);
	if (isSelected) {
		this.dataSelected.push(this.data.find((row) => row.id === id));
	} else {
		const index = this.dataSelected.findIndex((row) => row.id === id);
		this.dataSelected.splice(index, 1);
	}
}

function runAction(item) {
	this.action = { ...this.actionDefault };
	if (item.code === 'NCD') {
		this.action = { ...this.actionNewCashDeskClosing };
	} else if (item.code === 'cash-desk-closing-movement') {
		const id = this.dataSelected[0].id;
		this.goTo(item.codeWeb, { params: { id } });
	} else {
		const query = {
			cashIds: this.dataSelected.map((row) => row.id).join(),
		};
		this.goTo(item.codeWeb, { query });
	}
}

function selectedAll(isSelected) {
	this.checkAll = isSelected;
	this.data = this.data.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = isSelected;
		return newRow;
	});
	this.dataSelected = isSelected ? [...this.data] : [];
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.table.params.search = searchTrim || null;
	this.loadData();
}

function stateName({ flagActive }) {
	return flagActive ? 'Activo' : 'Inactivo';
}

async function changeActive(value, id) {
	const body = {
		flagActive: value,
	};
	try {
		await this.$httpSales.patch(`/cash/${id}/flag-active`, body);
		this.showNotification('Se actualizó correctamente');
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function getAccount(acc) {
	this.model.account = acc.fullName;
	this.model.accountName = acc.name;
	this.model.accountCode = acc.code;
}

async function loadAccountingAccounts() {
	const { company, subsidiary } = this.$userInfo;
	const { country } = company;
	const { ruc } = subsidiary;
	try {
		({ data: this.accountingAccounts } = await this.$httpQuipu.get(
			`accounting-accounts/${country.countryCode}/${ruc}/fb`
		));
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'SUBSIDIARY_NOT_FOUND') {
				this.showGenericError(
					'No se encontró información de cuentas contables para la sucursal.'
				);
			}
		}
	}
}

async function balanceCash(row) {
	const body = {
		currency: this.currencyCode,
	};
	try {
		await this.$httpSales.post(`cash/${row.id}/balance-reset`, body);
		this.showNotification('Se genero el balance de caja correctamente');
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		accountingAccount: {},
		accountingAccounts: [],
		action: {},
		actionDefault: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 0,
		},
		actionEditCashDeskClosing: {
			active: true,
			code: 'ECDC',
			open: true,
			title: 'Editar Caja',
			width: 450,
		},
		actionNewCashDeskClosing: {
			active: true,
			code: 'NCD',
			open: true,
			title: 'Nueva Caja',
			width: 450,
		},
		actions: [],
		cashId: 0,
		checkAll: false,
		columns: [
			{
				id: 1,
				name: 'Nombre de Caja',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Descripción',
				value: 'description',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Tienda',
				value: 'warehouse',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Saldo General',
				value: 'balance',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Saldo Actual',
				value: 'balanceClosing',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Cuenta Contable',
				value: 'accounting',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Fecha de creación',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Acciones',
				value: 'actions',
				visible: true,
				checked: true,
			},
		],
		currencyCode: null,
		currentPage: 1,
		data: [],
		dataSelected: [],
		dialog: false,
		dialogMessage: '',
		headers: {},
		lastPage: 1,
		itemsTotalQuantity: 0,
		loading: false,
		model: {
			accountName: '',
			accountCode: '',
			account: '',
			code: '',
			description: '',
			name: '',
			warWarehousesId: null,
			flagControl: 0,
			flagActive: 1,
			subsidiaryId: null,
		},
		showBalanceSupport: true,
		subsidiaryConfigIntegrations: false,
		disabledEditCash: false,
	};
}

export default {
	name: 'cash-desk-closing-list',
	components: {
		appActions,
		actionSidebar,
		appTable,
		newCashDeskClosing,
	},
	computed: {
		actionDisabled,
		isCashClosingData,
	},
	created,
	data,
	methods: {
		actionInitData,
		applyAction,
		balanceCash,
		closeDialog,
		closeModal,
		deleteCash,
		getAccount,
		getValue,
		goToPage,
		loadAccountingAccounts,
		loadData,
		onPage,
		openConfirmDelete,
		openEditCash,
		rowIsSelected,
		runAction,
		selectedAll,
		changeActive,
		stateName,
		onSearch,
		generateTimeCode6Improved() {
			const now = new Date();

			const year = now.getFullYear().toString().slice(-1);
			const month = (now.getMonth() + 1).toString().slice(-1);
			const day = now.getDate().toString().slice(-1);
			const second = now.getSeconds().toString().slice(-1);
			const millis = now.getMilliseconds().toString().padStart(3, '0').slice(-2);

			return `${year}${month}${day}${second}${millis}`;
		},
	},
};
</script>
