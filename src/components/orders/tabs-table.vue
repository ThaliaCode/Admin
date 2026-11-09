<template>
	<div class="pt-2" :class="styles">
		<app-table
			name="tabs-table"
			class="is-not-selectable no-main-list mb-0"
			:class="{ 'hide-stock-column': hideStockColumn }"
			:check-all="checkAll"
			:clean-search="cleanSearch"
			:columns="filteredColumns"
			:main-list="false"
			:rows="rows"
			padding="px-2"
			:input-search="inputSearch"
			:selectable="selectable"
			@on-search-event="$emit('on-search', $event)"
			@on-selected-all="$emit('on-selected-all', $event)"
			@row-is-selected="$emit('row-is-selected', $event)"
		>
			<template slot="rows" slot-scope="props">
				<td
					v-for="column in filteredColumns"
					:key="`${column.value}-${column.id}`"
					:class="{
						'is-not-selectable': column.id === 1,
						'py-2': column.id === 3,
						'width-order': column.id === 10 || column.id === 4,
					}"
					v-show="showRow(filteredColumns, column.id)"
				>
					<template v-if="!column.flagVisible">
						<template v-if="column.value === 'warehouseName'">
							<app-select
								:disabled="disabled"
								:readonly="disabled"
								:item="props.row.warehouseId"
								item-text="name"
								item-value="id"
								:items="props.row.warehouses"
								model="warehouseId"
								place-holder="Almacén"
								:return-object="false"
								@input="$emit('change-warehouse', { dataChange: $event, row })"
							></app-select>
						</template>
						<template v-else>
							<!-- <span v-if="column.value === 'total'">
								{{ props.row.currency }}
							</span> -->
							<span
								v-if="
									column.name === 'Dirección de Comercio' ||
									column.name === 'Dirección de Entrega'
								"
							>
								{{ props.row.deliveryJson[column.value].addressLine }}
							</span>
							<span v-else-if="column.name === 'Comercio'">
								{{ props.row.commerce ? props.row.commerce.name : '---' }}
							</span>
							<span v-else-if="column.name === 'Orden'">
								<app-input-text
									modal="order"
									:text="props.row.order"
									@input="$emit('set-order', $event, props.row)"
								/>
							</span>
							<span v-else-if="column.value === 'actions'">
								<app-tooltip-button
									v-if="!disabled && column.name === 'Acciones' && rows.length > 1"
									icon="delete"
									color="error"
									text="Quitar pedido de la ruta"
									@click-icon="$emit('remove-order', props.row)"
								/>
							</span>
							<span v-else>
								{{ props.row[column.value] }}
							</span>
						</template>
					</template>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

export default {
	name: 'tabs-table',
	components: {
		appTable,
	},
	props: {
		checkAll: {
			default: false,
			type: Boolean,
		},
		cleanSearch: {
			default: false,
			type: Boolean,
		},
		columns: {
			default: () => [],
			type: Array,
		},
		disabled: {
			default: false,
			type: Boolean,
		},
		rows: {
			default: () => [],
			type: Array,
		},
		selectable: {
			default: false,
			type: Boolean,
		},
		styles: {
			default: 'pb-5 mb-5',
			type: String,
		},
		inputSearch: {
			default: true,
			type: Boolean,
		},
		hideStockColumn: {
			default: false,
			type: Boolean,
		},
	},
	computed: {
		filteredColumns() {
			if (this.hideStockColumn) {
				return this.columns.filter((col) => ![6, 7, 8].includes(col.id));
			}
			return this.columns;
		},
	},
};
</script>

<style lang="scss" scoped>
.width-order {
	width: 73px !important;
}
</style>
