<template>
	<div>
		<app-table
			name="transfer-detail"
			:columns="columns"
			:rows="rows"
			local-storage
			local-search
			:main-list="false"
			@on-toggle-columns="toggleColumns"
			@on-local-search="$emit('search-details', $event)"
			class="is-not-selectable no-main-list"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.product ? props.row.product.code : '' }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{ props.row.product ? props.row.product.autoBarcode : '' }}
				</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.product ? props.row.product.name : '' }}
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.product ? props.row.product.inlineFeatures : '' }}
				</td>
				<td v-show="showRow(columns, 5)">
					{{ props.row.product ? props.row.product.description : '' }}
				</td>
				<td v-show="showRow(columns, 6)">
					{{ props.row.brand ? props.row.brand.name : '' }}
				</td>
				<td v-show="showRow(columns, 7)">
					{{
						props.row.product && props.row.product.category
							? props.row.product.category.name
							: ''
					}}
				</td>
				<td v-show="showRow(columns, 8)">{{ props.row.viewQuantity }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.devolution }}</td>
				<td v-show="showRow(columns, 10)">{{ props.row.reason }}</td>
				<td v-show="showRow(columns, 11)">{{ props.row.stockAvaible }}</td>
				<td v-show="showRow(columns, 12)">
					<app-tooltip-button
						v-if="props.row.product.flagControlSerie"
						img="/static/img/icons/barcode.svg"
						:height="25"
						text="Control de series"
						@click-icon="openSeries(props.row)"
					/>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

function toggleColumns() {
	return true;
}

function openSeries(serie) {
	this.$emit('open-series', serie);
}

export default {
	name: 'transfers-detail-list',
	components: {
		appTable,
	},
	methods: {
		toggleColumns,
		openSeries,
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
	},
};
</script>
