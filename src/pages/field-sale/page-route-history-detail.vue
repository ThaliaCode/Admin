<template>
	<div class="route-history-detail">
		<header-page
			:limit-title="80"
			caption-navigation="Historial de Rutas"
			name="route-history"
			:title="title"
			to-show
			justify-class="justify-start"
			column-class="xs12"
			:show-excel="false"
			:show-clean="false"
		>
			<v-flex xs11>
				<filters-data
					:filter-fields="route"
					:end-location-down="endLocationDown"
					:end-location-up="endLocationUp"
					:init-location-down="initLocationDown"
					:init-location-up="initLocationUp"
					:filter-data="route"
				></filters-data>
			</v-flex>
		</header-page>
		<v-layout wrap>
			<v-flex xs4>
				<div class="px-5 py-4 container-overflow">
					<v-layout wrap>
						<v-flex xs12 mb-2 class="item-info">
							<label class="text-name">Pedidos de Clientes visitados</label>
						</v-flex>
						<v-flex xs12>
							<div class="scroll-section">
								<template v-for="order in orders">
									<order-detail-card
										class="mb-2"
										list
										:check-all-disabled="checkAllDisabled"
										:expand-body="order.expand"
										@expand-body="expandBody"
										:key="order.id"
										:order="order"
									></order-detail-card>
								</template>
							</div>
						</v-flex>
						<v-flex xs12 mt-2>
							<v-checkbox
								color="success"
								:disabled="!zoneData.id"
								hide-details
								label="Ver Polígonos"
								v-model="viewPolygons"
							></v-checkbox>
						</v-flex>
					</v-layout>
				</div>
			</v-flex>
			<v-flex xs8>
				<div class="map-container">
					<map-component
						:center-location="centerLocation"
						:disabled-selected-marker="disabledSelectedMarker"
						:markers="markers"
						:orders="orders"
						:path-line="pathLine"
						:polygons="zone"
						:polygons-data="zoneDataMap"
						:polyline="polyline"
						:polylines="polylines"
						:polylines-data="polylinesData"
						:route-id="route.routeId"
						:show-menu-line="showMenuLine"
						:zoom="zoom"
						:is-editable-map="false"
						is-history
						:show-info="showInfo"
						@show-line="showLine"
						@set-data-line="setDataLine"
					/>
				</div>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>
import { eachDay, getDate, getDay, getMonth, getYear, endOfMonth, startOfMonth,
	format } from 'date-fns';
import headerPage from '@/components/shared/header-page';
import filtersData from '@/components/orders/filters-data';
import helper from '@/shared/helper';
import informationVendor from '@/components/field-sale/history/information-vendor';
import dateVendors from '@/components/field-sale/history/date-vendors';
import mapComponent from '@/components/shared/map/map-component';
import Zone from '@/shared/zones';
import orderDetailCard from '@/components/orders/order-detail-card';

const { exactDate } = helper;

const Polygon = new Zone();

function created() {
	this.loadData();
}

function createAllDates() {
	const firstDate = this.calendar.today;
	const secondDate = this.calendar.withinAYear;
	this.calendar.allDates = eachDay(firstDate, secondDate)
		.map((date, index) => this.dateItem(index, date));
	this.setCalendarMonths();
}

function dateItem(baseId, baseDate) {
	const dayOfDate = getDay(baseDate);
	const newBaseDate = format(baseDate, 'YYYY-MM-DD');
	const selectedValue = this.route.dates.length > 0 &&
		this.route.dates.findIndex(d => d === newBaseDate) > -1;
	const item = {
		id: baseId + 1,
		day: dayOfDate,
		date: baseDate,
		disabled: true,
		first: false,
		last: false,
		month: getMonth(baseDate) + 1,
		selected: selectedValue,
		value: getDate(baseDate),
		year: getYear(baseDate),
	};
	return item;
}

function buildOrders(route) {
	const { data: rows } = route;
	return rows.map((row) => {
		const newOrder = { ...row };
		const {
			customer,
			currencySymbol,
			routeName,
			documentNumber,
		} = row;
		const { typePerson, zone, phone, address, parish } = customer;
		const parishName = parish ? parish.name || '---' : '---';
		newOrder.arrowDirection = false;
		newOrder.documentNumber = documentNumber.split('-')[0];
		newOrder.zoneName = zone ? zone.name : '---';
		newOrder.parishName = parishName;
		newOrder.routeName = routeName || '---';
		newOrder.expand = false;
		newOrder.customerName = typePerson ? typePerson.fullName : '---';
		newOrder.currency = currencySymbol || '---';
		newOrder.customerPhone = phone;
		newOrder.customerWhatsapp = phone;
		newOrder.addressCustomer = address || parishName || '---';
		return newOrder;
	});
}


function expandBody(row) {
	this.$set(row, 'expand', !row.expand);
}

async function loadData() {
	const { data: rows } = await this.$httpSales.get('routers-history');
	const urlId = this.$route.params.id;
	const id = rows.find(item => item.id === Number(urlId));
	const myData = await this.$httpSales.get(`orders/route/${id.routeId}`);
	this.orders = this.buildOrders(myData);
	const newRows = rows.map((row) => {
		const newRow = { ...row };
		const { route, seller } = row;
		const {
			dateEnd,
			dateStart,
			dates,
			days,
			totalOrders,
			distance,
			name,
			location,
			statusName,
			zoneId,
			createdAt,
		} = route
			|| {};
		const newDays = days ? days.map(d => d.name.substring(0, 3)) : [];
		newRow.days = days;
		newRow.startDate = exactDate(dateStart, 'DD/MM/YYYY');
		newRow.endDate = exactDate(dateEnd, 'DD/MM/YYYY');
		newRow.dates = dates;
		newRow.grandTotal = totalOrders || 0;
		newRow.routeDays = newDays.length ? newDays.join(' - ') : '';
		newRow.routeDistance = distance || 0;
		newRow.routeName = name || '';
		newRow.createdAt = exactDate(createdAt, 'DD/MM/YYYY');
		newRow.sellerName = seller ? seller.fullname : '';
		newRow.orderPickStateName = statusName || '';
		newRow.location = location || [];
		newRow.zoneId = zoneId || 0;
		return newRow;
	});
	this.route = newRows.find(r => r.id === Number(this.id));
	this.calendar.today = format(this.route.dateStart, 'YYYY-MM-DD');
	this.calendar.withinAYear = format(this.route.dateEnd, 'YYYY-MM-DD');
	this.createAllDates();
	this.calendar.days = this.calendar.days.map((day) => {
		const newDay = { ...day };
		const indexDay = this.route.days.findIndex(d => d.id === day.id);
		newDay.active = indexDay > -1;
		return newDay;
	});
	this.markers = this.route.location.map((p) => {
		const newPoint = {
			position: {
				lat: p.x,
				lng: p.y,
			},
		};
		if (this.route.checkInn.length) {
			this.showInfo = true;
			const indexC = this.route.checkInn.findIndex(r =>
				r.customerAddress.latitude === p.x && r.customerAddress.longitude === p.y);
			newPoint.icon = indexC > -1 ? '/static/img/activo-history.png' : '/static/img/not-activo-history.png';
			newPoint.title = indexC > -1 ? this.route.checkInn[indexC].customerAddressId : null;
			newPoint.info = {
				id: indexC > -1 ? this.route.checkInn[indexC].customerAddress.customer.id : null,
				name: indexC > -1 ?
					this.route.checkInn[indexC].customerAddress.customer.autocomplete : null,
				address: indexC > -1 ?
					this.route.checkInn[indexC].customerAddress.addressLine1 : null,
			};
		} else {
			newPoint.icon = '/static/img/not-activo-history.png';
		}
		newPoint.showInfo = false;
		return newPoint;
	});
	this.polyline = { ...this.route };
	this.polylinesData = [{ ...this.route }];
	this.polylines = this.route.location.map(l => ({ lat: l.x, lng: l.y }));
	this.centerLocation = { lat: this.route.location[0].x, lng: this.route.location[1].y };
	this.setLocation();
	this.loadZoneDetail();
}

async function loadLocationString(cityId, parishId, provinceId) {
	const requests = [
		this.$httpSales.get('province'),
		this.$httpSales.get(`cities/${provinceId}`),
		this.$httpSales.get(`parish/${cityId}`),
	];
	const [
		{ data: provinces },
		{ data: cities },
		{ data: parish },
	] = await Promise.all(requests);
	const provinceSelected = provinces.find(p => p.id === provinceId);
	const citySelected = cities.find(p => p.id === cityId);
	const parishSelected = parish.find(p => p.id === parishId);
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
	try {
		({ data: this.zoneData } = await this.$httpSales.get(`zones/${this.route.zoneId}`));
		const { area, customers, cityId, parishId, provinceId } = this.zoneData;
		this.loadLocationString(cityId, parishId, provinceId);
		this.info[1].value = `${customers.length} clientes`;
		this.info[2].value = `${area.toFixed(2)} km2`;
		this.disabledSelectedMarker = true;
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'ZONE_NOT_EXIST') {
				this.showGenericError('La zona no existe.');
			}
		}
	}
}

function newMonth(id, dateSelected, names, shortNames, firstOrLast) {
	return {
		id: id + 1,
		dates: firstOrLast ? this.setDatesByMonth(dateSelected) : [dateSelected],
		datesRange: [],
		name: names[dateSelected.month - 1],
		shortName: shortNames[dateSelected.month - 1],
		value: dateSelected.month,
		year: dateSelected.year,
	};
}

function setCalendarMonths() {
	const namesOfMonths = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
		'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
	const shortNamesOfMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set',
		'Oct', 'Nov', 'Dic'];
	const firstDate = this.calendar.allDates.shift();
	const lastDate = this.calendar.allDates.pop();
	this.calendar.months = this.calendar.allDates.reduce((acum, currentDate, index) => {
		const indexAcum = acum.length > 0 ? acum.findIndex(a =>
			a.value === currentDate.month && a.year === currentDate.year) : -1;
		const firstOrLast = (currentDate.month === firstDate.month &&
			currentDate.year === firstDate.year) || (currentDate.month === lastDate.month &&
			currentDate.year === lastDate.year);
		if (indexAcum > -1) {
			if (!firstOrLast) {
				acum[indexAcum].dates.push(currentDate);
			}
		} else {
			const m = this.newMonth(
				index, currentDate, namesOfMonths, shortNamesOfMonths, firstOrLast);
			acum.push(m);
		}
		return acum;
	}, []);
	if (this.id) {
		const datesOfMonths = this.calendar.months.reduce((a, m) => a.concat(m.dates), []);
		this.dates = datesOfMonths.filter(dom => dom.selected);
	}
	this.setEmptyDates(this.calendar.months);
}

function setDataLine({ model, value }) {
	this.polyline[model] = value;
}

function setDatesByMonth({ date }) {
	const endDate = endOfMonth(date);
	const startDate = startOfMonth(date);
	const datesOfMonth = eachDay(startDate, endDate);
	return datesOfMonth.map((dpm, dpmIndex) => this.dateItem(dpmIndex, dpm));
}

function setEmptyDates(monthsComplete) {
	this.calendar.months = monthsComplete.map((mc) => {
		const newMc = { ...mc };
		const emptyItems = [];
		for (let i = 0; i < newMc.dates[0].day; i += 1) {
			emptyItems[i] = {
				id: newMc.dates[newMc.dates.length - 1].id + 1,
				day: i,
				date: '',
				month: mc.value,
				value: '',
				year: mc.year,
			};
		}
		newMc.dates.unshift(...emptyItems);
		return newMc;
	});
}

function setLocation() {
	this.locations = this.route.location.reduce((a, point, index) => {
		const lastIndex = this.route.location.length - 1;
		if (index === 0 || index === lastIndex) {
			const latLng = { lat: parseFloat(point.x), lng: parseFloat(point.y) };
			const geocoder = new window.google.maps.Geocoder();
			geocoder.geocode({ location: latLng }, (results, status) => {
				if (status === 'OK') {
					if (results[0]) {
						a.push(results[0].formatted_address);
					}
				}
			});
		}
		return a;
	}, []);
}

function setPolylineData(ind) {
	({
		name: this.polyline.name,
		description: this.polyline.description,
		id: this.polyline.id,
		location: this.locationPolyline,
	} = this.polylinesData[ind]);
	this.locationPolyline = this.locationPolyline.map((lp) => {
		const newLp = lp.reduce((acum, pol) => {
			const newAcum = {
				lat: pol.x,
				lng: pol.y,
			};
			acum.push(newAcum);
			return acum;
		}, []);
		newLp.pop();
		return newLp;
	});
}

function showLine(index) {
	if (index >= 0) {
		this.setPolylineData(index);
	}
}

function title() {
	const { routeName } = this.route;
	return routeName ? `${routeName} - ${this.$route.meta.title}` : this.$route.meta.title;
}

function viewPolygons(value) {
	this.zoneDataMap = value ? [this.zoneData] : [];
	this.zone = value ? Polygon.formatZones(this.zoneDataMap) : [];
}

function watchLocations(points) {
	if (points.length > 1) {
		const initPoint = points[0];
		const endPoint = points[1];
		const initLocationComplete = initPoint.split(', ');
		const endLocationComplete = endPoint.split(', ');
		this.initLocationUp = initLocationComplete[0];
		this.initLocationDown = `${initLocationComplete[1]}, ${initLocationComplete[2]}`;
		this.endLocationUp = endLocationComplete[0];
		this.endLocationDown = `${endLocationComplete[1]}, ${endLocationComplete[2]}`;
	}
}

async function clientsAddrres() {
	const body = {
		type: 0,
		parishId: 0,
		cityId: 0,
		provinceId: 0,
		polygon: 0,
	};
	try {
		await this.$httpSales.post('customers-address/zones', body);
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		calendar: {
			allDates: [],
			days: [
				{
					id: 0,
					active: false,
					name: 'Domingo',
					shortName: 'Dom',
					value: 0,
				},
				{
					id: 1,
					active: false,
					name: 'Lunes',
					shortName: 'Lun',
					value: 1,
				},
				{
					id: 2,
					active: false,
					name: 'Martes',
					shortName: 'Mar',
					value: 2,
				},
				{
					id: 3,
					active: false,
					name: 'Miêrcoles',
					shortName: 'Mie',
					value: 3,
				},
				{
					id: 4,
					active: false,
					name: 'Jueves',
					shortName: 'Jue',
					value: 4,
				},
				{
					id: 5,
					active: false,
					name: 'Viernes',
					shortName: 'Vie',
					value: 5,
				},
				{
					id: 6,
					active: false,
					name: 'Sábado',
					shortName: 'Sab',
					value: 6,
				},
			],
			months: [],
			today: '',
			withinAYear: '',
		},
		centerLocation: {
			lat: -0.24187842216902367,
			lng: -78.5206242727584,
		},
		dates: [],
		destinations: '',
		disabledSelectedMarker: false,
		endLocationDown: '',
		endLocationUp: '',
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
		initLocationDown: '',
		initLocationUp: '',
		locationPolyline: null,
		locations: [],
		markers: [],
		months: [],
		origins: '',
		pathLine: {},
		polyline: {
			color: '',
			customers: [],
			dates: [],
			dateEnd: null,
			dateStart: null,
			definitions: null,
			description: '',
			distance: null,
			flagActive: true,
			frequency: null,
			id: null,
			images: [],
			linestring: [],
			name: '',
			subsidiaryId: null,
			zoneId: null,
		},
		polylines: [],
		polylinesData: [],
		route: {},
		showMenuLine: false,
		viewPolygons: false,
		zone: [],
		zoneData: {},
		zoneDataMap: [],
		zoom: 16,
		showInfo: false,
		orders: [],
		dataSelected: [],
		checkAllDisabled: true,
	};
}

export default {
	name: 'page-route-history-detail',
	data,
	components: {
		dateVendors,
		headerPage,
		filtersData,
		informationVendor,
		mapComponent,
		orderDetailCard,
	},
	computed: {
		title,
	},
	created,
	methods: {
		clientsAddrres,
		createAllDates,
		dateItem,
		loadData,
		loadLocationString,
		loadZoneDetail,
		newMonth,
		setCalendarMonths,
		setDataLine,
		setDatesByMonth,
		setEmptyDates,
		setLocation,
		setPolylineData,
		showLine,
		buildOrders,
		expandBody,
	},
	props: {
		id: [Number, String],
	},
	watch: {
		locations: {
			deep: true,
			handler: watchLocations,
		},
		viewPolygons,
	},
};
</script>
<style lang="scss">
	.route-history-detail {
		.text-name {
			color: color(primary);
			font-family: font(open-semibold);
			font-size: size(medium18);
		}

		.map-container {
			height: 100%;
			width: 100%;

			.gmap-container {
				height: 100% !important;
			}
		}
	}

	.container-overflow {
		height: calc(100vh - 132px);
		overflow-y: auto;
	}
</style>
