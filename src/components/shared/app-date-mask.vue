<template>
	<label class="label">
		{{ label }}
		<v-text-field
			class="filter-select shadow-inset"
			hide-details
			placeholder="dd/mm/aaaa"
			v-bind="$attrs"
			v-mask="mask"
			v-on="$listeners"
			:value="picker"
			@input="onInput"
			@change="onChange($event, 'change')"
		></v-text-field>
		<v-flex v-if="showMonth" class="error--text">
			Ingrese correctamente el mes.
		</v-flex>
	</label>
</template>

<script>

function splitDate(date) {
	return date.split('/');
}

function formatDate(date) {
	if (!date) {
		return null;
	}
	const currentDate = new Date();
	const [day, month, year] = splitDate(date);
	this.showMonth = month > 12;
	const hours = currentDate.getHours();
	const minutes = currentDate.getMinutes();
	const seconds = currentDate.getSeconds();
	if (this.time) {
		return `${year}-${month}-${day}:${hours}:${minutes}:${seconds}`;
	}
	return `${year}-${month}-${day}`;
}

function onChange($event, eventName) {
	const value = this.formatDate($event);
	if (value) {
		this.$emit(eventName, value);
	} else {
		this.$emit(eventName, null);
	}
}

function onInput($event) {
	this.$emit('input', $event);
	const dateValues = splitDate($event);
	if (dateValues && dateValues.length === 3) {
		this.$emit('format-date', this.formatDate($event));
	} else if (dateValues && dateValues.length < 3) {
		this.$emit('format-date', null);
	}
}

function data() {
	return {
		showMonth: false,
	};
}

export default {
	name: 'app-date-mask',
	inheritAttrs: false,
	data,
	model: {
		prop: 'picker',
		event: 'input',
	},
	props: {
		format: {
			default: 'YYYY-MM-DD',
			type: String,
		},
		label: {
			default: '',
			type: String,
		},
		mask: {
			default: '##/##/####',
			type: String,
		},
		picker: {
			default: null,
		},
		time: {
			default: true,
			type: Boolean,
		},
	},
	methods: {
		formatDate,
		onChange,
		onInput,
	},
};
</script>

<style lang="scss" scoped>
.label {
	font-size: size(small);
}
</style>
