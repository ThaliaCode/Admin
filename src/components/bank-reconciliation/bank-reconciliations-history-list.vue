<template>
	<div>
		<app-table
			name="bank-reconciliations-history"
			:columns="columns"
			:current-page="currentPage"
			:filter-columns="false"
			:input-search="false"
			:last-page="lastPage"
			:rows="rows"
			@on-page="$emit('on-page', $event)"
			class="is-not-selectable"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable">{{ props.row.date }}</td>
				<td>{{ props.row.createdAt | formatDate }}</td>
				<td>{{ props.row.amount | round }}</td>
				<td>
					<app-tooltip-button
						color="success"
						icon="remove_red_eye"
						text="Ver Detalle"
						@click-icon="$emit('open-detail', props.row)"
					/>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';

	export default {
		name: 'bank-reconciliations-history-list',
		components: {
			appTable,
		},
		props: {
			columns: {
				default: () => [],
				type: Array,
			},
			currentPage: [Number],
			lastPage: [Number],
			rows: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>
