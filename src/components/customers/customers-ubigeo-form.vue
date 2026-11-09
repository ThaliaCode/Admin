<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12 px-2 mb-1>
				<app-input-text label="Alias" model="alias" :text="alias" @input="setData" />
			</v-flex>
			<v-flex xs12 px-2 mb-1>
				<app-select
					:item="model.provinceId"
					item-text="name"
					item-value="id"
					:items="provinces"
					label="Provincia"
					model="provinceId"
					:return-object="false"
					@input="setData"
				/>
				<span class="error--text caption" v-if="disabled">
					Es necesario seleccionar una provincia
				</span>
			</v-flex>
			<v-flex xs12 px-2 mb-1>
				<app-select
					:item="model.cityId"
					item-text="name"
					item-value="id"
					:items="cities"
					:disable="!model.provinceId"
					:readonly="!model.provinceId"
					label="Ciudad"
					model="cityId"
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 mb-1>
				<app-select
					:item="model.parishId"
					item-text="name"
					item-value="id"
					:items="parishes"
					:disable="!model.cityId"
					:readonly="!model.cityId"
					label="Parroquia"
					model="parishId"
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 mb-1>
				<app-input-text label="Zona" model="zone" :text="model.zone" @input="setData" />
			</v-flex>
			<v-flex xs12 px-2 mb-1>
				<app-input-text
					label="Cod. Postal"
					model="postalCode"
					:text="model.postalCode"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 mb-1 mt-2>
				<span v-if="isLocationSelected" class="secondary--text caption">
					Precise su ubicación usando el marcador ubicado en el mapa
				</span>
			</v-flex>
			<v-flex xs12 mt-3 px-2 mb-1>
				<app-input-text
					id="ubigeo-map"
					:readonly="disabled"
					:disabled="disabled"
					label="Geoposición"
					model="geoposition"
					tabindex="5"
					:text="model.geoposition"
					@input="setData"
				/>
				<div class="static-map" v-if="!disabled">
					<map-component
						:zoom="zoom"
						:markers="markers"
						:center-location="geoposition"
						@on-dragend="onDragend"
					/>
				</div>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@cancel-button-clicked="cancel"
				@accept-button-clicked="$emit('save', { ...model, alias })"
			/>
		</section>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import mapComponent from '@/components/shared/map/map-component';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	const myLatlng = { lat: -0.1764507, lng: -78.47527600000001 };
	this.markers.push({
		position: myLatlng,
		draggable: true,
	});
	this.geoposition = myLatlng;
	this.loadProvinces();
}

function cancel() {
	this.alias = '';
	this.geoposition = '';
	this.markers = [];
	this.model = {
		cityId: null,
		geoposition: '',
		latitude: null,
		longitude: null,
		parishId: null,
		postalCode: '',
		provinceId: null,
		zone: '',
	};
	this.$emit('cancel');
}

function disabled() {
	return this.$v.$invalid;
}

function isLocationSelected() {
	return (
		this.model.provinceId !== null &&
		this.model.latitude === null &&
		this.model.longitude === null
	);
}

async function googleSearch(search) {
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
	this.geoposition = places.data.results[0].geometry.location;
	this.markers[0].position = this.geoposition;
}

async function loadCitiesByProvince(id) {
	({ data: this.cities } = await this.$httpSales.get(`cities/${id}`));
	this.model.parishId = null;
	this.parishName = '';
	this.parishes = [];
	this.model.cityId = null;
	this.cityName = '';
	if (this.modelData && this.modelData.cityId) {
		this.model.cityId = this.modelData.cityId;
		if (this.model.cityId) {
			this.loadParishByCity(this.model.cityId);
		}
	} else {
		const province = this.provinces.find((p) => p.id === id) || {};
		this.provinceName = province.name;
		this.googleSearch(this.provinceName);
	}
}

function loadData() {
	this.alias = this.modelData.alias;
	this.model.geoposition = this.modelData.geoposition;
	this.model.latitude = this.modelData.latitude;
	this.model.longitude = this.modelData.longitude;
	this.geoposition = {
		lat: this.model.latitude,
		lng: this.model.longitude,
	};
	this.model.postalCode = this.modelData.postalCode;
	this.model.provinceId = this.modelData.provinceId;
	this.model.zone = this.modelData.zone;
	this.markers[0].position = {
		lat: this.model.latitude,
		lng: this.model.longitude,
	};
	this.zoom = 16;
	if (this.model.provinceId) {
		this.loadCitiesByProvince(this.model.provinceId);
	}
}

async function loadParishByCity(id) {
	({ data: this.parishes } = await this.$httpSales.get(`parish/${id}`));
	if (this.modelData && this.modelData.parishId) {
		this.model.parishId = this.modelData.parishId;
	} else {
		const city = this.cities.find((c) => c.id === id) || {};
		this.cityName = city.name;
		this.googleSearch(this.cityName);
	}
}

async function loadProvinces() {
	({ data: this.provinces } = await this.$httpSales.get('province'));
	const modelValues = Object.keys(this.modelData);
	const modelValid = modelValues.some((mv) => !!this.modelData[mv]);
	if (modelValid) {
		this.loadData();
	}
}

function markersCustom({ lat, lng }) {
	this.markers.push({ color: 'pink', lat, lng, size: 'normal' });
}

function onDragend(info) {
	if (info) {
		const latlng = info.latLng;
		const geocoder = new window.google.maps.Geocoder();
		geocoder.geocode({ latLng: latlng }, (result, status) => {
			if (status === 'OK') {
				const geocodeInfo = result[0];
				const { location } = geocodeInfo.geometry;
				this.model.geoposition = geocodeInfo.formatted_address;
				this.model.latitude = location.lat();
				this.model.longitude = location.lng();
			}
		});
	} else {
		this.model.latitude = this.geoposition.lat;
		this.model.longitude = this.geoposition.lng;
		this.model.geoposition = '';
	}
}

function setData({ model, value }) {
	if (model === 'alias') {
		this[model] = value;
	} else {
		this.model[model] = value;
	}
	if (model === 'provinceId') {
		this.loadCitiesByProvince(value);
	}
	if (model === 'cityId') {
		this.loadParishByCity(value);
	}
	if (model === 'parishId') {
		const parish = this.parishes.find((p) => p.id === value) || {};
		this.parishName = parish.name;
		this.googleSearch(this.parishName);
	}
}

function validations() {
	return { model: { provinceId: { required } } };
}

function data() {
	return {
		alias: '',
		cities: [],
		cityName: '',
		geoposition: {},
		markers: [],
		model: {
			cityId: null,
			geoposition: '',
			latitude: null,
			longitude: null,
			parishId: null,
			postalCode: '',
			provinceId: null,
			zone: '',
		},
		parishName: '',
		parishes: [],
		provinceName: '',
		provinces: [],
		zoom: 8,
	};
}

export default {
	name: 'customers-ubigeo-form',
	components: {
		mapComponent,
		modalSidebarButton,
	},
	computed: {
		disabled,
		isLocationSelected,
	},
	created,
	data,
	methods: {
		cancel,
		googleSearch,
		loadCitiesByProvince,
		loadData,
		loadParishByCity,
		loadProvinces,
		markersCustom,
		onDragend,
		setData,
	},
	props: {
		modelData: {
			default: () => {},
			type: Object,
		},
	},
	validations,
};
</script>

<style lang="scss" scoped>
.static-map {
	background-color: map-get($colors, white);
	margin-top: 6px;
	text-align: center;

	.gmap-container {
		height: 353px !important;
	}

	img {
		height: 305px;
		margin: 7px auto;
	}
}
</style>
