<template>
	<div>
		<div class="overflow-auto">
			<app-table name="amortizations"
				:columns="columns"
				:current-page="currentPage"
				:input-search="false"
				:rows="rows"
				:last-page="lastPage"
				@on-page="onPage"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.id }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.createdAt | formatDate }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.customerName }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.documents }}</td>
					<td v-show="showRow(columns, 5)">
						<a v-if="props.row.urlImage" @click.prevent="showSignature(props.row)">firma</a>
						<span v-else>Sin Firma</span>
					</td>
					<td v-show="showRow(columns, 6)">{{ props.row.employeeName }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.typePaymentName }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.amount | round }}</td>
					<td v-show="showRow(columns, 9)">
						<app-tooltip-button
							color="info"
							icon="print"
							text="Imprimir Recibo"
							@click-icon="$emit('print-voucher', props.row)"
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

function showSignature(row) {
	this.$emit('show-signature', row);
}

export default {
	name: 'amortizations-list-history',
	components: {
		appTable,
	},
	props: {
		columns: {
			type: Array,
			default: () => [],
		},
		currentPage: {
			type: Number,
			default: 1,
		},
		rows: {
			type: Array,
			default: () => [],
		},
		total: {
			type: Number,
			default: () => [],
		},
		lastPage: Number,
	},
	methods: {
		onPage,
		showSignature,
	},
};
</script>
