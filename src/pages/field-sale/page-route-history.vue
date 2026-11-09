<template>
	<section class="route-history">
		<header-page
			caption-navigation="Rutas"
			name="route-history"
			title="HISTORIAL DE RUTAS"
			to-show
			:show-excel="false"
			@clean-product-filter="cleanFilters"
		>
			<v-layout justify-end align-center>
				<v-flex xs5 text-xs-right>
					<span class="text-green">Total de ventas:</span>
					<span class="text-gray"
						>{{ countryCurrencySymbol }} {{ generalSales | round }}</span
					>
				</v-flex>
				<v-flex xs5 text-xs-right>
					<span class="text-green">Total de clientes:</span>
					<span class="text-gray">{{ totalCustomers }} clientes</span>
				</v-flex>
			</v-layout>
		</header-page>
		<general-filter>
			<v-flex xs2 mr-3>
				<app-select
					clearable
					solo
					:item="frequencySelected"
					item-text="name"
					item-value="id"
					:items="frequency"
					label="Frecuencia"
					model="frequencySelected"
					:return-object="false"
					@input="setData"
				></app-select>
			</v-flex>
			<v-flex xs2 mr-4>
				<app-select
					clearable
					solo
					:item="params.status"
					item-text="name"
					item-value="id"
					:items="status"
					label="Estado"
					model="status"
					:return-object="false"
					@input="setData"
				></app-select>
			</v-flex>
			<v-flex xs2 mr-2>
				<label class="caption">Fecha inicial</label>
				<date-component
					:date="startDate"
					icon="/static/img/calendar.svg"
					@on-input="setData({ model: 'startDate', value: $event })"
				></date-component>
			</v-flex>
			<v-flex xs2 mr-2>
				<label class="caption">Fecha final</label>
				<date-component
					:date="endDate"
					:disabled="!startDate"
					icon="/static/img/calendar.svg"
					@on-input="setData({ model: 'endDate', value: $event })"
				></date-component>
			</v-flex>
			<v-flex xs2 pt-4 text-xs-right>
				<button class="btn-green">Descargar PDF</button>
			</v-flex>
		</general-filter>
		<v-layout wrap>
			<v-flex :class="toShow ? 'xs8' : 'xs12'">
				<app-table
					class="is-not-selectable mt-4"
					name="route-history"
					:columns="columns"
					:current-page="currentPage"
					:last-page="lastPage"
					:rows="rows"
					:items-quantity="rows.length"
					:items-total-quantity="itemsTotalQuantity"
					@on-page="loadData"
					@on-search-event="onSearch"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">
							{{ props.row.routeName }}
						</td>
						<td v-show="showRow(columns, 2)">
							{{ props.row.employeeFullname }}
						</td>
						<td v-show="showRow(columns, 3)">{{ props.row.totalCheckInn }}</td>
						<td v-show="showRow(columns, 4)">
							{{ props.row.totalCustomersAssigned }}
						</td>
						<td v-show="showRow(columns, 5)">
							{{
								props.row.startDate | exactDate('DD-MM-YYYY')
							}}
						</td>
						<td v-show="showRow(columns, 6)">
							{{
								getStatusName(props.row.status)
							}}
						</td>
						<td v-show="showRow(columns, 7)">{{ props.row.totalSales }}</td>
						<td v-show="showRow(columns, 8)">{{ props.row.grandTotal }}</td>
						<td v-show="showRow(columns, 9)">
							<app-tooltip-button
								:icon="props.row.icon"
								text="Ver detalle en tabla"
								color="success"
								size="20"
								@click-icon="goToDetailTable(props.row)"
							/>
							<!-- Ocultado temporalmente por el nuevo seguimiento -->
							<app-tooltip-button
								v-if="false"
								icon="remove_red_eye"
								text="Ver Detalle"
								color="success"
								size="20"
								@click-icon="goToDetail(props.row)"
							/>
							<app-tooltip-button
								icon="navigation"
								text="Seguimiento"
								color="primary"
								size="20"
								@click-icon="gotToHistoryDetail(props.row.id)"
							/>
						</td>
					</template>
				</app-table>
			</v-flex>
			<transition name="fade-left" mode="out-in">
				<v-flex xs4 :class="{ active: toShow }" v-show="toShow">
					<detail-history
						:detail="rowDetail"
						:zone-parish="zoneParish"
						@close-detail="closeDetail"
					/>
				</v-flex>
			</transition>
		</v-layout>
	</section>
</template>
<script>
// import { format, subDays } from 'date-fns';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import dateComponent from '@/components/shared/date-component';
import detailHistory from '@/components/field-sale/history/detail-history';
import generalFilter from '@/components/shared/general-filter';

function created() {
	this.loadData();
}

function closeDetail() {
	this.toShow = false;
}

function generalSales() {
	return this.rows.reduce((a, r) => a + r.totalSales, 0);
}

function goToDetail({ id }) {
	this.goTo('route-history-detail', { params: { id } });
}
function gotToHistoryDetail(id) {
	const params = { id, routeHistoryId: Number(this.$route.params.id) };
	this.$router.push({ name: 'route-history-detail-new', params });
}

function goToDetailTable(row) {
	const { id, route } = row;
	this.rowDetail = { ...row };
	this.zoneParish = '';
	this.loadZoneDetail(route.zoneId);
	this.toShow = !this.toShow;
	this.rows = this.rows.map((d) => {
		const newD = { ...d };
		newD.icon = d.id === id && this.toShow ? 'arrow_back' : 'arrow_forward';
		return newD;
	});
}

async function loadData(page = 1) {
	try {
		const routeId = this.$route.params.id;
		// console.log('load', this.$route.params);
		this.currentPage = page;
		this.params.page = this.currentPage;
		const params = {
			...this.params,
			relationAdd: 'employee,router',
			routeId,
		};
		const { data: rows, headers } = await this.$httpSales.get(
			'routers-history',
			{ params }
		);
		this.rows = rows.map((row) => {
			const newRow = { ...row };
			const days =
				row.route && row.route.days
					? row.route.days.map((d) => d.name.substring(0, 3))
					: [];
			const { route, seller, employee } = row;
			newRow.grandTotal = route ? route.totalOrders : 0;
			newRow.icon = 'arrow_forward';
			newRow.routeDays = days.length ? days.join(' - ') : '';
			newRow.routeDistance = route ? route.distance : 0;
			newRow.routeName = route ? route.name : '';
			newRow.sellerFullName = seller ? seller.fullname : '';
			newRow.employeeFullname = employee ? employee.fullname : '';
			return newRow;
		});
		this.lastPage = Number(headers['x-last-page']);
		this.itemsTotalQuantity = Number(headers['x-quantity']);
	} catch (err) {
		console.error(err);
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadLocationString(cityId, parishId, provinceId) {
	const requests = [
		this.$httpSales.get('province'),
		this.$httpSales.get(`cities/${provinceId}`),
		this.$httpSales.get(`parish/${cityId}`),
	];
	const [{ data: provinces }, { data: cities }, { data: parish }] =
		await Promise.all(requests);
	const provinceSelected = provinces.find((p) => p.id === provinceId);
	const citySelected = cities.find((p) => p.id === cityId);
	const parishSelected = parish.find((p) => p.id === parishId);
	this.zoneProvince = provinceSelected ? provinceSelected.name : '';
	this.zoneCity = citySelected ? citySelected.name : '';
	this.zoneParish = parishSelected ? parishSelected.name : '';
}

async function loadZoneDetail(zoneId) {
	({ data: this.zoneData } = await this.$httpSales.get(`zones/${zoneId}`));
	const { cityId, parishId, provinceId } = this.zoneData;
	this.loadLocationString(cityId, parishId, provinceId);
}

function setData({ model, value }) {
	if (model === 'status') {
		this.params.status = value;
	} else {
		this[model] = value;
		this.params[model] = value;
	}
	// this.params.endDate = value ? this.$today() : null;
	// if (value === 0) {
	// 	this.params.startDate = this.$today();
	// } else if (value === 1) {
	// 	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	// } else if (value === 2) {
	// 	this.params.startDate = format(subDays(this.$today(), 30), 'YYYY-MM-DD');
	// } else {
	// 	this.params.startDate = null;
	// }
	this.loadData();
}

function getStatusName(id) {
	const item = this.status.find(s => s.id === Number(id));
	return item ? item.name : '';
}

function totalCustomers() {
	return this.rows.reduce((a, r) => a + r.totalCustomersAssigned, 0);
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadData();
}

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Rutas',
				value: 'routeName',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Vendedores',
				value: 'vendors',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Chekinns (Clientes Visitados)',
				value: 'chekinns',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Clientes asignados',
				value: 'assignedClients',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Fecha de Visita',
				value: 'startDate',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Estado',
				value: 'status',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Total de ventas',
				value: 'totalSales',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Total General',
				value: 'grandTotal',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'Acciones',
				checked: true,
				visible: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		frequency: [
			{
				id: 1,
				name: 'Diario',
			},
			{
				id: 2,
				name: 'Semanal',
			},
			{
				id: 3,
				name: 'Mensual',
			},
		],
		status: [
			{
				id: 2,
				name: 'En ejecucion',
			},
			{
				id: 3,
				name: 'Cerrados',
			},
		],
		frequencySelected: 0,
		itemsTotalQuantity: 0,
		startDate: null,
		endDate: null,
		lastPage: 0,
		params: {
			search: null,
			endDate: null,
			limit: 20,
			page: 1,
			startDate: null,
			status: null,
		},
		rowDetail: {},
		rows: [],
		toShow: false,
		zoneCity: '',
		zoneData: {},
		zoneParish: '',
		zoneProvince: '',
	};
}
export default {
	name: 'page-route-history',
	components: {
		appTable,
		headerPage,
		detailHistory,
		dateComponent,
		generalFilter,
	},
	computed: {
		generalSales,
		totalCustomers,
	},
	created,
	data,
	methods: {
		closeDetail,
		goToDetail,
		goToDetailTable,
		gotToHistoryDetail,
		loadData,
		loadLocationString,
		loadZoneDetail,
		onSearch,
		setData,
		getStatusName,
		cleanFilters() {
			this.params = {
				search: null,
				endDate: null,
				limit: 20,
				page: 1,
				startDate: null,
				status: null,
			};
			this.startDate = null;
			this.endDate = null;
			this.frequencySelected = 0;
			this.loadData();
		},
	},
};
</script>
<style lang="scss" scoped>
.route-history {
	.text-green {
		color: color(background-sidebar);
		font-family: font(lato-bold);
		font-size: size(small13);
	}

	.text-gray {
		color: color(paginationText);
		font-family: font(lato-regular);
		font-size: size(small13);
		padding-right: 10px;
	}

	.border-r {
		border-right: 1px solid map-get($colors, paginationText);
	}

	.btn-green {
		border: 1px solid map-get($colors, primary);
		border-radius: 3px;
		color: map-get($colors, primary);
		font-size: map-get($sizes, small);
		padding: 6px 14px;
	}
}
</style>
