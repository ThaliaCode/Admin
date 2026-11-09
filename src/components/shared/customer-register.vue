<template>
	<div>
		<v-tabs
			v-model="active"
			dark
			right
			color="primary"
			slider-color="blue darken-1">
			<v-tab
				v-for="tab in tabs"
				:key="tab.id"
				class="customer-tabs caption">
				{{ tab.name }}
			</v-tab>
			<v-tab-item
				v-for="tab in tabs"
				:key="tab.id"
				class="px-4 mt-4">
				<v-layout wrap
					v-if="tab.id === 1">
					<v-flex xs12 md6 pr-3 class="form-input_register">
						<v-text-field
							class="filter-select"
							label="DNI"
							required
							type="number"
							v-model="newCustomer.dni">
						</v-text-field>
						<span class="form-group__message"
							v-if="$v.newCustomer.dni && $v.newCustomer.dni.$invalid">
							El DNI es requerido, de {{ minDni }} a {{ maxDni }} dígitos.
						</span>
					</v-flex>
					<v-flex xs12 md6 pl-3>
						<v-text-field
							class="filter-select"
							label="Dirección"
							@input="okRegister = $v.$invalid"
							v-model="newCustomer.address">
						</v-text-field>
					</v-flex>
					<v-flex xs12 md6 pr-3 class="form-input_register">
						<v-text-field
							class="filter-select"
							label="Nombre"
							required
							@input="okRegister = $v.$invalid"
							v-model="newCustomer.name">
						</v-text-field>
						<span class="form-group__message"
							v-if="$v.newCustomer.name && $v.newCustomer.name.$invalid">
							El nombre es requerido.
						</span>
					</v-flex>
					<v-flex xs12 md6 pl-3>
						<v-text-field
							class="filter-select"
							label="Apellidos"
							@input="okRegister = $v.$invalid"
							v-model="newCustomer.lastname">
						</v-text-field>
						<span class="form-group__message"
							v-if="$v.newCustomer.lastname && $v.newCustomer.lastname.$invalid">
							El apellido es requerido.
						</span>
					</v-flex>
					<v-flex xs12 md6 pr-3>
						<v-text-field
							class="filter-select mb-4"
							label="Correo"
							required
							v-model="newCustomer.email">
						</v-text-field>
					</v-flex>
					<v-flex xs12 md6 pl-3>
						<v-layout row wrap>
							<v-flex xs6 pr-2>
								<v-text-field
									class="filter-select mb-4"
									label="Nacionalidad"
									type="email"
									v-model="newCustomer.nationality">
								</v-text-field>
							</v-flex>
							<v-flex xs6 pl-2>
								<v-text-field
									class="filter-select mb-4"
									label="Teléfono"
									type="number"
									v-model="newCustomer.phone">
								</v-text-field>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-layout wrap v-else>
					<v-flex xs12 md6 pr-3 class="form-input_register">
						<v-text-field
							class="filter-select"
							label="RUC"
							required
							name="customer-ruc"
							type="number"
							@blur="sunatService($event, 'ruc')"
							v-model="newCustomer.ruc">
						</v-text-field>
						<span class="form-group__message"
							v-if="$v.newCustomer.ruc && $v.newCustomer.ruc.$invalid">
							El RUC es requerido, {{ maxRuc }} dígitos.
						</span>
					</v-flex>
					<v-flex xs12 md6 pl-3>
						<v-text-field
							class="filter-select mb-4"
							label="Sitio Web"
							v-model="newCustomer.website">
						</v-text-field>
					</v-flex>
					<v-flex xs12 md6 pr-3 class="form-input_register">
						<v-text-field
							class="filter-select"
							label="Razón Social"
							name="customer-rzSocial"
							required
							@input="okRegister = $v.$invalid"
							v-model="newCustomer.rzSocial">
						</v-text-field>
						<span class="form-group__message"
							v-if="$v.newCustomer.rzSocial && $v.newCustomer.rzSocial.$invalid">
							La razón social es requerida.
						</span>
					</v-flex>
					<v-flex xs12 md6 pl-3>
						<v-text-field
							class="filter-select"
							label="Dirección"
							@input="okRegister = $v.$invalid"
							v-model="newCustomer.address">
						</v-text-field>
						<span class="form-group__message"
							v-if="$v.newCustomer.address && $v.newCustomer.address.$invalid">
							La dirección es requerida.
						</span>
					</v-flex>
					<v-flex xs12 md6 pr-3>
						<v-text-field
							class="filter-select mb-4"
							label="Contacto"
							v-model="newCustomer.contact">
						</v-text-field>
					</v-flex>
					<v-flex xs12 md6 pl-3>
						<v-layout row wrap>
							<v-flex xs6 pr-2>
								<v-text-field
									class="filter-select mb-4"
									label="Correo"
									type="email"
									v-model="newCustomer.email">
								</v-text-field>
							</v-flex>
							<v-flex xs6 pl-2>
								<v-text-field
									class="filter-select mb-4"
									label="Teléfono"
									type="number"
									v-model="newCustomer.phone">
								</v-text-field>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-tab-item>
		</v-tabs>
		<slot></slot>
	</div>
</template>

<script>
import { required, minLength, maxLength } from 'vuelidate/lib/validators';

function created() {
	if (this.editData && this.editData.id) {
		this.newCustomer.email = this.editData.email;
		this.newCustomer.phone = this.editData.phone;
		this.newCustomer.typePerson.documentNumber = this.editData.typePerson ?
			this.editData.typePerson.documentNumber : '';
		this.newCustomer.typePerson.fullName = this.editData.typePerson ?
			this.editData.typePerson.fullName : '';
		if (this.editData.flagTypePerson === 1) {
			this.active = 0;
			this.newCustomer.dni = this.editData.dni;
			this.newCustomer.address = this.editData.address;
			this.newCustomer.name = this.editData.name;
			this.newCustomer.lastname = this.editData.lastname;
			this.newCustomer.nationality = this.editData.nationality;
		} else {
			this.active = 1;
			this.newCustomer.ruc = this.editData.ruc;
			this.newCustomer.website = this.editData.website;
			this.newCustomer.rzSocial = this.editData.rzSocial;
			this.newCustomer.address = this.editData.address;
			this.newCustomer.contact = this.editData.contact;
		}
	}
}

function active(tab) {
	this.newCustomer.flagTypePerson = Number(tab) + 1;
}

async function sunatService(e, type) {
	if (!this.$v.newCustomer[type].$invalid) {
		this.showNotification('Cargando datos desde la SUNAT', 'primary');
		const value = e.target.value;
		const urlDni = `dni/${value}`;
		const urlRuc = `ruc/${value}`;
		const url = type === 'dni' ? `${urlDni}` : `${urlRuc}`;
		try {
			const { data: response } = await this.$httpSunat.get(url);
			const custSunat = response.data;
			if (type === 'dni') {
				this.newCustomer.dni = custSunat.dni;
				this.newCustomer.email = custSunat.email || '';
				this.newCustomer.phone = custSunat.phone || '';
				this.newCustomer.address = custSunat.domicilio || '';
				this.newCustomer.name = custSunat.nombres;
				this.newCustomer.lastname = `${custSunat.ape_materno} ${custSunat.ape_paterno}`;
			} else {
				this.newCustomer.ruc = value;
				this.newCustomer.rzSocial = custSunat.nombre;
				this.newCustomer.address = custSunat.domicilio;
			}
		} catch (error) {
			this.showNotification('Sin resultados. Verifique el número de documento', 'error');
		}
	}
	this.okRegister = this.$v.$invalid;
}

function noCustomerError() {
	this.$emit('form-error', { error: this.okRegister, customer: this.newCustomer });
}

async function register() {
	const id = this.newCustomer.id;
	const url = id ? `customers/${id}` : 'customers';
	const method = id ? 'patch' : 'post';
	const body = {
		address: this.newCustomer.address,
		flagTypePerson: this.newCustomer.flagTypePerson,
		email: this.newCustomer.email,
		phone: this.newCustomer.phone,
	};
	if (this.newCustomer.flagTypePerson === 1) {
		body.name = this.newCustomer.name;
		body.lastname = this.newCustomer.lastname;
		body.dni = this.newCustomer.dni;
	} else {
		body.rzSocial = this.newCustomer.rzSocial;
		body.ruc = this.newCustomer.ruc;
		body.contact = this.newCustomer.contact;
	}
	try {
		const { data: response } = await this.$httpSales[method](url, body);
		this.showNotification('El cliente ha sido creado correctamente');
		this.$emit('customer-registered', response);
		this.newCustomer = this.default;
	} catch (error) {
		if (error.data.message === 'CUSTOMER_EXIST_ERROR') {
			this.showNotification('El cliente ya está registrado', 'warning');
		} else {
			this.showGenericError();
		}
	}
}

function registerAction(value) {
	if (!value) {
		this.register();
	}
}

function clearCustomerData() {
	if (!this.clearInfo) this.newCustomer = { ...this.default };
}

function validations() {
	const isEcuador = this.labelsByCountry.code === 'ECU';
	if (this.active === '0') {
		this.maxDni = isEcuador ? 10 : 9;
		this.minDni = isEcuador ? 10 : 8;
		return {
			newCustomer: {
				dni: {
					required,
					minLength: minLength(this.minDni),
					maxLength: maxLength(this.maxDni),
				},
				name: {
					required,
				},
				lastname: {
					required,
				},
			},
		};
	}
	this.maxRuc = isEcuador ? 13 : 11;
	return {
		newCustomer: {
			ruc: {
				required,
				minLength: minLength(this.maxRuc),
				maxLength: maxLength(this.maxRuc),
			},
			rzSocial: {
				required,
			},
			address: {
				required,
			},
		},
	};
}

function data() {
	return {
		active: 0,
		default: {
			address: '',
			contact: '',
			dni: '',
			email: '',
			flagTypePerson: 1,
			lastname: '',
			name: '',
			nationality: '',
			phone: '',
			ruc: '',
			rzSocial: '',
			typePerson: {
				documentNumber: '',
				fullName: '',
			},
			website: '',
		},
		newCustomer: {
			address: '',
			contact: '',
			dni: '',
			email: '',
			flagTypePerson: 1,
			lastname: '',
			name: '',
			nationality: '',
			phone: '',
			ruc: '',
			rzSocial: '',
			typePerson: {
				documentNumber: '',
				fullName: '',
			},
			website: '',
		},
		maxDni: 9,
		maxRuc: 11,
		minDni: 8,
		tabs: [
			{ id: 1, name: 'Persona Natural' },
			{ id: 2, name: 'Persona Jurídica' },
		],
		okRegister: true,
	};
}

export default {
	name: 'customer-register',
	created,
	data,
	methods: {
		clearCustomerData,
		noCustomerError,
		register,
		sunatService,
	},
	props: {
		registerAction: {
			type: Boolean,
			default: false,
		},
		clearInfo: {
			type: Boolean,
			default: false,
		},
		editData: {
			type: Object,
			default: () => {},
		},
	},
	validations,
	watch: {
		active,
		okRegister: noCustomerError,
		clearInfo: clearCustomerData,
		registerAction,
	},
};
</script>

<style lang="scss" scoped>

.form-input_register {
	height: 60px;
}
</style>

