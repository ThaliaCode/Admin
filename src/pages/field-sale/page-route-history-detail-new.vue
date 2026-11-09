<template>
	<div>
		<header-page
			:caption-navigation="captionNavigation"
			column-class="xs12"
			justify-class="justify-start"
			title="Ruta del vendedor de campo"
			to-show
			:show-clean="$route.name === 'pending-orders-map'"
			:show-excel="false"
			navigation
			@navigation-back="navigationBack"
			@clean-product-filter="cleanFilters"
		>
			<v-layout row class="header-information-distribution" mr-2>
				<v-flex xs6 text-xs-center class="item-information">
					Fecha de Entrega: <br />
					<span class="num-information">{{ routeInfo.dateStart | exactDate }}</span>
				</v-flex>
				<v-flex xs6 text-xs-center class="item-information">
					Fecha de Fin: <br />
					<span class="num-information">{{ routeInfo.dateEnd | exactDate }}</span>
				</v-flex>
				<v-flex xs6 text-xs-center class="item-information">
					Vendedor: <br />
					<span class="num-information">{{
						routeInfo.employee ? routeInfo.employee.fullname : '-'
					}}</span>
				</v-flex>
			</v-layout>
		</header-page>
		<v-layout row wrap>
			<v-flex xs5>
				<!-- BUSQUEDA Y FILTROS -->
				<filters-section
					map-filters-section
					:filter-fields="filterFields"
					@show-filters="showSlide('filters', 'FILTROS')"
					@filter-list="loadOrders"
					@set-filter-data="setFilterData"
				></filters-section>

				<!-- BTNS LEYENDAS -->
				<div class="container-btn-leyends mt-2">
					<div v-for="(l, inx) in leyendsInfo" :key="inx" :class="`leyend ${l.class}`">
						<div
							@click="changePoints(l.code)"
							:class="`leyend-cant ${l.class} ${
								l.code === codeTypePoints ? 'active' : ''
							}`"
						>
							<span v-if="l.code === codeTypePoints" class="icon">
								<v-icon color="white">check_circle</v-icon>
							</span>
							<span class="text">{{ l.cant }}</span>
						</div>
						<div>
							<span :class="`leyend-label ${l.class}`">
								{{ l.label }}
							</span>
						</div>
					</div>
				</div>

				<!-- LISTADO -->
				<div :style="getHeight" class="scroll-section mt-3">
					<div v-if="!points.length">
						<p class="text-xs-center mt-4">No hay datos para mostrar</p>
					</div>
					<div v-for="(point, i) in points" :key="i">
						<route-detail-card
							class="px-4 mb-2"
							:point="point"
							:code="codeTypePoints"
							list
						/>
					</div>
				</div>
			</v-flex>
			<v-flex xs7>
				<div class="static-map">
					<!-- MAPA DE GOOGLE -->
					<div class="gmap-container">
						<gmap-map
							:center="center"
							:options="generalOptions"
							:zoom="6"
							style="width: 100%; height: 100%"
						>
							<gmap-cluster :averageCenter="true" :gridSize="160" :maxZoom="17">
								<gmap-marker
									v-for="(m, index) in markers"
									:key="index"
									:clickable="true"
									:icon="m.icon"
									:position="m.position"
									:z-index="m.zIndex"
									@click="selectedMarker(m, null, index)"
									@dragend="$emit('on-dragend', $event)"
								>
									<gmap-info-window
										:opened="showByIndex === index"
										@closeclick="closeInfo()"
									>
										<map-info-window :orderSelected="orderSelected" />
									</gmap-info-window>
								</gmap-marker>
							</gmap-cluster>
						</gmap-map>
					</div>
				</div>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<v-flex text-xs-center v-if="$route.name === 'pending-routes-map'">
				<v-btn type="button" class="btn-auto btn-return" @click="goBack"> Atras </v-btn>
			</v-flex>
			<modal-sidebar-button
				v-else
				hidden
				height="4vh"
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
			<v-flex v-show="isAction('consolidation')" xs6 text-xs-right pr-3 slot="right">
				<label class="label-header-sidebar">
					Cant. de {{ typeQuantity }}: <span>{{ totalQuantity }}</span>
				</label>
			</v-flex>
			<filters-routes-history
				v-if="isAction('consolidation')"
				:orders="ordersConsolidation"
				@on-search="onSearchLocal"
				@accept-action="closeSlide"
				@update-active="updateActive"
			></filters-routes-history>

			<!-- SLIDE DE FILTROS -->
			<filter-routes-history
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
			></filter-routes-history>
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
import jsonCountries from '@/i18n/constants/format-country.json';
import mapInfoWindow from '@/components/shared/map/map-info-window';
import GmapCluster from 'vue2-google-maps/dist/components/cluster';
import appActions from '@/components/shared/app-actions';
import circleMap from '@/components/shared/circle-map';
import circleMapInformation from '@/components/shared/circle-map-information';
import actionSidebar from '@/components/shared/action-sidebar';
import filtersData from '@/components/orders/filters-data';
import filtersSection from '@/components/orders/filters-section';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import mapComponent from '@/components/shared/map/map-component';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import TypePickUp from '@/shared/type-pick-up';
import typeOrder from '@/shared/type-order';
import typeRouteTwoDriver from '@/shared/type-route-two-driver';
import consolidationSlide from '@/components/orders/consolidation-slide';
import filterRoutesHistory from './filter-routes-history';
import routeDetailCard from './route-detail-card';

const { debounce, getLocalData, removeLocalData, setLocalData, formatDate } = helper;
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
	this.loadCheckIns();
	this.loadOrders();
	this.formatCountry = this.jsonCountries[this.$userInfo.company.country.countryCode];
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
	this.$set(row, 'showBody', !row.showBody);
}

function filterList() {
	const disabledValidate = this.filterFields.startDate && !this.filterFields.endDate;
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
	({ data: this.transportAgencies } = await this.$httpSales.get('transport-agency', {
		params,
	}));
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
			this.markers = this.detailRoute.orders.map((p) => {
				const newRow = {};
				newRow.position = {
					lng: p.customerAddress.longitude,
					lat: p.customerAddress.latitude,
				};
				newRow.icon =
					p.orderState.code === 'GIVEN'
						? '/static/img/activo.png'
						: '/static/img/pendiente.png';
				newRow.zIndex = 999999;
				newRow.id = p.id;
				return newRow;
			});
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

		const points = newPoints.length ? newPoints : [this.formatCountry.geoposition];

		this.center = this.calculateCenter(points);
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

async function loadCheckIns() {
	try {
		const params = {
			relationAdd: 'detailsCheckInn,employee,routeZonesCustomers',
		};
		const { data: checkInInfo } = await this.$httpSales.get(
			`routers-history/${this.routeHistoryId}`,
			{ params }
		);

		this.dataPointsByType.checkInInfo = { ...checkInInfo };
		if (!checkInInfo.checkInn.length) {
			return;
		}
		const { employee, checkInn, route } = checkInInfo;
		const checkInnIds = new Set(checkInn.map((item) => item.customerAddressId));
		let pointsNotVisited = [];
		if (route.zonesCustomers) {
			pointsNotVisited = route.zonesCustomers.filter(
				(item) => !checkInnIds.has(item.customersAddressId)
			);
		}
		this.pointsNotVisited = pointsNotVisited.map((item) => ({ ...item, employee }));
		// SETEAR NUMERO DE PEDIDOS
		this.leyendsInfo[0].cant = checkInn.filter((i) => i.orders).length;
		this.leyendsInfo[1].cant = checkInn.filter((i) => !i.orders).length;
		this.leyendsInfo[2].cant = checkInn.length;
		this.leyendsInfo[3].cant = this.pointsNotVisited.length;
		this.changePoints('check-in');
	} catch (error) {
		this.showGenericError();
	}
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
		this.orderSelected = this.ordersSelected[0];
		// if (this.$route.name === 'pending-orders-map') {
		// 	if (row.customerAddress || row.deliveryJson) {
		// 		let marker = {};
		// 		if (this.isFlowNew) {
		// 			const key = this.$route.query.from === 'pick-up-earrings' ?
		// 'pickUpPoint' : 'deliveryPoint';
		// 			marker = this.markers.find(m => m.position.lat ===
		//  row.deliveryJson[key].latitude
		// 				&& m.position.lng === row.deliveryJson[key].longitude);
		// 		} else {
		// 			marker = this.markers.find(m => m.position.lat === row.customerAddress.latitude
		// 				&& m.position.lng === row.customerAddress.longitude);
		// 		}
		// 		const icon = row.isSelected ? '/static/img/activo.png' : '/static/img/desactivado.png';
		// 		const zIndex = row.isSelected ? marker.zIndex + 1 : 1;
		// 		this.$set(marker, 'icon', icon);
		// 		this.$set(marker, 'zIndex', zIndex);
		// 	}
		// }
		this.validSavedData(row);
	} else {
		this.customerSelected = { ...row };
	}
}

function selectedMarker(markerData, fromCustomer) {
	let cus = {};
	let latMarker = 0;
	let lngMarker = 0;
	const index = this.markers.findIndex(
		(marker) =>
			marker.position.lat === markerData.position.lat &&
			marker.position.lng === markerData.position.lng
	);
	this.showByIndex = index;
	this.orders = this.orders.map((o) => ({
		...o,
		isSelected: false,
	}));
	if (this.markers.length > 0) {
		if (this.isTwoDrivers) {
			const { deliveryJson, position } = markerData;
			const k =
				this.$route.query.from === 'pick-up-earrings' ? 'pickUpPoint' : 'deliveryPoint';
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
		if (cus && !fromCustomer) {
			this.$set(cus, 'isSelected', !cus.isSelected);
		}
		if (cus) {
			this.rowIsSelected(cus, true);
		} else {
			this.orderSelected = this.points[index];
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
	const ordersProducts = this.ordersSelected.reduce((a, os) => a.concat(os.details), []);
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
	this.ordersConsolidation =
		code === 'orders' ? [...this.consolidationOrders] : [...this.consolidationProducts];
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
	if (this.dataSelected.length === 1) {
		this.showNotification(
			'Para poder armar una ruta es necesario seleccionar más de un pedido.',
			'info'
		);
	}
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
		jsonCountries,
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
		// title: 'Pedidos pendientes de entrega',
		totalQuantity: 0,
		typeQuantity: 'Pedidos',
		zones: [],
		zoom: 12,
		key: null,
		orderStates: [],
		totalStates: [],
		// ------------------------------------
		routeHistoryId: this.$route.params.id || null,
		codeTypePoints: '',
		leyendsInfo: [
			{
				cant: 0,
				label: 'Pedidos',
				color: 'color(success)',
				code: 'order',
				class: 'order',
			},
			{
				cant: 0,
				label: 'Check-in',
				color: '#FF7D36',
				code: 'check-in',
				class: 'check-in',
			},

			{
				cant: 0,
				label: 'Total',
				color: 'color(primary)',
				class: 'total',
				icon: 'check_circle',
				code: 'total',
			},
			{
				cant: 0,
				label: 'No visitados',
				color: 'red',
				class: 'not-visited',
				code: 'not-visited',
			},
		],
		dataPointsByType: {
			checkInInfo: {},
			ordersInfo: {},
			notVisitedInfo: {},
			allInfo: {},
		},
		points: [],
		routeInfo: {},
		// MAPA DE GOOGLE
		generalOptions: {
			zoomControl: true,
			mapTypeControl: false,
			fullscreenControl: false,
		},
		showByIndex: null,
		pointsNotVisited: [],
		formatCountry: {},
	};
}

export default {
	name: 'page-route-history-detail',
	components: {
		actionSidebar,
		consolidationSlide,
		filtersData,
		filtersSection,
		filterRoutesHistory,
		headerPage,
		mapComponent,
		modalSidebarButton,
		routeDetailCard,
		circleMap,
		circleMapInformation,
		appActions,
		mapInfoWindow,
		GmapCluster,
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
		calculateCenter,
		// ---------------
		loadCheckIns,
		getPointsByCheckIn(obj = {}) {
			try {
				const onlyOrders = obj.type === 'onlyOrders';
				const onlyTotal = obj.type === 'onlyTotal';
				const onlyNotVisited = obj.type === 'onlyNotVisited';
				const info = this.dataPointsByType.checkInInfo;

				const { employee, checkInn, route } = info;
				const newCheckInn = checkInn.map((item) => ({ ...item, employee }));
				let points = [];
				if (onlyOrders) {
					points = newCheckInn.filter((p) => p.orders);
				} else if (onlyNotVisited) {
					points = this.pointsNotVisited;
				} else if (onlyTotal) {
					points = newCheckInn;
				} else {
					points = newCheckInn.filter((p) => !p.orderId);
				}

				let markers;
				if (onlyTotal) {
					markers = points
						.filter((p) => p.customerAddress && p.customerAddress.latitude)
						.map(({ customerAddress, orderId }) => ({
						position: {
							lat: Number(customerAddress.latitude),
							lng: Number(customerAddress.longitude),
						},
						icon: orderId
							? '/static/img/activo.png'
							: '/static/img/icons-map/point-map-orange.png',
						zIndex: 999999,
					}));
				} else if (onlyNotVisited) {
					markers = points
						.filter((p) => p.customersAddress && p.customersAddress.latitude)
						.map(({ customersAddress }) => ({
						position: {
							lat: Number(customersAddress.latitude),
							lng: Number(customersAddress.longitude),
						},
						icon: null,
						zIndex: 999999,
					}));
				} else {
					const icon = onlyOrders
						? '/static/img/activo.png'
						: '/static/img/icons-map/point-map-orange.png';
					markers = points
						.filter((p) => p.customerAddress && p.customerAddress.latitude)
						.map(({ orderId, customerAddress }) => ({
						position: {
							lat: Number(customerAddress.latitude),
							lng: Number(customerAddress.longitude),
						},
						icon,
						zIndex: 999999,
						orderId: orderId || undefined,
					}));
				}
				const routeInfo = {
					dateStart: route.dateStart,
					dateEnd: route.dateEnd,
					employee: {
						fullname: employee.fullname,
					},
				};

				const pointsMap = markers.map(({ position }) => ({ ...position }));

				const coords = pointsMap.length ? pointsMap : [this.formatCountry.geoposition];

				const center = this.calculateCenter(coords);
				return {
					points,
					markers,
					center,
					routeInfo,
				};
			} catch (error) {
				console.error(error);
				return { points: [], markers: [], center: this.formatCountry.geoposition, routeInfo: {} };
			}
		},
		changePoints(code) {
			this.codeTypePoints = code || 'check-in';

			const typeMap = {
				order: 'onlyOrders',
				total: 'onlyTotal',
				'not-visited': 'onlyNotVisited',
			};

			const params = typeMap[code] ? { type: typeMap[code] } : {};
			const { points, markers, center, routeInfo } = this.getPointsByCheckIn(params);
			this.points = points;
			this.markers = markers;
			this.center = center;
			this.routeInfo = routeInfo;

			if (this.points.length) {
				this.points = this.points.map((p) => {
					const dateSimple = p.createdAt
						? formatDate(p.createdAt, 'YYYY-MM-DD HH:mm:ss')
						: null;
					return { ...p, dateSimple };
				});
			}
		},
		closeInfo() {
			this.showByIndex = null;
			this.orders = this.orders.map((o) => ({
				...o,
				isSelected: false,
			}));
		},
		navigationBack() {
			const params = {
				id: this.$route.params.routeHistoryId,
			};
			this.$router.push({ name: 'route-history', params });
		},
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

.container-btn-leyends {
	display: flex;
	flex-direction: row;
	padding: 0 10px;
	flex-wrap: wrap;
	@mixin leyend-style($color) {
		color: $color;
		border: 2px solid $color;
	}
	@mixin leyend-style-active($color) {
		color: white;
		border: 2px solid $color;
		background-color: $color;
		transform: scale(1.1);
	}

	.leyend {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		align-items: center;
		transition: 0.1s;
		text-align: center;

		&:hover {
			transform: scale(1.05);
			transition: 0.1s;
		}

		.leyend-cant {
			cursor: pointer;
			padding: 4px 0;
			margin-bottom: 10px;
			background-color: white;
			border-radius: 5px;
			width: 70px;
			position: relative;

			.text {
				font-size: 1.2rem;
			}

			.icon {
				font-size: 1rem;
				position: absolute;
				top: 50%;
				left: 20%;
				transform: translate(-50%, -50%);
			}

			&.order {
				@include leyend-style(color(success));
				&.active {
					@include leyend-style-active(color(success));
				}
			}
			&.check-in {
				@include leyend-style(#ff7d36);
				&.active {
					@include leyend-style-active(#ff7d36);
				}
			}
			&.not-visited {
				@include leyend-style(red);
				&.active {
					@include leyend-style-active(red);
				}
			}
			&.total {
				@include leyend-style(color(primary));
				&.active {
					@include leyend-style-active(color(primary));
				}
			}
		}

		.leyend-label {
			&.order {
				color: color(success);
			}

			&.check-in {
				color: #ff7d36;
			}

			&.not-visited {
				color: red;
			}

			&.total {
				color: color(primary);
			}
		}
	}
}

// Mixin para reutilizar estilos comunes
</style>
