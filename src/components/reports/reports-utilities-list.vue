<template>
	<div>
		<app-table
			class="is-not-selectable no-main-list"
			name="utilities-by-warehouse"
			:columns="columns"
			:filter-columns="false"
			:input-search="false"
			:main-list="false"
			:rows="warehouses"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable"
					v-show="showRow(columns, 1)">{{ props.row.name }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.totalIncome | round }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.totalExpense | round }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.utility | round }}</td>
			</template>
		</app-table>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';

	export default {
		name: 'reports-utilities-list',
		components: {
			appTable,
		},
		props: {
			columns: {
				default: () => [],
				type: Array,
			},
			warehouses: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>
