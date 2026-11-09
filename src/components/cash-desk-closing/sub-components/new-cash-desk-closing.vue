<template>
	<div>
		<v-container mt-3>
			<v-layout row wrap>
				<!-- <v-flex xs12 mb-3 v-if="flagInt">
					<autocomplete-component
						append-icon="arrow_drop_down"
						select-column="4"
						disabled-column="8"
						disabled-class="accounting-input-disabled"
						http-code="$httpQuipu"
						:item="account"
						item-text="name"
						item-value="code"
						:items="accounts"
						model="accountingAccount"
						placeholder-value="Busca una cuenta"
						placeholder-input="Nombre de la cuenta"
						prop="account"
						prop-search="fullName"
						:readonly-prop="accountName"
						readonly-prop-show
						:resource-url="`accounting-accounts/${$userInfo.company.country.countryCode}/${$userInfo.subsidiary.ruc}/fb`"
						return-object
						select-create
						@return-data="getAccountValue"
					></autocomplete-component>
				</v-flex> -->
				<v-flex xs12 mb-3>
					<v-text-field
						label="Nombre de caja"
						hide-details
						:value="name"
						class="filter-select"
						@input="sendValue($event, 'name')"
					></v-text-field>
					<transition name="fade" mode="out-in">
						<span class="form-group__message" v-if="!$v.name.required">
							El nombre es requerido.
						</span>
					</transition>
				</v-flex>
				<!-- <v-flex xs12 mb-3 v-if="!cashId">
					<v-text-field
						class="filter-select"
						label="Código"
						hide-details
						:value="code"
						@input="sendValue($event, 'code')"
					></v-text-field>
					<transition name="fade" mode="out-in">
						<span class="form-group__message" v-if="!$v.code.required">
							El código es requerido.
						</span>
						<span class="text-not-code-blank" v-if="checkBlankCode(code)">
							No se permite espacios en blanco
						</span>
					</transition>
				</v-flex> -->
				<v-flex xs12 mb-3>
					<v-text-field
						label="Descripción"
						hide-details
						:value="description"
						class="filter-select"
						@input="sendValue($event, 'description')"
					></v-text-field>
				</v-flex>
				<v-flex xs12 mb-3 mt-2>
					<v-select
						bottom
						hide-details
						:items="subsidiaries"
						:label="labelSucursal()"
						item-text="sucursalName"
						item-value="id"
						class="filter-select"
						content-class="filter-select-content"
						:value="subsidiaryId"
						:disabled="disabledEdit"
						@input="sendValue($event, 'subsidiaryId')"
					></v-select>
					<span class="form-group__message" v-if="!$v.subsidiaryId.required">
						Selecciona una {{ labelSucursal() }}
					</span>
				</v-flex>
				<v-flex xs12 mb-3 mt-2>
					<v-select
						required
						bottom
						hide-details
						:items="warehouses"
						:label="labelWarehouse()"
						item-text="name"
						item-value="id"
						class="filter-select"
						content-class="filter-select-content"
						:value="warWarehousesId"
						:disabled="!subsidiaryId || disabledEdit"
						@input="sendValue($event, 'warWarehousesId')"
					></v-select>
				</v-flex>
				<v-layout column>
					<span class="form-group__message" v-if="!$v.warWarehousesId.required">
						Selecciona una {{ labelWarehouse() }}
					</span>
				</v-layout>
				<v-flex xs12 mt-3>
					<label class="body-2">Estado:</label>
				</v-flex>
				<v-flex xs12>
					<v-switch
						class="switch-inline"
						hide-details
						color="success"
						v-model="flag"
					></v-switch>
					<span class="ml-2">{{ stateName(flag) }}</span>
				</v-flex>
				<v-flex xs12 mt-3>
					<label class="body-2">Control de Saldos:</label>
				</v-flex>
				<v-flex xs12>
					<v-switch
						class="switch-inline"
						hide-details
						color="success"
						:true-value="1"
						:false-value="0"
						v-model="cashFlagControl"
					></v-switch>
					<span class="ml-2">{{ stateName(cashFlagControl) }}</span>
					<app-tooltip-button
						color="primary"
						icon="help"
						text="Al activar la acción, se restringirán los movimientos que generen un saldo negativo en la caja"
					></app-tooltip-button>
				</v-flex>
			</v-layout>
		</v-container>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled || checkBlankCode(code)"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="accept"
			/>
		</section>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';

function created() {
	this.companyId = this.$userInfo.companyId;
	this.flag = this.flagActive || false;
	this.cashFlagControl = this.flagControl || 0;
	this.flagInt = this.$userInfo.subsidiary.flagIntegrations;
	this.loadData();
}

function disabled() {
	return this.loading || this.$v.$invalid;
}

function accept() {
	const url = this.cashId ? `cash/${this.cashId}` : 'cash';
	const method = this.cashId ? 'patch' : 'post';
	const message = this.cashId ? 'editada' : 'creada';
	const body = {
		accountingAccount: {
			code: this.accountCode,
			name: this.accountName,
		},
		code: this.code,
		description: this.description,
		flagActive: !!this.flag,
		flagControl: this.cashFlagControl,
		name: this.name,
		warWarehousesId: this.warWarehousesId,
		subsidiaryId: this.subsidiaryId,
	};
	this.$emit('accept', { body, message, method, url });
}

function closeModal() {
	this.$emit('close-modal');
}

async function loadData() {
	const requests = [this.$httpSales.get('subsidiaries')];

	// if (this.flagInt) {
	// 	requests.push(this.$httpQuipu.get(`accounting-plan/${this.companyId}/quipu`));
	// }

	try {
		// if ((this.cashId && this.flagInt) || this.flagInt) {
		// 	[{ data: this.subsidiaries }, { data: this.accounts }] = await Promise.all(
		// 		requests
		// 	);
		// } else {
		// 	[{ data: this.subsidiaries }] = await Promise.all(requests);
		// }

		[{ data: this.subsidiaries }] = await Promise.all(requests);

		if (this.subsidiaryId && this.warWarehousesId) {
			this.loadWarehouse(this.subsidiaryId);
		} else if (this.subsidiaries.length === 1) {
			this.sendValue(this.subsidiaries[0].id, 'subsidiaryId');
		}

		if (this.cashId && this.accountCode && this.accountName) {
			this.account = {
				code: this.accountCode,
				name: this.accountName,
			};
		}
	} catch (error) {
		console.log(error);
		if (error.status === 400) {
			if (error.data.message === 'CUSTOMER_NOT_EXIST') {
				this.showGenericError('No se encontró información de cuentas contables');
			}
		} else {
			this.showGenericError();
		}
	}
}

function onlyOne(warehouses) {
	if (warehouses.length === 1) {
		this.$emit('set-value', { value: warehouses[0].id, model: 'warWarehousesId' });
	}
}

function sendValue(e, model) {
	const value = { value: e, model };
	this.$emit('set-value', value);
	if (model === 'subsidiaryId') {
		this.$emit('set-value', { value: null, model: 'warWarehousesId' });
		this.loadWarehouse(e);
	}
}

function validations() {
	return {
		name: {
			required,
		},
		warWarehousesId: {
			required,
		},
		subsidiaryId: {
			required,
		},
	};
}

function getAccountValue(value) {
	if (value) {
		this.$emit('set-account', value);
	}
}

function stateName(value) {
	return value ? 'Activo' : 'Inactivo';
}

function showAccountingData() {
	const { subsidiary: subsidiaryUser } = this.$userInfo;
	const { configIntegrations } = subsidiaryUser;
	const subsidiaryConfigIntegrations =
		configIntegrations &&
		((configIntegrations.accountingPlan &&
			configIntegrations.accountingPlan.flagConfig) ||
			(configIntegrations.accountingConfiguration &&
				configIntegrations.accountingConfiguration.flagConfig));
	return subsidiaryConfigIntegrations;
}

async function loadWarehouse(subsidiaryId) {
	const params = {
		subsidiaryId,
	};
	try {
		const { data: response } = await this.$httpProducts.get('warehouses', { params });
		this.warehouses = response;
		if (this.warehouses.length === 1) {
			this.sendValue(this.warehouses[0].id, 'warWarehousesId');
			// this.warWarehousesId = this.warehouses[0].id;
		}
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		accountingAccount: null,
		accounts: [],
		cashFlagControl: false,
		companyId: 0,
		warehouses: [],
		flag: false,
		flagInt: false,
		account: null,
		subsidiaries: [],
	};
}

export default {
	name: 'new-cash-desk-closing',
	components: {
		autocompleteComponent,
		modalSidebarButton,
	},
	computed: {
		disabled,
		showAccountingData,
	},
	created,
	data,
	methods: {
		accept,
		closeModal,
		getAccountValue,
		loadData,
		onlyOne,
		sendValue,
		stateName,
		loadWarehouse,
	},
	validations,
	props: {
		accountingAccounts: {
			default: () => [],
			type: Array,
		},
		cashId: {
			type: [Number, String],
		},
		cleanData: {
			default: false,
			type: Boolean,
		},
		code: {
			type: [Number, String],
		},
		description: {
			type: [Number, String],
		},
		name: {
			type: [Number, String],
		},
		warWarehousesId: {
			type: [Number, String],
		},
		flagActive: {
			type: [Number, String],
		},
		flagControl: [Number, String],
		accountCode: [String, Number],
		accountName: [String, Number],
		loading: {
			default: false,
			type: Boolean,
		},
		subsidiaryId: [Number, String],
		disabledEdit: {
			default: false,
			type: Boolean,
		},
	},
};
</script>
