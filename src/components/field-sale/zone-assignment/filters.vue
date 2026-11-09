<template>
	<v-layout wrap align-center>
		<v-flex xs3 pr-2>
			<app-select
				autocomplete
				browser-autocomplete="off"
				class="border-select"
				:disabled="loading"
				:item="model.departmentId"
				item-text="name"
				item-value="id"
				:items="departments"
				:label="geographical.countryLevel"
				model="department"
				:place-holder="geographical.countryLevel"
				return-object
				@input="$emit('set-data', $event)"
			></app-select>
		</v-flex>
		<v-flex xs3 pr-2>
			<app-select
				autocomplete
				browser-autocomplete="off"
				class="border-select"
				:disabled="loading || !model.department"
				:item="model.provinceId"
				item-text="name"
				item-value="id"
				:items="provinces"
				:label="geographical.regionLevel"
				model="province"
				:place-holder="geographical.regionLevel"
				return-object
				@input="$emit('set-data', $event)"
			></app-select>
		</v-flex>
		<v-flex xs3 pr-2>
			<app-select
				autocomplete
				browser-autocomplete="off"
				class="border-select"
				:disabled="loading || !model.province"
				:item="model.distritId"
				item-text="name"
				item-value="id"
				:items="distrits"
				:label="geographical.localityLevel"
				model="distrit"
				:place-holder="geographical.localityLevel"
				return-object
				@input="$emit('set-data', $event)"
			></app-select>
		</v-flex>
		<v-flex xs3 pr-2 pt-4>
			<v-btn
				class="btn-action btn-full xs12"
				color="primary"
				@click="$emit('search-action')"
			>
				Buscar
			</v-btn>
		</v-flex>
	</v-layout>
</template>

<script>
import jsonCountries from '@/i18n/constants/format-country.json';

export default {
	name: 'filters',
	data() {
		return {
			jsonCountries,
			geographical: {},
		};
	},
	created() {
		const geo = this.jsonCountries[this.$userInfo.company.country.countryCode];
		this.geographical = geo.geographicalDivisions;
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
