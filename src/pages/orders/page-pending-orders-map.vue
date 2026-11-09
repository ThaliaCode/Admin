<template>
	<div>
		<header-page
			:btn-header-link="btnHeaderLink"
			btn-header-text="Ver Lista"
			btn-header-show
			:caption-navigation="captionNavigation"
			column-class="xs12"
			justify-class="justify-start"
			:title="title"
			to-show
			:show-clean="$route.name === 'pending-orders-map'"
			:show-excel="false"
			@clean-product-filter="cleanFilters"
		>
			<v-flex xs9 v-if="$route.name === 'pending-orders-map' && !isFlowNew">
				<filters-data
					:filter-fields="filterFields"
					:filter-data="filterData"
				></filters-data>
			</v-flex>
			<v-layout
				v-else-if="!isFlowNew"
				class="header-information-distribution"
				mr-2
			>
				<v-flex text-xs-center class="item-information">
					Fecha de Entrega:
					<span class="num-information">{{ detailRoute.dateRoute }}</span>
				</v-flex>
				<v-flex text-xs-center class="item-information">
					Estado:
					<span class="num-information">{{ detailRoute.statusName }}</span>
				</v-flex>
				<v-flex text-xs-center class="item-information">
					Recorrido:
					<span class="num-information">{{ detailRoute.distance }}</span>
				</v-flex>
			</v-layout>
			<v-btn
				v-if="$route.name === 'pending-orders-map'"
				class="btn-auto px-3 py-2 ma-0"
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
			<div class="divhelp">
				<img
					@click="action.open = !action.open"
					src="/static/icon/btn-help-center.svg"
				/>
			</div>
		</header-page>
		<v-layout row wrap>
			<v-flex xs5>
				<filters-section
					map-filters-section
					:filter-fields="filterFields"
					@show-filters="showSlide('filters', 'FILTROS')"
					@filter-list="loadOrders"
					@set-filter-data="setFilterData"
				></filters-section>
				<div :style="getHeight" class="scroll-section">
					<template v-for="order in orders">
						<order-detail-card
							class="px-4 mb-2"
							list
							:check-all="checkAllProducts"
							:check-all-disabled="checkAllDisabled"
							:expand-body="order.expand"
							:key="order.id"
							:order="order"
							@expand-body="expandBody"
							@click-icon="onClickIcon"
							@row-is-selected="rowIsSelected"
						></order-detail-card>
					</template>
				</div>
				<div class="content-circles-center">
					<circle-map
						v-for="item in getTotalStates"
						:key="item.id"
						:itemId="item.id"
						:total="item.total"
					>
					</circle-map>
					<circle-map :itemId="0" :total="this.orders.length"> </circle-map>
				</div>
			</v-flex>
			<v-flex xs7>
				<div class="static-map">
					<map-component
						:center-location="center"
						:customer-selected="customerSelected"
						:markers="markers"
						:orders-polyline="flagPolyline"
						:path-line="pathLine"
						:polyline="polyline"
						:polylines="polylines"
						show-info-order
						:polylines-data="polylinesData"
						:zoom="zoom"
						:data-selected="dataSelected"
						:orders="orders"
						set-path
						@draw-active="drawActive"
						@set-data-line="setDataLine"
						@selected-marker="selectedMarker"
					/>
				</div>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<v-flex text-xs-center v-if="$route.name === 'pending-routes-map'">
				<v-btn type="button" class="btn-auto btn-return" @click="goBack">
					Atras
				</v-btn>
			</v-flex>
			<modal-sidebar-button
				v-else
				hidden
				:img="false"
				:is-loading="disabledCreateRoute"
				padding-success="px-5 py-2"
				success-color="primary"
				success-text="Armar ruta"
				@accept-button-clicked="buildRoute"
			/>
		</section>
		<action-sidebar
			:width="action.width"
			:code-action="action.code"
			:title="action.title"
			:active="action.title"
			v-model="action.open"
		>
			<div class="content-circles-information">
				<circle-map-information
					v-for="item in getTotalStates"
					:key="item.id"
					:itemId="item.id"
					:total="item.total"
				>
				</circle-map-information>
				<circle-map-information :itemId="0" :total="this.orders.length">
				</circle-map-information>
			</div>
		</action-sidebar>
		<action-sidebar
			:back-btn="isAction('filters')"
			:title="action.title"
			:value="action.value"
			:width="action.width"
			@close-modal="closeSlide"
		>
			<v-flex
				v-show="isAction('consolidation')"
				xs6
				text-xs-right
				pr-3
				slot="right"
			>
				<label class="label-header-sidebar">
					Cant. de {{ typeQuantity }}: <span>{{ totalQuantity }}</span>
				</label>
			</v-flex>
			<consolidation-slide
				v-if="isAction('consolidation')"
				:orders="ordersConsolidation"
				:total-weight="totalWeight"
				@on-search="onSearchLocal"
				@accept-action="closeSlide"
				@update-active="updateActive"
			></consolidation-slide>
			<filters-slide
				v-if="isAction('filters')"
				map-filters-section
				:drivers="drivers"
				:transports-agencies="transportAgencies"
				:flag-pick-up="flagPickUp"
				:filter-data="filterFields"
				:cities="cities"
				:customers="customers"
				:document-types="documentTypes"
				:parishes="parishes"
				:pick-up-types="pickUpTypes"
				:provinces="provinces"
				:sellers="sellers"
				:states="states"
				:zones="zones"
				:orderStates="orderStates"
				@accept-action="closeSlide(true)"
				@cancel-action="closeSlide"
				@set-filter-data="setFilterData"
				@on-input="onInput"
			></filters-slide>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="425">
			<v-card>
				<v-card-title class="headline">{{ dialogMessage }}</v-card-title>
				<v-card-text class="subtext">
					{{ dialogSubtext }}
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
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import circleMap from '@/components/shared/circle-map';
import circleMapInformation from '@/components/shared/circle-map-information';
import actionSidebar from '@/components/shared/action-sidebar';
import consolidationSlide from '@/components/orders/consolidation-slide';
import filtersData from '@/components/orders/filters-data';
import filtersSection from '@/components/orders/filters-section';
import filtersSlide from '@/components/orders/filters-slide';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import mapComponent from '@/components/shared/map/map-component';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import orderDetailCard from '@/components/orders/order-detail-card';
import TypePickUp from '@/shared/type-pick-up';
import typeOrder from '@/shared/type-order';
import typeRouteTwoDriver from '@/shared/type-route-two-driver';

const { debounce, getLocalData, removeLocalData, setLocalData } = helper;
const DEFAULT_ORDER_STATE_IDS = '2,5,6';
const FLAG_PICK_UP_DELIVERY = 1;
const ORDER_STATE_READY_TO_PICK_UP = '6';

function calculateCenter(points) {
	const bounds = new window.google.maps.LatLngBounds();
	points.forEach((p) => {
		bounds.extend(p);
	});
	return bounds.getCenter();
}

function created() {
	setLocalData('route-from', this.$route.name);
	this.center = this.labelsByCountry.geoposition;
	if (this.isFlowNew) {
		this.key =
			this.$route.query.from === 'pick-up-earrings'
				? 'pending-orders-pick-up'
				: 'pending-orders-deliver';
		this.dataSelected = getLocalData(this.key) || [];
		this.ordersSelected = getLocalData(this.key) || [];
	} else {
		this.dataSelected = getLocalData('pending-orders') || [];
		this.ordersSelected = getLocalData('pending-orders') || [];
	}
	this.loadResources();
	if (this.$route.name === 'pending-routes-map') {
		this.loadRouteMap();
		if (this.isTwoDrivers) {
			this.btnHeaderLink = {
				name: 'detail-new-route-distribution',
				params: { id: this.detailRoute.id },
			};
		} else {
			this.btnHeaderLink = {
				name: 'detail-route-distribution',
				params: { id: this.detailRoute.id },
			};
		}
	} else if (this.$route.query.from) {
		if (this.$route.query.from === 'pick-up-earrings') {
			this.title = 'Pedidos por Recoger';
			this.captionNavigation = 'Mapa de pedidos por recoger';
		} else {
			this.title = 'Pedidos por Entregar';
			this.captionNavigation = 'Mapa de pedidos por entregrar';
		}
		this.btnHeaderLink = {
			name: this.$route.query.from,
		};
	}
}

function actionCancel() {
	this.dialog = false;
	this.dialogBtn = '';
	this.dialogCode = '';
	this.dialogMessage = '';
	this.dialogSubtext = '';
	this.orderSelected = {};
}

function actionSuccess() {
	if (this.dialogCode === 'quit') {
		this.quitRegister();
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
	const orderStateIds = this.$route.query.from
		? ORDER_STATE_READY_TO_PICK_UP
		: DEFAULT_ORDER_STATE_IDS;
	if (newFilter.orderStateId && this.$route.name === 'pending-routes-map') {
		newFilter.orderStateId =
			newFilter.orderStateId.length > 0
				? newFilter.orderStateId.map((p) => p.id).join(',')
				: orderStateIds;
	} else {
		newFilter.orderStateId = orderStateIds;
	}
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
	return newFilter;
}

function buildOrders(rows) {
	const validDataSelected = this.dataSelected.length > 0;
	return rows.map((row, index) => {
		const orderIndex = validDataSelected
			? this.dataSelected.findIndex((ds) => ds.number === row.number)
			: -1;
		const newOrder = { ...row };
		const {
			customer,
			customerAddress,
			flagPickUp,
			typeDocument,
			orderPickStateName,
			currency,
			routeName,
			deliveryJson,
		} = row;
		const { typePerson, zone, phone } = customer;
		const parish = customerAddress ? customerAddress.parish : {};
		const parishName = parish ? parish.name || '-' : '-';
		const orderPickItems = orderPickStateName.split(' ');
		const orderPickCode =
			orderPickItems.length === 2
				? `${orderPickItems[0].split('').splice(0, 1).join()}${orderPickItems[1]
						.split('')
						.splice(0, 1)
						.join()}`
				: orderPickItems[0].split('').splice(0, 1).join();
		newOrder.arrowDirection = false;
		newOrder.isDisabled = flagPickUp !== FLAG_PICK_UP_DELIVERY || !!row.routeId;
		newOrder.isSelected = orderIndex > -1;
		newOrder.zoneName = zone ? zone.name : '-';
		newOrder.parishName = parishName;
		newOrder.routeName = routeName || '-';
		newOrder.expand = validDataSelected ? orderIndex > -1 : index === 0;
		newOrder.customerName = typePerson ? typePerson.fullName : '-';
		newOrder.documentTypeCode = typeDocument ? typeDocument.code : 'PED';
		newOrder.documentTypeName = typeDocument ? typeDocument.name : 'Pedido';
		newOrder.documentNumber = typeDocument ? typeDocument.documentNumber : '-';
		newOrder.orderPickStateCode = orderPickCode;
		newOrder.currency = currency || this.countryCurrencySymbol;
		newOrder.customerPhone = phone;
		newOrder.customerWhatsapp = phone;
		newOrder.addressCustomer = row.deliveryAddress
			? row.deliveryAddress.addressLine1 || parishName
			: parishName;
		newOrder.details = this.buildDetails(row.details);
		newOrder.quantityProducts = row.details.length;
		const icon =
			orderIndex > -1
				? '/static/img/activo.png'
				: '/static/img/desactivado.png';
		if (
			customerAddress &&
			!row.routeId &&
			flagPickUp === FLAG_PICK_UP_DELIVERY
		) {
			this.markers.push({
				position: {
					lat: customerAddress.latitude,
					lng: customerAddress.longitude,
				},
				icon,
				zIndex: 1,
				id: row.id,
			});
		} else if (this.$route.query.from) {
			const lat =
				this.$route.query.from === 'pick-up-earrings'
					? deliveryJson.pickUpPoint.latitude
					: deliveryJson.deliveryPoint.latitude;
			const lng =
				this.$route.query.from === 'pick-up-earrings'
					? deliveryJson.pickUpPoint.longitude
					: deliveryJson.deliveryPoint.longitude;
			this.markers.push({
				position: {
					lat,
					lng,
				},
				icon,
				zIndex: 1,
				id: row.id,
			});
		}
		if (this.$route.query.from) {
			newOrder.isDisabled = false;
		}
		return newOrder;
	});
}

function cleanFilters() {
	this.filterFields = {
		byBol: false,
		byFac: false,
		cityId: null,
		transportAgencyId: null,
		customerId: null,
		documentType: 0,
		deliveryId: null,
		endDate: null,
		startDate: null,
		employeeId: null,
		inRoute: true,
		orderPickState: null,
		orderStateId: null,
		outRoute: true,
		parishId: null,
		provinceId: null,
		sellerId: null,
		sortDirection: 'asc',
		sortField: 'created_at',
		zoneId: null,
	};
	this.filterData = {
		customerName: '',
		distritName: '',
		orderPickStateName: '',
		parishName: '',
		sellerName: '',
		zoneName: '',
	};
	this.flagPickUp = null;
	this.dataSelected = [];
	this.ordersSelected = [];
	this.cleanSearch = true;
	if (this.isFlowNew) {
		this.filterFields.typeOrder = typeOrder.FREE;
		if (this.$route.query.from === 'pick-up-earrings') {
			this.filterFields.flagPickUp = TypePickUp.PickUpStore;
		} else {
			this.filterFields.flagPickUp = TypePickUp.HomeDelivery;
		}
		removeLocalData(this.key);
	} else {
		removeLocalData('pending-orders');
		this.filterFields.flagPickUp = TypePickUp.HomeDelivery;
	}
	this.dataSelected = [];
	this.loadOrders();
}

function closeSlide(load) {
	if (load) {
		this.filterList();
	} else {
		this.action.value = false;
		this.action.code = '';
		this.action.title = '';
		this.markers = [];
	}
}

function disabledCreateRoute() {
	return this.dataSelected.length === 0;
}

function disabledConsolidation() {
	return this.totalOrders === 0;
}

function drawActive(polilyneActice) {
	this.drawPolyline = polilyneActice;
}

function eventOnRows(registers, event, { prop, value }) {
	return value
		? registers[event]((register) => register[prop])
		: registers[event]((register) => !register[prop]);
}

function expandBody(row) {
	this.$set(row, 'expand', !row.expand);
}

function filterList() {
	const disabledValidate =
		this.filterFields.startDate && !this.filterFields.endDate;
	if (disabledValidate) {
		this.showNotification(
			'Selecciona una fecha final o limpia el filtro de fecha inical',
			'warning'
		);
	} else {
		this.closeSlide();
		this.loadOrders();
	}
}

function goBack() {
	this.$router.back();
}

function goToConsolidationOrder() {
	this.goTo('consolidation-order');
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

async function loadTransportAgency(agencySearch) {
	const params = { search: agencySearch };
	({ data: this.transportAgencies } = await this.$httpSales.get(
		'transport-agency',
		{ params }
	));
}

async function loadDrivers() {
	({ data: this.drivers } = await this.$httpSales.get('delivery'));
}

async function loadOrders() {
	const params = this.buildFilters();
	const { data: orders, headers } = await this.$httpSales.get('orders', {
		params,
	});
	if (this.$route.name === 'pending-routes-map') {
		const orderDetail = this.detailRoute.orders.length
			? this.detailRoute.orders
			: this.detailRoute.ordersPickUp;
		this.orders = orderDetail;
		if (this.isTwoDrivers) {
			const key =
				this.detailRoute.flagPickUpShip === typeRouteTwoDriver.PickUpPoint
					? 'pickUpPoint'
					: 'deliveryPoint';
			this.markers = this.orders.map((p) => {
				const newRow = {};
				newRow.position = {
					lng: p.deliveryJson[key].longitude,
					lat: p.deliveryJson[key].latitude,
				};
				newRow.icon =
					p.orderState.code === 'GIVEN'
						? '/static/img/activo.png'
						: '/static/img/pendiente.png';
				newRow.zIndex = 999999;
				newRow.id = p.id;
				return newRow;
			});
		} else {
			this.markers = this.detailRoute.orders.reduce((acc, p) => {
				const newRow = {
					position: {
						lng: p.customerAddress.longitude,
						lat: p.customerAddress.latitude,
					},
					icon:
						p.orderState.code === 'GIVEN'
							? '/static/img/activo.png'
							: '/static/img/pendiente.png',
					zIndex: 999999,
					orderStateId: p.orderStateId,
					id: p.id,
				};
				const key = `${newRow.position.lat},${newRow.position.lng}`;
				const existing = acc.find(
					(item) => `${item.position.lat},${item.position.lng}` === key
				);
				if (!existing) {
					newRow.duplicateCount = 1;
					acc.push(newRow);
				} else {
					existing.duplicateCount += 1;
				}

				return acc;
			}, []);
		}
	} else {
		this.orders = this.buildOrders(orders);
	}
	if (this.orders.length) {
		const newPoints = this.markers.map((m) => {
			const newM = {
				lat: m.position.lat,
				lng: m.position.lng,
			};
			return newM;
		});
		this.center = calculateCenter(newPoints);
	} else {
		this.markers = [];
	}
	this.lastPage = Number(headers['x-last-page']);
	this.cleanSearch = false;
}

async function loadParishes(id) {
	({ data: this.parishes } = await this.$httpSales.get(`parish/${id}`));
}

async function loadResources() {
	const requests = [
		this.$httpSales.get('order-pick-state'),
		this.$httpSales.get('zones'),
		this.$httpSales.get('province'),
		this.urlLoadData('get', 'typeDelivery'),
		this.$httpSales.get('order-states'),
	];
	[
		{ data: this.states },
		{ data: this.zones },
		{ data: this.provinces },
		{ data: this.pickUpTypes },
		{ data: this.orderStates },
	] = await Promise.all(requests);
	const pickUpSelected = this.pickUpTypes.find((p) => p.code === 'EAD');
	if (this.$route.query.from) {
		if (this.$route.query.from === 'pick-up-earrings') {
			this.filterFields.flagPickUp = TypePickUp.PickUpStore;
		} else {
			this.filterFields.flagPickUp = TypePickUp.HomeDelivery;
		}
		this.filterFields.typeOrder = typeOrder.FREE;
	} else {
		this.filterFields.flagPickUp = TypePickUp.HomeDelivery;
	}
	this.flagPickUp = pickUpSelected.id;
	this.loadOrders();
}

function loadRouteMap() {
	this.detailRoute = getLocalData('detail-route' || {});
	this.title = this.detailRoute.name;
	this.captionNavigation = `NRO DE LA RUTA: ${this.detailRoute.code}`;
}

async function loadVendors(sellerSearch) {
	const params = { search: sellerSearch };
	({ data: this.sellers } = await this.$httpSales.get('sellers', { params }));
}

function onClickIcon({ action, row }) {
	if (action === 'quit') {
		this.orderSelected = { ...row };
		this.openConfirmation(action);
	}
}

function onSearchInput({ model, value }) {
	if (value) {
		if (model === 'sellerId') {
			if (this.filterData.sellerName !== value) {
				this.loadVendors(value);
			}
		}
		if (model === 'customerId') {
			if (this.filterData.customerName !== value) {
				this.loadCustomers(value);
			}
		}
		if (model === 'search') {
			this.filterFields[model] = value;
		}
		if (model === 'transportAgencyId') {
			if (this.filterData.transportAgencyId !== value) {
				this.loadTransportAgency(value);
			}
		}
	} else if (value === '') {
		this.filterFields.sellerId = null;
		this.filterFields.customerId = null;
		this.filterData.sellerName = '';
		this.filterData.customerName = '';
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

function openConfirmation(code) {
	const dialogQuit = `¿Desea liberar el pedido #${this.orderSelected.number}?`;
	const subtextQuit =
		'Recuerda que liberar el pedido que se encuentra en curso indica que el pedido no será entregado al cliente y volverá a la tienda de origen hasta que se vuelva a seleccionar para armar otra ruta.';
	const dialogCancel = `¿Desea anular el pedido #${this.orderSelected.number}?`;
	const subtextCancel =
		'Recuerda que al anular el pedido, este no se mostrará en el listado ya que en esta pantalla solo se muestran los pedidos pendientes de entrega disponibles para armar una ruta o que ya pertenecen a una.';
	this.dialogCode = code;
	this.dialogBtn = code === 'quit' ? 'Liberar' : 'Anular';
	this.dialogMessage = code === 'quit' ? dialogQuit : dialogCancel;
	this.dialogSubtext = code === 'quit' ? subtextQuit : subtextCancel;
	this.dialog = true;
}

async function quitRegister() {
	const routeId = this.orderSelected.routeId;
	try {
		await this.$httpSales.post(
			`delivery-router/${routeId}/${this.orderSelected.id}/unsubscribe-order`
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

function rowIsSelected(row, fromSelected, fromCustomer) {
	if (fromSelected || fromCustomer) {
		this.ordersSelected = this.eventOnRows(this.orders, 'filter', {
			prop: 'isSelected',
			value: true,
		});
		if (this.$route.name === 'pending-orders-map') {
			if (row.customerAddress || row.deliveryJson) {
				let marker = {};
				if (this.isFlowNew) {
					const key =
						this.$route.query.from === 'pick-up-earrings'
							? 'pickUpPoint'
							: 'deliveryPoint';
					marker = this.markers.find(
						(m) =>
							m.position.lat === row.deliveryJson[key].latitude &&
							m.position.lng === row.deliveryJson[key].longitude
					);
				} else {
					marker = this.markers.find(
						(m) =>
							m.position.lat === row.customerAddress.latitude &&
							m.position.lng === row.customerAddress.longitude
					);
				}
				const icon = row.isSelected
					? '/static/img/activo.png'
					: '/static/img/desactivado.png';
				const zIndex = row.isSelected ? marker.zIndex + 1 : 1;
				this.$set(marker, 'icon', icon);
				this.$set(marker, 'zIndex', zIndex);
			}
		}
		this.validSavedData(row);
	} else {
		this.customerSelected = { ...row };
	}
}

function selectedMarker(markerData, fromCustomer, showInfoOrder) {
	if (showInfoOrder) {
		this.orders = markerData;
	} else {
		let cus = {};
		let latMarker = 0;
		let lngMarker = 0;
		if (this.markers.length > 0) {
			if (this.isTwoDrivers) {
				const { deliveryJson, position } = markerData;
				const k =
					this.$route.query.from === 'pick-up-earrings'
						? 'pickUpPoint'
						: 'deliveryPoint';
				latMarker = deliveryJson ? deliveryJson[k].latitude : position.lat;
				lngMarker = deliveryJson ? deliveryJson[k].longitude : position.lng;
				cus = this.orders.find(
					(o) =>
						o.deliveryJson[k].latitude === latMarker &&
						o.deliveryJson[k].longitude === lngMarker &&
						o.id === markerData.id
				);
			} else {
				const { position, customerAddress } = markerData;
				latMarker = customerAddress ? customerAddress.location.x : position.lat;
				lngMarker = customerAddress ? customerAddress.location.y : position.lng;
				cus = this.orders.find(
					(o) =>
						o.customerAddress &&
						o.customerAddress.latitude === latMarker &&
						o.customerAddress.longitude === lngMarker
				);
			}
			if (!fromCustomer) {
				this.$set(cus, 'isSelected', !cus.isSelected);
			}
			this.rowIsSelected(cus, true);
		}
	}
}

function setDataLine({ model, value }) {
	this.polyline[model] = value;
}

function setFilterData({ model, value, onSearch }) {
	if (!onSearch) {
		if (model === 'flagPickUp') {
			this.filterFields[model] =
				value.code === 'RCT' ? TypePickUp.PickUpStore : TypePickUp.HomeDelivery;
			this.flagPickUp = value.id;
		} else {
			this.filterFields[model] =
				model === 'outRoute' ||
				model === 'inRoute' ||
				model === 'startDate' ||
				model === 'endDate'
					? value
					: value.id;
		}
		this.setFilterInfo({ model, value });
		if (model === 'documentType') {
			if (value > 0) {
				this.filterFields.byFac = value === 1;
				this.filterFields.byBol = value === 2;
			} else {
				this.filterFields.byFac = false;
				this.filterFields.byBol = false;
			}
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
			this.loadCities(value.id);
			this.filterFields.cityId = null;
			this.filterFields.parishId = null;
		}
		if (model === 'cityId') {
			this.loadParishes(value.id);
			this.filterFields.parishId = null;
		}
	} else {
		this.onSearchInput({ model, value });
	}
}

function onInput({ model, value }) {
	this.filterFields[model] = value;
}

function setFilterInfo({ model, value }) {
	if (model === 'customerId' && value) {
		this.filterData.customerName = value.autocomplete;
	}
	if (model === 'distritId') {
		this.filterData.distritName = value ? value.name : '';
	}
	if (model === 'orderPickState') {
		this.filterData.orderPickStateName = value ? value.name : '';
	}
	if (model === 'parish') {
		this.filterData.parishName = value ? value.name : '';
	}
	if (model === 'sellerId' && value) {
		this.filterData.sellerName = value.fullname;
	}
	if (model === 'zoneId') {
		this.filterData.zoneName = value ? value.name : '';
	}
	if (model === 'transportAgencyId') {
		this.filterFields.transportAgencyId = value ? value.id : '';
	}
	if (model === 'deliveryId') {
		this.filterFields.deliveryId = value ? value.id : '';
	}
}

function showSlide(code, title, loadServices) {
	this.action.code = code;
	this.action.title = title;
	this.action.value = true;
	this.loadTransportAgency();
	this.loadDrivers();
	if (loadServices) {
		this.loadResources();
	}
}

function totalItems() {
	const ordersProducts = this.ordersSelected.reduce(
		(a, os) => a.concat(os.details),
		[]
	);
	return ordersProducts.reduce((a, op) => a + op.quantity, 0);
}

function totalOrders() {
	return this.ordersSelected.length;
}

function updateActive(code) {
	this.consolidationCode = code;
	this.typeQuantity = code === 'orders' ? 'Pedidos' : 'Items';
	this.totalQuantity = code === 'orders' ? this.totalOrders : this.totalItems;
	this.consolidationOrders = [...this.ordersSelected];
	this.consolidationProducts = this.ordersSelected.reduce(
		(a, os) => a.concat(os.details),
		[]
	);
	this.totalWeight = this.ordersSelected.reduce((acum, p) => acum + p.weight, 0);
	this.ordersConsolidation =
		code === 'orders'
			? [...this.consolidationOrders]
			: [...this.consolidationProducts];
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
		if (this.isFlowNew) {
			setLocalData(this.key, [...this.dataSelected]);
		} else {
			setLocalData('pending-orders', [...this.dataSelected]);
		}
	} else {
		this.dataSelected = [...this.ordersSelected];
		if (this.isFlowNew) {
			setLocalData(this.key, [...this.dataSelected]);
		} else {
			setLocalData('pending-orders', [...this.dataSelected]);
		}
	}
	// if (this.dataSelected.length === 1) {
	// 	this.showNotification('Para poder armar una ruta es necesario seleccionar más de un pedido.',
	// 		'info');
	// }
}

function isFlowNew() {
	return !!this.$route.query.from;
}

function buildRoute() {
	if (this.isFlowNew) {
		this.goTo('create-route-from-orders', {
			query: {
				from: this.$route.query.from,
			},
		});
	} else {
		this.goTo('create-route-from-orders');
	}
}

function getTotalStates() {
	const total = this.orderStates.map((state) => {
		const totalStates = this.orders.filter((o) => o.orderStateId === state.id);
		return {
			id: state.id,
			total: totalStates ? totalStates.length : 0,
		};
	});
	return total || [];
}

function getHeight() {
	return this.$route.name === 'pending-routes-map'
		? 'height: calc(100vh - 300px) !important'
		: 'height: calc(100vh - 360px) !important';
}

function data() {
	return {
		action: {
			code: '',
			open: false,
			title: 'Informaciòn Estado de Ordenes',
			value: false,
			width: 441,
		},
		btnHeaderLink: { name: 'pending-orders-list' },
		captionNavigation: 'Mapa de pedidos pendientes de entrega',
		center: {},
		checkAllDisabled: true,
		checkAllProducts: true,
		cities: [],
		cleanSearch: false,
		consolidationCode: 'orders',
		consolidationOrders: [],
		consolidationProducts: [],
		transportAgencies: [],
		drivers: [],
		currentPage: 1,
		customers: [],
		customerSelected: {},
		dataSelected: [],
		detailRoute: {},
		dialog: false,
		dialogBtn: '',
		dialogCode: '',
		dialogMessage: '',
		dialogSubtext: '',
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
		drawPolyline: false,
		filterData: {
			customerName: '',
			distritName: '',
			orderPickStateName: '',
			parishName: '',
			sellerName: '',
			zoneName: '',
		},
		filterFields: {
			byBol: false,
			byFac: false,
			cityId: null,
			transportAgencyId: null,
			customerId: null,
			deliveryId: null,
			documentType: 0,
			employeeId: null,
			endDate: null,
			flagPickUp: null,
			inRoute: true,
			orderStateId: null,
			orderPickState: null,
			outRoute: true,
			parishId: null,
			provinceId: null,
			search: null,
			sellerId: null,
			sortDirection: 'asc',
			sortField: 'created_at',
			startDate: null,
			zoneId: null,
			typeOrder: null,
		},
		flagPickUp: null,
		flagPolyline: true,
		lastPage: 0,
		markers: [],
		orders: [],
		ordersConsolidation: [],
		orderSelected: {},
		ordersSelected: [],
		parishes: [],
		pathLine: {},
		pickUpTypes: [],
		polyline: {
			linestring: [],
		},
		polylines: [],
		polylinesData: [],
		provinces: [],
		sellers: [],
		states: [],
		title: 'Pedidos pendientes de entrega',
		totalQuantity: 0,
		totalWeight: 0,
		typeQuantity: 'Pedidos',
		zones: [],
		zoom: 12,
		key: null,
		orderStates: [],
		totalStates: [],
	};
}

export default {
	name: 'page-pending-orders-map',
	components: {
		actionSidebar,
		consolidationSlide,
		filtersData,
		filtersSection,
		filtersSlide,
		headerPage,
		mapComponent,
		modalSidebarButton,
		orderDetailCard,
		circleMap,
		circleMapInformation,
		appActions,
	},
	computed: {
		disabledConsolidation,
		disabledCreateRoute,
		totalItems,
		totalOrders,
		isFlowNew,
		getTotalStates,
		getHeight,
	},
	created,
	data,
	methods: {
		actionCancel,
		actionSuccess,
		buildDetails,
		buildFilters,
		buildOrders,
		cleanFilters,
		closeSlide,
		drawActive,
		eventOnRows,
		expandBody,
		filterList,
		goBack,
		goToConsolidationOrder,
		isAction,
		loadCities,
		loadDrivers,
		loadTransportAgency,
		loadCustomers,
		loadOrders,
		loadParishes,
		loadResources,
		loadRouteMap,
		loadVendors,
		onClickIcon,
		onSearchInput: debounce(onSearchInput),
		onSearchLocal,
		openConfirmation,
		quitRegister,
		rowIsSelected,
		selectedMarker,
		setDataLine,
		setFilterData,
		setFilterInfo,
		showSlide,
		updateActive,
		validSavedData,
		buildRoute,
		onInput,
	},
};
</script>

<style lang="scss" scoped>
.gmap-container {
	height: calc(100vh - 221px) !important;
}

.scroll-section {
	height: calc(100vh - 380px);
	overflow: auto;
	padding-bottom: 10px;
}

.header-information-distribution {
	background-color: #fbfbfb;
	border-radius: 3px;
	padding: 7px;
}

.item-information {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, bold);
	font-size: map-get($sizes, small11);
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
.content-circles-center {
	margin-top: 5px;
	display: flex;
	justify-content: center;
	align-items: center;
}
.content-circles-information {
	margin-top: 5px;
	display: absolute;
	justify-content: center;
	align-items: center;
}
.divhelp {
	border: 1px solid rgb(178, 221, 0);
	border-radius: 20px;
	width: 40px;
	height: 40px;
	background-color: rgb(178, 221, 0);
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
