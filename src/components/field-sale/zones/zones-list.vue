<template>
	<div>
		<app-table
			name="zones"
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
					{{ props.row.name }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.address }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.area }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.customersQuantity }}</td>
				<td v-show="showRow(columns, 5)">
					<app-tooltip-button
						class="mr-2"
						text="Rutas"
						img="/static/img/route.svg"
						@click-icon="$emit('go-to-routes', props.row)"
					/>
					<app-tooltip-button
						class="mr-2"
						text="Editar"
						img="/static/img/edit.svg"
						@click-icon="$emit('edit-zone', props.row)"
					/>
					<app-tooltip-button
						text="Eliminar"
						img="/static/img/delete.svg"
						@click-icon="$emit('delete-zone', props.row)"
					/>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';

	export default {
		name: 'zones-list',
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

<style lang="scss" scoped>

</style>