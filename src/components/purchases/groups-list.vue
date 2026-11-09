<template>
	<div>
		<div class="overflow-auto">
			<app-table name="groups"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="rows"
				@on-page="onPage"
				class="is-not-selectable"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 4)">
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

	function openEdit(row) {
		this.$emit('open-edit', row);
	}

	export default {
		name: 'groups-list',
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
			lastPage: {
				type: Number,
				default: 0,
			},
			rows: {
				type: Array,
				default: () => [],
			},
		},
		methods: {
			onDelete,
			onPage,
			openEdit,
		},
	};
</script>
