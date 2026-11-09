<template>
	<v-layout wrap pa-2>
		<v-flex xs6 
			px-1
			mb-2
			v-for="(field, value, index) in formFields" 
			:key="index">
			<app-input-text
				v-if="field.type === 'text'"
				:label="field.label"
				:model="value"
				:text="field.value"
				@input="$emit('set-data', $event)"
			></app-input-text>
			<v-flex v-else-if="field.type === 'calender'">
				<label class="caption caption-date">{{ field.label }}</label>
				<date-component
					:date="field.value"
					icon="/static/img/calendar.svg"
					@on-input="$emit('set-data', { model: value, value: $event })"
				></date-component>
			</v-flex>
			<app-select
				v-else
				autocomplete
				:item="field.value"
				:items="field.items"
				item-text="name"
				item-value="id"
				:label="field.label"
				:model="value"
				@input="$emit('set-data', $event)"
			></app-select>
		</v-flex>
	</v-layout>
</template>
<script>
import dateComponent from '@/components/shared/date-component';

function showDialog() {
	this.$refs.label.click();
}

export default {
	name: 'dynamic-form',
	methods: {
		showDialog,
	},
	components: {
		dateComponent,
	},
	props: {
		formFields: {
			type: Object,
			default: () => {},
		},
	},
};
</script>