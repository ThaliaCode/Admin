<template>
	<div class="filters-data mr-2 px-2">
		<v-layout row wrap>
			<v-flex xs3 v-if="$route.name === 'route-history-detail'">
				<label class="filter-label">
					Fec. Crea.: <span class="filter-value px-1">{{ filterFields.createdAt }}</span>
				</label>
			</v-flex>
			<v-flex xs3>
				<label class="filter-label">
					Fec. Ini.: <span class="filter-value px-1">{{ filterFields.startDate }}</span>
				</label>
			</v-flex>
			<v-flex xs3>
				<label class="filter-label">
					Fec. Fin: <span class="filter-value px-1">{{ filterFields.endDate }}</span>
				</label>
			</v-flex>
			<v-flex xs3>
				<label class="filter-label">
					Estado: <span class="filter-value px-1">{{ filterData.orderPickStateName }}</span>
				</label>
			</v-flex>
			<v-flex xs3 v-if="$route.name !== 'route-history-detail'">
				<label class="filter-label">
					{{ entityName }}: <span class="filter-value px-1">{{ filterData[entityProp] }}</span>
				</label>
			</v-flex>
		</v-layout>
		<v-layout row wrap>
			<v-flex xs3 v-if="$route.name === 'route-history-detail'">
				<label class="filter-label">
					Inicio: <span class="filter-value">{{ initLocationUp }}</span><br/>
					<p class="text-gray">
						{{ initLocationDown }}
					</p>
				</label>
			</v-flex>
			<v-flex xs3 v-if="$route.name === 'route-history-detail'">
				<label class="filter-label">
					Fin: <span class="filter-value">{{ initLocationUp }}</span><br/>
					<p class="text-gray">
						{{ initLocationDown }}
					</p>
				</label>
			</v-flex>
			<v-flex xs3 v-if="$route.name !== 'route-history-detail'">
				<label class="filter-label">
					Zona: <span class="filter-value px-1">{{ filterData.zoneName }}</span>
				</label>
			</v-flex>
			<v-flex xs4>
				<label class="filter-label">
					Vendedor: <span class="filter-value px-1">{{ filterData.sellerName }}</span>
				</label>
			</v-flex>
			<v-flex xs4>
				<label class="filter-label" v-if="$route.name !== 'route-history-detail'">
					Cliente: <span class="filter-value px-1">{{ filterData.customerName }}</span>
				</label>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	function entityName() {
		return this.isEcuador ? 'Parroquia' : 'Distrito';
	}

	function entityProp() {
		return this.isEcuador ? 'parishName' : 'distritName';
	}

	export default {
		name: 'filters-data',
		computed: {
			entityName,
			entityProp,
		},
		props: {
			filterData: {
				default: () => {},
				type: Object,
			},
			filterFields: {
				default: () => {},
				type: Object,
			},
			endLocationDown: '',
			endLocationUp: '',
			initLocationDown: '',
			initLocationUp: '',
		},
	};
</script>

<style lang="scss" scoped>
	.filter-label {
		color: color(paginationText);
		font-family: font(lato-bold);
		font-size: size(small11);

		.filter-value {
			color: color(silver-footer);
			font-family: font(lato-regular);
		}
	}

	.filters-data {
		background-color: color(background-modal);
		border: 1px solid color(background-table);
		border-radius: 3px;
	}
</style>