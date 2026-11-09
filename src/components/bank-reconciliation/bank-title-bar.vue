<template>
	<div class="primary lighten-2">
		<v-layout wrap align-center pl-4 py-2>
			<slot></slot>
			<v-flex xs12 md4 pl-2 text-xs-right>
				<span class="text-uppercase title-bar  white--text">Total Conciliado:</span>
				<span class="title  white--text">{{ currencySymbol }} {{ conciliationAmount | round }}</span>
			</v-flex>
			<v-flex xs12 md4 pr-4 text-xs-right>
				<span class="text-uppercase title-bar  white--text">Diferencia:</span>
				<span class="title  white--text">{{ currencySymbol }} {{ differenceAmount | round }}</span>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	export default {
		name: 'bank-title-bar',
		props: {
			conciliationAmount: [Number, String],
			currencySymbol: {
				default: 'S/.',
				type: String,
			},
			differenceAmount: [Number, String],
		},
	};
</script>
<style lang="scss" scoped>
	.title-bar {
		font-family: font(open-semibold);
		font-size: size(small13);
	}
</style>