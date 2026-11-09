<template>
	<div>
		<v-layout
			wrap
			align-center
			white
			class="border-top"
		>
			<v-flex xs12 sm6 md3 py-2
				text-xs-center
				class="border-right">
				<p class="caption-label mb-1">Diferencia</p>
				<p class="total mb-0">{{ currency }} {{ totalDifference | round }}</p>
			</v-flex>
			<v-flex xs12 sm6 md4 py-2 px-1
				text-xs-center
				class="border-right">
				<p class="caption-label mb-1">Total General</p>
				<p class="total mb-0">{{ currency }} {{ totalGeneral | round }}</p>
			</v-flex>
			<v-flex xs12 sm8 md3 py-2
				text-xs-center
				class="border-right">
				<p class="caption-label mb-1">Total Selec.</p>
				<p class="total mb-0">{{ currency }} {{ totalSelected | round }}</p>
			</v-flex>
			<v-flex xs12 sm4 md2 py-2 text-xs-center>
				<v-layout wrap align-center>
					<v-flex xs7 text-xs-center>
						<p class="caption-label mb-1">#</p>
						<p class="total mb-0">{{ totalChecked }}</p>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	function changeShowTotal() {
		this.showTotal = !this.showTotal;
	}

	function icon() {
		return this.showTotal ? 'remove' : 'add';
	}

	function data() {
		return {
			showTotal: false,
		};
	}

	export default {
		name: 'bank-reconciliation-total',
		computed: {
			icon,
		},
		data,
		methods: {
			changeShowTotal,
		},
		props: {
			currency: String,
			totalChecked: [Number, String],
			totalDifference: [Number, String],
			totalGeneral: [Number, String],
			totalSelected: [Number, String],
		},
	};
</script>

<style lang="scss" scoped>
	.border-right {
		border-right: 2px solid map-get($colors, blue-grey);
	}

	.btn-total {
		background-color: map-get($colors, blue-grey) !important;
		height: 12px;
		padding-left: 1px;
		width: 12px;
	}

	.caption-label {
		font-family: map-get($fonts, open-regular);
		font-size: map-get($sizes, small10);
	}

	.total {
		font-family: map-get($fonts, open-bold);
		font-size: size(small13);
	}

	.total-by-payment {
		background-color: map-get($colors, btn-toggle-text);

		.total {
			font-size: map-get($sizes, medium);
		}
	}

	.total-border {
		border: 1px solid map-get($colors, blue-grey);
	}
</style>
