<template>
	<div v-if="componentName">
		<component
			:is="componentName"
			:amount="amount"
			:bank-account-id="bankAccountId"
			:date-reference="dateReference"
			:disabled="disabled"
			:document-number="documentNumber"
			:reference="reference"
			:updated="updated"
			:url-image="urlImage"
			:cash-origin="cashOrigin"
			:currency="currency"
			:cash-ids="cashIds"
			:type-payments-ids="typePayments"
			:type-payment-ids-init="typePaymentIdsInit"
			@close="$emit('close')"
			@save="$emit('save')"
			@get-data="$emit('get-data', $event)"
			@set-account="$emit('set-account', $event)"
		/>
	</div>
</template>

<script>
import deposit from './deposit';
import transferCardBank from './transfer-card-bank';
import transferCashBank from './transfer-cash-bank';
import transferCheckBank from './transfer-check-bank';
import typePaymentForm from '../../shared/type-payment-form';

function componentName() {
	if (this.flagForm === typePaymentForm.Card) {
		return 'transfer-card-bank';
	} else if (this.flagForm === typePaymentForm.Check) {
		return 'transfer-check-bank';
	} else if (this.flagForm === typePaymentForm.Deposit) {
		return 'deposit';
	} else if (this.flagForm === typePaymentForm.Cash) {
		return 'transfer-cash-bank';
	}
	return false;
}

export default {
	name: 'transfers-to-bank',
	components: {
		deposit,
		transferCardBank,
		transferCashBank,
		transferCheckBank,
	},
	computed: {
		componentName,
	},
	props: {
		amount: [Number, String],
		bankAccountId: [Number, String],
		dateReference: [Date, String],
		disabled: {
			default: false,
			type: Boolean,
		},
		documentNumber: [Number, String],
		flagForm: [Number, String],
		reference: String,
		updated: {
			default: false,
			type: Boolean,
		},
		urlImage: String,
		cashOrigin: String,
		currency: String,
		cashIds: {
			type: Array,
		},
		typePayments: {
			type: Array,
		},
		typePaymentIdsInit: {
			type: Array,
		},
	},
};
</script>
