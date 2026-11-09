<template>
	<v-layout wrap pb-3>
		<v-flex xs12>
			<days-bar
				:disabled="disabled"
				:days="days"
				@select-day="$emit('select-day', $event)"
			></days-bar>
			<v-divider class="mt-2"></v-divider>
		</v-flex>
		<v-flex xs12 px-4 mt-2>
			<template v-for="(month, index) in months">
				<month-item
					:key="`${index}${month.id}`"
					:days="days"
					:month="month"
					:year="year"
					@select-date="$emit('select-date', $event)"
				></month-item>
			</template>
		</v-flex>
	</v-layout>
</template>

<script>
	import daysBar from '@/components/field-sale/shared/calendar/days-bar';
	import monthItem from '@/components/field-sale/shared/calendar/month-item';

	export default {
		name: 'custom-calendar',
		components: {
			daysBar,
			monthItem,
		},
		props: {
			days: {
				default: () => [],
				type: Array,
			},
			disabled: {
				default: false,
				type: Boolean,
			},
			months: {
				default: () => [],
				type: Array,
			},
			year: [String, Number],
		},
	};
</script>

<style lang="scss" scoped>

</style>