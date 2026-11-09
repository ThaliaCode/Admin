<template>
	<div class="layout wrap align-start justify-center">
		<v-flex :class="toShow ? 'column-table active' : 'xs12'">
			<app-table
				name="purchases-list-perception"
				selectable
				:indexes-cancel="indexesCancel"
				:columns="columns"
				:check-all="checkAll"
				:rows="rows"
				v-bind="$attrs"
				:items-quantity="rows.length"
				:disabled-search="disabledSearch"
				@on-page="$emit('on-page', $event)"
				@on-selected-all="$emit('on-selected-all', $event)"
				@row-is-selected="$emit('row-is-selected', $event)"
				@on-search-event="$emit('on-search', $event)"
				@on-toggle-columns="$emit('on-toggle-columns', $event)"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.documentNumber }}</td>
					<td v-show="showRow(columns, 2)">
						<a :href="`/purchase/${props.row.id}/detail`" target="_blank">{{
							props.row.typeDocument.name
						}}</a>
					</td>
					<td v-show="showRow(columns, 3)">
						{{ props.row.supplierName }}
					</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.paymentStateName }}
					</td>
					<td v-show="showRow(columns, 5)">
						{{ props.row.payment.name }}
					</td>
					<td v-show="showRow(columns, 6)">
						{{ props.row.taxes }}
					</td>
					<td v-show="showRow(columns, 7)">{{ props.row.subTotal }}</td>
					<td v-show="showRow(columns, 8)">
						{{ props.row.totalPerception }}
					</td>
					<td v-show="showRow(columns, 9)">{{ props.row.amount }}</td>
				</template>
			</app-table>
		</v-flex>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

function data() {
	return {
		currentPurchase: {
			supplier: {},
		},
		inlineProducts: '',
		toShow: false,
		rowDetailSelected: {},
	};
}

export default {
	name: 'purchases-list',
	components: {
		appTable,
	},
	data,
	inheritAttrs: false,
	props: {
		indexesCancel: {
			type: Array,
			default: () => [],
		},
		columns: {
			type: Array,
			default: () => [],
		},
		checkAll: {
			type: Boolean,
			default: false,
		},
		rows: {
			type: Array,
			default: () => [],
		},
		validateCurrency: {
			type: Boolean,
			default: false,
		},
		showEntity: {
			type: Boolean,
			default: false,
		},
		disabledSearch: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style lang="scss" scoped>
.cancel-style-text {
	text-decoration: line-through;
}
.due-btn {
	min-width: auto;
}

.text-underline {
	text-decoration: underline;
}

.detail-in-table {
	max-width: 364px;
}

.column-table {
	max-width: calc(100% - 364px);
}

.semi-bold {
	font-family: map-get($fonts, lato-regular);
	font-weight: 600;
}

.state-entity {
	border-radius: 4px;
	color: color(white);
	font-family: map-get($fonts, open-bold);
	padding: 3px 6px;
}
</style>
