<template>
	<div>
		<header-page
			caption-navigation="Añadiendo Direcciones a Cliente"
			justify-class="justify-start"
			:title="title"
			to-show
			:show-excel="false"
			:show-clean="false"
		></header-page>
		<v-layout row wrap>
			<v-flex xs5 class="position-relative">
				<v-layout row wrap>
					<v-flex xs6 px-4>
						<router-link to="/customers" class="action-address success--text caption">
							<v-icon color="success" size="16">chevron_left</v-icon>
							Volver al listado de clientes
						</router-link>
					</v-flex>
					<v-flex xs6 px-4 mt-2 v-if="!customer.flagActive" style="text-align: right">
						<label style="font-size: 15px; font-weight: bold" class="error--text"
							>Cliente bloqueado</label
						>
					</v-flex>
					<v-flex xs12 px-4 pt-3>
						<label class="label-address">Ingrese los datos de su nueva dirección</label>
					</v-flex>
					<v-flex xs12>
						<customers-ubigeo-info
							:cities="cities"
							:disabled="disabled"
							:model="model"
							:parishes="parishes"
							:provinces="provinces"
							@set-data="setData"
							@set-data-img="setDataImg"
						></customers-ubigeo-info>
					</v-flex>
					<v-flex xs12>
						<customers-address-list
							:clean-search="cleanSearch"
							:columns="columns"
							:current-page="currentPage"
							:items-quantity="addresses.length"
							:items-total-quantity="registersTotal"
							:last-page="lastPage"
							:rows="addresses"
							@change-state="onChangeState"
							@click-icon="onMain"
							@delete-address="openConfirmation"
							@edit-address="showAddress"
							@on-page="loadAddresses"
						></customers-address-list>
					</v-flex>
					<v-flex xs12>
						<modal-sidebar-button
							:img="false"
							cancel-color="primary"
							:cancel-text="cancelText"
							:is-loading="loading"
							:on-run-service="addDisabled"
							outline-btn
							padding-cancel="px-5 py-2"
							padding-success="px-5 py-2"
							success-color="primary"
							:success-text="successText"
							@accept-button-clicked="acceptAction"
							@cancel-button-clicked="cleanAction"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs7 px-2 white>
				<v-layout row wrap>
					<v-flex xs12 pt-3 pb-1>
						<label class="label-section">Busca una dirección</label>
					</v-flex>
					<v-flex xs6 py-3>
						<autocomplete-address v-model="searchAddress" @place-selected="getAddress" />
						<!-- <app-input-text
							id="searcher-address"
							placeholder="Dirección"
							model="searchAddress"
							:text="searchAddress"
							@input="autocompleteAddress"
						/> -->
						<!-- <app-input-text
							id="searcher-address"
							placeholder="Dirección"
							model="searchAddress"
							:text="searchAddress"
							@input="autocompleteAddress"
						/> -->
						<!-- <v-text-field
							ref="searcher"
							label="Busca una dirección"
							placeholder="Dirección"
							@focus="initAutocomplete"
							v-model="searchAddress"
						/> -->
					</v-flex>
					<v-flex xs6 py-3 v-show="isLoading">
						<div
							style="
								display: flex;
								align-items: center;
								justify-content: flex-end;
								gap: 5px;
							"
						>
							<v-progress-circular indeterminate color="primary" size="16" />
							<span style="font-size: 0.8rem; color: #aaa"> Obteniendo ubicación </span>
						</div>
					</v-flex>
				</v-layout>

				<div class="static-map">
					<map-component
						:zoom="zoom"
						:markers="markers"
						:center-location="geoposition"
						@on-dragend="onDragend"
					/>
				</div>
			</v-flex>
		</v-layout>
		<v-dialog v-model="dialog" persistent max-width="425">
			<v-card>
				<v-card-title class="headline justify-center">
					{{ titleDialog }}
				</v-card-title>
				<v-card-text class="subtext">
					{{ subtextDialog }}
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="cancelDelete"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								color="success"
								class="btn-action white--text"
								@click.native="deleteAddress"
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
import customersAddressList from '@/components/customers/customers-address-list';
import customersUbigeoInfo from '@/components/customers/customers-ubigeo-info';
import headerPage from '@/components/shared/header-page';
import autocompleteAddress from '@/components/shared/autocomplete-address';
import mapComponent from '@/components/shared/map/map-component';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	const myLatlng = this.labelsByCountry.geoposition;
	this.markers.push({
		position: myLatlng,
		draggable: true,
	});
	this.geoposition = myLatlng;
	this.model.customerId = Number(this.id);
	this.model.type = 2;
	this.params.customerId = this.model.customerId;
	this.columns[3].name = this.isPeru ? 'Distrito' : 'Parroquia';
	this.loadProvinces();
	this.loadCustomer();
	this.loadAddresses();
}

async function acceptAction() {
	this.loading = true;
	const method = this.modelEdit.id ? 'patch' : 'post';
	const url = this.modelEdit.id
		? `customers-address/${this.modelEdit.id}`
		: 'customers-address';
	const message = this.modelEdit.id ? 'actualizada' : 'creada';
	const body = { ...this.model };
	if (this.modelEdit.id) {
		delete body.type;
	}
	try {
		await this.$httpSales[method](url, body);
		this.showNotification(`La dirección ha sido ${message} correctamente.`);
		this.cleanAction();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function addDisabled() {
	return this.disabled || this.loading;
}

// function autocompleteAddress() {
// 	const input = document.getElementById('searcher-address');
// 	const autocomplete = new window.google.maps.places.PlaceAutocompleteElement(
// 		input,
// 		{
// 			types: ['geocode'],
// 		}
// 	);
// 	autocomplete.addListener('place_changed', () => {
// 		const place = autocomplete.getPlace();
// 		this.getAddress(place);
// 	});
// }

function cancelDelete() {
	this.dialog = false;
	this.addressId = null;
	this.titleDialog = '';
	this.subtextDialog = '';
}

function cleanAction() {
	const myLatlng = this.labelsByCountry.geoposition;
	this.cancelText = 'Limpiar';
	this.successText = 'Agregar';
	this.markers[0].position = myLatlng;
	this.geoposition = myLatlng;
	this.addressId = null;
	this.cities = [];
	this.cityName = '';
	this.model.addressLine1 = '';
	this.model.addressLine2 = '';
	this.model.additionalInformation = {
		urlLocation: null,
	};
	this.model.cityId = null;
	this.model.latitude = null;
	this.model.longitude = null;
	this.model.name = '';
	this.model.parishId = null;
	this.model.provinceId = null;
	this.model.zipcode = '';
	this.model.reference = '';
	this.model.number = '';
	this.modelEdit = {
		addressLine1: '',
		addressLine2: '',
		additionalInformation: {
			urlLocation: null,
		},
		cityId: null,
		customerId: null,
		documentNumber: null,
		id: null,
		latitude: null,
		longitude: null,
		name: '',
		parishId: null,
		phone: '',
		provinceId: null,
		zipcode: '',
		reference: '',
		number: '',
	};
	this.params.page = 1;
	this.parishes = [];
	this.parishName = '';
	this.provinceName = '';
	this.searchAddress = '';
	this.zoom = 8;
	this.loadProvinces();
	this.loadAddresses();
}

async function deleteAddress() {
	const body = { customerId: this.model.customerId };
	try {
		await this.$httpSales.delete(`customers-address/${this.addressId}`, {
			data: body,
		});
		this.showNotification('La dirección ha sido eliminada correctamente.');
		this.cancelDelete();
		this.cleanAction();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'CUSTOMER_ADDRESS_NOT_FOUND') {
				this.showGenericError('La dirección del cliente no existe.');
			} else if (err.data.message === 'CUSTOMER_ADDRESS_USED_ALREADY') {
				this.showGenericError(
					'La dirección no puede ser eliminada porque ya está siendo usada.'
				);
			}
		}
	}
}

function disabled() {
	return !this.model.provinceId;
}

/* eslint-disable camelcase */
function getAddress(value) {
	const { geometry, formatted_address } = value;
	if (geometry) {
		const { location } = geometry;
		this.model.addressLine1 = formatted_address;
		this.model.latitude = location.lat();
		this.model.longitude = location.lng();
		this.geoposition = { lat: location.lat(), lng: location.lng() };
		if (this.markers.length > 0) {
			this.markers[0].position = this.geoposition;
		}
	} else {
		this.model.addressLine1 = '';
	}
}

async function googleSearch(search, onSelect) {
	let concatInput = `${search},+${this.labelsByCountry.name}`;
	if (this.model.cityId && this.model.provinceId) {
		concatInput = `${search},+${this.provinceName},+${this.cityName},+${this.labelsByCountry.name}`;
		this.zoom = 16;
	} else if (this.model.cityId) {
		concatInput = `${search},+${this.cityName},+${this.labelsByCountry.name}`;
		this.zoom = 14;
	} else {
		this.zoom = 10;
	}
	const inputValue = concatInput.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	const places = await this.$httpSales.get('google-place-locate', {
		params: { input: inputValue, cache: true },
	});
	const { latitude, longitude } = this.modelEdit;
	const geoData =
		this.modelEdit.id && !onSelect
			? { lat: latitude, lng: longitude }
			: places.data && places.data.results[0].geometry.location;
	this.geoposition = geoData;
	this.model.latitude = this.geoposition.lat;
	this.model.longitude = this.geoposition.lng;
	if (this.markers.length > 0) {
		this.markers[0].position = this.geoposition;
	}
}

async function loadAddresses(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	const params = { ...this.params };
	const { data: addresses, headers } = await this.$httpSales.get('customers-address', {
		params,
	});
	this.addresses = addresses.map((a) => {
		const newA = { ...a };
		newA.provinceName = a.province ? a.province.name : '';
		newA.cityName = a.city ? a.city.name : '';
		newA.parishName = a.parish ? a.parish.name : '';
		return newA;
	});
	this.lastPage = Number(headers['x-last-page']);
	this.registersTotal = Number(headers['x-quantity']);
}

async function loadCitiesByProvince(id, onSelect) {
	({ data: this.cities } = await this.$httpSales.get(`cities/${id}`));
	this.model.parishId = null;
	this.parishName = '';
	this.parishes = [];
	this.model.cityId = null;
	this.cityName = '';
	const province = this.provinces.find((p) => p.id === id) || {};
	this.provinceName = province.name;
	if (this.modelEdit.cityId && !onSelect) {
		this.model.cityId = this.modelEdit.cityId;
		this.loadParishByCity(this.model.cityId, onSelect);
	} else {
		this.googleSearch(this.provinceName, onSelect);
	}
}

async function loadCustomer() {
	({ data: this.customer } = await this.$httpSales.get(`customers/${this.id}`));
	const { fullName, documentNumber } = this.customer.typePerson;
	this.customerFullName = fullName;
	this.model.documentNumber = documentNumber || null;
	this.model.phone = this.customer.phone;
	this.title = `${this.customerFullName} - ${this.$route.meta.title}`;
}

async function loadParishByCity(id, onSelect) {
	({ data: this.parishes } = await this.$httpSales.get(`parish/${id}`));
	const city = this.cities.find((c) => c.id === id) || {};
	this.cityName = city.name;
	if (this.modelEdit.parishId && !onSelect) {
		this.model.parishId = this.modelEdit.parishId;
		const parish = this.parishes.find((p) => p.id === this.model.parishId) || {};
		this.parishName = parish.name;
		this.googleSearch(this.parishName, onSelect);
	} else {
		this.googleSearch(this.cityName, onSelect);
	}
}

async function loadProvinces() {
	({ data: this.provinces } = await this.$httpSales.get('province'));
}

function openConfirmation({ id, name, addressLine1 }) {
	const titleName = `¿Deseas Eliminar la dirección con alias "${name}"?`;
	const titleAddress = `¿Deseas Eliminar la dirección "${addressLine1}"?`;
	this.addressId = id;
	this.titleDialog = name ? titleName : titleAddress;
	this.subtextDialog = `Recuerda que al aceptar esta acción, la dirección será eliminada del listado de direcciones para el cliente ${this.customerFullName}`;
	this.dialog = true;
}

function setAddress({ model, value }) {
	this[model] = value;
}

function setData({ model, value }, onSelect) {
	this.model[model] = value;
	if (model === 'provinceId') {
		this.loadCitiesByProvince(value, onSelect);
	}
	if (model === 'cityId') {
		this.loadParishByCity(value, onSelect);
	}
	if (model === 'parishId') {
		const parish = this.parishes.find((p) => p.id === value) || {};
		this.parishName = parish.name;
		this.googleSearch(this.parishName, onSelect);
	}
}

function showAddress(address) {
	this.cancelText = 'Cancelar';
	this.successText = 'Actualizar';
	this.modelEdit = { ...address };
	this.model.addressLine1 = this.modelEdit.addressLine1;
	this.model.addressLine2 = this.modelEdit.addressLine2;
	this.model.name = this.modelEdit.name;
	this.model.provinceId = this.modelEdit.provinceId;
	this.model.zipcode = this.modelEdit.zipcode;
	this.model.reference = this.modelEdit.reference;
	this.model.number = this.modelEdit.number;
	this.model.additionalInformation.urlLocation =
		this.modelEdit.additionalInformation &&
		this.modelEdit.additionalInformation.urlLocation;
	if (this.model.provinceId) {
		this.loadCitiesByProvince(this.model.provinceId, false);
	}
}

function data() {
	return {
		addressId: null,
		addresses: [],
		cancelText: 'Limpiar',
		cleanSearch: false,
		columns: [
			{
				id: 1,
				name: 'Alias',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Provincia',
				value: 'provinceName',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Ciudad',
				value: 'cityName',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Parroquia',
				value: 'parishName',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Dirección',
				value: 'addressLine1',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Acciones',
				value: 'actions',
				checked: true,
				visible: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		customer: {},
		customerFullName: '',
		cities: [],
		cityName: '',
		dialog: false,
		geoposition: {},
		lastPage: 0,
		loading: false,
		markers: [],
		model: {
			addressLine1: '',
			addressLine2: '',
			additionalInformation: {
				urlLocation: null,
			},
			cityId: null,
			customerId: null,
			documentNumber: null,
			latitude: null,
			longitude: null,
			name: '',
			parishId: null,
			phone: '',
			provinceId: null,
			zipcode: '',
			reference: '',
			number: '',
		},
		modelEdit: {
			addressLine1: '',
			addressLine2: '',
			additionalInformation: {
				urlLocation: null,
			},
			cityId: null,
			customerId: null,
			documentNumber: null,
			id: null,
			latitude: null,
			longitude: null,
			name: '',
			parishId: null,
			phone: '',
			provinceId: null,
			zipcode: '',
			reference: '',
			number: '',
		},
		params: {
			limit: 4,
			page: 1,
		},
		parishes: [],
		parishName: '',
		provinceName: '',
		provinces: [],
		registersTotal: 0,
		searchAddress: '',
		autocomplete: null,
		subtextDialog: '',
		successText: 'Agregar',
		titleDialog: '',
		title: '',
		zoom: 8,
		isLoading: false,
		debounceTimeout: null,
	};
}

export default {
	name: 'customer-address',
	components: {
		customersAddressList,
		customersUbigeoInfo,
		headerPage,
		mapComponent,
		modalSidebarButton,
		autocompleteAddress,
	},
	computed: {
		addDisabled,
		disabled,
	},
	created,
	data,
	methods: {
		acceptAction,
		// autocompleteAddress,
		cancelDelete,
		cleanAction,
		deleteAddress,
		getAddress,
		googleSearch,
		loadAddresses,
		loadCitiesByProvince,
		loadCustomer,
		loadParishByCity,
		loadProvinces,
		openConfirmation,
		setAddress,
		setData,
		showAddress,
		setDataImg(img) {
			this.model.additionalInformation.urlLocation = img;
		},
		initAutocomplete() {
			if (this.autocomplete) return; // prevenir múltiples instancias
			console.log('init', this.autocomplete);

			// Accede al input real dentro del v-text-field
			const input = this.$refs.searcher.$el.querySelector('input');
			if (!input) return;

			this.autocomplete = new window.google.maps.places.Autocomplete(input, {
				types: ['geocode'],
				componentRestrictions: { country: 'pe' },
			});

			this.autocomplete.setFields(['formatted_address', 'geometry']);

			this.autocomplete.addListener('place_changed', () => {
				const place = this.autocomplete.getPlace();
				console.log('place_changed', place);

				this.getAddress(place);
			});
		},
		onDragend(info) {
			// Primero encendemos la animación
			this.isLoading = true;

			// Limpiamos debounce anterior
			if (this.debounceTimeout) {
				clearTimeout(this.debounceTimeout);
			}

			// Ejecutamos la función de debounce con delay de 1000ms (ajustable)
			this.debounceTimeout = setTimeout(() => {
				if (info) {
					const latlng = info.latLng;
					const geocoder = new window.google.maps.Geocoder();
					geocoder.geocode({ latLng: latlng }, (result, status) => {
						if (status === 'OK') {
							const geocodeInfo = result[0];
							const { location } = geocodeInfo.geometry;
							this.model.addressLine1 = geocodeInfo.formatted_address;
							this.searchAddress = geocodeInfo.formatted_address;
							this.model.latitude = location.lat();
							this.model.longitude = location.lng();
						}
						this.isLoading = false; // apagamos la animación cuando termine
					});
				} else {
					this.model.latitude = this.geoposition.lat;
					this.model.longitude = this.geoposition.lng;
					this.model.addressLine1 = '';
					this.isLoading = false; // apagamos la animación cuando no hay info
				}
			}, 1000);
		},
		async onMain(row) {
			const currentFavorite = this.addresses.find((a) => a.isFavorite);
			if (currentFavorite && currentFavorite.id !== row.id) {
				this.showGenericError(
					'Ya existe una dirección principal. Si deseas cambiarla, primero desmarca la actual.'
				);
				return;
			}
			this.loading = true;
			const body = {
				isFavorite: !row.isFavorite,
			};
			try {
				await this.$httpSales.patch(`customers-address/${row.id}`, body);
				this.showNotification('La dirección principal se ha actualizado correctamente.');
				this.cleanAction();
			} catch (err) {
				this.showGenericError();
			} finally {
				this.loading = false;
			}
		},
		async onChangeState({ flagActive, id }) {
			const body = {
				flagActive,
			};
			try {
				await this.$httpSales.patch(`customers-address/${id}`, body);
				this.showNotification('Se actualizó correctamente');
			} catch (error) {
				this.showGenericError();
			}
		},
	},
	props: {
		id: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.label-address {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium);
}

.label-section {
	color: color(paginationText);
	font-family: font(lato-bold);
	font-size: size(medium20);
	text-transform: uppercase;
}

.position-relative {
	height: calc(100vh - 133px);
	position: relative;
}

.set-bottom {
	bottom: 0;
	left: 0;
	position: absolute;
	right: 0;
}

.gmap-container {
	height: calc(100vh - 240px) !important;
}

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
</style>
