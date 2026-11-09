<template>
	<v-flex xs12>
		<v-layout
			row
			wrap
			justify-end
			align-end
			:class="{ 'pt-2': period === 'range' }"
		>
			<app-select
				class="border-round-select select-outline border-outline mr-2"
				content-class="content-outline"
				:items="typeDocuments"
				label="T. Documento"
				multiple
				item-text="code"
				item-value="code"
				:item="filters.documentTypesCodes || []"
				place-holder="T. Documento"
				model="documentTypesCodes"
				:return-object="false"
				@input="$emit('set-filter', $event)"
			/>
			<app-select
				append-icon="arrow_drop_down"
				class="border-round-select select-outline border-outline mr-2"
				content-class="content-outline"
				:item="filters.subsidiaryCode"
				item-text="sucursalName"
				item-value="sucursalCode"
				:items="subsidiaries"
				place-holder="Empresa"
				model="subsidiaryCode"
				@input="$emit('set-filter', $event)"
			></app-select>
			<app-select
				append-icon="arrow_drop_down"
				class="border-round-select select-outline border-outline mr-2"
				content-class="content-outline"
				:item="typeTransaction"
				item-text="name"
				item-value="code"
				:items="typesTransactions"
				model="typeTransaction"
				@input="$emit('set-filter', $event)"
			></app-select>
			<app-select
				append-icon="arrow_drop_down"
				class="border-round-select select-outline border-outline mr-2"
				content-class="content-outline"
				:item="period"
				item-text="name"
				item-value="code"
				:items="periodTypes"
				model="period"
				@input="$emit('set-period', $event)"
			></app-select>
			<template v-if="isPeru">
				<app-select
					append-icon="arrow_drop_down"
					class="border-round-select select-outline border-outline mr-2"
					content-class="content-outline"
					:item="filters.currency"
					item-text="name"
					item-value="code"
					:items="currencies"
					model="currency"
					@input="$emit('set-filter', $event)"
				></app-select>
			</template>
			<v-flex xs4 v-if="showRange">
				<v-layout row wrap justify-space-between>
					<v-flex xs6 pr-2>
						<label class="caption primary--text label-date">Fecha Inicio</label>
						<date-component
							round
							:date="filters.startDate"
							icon="/static/img/calendar.svg"
							:show-icon="false"
							@on-input="
								$emit('set-filter', { model: 'startDate', value: $event })
							"
						></date-component>
					</v-flex>
					<v-flex xs6 pl-2>
						<label class="caption primary--text label-date">Fecha Final</label>
						<date-component
							round
							:date="filters.endDate"
							icon="/static/img/calendar.svg"
							:show-icon="false"
							@on-input="
								$emit('set-filter', { model: 'endDate', value: $event })
							"
						></date-component>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</v-flex>
</template>

<script>
import dateComponent from '@/components/shared/date-component';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';

export default {
	name: 'header-filter',
	components: {
		dateComponent,
		autocompleteComponent,
	},
	props: {
		currencies: {
			default: () => [],
			type: Array,
		},
		filters: {
			default: () => {},
			type: Object,
		},
		period: String,
		periodTypes: {
			default: () => [],
			type: Array,
		},
		showRange: {
			default: false,
			type: Boolean,
		},
		subsidiaries: {
			default: () => [],
			type: Array,
		},
		typeTransaction: String,
		typesTransactions: {
			default: () => [],
			type: Array,
		},
		typeDocuments: {
			default: () => [],
			type: Array,
		},
	},
};
</script>

<style lang="scss" scoped>
.label-date {
	font-family: font(open-semibold);
	font-size: size(small9) !important;
}
</style>
