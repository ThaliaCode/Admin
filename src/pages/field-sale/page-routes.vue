<template>
	<div>
		<header-page
			caption-navigation="Rutas"
			column-class="xs12"
			justify-class="justify-start"
			:title="title"
			to-show
			:show-excel="false"
			:show-clean="false"
		>
			<bar-information :information="info"></bar-information>
		</header-page>
		<app-actions
			:resource-uri="$route.name"
			@run-action="goTo($event.codeWeb, { params: { zoneId } })"
		/>
		<v-layout wrap pb-2 pt-3 px-4>
			<v-flex xs3>
				<app-select
					:item="frequencyId"
					item-text="name"
					item-value="id"
					:items="frequency"
					label="Frecuencia"
					model="frequencyId"
					@input="setFrequency"
				></app-select>
			</v-flex>
		</v-layout>
		<div class="text-xs-left mb-2 ml-4 mt-2">
			<div class="value-container">
				<div class="label-container">
					<label class="label-detail secondary--text body-1"
						>Total de clientes por ruta:</label
					>
				</div>
				<p class="value-detail body-1">
					<strong>{{ zoneData.customers.length }}</strong>
				</p>
			</div>
		</div>
		<routes-list
			class="mt-4"
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			:items-total-quantity="itemsTotalQuantity"
			@assign-vendor="assignVendor"
			@edit-route="
				goTo('edit-route', {
					params: { zoneId, id: $event.id, name: $event.name },
				})
			"
			@on-page="loadData"
			@delete-route="openConfirmation"
		></routes-list>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
		>
			<add-seller :loading="loading" @close-modal="closeModal" @save-modal="saveModal" />
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="360">
			<v-card>
				<v-card-title class="headline">Eliminar Ruta</v-card-title>
				<v-divider></v-divider>
				<v-card-text>
					{{ messageDelete }}
				</v-card-text>
				<v-card-actions>
					<v-layout row wrap>
						<v-flex xs6 pr-2 text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelDelete"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-2 text-xs-left>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="deleteRoute"
							>
								Eliminar
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
import actionSidebar from '@/components/shared/action-sidebar';
import addSeller from '@/components/field-sale/routes/add-seller';
import barInformation from '@/components/field-sale/shared/bar-information';
import headerPage from '@/components/shared/header-page';
import routesList from '@/components/field-sale/routes/routes-list';

function created() {
	this.loadZoneDetail();
	this.loadData();
}

function cancelDelete() {
	this.dialog = false;
	this.routeId = null;
	this.messageDelete = '';
}

async function deleteRoute() {
	try {
		await this.$httpSales.delete(`routers/${this.routeId}`);
		this.showNotification('La ruta ha sido eliminada correctamente');
		this.cancelDelete();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadData(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	const params = { ...this.params, zoneId: this.zoneId };
	const { data: routes, headers } = await this.$httpSales.get('routers', {
		params,
	});
	this.rows = routes.map((route) => {
		const newRoute = { ...route };
		const dateStart = route.dateStart ? route.dateStart.substring(0, 10) : '';
		const dateEnd = route.dateEnd ? route.dateEnd.substring(0, 10) : '';
		newRoute.zonesCustomers = route.zonesCustomers.length || 0;
		newRoute.dateRange = `${dateStart} - ${dateEnd}`;
		newRoute.customers = route.zonesCustomers.reduce(
			(acc, it) => (acc.includes(it.customerId) ? acc : acc.concat(it.customerId)),
			[]
		).length;
		newRoute.sellersInline = route.sellersId.length
			? route.sellersId.map((s) => s.fullName || s.name).join(', ')
			: '-';
		newRoute.daysInline = route.days.reduce((a, d, i) => {
			const day = d.name.substring(0, 3);
			return i > 0 ? a.concat(` - ${day}`) : a.concat(day);
		}, '');
		return newRoute;
	});
	this.itemsTotalQuantity = Number(headers['x-quantity']);
	this.lastPage = Number(headers['x-last-page']);
}

async function loadLocationString(cityId, parishId, provinceId) {
	const requests = [this.$httpSales.get('province')];
	if (provinceId) {
		requests.push(this.$httpSales.get(`cities/${provinceId}`));
	}
	if (cityId) {
		requests.push(this.$httpSales.get(`parish/${cityId}`));
	}
	const [provinces, cities, parish] = await Promise.all(requests);
	const provinceSelected = provinces.data.find((p) => p.id === provinceId);
	const citySelected = cities.data.find((p) => p.id === cityId);
	const parishSelected =
		parish && parish.data ? parish.data.find((p) => p.id === parishId) : null;
	this.zoneProvince = provinceSelected ? provinceSelected.name : '';
	this.zoneCity = citySelected ? citySelected.name : '';
	this.zoneParish = parishSelected ? parishSelected.name : '';
	if (this.zoneProvince && this.zoneCity && this.zoneParish) {
		this.info[0].value = `${this.zoneProvince}, ${this.zoneCity}, ${this.zoneParish}`;
	} else if (this.zoneProvince && this.zoneCity) {
		this.info[0].value = `${this.zoneProvince}, ${this.zoneCity}`;
	} else if (this.zoneProvince && this.zoneParish) {
		this.info[0].value = `${this.zoneProvince}, ${this.zoneParish}`;
	} else if (this.zoneCity && this.zoneParish) {
		this.info[0].value = `${this.zoneCity}, ${this.zoneParish}`;
	} else if (this.zoneProvince) {
		this.info[0].value = `${this.zoneProvince}`;
	} else if (this.zoneCity) {
		this.info[0].value = `${this.zoneCity}`;
	} else if (this.zoneParish) {
		this.info[0].value = `${this.zoneParish}`;
	}
}

async function loadZoneDetail() {
	({ data: this.zoneData } = await this.$httpSales.get(`zones/${this.zoneId}`));
	const { area, customers, cityId, parishId, provinceId } = this.zoneData;
	this.loadLocationString(cityId, parishId, provinceId);
	this.info[1].value = `${customers.length} clientes`;
	this.info[2].value = `${area.toFixed(2)} km2`;
}

function openConfirmation({ id, name }) {
	this.routeId = id;
	this.messageDelete = `¿Desea eliminar la ruta ${name}?`;
	this.dialog = true;
}

function setFrequency({ model, value }) {
	this[model] = value;
}

function title() {
	return `${this.zoneData.name} - ${this.$route.meta.title}`;
}

function assignVendor({ id }) {
	this.routeId = id;
	this.action.open = true;
	this.action.title = 'Asignar Vendedor';
}

function closeModal() {
	this.action.open = false;
}

async function saveModal(sellersSelected) {
	this.loading = true;
	const body = {
		zoneId: Number(this.zoneId),
		sellerIds: sellersSelected.map((seller) => {
			const newSeller = {
				id: seller.id,
				fullName: seller.fullname,
			};
			return newSeller;
		}),
	};
	try {
		await this.$httpSales.patch(`routers/sellers/${this.routeId}`, body);
		this.showNotification('La asignación se realizó correctamente.');
		this.closeModal();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function data() {
	return {
		action: {
			code: '',
			open: false,
			action: false,
			width: 530,
			title: '',
		},
		itemsTotalQuantity: 0,
		cleanSearch: false,
		columns: [
			{
				id: 1,
				name: 'Nombre',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Vendedores',
				value: 'vendorsInline',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Fecha Inicio - Fecha Final',
				value: 'dateRange',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Frec.',
				tooltip: 'Frecuencia',
				value: 'frequency',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Total de Clientes',
				tooltip: 'Total de Clientes',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Total de Direcciones',
				tooltip: 'Total de Direcciones',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Estado',
				value: 'state',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Acciones',
				checked: true,
				visible: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		dialog: false,
		frequency: [
			{
				id: 1,
				name: '1 vez por semana',
			},
		],
		frequencyId: null,
		info: [
			{
				id: 1,
				value: '',
			},
			{
				id: 2,
				label: 'Total',
				value: '100 clientes',
			},
			{
				id: 3,
				label: 'Área',
				value: '3.68 km2',
			},
		],
		lastPage: 0,
		loading: false,
		messageDelete: '',
		params: {
			page: 1,
			limit: 20,
		},
		rows: [
			{
				id: 1,
			},
		],
		routeId: null,
		zoneCity: '',
		zoneData: {
			customers: [],
		},
		zoneParish: '',
		zoneProvince: '',
	};
}

export default {
	name: 'page-routes',
	components: {
		appActions,
		actionSidebar,
		addSeller,
		barInformation,
		headerPage,
		routesList,
	},
	computed: {
		title,
	},
	created,
	data,
	methods: {
		assignVendor,
		cancelDelete,
		closeModal,
		deleteRoute,
		loadData,
		loadLocationString,
		loadZoneDetail,
		openConfirmation,
		saveModal,
		setFrequency,
	},
	props: {
		zoneId: [Number, String],
	},
};
</script>
<style lang="scss" scoped>
.headline {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding-top: 37px !important;
	text-align: center;
}

.subtext {
	color: color(grey-border);
	font-family: font(open-regular);
	font-size: size(small) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding: 0px !important;
	text-align: center;
}

.btn-block {
	padding-bottom: 24px !important;
	padding-top: 28px !important;
}

.label-container {
	background-color: color(border-green-light);
	display: inline-flex;
	height: 31px;
	line-height: 31px;
	padding-left: 5px;
	width: 190px;
}

.label-detail {
	font-family: font(open-semibold);
}

.value-container {
	align-items: center;
	background-color: color(green-extra-l);
	display: flex;
	height: 31px;
	min-width: 205px;
	padding-right: 11px;
	width: fit-content;
}

.value-detail {
	color: color(paginationText);
	font-family: font(open-regular);
	display: inline-flex;
	margin-bottom: 0px;
	padding-left: 11px;
}
</style>
