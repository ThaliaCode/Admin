<template>
	<v-flex xs12>
		<v-layout row wrap align-end>
			<v-flex xs2 pr-3>
				<label class="caption">Fecha inicial</label>
				<date-component
					:date="startDate"
					icon="/static/img/calendar.svg"
					@on-input="$emit('set-data', { model: 'startDate', value: $event })"
				></date-component>
			</v-flex>
			<v-flex xs2 pr-3>
				<label class="caption">Fecha final</label>
				<date-component
					:date="endDate"
					:disabled="!startDate"
					icon="/static/img/calendar.svg"
					@on-input="$emit('set-data', { model: 'endDate', value: $event })"
				></date-component>
			</v-flex>
			<v-flex xs3 pr-3>
				<autocomplete-component
					append-icon="expand_more"
					http-code="$httpSales"
					:item="supplierId"
					item-text="autocomplete"
					item-value="id"
					:items="suppliers"
					label-value="Proveedor"
					model="supplierId"
					new-register-text="Nuevo proveedor"
					:on-clean="cleanData"
					placeholder="Proveedor"
					prop="autocomplete"
					resource-url="suppliers"
					return-object
					select-create
					@new-register="$emit('new-register', $event)"
					@return-data="$emit('set-data', $event)"
				></autocomplete-component>
			</v-flex>
			<v-flex xs3 pr-3>
				<autocomplete-component
					append-icon="expand_more"
					http-code="$httpProducts"
					:item="warehouseId"
					item-text="name"
					item-value="id"
					:items="warehouses"
					label-value="Tienda"
					model="warehouseId"
					new-register-text="Nueva tienda"
					:on-clean="cleanData"
					placeholder="Tienda"
					prop="name"
					resource-url="warehouses"
					return-object
					select-create
					@new-register="$emit('new-register', $event)"
					@return-data="$emit('set-data', $event)"
				></autocomplete-component>
			</v-flex>
			<v-flex xs2>
				<v-btn
					class="btn-action btn-auto px-4 py-2"
					color="error"
					@click="$emit('clean-filters')"
				>
					Limpiar
				</v-btn>
			</v-flex>
		</v-layout>
	</v-flex>
</template>

<script>
	import dateComponent from '@/components/shared/date-component';

	export default {
		name: 'filters-in-ex',
		components: {
			dateComponent,
		},
		props: {
			cleanData: {
				default: false,
				type: Boolean,
			},
			endDate: [Date, Number, String],
			startDate: [Date, Number, String],
			supplierId: [Number, String],
			suppliers: {
				default: () => [],
				type: Array,
			},
			warehouseId: [Number, String],
			warehouses: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>

<style lang="scss" scoped>

</style>