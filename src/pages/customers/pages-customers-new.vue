<template>
	<div>
		<header-page caption-navigation="Clientes" :title="$route.meta.title" />
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<label
			style="font-size: 15px; font-weight: bold"
			class="error--text mx-5 pl-4 mt-1"
			v-if="showAlertActive"
			>Cliente bloqueado</label
		>
		<customers-form
			:customer-id="id"
			:disabled-email="disabledEmail"
			:disabled-flag-type="disabledFlag"
			:disabled-password="disabledPassword"
			:is-loading="loading"
			:model-data="customer"
			@active-change="handleActiveChange"
			@change-password="openChangePassword"
			@cancel="goTo('customers')"
			@save="save"
			@response="responseCustomer"
		/>
		<action-sidebar
			:title="action.title"
			:value="action.open"
			:width="action.width"
			:code-action="action.code"
			:help-actions="actionsToHelp"
			@close-modal="close"
		>
			<customers-accountancy-form
				v-if="actionCode('customer-accountancy', 'CONTA')"
				:accounting-account="accountingAccount"
				:accounting-accounts="accountingAccounts"
				:clean-data="cleanData"
				:model-data="customerAccountancyData"
				@cancel="close"
				@save="saveAccountancyData"
				@set-data="setData"
			/>
			<customers-additionals-form
				v-if="actionCode('customer-additionals')"
				:model-data="customerAdditionalData"
				:purchases-frequencys="purchasesFrequencys"
				@cancel="close"
				@save="saveAdditionals"
			/>
			<customers-ubigeo-form
				v-if="actionCode('customer-ubigeo')"
				:model-data="customerUbigeoData"
				@cancel="close"
				@save="saveUbigeo"
			/>
			<v-container v-if="actionCode('change-password')">
				<v-layout wrap justify-center>
					<v-flex xs12 mb-4 mt-2>
						<v-text-field
							class="filter-select shadow-inset mt-2"
							name="new-pass"
							label="Nueva Contraseña"
							v-model="newPassword"
						></v-text-field>
						<span class="form-group__message" v-if="!$v.newPassword.required">
							Este campo es requerido.
						</span>
						<span class="form-group__message" v-if="!$v.newPassword.minLength">
							Mínimo 6 caracteres alfanuméricos.
						</span>
					</v-flex>
					<v-flex xs12>
						<v-text-field
							autocomplete="off"
							class="filter-select shadow-inset"
							name="consfirm-new-pass"
							label="Confirme contraseña"
							v-model="confirmNewPass"
						></v-text-field>
						<span class="form-group__message" v-if="!$v.confirmNewPass.sameAs">
							Las contraseñas no coinciden.
						</span>
					</v-flex>
					<section class="modal-filter-footer">
						<modal-sidebar-button
							:is-loading="$v.invalid"
							@accept-button-clicked="updatePassword"
							@cancel-button-clicked="close"
						/>
					</section>
				</v-layout>
			</v-container>
		</action-sidebar>
		<v-dialog persistent max-width="550" v-model="modalCondicion">
			<v-card class="delete-dialog">
				<v-card-text class="card-head center-modal">
					<span class="center-modal"
						>¿Está seguro(a) que desea registrar a este cliente?</span
					>
				</v-card-text>
				<v-card-text class="card-body center-modal">
					Este cliente es <b>{{ this.dataResponseCustomer.condicion }}</b
					>.
				</v-card-text>
				<v-card-actions class="justify-center footer-dialog">
					<v-btn class="modal-items-btn--cancel" @click="closeModal"> CANCELAR </v-btn>
					<v-btn class="modal-items-btn--cancel" color="primary" @click="save(customer)">
						ACEPTAR
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import customersAccountancyForm from '@/components/customers/customers-accountancy-form';
import customersAdditionalsForm from '@/components/customers/customers-additionals-form';
import customersUbigeoForm from '@/components/customers/customers-ubigeo-form';
import customersForm from '@/components/customers/customers-form';
import headerPage from '@/components/shared/header-page';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { required, minLength, sameAs } from 'vuelidate/lib/validators';
import helper from '@/shared/helper';

function created() {
	const { subsidiary: subsidiaryUser } = this.$userInfo;
	const { configIntegrations } = subsidiaryUser;
	this.subsidiaryConfigIntegrations =
		configIntegrations &&
		((configIntegrations.accountingPlan &&
			configIntegrations.accountingPlan.flagConfig) ||
			(configIntegrations.accountingConfiguration &&
				configIntegrations.accountingConfiguration.flagConfig));
	// if (this.subsidiaryConfigIntegrations) {
	// 	this.loadAccountingAccounts();
	// }
	if (this.id) {
		this.loadData();
	}
}

function validations() {
	return {
		newPassword: {
			required,
			minLength: minLength(6),
		},
		confirmNewPass: {
			required,
			sameAs: sameAs('newPassword'),
		},
	};
}

async function updatePassword() {
	this.isLoading = true;
	const codeProject = helper.getLocalData('codeProject');
	const codeUser = this.customer.aclCode;
	const url = '/users/password';
	const body = {
		password: this.newPassword,
		codeProject,
		codeUser,
	};
	try {
		await this.$httpAcl.patch(url, body);
		this.isLoading = false;
		this.showNotification('Contraseña actualizada');
		this.close();
	} catch (error) {
		this.showGenericError();
	}
}

function openChangePassword() {
	this.action.open = true;
	this.action.title = 'Editar Contraseña';
	this.action.code = 'change-password';
	this.action.width = 400;
}

function actionCode(codeAction, anotherCode) {
	return this.action.code === codeAction || this.action.code === anotherCode;
}

function close() {
	this.action = {
		open: false,
		code: '',
		title: '',
	};
	this.confirmNewPass = '';
	this.newPassword = '';
}

async function loadData() {
	this.loading = true;
	try {
		({ data: this.customer } = await this.$httpSalesRead.get(`customers/${this.id}`));
		this.customer.phoneNumbers = this.customer.phoneNumbers.filter(
			(item) => item !== null
		);
		this.customerAccountancyData = {
			accountAdvanceAccount: this.customer.accountAdvanceAccount,
			accountingCode: this.customer.accountingCode,
			countryId: this.customer.countryId,
			flagAccounting: this.customer.flagAccounting,
			flagDetraction: this.customer.flagDetraction,
			flagExemptTaxes: this.customer.flagExemptTaxes,
			flagItemsWithoutRetainer: this.customer.flagItemsWithoutRetainer,
			flagRetentionAgent: this.customer.flagRetentionAgent,
			flagSpecialContributor: this.customer.flagSpecialContributor,
			originIncomeId: this.customer.originIncomeId,
			typeDestinationId: this.customer.typeDestinationId,
		};
		this.customerAdditionalData = {
			purchaseFrequency: this.customer.additionalInformation
				? this.customer.additionalInformation.loggingFrequency
				: null,
			creditLimitDays: this.customer.creditLimitDays,
			customerType: this.customer.customerType,
			dateBirth: this.customer.dateBirth,
			flagRelatedCustomer: this.customer.flagRelatedCustomer,
			flagPostDatedCredit: this.customer.flagPostDatedCredit,
			groupId: this.customer.groupId,
			limitAmountCredit: this.customer.limitAmountCredit,
			paymentMethodId: this.customer.paymentMethodId,
			typePaymentIds: this.customer.additionalInformation
				? this.customer.additionalInformation.typePaymentIds
				: [],
		};
		this.customerUbigeoData = {
			alias: this.customer.additionalInformation
				? this.customer.additionalInformation.alias
				: '',
			cityId: this.customer.cityId,
			geoposition: this.customer.geoPosition,
			latitude: this.customer.latitude,
			longitude: this.customer.longitude,
			parishId: this.customer.parishId,
			postalCode: this.customer.postalCode,
			provinceId: this.customer.provinceId,
			zone: this.customer.zone,
		};
		if (this.customer.flagTypeUser === 1) {
			this.disabledEmail = true;
			this.disabledPassword = true;
			this.disabledFlag = true;
			this.customer.password = '*******';
		}
		if (this.subsidiaryConfigIntegrations && this.customer.accountingCode) {
			this.accountingAccount = this.accountingAccounts.find(
				(aa) => aa.code === this.customer.accountingCode
			);
		}
		this.showAlertActive = !this.customer.flagActive;
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function runAction({ code, name }) {
	this.action.title = name;
	this.action.code = code;
	this.action.width = code === 'customer-ubigeo' ? 460 : 553;
	this.action.open = true;
}

function closeModal() {
	this.modalCondicion = false;
	this.goTo('customers');
}

async function save(customer) {
	if (!this.modalCondicion) {
		if (
			this.dataResponseCustomer.condicion !== undefined &&
			this.dataResponseCustomer.condicion !== 'HABIDO'
		) {
			this.modalCondicion = true;
			this.customer = customer;
			return;
		}
	}
	this.loading = true;
	const url = this.id ? `customers/${this.id}` : 'customers';
	const method = this.id ? 'patch' : 'post';
	const message = this.id ? 'actualizado' : 'creado';
	const body = {
		password: customer.password,
		flagTypeUser: customer.flagTypeUser === true ? 1 : undefined,
		accountAdvanceAccount: this.customerAccountancyData.accountAdvanceAccount,
		address: customer.address,
		additionalInformation: {
			observations: customer.observations || undefined,
			loggingFrequency: this.customerAdditionalData.purchaseFrequency,
			alias: this.customerUbigeoData.alias,
			typePaymentIds: this.customerAdditionalData.typePaymentIds,
		},
		cityId: this.customerUbigeoData.cityId,
		civilStatus: customer.civilStatus,
		contact: customer.contact,
		countryId: this.customerAccountancyData.countryId,
		creditLimitDays: this.customerAdditionalData.creditLimitDays,
		customerAlias: customer.customerAlias,
		customerType: this.customerAdditionalData.customerType,
		dateBirth: this.customerAdditionalData.dateBirth || null,
		discount: customer.discount || 0,
		email: customer.email,
		flagAccounting: this.customerAccountancyData.flagAccounting,
		flagActive: !!customer.flagActive,
		flagDetraction: this.customerAccountancyData.flagDetraction,
		flagExemptTaxes: this.customerAccountancyData.flagExemptTaxes,
		flagItemsWithoutRetainer: this.customerAccountancyData.flagItemsWithoutRetainer,
		flagPostDatedCredit: this.customerAdditionalData.flagPostDatedCredit,
		flagRelatedCustomer: this.customerAdditionalData.flagRelatedCustomer,
		flagRetentionAgent: this.customerAccountancyData.flagRetentionAgent,
		flagSpecialContributor: this.customerAccountancyData.flagSpecialContributor,
		flagTypePerson: customer.flagTypePerson,
		gender: customer.gender,
		geoPosition: this.customerUbigeoData.geoposition,
		groupId: this.customerAdditionalData.groupId,
		latitude: this.customerUbigeoData.latitude,
		limitAmountCredit: this.customerAdditionalData.limitAmountCredit,
		longitude: this.customerUbigeoData.longitude,
		originIncomeId: this.customerAccountancyData.originIncomeId,
		parishId: this.customerUbigeoData.parishId,
		paymentMethodId: this.customerAdditionalData.paymentMethodId,
		phone: customer.phoneNumbers[0] || '',
		phoneNumbers: customer.phoneNumbers,
		postalCode: this.customerUbigeoData.postalCode,
		provinceId: this.customerUbigeoData.provinceId,
		typeDestinationId: this.customerAccountancyData.typeDestinationId,
		zone: this.customerUbigeoData.zone,
	};
	if (method === 'patch') {
		body.flagAddress = false;
		if (this.customer.flagTypeUser === 1) {
			body.password = this.newPassword;
		} else {
			body.password = customer.password;
		}
	}
	if (this.id) {
		if (this.customer.flagTypeUser === 1) {
			body.flagTypeUser = 1;
		}
	}
	if (this.id && body.latitude && body.longitude) {
		body.flagAddress = true;
	}
	if (this.subsidiaryConfigIntegrations && this.accountingAccount.code) {
		body.accountingAccount = {
			code: this.accountingAccount.code,
		};
		body.accountingCode = this.accountingAccount.code;
	}
	if (customer.dni && customer.flagTypePerson === 7) {
		const { name, lastname, ruc } = customer;
		body.rzSocial = `${name} ${lastname}`;
		body.ruc = ruc;
		body.name = name;
		body.lastname = lastname;
	} else if (customer.dni && customer.flagTypePerson !== 2) {
		body.dni = customer.dni;
		body.name = customer.name;
		body.lastname = customer.lastname;
	} else {
		body.rzSocial = customer.rzSocial;
		body.ruc = customer.ruc;
	}
	try {
		await this.$httpSales[method](url, body);
		this.showNotification(`El cliente ha sido ${message} correctamente`);
		this.goTo('customers');
	} catch (err) {
		if (err.data.message === 'CUSTOMER_EXIST_ERROR') {
			this.showNotification(
				'El cliente ya está registrado, utilice otro correo.',
				'warning'
			);
			if (this.modalCondicion) {
				this.modalCondicion = false;
				this.goTo('customers');
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function saveAccountancyData(accountancyData) {
	this.customerAccountancyData = { ...accountancyData };
	this.showSaveNotification();
	this.close();
}

function saveAdditionals(additionals) {
	this.customerAdditionalData = { ...additionals };
	this.showSaveNotification();
	this.close();
}

function saveUbigeo(ubigeo) {
	this.customerUbigeoData = { ...ubigeo };
	this.showSaveNotification();
	this.close();
}

function showSaveNotification() {
	this.showNotification(
		'Los datos han sido guardados correctamente para ser enviados al finalizar la creación del cliente.'
	);
}

async function loadAccountingAccounts() {
	const { company, subsidiary } = this.$userInfo;
	const { country } = company;
	const { ruc } = subsidiary;
	// const params = { status: 1 };
	try {
		({ data: this.accountingAccounts } = await this.$httpQuipu.get(
			`accounting-accounts/${country.countryCode}/${ruc}/fb`
		));
		// ({ data: this.accountingAccounts } = await this.$httpQuipu.get(
		// 	`accounting-plan/${this.$userInfo.companyId}/quipu`, { params }));
		if (this.id) {
			this.loadData();
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'SUBSIDIARY_NOT_FOUND') {
				this.showGenericError(
					'No se encontró información de cuentas contables para la sucursal.'
				);
			}
		}
	}
}

function setData(value) {
	this.accountingAccount = { ...value };
}

function data() {
	return {
		accountingAccount: {},
		accountingAccounts: [],
		action: {
			code: '',
			open: false,
			title: '',
			width: 553,
		},
		cleanData: false,
		confirmNewPass: '',
		customer: {},
		customerAccountancyData: {
			accountAdvanceAccount: null,
			accountingCode: null,
			countryId: null,
			flagAccounting: null,
			flagDetraction: null,
			flagExemptTaxes: null,
			flagItemsWithoutRetainer: null,
			flagRetentionAgent: null,
			flagSpecialContributor: null,
			originIncomeId: null,
			typeDestinationId: null,
		},
		customerAdditionalData: {
			creditLimitDays: null,
			customerType: '',
			dateBirth: '',
			flagRelatedCustomer: null,
			flagPostDatedCredit: null,
			limitAmountCredit: null,
			paymentMethodId: null,
			purchaseFrequency: null,
			typePaymentIds: [],
		},
		customerUbigeoData: {
			alias: '',
			cityId: null,
			geoposition: '',
			latitude: null,
			longitude: null,
			parishId: null,
			postalCode: '',
			provinceId: null,
			zone: '',
		},
		disabledEmail: false,
		disabledPassword: false,
		disabledFlag: false,
		loading: false,
		newPassword: '',
		purchasesFrequencys: [
			{
				id: 1,
				name: 'Diario',
				code: 'diario',
			},
			{
				id: 2,
				name: 'Semanal',
				code: 'semanal',
			},
			{
				id: 3,
				name: 'Quincenal',
				code: 'quincenal',
			},
			{
				id: 4,
				name: 'Mensual',
				code: 'mensual',
			},
			{
				id: 5,
				name: 'Bimestral',
				code: 'bimestral',
			},
			{
				id: 6,
				name: 'Anual',
				code: 'anual',
			},
		],
		showAlertActive: false,
		subsidiaryConfigIntegrations: false,
		modalCondicion: false,
		dataResponseCustomer: {},
	};
}

export default {
	name: 'pages-customers-new',
	components: {
		actionSidebar,
		appActions,
		customersAccountancyForm,
		customersAdditionalsForm,
		customersUbigeoForm,
		customersForm,
		headerPage,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		actionCode,
		close,
		loadAccountingAccounts,
		loadData,
		openChangePassword,
		runAction,
		save,
		closeModal,
		saveAccountancyData,
		saveAdditionals,
		saveUbigeo,
		setData,
		showSaveNotification,
		updatePassword,
		responseCustomer(dataResponse) {
			this.dataResponseCustomer = dataResponse;
		},
		handleActiveChange(value) {
			this.showAlertActive = !value;
		},
	},
	props: {
		id: [Number, String],
	},
	validations,
};
</script>

<style lang="scss" scoped>
.center-modal {
	text-align: center;
}
</style>
