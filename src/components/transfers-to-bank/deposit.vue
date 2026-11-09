<template>
	<div>
		<v-layout class="back-gray py-2 px-3" row align-center wrap>
			<v-flex xs7 pr-2>
				<v-layout column>
					<v-flex>
						<label class="label">Caja de Origen:</label>
					</v-flex>
					<v-flex class="primary--text bold">
						{{ cashOrigin }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs5>
				<app-select
					:item="model.bankAccountId"
					item-text="name"
					item-value="id"
					:items="bankAccounts"
					label="Cuenta Destino"
					model="bankAccountId"
					:return-object="false"
					@input="$emit('set-account', $event)"
				/>
			</v-flex>
		</v-layout>
		<v-divider></v-divider>
		<v-layout class="back-gray px-3 py-2">
			<v-flex xs8>EFECTIVO EN CAJA</v-flex>
			<v-flex xs4
				>{{ currentSymbol }} {{ amount.cash || infoCash.amount || 0 | round }}</v-flex
			>
		</v-layout>
		<v-divider></v-divider>
		<v-layout class="back-gray px-3 py-2">
			<v-flex xs8 pt-1>Monto en Efectivo a Transferir</v-flex>
			<v-flex xs4>
				<app-input-text
					model="amount"
					type="number"
					:text="model.amount"
					@input="getAmount"
				></app-input-text>
				<template v-if="!$v.model.amount.minValue">
					<span class="form-group__message"> El monto es requerido </span>
				</template>
			</v-flex>
		</v-layout>
		<v-layout wrap px-3 pt-3>
			<v-flex xs12>
				<bank-deposit-form
					:bank-account-id="bankAccountId"
					:bank-accounts="bankAccounts"
					:date-reference="dateReference"
					:document-number="documentNumber"
					:url-image="urlImage"
					@get-data="getData"
				/>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				success-color="primary"
				:is-loading="$v.$invalid || disabled"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('save')"
			/>
		</section>
	</div>
</template>

<script>
import { minValue, required } from 'vuelidate/lib/validators';
import lib from '@/shared/lib';
import bankDepositForm from '@/components/shared/type-payment-forms/bank-deposit-form';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

const { mergeObjects } = lib;

function created() {
	this.currentSymbol = this.currency === 'USD' ? '$' : 'S/.';
	this.loadResources();
}

function getAmount({ model, value }) {
	this.model[model] = value;
	this.getData({ model, newValue: value });
}

function getData({ model, newValue }) {
	this.$emit('get-data', { model, newValue });
}

function buildParamsForCashBalance() {
	let cashIds = null;
	let typePaymentIds = null;
	const filterPayment = this.typePaymentsIds.find((p) => p.code === 'efectivo');
	const typePayment = filterPayment && filterPayment.id;
	if (this.cashIds.length > 0) {
		const cashFilter = this.cashIds.filter((p) => p.id !== 1);
		cashIds = cashFilter.map((p) => p.id).join(',');
	}
	if (this.typePaymentsIds.length > 0) {
		typePaymentIds = typePayment || undefined;
	}
	const params = { ...this.params };
	if (this.flagOutbox) {
		const ignored = [
			'stateId',
			'warehouseId',
			'cashClosingId',
			'notPaymentMethodId',
			'terminalId',
			'flagTransfer',
			'closedAlready',
			'stateOpening',
			'idsParcial',
		];
		Object.keys(params).forEach((key) => {
			if (ignored.includes(key)) delete params[key];
		});
	}
	return mergeObjects({ cashIds, typePaymentIds }, params);
}

async function loadResources() {
	const cahsTotalParams = this.buildParamsForCashBalance();
	const request = [
		this.$httpSales.get('bank-account'),
		this.$httpSales.get('cash', { params: { flagActive: 1 } }),
		this.getTypePayments('sales'),
		//this.$httpSales.post(`cash/${this.currency}/report`, body),
		this.$httpSales.get(`cash-balance-total/${this.currency}`, {
			params: cahsTotalParams,
		}),
	];
	[
		{ data: this.bankAccounts },
		{ data: this.cashData },
		{ data: this.typePayments },
		{ data: this.infoCash },
	] = await Promise.all(request);
	this.typePayments = this.typePayments.map((tp) => tp.paymentType);
	//const indexCash = this.infoCash.detail.findIndex((i) => i.code === 'efectivo');
	//this.amount.cash =
	//	this.infoCash.balance ||
	//	(indexCash > -1 ? this.infoCash.detail[indexCash].amount : 0);
	this.amount.cash = this.infoCash.totalCash || 0;
}

function validations() {
	return {
		model: {
			amount: {
				minValue: minValue(1),
				required,
			},
		},
	};
}

function data() {
	return {
		bankAccounts: [],
		model: {
			amount: 0,
		},
		cashData: [],
		amount: {
			cash: 0,
		},
		infoCash: {},
	};
}

export default {
	name: 'deposit',
	components: {
		bankDepositForm,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		getAmount,
		getData,
		loadResources,
		buildParamsForCashBalance,
	},
	props: {
		bankAccountId: [Number, String],
		dateReference: [Date, String],
		disabled: {
			default: false,
			type: Boolean,
		},
		documentNumber: [Number, String],
		urlImage: String,
		cashOrigin: String,
		currency: String,
		cashIds: {
			type: Array,
		},
		typePaymentsIds: {
			type: Array,
		},
		typePaymentIdsInit: {
			type: Array,
		},
	},
	validations,
};
</script>

<style lang="scss" scoped>
.back-gray {
	background: map-get($colors, background-gray);
}

.bold {
	font-weight: bold;
}

.label {
	color: #8f8f8f;
	font-size: size(small);
}

.bold {
	font-weight: bold;
}
</style>
