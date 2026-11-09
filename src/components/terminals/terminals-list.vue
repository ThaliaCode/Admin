<template>
	<div>
		<div class="overflow-auto mt-5">
			<app-table name="terminals"
				:clean-search="cleanSearch"
				:columns="columns"
				:current-page="currentPage"
				:rows="rows"
				@on-page="onPage"
				@on-search-event="onSearch"
				class="is-not-selectable"
			>
				<template slot="rows" slot-scope="props">
					<td
                        class="is-not-selectable"
                        v-show="showRow(columns, 1)">
                        {{ props.row.code }}
                    </td>
                    <td v-show="showRow(columns, 2)">{{ props.row.sunatCode }}</td>
                    <td v-show="showRow(columns, 3)">{{ props.row.name }}</td>
                    <td v-show="showRow(columns, 4)">{{ props.row.warehouse.name }}</td>
                    <td v-show="showRow(columns, 5)">{{ props.row.description }}</td>
                    <td v-show="showRow(columns, 6)">{{ props.row.printCode }}</td>
                    <td v-show="showRow(columns, 7)">
                        <app-tooltip-button
							text="Editar"
							icon="edit"
							color="success"
							@click-icon="openEdit(props.row)"
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

	function onPage(page) {
		this.$emit('on-page', page);
	}

	function onSearch(search) {
		this.$emit('on-search', search);
	}

	function openEdit(row) {
		this.$emit('open-edit', row);
	}

	export default {
		name: 'terminals-list',
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
			rows: {
				type: Array,
				default: () => [],
			},
		},
		methods: {
			onDelete,
			onPage,
			onSearch,
			openEdit,
		},
	};
</script>
