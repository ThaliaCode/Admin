<template>
	<div>
		<v-form method="post" @submit.prevent="$emit('save', model)">
			<v-layout wrap px-4 pt-4>
				<v-flex xs12 sm6 mb-2 pr-2>
					<app-select
						disabled
						:item="moduleOriginId"
						item-text="name"
						item-value="id"
						:items="modules"
						label="Origen"
						model="moduleOriginId"
					/>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pl-2>
					<app-select
						:item="model.cashId"
						item-text="name"
						item-value="id"
						:items="cash"
						label="Caja Destino"
						model="cashId"
						@input="getData"
					/>
					<span class="form-group__message" v-if="$v.model.cashId.$invalid">
						La caja es requerida
					</span>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pr-2>
					<app-date-select
						:date-formatted="model.paymentDate"
						label="Fecha"
						:max-date="maxDate"
						model="paymentDate"
						@input="getDate"
					/>
					<span class="form-group__message" v-if="$v.model.paymentDate.$invalid">
						La fecha es requerida
					</span>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pl-2>
					<app-input-text
						label="Importe"
						model="amount"
						:text="model.amount"
						type="number"
						@input="getValue"
					/>
					<span class="form-group__message" v-if="$v.model.amount.$invalid">
						El importe es requerido
					</span>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pr-2>
					<app-select
						:item="model.typeMovement"
						item-text="name"
						item-value="id"
						:items="typeMovements"
						label="Tipo de Movimiento"
						model="typeMovement"
						@input="getData"
					/>
					<span class="form-group__message" v-if="$v.model.typeMovement.$invalid">
						El tipo es requerido
					</span>
				</v-flex>

				<v-flex xs12 sm6 mb-2 pl-2>
					<app-select
						:item="model.currency"
						item-text="code"
						item-value="code"
						:items="currencies"
						label="Moneda"
						model="currency"
						@input="getData"
					/>
					<span class="form-group__message" v-if="$v.model.currency.$invalid">
						La moneda es requerida
					</span>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pr-2>
					<app-select
						:item="model.typePaymentId"
						item-text="name"
						item-value="id"
						:items="typePayments"
						label="Tipo de Pago"
						model="typePaymentId"
						@input="getData"
					/>
					<span class="form-group__message" v-if="$v.model.typePaymentId.$invalid">
						El tipo de pago es requerido
					</span>
				</v-flex>
				<v-flex
					xs12
					sm6
					mb-2
					pl-2
					v-if="model.typePaymentId && model.typePaymentId !== 1"
				>
					<app-input-text
						label="Nro de Documento"
						model="documentNumber"
						:text="model.documentNumber"
						@input="getValue"
					/>
				</v-flex>
				<v-flex xs12 mb-2>
					<app-input-text
						label="Referencia"
						model="reference"
						:text="model.reference"
						@input="getValue"
					/>
				</v-flex>
				<v-flex xs12 mb-2>
					<app-input-text
						label="Concepto"
						model="concept"
						:text="model.concept"
						@input="getValue"
					/>
				</v-flex>
				<v-flex xs12 mb-2>
					<app-input-text
						label="Beneficiario"
						model="beneficiary"
						:text="model.additionalInformation.beneficiary"
						@input="getValue"
					/>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					success-color="primary"
					:is-loading="$v.model.$invalid || loading"
					:on-run-service="loading"
					@cancel-button-clicked="$emit('close')"
					@accept-button-clicked="$emit('save', model)"
				/>
			</section>
		</v-form>
	</div>
</template>

<script>
import { format, addDays } from 'date-fns';
import { minValue, required } from 'vuelidate/lib/validators';
import appDateSelect from '@/components/shared/app-date-select';
import appSelect from '@/components/shared/app-select';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import typeTransaction from '@/shared/type-transaction';

function created() {
	this.loadResources();
}

function getDate({ model, value }) {
	this.model[model] = format(value, 'YYYY-MM-DD');
}

function getValue({ model, value }) {
	if (model === 'beneficiary') {
		this.model.additionalInformation[model] = value;
	} else {
		this.model[model] = value;
	}
}

async function loadResources() {
	const request = [
		this.$httpSales.get('module'),
		this.$httpSales.get('cash', { params: { flagActive: 1 } }),
		this.getCurrencies(),
		this.$httpSales.get('type-movement'),
	];
	[
		{ data: this.modules },
		{ data: this.cash },
		{ data: this.currencies },
		{ data: this.typeMovements },
	] = await Promise.all(request);
	this.model.currency = this.$userInfo.company.currency;
	this.model.typeTransaction = typeTransaction.Normal;
	this.model.cashId = this.cash.length === 1 ? this.cash[0].id : null;
	this.moduleOriginId = this.modules.find((m) => m.code === 'CAJA').id;
	this.currencies = this.currencyByCountry(this.currencies);
}

function maxDate() {
	return format(addDays(this.$today(), 0), 'YYYY-MM-DD');
}

function validations() {
	return {
		model: {
			amount: {
				minValue: minValue(0.1),
				required,
			},
			cashId: {
				minValue: minValue(1),
				required,
			},
			currency: { required },
			paymentDate: { required },
			typeMovement: {
				minValue: minValue(1),
				required,
			},
			typePaymentId: { required },
		},
	};
}

function data() {
	return {
		cash: [],
		currencies: [],
		model: {
			additionalInformation: {
				beneficiary: '',
			},
			amount: null,
			cashId: null,
			concept: null,
			currency: '',
			documentNumber: null,
			paymentAmount: null,
			paymentDate: null,
			reference: null,
			typeMovement: null,
			typePaymentId: null,
			typeTransaction: null,
		},
		moduleOriginId: null,
		modules: [],
		typeMovements: [],
	};
}

export default {
	name: 'cash-movements-new',
	components: {
		appDateSelect,
		appSelect,
		modalSidebarButton,
	},
	computed: {
		maxDate,
	},
	created,
	data,
	methods: {
		getData({ model, value }) {
			this.model[model] = value.id;
			if (model === 'typePaymentId') {
				this.model.documentNumber = null;
			}
		},
		getDate,
		getValue,
		loadResources,
	},
	props: {
		loading: {
			default: false,
			type: Boolean,
		},
		typePayments: {
			default: () => [],
			type: Array,
		},
	},
	validations,
};
</script>
