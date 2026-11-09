<template>
	<section>
		<app-loading
			:show-loading="loadingGeneral"
			:label="`La carga terminará en un momento y podrás ver
				el listado de pedidos.`"
		/>
		<header-page
			:columns="columns"
			name="ecommerce-orders"
			:rows="orders"
			title="Pedidos Delivery"
			:options="options"
			:show-excel="false"
			:open-on-click="isSelectedOrder"
			@clean-product-filter="onClean"
			@click-menu="clickMenu"
			@emit-excel="emitExcel"
			to-show
			show-excel-menu
			:track-filters="params"
		>
			<div class="nowrap mx-1">
				<app-tooltip-button
					icon="visibility"
					color="primary"
					text="Mostrar Total de los Pedidos"
					height="30"
					@click-icon="getTotalOrders"
				/>
				<b class="primary--text bold mx-1">
					{{ totalOrdersAmount ? 'Total:' : 'Ver total' }}
				</b>
				<span v-if="totalOrdersAmount">
					{{ totalOrdersAmount | round }}
				</span>
			</div>
		</header-page>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter class="layout wrap align-end pt-4">
			<v-flex xs2 mr-2>
				<app-select
					label="Origen"
					item-text="name"
					item-value="id"
					model="originPlatform"
					:item="params.originPlatform"
					:items="originConfig"
					@input="onInput"
				></app-select>
			</v-flex>
			<v-flex xs2 mr-2>
				<app-select
					:item="params.commerceId"
					item-text="name"
					item-value="id"
					:items="listCommerce"
					label="Comercios"
					model="commerceId"
					:return-object="false"
					@input="onInput"
					show-autocomplete
				></app-select>
			</v-flex>
			<v-flex xs2 mr-2>
				<app-select
					multiple
					chips
					:item="params.employeeIds"
					item-text="fullname"
					item-value="id"
					:items="employees"
					label="Empleados"
					model="employeeIds"
					:return-object="false"
					@input="onInput"
					show-autocomplete
				></app-select>
			</v-flex>
			<v-flex xs2 mr-2>
				<app-select
					label="Sucursal"
					item-text="rzSocial"
					item-value="id"
					model="subsidiaryId"
					:items="listSubsidiaries"
					:item="params.subsidiaryId"
					:return-object="false"
					@input="onInput"
				></app-select>
			</v-flex>
			<v-flex xs2 mr-2>
				<app-select
					multiple
					chips
					:disabled="!params.subsidiaryId"
					:label="labelWarehouse()"
					item-text="name"
					item-value="id"
					model="warehouses"
					:item="params.warehouses"
					:items="warehouses"
					:return-object="false"
					@input="onInput"
				/>
			</v-flex>
			<v-flex xs1 mr-2>
				<app-select
					label="Medio de pago"
					item-text="name"
					item-value="id"
					model="wayPaymentId"
					:item="params.wayPaymentId"
					:items="wayPayments"
					:return-object="false"
					@input="onInput"
				/>
			</v-flex>
			<v-flex xs3 mr-2>
				<v-layout row wrap>
					<v-flex xs6 pr-1>
						<label class="caption">Fecha inicial</label>
						<date-component
							:date="params.startDate"
							icon="/static/img/calendar.svg"
							@on-input="onInput({ model: 'startDate', value: $event })"
						></date-component>
					</v-flex>
					<v-flex xs6 pl-1>
						<label class="caption">Fecha final</label>
						<date-component
							:date="params.endDate"
							icon="/static/img/calendar.svg"
							@on-input="onInput({ model: 'endDate', value: $event })"
						></date-component>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs2 mr-2>
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
			<v-flex xs1 mr-2>
				<app-select
					label="E. Despacho"
					item-text="name"
					item-value="id"
					model="flagPickUp"
					:item="params.flagPickUp"
					:items="dispatchTypes"
					:return-object="false"
					@input="onInput"
				/>
			</v-flex>
			<v-flex xs1 mr-2>
				<app-select
					label="E. de Pago"
					item-text="name"
					item-value="id"
					model="paymentState"
					:item="params.paymentState"
					:items="paymentStates"
					:return-object="false"
					@input="onInput"
				/>
			</v-flex>
			<v-flex xs1 mr-2>
				<app-select
					multiple
					chips
					label="E. del Pedido"
					item-text="name"
					item-value="code"
					model="orderStateId"
					:item="params.orderStateId"
					:items="orderStates"
					:return-object="false"
					@input="onInput"
				/>
			</v-flex>
			<v-flex xs1 mr-2>
				<app-select
					label="Deudas"
					item-text="name"
					item-value="value"
					model="flagDebts"
					:item="params.flagDebts"
					:items="debtsStates"
					:return-object="false"
					@input="onInput"
				/>
			</v-flex>
			<v-flex xs2 mr-2 v-if="$userInfo.company.settings.flagPriceListChangeApproval">
				<app-select
					label="Estado de cambio de precio"
					item-text="name"
					item-value="id"
					model="priceChangeStatus"
					:item="params.priceChangeStatus"
					:items="changeStatus"
					:return-object="false"
					@input="onInput"
				/>
			</v-flex>
			<!-- <v-flex xs12 md4 mt-2>
				<v-layout row wrap>
					<v-flex xs4 pr-1>
						<app-select
							label="E. Despacho"
							item-text="name"
							item-value="id"
							model="flagPickUp"
							:item="params.flagPickUp"
							:items="dispatchTypes"
							:return-object="false"
							@input="onInput"
						/>
					</v-flex>
					<v-flex xs4 px-1>
						<app-select
							label="E. de Pago"
							item-text="name"
							item-value="id"
							model="paymentState"
							:item="params.paymentState"
							:items="paymentStates"
							:return-object="false"
							@input="onInput"
						/>
					</v-flex>
					<v-flex xs4 pl-1>
						<app-select
							multiple
							chips
							label="E. del Pedido"
							item-text="name"
							item-value="code"
							model="orderStateId"
							:item="params.orderStateId"
							:items="orderStates"
							:return-object="false"
							@input="onInput"
						/>
					</v-flex>
				</v-layout>
			</v-flex> -->
		</general-filter>
		<v-layout wrap justify-start mb-4 px-4>
			<template v-for="warehouse in warehousesSelected">
				<v-chip
					:key="warehouse.id"
					v-model="warehouse.isSelected"
					close
					outline
					small
					label
					@input="deleteWarehouseSelected(warehouse.id)"
					color="info"
				>
					{{ warehouse.name }}
				</v-chip>
			</template>
		</v-layout>
		<v-layout wrap>
			<v-flex :class="toShow ? 'xs7 active' : 'xs12'">
				<ecommerce-orders-list
					:item-quantity="itemsTotalQuantity"
					:columns="columns"
					:current-page="currentPage"
					:last-page="lastPage"
					:rows="orders"
					:checkAll="checkAll"
					:disabled-search="disabledSearch"
					@on-page="onPage"
					@order-release="openDialogRelease"
					@click-icon="clickIcon"
					@change-state="openStateSlider"
					@row-is-selected="rowIsSelected"
					@on-selected-all="selectedAll"
					@on-search="onSearch"
					@edit-order="editOrder"
					@cancel-order="opencancelDialog"
					@change-voucher="changeVoucher"
					@table-option-event="tableAction"
					@detail-sale="detailSale"
					@open-slide-state="openSlideState"
					@on-change-price-status="onChangeStatusLP"
				/>
			</v-flex>
		</v-layout>
		<action-sidebar
			:title="action.title"
			:value="action.value"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="close"
		>
			<view-debts
				v-if="action.code === 'view-debts'"
				:customer-id="customerId"
				@close-modal="close"
			/>
			<slider-order-state
				v-if="action.code === 'state-order'"
				:object-cart="objectCart"
				:object-transaction="objectTransaction"
				@change-payment-state="updatePaymentStateOrder"
				@close-modal="close"
			/>
			<address-slide
				v-if="action.code === 'address-slide'"
				:commerce="informationOrder"
				:loading="loading"
				@get-data="setAddressData"
				@accept-action="updateInformationOrder"
				@cancel-action="close"
			/>
			<ecommerce-warehouses-form
				v-if="action.code === 'WAREHOUSES'"
				:warehouses="warehouses"
				@close="close"
				@save="save"
			/>
			<ecommerce-change-state
				v-if="action.code === 'change-state'"
				:state-id="currentOrder.orderStateId"
				:order-id="currentOrder.id"
				:order-states="orderStates"
				:flag-pick-up-order="currentOrder.flagPickUp"
				:order-state="currentOrder.orderState"
				@close="close"
				@change-state="loadData"
			/>
			<assign-delivery
				v-if="action.code === 'assign-delivery'"
				:distributors="distributors"
				:order="currentOrder"
				@update-assign-delivery="updateAssignDelivery"
				@close="close"
			/>
			<!-- componente con tabla de productos a cambiar de estado (code: update-state-orders) -->
			<slider-update-state-orders
				v-if="action.code === 'update-state-orders'"
				:dataSelected="dataSelected"
				:currentOrderStateiD="dataSelected[0].orderStateId"
				:updateErrors="errorsUpdatingStateOrders"
				@close-modal="closeUpdateStateOrders"
				@update-state-orders="updateStateOrders"
			/>
			<ecommerce-verify-payment
				:rows="dataSelected"
				v-if="action.code === 'VP'"
				@update="updateLoad"
				@close-modal="close"
			/>
			<change-voucher-modal
				v-if="action.code === 'change-voucher'"
				:order="orderSelected"
				@close-modal="close"
				@save="saveChangeVoucher"
			/>
			<order-filter
				v-if="action.code === 'filter-by'"
				:params="params"
				:distributors="distributors"
				:sellers="sellers"
				:transports="agencytransports"
				:sellers-params="params.employeeIds"
				:delivery-params="params.deliveryId"
				:transport-params="params.transportAgencyId"
				:delivery-date-params="params.deliveryDate"
				@close-modal="close"
				@apply-filter="applyFilter"
				@on-input="onInputData"
			/>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="425">
			<v-card>
				<v-card-title class="headline" text-xs-center>
					<p class="mb-0 f-12">
						¿Deseas cambiar de estado el pedido de SOLICITADO a CONFIRMADO?
					</p>
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn color="pink" class="btn-action white--text" @click.native="cancel">
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="updateState('CONFIRMED')"
							>
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogReady" persistent max-width="425">
			<v-card>
				<v-card-title class="headline" text-xs-center>
					<p class="mb-0 f-12">
						¿Deseas cambiar de estado el pedido de CONFIRMADO a LISTO PARA RECOGER?
					</p>
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="cancelReady"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="updateState('READY_TO_DELIVER')"
							>
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogAssign" persistent max-width="425">
			<v-card>
				<v-card-title class="headline" text-xs-center>
					<p class="mb-0 f-12">{{ messageDialogAssign }}</p>
					<div class="layout mt-2" v-if="flagAssign">
						<v-icon color="primary">info</v-icon>
						<span class="text-assign"
							>Al dar click en "Aceptar" deberás asignar un repartidor al pedido. Esto es
							necesario para cambiar de estado.</span
						>
					</div>
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout justify-center row wrap>
						<v-flex xs3 pr-1 text-xs-right>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="cancelDialogAssign"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs3 pl-1 text-xs-left>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="openAssignDelivery"
							>
								Aceptar
							</v-btn>
						</v-flex>
						<v-flex xs3 pl-1 v-if="!!$userInfo.flagAdmin" text-xs-left>
							<v-btn
								@click.native="cancelOrder"
								color="yellowFav"
								class="btn-action white--text"
							>
								Anular
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogCancel" persistent max-width="425">
			<v-card>
				<v-card-title class="headline">
					<p class="mb-0 f-12 text-xs-center">¿Deseas anular el pedido?</p>
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="cancelDialog"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelOrder"
							>
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogDetail" persistent max-width="850">
			<ecommerce-details-in-table
				:key="orderSelected.id"
				modal
				v-if="dialogDetail"
				:order-selected="orderSelected"
				@open-debt="openDebt"
				@close-details="clickIcon"
				@load-data="loadData"
			/>
		</v-dialog>
		<v-dialog v-model="dialogTrans" persistent max-width="425">
			<v-card>
				<v-card-title class="headline" text-xs-center>
					<p class="mb-0 f-12">¿Deseas transformar los pedidos a BOLETA?</p>
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="cancelTransform"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="transformOrders"
							>
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="showRelaese" persistent max-width="400px">
			<modal-items
				v-if="showRelaese"
				name-action="Liberar"
				name-cancel="Cancelar"
				show-slot
				title="Liberar Pedido"
				@close-modal="cancelRelaese"
				@action-modal="applyAction"
			>
				<div class="pa-3">
					<p>Al liberar el pedido cambiara el estado a Listo para Recoger,</p>
				</div>
			</modal-items>
		</v-dialog>
		<template v-if="changeStatusLP">
			<simple-modal
				:open="changeStatusLP"
				@close="onChangeStatusLP"
				textCancel="Cancelar"
				@cancel="onChangeStatusLP"
				textConfirm="Aceptar"
				@confirm="sendChangeStatusLP"
			>
				<span slot="title"
					>Selecciona el estado al que deseas cambiar la lista de precios</span
				>
				<div slot="body" class="d-flex justify-center">
					<v-flex xs6 class="d-flex justify-center">
						<app-select
							:item="statusPriceList"
							item-text="name"
							item-value="id"
							:items="listStatusLP"
							label="Estado"
							model="statusPriceList"
							:return-object="false"
							@input="onInput"
						/>
					</v-flex>
				</div>
			</simple-modal>
		</template>
		<modal-stock-error
			:open="dataErrorStock.open"
			:details="dataErrorStock.details"
			:message="dataErrorStock.message"
			@close-modal="dataErrorStock = { open: false, message: '', details: [] }"
		/>
	</section>
</template>

<script>
// import format from 'date-fns/format';
import helper from '@/shared/helper';
import { differenceInCalendarDays } from 'date-fns';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import addressSlide from '@/components/ecommerce/address-slide';
import sliderOrderState from '@/components/ecommerce/slider-order-state';
import sliderUpdateStateOrders from '@/components/ecommerce/slider-update-state-orders';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import dateComponent from '@/components/shared/date-component';
import ecommerceChangeState from '@/components/ecommerce/change-state';
import ecommerceDetailsInTable from '@/components/ecommerce/ecommerce-details-in-table';
import ecommerceOrdersList from '@/components/ecommerce/ecommerce-orders-list';
import ecommerceVerifyPayment from '@/components/ecommerce/verify-payment';
import ecommerceWarehousesForm from '@/components/ecommerce/ecommerce-warehouses-form';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import viewDebts from '@/components/orders/view-debts';
import lib from '@/shared/lib';
import modalItems from '@/components/shared/modal-items';
import assignDelivery from '@/components/ecommerce/assign-delivery';
import typePickUp from '@/shared/type-pick-up';
import { LIST_ORDER_UBIGEO, LIST_ORDER, LIST_ORDER_DETAIL } from '@/shared/reports';
import wayPaymentsCode from '@/shared/wayPaymentsCodes';
import voucherStatus from '@/shared/voucher-status';
import changeVoucherModal from '@/components/ecommerce/change-voucher';
import orderFilter from '@/components/ecommerce/order-filter';
import simpleModal from '@/components/field-sale/shared/simple-modal';
import modalStockError from '@/components/shared/modal-stock-error';

const enumTypeOrder = {
	Delivery: 1,
	Courier: 2,
	FreeCourier: 3,
};
const { setNewProperty } = lib;

async function created() {
	const params = { showOrdersInProgress: true };
	const request = [
		this.$httpSales.get('order-states'),
		this.$httpSales.get('com-ecommerce-companies'),
		this.$httpSales.get('way-payment'),
		this.$httpSales.get('delivery', { params }),
		this.$httpSales.get('sellers'),
		this.$httpSales.get('transport-agency'),
		this.$httpSales.get('employees', { params: { flagActive: 1 } }),
		this.$httpSales.get('subsidiaries'),
	];
	[
		{ data: this.orderStates },
		{ data: this.listCommerce },
		{ data: this.wayPayments },
		{ data: this.distributors },
		{ data: this.sellers },
		{ data: this.agencytransports },
		{ data: this.employees },
		{ data: this.listSubsidiaries },
	] = await Promise.all(request);
	this.warehouses = this.warehouses.map(setNewProperty('isSelected', false));
	if (this.$userInfo.company.settings.flagTypeOriginOrder) {
		this.listOrigin();
	} else {
		this.originConfig = this.typesPlatform;
	}
	if (this.$userInfo.company.settings.flagPriceListChangeApproval) {
		this.loadChangeStatus();
	}
	// this.columns[21].visible = this.$userInfo.company.settings.flagGrouper || false;
	this.loadData();
}

async function listOrigin() {
	try {
		const response = await this.$httpSales.get('type-origins');
		this.originConfig = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function close() {
	if (this.action.code === 'update-state-orders') this.dataSelected = [];
	this.action.value = false;
	this.action.open = false;
	this.action.code = '';
	this.currentOrder = {};
	this.orderSelected = {};
	this.informationOrder = {};
}

function clickIcon(row) {
	this.orderSelected = this.orderSelected.id === row.id ? { customer: {} } : { ...row };
	this.dialogDetail = !this.dialogDetail;
}

function deleteWarehouseSelected(id) {
	const warSelectedIndex = this.warehousesSelected.findIndex((ws) => ws.id === id);
	if (warSelectedIndex > -1) {
		this.warehousesSelected.splice(warSelectedIndex, 1);
		this.save(this.warehousesSelected);
	}
}

function disabledWarehouse() {
	return this.params.flagPickUp !== 2;
}

function isHomeDelivery() {
	return this.params.flagPickUp === 1;
}

async function loadData() {
	const typeDocuments = await this.getTypeDocuments('sales');
	this.totalOrdersAmount = 0;
	this.disabledSearch = true;
	this.loadingGeneral = true;
	// this.dataSelected = [];
	this.checkAll = false;
	this.params.page = this.currentPage;
	this.params.warehouses = this.params.warehouses || null;
	this.params.orderStateId = this.params.orderStateId || null;
	if (this.$route.query.commerceId) {
		this.params.commerceId = Number(this.$route.query.commerceId);
	}
	const params = { ...this.params };
	delete params.orderStateId;
	if (this.params.orderStateId.length > 0) {
		params.orderStateCodes = this.params.orderStateId.join(',');
	}
	if (this.params.warehouses.length > 0) {
		params.warehouses = this.params.warehouses.join();
	}
	if (this.params.employeeIds.length > 0) {
		if (
			Array.isArray(this.params.employeeIds) &&
			this.params.employeeIds.every((p) => p.employeeId !== undefined)
		) {
			params.employeeIds = this.params.employeeIds.map((p) => p.employeeId).join();
		} else {
			params.employeeIds = this.params.employeeIds.join();
		}
	}
	params.includeEmployee = true;
	params.relationAdd =
		'customer,delivery,orderState,user,details,customerAddress,deliveryAddress,saleDocument';
	// params.flagDebts = false;
	try {
		const response = await this.$httpSales.get('orders', { params });
		this.orders = response.data.map((order) => {
			const {
				additionalInfo,
				additionalInformation,
				commerce,
				customer,
				delivery,
				deliveryAddress,
				flagApproval,
				flagBill,
				flagPickUp,
				orderState,
				responsiblePickUp,
				trackingInformation,
				warehouseAddress,
				wayPayment,
				wayPaymentDetailCode,
				employee,
				deliveryDate,
				priceChangeStatus,
			} = order;
			const { typePerson, flagGeneric } = customer || {};
			let { addressLine1 } = deliveryAddress || {};
			const { address: addressGeneric } = trackingInformation || {};
			addressLine1 = addressLine1 || addressGeneric;
			const { name } = orderState || {};
			const { phone } = responsiblePickUp || {};
			const newOrder = { ...order };
			const customerAddress = customer ? customer.address || '' : '';
			const paymentType = order.additionalInfo && order.additionalInfo.paymentType;
			newOrder.paymentTypeName = paymentType ? paymentType.name : 'No especificado';
			newOrder.paymentTypeCode = paymentType ? paymentType.name.slice(0, 3) : '-';
			newOrder.additionalInfo = additionalInfo || {};
			newOrder.additionalInformation = additionalInformation || {};
			newOrder.address = flagPickUp !== 2 ? warehouseAddress : customerAddress;
			newOrder.iconArrow = 'arrow_forward';
			if (!flagGeneric) {
				newOrder.customerFullName = typePerson ? typePerson.fullName : '';
			} else {
				newOrder.customerFullName = `${responsiblePickUp.name} ${responsiblePickUp.lastname}`;
			}
			newOrder.deliveryFullName = delivery
				? `${delivery.name} ${delivery.lastname}`
				: '-';
			newOrder.responsiblePhone = phone || '-';
			newOrder.employeeName = employee ? employee.name : '';
			newOrder.orderStateName = name || '';
			newOrder.wayPaymentName = wayPayment ? wayPayment.name : '';
			newOrder.addressLine = addressLine1 || '-';
			newOrder.flagPickUpString = flagPickUp
				? 'Envío domicilio'
				: `Recojo ${this.labelWarehouse()}`;
			newOrder.flagApprovalString = flagApproval ? 'Aprobado' : 'Sin aprobar';
			newOrder.commerceName = commerce ? commerce.name || '-' : '-';
			newOrder.deliveryDate =
				deliveryDate && deliveryDate.split('T')[0].split('-').reverse().join('/');
			if (this.isEcuador) {
				newOrder.flagBillString = flagBill ? 'Si' : 'No';
			} else {
				newOrder.flagBillString =
					additionalInfo.typeDocumentName || additionalInfo.typeDocumentCode || '-';
			}

			if (this.$userInfo.company.settings.flagPriceListChangeApproval) {
				const status = this.changeStatus.find((c) => c.id === priceChangeStatus);
				newOrder.priceChangeStatusName = status && status.name;
			}

			if (wayPayment) {
				if (wayPayment.code === wayPaymentsCode.IBD) {
					if (wayPaymentDetailCode) {
						const index = wayPayment.gatewayConfiguration.findIndex(
							(g) => g.code === wayPaymentDetailCode
						);
						if (index > -1) {
							newOrder.paymentMethod = wayPayment.gatewayConfiguration[index].name;
							newOrder.paymentMethodCode = wayPayment.gatewayConfiguration[index].code;
							newOrder.wayPaymentName = `${wayPayment.name} - ${wayPayment.gatewayConfiguration[index].name}`;
						}
					} else {
						newOrder.paymentMethod = 'Depósito';
						newOrder.paymentMethodCode = 'deposito';
						newOrder.wayPaymentName = `${wayPayment.name} - ${
							wayPaymentDetailCode || 'Depósito'
						}`;
					}
					if (order.additionalInfo) {
						if (order.additionalInfo.flagVoucherState) {
							const keysVoucher = Object.keys(voucherStatus);
							const index = keysVoucher.findIndex(
								(v) => voucherStatus[v] === order.additionalInfo.flagVoucherState
							);
							if (index > -1) {
								const flag = Object.keys(voucherStatus)[index];
								newOrder.voucherStatus = this.typesVoucher[flag];
							}
						}
					}
				}
			}
			newOrder.document = order.saleDocument.map((doc) => {
				const code = typeDocuments.data.find(
					(d) => d.documentType.id === doc.salTypeDocumentId
				).documentType.code;
				const objDocument = {
					id: doc.id,
					documentNumber: `${code} - ${doc.documentNumber}`,
				};
				return objDocument;
			});
			return newOrder;
		});
		this.lastPage = Number(response.headers['x-last-page']);
		this.itemsTotalQuantity = Number(response.headers['x-quantity']);
	} catch (err) {
		this.loadingGeneral = false;
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loadingGeneral = false;
		this.disabledSearch = false;
	}
}

function onClean() {
	this.params = {
		employeeId: null,
		employeeIds: [],
		orderStateId: [],
		commerceId: null,
		customerId: null,
		deliveryId: null,
		endDate: null,
		flagPickUp: null,
		limit: 30,
		page: 1,
		startDate: null,
		sortDirection: 'desc',
		sortField: 'created_at',
		orderStates: null,
		paymentStates: null,
		transportAgencyId: null,
		warehouses: [],
		wayPaymentId: null,
		flagShowCancel: 0,
		flagSale: 0,
		originPlatform: null,
		referenceExternal: null,
		deliveryDate: null,
	};
	this.totalOrdersAmount = 0;
	this.warehousesSelected = [];
	this.loadData();
}

function onInput({ model, value }) {
	if (value || model === 'flagDebts') {
		if (model === 'originPlatform') {
			if (this.$userInfo.company.settings.flagTypeOriginOrder) {
				this.params.referenceExternal = value.code;
			} else {
				this.params[model] = value.id;
			}
		} else if (model === 'subsidiaryId') {
			this.params[model] = value;
			this.params.warehouses = [];
			this.getWarehouses(value);
		} else if (model === 'statusPriceList') {
			this.statusPriceList = value;
			return;
		} else {
			this.params[model] = value;
		}
		this.currentPage = 1;
		if (!this.params.startDate && !this.params.endDate) {
			this.loadData();
		} else if (this.params.startDate && this.params.endDate) {
			if (differenceInCalendarDays(this.params.endDate, this.params.startDate) >= 0) {
				this.loadData();
			} else {
				this.showNotification(
					'La fecha final no puede ser menor a la inicial.',
					'warning'
				);
			}
		} else {
			this.showNotification(
				'Para filtrar por fecha es necesario seleccionar la inicial y la final.',
				'warning'
			);
		}
	}
}

async function getWarehouses(value) {
	const { data: warehouses } = await this.warehousesList({
		subsidiaryId: value,
		sortDirection: 'asc',
		sortField: 'name',
	});
	this.warehouses = warehouses || [];
}

function openFilter() {
	if (this.isHomeDelivery) {
		this.showNotification(
			'Los pedidos con tipo de despacho "Envío a Domicilio" no aplican para el filtro por tienda.',
			'info'
		);
	} else {
		this.action.code = 'WAREHOUSES';
		this.action.title = `${this.labelWarehouse(true)}`;
		this.action.width = 450;
		this.action.open = true;
		this.action.value = true;
	}
}

function onPage(page) {
	this.currentPage = page;
	this.loadData();
}

function save(dataSelected) {
	this.warehousesSelected = dataSelected.filter((ds) => ds.isSelected);
	this.params.warehouses = this.warehousesSelected.map((ws) => ws.id).join(',');
	this.warehouses = this.warehouses.map((war) => {
		const warSelected = this.params.warehouses.indexOf(war.id);
		const newWar = { ...war };
		newWar.isSelected = warSelected > -1;
		return newWar;
	});
	this.close();
	this.loadData();
}

function setCustomer(customer) {
	if (customer) {
		this.params.customerId = customer.id;
		this.loadData();
	}
}

function editOrder(row) {
	this.action = {
		code: 'address-slide',
		title: 'Editar Informacion del Pedido',
		open: true,
		width: 500,
	};
	this.idOrder = row.id;
	if (row.typeOrder === enumTypeOrder.Delivery) {
		if (row.customerAddressId) {
			const { addressLine1 } = row.customerAddress;
			this.informationOrder = row.customerAddress;
			this.informationOrder.address = addressLine1;
		} else {
			const { addressLine1 } = row.deliveryAddress;
			this.informationOrder = row.deliveryAddress;
			this.informationOrder.address = addressLine1;
		}
	} else if (
		row.typeOrder === enumTypeOrder.Courier ||
		row.typeOrder === enumTypeOrder.FreeCourier
	) {
		const { deliveryPoint } = row.deliveryJson;
		this.informationOrder = deliveryPoint;
		this.informationOrder.address = deliveryPoint.addressLine;
	}
	const commentary = row.comments;
	const customerComentary = row.additionalInfo ? row.additionalInfo.comentary : '';
	this.informationOrder.comentary = commentary || customerComentary;
}

async function updatePaymentStateOrder() {
	try {
		// Esta funcion se usa para actualizar a pagado,
		// si se desea actualiza a otro estado aplicar los cambios necesarios
		const body = {
			paymentStateId: 3,
			// paymentStateColor: 'teal accent-3',
		};
		await this.$httpSales.patch(`orders/${this.idOrder}/payment`, body);
		this.showNotification('Estado de pago actualizado.');
		this.cancelRelaese();
		this.loadData();
		this.close();
	} catch (error) {
		this.showGenericError();
	}
}

async function updateInformationOrder() {
	const body = {
		comments: this.informationOrder.comentary,
		address: this.informationOrder.address,
		latitude: this.informationOrder.latitude,
		longitude: this.informationOrder.longitude,
	};
	try {
		await this.$httpSales.patch(`order/${this.idOrder}/update-address`, body);
		this.showNotification('La información del pedido se actualizó correctamente.');
		this.close();
		this.loadData();
	} catch (error) {
		if (error.status === 400) {
			this.showGenericError(error.data.messageError);
		} else if (error.status === 500) {
			this.showGenericError();
		}
	}
}

function openDialogRelease({ id }) {
	this.showRelaese = true;
	this.orderId = id;
}

function openStateSlider(order) {
	this.flagAssign = false;
	this.currentOrder = order;
	if (this.currentOrder.orderState.code === 'REQUESTED') {
		this.dialog = true;
	} else if (this.currentOrder.orderState.code === 'CONFIRMED') {
		this.dialogReady = true;
	} else if (this.currentOrder.orderState.code === 'READY_TO_DELIVER') {
		if (this.isDistributor && this.currentOrder.flagPickUp === typePickUp.HomeDelivery) {
			this.messageDialogAssign =
				'¿Deseas cambiar de estado el pedido de LISTO PARA RECOGER a ASIGNADO';
			this.flagAssign = true;
		} else {
			this.messageDialogAssign =
				'¿Deseas cambiar de estado el pedido de LISTO PARA RECOGER a EN CAMINO';
		}
		this.dialogAssign = true;
	} else {
		this.action = {
			code: 'change-state',
			open: true,
			title: `Cambiar estado a pedido ${order.number}`,
			value: true,
			width: 400,
		};
	}
}

function rowIsSelected(row) {
	const { id, isSelected } = row;
	if (isSelected) {
		this.dataSelected.push(row);
	} else {
		const index = this.dataSelected.findIndex((ds) => ds.id === id);
		this.dataSelected.splice(index, 1);
	}
	this.checkAll = this.orders.every((d) => d.isSelected);
	helper.setLocalData('orders-selected', this.dataSelected);
}

function selectedAll(check) {
	this.checkAll = check;
	this.orders = this.orders.map((d) => {
		const newD = { ...d };
		newD.isSelected = check;
		return newD;
	});
	this.dataSelected = [...this.orders.filter((d) => d.isSelected)];
}

function actionsDisabled() {
	const disabledActions = [
		{
			code: 'generate-documents',
			disabled:
				!this.dataSelected.every(
					(p) => p.commerceId === this.dataSelected[0].commerceId
				) || !this.dataSelected.length,
		},
		{ code: 'VP', disabled: !this.dataSelected.length },
		{
			code: 'assign-delivery',
			disabled: this.dataSelected.every((l) => l.orderStateId !== 6),
		},
		{
			code: 'unassign-driver',
			disabled: this.dataSelected.every(
				(o) =>
					o.orderStateId === 1 ||
					o.orderStateId === 3 ||
					o.orderStateId === 4 ||
					o.orderStateId === 5 ||
					o.orderStateId === 6
			),
		},
		{ code: 'transform-into-ballot', disabled: !this.dataSelected.length },
		{
			code: 'update-state-orders',
			disabled: !(
				this.dataSelected.length > 0 &&
				this.dataSelected.every(
					(o) =>
						o.orderStateId === this.dataSelected[0].orderStateId && o.orderStateId !== 3
				)
			),
		},
	];
	return disabledActions;
}

function runAction({ code }) {
	if (code === 'assign-delivery') {
		if (this.dataSelected[0].flagPickUp === typePickUp.HomeDelivery) {
			if (this.dataSelected[0].orderState.code === 'READY_TO_DELIVER') {
				this.currentOrder = { ...this.dataSelected[0] };
				this.action.code = code;
				this.action.title = 'Asignar Repartidor';
				this.action.width = 430;
				this.action.open = true;
				this.action.value = true;
			} else {
				this.showNotification(
					'Solo se asigna repartidores a pedidos que esten listos para recoger',
					'warning'
				);
			}
		} else {
			this.showNotification(
				'Solo se asigna repartidores a pedidos que son envío a domicilio',
				'warning'
			);
		}
	} else if (code === 'VP') {
		if (this.dataSelected[0].flagApproval) {
			this.showNotification('El pago del pedido esta aprobado', 'warning');
		} else {
			this.action.code = code;
			this.action.title = 'Verificar Pago';
			this.action.width = 550;
			this.action.open = true;
			this.action.value = true;
		}
	} else if (code === 'transform-into-ballot') {
		const flag = this.dataSelected.some((d) => d.flagSale);
		const flagType = this.dataSelected.some(
			(d) => d.orderState.code === 'CANCELED' || d.orderState.code === 'REQUESTED'
		);
		if (flag) {
			this.showNotification('Uno o mas pedidos ya fueron transformados a boleta', 'info');
		} else if (this.dataSelected.length > 10) {
			this.showNotification('No se pueden transformar más de 10 pedidos', 'info');
		} else if (flagType) {
			this.showNotification(
				'No se pueden transformar pedidos CANCELADOS O SOLICITADOS',
				'info'
			);
		} else {
			this.dialogTrans = true;
		}
	} else if (code === 'generate-documents') {
		this.goTo('page-generate-documents');
	} else if (code === 'update-state-orders') {
		if (this.dataSelected[0].orderStateId === 6) {
			if (!this.dataSelected.every((o) => o.flagPickUp === typePickUp.PickUpStore)) {
				this.showNotification(
					'Los pedidos seleccionados deben ser con recojo en tienda.',
					'warning'
				);
				return;
			}
		}
		this.action.code = 'update-state-orders';
		this.action.title = 'Editar estado de múltiples pedidos';
		this.action.width = 600;
		this.action.open = true;
		this.action.value = true;
	}
}

function updateLoad() {
	this.close();
	this.loadData();
}

function setAddressData({ model, value }) {
	this.informationOrder[model] = value;
}

async function applyAction() {
	try {
		await this.$httpSales.patch(`orders/${this.orderId}/release-delivery`);
		this.showNotification('Se libero el pedido correctamente.');
		this.cancelRelaese();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadData();
}

function cancel() {
	this.dialog = false;
	this.currentOrder = {};
}

function cancelRelaese() {
	this.showRelaese = false;
}

async function updateState(status = 'CONFIRMED') {
	const url = `orders/${this.currentOrder.id}/update-state`;
	const orderStateId = this.orderStates.find((o) => o.code === status).id;
	const body = { orderStateId };
	try {
		await this.$httpSales.patch(url, body);
		this.showNotification('Se actualizó el pedido con éxito');
		this.cancel();
		this.cancelReady();
		this.cancelDialogAssign();
		this.loadData();
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		} else if (error.status === 400) {
			if (error.data.message === 'ORDER_NOT_APPROVED_YET') {
				this.showGenericError(
					'El pedido debe estar aprobado para poder cambiar el estado.'
				);
			} else if (error.data.message === 'CANCEL_UPDATE_IS_NOT_ALLOWED') {
				this.showGenericError('El pedido no puede ser anulado.');
			} else if (error.data.message === 'ORDER_STOCK_NOT_ENOUGH') {
				const details = error.data.details || []; // {code: string, name: string, stock: number, warehouseName: string}[];
				this.dataErrorStock = {
					message:
						error.data.messageError ||
						'No se puede realizar la venta porque se excede la cantidad en uno o más productos.',
					open: true,
					details,
				};
				const message = 'El pedido no cuenta con stock suficiente';
				this.showGenericError(message);
				this.cancel();
			}
		}
	}
}

function updateAssignDelivery() {
	this.currentOrder = {};
	this.close();
	this.onClean();
	this.currentPage = 1;
	this.loadData();
	this.checkAll = false;
	this.dataSelected = [];
}

async function updateStateOrders(ids, newState) {
	try {
		const newData = await this.$httpSales.patch('/orders/update-state-multiple', {
			orderIds: ids,
			orderStateCode: newState,
		});
		this.errorsUpdatingStateOrders = newData.data.descriptionErrors;
		this.dataSelected = this.dataSelected.map((pedido) => {
			const error = this.errorsUpdatingStateOrders.find((e) => e.id === pedido.id);
			const message = error ? error.orderResponse.message : '';
			const messageError = error ? error.orderResponse.messageError : '';
			const orderResponse = error ? error.orderResponse : {};
			return { ...pedido, message, messageError, orderResponse };
		});
		this.currentOrder = {};
		this.onClean();
		this.currentPage = 1;
		await this.loadData();
		// this.checkAll = false;
		// this.dataSelected = this.orders.filter(o => ids.includes(o.id));
	} catch (error) {
		if (error.status === 400) {
			this.showGenericError(error.data.messageError);
		} else if (error.status === 500) {
			this.showGenericError();
		}
	}
}

function cancelReady() {
	this.dialogReady = false;
}

async function cancelOrder() {
	try {
		const idOrder = this.idOrderCancel || this.currentOrder.id;
		await this.$httpSales.patch(`/orders/${idOrder}/cancel`);
		this.cancelDialogAssign();
		this.cancelDialog();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function cancelDialog() {
	this.dialogCancel = false;
}

function opencancelDialog({ id }) {
	this.idOrderCancel = id || this.currentOrder.id;
	this.dialogCancel = true;
}

function clickMenu() {
	if (!this.isSelectedOrder) {
		this.showNotification('Debe seleccionar una o más filas para exportar.', 'warning');
	}
}

function isSelectedOrder() {
	return Boolean(this.orders.length);
}

function emitExcel(code) {
	const userInfo = this.$userInfo;
	const params = this.params;

	const valuesCommerce =
		userInfo.configFilters.commerces && userInfo.configFilters.commerces.commerces
			? userInfo.configFilters.commerces.commerces.values
			: undefined;

	const valuesWarehouse =
		userInfo.configFilters.orders && userInfo.configFilters.orders.warehouses
			? userInfo.configFilters.orders.warehouses.values
			: [];

	const valuesSubsidiries =
		userInfo.configFilters.orders && userInfo.configFilters.orders.subsidiaries
			? userInfo.configFilters.orders.subsidiaries.values
			: undefined;

	const warehousesFilter =
		params.warehouses && params.warehouses.length > 0 ? params.warehouses : undefined;

	const commonParams = {
		codeRole: userInfo.codeTypeRol,
		flagUseTransportAgency:
			userInfo.company && userInfo.company.settings
				? userInfo.company.settings.flagUseTransportAgency
				: false,
		flagEditOrderVendor:
			userInfo.company && userInfo.company.settings
				? userInfo.company.settings.flagEditOrderVendor
				: false,
		flagAdmin: userInfo.flagAdmin,
		employeeId: params.employeeId || undefined,
		commerceId: params.commerceId || undefined,
		customerId: params.customerId || undefined,
		deliveryId: params.deliveryId || undefined,
		endDate: params.endDate || undefined,
		flagPickUp: params.flagPickUp || undefined,
		startDate: params.startDate || undefined,
		wayPaymentId: params.wayPaymentId || undefined,
	};

	const paramsList = {
		...commonParams,
		employeeIds:
			params.employeeIds && params.employeeIds.length > 0
				? params.employeeIds.join()
				: undefined,
		referenceExternal: params.referenceExternal || undefined,
		commercesId: valuesCommerce && valuesCommerce.length > 0 ? valuesCommerce : undefined,
		subsidiaryIds:
			valuesSubsidiries && valuesSubsidiries.length > 0 ? valuesSubsidiries : undefined,
		sortDirection: params.sortDirection || undefined,
		sortField: params.sortField || undefined,
		paymentState: params.paymentState || undefined,
		orderStateCodes:
			params.orderStateId && params.orderStateId.length > 0
				? params.orderStateId.join(',')
				: undefined,
		flagSale: params.flagSale,
		flagShowCancel: params.flagShowCancel,
		transportAgencyId: params.transportAgencyId || undefined,
		deliveryDate: params.deliveryDate || undefined,
		warehouses:
			valuesWarehouse && valuesWarehouse.length > 0
				? valuesWarehouse.concat(warehousesFilter)
				: warehousesFilter,
		includeEmployee: true,
	};
	const paramsOrders = {
		...commonParams,
		orderStateId:
			params.orderStateId && params.orderStateId.length > 0 ? params.orderStateId : 2,
		paymentStateId: params.paymentState || undefined,
		warehouseIds:
			Array.isArray(params.warehouses) && params.warehouses.length === 0
				? undefined
				: params.warehouses,
	};
	if (code === 'list-order') {
		this.onEmitExcel(LIST_ORDER, 'Reporte Pedidos', paramsList);
	} else if (code === 'orders-detail') {
		this.onEmitExcel(LIST_ORDER_DETAIL, 'Reporte Detalle de Pedidos', paramsList);
	} else {
		this.exportTableOrderDelivery(paramsOrders);
	}
}

async function exportTableOrderDelivery(params) {
	const code = LIST_ORDER_UBIGEO;
	const originName = 'Reporte Pedidos de Entrega';
	this.onEmitExcel(code, originName, params);
}

function columnsToExport() {
	this.columns[8].value = this.$userInfo.company.settings.flagTypeOriginOrder
		? 'referenceExternal'
		: 'originPlatformName';
	const newColumns = this.columns.map((col) => {
		const newCol = Object.assign({}, col);
		delete newCol.id;
		delete newCol.visible;
		delete newCol.checked;
		delete newCol.tooltip;
		delete newCol.flagVisible;
		return newCol;
	});
	return newColumns;
}

function changeVoucher(order) {
	this.orderSelected = { ...order };
	this.action.code = 'change-voucher';
	this.action.title = 'Cambiar estado de voucher';
	this.action.width = 450;
	this.action.open = true;
	this.action.value = true;
}

function detailSale(row) {
	const idSale = Number(row.additionalInfo.salDocumentId);
	const routeData = this.$router.resolve({
		name: 'convert',
		params: { id: idSale },
	});
	window.open(routeData.href, '_blank');
}

async function saveChangeVoucher(flag, id) {
	const body = { flagRejected: !flag };
	try {
		await this.$httpSales.patch(`orders/${id}/voucher/state`, body);
		this.showNotification('Se realizó la acción correctamente');
		this.loadData();
		this.close();
	} catch (error) {
		this.showGenericError();
	}
}

function cancelDialogAssign() {
	this.dialogAssign = false;
}

function openAssignDelivery() {
	if (this.flagAssign) {
		this.dialogAssign = false;
		this.action.code = 'assign-delivery';
		this.action.title = 'Asignar Repartidor';
		this.action.width = 430;
		this.action.open = true;
		this.action.value = true;
	} else {
		this.updateState('IN_ROAD');
	}
}

function openSlideState(row) {
	const gtw = row.gatewayAuthorizationResponse;
	if (gtw && Object.keys(gtw).length !== 0 && row.paymentStateId === 3) {
		const array = Object.entries(gtw.dataMap).map(([key, point]) => ({
			value: point,
			code: key,
		}));
		this.objectCart = array;
		this.objectTransaction = gtw.order;
	} else if (row.paymentStateId === 3) {
		// Si el estado ya esta pagado y no es de la forma de pago antigua,
		// no hacer nada, ignorar el click
		return;
	}
	this.idOrder = row.id;
	this.action.code = 'state-order';
	this.action.title = 'Estado de Pago';
	this.action.width = 500;
	this.action.open = true;
}

function cancelTransform() {
	this.dialogTrans = false;
}

async function transformOrders() {
	const body = {
		typeDocumentCode: this.codeBoleta,
		orders: this.dataSelected.map((d) => {
			const newRow = {
				orderId: d.id,
				warehouseId: d.warehouseId || null,
				flagDispatch: false,
			};
			return newRow;
		}),
	};
	try {
		await this.$httpSales.post('orders/convert-group', body);
		this.showNotification('La acción se realizó correctamente');
		this.cancelTransform();
		this.loadData();
		helper.setLocalData('orders-selected', []);
		this.dataSelected = [];
	} catch (error) {
		if (error.status === 400) {
			const { message } = error.data;
			if (message === 'CANNOT_PROCESS_MULTIPLE_WAREHOUSES') {
				this.showGenericError('Solo se pueden procesar documentos de una misma tienda');
			} else if (message === 'EXCHANGE_RATE_NOT_FOUND') {
				this.showGenericError('Tipo de cambio no fue encontrado');
			} else if (message === 'ORDER_NOT_FOUND') {
				this.showGenericError(
					'Los documentos no fueron encontrados o ya se transformaron'
				);
			}
		} else {
			this.showGenericError();
		}
	}
}

function tableAction({ title, code }) {
	this.action.code = code;
	this.action.title = title;
	this.action.width = 400;
	this.action.value = true;
	this.action.open = true;
}

function applyFilter(items) {
	items.forEach((i) => {
		this.params[i.filter] = i.value;
	});
	this.loadData();
	this.close();
}

function onInputData({ model, value }) {
	this.params[model] = value;
}

async function closeUpdateStateOrders() {
	this.close();
	this.dataSelected = [];
	this.updateErrors = [];
	await this.loadData();
}

function data() {
	return {
		loading: false,
		action: {
			code: '',
			open: false,
			title: '',
			value: false,
			width: 960,
		},
		agencytransports: [],
		columns: [
			{
				id: 1,
				name: 'N. Ped.',
				tooltip: 'Número de Pedido',
				value: 'number',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'T. Despacho',
				tooltip: 'Tienda de Despacho',
				value: 'warehouseName',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Cliente',
				value: 'customerFullName',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Teléfono',
				value: 'responsiblePhone',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Dirección',
				value: 'addressLine',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'F. Creación',
				value: 'createdAt',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'F. Entrega',
				value: 'deliveryDate',
				checked: false,
				visible: false,
			},
			{
				id: 8,
				name: 'T. Envío',
				value: 'pickUpName',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'Origen',
				value: 'originPlatformName',
				checked: true,
				visible: true,
			},
			{
				id: 10,
				name: 'M. Pago',
				tooltip: 'Medio de Pago',
				value: 'wayPaymentName',
				checked: true,
				visible: true,
			},
			{
				id: 11,
				name: 'T. Pago',
				tooltip: 'Tipo de Pago',
				checked: true,
				visible: true,
			},
			{
				id: 12,
				name: 'E. del Pedido',
				tooltip: 'Estado del Pedido',
				value: 'orderStateName',
				checked: true,
				visible: true,
			},
			{
				id: 13,
				name: 'Repartidor',
				value: 'deliveryFullName',
				checked: true,
				visible: true,
			},
			{
				id: 14,
				name: 'Monto',
				value: 'total',
				checked: true,
				visible: true,
			},
			{
				id: 15,
				name: 'Costo de Envió',
				value: 'costShipping',
				checked: true,
				visible: true,
			},
			{
				id: 16,
				name: 'E. de Pago',
				tooltip: 'Estado de Pago',
				value: 'paymentStateName',
				checked: true,
				visible: true,
			},
			{
				id: 17,
				name: 'Tipo de Documento',
				value: 'flagBillString',
				checked: true,
				visible: true,
			},
			{
				id: 18,
				name: 'Estado cambio de lista',
				visible: this.$userInfo.company.settings.flagPriceListChangeApproval,
				checked: this.$userInfo.company.settings.flagPriceListChangeApproval,
				flagVisible: !this.$userInfo.company.settings.flagPriceListChangeApproval,
			},
			{
				id: 19,
				name: 'Pago',
				value: 'flagApprovalString',
				checked: true,
				visible: true,
			},
			{
				id: 20,
				name: 'Gen. Venta',
				checked: true,
				visible: true,
				value: 'flagSale',
				tooltip: 'Generada desde una venta',
			},
			{
				id: 21,
				name: 'Est. Kardex',
				checked: false,
				visible: false,
				value: 'flagSale',
				tooltip: 'Estado de Kardex',
			},
			{
				id: 22,
				name: 'Empleado',
				checked: false,
				visible: false,
				value: 'employeeName',
			},
			{
				id: 23,
				name: 'Comentario',
				checked: false,
				visible: false,
				value: 'comments',
			},
			{
				id: 24,
				name: 'Peso',
				checked: true,
				visible: true,
				value: 'weight',
			},
			{
				id: 25,
				name: 'Acciones',
				value: 'actions',
				checked: true,
				visible: true,
				flagVisible: true,
			},
			// {
			// 	id: 11,
			// 	name: 'Comercio',
			// 	value: 'commerceName',
			// 	checked: true,
			// 	visible: true,
			// },
		],
		currentOrder: {},
		currentPage: 1,
		customerId: null,
		checkAll: false,
		dataSelected: [],
		detailsSelected: [],
		informationOrder: {},
		itemsTotalQuantity: 0,
		dialog: false,
		disabledSearch: false,
		dispatchTypes: [
			{ id: 1, name: 'Envío a Domicilio' },
			{ id: 2, name: 'Retiro en Tienda' },
		],
		employees: [],
		lastPage: 1,
		listCommerce: [],
		loadingGeneral: false,
		sellers: [],
		objectCart: {},
		objectTransaction: {},
		options: [
			{ id: 1, code: 'list-order', name: 'Listado de Pedidos' },
			{ id: 2, code: 'orders', name: 'Pedidos por Entrega', disabled: true },
			{ id: 3, code: 'orders-detail', name: 'Listado de Detalle Pedidos' },
		],
		orders: [],
		orderSelected: {
			customer: {},
		},
		orderStates: [],
		debtsStates: [
			{
				id: 1,
				name: 'Con Deudas',
				value: true,
			},
			{
				id: 2,
				name: 'Sin Deudas',
				value: false,
			},
		],
		params: {
			addressId: null,
			commerceId: null,
			customerId: null,
			deliveryId: null,
			endDate: null,
			employeeId: null,
			employeeIds: [],
			flagShowCancel: 0,
			flagPickUp: null,
			limit: 30,
			orderStateId: [],
			page: 1,
			paymentState: null,
			referenceExternal: null,
			sortDirection: 'desc',
			sortField: 'created_at',
			startDate: null,
			warehouses: [],
			wayPaymentId: null,
			flagSale: 0,
			subsidiaryId: null,
			flagDebts: null,
			deliveryDate: null,
			priceChangeStatus: null,
		},
		changeStatus: [],
		paymentStates: [
			{ id: 1, name: 'Pendiente' },
			{ id: 2, name: 'Parcial' },
			{ id: 3, name: 'Pagado' },
		],
		search: '',
		showRelaese: false,
		toShow: false,
		originConfig: [],
		typesPlatform: [
			{ id: 1, name: 'Desktop' },
			{ id: 2, name: 'Web' },
			{ id: 3, name: 'Movil' },
		],
		warehouses: [],
		warehousesSelected: [],
		wayPayments: [],
		distributors: [],
		dialogReady: false,
		idOrderCancel: null,
		orderId: null,
		dialogCancel: false,
		dialogDetail: false,
		typesVoucher: {
			Pending: 'No se envío el voucher',
			Sent: 'El cliente envío el voucher',
			Confirmed: 'Se confirmo el voucher',
			Rejected: 'Se rechazo el voucher',
		},
		dialogAssign: false,
		messageDialogAssign: '',
		flagAssign: false,
		dialogTrans: false,
		codeBoleta: 'BOL',
		errorsUpdatingStateOrders: [],
		listSubsidiaries: [],
		changeStatusLP: false,
		statusPriceList: null,
		listStatusLP: [
			{ id: 2, name: 'Cambio aprobado' },
			{ id: 3, name: 'Cambio rechazado' },
		],
		dataErrorStock: {
			open: false,
			details: [],
			message: '',
		},
		totalOrdersAmount: 0,
	};
}

export default {
	name: 'pages-ecommerce-order',
	components: {
		actionSidebar,
		appActions,
		autocompleteComponent,
		dateComponent,
		ecommerceChangeState,
		ecommerceDetailsInTable,
		ecommerceOrdersList,
		addressSlide,
		ecommerceVerifyPayment,
		ecommerceWarehousesForm,
		generalFilter,
		headerPage,
		modalItems,
		assignDelivery,
		changeVoucherModal,
		orderFilter,
		sliderOrderState,
		sliderUpdateStateOrders,
		viewDebts,
		simpleModal,
		modalStockError,
	},
	computed: {
		actionsDisabled,
		columnsToExport,
		disabledWarehouse,
		isHomeDelivery,
		isSelectedOrder,
	},
	created,
	data,
	methods: {
		applyAction,
		clickMenu,
		clickIcon,
		close,
		deleteWarehouseSelected,
		detailSale,
		setAddressData,
		emitExcel,
		exportTableOrderDelivery,
		listOrigin,
		loadData,
		onClean,
		updateInformationOrder,
		editOrder,
		getWarehouses,
		onInput,
		onInputData,
		onPage,
		openDialogRelease,
		openFilter,
		openStateSlider,
		save,
		setCustomer,
		rowIsSelected,
		selectedAll,
		runAction,
		updateLoad,
		onSearch,
		cancel,
		cancelReady,
		updateState,
		updateAssignDelivery,
		updateStateOrders,
		cancelOrder,
		cancelDialog,
		opencancelDialog,
		changeVoucher,
		saveChangeVoucher,
		cancelDialogAssign,
		openAssignDelivery,
		cancelTransform,
		cancelRelaese,
		openSlideState,
		transformOrders,
		tableAction,
		applyFilter,
		updatePaymentStateOrder,
		closeUpdateStateOrders,
		openDebt(row) {
			this.dialogDetail = !this.dialogDetail;
			this.action = {
				code: 'view-debts',
				width: 750,
				open: true,
				title: `Detalle de Deuda de ${row.customer.typePerson.fullName}`,
				value: true,
			};
			this.customerId = row.customerId || (row.customer && row.customer.id);
		},
		async loadChangeStatus() {
			try {
				const response = await this.$httpSales.get('price-change-status');
				this.changeStatus = response.data;
			} catch (error) {
				this.showGenericError();
			}
		},
		onChangeStatusLP(row) {
			this.informationOrder = row;
			this.changeStatusLP = !this.changeStatusLP;
			this.statusPriceList = null;
		},
		async sendChangeStatusLP() {
			const { name, lastname } = this.$userInfo;
			const date = new Date();
			const dateNow = `${date.getDate().toString().padStart(2, '0')}/${(
				date.getMonth() + 1
			)
				.toString()
				.padStart(2, '0')}/${date.getFullYear()} ${date
				.getHours()
				.toString()
				.padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

			const { id, additionalInfo } = this.informationOrder;
			const body = {
				changeStatus: this.statusPriceList,
				additionalInfo: {
					...additionalInfo,
					priceListChangeDate: dateNow,
					priceListChanger: `${name} ${lastname}`,
				},
			};
			try {
				await this.$httpSales.patch(`orders/${id}/price-status-update`, body);
				this.showNotification('Se realizo el cambio de estado correctamente');
				this.onChangeStatusLP();
				this.loadData();
			} catch (error) {
				this.showGenericError();
			}
		},
		async getTotalOrders() {
			this.params.warehouses = this.params.warehouses || null;
			this.params.orderStateId = this.params.orderStateId || null;
			if (this.$route.query.commerceId) {
				this.params.commerceId = Number(this.$route.query.commerceId);
			}
			const params = { ...this.params, includeEmployee: true };
			if (this.params.orderStateId.length > 0) {
				params.orderStateCodes = this.params.orderStateId.join(',');
			}
			if (this.params.warehouses.length > 0) {
				params.warehouses = this.params.warehouses.join();
			}
			if (this.params.employeeIds.length > 0) {
				if (
					Array.isArray(this.params.employeeIds) &&
					this.params.employeeIds.every((p) => p.employeeId !== undefined)
				) {
					params.employeeIds = this.params.employeeIds.map((p) => p.employeeId).join();
				} else {
					params.employeeIds = this.params.employeeIds.join();
				}
			}

			delete params.orderStateId;
			delete params.limit;
			delete params.page;
			delete params.sortField;
			delete params.sortDirection;

			try {
				this.loadingGeneral = true;
				const response = await this.$httpReportSales.get('order-totals', {
					params,
				});
				this.totalOrdersAmount = response && response.data.totalOrders;
			} catch (error) {
				console.error(error);
				this.showGenericError();
			} finally {
				this.loadingGeneral = false;
			}
		},
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
</style>
