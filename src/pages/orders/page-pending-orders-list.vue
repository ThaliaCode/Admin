<template>
	<div class="page-pending-orders" :key="componentKey">
		<header-page
			:btn-header-link="btnHeaderLink"
			btn-header-text="Ver Mapa"
			btn-header-show
			:caption-navigation="captionNavigation"
			column-class="xs12"
			justify-class="justify-start"
			:options="options"
			:title="title"
			@emit-excel="emitExcel"
			to-show
			:show-excel="false"
			:show-excel-menu="$route.name === 'detail-route-distribution'"
			:open-on-click="true"
			:show-clean="
				$route.name === 'pending-orders-list' || $route.name === 'pick-up-earrings'
			"
			@clean-product-filter="cleanFilters"
		>
			<v-layout
				class="header-modal-information"
				mr-2
				v-if="$route.name === 'detail-route-distribution'"
			>
				<v-flex text-xs-center class="item-information">
					Fecha de Entrega:
					<span class="num-information">{{ headerInformation.dateRoute }}</span>
				</v-flex>
				<v-flex text-xs-center class="item-information">
					Estado:
					<span class="num-information">{{ headerInformation.statusName }}</span>
				</v-flex>
				<v-flex text-xs-center class="item-information">
					Recorrido:
					<span class="num-information">{{ headerInformation.distance }}</span>
				</v-flex>
				<v-flex text-xs-center class="item-information">
					Peso Total:
					<span class="num-information">{{ totalWeightDetail | round }}</span>
				</v-flex>
			</v-layout>
			<v-layout mr-5 row justify-end v-if="$route.name === 'pending-orders-list'">
				<v-flex xs2 mr-2>
					<p class="ma-0 label-lg">Peso Total:</p>
					<span class="value-lg">{{ totalWeightPending | round }}</span>
				</v-flex>
				<v-flex xs3>
					<p class="ma-0 label-lg">Peso Seleccionado:</p>
					<span class="value-lg">{{ totalWeightSelected | round }}</span>
				</v-flex>
			</v-layout>
			<v-btn
				v-if="$route.name === 'pending-orders-list' || $route.name === 'pick-up-earrings'"
				class="btn-auto px-3 py-2 ma-0 mr-3"
				color="primary"
				:disabled="disabledConsolidation"
				outline
				@click="showSlide('consolidation', 'CONSOLIDACIÓN')"
			>
				Ver Consolidación ({{ totalOrders }})
			</v-btn>
			<v-btn
				v-else
				class="btn-auto px-3 py-2 ma-0 mr-3"
				color="primary"
				outline
				@click="goToConsolidationOrder"
			>
				Ver Consolidación
			</v-btn>
			<v-btn class="py-1 px-1 mr-3" flat @click="exportExcel">
				<v-icon color="primary">print</v-icon>
			</v-btn>
			<v-menu
				content-class="excel-menu-content"
				offset-y
				:nudge-bottom="5"
				:nudge-left="120"
				v-if="showPdfMenu"
				:open-on-click="openOnClick"
			>
				<v-btn
					slot="activator"
					class="btn-download-excel btn-auto py-1 px-1 mr-3"
					:disabled="false"
				>
					<img src="/static/img/icon-pdf.svg" height="17" class="align-img" />
				</v-btn>
				<v-list>
					<v-list-tile
						v-for="option in optionsPdf"
						v-if="option.view === $route.name"
						:key="option.id"
						@click="downloadMassive(option)"
					>
						<v-list-tile-title>
							{{ option.name }}
						</v-list-tile-title>
					</v-list-tile>
				</v-list>
			</v-menu>
			<div class="nowrap mx-3">
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
		/>
		<v-layout
			v-if="$route.name === 'pending-orders-list' || $route.name === 'pick-up-earrings'"
		>
			<filters-section
				:customers="customers"
				:filter-fields="filterFields"
				:pick-up-types="pickUpTypes"
				:sellers="sellers"
				:employees="employees"
				:transports="transports"
				:states="states"
				:subsidiaries="listSubsidiaries"
				:warehouses="listWarehouses"
				:order-states="orderStates"
				:origin-list="originList"
				:groups="groups"
				@filter-list="filterList"
				@set-filter-data="setFilterData"
				@set-filter-employee="setFilterEmployee"
			></filters-section>
		</v-layout>
		<v-layout v-if="$route.name === 'detail-route-distribution'">
			<v-flex xs3 px-4 pt-3>
				<app-select
					multiple
					chips
					label="E. del Pedido"
					item-text="name"
					item-value="code"
					:items="orderStates"
					model="orderStateId"
					:item="params.orderStateId"
					return-object
					@input="onInput"
				/>
			</v-flex>
		</v-layout>
		<v-layout wrap mt-3 class="mb-120">

			<v-flex x12 px-5>
				<p class="body-1 primary--text text-xs-right">
					Total de pedidos seleccionados: {{ dataSelected.length }} |
					<app-tooltip-button
						icon="delete_sweep"
						text="Deseleccionar todos"
						color="primary"
						size="20"
						@click-icon="cleanFilters"
					/>
				</p>
			</v-flex>
			<v-flex :class="toShow ? 'xs8 active' : 'xs12'">
				<pending-orders-list
					is-icon
					:check-all="checkAll"
					:total-orders="ordersQuantity"
					:clean-search="cleanSearch"
					:columns="columns"
					:current-page="currentPage"
					:last-page="lastPage"
					:padding="toShow ? 'pl-4 pr-0' : 'px-4'"
					:rows="orders"
					@open-edit-order="openEditOrder"
					@click-icon="onClickIcon"
					@column-sortable="columnSortable"
					@on-page="loadOrders"
					@on-search="onSearchEvent"
					@on-selected-all="onSelectedAll"
					@open-filter="showSlide('filter', 'FILTRAR')"
					@row-is-selected="rowIsSelected"
					@detail-sale="detailSale"
					@open-slide-state="openSlideState"
					@open-debt="openModalAmortization"
				></pending-orders-list>
			</v-flex>
			<transition name="fade-left" mode="out-in">
				<v-flex xs4 pt-2 pr-4 :class="{ active: toShow }" v-show="toShow">
					<order-detail-card
						:check-all="checkAllProducts"
						:check-all-disabled="checkAllDisabled"
						:order="order"
						@close-detail="closeDetail"
					></order-detail-card>
				</v-flex>
			</transition>
		</v-layout>
		<action-sidebar
			:back-btn="isAction('filter')"
			:title="action.title"
			:value="action.value"
			:width="action.width"
			@close-modal="closeSlide"
		>
			<credit-note
				v-if="action.code === 'NTC'"
				:data="data"
				:disabled="isLoading"
				:sale="validSale"
				@cancel-button="closeSlide"
				@generate-credit-note="convertDocument"
			/>
			<credit-note
				:disabled-ndd="true"
				v-if="action.code === 'return-sales-note'"
				:show-return="true"
				:data="data"
				:disabled="isLoading"
				:sale="validSale"
				@generate-credit-note="convertDocument"
				@cancel-button="closeSlide"
			/>
			<view-debts
				v-if="action.code === 'detail-debt'"
				:customer-id="customerId"
				@close-modal="closeSlide"
			/>
			<slider-order-state
				v-if="action.code === 'state-order'"
				:object-cart="objectCart"
				:object-transaction="objectTransaction"
				@change-payment-state="updatePaymentStateOrder"
				@close-modal="closeSlide"
			/>
			<address-slide
				v-if="isAction('address-slide')"
				:loading="loading"
				:commerce="informationOrder"
				@get-data="setAddressData"
				@accept-action="updateInformationOrder"
				@cancel-action="closeSlide"
			/>
			<v-flex v-show="isAction('consolidation')" xs6 text-xs-right pr-3 slot="right">
				<label class="label-header-sidebar">
					Cant. de {{ typeQuantity }}: <span>{{ totalQuantity | round }}</span>
				</label>
			</v-flex>
			<consolidation-slide
				v-if="isAction('consolidation')"
				:orders="ordersConsolidation"
				:grouped-products="groupedProducts"
				:total-weight="totalWeight"
				:warehouse-id="filterFields.warehouseId"
				@update-weight="updateWeight"
				@on-search="onSearchLocal"
				@accept-action="closeSlide"
				@update-active="updateActive"
			></consolidation-slide>
			<filters-slide
				v-if="isAction('filter')"
				:filter-data="filterFields"
				:cities="cities"
				:document-types="documentTypes"
				:parishes="parishes"
				:provinces="provinces"
				:zones="zones"
				:sellers="sellers"
				@accept-action="closeSlide(true)"
				@cancel-action="closeSlide"
				@set-filter-data="setFilterData"
			></filters-slide>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="475">
			<v-card>
				<v-card-title class="headline">{{ dialogMessage }}</v-card-title>
				<v-card-text class="subtext">
					<div>
						{{ dialogSubtext }}
					</div>
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="actionCancel"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="actionSuccess"
							>
								{{ dialogBtn }}
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogDetail" persistent max-width="750">
			<ecommerce-details-in-table
				modal
				v-if="dialogDetail"
				@open-debt="openModalAmortization"
				:order-selected="orderSelected"
				@close-details="closeDialogDetail"
				@load-data="loadOrders"
			/>
		</v-dialog>
		<v-dialog v-model="modalStockError" persistent max-width="625">
			<v-card class="modal">
				<v-card-title class="title-card justify-center text-center">
					<span class="title-text">Productos que no cuentan con stock suficiente</span>
				</v-card-title>
				<span class="mesage-error ml-4"
					>Los siguientes productos no cuentan con suficiente stock en el almacen para
					cambiar el estado del pedido.</span
				>
				<app-table
					class="pa-0 mb-4 mt-2"
					name="products-witchout-stock"
					:inputSearch="false"
					:filterColumns="false"
					:rows="detailsErrorStock"
					:selectable="false"
					:show-pagination="true"
					:columns="columnsStock"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable" v-show="showRow(columns, 1)">
							{{ props.row.code }}
						</td>
						<td v-show="showRow(columns, 3)">{{ props.row.name || '-' }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.stock }}</td>
						<td v-show="showRow(columns, 4)">
							{{ props.row.warehouseName || '-' }}
						</td>
					</template>
				</app-table>
				<v-card-actions class="justify-center pb-3">
					<v-btn
						class="btn-action"
						color="pink"
						type="button"
						@click="modalStockError = false"
						small
					>
						Atras
						<v-icon color="white" size="16" class="ml-1"> highlight_off </v-icon>
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="showSaleCancelForm" persistent max-width="570">
			<sales-cancel-new
				v-if="showSaleCancelForm"
				:title-modal="'Anular Venta'"
				:sale-id="orderAction.id"
				:amount="orderAction.amount"
				:currency="orderAction.currency"
				:valid-sale="validSale.validated"
				:date="validSale.createdAt"
				:sale="validSale"
				is-list-sale
				@cancel-button-clicked="closeModal"
				@sales-canceled="salesCanceled"
			/>
		</v-dialog>
		<v-dialog persistent v-model="showDocuments" max-width="585px">
			<list-documents
				v-if="showDocuments"
				:order="ordersSelected[0]"
				@send-data="sendData"
				@close-modal="showListDocuments"
			/>
		</v-dialog>
		<v-dialog v-model="modalWithoutStock" persistent max-width="625">
			<v-card class="modal">
				<v-card-title class="title-card justify-center text-center">
					<span class="title-text">Productos sin Stock</span>
				</v-card-title>
				<span class="mesage-error ml-4"
					>Los siguientes productos no cuentan con stock en el almacén.</span
				>
				<app-table
					class="pa-0 mb-4 mt-2"
					name="terminal-exist"
					:inputSearch="false"
					:filterColumns="false"
					:rows="productsWithoutStock"
					:selectable="false"
					:show-pagination="true"
					:columns="columnsWithoutStock"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">
							{{ props.row.code }}
						</td>
						<td v-show="showRow(columns, 3)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.stock }}</td>
						<td v-show="showRow(columns, 4)">{{ props.row.warehouseName }}</td>
					</template>
				</app-table>
				<v-card-actions class="justify-center pb-3">
					<v-btn
						class="btn-action"
						color="pink"
						type="button"
						@click="modalWithoutStock = false"
						small
					>
						Atras
						<v-icon color="white" size="16" class="ml-1"> highlight_off </v-icon>
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<section class="modal-filter-footer">
			<v-flex text-xs-center v-if="$route.name === 'detail-route-distribution'">
				<v-btn
					type="button"
					class="btn-auto btn-return"
					:to="{ name: 'distribution-routes' }"
				>
					Atras
				</v-btn>
			</v-flex>
			<template v-else>
				<v-flex x12 px-5 v-if="dataSelected.length">
					<p class="body-1 primary--text text-xs-right ma-0">
						Total de pedidos seleccionadas: {{ dataSelected.length }} |
						<app-tooltip-button
							icon="delete_sweep"
							text="Deseleccionar todos"
							color="primary"
							size="20"
							@click-icon="cleanFilters"
						/>
					</p>
					<p
						class="body-1 red--text text-xs-right ma-0"
						v-if="ordersWithAddressInvalidLength(dataSelected)"
					>
						{{ ordersWithAddressInvalidLength(dataSelected) }}
						sin direcciones
					</p>
				</v-flex>
				<modal-sidebar-button
					height="7vh"
					hidden
					:img="false"
					:is-loading="disabledCreateRoute"
					padding-success="px-5 py-2"
					success-color="primary"
					success-text="Armar Ruta"
					@accept-button-clicked="goTo('create-route-from-orders')"
				/>
			</template>
		</section>
		<simple-modal
			:open="modalRemisionGuide"
			@cancel="toggleModalGuide"
			@close="toggleModalGuide"
			@confirm="generateGuidesOrder"
		>
			<span slot="title">¿Desea generar una guía de remisión?</span>
			<div slot="message">
				<div>
					Los pedidos seleccionados se usarán para generar de manera automática, una guia
					de remisión al crear la ruta de distribución con los datos ingresados.
				</div>
				<div class="my-3">
					<v-checkbox
						:true-value="2"
						:false-value="1"
						hide-details
						label="Guía de Remisión Transportista"
						color="primary"
						v-model="typeRemissionGuide"
					></v-checkbox>
				</div>
				<!-- <div v-show="typeRemissionGuide === 2">
					<app-select
						:item="transportAgencyIdGuideRemision"
						item-text="name"
						item-value="id"
						:return-object="false"
						:items="transports"
						label="Agencia de Transporte"
						@input="transportAgencyIdGuideRemision = $event.value"
					/>
				</div> -->
			</div>
		</simple-modal>
	</div>
</template>

<script>
import creditNote from '@/components/sales/subcomponents/credit-note';
import salesCancelNew from '@/components/sales/sales-cancel-new';
import actionSidebar from '@/components/shared/action-sidebar';
import addressSlide from '@/components/ecommerce/address-slide';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import sliderOrderState from '@/components/ecommerce/slider-order-state';
import consolidationSlide from '@/components/orders/consolidation-slide';
import ecommerceDetailsInTable from '@/components/ecommerce/ecommerce-details-in-table';
import filtersSection from '@/components/orders/filters-section';
import filtersSlide from '@/components/orders/filters-slide';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import OrderStates from '@/shared/order-states';
import listDocuments from '@/components/distribution/list-documents';
import typePaymentForm from '@/shared/type-payment-form';
import viewDebts from '@/components/orders/view-debts';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import simpleModal from '@/components/field-sale/shared/simple-modal';
import XLSX from 'xlsx';

import orderDetailCard from '@/components/orders/order-detail-card';
import pendingOrdersList from '@/components/orders/pending-orders-list';
import {
	LIST_SALES_BY_ROUTE,
	LIST_SALES_PENDING,
	LIST_SALES_NTC,
} from '@/shared/reports';
import { format } from 'date-fns';

const { compose, setNewProperty, round } = lib;
const fourDecimals = round(4);
const twoDecimals = round(2);

const { debounce, removeLocalData, setLocalData, showDownloadDialog, generateBlob } =
	helper;
const FLAG_PICK_UP_DELIVERY = 1;
const idStates = [2, 5, 6];
const idStatesShow = [1, 2, 5, 6];
const CONFIRM_ORDER_STATE_SHOW = idStatesShow.join();
const CONFIRM_ORDER_STATE_ID = idStates.join();

function created() {
	this.initialize();
}

function initialize() {
	setLocalData('route-from', this.$route.name);
	if (this.$route.name === 'pending-orders-list') {
		this.captionNavigation = 'Lista de pedidos pendientes de entrega';
		this.title = 'Pedidos pendientes de entrega';
	}
	if (this.$route.name === 'pick-up-earrings') {
		this.captionNavigation = 'Lista de pedidos pendientes de recojo';
		this.title = 'Pedidos pendientes de recojo';
	}
	if (this.isEcuador) {
		this.columns[2].name = 'Parroquia';
	} else {
		this.columns[2].name = 'Distrito';
	}
	this.showEnabledRequest =
		this.$userInfo.company.settings.flagEnableRequestedRoutes || false;
	this.btnHeaderLink = {
		name:
			this.$route.name === 'detail-route-distribution'
				? 'pending-routes-map'
				: 'pending-orders-map',
	};
	// this.dataSelected = getLocalData('pending-orders') || [];
	this.ordersSelected = [];
	this.loadResources();
	this.loadOrders();
	this.loadSubsidiaries();
	this.loadWarehouses();
	console.log('orders => ', this.orders);
	this.columns[12].flagVisible =
		this.$userInfo.company.settings &&
		this.$userInfo.company.settings.flagUseTransportAgency
			? !this.$userInfo.company.settings.flagUseTransportAgency
			: false;
	this.columns[17].visible = this.$userInfo.company.settings.flagGrouper || false;
	this.columns[17].checked = this.$userInfo.company.settings.flagGrouper || false;
}

function actionCancel() {
	this.dialog = false;
	this.dialogBtn = '';
	this.dialogCode = '';
	this.dialogMessage = '';
	this.dialogSubtext = '';
	this.order = {};
	this.currentOrder = {};
}

function actionSuccess() {
	if (this.dialogCode === 'quit') {
		this.quitRegister();
	} else if (this.dialogCode === 'cancel') {
		this.cancelRegister();
	} else if (this.dialogCode === 'change') {
		this.changeStateOrder();
	}
}

async function generateGuidesOrder() {
	const dateStart = new Date(this.detailRouteObject.dateStart);
	const body = {
		deliveryId: this.detailRouteObject.deliveryId,
		transportAgencyId:
			this.typeRemissionGuide === 2
				? this.transportAgencyIdGuideRemision
				: this.detailRouteObject.transportAgencyId,
		vehicleId: this.detailRouteObject.vehicleId,
		flagGroup: true,
		dateStart: dateStart.toISOString().split('T')[0],
		orders: this.ordersSelected.map((p) => {
			const newRow = {};
			newRow.id = p.id;
			newRow.flagGuides = 1;
			return newRow;
		}),
		description: this.detailRouteObject.description,
		name: this.detailRouteObject.name,
		routerId: this.detailRouteObject.id,
		typeRemissionGuide: this.typeRemissionGuide,
	};
	try {
		await this.$httpSales.post('remission-guides-group', body);
		this.showNotification('Se generó la guīa de remisión agrupada correctamente.');
		this.actionCancel();
		this.initialize();
		helper.removeLocalData('pending-orders');
		this.dataSelected = [];
	} catch (error) {
		if (error.data.statusCode === 400) {
			this.showGenericError(error.data.messageError);
		} else {
			this.showGenericError();
		}
	} finally {
		this.toggleModalGuide();
	}
}

async function changeStateOrder() {
	const body = {
		orderStateId: 5,
	};
	try {
		await this.$httpSales.patch(`orders/${this.currentOrder.id}/update-state`, body);
		this.showNotification('Se cambio el estado del pedido correctamente.');
		this.loadOrders();
		this.actionCancel();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'ORDER_NOT_APPROVED_YET') {
				this.showGenericError(
					'El pedido debe estar aprobado para poder cambiar el estado.'
				);
			} else if (error.data.message === 'ORDER_STOCK_NOT_ENOUGH') {
				this.modalStockError = !this.modalStockError;
				this.detailsErrorStock = error.data.details;
				this.dialog = false;
			}
		} else {
			this.showGenericError();
		}
	}
}

function buildDetails(products) {
	return products.map((product) => {
		const newProduct = { ...product };
		newProduct.isSelected = true;
		newProduct.checkedDisabled = true;
		return newProduct;
	});
}

function buildFilters() {
	const newFilter = { ...this.filterFields };
	if (newFilter.orderStateId) {
		newFilter.orderStateId = newFilter.orderStateId;
	} else if (this.$route.name === 'pick-up-earrings') {
		newFilter.orderStateId = 6;
	} else {
		newFilter.orderStateId = this.showEnabledRequest
			? CONFIRM_ORDER_STATE_SHOW
			: CONFIRM_ORDER_STATE_ID;
	}
	// employeeIds
	if (
		Array.isArray(this.filterFields.employeeIds) &&
		this.filterFields.employeeIds.length > 0
	) {
		if (this.filterFields.employeeIds.every((p) => p.employeeId !== undefined)) {
			newFilter.employeeIds = this.filterFields.employeeIds
				.map((p) => p.employeeId)
				.join(',');
		} else {
			newFilter.employeeIds = this.filterFields.employeeIds.join();
		}
	} else {
		newFilter.employeeIds = [];
	}
	newFilter.transportAgencyId =
		newFilter.transportAgencyId.length > 0
			? newFilter.transportAgencyId.map((p) => p.id).join(',')
			: [];
	newFilter.warehouses = newFilter.warehouseId ? String(newFilter.warehouseId) : undefined;
	delete newFilter.warehouseId;
	if (!this.filterFields.byFac && !this.filterFields.byBol) {
		delete newFilter.byFac;
		delete newFilter.byBol;
	} else if (!this.filterFields.byFac) {
		delete newFilter.byFac;
	} else if (!this.filterFields.byBol) {
		delete newFilter.byBol;
	}
	if (this.filterFields.inRoute && this.filterFields.outRoute) {
		delete newFilter.flagRouted;
	}
	delete newFilter.documentType;
	delete newFilter.inRoute;
	delete newFilter.outRoute;
	if (this.$userInfo.company.settings.flagTypeOriginOrder) {
		delete newFilter.originPlatform;
	} else {
		newFilter.originPlatform =
			this.filterFields.originPlatform && this.filterFields.originPlatform.id;
		delete newFilter.referenceExternal;
	}
	newFilter.districtIds =
		this.filterFields.districtIds && this.filterFields.districtIds.length
			? this.filterFields.districtIds.join(',')
			: undefined;
	return newFilter;
}

function buildOrders(rows) {
	const validDataSelected = this.dataSelected.length > 0;
	return rows.map((row) => {
		const orderIndex = validDataSelected
			? this.dataSelected.findIndex((ds) => ds.number === row.number)
			: -1;
		const newOrder = { ...row };
		const {
			currency,
			customer,
			customerAddress,
			flagPickUp,
			orderPickStateName,
			pickUpName,
			routeName,
			typeDocument,
		} = row;
		const { typePerson, zone, phone } = customer;
		const parish = customerAddress ? customerAddress.parish : {};
		const parishName = parish ? parish.name || '-' : '-';
		const orderPickItems = orderPickStateName.split(' ');
		const pickUpItems = pickUpName.split(' ');
		const orderPickCode =
			orderPickItems.length === 2
				? `${orderPickItems[0].split('').splice(0, 1).join()}${orderPickItems[1]
						.split('')
						.splice(0, 1)
						.join()}`
				: orderPickItems[0].split('').splice(0, 1).join();
		const pickUpCode =
			pickUpItems.length === 3
				? `${pickUpItems[0].split('').splice(0, 1).join()}${pickUpItems[2]
						.split('')
						.splice(0, 1)
						.join()}`
				: pickUpItems[0].split('').splice(0, 1).join();
		newOrder.arrowDirection = false;
		if (this.$route.name === 'detail-route-distribution') {
			newOrder.isDisabled = row.flagGuides !== 0;
			newOrder.disabledRowApply = row.flagGuides !== 0;
		} else {
			newOrder.isDisabled = this.showEnabledRequest
				? !!row.routeId
				: flagPickUp !== FLAG_PICK_UP_DELIVERY || !!row.routeId;
		}
		newOrder.isSelected = orderIndex > -1;
		newOrder.zoneName = zone ? zone.name : '-';
		newOrder.parishName = parishName;
		newOrder.routeName = routeName || '-';
		newOrder.customerName = typePerson ? typePerson.fullName : '-';
		newOrder.documentTypeCode = typeDocument ? typeDocument.code : 'PED';
		newOrder.documentTypeName = typeDocument ? typeDocument.name : 'Pedido';
		newOrder.documentNumber = typeDocument ? typeDocument.documentNumber : '-';
		newOrder.orderPickStateCode = orderPickCode;
		newOrder.pickUpCode = pickUpCode;
		newOrder.currency = currency || this.countryCurrencySymbol;
		newOrder.customerPhone = phone;
		newOrder.customerWhatsapp = phone;
		newOrder.addressCustomer = row.deliveryAddress
			? row.deliveryAddress.addressLine1 || parishName
			: parishName;
		newOrder.details = this.buildDetails(row.details);
		newOrder.quantityProducts = row.details.length;
		newOrder.employee =
			row.employee && row.employee.fullname ? row.employee.fullname : '';
		return newOrder;
	});
}

async function cancelRegister() {
	try {
		await this.$httpSales.patch(`orders/${this.order.id}/cancel`);
		this.showNotification('El pedido ha sido cancelado correctamente.');
		this.actionCancel();
		this.loadOrders();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'ORDER_NOT_FOUND') {
				this.showGenericError('El pedido no existe');
			} else if (err.data.message === 'CANCEL_NOT_ALLOWED') {
				this.showGenericError('El pedido no puede ser anulado');
			} else if (err.data.message === 'CANCEL_ORDER_STATE_NEEDED') {
				this.showGenericError(
					'El estado "Anular" no ha sido configurado para la compañía'
				);
			}
		}
	}
}

function changeRowsSelectedValue(registers, props, values) {
	return registers.map((r) => {
		const newRegister = { ...r };
		props.forEach((prop, propIndex) => {
			newRegister[prop] =
				prop === 'isSelected' ? values[propIndex] && !r.isDisabled : values[propIndex];
		});
		return newRegister;
	});
}

function setAddressData({ model, value }) {
	this.informationOrder[model] = value;
}

function exportExcel() {
	console.log('orders => ', this.orders);
	const columns = this.columns.filter(c => c.visible && c.export !== false);
	const mapRow = row =>
		columns.reduce((acc, col) => {
			//acc[col.name] = row[col.value];
			const value = col.exportValue ? col.exportValue(row) : row[col.value];
			acc[col.name.trim()] = value;
			return acc;
		}, {});
	const wb = XLSX.utils.book_new();
	const rowsDataOrder = this.orders.map(mapRow);
	const ws = XLSX.utils.json_to_sheet(rowsDataOrder);
	XLSX.utils.book_append_sheet(wb, ws, 'Pedidos Pendientes');
	XLSX.writeFile(wb, 'consolidado-pedidos-pendientes.xlsx');
}

function cleanFilters() {
	this.filterFields = {
		byBol: false,
		byFac: false,
		cityId: null,
		customerId: null,
		documentType: 0,
		employeeId: null,
		endDate: null,
		startDate: null,
		employeeIds: [],
		inRoute: true,
		limit: 30,
		orderPickState: null,
		orderStateId: null,
		outRoute: true,
		page: 1,
		districtIds: null,
		provinceId: null,
		sortDirection: 'desc',
		sortField: 'created_at',
		zoneId: null,
		transportAgencyId: [],
		originPlatform: null,
		referenceExternal: null,
	};
	this.customerName = '';
	this.sellerName = '';
	this.transportName = '';
	this.ordersSelected = [];
	this.cleanSearch = true;
	removeLocalData('pending-orders');
	this.dataSelected = [];
	this.totalOrdersAmount = 0;
	this.loadOrders();
}

function closeDetail() {
	this.toShow = false;
	this.order = {};
	this.orders = this.changeRowsSelectedValue(
		this.orders,
		['arrowDirection'],
		[this.toShow]
	);
}

function closeSlide(load) {
	this.action.value = false;
	this.action.code = '';
	this.action.title = '';
	this.ordersSelected = [];
	this.dataSelected = [];
	this.informationOrder = {};
	this.orders = this.orders.map((o) => ({
		...o,
		isSelected: false,
	}));

	if (load) {
		this.loadOrders();
	}
}

function generateExportParams(codeReport, prefixName, pending = false) {
	const params = {
		routeId: this.$route.params.id,
		pending,
	};
	this.onEmitExcel(codeReport, prefixName, params);
}

function emitExcel(code) {
	if (code === 'list-sales-by-route') {
		this.generateExportParams(
			LIST_SALES_BY_ROUTE,
			`listado_de_ventas_por_ruta_, Nombre de Ruta: ${this.title}`
		);
	} else if (code === 'list-sales-pending') {
		this.generateExportParams(
			LIST_SALES_PENDING,
			`listado_de_ventas_por_cobrar_, Nombre de Ruta: ${this.title}`,
			true
		);
	} else if (code === 'list-sales-ntc') {
		this.generateExportParams(
			LIST_SALES_NTC,
			`listado_de_ventas_y_nota_credito, Nombre de Ruta: ${this.title}`
		);
	}
}

function columnSortable(col) {
	const newColumn = { ...col };
	newColumn.isSortable.down = !col.isSortable.down;
	newColumn.isSortable.up = !col.isSortable.up;
	this.columns = this.columns.map((c) => {
		const newCol = { ...c };
		if (c.isSortable) {
			newCol.isSortable.up = newColumn.isSortable.up;
			newCol.isSortable.down = newColumn.isSortable.down;
		}
		return newCol;
	});
	this.filterFields.sortField = newColumn.isSortable.value;
	this.filterFields.sortDirection = newColumn.isSortable.up ? 'asc' : 'desc';
	this.loadOrders();
}

function disabledConsolidation() {
	return this.totalOrders === 0;
}

function disabledCreateRoute() {
	const quantityInvalids = this.ordersWithAddressInvalidLength(this.dataSelected);
	return this.dataSelected.length >= 2 ? !!quantityInvalids : true;
}

function eventOnRows(registers, event, condition) {
	return condition.value
		? registers[event]((register) => register[condition.prop] && !register.isDisabled)
		: registers[event]((register) => !register[condition.prop] || register.isDisabled);
}

function filterList() {
	const disabledValidate = this.filterFields.startDate && !this.filterFields.endDate;
	if (disabledValidate) {
		this.showNotification(
			'Selecciona una fecha final o limpia el filtro de fecha inical',
			'warning'
		);
	} else {
		this.loadOrders();
	}
}

function isAction(code) {
	return this.action.code === code;
}

async function loadCities(id) {
	({ data: this.cities } = await this.$httpSales.get(`cities/${id}`));
}

async function loadCustomers(customerSearch) {
	const params = { search: customerSearch };
	({ data: this.customers } = await this.$httpSales.get('customers', {
		params,
	}));
}

async function loadOrders(page = 1) {
	this.currentPage = page;
	this.filterFields.page = this.currentPage;
	const typeDocuments = await this.getTypeDocuments('sales');
	if (this.$route.name === 'detail-route-distribution') {
		const paramsDistribution = {
			orderStateIds:
				this.params.orderStateId.length > 0
					? this.params.orderStateId.map((p) => p.id).join(',')
					: undefined,
			includeDriver: true,
			relationAdd: 'customer,delivery,orderState,user,details',
		};
		const { data: detailRoute } = await this.$httpSales.get(
			`delivery-router/${this.$route.params.id}`,
			{ params: paramsDistribution }
		);
		this.detailRouteObject = detailRoute;
		this.transportAgencyIdGuideRemision = detailRoute.transportAgencyId;
		// this.orders = this.buildOrders(detailRoute.orders);
		this.orders = detailRoute.orders.map((ord) => {
			const newO = { ...ord };
			const { pickUpName } = ord;
			const paymentType = ord.additionalInfo.paymentType;
			newO.paymentTypeName = paymentType ? paymentType.name : 'No especificado';
			newO.paymentTypeCode = paymentType ? paymentType.name.slice(0, 3) : '-';
			// newO.isDisabled = ord.flagGuides !== 0;
			// newO.disabledRowApply = ord.flagGuides !== 0;
			newO.pickUpCode = pickUpName
				.split(' ')
				.filter((word) => word.length > 2)
				.map((word) => word[0].toUpperCase())
				.join('');
			newO.document = ord.saleDocument.map((doc) => {
				const find = typeDocuments.data.find(
					(d) => d.documentType.id === doc.salTypeDocumentId
				);
				if (!find) {
					console.error('No se encontró el tipo de documento en', typeDocuments.data);
				}
				const code = find ? (find.documentType && find.documentType.code) || '-' : '-';
				const objDocument = {
					id: doc.id,
					documentNumber: `${code} - ${doc.documentNumber}`,
				};
				return objDocument;
			});
			return newO;
		});
		this.totalWeightDetail = this.orders.reduce((a, r) => a + r.weight, 0);
		this.headerInformation.dateRoute = detailRoute.dateRoute;
		this.headerInformation.statusName = detailRoute.statusName;
		this.headerInformation.distance = detailRoute.distance;
		helper.setLocalData('detail-route', detailRoute);
		this.title = detailRoute.name;
		this.captionNavigation = `NRO DE LA RUTA: ${detailRoute.code || ''}`;
	} else {
		const params = this.buildFilters();
		params.includeEmployee = true;
		params.relationAdd =
			'customer,delivery,orderState,user,details,customerAddress,route,subsidiary,saleDocument';
		params.flagTransportAgency = true;
		params.flagPendingOrders = true;
		this.paramsDocs = params;
		const { data: orders, headers } = await this.$httpSales.get('orders', {
			params,
		});
		// this.orders = orders;
		this.orders = orders.map((ord) => {
			const newO = { ...ord };
			newO.isSelected = this.dataSelected.find((o) => o.id === ord.id);
			const { pickUpName } = ord;
			const paymentType = ord.additionalInfo && ord.additionalInfo.paymentType;
			newO.paymentTypeName = paymentType ? paymentType.name : 'No especificado';
			newO.paymentTypeCode = paymentType ? paymentType.name.slice(0, 3) : '-';
			newO.deliveryDate = ord.deliveryDate
				? new Date(ord.deliveryDate).toISOString().replace('T', ' ').slice(0, 19)
				: '-';
			newO.pickUpCode = pickUpName
				.split(' ')
				.filter((word) => word.length > 2)
				.map((word) => word[0].toUpperCase())
				.join('');
			newO.document = ord.saleDocument.map((doc) => {
				const documentType = typeDocuments.data.find(
					(d) => d.documentType.id === doc.salTypeDocumentId
				);
				const code = documentType?.documentType?.code || 'DOC. NO ENCONTRADO';
				const objDocument = {
					id: doc.id,
					documentNumber: `${code} - ${doc.documentNumber}`,
				};
				return objDocument;
			});
			return newO;
		});
		this.textGray = 'Lista de pedidos pendientes de entrega';
		this.lastPage = Number(headers['x-last-page']);
		this.ordersQuantity = Number(headers['x-quantity']);
	}
	console.log('orders 2 => ', this.orders);
	this.cleanSearch = false;
	this.totalOrdersAmount = 0;
}

async function loadParishes(id) {
	({ data: this.parishes } = await this.$httpSales.get(`parish/${id}`));
}

async function loadResources() {
	const requests = [
		this.$httpSales.get('order-states'),
		this.$httpSales.get('zones'),
		this.$httpSales.get('province'),
		this.urlLoadData('get', 'typeDelivery'),
		this.$httpSales.get('sellers'),
		this.$httpSales.get('transport-agency'),
		this.$httpSales.get('employees', { params: { flagActive: 1 } }),
		this.$httpSalesRead.get('group', { params: { typeEntityId: 2 } }),
	];
	[
		{ data: this.orderStates },
		{ data: this.zones },
		{ data: this.provinces },
		{ data: this.pickUpTypes },
		{ data: this.sellers },
		{ data: this.transports },
		{ data: this.employees },
		{ data: this.groups },
	] = await Promise.all(requests);
	if (this.$route.name !== 'detail-route-distribution') {
		if (!this.showEnabledRequest) {
			this.orderStates.splice(0, 1);
		}
		this.orderStates.splice(1, 2);
	}
	this.transportAgencyIdGuideRemision = this.transports.length && this.transports[0].id;
	if (this.$userInfo.company.settings.flagTypeOriginOrder) {
		this.listOrigin();
	}
}

async function downloadOrder(row) {
	try {
		const body = { code: 'order-details-pdf' };
		const downloadDialog = this.$userInfo.company.settings.downloadSale;
		const responseType = 'blob';
		const contentType = downloadDialog ? 'application/pdf' : 'text/html';
		const { data: response } = await this.$httpSales.post(`orders/${row.id}/pdf`, body, {
			responseType,
		});
		const blob = generateBlob(response, contentType);
		this.showNotification('Se genero el reporte correctamente');
		showDownloadDialog(blob, 'Reporte de Pedido', downloadDialog);
	} catch (error) {
		this.showGenericError();
	}
}

function onClickIcon({ action, row }) {
	if (action === 'show-detail') {
		const currentRow = row.id === this.order.id;
		this.order = { ...row };
		this.toShow = !currentRow;
		this.orders = this.orders.map((order) => {
			const newOrder = { ...order };
			newOrder.arrowDirection = this.toShow && order.id === row.id;
			return newOrder;
		});
	} else if (action === 'edit') {
		this.goTo('pending-order-edit', {
			params: { id: row.id, number: row.number },
		});
	} else if (action === 'quit' || action === 'cancel') {
		this.order = { ...row };
		this.openConfirmation(action);
	} else if (action === 'change-state') {
		this.dialog = true;
		this.dialogMessage = 'Cambiar de Estado';
		this.dialogSubtext =
			'Desea cambiar el estado del pedido a CONFIRMADO. Al confirmar se hara la reserva del estado en el kardex.';
		this.dialogCode = 'change';
		this.dialogBtn = 'Confirmar';
		this.currentOrder = row;
	} else if (action === 'view-detail-order') {
		this.orderSelected = { ...row };
		this.dialogDetail = !this.dialogDetail;
	} else if (action === 'download-order') {
		this.downloadOrder(row);
	}
}

function closeDialogDetail() {
	this.dialogDetail = false;
	this.orderSelected = {};
}

function onSearchEvent(search) {
	this.filterFields.search = search ? search.trim() : null;
	this.cleanSearch = !this.filterFields.search;
	this.loadOrders();
}

function onSearchInput({ model, value }) {
	if (value) {
		if (model === 'customerId') {
			if (this.customerName !== value) {
				this.loadCustomers(value);
			}
		}
	}
}

function onSearchLocal(search) {
	const searchTrim = search ? search.trim() : null;
	const completeRegisters =
		this.consolidationCode === 'orders'
			? [...this.consolidationOrders]
			: [...this.consolidationProducts];
	if (searchTrim) {
		this.ordersConsolidation = completeRegisters.filter((row) => {
			if (this.consolidationCode === 'orders') {
				return (
					row.number.toString().toLowerCase().indexOf(searchTrim) > -1 ||
					row.customerName.toLowerCase().indexOf(searchTrim) > -1 ||
					row.total.toString().toLowerCase().indexOf(searchTrim) > -1 ||
					row.quantityProducts.toString().toLowerCase().indexOf(searchTrim) > -1
				);
			}
			return (
				row.productCode.toLowerCase().indexOf(searchTrim) > -1 ||
				row.productName.toLowerCase().indexOf(searchTrim) > -1 ||
				row.unitName.toLowerCase().indexOf(searchTrim) > -1 ||
				row.quantity.toString().toLowerCase().indexOf(searchTrim) > -1
			);
		});
	} else {
		this.ordersConsolidation = [...completeRegisters];
	}
}

function onSelectedAll(checked) {
	this.checkAll = checked;
	this.orders = this.changeRowsSelectedValue(this.orders, ['isSelected'], [checked]);
	this.ordersSelected = this.eventOnRows(this.orders, 'filter', {
		prop: 'isSelected',
		value: true,
	});
	this.orders.forEach((o) => this.validSavedData(o));
}

function openConfirmation(code) {
	const dialogQuit = `¿Desea liberar el pedido #${this.order.number}?`;
	const subtextQuit =
		'Recuerda que liberar el pedido que se encuentra en curso indica que el pedido no será entregado al cliente y volverá a la tienda de origen hasta que se vuelva a seleccionar para armar otra ruta.';
	const dialogCancel = `¿Desea anular el pedido #${this.order.number}?`;
	const subtextCancel =
		'Recuerda que al anular el pedido, este no se mostrará en el listado ya que en esta pantalla solo se muestran los pedidos pendientes de entrega disponibles para armar una ruta o que ya pertenecen a una.';
	this.dialogCode = code;
	this.dialogBtn = code === 'quit' ? 'Liberar' : 'Anular';
	this.dialogMessage = code === 'quit' ? dialogQuit : dialogCancel;
	this.dialogSubtext = code === 'quit' ? subtextQuit : subtextCancel;
	this.dialog = true;
}

async function quitRegister() {
	const routeId = this.order.routeId;
	try {
		await this.$httpSales.post(
			`delivery-router/${routeId}/${this.order.id}/unsubscribe-order`
		);
		this.showNotification('El pedido ha sido liberado correctamente.');
		this.actionCancel();
		this.loadOrders();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function rowIsSelected(row) {
	this.orders = this.orders.map((o) => {
		const newOrder = { ...o };
		newOrder.isSelected = o.isSelected && !o.isDisabled;
		return newOrder;
	});
	this.ordersSelected = this.eventOnRows(this.orders, 'filter', {
		prop: 'isSelected',
		value: true,
	});
	this.checkAll = this.eventOnRows(this.orders, 'every', {
		prop: 'isSelected',
		value: true,
	});
	this.validSavedData(row);
}

function detailSale(row) {
	const idSale = Number(row.additionalInfo.salDocumentId);
	const routeData = this.$router.resolve({
		name: 'convert',
		params: { id: idSale },
	});
	window.open(routeData.href, '_blank');
}

function setFilterEmployee(value, model) {
	this.filterFields[model] = value;
	if (model === 'employeeIds' && value) {
		this.sellerName = value.fullname;
	}
}

function totalWeightPending() {
	return this.orders.reduce((a, r) => a + r.weight, 0);
}

function setFilterData({ model, value, onSearch }) {
	if (!onSearch) {
		if (model === 'originPlatform') {
			if (this.$userInfo.company.settings.flagTypeOriginOrder) {
				this.filterFields.referenceExternal = value.code;
			} else {
				this.filterFields[model] = value;
			}
		}
		if (model === 'flagDebts') {
			this.filterFields.flagDebts = value;
			this.loadOrders();
		}
		if (model === 'pickUp') {
			this.filterFields.flagPickUp = value;
			// else if (model === 'employeeIds' || model === 'transportAgencyId')
		} else {
			this.filterFields[model] = model === 'customerId' ? value.id : value;
		}
		if (model === 'employeeId' && value) {
			this.filterFields[model] = value;
		}
		if (model === 'employeeIds' && value) {
			this.sellerName = value.fullname;
		}
		if (model === 'transportAgencyId' && value) {
			this.transportName = value.fullname;
		}
		if (model === 'customerId' && value) {
			this.customerName = value.autocomplete;
		}
		if (model === 'documentType') {
			if (value > 0) {
				this.filterFields.byFac = value === 1;
				this.filterFields.byBol = value === 2;
			} else {
				this.filterFields.byFac = false;
				this.filterFields.byBol = false;
			}
		}
		if (model === 'flagSale') {
			this.filterFields.flagSale = value.value;
		}
		if (model === 'inRoute' && !value) {
			this.filterFields.outRoute = !value;
			if (this.filterFields.outRoute) {
				this.filterFields.flagRouted = !this.filterFields.outRoute;
			}
		} else if (model === 'outRoute' && !value) {
			this.filterFields.inRoute = !value;
			if (this.filterFields.inRoute) {
				this.filterFields.flagRouted = this.filterFields.inRoute;
			}
		}
		if (model === 'provinceId') {
			this.loadCities(value);
			this.filterFields.cityId = null;
			this.filterFields.districtIds = null;
		}
		if (model === 'cityId') {
			this.loadParishes(value);
			this.filterFields.districtIds = null;
		}
		if (model === 'groupId') {
			this.filterFields.groupId = value.id;
		}
	} else {
		this.onSearchInput({ model, value });
	}
}

function showSlide(code, title) {
	this.action.code = code;
	this.action.title = title;
	this.action.value = true;
	if (code === 'consolidation') {
		this.action.width = 580;
	}
}

function totalItems() {
	const ordersProducts = this.dataSelected.reduce((a, os) => a.concat(os.details), []);
	return ordersProducts.reduce((a, op) => a + op.quantity, 0);
}

function totalOrders() {
	return this.dataSelected.length;
}

function updateActive(code) {
	this.consolidationProducts = this.dataSelected.reduce(
		(a, os) => a.concat(os.details),
		[]
	);
	this.typeQuantity = code === 'orders' ? 'Pedidos' : 'Items';
	this.totalQuantity = code === 'orders' ? this.totalOrders : this.totalItems;
	this.totalWeight = this.dataSelected.reduce((acum, p) => acum + p.weight, 0);

	if (code === 'grouped') {
		// Filtrar productos por categorias
		const groupedByCategory = this.consolidationProducts.reduce((acc, obj) => {
			const { categoryName } = obj;
			if (!acc[categoryName]) {
				acc[categoryName] = [];
			}
			acc[categoryName].push(obj);
			return acc;
		}, {});

		// Agrupar los productos en base a la cantidad, unidad, producto y almacén
		this.groupedProducts = Object.fromEntries(
			Object.entries(groupedByCategory).map(([category, products]) => [
				category,
				Object.values(
					products.reduce((acc, product) => {
						const { productId, warehouseId, unitName } = product;
						const key = `${productId}-${warehouseId}-${unitName}`;

						acc[key] = acc[key] || { ...product, quantity: 0 };
						acc[key].quantity += product.quantity;

						return acc;
					}, {})
				),
			])
		);
	} else {
		this.consolidationCode = code;
		this.consolidationOrders = this.dataSelected.map((or) => {
			const newOrder = { ...or };
			newOrder.quantityProducts = or.details.reduce((a, op) => a + op.quantity, 0);
			newOrder.customerName = or.customer
				? or.customer.name || or.customer.rzSocial
				: '--';
			return newOrder;
		});

		this.ordersConsolidation =
			code === 'orders' ? [...this.consolidationOrders] : [...this.consolidationProducts];
	}
}

function validSavedData(row) {
	const { id, isSelected, isDisabled } = row;
	const currentOrdersSelected = [...this.dataSelected];
	if (currentOrdersSelected.length > 0) {
		const indexOrder = currentOrdersSelected.findIndex((o) => o.id === id);
		if (isSelected && indexOrder === -1 && !isDisabled) {
			currentOrdersSelected.push(row);
		} else if (!isSelected && indexOrder > -1) {
			currentOrdersSelected.splice(indexOrder, 1);
		}
		this.dataSelected = [...currentOrdersSelected];
		setLocalData('pending-orders', [...this.dataSelected]);
	} else {
		this.dataSelected = [...this.ordersSelected];
		setLocalData('pending-orders', [...this.dataSelected]);
	}
	if (
		this.dataSelected.length === 1 &&
		this.$route.name !== 'detail-route-distribution'
	) {
		this.showNotification(
			'Para poder armar una ruta es necesario seleccionar más de un pedido.',
			'info'
		);
	}
}

function goToConsolidationOrder() {
	this.goTo('consolidation-order');
}

function openEditOrder(row) {
	this.action = {
		code: 'address-slide',
		title: 'Editar Informacion del Pedido',
		value: true,
		width: 500,
	};
	this.idOrder = row.id;
	if (row.customerAddressId && row.typeOrder === 1 && row.customerAddress.addressLine1) {
		const { addressLine1 } = row.customerAddress;
		this.informationOrder = row.customerAddress;
		this.informationOrder.address = addressLine1;
	} else if (
		row.customerAddressId &&
		row.typeOrder === 3 &&
		row.customerAddress.addressLine1
	) {
		const { addressLine1 } = row.customerAddress;
		this.informationOrder = row.customerAddress;
		this.informationOrder.address = addressLine1;
	} else if (row.deliveryJson) {
		const { deliveryPoint } = row.deliveryJson;
		this.informationOrder = deliveryPoint;
		this.informationOrder.address = deliveryPoint.addressLine;
	} else if (row.deliveryAddress) {
		const { addressLine1 } = row.deliveryAddress;
		this.informationOrder = row.deliveryAddress;
		this.informationOrder.address = addressLine1 || null;
	}
	this.informationOrder.comentary =
		row.comments || row.additionalInfo ? row.additionalInfo.customerComment : null;
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
	this.action.value = true;
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
		this.closeSlide();
		this.loadOrders();
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
		this.closeSlide();
		this.loadOrders();
	} catch (error) {
		if (error.status === 400) {
			this.showGenericError(error.data.messageError);
		} else if (error.status === 500) {
			this.showGenericError();
		}
	}
}

function onInput({ model, value }) {
	this.params[model] = value;
	this.loadOrders();
}

function runAction({ code }) {
	if (code === 'generate-documents') {
		if (this.$route.name === 'pending-orders-list') {
			// Para la pantalla de pedidos pendientes
			helper.setLocalData('orders-selected', this.dataSelected);
		} else {
			// Para la pantalla de detalle de ruta de distribución

			// Limpia otro item del localstorage para tener el suficiente espacio
			// disponible para guardar los orders-selected (Local Storage Limit: 5MB)
			removeLocalData('pending-orders');

			const filterRows = this.ordersSelected.filter((p) => p.flagSale === 0);
			helper.setLocalData('orders-selected', filterRows);
		}
		this.goTo('page-generate-documents');
	} else if (code === 'create-group-guides') {
		const invalidStates = [OrderStates.DRAFT, OrderStates.REQUESTED];
		const hasOrdersInvalids = this.orders.some(
			(p) => p.isSelected && invalidStates.includes(p.orderStateId)
		);
		if (hasOrdersInvalids) {
			this.showGenericError(
				'Los pedidos seleccionados deben estar en un estado diferente a "Borrador" o "Solicitado" para crear la guía de remisión. Deseleccionelos o actualice su estado para poder crear la guia de remisión.'
			);
			return;
		}
		this.toggleModalGuide();
	} else {
		this.codeAction = code;
		this.showListDocuments();
	}
}

function actionsDisabled() {
	const disabledCancel = this.orders.every((p) => p.flagSale === 1);
	const validOrders = this.dataSelected.length === 0;
	const isOneOrder = this.ordersSelected.length === 1;
	return [
		{ code: 'generate-documents', disabled: validOrders || disabledCancel },
		{ code: 'create-group-guides', disabled: validOrders },
		{ code: 'return-sales-note', disabled: !isOneOrder },
		{ code: 'NTC', disabled: !isOneOrder },
		{ code: 'override', disabled: !isOneOrder },
	];
}

async function downloadMassive(pdf) {
	const { code, id } = pdf;
	const isOrderMassive =
		code === 'massive-orders-pdf' || code === 'massive-orders-a4-pdf';
	try {
		if (isOrderMassive) {
			const body = {
				code,
				ids: this.dataSelected.length ? this.dataSelected.map((p) => p.id) : undefined,
			};
			const params = {
				...this.paramsDocs,
				html: id === 4 || id === 6 ? true : null,
				routeId: this.$route.params.id,
			};
			if (this.$route.params.id) {
				params.routeId = this.$route.params.id;
				params.includeEmployee = true;
				params.relationAdd = 'customer,delivery,orderState,user,details,customerAddress,route,subsidiary,saleDocument';
				params.flagTransportAgency = true;
			}
			const response = await this.$httpSales.post('orders-massive-pdf', body, {
				params,
				responseType: 'blob',
			});
			if (id === 4 || id === 6) {
				const url = window.URL.createObjectURL(response.data);
				const newWindow = window.open(url, '_blank');
				if (newWindow) {
					newWindow.onload = () => {
						window.URL.revokeObjectURL(url);
					};
				}
			} else {
				const blob = helper.generateBlob(response.data);
				helper.showDownloadDialog(blob, pdf.name, 'pdf');
			}
			this.showNotification('El reporte de tickets masivos fue descargado correctamente');
		} else {
			const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
			const { name, lastname } = this.$userInfo;
			const titleReport =
				code === 'documents-massive-tickets-pdf'
					? 'Reporte_documentos_masivos_pdf'
					: 'Reporte_documentos_masivos_html';

			// Remover caracteres especiales del título
			const cleanTitle = this.title.replace(/[^a-zA-Z0-9\s\-_]/g, '');

			const documentData = {
				filename: `${titleReport} ${now}, Nombre de Ruta: ${cleanTitle}`,
				extension:
					code === 'documents-massive-tickets-pdf' || isOrderMassive ? 'pdf' : 'html',
				comment: `${titleReport} generado por ${name} ${lastname}, Nombre de Ruta: ${cleanTitle}`,
				params: {
					routeId: this.$route.params.id,
					pending: false,
				},
			};
			await this.$httpReports.post(`documents/${code}`, documentData);
			this.notificationReport('reporte de documentos masivos');
		}
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		showSaleCancelForm: false,
		validSale: null,
		isACreditNote: false,
		data: [],
		isLoading: false,
		openOnClick: true,
		customerId: null,
		showPdfMenu: true,
		textGray: '',
		detailRouteObject: {},
		detailRoute: {},
		ordersComplete: [],
		employees: [],
		action: {
			code: '',
			title: '',
			value: false,
			width: 501,
		},
		headerInformation: {
			headerInformation: null,
			statusName: null,
			distance: null,
		},
		backBtn: false,
		btnHeaderLink: null,
		captionNavigation: '',
		checkAll: false,
		checkAllDisabled: true,
		checkAllProducts: true,
		cleanSearch: false,
		cities: [],
		columns: [
			{
				id: 1,
				name: 'Fecha',
				value: 'createdAt',
				isSortable: {
					down: true,
					value: 'created_at',
					up: false,
				},
				exportValue: row =>
            	row.createdAt
                ? this.$options.filters.formatDate(
                    row.createdAt,
                    'DD/MM/YYYY HH:mm:ss'
                )
                : '-',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Zona',
				value: 'zoneName',
				isSortable: {
					down: true,
					value: 'zone_name',
					up: false,
				},
				exportValue: row =>
            	row.additionalInfo && row.additionalInfo.zoneName
                ? row.additionalInfo.zoneName
                : '-',
				checked: false,
				visible: false,
			},
			{
				id: 3,
				name: '',
				value: 'parishName',
				isSortable: {
					down: true,
					value: 'parish_name',
					up: false,
				},
				exportValue: row =>
            	row.customerAddress && row.customerAddress.parish
                ? row.customerAddress.parish.name
                : '--',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Cliente',
				value: 'fullName',
				isSortable: {
					down: true,
					value: 'customer_name',
					up: false,
				},
				exportValue: row =>
            	row.customer &&
            	row.customer.typePerson
                ? row.customer.typePerson.fullName
                : '-',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Tipo Doc.',
				tooltip: 'Tipo de Documento Relacionado',
				value: 'documentTypeCode',
				isSortable: {
					down: true,
					value: 'document_type_name',
					up: false,
				},
				exportValue: () => 'PED',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Nro. Pedido',
				tooltip: 'Número de Pedido',
				value: 'documentNumber',
				isSortable: {
					down: true,
					value: 'documentNumber',
					up: false,
				},
				exportValue: row =>
				row.documentNumber || row.number || '-',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Nro. Doc',
				tooltip: 'Número de Document',
				value: 'documentNumber',
				isSortable: {
					down: true,
					value: 'document_number',
					up: false,
				},
				exportValue: row =>
            	row.document && row.document.length
                ? row.document.map(item => item.documentNumber).join(', ')
                : '-',
				checked: true,
				visible: true,
			},
			{
				id: 26,
				name: 'Nro.',
				value: 'number',
				isSortable: {
					down: true,
					value: 'number',
					up: false,
				},
				exportValue: row =>
            	row.number || '-',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Monto',
				value: 'total',
				isSortable: {
					down: true,
					value: 'total',
					up: false,
				},
				exportValue: row =>
            	`${row.currency || ''} ${row.total || 0}`,
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'T. de Pago',
				tooltip: 'Tipo de Pago',
				exportValue: row => row.paymentTypeCode || '-',
				checked: true,
				visible: true,
			},
			{
				id: 10,
				name: 'Vendedor',
				value: 'employee',
				exportValue: row =>
				row.user ? row.user.fullname : '-',
				checked: true,
				visible: true,
			},
			{
				id: 11,
				name: 'Ruta',
				value: 'routeName',
				isSortable: {
					down: true,
					value: 'route_name',
					up: false,
				},
				exportValue: row =>
            	row.documentNumber
                ? row.routeName ||
                  (row.route && row.route.name) ||
                  '-'
                : '-',
				checked: true,
				visible: true,
			},
			{
				id: 12,
				name: 'T. Entrega',
				tooltip: 'Tipo de Entrega',
				value: 'pickUpName',
				isSortable: {
					down: true,
					value: 'pick_up_name',
					up: false,
				},
				exportValue: row => row.pickUpCode || '-',
				checked: true,
				visible: true,
			},
			{
				id: 13,
				name: 'Fecha Entrega',
				exportValue: row => row.deliveryDate || '-',
				checked: false,
				visible: false,
			},
			{
				id: 14,
				name: 'T. Dist',
				tooltip: 'Tipo de Distribución',
				value: 'actions',
				checked: true,
				visible: true,
				flagVisible: true,
				export: false,
			},
			{
				id: 15,
				name: 'Agencia de Trans.',
				value: 'orderPickStateName',
				tooltip: 'Agencia de Transporte',
				exportValue: row =>
            	row.transportAgency
                ? row.transportAgency.name
                : '--',
				checked: false,
				visible: false,
				flagVisible: true,
			},
			{
				id: 16,
				name: 'E. de Pedido',
				value: 'orderPickStateName',
				isSortable: {
					down: true,
					value: 'order_pick_state_name',
					up: false,
				},
				exportValue: row =>
            	row.orderState ? row.orderState.name : '-',
				checked: true,
				visible: true,
			},
			{
				id: 17,
				name: ' E. de pago',
				value: 'paymentStateName',
				tooltip: 'Estado de pago',
				exportValue: row => row.paymentStateName || '-',
				checked: false,
				visible: true,
			},
			{
				id: 18,
				name: 'Repartidor',
				value: 'deliveryId',
				exportValue: row =>
            	row.delivery ? row.delivery.fullname : '--',
				checked: false,
				visible: false,
			},
			{
				id: 19,
				name: 'Empleado',
				value: 'employeeName',
				exportValue: row =>
            	row.employee ? row.employee.fullname : '--',
				checked: false,
				visible: false,
			},
			{
				id: 20,
				name: 'Peso',
				value: 'weight',
				exportValue: row => row.weight || 0,
				checked: false,
				visible: false,
			},
			{
				id: 21,
				name: 'Origen',
				exportValue: row =>
            	this.$userInfo.company.settings.flagTypeOriginOrder &&
            	this.$route.name === 'pending-orders-list'
                ? row.referenceExternal || '-'
                : row.originPlatformName || '-',
				checked: false,
				visible: false,
			},
			{
				id: 22,
				name: 'Comentario',
				exportValue: row => row.comments || '-',
				checked: false,
				visible: false,
			},
			{
				id: 23,
				name: 'Orden',
				value: 'routeSort',
				exportValue: row => row.routeSort || '-',
				checked: false,
				visible: false,
			},
			{
				id: 24,
				name: 'Dirección',
				exportValue: row =>
            	row.deliveryAddress
                ? row.deliveryAddress.addressLine1
                : row.customerAddress
                ? row.customerAddress.address
                : '-',
				checked: false,
				visible: false,
			},
			{
				id: 25,
				name: 'Acciones',
				value: 'actions',
				checked: true,
				visible: true,
				flagVisible: true,
				export: false,
			},
		],
		consolidationCode: 'orders',
		consolidationOrders: [],
		consolidationProducts: [],
		codeAction: null,
		currentPage: 1,
		currentOrder: {},
		customerName: '',
		creditType: null,
		options: [
			{ id: 1, code: 'list-sales-by-route', name: 'Lista de Ventas' },
			{ id: 2, code: 'list-sales-pending', name: 'Ventas por cobrar' },
			{
				id: 3,
				code: 'list-sales-ntc',
				name: 'Reporte de Ventas y Notas de Credito',
			},
		],
		optionsPdf: [
			{
				id: 1,
				code: 'documents-massive-tickets-pdf',
				name: 'Reporte de Ventas Masivos a4',
				view: 'detail-route-distribution',
			},
			{
				id: 2,
				code: 'documents-massive-tickets-html',
				name: 'Reporte de Ventas Masivos Ticket',
				view: 'detail-route-distribution',
			},
			{
				id: 3,
				code: 'massive-orders-a4-pdf',
				name: 'Reporte de Pedidos Masivos en PDF',
				view: 'pending-orders-list',
			},
			{
				id: 4,
				code: 'massive-orders-pdf',
				name: 'Reporte en Formato Ticket',
				view: 'pending-orders-list',
			},
			{
				id: 5,
				code: 'massive-orders-a4-pdf',
				name: 'Reporte de Pedidos Masivos PDF',
				view: 'detail-route-distribution',
			},
			{
				id: 6,
				code: 'massive-orders-pdf',
				name: 'Reporte de Pedidos Masivos Ticket',
				view: 'detail-route-distribution',
			},
		],
		customers: [],
		detailDistribution: {},
		dataSelected: [],
		dialog: false,
		dialogBtn: '',
		dialogCode: '',
		dialogMessage: '',
		dialogSubtext: '',
		showDocuments: false,
		documentTypes: [
			{
				id: 1,
				name: 'Pedidos',
				value: 0,
			},
			{
				id: 2,
				name: 'Facturas',
				value: 1,
			},
			{
				id: 3,
				name: 'Boletas',
				value: 2,
			},
		],
		filterFields: {
			byBol: false,
			byFac: false,
			cityId: null,
			customerId: null,
			documentType: 0,
			endDate: null,
			flagPickUp: null,
			flagSale: null,
			startDate: null,
			employeeIds: [],
			inRoute: true,
			subsidiaryId: null,
			warehouseId: null,
			limit: 30,
			orderStateId: null,
			orderPickState: null,
			outRoute: true,
			page: 1,
			districtIds: null,
			provinceId: null,
			sortDirection: 'desc',
			sortField: 'created_at',
			zoneId: null,
			transportAgencyId: [],
			flagDebts: null,
			originPlatform: null,
			referenceExternal: null,
			groupId: null,
			deliveryDate: null,
		},
		ordersQuantity: 0,
		groups: [],
		modalStockError: false,
		detailsErrorStock: [],
		columnsStock: [
			{
				id: 1,
				name: 'Código',
				value: 'code',
				checked: true,
				visible: true,
				flagVisible: true,
			},
			{
				id: 2,
				name: 'Nombre',
				value: 'name',
				checked: true,
				visible: true,
				flagVisible: true,
			},
			{
				id: 3,
				name: 'Stock',
				value: 'stock',
				checked: true,
				visible: true,
				flagVisible: true,
			},
			{
				id: 4,
				name: 'Tienda',
				value: 'warehouseName',
				checked: true,
				visible: true,
				flagVisible: true,
			},
		],
		dialogDetail: false,
		loading: false,
		informationOrder: {},
		lastPage: 0,
		order: {},
		orders: [],
		orderSelected: {},
		orderAction: {},
		ordersConsolidation: [],
		ordersSelected: [],
		params: {
			orderStateId: [],
		},
		parishes: [],
		pickUpTypes: [],
		provinces: [],
		totalWeightDetail: 0,
		registerId: null,
		sellerName: '',
		showModal: false,
		transportName: '',
		orderStateId: '',
		showEnabledRequest: false,
		sellers: [],
		transports: [],
		states: [],
		orderStates: [],
		title: '',
		totalQuantity: 0,
		toShow: false,
		typeQuantity: 'Pedidos',
		zones: [],
		objectCart: {},
		objectTransaction: {},
		componentKey: 0,
		listSubsidiaries: [],
		listWarehouses: [],
		paramsDocs: null,
		productsWithoutStock: [],
		modalWithoutStock: false,
		columnsWithoutStock: [
			{
				id: 1,
				name: 'Código',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Nombre',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Stock',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Almacen',
				checked: true,
				visible: true,
			},
		],
		typeRemissionGuide: 1,
		transportAgencyIdGuideRemision: null,
		modalRemisionGuide: false,
		totalWeight: 0,
		groupedProducts: {},
		originList: [
			{
				id: 2,
				name: 'Admin Web',
			},
			{
				id: 3,
				name: 'Movil',
			},
			{
				id: 4,
				name: 'POS Web',
			},
		],

		totalOrdersAmount: 0,
	};
}

export default {
	name: 'page-pending-orders-list',
	components: {
		actionSidebar,
		addressSlide,
		appActions,
		consolidationSlide,
		ecommerceDetailsInTable,
		filtersSection,
		filtersSlide,
		headerPage,
		modalSidebarButton,
		orderDetailCard,
		pendingOrdersList,
		sliderOrderState,
		salesCancelNew,
		creditNote,
		listDocuments,
		viewDebts,
		simpleModal,
		appTable,
	},
	computed: {
		disabledConsolidation,
		disabledCreateRoute,
		totalItems,
		totalOrders,
		actionsDisabled,
		totalWeightPending,
		totalWeightSelected() {
			return this.dataSelected.reduce((a, r) => a + r.weight, 0);
		},
	},
	created,
	data,
	methods: {
		actionCancel,
		actionSuccess,
		buildDetails,
		changeStateOrder,
		closeDialogDetail,
		generateExportParams,
		buildFilters,
		exportExcel,
		buildOrders,
		emitExcel,
		cancelRegister,
		changeRowsSelectedValue,
		cleanFilters,
		closeDetail,
		closeSlide,
		columnSortable,
		detailSale,
		downloadMassive,
		eventOnRows,
		filterList,
		generateGuidesOrder,
		goToConsolidationOrder,
		isAction,
		loadCities,
		loadCustomers,
		loadOrders,
		loadParishes,
		loadResources,
		updateInformationOrder,
		downloadOrder,
		onClickIcon,
		onInput,
		openEditOrder,
		onSearchEvent,
		onSearchInput: debounce(onSearchInput),
		onSearchLocal,
		onSelectedAll,
		openConfirmation,
		quitRegister,
		rowIsSelected,
		runAction,
		setFilterData,
		setFilterEmployee,
		setAddressData,
		showSlide,
		updateActive,
		validSavedData,
		openSlideState,
		updatePaymentStateOrder,
		initialize,
		sendData(row) {
			const conditions = {
				'return-sales-note': row.codeDocument !== 'NTV',
				NTC: !['BOL', 'FAC'].includes(row.codeDocument),
				override: row.codeDocument === 'COT',
			};
			const messages = {
				'return-sales-note':
					'Las devoluciones de nota de ventas solo aplican para los documentos de nota de venta',
				NTC: 'Las notas de credito solo aplican para los documentos de boletas o facturas',
				override:
					'La anulacion de ventas no esta disponible para documentos con cotizaciones',
			};
			if (conditions[this.codeAction]) {
				this.showGenericError(messages[this.codeAction]);
				return;
			}
			// Funciones de validación
			if (this.codeAction === 'NTC' || this.codeAction === 'return-sales-note') {
				this.loadValidateNtc(row.id, this.codeAction);
			} else if (this.codeAction === 'override') {
				this.orderAction = row;
				this.loadValidate(row.id);
			}
			this.showListDocuments();
			this.codeAction = null;
		},
		salesCanceled() {
			this.closeModal();
			this.loadOrders();
		},
		handleRouteChange(to) {
			if (to.path === '/orders/pending/list') {
				// this.componentKey += 1;
				helper.removeLocalData('pending-orders');
				this.dataSelected = [];
				this.initialize();
			}
			this.initialize();
		},
		closeModal() {
			this.orderAction = {};
			this.ordersSelected = [];
			this.showSaleCancelForm = false;
		},
		async loadValidateNtc(id, code) {
			try {
				({ data: this.validSale } = await this.$httpSales.get(`sale-documents/${id}`));
				this.validSale.typeDocumentName = this.validSale.typeDocument.name;
				this.data = this.validSale.details.map((row) => {
					const newRow = { ...row };
					newRow.parts =
						row && row.aditionalInformation && row.aditionalInformation.dynamicFields
							? row.aditionalInformation.dynamicFields.parts
							: null;
					newRow.meterage =
						row && row.aditionalInformation && row.aditionalInformation.dynamicFields
							? row.aditionalInformation.dynamicFields.meterage
							: null;
					newRow.priceBaseToCalculate = setNewProperty(
						'priceBaseToCalculate',
						this.validSale.flagBasePrice
					);
					newRow.locationProduct =
						row && row.aditionalInformation ? row.aditionalInformation.location : null;
					newRow.weightProduct =
						row && row.aditionalInformation ? row.aditionalInformation.weight : null;
					return newRow;
				});
				if (code) {
					this.openNoteCredit(code);
				}
			} catch (err) {
				if (err.status === 400) {
					const message = err.data.message;
					if (message === 'WAS_ALREADY_CANCELED_SALE') {
						this.showGenericError('La venta ya ha sido anulada anteriormente.');
					} else if (message === 'DOCUMENTS_MUST_NOT_BE_CANCELED') {
						this.showGenericError(
							'El documento ya se encuentra en proceso de anulación.'
						);
					}
				} else {
					this.showGenericError();
				}
			}
		},
		async loadValidate(id) {
			try {
				({ data: this.validSale } = await this.$httpSales.get(
					`sale-documents-validate/${id}`
				));
				this.validSale.typeDocumentName = this.validSale.typeDocument.name;
				this.showSaleCancelForm = true;
			} catch (err) {
				if (err.status === 400) {
					const message = err.data.message;
					if (message === 'WAS_ALREADY_CANCELED_SALE') {
						this.showGenericError('La venta ya ha sido anulada anteriormente.');
					} else if (message === 'DOCUMENTS_MUST_NOT_BE_CANCELED') {
						this.showGenericError(
							'El documento ya se encuentra en proceso de anulación.'
						);
					}
				} else {
					this.showGenericError();
				}
			}
		},
		openNoteCredit(code) {
			this.action.code = code;
			this.action.title =
				code === 'NTC' ? 'Nota de Credito' : 'Devolucion de Nota de Venta';
			this.action.width = 1000;
			this.action.open = true;
			this.action.value = true;
		},
		async convertDocument(dataInfo) {
			const code = this.action.code === 'return-sales-note' ? 'NDD' : this.action.code;
			const url = `sale-documents/${code}/type-note`;
			const newType = 'CRÉDITO';
			const message = `Pedido convertido a nota de ${newType}`;
			const body = this.buildBody(dataInfo);
			const newDate = new Date();
			const dateOnline = newDate.getTime().toString();
			body.dateOnline = code === 'return-sales-note' ? dateOnline : null;
			body.warehouseCodeTaxes = this.$userInfo.warehouse.codeTaxes;
			body.warehouseName = this.validSale.warehouseName;
			if (dataInfo.saleNumber) {
				body.number = dataInfo.saleNumber;
			}
			this.isLoading = true;
			try {
				await this.$httpSales.post(url, body);
				this.showNotification(message);
				this.closeSlide();
				this.loadOrders();
			} catch (error) {
				if (error.status === 500) {
					this.showGenericError();
				} else if (error.status === 400) {
					if (error.data.message === 'SALE_DUPLICATE_ERROR') {
						this.showGenericError('La venta ya ha sido registrada.');
					} else {
						this.showGenericError(error.data.messageError);
					}
				}
			} finally {
				this.isLoading = false;
			}
		},
		buildBody(obj) {
			const {
				dataSelected,
				flagTransfer,
				selectedCardsFn,
				creditType,
				detailsPayments,
				total,
				cashPay,
				cardPay,
				commentary,
				subTotal,
				tax,
				discountAmount,
				totalTaxesAmount,
				taxesAmount,
				paymentMethodId,
				exchangeRate,
				tip,
			} = obj;
			this.creditType = creditType;
			const subTotalSale =
				this.creditType === 1 || this.creditType === 6
					? this.validSale.subtotal
					: twoDecimals(subTotal);
			const amountValid =
				this.creditType === 1 || this.creditType === 6 ? this.validSale.amount : total;
			const amountCashValid =
				this.creditType === 1 || this.creditType === 6
					? this.validSale.amountCash
					: cashPay;
			const taxValid =
				this.creditType === 1 || this.creditType === 6 ? this.validSale.taxes : tax;
			return compose(
				setNewProperty('tip', tip),
				setNewProperty('amount', amountValid),
				setNewProperty('amountCash', amountCashValid),
				setNewProperty('amountCredit', cardPay),
				setNewProperty('commentary', commentary),
				setNewProperty('currency', this.validSale.currency),
				setNewProperty('details', this.productDetails(dataSelected)),
				setNewProperty('discount', this.creditType === 5 ? 0 : discountAmount || 0),
				setNewProperty('exchangeRate', this.validSale.exchangeRate || exchangeRate),
				setNewProperty('flagTransfer', flagTransfer),
				setNewProperty('paymentMethodId', paymentMethodId),
				setNewProperty('salDocumentsId', this.validSale.id),
				setNewProperty(
					'subtotal',
					this.creditType === 5 ? this.roundInNumber(total - tax) : subTotalSale
				),
				setNewProperty('taxes', taxValid || 0),
				setNewProperty('taxesAmount', taxesAmount),
				setNewProperty('detailsPayments', detailsPayments),
				setNewProperty('totalTaxesAmount', totalTaxesAmount),
				setNewProperty(
					'transactions',
					this.getTransactions(selectedCardsFn, detailsPayments)
				),
				setNewProperty(
					'transactionId',
					this.getTransactionId(selectedCardsFn, detailsPayments)
				),
				setNewProperty('typeCatalogSunatId', creditType)
			)({});
		},
		productDetails(products) {
			return products.map((product) => {
				const newProduct = {};
				const price = this.getPrice(product);
				const seriesValue =
					product.aditionalInformation && product.aditionalInformation.seriesSelect
						? product.aditionalInformation.seriesSelect ||
						  product.aditionalInformation.series
						: null;
				const newPriceSale =
					this.creditType === 5 ? product.total / product.quantity : product.priceUnitary;
				const priceUnitWithDiscountPrice = fourDecimals(
					product.price / `1.${product.tax}`
				);
				const newPriceUnitary = twoDecimals(newPriceSale / `1.${product.tax}`);
				const newTaxAmount = newPriceSale - newPriceUnitary;
				newProduct.discount = 0;
				const subtotalWithoutTax =
					(product.priceUnitary - product.discount) * product.quantity;
				const subtotalWithoutTaxDiscount =
					(newPriceUnitary - newProduct.discount) * product.quantity;
				newProduct.brandSpId = product.brandSpId || undefined;
				newProduct.brandName = product.brandName;
				newProduct.groupType = product.groupType;
				newProduct.freeAmount = product.flagFree === 1 ? product.salePrice : undefined;
				newProduct.categoryName = product.categoryName;
				newProduct.categoryId = product.categoryId;
				newProduct.description =
					this.creditType === 3
						? `Decia: ${product.oldDescription} - Debe decir: ${product.description}`
						: product.description;
				newProduct.productCode = product.productCode;
				newProduct.productCubsoCode = product.productCubsoCode;
				newProduct.unitCode = product.unitCode;
				newProduct.unitName = product.unitName;
				newProduct.aditionalInformation = {
					descriptionProducts: product.description || product.product.name || undefined,
					autoBarcode: product.aditionalInformation
						? product.aditionalInformation.autoBarcode
						: null,
					salPriceListId: product.aditionalInformation
						? product.aditionalInformation.salPriceListId
						: null,
					series: this.creditType === 6 || this.creditType === 7 ? seriesValue : null,
				};
				newProduct.discount = 0;
				newProduct.codeTaxes = product.codeTaxes;
				newProduct.discountPercentage = 0;
				newProduct.flagFree = product.flagFree;
				newProduct.warehouseName = product.warehouseName;
				newProduct.brandId = product.brandId;
				newProduct.quantity = product.quantity;
				newProduct.price =
					this.creditType === 1 ||
					this.creditType === 6 ||
					this.creditType === 7 ||
					this.creditType === 3
						? product.price
						: newProduct.price;
				if (newProduct.flagFree === 1) {
					newProduct.price = 0;
				}
				if (this.creditType === 5) {
					newProduct.price =
						this.creditType === 5
							? this.roundInNumber(newPriceSale)
							: this.roundInNumber(price);
				}
				newProduct.productType = product.product.typeId;
				if (this.creditType === 1 || this.creditType === 6) {
					newProduct.salePrice = product.pricePerSale;
				} else if (this.creditType === 7) {
					newProduct.salePrice = product.price;
				} else {
					newProduct.salePrice =
						this.creditType === 5
							? this.roundInNumber(newPriceSale)
							: this.roundInNumber(price);
				}
				newProduct.stockQuantity = product.stockQuantity;
				if (this.creditType === 6) {
					newProduct.subtotalWithoutTax = twoDecimals(product.subtotalWithoutTax);
				} else if (this.creditType === 7 || this.creditType === 1) {
					newProduct.subtotalWithoutTax = twoDecimals(subtotalWithoutTax);
				} else {
					newProduct.subtotalWithoutTax =
						this.creditType === 5
							? fourDecimals(subtotalWithoutTaxDiscount)
							: subtotalWithoutTax;
				}
				newProduct.tax = this.creditType === 3 ? 0 : product.tax || product.taxes;
				if (this.creditType === 3) {
					newProduct.taxAmount = 0;
				} else {
					newProduct.taxAmount =
						this.creditType === 5
							? twoDecimals(newTaxAmount * product.quantity)
							: product.taxAmount;
				}
				newProduct.priceCost =
					product.product && product.product.cost ? product.product.cost : 0;
				newProduct.unitCode = product.unitCode;
				newProduct.unitConversion = product.unitConversion;
				newProduct.unitId = product.unitId;
				newProduct.unitName = product.unitName;
				if (this.creditType === 6 || this.creditType === 3) {
					// newProduct.unitPrice = product.unitPrice;
					newProduct.unitPrice = product.priceUnitary;
				} else if (this.creditType === 7 || this.creditType === 1) {
					newProduct.unitPrice = priceUnitWithDiscountPrice;
				} else {
					newProduct.unitPrice =
						this.creditType === 5
							? newPriceUnitary
							: this.roundInNumber(product.priceUnitary);
				}
				newProduct.unitQuantity =
					this.creditType === 6 || this.creditType === 1
						? product.unitQuantity
						: product.quantity * product.unitConversion;
				newProduct.warProductsId = product.warProductsId;
				newProduct.warWarehousesId = product.warWarehousesId;
				if (this.isEcuador) {
					newProduct.codeTaxes = product.codeTaxes;
				}
				const subTotalSale =
					this.creditType === 1 || this.creditType === 6
						? product.subTotal
						: product.unitPrice;
				newProduct.taxes = product.product.taxes.reduce((a, p) => {
					const newRow = {
						amount: 0,
						subtotal: 0,
						code: p.code,
						codePercentage: p.codePercentage || 0,
						percentage: p.percentage || 0,
						taxSchemeName: p.name || '',
					};
					if (this.creditType === 3) {
						newRow.amount = 0;
						newRow.subtotal = 0;
					} else {
						newRow.amount =
							this.creditType === 5 ? newProduct.taxAmount : product.taxAmount;
						newRow.subtotal = this.creditType === 5 ? newPriceUnitary : subTotalSale || 0;
						if (newRow.code === '05') {
							newRow.amount = 0;
						}
					}
					const codeFound = a.find((i) => i.code === p.code);
					if (!codeFound) {
						a.push(newRow);
					}
					return a;
				}, []);
				return newProduct;
			});
		},
		getTransactionId(typePayments, valid) {
			if (valid.length === 0) {
				return typePayments.map((st) => st.id);
			}
			return [];
		},
		getPrice(product) {
			const { priceUnitaryReal, priceUnitary, discount, tax, total } = product;
			const finalPriceUnitary =
				this.creditType === 5 ? total : priceUnitaryReal || priceUnitary;
			const newTax = tax || 0;
			return ((finalPriceUnitary - discount) * (1 + newTax / 100) * 100) / 100;
		},
		getTransactions(typePayments, valid) {
			const self = this;
			if (valid.length === 0) {
				return typePayments.map((st) => {
					const flag = st.flagForm;
					const newSt = {
						amount: -st.paid,
						currency: self.validSale.currency,
						paymentAmount: -st.paid,
						paymentDate: format(new Date(), 'YYYY-MM-DD'),
						typePaymentId: st.id,
					};
					if (Number(flag) === typePaymentForm.Card) {
						newSt.documentNumber = st.card.documentNumber;
					} else if (Number(flag) === typePaymentForm.Check) {
						newSt.additionalInformation = {
							dateReference: st.check.additionalInformation.dateReference,
						};
						newSt.bankAccountId = st.check.bankAccountId || null;
						newSt.reference = st.check.reference || null;
						newSt.documentNumber = st.check.documentNumber || null;
					} else if (Number(flag) === typePaymentForm.Deposit) {
						newSt.additionalInformation = {
							dateReference: st.deposit.additionalInformation.dateReference,
						};
						newSt.bankAccountId = st.deposit.bankAccountId || null;
						newSt.urlImage = st.deposit.urlImage || null;
						newSt.documentNumber = st.deposit.documentNumber || null;
					}
					return newSt;
				});
			}
			return [];
		},
		async loadSubsidiaries() {
			const subsidiaries = await this.$httpSales.get('subsidiaries');
			this.listSubsidiaries = subsidiaries.data;
		},
		async loadWarehouses() {
			const { data: warehouses } = await this.$httpProducts.get('warehouses');
			this.listWarehouses = warehouses;
		},
		showListDocuments() {
			this.showDocuments = !this.showDocuments;
		},
		openModalAmortization(row) {
			this.dialogDetail = false;
			this.action = {
				code: 'detail-debt',
				width: 750,
				open: true,
				title: `Detalle de Deuda de ${row.customer.typePerson.fullName}`,
				value: true,
			};
			this.customerId = row.customerId || (row.customer && row.customer.id);
		},
		ordersWithAddressInvalidLength(orders = []) {
			const invalids = orders.filter((d) =>
				d.customerAddress
					? !d.customerAddress.latitude && !d.customerAddress.longitude
					: true
			);
			return invalids.length;
		},
		toggleModalGuide() {
			this.modalRemisionGuide = !this.modalRemisionGuide;
		},
		async listOrigin() {
			try {
				const response = await this.$httpSales.get('type-origins');
				this.originList = response.data;
			} catch (error) {
				this.showGenericError();
			}
		},
		updateWeight(total) {
			this.totalWeight = total;
		},
		async getTotalOrders() {
			if (this.$route.name === 'detail-route-distribution') {
				this.totalOrdersAmount = this.orders.reduce((ac, o) => ac + o.total, 0);
				return;
			}
			this.loadingGeneral = true;
			const params = this.buildFilters();
			params.includeEmployee = true;
			params.flagTransportAgency = true;
			params.flagPendingOrders = true;
			delete params.page;
			delete params.limit;
			delete params.sortField;
			delete params.sortDirection;

			try {
				const response = await this.$httpSales.get('order-totals', {
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
	watch: {
		/* eslint-disable object-shorthand */
		$route(to) {
			this.handleRouteChange(to);
		},
		/* eslint-enable object-shorthand */
	},
};
</script>

<style lang="scss" scoped>
.label-header-sidebar {
	color: color(background-sidebar);
	font-family: font(lato-bold);
	font-size: size(medium);

	span {
		font-size: size(large27);
	}
}

.btn-return {
	background-color: white !important;
	border: 1px solid map-get($colors, primary);
	border-radius: 5px;
	color: map-get($colors, primary);
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, small10);
	padding: 8px 0;
	width: 97px !important;
}

.dialog {
	margin: 0px !important;
}

.title-card {
	background-color: #f8f8f8;
	border-bottom: 1px solid #e0e0e0;
	padding: 16px;
	font-weight: bold;
}
.title-text {
	font-size: 1rem;
	color: #333;
}
.modal {
	border-radius: 8px;
}
.mesage-error {
	color: red;
	font-size: 0.7rem;
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

.subtext {
	color: color(grey-border) !important;
	font-family: font(open-regular) !important;
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto !important;
	max-width: 340px !important;
	padding: 0px !important;
	text-align: justify !important;
}

.btn-block {
	padding-bottom: 24px !important;
	padding-top: 28px !important;
}

.mb-120 {
	margin-bottom: 120px;
}

.label-lg {
	font-family: font(lato-bold);
	font-size: size(small13);
	line-height: normal;
	text-transform: uppercase;
}

.value-lg {
	color: color(background-sidebar);
	font-family: font(lato-bold);
	font-size: size(medium);
	line-height: normal;
}

.title-card {
	background-color: #f8f8f8;
	border-bottom: 1px solid #e0e0e0;
	padding: 16px;
	font-weight: bold;
}
.title-text {
	font-size: 1rem;
	color: #333;
}
.modal {
	border-radius: 8px;
}
.mesage-error {
	color: red;
	font-size: 0.7rem;
}
</style>
