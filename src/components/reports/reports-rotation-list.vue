<template>
	<div>
		<app-table
			class="is-not-selectable no-main-list"
			:current-page="currentPage"
			:last-page="lastPage"
			name="rotation-reports"
			:columns="columns"
			:items-quantity="products.length"
			:items-total-quantity="totalItems"
			:filter-columns="false"
			:input-search="false"
			:rows="products"
			@on-page="$emit('on-page', $event)"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.code }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{ props.row.inlineAlternateCode }}
				</td>
				<td v-show="showRow(columns, 3)">{{ props.row.name }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.countIn }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.countOut }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.totalIn }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.totalOut }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.codeUnit }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.rotation | round }}</td>
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

export default {
	name: 'reports-rotation-list',
	components: {
		appTable,
	},
	props: {
		columns: {
			default: () => [],
			type: Array,
		},
		currentPage: Number,
		lastPage: Number,
		products: {
			default: () => [],
			type: Array,
		},
		totalItems: Number,
	},
};
</script>
