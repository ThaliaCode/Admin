<template>
	<div>
		<header-page :title="$route.meta.title" />
		<div class="new-product">
			<v-layout row wrap px-5 pb-5 mb-5 justify-center>
				<v-flex
					xs5
					px-2
					my-4
					mr-3
					pt-2
					class="new-product-form"
					v-if="!isLoading"
				>
					<v-flex xs10 mb-3 class="title-section_border">
						<span>{{ labelSucursal() }}</span>
					</v-flex>
					<v-flex xs12 md10 v-if="subsidiaries.length === 1">
						<span>{{ subsidiaries[0].sucursalName }}</span>
					</v-flex>
					<v-flex xs12 md10 v-else>
						<app-select
							item-text="sucursalName"
							item-value="id"
							:label="`Seleccionar una ${labelSucursal()}`"
							:items="subsidiaries"
							:item="newBankAccount.subsidiaryIds[0]"
							@input="setSubsidiaryIds"
						/>
						<span
							class="form-group__message"
							v-if="!$v.newBankAccount.subsidiaryIds.required"
						>
							La {{ labelSucursal() }} es requerida.
						</span>
					</v-flex>
					<v-flex xs10 my-3 class="title-section_border">
						<span>DATOS GENERALES</span>
					</v-flex>
					<v-flex xs12 md10>
						<v-select
							required
							return-object
							class="filter-select shadow-inset mt-4"
							item-text="name"
							item-value="id"
							label="Tipo de cuenta bancaria"
							v-model="newBankAccount.bankAccountType"
							:items="types"
						></v-select>
						<span
							class="form-group__message"
							v-if="!$v.newBankAccount.bankAccountType.required"
						>
							El tipo de cuenta bancaria es requerido.
						</span>
						<v-text-field
							required
							class="filter-select shadow-inset mt-4"
							name="new-product-name"
							label="Nombre"
							v-model="newBankAccount.name"
						></v-text-field>
						<span
							class="form-group__message"
							v-if="!$v.newBankAccount.name.required"
						>
							El nombre de la cuenta es requerido.
						</span>
						<v-text-field
							required
							class="filter-select shadow-inset mt-4"
							name="new-product-model"
							label="Número de cuenta"
							v-model="newBankAccount.accountNumber"
						></v-text-field>
						<span
							class="form-group__message"
							v-if="!$v.newBankAccount.accountNumber.required"
						>
							El número de cuenta bancaria es requerido.
						</span>
						<div>
							<app-select
								:item="newBankAccount.currency"
								item-text="code"
								item-value="id"
								:items="currencies"
								label="Moneda"
								model="currency"
								@input="setCurrency"
								v-if="currencies.length > 1"
							/>
							<div v-else-if="currencies.length" class="my-3">
								<div class="title-select mb-1">Moneda</div>
								<span>{{ currencies[0].code }}</span>
							</div>
						</div>
						<div
							v-if="flagAccounting && isAccounting"
							class="mt-2 mb-2 position-relative"
						>
							<button
								v-if="showBtnTemporal"
								class="btn-temporal"
								type="button"
								@click="loadAccountingAccount('hide')"
							></button>
							<autocomplete-component
								append-icon="arrow_drop_down"
								content-class-custom="new-bank-account-menu"
								select-column="4"
								disabled-column="8"
								disabled-class="accounting-input-disabled"
								http-code="$httpQuipu"
								id-select-create="account-new-bank"
								:item="newBankAccount.accountingAccount"
								item-text="fullName"
								item-value="id"
								:items="accountingAccounts"
								model="accountingAccount"
								placeholder-value="Busca una cuenta"
								placeholder-input="Nombre de la cuenta"
								prop="account"
								prop-search="fullName"
								:readonly-prop="newBankAccount.accountingAccount.accountingName"
								readonly-prop-show
								:resource-url="`accounting-accounts/${$userInfo.company.country.countryCode}/${subsidiaryRuc}/fb`"
								return-object
								select-create
								@return-data="setAccountingCodes"
							></autocomplete-component>
						</div>
						<div>
							<autocomplete-component
								:items="cities"
								item-text="name"
								item-value="id"
								label-value="Ciudad"
								local-search
								:item="newBankAccount.cityId"
								@return-data="setValue({ model: 'cityId', value: $event })"
							></autocomplete-component>
						</div>
						<v-select
							required
							autocomplete
							return-object
							:disabled="newBankAccount.typeAccount"
							class="filter-select shadow-inset mt-3"
							item-text="name"
							item-value="id"
							label="Banco"
							v-model="newBankAccount.bank"
							:items="banks"
						></v-select>
						<span
							class="form-group__message"
							v-if="!$v.newBankAccount.bank.required"
						>
							El banco es requerido.
						</span>
						<v-text-field
							class="filter-select shadow-inset mt-4"
							name="CCI"
							label="CCI"
							v-model="newBankAccount.accountNumberCi"
						></v-text-field>
						<v-layout d-flex justify-space-around align-center mt-3>
							<v-flex d-flex mb-4>
								<v-flex xs6 mr-3>
									<span>Para formato cobro:</span>
								</v-flex>
								<v-flex>
									<v-switch
										hide-details
										color="primary"
										v-model="newBankAccount.flagFormatCharge"
									></v-switch>
								</v-flex>
							</v-flex>
							<v-flex>
								<v-checkbox
									color="primary"
									v-model="newBankAccount.flagActive"
									label="Activa"
								></v-checkbox>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-flex>
				<v-flex xs5 px-2 my-4 pt-2>
					<v-flex xs10 mb-4 class="title-section_border">
						<span>INFORMACIÓN ADICIONAL</span>
					</v-flex>
					<v-flex xs10>
						<v-text-field
							class="filter-select shadow-inset mt-4"
							label="Titular de la Cuenta"
							v-model="newBankAccount.additionalInformation.personName"
						></v-text-field>
					</v-flex>
					<v-flex xs10>
						<v-text-field
							class="filter-select shadow-inset mt-4"
							label="Documento del Titular de la Cuenta"
							v-model="newBankAccount.additionalInformation.personDocumentNumber"
						></v-text-field>
					</v-flex>
					<v-flex xs10>
						<v-text-field
							class="filter-select shadow-inset mt-4"
							label="Correo de Verificación"
							v-model="newBankAccount.additionalInformation.documentEmail"
						></v-text-field>
					</v-flex>
					<v-flex xs10 mt-4 mb-3 class="title-section_border">
						<span>DATOS INICIALES (NO AFECTA CONTABILIDAD NI REPORTES)</span>
					</v-flex>
					<v-flex xs12 sm6 md5 mt-3>
						<v-text-field
							class="filter-select shadow-inset mt-4"
							name="initial-balance"
							label="Balance Inicial"
							v-model="newBankAccount.initialBalance"
						></v-text-field>
					</v-flex>
					<v-flex xs12 sm6 md5 mt-3>
						<v-menu
							lazy
							v-model="menu"
							transition="scale-transition"
							offset-y
							full-width
						>
							<v-text-field
								color="primary"
								slot="activator"
								label="Fecha de inicio"
								v-model="newBankAccount.cutoffDate"
								single-line
								append-icon="event"
								class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-end"
								readonly
							></v-text-field>
							<v-date-picker
								v-model="newBankAccount.cutoffDate"
								no-title
								scrollable
							></v-date-picker>
						</v-menu>
					</v-flex>
					<v-layout d-flex justify-space-around align-center mt-3>
						<v-flex d-flex mb-4>
							<v-flex xs6 mr-3>
								<span>Cuenta Bancaria Principal:</span>
							</v-flex>
							<v-flex>
								<v-switch
									hide-details
									color="primary"
									v-model="newBankAccount.primaryBankAccount"
								></v-switch>
							</v-flex>
						</v-flex>
					</v-layout>
					<v-layout d-flex justify-space-around align-center v-if="showDetraction">
						<v-flex d-flex mb-4>
							<v-flex xs6 mr-3>
								<span>Cuenta de detracción:</span>
							</v-flex>
							<v-flex>
								<v-switch
									:disabled="!!id"
									hide-details
									color="primary"
									v-model="newBankAccount.typeAccount"
									@change="changeSwitch"
								></v-switch>
							</v-flex>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer text-xs-center py-4">
				<v-btn
					type="button"
					color="pink"
					class="btn-action"
					:disabled="isLoading"
					@click.native="cancelAccountBank"
				>
					Cancelar
					<v-icon color="white" size="16"> highlight_off </v-icon>
				</v-btn>
				<v-btn
					:disabled="$v.$invalid"
					type="button"
					color="success"
					class="btn-action"
					@click.native="registerAccountBank"
				>
					Aceptar
					<v-icon color="white" size="16"> check_circle_outline </v-icon>
				</v-btn>
			</section>
		</div>
	</div>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

const { setLocalData } = helper;

function created() {
	this.companyId = this.$userInfo.companyId;
	this.loadData();
}

async function loadAccountingAccount(code) {
	const { company } = this.$userInfo;
	const { country } = company;
	const ruc = this.subsidiaryRuc;
	if (code === 'hide') {
		({ data: this.accountingAccounts } = await this.$httpQuipu.get(
			`accounting-accounts/${country.countryCode}/${ruc}/fb`
		));
		this.flagAccounting = this.accountingAccounts.length > 0;
		const element = document.getElementById('account-new-bank');
		this.showBtnTemporal = false;
		element.click();
	} else {
		({ data: this.accountingAccounts } = await this.$httpQuipu.get(
			`accounting-accounts/${country.countryCode}/${ruc}/fb`
		));
		this.flagAccounting = this.accountingAccounts.length > 0;
	}
}

function cancelAccountBank() {
	this.newBankAccount = {
		accountNumber: '',
		accountingAccount: {
			accountingCode: '',
			accountingName: '',
		},
		nameAccountingAccount: null,
		additionalInformation: {
			personName: null,
			personDocumentNumber: null,
			documentEmail: null,
		},
		bank: {},
		bankAccountType: {},
		cityId: null,
		currency: null,
		currencySymbol: '',
		cutoffDate: helper.formatDate(new Date(), 'YYYY-MM-DD'),
		flagFormatCharge: false,
		initialBalance: 0,
		name: '',
		flagActive: false,
		status: '',
		subsidiaryIds: [],
		accountNumberCi: '',
		primaryBankAccount: false,
	};
	this.goTo('bank-accounts');
}

async function loadData() {
	const requests = [
		this.getBanks(),
		this.getAccountType(),
		this.getCurrencies(),
		this.getCities(),
		this.$httpSales.get('subsidiaries'),
	];
	if (this.id) {
		requests.push(this.getBankAccount(this.id));
	}
	try {
		const [banks, types, currencies, cities, subsidiaries, newBankAccount] =
			await Promise.all(requests);
		this.banks = banks.data;
		this.types = types.data;
		this.currencies = this.currencyByCountry(currencies.data);
		this.cities = cities.data;
		this.setSubsidiaries(subsidiaries.data);
		const userCurrency = this.$userInfo.company.currency;
		const currentCurrency =
			this.currencies.find((c) => c.code === userCurrency) || {};
		this.showBtnTemporal = !!this.id;
		if (this.id) {
			this.newBankAccount = newBankAccount.data;
			this.newBankAccount.subsidiaryIds =
				newBankAccount.data.subsidiaries || [];
			this.newBankAccount.cutoffDate = helper.formatDate(
				this.newBankAccount.cutoffDate,
				'YYYY-MM-DD'
			);
			this.newBankAccount.typeAccount = this.newBankAccount.typeAccount === 2;
			this.newBankAccount.flagFormatCharge =
				this.newBankAccount.flagFormatCharge === 1;
			this.newBankAccount.primaryBankAccount =
				this.newBankAccount.primaryBankAccount === 1;
			this.newBankAccount.flagActive = this.newBankAccount.flagActive === 1;
			if (!this.newBankAccount.currency) {
				this.newBankAccount.currency = currentCurrency.id;
				this.newBankAccount.currencySymbol = currentCurrency.symbol;
			}
			if (newBankAccount.data.subsidiaries) {
				if (newBankAccount.data.subsidiaries[0]) {
					const subsidiaryItem = this.subsidiaries.find(
						(s) => s.id === newBankAccount.data.subsidiaries[0]
					);
					this.subsidiaryRuc = subsidiaryItem.ruc;
					this.flagAccounting = true;
					if (newBankAccount.data.accountingAccount) {
						if (newBankAccount.data.accountingAccount.accountingCode) {
							this.accountingAccounts = [
								{ ...newBankAccount.data.accountingAccount },
							];
							this.newBankAccount.accountingAccount = {
								...newBankAccount.data.accountingAccount,
							};
						}
					} else {
						this.newBankAccount.accountingAccount = {
							accountingCode: '',
							accountingName: '',
						};
					}
				}
			}
		} else {
			this.newBankAccount.currency = currentCurrency.id;
			this.newBankAccount.currencySymbol = currentCurrency.symbol;
		}
	} catch (err) {
		this.showGenericError();
	}
}

function setSubsidiaries(subsidiaries) {
	this.subsidiaries = subsidiaries;
	this.setSubsidiaryIds({ value: subsidiaries[0] });
}

async function registerAccountBank() {
	const urlPost = 'bank-account';
	const urlPatch = `bank-account/${this.id}`;
	const url = this.id ? urlPatch : urlPost;
	const methodPost = 'post';
	const methodPatch = 'patch';
	const method = this.id ? methodPatch : methodPost;
	const detractionId = this.newBankAccount.typeAccount ? 2 : undefined;
	const body = {
		accountingAccount: this.newBankAccount.accountingAccount,
		additionalInformation: this.newBankAccount.additionalInformation,
		bankId: this.newBankAccount.bank.id,
		cityId: this.newBankAccount.cityId || null,
		name: this.newBankAccount.name,
		accountNumber: this.newBankAccount.accountNumber,
		currency: this.newBankAccount.currency,
		currencySymbol: this.newBankAccount.currencySymbol,
		bankAccountTypeId: this.newBankAccount.bankAccountType.id,
		flagFormatCharge: this.newBankAccount.flagFormatCharge,
		primaryBankAccount: this.newBankAccount.primaryBankAccount,
		initialBalance: this.newBankAccount.initialBalance,
		cutoffDate: this.newBankAccount.cutoffDate,
		flagActive: this.newBankAccount.flagActive,
		subsidiaries: this.newBankAccount.subsidiaryIds,
		accountNumberCi: this.newBankAccount.accountNumberCi,
		typeAccount: this.id ? undefined : detractionId,
	};
	try {
		await this.$httpSales[method](url, body);
		this.showNotification('Cuenta creada con éxito');
		this.goTo('bank-accounts', { params: { modifyAccount: true } });
	} catch (err) {
		this.showGenericError();
	}
}

function updateUserInfoInLocalStorage(info) {
	const newInfo = { ...info };
	setLocalData('banks-account', newInfo);
}

function setCurrency({ value }) {
	this.newBankAccount.currency = value.id;
	this.newBankAccount.currencySymbol = value.symbol;
}

function setValue({ model, value }) {
	if (value) {
		this.newBankAccount[model] = value;
	}
}

function setAccountingCodes(value) {
	if (value) {
		this.newBankAccount.accountingAccount.accountingCode = value.code;
		this.newBankAccount.accountingAccount.accountingName = value.name;
	}
}

function validations() {
	return {
		newBankAccount: {
			bank: { required },
			cutoffDate: { required },
			initialBalance: { required },
			name: { required },
			accountNumber: { required },
			bankAccountType: { required },
			subsidiaryIds: {
				required: requiredIf(() => !this.id),
			},
		},
	};
}

function setSubsidiaryIds({ value }) {
	const detraction = this.subsidiaries.find((s) => s.id === value.id);
	this.showDetraction = detraction && detraction.settings.flagDetraction;
	this.newBankAccount.subsidiaryIds = [value.id];
	this.subsidiaryRuc = value.ruc;

	const { configIntegrations } = value;
	if (
		configIntegrations &&
		configIntegrations.accountingConfiguration &&
		configIntegrations.accountingConfiguration.flagConfig
	) {
		this.loadAccountingAccount();
	}
}

function data() {
	return {
		account: null,
		accountingName: '',
		accountingProperties: ['code'],
		autocompleteItems: [],
		banks: [],
		cities: [],
		currencies: [],
		flagAccounting: null,
		isLoading: false,
		menu: false,
		newBankAccount: {
			accountNumber: '',
			accountingAccount: {
				accountingCode: '',
				accountingName: '',
			},
			nameAccountingAccount: null,
			additionalInformation: {
				personName: null,
				personDocumentNumber: null,
				documentEmail: null,
			},
			bank: {},
			bankAccountType: {},
			cityId: null,
			currency: null,
			currencySymbol: '',
			cutoffDate: helper.formatDate(new Date(), 'YYYY-MM-DD'),
			flagFormatCharge: false,
			primaryBankAccount: false,
			initialBalance: 0,
			name: '',
			flagActive: false,
			status: '',
			subsidiaryIds: [],
			accountNumberCi: '',
		},
		accountingAccounts: [],
		subsidiaries: [],
		types: [],
		subsidiaryRuc: null,
		showBtnTemporal: false,
		showDetraction: false,
	};
}

export default {
	name: 'new-account-bank',
	components: {
		autocompleteComponent,
		headerPage,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		cancelAccountBank,
		loadAccountingAccount,
		loadData,
		registerAccountBank,
		setAccountingCodes,
		setCurrency,
		setSubsidiaries,
		setSubsidiaryIds,
		setValue,
		updateUserInfoInLocalStorage,
		changeSwitch() {
			const bankNation = this.banks.find((b) => b.code === 'BDLN');
			if (bankNation) {
				this.newBankAccount.bank = bankNation;
			}
		},
	},
	props: {
		id: [Number, String],
	},
	validations,
};
</script>

<style lang="scss" scoped>
.title-section_border {
	border-bottom: 1px solid color(blue-grey);
	font-family: map-get($fonts, open-bold);
	font-size: map-get($sizes, small);
	text-transform: uppercase;
}

.search-container {
	position: relative;
}

.button-inside {
	background-color: color(primary) !important;
	color: white;
	height: 30px;
	margin: 0;
	min-width: 30px !important;
	position: absolute;
	top: 0;
	right: 0;
	width: 30px;
}

.position-relative {
	position: relative;
}

.btn-temporal {
	position: absolute;
	height: 31px;
	width: 100%;
	z-index: 1;
}
</style>
