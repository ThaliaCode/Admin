<template>
	<div>
		<label class="label">{{ label }}</label>
		<v-menu
			ref="menu"
			v-model="menu"
			:nudge-right="40"
			lazy
			transition="scale-transition"
			offset-y
			full-width
			max-width="290px"
			min-width="290px"
			:readonly="readonly"
			:disabled="readonly"
			class="date-picker-input"
		>
			<v-text-field
				slot="activator"
				ref="textField"
				:label="label"
				persistent-hint
				append-icon="event"
				solo
				:placeholder="placeHolder"
				:readonly="readonly"
				:disabled="readonly"
				:value="localDateFormatted"
				class="text-field select-app"
				@input="updateDateFromInput"
				@keyup.enter="onEnter"
			></v-text-field>
			<v-date-picker
				locale="es"
				:value="date"
				no-title
				:max="maxDate"
				:min="minDate"
				:readonly="readonly"
				:disabled="readonly"
				@input="sendDate"
			></v-date-picker>
		</v-menu>
	</div>
</template>

<script>
import { format } from 'date-fns';

function formatDate(d) {
	if (!d) {
		return null;
	}
	const [year, month, day] = d.split('-');
	return `${year}-${month}-${day}`;
}

function formatVisual(d) {
	if (!d) {
		return null;
	}
	const [year, month, day] = d.split('-');
	return `${day}/${month}/${year}`;
}

function parseDate(d) {
	if (!d) {
		return null;
	}

	if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
		return d;
	}

	// Case DD-MM-YYYY or DD/MM/YYYY
	if (typeof d === 'string' && /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(d)) {
		const separator = d.includes('-') ? '-' : '/';
		const [day, month, year] = d.split(separator);
		const isoDate = `${year}-${month}-${day}`;
		const result = format(isoDate, 'YYYY-MM-DD');
		if (result !== 'Invalid Date') {
			return result;
		}
	}

	const result = format(d, 'YYYY-MM-DD');
	return result;
}

function sendDate(date) {
	this.menu = false;
	this.date = date;
	this.localDateFormatted = this.formatVisual(date);
	const newDate = this.formatDate(date);
	const body = { value: newDate, model: this.model };
	this.$emit('input', body);
}

function updateDateFromInput(val) {
	this.localDateFormatted = val;
	if (val && /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(val)) {
		const separator = val.includes('-') ? '-' : '/';
		const [p1, p2, p3] = val.split(separator);
		const iso = `${p3}-${p2}-${p1}`;
		if (format(iso, 'YYYY-MM-DD') !== 'Invalid Date') {
			this.date = format(iso, 'YYYY-MM-DD');
			const newDate = this.formatDate(this.date);
			const body = { value: newDate, model: this.model };
			this.$emit('input', body);
		}
	}
}

function data() {
	return {
		date: '',
		menu: false,
		localDateFormatted: '',
	};
}

export default {
	name: 'app-date-select',
	data,
	methods: {
		formatDate,
		formatVisual,
		parseDate,
		sendDate,
		updateDateFromInput,
		onEnter() {
			this.menu = false;
			this.$emit('enter');
		},
	},
	props: {
		dateFormatted: {
			type: [Date, String, Number],
		},
		label: {
			default: '',
			type: String,
		},
		maxDate: [Date, String],
		minDate: {
			type: [Date, String],
		},
		model: {
			type: String,
		},
		placeHolder: {
			type: String,
		},
		readonly: {
			default: false,
			type: Boolean,
		},
	},
	watch: {
		dateFormatted: {
			immediate: true,
			handler(val) {
				const parsed = this.parseDate(val);
				this.date = parsed;
				this.localDateFormatted = this.formatVisual(parsed);
			},
		},
	},
};
</script>

<style lang="scss" scoped>
.label {
	font-size: size(small);
}

.text-field {
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 3px;
	padding-left: 16px;
	position: relative;
}
</style>
