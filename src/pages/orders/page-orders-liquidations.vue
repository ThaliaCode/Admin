<template>
  <div class="page-orders-liquidations">
		<header-page
			:title="titleHeader"
			:caption-navigation="captionNavigation"
			name="orders-liquidations"
			to-show
			@clean-product-filter="onClean"
			@download-dispatch="downloadOrdersVerify"
			@emit-excel="emitExcel"
			show-excel
			:emit-excel="true"
			:excel-loading="isLoading"
		></header-page>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<v-layout wrap px-4 pt-4>
			<v-flex xs12 mb-3>
				<v-layout>
					<v-flex xs3 pr-2 v-if="showDrivers">
						<app-select
							:item="params.deliveryId"
							item-text="name"
							item-value="id"
							:items="drivers"
							label="Buscar Repartidor"
							model="deliveryId"
							:return-object="false"
							@input="onInput"
							show-autocomplete
						></app-select>
					</v-flex>
					<v-flex xs3 pr-2 v-else>
						<app-select
							:item="params.commerceId"
							item-text="name"
							item-value="id"
							:items="commerces"
							label="Comercio"
							model="commerceId"
							:return-object="false"
							@input="onInput"
							show-autocomplete
						></app-select>
					</v-flex>
					<v-flex xs2 pr-2>
						<app-select
							:item="params.typeOrder"
							item-text="name"
							item-value="id"
							:items="types"
							label="Tipo de pedido"
							model="typeOrder"
							:return-object="false"
							@input="onInput"
							show-autocomplete
						></app-select>
					</v-flex>
					<v-flex xs2 pr-2>
						<app-select
							:item="params.liquidStatus"
							item-text="name"
							item-value="code"
							:items="status"
							label="Estado de liquidación"
							model="liquidStatus"
							:return-object="false"
							@input="onInput"
							show-autocomplete
						></app-select>
					</v-flex>
					<v-flex xs2 class="wrapper-btn">
						<v-btn
							class="btn-action btn-auto px-4 py-2 w-100"
							color="primary"
							@click="loadData"
						>
							Buscar
						</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12>
				<v-layout justify-space-between>
					<v-flex>
						<v-layout row>
							<v-flex xs3>
								<label class="caption">Fecha de liquidación</label>
								<date-component
									:date="params.liquidDate"
									icon="/static/img/calendar.svg"
									@on-input="onInput({ model: 'liquidDate', value: $event })"
								></date-component>
							</v-flex>
							<v-flex xs3 ml-2>
								<label class="caption">Fecha Inicio del Pedido</label>
								<date-component
									:date="params.startDate"
									icon="/static/img/calendar.svg"
									@on-input="onInput({ model: 'startDate', value: $event })"
								></date-component>
							</v-flex>
							<v-flex xs3 ml-2>
								<label class="caption">Fecha Final del Pedido</label>
								<date-component
									:date="params.endDate"
									icon="/static/img/calendar.svg"
									@on-input="onInput({ model: 'endDate', value: $event })"
								></date-component>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs3>
						<v-layout class="h-100" justify-end>
							<v-flex xs3
								mx-1
								v-for="total in totals"
								v-show="total.open"
								:key="total.name"
								class="totals">
							<div class="totals__header py-1">{{ total.name }}</div>
							<div class="totals__content">{{ total.value | round }}</div>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="overflow-auto mt-4">
			<app-table
				class="is-not-selectable"
				name="orders-liquidations"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="orders"
				:checkAll="checkAll"
				selectable
				@on-search-event="onSearch"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
				@on-page="changePage"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.orderNumber }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.commerceName }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.deliveryName }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.customerName }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.createdAt }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.deliveryDate }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.typeOrder || '---' }}</td>
					<td v-show="showRow(columns, 8)">
						<v-tooltip top>
							<span slot="activator">{{ props.row.wayPayment }}</span>
							<span>{{ getTexCollection(props.row) }}</span>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 9)">
						<v-tooltip top>
							<span slot="activator">{{ props.row.deliveryCharge }}</span>
							<span>{{ getTexStatusCollection(props.row) }}</span>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 10)">{{ props.row.costDriver || 0 }}</td>
					<td v-show="showRow(columns, 11)">{{ props.row.costShipping || 0 }}</td>
					<td v-show="showRow(columns, 12)">{{ props.row.total || 0 }}</td>
					<td v-show="showRow(columns, 13)">{{ props.row.amountCollectDriver || 0 }}</td>
					<td v-show="showRow(columns, 14)">
						<span :class="getClassBalance(props.row)">{{ props.row.balance || 0 }}</span>
					</td>
					<td v-show="showRow(columns, 15)">
						<document-state
							:color="getColor(props.row)"
							:tooltip="getTextLiq(props.row)"
						/>
					</td>
					<td v-show="showRow(columns, 16)">{{ props.row.percentageOrder || 0 }}</td>
				</template>
				<template slot="footerSemi">
					<td :colspan="colspanLiquidations" class="footer-table"></td>
					<td class="footer-table--select" v-if="showDrivers">
						<div class="footer-table--text">Comisión</div>
						<div>{{ totalComission | round }}</div>
					</td>
					<td class="footer-table--select" v-else>
						<div class="footer-table--text">Total de Pedido</div>
						<div>{{ totalOrder | round }}</div>
					</td>
					<td class="footer-table--select">
						<div class="footer-table--text">Total cobrado</div>
						<div>{{ totalShipping| round }}</div>
					</td>
					<td class="footer-table--select">
						<div class="footer-table--text">Saldo</div>
						<div>{{ totalBalance | round }}</div>
					</td>
					<td class="footer-table"></td>
					<td class="footer-table" v-if="$route.name === 'liquidations-drivers'"></td>
				</template>
			</app-table>
		</section>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="335">
			<v-card class="modal-items">
				<v-card-title class="modal-items-title">
					<v-flex text-xs-right>
						<button class="btn-close" @click="cancelDialog">x</button>
					</v-flex>
				</v-card-title>
				<v-card-text class="modal-items-title">
					<p class="text-xs-center">¿Estas seguro de realizar esta liquidación?</p>
				</v-card-text>
				<v-card-actions class="modal-items-action">
					<v-layout row wrap>
						<v-flex xs6 pr-1
							text-xs-right>
							<button
								color="pink"
								class="modal-items-btn--cancel"
								@click="cancelDialog">
								NO
							</button>
						</v-flex>
						<v-flex xs6 pl-1
							text-xs-left>
							<button
								color="info"
								class="modal-items-btn"
								@click="liquidationOrder">
								SI
							</button>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import { subDays, format } from 'date-fns';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import dateComponent from '@/components/shared/date-component';
import documentState from '@/components/shared/document-state';
import appActions from '@/components/shared/app-actions';
import helper from '@/shared/helper';

const { exactDate } = helper;

function created() {
	this.loadResource();
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	this.loadData();
	if (this.$route.name === 'liquidations-drivers') {
		this.totals[0].open = true;
		this.columns[0].visible = true;
		this.columns[2].visible = true;
		this.columns[3].visible = false;
		this.columns[4].visible = false;
		this.columns[5].visible = true;
		this.columns[6].visible = false;
		this.columns[8].visible = false;
		this.columns[9].visible = true;
		this.columns[10].visible = true;
		this.columns[11].visible = false;
		this.columns[15].visible = true;
	} else {
		this.totals[1].open = true;
		this.columns[0].visible = false;
		this.columns[2].visible = false;
		this.columns[3].visible = true;
		this.columns[4].visible = true;
		this.columns[5].visible = true;
		this.columns[6].visible = true;
		this.columns[7].visible = true;
		this.columns[8].visible = true;
		this.columns[9].visible = false;
		this.columns[10].visible = true;
		this.columns[15].visible = false;
	}
}

function onInput({ model, value }) {
	this.params[model] = value;
}

function onSearch(search) {
	this.currentPage = 1;
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadData();
}

function rowIsSelected(row) {
	const { orderId, isSelected } = row;
	if (isSelected) {
		this.dataSelected.push(row);
	} else {
		const index = this.dataSelected.findIndex(ds => ds.orderId === orderId);
		this.dataSelected.splice(index, 1);
	}
	this.checkAll = this.orders.every(d => d.isSelected);
}

function selectedAll(check) {
	this.checkAll = check;
	this.orders = this.orders.map((d) => {
		const newD = { ...d };
		newD.isSelected = check;
		return newD;
	});
	this.dataSelected = [...this.orders.filter(d => d.isSelected)];
}

async function loadResource() {
	const request = [
		this.$httpSales('com-ecommerce-companies'),
		this.$httpSales('liquidation-status'),
		this.$httpSales('delivery', { params: { showOrdersInProgress: true } }),
	];
	try {
		const responses = await Promise.all(request);
		this.commerces = responses[0].data;
		this.status = responses[1].data;
		this.drivers = responses[2].data;
	} catch (error) {
		this.showGenericError();
	}
}

async function loadData() {
	this.dataSelected = [];
	this.checkAll = false;
	this.totals[0].value = 0;
	this.totals[1].value = 0;
	this.totals[2].value = 0;
	this.totals[3].value = 0;
	const params = { ...this.params };
	params.limit = 20;
	params.page = this.currentPage;
	if (this.$route.name === 'liquidations-drivers') {
		params.delivery = true;
	}
	try {
		const response = await this.$httpSales('liquidations-orders', { params });
		this.lastPage = Number(response.headers['x-last-page']);
		this.orders = response.data.map((r) => {
			const newOrder = { ...r };
			newOrder.createdAt = exactDate(r.createdAt, 'YYYY-MM-DD HH:mm:ss');
			newOrder.deliveryDate = exactDate(r.deliveryDate, 'YYYY-MM-DD HH:mm:ss');
			return newOrder;
		});
		this.totalComission = 0;
		this.totalOrder = 0;
		this.totalShipping = 0;
		this.totalBalance = 0;
		if (this.orders.length) {
			this.orders.forEach((o) => {
				this.totalComission += o.costDriver ? Number(o.costDriver) : 0;
				this.totalOrder += o.total ? Number(o.total) : 0;
				this.totalShipping += o.amountCollectDriver ? Number(o.amountCollectDriver) : 0;
				this.totalBalance += o.balance ? Number(o.balance) : 0;
			});
		} else {
			this.totalOrder = 0;
			this.totalShipping = 0;
			this.totalBalance = 0;
			this.totalComission = 0;
		}
		this.loadTotalLiquidations();
	} catch (error) {
		this.showGenericErro();
	}
}

async function loadTotalLiquidations() {
	const params = { ...this.params };
	if (this.$route.name === 'liquidations-drivers') {
		params.delivery = true;
	}
	try {
		const response = await this.$httpSales.get('liquidations-orders-total', { params });
		const { totalBalance, totalCostShipping, totalAmountDriver, totalComission } = response.data;
		this.totals[0].value = totalComission;
		this.totals[1].value = totalCostShipping;
		this.totals[2].value = totalAmountDriver;
		this.totals[3].value = totalBalance;
	} catch (e) {
		this.showGenericErro();
	}
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

function getColor({ liquidStatus }) {
	if (liquidStatus) {
		return liquidStatus.colorCode;
	}
	return 'red accent-4';
}

function getTextLiq({ liquidStatus }) {
	if (liquidStatus) {
		return liquidStatus.name;
	}
	return 'No Liquidado';
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

function actionsDisabled() {
	const boolean = this.$route.name === 'liquidations-drivers' ? !this.dataSelected.every(p => p.deliveryId === this.dataSelected[0].deliveryId) &&
		!!this.dataSelected.some(p => p.liquidStatusId === 2)
		: !this.dataSelected.every(p => p.commerceId === this.dataSelected[0].commerceId);
	const disabledActions = [
		{ code: 'liquidate-order', disabled: boolean },
	];
	return disabledActions;
}

function runAction({ code }) {
	if (code === 'liquidate-order') {
		this.dialog = true;
	}
}

async function liquidationOrder() {
	const body = {
		orders: this.dataSelected.map(d => d.orderId),
		commerceId: this.$route.name === 'liquidations-drivers' ?
			undefined : this.params.commerceId || this.dataSelected[0].commerceId,
		deliveryId: this.$route.name === 'liquidations-drivers' ?
			this.params.deliveryId || this.dataSelected[0].deliveryId : undefined,
	};
	try {
		await this.$httpSales.patch('liquidations-orders', body);
		this.showNotification('Los pedidos fueron liquidados correctamente.');
		this.cancelDialog();
		this.onClean();
		this.loadData();
		this.loadTotalLiquidations();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'ORDER_HAS_COMMERCE_LIQUIDATION') {
				this.showGenericError(error.data.messageError);
			}
		} else {
			this.showGenericError();
		}
	}
}

function cancelDialog() {
	this.dialog = false;
}

function onClean() {
	this.params = {
		startDate: format(subDays(this.$today(), 7), 'YYYY-MM-DD'),
		endDate: this.$today(),
		deliveryId: null,
		commerceId: null,
		typeOrder: null,
		liquidStatus: null,
		liquidDate: null,
		limit: 20,
		page: 1,
	};
	this.loadData();
}

async function downloadOrders(id) {
	try {
		const downloadDialog = this.$userInfo.company.settings.downloadSale;
		const model = { code: 'pdf-liq' };
		const responseType = 'blob';
		const contentType = downloadDialog ? 'application/pdf' : 'text/html';
		const response = await this.$httpReportSales.post(`sale-liquids/${id}/pdf`,
			model, { responseType });
		const blob = helper.generateBlob(response.data, contentType);
		helper.showDownloadDialog(blob, 'Liquidacion', downloadDialog);
	} catch (error) {
		this.showGenericError();
	}
}

async function emitExcel() {
	const code = 'xlsx';
	const name = 'Reporte de Liquidación';
	const body = {
		columns: this.columns.reduce((acum, pl) => {
			const newAcum = [...acum];
			if (pl.id !== 12) {
				const newCol = {
					name: pl.name,
					value: pl.value,
				};
				newAcum.push(newCol);
			}
			return newAcum;
		}, []),
		rows: this.orders.map((p) => {
			const newRow = {};
			newRow.numberOrder = p.orderNumber;
			newRow.commerceName = p.commerceName;
			newRow.deliveryName = p.deliveryName;
			newRow.customerName = p.customerName;
			newRow.createdAt = p.createdAt;
			newRow.deliveryDate = p.deliveryDate;
			newRow.typeOrder = p.typeOrder;
			newRow.wayPayment = p.wayPayment;
			newRow.statusCollection = p.deliveryCharge;
			newRow.costDriver = p.costDriver;
			newRow.costShipping = p.costShipping;
			newRow.amountCollectDriver = p.amountCollectDriver;
			newRow.balance = p.balance;
			newRow.liquidStatus = p.liquidStatusId;
			newRow.percentageOrder = p.percentageOrder;
			return newRow;
		}),
		code: 'xlsx',
	};
	const params = { ...this.params };
	try {
		const response = await this.$httpSales.post('reports',
			body, { params, responseType: 'blob' });
		const blob = helper.generateBlob(response.data, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		helper.showDownloadDialog(blob, name, code);
		this.showNotification('El reporte de liquidación fue descargado correctamente.');
	} catch (error) {
		this.showGenericError();
	}
}

function downloadOrdersVerify() {
	if (this.params.commerceId) {
		this.downloadOrders(this.params.commerceId);
	} else {
		this.showNotification('Debe seleccionar un comercio', 'info');
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function showDrivers() {
	return this.$route.name === 'liquidations-drivers';
}

function titleHeader() {
	if (this.$route.name === 'liquidations-drivers') {
		return 'LIQUIDACIONES DE REPARTIDORES';
	}
	return 'LIQUIDACIONES DE COMERCIOS';
}

function captionNavigation() {
	if (this.$route.name === 'liquidations-drivers') {
		return 'Repartidores / Liquidaciones';
	}
	return 'Pedidos / Liquidaciones';
}

function colspanLiquidations() {
	if (this.$route.name === 'liquidations-drivers') {
		return '6';
	}
	return '9';
}

function data() {
	return {
		commerces: [],
		drivers: [],
		params: {
			delivery: null,
			deliveryId: null,
			startDate: null,
			endDate: null,
			commerceId: null,
			typeOrder: null,
			liquidStatus: null,
			liquidDate: null,
		},
		types: [
			{
				name: 'Delivery',
				id: 1,
			},
			{
				name: 'Courier',
				id: 2,
			},
			{
				name: 'Libre',
				id: 3,
			},
		],
		totalComission: 0,
		totalOrder: 0,
		totalShipping: 0,
		totalBalance: 0,
		status: [],
		columns: [
			{
				id: 1,
				name: 'Nro de Ped.',
				value: 'numberOrder',
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
				name: 'Repartidor',
				value: 'deliveryName',
				checked: true,
				visible: false,
			},
			{
				id: 4,
				name: 'Cliente',
				value: 'customerName',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Fecha Creac.',
				value: 'createdAt',
				checked: true,
				visible: false,
			},
			{
				id: 6,
				name: 'Fecha Entreg.',
				value: 'deliveryDate',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'T. Ped.',
				value: 'typeOrder',
				checked: true,
				visible: false,
			},
			{
				id: 8,
				name: 'T. Cobranza',
				value: 'wayPayment',
				checked: true,
				visible: false,
			},
			{
				id: 9,
				name: 'Est. Cobro',
				value: 'statusCollection',
				checked: true,
				visible: false,
			},
			{
				id: 10,
				name: 'Comisión',
				value: 'costDriver',
				checked: true,
				visible: false,
			},
			{
				id: 11,
				name: 'Cost. de Envió',
				value: 'costShipping',
				checked: true,
				visible: true,
			},
			{
				id: 12,
				name: 'Total pedido',
				value: 'total',
				checked: true,
				visible: true,
			},
			{
				id: 13,
				name: 'Total cobrado',
				value: 'amountCollectDriver',
				checked: true,
				visible: true,
			},
			{
				id: 14,
				name: 'Saldo',
				value: 'balance',
				checked: true,
				visible: true,
			},
			{
				id: 15,
				name: 'Est. Liqui',
				value: 'liquidStatus',
				checked: true,
				visible: true,
			},
			{
				id: 16,
				name: 'Por. de la Comisión',
				tooltip: 'Porcentaje de la Comisión',
				value: 'percentageOrder',
				checked: true,
				visible: false,
			},
		],
		currentPage: 1,
		lastPage: 0,
		orders: [],
		checkAll: false,
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
		dataSelected: [],
		dialog: false,
		isLoading: false,
	};
}

export default {
	name: 'page-orders-liquidations',
	data,
	components: {
		autocompleteComponent,
		headerPage,
		appTable,
		dateComponent,
		documentState,
		appActions,
	},
	computed: {
		actionsDisabled,
		captionNavigation,
		colspanLiquidations,
		showDrivers,
		titleHeader,
	},
	created,
	methods: {
		changePage,
		onInput,
		onSearch,
		rowIsSelected,
		selectedAll,
		getTexCollection,
		getTexStatusCollection,
		getColor,
		getTextLiq,
		getClassBalance,
		loadResource,
		loadData,
		loadTotalLiquidations,
		onClean,
		runAction,
		liquidationOrder,
		cancelDialog,
		downloadOrders,
		emitExcel,
		downloadOrdersVerify,
	},
};
</script>
<style lang="scss" scoped>
	.wrapper-btn {
		align-items: flex-end;
		display: flex;
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

	.h-100 {
		height: 100%;
	}

	.footer-table {
		background-color: #e2f1f1;
		font-size: 12px;

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

	.modal-items {
		background: color(white);
		border-radius: 10px;
		box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.5);
		color: color(paginationText);
		font-size: 14px;
		&-title {
			background-color: white;
			color: color(primary);
			padding: 20px 29px;
		}
		&-all {
			background-color: rgba(195, 231, 232, 0.5);
			padding: 9px 0;
		}
		&-btn {
			border: 1px solid color(primary);
			border-radius: 5px;
			color: color(primary);
			font-weight: 600;
			padding: 4px 15px;
			width: 97px;
			&--cancel {
				border: 1px solid color(error);
				border-radius: 5px;
				color: color(error);
				font-weight: 600;
				margin-right: 20px;
				padding: 4px 15px;
				width: 97px;
			}
		}
		&-action {
			background-color: rgba(195, 231, 232, 0.21);
			padding: 15px 0;
		}
	}
</style>
