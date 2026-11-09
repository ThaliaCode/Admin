<template>
	<div>
		<div class="overflow-auto mt-3">
			<app-table
				name="distributor"
				:check-all="checkAll"
				:columns="columns"
				:current-page="currentPage"
				disabled-value="rowDisabled"
				:filter-columns="false"
				:input-search="true"
				:last-page="lastPage"
				:rows="rows"
				:items-total-quantity="itemQuantity"
				:items-quantity="rows.length"
				selectable
				@on-page="$emit('on-page', $event)"
				@on-search-event="$emit('on-search', $event)"
				@row-is-selected="$emit('row-is-selected', $event)"
				@on-selected-all="$emit('on-selected-all', $event)"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.documentNumber }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.email }}</td>
					<td v-show="showRow(columns, 5)">
						{{ props.row.vehicle ? props.row.vehicle.plate : null }}
					</td>
					<td v-show="showRow(columns, 6)">
						{{ props.row.group ? props.row.group.name : null }}
					</td>
					<td v-show="showRow(columns, 7)">{{ props.row.warehousesName }}</td>
					<td v-show="showRow(columns, 8)">
						<app-tooltip-button
							text="Ver Detalle"
							icon="remove_red_eye"
							color="primary"
							@click-icon="$emit('see-detail', props.row)"
						/>
						<app-tooltip-button
							text="Editar"
							icon="edit"
							color="success"
							@click-icon="$emit('edit-distributor', props.row)"
						/>
						<app-tooltip-button
							text="Eliminar"
							icon="delete"
							color="error"
							@click-icon="$emit('delete-vendors', props.row)"
						/>
					</td>
				</template>
			</app-table>
		</div>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

export default {
	name: 'distributor-table',
	components: {
		appTable,
	},
	props: {
		checkAll: {
			type: Boolean,
			default: false,
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
		itemQuantity: {
			default: 0,
			type: Number,
		},
	},
};
</script>
