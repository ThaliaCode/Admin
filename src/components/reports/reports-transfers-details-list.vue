<template>
	<div>
		<app-table
			class="is-not-selectable"
			name="report-transfers-details"
			:columns="columns"
			:current-page="currentPage"
			:filter-columns="false"
			:input-search="false"
			:last-page="lastPage"
			:rows="rows"
			@on-page="$emit('on-page', $event)"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable"
					v-show="showRow(columns, 1)">
					<v-tooltip top>
						<v-btn
							class="primary--text lighten-2 btn-link due-btn"
							flat
							:ripple="false"
							slot="activator"
							@click.native="goTo('pages-transfers-detail',
								{ params: { id: props.row.transferId } })"
						>
							{{ props.row.transferNumber }}
						</v-btn>
						<span>Ver Detalle de Transferencia</span>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.inlineAlternateCode }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.name }}</td>
				<td v-show="showRow(columns, 5)">
					<v-tooltip top>
						<span slot="activator">
							{{ props.row.typeDocumentCode }}
						</span>
						{{ props.row.typeDocumentName }}
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 6)">{{ props.row.warehouseOriginName }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.warehouseSourceName }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.deliveryUserInfo.name }} {{ props.row.deliveryUserInfo.lastname }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.devolution }}</td>
				<td v-show="showRow(columns, 10)">{{ props.row.unitCode }}</td>
				<td v-show="showRow(columns, 11)">{{ props.row.reason }}</td>
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
			currentPage: [Number, String],
			lastPage: [Number, String],
			rows: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.btn-link {
		font-weight: normal;
		text-decoration: underline;
	}
</style>
