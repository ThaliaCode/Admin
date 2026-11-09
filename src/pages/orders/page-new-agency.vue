<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			label="La carga terminará en un momento."
		/>
		<header-page :title="$route.meta.title" />
		<v-layout class="pt-3 px-5 content-agency">
			<v-layout column>
				<v-flex class="title-agency">DATOS GENERALES</v-flex>
				<v-flex class="mt-3">
					<app-input-text
						label="Código"
						model="code"
						tabindex="1"
						:text="section.code"
						@input="setData"
					/>
					<span class="form-group__message" v-if="!$v.section.code.required">
						El código es requerido
					</span>
				</v-flex>
				<v-flex class="mt-2">
					<app-input-text
						label="Nombre o Razón Social"
						model="name"
						tabindex="2"
						:text="section.name"
						@input="setData"
					/>
					<span class="form-group__message" v-if="!$v.section.name.required">
						El nombre o razón social es requerido
					</span>
				</v-flex>
				<v-flex class="mt-2">
					<app-select
						:item="section.typeDocument"
						item-text="name"
						item-value="id"
						:items="personTypes"
						label="Tipo de Documento"
						model="typeDocument"
						:return-object="false"
						@input="setData"
					></app-select>
					<span
						class="form-group__message"
						v-if="!$v.section.typeDocument.required"
					>
						El tipo de documento es requerido
					</span>
				</v-flex>
				<v-flex class="mt-2">
					<app-input-text
						tabindex="3"
						label="Numero de Documento"
						model="number"
						type="number"
						:text="section.number"
						@input="setData"
					/>
					<span class="form-group__message" v-if="!$v.section.number.required">
						El numero de documento es requerido
					</span>
				</v-flex>
				<v-flex class="mt-2">
					<app-input-text
						tabindex="3"
						label="Contacto"
						model="contact"
						:text="section.contact"
						@input="setData"
					/>
				</v-flex>
				<v-flex class="mt-2">
					<app-input-text
						tabindex="4"
						type="number"
						label="Teléfono"
						model="phone"
						:text="section.phone"
						@input="setData"
					/>
				</v-flex>
				<v-flex class="mt-2">
					<app-input-text
						tabindex="5"
						autocomplete="off"
						type="email"
						label="Email"
						model="email"
						:text="section.email"
						@input="setData"
					/>
				</v-flex>
				<v-flex class="mt-2" v-if="showNumber">
					<app-input-text
						tabindex="6"
						label="Numero MTC "
						model="numberMtc"
						:text="section.numberMtc"
						@input="setData"
					/>
				</v-flex>
				<!-- <v-flex class="mt-2" v-if="showVehicles">
					<app-select
						slotChip
						:item="section.vehicles"
						item-text="name"
						:items="vehicles"
						label="Vehiculos"
						model="vehicles"
						:return-object="false"
						@input="setData"
					></app-select>
				</v-flex> -->
			</v-layout>
			<v-flex xs6 ml-5>
				<v-layout column>
					<v-flex class="title-agency">UBICACIÓN</v-flex>
					<v-flex mt-2 xs4>
						<button
							type="button"
							class="product-add-btn mt-1"
							@click="openNewDirection"
						>
							<span>Agregar Dirección</span>
							<v-icon class="product-add-btn-icon" color="primary" size="17">
								add_circle
							</v-icon>
						</button>
					</v-flex>
					<v-flex mt-3>
						<p class="primary--text text-direction">Dirección:</p>
						<v-layout v-for="(item, index) in directions" :key="index" mb-2>
							<v-flex class="name-direction">
								{{ item.direction }}
							</v-flex>
							<app-tooltip-button
								class="ml-1"
								color="yellowFav"
								:icon="item.flagDefault ? 'star' : 'star_border'"
								text="Favorito"
								:size="19"
								@click-icon="rowFavorite(item, index)"
							/>
							<!-- <app-tooltip-button
								class="ml-1"
								color="success"
								icon="edit"
								text="Editar"
								@click-icon="openEditDirection(item)"
							/> -->
							<app-tooltip-button
								class="ml-1"
								color="error"
								icon="close"
								text="Eliminar"
								@click-icon="deleteDirection(index)"
							/>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-layout column v-if="showVehicles">
					<v-flex class="title-agency">CONDUCTOR</v-flex>
					<v-flex mt-2 xs4>
						<button
							type="button"
							class="product-add-btn mt-1"
							@click="openNewCourier"
						>
							<span>Agregar conductor</span>
							<v-icon class="product-add-btn-icon" color="primary" size="17">
								add_circle
							</v-icon>
						</button>
					</v-flex>
					<v-flex mt-3>
						<p class="primary--text text-direction">Conductores:</p>
						<v-layout v-for="(courier, index) in couriers" :key="index" mb-2>
							<v-flex class="name-direction">
								<div class="d-flex align-center justify-space-between">
									<span>{{ courier.name }}</span>
									<span>{{ courier.phone }}</span>
								</div>
							</v-flex>
							<!-- <app-tooltip-button
								class="ml-1"
								color="yellowFav"
								:icon="item.flagDefault ? 'star' : 'star_border'"
								text="Favorito"
								:size="19"
								@click-icon="rowFavorite(courier, index)"
							/> -->
							<app-tooltip-button
								class="ml-1"
								color="primary"
								icon="edit"
								text="Editar"
								@click-icon="editCourier(courier.id)"
							/>
							<app-tooltip-button
								class="ml-1"
								color="error"
								icon="close"
								text="Eliminar"
								@click-icon="deleteCourier(courier.id)"
							/>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-layout column v-if="showVehicles">
					<v-flex class="title-agency">VEHICULOS</v-flex>

					<v-flex mt-3>
						<autocomplete-component
							chips
							item-text="model"
							item-value="id"
							:items="vehicles"
							label-value="Vehiculos"
							multiple
							:item="vehiclesSelected"
							@return-data="setVehiclesSelected($event)"
						/>
						<!-- <p class="primary--text text-direction">Conductores:</p> -->
					</v-flex>
				</v-layout>
			</v-flex>
			<action-sidebar
				:code-action="action.code"
				:title="action.title"
				:width="action.width"
				v-model="action.open"
				@close-modal="closeModal"
			>
				<new-direction
					v-if="showNewAgency"
					:departments="departments"
					:model="modelFilters"
					:provinces="provinces"
					:distrits="distrits"
					:department-id="modelFilters.departmentId"
					@set-data="getData"
					@set-information="getInformation"
					@save-direction="createDirection"
					@cancel-action="closeModal"
				/>
				<couriers-form
					hidePlates
					v-if="showNewCourier"
					:id="courierId"
					@close="closeModal"
					@save="saveCourier"
				/>
			</action-sidebar>
		</v-layout>
		<v-layout class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="showValidNumber || $v.$invalid"
				success-text="Guardar"
				success-color="primary"
				cancel-text="Atras"
				@cancel-button-clicked="goBack"
				@accept-button-clicked="createNewAgency"
			/>
		</v-layout>
		<v-dialog max-width="450" persistent v-model="dialogDelete">
			<v-card>
				<v-card-text> ¿Desea eliminar la dirección? </v-card-text>
				<v-divider></v-divider>
				<v-card-actions class="wrapper-actions">
					<v-layout row justify-space-around>
						<v-flex xs3>
							<v-btn color="pink" class="btn-action btn-action-block">
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs3>
							<v-btn color="success" class="btn-action btn-action-block">
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import headerPage from '@/components/shared/header-page';
import newDirection from '@/components/distribution/new-direction';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import couriersForm from '@/components/reference-guides/couriers/couriers-form';
import helper from '@/shared/helper';
import { required } from 'vuelidate/lib/validators';

function created() {
	if (this.$route.params && this.$route.params.id) {
		this.id = this.$route.params.id;
		this.loadCouriers();
		this.detailAgency();
	}
	this.showNumber =
		this.$userInfo.company.settings.flagElectronicGuide || false;
	// console.log({
	// 	flagRelateVehicleFloat: this.$userInfo.company.settings.flagRelateVehicleFloat,
	// 	id: this.id,
	// });
	this.showVehicles =
		this.$userInfo.company.settings.flagRelateVehicleFloat && this.id;
	// this.showVehicles = true;
	// this.params.page = 1;
	this.loadTypePerson();
	this.loadVehicles();
	// this.loadTypeDocuments();
}

async function loadTypeDocuments() {
	const response = await this.getTypeDocuments('type-person');
	this.typeDocuments = response.data;
	this.typeDocuments = response.data.map((typeDocument) => {
		const newTypeDocument = Object.assign({}, typeDocument);
		newTypeDocument.documentType.type = 'typeDocumentCode';
		return newTypeDocument.documentType;
	});
}

async function detailAgency() {
	try {
		const { data: response } = await this.$httpSales.get(
			`transport-agency/${this.id}`
		);
		this.section = response;
		this.vehiclesSelected = response.additionalInformation
			? response.additionalInformation.plates
			: null;
		this.section.numberMtc = response.additionalInformation
			? response.additionalInformation.numberMtc
			: null;
		this.directions = response.addresses;
	} catch (error) {
		this.showGenericError();
	}
}

function createDirection(model) {
	if (this.editDirection) {
		this.modelFilters = model;
		this.editDirection = false;
	} else {
		this.modelFilters.id = model.id + 1;
		this.directions.push(model);
	}
	this.closeModal();
}

async function saveCourier(courierData) {
	const params = {
		transportAgencyId: this.id,
		...courierData,
	};
	const method = this.courierId ? 'patch' : 'post';
	const url = this.courierId ? `courier/${this.courierId}` : 'courier';
	const message = this.courierId ? 'editado' : 'creado';
	if (method === 'patch') {
		// Para el actualizar no se manda el transportAgencyId
		delete params.transportAgencyId;
	}

	try {
		await this.$httpSales[method](url, params);
		this.showNotification(`El conductor ha sido ${message} correctamente.`);
		// this.close();
		this.closeModal();
		await this.loadCouriers();
		// this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function openNewDirection() {
	this.action = {
		title: 'Nueva Dirección',
		open: true,
		code: 'new-direction',
		width: 550,
	};
	this.loadDepartament();
	this.showNewAgency = true;
}

function openNewCourier() {
	this.action = {
		title: 'Nuevo conductor',
		open: true,
		code: 'new-courier',
		width: 550,
	};
	this.courierId = 0;
	// this.loadDepartament();
	this.showNewCourier = true;
}

function editCourier(id) {
	this.action = {
		title: 'Editar conductor',
		open: true,
		code: 'new-courier',
		width: 550,
	};
	// this.loadDepartament();
	this.courierId = id;
	this.showNewCourier = true;
}

async function loadDepartament() {
	try {
		({ data: this.departments } = await this.$httpSales.get('province'));
	} catch (e) {
		this.showGenericError();
	}
}

function getData({ model, value }) {
	if (value && value.id) {
		this.modelFilters[model] = value.id;
		if (model === 'departmentId') {
			this.loadProvinces(value.id);
			this.modelFilters[model] = value.id;
			this.modelFilters.department.name = value.name;
			this.modelFilters.department.id = value.id;
			this.modelFilters.ubigeo = null;
		} else if (model === 'provinceId') {
			this.loadDistrits(value.id);
			this.modelFilters[model] = value.id;
			this.modelFilters.province.name = value.name;
			this.modelFilters.province.id = value.id;
			this.modelFilters.ubigeo = null;
		} else if (model === 'distritId') {
			// this.modelFilters.distritName = value.name;
			this.modelFilters.ubigeo = value.code;
			this.modelFilters.district.name = value.name;
			this.modelFilters.district.id = value.id;
			this.modelFilters[model] = value.id;
		} else {
			this.modelFilters[model] = value.id;
		}
	}
}

function getInformation({ model, value }) {
	this.modelFilters[model] = value;
}

function data() {
	return {
		action: {
			code: '',
			open: false,
			title: '',
			width: 553,
		},
		courierId: null,
		departments: [],
		dialogDelete: false,
		distrits: [],
		couriers: [],
		directions: [],
		editDirection: false,
		mainAddress: '',
		modelFilters: {
			id: 0,
			department: {
				id: 0,
				name: '',
			},
			province: {
				id: 0,
				name: '',
			},
			district: {
				id: 0,
				name: '',
			},
			flagDefault: false,
			departmentId: null,
			provinceId: null,
			distritId: null,
			ubigeo: null,
			direction: null,
			exactDirection: null,
			lowerExactAddress: null,
		},
		section: {
			code: null,
			contact: null,
			email: null,
			name: null,
			number: null,
			numberMtc: null,
			phone: null,
			typeDocument: null,
		},
		showNumber: false,
		showVehicles: false,
		showNewAgency: false,
		showNewCourier: false,
		showValidNumber: false,
		// params: {
		// 	// No page property
		// },
		provinces: [],
		personTypes: [],
		vehicles: [],
		vehiclesSelected: [],
		loadingGeneral: false,
	};
}

function setData({ model, value }) {
	if (model === 'numberMtc') {
		const showValid = /^[0-9A-Z]+$/gi.test(value);
		this.showValidNumber = !showValid;
		if (this.showValidNumber) {
			this.showGenericError('Solamente se permite digitos alfanumericos');
		}
		this.section[model] = value;
	} else if (model === 'number') {
		this.setDocument(value);
	} else {
		this.section[model] = value;
	}
}

function setDocument(model) {
	let newModel = model;
	newModel = this.setTypePersonPer(model);
	if (newModel === 'ruc') {
		this.peruDatosRequest(newModel, model);
	} else if (newModel === 'dni' && model.length === 8) {
		this.peruDatosRequest('dni', model);
	} else if (newModel === '') {
		this.section.number = model;
	}
}

function setTypePersonPer(model) {
	if (model.length === 11) {
		this.section.typeDocument = 2;
		return 'ruc';
	}
	if (model.length === 8) {
		this.section.typeDocument = 1;
		return 'dni';
	}
	return '';
}

async function peruDatosRequest(typePerson, num) {
	const url = `${typePerson}/${num}`;
	const params = { codeCountry: this.labelsByCountry.code };
	this.loadingGeneral = true;
	try {
		const { data: response } = await this.$httpSunat.get(url, { params });
		const dataCustomer = response.data;
		this.section.number = num;
		if (num.length === 8) {
			this.section.name = `${dataCustomer.nombres} ${dataCustomer.ape_paterno} ${dataCustomer.ape_materno}`;
		} else {
			this.section.name = `${dataCustomer.nombre}`;
		}
	} catch (error) {
		this.loadingGeneral = false;
		this.section.number = num;
		this.showNotification(
			'No se encontraron los datos. Verifique el numero de documento o complete el formulario manualmente',
			'info'
		);
	} finally {
		this.loadingGeneral = false;
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

// function to load vehicles
async function loadCouriers() {
	try {
		// const response = await this.$httpSales('vehicles', { params: this.params });
		const response = await this.$httpSales.get('courier');
		let couriers = response.data;
		couriers = couriers.map((row) => {
			const newRow = { ...row };
			newRow.typePersonName = row.typePerson ? row.typePerson.name : '';
			newRow.platesInline = row.plates.length > 0 ? row.plates.join(', ') : '';
			return newRow;
		});

		this.couriers = couriers.filter(
			(c) => c.transportAgencyId === Number(this.id)
		);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

// function to load vehicles
async function loadVehicles() {
	try {
		const response = await this.$httpSales('vehicles', { params: this.params });
		this.vehicles = response.data;
		this.vehicles = this.vehicles.map((vehicle) => {
			const newVehicle = {
				id: vehicle.id,
				plate: vehicle.plate || 'name-default',
				brand: vehicle.brand || 'name-default',
				model: `${vehicle.plate}  |  "${vehicle.model || ''}"` || 'name-default',
			};
			return newVehicle;
		});
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function setVehiclesSelected(value) {
	if (value) {
		this.vehiclesSelected = this.vehicles.filter((c) => value.includes(c.id));
	} else {
		this.vehiclesSelected = [];
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

function openEditDirection(item) {
	this.action = {
		code: 'new-direction',
		open: true,
		title: 'Editar Dirección',
		width: 550,
	};
	this.loadDepartament();
	this.loadProvinces(item.department.id);
	this.loadDistrits(item.province.id);
	this.showNewAgency = true;
	this.editDirection = true;
	this.modelFilters.ubigeo = item.ubigeo;
	this.modelFilters.departmentId = item.department.id;
	this.modelFilters.provinceId = item.province.id;
	this.modelFilters.distritId = item.district.id;
	this.modelFilters.direction = item.direction;
	this.modelFilters.exactDirection = item.exactDirection;
	this.modelFilters.lowerExactAddress = item.lowerExactAddress;
}

async function createNewAgency() {
	const url = this.id ? `transport-agency/${this.id}` : 'transport-agency';
	const method = this.id ? 'patch' : 'post';
	const message = this.id ? 'actualizado' : 'creado';
	try {
		const body = {
			additionalInformation: {
				numberMtc: this.section.numberMtc,
				plates: this.vehiclesSelected || [],
			},
			code: this.section.code,
			name: this.section.name,
			rzSocial: this.section.name,
			contact: this.section.contact,
			phone: this.section.phone,
			email: this.section.email,
			mainAddress: this.mainAddress,
			number: this.section.number,
			typeDocument: this.section.typeDocument,
			// vehicles: this.section.vehicles, consultar a Luis xd
			addresses: this.directions.map((p) => {
				const newRow = {};
				newRow.ubigeo = p.ubigeo;
				newRow.exactDirection = p.exactDirection;
				newRow.lower = p.lowerExactAddress;
				newRow.flagDefault = p.flagDefault;
				newRow.department = {
					id: p.department.id,
					name: p.department.name,
				};
				newRow.province = {
					id: p.province.id,
					name: p.province.name,
				};
				newRow.district = {
					id: p.district.id,
					name: p.district.name,
				};
				newRow.direction = p.direction;
				return newRow;
			}),
		};
		await this.$httpSales[method](url, body);
		this.showNotification(`La agencia se ${message} correctamente.`);
		this.goTo('transport-agency');
	} catch (e) {
		if (e.status === 400) {
			if (e.data.message === 'CODE_ALREADY_EXISTS') {
				this.showGenericError(
					'El código ya se encuentra asociado a una agencia de transporte, generé un nuevo código.'
				);
			} else {
				this.showGenericError(e.data.messageError);
			}
		} else {
			this.showGenericError();
		}
	}
}

function goBack() {
	this.$router.back();
}

function rowFavorite(item, index) {
	this.mainAddress = item.direction;
	this.directions[index].flagDefault = !this.directions[index].flagDefault;
}

function closeModal() {
	this.modelFilters = {
		departmentId: null,
		provinceId: null,
		distritId: null,
		direction: null,
		exactDirection: null,
		lowerExactAddress: null,
		ubigeo: null,
	};
	this.action = {
		open: false,
		code: null,
		title: '',
	};
	this.courierId = 0;
	this.showNewCourier = false;
	this.showNewAgency = false;
}

function deleteDirection(index) {
	this.directions.splice(index, 1);
}

async function deleteCourier(id) {
	try {
		await this.$httpSales.delete(`courier/${id}`);
		this.showNotification('El registro ha sido eliminado correctamente.');
		// this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'COURIER_REMISSION_GUIDE_EXIST') {
				this.showGenericError(
					'El conductor no puede ser eliminado por estar asociado a una guía de remisión.'
				);
			}
		}
	} finally {
		this.closeModal();
		await this.loadCouriers();
	}
}

function validations() {
	return {
		section: {
			code: { required },
			name: { required },
			number: { required },
			typeDocument: { required },
		},
	};
}

export default {
	name: 'page-new-agency',
	data,
	created,
	components: {
		actionSidebar,
		headerPage,
		newDirection,
		modalSidebarButton,
		couriersForm,
	},
	methods: {
		closeModal,
		createDirection,
		saveCourier,
		createNewAgency,
		deleteDirection,
		deleteCourier,
		detailAgency,
		getData,
		getInformation,
		goBack,
		loadDepartament,
		loadDistrits,
		loadProvinces,
		loadVehicles,
		setVehiclesSelected,
		loadCouriers,
		loadTypeDocuments,
		openEditDirection,
		openNewDirection,
		openNewCourier,
		editCourier,
		rowFavorite,
		setData,
		setDocument: helper.debounce(setDocument, 2000),
		setTypePersonPer,
		peruDatosRequest,
	},
	validations,
};
</script>

<style lang="scss" scoped>
.title-agency {
	border-bottom: 1px solid #d9e8e9;
	color: color(sidebar);
	font-family: map-get($fonts, open-bold);
	font-size: 13px;
}

.product-add-btn {
	align-items: center;
	border-color: color(primary);
	border-style: solid;
	border-width: 1px;
	border-radius: 2px;
	color: color(primary);
	cursor: pointer;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	font-family: font(open-semibold);
	font-size: size(small);
	height: 27px;
	justify-content: space-between;
	padding: 0px 9px;
	width: 100%;

	span {
		text-align: center;
		width: calc(100% - 23px);
	}

	&.product-add-btn-active {
		background-color: color(primary);
		color: color(white);
	}
}

.text-direction {
	font-size: 10px;
	font-family: font(open-semibold);
}

.name-direction {
	border-radius: 2px;
	background-color: rgba(195, 231, 232, 0.29);
	color: #4a4a4a;
	font-size: 12px;
	padding: 5px 10px;
}

.content-agency {
	padding-bottom: 130px;
	overflow: auto;
	max-height: auto;

	@media (max-width: 1014px) {
		// max-height: 780px;
		overflow: auto;
	}
}
</style>
