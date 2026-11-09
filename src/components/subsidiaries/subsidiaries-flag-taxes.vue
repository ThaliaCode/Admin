<template>
	<div class="flag-taxes-cell">
		<app-tooltip-button
			icon="money"
			:color="taxInfo.color"
			:text="taxInfo.text"
		>
		</app-tooltip-button>
		<v-chip
			v-if="flagTaxes === 1"
			small
			label
			:color="billingChip.color"
			text-color="white"
			class="ma-0"
		>
			{{ billingChip.text }}
		</v-chip>
	</div>
</template>

<script>

function taxInfo() {
	const result = {
		color: 'black',
		text: 'No configurado',
	};
	if (this.isPeru && this.flagTaxes === 1) {
		result.color = 'green';
		result.text = 'Credenciales Sunat Configuradas';
	} else if (this.isEcuador && this.flagTaxes === 1) {
		result.color = 'blue';
		result.text = 'Credenciales SRI Configuradas';
	}
	return result;
}

function billingChip() {
	const isNewBilling = this.typeBillingAgreed === 'sunatFactV4';
	return {
		color: isNewBilling ? 'green' : 'orange',
		text: isNewBilling ? 'V2' : 'V1',
	};
}

export default {
	name: 'subsidiaries-flag-taxes',
	computed: {
		taxInfo,
		billingChip,
	},
	props: {
		flagTaxes: {
			type: Number,
			default: 0,
		},
		typeBillingAgreed: {
			type: String,
			default: null,
		},
	},
};
</script>

<style scoped>
.flag-taxes-cell {
	display: flex;
	align-items: center;
	gap: 6px;
}
</style>
