<template>
  <div class="pt-4 accum-point">
		<v-flex xs12 px-2>
			<app-table
				name="table-acum-points"
				:columns="columns"
				:rows="rows"
				:current-page="currentPage"
				:last-page="lastPage"
				:filter-columns="false"
				@on-search-event="$emit('search-point', $event)"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
				</template>
			</app-table>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				success-text="Asignar"
				success-color="primary"
				@accept-button-clicked="$emit('save-accum')"
				@cancel-button-clicked="$emit('cancel-modal-accum')"
			/>
		</section>
  </div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function data() {
	return {
		currentPage: 1,
		lastPage: 0,
	};
}

export default {
	name: 'accum-points',
	data,
	components: {
		appTable,
		modalSidebarButton,
	},
	props: {
		columns: {
			type: Array,
			default: () => [],
		},
		rows: {
			type: Array,
			default: () => [],
		},
	},
};
</script>