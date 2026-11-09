<template>
	<div class="overflow-auto mt-3">
		<app-table
			name="daily-summary-create"
			:check-all="checkAll"
			:clean-search="cleanSearch"
			:columns="columns"
			:rows="rows"
			selectable
			:current-page="currentPage"
			:last-page="lastPage"
			@on-search-event="$emit('on-search', $event)"
			@on-selected-all="$emit('all-is-selected', $event)"
			@row-is-selected="$emit('row-is-selected', $event)"
			@on-page="$emit('on-page', $event)"
			class="is-not-selectable no-main-list"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable"
					v-show="showRow(columns, 1)">
					{{ props.row.subsidiary.sucursalName }}
				</td>
				<td v-show="showRow(columns, 2)">{{ showTerminal(props.row.terminal) }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.customerData }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.docNumber }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.createdAt | formatDate }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.typeDocumentName }}</td>
				<td v-show="showRow(columns, 7)">
					<document-state
						:color="props.row.state.color"
						:tooltip="props.row.state.name"
					/>
				</td>
				<td v-show="showRow(columns, 8)">
					<document-state
						:color="props.row.paymentStateColor"
						:tooltip="props.row.paymentStateName"
					/>
				</td>
				<td v-show="showRow(columns, 9)">{{ props.row.typePaymentName }}</td>
				<td v-show="showRow(columns, 10)">{{ props.row.typePaymentNames }}</td>
				<td v-show="showRow(columns, 11)">
					{{ props.row.currencySymbol }} {{ props.row.amount | round }}
				</td>
				<td v-show="showRow(columns, 12)">
					{{ props.row.currencySymbol }} {{ props.row.debtAmount | round }}
				</td>
				<td v-show="showRow(columns, 13)">
					<document-state
						:color="props.row.statusTaxName.color"
						:tooltip="props.row.statusTaxName.name"
					/>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';
	import documentState from '@/components/shared/document-state';

	function showTerminal(terminal) {
		return terminal ? terminal.name : '';
	}

	export default {
		name: 'daily-summary-list',
		components: {
			appTable,
			documentState,
		},
		methods: {
			showTerminal,
		},
		props: {
			cleanSearch: {
				default: false,
				type: Boolean,
			},
			columns: {
				default: () => [],
				type: Array,
			},
			rows: {
				default: () => [],
				type: Array,
			},
			currentPage: [Number, String],
			lastPage: [Number, String],
			checkAll: {
				default: false,
				type: Boolean,
			},
		},
	};
</script>
