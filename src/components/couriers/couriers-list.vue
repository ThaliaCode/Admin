<template>
	<div>
		<div class="overflow-auto">
			<app-table
				name="couriers"
				:clean-search="cleanSearch"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="rows"
				@on-page="onPage"
				@on-search-event="onSearch"
				class="is-not-selectable"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.typePersonName }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.documentNumber }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.establishmentCode }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.platesInline }}</td>
					<td v-show="showRow(columns, 6)">
						<app-tooltip-button
							text="Editar"
							icon="edit"
							color="success"
							@click-icon="onEdit(props.row)"
						/>
						<app-tooltip-button
							text="Eliminar"
							icon="delete"
							color="error"
							@click-icon="onDelete(props.row)"
						/>
					</td>
				</template>
			</app-table>
		</div>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';

	function onDelete(row) {
		this.$emit('on-delete', row);
	}

	function onEdit(row) {
		this.$emit('on-edit', row);
	}

	function onPage(page) {
		this.$emit('on-page', page);
	}

	function onSearch(search) {
		this.$emit('on-search', search);
	}

	export default {
		name: 'couriers-list',
		components: {
			appTable,
		},
		props: {
			cleanSearch: {
				default: false,
				type: Boolean,
			},
			columns: {
				type: Array,
				default: () => [],
			},
			currentPage: {
				type: Number,
				default: 1,
			},
			lastPage: {
				default: 1,
				type: Number,
			},
			rows: {
				type: Array,
				default: () => [],
			},
		},
		methods: {
			onDelete,
			onEdit,
			onPage,
			onSearch,
		},
	};
</script>
