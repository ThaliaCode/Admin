<template>
	<div class="cash-box-close">
		<header-page
			name="cash-box-close"
			:show-excel="false"
			:show-clean="false"
			title="Cierre de Caja"
			to-show
		>
			<span class="mr-4 bold-text" v-if="modelTab === '0' ? !loading : !loadingBank">
				Total: {{ titleCash }}
			</span>
		</header-page>
		<v-tabs v-model="modelTab" centered color="grey lighten-4">
			<v-tab v-for="tab in tabs" :key="tab.id" :disabled="!isDisabledTab(tab)">
				{{ tab.name }}
			</v-tab>
			<v-tab-item>
				<div v-if="notDataCash">
					<p class="pa-4 not-data">No tiene Cajas</p>
				</div>
				<div v-else>
					<v-progress-circular
						class="load"
						v-show="loading"
						indeterminate
						color="primary"
					></v-progress-circular>
					<section-box
						v-show="!loading"
						:currencies="currencies"
						:cash-boxes="cashBoxes"
						:cash-boxes-all="cashBoxesAll"
						:items="itemsCash"
						:data-graphic="barData"
						:total="balanceCash"
						:current-symbol="currentSymbolCash"
						:select-cash="selectCash"
						:model-tab="modelTab"
						:last-balance="lastBalance"
						:total-cash="totalCash"
						:other-employees-balance="otherEmployeesBalance"
						:subsidiaries="listSubsidiaries"
						:selected-subsidiary="selectedSubsidiary"
						:selected-cash="selectedCash"
						:subsidiary-id="params.subsidiaryId"
						:cash-ids="params.cashIds"
						:flag-set="flagSet"
						show-close
						detail
						@open-entry="openEntry"
						@filter-cash="filterCash"
						@clear-filter="clearCash"
						@change-cash="changeCash"
						@open-egress="openEgress"
						@update-cash="updateCash"
						@transfer-cash="transferCash"
						@change-subsidiary="changeSubsidiary"
						is-cash
					></section-box>
				</div>
			</v-tab-item>
			<v-tab-item>
				<div v-if="notDataBank">
					<p class="pa-4 not-data">No tiene cuentas bancarias</p>
				</div>
				<div v-else>
					<v-progress-circular
						class="load"
						v-show="loadingBank"
						indeterminate
						color="primary"
					></v-progress-circular>
					<section-box
						v-show="!loadingBank"
						@open-entry="openEntry"
						:currencies="currencies"
						:bank-accounts="bankAccounts"
						:data-graphic="barDataBank"
						:total="balanceBank"
						:items="itemsBank"
						:current-symbol="currentSymbolBank"
						:model-tab="modelTab"
						@filter-cash="filterBank"
						@clear-filter="clearBank"
						@open-egress="openEgress"
					/>
				</div>
			</v-tab-item>
		</v-tabs>
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
				:cash="cashBoxes"
				:currencies="currencies"
				:modules="modules"
				:type-payments="typePayments"
				:bank-accounts="bankAccounts"
				:cash-id="params.cashIds"
				:type="action.code"
				:subsidiary-id="selectCash.warehouse.subsidiaryId"
				@close="cancelModal"
				@update-cash="updateCash"
			></new-entry>
			<new-entry-bank
				v-if="action.code === 'new-entry-bank' || action.code === 'new-egress-bank'"
				:currencies="currencies"
				:modules="modules"
				:type-payments="typePaymentsBank"
				:bank-accounts="bankAccounts"
				:type="action.code"
				:bank-account-id="bankAccount"
				@update-bank="updateBank"
			></new-entry-bank>
			<transfer
				v-if="action.code === 'transfer-cash'"
				:items="itemsCashTransfer"
				:params="params"
				:cashBoxesAll="cashBoxesAll"
				:cashBoxes="cashBoxes"
				:cash-origen="selectCash.name"
				:last-balance="balanceCashTransfer"
				:other-employees-balance="otherEmployeesBalanceTransfer"
				@close="updateCash"
			></transfer>
		</action-sidebar>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import sectionBox from '@/components/cash/section-box';
import actionSidebar from '@/components/shared/action-sidebar';
import newEntry from '@/components/cash/new-entry';
import lib from '@/shared/lib';
import newEntryBank from '@/components/cash/new-entry-bank';
import transfer from '@/components/cash/transfer-cash';

const { round } = lib;
const twoDecimals = round(2);

function cancelModal() {
	this.action.open = false;
	this.action.code = null;
}

function openEntry(tab) {
	this.action.open = true;
	this.action.code = tab === '0' ? 'new-entry' : 'new-entry-bank';
	this.action.title = 'Crear Nuevo Ingreso';
	this.action.width = 390;
}

function created() {
	this.employeeId = this.$userInfo.id;
	this.loadResources();
}

async function loadResources() {
	const requests = [
		this.getCurrencies(),
		this.$httpSales.get('cash?flagAll=true'),
		this.$httpSales.get('bank-account'),
		this.$httpSales.get('module'),
		this.$httpSales.get('type-payments?flagType=1'),
		this.$httpSales.get('type-payments?flagType=2'),
		this.$httpSales.get('subsidiaries'),
	];
	[
		{ data: this.currencies },
		{ data: this.cashBoxesAll },
		{ data: this.bankAccounts },
		{ data: this.modules },
		{ data: this.typePayments },
		{ data: this.typePaymentsBank },
		{ data: this.listSubsidiaries },
	] = await Promise.all(requests);
	this.bankAccount = this.bankAccounts.length ? this.bankAccounts[0].id : null;
	if (this.bankAccount) {
		this.filterBank(this.params, this.bankAccounts[0].id);
	} else {
		this.notDataBank = true;
	}
	if (this.listSubsidiaries.length === 1) {
		this.params.subsidiaryId = this.listSubsidiaries[0].id;
		this.loadBoxCash();
	}
	this.currentSymbolBank = this.bankAccounts.length
		? this.bankAccounts[0].currencySymbol
		: null;
}

async function loadCashBox() {
	this.loading = true;
	const body = {
		cashIds: [this.params.cashIds],
		warehouseId: this.flagOutbox ? undefined : this.params.warehouseId,
	};
	if (!this.params.currency) {
		if (this.$route.query.currency) {
			this.params.currency = this.$route.query.currency;
		} else {
			this.params.currency = this.$userInfo.company.currency;
		}
	}
	const url =
		this.isAdmin || this.flagOutbox
			? `cash/${this.params.currency}/report`
			: `cash/${this.params.currency}/report?employeeId=${this.$userInfo.id}`;
	try {
		const { data: response } = await this.$httpSales.post(url, body);
		const totalIncome = twoDecimals(response.totalIncome);
		const totalExpense = twoDecimals(response.totalExpense);
		this.balanceCash = twoDecimals(response.balance);
		this.lastBalance = Number(response.lastBalance)
			? twoDecimals(response.lastBalance)
			: 0;
		this.otherEmployeesBalance = Number(response.otherEmployeesBalance)
			? twoDecimals(response.otherEmployeesBalance)
			: 0;
		if (this.isAdmin) {
			this.barData = {
				datasets: [
					{
						data: [totalIncome, totalExpense, this.lastBalance],
						backgroundColor: ['#4dc68c', '#ef5455', '#68E7AA'],
					},
				],
				labels: ['Ingresos', 'Egresos', 'Saldo anterior'],
			};
			this.totalCash = Number(this.balanceCash + this.lastBalance);
		} else {
			this.barData = {
				datasets: [
					{
						data: [
							totalIncome,
							totalExpense,
							this.lastBalance,
							this.otherEmployeesBalance,
						],
						backgroundColor: ['#4dc68c', '#ef5455', '#68E7AA', '#FFB74C'],
					},
				],
				labels: ['Ingresos', 'Egresos', 'Saldo anterior', 'Venta de otros de empleados'],
			};
			this.totalCash = Number(
				this.balanceCash + this.lastBalance + this.otherEmployeesBalance
			);
		}
		this.itemsCash = response.detail.reduce((acum, r) => {
			const newAcum = [...acum];
			if (r.code !== 'cheque' && r.code !== 'efectivo') {
				const index = newAcum.findIndex((a) => a.code === 'mount-tarj');
				if (index > -1) {
					newAcum[index].amount += r.amount;
					newAcum[index].details.push({
						id: r.id,
						code: r.code,
						amount: r.amount,
						name: r.name,
						typePaymentId: null,
					});
				} else {
					newAcum.push({
						id: 'mount-tarj',
						code: 'mount-tarj',
						amount: r.amount,
						name: 'Monto Tarj. De Crédito',
						typePaymentId: null,
						icon: 'arrow_drop_down',
						open: false,
						details: [
							{
								id: r.id,
								code: r.code,
								amount: r.amount,
								name: r.name,
								typePaymentId: null,
							},
						],
					});
				}
			} else {
				newAcum.push(r);
			}
			return newAcum;
		}, []);
		this.loading = false;
	} catch (error) {
		this.showGenericError();
	}
}

function filterCash(params) {
	this.params.currency = params.currency;
	this.params.cashIds = params.cashIds;
	this.loadCashBox();
}

function clearCash() {
	this.itemsCash = [];
	this.barData = {};
	this.lastBalance = 0;
	this.totalCash = 0;
	this.selectedSubsidiary = true;
	this.selectedCash = true;
	this.params.currency = null;
	this.params.cashIds = null;
	this.params.subsidiaryId = null;
}

function isAdmin() {
	return Boolean(this.$userInfo.flagAdmin);
}

function isDisabledTab(tab) {
	return tab.name === 'Banco' ? this.isAdmin : true;
}

async function filterBank(filter, bank) {
	this.loadingBank = true;
	this.bankAccount = bank;
	const index = this.bankAccounts.findIndex((b) => b.id === bank);
	if (index > -1) {
		this.currentSymbolBank = this.bankAccounts[index].currencySymbol;
	}
	try {
		const { data: response } = await this.$httpSales.get(`bank-account/${bank}/report`);
		this.balanceBank = response.balance;
		this.barDataBank = {
			datasets: [
				{
					data: [response.totalIncome, response.totalExpense],
					backgroundColor: ['#4dc68c', '#ef5455'],
				},
			],
			labels: ['Ingresos', 'Egresos'],
		};
		this.itemsBank = response.detail;
		this.loadingBank = false;
	} catch (error) {
		this.showGenericError();
	}
}

function clearBank() {
	this.filterBank(this.params, this.bankAccounts[0].id);
}

function currencyCash(value) {
	const index = this.currencies.findIndex((c) => c.code === value);
	if (index > -1) {
		this.currentSymbolCash = this.currencies[index].symbol;
	}
}

function changeCash(cash) {
	this.params.cashIds = cash ? cash.id : null;
	this.params.warehouseId = cash ? cash.warWarehousesId : null;
	if (this.cashBoxes.length) {
		this.selectedCash = false;
		const index = this.cashBoxes.findIndex((c) => c.id === cash.id);
		if (index > -1) {
			const cashSelected = this.cashBoxes[index];
			cashSelected.warehouse = cashSelected.warehouse || {};
			this.selectCash = { ...cashSelected };
		}
	} else {
		this.itemsCash = [];
		this.selectedCash = true;
		this.lastBalance = 0;
		this.totalCash = 0;
		this.barData = {};
	}
}

function titleCash() {
	return this.modelTab === '0'
		? `${this.countryCurrencySymbol} ${twoDecimals(this.totalCash)}`
		: `${this.currentSymbolBank} ${twoDecimals(this.balanceBank)}`;
}

function updateCash() {
	this.cancelModal();
	this.loadCashBox();
}

function openEgress(tab) {
	this.action.open = true;
	this.action.code = tab === '0' ? 'new-egress' : 'new-egress-bank';
	this.action.title = 'Crear Nuevo Egreso';
	this.action.width = 390;
}

function updateBank() {
	this.cancelModal();
	this.clearBank();
}

function transferCash() {
	this.action.open = true;
	this.action.code = 'transfer-cash';
	this.action.title = 'Transferir a otra caja';
	this.action.width = 527;
}

async function loadBoxCash() {
	this.selectedSubsidiary = false;
	const params = {
		subsidiaryId: this.isAdmin ? this.params.subsidiaryId : undefined,
	};
	try {
		const response = await this.$httpSales.get('cash', { params });
		this.cashBoxes = response.data;
		if (!this.isAdmin) {
			const cashUser = this.cashBoxes.find((c) => c.id === this.$userInfo.cashId);
			this.changeCash(cashUser);
			this.loadCashBox();
			this.flagSet = !this.flagSet;
		}
		if (this.cashBoxes.length === 1) {
			this.changeCash(this.cashBoxes[0]);
			this.loadCashBox();
			this.flagSet = !this.flagSet;
		} else if (this.cashBoxes.length) {
			if (this.$route.query ? this.$route.query.cashId : false) {
				const cashSelect = this.cashBoxes.find(
					(c) => c.id === Number(this.$route.query.cashId)
				);
				this.changeCash(cashSelect);
				this.loadCashBox();
				this.flagSet = !this.flagSet;
			}
		} else if (this.cashBoxes.length === 0) {
			this.changeCash(null);
			this.flagSet = !this.flagSet;
		}
	} catch (error) {
		this.showGenericError();
	}
}

function changeSubsidiary(value) {
	this.params.subsidiaryId = value;
	this.loadBoxCash();
}

function data() {
	return {
		tabs: [
			{ id: 1, name: 'Caja' },
			{ id: 2, name: 'Banco' },
		],
		modelTab: null,
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 500,
		},
		balanceCashTransfer: null,
		currencies: [],
		cashBoxesAll: [],
		cashBoxes: [],
		employeeId: null,
		params: {
			subsidiaryId: null,
			cashIds: null,
			warehouseId: null,
			currency: null,
		},
		itemsCash: [],
		itemsCashTransfer: [],
		totalIncomeCash: null,
		totalExpenseCash: null,
		barData: {},
		balanceCash: null,
		bankAccounts: [],
		balanceBank: null,
		barDataBank: {},
		itemsBank: [],
		loading: false,
		loadingBank: true,
		currentSymbolBank: null,
		currentSymbolCash: null,
		selectCash: {
			warehouse: {},
		},
		modules: [],
		typePayments: [],
		bankAccount: null,
		typePaymentsBank: [],
		cashSelect: {},
		lastBalance: 0,
		totalCash: 0,
		otherEmployeesBalance: 0,
		notDataBank: false,
		notDataCash: false,
		listSubsidiaries: [],
		selectedSubsidiary: true,
		selectedCash: true,
		otherEmployeesBalanceTransfer: null,
		flagSet: false,
	};
}

export default {
	name: 'page-cash-box-close',
	data,
	created,
	components: {
		headerPage,
		sectionBox,
		actionSidebar,
		newEntry,
		newEntryBank,
		transfer,
	},
	computed: {
		isAdmin,
		titleCash,
	},
	methods: {
		changeSubsidiary,
		cancelModal,
		openEntry,
		loadResources,
		loadCashBox,
		filterCash,
		clearCash,
		loadBoxCash,
		isDisabledTab,
		filterBank,
		clearBank,
		changeCash,
		updateCash,
		openEgress,
		updateBank,
		transferCash,
	},
	watch: {
		'params.currency': currencyCash,
	},
};
</script>
<style lang="scss" scoped>
.bold-text {
	font-size: 20px;
	font-weight: 600;
}
.load {
	display: block;
	margin: auto;
	margin-top: 40px;
}

.not-data {
	color: color(background-card-black);
	font-size: 18px;
}
</style>
