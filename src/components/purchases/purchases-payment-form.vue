<template>
	<div :class="{ disabled: disabled }" v-if="componentName">
		<component
			:is="componentName"
			:bank-account-id="bankAccountId"
			:bank-accounts="bankAccounts"
			:card-id="cardId"
			:date-reference="dateReference"
			:document-number="documentNumber"
			:reference="reference"
			:url-image="urlImage"
			:is-sale="isSale"
			:show-operation-number="showOperationNumber"
			:show-concept="showConcept"
			@get-data="$emit('get-data', $event)"
		/>
	</div>
</template>

<script>
import bankDepositForm from '@/components/shared/type-payment-forms/bank-deposit-form';
import cardForm from '@/components/shared/type-payment-forms/card-form';
import checkForm from '@/components/shared/type-payment-forms/check-form';
import typePaymentForm from '@/shared/type-payment-form';
// import noteCreditForm from '@/components/shared/type-payment-forms/note-credit-form';

function created() {
	if (
		this.componentName === 'check-form' ||
		this.componentName === 'bank-deposit-form'
	) {
		this.loadResources();
	}
}

function componentName() {
	if (this.flagForm === typePaymentForm.Card) {
		return 'card-form';
	} else if (this.flagForm === typePaymentForm.Check) {
		return 'check-form';
	} else if (
		this.flagForm === typePaymentForm.Deposit ||
		this.flagForm === typePaymentForm.Note
	) {
		this.loadResources();
		return 'bank-deposit-form';
	}
	return false;
}

async function loadResources() {
	const params = {
		subsidiaryId: this.subsidiaryId,
		flagOrderPrimary: true,
	};
	({ data: this.bankAccounts } = await this.getBankAccount(null, params));
	this.bankAccounts = this.bankAccounts.map((b) => {
		const newBank = { ...b };
		newBank.name = `${b.name} (${b.currencySymbol})`;
		return newBank;
	});
	// this.bankAccountId = this.bankAccounts[0].id;
}

function data() {
	return {
		bankAccounts: [],
	};
}

export default {
	name: 'purchases-payment-form',
	components: {
		bankDepositForm,
		cardForm,
		checkForm,
	},
	computed: {
		componentName,
	},
	created,
	data,
	methods: {
		loadResources,
	},
	props: {
		bankAccountId: [Number, String],
		cardId: [Number, String],
		disabled: {
			default: false,
			type: Boolean,
		},
		subsidiaryId: [Number],
		documentNumber: [Number, String],
		dateReference: [Date, String, Number],
		flagForm: {
			default: null,
			type: [Number, String],
		},
		urlImage: String,
		reference: String,
		isSale: {
			default: false,
			type: Boolean,
		},
		showOperationNumber: {
			default: true,
			type: Boolean,
		},
		showConcept: {
			default: true,
			type: Boolean,
		},
	},
};
</script>

<style lang="scss" scoped>
.disabled {
	opacity: 0.9;
	pointer-events: none;
}
</style>
