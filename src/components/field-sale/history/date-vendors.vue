<template>
	<v-layout wrap class="date-vendors">
		<v-flex xs12>
			<p class="title-date">Frecuencia de visita</p>
		</v-flex>
		<v-flex xs12>
			<template v-for="(month, index) in months">
				<month-item
					:key="`${index}${month.id}`"
					:days="days"
					:month="month"
				></month-item>
			</template>
		</v-flex>
	</v-layout>	
</template>
<script>
import monthItem from '@/components/field-sale/shared/calendar/month-item';

function data() {
	return {
		date: null,
	};
}
export default {
	name: 'date-vendors',
	data,
	components: {
		monthItem,
	},
	props: {
		days: {
			default: () => [],
			type: Array,
		},
		months: {
			default: () => [],
			type: Array,
		},
	},
};
</script>
<style lang="scss">
	.date-vendors {
		background-color: color(white);
		max-width: 300px;
		padding: 9px 14px;

		.title-date {
			border-bottom: 1px solid color(background-even-modal);
			color: color(opacity-list-price);
			font-family: font(open-semibold);
			font-size: size(medium);
			margin-top: 14px;
			text-transform: uppercase;
		}

		.wrapper-days {
			display: flex;
			justify-content: space-between;
		}

		.wrapper-day {
			border: 1px solid map-get($colors, success);
			border-radius: 15px;
			color: map-get($colors, primary);
			font-size: 11px;
			height: 18px;
			margin: 0 4px;
			text-align: center;
			width: 43px;

			&.select {
				background: map-get($colors, success);
			}
		}

		.btn.btn--outline {
			border: none;
			background: map-get($colors, primary) !important;
			color: map-get($colors, white) !important;
		}

		.card {
			box-shadow: none;
		}
	}
</style>