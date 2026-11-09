<template>
	<div>
		<app-table
			name="table-add-seller"
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			:items-quantity="rows.length"
			:items-total-quantity="itemsTotalQuantity"
			@on-page="$emit('on-page', $event)"
			@on-search-event="$emit('on-search', $event)"
			class="is-not-selectable"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.name }}
				</td>
				<td v-show="showRow(columns, 2)">
					<v-tooltip top>
						<span slot="activator">
							{{ props.row.sellersInline | limitTo(18) }}
						</span>
						<span>{{ props.row.sellersInline }}</span>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.dateRange }}
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.daysInline ? props.row.daysInline : '-' }}
				</td>
				<td v-show="showRow(columns, 5)">
					{{ props.row.customers }}
				</td>
				<td v-show="showRow(columns, 6)">
					{{ props.row.zonesCustomers }}
				</td>
				<td v-show="showRow(columns, 7)">
					{{ props.row.statusName }}
				</td>
				<td v-show="showRow(columns, 8)">
					<app-tooltip-button
						class="mr-2"
						text="Asignar Vendedor"
						img="/static/img/add-seller.svg"
						@click-icon="$emit('assign-vendor', props.row)"
					/>
					<app-tooltip-button
						class="mr-2"
						text="Historial de ruta"
						icon="history"
						color="primary"
						@click-icon="goToHistoryList(props.row.id)"
					/>
					<app-tooltip-button
						class="mr-2"
						text="Editar"
						img="/static/img/edit.svg"
						@click-icon="$emit('edit-route', props.row)"
					/>
					<app-tooltip-button
						text="Eliminar"
						img="/static/img/delete.svg"
						@click-icon="$emit('delete-route', props.row)"
					/>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import RouteStatus from '@/shared/route-status';

function saveModal() {
	this.$emit('save-modal');
}

function closeModal() {
	this.$emit('close-modal');
}

function data() {
	return {
		routeFinished: RouteStatus.Finished,
		routeStarted: RouteStatus.Started,
	};
}

export default {
	name: 'routes-list',
	components: {
		appTable,
	},
	data,
	methods: {
		closeModal,
		saveModal,
		goToHistoryList(id) {
			const params = {
				id,
			};
			this.$router.push({ name: 'route-history', params });
		},
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
		itemsTotalQuantity: Number,
	},
};
</script>
