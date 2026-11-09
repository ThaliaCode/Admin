<template>
	<v-layout
		wrap white mb-2 pa-2
		class="month-item"
	>
		<v-flex xs12>
			<v-layout wrap pb-2>
				<v-flex xs12 text-xs-center>
					{{ month.shortName }} {{ month.year }}
				</v-flex>
			</v-layout>
			<v-layout wrap>
				<v-flex
					v-for="(day, indexDay) in days"
					:key="`${indexDay}-${day.id}`"
					text-xs-center
					class="day-short-name"
				>
					{{ day.shortName }}
				</v-flex>
				<v-flex xs12>
					<v-divider></v-divider>
				</v-flex>
			</v-layout>
			<v-layout wrap>
				<v-flex
					v-for="(date, indexDate) in month.dates"
					:key="`${date.id}${indexDate}`"
					text-xs-center pt-1
					class="btn-date"
					:class="{
						'selected' : date.selected,
						'selected-date' : date.selectedDate,
						'first': date.first,
						'last': date.last,
					}"
				>
					<button
						:disabled="date.disabled"
						type="button"
						@click="$emit('select-date', date)"
					>
						{{ date.value }}
					</button>
				</v-flex>
			</v-layout>
		</v-flex>
	</v-layout>
</template>

<script>
	export default {
		name: 'month-item',
		props: {
			days: {
				default: () => [],
				type: Array,
			},
			month: {
				default: () => {},
				type: Object,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.month-item {
		box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .3);
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(medium);
		height: 200px;
	}

	.day-short-name {
		color: color(generalText);
		font-family: font(open-regular);
		font-size: size(small13);
		width: calc(100% / 7);
	}

	.btn-date {
		color: color(tableText);
		font-size: size(small13);
		max-width: calc(100% / 7);
		width: calc(100% / 7);

		&.selected button {
			background-color: color(border-btn-day);
			color: color(white);
			height: 100%;
			width: 100%;
			
			&.first {
				border-bottom-left-radius: 9px;
				border-top-left-radius: 9px;
			}

			&.last {
				border-bottom-right-radius: 9px;
				border-top-right-radius: 9px;
			}
		}

		&.selected-date button {
			background-color: color(primary);
			border-radius: 100%;
			color: color(white);
			width: 23px;
		}
	}
</style>