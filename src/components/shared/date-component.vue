<template>
	<date-picker
		:class="{ 'date-component-round': round }"
		:disabled="disabled"
		:value="date"
		placeholder="dd/mm/aaaa"
		format="DD/MM/YYYY"
		value-type="YYYY-MM-DD"
		@input-error="$emit('on-input-error', $event)"
		@input="$emit('on-input', $event)"
		@clear="$emit('clear', $event)"
	>
		<template v-if="showIcon">
			<v-icon slot="icon-calendar" size="20" class="success--text">calendar_month</v-icon>
		</template>
	</date-picker>
</template>

<script>
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';
import 'vue2-datepicker/locale/es';

export default {
	name: 'date-component',
	components: {
		DatePicker,
	},
	props: {
		date: [Date, String],
		disabled: {
			default: false,
			type: Boolean,
		},
		icon: {
			type: String,
			default: '/static/img/calendar.svg',
		},
		round: {
			default: false,
			type: Boolean,
		},
		showIcon: {
			default: true,
			type: Boolean,
		},
	},
};
</script>

<style lang="scss" scoped>
.icon-calendar-custom {
	height: 15px;
	color: red;
}
</style>
