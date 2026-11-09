<template>
    <div>
		<header-page
			:title="$route.meta.title"
		/>
		<div class="px-5">
			<v-layout class="mt-3 px-4">
				<app-select
					label="Estado"
					placeholder="Seleccionar"
					item-text="name"
					item-value="id"
					:items="states"
					return-object
					@input="selectedState"
				></app-select>
			</v-layout>
			<div class="mt-4">
				<app-table
					:columns="columns"
					:rows="rows"
					class="is-not-selectable pa-0"
					:last-page="lastPage"
					:currentPage="currentPage"
					:inputSearch="false"
					@on-page="changePage"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row ? props.row.dateTransaction : null | formatDate }}</td>
						<td v-show="showRow(columns, 2)">{{props.row.id}}</td>
						<td v-show="showRow(columns, 3)">{{props.row.amount}}</td>
						<td v-show="showRow(columns, 4)">{{props.row.paymentStateName}}</td>
						<td v-show="showRow(columns, 5)">{{props.row.referenceId}}</td>
						<td v-show="showRow(columns, 6)">{{props.row.dateExpiration | formatDate}}</td>
						<td v-show="showRow(columns, 7)">
							<v-layout>
								<v-flex>
									<v-tooltip top>
										<v-btn
											icon
											@click="openDialogAuthorization(props.row)"
											slot="activator"
											:disabled="props.row.paymentStates === 1"
											>
											<img :class="{ 'filter-image' : props.row.paymentStates === 1 }" src="/static/icon/transaction-action.svg" alt="">
										</v-btn>
										<span>Autorizar Pago</span>
									</v-tooltip>
								</v-flex>
								<v-flex>
									<v-tooltip top>
										<v-btn
											slot="activator"
											icon
											@click="openDialogOrders(props.row)"
										>
											<v-icon color="primary">remove_red_eye</v-icon>
										</v-btn>
										<span>Ver pedidos</span>
									</v-tooltip>
								</v-flex>
							</v-layout>
						</td>
					</template>
				</app-table>
			</div>
		</div>
		<v-dialog
			v-model="dialogAuthorization"
			persistent
			max-width="375"
		>
			<v-card class="dialog-authorization">
				<v-card-title px-4 class="title-dialog">
					<v-layout row align-center>
						<v-flex>AUTORIZAR PAGO</v-flex>
						<v-flex text-xs-right>
							<v-btn icon @click="closeDialogAuthorization">
								<v-icon color="primary">close</v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-title>
				<v-card-text class="px-5 content-dialog">
					{{ dialogMessageAuthorization }}
				</v-card-text>
				<v-card-actions class="background-close">
					<v-flex text-xs-center>
						<v-btn
							class="btn-close-dialog"
							@click="closeDialogAuthorization"
						>
							NO
						</v-btn>
						<v-btn
							class="btn-accept-dialog"
							@click="authorizationOrder"
						>
							SI
						</v-btn>
					</v-flex>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog
			v-model="dialogOrders"
			persistent
			max-width="375"
		>
			<v-card class="dialog-authorization">
				<v-card-title px-4 class="title-dialog">
					<v-layout row align-center>
						<v-flex>PEDIDOS</v-flex>
						<v-flex text-xs-right>
							<v-btn icon @click="closeDialogOrder">
								<v-icon color="primary">close</v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-title>
				<v-card-text class="section-order" v-if="this.orders.length > 0">
					<v-layout row wrap align-center>
						<v-flex class="title-modal-orders" xs6>Nro de Pedido</v-flex>
						<v-flex class="title-modal-orders">Estado</v-flex>
					</v-layout>
					<v-layout row v-for="(item, index) in orders" :key="index" class="mt-1 mb-2">
						<v-flex class="item-order">
							{{ item.number }}
						</v-flex>
						<v-flex class="item-order">
							{{ item.orderState.name }}
						</v-flex>
					</v-layout>
				</v-card-text>
				<v-card-text v-else>
					<v-flex text-xs-center>
						Usted no tiene pedidos.
					</v-flex>
				</v-card-text>
				<v-card-actions class="background-close">
					<v-flex text-xs-center>
						<v-btn
							class="btn-close-dialog"
							@click="closeDialogOrder"
						>
							Cerrar
						</v-btn>
					</v-flex>
				</v-card-actions>
			</v-card>
		</v-dialog>
    </div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';

function created() {
	this.loadHistory(this.params.page);
}

async function loadHistory(page = 1) {
	this.params.page = page;
	try {
		const response = await this.$httpSales.get('gateway-transactions?codeGateway=mercadopagoMp', { params: this.params });
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function closeDialogOrder() {
	this.dialogOrders = false;
}

function closeDialogAuthorization() {
	this.dialogAuthorization = false;
	this.codeTransaction = null;
	this.amountTransaction = null;
	this.statusTransaction = null;
}

function openDialogAuthorization(row) {
	this.idTransaction = row.id;
	this.codeTransaction = row.code;
	this.amountTransaction = row.amount;
	this.statusTransaction = row.paymentStateName;
	this.dialogAuthorization = true;
	this.dialogMessageAuthorization = `¿Deseas autorizar el pago de la transacción ${row.id}?`;
}

function openDialogOrders(row) {
	this.dialogOrders = true;
	this.loadOrders(row);
}

async function loadOrders({ id }) {
	try {
		const response = await this.$httpSales.get(`gateway-transactions/${id}`);
		this.orders = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

async function authorizationOrder() {
	const body = {
		hash: this.codeTransaction,
		captured: true,
		transactionAmount: this.amountTransaction,
	};
	try {
		await this.$httpSales.patch(`payment-gateway/authorize/${this.idTransaction}`, body);
	} catch (error) {
		if (error.status === 400) {
			this.showGenericError('No se puedo realizar la acción , contactar con el administrador.');
		} else {
			this.showGenericError();
		}
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadHistory(page);
}

function selectedState({ value }) {
	this.params.paymentState = value.id;
	this.loadHistory();
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Creación', value: 'creation', visible: true, checked: true },
			{ id: 2, name: '# Transacción', value: 'numberTransaction', visible: true, checked: true },
			{ id: 3, name: 'Monto', value: 'amount', visible: true, checked: true },
			{ id: 4, name: 'Estado', value: 'state', visible: true, checked: true },
			{ id: 5, name: 'Referencia', value: 'reference', visible: true, checked: true },
			{ id: 6, name: 'Expiración', value: 'experition', visible: true, checked: true },
			{ id: 7, name: 'Acciones', value: 'actions', visible: true, checked: true },
		],
		codeTransaction: null,
		currentPage: 1,
		dialogMessageAuthorization: '',
		dialogAuthorization: false,
		dialogOrders: false,
		idTransaction: null,
		lastPage: 0,
		listHistory: [],
		rows: [],
		states: [
			{
				id: 1,
				name: 'Pendiente',
			},
			{
				id: 2,
				name: 'Aprobado',
			},
			{
				id: 3,
				name: 'Rechazado',
			},
			{
				id: 4,
				name: 'Captura de pago',
			},
			{
				id: 5,
				name: 'Cancelado por Usuario',
			},
		],
		statusTransaction: null,
		orders: [],
		params: {
			page: 1,
			limit: 15,
			paymentState: null,
		},
	};
}

export default {
	name: 'page-history-transactions',
	data,
	created,
	components: {
		appTable,
		headerPage,
	},
	methods: {
		authorizationOrder,
		changePage,
		closeDialogOrder,
		closeDialogAuthorization,
		loadHistory,
		loadOrders,
		selectedState,
		openDialogAuthorization,
		openDialogOrders,
	},
};
</script>

<style lang="scss" scoped>
.dialog-authorization {
	border-radius: 12px;
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.12);
}

.title-dialog {
	background-color: #f2fafa;
	border-bottom: 1px solid map-get($colors, item-select);
	color: map-get($colors, selector-color);
	font-family: map-get($fonts, lato-regular);
	font-weight: 900;
}

.btn-close-dialog {
	background-color: #f2fafa !important;
	border-radius: 5px;
	color: map-get($colors, makiRed) !important;
	border: 1px solid map-get($colors, makiRed) !important;
	font-family: map-get($fonts, lato-bold);
	font-size: map-get($sizes, medium);
}

.background-close {
	border-top: 1px solid map-get($colors, item-select);
	background-color: #f2fafa;
	padding: 15px 0;
}

.content-dialog {
	color: map-get($colors, color-input);
	font-family: map-get($fonts, lato-regular);
	font-size: map-get($sizes, medium16);
	font-weight: 600;
	padding: 45px 0;
	text-align: center;
}

.title-modal-orders {
	color: map-get($colors, selector-color);
	font-family: map-get($fonts, open-regular);
	font-size: 10px;
	font-weight: 600;
}

.section-order {
	padding: 16px 27px;
}

.item-order {
	background-color: rgba(195, 231, 232, 0.29);
	color: map-get($colors, paginationText);
	font-size: map-get($sizes, small);
	padding: 5px 0 5px 28px;

	&:last-child {
		margin-left: 4px;
	}
}

.btn-accept-dialog {
	background-color: #f2fafa !important;
	border: 1px solid map-get($colors, selector-color);
	border-radius: 5px;
	color: map-get($colors, selector-color) !important;
	font-size: map-get($sizes, medium);
	font-family: map-get($fonts, lato-bold);
}

.filter-image {
	filter: contrast(0.5);
}
</style>