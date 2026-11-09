<template>
	<v-layout wrap align-center justify-end>
		<v-flex xs9 pb-2 pt-2>
			<filters
				:departments="departments"
				:distrits="distrits"
				:loading="loading"
				:model="model"
				:provinces="provinces"
				@set-data="$emit('set-data', $event)"
				@search-action="$emit('search-action')"
			></filters>
		</v-flex>
		<v-flex xs2 mt-4>
			<filters-buttons
				column-class="xs12"
				outline-btn-class="px-4"
				:outline-btn-disabled="loading"
				@outline-btn-action="$emit('outline-btn-action')"
			></filters-buttons>
		</v-flex>
	</v-layout>
</template>

<script>
import filters from '@/components/field-sale/zone-assignment/filters';
import filtersButtons from '@/components/field-sale/shared/filters-buttons';

export default {
	name: 'heading-filter',
	components: {
		filters,
		filtersButtons,
	},
	props: {
		departments: {
			default: () => [],
			type: Array,
		},
		distrits: {
			default: () => [],
			type: Array,
		},
		loading: {
			default: false,
			type: Boolean,
		},
		model: {
			default: () => {},
			type: Object,
		},
		provinces: {
			default: () => [],
			type: Array,
		},
	},
};
</script>
