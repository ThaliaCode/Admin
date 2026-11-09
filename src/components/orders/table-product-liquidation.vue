<template>
	<div>
		<app-table
			:columns="columns"
			:rows="rows"
			name="table-product-liquidation"
			class="px-2"
			selectable
			:input-search="false"
			:last-page="lastPage"
			:current-page="currentPage"
			:items-total-quantity="totalItems"
			:items-quantity="rows.length"
			:checkAll="checkAll"
			@row-is-selected="$emit('on-row-selected', $event)"
			@on-selected-all="$emit('on-selected-all', $event)"
			@on-page="$emit('change-page', $event)"
		>
			<template slot="rows" slot-scope="props">
				<td class="" v-show="showRow(columns, 1)">{{ props.row.customer }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.documentNumber }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.seller }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.createdAt }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.typeDocument }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.totalAmount }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.debtAmount }}</td>
				<td v-show="showRow(columns, 8)">
					<document-state
						:color="props.row.stateColor"
						:tooltip="props.row.state"
					/>
				</td>
				<td v-show="showRow(columns, 9)">
					<document-state
						:color="props.row.paymateColor"
						:tooltip="props.row.paymentState"
						@click-state="showTransactions(props.row)"
					/>
				</td>
				<!-- <td v-show="showRow(columns, 10)">{{ props.row.routeSort }}</td> -->
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import documentState from '@/components/shared/document-state';

export default {
	components: {
		appTable,
		documentState,
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
		checkAll: {
			type: Boolean,
			default: false,
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
	name: 'table-product-liquidation',
};
</script>
