<template>
	<div class="header-summary">
		<span class="header-label title">
			{{ name }}
		</span>
		<span class="header-label subtitle" v-if="hasDocument">
			{{ documentName }} - {{ documentNumber }}
		</span>
		<span class="header-label subtitle" v-if="subsidiary">
			<b>P.V :</b> {{ subsidiary }}
		</span>
		<span class="header-label separator" v-if="showTotal"> | </span>
		<span class="header-label amount" v-if="showTotal">
			TOTAL: {{ currencySymbol }} {{ amount | round }}
		</span>
	</div>
</template>

<script>
function hasDocument() {
	return this.documentName && this.documentNumber;
}

export default {
	name: 'header-summary',
	computed: {
		hasDocument,
	},
	props: {
		amount: [Number, String],
		currencySymbol: String,
		documentName: String,
		documentNumber: [Number, String],
		name: String,
		showTotal: {
			default: false,
			type: Boolean,
		},
		subsidiary: String,
	},
};
</script>

<style lang="scss" scoped>
.header-label {
	font-size: 14px;
	text-transform: uppercase;

	&.amount {
		color: map-get($colors, header);
		font-family: map-get($fonts, open-semibold);
		font-size: 24px;
	}

	&.separator {
		color: map-get($colors, blue-grey);
		font-size: 30px;
		font-weight: 300;
	}

	&.title {
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-bold);
		font-size: 12px !important;

		@media (min-width: 1024px) {
			font-size: 15px !important;
		}
	}

	&.subtitle {
		color: map-get($colors, background-card-black);
		font-family: map-get($fonts, open-regular);
	}
}

.header-summary {
	align-items: center;
	display: flex;

	span {
		margin: 0 10px;
	}
}
</style>
