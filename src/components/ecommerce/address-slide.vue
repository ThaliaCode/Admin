<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12 pb-2 v-if="$route.name === 'configuration'">
				<app-select
					:item="model.provinceId"
					item-text="name"
					item-value="id"
					:items="provinces"
					:label="labelsByCountry.labelProvince"
					model="provinceId"
					:return-object="false"
					@input="setData"
				/>
				<span class="form-group__message" v-if="!model.provinceId">
					Es necesario seleccionar
					{{ labelsByCountry.labelProvince === 'Provincia' ? 'una' : 'un' }}
					{{ labelsByCountry.labelProvince }}
				</span>
			</v-flex>
			<v-flex xs12 pb-2 v-if="$route.name === 'configuration'">
				<app-select
					:item="model.cityId"
					item-text="name"
					item-value="id"
					:items="cities"
					:disable="!model.provinceId"
					:readonly="!model.provinceId"
					:label="labelsByCountry.labelCity"
					model="cityId"
					:return-object="false"
					@input="setData"
				/>
				<span class="form-group__message" v-if="model.provinceId && !model.cityId">
					Es necesario seleccionar una {{ labelsByCountry.labelCity }}
				</span>
			</v-flex>
			<v-flex xs12 pb-2 v-if="$route.name === 'configuration'">
				<app-select
					:item="model.parishId"
					item-text="name"
					item-value="id"
					:items="parishes"
					:disable="!model.cityId"
					:readonly="!model.cityId"
					:label="labelsByCountry.labelParish"
					model="parishId"
					:return-object="false"
					@input="setData"
				/>
				<span class="form-group__message" v-if="model.cityId && !model.parishId">
					Es necesario seleccionar
					{{ labelsByCountry.labelParish === 'Parroquia' ? 'una' : 'un' }}
					{{ labelsByCountry.labelParish }}
				</span>
			</v-flex>
			<v-flex xs6 pr-2 pb-2>
				<app-input-text
					label="Latitud"
					model="latitude"
					:text="commerce.latitude"
					type="number"
					@input="$emit('get-data', $event)"
				></app-input-text>
			</v-flex>
			<v-flex xs6 pl-2 pb-2>
				<app-input-text
					label="Longitud"
					model="longitude"
					:text="commerce.longitude"
					type="number"
					@input="$emit('get-data', $event)"
				></app-input-text>
			</v-flex>
			<v-flex xs12 pb-2>
				<app-input-text
					label="Dirección"
					model="address"
					:text="commerce.address"
					@input="setAddress"
				></app-input-text>
				<span class="form-group__message" v-if="!commerce.address">
					La dirección es requerida
				</span>
			</v-flex>
			<v-flex
				xs12
				pb-2
				v-if="
					$route.name === 'free-orders' ||
					$route.name === 'courier' ||
					$route.name === 'orders' ||
					$route.name === 'pending-orders-list' ||
					$route.name === 'detail-route-distribution'
				"
			>
				<app-input-text
					textarea
					no-resize
					label="Comentario"
					model="comentary"
					:text="commerce.comentary"
					@input="$emit('get-data', $event)"
				/>
			</v-flex>
			<v-flex xs12>
				<p class="map-caption caption">
					¿La ubicación no es exacta? Fija el punto <span>rojo</span>
				</p>
			</v-flex>
			<v-flex xs12>
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
		<section class="fast-register-footer">
			<modal-sidebar-button
				:img="false"
				:is-loading="
					disabled ||
					!this.commerce.address ||
					!this.commerce.latitude ||
					!this.commerce.longitude
				"
				@accept-button-clicked="acceptAction"
				@cancel-button-clicked="$emit('cancel-action')"
			/>
		</section>
	</div>
</template>

<script>
import helper from '@/shared/helper';
import mapComponent from '@/components/shared/map/map-component';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

const { debounce } = helper;

function created() {
	this.geoposition = this.labelsByCountry.geoposition;
	if (!!this.commerce.latitude && !!this.commerce.longitude) {
		this.setMarkers(this.commerce.latitude, this.commerce.longitude);
	} else {
		this.setMarkers();
	}
}

function acceptAction() {
	const body = {
		ubigeo: this.ubigeo,
		comments: this.model.comentary,
		city: {
			id: this.model.cityId,
			name: this.cityName,
		},
		parish: {
			id: this.model.parishId,
			name: this.parishName,
		},
		province: {
			id: this.model.provinceId,
			name: this.provinceName,
		},
	};
	this.$emit('accept-action', body);
}

function disabled() {
	return this.loading || this.validatedPageCommerce();
}

function validatedPageCommerce() {
	if (this.$route.name === 'configuration') {
		return !this.model.parishId || !this.model.cityId || !this.model.provinceId;
	}
	return false;
}

async function googleSearch(input, cache = true) {
	const search = input.replace(/\s/g, '+');
	let concatInput = `${search},+${this.labelsByCountry.name}`;
	if (this.model.parishId && this.model.cityId && this.model.provinceId) {
		concatInput = `${search},+${this.provinceName},+${this.cityName},+${this.parishName},+${this.labelsByCountry.name}`;
	} else if (this.model.cityId && this.model.provinceId) {
		concatInput = `${search},+${this.provinceName},+${this.cityName},+${this.labelsByCountry.name}`;
	} else if (this.model.cityId) {
		concatInput = `${search},+${this.cityName},+${this.labelsByCountry.name}`;
	}
	const inputValue = concatInput.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	const places = await this.$httpSales.get('google-place-locate', {
		params: { input: inputValue, cache },
	});
	const points = places.data.results[0].geometry.location;
	const { lat, lng } = points;
	this.commerce.latitude = lat;
	this.commerce.longitude = lng;
	this.$emit('get-data', { model: 'latitude', value: lat });
	this.$emit('get-data', { model: 'longitude', value: lng });
	this.geoposition = points;
	this.markers[0].position = this.geoposition;
	this.zoom = 15;
}

async function loadCitiesByProvince(
	id,
	citySelectedName,
	parishSelectedName,
	subLocality
) {
	({ data: this.cities } = await this.$httpSales.get(`cities/${id}`));
	this.model.parishId = null;
	this.parishName = '';
	this.parishes = [];
	this.model.cityId = null;
	this.cityName = '';
	if (citySelectedName) {
		const citySelected = this.cities.find((c) =>
			citySelectedName.includes(this.formatText(c.name))
		);
		if (citySelected) {
			this.model.cityId = citySelected.id;
			this.cityName = citySelected.name;
		}
		if (this.model.cityId) {
			this.loadParishByCity(this.model.cityId, parishSelectedName, subLocality);
		}
	} else if (this.commerce.ubigeoData && this.commerce.ubigeoData.city.id) {
		this.model.cityId = this.commerce.ubigeoData.city.id;
		if (this.model.cityId) {
			this.loadParishByCity(this.model.cityId);
		}
	} else {
		this.googleSearch(this.provinceName);
	}
	if (id) {
		const province = this.provinces.find((p) => p.id === id) || {};
		this.provinceName = province.name;
	}
}

function loadData() {
	this.model.provinceId = this.commerce.ubigeoData.province.id;
	this.zoom = 15;
	if (this.model.provinceId) {
		this.loadCitiesByProvince(this.model.provinceId);
	}
}

async function loadParishByCity(id, parishSelectedName, subLocality) {
	({ data: this.parishes } = await this.$httpSales.get(`parish/${id}`));
	if (parishSelectedName) {
		const parishSelected = this.parishes.find(
			(p) =>
				parishSelectedName.includes(this.formatText(p.name)) ||
				subLocality.includes(this.formatText(p.name))
		);
		if (parishSelected) {
			this.model.parishId = parishSelected.id;
			this.parishName = parishSelected.name;
		}
	} else if (this.commerce.ubigeoData && this.commerce.ubigeoData.parish.id) {
		this.model.parishId = this.commerce.ubigeoData.parish.id;
		const parish =
			this.parishes.find((c) => c.id === this.commerce.ubigeoData.parish.id) || {};
		this.parishName = parish.name;
	} else {
		this.googleSearch(this.cityName);
	}
	if (id) {
		const city = this.cities.find((c) => c.id === id) || {};
		this.cityName = city.name;
	}
}

async function loadProvinces() {
	({ data: this.provinces } = await this.$httpSales.get('province'));
	const { ubigeoData } = this.commerce;
	if (ubigeoData) {
		const modelValues = Object.keys(ubigeoData);
		const modelValid = modelValues.some((mv) => mv !== 'ubigeo' && !!ubigeoData[mv].id);
		if (modelValid) {
			this.loadData();
		}
	}
}

function onDragend(info) {
	if (info) {
		const latlng = info.latLng;
		const geocoder = new window.google.maps.Geocoder();
		geocoder.geocode({ latLng: latlng }, (result, status) => {
			if (status === 'OK') {
				const geocodeInfo = result[0];
				const { address_components: addressComponents, geometry } = geocodeInfo;
				const { location } = geometry;
				this.$emit('get-data', { model: 'latitude', value: location.lat() });
				this.$emit('get-data', { model: 'longitude', value: location.lng() });
				const provinceComp =
					addressComponents.find((ac) => ac.types[0] === 'administrative_area_level_1') ||
					{};
				const cityComp =
					addressComponents.find((ac) => ac.types[0] === 'administrative_area_level_2') ||
					{};
				const parishComp =
					addressComponents.find((ac) => ac.types[0] === 'locality') || {};
				const sublocalityComp =
					addressComponents.find(
						(ac) => ac.types[9] === 'sublocality' || ac.types[1] === 'sublocality'
					) || {};
				const acComplete = {
					provinceComp: provinceComp.long_name,
					cityComp: cityComp.long_name,
					parishComp: parishComp.long_name,
					sublocalityComp: sublocalityComp.long_name,
				};
				this.setUbigeoData(acComplete);
			}
		});
	} else {
		this.$emit('get-data', { model: 'latitude', value: this.geoposition.lat });
		this.$emit('get-data', { model: 'longitude', value: this.geoposition.lng });
	}
}

function setAddress({ value }) {
	this.$emit('get-data', { model: 'address', value });
	if (value) {
		this.googleSearch(value, false);
	}
}

function setData({ model, value }) {
	this.model[model] = value;
	if (model === 'provinceId') {
		this.loadCitiesByProvince(value);
	}
	if (model === 'cityId') {
		this.loadParishByCity(value);
	}
	if (model === 'parishId') {
		const parish = this.parishes.find((p) => p.id === value) || {};
		this.ubigeo = parish.description;
		this.parishName = parish.name;
		this.googleSearch(this.parishName);
	}
}

function setMarkers(lat, lng) {
	const myLatlng = lat && lng ? { lat, lng } : this.labelsByCountry.geoposition;
	this.markers.push({
		position: myLatlng,
		draggable: true,
	});
	this.geoposition = myLatlng;
	this.zoom = 15;
	this.loadProvinces();
}

function setUbigeoData({ provinceComp, cityComp, parishComp, sublocalityComp }) {
	const proName = this.formatText(provinceComp);
	const provinceArea = this.provinces.find((p) =>
		proName.includes(this.formatText(p.name))
	);
	if (provinceArea) {
		this.model.provinceId = provinceArea.id;
		this.provinceName = provinceArea.name;
		this.loadCitiesByProvince(
			this.model.provinceId,
			this.formatText(cityComp),
			this.formatText(parishComp),
			this.formatText(sublocalityComp)
		);
	}
}

function formatText(text) {
	return text
		? text
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
		: '';
}

function data() {
	return {
		cities: [],
		cityName: '',
		geoposition: {},
		model: {
			cityId: null,
			parishId: null,
			provinceId: null,
		},
		markers: [],
		parishName: '',
		parishes: [],
		provinceName: '',
		provinces: [],
		ubigeo: null,
		zoom: 8,
	};
}

export default {
	name: 'address-slide',
	components: {
		mapComponent,
		modalSidebarButton,
	},
	computed: {
		disabled,
	},
	created,
	data,
	methods: {
		acceptAction,
		formatText,
		googleSearch,
		loadCitiesByProvince,
		loadData,
		loadParishByCity,
		loadProvinces,
		onDragend,
		setAddress: debounce(setAddress),
		setData,
		setMarkers,
		setUbigeoData,
		validatedPageCommerce,
	},
	props: {
		commerce: {
			default: () => {},
			type: Object,
		},
		loading: {
			default: false,
			type: Boolean,
		},
	},
};
</script>

<style lang="scss" scoped>
.gmap-container {
	height: 330px !important;
}

.map-caption {
	color: color(map-cation);
	font-family: font(open-semibold);
	margin: 10px 0px;

	span {
		color: color(makiRed);
	}
}
</style>
