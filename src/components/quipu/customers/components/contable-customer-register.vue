<template>
	<div>
		<v-tabs
			v-model="active"
			dark
			next-icon=""
			slider-color="success">
			<v-tab
				v-for="tab in tabs"
				:key="tab.id"
				:disabled="tab.id === 2 && !!editUser.id"
				class="customer-tabs">
				{{ tab.name }}
			</v-tab>
			<v-tab-item
				v-for="tab in tabs"
				:key="tab.id"
				class="px-4 mt-4">
				<v-container v-if="tab.id === 1">
					<v-layout row>
						<v-flex xs6 mr-2>
							<v-select
								bottom
								hide-details
								cache-items
								label="País"
								:items="countries"
								item-text="name"
								item-value="id"
								v-model="newCustomer.countryId"
								:class="[
									'filter-select',
									'shadow-inset',
									!$v.newCustomer.countryId.$invalid ? 'mb-3' : null,
								]"
								content-class="filter-select-content"
							></v-select>
							<span class="form-group__message"
								v-if="$v.newCustomer.countryId.$invalid">
								El país es requerido.
							</span>
						</v-flex>
						<v-flex xs6>
							<v-select
								bottom
								hide-details
								cache-items
								label="Ciudad"
								:items="cities"
								item-text="name"
								item-value="id"
								v-model="newCustomer.cityId"
								class="filter-select shadow-inset"
								content-class="filter-select-content"
							></v-select>
							<span class="form-group__message"
								v-if="$v.newCustomer.cityId.$invalid">
								La ciudad es requerida.
							</span>
						</v-flex>
					</v-layout>
					<v-layout row wrap>
						<v-flex xs12>
							<v-text-field
								:class="[
								'filter-select',
								'shadow-inset',
								!$v.newCustomer.name.$invalid ? 'mb-3' : null]"
								label="Nombre de la empresa"
								v-model="newCustomer.name">
							</v-text-field>
						</v-flex>
						<span class="form-group__message"
							v-if="$v.newCustomer.name.$invalid">
							El nombre de la empresa es requerido.
						</span>
					</v-layout>
					<v-layout row wrap>
						<v-flex xs12>
							<v-text-field
								:class="[
								'filter-select',
								'shadow-inset',
								!$v.newCustomer.address.$invalid ? 'mb-3' : null]"
								label="Dirección de la empresa"
								v-model="newCustomer.address">
							</v-text-field>
						</v-flex>
						<span class="form-group__message"
							v-if="$v.newCustomer.address.$invalid">
							La dirección de la empresa es requerida.
						</span>
					</v-layout>
					<v-layout row>
						<v-flex xs6 mr-2>
							<v-text-field
								:class="[
								'filter-select',
								'shadow-inset',
								!$v.newCustomer.representative.$invalid ? 'mb-3' : null]"
								label="Representante legal"
								v-model="newCustomer.representative">
							</v-text-field>
							<span class="form-group__message"
								v-if="$v.newCustomer.representative.$invalid">
								El representante de la empresa es requerido.
							</span>
						</v-flex>
						<v-flex xs6>
							<v-text-field
								:class="[
								'filter-select',
								'shadow-inset',
								!$v.newCustomer.phone.$invalid ? 'mb-3' : null]"
								label="Teléfono"
								v-model="newCustomer.phone">
							</v-text-field>
							<span class="form-group__message"
								v-if="!$v.newCustomer.phone.required">
								El Teléfono es requerido.
							</span>
							<span class="form-group__message"
								v-if="!$v.newCustomer.phone.numeric">
								Solo se permiten números.
							</span>
						</v-flex>
					</v-layout>
					<v-layout row>
						<v-flex xs6 mr-2>
							<v-text-field
								:class="[
								'filter-select',
								'shadow-inset',
								!$v.newCustomer.ruc.$invalid ? 'mb-3' : null]"
								label="RUC"
								v-model="newCustomer.ruc">
							</v-text-field>
							<span class="form-group__message"
								v-if="!$v.newCustomer.ruc.required">
								El RUC de la empresa es requerido.
							</span>
							<span class="form-group__message"
								v-if="!$v.newCustomer.ruc.minLength || !$v.newCustomer.ruc.maxLength">
								El RUC debe tener 11 dígitos.
							</span>
							<span class="form-group__message"
								v-if="!$v.newCustomer.ruc.numeric">
								El RUC debe tener solo números.
							</span>
						</v-flex>
						<v-flex xs6 class="align-col position">
							<v-menu
								lazy
								v-model="menu"
								transition="scale-transition"
								offset-y
								full-width
							>
								<v-text-field
									slot="activator"
									label="Fecha de inicio"
									v-model="newCustomer.createdAt"
									append-icon="event"
									class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-end"
									readonly
								></v-text-field>
								<v-date-picker
									v-model="newCustomer.createdAt"
									no-title
									scrollable
								></v-date-picker>
							</v-menu>
							<span class="form-group__message"
								v-if="$v.newCustomer.createdAt.$invalid">
								La fecha de inicio es requerida.
							</span>
						</v-flex>
					</v-layout>
					<v-layout row>
						<v-flex xs6 mr-2>
							<v-select
								autocomplete
								bottom
								hide-details
								cache-items
								label="Sector"
								content-class="filter-select-content"
								item-text="name"
								item-value="id"
								:class="[
									'filter-select',
									'shadow-inset',
									!$v.newCustomer.sectorId.$invalid ? 'mb-3' : null,
								]"
								:items="sectore"
								v-model="newCustomer.sectorId"
							></v-select>
							<span class="form-group__message"
								v-if="$v.newCustomer.sectorId.$invalid">
								El sector es requerido.
							</span>
						</v-flex>
						<v-flex xs6>
							<v-select
								bottom
								hide-details
								cache-items
								label="Régimen"
								:class="[
									'filter-select',
									'shadow-inset',
									!$v.newCustomer.sectorId.$invalid ? 'mb-3' : null,
								]"
								content-class="filter-select-content"
								item-text="name"
								item-value="id"
								:items="regimes"
								v-model="newCustomer.regimeId"
							></v-select>
							<span class="form-group__message"
								v-if="$v.newCustomer.regimeId.$invalid">
								El régimen es requerido.
							</span>
						</v-flex>
					</v-layout>
					<v-layout row>
						<v-flex xs6 mr-2>
							<v-text-field
								class="filter-select shadow-inset"
								label="Contacto"
								v-model="newCustomer.contact">
							</v-text-field>
							<span class="form-group__message"
								v-if="$v.newCustomer.contact.$invalid">
								El contacto de la empresa es requerido.
							</span>
						</v-flex>
						<v-flex xs6>
							<v-text-field
								class="filter-select shadow-inset"
								label="Correo"
								v-model="newCustomer.email">
							</v-text-field>
							<span class="form-group__message"
								v-if="!$v.newCustomer.email.required">
								El correo del contacto es requerido.
							</span>
							<span class="form-group__message"
								v-if="!$v.newCustomer.email.email">
								Debe ser un correo válido.
							</span>
						</v-flex>
					</v-layout>
					<v-layout row mb-3>
						<v-flex xs12>
							<v-select
							v-model="newCustomer.emails"
							chips
							tags
							clearable
							solo
							class="select-chips_code mt-3"
							label="Otros correos">
								<template slot="selection" slot-scope="data">
									<v-chip
									:selected="data.selected"
									close
									color="info"
									outline
									@input="removeEmails(data.item)">
										<strong>{{ data.item }}</strong>&nbsp;
									</v-chip>
								</template>
							</v-select>
						</v-flex>
					</v-layout>
				</v-container>
				<v-container v-else-if="!editUser.id">
					<v-layout row>
						<v-flex xs12>
							<v-subheader>Tipo de registro</v-subheader>
						</v-flex>
					</v-layout>
					<v-layout row wrap d-flex>
						<v-flex xs6 v-for="(item, index) in typeRegister"
						:key="index">
							<v-checkbox
							color="success"
							:value="item.id"
							:label="item.name"
							v-model="newCustomer.typeRegister"></v-checkbox>
						</v-flex>
					</v-layout>
					<v-layout row>
						<v-flex xs12 mb-3>
							<v-text-field
								readonly
								class="filter-select shadow-inset"
								label="Correo"
								v-model="newCustomer.email">
							</v-text-field>
						</v-flex>
					</v-layout>
					<v-layout row>
						<v-flex xs12>
							<v-text-field
								type="password"
								class="filter-select shadow-inset"
								label="Contraseña"
								v-model="newCustomer.password">
							</v-text-field>
							<span class="form-group__message"
								v-if="!$v.newCustomer.password.required">
								La contraseña es requerida.
							</span>
						</v-flex>
					</v-layout>
				</v-container>
			</v-tab-item>
		</v-tabs>
		<section class="feature-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid"
				:hidden-save-btn="hiddenButton"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="registerCustomer"
			/>
		</section>
	</div>
</template>
<script>
import { required, email, numeric, minLength, maxLength } from 'vuelidate/lib/validators';
import modalSidebarButton from './../../../shared/utils/modal-sidebar-button';

function hiddenButton() {
	let hideButton = true;
	if (this.editUser.id) {
		hideButton = false;
	} else {
		hideButton = this.active === '0';
	}
	return hideButton;
}

function created() {
	this.loadData();
	if (this.editUser.id) {
		this.fillWithUserData(this.editUser);
	}
}

function fillWithUserData(userData) {
	this.newCustomer = {
		address: userData.address || '',
		cityId: userData.cityId,
		contact: userData.contact,
		countryId: userData.countryId,
		createdAt: userData.startDateFunctions,
		email: userData.email,
		emails: userData.emails,
		name: userData.name,
		phone: userData.phone || '',
		representative: userData.legalRepresentative,
		regimeId: userData.regimeId,
		ruc: userData.ruc,
		sectorId: userData.sectorId,
	};
}

async function loadData() {
	const requests = [
		this.$httpQuipu('countries'),
		this.$httpQuipu('type-register'),
		this.$httpQuipu('regimes'),
		this.$httpQuipu('cities'),
		this.$httpQuipu('sectore'),
	];
	try {
		[
			{ data: this.countries },
			{ data: this.typeRegister },
			{ data: this.regimes },
			{ data: this.cities },
			{ data: this.sectore },
		] = await Promise.all(requests);
	} catch (error) {
		this.showGenericError();
	}
}

function buildBody(id, body) {
	const newObject = {
		address: body.address,
		cityId: body.cityId,
		contact: body.contact,
		countryId: body.countryId,
		email: body.email,
		emails: body.emails || [],
		legalRepresentative: body.representative,
		name: body.name,
		phone: body.phone,
		regimeId: body.regimeId,
		ruc: body.ruc,
		sectorId: body.sectorId,
		startDateFunctions: body.createdAt,
	};
	if (!id) {
		newObject.password = body.password;
		newObject.typeRegister = body.typeRegister;
	}
	return newObject;
}

async function registerCustomer() {
	const id = this.editUser.id;
	const urlPost = 'customer';
	const urlPatch = `customer/${id}`;
	const url = id ? urlPatch : urlPost;
	const method = id ? 'patch' : 'post';
	const message = id ? 'actualizado' : 'creado';
	const body = this.buildBody(id, this.newCustomer);
	try {
		await this.$httpQuipu[method](url, body);
		this.showNotification(`El registro fue ${message} con éxito`);
		this.closeModal();
	} catch (error) {
		if (error.data.message === 'CODE_COMPANY_DUPLICATE') {
			this.showNotification('el RUC de la compañía ya existe', 'error');
		} else if (error.data.message === 'EMAIL_COMPANY_DUPLICATE') {
			this.showNotification('el correo ingresado ya existe', 'error');
		} else {
			this.showGenericError();
		}
	}
}

function closeModal() {
	this.clearModal();
	this.$emit('close-modal');
}

function clearModal() {
	this.newCustomer = {
		address: '',
		cityId: null,
		contact: '',
		countryId: null,
		contableMovements: [],
		createdAt: '',
		email: '',
		emails: '',
		name: '',
		password: '',
		phone: '',
		representative: '',
		regimeId: null,
		ruc: '',
		sectorId: null,
	};
}

function removeEmails(item) {
	this.newCustomer.emails.splice(this.newCustomer.emails.indexOf(item), 1);
	this.newCustomer.emails = [...this.newCustomer.emails];
}

function validations() {
	const validationObject = {
		newCustomer: {
			address: { required },
			cityId: { required },
			countryId: { required },
			contact: { required },
			createdAt: { required },
			email: { required, email },
			name: { required },
			phone: { required, numeric },
			representative: { required },
			regimeId: { required },
			ruc: { required, minLength: minLength(11), maxLength: maxLength(11), numeric },
			sectorId: { required },
		},
	};
	if (!this.editUser.id) {
		validationObject.newCustomer.password = { required };
		validationObject.newCustomer.typeRegister = { required, minLength: minLength(1) };
	}
	return validationObject;
}

function data() {
	return {
		active: 0,
		cities: [],
		countries: [],
		menu: false,
		newCustomer: {
			address: '',
			cityId: null,
			contact: '',
			countryId: null,
			createdAt: '',
			email: '',
			emails: '',
			name: '',
			password: '',
			phone: '',
			representative: '',
			regimeId: null,
			ruc: '',
			sectorId: null,
			typeRegister: [],
		},
		regimes: [],
		sectore: [],
		tabs: [
			{ id: 1, name: 'Registro del cliente' },
			{ id: 2, name: 'Ingreso a app' },
		],
		typeRegister: [],
	};
}

export default {
	name: 'contable-customer-register',
	components: {
		modalSidebarButton,
	},
	computed: {
		hiddenButton,
	},
	created,
	data,
	methods: {
		buildBody,
		clearModal,
		closeModal,
		loadData,
		fillWithUserData,
		registerCustomer,
		removeEmails,
	},
	props: {
		editUser: {
			type: Object,
			default: () => {},
		},
	},
	validations,
};
</script>
 
