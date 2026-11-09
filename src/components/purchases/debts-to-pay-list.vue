<template>
	<div>
		<div class="overflow-auto">
			<app-table
				name="debts-to-pay"
				selectable
				:columns="columns"
				:input-search="true"
				:clean-search="isClean"
				:rows="rows"
				:current-page="currentPage"
				:last-page="lastPage"
				@on-page="onPage"
				@row-is-selected="rowSelected"
				@on-search-event="$emit('on-search', $event)"
				:items-quantity="rows.length"
				:items-total-quantity="totalQuantity"
				class="no-main-list"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">
						{{ props.row.warehouseName || '-' }}
					</td>
					<td v-show="showRow(columns, 2)">
						{{ props.row.supplier.name }}
					</td>
					<td v-show="showRow(columns, 3)">{{ props.row.documentNumber }}</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.createdAt | formatDate }}
					</td>
					<td v-show="showRow(columns, 5)">
						{{
							props.row.caDocument
								? props.row.caDocument.expirationDateFormat
								: '-'
						}}
					</td>
					<td v-show="showRow(columns, 6)">
						{{ props.row.dateDocument || '-' }}
					</td>
					<td v-show="showRow(columns, 7)">
						{{ props.row.typeDocument.name }}
					</td>
					<td v-show="showRow(columns, 8)">{{ props.row.state.name }}</td>
					<td v-show="showRow(columns, 9)">{{ props.row.payment.name }}</td>
					<td v-show="showRow(columns, 10)">
						{{ props.row.totalPerception | round }}
					</td>
					<td v-show="showRow(columns, 11)">
						{{ props.row.debtAmount | round }}
					</td>
					<td v-show="showRow(columns, 12)">
						{{ props.row.dueAmount | round }}
					</td>
					<td v-show="showRow(columns, 13)">{{ props.row.amount | round }}</td>
					<td v-show="showRow(columns, 14)">
						<app-tooltip-button
							color="success"
							:icon="props.row.iconArrow"
							size="20"
							text="Ver Detalle"
							@click-icon="$emit('click-icon', props.row)"
						></app-tooltip-button>
					</td>
				</template>
			</app-table>
		</div>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

function onPage(page) {
	this.$emit('on-page', page);
}

function rowSelected(row) {
	this.$emit('row-is-selected', row);
}

export default {
	name: 'debts-to-pay-list',
	components: {
		appTable,
	},
	methods: {
		onPage,
		rowSelected,
	},
	props: {
		columns: {
			default: () => [],
			type: Array,
		},
		rows: {
			default: () => [],
			type: Array,
		},
		currentPage: {
			type: Number,
		},
		lastPage: {
			type: Number,
		},
		totalQuantity: {
			type: Number,
		},
		isClean: {
			default: false,
			type: Boolean,
		},
	},
};
</script>
