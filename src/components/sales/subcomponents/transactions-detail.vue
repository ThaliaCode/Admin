<template>
	<div v-if="transactions && transactions.length > 0">
		<v-flex xs12 mb-2>
			<v-alert :value="customerGeneric" type="warning">
				No se puede visualizar el estado de cuenta, la venta fue realizada por un cliente
				generico.
			</v-alert>
		</v-flex>
		<v-layout
			wrap
			v-for="(transaction, transactionIndex) in transactions"
			:key="transactionIndex"
		>
			<v-layout row wrap>
				<v-flex xs12 md10 sm6>
					<v-layout row wrap align-center>
						<v-flex d-flex pl-2 align-center class="column-label"> Tipo de Pago </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ transaction.typePayment.name }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 md10 sm6 mt-2>
					<v-layout row wrap align-center>
						<v-flex d-flex pl-2 align-center class="column-label"> Monto </v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ transaction.amount }}
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-flex xs2 text-xs-center v-if="isNotTypeCash(transaction.typePayment)">
				<p class="caption mb-0 mt-1">Ver detalle</p>
				<v-btn icon flat class="ma-0" @click="openForm(transaction)">
					<v-icon color="info">
						<template v-if="selectedPaymentId === transaction.id">
							remove_circle_outline
						</template>
						<template v-else> add_circle_outline </template>
					</v-icon>
				</v-btn>
			</v-flex>
			<v-flex xs12>
				<bank-deposit-form
					show-hidden
					v-show="isActiveForm(transaction, 'Deposit')"
					:code="transaction.typePayment.code"
					:bank-accounts="bankAccounts"
					:concept-deposit="transaction.concept"
					:reference-deposit="transaction.reference"
					:bank-account-id="transaction.bankAccountId"
					:document-number="transaction.documentNumber"
					:date-reference="transaction.paymentDate"
					:url-image="transaction.urlImage"
					readonly
				/>
				<check-form
					v-show="isActiveForm(transaction, 'Check')"
					:code="transaction.code"
					:bank-accounts="bankAccounts"
					:bank-account-id="transaction.bankAccountId"
					:document-number="transaction.documentNumber"
					:date-reference="transaction.additionalInformation.dateReference"
					:reference="transaction.reference"
					readonly
				/>
				<card-form
					v-show="isActiveForm(transaction, 'Card')"
					:code="transaction.code"
					:bank-account-id="transaction.bankAccountId"
					:bank-accounts="bankAccounts"
					:document-number="transaction.documentNumber"
					readonly
				/>
			</v-flex>
			<v-flex xs12 pt-3 pb-2>
				<v-divider></v-divider>
			</v-flex>
		</v-layout>
		<slot></slot>
	</div>
	<div v-else class="pa-4 text-xs-center">
		No se han realizado transacciones en este venta
		<slot></slot>
	</div>
</template>

<script>
import bankDepositForm from '@/components/shared/type-payment-forms/bank-deposit-form';
import cardForm from '@/components/shared/type-payment-forms/card-form';
import checkForm from '@/components/shared/type-payment-forms/check-form';
import typePaymentForm from '@/shared/type-payment-form';

function created() {
	this.loadResources();
}

function isActiveForm({ id, typePayment }, type) {
	const { flagForm } = typePayment;
	const newFlagForm = type === 'Deposit' && !flagForm ? typePaymentForm[type] : flagForm;
	return this.selectedPaymentId === id && typePaymentForm[type] === newFlagForm;
}

function isNotTypeCash({ flagForm }) {
	return typePaymentForm.Cash !== Number(flagForm);
}

async function loadResources() {
	({ data: this.bankAccounts } = await this.$httpSales.get('bank-account'));
}

function openForm({ id, typePayment }) {
	const { code } = typePayment;
	this.selectedPaymentId = this.selectedPaymentId === id ? null : id;
	let typeCard = '';
	if (code === 'deposito-bancario' || code === 'DP') {
		typeCard = 'Deposit';
	} else {
		typeCard = code === 'cheque' ? 'Check' : 'Card';
	}
	this.isActiveForm({ id, typePayment }, typeCard);
}

function data() {
	return {
		bankAccounts: [],
		selectedPaymentId: null,
	};
}

export default {
	name: 'transactions-detail',
	components: {
		bankDepositForm,
		cardForm,
		checkForm,
	},
	created,
	data,
	methods: {
		isActiveForm,
		isNotTypeCash,
		loadResources,
		openForm,
	},
	props: {
		transactions: {
			default: () => [],
			type: Array,
		},
		customerGeneric: {
			default: false,
			type: Boolean,
		},
	},
};
</script>
