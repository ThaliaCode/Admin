<template>
	<div>
		<v-layout wrap align-end px-4 pt-3>
			<v-flex xs12 sm3 md2 pr-2>
				<app-date-select
					label="Fecha"
					:date-formatted="valueDate"
					model="valueDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs12 sm3 md2 pl-2 pr-3>
				<app-select
					:item="currency"
					item-text="code"
					item-value="code"
					:items="currencies"
					label="Moneda"
					model="currency"
					:return-object="false"
					@input="$emit('set-data', $event)"
				/>
			</v-flex>
			<v-flex xs12 sm3 pl-2 pr-3>
				<app-select
					:item="comSubsidiaryId"
					item-text="sucursalName"
					item-value="id"
					:items="subsidiaries"
					:label="labelSucursal()"
					model="comSubsidiaryId"
					:return-object="false"
					@input="$emit('set-data', $event)"
				/>
			</v-flex>
			<v-flex xs12 sm3 md3>
				<v-btn
					class="btn-action px-2"
					color="primary"
					@click="$emit('on-filter')"
				>
					Cargar Boletas
				</v-btn>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	import helper from '@/shared/helper';
	import appDateSelect from '@/components/shared/app-date-select';
	import { format } from 'date-fns';

	function created() {
		this.valueDate = helper.exactDate(this.date, 'YYYY-MM-DD');
	}

	function setDate({ model, value }) {
		this[model] = format(value, 'YYYY-MM-DD');
		this.$emit('set-date', value);
	}

	function data() {
		return {
			valueDate: null,
		};
	}

	export default {
		name: 'daily-summary-create-filter',
		created,
		data,
		components: {
			appDateSelect,
		},
		methods: {
			setDate,
		},
		props: {
			comSubsidiaryId: [Number, String],
			currency: String,
			currencies: {
				default: () => [],
				type: Array,
			},
			date: [Date, String, Number],
			subsidiaries: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>
