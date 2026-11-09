<template>
	<v-layout wrap py-3 px-4>
		<template v-if="mapFiltersSection">
			<v-flex xs8 pr-2>
				<app-input-text
					v-if="viewFilters"
					append-icon="search"
					model="search"
					placeholder="Buscar"
					searcher
					:text="filterFields.search"
					@input="$emit('set-filter-data', $event)"
					@input-enter="$emit('filter-list')"
				></app-input-text>
			</v-flex>
			<v-flex xs2>
				<v-btn
					v-if="viewFilters"
					class="btn-auto btn-action py-2 px-4"
					color="success"
					@click="$emit('show-filters')"
				>
					<img
						class="ml-0"
						src="/static/icon/filter-icon.svg"
						alt=""
						height="18"
					/>
					<span class="ml-2">Filtrar</span>
				</v-btn>
			</v-flex>
		</template>
		<template v-else>
			<v-flex
				:class="
					this.$route.name === 'pending-orders-list'
						? 'xs11'
						: this.$route.name === 'pick-up-earrings'
						? 'xs3'
						: 'xs2'
				"
			>
				<v-layout row wrap>
					<v-flex
						:class="this.$route.name === 'pick-up-earrings' ? 'xs4' : 'xs2'"
						px-1
					>
						<label class="caption">Fecha Inicio</label>
						<date-component
							:date="filterFields.startDate"
							icon="/static/img/calendar.svg"
							@on-input="
								$emit('set-filter-data', { model: 'startDate', value: $event })
							"
						></date-component>
					</v-flex>
					<v-flex
						:class="this.$route.name === 'pick-up-earrings' ? 'xs4' : 'xs2'"
						px-1
					>
						<label class="caption">Fecha Final</label>
						<date-component
							:disabled="!filterFields.startDate"
							:date="filterFields.endDate"
							icon="/static/img/calendar.svg"
							@on-input="
								$emit('set-filter-data', { model: 'endDate', value: $event })
							"
						></date-component>
					</v-flex>
					<v-flex
						v-if="this.$route.name !== 'pick-up-earrings'"
						px-1
						:class="this.$route.name === 'pending-orders-list' ? 'xs2' : 'xs2'"
					>
						<app-select
							:items="orderStates"
							item-text="name"
							item-value="id"
							:item="filterFields.orderStateId"
							model="orderStateId"
							label="E. del Pedido"
							slot-selection
							:return-object="false"
							@input="$emit('set-filter-data', $event)"
						></app-select>
					</v-flex>
					<v-flex xs2 px-1>
						<app-select
							append-icon="search"
							autocomplete
							:items="customers"
							item-text="autocomplete"
							item-value="id"
							:item="filterFields.customerId"
							label="Cliente"
							model="customerId"
							return-object
							show-tool-tip
							slot-selection
							text-slot="autocomplete"
							:limit-to-slot="30"
							@input="$emit('set-filter-data', $event)"
						></app-select>
					</v-flex>
					<v-flex xs2 px-1 v-if="$route.name === 'pending-orders-list'">
						<app-select
							label="Sucursal"
							item-text="rzSocial"
							item-value="id"
							model="subsidiaryId"
							:items="subsidiaries"
							:item="filterFields.subsidiaryId"
							:return-object="false"
							@input="$emit('set-filter-data', $event)"
						></app-select>
					</v-flex>
					<v-flex xs2 px-1 v-if="$route.name === 'pending-orders-list'">
						<app-select
							:label="labelWarehouse()"
							item-text="name"
							item-value="id"
							model="warehouseId"
							:items="warehouses"
							:item="filterFields.warehouseId"
							:return-object="false"
							@input="$emit('set-filter-data', $event)"
						></app-select>
					</v-flex>
					<v-flex xs2 px-1>
						<app-select
							:items="listFlagPickUp"
							item-text="name"
							item-value="value"
							model="pickUp"
							:item="filterFields.flagPickUp"
							label="Tipo de Entrega"
							:return-object="false"
							show-tool-tip
							slot-selection
							:limit-to-slot="6"
							@input="$emit('set-filter-data', $event)"
						></app-select>
					</v-flex>
					<v-flex xs2 px-1>
						<app-select
							multiple
							chips
							:item="filterFields.employeeIds"
							item-text="fullname"
							item-value="id"
							:items="employees"
							label="Empleado"
							model="employeeIds"
							:return-object="false"
							@input="$emit('set-filter-data', $event)"
							show-autocomplete
						></app-select>
					</v-flex>
					<v-flex xs2 px-1>
						<app-select
							deletable-chips
							chips
							multiple
							:items="transports"
							item-text="name"
							item-value="id"
							:item="filterFields.transportAgencyId"
							label="Agencia de Transporte"
							model="transportAgencyId"
							return-object
							@input="$emit('set-filter-data', $event)"
						></app-select>
					</v-flex>
					<v-flex xs1 pl-1>
						<app-select
							label="Deudas"
							item-text="name"
							item-value="value"
							model="flagDebts"
							:item="filterFields.flagDebts"
							:items="debtsStates"
							:return-object="false"
							@input="$emit('set-filter-data', $event)"
						/>
					</v-flex>
					<v-flex xs1 pl-1>
						<app-select
							label="Origen"
							item-text="name"
							item-value="id"
							model="originPlatform"
							:item="filterFields.originPlatform"
							:items="originList"
							return-object
							@input="$emit('set-filter-data', $event)"
						/>
					</v-flex>
					<v-flex xs2 pl-1>
						<app-select
							label="Grupo de cliente"
							item-text="name"
							item-value="id"
							model="groupId"
							:item="filterFields.groupId"
							:items="groups"
							return-object
							@input="$emit('set-filter-data', $event)"
						/>
					</v-flex>
					<v-flex xs2 px-1 mt-3>
						<v-btn
							class="btn-action btn-auto px-4 py-2 w-100"
							color="primary"
							@click="$emit('filter-list')"
						>
							Filtrar
						</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
		</template>
	</v-layout>
</template>

<script>
import dateComponent from '@/components/shared/date-component';
import typePickUp from '@/shared/type-pick-up';

function pickUpTypes(values) {
	if (values.length) {
		this.listFlagPickUp = values.map((p) => {
			const newPickUp = { ...p };
			newPickUp.value =
				p.code === 'RCT' ? typePickUp.PickUpStore : typePickUp.HomeDelivery;
			return newPickUp;
		});
		this.listFlagPickUp.unshift({ name: 'Todos', value: null });
	}
}

function data() {
	return {
		flagPickUp: 0,
		listFlagPickUp: [],
		debtsStates: [
			{
				id: 1,
				name: 'Con Deudas',
				value: true,
			},
			{
				id: 2,
				name: 'Sin Deudas',
				value: false,
			},
		],
	};
}

export default {
	name: 'filters-section',
	components: {
		dateComponent,
	},
	data,
	props: {
		customers: {
			default: () => [],
			type: Array,
		},
		filterFields: {
			default: () => {},
			type: Object,
		},
		mapFiltersSection: {
			default: false,
			type: Boolean,
		},
		pickUpTypes: {
			default: () => [],
			type: Array,
		},
		sellers: {
			default: () => [],
			type: Array,
		},
		states: {
			default: () => [],
			type: Array,
		},
		orderStates: {
			default: () => [],
			type: Array,
		},
		transports: {
			default: () => [],
			type: Array,
		},
		employees: {
			default: () => [],
			type: Array,
		},
		inputSearch: {
			default: false,
			type: Boolean,
		},
		subsidiaries: {
			default: () => [],
			type: Array,
		},
		warehouses: {
			default: () => [],
			type: Array,
		},
		originList: {
			default: () => [],
			type: Array,
		},
		groups: {
			default: () => [],
			type: Array,
		},
	},
	watch: {
		pickUpTypes,
	},
	computed: {
		viewFilters() {
			const nameRoute = this.$route.name;
			return (
				nameRoute === 'pending-orders-map' ||
				nameRoute === 'route-history-detail'
			);
		},
	},
};
</script>

<style lang="scss" scoped>
.input-date {
	background-color: color(white);
	border-radius: 3px;
	box-shadow: inset 0px 0px 1px 1px rgba(0, 0, 0, 0.2);
	color: color(paginationText);
	height: 30px;
	outline: none;
	padding-left: 14px;
}

.toggle-filter {
	background-color: transparent !important;
	box-shadow: none !important;

	&-btn {
		background-color: color(white) !important;
		border: 1px solid color(subheaderText) !important;
		border-radius: 3px !important;
		color: color(grey-border) !important;
		font-family: font(lato-bold) !important;
		font-size: size(medium16) !important;
		height: 30px !important;
		opacity: 1 !important;

		&.btn--active {
			background-color: color(success) !important;
			border-color: color(success) !important;
			color: color(white) !important;
		}
	}
}

.w-100 {
	width: 100% !important;
}
</style>
