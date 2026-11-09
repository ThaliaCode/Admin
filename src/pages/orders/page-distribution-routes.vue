<template>
	<div>
		<header-page
			name="distribution-routes"
			:title="$route.meta.title"
			caption-navigation="Pedidos"
			to-show
			:show-excel="false"
			@clean-product-filter="clearFilter"
		/>
		<app-actions
			:resource-uri="$route.name"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<v-layout mt-2>
			<filters-section
				:filter-fields="params"
				:couriers="couriers"
				:vehicles="vehicles"
				:type-of-distribution="typeOfDistribution"
				:drivers="drivers"
				:states="states"
				:type-route="typeRoute"
				@set-filter-data="setFilterData"
				@filter-list="filterList"
			></filters-section>
		</v-layout>
		<v-layout mt-2>
			<v-flex xs12>
				<app-table
					name="list-route-distribution"
					:selectable="false"
					:last-page="lastPage"
					:current-page="currentPage"
					:rows="rows"
					:items-quantity="rows.length"
					:items-total-quantity="totalRoutes"
					:columns="columns"
					@on-page="changePage"
					@on-search-event="onSearchEvent"
				>
					<template slot="rows" slot-scope="props">
						<td
							v-show="showRow(columns, 1)"
							class="is-not-selectable column-one"
						>
							{{ props.row.code }}
						</td>
						<td v-show="showRow(columns, 2)">
							{{ props.row.createdAt | formatDate }}
						</td>
						<td v-show="showRow(columns, 3)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 4)">
							{{ props.row.typeDistributor === 1 ? 'Interno' : 'Externo' }}
						</td>
						<td v-show="showRow(columns, 5)">
							{{ props.row.delivery ? props.row.delivery.fullname : '-' }}
						</td>
						<td v-show="showRow(columns, 6)">
							{{
								props.row.delivery
									? props.row.delivery.documentNumber || '-'
									: '-'
							}}
						</td>
						<td v-show="showRow(columns, 7)">
							{{ props.row.delivery ? props.row.delivery.phone : '-' }}
						</td>
						<td v-show="showRow(columns, 8)">
							<v-tooltip top v-if="props.row.nameRoute">
								<img slot="activator" :src="props.row.imageRoute" />
								<span>{{ props.row.nameRoute }}</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 9)">{{ props.row.statusName }}</td>
						<td v-show="showRow(columns, 10)">{{ props.row.codeExternal }}</td>
						<td v-show="showRow(columns, 11)">{{ props.row.totalOrders }}</td>
						<td v-show="showRow(columns, 12)">{{ props.row.weight }}</td>
						<td v-show="showRow(columns, 13)">
							<v-layout wrap align-center justify-space-around>
								<app-tooltip-button
									text="Editar"
									icon="edit"
									color="primary"
									@click-icon="openEditDistribution(props.row)"
								/>
								<app-tooltip-button
									icon="remove_red_eye"
									text="Ver Detalle"
									color="success"
									@click-icon="openDetailDistribution(props.row)"
								/>
								<app-tooltip-button
									color="error"
									icon="delete"
									text="Eliminar"
									@click-icon="openConfirmDelete(props.row)"
								/>
								<app-tooltip-button
									v-if="props.row.flagPickUpShip"
									color="info"
									icon="no_transfer"
									:text="getText(props.row)"
									:disabled="disabledRoute(props.row)"
									@click-icon="openEndRoute(props.row)"
								/>
							</v-layout>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<action-sidebar
			:width="action.width"
			:code-action="action.code"
			:title="action.title"
			:active="action.title"
			v-model="action.open"
			@cancel-modal="closeModal"
		>
			<edit-distribution-routes
				:distribution="distribution"
				:couriers="couriers"
				:vehicles="vehicles"
				:drivers="drivers"
				v-if="isEditDistribution"
				@cancel-modal="closeModal"
				@set-filter-data="setEditData"
				@edit-distribution="editDistribution"
			/>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="420">
			<v-card>
				<v-card-title class="subheading">{{ dialogMessage }}</v-card-title>
				<v-card-actions class="justify-center">
					<v-btn
						class="btn-action"
						color="info"
						dark
						@click.native="closeDialog"
					>
						Cancelar
					</v-btn>
					<v-btn
						class="btn-action"
						color="error"
						dark
						@click.native="actionDialog"
					>
						{{ codeAction === 'delete' ? 'Eliminar' : 'Finalizar' }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import { differenceInDays, format } from 'date-fns';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import editDistributionRoutes from '@/components/orders/edit-distribution-routes';
import filtersSection from '@/components/distribution/filters-section';
import helper from '@/shared/helper';
import typeRouteTwoDriver from '@/shared/type-route-two-driver';
import typeStatusRoute from '@/shared/type-status-route';

const { exactDate } = helper;

function created() {
	this.columns[7].visible = this.isTwoDrivers;
	this.columns[8].visible = this.isTwoDrivers;
	this.columns[9].visible = this.isTwoDrivers;
	this.typeRoute = [
		{
			id: typeRouteTwoDriver.PickUpPoint,
			name: 'Recojo',
			image: '/static/img/pick-up-point.svg',
		},
		{
			id: typeRouteTwoDriver.DeliveryPoint,
			name: 'Entrega',
			image: '/static/img/delivery-point.svg',
		},
	];
	this.loadRoutesDistribution();
	this.loadData();
	this.columns[11].visible =
		this.$userInfo.company.settings.flagGrouper || false;
}

async function loadRoutesDistribution() {
	this.params.page = this.currentPage;
	this.params.includeDriver = true;
	if (this.isTwoDrivers) {
		this.params.includeOrdersPickUp = true;
	}
	this.params.sortField = 'created_at';
	this.params.sortDirection = 'desc';
	try {
		const response = await this.$httpSalesRead.get('delivery-router', {
			params: this.params,
		});
		this.rows = response.data.map((r) => {
			const newRow = { ...r };
			if (r.flagPickUpShip) {
				newRow.nameRoute =
					r.flagPickUpShip === typeRouteTwoDriver.PickUpPoint
						? 'Recojo'
						: 'Entrega';
				newRow.imageRoute =
					r.flagPickUpShip === typeRouteTwoDriver.PickUpPoint
						? this.typeRoute[0].image
						: this.typeRoute[1].image;
			}
			return newRow;
		});
		this.lastPage = Number(response.headers['x-last-page']);
		this.totalRoutes = Number(response.headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadRoutesDistribution();
}

function onSearchEvent(value) {
	const searchTrim = value ? value.trim() : '';
	this.params.search = searchTrim || null;
	this.loadRoutesDistribution();
}

function getData({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
	const validDate =
		differenceInDays(this.params.endDate, this.params.startDate) < 0;
	if (this.params.endDate) {
		if (validDate) {
			this.showNotification(
				'La fecha final no puede ser menos a la inicial',
				'error'
			);
		} else {
			this.loadRoutesDistribution(this.params.page);
		}
	}
}

function cleanFiltres() {
	this.params = {
		startDate: null,
		endDate: null,
		status: null,
		typeDistributor: null,
		page: 1,
		search: null,
		responsibleUserId: null,
		vehicleId: null,
	};
	this.loadRoutesDistribution();
}

function isEditDistribution() {
	return this.action.code === 'edit-distribution';
}

async function openEditDistribution(item) {
	const { data: model } = await this.$httpSalesRead.get(
		`/delivery-router/${item.id}`
	);
	this.distribution = model;
	this.action = {
		code: 'edit-distribution',
		active: true,
		title: `Editar ${item.name}`,
		open: true,
		width: 506,
	};
}

function closeModal() {
	this.action = {
		code: '',
		active: false,
		title: '',
		open: false,
	};
}

function openConfirmDelete({ id, name }) {
	this.codeAction = 'delete';
	this.dialogMessage = `¿ Desea eliminar la ruta "${name}"?`;
	this.dialog = true;
	this.routeId = id;
}

function closeDialog() {
	this.dialog = false;
	this.routeId = null;
}

async function deleteDistribution() {
	try {
		await this.$httpSales.delete(`delivery-router/${this.routeId}`);
		this.closeDialog();
		this.showNotification('La ruta de distribución ha sido eliminada.');
		this.loadRoutesDistribution();
	} catch (error) {
		this.showGenericError();
	}
}

function runAction({ code }) {
	if (code === 'create-route') {
		this.goTo('pending-orders-list');
	}
}

async function loadData() {
	const request = [
		this.$httpSales.get('courier'),
		this.$httpSales.get('vehicles'),
		this.$httpSales.get('route-state'),
		this.$httpSales.get('group/typeDistributionRoute/table'),
		this.$httpSales.get('delivery'),
	];
	try {
		const responses = await Promise.all(request);
		this.couriers = responses[0].data;
		this.vehicles = responses[1].data;
		this.states = responses[2].data;
		this.typeOfDistribution = responses[3].data;
		this.drivers = responses[4].data;
	} catch (error) {
		this.showGenericError();
	}
}

function setFilterData({ model, value }) {
	if (model === 'startDate' || model === 'endDate' || value) {
		this.params[model] = value;
	}
}

function filterList() {
	if (this.params.endDate && this.params.startDate) {
		const validDate =
			differenceInDays(this.params.endDate, this.params.startDate) < 0;
		if (this.params.endDate) {
			if (validDate) {
				this.showNotification(
					'La fecha final no puede ser menos a la inicial',
					'info'
				);
			} else {
				this.loadRoutesDistribution(this.params.page);
			}
		}
	} else {
		this.loadRoutesDistribution();
	}
}

function clearFilter() {
	this.params = { ...this.paramsDefault };
	this.loadRoutesDistribution();
}

function setEditData({ model, value }) {
	if (model === 'dateStart' || value) {
		this.distribution[model] = value;
	} else if (!value && value !== null && value !== undefined) {
		this.distribution[model] = null;
	}
}

async function editDistribution() {
	const body = {
		name: this.distribution.name,
		dateStart: exactDate(this.distribution.dateStart, 'YYYY-MM-DD'),
		typeDistributor: this.distribution.typeDistributor,
		vehicleId: this.distribution.vehicleId,
		responsibleUserId: this.distribution.responsibleUserId,
		deliveryId: this.distribution.deliveryId,
	};
	try {
		await this.$httpSales.patch(
			`delivery-router/${this.distribution.id}`,
			body
		);
		this.showNotification('Se actualizó correctamente');
		this.closeModal();
		this.loadRoutesDistribution();
	} catch (error) {
		this.showGenericError();
	}
}

function openDetailDistribution(row) {
	if (this.isTwoDrivers) {
		this.goTo('detail-new-route-distribution', { params: { id: row.id } });
	} else {
		this.goTo('detail-route-distribution', { params: { id: row.id } });
	}
}

function openEndRoute({ id, name }) {
	this.codeAction = 'end';
	this.dialogMessage = `¿ Desea finalizar la ruta "${name}"?`;
	this.dialog = true;
	this.routeId = id;
}

function actionDialog() {
	if (this.codeAction === 'delete') {
		this.deleteDistribution();
	} else {
		this.endDistribution();
	}
}

async function endDistribution() {
	const body = {
		status: typeStatusRoute.Finalized,
	};
	try {
		await this.$httpSales.patch(`delivery-router/${this.routeId}/status`, body);
		this.closeDialog();
		this.showNotification('La ruta de distribución ha sido finalizada.');
		this.loadRoutesDistribution();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'ROUTER_NOT_EXIST') {
				this.showGenericError('La ruta no existe');
			} else if (err.data.message === 'ROUTER_NOT_PICK_UP_SHIP') {
				this.showGenericError('No es una ruta de Recojo y Envío');
			}
		}
	}
}

function disabledRoute(row) {
	return row.status === typeStatusRoute.Finalized;
}

function getText(row) {
	return row.status === typeStatusRoute.Finalized
		? 'La ruta ya ha sido finalizada'
		: 'Finaliza Ruta';
}

function data() {
	return {
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 0,
		},
		columns: [
			{ id: 1, name: '# Ruta', value: 'route', visible: true, checked: true },
			{ id: 2, name: 'Fecha', value: 'date', visible: true, checked: true },
			{ id: 3, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 4,
				name: 'Tipo de distribución',
				value: 'typeDistribution',
				visible: true,
				checked: true,
			},
			// { id: 5, name: 'Transportista', value: 'tranport', visible: true, checked: true },
			// { id: 6, name: 'Vehiculo', value: 'vehicle', visible: true, checked: true },
			{
				id: 5,
				name: 'Repartidor',
				value: 'delivery',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Num Doc. Repartidor',
				value: 'delivery',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Teléfono Repartidor',
				value: 'delivery',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Tipo de Ruta',
				value: 'delivery',
				visible: true,
				checked: true,
			},
			{ id: 9, name: 'Estado', value: 'state', visible: true, checked: true },
			{
				id: 10,
				name: 'Cod. Externo',
				value: 'code',
				visible: true,
				checked: true,
			},
			{
				id: 11,
				name: 'Cant. ped.',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{ id: 12, name: 'Peso', value: 'weight', visible: false, checked: false },
			{
				id: 13,
				name: 'Acciones',
				value: 'actions',
				visible: true,
				checked: true,
			},
		],
		couriers: [],
		dialogMessage: '',
		dialog: false,
		distributions: [],
		vehicles: [],
		distribution: {},
		routeId: null,
		states: [],
		startDate: '',
		currentPage: 1,
		lastPage: 0,
		totalRoutes: 0,
		rows: [],
		params: {
			startDate: null,
			endDate: null,
			status: null,
			typeDistributor: null,
			page: 1,
			search: null,
			vehicleId: null,
			typeDeliveryRouteId: null,
			responsibleUserId: null,
			deliveryId: null,
			flagPickUpShip: null,
		},
		paramsDefault: {
			startDate: null,
			endDate: null,
			page: 1,
			search: null,
			vehicleId: null,
			status: null,
			typeDeliveryRouteId: null,
			responsibleUserId: null,
		},
		typeOfDistribution: [
			{ id: 1, name: 'Interno' },
			{ id: 2, name: 'Externo' },
		],
		drivers: [],
		typeRoute: [],
		codeAction: '',
	};
}

export default {
	name: 'page-distribution-routes',
	data,
	created,
	computed: {
		isEditDistribution,
	},
	components: {
		actionSidebar,
		appActions,
		appTable,
		editDistributionRoutes,
		headerPage,
		filtersSection,
	},
	methods: {
		closeDialog,
		closeModal,
		cleanFiltres,
		changePage,
		getData,
		loadRoutesDistribution,
		deleteDistribution,
		onSearchEvent,
		openDetailDistribution,
		openEditDistribution,
		openConfirmDelete,
		runAction,
		loadData,
		setFilterData,
		filterList,
		clearFilter,
		setEditData,
		editDistribution,
		openEndRoute,
		actionDialog,
		endDistribution,
		disabledRoute,
		getText,
	},
};
</script>
<style lang="scss" scoped>
.subheading {
	justify-content: center;
}
</style>
