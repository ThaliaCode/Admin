<template>
	<div>
		<header-page
			name="terminal-detail"
			:limit-title="68"
			:title="$route.meta.title"
			to-show
			column-class="xs12"
			:show-clean="false"
			:show-excel="false"
		>
			<v-layout column>
				<v-flex text-xs-right class="header-title"> Saldo Final del cierre </v-flex>
				<v-flex text-xs-right class="text-bold">
					{{ symbol }} {{ balance | round }}
				</v-flex>
			</v-layout>
		</header-page>
		<general-filter mt-3 class="layout wrap align-end">
			<v-flex xs12 sm4 lg2 px-1 my-2 mr-3>
				<app-select
					chips
					:items="typePayments"
					item-text="paymentType.name"
					item-value="paymentType.id"
					label="Tipo de Pago"
					model="typePaymentParams"
					multiple
					:return-object="false"
					:item="typePaymentParams"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 sm4 lg2 px-1 my-2 mr-3>
				<app-select
					chips
					:items="typeMovements"
					item-text="name"
					item-value="id"
					label="Tipo de Movimiento"
					model="typeMovementsParams"
					multiple
					:return-object="false"
					:item="typeMovementsParams"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 sm4 lg2 px-1 my-2 mr-3>
				<app-select
					chips
					:items="typeModules"
					item-text="name"
					item-value="id"
					label="Origen"
					model="typeModuleParams"
					multiple
					:return-object="false"
					:item="typeModuleParams"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs3 sm2 lg1 px-1 my-2>
				<v-btn
					type="button"
					color="primary"
					class="btn-action btn-action-block"
					@click="filterData"
				>
					Buscar
					<v-icon color="white" size="16"> check_circle_outline </v-icon>
				</v-btn>
			</v-flex>
			<v-flex xs3 sm2 lg1 px-1 my-2>
				<v-btn color="pink" class="btn-action btn-action-block" @click="clearFilter">
					Limpiar
				</v-btn>
			</v-flex>
		</general-filter>
		<v-divider></v-divider>
		<v-layout wrap justify-center px-5 mt-3>
			<v-flex
				v-for="(detail, index) in details"
				:key="detail.id"
				class="register-detail-container mb-2 ml-1"
			>
				<register-detail
					:field="detail.field"
					:label="detail.label"
					:large="detail.large"
					:value="`${symbol || ''} ${detail.value}`"
					large-head
					:green-head="index === 6"
				></register-detail>
			</v-flex>
		</v-layout>
		<div class="layout wrap align-start justify-center mt-3">
			<v-flex :class="toShow ? 'xs8 active' : 'xs12'">
				<app-table
					name="box-history-detail"
					class="is-not-selectable"
					:class="{ 'pr-0': toShow }"
					:columns="columns"
					:current-page="current"
					:last-page="lastPage"
					:rows="rows"
					:input-search="false"
					:paint-row="['typeMovement', 2]"
					@on-page="onPage"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable" v-show="showRow(columns, 1)">
							{{ props.row.createdAt | formatDate('YYYY-MM-DD') }}
						</td>
						<td v-show="showRow(columns, 2)">
							{{ props.row.typeTransaction === 1 ? 'Caja' : 'Banco' }}
						</td>
						<td v-show="showRow(columns, 3)">{{ getModuleRow(props.row) }}</td>
						<td v-show="showRow(columns, 4)">{{ getTypePaymentRow(props.row) }}</td>
						<td v-show="showRow(columns, 5)">
							{{ getCurrencyRow(props.row) }}
							{{ getPaymentAmount(props.row) }}
						</td>
						<td v-show="showRow(columns, 6)">
							<app-tooltip-button
								:icon="props.row.iconArrow"
								text="Ver Detalle En Tabla"
								color="success"
								size="20"
								@click-icon="showDetail(props.row)"
							/>
						</td>
					</template>
				</app-table>
			</v-flex>
			<v-flex xs4 :class="{ active: toShow }" v-show="toShow" pr-4>
				<v-layout row wrap class="table-detail">
					<v-flex xs12 class="head-table">
						<v-layout row wrap>
							<v-flex xs8 class="date-table">{{
								rowDetailSelected.createdAt | formatDate('YYYY-MM-DD')
							}}</v-flex>
							<v-flex xs3>
								<div class="label-head">Importe</div>
								<div>{{ rowDetailSelected.currencySymbol }}{{ getAmount }}</div>
							</v-flex>
							<v-flex xs1 pt-3>
								<button @click="closeDetail">
									<v-icon color="white">clear</v-icon>
								</button>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 wrap>
						<v-layout wrap pa-3 class="items-table">
							<v-layout xs12 row align-center>
								<v-flex xs6>
									<v-layout row wrap align-center>
										<v-flex d-flex align-center pl-2 class="column-label">
											Código:
										</v-flex>
										<v-flex d-flex align-center class="column-value">
											{{ getCode }}
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs6 pl-2>
									<v-layout row wrap align-center>
										<v-flex d-flex align-center pl-2 class="column-label">
											Doc. Origen:
										</v-flex>
										<v-flex d-flex align-center class="column-value">
											{{ getDocumentNumber }}
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
							<v-flex xs12>
								<v-layout row wrap align-center mt-2>
									<v-flex d-flex align-center pl-2 class="column-label"> Fecha: </v-flex>
									<v-flex d-flex align-center class="column-value">
										{{ rowDetailSelected.createdAt | formatDate('YYYY-MM-DD') }}
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12>
								<v-layout row wrap align-center mt-2>
									<v-flex xs12 d-flex align-center pl-2 class="column-label w-100">
										Referencia:
									</v-flex>
									<v-flex xs12 d-flex align-center class="column-value">
										{{ getReference }}
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12>
								<v-layout row wrap align-center mt-2>
									<v-flex xs12 d-flex align-center pl-2 class="column-label w-100">
										Concepto:
									</v-flex>
									<v-flex xs12 d-flex align-center class="column-value">
										{{ rowDetailSelected.concept }}
									</v-flex>
								</v-layout>
							</v-flex>
							<v-layout xs12 mt-2 row align-center>
								<v-flex xs6>
									<v-layout row wrap align-center>
										<v-flex d-flex align-center pl-2 class="column-label">
											Asiento:
										</v-flex>
										<v-flex d-flex align-center class="column-value">
											{{ rowDetailSelected.accountingSeatCode }}
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs6 pl-2>
									<v-layout row wrap align-center>
										<v-flex d-flex align-center pl-2 class="column-label">
											Origen:
										</v-flex>
										<v-flex d-flex align-center class="column-value">
											{{ getModule }}
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
							<v-flex xs12>
								<v-layout row wrap align-center mt-2>
									<v-flex d-flex align-center pl-2 class="column-label"> Pago: </v-flex>
									<v-flex d-flex align-center class="column-value">
										{{ getTypePayment }}
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12>
								<v-layout row wrap align-center mt-2>
									<v-flex xs12 d-flex align-center pl-2 class="column-label w-100">
										Comentario:
									</v-flex>
									<v-flex xs12 d-flex align-center class="column-value">
										{{ getComment }}
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</div>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import registerDetail from '@/components/movements-in-accounts/register-detail';
import lib from '@/shared/lib';

const { getDeeper } = lib;

function created() {
	console.log(this.$route.query);
	const { startAmount, cash, card, voucher, cashAmountKept, deposit } = this.$route.query;
	this.details[0].value = startAmount || 0;
	this.details[1].value = Number(cash) || 0;
	this.details[2].value = Number(card) || 0;
	this.details[3].value = Number(voucher) || 0;
	this.details[4].value = Number(cashAmountKept) || 0;
	this.details[5].value = Number(deposit) || 0;
	const sumTotal =
		Number(
			this.details[1].value +
				this.details[2].value +
				this.details[3].value +
				this.details[5].value
		) || 0;
	this.details[6].value = Number(sumTotal) || 0;
	this.loadResources();
	this.loadData();
}

async function loadResources() {
	const requests = [
		this.getTypePayments('sales'),
		this.$httpSales('module'),
		this.$httpSales('type-movement'),
	];
	[
		{ data: this.typePayments },
		{ data: this.typeModules },
		{ data: this.typeMovements },
	] = await Promise.all(requests);
}

async function loadData() {
	const id = this.$route.params.id;
	const params = {
		typePaymentIds: this.body.typePaymentIds
			? this.body.typePaymentIds.join(',')
			: undefined,
		typeMovements: this.body.typeMovements
			? this.body.typeMovements.join(',')
			: undefined,
		moduleIds: this.body.moduleIds ? this.body.moduleIds.join(',') : undefined,
	};
	try {
		const response = await this.$httpSales.get(`cash-closing/${id}/details`, { params });
		this.lastPage = Number(response.headers['x-last-page']);
		this.rows = response.data.map((r) => {
			const newRow = { ...r };
			newRow.cancelRow =
				(r.accTransactionEvent && [3, 4, 5].includes(r.accTransactionEvent.stateId)) ||
				undefined;
			newRow.iconArrow = 'arrow_forward';
			return newRow;
		});
		if (this.rows.length) {
			this.symbol = this.$route.query.currency;
			this.balance = this.$route.query ? this.$route.query.endAmount || 0 : 0;
		} else {
			this.symbol = null;
			this.balance = null;
		}
	} catch (error) {
		this.showGenericError();
	}
}

function showDetail(row) {
	this.rowDetailSelected = this.rowDetailSelected.id === row.id ? {} : { ...row };
	this.toShow = !!this.rowDetailSelected.id;
	this.rows.forEach((d) => {
		const arrow = d.id === row.id && this.toShow ? 'arrow_back' : 'arrow_forward';
		this.$set(d, 'iconArrow', arrow);
	});
}
function closeDetail() {
	this.toShow = false;
	this.rows = this.rows.map((r) => {
		const newRow = { ...r };
		newRow.iconArrow = 'arrow_forward';
		return newRow;
	});
}

function onPage(page) {
	this.current = page;
	this.loadData();
}

function setData({ model, value }) {
	this[model] = value;
}

function getComment() {
	if (this.rowDetailSelected.transaction) {
		return getDeeper(
			'additionalInformation',
			'comment'
		)(this.rowDetailSelected.transaction);
	}
	return getDeeper('additionalInformation', 'comment')(this.rowDetailSelected);
}

function getCustomer() {
	return getDeeper('customer', 'name')(this.rowDetailSelected);
}

function getBank() {
	return getDeeper('bank', 'name')(this.rowDetailSelected);
}

function getTypePayment() {
	if (this.rowDetailSelected.transaction) {
		return getDeeper('typePayment', 'name')(this.rowDetailSelected.transaction);
	}
	return getDeeper('typePayment', 'name')(this.rowDetailSelected.transactionBank);
}

function getModule() {
	if (this.rowDetailSelected.transaction) {
		return getDeeper('module', 'name')(this.rowDetailSelected.transaction);
	}
	return getDeeper('module', 'name')(this.rowDetailSelected.transactionBank);
}

function getAmount() {
	if (this.rowDetailSelected.transaction) {
		return this.rowDetailSelected.transaction.paymentAmount || 0;
	}
	return this.rowDetailSelected.transactionBank
		? this.rowDetailSelected.transactionBank.paymentAmount
		: 0;
}

function getDocumentNumber() {
	if (this.rowDetailSelected.transaction) {
		return `${
			this.rowDetailSelected.transaction.additionalInformation &&
			this.rowDetailSelected.transaction.additionalInformation.typeDocumentCode
				? this.rowDetailSelected.transaction.additionalInformation.typeDocumentCode
				: ''
		} -
			${
				this.rowDetailSelected.transaction.additionalInformation &&
				this.rowDetailSelected.transaction.additionalInformation.documentNumber
					? this.rowDetailSelected.transaction.additionalInformation.documentNumber
					: ''
			}`;
	}
	return `${
		this.rowDetailSelected.transactionBank
			? this.rowDetailSelected.transactionBank.typeDocumentCode
			: null
	} -
		${
			this.rowDetailSelected.transactionBank
				? this.rowDetailSelected.transactionBank.documentNumber
				: null
		}`;
}

function getCode() {
	if (this.rowDetailSelected.transaction) {
		return this.rowDetailSelected.transaction
			? this.rowDetailSelected.transaction.code
			: null;
	}
	return this.rowDetailSelected.transactionBank
		? this.rowDetailSelected.transactionBank.code
		: null;
}

function getReference() {
	if (this.rowDetailSelected.transaction) {
		return getDeeper(null, 'documentNumberOrigin')(this.rowDetailSelected.transaction);
	}
	return getDeeper(null, 'documentNumberOrigin')(this.rowDetailSelected.transactionBank);
}

function getModuleRow(row) {
	if (row.transaction) {
		return row.transaction.module ? row.transaction.module.name : null;
	}
	return row.transactionBank.moduleOrigin ? row.transactionBank.moduleOrigin.name : null;
}

function getTypePaymentRow(row) {
	if (row.transaction) {
		return row.transaction.typePayment ? row.transaction.typePayment.name : null;
	}
	return row.transactionBank.typePayment
		? row.transactionBank.typePayment.description
		: null;
}

function getCurrencyRow(row) {
	if (row.transaction) {
		return row.transaction.currencySymbol;
	}
	return row.transactionBank.currency === 'PEN' ? 'S/' : '$';
}

function getPaymentAmount(row) {
	if (row.transaction) {
		return row.transaction.paymentAmount;
	}
	return row.transactionBank.paymentAmount;
}

function filterData() {
	this.body.typePaymentIds = this.typePaymentParams.length
		? this.typePaymentParams
		: null;
	this.body.moduleIds = this.typeModuleParams.length ? this.typeModuleParams : null;
	this.body.typeMovements = this.typeMovementsParams.length
		? this.typeMovementsParams
		: null;
	this.loadData();
}

function clearFilter() {
	this.typePaymentParams = [];
	this.typeModuleParams = [];
	this.typeMovement = this.$route.query.typeMovement;
	this.filterData();
}

function data() {
	return {
		balance: null,
		body: {},
		lastPage: 0,
		current: 1,
		columns: [
			{ id: 1, name: 'Fecha', value: 'date', visible: true, checked: true },
			{ id: 2, name: 'Tipo de Mov.', value: 'origin', visible: true, checked: true },
			{ id: 3, name: 'Origen', value: 'typePayment', visible: true, checked: true },
			{ id: 4, name: 'Tipo de Pago', value: 'mount', visible: true, checked: true },
			{ id: 5, name: 'Importe', value: 'mount', visible: true, checked: true },
			{ id: 6, name: 'Acción', value: 'action', visible: true, checked: true },
		],
		details: [
			{
				id: 1,
				label: 'Saldo anterior',
				value: '---',
			},
			{
				id: 2,
				label: 'EFECTIVO',
				value: '---',
			},
			{
				id: 3,
				label: 'Monto Tarjeta.',
				value: '---',
			},
			{
				id: 4,
				label: 'Monto Cheque',
				value: '---',
			},
			{
				id: 5,
				label: 'Mantener en caja',
				value: '---',
			},
			{
				id: 6,
				label: 'Deposito',
				value: '---',
			},
			{
				id: 7,
				label: 'TOTAL',
				value: '---',
			},
		],
		rows: [],
		toShow: false,
		symbol: null,
		rowDetailSelected: {},
		typePayments: [],
		typePaymentParams: [],
		typeModules: [],
		typeModuleParams: [],
		typeMovements: [],
		typeMovementsParams: [],
	};
}

export default {
	name: 'detail-terminal',
	created,
	data,
	components: {
		appTable,
		headerPage,
		generalFilter,
		registerDetail,
	},
	computed: {
		getAmount,
		getBank,
		getCode,
		getCustomer,
		getComment,
		getDocumentNumber,
		getModule,
		getTypePayment,
		getReference,
	},
	methods: {
		getPaymentAmount,
		getCurrencyRow,
		getTypePaymentRow,
		getModuleRow,
		clearFilter,
		closeDetail,
		filterData,
		loadData,
		loadResources,
		setData,
		showDetail,
		onPage,
	},
};
</script>

<style lang="scss" scoped>
.head-table {
	background: color(primary);
	color: map-get($colors, white);
	font-weight: 800;
	height: 62px;
}

.date-table {
	font-size: 18px;
	padding: 10px;
}

.label-head {
	font-size: 13px;
	padding-top: 5px;
}

.table-detail {
	background: map-get($colors, white);
	border: 1px solid map-get($colors, blue-grey);
	border-radius: 0 0 19px 0;
}

.w-100 {
	max-width: 100% !important;
}

.header-title {
	color: color(background-sidebar);
	font-size: map-get($sizes, small);
	font-family: map-get($fonts, open-semibold);
}

.items-table {
	font-size: 15px;
}

.pr-0 {
	padding-right: 0 !important;
}

.text-bold {
	color: color(primary);
	font-family: map-get($fonts, open-bold);
	font-size: 19px;
}
</style>
