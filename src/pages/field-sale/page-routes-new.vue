<template>
	<div>
		<header-page
			:caption-navigation="captionNavigation"
			column-class="xs12"
			justify-class="justify-start"
			:title="`${name || zoneName} - ${$route.meta.title}`"
			to-show
			:show-excel="false"
			@clean-product-filter="cleanData"
		>
			<bar-information :information="info"></bar-information>
		</header-page>
		<v-layout wrap justify-end>
			<v-flex xs8>
				<div class="map-container">
					<map-component
						:loading-accept="loading"
						:routeZonesCustomerAddress="routeZonesCustomerAddress"
						:zoom="zoom"
						:customer-selected="markerCustomerSelected"
						:markers="customersMarkers"
						:center-location="centerLocation"
						:path-line="pathLine"
						:polygons="zone"
						:polyline="polyline"
						:polygons-data="zoneData"
						:polylines="polylines"
						:polylines-data="polylinesData"
						:route-id="id"
						:show-menu-line="showMenuLine"
						:x-line="xLine"
						:y-line="yLine"
						show-info
						is-zone-assignment
						@draw-active="drawActive"
						@show-line="showLine"
						@hide-menu-line="hideMenuLine"
						@set-data-line="setDataLine"
						@selected-marker="selectedMarker"
						@polyline="getPolygon"
						@save-polyline="savePolyline"
						@change-menu="changeMenu"
					/>
				</div>
			</v-flex>
			<v-flex xs4>
				<list-aside
					style="height: 100%; padding-bottom: 25px"
					:cancel-text="cancelText"
					:card-info="cardInfo"
					:params="params"
					:group-ids="groupIds"
					:customer-list="customerList"
					:customers="zoneCustomers"
					:checked-disabled="!drawPolyline"
					:days="calendar.days"
					:disabled="disabledSliderAction"
					:end-date-value="polyline.dateEnd"
					:info="info"
					:loading="loading"
					:loading-pagination="loadingPagination"
					:months="calendar.months"
					:order-by="orderBy"
					:order-id="orderId"
					:padding-success="paddingSuccess"
					:route-id="id"
					:route-status="polyline.status"
					:search="searchValue"
					:search-readonly="searchReadonly"
					:selectable="!customerList"
					:show-calendar="showCalendar"
					:show-status="customerList"
					:start-date-value="polyline.dateStart"
					:dates="dates"
					:success-text="successText"
					:title-list="titleList"
					:groups="groups"
					:generate-optimal-route="generateOptimalRoute"
					@emit-data="emitData"
					@btn-action-clean="btnActionClean"
					@cancel-action="closeSlide"
					@card-action="openModal"
					@click-icon="onMain"
					@on-all-selected="onAllSelected"
					@change-selected="changeSelected"
					@on-checked="onChecked"
					@on-scroll="getCustomersToShow"
					@search-value="onSearchValue"
					@select-day="selectDay"
					@select-date="selectDate"
					@set-data="setData"
					@set-date="setDate"
					@success-action="openSlide"
				></list-aside>
			</v-flex>
		</v-layout>
		<customer-modal
			:customer="customerSelected"
			:dialog="dialog"
			@close-modal="closeModal"
		></customer-modal>
	</div>
</template>

<script>
import {
	eachDay,
	getDate,
	getDay,
	getMonth,
	getYear,
	endOfMonth,
	startOfMonth,
	differenceInCalendarDays,
	format,
} from 'date-fns';
import barInformation from '@/components/field-sale/shared/bar-information';
import customerModal from '@/components/field-sale/zone-assignment/customer-modal';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import listAside from '@/components/field-sale/route-assignment/list-aside';
import mapComponent from '@/components/shared/map/map-component';
import Zone from '@/shared/zones';
import typeEntityId from '@/shared/type-entity';

const Polygon = new Zone();
const { debounce } = helper;

async function created() {
	this.polyline.subsidiaryId = this.$userInfo.comSubsidiariesId;
	this.dateStart = format(this.$today(), 'YYYY-MM-DD');
	this.loadZone();
	try {
		const params = {
			typeEntityId: typeEntityId.Customer,
			typeGeneralId: 2,
		};
		const requests = [this.$httpSalesRead.get('group', { params })];
		[{ data: this.groups }] = await Promise.all(requests);
	} catch (err) {
		this.showGenericError();
	}
}

async function loadLocationString(cityId, parishId, provinceId) {
	const requests = [
		this.$httpSales.get('province'),
		this.$httpSales.get(`cities/${provinceId}`),
		this.$httpSales.get(`parish/${cityId}`),
	];
	const [{ data: provinces }, { data: cities }, { data: parish }] = await Promise.all(
		requests
	);
	const provinceSelected = provinces.find((p) => p.id === provinceId);
	const citySelected = cities.find((p) => p.id === cityId);
	const parishSelected = parish.find((p) => p.id === parishId);
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

async function loadRoutes() {
	({ data: this.route } = await this.$httpSales.get(
		`routers/${this.id}?relationAdd=zonesCustomerAddress`
	));
	this.calendar.days = this.calendar.days.map((day) => {
		const newDay = { ...day };
		const indexDay = this.route.days.findIndex((d) => d.id === day.id);
		newDay.active = indexDay > -1;
		return newDay;
	});
	this.polyline = { ...this.route };
	this.polylinesData = [{ ...this.route }];
	this.polylines = this.route.location.map((l) => ({ lat: l.x, lng: l.y }));
	this.routeZonesCustomerAddress = this.route.zonesCustomers;
	this.zoneCustomers = this.zoneCustomers.map((zc) => ({
		...zc,
		isChecked: this.routeZonesCustomerAddress.some(
			(rz) => rz.customersAddressId === zc.id
		),
	}));
}

async function loadZone() {
	const { data: zone } = await this.$httpSales.get(`zones/${this.zoneId}`, {
		params: this.params,
	});
	this.zoneData = [zone];
	const { area, customers, cityId, name, parishId, provinceId } = zone;
	this.zoneName = name;
	this.zone = Polygon.formatZones(this.zoneData);
	this.zoneCustomers = zone.customersAddress;
	const { x, y } = zone.location[0][0];
	this.centerLocation = { lat: +x, lng: +y };
	this.zoom = 15;
	this.loadLocationString(cityId, parishId, provinceId);
	this.info[1].value = `${customers.length} clientes`;
	this.info[2].value = `${area.toFixed(2)} km2`;
	this.loadData();
}

function actionOnRecords(originRecords, action, propRecord) {
	return originRecords[action]((originRecord) => originRecord[propRecord]);
}

function changeRegistersState(records, prop, state) {
	return records.map((record) => {
		const newRecord = { ...record };
		newRecord[prop] = state;
		return newRecord;
	});
}

function closeModal() {
	this.dialog = false;
	this.customerSelected = {};
}

function closeSlide() {
	this.zoneCustomers = [...this.customersFiltered];
	if (this.successText === 'Siguiente') {
		this.goTo('routes', {
			params: { zoneId: this.zoneId, zoneName: this.zoneName },
		});
	} else {
		this.cancelText = 'Cancelar';
		this.successText = 'Siguiente';
		this.showCalendar = false;
	}
}

function createAllDates() {
	const firstDate = this.calendar.today;
	const secondDate = this.calendar.withinAYear;
	this.calendar.allDates = eachDay(firstDate, secondDate).map((date, index) =>
		this.dateItem(index, date)
	);
	this.setCalendarMonths();
}

function dateItem(baseId, baseDate) {
	const lastDateOfAllDates =
		this.calendar.allDates.length > 0
			? this.calendar.allDates[this.calendar.allDates.length - 1]
			: { date: null };
	const plusDate = lastDateOfAllDates.date ? lastDateOfAllDates.date : null;
	const firstDate = this.calendar.allDates[0] ? this.calendar.allDates[0].date : null;
	const disabledEdit = this.id
		? false
		: differenceInCalendarDays(baseDate, this.$today()) < 0;
	const disbaledDate =
		disabledEdit ||
		differenceInCalendarDays(baseDate, plusDate) > 0 ||
		differenceInCalendarDays(baseDate, firstDate) < 0;
	const dayOfDate = getDay(baseDate);
	const selectedValue =
		this.id &&
		!disbaledDate &&
		this.calendar.days.findIndex((d) => d.active && d.id === dayOfDate) > -1;
	const item = {
		id: baseId + 1,
		day: dayOfDate,
		date: baseDate,
		disabled: disbaledDate,
		first: false,
		last: false,
		month: getMonth(baseDate) + 1,
		selected: selectedValue,
		value: getDate(baseDate),
		year: getYear(baseDate),
	};
	return item;
}

function disabledAssign() {
	return this.loading;
}

function disabledSliderAction() {
	const zcValidate = this.zoneCustomers.filter((zc) => zc.isChecked).length < 2;
	const stepTwoValidate = this.showCalendar && (!this.dateStart || !this.dateEnd);
	return this.loading || zcValidate || stepTwoValidate || this.showMenuLine;
}

function disabledSuccessBtn() {
	return this.loading || this.dates.length === 0;
}

function getCustomersToShow() {
	const customersContainer = document.getElementById('scroll-target-route');
	const heightContainer = customersContainer.clientHeight;
	const totalElements = Math.round(heightContainer / 42) + 1;
	const lengthCustomers = this.customersFiltered.length + totalElements;
	const scrollValid = this.customersFiltered.length * 3;
	const scrollValidator = customersContainer.scrollTop >= scrollValid;
	if (scrollValidator && this.customersFiltered.length < this.zoneCustomers.length) {
		this.loadingPagination = true;
		if (this.customersFiltered.length === 0) {
			const filterCustomers = this.zoneCustomers.filter(
				(c, index) => index > this.customersFiltered.length - 1 && index < lengthCustomers
			);
			this.customersFiltered = this.customersFiltered.concat(filterCustomers);
			this.loadingPagination = false;
		} else {
			setTimeout(() => {
				const filterCustomers = this.zoneCustomers.filter(
					(c, index) =>
						index > this.customersFiltered.length - 1 && index < lengthCustomers
				);
				this.customersFiltered = this.customersFiltered.concat(filterCustomers);
				this.loadingPagination = false;
			}, 1000);
		}
	}
	if (this.id) {
		this.loadRoutes();
	}
}

function getData({ model, value }) {
	const cutName =
		value.name.length > 18 ? `${value.name.substring(0, 18)}...` : value.name;
	this.$set(value, 'name', cutName);
	this.modelFilters[model] = value;
	this.modelFilters[`${model}Id`] = value.id;
	this.loadData();
}

async function loadData() {
	this.zoneCustomers = this.zoneCustomers.map((cus) => {
		const newCus = { ...cus };
		if (cus.customer) {
			const { name, lastname, fullname, rzSocial, typePerson } = cus.customer;
			newCus.customerName = name || fullname;
			newCus.customerFullName = typePerson
				? typePerson.fullName
				: `${name} ${lastname}` || `${rzSocial}`;
		} else {
			newCus.customerFullName = cus.name;
			newCus.customerName = cus.name;
		}
		newCus.isChecked = false;
		newCus.isMain = false;
		newCus.isSelected = false;
		newCus.stateColor = cus.customer && cus.customer.flagActive ? 'success' : 'error';
		newCus.stateName = cus.customer && cus.customer.flagActive ? 'Activo' : 'Inactivo';
		return newCus;
	});
	this.customersMarkers = this.zoneCustomers.map((c) => ({
		position: {
			lat: c.location ? c.location.x || 0 : c.latitude || 0,
			lng: c.location ? c.location.y || 0 : c.longitude || 0,
		},
		info: {
			name: c.customerFullName,
			address: c.addressLine1,
		},
		title: c.id,
		showInfo: false,
		icon: '/static/img/desactivado.png',
		zIndex: 999999,
	}));
	this.customersFiltered = [...this.zoneCustomers];
	this.getCustomersToShow();
}

function onChecked({ customer, value }) {
	const { latitude, longitude, id } = customer;
	const checkedData = {
		position: {
			lat: latitude,
			lng: longitude,
		},
	};
	this.markerCustomerSelected = {
		...checkedData,
		checkedValue: value,
		idCustomer: id,
	};

	this.zoneCustomers = this.zoneCustomers.map((z) => {
		const newMarker = { ...z };
		if (Number(z.id) === Number(id)) {
			newMarker.isSelected = !newMarker.isSelected;
		}
		return newMarker;
	});
}

function onMain(row) {
	this.$set(row, 'isMain', !row.isMain);
}

function onSearchValue({ value }) {
	this.searchValue = value;
	if (value) {
		this.zoneCustomers = this.customersFiltered.filter((ld) =>
			ld.customerFullName.toLowerCase().includes(value.toLowerCase())
		);
	} else {
		this.zoneCustomers = [...this.customersFiltered];
	}
}

function openModal(row) {
	const markerCenter = this.customersMarkers.find((c) => c.title === row.id);
	this.centerLocation = markerCenter.position;
	this.zoom = 17;
	if (this.customerList) {
		this.customersFiltered = this.customersFiltered.map((cus) => {
			const newCus = { ...cus };
			newCus.isSelected = cus.id === row.id;
			return newCus;
		});
		const newRow = { ...row };
		newRow.documentName = row.typePerson ? row.typePerson.documentName : 'DNI';
		newRow.documentNumber = row.typePerson
			? row.typePerson.documentNumber
			: row.dni || row.ruc;
		this.customerSelected = { ...newRow };
		this.dialog = true;
	}
}

function openSlide() {
	if (!this.showCalendar) {
		this.successText = this.id ? 'Editar Ruta' : 'Crear Ruta';
		this.cancelText = 'Atrás';
		this.showCalendar = true;
	} else {
		const index = this.polylinesData.findIndex((p) => p.id === this.polylineDetail.id);
		this.showLine(index);
	}
}

function searchReadonly() {
	return this.zoneCustomers.length === 0;
}

function getPolygon(p) {
	this.polygon = p.polygon;
	this.polylineBodyParcial = p.polygon;
	const addressCustomers = this.zoneCustomers
		.filter((zc) => zc.isChecked)
		.map((zc) => ({ lat: zc.latitude, lng: zc.longitude }));
	this.addressCustomer = addressCustomers;
	const linestring = addressCustomers;
	this.origins = `${linestring[0].lat},${linestring[0].lng}`;
	const newLinestring = [...linestring];
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

async function savePolygonOnRoutes(polygonData) {
	this.loading = true;
	const url = this.id ? `routers/${this.id}` : 'routers';
	const message = this.id ? 'editada' : 'creada';
	const method = this.id ? 'patch' : 'post';
	const body = this.buildBody(polygonData);
	try {
		await this.$httpSales[method](url, body, {
			params: { generateOptimalRoute: this.generateOptimalRoute },
		});
		this.hideMenuLine();
		this.showNotification(`Ruta ${message} con éxito`);
		this.goTo('routes', {
			params: { zoneId: this.zoneId, zoneName: this.zoneName },
		});
	} catch (error) {
		if (error.status === 500 || 400) {
			this.showGenericError();
		} else if (error.status === 400) {
			if (error.data.message === 'ROUTE_STARTED_NOT_UPDATE_START_DATE') {
				this.showGenericError('La ruta ha sido iniciada');
			}
		}
	} finally {
		this.loading = false;
	}
}

function buildBody({ name, description, images }) {
	const days = this.calendar.days.reduce((a, d) => {
		if (d.active) {
			a.push({ id: d.value, name: d.name });
		}
		return a;
	}, []);
	const customerAddressNew = [];
	const polylineBody = {
		name,
		days,
		description,
		dateStart: this.dateStart,
		dateEnd: this.dateEnd,
		images,
		frequency: days.length,
		dates: this.dates.map((d) => format(d.date, 'YYYY-MM-DD')),
		customers: this.zoneCustomers
			.filter((zc) => zc.isChecked)
			.map((zc) => {
				// const currentCustomer = this.polyline.zonesCustomers ?
				// 	this.polyline.zonesCustomers.find(pzc => pzc.id === zc.zonesCustomerId) || {} :
				// 	{};
				const newZc = {
					zoneCustomerId: zc.zonesCustomerId,
					flagPrimary: zc.isMain,
					customerAddressId: zc.id,
					latitude: zc.latitude,
					longitude: zc.longitude,
				};
				if (this.id) {
					newZc.flagSelected = true;
					customerAddressNew.push(zc.id);
				}
				return newZc;
			}),
		color: 'color(primary)',
	};
	// if (this.id) {
	// const currentCustomers = this.polyline.zonesCustomers.filter(pzc =>
	// 	polylineBody.customers.every(pc => pc.zoneCustomerId !== pzc.id));
	// const oldCustomersDelete = this.routeZonesCustomerAddress.reduce((a, cc) => {
	// 	if (!customerAddressNew.includes(cc.customersAddressId)) {
	// 		a.push({
	// 			zoneCustomerId: cc.id,
	// 			flagPrimary: false,
	// 			customerAddressId: cc.customersAddressId,
	// 			latitude: cc.customersAddress.latitude,
	// 			longitude: cc.customersAddress.longitude,
	// 			flagSelected: false,
	// 		});
	// 	}
	// 	return a;
	// }, []);
	// polylineBody.customers = polylineBody.customers.concat(oldCustomersDelete);
	// }

	if (!this.id) {
		polylineBody.flagActive = true;
		polylineBody.linestring = this.addressCustomer;
		polylineBody.zoneId = Number(this.zoneId);
		polylineBody.subsidiaryId = this.$userInfo.comSubsidiariesId;
	}
	return polylineBody;
}

function setCalendarMonths() {
	const namesOfMonths = [
		'Enero',
		'Febrero',
		'Marzo',
		'Abril',
		'Mayo',
		'Junio',
		'Julio',
		'Agosto',
		'Setiembre',
		'Octubre',
		'Noviembre',
		'Diciembre',
	];
	const shortNamesOfMonths = [
		'Ene',
		'Feb',
		'Mar',
		'Abr',
		'May',
		'Jun',
		'Jul',
		'Ago',
		'Set',
		'Oct',
		'Nov',
		'Dic',
	];
	const newCalendar = [...this.calendar.allDates];
	const firstDate = newCalendar.shift();
	const lastDate = newCalendar.pop();
	this.calendar.months = this.calendar.allDates.reduce((acum, currentDate, index) => {
		const indexAcum =
			acum.length > 0
				? acum.findIndex(
						(a) => a.value === currentDate.month && a.year === currentDate.year
				  )
				: -1;
		const firstOrLast =
			(currentDate.month === firstDate.month && currentDate.year === firstDate.year) ||
			(currentDate.month === lastDate.month && currentDate.year === lastDate.year);
		if (indexAcum > -1) {
			if (!firstOrLast) {
				acum[indexAcum].dates.push(currentDate);
			}
		} else {
			const m = this.newMonth(index, currentDate, namesOfMonths, shortNamesOfMonths);
			acum.push(m);
		}
		return acum;
	}, []);
	this.calendar.months.map((item) => {
		const date = {};
		const dates = item.dates.filter((ite) => {
			const exists = !date[ite.date];
			date[ite.date] = true;
			return exists;
		});
		const cMonths = item;
		cMonths.dates = dates;
		return item;
	});
	if (this.id) {
		const datesOfMonths = this.calendar.months.reduce((a, m) => a.concat(m.dates), []);
		this.dates = datesOfMonths.filter((dom) => dom.selected);
	}
	this.setEmptyDates(this.calendar.months);
}

function newMonth(id, dateSelected, names, shortNames) {
	return {
		id: id + 1,
		dates: this.setDatesByMonth(dateSelected) || [dateSelected],
		datesRange: [],
		name: names[dateSelected.month - 1],
		shortName: shortNames[dateSelected.month - 1],
		value: dateSelected.month,
		year: dateSelected.year,
	};
}

function selectDay(daySelected) {
	this.datesSelect = Boolean(this.dates.length);
	this.$set(daySelected, 'active', !daySelected.active);
	this.setSelectedValue(daySelected);
}

function selectDate(dateSelected) {
	this.$set(dateSelected, 'selected', !dateSelected.selected);
	const index = this.dates.findIndex(
		(d) =>
			d.value === dateSelected.value &&
			d.month === dateSelected.month &&
			d.year === dateSelected.year
	);
	const indexDay = this.calendar.days.findIndex((d) => d.value === dateSelected.day);
	if (dateSelected.selected) {
		if (index === -1) {
			this.dates.push({ ...dateSelected });
			if (!this.calendar.days[indexDay].active) {
				this.calendar.days[indexDay].active = true;
			}
		}
	} else if (index > -1) {
		this.dates.splice(index, 1);
		const flagDay = this.dates.some((d) => d.day === dateSelected.day);
		if (!flagDay) {
			this.calendar.days[indexDay].active = false;
		}
	}
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

function captionNavigation() {
	const module = 'ruta';
	return this.id ? `Editando ${module}s creadas` : `Creando nueva ${module}`;
}

function selectedMarker(markerData) {
	const { position, checkedValue, idCustomer, customersAddressId, title } = markerData;
	this.zoneCustomers = this.zoneCustomers.map((z) => {
		const newMarker = { ...z };
		if (Number(z.id) === Number(title)) {
			newMarker.isSelected = !newMarker.isSelected;
		}
		return newMarker;
	});

	if (this.drawPolyline || this.id) {
		if (idCustomer) {
			this.customersObject = this.zoneCustomers.find(
				(zc) =>
					zc.latitude === position.lat &&
					zc.longitude === position.lng &&
					zc.id === idCustomer
			);
		} else {
			this.customersObject = this.zoneCustomers.find(
				(zc) => zc.id === (customersAddressId || title)
			);
		}
		const cusIndexCus = this.zoneCustomers.findIndex(
			(zc) =>
				zc.latitude === position.lat &&
				zc.longitude === position.lng &&
				zc.id === idCustomer
		);
		const cusIndexEdit = this.zoneCustomers.findIndex(
			(zc) => zc.id === (customersAddressId || title)
		);
		const cusIndex = idCustomer ? cusIndexCus : cusIndexEdit;
		const cusValue =
			checkedValue !== undefined
				? checkedValue
				: (this.customersObject && !this.customersObject.isChecked) || Boolean(this.id);
		this.$set(this.customersObject, 'isChecked', cusValue);
		const cusValueActive =
			checkedValue !== undefined ? checkedValue : this.customersObject.isChecked;
		this.customersMarkers[cusIndex].icon = cusValueActive
			? '/static/img/activo.png'
			: '/static/img/desactivado.png';
	}
}

function onAllSelected(checked) {
	this.checkAll = checked;
	this.zoneCustomers = this.zoneCustomers.map((zc) => {
		const newZc = { ...zc };
		newZc.isChecked = checked;
		this.pathLine = { lat: zc.latitude, lng: zc.longitude };
		return newZc;
	});
	this.customersFiltered = [...this.zoneCustomers];
}

function setData({ id }) {
	this.orderId = id;
	this.orderData(this.orderId);
}

function btnActionClean() {
	this.orderId = null;
	this.zoneCustomers = [...this.customersFiltered];
}

function orderData(val) {
	if (val === 1) {
		this.zoneCustomers = this.zoneCustomers.sort((a, b) => {
			const { customer: aCustomer } = a;
			const { customer: bCustomer } = b;
			if (aCustomer.lastname > bCustomer.lastname) {
				return 1;
			}
			if (aCustomer.lastname < bCustomer.lastname) {
				return -1;
			}
			return 0;
		});
	}
}

function setDate({ model, value }) {
	this[model] = format(value, 'YYYY-MM-DD');
	if (this.dateStart && this.dateEnd) {
		this.calendar.today = this.dateStart;
		this.calendar.withinAYear = this.dateEnd;
		this.createAllDates();
	}
}

// Funciones para crear ruta

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

function setDataLine({ model, value }) {
	this.polyline[model] = value;
}

function hideMenuLine() {
	this.showMenuLine = false;
	this.polyline = {
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
	};
}

function savePolyline({ polylineId, pathsLineAreChanged, newPathsLine, optionsMapLine }) {
	const currentPaths =
		polylineId && pathsLineAreChanged ? this.locationPolyline : [newPathsLine];
	const paths = polylineId ? currentPaths : [optionsMapLine.paths];
	// this.polylines = [];
	const polylineObject = {
		...this.polyline,
		polyline: [...paths],
	};
	this.getPolygon({ polygon: polylineObject, polylineId });
}

function showLine(index) {
	this.showMenuLine = false;
	this.xLine = 433;
	this.yLine = 485;
	this.$nextTick(() => {
		this.showMenuLine = true;
	});
	if (index >= 0) {
		this.setPolylineData(index);
	}
}

function drawActive(polilyneActice) {
	if (polilyneActice) {
		this.zoneCustomers = this.zoneCustomers.map((z) => {
			const newMarker = { ...z };
			if (z.isSelected && !z.isChecked) {
				newMarker.isSelected = false;
			}
			return newMarker;
		});
	}
	this.drawPolyline = polilyneActice;
}

function setSelectedValue(daySelectedValue) {
	this.calendar.months = this.calendar.months.map((month) => {
		const monthCopy = { ...month };
		monthCopy.dates = monthCopy.dates.map((date) => {
			const newDate = { ...date };
			if (date.value && date.day === daySelectedValue.value && !date.disabled) {
				newDate.selected = daySelectedValue.active;
				if (newDate.selected) {
					const indexS = this.dates.findIndex(
						(d) =>
							date.value === d.value && date.month === d.month && date.year === d.year
					);
					if (indexS === -1) {
						this.dates.push(newDate);
					}
				} else {
					const index = this.dates.findIndex((d) => d.date === newDate.date);
					if (index > -1) {
						this.dates.splice(index, 1);
					}
				}
			}
			return newDate;
		});
		return monthCopy;
	});
}

async function getDistance() {
	this.loading = true;

	try {
		this.distance = 0;

		await this.savePolygonOnRoutes(this.polylineBodyParcial);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function changeMenu(value) {
	if (!value) {
		this.hideMenuLine();
	}
}

function data() {
	return {
		assignValue: false,
		addressCustomer: {},
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
		cancelText: 'Cancelar',
		params: {
			flagCustomerNotAssigned: null,
			groupIds: null,
		},
		groupIds: null,
		cardInfo: [
			{
				id: 1,
				label: '/static/img/purchase-quantity.svg',
				value: '25',
			},
			{
				id: 2,
				label: '/static/img/purchase-frequency.svg',
				value: '1 vez al mes',
			},
			{
				id: 3,
				label: '/static/img/credit-line.svg',
				value: 'S/ 50.00 de S/50.000',
			},
			{
				id: 4,
				label: '/static/img/debt.svg',
				value: 'S/ 0.00',
			},
		],
		centerLocation: { lat: -0.9271213, lng: -78.8689477 },
		checkAll: false,
		cleanSearch: false,
		counterScroll: 0,
		currentPage: 1,
		customerList: false,
		customersMarkers: [],
		customerSelected: {},
		customersFiltered: [],
		customersObject: {},
		dateEnd: null,
		dates: [],
		datesSelect: false,
		dateStart: null,
		destinations: '',
		dialog: false,
		distance: 0,
		drawPolyline: false,
		info: [
			{
				id: 1,
				value: '',
			},
			{
				id: 2,
				label: 'Total',
				value: '0 clientes',
			},
			{
				id: 3,
				label: 'Área',
				value: '0 km2',
			},
		],
		lastPage: 0,
		loading: false,
		loadingPagination: false,
		locationPolyline: null,
		markerCustomerSelected: {},
		groups: [],
		orderBy: [
			{
				id: 1,
				name: 'Apellido',
			},
			{
				id: 2,
				name: 'Prioridad',
			},
		],
		orderId: null,
		origins: '',
		pathLine: {},
		polygon: [],
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
		polylineBodyParcial: {},
		polylineDetail: {},
		polylines: [],
		routeZonesCustomerAddress: [],
		polylinesData: [],
		paddingSuccess: 'px-4',
		searchValue: '',
		showCalendar: false,
		showMenuLine: false,
		successText: 'Siguiente',
		titleList: 'Clientes',
		route: {},
		routes: [],
		xLine: 0,
		yLine: 0,
		zoom: 11,
		zone: [],
		zoneCustomers: [],
		zoneData: [],
		zoneName: '',
		generateOptimalRoute: false,
	};
}

export default {
	name: 'page-routes-new',
	components: {
		barInformation,
		customerModal,
		headerPage,
		mapComponent,
		listAside,
	},
	computed: {
		captionNavigation,
		disabledAssign,
		disabledSliderAction,
		disabledSuccessBtn,
		searchReadonly,
	},
	created,
	data,
	methods: {
		actionOnRecords,
		btnActionClean,
		buildBody,
		changeRegistersState,
		closeModal,
		closeSlide,
		createAllDates,
		dateItem,
		drawActive,
		getCustomersToShow,
		getData,
		getDistance,
		getPolygon,
		loadData,
		loadLocationString,
		loadRoutes,
		loadZone,
		newMonth,
		onAllSelected,
		onChecked,
		onMain,
		onSearchValue: debounce(onSearchValue),
		openModal,
		openSlide,
		orderData,
		savePolygonOnRoutes,
		selectDay,
		selectDate,
		selectedMarker,
		setCalendarMonths,
		setData,
		setDate,
		setDataLine,
		setDatesByMonth,
		setEmptyDates,
		setSelectedValue,
		setPolylineData,
		hideMenuLine,
		savePolyline,
		showLine,
		changeMenu,
		changeSelected(value, model) {
			this[model] = value;
		},
		emitData(model) {
			if (model.model === 'groupIds') {
				this.params[model.model] = model.value.length ? model.value.join(',') : null;
				this.groupIds = model.value;
			} else {
				this.params.flagCustomerNotAssigned = model || undefined;
			}
			this.loadZone();
		},
		cleanData() {
			this.searchValue = '';
			this.groupIds = [];
			this.params = {
				groupIds: null,
				flagCustomerNotAssigned: null,
			};
			this.loadZone();
		},
	},
	props: {
		id: [Number, String],
		name: String,
		zoneId: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.map-container {
	height: 100%;
	width: 100%;
}

.full-page {
	margin: 0 -12px;
}
</style>
