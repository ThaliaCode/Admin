<template>
	<div>
		<header-page
			caption-navigation="Rutas de distribución"
			column-class="xs12"
			justify-class="justify-start"
			:title="title"
			to-show
			:show-clean="false"
			:show-excel="false"
		>
			<v-flex xs2>
				<p class="ma-0 label-lg">Monto Total:</p>
				<span class="value-lg">{{ totalAmount | round }}</span>
			</v-flex>
			<v-flex xs2>
				<p class="ma-0 label-lg">Peso Total:</p>
				<span class="value-lg">{{ totalWeight | round }}</span>
			</v-flex>
			<v-flex xs5>
				<v-layout row wrap>
					<v-flex xs12 class="data-container">
						<label class="label-xs">Cant. Items:</label>
						<span class="value-xs">{{ totalItems }}</span>
					</v-flex>
					<v-flex xs12>
						<tab-buttons small :tabs="tabs" @change-tab="changeTab"></tab-buttons>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs1 v-if="!!id">
				<v-tooltip top>
					<v-btn
						class="btn-auto px-3 py-2 ma-0"
						flat
						icon
						slot="activator"
						@click="downloadReport"
					>
						<v-icon color="primary">print</v-icon>
					</v-btn>
					<span>Descargar Reporte de {{ labelReport }}</span>
				</v-tooltip>
			</v-flex>
		</header-page>
		<distribution-config
			:couriers="couriers"
			:disabled="!!id"
			:distribution="distribution"
			:transports-agency="transportsAgency"
			:vehicles="vehicles"
			:is-new-flow="isFlowNew"
			:drivers="drivers"
			@set-data="setData"
		></distribution-config>
		<tabs-table
			class="pt-4 pb-5 mb-5"
			:check-all="checkAll"
			:clean-search="cleanSearch"
			:columns="columns"
			:disbaled="!!id"
			:rows="rows"
			:selectable="selectable"
			@change-warehouse="onChangeWarehouse"
			@on-search="onSearchLocal"
			@on-selected-all="onSelectedAll"
			@row-is-selected="rowIsSelected"
			@set-order="setOrder"
			@remove-order="openRemoveConfirmation"
		></tabs-table>
		<v-dialog v-model="dialog" persistent max-width="515">
			<v-card>
				<v-card-title class="headline">{{ dialogText }}</v-card-title>
				<v-card-text class="subtext">
					{{ dialogSubtext }}
				</v-card-text>
				<v-flex xs12 pl-5 v-if="flagOrders && !back && !orderToRemove" text-xs-center>
					<v-checkbox
						class="pt-3"
						hide-details
						label="Desea generar un guía de remisión agrupada"
						color="primary"
						v-model="distribution.flagGroupOrder"
					></v-checkbox>
				</v-flex>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								:color="colorCancel"
								class="btn-action btn-auto white--text pa-2"
								@click.native="actionCancel"
							>
								{{ btnCancel }}
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								:disabled="isLoading"
								:color="colorSuccess"
								class="btn-action btn-auto py-2 px-4 white--text"
								@click.native="actionSuccess"
							>
								{{ btnSuccess }}
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-flex xs12 class="px-5 pb-3" v-if="rowsOrders.length <= 1">
			<v-alert
				:value="true"
				type="warning"
				outline
			>
				No se puede crear una ruta con un solo pedido.
			</v-alert>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:hidden="!!id"
				:img="false"
				:is-loading="disabled || showDisabled"
				cancel-color="primary"
				cancel-text="Atrás"
				outline-btn
				padding-cancel="px-5 py-2"
				padding-success="px-5 py-2"
				success-color="primary"
				:success-text="successText"
				@accept-button-clicked="openConfirmation(!!id)"
				@cancel-button-clicked="openConfirmation(true)"
			>
				<v-btn
					color="primary"
					v-if="!!id"
					class="btn-action white--text px-5 py-2"
					@click="goToDetailDistribution(!!id)"
				>
					Ir a la ruta
				</v-btn>
			</modal-sidebar-button>
		</section>
		<app-show-dialog
			:color-dialog="notification.colorDialog"
			:color-hex="notification.colorHex"
			:show-modal-init="notification.show"
			:text-content="notification.text"
			:title-header="notification.title"
			@close-dialog="closeNotification"
		/>
	</div>
</template>

<script>
import { required, requiredIf, minValue } from 'vuelidate/lib/validators';
import appShowDialog from '@/components/shared/app-show-dialog';
import distributionConfig from '@/components/orders/distribution-config';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import tabButtons from '@/components/orders/tab-buttons';
import tabsTable from '@/components/orders/tabs-table';
import typeRouteTwoDriver from '@/shared/type-route-two-driver';

const {
	debounce,
	exactDate,
	removeLocalData,
	getLocalData,
	setLocalData,
	generateBlob,
	showDownloadDialog,
} = helper;

function created() {
	if (this.isFlowNew) {
		this.key =
			this.$route.query.from === 'pick-up-earrings'
				? 'pending-orders-pick-up'
				: 'pending-orders-deliver';
		const value =
			this.$route.query.from === 'pick-up-earrings' ? 'pickUpPoint' : 'deliveryPoint';
		this.columns[2].name =
			this.$route.query.from === 'pick-up-earrings'
				? 'Dirección de Comercio'
				: 'Dirección de Entrega';
		this.columns[2].value = value;
		this.columns[1].name = 'Comercio';
		this.loadData(getLocalData(this.key));
	} else {
		this.loadData(getLocalData('pending-orders'));
	}
	this.columns[2].name = this.isEcuador ? 'Parroquia' : 'Distrito';
}

function acceptAction() {
	this.showNotification(
		'Los datos han sido guardados correctamente y serán enviados al armar la ruta.'
	);
	this.closeSlide();
}

function actionCancel() {
	this.dialog = false;
	this.dialogText = '';
	this.dialogSubtext = '';
	this.distribution.flagGroupOrder = false;
	this.orderToRemove = null;
}

function actionSuccess() {
	if (this.orderToRemove) {
		this.removeOrder(this.orderToRemove);
		this.actionCancel();
	} else if (this.back) {
		this.backToList();
	} else {
		this.createDistributionRoute();
	}
}

function setOrder({ value }, row) {
	const index = this.rowsOrders.findIndex((p) => p.id === row.id);
	const validRow = this.rowsOrders.some((p) => p.order === Number(value));
	if (validRow) {
		this.notification = {
			title: 'El orden ya se encuentra asignado',
			text: 'Cambiar el nùmero de orden, para poder generar la ruta.',
			show: true,
			colorDialog: 'error',
			colorHex: '#D5331A',
		};
	}
	this.showDisabled = validRow;
	if (index > -1) {
		this.rowsOrders[index].order = Number(value);
	}
}

function backToList() {
	if (this.isFlowNew) {
		removeLocalData(this.key);
		this.goTo(this.routeFrom, {
			query: {
				from: this.$route.query.from,
			},
		});
	} else {
		removeLocalData('pending-orders');
		this.goTo(this.routeFrom);
	}
}

function buildBody() {
	const {
		name,
		date,
		hour,
		responsibleUserId,
		vehicleId,
		typeDistributor,
		deliveryId,
		flagGroupOrder,
	} = this.distribution;
	const filterRowOrder = this.rowsOrders.sort((a, b) => a.order - b.order);
	const body = {
		name,
		flagGroup: flagGroupOrder,
		dateStart: date,
		distance: this.distance || 0,
		hour,
		deliveryId,
		flagActive: true,
		linestring: [...this.linestring],
		orders: filterRowOrder.map((ro) => ({
			id: ro.id,
			flagGuides: Number(ro.isSelected),
			details: ro.details.map((d) => ({
				detailId: d.id,
				quantity: d.quantity,
			})),
		})),
		subsidiaryId: this.$userInfo.comSubsidiariesId,
		typeDistributor,
	};
	if (body.typeDistributor === 1) {
		if (this.isFlowNew) {
			body.deliveryId = deliveryId;
		}
	} else {
		body.responsibleUserId = responsibleUserId;
		body.vehicleId = vehicleId;
	}
	body.flagPickUpShip =
		this.$route.query.from === 'pick-up-earrings'
			? typeRouteTwoDriver.PickUpPoint
			: typeRouteTwoDriver.DeliveryPoint;
	return body;
}

function changeColumnsProps(code) {
	if (code === 'products') {
		const index = this.columns.findIndex((c) => c.id === 8);
		if (index > -1) {
			this.columns.splice(index, 1);
		}
		const indexDirection = this.columns.findIndex((c) => c.id === 9);
		if (indexDirection > -1) {
			this.columns.splice(index, 1);
		}
		const indexOrder = this.columns.findIndex((c) => c.id === 10);
		if (indexDirection > -1) {
			this.columns.splice(indexOrder, 1);
		}
		const indexAction = this.columns.findIndex((c) => c.id === 12);
		if (indexAction > -1) {
			this.columns.splice(indexAction, 1);
		}
	} else {
		const columns = this.columnsDefault;
		const index = columns.findIndex((c) => c.id === 7);
		if (index > -1) {
			columns.splice(index, 1);
		}
		this.columns = columns;
		// this.columns.push({
		// 	id: 7,
		// 	name: 'Teléfono',
		// 	value: 'customerPhone',
		// 	checked: true,
		// 	visible: true,
		// }, {
		// 	id: 8,
		// 	name: 'Dirección',
		// 	value: 'addressCustomer',
		// 	checked: true,
		// 	visible: true,
		// }, {
		// 	id: 9,
		// 	name: 'Orden',
		// 	value: 'order',
		// 	checked: true,
		// 	visible: true,
		// }, {
		// 	id: 10,
		// 	name: 'Peso',
		// 	value: 'weight',
		// 	checked: true,
		// 	visible: true,
		// });
	}
	const nameColumn = this.isTwoDrivers ? 'Dirección' : 'Parroquia';
	const value =
		this.$route.query.from === 'pick-up-earrings' ? 'pickUpPoint' : 'deliveryPoint';
	const valueColum = this.isTwoDrivers ? value : 'parishName';
	return this.columns.map((c) => {
		const newColumn = { ...c };
		if (c.id === 2) {
			newColumn.name = code === 'orders' ? 'Cliente' : 'Código';
			newColumn.value = code === 'orders' ? 'customerName' : 'productCode';
		} else if (c.id === 3) {
			newColumn.name = code === 'orders' ? nameColumn : 'Almacén';
			newColumn.value = code === 'orders' ? valueColum : 'warehouseName';
		} else if (c.id === 4) {
			newColumn.name = code === 'orders' ? 'Cant. Items' : 'Unidad';
			newColumn.value = code === 'orders' ? 'quantityProducts' : 'unitName';
		} else if (c.id === 5) {
			newColumn.name = code === 'orders' ? 'Monto' : 'Cantidad';
			newColumn.value = code === 'orders' ? 'total' : 'quantity';
		}
		return newColumn;
	});
}

function changeRows() {
	this.rows = this.tabCode === 'orders' ? [...this.rowsOrders] : [...this.rowsProducts];
}

function changeTab(code) {
	this.tabs = this.tabs.map((t) => {
		const newTab = { ...t };
		newTab.active = t.code === code;
		return newTab;
	});
	this.tabCode = code;
	this.columns = this.changeColumnsProps(code);
	this.changeRows();
}

function closeNotification() {
	this.notification.show = false;
	this.notification.colorDialog = '';
	this.notification.colorText = '';
	this.notification.text = '';
	this.notification.title = '';
}

async function createDistributionRoute() {
	this.isLoading = true;
	const body = this.buildBody();
	try {
		({ data: this.route } = await this.$httpSales.post('delivery-router', body));
		this.showNotification('La ruta de distribución ha sido creada correctamente.');
		helper.removeLocalData('pending-orders');
		this.actionCancel();
		if (this.isFlowNew) {
			this.goTo('create-route-from-orders', {
				params: { id: this.route.id },
				query: {
					from: this.$route.query.from,
				},
			});
		} else {
			this.goTo('create-route-from-orders', { params: { id: this.route.id } });
		}
		this.flagOrders = null;
	} catch (err) {
		if (err.data.statusCode === 400) {
			this.showGenericError(err.data.messageError);
		} else {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}

async function downloadReport() {
	this.isLoading = true;
	const typeReport = this.tabCode === 'orders' ? 'order' : 'product';
	const downloadDialog = this.$userInfo.company.settings.downloadSale;
	const body = { code: `route-${this.tabCode}-pdf` };
	const responseType = 'blob';
	const contentType = downloadDialog ? 'application/pdf' : 'text/html';
	try {
		const {
			data: response,
		} = await this.$httpReportSales.post(
			`router/${this.id}/pdf?typeReport=${typeReport}`,
			body,
			{ responseType }
		);
		const blob = generateBlob(response, contentType);
		this.showNotification(
			`El reporte de ${this.labelReport} ha sido descargado correctamente.`
		);
		showDownloadDialog(blob, `reporte-de-${this.labelReport}`, downloadDialog);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'ROUTER_NOT_EXIST') {
				this.showGenericError('La ruta no existe.');
			}
		}
	} finally {
		this.isLoading = false;
	}
}

function disabled() {
	return this.isLoading || (this.$v.$invalid && !this.id) || this.rowsOrders.length <= 1;
}

async function getDistance() {
	if (
		!this.destinations ||
		this.destinations.trim() === '' ||
		this.destinations.includes('null') ||
		this.destinations.includes('undefined') ||
		this.origins.includes('null') ||
		this.origins.includes('undefined') ||
		this.origins.trim() === '' ||
		!this.origins
	) {
		this.distance = 0;
		this.showGenericError(
			'Error en cálculo de distancia, los pedidos continenen coordenadas inválidos. Verifique los pedidos seleccionados.'
		);
		return;
	}

	this.isLoading = true;
	const body = {
		destinations: this.destinations,
		key: process.env.GOOGLE_MAP_KEY,
		origins: this.origins,
		units: 'metric',
		uri: '/distancematrix/json',
	};
	try {
		const { data: response } = await this.$httpSales.post('api-maps', body);
		if (response.rows) {
			if (response.rows[0]) {
				if (response.rows[0].elements) {
					if (response.rows[0].elements[0]) {
						const d = response.rows[0].elements[0].distance.text;
						const dSplit = d.split(' ');
						const dVal = dSplit[0];
						this.distance = parseFloat(dVal.replace(',', '.').replace(' ', ''));
					} else {
						this.distance = 0;
					}
				} else {
					this.distance = 0;
				}
			} else {
				this.distance = 0;
			}
		} else {
			this.distance = 0;
		}
	} catch (err) {
		this.showGenericError();
	} finally {
		this.isLoading = false;
	}
}

function labelReport() {
	return this.tabCode === 'orders' ? 'pedidos' : 'productos';
}

async function loadCouriers(value, withId) {
	const url = withId ? `courier/${value}` : 'courier';
	const params = {};
	if (!withId) {
		const searchTrim = value ? value.trim() : null;
		params.search = searchTrim;
	}
	const { data: couriers } = await this.$httpSales.get(url, { params });
	this.couriers = withId ? [{ ...couriers }] : [...couriers];
	this.distribution.responsibleUserId = value;
}

function loadData(pendingOrders) {
	this.rowsOrders = pendingOrders.map((order, index) => {
		const newOrder = { ...order };
		newOrder.quantityProducts = order.details.reduce((a, d) => a + d.quantity, 0);
		newOrder.isSelected = false;
		newOrder.order = index + 1;
		return newOrder;
	});
	this.rowsProducts = this.rowsOrders.reduce((a, ro) => {
		const newDetails = ro.details.map((d) => {
			const newDetail = { ...d };
			newDetail.customerPhone = ro.customer ? ro.customer.phone : '--';
			newDetail.number = ro.number;
			newDetail.total = ro.total;
			newDetail.warehouseName = ro.warehouseName;
			newDetail.warehouses = [];
			return newDetail;
		});
		return a.concat(newDetails);
	}, []);
	this.routeFrom = getLocalData('route-from');
	// this.rows = [...this.rowsOrders];
	this.rowsOrders = this.rowsOrders.map((or) => {
		const newRo = { ...or };
		newRo.stock = or.details.reduce((sum, item) => sum + item.stock, 0);
		newRo.employeeName = or.employee ? or.employee.fullname : '--';
		newRo.customerName = or.customer ? or.customer.name || or.customer.rzSocial : '--';
		newRo.parishName =
			or.customerAddress && or.customerAddress.parish
				? or.customerAddress.parish.name
				: '--';
		newRo.customerPhone = or.customer ? or.customer.phone : '--';
		newRo.addressCustomer = or.customerAddress ? or.customerAddress.addressLine1 : '--';
		return newRo;
	});
	this.rows = [...this.rowsOrders];
	this.calculateMapCoordinates();
	this.loadDistributionTypes();
	this.loadWarehouses();
	this.getDistance();
	this.loadDrivers();
	this.loadAgency();
	this.columnsDefault = [...this.columns];
	if (this.id) {
		this.loadDetail();
	}
}

async function loadDetail() {
	({ data: this.route } = await this.$httpSales.get(`delivery-router/${this.id}`));
	const {
		name,
		dateStart,
		hour,
		typeDistributor,
		responsibleUserId,
		vehicleId,
	} = this.route;
	this.distribution = {
		name,
		date: exactDate(dateStart, 'YYYY-MM-DD'),
		hour,
		typeDistributor,
	};
	if (!this.id && this.id && responsibleUserId && vehicleId) {
		this.loadCouriers(responsibleUserId, true);
		this.loadVehicles(vehicleId, true);
	}
}

async function loadDistributionTypes() {
	({ data: this.distributionTypes } = await this.$httpSales.get(
		'group/typeDistributionRoute/table'
	));
}

async function loadVehicles(value, withId) {
	const url = withId ? `vehicles/${value}` : 'vehicles';
	const params = {};
	if (!withId) {
		const searchTrim = value ? value.trim() : null;
		params.search = searchTrim;
	}
	const { data: vehicles } = await this.$httpSales.get(url, { params });
	this.vehicles = withId ? [{ ...vehicles }] : [...vehicles];
	this.distribution.vehicleId = value;
}

async function loadWarehouses() {
	const body = { ids: this.rowsProducts.map((rp) => rp.productId) };
	({ data: this.warehouses } = await this.$httpProducts.post(
		'products/by-warehouses-products',
		body
	));
	if (this.warehouses) {
		const keysWarehouses = Object.keys(this.warehouses);
		this.rowsProducts = this.rowsProducts.map((rp) => {
			const newRp = { ...rp };
			const rowId = keysWarehouses.find((k) => Number(k) === rp.productId);
			newRp.warehouses = this.warehouses[rowId];
			return newRp;
		});
	}
}

function onChangeWarehouse({ dataChange, row }) {
	const { model, value } = dataChange;
	this.$set(row, model, value);
}

function onSearchInput({ model, value }) {
	if (value) {
		if (model === 'responsibleUserId' && this.responsibleName !== value) {
			this.loadCouriers(value);
		}
		if (model === 'vehicleId' && this.vehicleName !== value) {
			this.loadVehicles(value);
		}
	}
}

function onSearchLocal(search) {
	const searchTrim = search ? search.trim() : null;
	const completeRegisters =
		this.tabCode === 'orders' ? [...this.rowsOrders] : [...this.rowsProducts];
	if (searchTrim) {
		this.rows = completeRegisters.filter((row) => {
			if (this.tabCode === 'orders') {
				return (
					row.number
						.toString()
						.toLowerCase()
						.indexOf(searchTrim) > -1 ||
					row.customerName.toLowerCase().indexOf(searchTrim) > -1 ||
					row.parishName.toLowerCase().indexOf(searchTrim) > -1 ||
					row.quantityProducts
						.toString()
						.toLowerCase()
						.indexOf(searchTrim) > -1 ||
					row.total
						.toString()
						.toLowerCase()
						.indexOf(searchTrim) > -1
				);
			}
			return (
				row.number
					.toString()
					.toLowerCase()
					.indexOf(searchTrim) > -1 ||
				row.productCode.toLowerCase().indexOf(searchTrim) > -1 ||
				row.productName.toLowerCase().indexOf(searchTrim) > -1 ||
				row.warehouseName.toLowerCase().indexOf(searchTrim) > -1 ||
				row.unitName.toLowerCase().indexOf(searchTrim) > -1 ||
				row.quantity
					.toString()
					.toLowerCase()
					.indexOf(searchTrim) > -1 ||
				row.stock
					.toString()
					.toLowerCase()
					.indexOf(searchTrim) > -1
			);
		});
	} else {
		this.rows = [...completeRegisters];
	}
}

function onSelectedAll(checked) {
	this.checkAll = checked;
	this.rowsOrders = this.rowsOrders.map((ro) => {
		const newRowOrder = { ...ro };
		newRowOrder.isSelected = checked;
		return newRowOrder;
	});
	if (this.tabCode === 'orders') {
		this.rows = [...this.rowsOrders];
	}
	const rowsOrder = this.rows.filter((rowOrder) => rowOrder.isSelected);
	this.flagOrders = rowsOrder.length >= 2;
}

function rowIsSelected() {
	this.checkAll = this.rows.every((ro) => ro.isSelected);
	const rowsOrder = this.rows.filter((rowOrder) => rowOrder.isSelected);
	this.flagOrders = rowsOrder.length >= 2;
}

function openConfirmation(back = false) {
	const text = '¿Deseas crear la ruta de distribución con la configuración realizada?';
	const textBack = '¿Deseas salir de la pantalla actual?';
	const subtext =
		'Los pedidos seleccionados se usarán para generar, de manera automática, una guia de remisión al crear la ruta de distribución con los datos ingresados.';
	const subtextBack =
		'Al salir de esta pantalla se perderá la información ingresada y volverás al listado de pedidos pendientes donde podrás realizar la selección de pedidos nuevamente.';
	this.back = back;
	this.dialogText = this.back ? textBack : text;
	this.dialogSubtext = this.back ? subtextBack : subtext;
	this.btnCancel = this.back ? 'No, quedarme' : 'Modificar datos';
	this.btnSuccess = this.back ? 'Sí, salir' : 'Crear ruta';
	this.colorCancel = this.back ? 'info' : 'error';
	this.colorSuccess = this.back ? 'error' : 'success';
	this.dialog = true;
}

function openRemoveConfirmation(row) {
	this.orderToRemove = row;
	this.dialogText = 'Quitar pedido de la ruta';
	this.dialogSubtext = '¿Estás seguro que deseas quitar este pedido de la ruta actual?';
	this.btnCancel = 'Cancelar';
	this.btnSuccess = 'Sí, quitar';
	this.colorCancel = 'info';
	this.colorSuccess = 'error';
	this.dialog = true;
}

function removeOrder(order) {
	this.rowsOrders = this.rowsOrders.filter((ro) => ro.id !== order.id);
	this.rowsProducts = this.rowsProducts.filter((rp) => rp.number !== order.number);
	this.changeRows();

	const keyToUpdate = this.isFlowNew ? this.key : 'pending-orders';
	const pendingOrdersRaw = getLocalData(keyToUpdate) || [];
	const updatedPendingOrders = pendingOrdersRaw.filter((o) => o.id !== order.id);
	setLocalData(keyToUpdate, updatedPendingOrders);

	this.calculateMapCoordinates();
}

function calculateMapCoordinates() {
	if (this.rowsOrders.length === 0) {
		this.linestring = [];
		this.origins = '';
		this.destinations = '';
		this.distance = 0;
		return;
	}

	if (this.isFlowNew) {
		const keyMap =
			this.$route.query.from === 'pick-up-earrings' ? 'pickUpPoint' : 'deliveryPoint';
		this.linestring = this.rowsOrders.map((ro) => ({
			lat: ro.deliveryJson[keyMap].latitude,
			lng: ro.deliveryJson[keyMap].longitude,
		}));
	} else {
		this.linestring = this.rowsOrders.map((ro) => {
			let finalAdd = {};
			if (ro.customerAddressId != null) {
				finalAdd = ro.customerAddress
					? {
							lat: ro.customerAddress.latitude,
							lng: ro.customerAddress.longitude,
					  }
					: {};
			} else if (ro.deliveryJson != null) {
				finalAdd =
					{ lat: ro.deliveryJson.latitude, lng: ro.deliveryJson.longitude } || {};
			}
			return finalAdd;
		});
	}

	if (this.linestring.length > 0) {
		this.origins = `${this.linestring[0].lat},${this.linestring[0].lng}`;
		const newLinestring = [...this.linestring];
		newLinestring.splice(0, 1);
		this.destinations = newLinestring.reduce((a, line) => {
			const newLine = `${line.lat},${line.lng}`;
			if (a) {
				return `${a}|${newLine}`;
			}
			return newLine;
		}, '');
		this.getDistance();
	}
}

function selectable() {
	return this.tabCode === 'orders' && !this.id;
}

function setData({ model, value, onSearch }) {
	if (model) {
		if (!onSearch) {
			this.distribution[model] =
				model === 'responsibleUserId' || model === 'vehicleId' ? value.id : value;
			if (model === 'responsibleUserId' && value) {
				this.responsibleName = value.name;
				this.distribution.responsibleUserId = value;
			} else if (model === 'vehicleId' && value) {
				this.vehicleName = value.plate;
			}
		} else {
			this.onSearchInput({ model, value });
		}
	}
}

function successText() {
	return this.id ? 'Volver al listado' : 'Guardar';
}

function title() {
	return this.id ? `Ruta No ${this.id}` : this.$route.meta.title;
}

function totalAmount() {
	return this.rowsOrders.reduce((a, r) => a + r.total, 0);
}

function totalWeight() {
	return this.rowsOrders.reduce((a, r) => a + r.weight, 0);
}

function totalItems() {
	return this.tabCode === 'orders'
		? this.rowsOrders.reduce((a, r) => a + r.quantityProducts, 0)
		: this.rows.reduce((ac, ro) => ac + ro.quantity, 0);
}

function validations() {
	return {
		distribution: {
			name: { required },
			date: { required },
			typeDistributor: { required, minValue: minValue(1) },
			deliveryId: {
				required: requiredIf(
					() => this.isFlowNew || this.distribution.typeDistributor === 1
				),
			},
			responsibleUserId: {
				required: requiredIf(
					() => this.isFlowNew || this.distribution.typeDistributor === 2
				),
			},
		},
	};
}

function isFlowNew() {
	return !!this.$route.query.from;
}

async function loadDrivers() {
	try {
		const { data: response } = await this.$httpSales.get('transport-agency');
		this.transportsAgency = response;
	} catch (error) {
		this.showGenericError();
	}
}

async function loadAgency() {
	try {
		const { data: response } = await this.$httpSales.get('delivery');
		this.drivers = response;
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		back: false,
		btnCancel: '',
		btnSuccess: '',
		checkAll: false,
		cleanSearch: false,
		colorCancel: '',
		colorSuccess: '',
		columnsDefault: [],
		columns: [
			{
				id: 1,
				name: '# Pedido',
				tooltip: 'Número de Pedido',
				value: 'number',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Cliente',
				value: 'customerName',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Parroquia',
				value: 'parishName',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Cant. Items',
				value: 'quantityProducts',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Monto',
				value: 'total',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Stock Act.',
				tooltip: 'Stock Actual',
				value: 'stock',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Teléfono',
				value: 'customerPhone',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Empleado',
				value: 'employeeName',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'Dirección',
				value: 'addressCustomer',
				checked: true,
				visible: true,
			},
			{
				id: 10,
				name: 'Orden',
				value: 'order',
				checked: true,
				visible: true,
			},
			{
				id: 11,
				name: 'Peso',
				value: 'weight',
				checked: true,
				visible: true,
			},
			{
				id: 12,
				name: 'Acciones',
				value: 'actions',
				checked: true,
				visible: true,
			},
		],
		couriers: [],
		destinations: '',
		dialog: false,
		dialogSubtext: '',
		dialogText: '',
		distance: null,
		distribution: {
			flagGroupOrder: false,
			name: '',
			date: '',
			hour: '',
			typeDistributor: 1,
			responsibleUserId: null,
			vehicleId: null,
			deliveryId: null,
		},
		distributionTypes: [],
		employees: [],
		flagOrders: false,
		isLoading: false,
		linestring: [],
		notification: {
			colorDialog: 'error',
			colorHex: '#D5331A',
			colorText: 'error',
			show: false,
			text: '',
			title: '',
		},
		origins: '',
		response: null,
		responsibleName: '',
		route: {},
		routeFrom: '',
		rows: [],
		rowsOrders: [],
		rowsProducts: [],
		showDisabled: false,
		tabCode: 'orders',
		tabs: [
			{
				id: 1,
				active: true,
				code: 'orders',
				title: 'Resumen de Pedidos',
			},
			{
				id: 2,
				active: false,
				code: 'products',
				title: 'Resumen de Productos',
			},
		],
		transportsAgency: [],
		vehicleName: '',
		vehicles: [],
		warehouses: {},
		key: null,
		drivers: [],
		orderToRemove: null,
	};
}

export default {
	name: 'page-pending-orders-route-create',
	components: {
		appShowDialog,
		distributionConfig,
		headerPage,
		modalSidebarButton,
		tabButtons,
		tabsTable,
	},
	computed: {
		disabled,
		labelReport,
		selectable,
		successText,
		title,
		totalAmount,
		totalWeight,
		totalItems,
		isFlowNew,
	},
	created,
	data,
	methods: {
		acceptAction,
		actionCancel,
		actionSuccess,
		backToList,
		buildBody,
		changeColumnsProps,
		changeRows,
		changeTab,
		closeNotification,
		createDistributionRoute,
		downloadReport,
		getDistance,
		loadAgency,
		loadData,
		loadDetail,
		loadDistributionTypes,
		loadCouriers,
		loadVehicles,
		loadWarehouses,
		onChangeWarehouse,
		onSearchInput: debounce(onSearchInput),
		onSearchLocal,
		onSelectedAll,
		openConfirmation,
		rowIsSelected,
		setData,
		setOrder,
		loadDrivers,
		openRemoveConfirmation,
		removeOrder,
		calculateMapCoordinates,
		goToDetailDistribution() {
			const params = { id: this.id };
			this.goTo('detail-route-distribution', { params });
		},
	},
	props: {
		id: [Number, String],
	},
	validations,
};
</script>

<style lang="scss" scoped>
.label-xs {
	color: color(paginationText);
	font-family: font(lato-bold);
	font-size: size(small11);
}

.label-lg,
.value-xs {
	color: color(silver-footer);
	font-family: font(lato-regular);
	font-size: size(small11);
}

.label-lg {
	font-family: font(lato-bold);
	line-height: normal;
	text-transform: uppercase;
}

.value-lg {
	color: color(background-sidebar);
	font-family: font(lato-bold);
	font-size: size(medium17);
	line-height: normal;
}

.data-container {
	background-color: color(background-modal);
	border: 1px solid color(border-footer);
	border-radius: 3px;
	margin: 1px 0px;
	padding: 0.5px 10px;
}

.dialog {
	margin: 0px !important;
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
	font-size: size(small) !important;
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
</style>
