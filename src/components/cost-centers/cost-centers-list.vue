<template>
	<div class="overflow-auto mt-5">
		<app-table
			name="couriers"
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@on-page="$emit('on-page', $event)"
			@on-search-event="$emit('on-search', $event)"
			class="is-not-selectable"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.code }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{ props.row.name }}
				</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.account }}
				</td>
				<td v-show="showRow(columns, 4)">
					<app-tooltip-button
						text="Editar"
						icon="edit"
						color="success"
						@click-icon="$emit('click-icon', 'edit', props.row)"
					/>
					<app-tooltip-button
						text="Eliminar"
						icon="delete"
						color="error"
						@click-icon="$emit('click-icon', 'delete', props.row)"
					/>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';

	export default {
		name: 'cost-centers-list',
		components: {
			appTable,
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
			currentPage: Number,
			lastPage: Number,
			rows: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>
