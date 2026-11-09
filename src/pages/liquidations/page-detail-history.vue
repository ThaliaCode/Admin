<template>
	<div class="page-detail-history">
		<header-page
			caption-navigation="Historial de Liquidaciones"
			:showClean="false"
			toShow
			:showExcel="false"
			:title="titleHeader"
		>
			<v-layout row justify-end>
				<v-flex xs4>
					<v-layout column>
						<v-flex class="title-header" text-xs-left>Fecha </v-flex>
						<v-flex class="date-header" text-xs-left>{{
							dateOperation | formatDate
						}}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs3>
					<v-layout column>
						<v-flex class="title-header" text-xs-left
							>Total de Liquidación
						</v-flex>
						<v-flex class="total-header" text-xs-left
							>{{ countryCurrencySymbol }}
							{{ this.totals[3].value | round }}</v-flex
						>
					</v-layout>
				</v-flex>
			</v-layout>
		</header-page>
		<v-flex xs12 text-xs-right mt-4 px-3>
			<v-layout class="h-100" justify-end>
				<v-flex
					xs1
					mx-1
					v-for="total in totals"
					v-show="total.open"
					:key="total.name"
					class="totals"
				>
					<div class="totals__header py-1">{{ total.name }}</div>
					<div class="totals__content">{{ total.value | round }}</div>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex pt-3>
			<app-table
				class="is-not-selectable"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="rows"
				@on-search-event="onSearch"
				@on-page="changePage"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">
						{{ props.row.number }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.commerce.name }}</td>
					<td v-show="showRow(columns, 3)">
						{{ props.row.customer.typePerson.fullName }}
					</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.createdAt | formatDate }}
					</td>
					<td v-show="showRow(columns, 5)">
						{{ props.row.typeOrder || '--' }}
					</td>
					<td v-show="showRow(columns, 6)">
						<v-tooltip top>
							<span slot="activator">{{ props.row.wayPayment }}</span>
							<span>{{ getTexCollection(props.row) }}</span>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 7)">
						<v-tooltip top>
							<span slot="activator">{{ props.row.deliveryCharge }}</span>
							<span>{{ getTexStatusCollection(props.row) }}</span>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 8)">{{ props.row.costDriver || 0 }}</td>
					<td v-show="showRow(columns, 9)">{{ props.row.commission }}</td>
					<td v-show="showRow(columns, 10)">{{ props.row.costShipping }}</td>
					<td v-show="showRow(columns, 11)">
						{{ props.row.amountCollectDriver }}
					</td>
					<td v-show="showRow(columns, 12)" :class="getClassBalance(props.row)">
						{{ props.row.balance }}
					</td>
				</template>
				<template slot="footerSemi">
					<td :colspan="colspanDrivers" class="footer-table"></td>
					<td class="footer-table--select" v-if="showCommerce">
						<div class="footer-table--text">Comisión</div>
						<div>{{ totals[0].value | round }}</div>
					</td>
					<td class="footer-table--select" v-else>
						<div class="footer-table--text">Total de Pedido</div>
						<div>{{ totals[1].value | round }}</div>
					</td>
					<td class="footer-table--select">
						<div class="footer-table--text">Total cobrado</div>
						<div>{{ totals[2].value | round }}</div>
					</td>
					<td class="footer-table--select">
						<div class="footer-table--text error--text">Saldo</div>
						<div class="error--text">{{ totals[3].value | round }}</div>
					</td>
					<td class="footer-table"></td>
				</template>
			</app-table>
		</v-flex>
		<v-dialog v-model="dialogClose" persistent max-width="450" show-slot>
			<modal-items
				v-if="dialogClose"
				title="Cerrar Liquidación"
				name-action="Aceptar"
				show-slot
				:disabled="!dialog.typePaymentId && !dialog.commentary"
				@close-modal="closeDialog"
				@action-modal="closeLiquidation"
			>
				<v-layout column wrap px-4 pt-3 pb-3>
					<v-flex>
						<app-select
							:item="dialog.typePaymentId"
							item-text="paymentType.name"
							item-value="paymentType.id"
							:items="paymentsType"
							label="Tipo de Pago"
							model="typePaymentId"
							:return-object="false"
							@input="setDialog"
						></app-select>
					</v-flex>
					<v-flex mt-2>
						<app-input-text
							textarea
							no-resize
							label="Comentario"
							:text="dialog.commentary"
							model="commentary"
							@input="setDialog"
						/>
					</v-flex>
				</v-layout>
			</modal-items>
		</v-dialog>
		<section
			class="modal-filter-footer"
			v-if="$route.name === 'page-detail-liquidations'"
		>
			<v-flex text-xs-center>
				<v-btn
					v-if="stateLiquidation !== 3"
					type="button"
					class="btn-auto btn-return"
					@click="openDialog"
				>
					Cerrar Liquidación
				</v-btn>
			</v-flex>
		</section>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import modalItems from '@/components/shared/modal-items';

function created() {
	if (this.$route.params.typeLiquidation === 'comercio') {
		this.totals[0].open = false;
		this.totals[1].open = true;
		this.columns[4].visible = true;
		this.columns[5].visible = true;
		this.columns[6].visible = true;
		this.columns[7].visible = true;
		this.columns[8].visible = false;
		this.columns[9].visible = true;
	} else {
		this.totals[0].open = true;
		this.totals[1].open = false;
	}
	this.loadDetail();
	this.loadPaymentType();
}

async function loadPaymentType() {
	try {
		const response = await this.getTypePayments('sales');
		this.paymentsType = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

async function loadDetail() {
	const id = this.$route.params.id;
	this.totals[0].value = 0;
	this.totals[1].value = 0;
	this.totals[2].value = 0;
	this.totals[3].value = 0;
	const params = { ...this.params };
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpSales.get(`liquidations/${id}`, {
			params,
		});
		this.lastPage = Number(response.headers['x-last-page']);
		this.rows = response.data.orders;
		this.numberLiquidation = response.data.number;
		this.stateLiquidation = response.data.liquidStatusId;
		this.rows.forEach((o) => {
			this.totals[0].value += Number(o.commission);
			this.totals[1].value += Number(o.costShipping);
			this.totals[2].value += Number(o.amountCollectDriver);
			this.totals[3].value += o.balance ? Number(o.balance) : 0;
		});
		this.dateOperation = response.data.operationDate;
	} catch (e) {
		this.showGenericError();
	}
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadDetail();
}

function titleHeader() {
	return `LIQUIDACIÓN ${this.numberLiquidation}`;
}

function getTexCollection({ wayPayment }) {
	if (wayPayment) {
		if (wayPayment === 'EFEC') {
			return 'Efectivo';
		}
		return 'Tarjeta';
	}
	return '---';
}

function getTexStatusCollection({ deliveryCharge }) {
	if (deliveryCharge) {
		if (deliveryCharge === 'C') {
			return 'Cobrado';
		}
		return 'Sin cobrar';
	}
	return '---';
}

function colspanDrivers() {
	if (this.$route.params.typeLiquidation === 'comercio') {
		return '7';
	}
	return '3';
}

function showCommerce() {
	return this.$route.params.typeLiquidation === 'repartidor';
}

function getClassBalance({ balance }) {
	if (balance === 0) {
		return 'text-zero';
	} else if (balance < 0) {
		return 'text-less';
	} else if (balance > 0) {
		return 'text-max';
	}
	return 'text-zero';
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

async function closeLiquidation() {
	const body = {
		comments: this.dialog.commentary,
		wayPaymentId: this.dialog.typePaymentId,
	};
	try {
		const idLiquidation = this.$route.params.id;
		await this.$httpSales.patch(`liquidation-finish/${idLiquidation}`, body);
		this.showNotification('La liquidación fue cerrada correctamente.');
		this.closeDialog();
		this.loadDetail();
	} catch (error) {
		this.showGenericError();
	}
}

function closeDialog() {
	this.dialogClose = false;
	this.dialog = {
		typePaymentId: null,
		commentary: null,
	};
}

function openDialog() {
	this.dialogClose = true;
}

function setDialog({ model, value }) {
	this.dialog[model] = value;
}

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Nro de Pedido',
				value: 'commerceName',
				checked: true,
				visible: false,
			},
			{
				id: 2,
				name: 'Comercio',
				value: 'commerceName',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Clientes',
				value: 'commerceName',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Fecha Entreg.',
				value: 'commerceName',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'T. Pedido',
				value: 'commerceName',
				checked: true,
				visible: false,
			},
			{
				id: 6,
				name: 'T. Cobranza',
				value: 'commerceName',
				checked: true,
				visible: false,
			},
			{
				id: 7,
				name: 'Est. Cobro',
				value: 'commerceName',
				checked: true,
				visible: false,
			},
			{
				id: 8,
				name: 'Cost. de Envio',
				value: 'commerceName',
				checked: true,
				visible: false,
			},
			{
				id: 9,
				name: 'Comisión',
				value: 'commerceName',
				checked: true,
				visible: true,
			},
			{
				id: 10,
				name: 'Total Pedido',
				value: 'commerceName',
				checked: true,
				visible: false,
			},
			{
				id: 11,
				name: 'Total Cobrado',
				value: 'commerceName',
				checked: true,
				visible: true,
			},
			{
				id: 12,
				name: 'Saldo',
				value: 'commerceName',
				checked: true,
				visible: true,
			},
		],
		currentPage: 1,
		dateOperation: null,
		dialogClose: false,
		dialog: {
			typePaymentId: null,
			commentary: null,
		},
		lastPage: 0,
		numberLiquidation: '',
		rows: [],
		stateLiquidation: null,
		params: {
			search: null,
			limit: 20,
			page: 1,
		},
		paymentsType: [],
		totals: [
			{
				name: 'Comisión',
				value: 0,
				open: false,
			},
			{
				name: 'Total Cost. Env',
				value: 0,
				open: false,
			},
			{
				name: 'Total Cobrado',
				value: 0,
				open: true,
			},
			{
				name: 'Saldo',
				value: 0,
				open: true,
			},
		],
		totalComission: 0,
	};
}

export default {
	name: 'page-detail-liquidations',
	created,
	data,
	computed: {
		colspanDrivers,
		showCommerce,
		titleHeader,
	},
	components: {
		appTable,
		headerPage,
		modalItems,
	},
	methods: {
		changePage,
		closeDialog,
		closeLiquidation,
		getClassBalance,
		getTexCollection,
		getTexStatusCollection,
		loadDetail,
		loadPaymentType,
		setDialog,
		openDialog,
		onSearch,
	},
};
</script>

<style lang="scss" scoped>
.title-header {
	color: #494949;
	font-family: map-get($fonts, open-semibold);
	font-size: 10px;
}

.total-header {
	color: color(primary);
	font-family: map-get($fonts, open-bold);
	font-size: 16px;
}

.date-header {
	color: #494949;
	font-size: 14px;
	font-family: map-get($fonts, open-bold);
}

.totals {
	background-color: rgba(195, 231, 232, 0.51);
	border-radius: 5px;
	border: 1px solid #c3e7e8;
	color: color(background-sidebar);
	font-size: 12px;
	font-weight: bold;
	text-align: center;

	&__header {
		background: #e2f1f1;
		color: color(selector-color);
		font-family: map-get($fonts, open-semibold);
		font-size: 10px;
	}
}

.totals__header:nth-child(2) {
	color: red !important;
}

.footer-table {
	background-color: #e2f1f1;
	font-size: 12px;
	height: 43px;

	&--select {
		background-color: rgba(195, 231, 232, 0.42);
		color: color(background-sidebar);
		font-size: 13px;
		font-weight: bold;
		text-align: center;
	}

	&--text {
		color: color(paginationText);
		font-size: 10px;
	}
}

.text-less {
	color: color(error);
}

.text-max {
	color: color(accent);
}

.btn-return {
	background-color: map-get($colors, primary) !important;
	border: 1px solid map-get($colors, primary);
	border-radius: 5px;
	color: white;
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, small11);
	padding: 9px 0;
}
</style>
