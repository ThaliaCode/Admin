<template>
	<v-layout wrap justify-center class="days-container">
		<button
			v-for="day in days"
			:key="day.id"
			class="day-btn"
			:disabled="disabled"
			:class="{ 'active': day.active }"
			type="button"
			@click="$emit('select-day', day)"
		>
			<span>{{ day.shortName }}</span>
		</button>
	</v-layout>
</template>

<script>
	export default {
		name: 'days-bar',
		props: {
			days: {
				default: () => [],
				type: Array,
			},
			disabled: {
				default: true,
				type: Boolean,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.day-btn {
		background-color: transparent;
		border: 1px solid color(border-btn-day);
		border-radius: 15px;
		color: color(primary);
		font-family: font(open-semibold);
		font-size: size(small10);
		height: 22px;
		margin-right: 5px;
		width: 36px;

		&:last-child {
			margin-right: 0px;
		}

		&:hover,
		&.active {
			background-color: color(border-btn-day);
		}
	}
</style>