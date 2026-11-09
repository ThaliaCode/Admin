<template>
	<div>
		<header-page
			:show-clean="false"
			:show-excel="false"
			:title="$route.meta.title"
			to-show
		></header-page>
		<v-layout wrap pb-5 mb-5>
			<v-flex xs12 md6 px-4>
				<v-layout wrap align-start>
					<v-flex xs12>
						<p class="title-form secondary--text">Datos Generales</p>
					</v-flex>
					<v-flex xs12 md6 pr-2 pb-2 v-if="!hasTerminals">
						<template v-if="validateData.flagUpdate">
							<app-select
								:item="warehouse.subsidiaryId"
								item-text="rzSocial"
								item-value="id"
								:items="subsidiaries"
								:label="labelSucursal()"
								model="subsidiaryId"
								:return-object="false"
								@input="setData"
							></app-select>
							<span
								class="form-group__message"
								v-if="!$v.warehouse.subsidiaryId.required"
							>
								La {{ labelSucursal().toLowerCase() }} es requerida
							</span>
						</template>
						<template v-else>
							<button class="btn-selector" type="button" @click="showErrorMessage">
								<app-select
									:item="warehouse.subsidiaryId"
									item-text="rzSocial"
									item-value="id"
									:items="subsidiaries"
									:label="labelSucursal()"
									model="subsidiaryId"
									readonly
									:return-object="false"
									slot="activator"
									@input="setData"
									@click="showErrorMessage"
								></app-select>
							</button>
						</template>
					</v-flex>
					<v-flex xs12 pl-2 pb-2 :class="{ md6: !hasTerminals }">
						<app-input-text
							label="Nombre"
							model="name"
							:text="warehouse.name"
							@input="setData"
						></app-input-text>
						<span class="form-group__message" v-if="!$v.warehouse.name.required">
							El nombre es requerido
						</span>
					</v-flex>
					<v-flex xs12 md6 pb-2 pr-2>
						<app-input-text
							label="Código"
							model="code"
							:text="warehouse.code"
							@input="setData"
						></app-input-text>
						<span class="form-group__message" v-if="!$v.warehouse.code.required">
							El código es requerido
						</span>
						<span class="text-not-code-blank" v-if="checkBlankCode(warehouse.code)">
							No se permite espacios en blanco
						</span>
					</v-flex>
					<v-flex xs12 md6 pl-2 pb-2 v-if="isEcuador">
						<app-input-text
							label="Código de Establecimiento"
							model="codeTaxes"
							:text="warehouse.codeTaxes"
							@input="setData"
						></app-input-text>
						<span class="form-group__message" v-if="!$v.warehouse.codeTaxes.required">
							El código de establecimiento es requerido
						</span>
					</v-flex>
					<v-flex xs12 md6 pr-2 pb-2 v-if="warehouse.settings">
						<app-input-text
							label="Color"
							model="color"
							:text="warehouse.settings.color"
							type="color"
							@input="setSettings"
						></app-input-text>
					</v-flex>
					<v-flex xs12 md6 pr-2 pb-2>
						<autocomplete-component
							chips
							item-text="code"
							item-value="code"
							:items="typeDocuments"
							label-value="T. Documento"
							multiple
							:return-object="false"
							:item="warehouse.settings.typeDocuments"
							@return-data="setSettings({ model: 'typeDocuments', value: $event })"
						/>
					</v-flex>
					<v-flex xs12 mb-3>
						<label ref="label" for="upload-create-section" class="w-100">
							<vue-six-four id="upload-create-section" hidden @vue-six-four="getFile" />
							<v-layout wrap>
								<v-flex xs11 mt-1 pr-1>
									<app-input-text
										label="Logo"
										readonly
										:text="warehouse.urlLogo"
									></app-input-text>
								</v-flex>
								<v-flex xs1 mt-4 text-xs-center>
									<v-btn
										class="ma-0 pl-0 btn-auto"
										color="info"
										:disabled="loadingImage"
										small
										@click="showDialog"
									>
										<v-icon color="white">image</v-icon>
									</v-btn>
								</v-flex>
							</v-layout>
						</label>
					</v-flex>
					<v-flex xs12 mb-3 v-if="support">
						<app-select
							item-text="name"
							item-value="name"
							label="Rubro"
							model="rubro"
							:item="selectedBusinessType"
							:items="businessTypes"
							@input="changeBusinessType"
						/>
					</v-flex>
					<v-flex xs12 mb-3 v-if="support">
						<app-select
							item-text="name"
							item-value="name"
							clearable
							label="Motivo de baja"
							model="deactivationReason"
							:item="selectedDeactivationReason"
							:items="deactivationReasons"
							@input="changeDeactivationReason"
						/>
					</v-flex>
					<v-flex xs12 mb-3 v-if="id">
						<v-switch
							hide-details
							class="body-1"
							color="success"
							label="Mostrar tienda en el ecommerce"
							v-model="warehouse.flagEcommerce"
						>
						</v-switch>
					</v-flex>
					<v-flex xs12 md6 pt-4 pr-2 pb-2>
						<v-checkbox
							class="ma-0"
							color="success"
							hide-details
							:label="`${labelWarehouse(true)} principal`"
							v-model="warehouse.isMain"
						></v-checkbox>
					</v-flex>
					<v-flex xs12 pt-4 pr-2 pb-1>
						<v-checkbox
							class="ma-0"
							color="success"
							hide-details
							label="Asignar Lista de Precio"
							v-model="warehouse.isPriceList"
						></v-checkbox>
					</v-flex>
					<v-flex xs7 pt-4 pr-2 pb-2 v-if="warehouse.isPriceList">
						<app-select
							:item="warehouse.priceListId"
							item-text="name"
							item-value="id"
							:items="priceLists"
							label="Seleccionar Lista de Precio"
							model="priceListId"
							@input="setPriceList"
						/>
					</v-flex>
				</v-layout>
				<v-layout row wrap v-if="!warehouse.id && warehousesBySubsidiary.length">
					<v-flex xs12>
						<p class="title-form secondary--text">Copiar producto desde almacén</p>
					</v-flex>
					<v-flex xs12 pb-2>
						<v-radio-group v-model="existingWarehouseId">
							<v-radio
								color="primary"
								:ref="`warehouse${warehouse.id}`"
								v-for="warehouse in warehousesBySubsidiary"
								:key="warehouse.id"
								:label="warehouse.name"
								:value="warehouse.id"
								@click="toggleValue"
							></v-radio>
						</v-radio-group>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 md6 px-4>
				<v-layout wrap>
					<v-flex xs12>
						<p class="title-form secondary--text">Dirección</p>
					</v-flex>
					<v-flex xs12 md6 pr-2 pb-2 v-if="showUbigeoCountry">
						<app-select
							model="departmentId"
							item-text="name"
							item-value="id"
							label="Departamento"
							:items="departments"
							:item="warehouse.departmentId"
							@input="setValueUbigeo"
						/>
					</v-flex>
					<v-flex xs12 md6 pl-2 pb-2 v-if="showUbigeoCountry">
						<app-select
							item-text="name"
							item-value="id"
							label="Provincia"
							:items="provinces"
							:item="warehouse.provinceId"
							model="provinceId"
							@input="setValueUbigeo"
						/>
						<transition name="fade" mode="out-in">
							<span
								class="form-group__message"
								v-if="warehouse.departmentId && !warehouse.provinceId"
							>
								Provincia es requerido
							</span>
						</transition>
					</v-flex>
					<v-flex xs12 md6 pr-2 pb-2 v-if="showUbigeoCountry">
						<app-select
							item-text="name"
							item-value="id"
							label="Distrito"
							:items="districs"
							:item="warehouse.districtId"
							model="districtId"
							@input="setValueUbigeo"
						/>
						<transition name="fade" mode="out-in">
							<span
								class="form-group__message"
								v-if="warehouse.departmentId && !warehouse.districtId"
							>
								Distrito es requerido
							</span>
						</transition>
					</v-flex>
					<v-flex xs12 md6 pl-2 pb-2 v-if="showUbigeoCountry">
						<app-input-text
							label="Ubigeo"
							model="ubigeo"
							:text="warehouse.ubigeo"
							disabled
						></app-input-text>
					</v-flex>
					<v-flex xs12 md6 pr-2 pb-2 v-if="showUbigeoCountry">
						<app-input-text
							label="Latitud"
							model="latitude"
							:text="warehouse.latitude"
							type="number"
							@input="setData"
						></app-input-text>
					</v-flex>
					<v-flex xs12 md6 pl-2 pb-2 v-if="showUbigeoCountry">
						<app-input-text
							label="Longitud"
							model="longitude"
							:text="warehouse.longitude"
							type="number"
							@input="setData"
						></app-input-text>
					</v-flex>
					<v-flex xs12 pb-2>
						<app-input-text
							label="Dirección"
							model="address"
							:text="warehouse.address"
							@input="setAddress"
						></app-input-text>
					</v-flex>
					<v-flex xs12 v-if="showUbigeoCountry">
						<p class="map-caption caption">
							¿La ubicación no es exacta? Fija el punto <span>rojo</span>
						</p>
					</v-flex>
					<v-flex xs12 v-if="showUbigeoCountry">
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
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid || checkBlankCode(warehouse.code) || disabled"
				@cancel-button-clicked="cancel"
				@accept-button-clicked="saveData"
			/>
		</section>
		<v-dialog v-model="error.show" persistent max-width="425">
			<v-card>
				<v-card-title class="headline justify-center">
					{{ error.message }}
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-btn
							color="primary"
							class="btn-action white--text"
							@click.native="closeModalError"
						>
							Entendido
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import mapComponent from '@/components/shared/map/map-component';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import VueSixFour from 'vue-six-four';
import upLoadImageMixin from '@/mixins/upLoadImage';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';

const { debounce } = helper;

function created() {
	this.geoposition = this.labelsByCountry.geoposition;
	this.loadSubsidiaries();
	this.loadPriceList();
	this.loadDepartament();
	this.showUbigeoCountry = !this.$userInfo.company.settings.flagNotUseGlobalUbigeo;
}

async function loadPriceList() {
	try {
		const response = await this.listPricingPromise();
		this.priceLists = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function cancel() {
	this.goTo('page-warehouses');
}

async function changeValidate(subId) {
	const warehouseId = this.id;
	try {
		const { data: valData } = await this.$httpSales(
			`warehouse/${warehouseId}/${subId}/valid-update`
		);
		this.validateData.flagUpdate = valData.flagUpdate || valData.length > 0;
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'INVALID_WAREHOUSE_UPDATE') {
				this.validateData.flagUpdate = false;
			}
		}
	}
}

function closeModalError() {
	this.error.show = false;
	this.error.message = '';
}

async function googleSearch(search = '', cache = true) {
	const {
		departmentId,
		departmentName,
		provinceId,
		provinceName,
		districtId,
		districtName,
	} = this.warehouse;
	let concatInput = `${this.labelsByCountry.name}`;
	let newZoom = 15;
	if (departmentId) {
		newZoom = 12;
		concatInput = `${departmentName},+${concatInput}`;
		if (provinceId) {
			newZoom = 14;
			concatInput = `${provinceName},+${concatInput}`;
			if (districtId) {
				newZoom = 16;
				concatInput = `${districtName},+${concatInput}`;
			}
		}
	}

	this.zoom = newZoom;
	if (search) {
		concatInput = `${search},+${concatInput}`;
	}

	const inputValue = concatInput.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	const places = await this.$httpSales.get('google-place-locate', {
		params: { input: inputValue, cache },
	});
	const points = places.data.results[0].geometry.location;
	const { lat, lng } = points;
	this.warehouse.latitude = lat;
	this.warehouse.longitude = lng;
	this.markers[0].position = points;
	this.geoposition = points;
}

async function loadData() {
	({ data: this.warehouse } = await this.$httpProducts.get(`warehouses/${this.id}`));
	const { subsidiaryId, latitude, longitude, location, settings } = this.warehouse;
	this.selectedBusinessType = settings.item || null;
	this.selectedDeactivationReason = settings.deactivationReason || null;
	this.warehouse.latitude = location ? location.x : latitude;
	this.warehouse.longitude = location ? location.y : longitude;
	this.warehouse.isPriceList = settings ? !!settings.salPriceListId : false;
	this.warehouse.priceListId = settings ? settings.salPriceListId : null;
	if (this.warehouse.settings) {
		this.warehouse.settings.color = settings.color || this.setColorRandom();
		this.warehouse.settings.typeDocuments = settings.typeDocuments || [];
	} else {
		this.warehouse.settings = settings || { color: this.setColorRandom() };
	}
	if (!this.warehouse.settings.typeDocuments) {
		this.warehouse.settings.typeDocuments = [];
	}
	this.setMarkers(this.warehouse.latitude, this.warehouse.longitude);
	if (subsidiaryId) {
		this.loadWarehousesBySubsidiry(subsidiaryId);
		this.changeValidate(subsidiaryId);
	}
	this.loadDepartament();
}

async function loadSubsidiaries() {
	({ data: this.subsidiaries } = await this.subsidiariesList());
	const { data: types } = await this.getTypeDocuments('sales');
	console.log({ types });
	this.typeDocuments = types.map((td) => td.documentType);
	// 	.filter((doc) => doc.flagIncludeNotes);
	if (this.id) {
		this.loadData();
	} else {
		this.setMarkers();
		this.setSettings({ model: 'color', value: this.setColorRandom() });
	}
}

async function loadWarehousesBySubsidiry(subsidiaryId) {
	const params = { subsidiaryId };
	({ data: this.warehousesBySubsidiary } = await this.warehousesList(params));
}

function onDragend(info) {
	if (info) {
		const latlng = info.latLng;
		const geocoder = new window.google.maps.Geocoder();
		geocoder.geocode({ latLng: latlng }, (result, status) => {
			if (status === 'OK') {
				const geocodeInfo = result[0];
				const { location } = geocodeInfo.geometry;
				this.warehouse.address = geocodeInfo.formatted_address;
				this.warehouse.latitude = location.lat();
				this.warehouse.longitude = location.lng();
			}
		});
	} else {
		this.warehouse.address = '';
		this.warehouse.latitude = this.geoposition.lat;
		this.warehouse.longitude = this.geoposition.lng;
	}
}

async function saveData() {
	const url = this.id ? `warehouses/${this.id}` : 'warehouses';
	const method = this.id ? 'patch' : 'post';
	const message = this.id ? 'editada' : 'creada';
	const body = {
		address: this.warehouse.address,
		code: this.warehouse.code,
		isMain: Number(this.warehouse.isMain),
		name: this.warehouse.name,
		subsidiaryId: this.warehouse.subsidiaryId,
		latitude: this.warehouse.latitude,
		longitude: this.warehouse.longitude,
		settings: this.warehouse.settings,
		urlLogo: this.warehouse.urlLogo,
		flagEcommerce: Boolean(this.warehouse.flagEcommerce),
	};
	body.settings.salPriceListId = this.warehouse.priceListId || undefined;
	if (this.isEcuador) {
		body.codeTaxes = this.warehouse.codeTaxes;
	}
	if (this.selectedBusinessType) {
		body.settings.item = this.selectedBusinessType;
	}
	if (this.selectedDeactivationReason) {
		body.settings.deactivationReason = this.selectedDeactivationReason;
	} else {
		delete body.settings.deactivationReason;
	}
	const params = {
		existingWarehouseId: this.existingWarehouseId,
	};
	if (!this.showUbigeoCountry) {
		this.warehouse.departmentId = null;
		delete body.latitude;
		delete body.longitude;
	}
	if (this.warehouse.departmentId) {
		body.departmentId = this.warehouse.departmentId;
		body.departmentName = this.warehouse.departmentName;
		body.provinceId = this.warehouse.provinceId;
		body.provinceName = this.warehouse.provinceName;
		body.districtId = this.warehouse.districtId;
		body.districtName = this.warehouse.districtName;
		body.ubigeo = this.warehouse.ubigeo;
	}
	try {
		await this.$httpProducts[method](url, body, { params });
		this.hasTerminals = false;
		this.showNotification(`La tienda ha sido ${message} correctamente.`);
		this.cancel();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function setPriceList({ model, value }) {
	this.warehouse[model] = value.id;
}

function setAddress({ value }) {
	this.warehouse.address = value;
	if (value && this.showUbigeoCountry) {
		this.googleSearch(value, false);
	}
}

function setSettings({ model, value }) {
	this.warehouse.settings[model] = value;
}

function setColorRandom() {
	return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

function setData({ model, value }) {
	this.warehouse[model] = value;
	if (model === 'subsidiaryId') {
		this.loadWarehousesBySubsidiry(value);
	}
}

function changeBusinessType({ value }) {
	this.selectedBusinessType = value;
}

function changeDeactivationReason({ value }) {
	this.selectedDeactivationReason = value;
}

function setMarkers(lat, lng) {
	const myLatlng =
		this.id && lat && lng ? { lat, lng } : this.labelsByCountry.geoposition;
	this.markers.push({
		position: myLatlng,
		draggable: true,
	});
	this.geoposition = myLatlng;
	this.zoom = 15;
}

function showErrorMessage() {
	this.error.message = `No es posible editar la ${this.labelSucursal().toLowerCase()} de esta tienda porque se encuentra asignada a uno o más procesos.`;
	this.error.show = true;
}

function toggleValue() {
	if (this.existingWarehouseId) {
		this.existingWarehouseId = null;
	}
}

function validations() {
	return {
		warehouse: {
			code: { required },
			codeTaxes: { required: requiredIf(() => this.isEcuador) },
			name: { required },
			subsidiaryId: { required },
		},
	};
}

function data() {
	return {
		support: this.$userInfo.roleCode === 'SUPPORT',
		selectedBusinessType: null,
		businessTypes: [
			'Bodega',
			'Puesto de mercado',
			'Minimarket',
			'Panadería',
			'Licorería',
			'Semi Mayorista',
			'Mayorista',
			'Distribuidor',
			'Kiosko',
			'Otros',
		],
		selectedDeactivationReason: null,
		deactivationReasons: [
			'Maternidad',
			'Problemas de salud',
			'Negocio cerrado',
			'Negocio cerrado temporalmente',
			'Negocio cerrado por extorsión',
			'Cambio de sistema',
			'Temas personales',
			'Problemas con soporte',
			'Problemas con proveedores',
			'Otros',
		],
		error: {
			color: 'error',
			message: '',
			show: false,
		},
		existingWarehouseId: null, 
		geoposition: {},
		showUbigeoCountry: false,
		hasTerminals: false,
		markers: [],
		loadingImage: false,
		params: {
			page: 1,
			subsidiaryId: null,
		},
		subsidiaries: [],
		subsidiaryId: [],
		warehouse: {
			address: '',
			code: '',
			codeTaxes: '',
			id: null,
			isMain: false,
			isPriceList: false,
			priceListId: null,
			latitude: 0,
			longitude: 0,
			flagEcommerce: false,
			name: '',
			settings: {
				typeDocuments: [],
				color: '',
			},
			subsidiaryId: null,
		},
		warehousesBySubsidiary: [],
		validateData: {
			flagUpdate: true,
		},
		zoom: 8,
		allowedFiles: [
			'jpg',
			'jpeg',
			'png',
			'doc',
			'docx',
			'xls',
			'xlsx',
			'pdf',
			'txt',
			'svg',
		],
		departments: [],
		provinces: [],
		districs: [],
		disabled: false,
		typeDocuments: [],
	};
}

export default {
	name: 'page-warehouses-new',
	components: {
		headerPage,
		mapComponent,
		modalSidebarButton,
		VueSixFour,
		autocompleteComponent,
	},
	created,
	data,
	methods: {
		changeBusinessType,
		changeDeactivationReason,
		cancel,
		changeValidate,
		closeModalError,
		googleSearch,
		loadData,
		loadSubsidiaries,
		loadPriceList,
		loadWarehousesBySubsidiry,
		onDragend,
		saveData,
		setAddress: debounce(setAddress, 1100),
		setSettings,
		setColorRandom,
		setData,
		setMarkers,
		setPriceList,
		showErrorMessage,
		toggleValue,
		showDialog() {
			this.$refs.label.click();
		},
		async getFile(fileInfo) {
			this.loadingImage = true;
			const newFile = {
				name: fileInfo.name.replace(/\s/g, '-'),
				base64data: fileInfo.sixFour,
			};
			try {
				const words = newFile.name.split('.');
				const lastItem = words.length;
				const extension = words[lastItem - 1];
				if (this.allowedFiles.indexOf(extension) > -1) {
					const { data: file } = await this.$httpProduction.post('upload-files', newFile);
					const newImage = new Image();
					newImage.onload = () => {
						if (newImage.naturalWidth <= 300) {
							this.warehouse.urlLogo = file.Location;
							this.loadingImage = false;
						} else {
							this.showNotification(
								'El tamaño máximo de ancho permitido es 300px',
								'warning'
							);
							this.loadingImage = false;
						}
					};
					newImage.src = file.Location;
				} else {
					this.showNotification(
						`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
						'warning'
					);
				}
			} catch (err) {
				if (err.status === 500) {
					this.showGenericError();
				}
			}
		},
		setValueUbigeo({ model, value }) {
			if (value) {
				if (model === 'departmentId' && value.id) {
					this.warehouse.departmentId = value.id;
					this.warehouse.departmentName = value.name;
					this.warehouse.provinceId = null;
					this.warehouse.districtId = null;
					this.warehouse.ubigeo = '';
					this.districs = [];
					this.disabled = true;
					this.loadProvince(value.id);
				} else if (model === 'provinceId' && value.id) {
					this.warehouse.districtId = null;
					this.warehouse.provinceId = value.id;
					this.warehouse.provinceName = value.name;
					this.warehouse.ubigeo = '';
					this.disabled = true;
					this.loadDistrict(value.id);
				} else if (model === 'districtId' && value.id) {
					this.warehouse.districtId = value.id;
					this.warehouse.districtName = value.name;
					this.warehouse.ubigeo = value.code;
					this.disabled = false;
				}
				this.googleSearch();
			}
		},
		async loadDepartament() {
			try {
				({ data: this.departments } = await this.$httpSales.get('province'));
				if (this.warehouse.departmentId) {
					this.loadProvince(this.warehouse.departmentId);
				}
			} catch (e) {
				this.showGenericError();
			}
		},
		async loadProvince(id) {
			try {
				({ data: this.provinces } = await this.$httpSales(`cities/${id}`));
				if (this.warehouse.provinceId) {
					this.loadDistrict(this.warehouse.provinceId);
				}
			} catch (e) {
				this.showGenericError();
			}
		},
		async loadDistrict(id) {
			try {
				({ data: this.districs } = await this.$httpSales(`parish/${id}`));
			} catch (e) {
				this.showGenericError();
			}
		},
	},
	mixins: [upLoadImageMixin],
	props: {
		id: [Number, String],
	},
	validations,
};
</script>

<style lang="scss" scoped>
.title-form {
	border-bottom: 1px solid color(border-title);
	font-family: font(lato-regular);
	font-size: size(medium16);
	font-weight: weight(w900);
	margin-top: 33px;
	padding-bottom: 10px;
}

.map-caption {
	color: color(map-cation);
	font-family: font(open-semibold);
	margin: 10px 0px;

	span {
		color: color(makiRed);
	}
}

.gmap-container {
	height: 351px !important;
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

.btn-selector {
	background-color: transparent !important;
	border: 0px !important;
	box-shadow: none !important;
	width: 100% !important;
}
.btn-upload {
	align-items: center;
	background: color(primary);
	border-radius: 0 5px 5px 0;
	display: flex;
	justify-content: center;
	height: 27px;
	margin-top: 21px;
	width: 100%;
}
</style>
