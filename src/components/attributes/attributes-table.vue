<template>
	<div>
		<app-table
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			name="attributes"
			:rows="rows"
			@on-page="$emit('on-page', $event)"
			@on-search-event="$emit('on-search', $event)"
		>
			<template slot="rows" slot-scope="props">
				<td
					class="is-not-selectable"
					v-show="showRow(columns, 1)"
				>
					{{ props.row.code }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.typeName }}</td>
				<td v-show="showRow(columns, 4)">
					<app-tooltip-button
						color="success"
						icon="edit"
						text="Editar"
						@click-icon="$emit('on-click', { action: 'edit', row: props.row })"
					></app-tooltip-button>
					<app-tooltip-button
						color="error"
						icon="delete"
						text="Eliminar"
						@click-icon="$emit('on-click', { action: 'delete', row: props.row })"
					></app-tooltip-button>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';

	export default {
		name: 'attributes-table',
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

</style>