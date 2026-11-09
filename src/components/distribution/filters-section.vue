<template>
	<v-layout wrap py-3 px-4>
		<v-flex xs10>
			<v-layout row wrap>
				<v-flex xs2 px-1>
					<label class="caption">Fecha Inicio</label>
					<date-component
						:date="filterFields.startDate"
						icon="/static/img/calendar.svg"
						@on-input="$emit('set-filter-data', { model: 'startDate', value: $event })"
					></date-component>
				</v-flex>
				<v-flex xs2 px-1>
					<label class="caption">Fecha Final</label>
					<date-component
						:date="filterFields.endDate"
						icon="/static/img/calendar.svg"
						@on-input="$emit('set-filter-data', { model: 'endDate', value: $event })"
					></date-component>
				</v-flex>
				<v-flex xs3 px-1>
					<app-select
						:items="states"
						item-text="name"
						item-value="id"
						:item="filterFields.status"
						label="Estado"
						model="status"
						:return-object="false"
						@input="$emit('set-filter-data', $event)"
					></app-select>
				</v-flex>
				<v-flex xs3 px-1>
					<app-select
						:items="typeOfDistribution"
						item-text="name"
						item-value="id"
						:item="filterFields.typeDeliveryRouteId"
						label="Tipo de Distribución"
						model="typeDistributor"
						:return-object="false"
						@input="$emit('set-filter-data', $event)"
					></app-select>
				</v-flex>
				<v-flex xs2>
					<app-select
						:items="drivers"
						item-text="name"
						item-value="id"
						:item="filterFields.deliveryId"
						label="Repartidor"
						model="deliveryId"
						:return-object="false"
						@input="$emit('set-filter-data', $event)"
					></app-select>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs4 v-if="isTwoDrivers">
			<v-layout row wrap>
				<v-flex xs6 px-1>
					<app-select
						:items="typeRoute"
						item-text="name"
						item-value="id"
						:item="filterFields.deliveryId"
						label="Tipo de Ruta"
						model="flagPickUpShip"
						:return-object="false"
						@input="$emit('set-filter-data', $event)"
					></app-select>
				</v-flex>
			</v-layout>
			<!-- <v-layout row wrap v-else>
				<v-flex xs6 px-1>
					<app-select
						append-icon="search"
						autocomplete
						:items="couriers"
						item-text="name"
						item-value="id"
						:item="filterFields.responsibleUserId"
						label="Transportista"
						model="responsibleUserId"
						:return-object="false"
						@input="$emit('set-filter-data', $event)"
					></app-select>
				</v-flex>
				<v-flex xs6 px-1>
					<app-select
						append-icon="search"
						autocomplete
						:items="vehicles"
						item-text="plate"
						item-value="id"
						:item="filterFields.vehicleId"
						label="Vehículo"
						model="vehicleId"
						:return-object="false"
						@input="$emit('set-filter-data', $event)"
					></app-select>
				</v-flex>
			</v-layout> -->
		</v-flex>
		<v-flex xs1>
			<v-layout row wrap align-end class="h-100">
				<v-flex xs12 px-1 pt-4>
					<v-btn
						class="btn-action btn-auto px-4 py-2"
						color="primary"
						@click="$emit('filter-list')"
					>
						Filtrar
					</v-btn>
				</v-flex>
			</v-layout>
		</v-flex>
	</v-layout>
</template>

<script>
	import dateComponent from '@/components/shared/date-component';

	export default {
		name: 'filters-section',
		components: {
			dateComponent,
		},
		props: {
			vehicles: {
				default: () => [],
				type: Array,
			},
			filterFields: {
				default: () => {},
				type: Object,
			},
			couriers: {
				default: () => [],
				type: Array,
			},
			states: {
				default: () => [],
				type: Array,
			},
			typeOfDistribution: {
				default: () => [],
				type: Array,
			},
			drivers: {
				default: () => [],
				type: Array,
			},
			typeRoute: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>
<style lang="scss" scoped>
	.h-100 {
		height: 100%;
	}
</style>
