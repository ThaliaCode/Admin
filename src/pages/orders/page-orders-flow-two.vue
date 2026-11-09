<template>
	<section>
		<header-page
			name="order-flow-new"
			:title="title || ''"
			:show-excel="false"
			@clean-product-filter="onClean"
			to-show
			btn-header-show
			btn-header-text="Ver Mapa"
			:btn-header-link="btnHeaderLink"
			:caption-navigation="captionNavigation"
			column-class="xs12"
			justify-class="justify-start"
			:show-clean="!id"
			:export-to-pdf="!!id"
			@download-dispatch="downloadOrders"
		>
			<v-layout class="header-information-distribution" mr-2 v-if="id && informationRoute">
				<v-flex text-xs-center class="item-information">
					Fecha de Entrega: <span class="num-information">{{ informationRoute.dateRoute }}</span>
				</v-flex>
				<v-flex text-xs-center class="item-information">
					Estado: <span class="num-information">{{ informationRoute.statusName }}</span>
				</v-flex>
				<v-flex text-xs-center class="item-information">
					Repartidor: <span class="num-information">{{ informationRoute.delivery ? informationRoute.delivery.fullname : '' }}</span>
				</v-flex>
				<v-flex text-xs-center class="item-information">
					Recorrido: <span class="num-information">{{ informationRoute.distance }}</span>
				</v-flex>
			</v-layout>
			<v-btn
				v-if="id"
				class="btn-auto px-3 py-2 ma-0 mr-3"
				color="primary"
				outline
				@click="goToConsolidationOrder"
			>
				Ver Consolidación
			</v-btn>
			<v-btn
				v-else
				class="btn-auto px-3 py-2 ma-0 mr-3"
				color="primary"
				:disabled="disabledConsolidation"
				outline
				@click="showSlide('consolidation', 'CONSOLIDACIÓN')"
			>
				Ver Consolidación ({{ totalOrders }})
			</v-btn>
		</header-page>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<general-filter class="layout wrap align-end pt-4" v-if="!this.id">
			<v-flex xs12 pl-1>
				<v-layout row wrap>
					<v-flex xs2 pr-1>
						<label class="caption">Fecha inicial</label>
						<date-component
							:date="params.startDate"
							icon="/static/img/calendar.svg"
							@on-input="onInput({ model: 'startDate', value: $event })"
						></date-component>
					</v-flex>
					<v-flex xs2 pr-1>
						<label class="caption">Fecha final</label>
						<date-component
							:date="params.endDate"
							icon="/static/img/calendar.svg"
							@on-input="onInput({ model: 'endDate', value: $event })"
						></date-component>
					</v-flex>
					<v-flex xs2 pr-1>
						<app-select
							label="Comercio"
							item-text="name"
							item-value="id"
							model="commerceId"
							:item="params.commerceId"
							:items="listCommerce"
							:return-object="false"
							@input="onInput"
						/>
					</v-flex>
					<v-flex xs2 pr-1>
						<label class="caption">Cliente</label>
						<autocomplete-component
							append-icon="search"
							class="custom-autocomplete custom-autocomplete-search"
							custom-search
							customer
							http-code="$httpSales"
							id="search-customer"
							:item="params.customerId"
							item-text="autocomplete"
							item-value="id"
							placeholder-value="Cliente"
							resource-url="customers"
							return-object
							@return-data="setCustomer"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
		</general-filter>
		<section
			class="overflow-auto"
			:class="{ 'mt-4': this.id }">
			<app-table
				class="is-not-selectable"
				name="orders"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="orders"
				:checkAll="checkAll"
				selectable
				disabled-value="flagApproval"
				@on-page="onPage"
				@on-search-event="onSearch"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.number }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.customer ? `${props.row.customer.name} ${props.row.customer.lastname}` : null }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.createdAt | formatDate('DD/MM/YYYY, HH:MM:SS a') }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.commerce ? props.row.commerce.name : null }}</td>
					<td v-show="showRow(columns, 5)">{{ getAddress(props.row, 'pickUpPoint') }}</td>
					<td v-show="showRow(columns, 6)">{{ getAddress(props.row, 'deliveryPoint')}}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.total | round }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.costShipping | round }}</td>
					<td v-show="showRow(columns, 9)">{{ props.row.routePickUpName }}</td>
					<td v-show="showRow(columns, 10)">
						<div v-if="id">
							<app-tooltip-button
								icon="remove_red_eye"
								text="Ver Detalle"
								color="primary"
								@click-icon="openDetail(props.row)"
							/>
						</div>
						<div v-else>
							<app-tooltip-button
								class="mr-2"
								text="Editar"
								img="/static/img/edit.svg"
								@click-icon="clickIcon({ action: 'edit', row: props.row })"
							/>
							<app-tooltip-button
								color="error"
								text="Anular"
								icon="not_interested"
								@click-icon="clickIcon({ action: 'cancel', row: props.row })"
							/>
							<v-tooltip top>
								<a
									slot="activator"
									@click.stop.prevent="downloadOrder(props.row)"
									class="table-icon">
									<img
									:src="`${$imageUrl}/download.svg`" alt="" class="align-img">
								</a>
								<span>
									Descargar Pedido
								</span>
							</v-tooltip>
						</div>
					</td>
				</template>
			</app-table>
		</section>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="425">
			<v-card>
				<v-card-title class="headline" text-xs-center>
					<p class="mb-0 f-12">{{ message }}</p>
					<div class="layout mt-2" v-if="flagAssign">
						<v-icon color="primary">info</v-icon>
						<span class="text-assign">Al dar clic en "Aceptar" debe asignar un repartidor al pedido ya que es necesario para cambiar de estado.</span>
					</div>
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1
							text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancel">
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1
							text-xs-left>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="updateState()">
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog
			v-model="dialogPayment"
			persistent
			max-width="425">
			<v-card>
				<v-card-title class="headline" text-xs-center>
					<p class="mb-0 f-12">¿Desea cambiar el estado del pedido a Pagado?</p>
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1
							text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancel">
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1
							text-xs-left>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="updatePaymentStatus">
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<action-sidebar
			:title="action.title"
			:value="action.value"
			:width="action.width"
			v-model="action.open"
			@close-modal="close"
		>
			<v-flex
				v-show="action.code === 'consolidation'"
				xs6 text-xs-right pr-3
				slot="right"
			>
				<label class="label-header-sidebar">
					Cant. de {{ typeQuantity }}: <span>{{ totalQuantity }}</span>
				</label>
			</v-flex>
			<consolidation-slide
				v-if="action.code === 'consolidation'"
				:orders="ordersConsolidation"
				:total-weight="totalWeight"
				@on-search="onSearchLocal"
				@accept-action="close"
				@update-active="updateActive"
			></consolidation-slide>
			<assign-delivery
				v-if="action.code === 'assign-delivery'"
				:distributors="distributors"
				:order="currentOrder"
				@update-assign-delivery="updateAssignDelivery"
				@close="close"
			/>
		</action-sidebar>
		<v-dialog
			v-model="dialogCancel"
			persistent
			max-width="425">
			<v-card>
				<v-card-title class="headline">
					<p class="mb-1 f-12 text-xs-center">¿Deseas cancelar el pedido Nº {{ orderCancel.number }}?</p>
					<p class="subtext">Recuerda que al anular el pedido, este no se mostrará en el listado ya que en esta pantalla solo se muestran los pedidos pendientes de entrega disponibles para armar una ruta o que ya pertenecen a una.</p>
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1
							text-xs-right>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="cancelDialog">
								Cerrar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1
							text-xs-left>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelOrder">
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog
			v-model="dialogDetail"
			max-width="540"
		>
			<div class="detail-in-table">
				<v-layout wrap align-center primary py-3 px-4>
					<v-flex xs6>
						<span class="title white--text">
							{{ orderSelected.customer ? `${orderSelected.customer.name} ${orderSelected.customer.lastname}` : '' }}
						</span>
					</v-flex>
					<v-flex xs6 text-xs-right pl-4>
						<span class="body-1 white--text my-0">Total</span>
						<span class="white--text my-0 total-order ml-2 mr-2">
							{{ orderSelected.currencySymbol }} {{ orderSelected.total | round }}
						</span>
						<button @click="closeDetails" class="border-l pl-2">
							<v-icon color="white">clear</v-icon>
						</button>
					</v-flex>
				</v-layout>
				<div class="min-height white">
					<v-layout  wrap px-4 py-2>
						<v-flex xs12 mb-2 body-1>
							<v-layout>
								<v-flex xs4 class="content-green">Fecha</v-flex>
								<v-flex xs8 class="c-text-green">{{ orderSelected.createdAt | formatDate }}</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs12 mb-2 body-1>
							<v-layout>
								<v-flex xs4 class="content-green">Nro de pedido</v-flex>
								<v-flex xs8 class="c-text-green">{{ orderSelected.number }}</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs12 mb-2 body-1>
							<div class="content-green">Dirección</div>
							<div class="c-text-green">{{ getAddress(orderSelected) }}</div>
						</v-flex>
						<v-flex xs6 mb-2 mt-1 body-1>
							<span class="body-2 title-details-table">Productos: </span>
						</v-flex>
						<v-flex xs12>
							<app-table
								class="is-not-selectable no-main-list mb-3"
								padding="px-0"
								name="orders-products-new-flow"
								:main-list="false"
								:columns="columnsDetail"
								:input-search="false"
								:rows="orderSelected.details || []"
								:filter-columns="false"
							>
								<template slot="rows" slot-scope="props">
									<td v-show="showRow(columns, 1)" class="is-not-selectable">
										{{ props.row.productCode }}
									</td>
									<td v-show="showRow(columns, 2)">{{ props.row.productName }}</td>
									<td v-show="showRow(columns, 3)">{{ props.row.quantity }}</td>
								</template>
							</app-table>
						</v-flex>
						<v-flex
							v-if="orderSelected.additionalInfo ? orderSelected.additionalInfo.photos : false"
							xs6
							mb-2
							mt-1
							body-1>
							<span class="body-2 title-details-table">Fotos: </span>
						</v-flex>
						<v-flex xs12 v-if="orderSelected.additionalInfo ? orderSelected.additionalInfo.photos : false">
							<content-images
								:images="orderSelected.additionalInfo.photos"/>
						</v-flex>
					</v-layout>
				</div>
			</div>
		</v-dialog>
		<v-dialog
			v-model="dialogFree"
			persistent
			max-width="425"
		>
			<v-card>
				<v-card-title class="headline">¿Desea liberar el pedido #{{ dataSelected[0] ? dataSelected[0].number : '' }} ?</v-card-title>
				<v-card-text class="subtext">
					Recuerda que liberar el pedido que se encuentra en curso indica que el pedido no será entregado al cliente y volverá a la tienda de origen hasta que se vuelva a seleccionar para armar otra ruta.
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="cancelFree">
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="actionFree">
								Liberar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<section class="modal-filter-footer" v-if="!id">
			<modal-sidebar-button
				hidden
				:img="false"
				:is-loading="disabledCreateRoute"
				padding-success="px-5 py-2"
				success-color="primary"
				success-text="Armar Ruta"
				@accept-button-clicked="goTo('create-route-from-orders',{ query: { from: $route.name } })"
			/>
		</section>
	</section>
</template>

<script>
import { differenceInCalendarDays } from 'date-fns';
import dateComponent from '@/components/shared/date-component';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import typeOrder from '@/shared/type-order';
import actionSidebar from '@/components/shared/action-sidebar';
import assignDelivery from '@/components/ecommerce/assign-delivery';
// import lib from '@/shared/lib';
import typePickUp from '@/shared/type-pick-up';
import appActions from '@/components/shared/app-actions';
import TypePayment from '@/shared/type-payment';
import consolidationSlide from '@/components/orders/consolidation-slide';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import helper from '@/shared/helper';
import typeRouteTwoDriver from '@/shared/type-route-two-driver';
import contentImages from '@/components/shared/content-images';

const { getLocalData, removeLocalData, setLocalData, showDownloadDialog, generateBlob } = helper;
// const { getDeeper } = lib;

async function created() {
	setLocalData('route-from', this.$route.name);
	this.columns[8].visible = this.$route.name === 'orders-to-deliver';
	this.columns[8].checked = this.$route.name === 'orders-to-deliver';
	this.columns[4].visible = this.$route.name === 'pick-up-earrings';
	this.columns[4].checked = this.$route.name === 'pick-up-earrings';
	this.columns[5].visible = this.$route.name === 'orders-to-deliver';
	this.columns[5].checked = this.$route.name === 'orders-to-deliver';
	if (this.id) {
		this.captionNavigation = 'Detalle de Ruta';
		this.btnHeaderLink = {
			name: 'pending-routes-map',
		};
	} else {
		this.captionNavigation = this.$route.name === 'orders-to-deliver' ?
			'Pedidos pendientes por entregar' : 'Pedidos pendientes por recoger';
		this.btnHeaderLink = {
			name: 'pending-orders-map',
			query: {
				from: this.$route.name,
			},
		};
		this.key = this.$route.name === 'orders-to-deliver' ?
			'pending-orders-deliver' : 'pending-orders-pick-up';
		this.dataSelected = getLocalData(this.key) || [];
	}
	if (this.id) {
		this.loadDetail();
	} else {
		this.loadData();
	}
	this.loadOrderStates();
}

async function loadData() {
	this.dataSelected = [];
	this.params.page = this.currentPage;
	this.params.flagPickUp = this.$route.name === 'orders-to-deliver' ?
		typePickUp.HomeDelivery : typePickUp.PickUpStore;
	const params = { ...this.params };
	if (this.$route.name === 'orders-to-deliver') {
		params.includeRoutePickUp = true;
	}
	try {
		const response = await this.$httpSales.get('orders', { params });
		this.orders = response.data.map((d) => {
			const newData = { ...d };
			newData.customerName = d.customer ? `${d.customer.name} ${d.customer.lastname}` : null;
			newData.quantityProducts = d.details.length;
			newData.routePickUpName = d.routePickUp ? d.routePickUp.name : '---';
			return newData;
		});
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function onClean() {
	this.params = {
		endDate: null,
		limit: 20,
		page: 1,
		startDate: null,
		sortDirection: 'desc',
		sortField: 'created_at',
		typeOrder: typeOrder.FREE,
		flagPickUp: this.$route.name === 'orders-to-deliver' ?
			typePickUp.HomeDelivery : typePickUp.PickUpStore,
		commerceId: null,
		customerId: null,
		employeeId: null,
		orderStateId: 6,
	};
	removeLocalData(this.key);
	this.loadData();
}

function onInput({ model, value }) {
	if (value) {
		this.params[model] = value;
		this.currentPage = 1;
		if (!this.params.startDate && !this.params.endDate) {
			this.loadData();
		} else if (this.params.startDate && this.params.endDate) {
			if (differenceInCalendarDays(this.params.endDate, this.params.startDate) >= 0) {
				this.loadData();
			} else {
				this.showNotification('La fecha final no puede ser menor a la inicial.', 'warning');
			}
		} else {
			this.showNotification('Para filtrar por fecha es necesario seleccionar la inicial y la final.', 'warning');
		}
	}
}

function onPage(page) {
	this.currentPage = page;
	this.loadData();
}

function selectedAll(check) {
	this.checkAll = check;
	this.orders = this.orders.map((d) => {
		const newD = { ...d };
		newD.isSelected = check;
		return newD;
	});
	this.dataSelected = [...this.orders.filter(d => d.isSelected)];
	if (!this.id) {
		this.orders.forEach(o => this.validSavedData(o));
	}
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadData();
}

function openStateSlider(order) {
	this.currentOrder = order;
	this.flagAssign = false;
	if (this.currentOrder.orderState.code === 'REQUESTED') {
		this.message = '¿Deseas cambiar de estado el pedido de SOLICITADO a CONFIRMADO?';
		this.codeChangeOrder = 'CONFIRMED';
	} else if (this.currentOrder.orderState.code === 'CONFIRMED') {
		this.message = '¿Deseas cambiar de estado el pedido de CONFIRMADO a LISTO PARA RECOGER?';
		this.codeChangeOrder = 'READY_TO_DELIVER';
	} else if (this.currentOrder.orderState.code === 'READY_TO_DELIVER') {
		if (this.isDistributor && this.currentOrder.flagPickUp === typePickUp.HomeDelivery) {
			this.message = '¿Deseas cambiar de estado el pedido de LISTO PARA RECOGER a ASIGNADO';
			this.flagAssign = true;
		} else {
			this.message = '¿Deseas cambiar de estado el pedido de LISTO PARA RECOGER a EN CAMINO';
			this.codeChangeOrder = 'IN_ROAD';
		}
	} else if (this.currentOrder.orderState.code === 'IN_ROAD') {
		this.message = '¿Deseas cambiar de estado el pedido de EN CAMINO a EN ENTREGADO?';
		this.codeChangeOrder = 'GIVEN';
	} else if (this.currentOrder.orderState.code === 'ASSIGNED') {
		this.message = '¿Deseas cambiar de estado el pedido de ASIGNADO a EN CAMINO?';
		this.codeChangeOrder = 'IN_ROAD';
	}
	this.dialog = true;
}

function cancel() {
	this.dialog = false;
	this.dialogPayment = false;
	this.currentOrder = {};
	this.codeChangeOrder = null;
	this.message = null;
}

async function loadOrderStates() {
	const params = { showOrdersInProgress: true };
	const request = [
		this.$httpSales.get('order-states'),
		this.$httpSales.get('delivery', { params }),
		this.$httpSales.get('com-ecommerce-companies'),
	];
	[
		{ data: this.orderStates },
		{ data: this.distributors },
		{ data: this.listCommerce },
	] = await Promise.all(request);
}

async function updateState() {
	if (this.flagAssign) {
		this.dialog = false;
		this.action.code = 'assign-delivery';
		this.action.title = 'Asignar Repartidor';
		this.action.width = 400;
		this.action.open = true;
		this.action.value = true;
	} else {
		const url = `orders/${this.currentOrder.id}/update-state`;
		const orderStateId = this.orderStates.find(o => o.code === this.codeChangeOrder).id;
		const body = { orderStateId };
		try {
			await this.$httpSales.patch(url, body);
			this.showNotification('Se actualizó el pedido con éxito');
			this.cancel();
			this.loadData();
		} catch (error) {
			if (error.status === 500) {
				this.showGenericError();
			} else if (error.status === 400) {
				if (error.data.message === 'ORDER_NOT_APPROVED_YET') {
					this.showGenericError('El pedido debe estar aprobado para poder cambiar el estado.');
				} else if (error.data.message === 'CANCEL_UPDATE_IS_NOT_ALLOWED') {
					this.showGenericError('El pedido no puede ser anulado.');
				}
			}
		}
	}
}

function close() {
	this.action.value = false;
	this.action.open = false;
	this.action.code = '';
	this.currentOrder = {};
	this.codeChangeOrder = null;
	this.message = '';
}

function updateAssignDelivery() {
	this.close();
	this.onClean();
	this.currentPage = 1;
	this.loadData();
}

function setCustomer(customer) {
	if (customer) {
		this.params.customerId = customer.id;
		this.loadData();
	}
}

function showCancel({ orderState: { code } }) {
	return code === 'REQUESTED' || code === 'CONFIRMED';
}

function openCancelDialog(order) {
	this.orderCancel = { ...order };
	this.dialogCancel = true;
}

function cancelDialog() {
	this.dialogCancel = false;
	this.orderCancel = {};
}

async function cancelOrder() {
	try {
		await this.$httpSales.patch(`/orders/${this.orderCancel.id}/cancel`);
		this.cancelDialog();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function actionsDisabled() {
	const disabledActions = [
		{ code: 'assign-delivery', disabled: this.dataSelected.every(l => l.orderStateId !== 6) },
		{ code: 'update-payment-status', disabled: this.dataSelected.length !== 1 },
		{ code: 'release-order', disabled: this.dataSelected.length !== 1 },
	];
	return disabledActions;
}

function runAction({ code }) {
	if (code === 'assign-delivery') {
		if (this.dataSelected[0].orderState.code === 'READY_TO_DELIVER') {
			this.currentOrder = { ...this.dataSelected[0] };
			this.action.code = code;
			this.action.title = 'Asignar Repartidor';
			this.action.width = 430;
			this.action.open = true;
			this.action.value = true;
		} else {
			this.showNotification('Solo se asigna repartidores a pedidos que esten listos para recoger', 'warning');
		}
	} else if (code === 'update-payment-status') {
		if (this.dataSelected[0].paymentStateId === TypePayment.PayOut) {
			this.showNotification('El pedido ya fue pagado', 'warning');
		} else {
			this.openDialogPaymentStatus();
		}
	} else if (code === 'release-order') {
		this.dialogFree = true;
	}
}

function rowIsSelected(row) {
	const { id, isSelected } = row;
	if (isSelected) {
		this.dataSelected.push(row);
	} else {
		const index = this.dataSelected.findIndex(ds => ds.id === id);
		this.dataSelected.splice(index, 1);
	}
	this.checkAll = this.orders.every(d => d.isSelected);
	if (!this.id) {
		this.validSavedData(row);
	}
}

function openDialogPaymentStatus() {
	this.dialogPayment = true;
}

async function updatePaymentStatus() {
	const id = this.dataSelected[0].id;
	const body = {
		paymentStateId: TypePayment.PayOut,
	};
	try {
		await this.$httpSales.patch(`/orders/${id}/payment`, body);
		this.showNotification('Se realizó la acció correctamente');
		this.cancel();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function totalOrders() {
	return this.dataSelected.length;
}

function disabledConsolidation() {
	return this.totalOrders === 0;
}

function showSlide(code, titleS) {
	this.action.width = 430;
	this.action.code = code;
	this.action.title = titleS;
	this.action.value = true;
	this.action.open = true;
}

function totalItems() {
	const ordersProducts = this.dataSelected.reduce((a, os) => a.concat(os.details), []);
	return ordersProducts.reduce((a, op) => a + op.quantity, 0);
}

function updateActive(code) {
	this.consolidationCode = code;
	this.typeQuantity = code === 'orders' ? 'Pedidos' : 'Items';
	this.totalQuantity = code === 'orders' ? this.totalOrders : this.totalItems;
	this.consolidationOrders = [...this.dataSelected];
	this.consolidationProducts = this.dataSelected.reduce((a, os) =>
		a.concat(os.details), []);
	this.totalWeight = this.dataSelected.reduce((acum, p) => acum + (p.weight || 0), 0);
	this.ordersConsolidation = code === 'orders' ? [...this.consolidationOrders] :
		[...this.consolidationProducts];
}

function onSearchLocal(search) {
	const searchTrim = search ? search.trim() : null;
	const completeRegisters = this.consolidationCode === 'orders' ?
		[...this.consolidationOrders] : [...this.consolidationProducts];
	if (searchTrim) {
		this.ordersConsolidation = completeRegisters.filter((row) => {
			if (this.consolidationCode === 'orders') {
				return row.number.toString().toLowerCase().indexOf(searchTrim) > -1 ||
					row.customerName.toLowerCase().indexOf(searchTrim) > -1 ||
					row.total.toString().toLowerCase().indexOf(searchTrim) > -1 ||
					row.quantityProducts.toString().toLowerCase().indexOf(searchTrim) > -1;
			}
			return row.productCode.toLowerCase().indexOf(searchTrim) > -1 ||
				row.productName.toLowerCase().indexOf(searchTrim) > -1 ||
				row.unitName.toLowerCase().indexOf(searchTrim) > -1 ||
				row.quantity.toString().toLowerCase().indexOf(searchTrim) > -1;
		});
	} else {
		this.ordersConsolidation = [...completeRegisters];
	}
}

function disabledCreateRoute() {
	return this.dataSelected.length < 2;
}

function validSavedData(row) {
	const { id, isSelected, isDisabled } = row;
	const currentOrdersSelected = [...this.dataSelected];
	if (currentOrdersSelected.length > 0) {
		const indexOrder = currentOrdersSelected.findIndex(o => o.id === id);
		if (isSelected && (indexOrder === -1) && !isDisabled) {
			currentOrdersSelected.push(row);
		} else if (!isSelected && (indexOrder > -1)) {
			currentOrdersSelected.splice(indexOrder, 1);
		}
		setLocalData(this.key, [...this.dataSelected]);
	} else {
		setLocalData(this.key, [...this.dataSelected]);
	}
	if (this.dataSelected.length === 1) {
		this.showNotification('Para poder armar una ruta es necesario seleccionar más de un pedido.',
			'info');
	}
}

function clickIcon({ action, row }) {
	if (action === 'edit') {
		this.goTo('pending-order-edit', { params: { id: row.id, number: row.number }, query: { from: this.$route.name } });
	} else if (action === 'cancel') {
		this.openCancelDialog(row);
	}
}

async function loadDetail() {
	this.dataSelected = [];
	const params = { includeDriver: true, includeCommerce: true, includeOrdersPickUp: true };
	try {
		const { data: response } = await this.$httpSales.get(`delivery-router/${this.id}`, { params });
		this.informationRoute = { ...response };
		const orderDetail = response.orders.length ? response.orders : response.ordersPickUp;
		this.orders = orderDetail.map((d) => {
			const newData = { ...d };
			newData.customerName = d.customer ? `${d.customer.name} ${d.customer.lastname}` : null;
			newData.quantityProducts = d.details.length;
			return newData;
		});
		setLocalData('detail-route', this.informationRoute);
	} catch (error) {
		this.showGenericError();
	}
}

function title() {
	if (this.id) {
		if (this.informationRoute) {
			return this.informationRoute.name;
		}
		return '';
	}
	return this.$route.meta.title;
}

function goToConsolidationOrder() {
	this.goTo('consolidation-order');
}

function openDetail(row) {
	this.orderSelected = { ...row };
	this.dialogDetail = true;
}

function closeDetails() {
	this.dialogDetail = false;
	this.orderSelected = {};
}

function getAddress(row, value) {
	let address = '';
	if (value) {
		address = row.deliveryJson[value].addressLine;
	} else if (row.flagPickUp === typeRouteTwoDriver.PickUpPoint && row.deliveryJson) {
		address = row.deliveryJson.pickUpPoint.addressLine;
	} else if (row.deliveryJson) {
		address = row.deliveryJson.deliveryPoint.addressLine;
	}
	return address;
}

function $route() {
	setLocalData('route-from', this.$route.name);
	if (this.id) {
		this.captionNavigation = 'Detalle de Ruta';
		this.btnHeaderLink = {
			name: 'pending-routes-map',
		};
	} else {
		this.captionNavigation = this.$route.name === 'orders-to-deliver' ?
			'Pedidos pendientes por entregar' : 'Pedidos pendientes por recoger';
		this.btnHeaderLink = {
			name: 'pending-orders-map',
			query: {
				from: this.$route.name,
			},
		};
		this.key = this.$route.name === 'orders-to-deliver' ?
			'pending-orders-deliver' : 'pending-orders-pick-up';
		this.dataSelected = getLocalData(this.key) || [];
	}
	this.columns[8].visible = this.$route.name === 'orders-to-deliver';
	this.columns[8].checked = this.$route.name === 'orders-to-deliver';
	this.columns[4].visible = this.$route.name === 'pick-up-earrings';
	this.columns[4].checked = this.$route.name === 'pick-up-earrings';
	this.columns[5].visible = this.$route.name === 'orders-to-deliver';
	this.columns[5].checked = this.$route.name === 'orders-to-deliver';
	this.loadData();
}

function cancelFree() {
	this.dialogFree = false;
}

async function actionFree() {
	const routeId = this.dataSelected[0].routeId;
	const id = this.dataSelected[0].id;
	try {
		await this.$httpSales.post(
			`delivery-router/${routeId}/${id}/unsubscribe-order`);
		this.showNotification('El pedido ha sido liberado correctamente.');
		this.cancelFree();
		this.loadDetail();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function downloadOrders() {
	const idRoute = this.id;
	const params = {
		code: 'report-route-distribution-pdf',
		flagPickUp: this.informationRoute.flagPickUpShip,
		comSubsidiaryId: this.informationRoute.subsidiaryId,
	};
	const downloadDialog = this.$userInfo.company.settings.downloadSale;
	const responseType = 'blob';
	const contentType = downloadDialog ? 'application/pdf' : 'text/html';
	try {
		const response = await this.$httpReportSales.post(`delivery-router/${idRoute}/pdf`, params, { responseType });
		const blob = helper.generateBlob(response.data, contentType);
		helper.showDownloadDialog(blob, `${this.informationRoute.name}`, downloadDialog);
	} catch (error) {
		this.showGenericError();
	}
}

async function downloadOrder(row) {
	try {
		const body = { code: 'order-details-pdf' };
		const downloadDialog = this.$userInfo.company.settings.downloadSale;
		const responseType = 'blob';
		const contentType = downloadDialog ? 'application/pdf' : 'text/html';
		const { data: response } = await this.$httpSales.post(`orders/${row.id}/pdf`, body, { responseType });
		const blob = generateBlob(response, contentType);
		this.showNotification('Se genero el reporte correctamente');
		showDownloadDialog(blob, 'Reporte de Pedido', downloadDialog);
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		action: {
			code: '',
			open: false,
			title: '',
			value: false,
			width: 400,
		},
		columns: [
			{
				id: 1,
				name: 'Nro de Pedido',
				value: 'number',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Cliente',
				value: 'client',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Fecha y hora',
				value: 'date',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Comercio',
				value: 'commerceName',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'D. del Comercio',
				value: 'commerceAddress',
				tooltip: 'Dirección del Comercio',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'D. del Entrega',
				value: 'customerAddress',
				tooltip: 'Dirección de Entrega',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Monto',
				value: 'amount',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Costo de envió',
				value: 'cost',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'R.D. Recojo',
				value: 'routePickUp',
				tooltip: 'Ruta de Distribución de Recojo',
				checked: true,
				visible: true,
			},
			{
				id: 10,
				name: 'Acciones',
				value: 'actions',
				checked: true,
				visible: true,
			},
		],
		currentOrder: {},
		currentPage: 1,
		checkAll: false,
		dataSelected: [],
		lastPage: 1,
		listCommerce: [],
		options: [
			{ id: 1, code: 'list-order', name: 'Listado de Pedidos' },
			{ id: 2, code: 'orders', name: 'Pedidos por Entrega', disabled: true },
		],
		orders: [],
		orderStates: [],
		params: {
			endDate: null,
			flagPickUp: null,
			limit: 20,
			page: 1,
			sortDirection: 'desc',
			sortField: 'created_at',
			startDate: null,
			typeOrder: typeOrder.FREE,
			commerceId: null,
			customerId: null,
			orderStateId: 6,
		},
		paymentStates: [
			{ id: 1, name: 'Pendiente' },
			{ id: 2, name: 'Parcial' },
			{ id: 3, name: 'Pagado' },
		],
		search: '',
		toShow: false,
		typesPlatform: [
			{ id: 1, name: 'Desktop' },
			{ id: 2, name: 'Web' },
			{ id: 3, name: 'Movil' },
		],
		warehouses: [],
		warehousesSelected: [],
		wayPayments: [],
		distributors: [],
		dialog: false,
		message: '',
		codeChangeOrder: null,
		flagAssign: false,
		orderCancel: {},
		dialogCancel: false,
		dialogPayment: false,
		btnHeaderLink: null,
		captionNavigation: '',
		typeQuantity: 'Pedidos',
		totalQuantity: 0,
		ordersConsolidation: [],
		consolidationCode: 'orders',
		consolidationProducts: [],
		consolidationOrders: [],
		totalWeight: 0,
		key: null,
		informationRoute: {},
		dialogDetail: false,
		orderSelected: {},
		columnsDetail: [
			{
				id: 1,
				name: 'Código',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Nombre',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Cantidad',
				value: 'quantity',
				checked: true,
				visible: true,
			},
		],
		dialogFree: false,
	};
}

export default {
	name: 'page-orders-flow-two',
	components: {
		dateComponent,
		generalFilter,
		headerPage,
		appTable,
		actionSidebar,
		assignDelivery,
		appActions,
		consolidationSlide,
		modalSidebarButton,
		contentImages,
	},
	created,
	computed: {
		actionsDisabled,
		disabledConsolidation,
		totalOrders,
		totalItems,
		disabledCreateRoute,
		title,
	},
	data,
	methods: {
		close,
		loadData,
		downloadOrders,
		downloadOrder,
		onClean,
		onInput,
		onPage,
		selectedAll,
		onSearch,
		openStateSlider,
		cancel,
		updateState,
		loadOrderStates,
		updateAssignDelivery,
		setCustomer,
		showCancel,
		cancelDialog,
		openCancelDialog,
		cancelOrder,
		runAction,
		rowIsSelected,
		updatePaymentStatus,
		openDialogPaymentStatus,
		showSlide,
		updateActive,
		onSearchLocal,
		validSavedData,
		clickIcon,
		loadDetail,
		goToConsolidationOrder,
		openDetail,
		closeDetails,
		getAddress,
		actionFree,
		cancelFree,
	},
	props: {
		id: [String, Number],
	},
	watch: {
		$route,
	},
};
</script>

<style lang="scss" scoped>
	.align-end {
		align-items: flex-end !important;
	}

	.f-12 {
		font-size: 16px;
		text-align: center;
		width: 100%;
	}

	.text-assign {
		color: color(paginationText);
		font-size: 14px;
    line-height: 19px;
    margin-left: 11px;
	}

	.w-100 {
		width: 100px;
	}

	.label-header-sidebar {
		color: color(background-sidebar);
		font-family: font(lato-bold);
		font-size: size(medium);

		span {
			font-size: size(large27);
		}
	}

	.subtext {
		color: color(grey-border) !important;
		font-family: font(open-regular) !important;
		font-size: size(small) !important;
		letter-spacing: normal !important;
		line-height: 1 !important;
		margin: auto !important;
		max-width: 340px !important;
		padding: 0px !important;
		text-align: center !important;
	}

	.header-information-distribution {
		background-color: #fbfbfb;
		border-radius: 3px;
		padding: 7px;
	}

	.item-information {
		color: map-get($colors, paginationText);
		font-size: map-get($sizes, small11);
		font-family: map-get($fonts, bold);
	}

	.num-information {
		color: map-get($colors, number-header);
		font-family: map-get($fonts, lato-regular);
		font-size: map-get($sizes, small11);
	}

	.detail-in-table {
		position: sticky;
		top: 100px;
	}

	.min-height {
		border-bottom-right-radius: 10px;
		position: relative;
	}

	.content-green {
		background: map-get($colors, title-green);
		color: map-get($colors, background-sidebar);
		font-weight: 700;
		padding: 4px 12px;
	}

	.c-text-green {
		background: map-get($colors, text-green);
		color: map-get($colors, paginationText);
		padding: 4px 12px;
	}

	.title-details-table {
		color: map-get($colors, blue-card);
		font-family: map-get($fonts, open-bold);
	}

	.headline {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(medium) !important;
		justify-content: center !important;
		letter-spacing: normal !important;
		line-height: 1 !important;
		margin: auto !important;
		max-width: 340px !important;
		padding-top: 37px !important;
		text-align: center !important;
	}
</style>
