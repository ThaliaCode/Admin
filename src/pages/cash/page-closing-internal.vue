<template>
	<div>
		<header-page :title="$route.meta.title" />
		<v-layout py-3 px-4 justify-end align-center>
			<v-flex xs1 pl-2>
				<v-layout column class="content-column">
					<v-flex text-xs-center class="header-column py-1"># Doc Ingresos</v-flex>
					<v-flex text-xs-center class="footer-column py-1">{{
						contentHeader.docEntry
					}}</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs1 pl-2>
				<v-layout column class="content-column">
					<v-flex text-xs-center class="header-column py-1"># Doc Egresos</v-flex>
					<v-flex text-xs-center class="footer-column py-1">{{
						contentHeader.docOut
					}}</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs1 pl-2>
				<v-layout column class="content-column">
					<v-flex text-xs-center class="header-column py-1"># Total Doc</v-flex>
					<v-flex text-xs-center class="footer-column py-1">{{ totalDoc || 0 }}</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout wrap class="content-grafic">
			<v-flex xs12 px-4 ma-3 pb-3 class="content-information">
				<v-layout>
					<v-flex>
						<v-layout row wrap align-center px-2>
							<v-flex d-flex align-center pl-2 class="column-label"> Sucursal: </v-flex>
							<v-flex d-flex align-center pl-2 class="column-value">
								{{ contentHeader.subsidiary }}
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex>
						<v-layout row wrap align-center px-2>
							<v-flex d-flex align-center pl-2 class="column-label"> Tienda: </v-flex>
							<v-flex d-flex align-center pl-2 class="column-value">
								{{ contentHeader.warehouse }}
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex v-if="!flagOutbox">
						<v-layout row wrap align-center px-2>
							<v-flex d-flex align-center pl-2 class="column-label"> TPV </v-flex>
							<v-flex d-flex align-center pl-2 class="column-value">
								{{ contentHeader.terminal }}
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex>
						<v-layout row wrap align-center px-2>
							<v-flex d-flex align-center pl-2 class="column-label"> Usuarios </v-flex>
							<v-flex d-flex align-center pl-2 class="column-value">
								{{ contentHeader.employee }}
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-layout mt-2>
					<v-flex xs12 md3>
						<v-layout row wrap align-center px-2>
							<v-flex d-flex align-center pl-2 class="column-label"> Hora Apert. </v-flex>
							<v-flex d-flex align-center pl-2 class="column-value">
								{{ contentHeader.createdAt | formatDate }}
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 px-5>
				<v-flex>
					<v-progress-circular
						v-show="loading"
						class="load"
						indeterminate
						color="primary"
					/>
				</v-flex>
				<section-cash-internal
					:currency="currency"
					:cash-boxes="cashBoxes"
					:data-graphic="barData"
					:transaction-box="transactionBox"
					:transaction-bank="transactionBank"
					:transaction-out="transactionOut"
					:total-entry="totalEntry"
					:total-egress="totalEgress"
					:currency-symbol="currencySymbol"
					:total-cash="totalCash"
					:total-bank="totalBank"
					:cash-id="cashId"
					:cash-name="cashOrigen"
					:subsidiary-id="subsidiaryId"
					:total-last="contentHeader.lastBalance"
					:total-entry-employee="otherEmployeesBalance"
					:cash-closing="$route.params.cashClosingId"
					:show-refresh="!closedAt"
					:total-cash-general="totalCashGeneral"
					:transaction-bank-expense="transactionBankExpense"
					:transaction-bank-expense-total="transactionBankExpenseTotal"
					:total-out-cash="totalOutCash"
					:allTotals="allTotals"
					@open-entry="openEntry"
					@open-egress="openEgress"
				/>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer" v-if="!closedAt">
			<modal-sidebar-button
				:img="false"
				padding-cancel="px-4 py-2"
				padding-success="px-4 py-2"
				cancel-color="success"
				cancel-text="Cerrar Caja"
				success-text="Transferir a otra caja"
				success-color="primary"
				@cancel-button-clicked="dialogCloseCash"
				@accept-button-clicked="openTransfer"
			/>
		</section>
		<section class="modal-filter-footer" v-else>
			<v-flex text-xs-center>
				<v-btn
					color="primary"
					class="btn-action btn-auto px-5 py-2 mr-1 py-1"
					type="button"
					@click="goToTerminal"
				>
					Volver
				</v-btn>
			</v-flex>
		</section>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			content-modal="#f3fafb"
			@close-modal="cancelModal"
		>
			<new-entry
				v-if="action.code === 'new-entry' || action.code === 'new-egress'"
				:only-read="true"
				:currencies="currencies"
				:modules="modules"
				:bank-accounts="bankAccounts"
				:type="action.code"
				:cash-id="cashId"
				:cash="cashBoxes"
				:subsidiary-id="subsidiaryId"
				:currency-entry="currency"
				:model-origin="modelOrigin"
				@close-modal="cancelModal"
				@update-cash="updateCash"
			/>
			<new-entry-bank
				v-if="action.code === 'new-entry-bank' || action.code === 'new-egress-bank'"
				:currencies="currencies"
				:modules="modules"
				:bank-accounts="bankAccounts"
				:bank-account-id="bankAccount"
				:type="action.code"
				@update-cash="updateCash"
			/>
			<transfer-cash-internal
				v-if="action.code === 'transfer-cash'"
				:cash-id="cashId"
				:cash-closing="$route.params.cashClosingId"
				:currency="this.$route.params.currency"
				:cashBoxesAll="cashBoxesAll"
				:other-employees-balance="otherEmployeesBalanceTransfer"
				:last-balance="balanceCashTransfer"
				:cash-origen="cashOrigen"
				@close="updateCash"
			/>
		</action-sidebar>
		<v-dialog v-model="closeCash" max-width="430px">
			<v-card>
				<v-card-text>
					<v-layout row>
						<v-flex xs12 class="center">¿Desea cerrar la caja?</v-flex>
					</v-layout>
				</v-card-text>
				<v-card-actions class="wrapper-actions">
					<v-layout row justify-space-around>
						<v-flex xs3>
							<v-btn
								color="pink"
								class="btn-action btn-action-block"
								@click="cancelClose"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs3>
							<v-btn
								color="success"
								class="btn-action btn-action-block"
								@click="closeCashBox"
							>
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="noAccessDialog" max-width="400px" persistent>
			<v-card class="pa-4">
				<v-card-title class="headline d-flex justify-center text-center font-weight-medium">
					Acceso denegado
				</v-card-title>
				<v-card-text class="text-center pt-2 body-1">
					{{ noAccessMessage }}
				</v-card-text>
				<v-card-actions class="justify-center mt-2">
					<v-btn 
						color="teal" 
						dark 
						class="px-8" 
						rounded
						@click="goBackNoAccess"
					>
						Volver
					</v-btn>
				</v-card-actions>
			</v-card>
</v-dialog>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import headerPage from '@/components/shared/header-page';
import lib from '@/shared/lib';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import newEntryBank from '@/components/cash/new-entry-bank';
import newEntry from '@/components/cash/new-entry';
import sectionCashInternal from '@/components/cash/section-cash-internal';
import transferCashInternal from '@/components/cash/transfer-cash-internal';

const { round } = lib;
const twoDecimals = round(2);

function created() {
	this.loadResources();
}

async function loadResources() {
	const requests = [
		this.getCurrencies(),
		this.$httpSales.get('cash?flagAll=true'),
		this.$httpProducts.get('warehouses'),
		this.$httpSales.get('module'),
		// this.$httpSales.get('type-payments?flagType=1'),
		// this.$httpSales.get('type-payments?flagType=2'),
		this.$httpSales.get('bank-account'),
	];
	[
		{ data: this.currencies },
		{ data: this.cashBoxesAll },
		{ data: this.warehouses },
		{ data: this.modules },
		// { data: this.typePayments },
		// { data: this.typePaymentsBank },
		{ data: this.bankAccounts },
	] = await Promise.all(requests);
	this.bankAccount = this.bankAccounts.length ? this.bankAccounts[0].id : null;
	this.loadCashClosing();
}

async function loadBoxCash() {
	const params = {
		subsidiaryId: this.isAdmin ? this.subsidiaryId : undefined,
	};
	try {
		const response = await this.$httpSales.get('cash', { params });
		this.cashBoxes = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function isAdmin() {
	return Boolean(this.$userInfo.flagAdmin);
}

async function loadCashClosing() {
	this.loading = true;
	const params = {
		// report: true,
		// typeDashboard: 1,
		// employeeId: !this.isAdmin ? this.$userInfo.id : undefined,
	};
	const body = {
		cashId: this.$route.params.cashId,
		cashClosingId: this.$route.params.cashClosingId,
		typeDashboard: 2,
		// employeeId: this.flagOutbox ? this.$route.params.employeeId : undefined,
	};
	const currency = this.$route.params.currency;
	try {
		const { data: response } = await this.$httpSales.post(
			`cash/${currency}/dashboard`,
			body,
			{ params }
		);
		const {
			transaction,
			transactionBank,
			transactionExpense,
			transactionTotal,
			transactionBankTotal,
			transactionBankExpenseTotal,
			transactionBankExpense,
			transactionExpenseTotal,
			otherEmployeesBalance,
			lastBalance,
		} = response;
		const totalIncome = twoDecimals(response.totalIncome);
		const totalExpense = twoDecimals(response.totalExpense);
		this.closedAt = response.cashDeskClosing.closedAt;
		this.currencySymbol = response.cashDeskClosing.currencySymbol;
		this.currency = response.cashDeskClosing.currency;
		this.terminalId = response.cashDeskClosing.terminalId;
		this.transactionBox = transaction;
		this.transactionBank = transactionBank;
		this.transactionBankExpense = transactionBankExpense;
		this.transactionOut = transactionExpense;
		this.totalEntry = totalIncome;
		this.totalEgress = totalExpense;
		this.totalCash = transactionTotal;
		this.totalBank = transactionBankTotal;
		this.transactionBankExpenseTotal = transactionBankExpenseTotal;
		this.totalOutCash = transactionExpenseTotal;
		this.cashOrigen = response.cashDeskClosing.cash.name;
		this.subsidiaryId = response.cashDeskClosing.cash.subsidiary.id;
		this.otherEmployeesBalance = Number(response.otherEmployeesBalance) || 0;
		this.contentHeader.createdAt = response.cashDeskClosing.dateOpened;
		this.contentHeader.lastBalance = response.lastBalance;
		this.contentHeader.subsidiary = response.cashDeskClosing.cash.subsidiary.sucursalName;
		this.contentHeader.terminal = response.cashDeskClosing.terminal.name;
		this.contentHeader.employee = response.cashDeskClosing.employee.name;
		this.contentHeader.docEntry = response.countIncome;
		this.contentHeader.docOut = response.countExpense;
		const totalCashGeneral = Number(
			totalIncome + totalExpense + otherEmployeesBalance + lastBalance
		);
		this.allTotals = {
			totalLast: lastBalance,
			totalEntry: totalIncome,
			totalEgress: totalExpense,
			totalIncome,
			totalOtherEmpleyees: otherEmployeesBalance,
			totalCashGeneral,
			totalCash: transactionTotal,
			totalBank: transactionBankTotal,
			totalAmount: response.totalAmount,
		};
		this.totalDoc = Number(this.contentHeader.docEntry + this.contentHeader.docOut);
		this.cashId = Number(response.cashDeskClosing.cashId);
		const warehouseSelected = this.warehouses.find(
			(p) => p.id === response.cashDeskClosing.cash.warWarehousesId
		);
		this.contentHeader.warehouse = warehouseSelected.name;
		this.otherEmployeesBalance = Number(response.otherEmployeesBalance)
			? twoDecimals(response.otherEmployeesBalance)
			: 0;
		this.barData = {
			datasets: [
				{
					data: [totalIncome, totalExpense, lastBalance, otherEmployeesBalance],
					backgroundColor: ['#B2DD00', '#ef5455', '#68E7AA', '#FFB74C'],
				},
			],
			labels: ['Ingresos', 'Egresos', 'Saldo anterior', 'Ingresos otros empleados'],
		};
		this.totalCashGeneral = Number(
			this.totalEntry +
				this.totalEgress +
				(this.flagOutbox ? 0 : this.otherEmployeesBalance) +
				this.contentHeader.lastBalance
		);
	} catch (error) {	
		const status = error.status || (error.response && error.response.status);
    	const errorData = error.data || (error.response && error.response.data);
		if (status === 400 && errorData && errorData.message === 'USER_NO_ACCESS') {
    		this.noAccessMessage = errorData.messageError || 'No tienes permiso para acceder a esta caja.';
    		this.noAccessDialog = true;
    	} else {
    		this.showGenericError();
    	}
	} finally {
		this.loading = false;
	}
}



function goBackNoAccess() {
    this.noAccessDialog = false;
    this.$router.back();
}

function dialogCloseCash() {
	this.closeCash = true;
}

function openTransfer() {
	this.action.open = true;
	this.action.code = 'transfer-cash';
	this.action.title = 'Transferir a otra caja';
	this.action.width = 527;
	// this.loadCashClosingTransfer(this.report);
}

function cancelModal() {
	this.action.open = false;
	this.action.code = null;
}

async function closeCashBox() {
	const params = {
		currency: this.$route.params.currency,
		cashId: this.cashId,
	};
	const body = {
		terminalId: this.terminalId,
	};
	try {
		await this.$httpSales.post('cash-desk-closing/mobile', body, { params });
		this.showNotification('La caja se cerró correctamente');
		this.closeCash = false;
		this.loadCashClosing();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'CASH_DESK_CLOSING_NOT_FOUND') {
				this.showNotification('La caja ya esta cerrada.', 'error');
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function openEntry(tab) {
	this.action.open = true;
	this.action.code = tab === 'ingreso' ? 'new-entry' : 'new-entry-bank';
	this.action.title = 'Crear Nuevo Ingreso';
	this.action.width = 390;
	// this.modelOrigin = this.modules[4].id;
	this.loadBoxCash();
}

function openEgress(tab) {
	this.action.open = true;
	this.action.code = tab === 'egreso' ? 'new-egress' : 'new-egress-bank';
	this.action.title = 'Crear Nuevo Egreso';
	this.action.width = 390;
	this.loadBoxCash();
}

function cancelClose() {
	this.closeCash = false;
}

function updateCash() {
	this.cancelModal();
	this.loadCashClosing();
}

function goToTerminal() {
	this.goTo('terminal-point-sale');
}

function data() {
	return {
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 500,
		},
		bankAccounts: [],
		cashId: null,
		closedAt: null,
		contentHeader: {
			createdAt: null,
			lastBalance: null,
		},
		currency: null,
		currencies: [],
		cashOrigen: null,
		modules: [],
		report: true,
		barData: {},
		balanceCashTransfer: null,
		closeCash: false,
		otherEmployeesBalance: null,
		otherEmployeesBalanceTransfer: null,
		closingInternal: {},
		cashBoxes: [],
		loading: false,
		modelOrigin: null,
		subsidiaryId: null,
		totalCash: null,
		totalEntry: null,
		totalEgress: null,
		currencySymbol: null,
		terminalId: null,
		totalCashGeneral: null,
		totalBank: null,
		totalDoc: null,
		// typePayments: [],
		// typePaymentsBank: [],
		noAccessDialog: false,
		noAccessMessage: '',
		transactionBox: [],
		transactionBank: [],
		transactionBankExpense: [],
		transactionBankExpenseTotal: 0,
		totalOutCash: 0,
		transactionOut: [],
		warehouses: [],
		bankAccount: null,
		allTotals: {},
	};
}

export default {
	name: 'page-closing-internal',
	data,
	created,
	components: {
		actionSidebar,
		headerPage,
		newEntry,
		newEntryBank,
		modalSidebarButton,
		sectionCashInternal,
		transferCashInternal,
	},
	computed: {
		isAdmin,
	},
	methods: {
		goToTerminal,
		goBackNoAccess,
		updateCash,
		cancelClose,
		openEntry,
		cancelModal,
		closeCashBox,
		dialogCloseCash,
		loadBoxCash,
		loadCashClosing,
		loadResources,
		openEgress,
		openTransfer,
	},
};
</script>

<style lang="scss" scoped>
.header-column {
	background-color: #e2f1f1;
	color: color(primary);
	font-size: 11px;
	font-family: map-get($colors, open-semibold);
}

.content-column {
	border: 1px solid #c3e7e8;
	border-radius: 5px;
	// max-width: 90px;
}

.footer-column {
	background-color: rgba(195, 231, 232, 0.51);
	color: color(sidebar);
	font-family: map-get($colors, open-bold);
	font-size: 11px;
	font-weight: bold;
}

.content-closing {
	background-color: #ffffff;
	border-radius: 27px;
	box-shadow: 0 2px 11px 0 rgba(0, 0, 0, 0.09);
	padding: 27px 22px;
}

.center {
	text-align: center;
}

.content-grafic {
	background-color: #fbfbfb;
	box-shadow: 0 2px 11px 0 rgba(0, 0, 0, 0.09);
}

.content-information {
	border-bottom: 1px solid #e3f2f2;
}

.column-value {
	font-size: 0.8rem;
}
</style>
