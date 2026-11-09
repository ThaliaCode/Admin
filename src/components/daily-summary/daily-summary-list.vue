<template>
	<div class="overflow-auto mt-4">
		<app-table
			name="daily-summary"
			:check-all="checkAll"
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			:input-search="false"
			:last-page="lastPage"
			:rows="rows"
			selectable
			@on-page="$emit('on-page', $event)"
			@on-selected-all="$emit('all-is-selected', $event)"
			@row-is-selected="$emit('row-is-selected', $event)"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">
					{{ getBolCod(props.row) }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{ getFacCod(props.row) }}
				</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.subsidiaryRzSocial }}
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.emissionDate | exactDate('DD-MM-YYYY') }}
				</td>
				<td v-show="showRow(columns, 5)">
					{{ props.row.createdAtSub }}
				</td>
				<td v-show="showRow(columns, 6)">
					{{ props.row.documentsRelated.length }}
				</td>
				<td v-show="showRow(columns, 7)">
					{{ props.row.currency }}
				</td>
				<td v-show="showRow(columns, 8)">
					<document-state
						:color="props.row.statusTaxName.color"
						:tooltip="props.row.sunatError || props.row.statusTaxName.name"
						@click-state="$emit('open-sunat', props.row)"
					/>
				</td>
				<td v-show="showRow(columns, 9)">
					{{ props.row.id }}
				</td>
				<td v-show="showRow(columns, 10)">
					<app-tooltip-button
						text="Ver Detalle"
						icon="remove_red_eye"
						color="primary"
						@click-icon="$emit('go-to-detail', props.row)"
					/>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import documentState from '@/components/shared/document-state';
import TypeSummaryUns from '@/shared/type-summary-unsubscribe';

function getBolCod(sale) {
	if (sale.typeSummary === TypeSummaryUns.BOL) {
		return sale.numericalIdentification;
	}
	return '---';
}

function getFacCod(sale) {
	if (sale.typeSummary === TypeSummaryUns.FAC) {
		return sale.numericalIdentification;
	}
	return '---';
}

export default {
	name: 'daily-summary-list',
	components: {
		appTable,
		documentState,
	},
	methods: {
		getBolCod,
		getFacCod,
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
		currentPage: Number,
		lastPage: Number,
		rows: {
			default: () => [],
			type: Array,
		},
	},
};
</script>
