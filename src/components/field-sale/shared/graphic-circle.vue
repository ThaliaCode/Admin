<template>
	<v-progress-circular
		class="graphic-circle"
		color="primary"
		:size="200"
		:value="sellersAssigned"
		:width="8"
	>
		<v-layout row wrap justify-center class="graphic-circle-info">
			<v-flex xs12 text-xs-center>
				Total de vendedores activos
			</v-flex>
			<v-flex xs12 text-xs-center>
				<span>{{ sellersAssigned }}</span>
			</v-flex>
		</v-layout>
	</v-progress-circular>
</template>

<script>
	export default {
		name: 'graphic-circle',
		props: {
			sellersAssigned: Number,
		},
	};
</script>

<style lang="scss" scoped>
	.graphic-circle-info {
		color: color(opacity-list-price);
		font-family: font(open-semibold);
		font-size: size(small);
		text-transform: uppercase;

		span {
			color: color(black-light);
			font-family: font(open-regular);
			font-size: size(large);
		}
	}
</style>