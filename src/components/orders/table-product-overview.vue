<template>
	<div>
		<app-table
			:columns="columns"
			:rows="rows"
			name="table-product-overview"
			class="is-not-selectable px-2"
			:input-search="false"
			:items-quantity="rows.length"
			:last-page="lastPage"
			:current-page="currentPage"
			:items-total-quantity="totalItems"
			@on-page="$emit('change-page', $event)"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.documentNumber }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.productCode }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.productName }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.warehouseName }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.unitName }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.quantity }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.stock }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.weight }}</td>
				<!-- <td v-show="showRow(columns, 9)">{{ props.row.routeSort }}</td> -->
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

export default {
	components: {
		appTable,
	},
	props: {
		columns: {
			type: Array,
			default: () => [],
		},
		rows: {
			type: Array,
			default: () => [],
		},
		currentPage: {
			type: Number,
		},
		totalItems: {
			type: Number,
		},
		lastPage: {
			type: Number,
		},
	},
	name: 'table-product-overview',
};
</script>
