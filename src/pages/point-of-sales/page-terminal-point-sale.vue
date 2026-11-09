<template>
	<div class="page-terminal">
		<header-page :title="$route.meta.title" :limit-title="50" />
		<app-actions
			:resource-uri="$route.name"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<div>
			<v-layout px-5 py-4 align-end>
				<v-flex xs12 sm4 md3 lg2 v-if="!isEmployee">
					<app-select
						:item="params.subsidiaryId"
						model="subsidiaryId"
						item-text="sucursalName"
						item-value="id"
						label="Sucursal"
						:items="subsidiaries"
						@input="setSubsidiaryIdFilter"
					/>
				</v-flex>
				<v-flex xs12 sm4 md3 lg2 ml-2>
					<app-select
						:item="params.cashId"
						model="cashId"
						item-text="name"
						item-value="id"
						label="Caja"
						:items="cashs"
						@input="setCashId"
						:disabled="!isAdmin"
					/>
				</v-flex>
				<v-flex xs3 md4 sm5 ml-3>
					<app-select
						model="currencyIdParams"
						label="Tipo de moneda"
						:items="currencies"
						item-text="name"
						item-value="id"
						v-model="currencyIdParams"
						@input="setCurrencyParams"
					/>
				</v-flex>
				<v-flex xs3 md4 sm5 class="align-col" ml-3>
					<v-btn
						type="button"
						color="primary"
						class="btn-action mt-3"
						@click="loadData(null)"
						:disabled="!params.cashId"
					>
						Buscar
					</v-btn>
					<v-btn
						type="button"
						color="error"
						class="btn-action mt-3 ml-2"
						@click="clearFilters"
					>
						Limpiar
					</v-btn>
				</v-flex>
			</v-layout>
			<v-divider></v-divider>
			<v-flex mt-4>
				<app-table :columns="columns" :rows="rows" @on-search-event="onSearchEvent">
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">
							{{ props.row.name }}
						</td>
						<td v-show="showRow(columns, 2)">
							{{ props.row.cashDeskClosing ? props.row.cashDeskClosing.nameUser : null }}
						</td>
						<td v-show="showRow(columns, 3)">
							{{ props.row.cash ? props.row.cash.name : null }}
						</td>
						<td v-show="showRow(columns, 4)">
							{{ labelDateOpened(props.row) || '-' }}
						</td>
						<td v-show="showRow(columns, 5)">
							{{ labelClosedAt(props.row) || '-' }}
						</td>

						<td v-show="showRow(columns, 6)">{{ getTypeClose(props.row) }}</td>
						<td v-show="showRow(columns, 7)">
							<document-state
								:color="colorState(props.row)"
								:tooltip="tooltipState(props.row)"
							/>
						</td>
						<td v-show="showRow(columns, 8)">
							{{ rowCurrency(props.row) }} {{ totalSales(props.row) }}
						</td>
						<td v-show="showRow(columns, 9)">
							<!-- <app-tooltip-button
								v-if="showDetailIcon(props.row)"
								class="ml-1"
								color="primary"
								icon="dashboard"
								text="Ver Resumen de Cierre"
								@click-icon="openCash(props.row)"
							/> -->
							<app-tooltip-button
								v-if="showDetailIcon(props.row)"
								class="ml-1"
								color="primary"
								icon="visibility"
								text="Ver Detalle"
								@click-icon="goToDetail(props.row)"
							/>
							<app-tooltip-button
								v-if="showClosedAt(props.row)"
								class="ml-1"
								text="Cierre de Caja"
								icon="point_of_sale"
								color="success"
								@click-icon="openCash(props.row)"
							/>
							<app-tooltip-button
								v-if="showDetailIcon(props.row)"
								class="ml-1"
								img="/static/icon/a-icono-excel.svg"
								text="Descargar Reporte Detallado"
								@click-icon="downloadReport(props.row, 'detail')"
							></app-tooltip-button>
							<app-tooltip-button
								v-if="showDetailIcon(props.row)"
								class="ml-1"
								img="/static/icon/a-icono-excel.svg"
								text="Descargar Resumen del Reporte"
								@click-icon="downloadReport(props.row, 'resumen')"
							></app-tooltip-button>
						</td>
					</template>
				</app-table>
			</v-flex>
		</div>
		<action-sidebar
			content-modal="#f3fafb"
			v-model="action.open"
			:active="action.open"
			:title="action.title"
			:code-action="action.code"
			:width="558"
			@close-modal="closeModal"
		>
			<v-container px-0 v-if="action.code === 'opening-cash'">
				<v-layout column>
					<v-flex primary--text px-4 class="ft-14 open-semibold">
						Nombre del Usuario:
					</v-flex>
					<v-flex class="ft-14" primary--text px-4>{{ $userInfo.name }}</v-flex>
					<v-layout px-4 mt-3 mb-3>
						<v-flex v-if="!isEmployee" xs7>
							<app-select
								label="Sucursal"
								:item="subsidiaryId"
								:items="subsidiaries"
								item-text="sucursalName"
								item-value="id"
								model="subsidiaryId"
								@input="setSubsidiaryId"
							/>
						</v-flex>
						<v-flex v-if="showCurrency" pl-3>
							<app-select
								label="Moneda"
								:item="currency"
								:items="currencies"
								item-text="name"
								item-value="id"
								model="currency"
								@input="setCurrencyParams"
							/>
						</v-flex>
					</v-layout>
					<v-flex mb-3 px-4>
						<app-select
							:disabled="!subsidiaryId"
							:item="terminalId"
							label="Escoge Terminal de Punto de Venta"
							item-text="name"
							item-value="id"
							:items="terminals"
							model="terminalId"
							@input="setTerminal"
						/>
					</v-flex>
					<v-flex
						xs12
						secondary--text
						mt-3
						px-4
						pt-3
						pb-3
						class="border-top"
						v-if="additionalInformation"
					>
						<v-layout align-center justify-space-between>
							<v-flex xs6 class="lato-bold ft-12">SALDO INICIAL:</v-flex>
							<v-flex xs6 text-xs-right class="bold">
								{{ additionalInformation.currencySymbol }}
								{{ additionalInformation.balance }}
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<v-layout
							row
							align-center
							justify-space-between
							px-4
							:class="flagOutbox ? 'py-4' : ''"
							class="border-top backgrond-green"
							v-for="(item, index) in additionalInformation.details"
							:key="index"
						>
							<v-flex grayText--text>
								<v-layout row align-center>
									<v-flex v-if="!flagOutbox" xs1 mt-4>
										<v-checkbox
											color="primary"
											v-model="item.flagForm"
											label=""
										></v-checkbox>
									</v-flex>
									<v-flex xs5 ml-2 class="lato-bold ft-12">{{ item.name }}</v-flex>
								</v-layout>
							</v-flex>
							<v-flex text-xs-right grayText--text class="ft-14 bold">
								{{ additionalInformation.currencySymbol }}
								{{ item.amount | round }}
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex mt-3 xs12 class="content-cash" py-4 px-4>
						<v-layout align-center justify-space-between>
							<v-flex grayText--text xs6 class="ft-14">
								¿Desea agregar un Saldo inicial a esta caja?
							</v-flex>
							<v-flex xs6 ml-5>
								<v-flex xs5>
									<app-input-text
										model="balance"
										:text="balance"
										@input="setBalance"
									></app-input-text>
								</v-flex>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-container>
			<section class="fast-register-footer">
				<modal-sidebar-button
					success-color="primary"
					success-text="Apertura"
					:is-loading="!terminalId || !currency || isLoading"
					@cancel-button-clicked="closeModal"
					@accept-button-clicked="openingCash"
				/>
			</section>
		</action-sidebar>
	</div>
</template>

<script>
import { format } from 'date-fns';
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import appTable from '@/components/shared/table/app-table';
import documentState from '@/components/shared/document-state';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadSubsidiaries();
	this.loadCash();
	this.showCurrency = this.$userInfo.company.currencies.length > 1;
	if (this.showCurrency) {
		this.loadCurrencies();
	}
	if (!this.isAdmin) {
		this.params.cashId = this.$userInfo.cashId;
	}
	this.loadData(null);
}

async function loadSubsidiaries() {
	try {
		({ data: this.subsidiaries } = await this.subsidiariesList());
		if (this.subsidiaries.length === 1) {
			this.subsidiaryId = this.subsidiaries[0].id;
			this.loadData(this.subsidiaries[0].id, true);
		}
	} catch (error) {
		console.error(error);
		this.showGenericError();
	}
}

async function loadData(subsidiaryId, withOutFlagListSimple) {
	const params = {
		...this.params,
		flagListSimple: true,
	};
	if (withOutFlagListSimple) {
		delete params.flagListSimple;
	}
	params.currency = this.currencyIdParams
		? this.currencyIdParams
		: this.$userInfo.company.currency;
	if (subsidiaryId) {
		params.subsidiaryId = subsidiaryId;
		delete params.cashId;
	}
	try {
		const response = await this.$httpSales.get('terminals', { params });
		if (subsidiaryId) {
			this.terminals = response.data;
			if (this.terminals.length === 1) {
				this.terminalId = this.terminals[0].id;
				this.amountBalance(this.terminals[0]);
				this.cashIdTerminal = this.terminals[0].cashId;
				this.loadInformationAdittional();
			}
		} else {
			this.rows = response.data;
		}
	} catch (error) {
		console.error(error);
		if (error?.data?.message && error?.data?.messageError) {
			this.showGenericError(error?.data?.messageError);
		} else {
			this.showGenericError();
		}
	}
}

async function loadCash(subsidiaryId) {
	try {
		const response = await this.$httpSales.get('cash', {
			params: { flacActive: 1, subsidiaryId },
		});
		this.cashs = response.data;
		if (this.cashs.length === 1) {
			this.params.cashId = this.cashs[0].id;
		}
	} catch (error) {
		this.showGenericError();
	}
}

function onSearchEvent(search) {
	this.params.search = search ? search.trim() : null;
	this.loadData(null);
}

function setCashId({ model, value }) {
	this.params[model] = value.id;
}

function setCurrencyParams({ model, value }) {
	if (value) {
		this[model] = value.id;
		if (this.terminalId) {
			this.loadInformationAdittional();
		}
	}
}

function clearFilters() {
	this.params = {
		currency: this.$userInfo.company.currency,
		cashId: !this.isAdmin ? this.$userInfo.cashId : null,
		flagCashClosing: true,
		subsidiaryId: null,
	};
	this.currencyIdParams = null;
	this.loadData(null);
}

function openCash(row) {
	const cashClosing = row.cashDeskClosing.id;
	this.goTo('page-closing-internal', {
		params: {
			cashId: row.cashId,
			cashClosingId: cashClosing,
			currency: row.cashDeskClosing.currency,
			employeeId: row.cashDeskClosing.employeeId,
		},
	});
}

function goToDetail({ cashId, cash, cashDeskClosing, cashDeskClosingId }) {
	const query = {
		currency: cashDeskClosing.currency,
		cashId,
		cashName: cash.name,
		endAmount: cashDeskClosing.endAmount,
		startAmount: cashDeskClosing.startAmount,
		cash: cashDeskClosing.cashRegisterInformation
			? cashDeskClosing.cashRegisterInformation.cash
			: null,
		card: cashDeskClosing.cashRegisterInformation
			? cashDeskClosing.cashRegisterInformation.card
			: null,
		voucher: cashDeskClosing.cashRegisterInformation
			? cashDeskClosing.cashRegisterInformation.voucher
			: null,
		deposit: cashDeskClosing.cashRegisterInformation
			? cashDeskClosing.cashRegisterInformation.deposit
			: null,
		cashAmountKept: cashDeskClosing.cashRegisterInformation
			? cashDeskClosing.cashRegisterInformation.cashAmountKept
			: null,
	};
	const routeData = this.$router.resolve({
		name: 'detail-terminal',
		params: { id: cashDeskClosingId },
		query,
	});
	window.open(routeData.href, '_blank');
}

function totalSales(row) {
	let amountsale = 0;

	if (Object.hasOwn(row, 'outboxBalance') && row.outboxBalance != null) {
		return row.outboxBalance;
	}

	if (this.$userInfo.company.currency === 'PEN' && row.cash) {
		amountsale = row.cash.balance.PEN ? row.cash.balance.PEN.toFixed(2) : 0;
	} else {
		amountsale = row.cash.balance ? row.cash.balance.USD : 0;
	}
	if (row.cashDeskClosing) {
		if (row.cashDeskClosing.closedAt) {
			if (row.cashDeskClosing.statusTransfers === 3) {
				const kept =
					row.cashDeskClosing.cashRegisterInformation &&
					row.cashDeskClosing.cashRegisterInformation.cashAmountKept;
				return Number(kept || 0).toFixed(2);
			}
			return row.cashDeskClosing.totalSales
				? row.cashDeskClosing.totalSales.toFixed(2)
				: 0;
		}
	}
	return amountsale || 0;
}
async function downloadReport({ dateOpened, closedAt, cashDeskClosingId }, report) {
	const body = {
		typeReport: report === 'detail' ? 1 : 2,
		endDate: closedAt
			? format(closedAt, 'YYYY-MM-DD')
			: format(closedAt, 'YYYY-MM-DD-HH-mm-ss'),
		startDate: format(dateOpened, 'YYYY-MM-DD'),
		salCashClosingId: cashDeskClosingId,
	};
	try {
		const responseType = 'blob';
		const response = await this.$httpSales.post('reports/point-sale-tpv', body, {
			responseType,
		});
		const blob = helper.generateBlob(response.data);
		helper.showDownloadDialog(blob, 'pdf');
	} catch (error) {
		this.showGenericError();
	}
}

function isAdmin() {
	return Boolean(this.$userInfo.flagAdmin);
}

function isEmployee() {
	return Boolean(this.$userInfo.roleId === 4309);
}

function labelDateOpened(row) {
	if (row.cashDeskClosing) {
		if (row.cashDeskClosing.dateOpened) {
			return format(new Date(row.cashDeskClosing.dateOpened), 'DD/MM/YYYY HH:mm:ss');
		}
	}
	return null;
}

function labelClosedAt(row) {
	if (row.cashDeskClosing) {
		if (row.cashDeskClosing.closedAt) {
			return helper.exactDate(row.cashDeskClosing.closedAt, 'DD/MM/YYYY HH:mm:ss');
		}
	}
	return null;
}

function colorState(row) {
	if (row.cashDeskClosing) {
		if (row.cashDeskClosing.closedAt) {
			return 'error';
		}
	}
	return 'success';
}

function tooltipState(row) {
	if (row.cashDeskClosing) {
		if (row.cashDeskClosing.closedAt) {
			return 'Cerrado';
		}
	}
	return 'Abierto';
}

function showClosedAt(row) {
	if (row.cashDeskClosing) {
		if (row.cashDeskClosing.dateOpened) {
			if (row.cashDeskClosing.closedAt) {
				return false;
			}
		}
		return true;
	}
	return false;
}

function rowCurrency(row) {
	if (row.cashDeskClosing) {
		if (row.cashDeskClosing.currencySymbol) {
			return row.cashDeskClosing.currencySymbol;
		}
	}
	return null;
}

function showDetailIcon(row) {
	if (row.cashDeskClosing) {
		if (row.cashDeskClosing.dateOpened) {
			if (row.cashDeskClosing.closedAt) {
				return true;
			}
		}
	}
	return false;
}

function runAction(item) {
	this.action = {
		active: true,
		code: item.code,
		open: true,
		title: 'APERTURAR CAJA',
	};
	// this.loadData(item.code);
	this.loadSubsidiaries();
	this.loadCurrencies();
}

async function loadCurrencies() {
	try {
		const response = await this.$httpSales.get('currency-company', {
			params: { company: true },
		});
		this.currencies = response.data;
		if (this.currencies.length === 1) {
			this.currency = this.currencies[0].id;
		} else {
			this.currency = this.$userInfo.company.currencyDefault.id;
		}
	} catch (error) {
		this.showGenericError();
	}
}

function setTerminal({ model, value }) {
	this[model] = value.id;
	this.amountBalance(value);
	this.cashIdTerminal = value.cashId;
	this.loadInformationAdittional();
}

async function loadInformationAdittional() {
	const params = {
		currency: this.currency,
	};
	try {
		const response = await this.$httpSales.get(`cash/${this.cashIdTerminal}/balance`, {
			params,
		});
		this.additionalInformation = response.data;
		this.additionalInformation.balance =
			this.flagOutbox && response.data.details && response.data.details[0]
				? response.data.details[0].amount
				: response.data.balance;
	} catch (error) {
		this.showGenericError();
	}
}

function amountBalance(value) {
	if (this.$userInfo.company.currency === 'PEN') {
		if (value.cash) {
			this.balanceTerminal =
				value.cash.balance && value.cash.balance.PEN
					? value.cash.balance.PEN.toFixed(2)
					: 0;
		}
	} else {
		this.balanceTerminal = value.cash ? value.cash.balance.USD : null;
	}
	if (value.cashDeskClosing) {
		if (value.cashDeskClosing.closedAt) {
			return value.cashDeskClosing ? value.cashDeskClosing.totalSales.toFixed(2) : 0;
		}
	}
	return this.balanceTerminal || null;
}

async function openingCash() {
	this.isLoading = true;
	const body = {
		terminalId: this.terminalId,
		currency: this.currency,
		balanceWithOpening: this.balance,
	};
	try {
		await this.$httpSales.post('cash-desk-closing/open', body);
		this.showNotification('La caja se aperturo correctamente.');
		this.closeModal();
		this.loadData(null);
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'TERMINAL_NOT_FOUND') {
				this.showGenericError('No existe la terminal.');
			} else if (err.data.message === 'CASH_WITH_ACTIVE_OPENING_STATUS') {
				this.showGenericError('Ya se encuentra aperturada la terminal.');
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}

function closeModal() {
	this.action = {
		open: false,
		code: '',
		title: '',
	};
	this.additionalInformation = {};
	this.subsidiaryId = null;
	this.currency = null;
	this.terminalId = null;
	this.balanceTerminal = null;
	this.balance = null;
}

function setCurrency({ model, value }) {
	this[model] = value.code;
	this.loadInformationAdittional();
}

function setBalance({ model, value }) {
	this[model] = value;
}

function setSubsidiaryId({ model, value }) {
	if (this.terminalId) {
		this.terminalId = null;
		this.additionalInformation = {};
	}
	this[model] = value.id;
	this.loadData(value.id, true);
}

function setSubsidiaryIdFilter({ model, value }) {
	this.params[model] = value.id;
	this.loadCash(value.id);
}

function data() {
	return {
		action: {
			code: '',
			open: false,
			active: false,
			width: 400,
			title: '',
		},
		additionalInformation: {},
		balance: null,
		balanceTerminal: 0,
		cashIdTerminal: null,
		cashs: [],
		cashId: null,
		columns: [
			{ id: 1, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 2, name: 'Usuarios', value: 'user', visible: true, checked: true },
			{ id: 3, name: 'Caja', value: 'cash', visible: true, checked: true },
			{
				id: 4,
				name: 'Hora de Apertura',
				value: 'startDate',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Hora de Cierre',
				value: 'closedAt',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Tipo de cierre',
				value: 'statusTransfers',
				visible: true,
				checked: true,
			},
			{ id: 7, name: 'Estado', value: 'state', visible: true, checked: true },
			{
				id: 8,
				name: 'Monto Acum.',
				value: 'totalSales',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Acción',
				value: 'Usuarios',
				visible: true,
				checked: true,
			},
		],
		currency: null,
		currencies: [],
		isLoading: false,
		rows: [],
		subsidiaries: [],
		currencyIdParams: null,
		params: {
			flagCashClosing: true,
			cashId: null,
			search: null,
		},
		showCurrency: false,
		subsidiaryId: null,
		terminals: [],
		terminalId: null,
	};
}

export default {
	name: 'page-terminal-point-sale',
	created,
	components: {
		appActions,
		actionSidebar,
		appTable,
		documentState,
		modalSidebarButton,
	},
	computed: {
		isAdmin,
		isEmployee,
	},
	data,
	headerPage,
	methods: {
		amountBalance,
		closeModal,
		colorState,
		downloadReport,
		totalSales,
		clearFilters,
		goToDetail,
		loadCash,
		loadCurrencies,
		loadData,
		loadInformationAdittional,
		loadSubsidiaries,
		setBalance,
		setCashId,
		setSubsidiaryId,
		setSubsidiaryIdFilter,
		setCurrency,
		tooltipState,
		openingCash,
		openCash,
		onSearchEvent,
		labelDateOpened,
		labelClosedAt,
		showDetailIcon,
		showClosedAt,
		runAction,
		rowCurrency,
		setCurrencyParams,
		setTerminal,
		getTypeClose(row) {
			if (!row.cashDeskClosing) return '-';

			return row.cashDeskClosing.statusTransfers === 1
				? 'En proceso'
				: row.cashDeskClosing.statusTransfers === 2
				? 'Parcial'
				: 'Completo';
		},
	},
};
</script>

<style lang="scss" scoped>
.bold {
	font-family: map-get($fonts, open-bold);
}

.content-cash {
	background-color: #e2f1f1;
}

.ft-14 {
	font-size: 14px;
}

.open-semibold {
	font-family: map-get($fonts, open-semibold);
}

.lato-bold {
	font-family: map-get($fonts, lato-bold);
}

.ft-12 {
	font-size: 12px;
}

.border-top {
	border-top: 1px solid #e2f1f1;
	border-bottom: 1px solid #e2f1f1;
}

.backgrond-green {
	background-color: #e2f1f1;
}
</style>
