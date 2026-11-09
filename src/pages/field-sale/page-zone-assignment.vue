<template>
	<div>
		<app-loading
			:show-loading="loadingCustomers"
			label="La carga terminará en un momento y podrás ver a los clientes"
		/>
		<header-page
			:caption-navigation="captionNavigation"
			column-class="xs12"
			justify-class="justify-start"
			:title="title"
			to-show
			:show-excel="false"
			:show-clean="false"
		>
			<heading-filter
				:departments="departments"
				:distrits="distrits"
				:loading="loading"
				:model="modelFilters"
				:provinces="provinces"
				@outline-btn-action="cleanData"
				@set-data="getData"
				@search-action="onSearch"
			></heading-filter>
		</header-page>
		<v-layout wrap justify-end>
			<v-flex :class="showCustomerList ? 'xs8' : 'xs12'">
				<div class="map-container">
					<div>
						<v-switch
							class="ml-3"
							label="Mostrar lista de clientes"
							color="success"
							hide-details
							v-model="showCustomerList"
							@change="loadData"
						></v-switch>
					</div>
					<map-component
						ref="mapComponentRef"
						:zone-id="id"
						:zoom="zoom"
						:markers="JSON.parse(JSON.stringify(customersMarkers))"
						:center-location="centerLocation"
						:poligon="poligon"
						:polygons="zones"
						:polygons-data="zonesData"
						:show-menu="showMenu"
						:x="x"
						:y="y"
						show-info
						is-zone-assignment
						@show="show"
						@hide-menu="hideMenu"
						@set-data="setData"
						@save-polygon="savePoligon"
						@change-paths="changePaths"
						@close-menu="hideMenu"
					/>
				</div>
			</v-flex>
			<v-flex xs4 v-if="showCustomerList">
				<list-aside
					:card-info="cardInfo"
					:customer-list="customerList"
					:customers="customersFiltered"
					:disabled="disabledSliderAction"
					:height-var="159"
					:info="info"
					:loading="loading"
					:loading-pagination="loadingPagination"
					:padding-success="paddingSuccess"
					:search="searchValue"
					:search-readonly="searchReadonly"
					:selectable="!customerList"
					:show-status="customerList"
					:show-zone="!customerList"
					:success-text="successText"
					:title-list="titleList"
					:group-id="groupId"
					:groups="groups"
					@get-data="getData"
					@cancel-action="closeSlide"
					@card-action="openModal"
					@click-icon="onMain"
					@on-checked="onChecked"
					@on-scroll="getCustomersToShow"
					@search-value="onSearchValue"
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
import customerModal from '@/components/field-sale/zone-assignment/customer-modal';
import headerPage from '@/components/shared/header-page';
import headingFilter from '@/components/field-sale/zone-assignment/heading-filter';
import helper from '@/shared/helper';
import typeEntityId from '@/shared/type-entity';
import listAside from '@/components/field-sale/zone-assignment/list-aside';
import mapComponent from '@/components/shared/map/map-component';
import Zone from '@/shared/zones';
import lib from '@/shared/lib';
// import axios from 'axios';

const Polygon = new Zone();
const { debounce } = helper;

function calculateCenter(points) {
	const bounds = new window.google.maps.LatLngBounds();
	points.forEach((p) => {
		bounds.extend(p);
	});
	return bounds.getCenter();
}

function created() {
	this.latitude = this.labelsByCountry.geoposition.lat;
	this.longitude = this.labelsByCountry.geoposition.lng;
	this.centerLocation = this.labelsByCountry.geoposition;
	this.zoom = 10;
	this.idZone = this.$route.params.id;
	this.loadDepartments();
	this.loadZones();
	this.loadServices();
	if (this.idZone) {
		this.detailZone();
	}
}

async function detailZone() {
	try {
		const response = await this.$httpSales.get(`zones/${this.idZone}`);
		this.zoneAssignmentDetail = response.data;
		this.modelFilters.departmentId = this.zoneAssignmentDetail.provinceId;
		this.modelFilters.provinceId = this.zoneAssignmentDetail.cityId;
		this.modelFilters.distritId = this.zoneAssignmentDetail.parishId;
		if (this.idZone) {
			this.loadProvinces(this.zoneAssignmentDetail.provinceId);
			if (this.modelFilters.distritId) {
				this.loadDistrits(this.zoneAssignmentDetail.cityId);
			}
			this.zoom = 14;
			this.loadData();
			const newPoints = this.zoneAssignmentDetail.location[0].map((p) => {
				const newP = {
					lat: p.x,
					lng: p.y,
				};
				return newP;
			});
			setTimeout(() => {
				this.centerLocation = calculateCenter(newPoints);
			}, 1000);
		}
	} catch (error) {
		this.showGenericError();
	}
}

async function loadZones() {
	const { data: zones } = await this.$httpSales.get('zones', {
		params: this.params,
	});
	this.zonesData = zones;
	this.zones = Polygon.formatZones(zones);
}

function actionOnRecords(originRecords, action, propRecord) {
	return originRecords[action]((originRecord) => originRecord[propRecord]);
}

function assignVendors() {
	this.showNotification('La asignación ha sido realizada correctamente.');
	this.cancelAssign();
}

function cancelAssign() {
	this.assignValue = false;
	this.vendors = this.changeRegistersState(this.vendors, 'isSelected', false);
	this.checkAll = this.actionOnRecords(this.vendors, 'every', 'isSelected');
}

function changeRegistersState(records, prop, state) {
	return records.map((record) => {
		const newRecord = { ...record };
		newRecord[prop] = state;
		return newRecord;
	});
}

function cleanData() {
	this.modelFilters = {
		department: {},
		departmentId: null,
		distrit: {},
		distritId: null,
		province: {},
		provinceId: null,
	};
	this.customers = [];
	this.customersFiltered = [];
	this.distrits = [];
	this.provinces = [];
	this.searchValue = '';
	this.params = {
		provinceId: null,
		cityId: null,
		parishId: null,
	};
	this.zones = [];
	this.customersMarkers = [];
	this.customers = [];
	this.centerLocation = this.labelsByCountry.geoposition;
	this.zoom = 8;
	this.groupId = null;
}

function closeModal() {
	this.dialog = false;
	this.customerSelected = {};
}

function closeSlide() {
	this.customersFiltered = [...this.customers];
	if (this.customerList) {
		this.goTo('zones');
	} else {
		this.titleList = 'Clientes';
		this.successText = 'Siguiente';
		this.customerList = true;
	}
}

function disabledAssign() {
	return this.loading || this.vendors.every((v) => !v.isSelected);
}

function disabledSliderAction() {
	const disabled = this.id ? false : this.disabledSave;
	return this.loading || this.showMenu || disabled;
}

function disabledSuccessBtn() {
	return this.loading || !this.modelFilters.departmentId;
}

function getCustomersToShow() {
	const customersContainer = document.getElementById('scroll-target');
	const heightContainer = customersContainer.clientHeight;
	const totalElements = Math.round(heightContainer / 42) + 1;
	const lengthCustomers = this.customersFiltered.length + totalElements;
	const scrollValid = this.customersFiltered.length * 3;
	const scrollValidator = customersContainer.scrollTop >= scrollValid;
	let customersNew = this.customers;
	if (this.id) {
		const customersZone = this.zoneAssignmentDetail.customers.map((c) => Number(c.id));
		customersNew = this.customers.filter((c) =>
			customersZone.includes(Number(c.customerId))
		);
	}
	if (scrollValidator && this.customersFiltered.length < customersNew.length) {
		this.loadingPagination = true;
		if (this.customersFiltered.length === 0) {
			const filterCustomers = customersNew.filter(
				(c, index) => index > this.customersFiltered.length - 1 && index < lengthCustomers
			);
			this.customersFiltered = this.customersFiltered.concat(filterCustomers);
			this.loadingPagination = false;
		} else {
			setTimeout(() => {
				const filterCustomers = customersNew.filter(
					(c, index) =>
						index > this.customersFiltered.length - 1 && index < lengthCustomers
				);
				this.customersFiltered = this.customersFiltered.concat(filterCustomers);
				this.loadingPagination = false;
			}, 1000);
		}
	}
}

function getData({ model, value }) {
	if (model === 'groupId') {
		this.groupId = value.id;
		this.loadData();
	} else if (value && value.id) {
		const cutName = value.name;
		this.$set(value, 'name', cutName);
		this.modelFilters[model] = value;
		this.modelFilters[`${model}Id`] = value.id;
		if (model === 'department') {
			this.params.provinceId = value.id;
			this.provinces = [];
			this.distrits = [];
			this.modelFilters.distrit = {};
			this.modelFilters.distritId = null;
			this.modelFilters.cityId = null;
			this.params.distritId = null;
			this.modelFilters.province = {};
			this.modelFilters.provinceId = null;
			this.params.cityId = null;
			this.params.parishId = null;
			// this.loadZones();
			this.loadProvinces(value.id);
		} else if (model === 'province') {
			this.params.cityId = value.id;
			this.distrits = [];
			this.modelFilters.distrit = {};
			this.modelFilters.distritId = null;
			this.params.parishId = null;
			// this.loadZones();
			this.loadDistrits(value.id);
		} else {
			this.params.parishId = value.id;
			this.loadZones();
		}
		this.nameSearchGoogle = cutName;
		// this.googleSearch(cutName);
		// this.loadData();
	}
}

async function loadData() {
	this.loading = true;
	this.loadingCustomers = true;
	this.customersMarkers = [];
	this.customers = [];
	const params = {
		search: this.searchValue || null,
		provinceId: this.modelFilters.departmentId || null,
		cityId: this.modelFilters.provinceId || null,
		parishId: this.modelFilters.distritId || null,
		vendor: true,
		groupId: this.groupId,
	};
	try {
		const { data: customersResponse } = await this.$httpSales.get('customers-location', {
			params,
		});

		this.customers = this.showCustomerList ? customersResponse.customers : [];

		this.customersMarkers = customersResponse.customersMarkers.map((marker, index) => {
			const updatedMarker = { ...marker };
			if (
				marker.info.name === 'null null' ||
				marker.info.name === null ||
				marker.info.name === ''
			) {
				updatedMarker.info.name = customersResponse.customers[index].customerFullName;
			}

			return updatedMarker;
		});

		const countMap = {};

		this.customersMarkers.forEach((item) => {
			const key = `${item.position.lat},${item.position.lng}`;
			countMap[key] = (countMap[key] || 0) + 1;
		});

		this.customersMarkers = this.customersMarkers.map((item) => {
			const key = `${item.position.lat},${item.position.lng}`;
			return {
				...item,
				duplicateCount: countMap[key],
			};
		});

		this.customersFiltered = [];
		this.info[0].value = `${this.zoneAssignmentDetail.name}`;
		this.info[1].value = `${this.customers.length} clientes`;
		this.info[2].value = `${this.zoneAssignmentDetail.area} km2`;
		if (this.showCustomerList) {
			this.getCustomersToShow();
		}
		if (this.id) {
			this.customersFiltered = this.customers;
		}
	} catch (err) {
		console.error(err);
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
		this.loadingCustomers = false;
	}
}

async function loadDepartments() {
	try {
		({ data: this.departments } = await this.$httpSales.get('province'));
		this.departments = this.departments.map((depa) => {
			const newDepa = { ...depa };
			newDepa.name = this.truncText(depa.name, 20);
			return newDepa;
		});
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadDistrits(id) {
	try {
		({ data: this.distrits } = await this.$httpSales.get(`parish/${id}`));
		this.distrits = this.distrits.map((dist) => {
			const newDist = { ...dist };
			newDist.name = this.truncText(dist.name, 20);
			return newDist;
		});
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadProvinces(id) {
	try {
		({ data: this.provinces } = await this.$httpSales.get(`cities/${id}`));
		this.provinces = this.provinces.map((province) => {
			const newProvince = { ...province };
			newProvince.name = this.truncText(province.name, 20);
			return newProvince;
		});
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadVendors(page = 1) {
	const params = {
		typeSeller: 2,
	};
	try {
		const response = await this.$httpSales.get('sellers', { params });
		this.vendors = response.data;
	} catch (error) {
		this.showGenericError();
	}
	this.currentPage = page;
	this.paramsVendors.page = this.currentPage;
	this.vendors = lib.map(
		lib.compose(
			lib.setNewProperty('isSelected', false),
			lib.setNewProperty('isChecked', false),
			lib.setNewProperty('stateColor', 'success'),
			lib.setNewProperty('stateName', 'Activo')
		),
		this.vendors
	);
	this.customersFiltered = this.vendors;
}

function onChecked(checked, row) {
	this.$set(row, 'isChecked', checked);
	this.vendorsSelected = this.customersFiltered.filter((cf) => cf.isChecked);
}

function onMain(row) {
	this.$set(row, 'isMain', !row.isMain);
}

function onSearchValue({ value }) {
	this.searchValue = value;
	if (value) {
		this.customersFiltered = this.customers.filter((ld) =>
			ld.customerFullName.toLowerCase().includes(value.toLowerCase())
		);
	} else {
		this.customersFiltered = [...this.customers];
	}
}

function onSearchVendor(searchVal) {
	this.paramsVendors.search = searchVal ? searchVal.trim() : null;
}

function onSelectedAll(checked) {
	this.checkAll = checked;
	this.vendors = this.changeRegistersState(this.vendors, 'isSelected', checked);
	this.vendorsSelected = this.actionOnRecords(this.vendors, 'filter', 'isSelected');
}

function onSelectedRow(row) {
	this.$set(row, 'isSelected', row.isSelected);
	this.vendorsSelected = this.actionOnRecords(this.vendors, 'filter', 'isSelected');
	this.checkAll = this.actionOnRecords(this.vendors, 'every', 'isSelected');
}

function openModal(row) {
	if (this.customerList) {
		this.customersFiltered = this.customersFiltered.map((cus) => {
			const newCus = { ...cus };
			newCus.isSelected = cus.id === row.id;
			return newCus;
		});
		this.customerSelected = { ...row };
		this.dialog = true;
	}
}

function openSlide() {
	const index = this.zonesData.findIndex(
		(zone) => zone.id === this.zoneAssignmentDetail.id
	);
	this.show(index);
}

function searchReadonly() {
	return this.customers.length === 0;
}

function getPolygon(p, id) {
	this.polygon = p.polygon;
	this.savePolygonOnZones(p, id);
}

async function savePolygonOnZones(polygonData, id) {
	this.loading = true;
	const zoneId = id || this.id;
	const urlPost = 'zones';
	const urlPatch = `zones/${zoneId}`;
	const url = zoneId ? urlPatch : urlPost;
	const body = this.buildBody(polygonData, this.modelFilters);
	const method = zoneId ? 'patch' : 'post';
	const message = zoneId ? 'actualizada' : 'creada';
	try {
		await this.$httpSales[method](url, body);
		this.showNotification(`Zona ${message} con éxito`);
		this.goTo('zones');
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loading = false;
	}
}

function buildBody(
	{ name, description, polygon },
	{ departmentId, distritId, provinceId }
) {
	const haveLocation = this.zoneAssignmentDetail.location;
	const locationData = haveLocation
		? haveLocation[0].map((l) => ({ lat: l.x, lng: l.y }))
		: null;
	return {
		area: this.area / 1000000,
		name,
		description,
		polygon: polygon[0].length > 0 ? polygon : [locationData],
		provinceId: departmentId,
		cityId: provinceId,
		parishId: distritId,
	};
}

async function googleSearch(search) {
	let concatInput = `${search},+${this.labelsByCountry.name}`;
	if (this.modelFilters.departmentId && this.modelFilters.provinceId) {
		concatInput = `${search},+${this.modelFilters.department.name},+${this.modelFilters.province.name},+${this.labelsByCountry.name}`;
		this.zoom = 16;
	} else if (this.modelFilters.provinceId) {
		concatInput = `${search},+${this.modelFilters.province.name},+${this.labelsByCountry.name}`;
		this.zoom = 13;
	} else {
		this.zoom = 9;
	}
	const inputValue = concatInput.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	this.paramsGoogleMap.input = inputValue;
	const places = await this.$httpSales.get('google-place-locate', {
		params: { input: inputValue, cache: true },
	});
	this.centerLocation =
		places.data && places.data.results && places.data.results[0]
			? places.data.results[0].geometry.location
			: this.labelsByCountry.geoposition;

	this.$nextTick(() => {
		setTimeout(() => {
			this.$refs.mapComponentRef.adjustZoomToFitMarkers();
		}, 600);
	});
}

function title() {
	const module = 'Zona';
	return this.id
		? `${this.zoneAssignmentDetail.name} - Editar ${module}`
		: `Nueva ${module}`;
}

function captionNavigation() {
	const module = 'zona';
	return this.id ? `Editando ${module}s creadas` : `Creando nueva ${module}`;
}

// Funciones de map component

function savePoligon({ polygonId, pathsAreChanged, newPaths, optionsMap }) {
	const currentPaths = polygonId && !pathsAreChanged ? this.locationPolygon : [newPaths];
	const paths = polygonId ? currentPaths : [optionsMap.paths];
	const polygonObject = {
		...this.poligon,
		polygon: [...paths],
	};
	const polygonPaths = paths[0].map((point) => {
		const newPath = new window.google.maps.LatLng(point.lat, point.lng);
		return newPath;
	});
	this.area = window.google.maps.geometry.spherical.computeArea(polygonPaths);
	this.getPolygon(polygonObject, polygonId);
	this.hideMenu();
}

function hideMenu() {
	this.showMenu = false;
	this.poligon = { name: '', description: '' };
}

function setData({ model, value }) {
	this.poligon[model] = value;
}

function setPolygonData(ind) {
	({
		name: this.poligon.name,
		description: this.poligon.description,
		id: this.poligon.id,
		location: this.locationPolygon,
	} = this.zonesData[ind]);
	this.locationPolygon = this.locationPolygon.map((lp) => {
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

function show(index) {
	this.disabledDelete = true;
	this.showMenu = false;
	this.x = 433;
	this.y = 485;
	this.$nextTick(() => {
		this.showMenu = true;
	});
	if (index >= 0) {
		this.setPolygonData(index);
	}
}

function changePaths(value) {
	this.disabledSave = value.paths.length === 0;
}

function data() {
	return {
		area: 0,
		assignValue: false,
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
		centerLocation: { lat: 0, lng: 0 },
		checkAll: false,
		cleanSearch: false,
		counterScroll: 0,
		currentPage: 1,
		customerList: true,
		customers: [],
		customersMarkers: [],
		customerSelected: {},
		customersFiltered: [],
		departments: [],
		dialog: false,
		distrits: [],
		info: [
			{
				id: 1,
				label: 'Nombre de Polígono',
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
				value: '3.68 km2',
			},
		],
		lastPage: 0,
		latitude: 0,
		loading: false,
		loadingPagination: false,
		localData: [
			{
				id: 1,
				additionalInfo: {
					creditLimit: {
						max: 50000,
						min: 50,
					},
					currency: 'S/',
					debtAmount: 50,
					purchasesQuantity: 100,
					purchasesFrequency: '1 vez al mes',
				},
				address: 'Calle Independencia 120',
				cellPhone: '949726461',
				documentNumber: '45433623',
				distrit: 'Miraflores',
				email: 'marcelo@gmail.com',
				isMain: false,
				lastname: 'Carranza',
				name: 'Marcelo',
				province: 'Lima',
				stateColor: 'success',
				stateName: 'Activo',
				typeDocument: 'DNI',
				urlImage: '/static/img/customer-image.jpg',
			},
		],
		longitude: 0,
		groups: [],
		groupId: null,
		modelFilters: {
			department: {},
			departmentId: null,
			distrit: {},
			distritId: null,
			province: {},
			provinceId: null,
		},
		paddingSuccess: 'px-4',
		params: {
			provinceId: null,
			cityId: null,
			parishId: null,
		},
		paramsGoogleMap: {
			input: '',
			inputtype: 'textquery',
			fields: 'geometry/location',
			key: process.env.GOOGLE_MAP_KEY,
		},
		paramsVendors: {
			page: 1,
			limit: 20,
		},
		poligon: {
			description: '',
			id: null,
			name: '',
		},
		polygon: [],
		provinces: [],
		searchValue: '',
		showMenu: false,
		successText: 'Finalizar',
		titleList: 'Clientes',
		vendors: [],
		vendorsSelected: [],
		x: 0,
		y: 0,
		zones: [],
		zoneAssignmentDetail: {},
		zonesData: [],
		zoom: 8,
		disabledSave: true,
		loadingCustomers: false,
		nameSearchGoogle: '',
		showCustomerList: false,
	};
}

export default {
	name: 'page-zone-assignment',
	components: {
		customerModal,
		headerPage,
		mapComponent,
		headingFilter,
		listAside,
		typeEntityId,
	},
	computed: {
		captionNavigation,
		disabledAssign,
		disabledSliderAction,
		disabledSuccessBtn,
		searchReadonly,
		title,
	},
	created,
	data,
	methods: {
		buildBody,
		actionOnRecords,
		assignVendors,
		cancelAssign,
		changeRegistersState,
		cleanData,
		closeModal,
		closeSlide,
		detailZone,
		getCustomersToShow,
		getData,
		getPolygon,
		googleSearch,
		hideMenu,
		loadData,
		loadDepartments,
		loadDistrits,
		loadProvinces,
		loadVendors,
		loadZones,
		onChecked,
		onMain,
		onSearchValue: debounce(onSearchValue),
		onSearchVendor,
		onSelectedAll,
		onSelectedRow,
		openModal,
		openSlide,
		savePoligon,
		savePolygonOnZones,
		setData,
		setPolygonData,
		show,
		changePaths,
		async loadServices() {
			const params = { typeEntityId: typeEntityId.Customer, typeGeneralId: 2 };
			try {
				({ data: this.groups } = await this.$httpSalesRead.get('group', {
					params,
				}));
				this.departments = this.departments.map((depa) => {
					const newDepa = { ...depa };
					newDepa.name = this.truncText(depa.name, 20);
					return newDepa;
				});
			} catch (err) {
				if (err.status === 500) {
					this.showGenericError();
				}
			}
		},
		onSearch() {
			const { parishId, cityId, provinceId } = this.params;
			if (parishId || cityId || provinceId) {
				this.loadData();
			}
			this.googleSearch(this.nameSearchGoogle);
		},
	},
	props: {
		id: [Number, String],
	},
	beforeDestroy() {
		window.location.reload(true);
	},
};
</script>

<style lang="scss" scoped>
.map-container {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
}

.full-page {
	margin: 0 -12px;
}
</style>
