<template>
	<section class="bank-accounts">
		<header-page :title="this.$route.meta.title"></header-page>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<v-layout px-4 pt-3 pb-2 row wrap align-end>
			<v-flex xs2 ml-2>
				<app-select
					label="Tipo de Cuentas"
					item-text="name"
					item-value="id"
					:item="params.typeAccount"
					model="typesAccount"
					:return-object="false"
					:items="typesAccounts"
					@input="setData"
				/>
			</v-flex>
		</v-layout>
		<div class="app-table-container">
			<app-table
				selectable
				name="bank-account"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="rows"
				class="is-not-selectable"
				@row-is-selected="oneSelected"
				@on-page="loadData"
				@on-search-event="onSearchEvent"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.bank.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.accountNumber }}</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.bankAccountTypeDescription }}
					</td>
					<td v-show="showRow(columns, 4)">{{ props.row.currency }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.cityName }}</td>
					<td v-show="showRow(columns, 6)">
						{{
							props.row.accountingAccount || props.row.accountingAccount
								? props.row.accountingAccount.accountingName
								: null
						}}
					</td>
					<td v-show="showRow(columns, 7)">
						<v-tooltip top disabled>
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
					<td v-show="showRow(columns, 8)" class="actions">
						<app-tooltip-button
							class="ml-1"
							color="yellowFav"
							:icon="
								props.row.primaryBankAccount === 1 ? 'star' : 'star_border'
							"
							text="Cuenta Bancaria Principal"
							:size="19"
						/>
						<v-tooltip top>
							<v-icon
								@click="checkActions(actioncheckSequence, props.row)"
								class="secuense-icon"
								slot="activator"
								color="primary"
								>timeline</v-icon
							>
							<span>Secuencia de cheques</span>
						</v-tooltip>
						<v-tooltip top>
							<v-icon
								@click="checkActions(actionCancelCheck)"
								class="null-icon"
								slot="activator"
								color="error"
								>not_interested</v-icon
							>
							<span>Anulación de cheques</span>
						</v-tooltip>
						<v-tooltip top>
							<v-icon
								@click="editBankAccount(props.row)"
								class="null-icon"
								slot="activator"
								color="success"
								>edit</v-icon
							>
							<span>Editar cuenta</span>
						</v-tooltip>
						<app-tooltip-button
							text="Eliminar"
							icon="close"
							color="error"
							@click-icon="openDialog(props.row)"
						/>
					</td>
				</template>
			</app-table>
		</div>
		<v-dialog v-model="dialog" persistent max-width="450">
			<v-card>
				<v-card-title class="headline">Eliminar Cuenta</v-card-title>
				<v-divider></v-divider>
				<v-card-text>
					¿Desea eliminar la cuenta "{{ nameAccount }}"?
				</v-card-text>
				<v-card-actions>
					<v-layout row wrap>
						<v-flex xs6 pr-2 text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelDelete"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-2 text-xs-left>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="deleteAccount"
							>
								Eliminar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="cancelModal(false)"
		>
			<cancel-check-component
				v-if="action.code === 'ACH'"
				@close-modal="closeModal"
			/>
			<check-sequence-component
				v-if="action.code === 'SCH'"
				:bank-account-id="bankAccountId"
				@close-modal="closeModal"
			/>
		</action-sidebar>
	</section>
</template>

<script>
import lib from '@/shared/lib';
import helper from '@/shared/helper';
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import cancelCheckComponent from '@/components/bank-account/sub-components/cancel-check';
import checkSequenceComponent from '@/components/bank-account/sub-components/check-sequence';

const { setLocalData } = helper;
const { isEmpty, setNewProperty } = lib;

function created() {
	this.loadData();
}

function codeAccounting(row) {
	const code = row.accountingAccount ? row.accountingAccount.code : null;
	return code || row.accountingAccount;
}

async function loadData(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	try {
		const { data: rows, headers } = await this.getBankAccount(
			null,
			this.params
		);
		this.rows = rows.map((row) => {
			const newRow = { ...row };
			newRow.cityName = row.city ? row.city.name : '';
			newRow.bankAccountTypeDescription = row.bankAccountType
				? row.bankAccountType.description
				: '';
			return newRow;
		});
		this.lastPage = Number(headers['x-last-page']);
		this.columns[4].visible = this.$userInfo.company.currencies.length > 1;
		if (this.$route.params.modifyAccount) {
			setLocalData('banks-account', this.rows);
		}
	} catch (error) {
		this.showGenericError();
	}
}

function checkActions(action, bankAccount = {}) {
	if (bankAccount.id) this.bankAccountId = bankAccount.id;
	this.action = { ...action };
}

function cancelCheck(action) {
	this.action = { ...action };
}

function closeModal() {
	this.action = { ...this.actionDefault };
}

function editBankAccount({ id }) {
	this.goTo('edit-account-bank', { params: { id } });
}

function cancelDelete() {
	this.dialog = false;
	this.nameAccount = '';
	this.idAccount = null;
}

async function deleteAccount() {
	try {
		await this.$httpSales.delete(`/bank-account/${this.idAccount}`);
		this.showNotification('Se eliminó correctamente');
		this.cancelDelete();
		this.loadData();
	} catch (error) {
		if (error.status === 400) {
			const { message } = error.data;
			if (message === 'TRANSACTION_BANK_EXIST') {
				this.showNotification(
					'No es posible eliminar esta cuenta porque tiene transacciones existentes',
					'error'
				);
			}
		} else {
			this.showGenericError();
		}
	}
}

function openDialog({ name, id }) {
	this.dialog = true;
	this.nameAccount = name;
	this.idAccount = id;
}

function oneSelected(row) {
	this.selectedBankAccount = row;
	this.rows = this.rows.reduce((list, item) => {
		if (item.id === row.id) {
			return list.concat(row);
		}
		const newItem = setNewProperty('isSelected', false)(item);
		return list.concat(newItem);
	}, []);
}

function stateName({ flagActive }) {
	return flagActive ? 'Activo' : 'Inactivo';
}

async function changeActive(value, id) {
	const body = {
		flagActive: value,
	};
	try {
		await this.$httpSales.patch(`/bank-account/${id}/flag-active`, body);
		this.showNotification('Se actualizó correctamente');
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function onSearchEvent(search) {
	this.params.search = search ? search.trim() : null;
	this.loadData();
}

function runAction({ code }) {
	this.$router.push({
		name: code,
		params: { bankAccountId: this.selectedBankAccount.id },
	});
}

function actionsDisabled() {
	const checkBookDisabled = isEmpty(this.selectedBankAccount);
	return [{ code: 'check-book', disabled: checkBookDisabled }];
}

function data() {
	return {
		action: {
			open: false,
			active: false,
			width: 450,
			title: 'Titulo desde Data',
			code: null,
		},
		actionDefault: {
			open: false,
			active: false,
			width: 450,
			title: 'Titulo desde Data',
			code: null,
		},
		actionCancelCheck: {
			open: true,
			active: true,
			width: 500,
			title: 'Anulación de Cheques',
			code: 'ACH',
		},
		actioncheckSequence: {
			open: true,
			active: true,
			width: 500,
			title: 'Secuencia de Cheques',
			code: 'SCH',
		},
		bankAccountId: 0,
		columns: [
			{ id: 1, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 2, name: 'Banco', value: 'bank', visible: true, checked: true },
			{
				id: 3,
				name: 'Número de Cuenta',
				value: 'accountNumber',
				visible: true,
				checked: true,
			},
			{ id: 4, name: 'Tipo', value: 'type', visible: true, checked: true },
			{
				id: 5,
				name: 'Moneda',
				value: 'currency',
				visible: true,
				checked: true,
			},
			{ id: 6, name: 'Ciudad', value: 'city', visible: true, checked: true },
			{
				id: 7,
				name: 'Cuenta Contable',
				value: 'contableAccount',
				visible: true,
				checked: true,
			},
			{ id: 8, name: 'Estado', value: 'status', visible: true, checked: true },
			{
				id: 9,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		dialog: false,
		idAccount: null,
		lastPage: 0,
		nameAccount: '',
		typesAccounts: [
			{
				id: 1,
				name: 'Normal',
			},
			{
				id: 2,
				name: 'Detracción',
			},
		],
		params: {
			flagOrderPrimary: true,
			flagList: 1,
			page: 1,
			limit: 30,
			search: null,
			typeAccount: null,
		},
		rows: [],
		selectedBankAccount: {},
	};
}

export default {
	name: 'bank-accounts',
	components: {
		actionSidebar,
		appActions,
		appTable,
		cancelCheckComponent,
		checkSequenceComponent,
		headerPage,
	},
	computed: {
		actionsDisabled,
	},
	created,
	data,
	methods: {
		cancelCheck,
		cancelDelete,
		codeAccounting,
		checkActions,
		closeModal,
		deleteAccount,
		editBankAccount,
		loadData,
		openDialog,
		oneSelected,
		onSearchEvent,
		runAction,
		stateName,
		changeActive,
		setData({ model, value }) {
			this.params[model] = value;
			this.loadData();
		},
	},
};
</script>

<style lang="scss" scoped>
.app-table-container {
	height: 100vh;
	padding: 40px 0 0 0;
}

.actions {
	align-items: center;
	display: flex;
	justify-content: space-evenly;
}

.null-icon,
.secuense-icon {
	cursor: pointer;
	font-size: 18px;
}
</style>
