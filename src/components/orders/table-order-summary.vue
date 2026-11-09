<template>
	<div class="table-product-overview">
		<app-table
			name="table-product-ovewview"
			:columns="columns"
			:rows="rows"
			class="is-not-selectable"
			:input-search="false"
			:items-quantity="rows.length"
			:last-page="lastPage"
			:current-page="currentPage"
			:items-total-quantity="totalItems"
			@on-page="$emit('change-page', $event)"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable mt-3" v-show="showRow(columns, 1)">
					{{ props.row.documentNumber }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{ props.row.customer.typePerson.fullName }}
				</td>
				<td v-show="showRow(columns, 3)">
					{{
						props.row.customerAddress
							? props.row.customerAddress.parish
								? props.row.customerAddress.parish.name
								: '-'
							: '-'
					}}
				</td>
				<td v-show="showRow(columns, 4)">{{ props.row.paymentStateName }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.totalItems }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.weight }}</td>
				<td v-show="showRow(columns, 7)">
					{{ props.row.formatNumbers.total }}
				</td>
				<td v-show="showRow(columns, 8)">{{ props.row.routeSort }}</td>
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

export default {
	name: 'table-order-summary',
	components: {
		appTable,
	},
	props: {
		rows: {
			type: Array,
			default: () => [],
		},
		columns: {
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
};
</script>

<style lang="scss" scoped>
.table-product-overview {
	width: 100%;
}
</style>
