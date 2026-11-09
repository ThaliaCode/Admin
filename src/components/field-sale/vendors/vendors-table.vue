<template>
	<div>
		<div class="overflow-auto mt-3">
			<app-table
				name="vendors"
				:check-all="checkAll"
				:columns="columns"
				:current-page="currentPage"
				disabled-value="rowDisabled"
				:filter-columns="false"
				:input-search="true"
				:last-page="lastPage"
				:rows="rows"
				selectable
				:clean-search="cleanSearch"
				:items-quantity="rows.length"
				:items-total-quantity="itemsTotalQuantity"
				@on-page="$emit('on-page', $event)"
				@on-search-event="$emit('on-search', $event)"
				@row-is-selected="$emit('row-is-selected', $event)"
				@on-selected-all="$emit('on-selected-all', $event)"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.employeeCode }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.employeeName }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.employeeEmail }}</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.employeeDocNumber }}
					</td>
					<td v-show="showRow(columns, 5)">{{ props.row.warehousesText }}</td>
					<td v-show="showRow(columns, 6)">
						<span v-if="props.row.typeSeller === supervisor">
							<app-tooltip-button
								icon="check_circle"
								text="Supervisor"
								color="success"
							/>
						</span>
						<span v-else-if="props.row.fullnameSupervisor">
							{{ props.row.fullnameSupervisor }}
						</span>
					</td>
					<td v-show="showRow(columns, 7)">
						{{ props.row.settings.perimeterSiege ? 'Si' : 'No' }}
					</td>
					<td v-show="showRow(columns, 8)">{{ props.row.groupName }}</td>
					<td v-show="showRow(columns, 9)" class="min-width">
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
							@click-icon="$emit('edit-vendor', props.row)"
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
import TypeSeller from '@/shared/type-seller';

function data() {
	return {
		supervisor: TypeSeller.Supervisor,
	};
}

export default {
	name: 'vendors-table',
	components: {
		appTable,
	},
	data,
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
		cleanSearch: {
			type: Boolean,
			default: false,
		},
		itemsTotalQuantity: {
			default: 1,
			type: Number,
		},
	},
};
</script>

<style lang="scss" scoped>
.min-width {
	@media (max-width: 1600px) {
		width: 115px;
	}
}
</style>
