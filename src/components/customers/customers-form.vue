<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			label="La carga terminará en un momento y podrás ver toda la información del cliente."
		/>
		<form action="" method="POST">
			<v-layout wrap pa-5 mb-5>
				<v-flex xs12 px-4 :class="{ md6: !fastForm }">
					<v-layout wrap>
						<v-flex xs12 mb-2>
							<app-input-text
								type="number"
								ref="documentNumber"
								label="Nro de Documento"
								:model="documentProp"
								tabindex="1"
								:text="customer[documentProp]"
								@input="setData"
							/>
							<span v-if="$v.customer[documentProp].$invalid">
								<span
									class="form-group__message"
									v-if="!$v.customer[documentProp].required"
								>
									El número de documento es requerido
								</span>
								<span
									class="form-group__message"
									v-if="
										!$v.customer[documentProp].minLength ||
										!$v.customer[documentProp].maxLength
									"
								>
									{{ documentMessage }}
								</span>
							</span>
						</v-flex>
						<v-flex xs12 mb-2>
							<app-select
								:item="person"
								item-text="name"
								item-value="id"
								:items="persons"
								label="Tipo de Persona"
								model="person"
								:return-object="false"
								tabindex="2"
								@input="setCustomData"
							/>
						</v-flex>
						<v-flex xs12 mb-2>
							<app-select
								:disabled="isLegalPerson"
								:item="customer.flagTypePerson"
								item-text="name"
								item-value="id"
								:items="personTypesGroup"
								:label="labelsByCountry.idLabel"
								model="flagTypePerson"
								:readonly="isLegalPerson"
								:return-object="false"
								tabindex="3"
								@input="setData"
							/>
							<span
								class="form-group__message"
								v-if="!$v.customer.flagTypePerson.required"
							>
								El tipo de documento es requerido
							</span>
						</v-flex>
						<v-flex xs12 mb-2>
							<v-layout wrap v-if="isLegalDocument">
								<v-flex xs12>
									<app-input-text
										label="Nombre Comercial"
										model="rzSocial"
										tabindex="4"
										:text="customer.rzSocial"
										@input="setData"
									/>
									<span class="form-group__message" v-if="!$v.customer.rzSocial.required">
										El nombre comercial es requerido
									</span>
								</v-flex>
							</v-layout>
							<v-layout wrap v-else>
								<v-flex xs12 md6 pr-2>
									<app-input-text
										label="Nombre"
										model="name"
										tabindex="4"
										:text="customer.name"
										@input="setData"
									/>
									<span class="form-group__message" v-if="!$v.customer.name.required">
										El nombre es requerido
									</span>
								</v-flex>
								<v-flex xs12 md6 pl-2>
									<app-input-text
										label="Apellido"
										model="lastname"
										tabindex="5"
										:text="customer.lastname"
										@input="setData"
									/>
									<span class="form-group__message" v-if="!$v.customer.lastname.required">
										El apellido es requerido
									</span>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-layout wrap row>
							<v-flex
								xs12
								md6
								mb-2
								pr-2
								v-if="$route.name === 'new-sale' || $route.name === 'new-quotation'"
							>
								<app-input-text
									tabindex="6"
									label="Teléfono"
									model="phone"
									:text="customer.phone"
									@input="setData"
									autocomplete="off"
								/>
							</v-flex>
							<v-flex
								xs12
								md6
								mb-2
								pl-2
								v-if="$route.name === 'new-sale' || $route.name === 'new-quotation'"
							>
								<app-input-text
									autocomplete="off"
									label="Correo"
									:disabled="disabledEmail"
									type="email"
									tabindex="7"
									model="email"
									:text="customer.email"
									@input="setData"
								/>
								<template v-if="$v.customer && $v.customer.email">
									<span class="form-group__message" v-if="!$v.customer.email.email">
										El formato del correo electrónico ingresado es incorrecto
									</span>
								</template>
								<template v-if="customer.email && !isValid">
									<span class="form-group__message">
										El correo ingresado no es válido.
									</span>
								</template>
							</v-flex>
						</v-layout>
						<v-flex xs12 mb-2>
							<app-input-text
								label="Dirección"
								model="address"
								tabindex="8"
								:text="customer.address"
								@input="setData"
							/>
							<span class="form-group__message" v-if="!$v.customer.address.required">
								La dirección es requerida
							</span>
						</v-flex>
						<v-flex xs12 mb-2>
							<app-input-text
								label="Alias"
								model="customerAlias"
								tabindex="8"
								:text="customer.customerAlias"
								@input="setData"
							/>
						</v-flex>
						<v-flex xs12 my-2 v-if="customerId">
							<v-btn
								class="btn-outline btn-auto btn-full ma-0 py-1"
								color="primary"
								outline
								@click="goTo('customer-address', { params: { id: customerId } })"
							>
								Agregar y gestionar direcciones
							</v-btn>
						</v-flex>
						<v-flex x12 mb-2>
							<v-flex xs12 mr-3>
								<span class="customer-status">Estado de Cliente:</span>
							</v-flex>
							<v-flex>
								<v-switch
									hide-details
									:label="statusCustomer"
									color="success"
									v-model="customer.flagActive"
									@change="handleActiveChange"
								></v-switch>
							</v-flex>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 md6 px-4 v-if="!fastForm">
					<v-layout wrap>
						<v-flex xs12 mb-2>
							<label class="caption">Teléfonos</label>
							<v-select
								class="filter-select shadow-inset tag-select"
								chips
								clearable
								label="Teléfonos"
								single-line
								tabindex="6"
								tags
								type="number"
								v-model="customer.phoneNumbers"
							>
								<template slot="selection" slot-scope="data">
									<v-chip class="tag-chip" close @input="removePhone(data.item)">
										{{ data.item }}
									</v-chip>
								</template>
							</v-select>
						</v-flex>
						<v-flex xs12 mb-2>
							<app-select
								:item="customer.gender"
								item-text="name"
								item-value="id"
								:items="gender"
								label="Género"
								model="gender"
								:return-object="false"
								tabindex="7"
								@input="setData"
							/>
						</v-flex>
						<v-flex xs12 mb-2>
							<app-select
								:item="customer.civilStatus"
								item-text="name"
								item-value="id"
								:items="civilStatus"
								label="Estado Civil"
								model="civilStatus"
								:return-object="false"
								tabindex="8"
								@input="setData"
							/>
						</v-flex>
						<v-flex xs12 md7 pr-2>
							<v-flex xs12>
								<app-input-text
									label="Descuento (%)"
									model="discount"
									tabindex="9"
									type="number"
									:text="customer.discount"
									@input="setData"
								/>
								<span
									class="form-group__message"
									v-if="!$v.customer.discount.biggerThan100"
								>
									El descuento no puede ser mayor a 100%
								</span>
							</v-flex>
						</v-flex>
						<v-flex xs12 md12 pr-2>
							<app-input-text
								autocomplete="off"
								label="Correo"
								:disabled="disabledEmail"
								type="email"
								tabindex="10"
								model="email"
								:text="customer.email"
								@input="setData"
							/>
							<template v-if="$v.customer && $v.customer.email">
								<span class="form-group__message" v-if="!$v.customer.email.required">
									El correo electrónico es requerido.
								</span>
								<span class="form-group__message" v-if="!$v.customer.email.email">
									El formato del correo electrónico ingresado es incorrecto
								</span>
							</template>
							<template v-if="customer.email && !isValid">
								<span class="form-group__message">
									El correo ingresado no es válido.
								</span>
							</template>
						</v-flex>
						<v-flex mt-1>
							<app-input-text
								textarea
								label="Observaciones"
								model="observations"
								:text="customer.observations"
								@input="setData"
							/>
						</v-flex>
						<v-flex mt-2 xs12 md10 pr-2>
							<v-flex xs12>
								<v-checkbox
									color="success"
									class="checkbox-customers"
									label="Acceso al sistema (Ecommerce / Reseller)"
									v-model="customer.flagTypeUser"
									:disabled="disabledFlagType"
									hide-details
								></v-checkbox>
							</v-flex>
						</v-flex>
						<v-layout row wrap align-center v-if="customer.flagTypeUser">
							<v-flex xs12 md7 pr-2>
								<app-input-text
									autocomplete="off"
									label="Contraseña"
									model="password"
									type="password"
									:disabled="disabledPassword"
									:text="customer.password"
									@input="setData"
								/>
								<template v-if="$v.customer && $v.customer.password">
									<span class="form-group__message" v-if="!$v.customer.password.required">
										Este campo es requerido.
									</span>
									<span></span>
								</template>
								<span
									class="form-group__message"
									v-if="
										!$v.customer.password.minLength || !$v.customer.password.maxLength
									"
								>
									Ingresar de 6 a 12 caracteres
								</span>
							</v-flex>
							<v-flex v-if="customer.flagTypeUser === 1" class="mt-2">
								<app-tooltip-button
									text="Editar"
									icon="edit"
									color="success"
									@click-icon="$emit('change-password', customer)"
								/>
							</v-flex>
						</v-layout>
					</v-layout>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer" v-if="fastForm">
				<modal-sidebar-button
					:is-loading="disabled"
					@cancel-button-clicked="cancel"
					@accept-button-clicked="$emit('save', customer)"
				/>
			</section>
			<v-layout wrap justify-center py-4 class="modal-filter-footer" v-else>
				<v-flex xs12 sm2 pr-1 text-xs-right>
					<v-btn class="btn-action caption white--text" color="pink" @click="cancel">
						Cancelar
					</v-btn>
				</v-flex>
				<v-flex xs12 sm2 pl-1 text-xs-left>
					<v-btn
						class="btn-action caption white--text"
						color="primary"
						:disabled="disabled"
						@click="$emit('save', customer)"
					>
						Aceptar
					</v-btn>
				</v-flex>
			</v-layout>
		</form>
	</div>
</template>

<script>
import {
	maxLength,
	minLength,
	minValue,
	required,
	requiredIf,
	email,
} from 'vuelidate/lib/validators';
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

const { compose, setNewProperty } = lib;

function created() {
	this.customer.flagTypePerson = 7;
	this.loadTypePerson().then(() => {
		const docNotLegal = this.personTypes.find(
			(p) => p.name === 'RUC' && p.flagLegal !== 1
		);
		if (docNotLegal) {
			this.personTypesGroup = this.personTypes.filter((p) => p.flagLegal !== 1);
			this.customer.flagTypePerson =
				this.personTypesGroup.length > 0 ? docNotLegal.id : 7;
		} else {
			this.personTypesGroup = this.personTypes;
		}
	});
	// setTimeout(() => {
	// 	this.focusOnDocumentType();
	// }, 2000);
}

function focusOnDocumentType() {
	this.$refs.documentNumber.$el.children[0].children[0].children[0].focus();
}

function cancel() {
	this.cleanForm();
	this.$emit('cancel');
}

function cleanForm() {
	this.customer = {
		address: '',
		civilStatus: null,
		contact: '',
		discount: 0,
		dni: '',
		email: '',
		flagTypePerson: null,
		gender: null,
		lastname: '',
		mobile: '',
		name: '',
		phone: '',
		phoneNumbers: [],
		ruc: '',
		rzSocial: '',
		flagActive: true,
		flagTypeUser: null,
		password: '',
		observations: '',
	};
	this.person = null;
}

function disabled() {
	return this.isLoading || this.$v.$invalid || !this.isValid || this.validatePhone;
}

function documentProp() {
	return this.isLegalDocument ? 'ruc' : 'dni';
}

function isLegalDocument() {
	const selectedPerson =
		this.personTypes.find((p) => p.id === this.customer.flagTypePerson) || {};
	return this.isLegalPerson || selectedPerson.name === 'RUC';
}

function isLegalPerson() {
	return this.person === 2;
}

function modelData(modelValue) {
	if (modelValue && modelValue.id) {
		this.customer = {
			address: modelValue.address,
			civilStatus: modelValue.civilStatus,
			contact: modelValue.contact,
			discount: modelValue.discount || 0,
			dni: modelValue.dni,
			email: modelValue.email,
			flagTypePerson: modelValue.flagTypePerson,
			gender: modelValue.gender,
			lastname: modelValue.lastname,
			mobile: modelValue.mobile,
			name: modelValue.name,
			phone: modelValue.phone,
			phoneNumbers: modelValue.phoneNumbers || [],
			ruc: modelValue.ruc,
			rzSocial: modelValue.rzSocial,
			flagActive: modelValue.flagActive,
			flagTypeUser: modelValue.flagTypeUser,
			observations: modelValue.additionalInformation
				? modelValue.additionalInformation.observations
				: '',
			password: modelValue.password,
			customerAlias: modelValue.customerAlias,
		};
		this.person =
			modelValue.msTypePerson &&
			modelValue.msTypePerson.name === 'RUC' &&
			modelValue.msTypePerson.flagLegal === 1
				? 2
				: 1;
	}
}

function person(value) {
	if (this.personTypes.length) {
		const rucLegal = this.personTypes.find((p) => p.name === 'RUC' && p.flagLegal === 1);
		const rucNotLegal = this.personTypes.find(
			(p) => p.name === 'RUC' && p.flagLegal !== 1
		);
		const personsLegal = this.personTypes.filter((p) => p.name !== 'RUC');
		const personsNotLegal = this.personTypes.filter((p) => p.name !== 'RUC');
		personsLegal.push(rucLegal);
		personsNotLegal.push(rucNotLegal);
		this.personTypesGroup = value === 2 ? personsLegal : personsNotLegal;
		const newValue =
			value === 2
				? personsLegal.find((p) => p.name === 'RUC').id
				: this.customer.flagTypePerson;
		this.setData({ model: 'flagTypePerson', value: newValue });
	}
}

function personTypesGroup() {
	return true;
}

function removePhone(item) {
	const index = this.customer.phoneNumbers.indexOf(item);
	if (index > -1) {
		this.customer.phoneNumbers.splice(index, 1);
	}
}

function setCustomData({ model, value }) {
	this[model] = value;
}

function setData({ model, value }) {
	this.customer[model] = value;
	if (model === 'email') {
		this.isValid = true;
	}
	if (model === 'flagTypePerson') {
		this.personType = this.personTypes.find((p) => p.id === value) || {};
	} else if ((model === 'ruc' || model === 'dni') && value) {
		this.setDocument(model);
	}
}

async function peruDatosRequest(typePerson, num) {
	this.loadingGeneral = true;
	const url = `${typePerson}/${num}`;
	const params = { codeCountry: this.labelsByCountry.code };
	try {
		const { data: response } = await this.$httpSunat.get(url, { params });
		const { domicilio, telefono } = response.data;
		this.customer = compose(
			setNewProperty('address', domicilio),
			setNewProperty('phone', telefono)
		)(this.customer);
		if (this.isPeru && num.length === 8) {
			this.setCustomerPeru(response.data);
		} else {
			this.setCustomerData(response.data, num);
		}
	} catch (error) {
		this.cleanForm();
		if (this.isEcuador) {
			this.setTypePersonEcu(num);
		} else {
			this.setTypePersonPer(num);
		}
		this.showNotification(
			'Los datos no se consiguieron. Verifique la información o complete el formulario manualmente',
			'info'
		);
	} finally {
		this.loadingGeneral = false;
	}
}

function validations() {
	const dniValidations = { required: requiredIf(() => !this.isLegalDocument) };
	const rucValidations = { required: requiredIf(() => this.isLegalDocument) };
	if (this.personValidations) {
		if (this.isLegalDocument) {
			if (this.personValidations.maxLength) {
				rucValidations.maxLength = maxLength(this.maxDocument);
			}
			if (this.personValidations.minLength) {
				rucValidations.minLength = minLength(this.minDocument);
			}
		} else {
			if (this.personValidations.maxLength) {
				dniValidations.maxLength = maxLength(this.maxDocument);
			}
			if (this.personValidations.minLength) {
				dniValidations.minLength = minLength(this.minDocument);
			}
		}
	}
	return {
		customer: {
			password: {
				required: requiredIf(() => this.customer.flagTypeUser),
				maxLength: maxLength(12),
				minLength: minLength(6),
			},
			address: {
				required: requiredIf(() => this.isLegalDocument),
			},
			discount: {
				biggerThan100: this.validatingDiscount,
			},
			dni: dniValidations,
			email: {
				required: requiredIf(() => this.customer.flagTypeUser),
				email,
			},
			flagTypePerson: {
				minValue: minValue(1),
				required,
			},
			lastname: {
				required: requiredIf(() => !this.isLegalDocument),
			},
			name: {
				required: requiredIf(() => !this.isLegalDocument),
			},

			ruc: rucValidations,
			rzSocial: {
				required: requiredIf(() => this.isLegalDocument),
			},
		},
	};
}

function validatingDiscount(disc) {
	return disc < 100;
}

function statusCustomer() {
	const status = this.customer.flagActive ? 'Activado' : 'Bloqueado';
	return status;
}

function setTypePersonPer(num) {
	this.customer.dni = null;
	this.customer.ruc = null;
	this.person = 1;
	if (num.length === 11) {
		this.person = 2;
		this.customer.ruc = num;
		this.customer.flagTypePerson = 2;
		return 'ruc';
	}
	this.customer.dni = num;
	this.customer.flagTypePerson = null;
	return 'dni';
}

function setTypePersonEcu(num) {
	const [, , digit] = num;
	const lastIdDocument = this.customer.flagTypePerson;
	this.flagTypePersonSelected = lastIdDocument || this.flagTypePersonSelected;
	this.customer.dni = null;
	this.customer.ruc = null;
	this.person = 1;
	this.customer.flagTypePerson = 7;
	if (num.length === 13 && (digit === '9' || digit === '6')) {
		this.person = 2;
		this.customer.ruc = num;
		return 'ruc';
	} else if (num.length === 13) {
		if (lastIdDocument === 7 || lastIdDocument === 8) {
			this.customer.ruc = num;
			this.customer.dni = num;
			return 'ruc';
		}
		if (this.flagTypePersonSelected === 9 || lastIdDocument === 9) {
			this.customer.ruc = null;
			this.customer.dni = num;
			this.customer.flagTypePerson = lastIdDocument || this.flagTypePersonSelected;
			return 'dni';
		}
		this.customer.flagTypePerson = lastIdDocument || this.flagTypePersonSelected;
		this.customer.ruc = num;
		this.customer.dni = null;
		return 'ruc';
	} else if (num.length === 10) {
		this.customer.flagTypePerson = 8;
	} else {
		this.customer.flagTypePerson = null;
	}
	this.customer.dni = num;
	return 'dni';
}

function setCustomerData(response, num) {
	const [, , digit] = num;
	const keysData = Object.keys(response);
	const propName = response[keysData.find((kd) => kd === 'nombre' || kd === 'nombres')];
	if (this.person === 2) {
		this.customer.rzSocial = propName;
	} else {
		const [firstLastName, secondLastName, firstName, secondName] = propName.split(' ');
		this.customer.name = `${firstName} ${secondName || null}`;
		this.customer.lastname = `${firstLastName} ${secondLastName || null}`;
		if (this.isEcuador && (digit !== '9' || digit !== '6') && num.length === 13) {
			this.customer.rzSocial = propName;
		}
	}
	this.$emit('response', response);
}

function setCustomerPeru(response) {
	this.customer.name = response.nombres;
	this.customer.lastname = `${response.ape_paterno} ${response.ape_materno}`;
	this.customeraddress = response.domicilio;
	this.customer.flagTypePerson = 1;
	this.disabledDocument = false;
}

function setDocument(model) {
	const flagUseDocConsulting = true;
	const value = this.customer[model];
	let newModel = model;
	if (this.isEcuador) {
		newModel = this.setTypePersonEcu(value);
		if (flagUseDocConsulting) {
			this.peruDatosRequest(newModel, value);
		}
	} else {
		newModel = this.setTypePersonPer(value);
		if (newModel === 'ruc' && flagUseDocConsulting) {
			this.peruDatosRequest(newModel, value);
		} else if (newModel === 'dni' && value.length === 8 && flagUseDocConsulting) {
			this.peruDatosRequest('dni', value);
		}
	}
}

function data() {
	return {
		isValid: true,
		civilStatus: [
			{ id: 1, name: 'Soltero' },
			{ id: 2, name: 'Casado' },
			{ id: 3, name: 'Viudo' },
			{ id: 4, name: 'Divorciado' },
		],
		customer: {
			flagTypeUser: null,
			password: '',
			address: '',
			civilStatus: null,
			contact: '',
			discount: 0,
			dni: '',
			email: '',
			flagActive: true,
			flagTypePerson: null,
			gender: null,
			lastname: '',
			mobile: '',
			name: '',
			phone: '',
			phoneNumbers: [],
			observations: '',
			ruc: '',
			rzSocial: '',
			customerAlias: null,
		},
		gender: [
			{ id: 1, name: 'Masculino' },
			{ id: 2, name: 'Femenino' },
		],
		person: 1,
		persons: [
			{ id: 1, name: 'Natural' },
			{ id: 2, name: 'Jurídica' },
		],
		personTypesGroup: [],
		disabledDocument: false,
		flagTypePersonSelected: null,
		loadingGeneral: false,
	};
}

export default {
	name: 'customers-form',
	components: {
		modalSidebarButton,
	},
	computed: {
		disabled,
		documentProp,
		isLegalDocument,
		isLegalPerson,
		statusCustomer,
		validatePhone() {
			const validate = this.customer.phoneNumbers.some(
				(number) => number !== null && number.length > 10
			);
			if (validate) {
				this.showGenericError('Uno de sus teléfonos excede los 10 dígitos');
			}
			return validate;
		},
	},
	created,
	data,
	methods: {
		cancel,
		cleanForm,
		focusOnDocumentType,
		peruDatosRequest,
		removePhone,
		setCustomData,
		setCustomerData,
		setCustomerPeru,
		setData,
		setDocument: helper.debounce(setDocument, 2000),
		setTypePersonEcu,
		setTypePersonPer,
		validatingDiscount,
		handleActiveChange(value) {
			this.customer.flagActive = value;
			this.$emit('active-change', value);
		},
	},
	validations,
	props: {
		disabledEmail: {
			default: false,
			type: Boolean,
		},
		disabledFlagType: {
			default: false,
			type: Boolean,
		},
		disabledPassword: {
			default: false,
			type: Boolean,
		},
		customerId: [Number, String],
		fastForm: {
			default: false,
			type: Boolean,
		},
		isLoading: {
			default: false,
			type: Boolean,
		},
		modelData: {
			default: () => {},
			type: Object,
		},
	},
	watch: {
		modelData,
		person,
		personTypesGroup,
	},
};
</script>

<style lang="scss" scoped>
.tag-chip {
	background: map-get($colors, tagBackground);
	border: 1px solid map-get($colors, tagBorder);
	border-radius: 4px;
	color: map-get($colors, tagBorder);
}

.tag-select {
	height: auto !important;
	min-height: 30px;
}

.customer-status {
	font-size: 12px;
}

.btn-outline {
	text-transform: none !important;
}
</style>
