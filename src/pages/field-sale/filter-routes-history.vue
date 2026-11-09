<template>
	<v-layout row wrap pa-4>
		<v-flex xs12 pb-2 v-if="mapFiltersSection">
			<v-layout row wrap>
				<!-- FECHA DE INICIO -->
				<v-flex xs6 pr-1 v-if="$route.name !== 'pending-routes-map'">
					<label class="caption">Fecha Inicio</label>
					<date-component
						:date="filterData.startDate"
						icon="/static/img/calendar.svg"
						@on-input="$emit('set-filter-data', { model: 'startDate', value: $event })"
					></date-component>
				</v-flex>

				<!-- FECHA DE FIN -->
				<v-flex xs6 pl-1 v-if="$route.name !== 'pending-routes-map'">
					<label class="caption">Fecha Fin</label>
					<date-component
						:disabled="!filterData.startDate"
						:date="filterData.endDate"
						icon="/static/img/calendar.svg"
						@on-input="$emit('set-filter-data', { model: 'endDate', value: $event })"
					></date-component>
				</v-flex>

				<!-- TIPO DE ENTREGA -->
				<!-- <v-flex xs12 pt-2 v-if="!isTwoDrivers">
					<app-select
						:items="pickUpTypes"
						item-text="name"
						item-value="id"
						:item="flagPickUp"
						label="Tipo de Entrega"
						model="flagPickUp"
						return-object
						@input="$emit('set-filter-data', $event)"
					></app-select>
				</v-flex> -->

				<!-- VENDEDOR -->
				<v-flex xs12 pt-2 v-if="!isTwoDrivers">
					<app-select
						append-icon="search"
						autocomplete
						:items="sellers"
						item-text="fullname"
						item-value="id"
						:item="filterData.sellerId"
						label="Vendedor"
						model="sellerId"
						return-object
						@input="$emit('set-filter-data', $event)"
					></app-select>
				</v-flex>

				<!-- CLIENTE -->
				<v-flex xs12 pt-2>
					<app-select
						:items="customers"
						item-text="autocomplete"
						item-value="id"
						:item="filterData.customerId"
						label="Cliente"
						model="customerId"
						return-object
						@input="$emit('set-filter-data', $event)"
					></app-select>
				</v-flex>

				<!-- AGENCIA DE TRANSPORTES -->
				<!-- <v-flex xs12 pt-2 v-if="!isTwoDrivers && $route.name !== 'pending-routes-map'">
					<app-select
						:items="transportsAgencies"
						item-text="name"
						item-value="id"
						:item="filterData.transportAgencyId"
						label="Agencia de Transportista"
						model="transportAgencyId"
						return-object
						@input="$emit('set-filter-data', $event)"
					></app-select>
				</v-flex> -->


			</v-layout>
		</v-flex>

		<!-- TIPO DE DOCUMENTO -->
		<!-- <v-flex xs12 pb-2 v-if="!isTwoDrivers && $route.name !== 'pending-routes-map'">
			<app-select
				:items="documentTypes"
				item-text="name"
				item-value="value"
				:item="filterData.documentType"
				label="Tipo de Documento"
				model="documentType"
				:return-object="false"
				@input="$emit('set-filter-data', $event)"
			></app-select>
		</v-flex> -->

		<!-- VENDEDOR OTRA VEZ -->
		<!-- <v-flex xs12 pb-2 v-if="!isTwoDrivers && $route.name !== 'pending-routes-map'">
			<app-select
				deletable-chips
				chips
				multiple
				label="Vendedor"
				item-text="name"
				item-value="id"
				model="employeeIds"
				:item="filterData.employeeIds"
				:items="sellers"
				return-object
				@input="$emit('set-filter-data', $event)"
			/>
		</v-flex> -->

		<!-- ZONA -->
		<v-flex xs12 pb-2 v-if="!isTwoDrivers && $route.name !== 'pending-routes-map'">
			<app-select
				:item="filterData.zoneId"
				item-text="name"
				item-value="id"
				:items="zones"
				label="Zona"
				model="zoneId"
				:return-object="mapFiltersSection"
				@input="$emit('set-filter-data', $event)"
			></app-select>
		</v-flex>

		<!-- PROVINCIA -->
		<v-flex xs12 pb-3 v-if="!isTwoDrivers && $route.name !== 'pending-routes-map'">
			<app-select
				:item="filterData.provinceId"
				item-text="name"
				item-value="id"
				:items="provinces"
				label="Provincia"
				model="provinceId"
				:return-object="mapFiltersSection"
				@input="$emit('set-filter-data', $event)"
			></app-select>
		</v-flex>


		<!-- DEBERÍA EXISTIR DISTRITO -->
		<!-- CIUDAD -->
		<!-- <v-flex xs12 pb-3 v-if="!isTwoDrivers && $route.name !== 'pending-routes-map'">
			<app-select
				:disabled="!filterData.provinceId"
				:item="filterData.cityId"
				item-text="name"
				item-value="id"
				:items="cities"
				label="Ciudad"
				model="cityId"
				:readonly="!filterData.provinceId"
				:return-object="mapFiltersSection"
				@input="$emit('set-filter-data', $event)"
			></app-select>
		</v-flex> -->


		<!-- PARROQUIA -->
		<!-- <v-flex xs12 pb-3 v-if="!isTwoDrivers && $route.name !== 'pending-routes-map'">
			<app-select
				:disabled="!filterData.cityId"
				:item="filterData.parishId"
				item-text="name"
				item-value="id"
				:items="parishes"
				label="Parroquia"
				model="parishId"
				:readonly="!filterData.cityId"
				:return-object="mapFiltersSection"
				@input="$emit('set-filter-data', $event)"
			></app-select>
		</v-flex> -->

		<!-- PEDIDOS PENDIENDTES -->
		<!-- SIN RUTA -->
		<v-flex xs12 pb-2 v-if="!isTwoDrivers && $route.name !== 'pending-routes-map'">
			<v-checkbox
				color="success"
				hide-details
				label="Pedidos pendientes sin ruta"
				v-model="outRoute"
				@change="$emit('set-filter-data', { model: 'outRoute', value: $event })"
			></v-checkbox>
		</v-flex>

		<!-- CON RUTA -->
		<v-flex xs12 pb-2 v-if="!isTwoDrivers && $route.name !== 'pending-routes-map'">
			<v-checkbox
				color="success"
				hide-details
				label="Pedidos pendientes con ruta"
				v-model="inRoute"
				@change="$emit('set-filter-data', { model: 'inRoute', value: $event })"
			></v-checkbox>
		</v-flex>


		<!-- ESTADO -->
		<!-- <v-flex xs12 pb-2 v-if="$route.name === 'pending-routes-map'">
			<app-select
				multiple
				chips
				label="Estado del Pedido"
				item-text="name"
				item-value="code"
				:items="orderStates"
				model="orderStateId"
				:item="filterData.orderStateId"
				return-object
				@input="$emit('on-input', $event)"
			/>
		</v-flex> -->

		<section class="modal-filter-footer">
			<modal-sidebar-button
				:img="false"
				padding-cancel="px-5 py-2"
				padding-success="px-5 py-2"
				success-color="primary"
				success-text="Filtrar"
				@accept-button-clicked="$emit('accept-action')"
				@cancel-button-clicked="$emit('cancel-action')"
			/>
		</section>
	</v-layout>
</template>

<script>
	import dateComponent from '@/components/shared/date-component';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function created() {
		this.inRoute = this.filterData.inRoute;
		this.outRoute = this.filterData.outRoute;
	}

	function watchFilterData(value) {
		this.inRoute = value.inRoute;
		this.outRoute = value.outRoute;
	}

	function data() {
		return {
			inRoute: true,
			outRoute: true,
		};
	}

	export default {
		name: 'filters-slide',
		components: {
			dateComponent,
			modalSidebarButton,
		},
		created,
		data,
		props: {
			cities: {
				default: () => [],
				type: Array,
			},
			customers: {
				default: () => [],
				type: Array,
			},
			documentTypes: {
				default: () => [],
				type: Array,
			},
			transportsAgencies: {
				default: () => [],
				type: Array,
			},
			drivers: {
				default: () => [],
				type: Array,
			},
			filterData: {
				default: () => {},
				type: Object,
			},
			flagPickUp: [Number, String],
			mapFiltersSection: {
				default: false,
				type: Boolean,
			},
			parishes: {
				default: () => [],
				type: Array,
			},
			provinces: {
				default: () => [],
				type: Array,
			},
			pickUpTypes: {
				default: () => [],
				type: Array,
			},
			sellers: {
				type: Array,
				default: () => [],
			},
			states: {
				default: () => [],
				type: Array,
			},
			zones: {
				default: () => [],
				type: Array,
			},
			orderStates: {
				default: () => [],
				type: Array,
			},
		},
		watch: {
			filterData: {
				deep: true,
				handler: watchFilterData,
			},
		},
	};
</script>

<style lang="scss" scoped>

</style>
