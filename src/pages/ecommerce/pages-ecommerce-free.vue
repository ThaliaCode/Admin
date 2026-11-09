<template>
	<section>
		<header-page
			name="ecommerce-courier"
			:title="$route.meta.title"
			:show-excel="false"
			:showClean="false"
			@clean-product-filter="onClean"
			to-show
		>
			<!-- <v-flex text-xs-right xs3>
				<v-tooltip top>
					<v-btn
						:disabled="!orders.length > 0"
						color="primary"
						mr-3
						slot="activator"
						@click="downloadOrdersFree"
					>
						<img :src="`${$imageUrl}/fill-1.svg`" alt="download" height="20">
					</v-btn>
					<span>Reporte de Pedidos Libres</span>
				</v-tooltip>
			</v-flex> -->
		</header-page>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<general-filter class="layout wrap align-end pt-4">
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
					<v-flex xs2 pr-1>
						<app-select
							label="Repartidor"
							item-text="name"
							item-value="id"
							model="deliveryId"
							:item="params.deliveryId"
							:items="distributors"
							:return-object="false"
							@input="onInput"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
		</general-filter>
		<section class="overflow-auto mt-4">
			<app-table
				class="is-not-selectable"
				name="orders"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="orders"
				:checkAll="checkAll"
				disabled-value="flagApproval"
				selectable
				@on-page="onPage"
				@on-search-event="onSearch"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">
						{{ props.row.number }}
					</td>
					<td v-show="showRow(columns, 2)">
						{{ getValue(props.row, 'pickUpPoint', 'addressLine') }}
					</td>
					<td v-show="showRow(columns, 3)">
						{{ getValue(props.row, 'deliveryPoint', 'addressLine') }}
					</td>
					<td v-show="showRow(columns, 4)">
						{{ getValue(props.row, 'pickUpPoint', 'contact') }}
					</td>
					<td v-show="showRow(columns, 5)">
						{{ getValue(props.row, 'deliveryPoint', 'contact') }}
					</td>
					<td v-show="showRow(columns, 6)">
						{{ props.row.costShipping | round }}
					</td>
					<td v-show="showRow(columns, 7)">{{ props.row.total | round }}</td>
					<td v-show="showRow(columns, 8)">
						{{ props.row.createdAt | formatDate('DD/MM/YYYY HH:mm:ss') }}
					</td>
					<td v-show="showRow(columns, 9)">
						{{ props.row.deliveryDate | formatDate('DD/MM/YYYY HH:mm:ss') }}
					</td>
					<td v-show="showRow(columns, 10)">
						{{ props.row.commerce ? props.row.commerce.name : '---' }}
					</td>
					<td v-show="showRow(columns, 11)">
						{{ props.row.orderStateName || '---' }}
					</td>
					<td v-show="showRow(columns, 12)">
						{{ props.row.deliveryFullName }}
					</td>
					<td v-show="showRow(columns, 13)">
						{{ props.row.routePickUp ? props.row.routePickUp.name : '---' }}
					</td>
					<td v-show="showRow(columns, 14)">
						{{ props.row.routeName || '---' }}
					</td>
					<td v-show="showRow(columns, 15)">
						<document-state
							:color="props.row.paymentStateColor"
							:tooltip="props.row.paymentStateName"
						/>
					</td>
					<td v-show="showRow(columns, 16)">
						<document-state
							:color="getColorImmediateDelivery(props.row)"
							:tooltip="getTextImmediateDelivery(props.row)"
						/>
					</td>
					<td v-show="showRow(columns, 17)" class="w-100">
						<app-tooltip-button
							:disabled="disabledAction(props.row)"
							icon="call_split"
							:text="textLabelSate(props.row)"
							color="success"
							size="20"
							@click-icon="openStateSlider(props.row)"
						/>
						<app-tooltip-button
							icon="remove_red_eye"
							text="Ver Detalle"
							color="success"
							size="20"
							@click-icon="goToDetail(props.row)"
						/>
						<app-tooltip-button
							v-if="showCancel(props.row)"
							icon="cancel_presentation"
							text="Cancelar pedido"
							color="error"
							size="20"
							@click-icon="openCancelDialog(props.row)"
						/>
						<app-tooltip-button
							text="Editar Información del Pedido"
							icon="edit"
							color="success"
							@click-icon="openEditOrder(props.row)"
						/>
						<v-tooltip top>
							<a
								slot="activator"
								@click.stop.prevent="downloadOrder(props.row)"
								class="table-icon"
							>
								<img
									:src="`${$imageUrl}/download.svg`"
									alt=""
									class="align-img"
								/>
							</a>
							<span> Descargar Pedido </span>
						</v-tooltip>
					</td>
				</template>
			</app-table>
		</section>
		<v-dialog v-model="dialog" persistent max-width="425">
			<v-card>
				<v-card-title class="headline" text-xs-center>
					<p class="mb-0 f-12">{{ message }}</p>
					<div class="layout mt-2" v-if="flagAssign">
						<v-icon color="primary">info</v-icon>
						<span class="text-assign"
							>Al dar clic en "Aceptar" debe asignar un repartidor al pedido ya
							que necesario para cambiar de estado.</span
						>
					</div>
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancel"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="updateState()"
							>
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
			<address-slide
				v-if="action.code === 'address-slide'"
				:commerce="informationOrder"
				@get-data="setAddressData"
				@accept-action="updateInformationOrder"
				@cancel-action="close"
			/>
			<assign-delivery
				v-if="action.code === 'assign-delivery'"
				:distributors="distributors"
				:order="currentOrder"
				@update-assign-delivery="updateAssignDelivery"
				@close="close"
			/>
			<v-layout column v-if="action.code === 'import-excel'" pt-3>
				<v-flex xs12 px-3 mt-2 text-xs-right>
					<!-- esta ruta ya no descarga nada -->
					<a
						href="AccessDenied"
						download="plantilla-pedidos"
						class="btn-download-excel-template"
					>
						Descargar Plantilla Excel
					</a>
				</v-flex>
				<v-flex xs12 px-3>
					<label ref="label" for="upload-image" class="w-100">
						<vue-six-four
							id="upload-image"
							hidden
							@vue-six-four="getFileUpdate"
						/>
						<v-layout wrap>
							<v-flex xs9 mt-1 pr-2>
								<app-input-text label="Importar Pedido" readonly :text="link" />
							</v-flex>
							<v-flex xs3 mt-4 text-xs-center>
								<button
									@click="showDialog"
									:disabled="loadImage"
									class="btn-upload"
								>
									Adjuntar
								</button>
							</v-flex>
						</v-layout>
					</label>
					<span class="error--text caption" v-if="$v.model.file.$invalid">
						Debe elegir un documento a importar
					</span>
				</v-flex>
				<v-layout row px-3 mt-3 v-if="showOrders">
					<v-flex>
						<button
							class="btn-orders"
							:class="{ active: toShow === 1 }"
							@click="selectedBtn('1')"
						>
							Pedidos Importados
						</button>
					</v-flex>
					<v-flex ml-3>
						<button
							class="btn-orders"
							:class="{ active: toShow === 2 }"
							@click="selectedBtn('2')"
						>
							Pedidos con Error
						</button>
					</v-flex>
				</v-layout>
				<v-flex xs12 v-if="showOrders">
					<app-table
						v-if="toShow === 1"
						class="mt-3"
						:columns="columnsOrders"
						:rows="ordersImport"
						:inputSearch="false"
					>
						<template slot="rows" slot-scope="props">
							<td class="is-not-selectable" v-show="showRow(columns, 1)">
								{{ props.row.referenceExternal }}
							</td>
							<td v-show="showRow(columns, 2)">
								{{ props.row.wayPaymentDetailCode }}
							</td>
						</template>
					</app-table>
					<app-table
						v-else
						class="mt-3"
						:columns="columnsOrders"
						:rows="ordersNotImport"
						:inputSearch="false"
					>
						<template slot="rows" slot-scope="props">
							<td class="is-not-selectable" v-show="showRow(columns, 1)">
								{{ props.row.referenceExternal }}
							</td>
							<td v-show="showRow(columns, 2)">
								{{ props.row.wayPaymentDetailCode }}
							</td>
							<td v-show="showRow(columns, 3)">{{ props.row.comments }}</td>
						</template>
					</app-table>
				</v-flex>
				<section class="fast-register-footer">
					<modal-sidebar-button
						:is-loading="!link"
						success-text="Importar Pedido"
						success-color="primary"
						@accept-button-clicked="generateOrders"
						@cancel-button-clicked="close"
					/>
				</section>
			</v-layout>
		</action-sidebar>
		<v-dialog v-model="showUnassign" persistent max-width="333px">
			<modal-items
				title="Liberar Pedido"
				v-if="showUnassign"
				name-action="Liberar"
				@close-modal="closeModalUnassign"
				@action-modal="unassignDriver"
				show-slot
			>
				<div class="px-3 pt-5 pb-5 text-modal">
					¿Estás seguro de liberar el pedido seleccionado?
				</div>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="dialogCancel" persistent max-width="425">
			<v-card>
				<v-card-title class="headline">
					<p class="mb-0 f-12 text-xs-center">
						¿Deseas cancelar el pedido Nº {{ orderCancel.number }}?
					</p>
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="cancelDialog"
							>
								Cerrar
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
	</section>
</template>

<script>
import { LIST_ORDERS_FREE } from '@/shared/reports';
import { differenceInCalendarDays } from 'date-fns';
import { required } from 'vuelidate/lib/validators';
import addressSlide from '@/components/ecommerce/address-slide';
import dateComponent from '@/components/shared/date-component';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import typeOrder from '@/shared/type-order';
import actionSidebar from '@/components/shared/action-sidebar';
import assignDelivery from '@/components/ecommerce/assign-delivery';
import lib from '@/shared/lib';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import typePickUp from '@/shared/type-pick-up';
import appActions from '@/components/shared/app-actions';
import documentState from '@/components/shared/document-state';
import helper from '@/shared/helper';
import modalItems from '@/components/shared/modal-items';
import VueSixFour from 'vue-six-four';
import upLoadImageMixin from '@/mixins/upLoadImage';

const { getDeeper } = lib;
const { exactDate, showDownloadDialog, generateBlob } = helper;

async function created() {
	this.loadData();
	this.loadOrderStates();
}

async function loadData() {
	this.dataSelected = [];
	this.params.page = this.currentPage;
	this.params.orderStateId = this.params.orderStateId || null;
	const params = { ...this.params };
	delete params.orderStateId;
	params.includeRoutePickUp = true;
	if (this.params.orderStateId.length > 0) {
		params.orderStateCodes = this.params.orderStateId.join(',');
	}
	try {
		const response = await this.$httpSales.get('orders', { params });
		this.orders = response.data.map((order) => {
			const {
				commerce,
				customer,
				delivery,
				deliveryAddress,
				flagApproval,
				flagBill,
				flagPickUp,
				orderState,
				responsiblePickUp,
				warehouseAddress,
				wayPayment,
				createdAt,
				deliveryDate,
			} = order;
			const { typePerson } = customer || {};
			const { addressLine1 } = deliveryAddress || {};
			const { name } = orderState || {};
			const { phone } = responsiblePickUp || {};
			const newOrder = { ...order };
			newOrder.address = flagPickUp !== 2 ? warehouseAddress : customer.address;
			newOrder.iconArrow = 'arrow_forward';
			newOrder.customerFullName = typePerson ? typePerson.fullName : '';
			newOrder.deliveryFullName = delivery
				? `${delivery.name} ${delivery.lastname}`
				: '---';
			newOrder.responsiblePhone = phone || '';
			newOrder.orderStateName = name || '';
			newOrder.wayPaymentName = wayPayment ? wayPayment.name : '';
			newOrder.addressLine = addressLine1 || '';
			newOrder.flagPickUpString = flagPickUp
				? 'Envío domicilio'
				: `Recojo ${this.labelWarehouse()}`;
			newOrder.flagApprovalString = flagApproval ? 'Aprobado' : 'Sin aprobar';
			newOrder.commerceName = commerce ? commerce.name || '--' : '--';
			newOrder.createdAtSet = exactDate(createdAt, 'DD/MM/YYYY HH:mm:ss');
			newOrder.deliveryDateSet = exactDate(deliveryDate, 'DD/MM/YYYY HH:mm:ss');
			if (this.isEcuador) {
				newOrder.flagBillString = flagBill ? 'Si' : 'No';
			} else {
				newOrder.flagBillString = flagBill ? 'FACTURA' : 'BOLETA';
			}
			return newOrder;
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
		orderStateId: [],
		endDate: null,
		limit: 20,
		page: 1,
		startDate: null,
		sortDirection: 'desc',
		sortField: 'created_at',
		typeOrder: typeOrder.FREE,
		flagPickUp: null,
		commerceId: null,
		customerId: null,
		deliveryId: null,
	};
	this.loadData();
}

function onInput({ model, value }) {
	if (value) {
		this.params[model] = value;
		this.currentPage = 1;
		if (!this.params.startDate && !this.params.endDate) {
			this.loadData();
		} else if (this.params.startDate && this.params.endDate) {
			if (
				differenceInCalendarDays(this.params.endDate, this.params.startDate) >=
				0
			) {
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
	this.dataSelected = [...this.orders.filter((d) => d.isSelected)];
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadData();
}

function getValue(row, valueOne, valueTwo) {
	return getDeeper('deliveryJson', valueOne, valueTwo)(row) || '---';
}

function goToDetail({ id }) {
	this.goTo('courier-detail-free', {
		params: { id },
		query: { origin: 'free' },
	});
}

function disabledAction({ orderState }) {
	const { code } = orderState;
	return code === 'GIVEN' || code === 'CANCELED';
}

function textLabelSate({ orderState: { code } }) {
	if (code === 'GIVEN') {
		return 'El pedido ya fue entregado';
	} else if (code === 'CANCELED') {
		return 'El pedido fue cancelado';
	}
	return 'Cambiar de estado';
}

function openStateSlider(order) {
	this.currentOrder = order;
	this.flagAssign = false;
	if (this.currentOrder.orderState.code === 'REQUESTED') {
		this.message =
			'¿Deseas cambiar de estado el pedido de SOLICITADO a CONFIRMADO?';
		this.codeChangeOrder = 'CONFIRMED';
	} else if (this.currentOrder.orderState.code === 'CONFIRMED') {
		this.message =
			'¿Deseas cambiar de estado el pedido de CONFIRMADO a LISTO PARA RECOGER?';
		this.codeChangeOrder = 'READY_TO_DELIVER';
	} else if (this.currentOrder.orderState.code === 'READY_TO_DELIVER') {
		if (
			this.isDistributor &&
			this.currentOrder.flagPickUp === typePickUp.HomeDelivery
		) {
			this.message =
				'¿Deseas cambiar de estado el pedido de LISTO PARA RECOGER a ASIGNADO';
			this.flagAssign = true;
		} else {
			this.message =
				'¿Deseas cambiar de estado el pedido de LISTO PARA RECOGER a EN CAMINO';
			this.codeChangeOrder = 'IN_ROAD';
		}
	} else if (this.currentOrder.orderState.code === 'IN_ROAD') {
		this.message =
			'¿Deseas cambiar de estado el pedido de EN CAMINO a EN ENTREGADO?';
		this.codeChangeOrder = 'GIVEN';
	} else if (this.currentOrder.orderState.code === 'ASSIGNED') {
		this.message =
			'¿Deseas cambiar de estado el pedido de ASIGNADO a EN CAMINO?';
		this.codeChangeOrder = 'IN_ROAD';
	}
	this.dialog = true;
}

function openEditOrder(row) {
	this.action = {
		code: 'address-slide',
		title: 'Editar Informacion del Pedido',
		open: true,
		width: 500,
	};
	this.idOrder = row.id;
	const { deliveryPoint } = row.deliveryJson;
	this.informationOrder = deliveryPoint;
	this.informationOrder.address = deliveryPoint.addressLine;
	this.informationOrder.comentary = row.comments;
}

function cancel() {
	this.dialog = false;
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
		const orderStateId = this.orderStates.find(
			(o) => o.code === this.codeChangeOrder
		).id;
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
					this.showGenericError(
						'El pedido debe estar aprobado para poder cambiar el estado.'
					);
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
	this.link = null;
	this.showOrders = false;
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
		{
			code: 'assign-delivery',
			disabled: this.dataSelected.every((l) => l.orderStateId !== 6),
		},
		{ code: 'import-excel', disabled: this.dataSelected.length >= 1 },
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
			this.showNotification(
				'Solo se asigna repartidores a pedidos que esten listos para recoger',
				'warning'
			);
		}
	} else if (code === 'unassign-driver') {
		this.showUnassign = true;
		this.currentOrder = { ...this.dataSelected[0] };
	} else if (code === 'import-excel') {
		this.action = {
			title: 'Importar Pedido',
			open: true,
			value: true,
			width: 650,
		};
		this.action.code = code;
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
}

function getColorImmediateDelivery(row) {
	const { immediateDelivery } = row.additionalInfo;
	return immediateDelivery ? 'success' : 'error';
}

function getTextImmediateDelivery(row) {
	const { immediateDelivery } = row.additionalInfo;
	return immediateDelivery ? 'Si' : 'No';
}

async function getFileUpdate(fileInfo) {
	this.loadImage = true;
	const newFile = {
		name: fileInfo.name.replace(/\s/g, '-'),
		base64data: fileInfo.sixFour,
	};
	try {
		const words = newFile.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			this.link = newFile.name;
			this.model.file = newFile.base64data;
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loadImage = false;
	}
}

function showDialog() {
	this.$refs.label.click();
}

function validations() {
	return {
		model: {
			file: { required },
		},
	};
}

async function generateOrders() {
	const body = {
		base64data: this.model.file,
		newColumns: [
			'orderCode',
			'date',
			'commerceName',
			'commerceCode',
			'customerDni',
			'customerEmail',
			'customerName',
			'customerPhone',
			'customerAddress',
			'customerReference',
			'parishId',
			'cityId',
			'provinceId',
			'productId',
			'typePaymentId',
			'typePaymenName',
			'productName',
			'costShipping',
			'total',
			'observation',
			'deliveryId',
			'deliveryName',
			'packageType',
		],
		replace: true,
	};
	try {
		const response = await this.$httpSales.post('orders-import-excel', body);
		this.showOrders = true;
		this.ordersImport = response.data.orders || [];
		this.ordersNotImport = response.data.unregisteredOrders;
		this.showNotification('Se importo el documento correctamente');
		this.link = null;
	} catch (e) {
		this.showGenericError();
	}
}

function selectedBtn(value) {
	if (value === '1') {
		this.toShow = 1;
		this.columnsOrders[2].visible = false;
	} else {
		this.toShow = 2;
		this.columnsOrders[2].visible = true;
	}
}

function setAddressData({ model, value }) {
	this.informationOrder[model] = value;
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
		this.showNotification(
			'La información del pedido se actualizó correctamente.'
		);
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

async function downloadOrder(row) {
	try {
		const body = { code: 'order-details-pdf' };
		const downloadDialog = this.$userInfo.company.settings.downloadSale;
		const responseType = 'blob';
		const contentType = downloadDialog ? 'application/pdf' : 'text/html';
		const { data: response } = await this.$httpSales.post(
			`orders/${row.id}/pdf`,
			body,
			{ responseType }
		);
		const blob = generateBlob(response, contentType);
		this.showNotification('Se genero el reporte correctamente');
		showDownloadDialog(blob, 'Reporte de Pedido', downloadDialog);
	} catch (error) {
		this.showGenericError();
	}
}

async function unassignDriver() {
	const id = this.currentOrder.id;
	try {
		await this.$httpSales.patch(`orders/${id}/release-delivery`);
		this.closeModalUnassign();
		this.showNotification('Se desasigno el repartidor correctamente.');
		this.loadData();
	} catch (e) {
		if (e.status === 400) {
			if (e.data.message === 'ORDER_UNASSIGNED_YET') {
				this.showGenericError('El pedido no esta asignado a un repartidor');
			}
		} else {
			this.showGenericError();
		}
	}
}

function closeModalUnassign() {
	this.showUnassign = false;
}

function downloadOrdersFree() {
	const params = { ...this.params };
	this.onEmitExcel(LIST_ORDERS_FREE, 'listado_pedidos_libre_', params);
}

function columnsOrdersExport() {
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

function data() {
	return {
		toShow: 1,
		action: {
			code: '',
			open: false,
			title: '',
			value: false,
			width: 400,
		},
		allowedFiles: ['xls', 'xlsx', 'txt'],
		columnsOrders: [
			{
				id: 1,
				name: 'Código',
				value: 'number',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Tipo de Pago',
				value: 'number',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Observación',
				value: 'number',
				checked: false,
				visible: false,
			},
		],
		columns: [
			{
				id: 1,
				name: 'N. de Servicio',
				value: 'number',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Dirección de Origen',
				value: 'addressOfOrigin',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Dirección de Destino',
				value: 'destinationAddress',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Contacto de Origen',
				value: 'sourceContact',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Contacto de Destino',
				value: 'destinationContact',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Costo de envió',
				value: 'costShipping',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Monto',
				value: 'total',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'F. Creación',
				value: 'createdAt',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'F. Entrega',
				value: 'deliveryDate',
				checked: true,
				visible: true,
			},
			{
				id: 10,
				name: 'Comercio',
				value: 'commerceName',
				checked: true,
				visible: true,
			},
			{
				id: 11,
				name: 'Estado del pedido',
				value: 'orderStateName',
				checked: true,
				visible: true,
			},
			{
				id: 12,
				name: 'Repartidor',
				value: 'deliveryFullName',
				checked: true,
				visible: true,
			},
			{
				id: 13,
				name: 'R.D. Recojo',
				value: 'routePickUp',
				tooltip: 'Ruta de Distribución de Recojo',
				checked: true,
				visible: true,
			},
			{
				id: 14,
				name: 'R.D. Entrega',
				value: 'routeName',
				tooltip: 'Ruta de Distribución de Entrega',
				checked: true,
				visible: true,
			},
			{
				id: 15,
				name: 'E. de Pago',
				tooltip: 'Estado de Pago',
				value: 'paymentStateName',
				checked: true,
				visible: true,
			},
			{
				id: 16,
				name: 'E. Inmediata',
				tooltip: 'Entrega Inmediata',
				value: 'immediateDelivery',
				checked: true,
				visible: true,
			},
			{
				id: 17,
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
		idOrder: null,
		informationOrder: {},
		lastPage: 1,
		link: null,
		listCommerce: [],
		loadImage: false,
		options: [{ id: 1, code: 'list-order', name: 'Listado de Pedidos Libres' }],
		orders: [],
		ordersImport: [],
		ordersNotImport: [],
		orderStates: [],
		params: {
			orderStateId: [],
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
			deliveryId: null,
		},
		paymentStates: [
			{ id: 1, name: 'Pendiente' },
			{ id: 2, name: 'Parcial' },
			{ id: 3, name: 'Pagado' },
		],
		rowsOrders: [],
		model: {
			file: null,
		},
		search: '',
		showOrders: false,
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
		showUnassign: false,
	};
}

export default {
	name: 'pages-ecommerce-free',
	components: {
		addressSlide,
		dateComponent,
		generalFilter,
		headerPage,
		appTable,
		modalSidebarButton,
		modalItems,
		actionSidebar,
		assignDelivery,
		appActions,
		documentState,
		VueSixFour,
	},
	created,
	computed: {
		actionsDisabled,
		columnsOrdersExport,
	},
	data,
	mixins: [upLoadImageMixin],
	methods: {
		close,
		closeModalUnassign,
		downloadOrder,
		downloadOrdersFree,
		getFileUpdate,
		generateOrders,
		loadData,
		onClean,
		onInput,
		onPage,
		setAddressData,
		selectedAll,
		onSearch,
		getValue,
		goToDetail,
		textLabelSate,
		disabledAction,
		openStateSlider,
		cancel,
		updateInformationOrder,
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
		unassignDriver,
		openEditOrder,
		selectedBtn,
		showDialog,
		getColorImmediateDelivery,
		getTextImmediateDelivery,
	},
	validations,
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

.btn-upload {
	background: map-get($colors, primary);
	border-radius: 5px;
	color: map-get($colors, white);
	font-size: 10px;
	height: 29px;
	width: 100%;
}

.btn-download-excel-template {
	background-color: color(primary);
	border-radius: 5px;
	color: color(white);
	font-family: font(open-semibold);
	font-size: size(small10);
	padding: 7px 10px;
	text-decoration: none;
}

.ft-12 {
	font-size: 12px;
}

.btn-orders {
	background-color: #fbfbfb;
	border: 1px solid color(primary);
	border-radius: 5px;
	color: color(primary);
	font-family: font(open-semibold);
	font-size: 12px;
	height: 29px;
	width: 100%;

	&.active {
		background-color: color(primary);
		color: white;
	}
}
</style>
