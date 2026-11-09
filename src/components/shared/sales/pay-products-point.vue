<template>
  <div>
	  <v-flex class="header-products-point">
		  Productos seleccionados para usar los puntos
	  </v-flex>
	  <v-flex xs12 mt-4 px-2>
			<app-table
				:check-all="checkAll"
				:columns="columns"
				:rows="rows"
				selectable
				:filterColumns="false"
				:last-page="lastPage"
				:current-page="currentPage"
				:items-total-quantity="totalItems"
				:items-quantity="totalItemsVisible"
				@on-search-event="$emit('search-event', $event)"
				@on-page="$emit('change-page', $event)"
				@row-is-selected="$emit('row-is-selected', $event)"
				@on-selected-all="$emit('all-selected', $event)"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row ? props.row.score : 0 }}</td>
				</template>
			</app-table>
			 <section class="modal-filter-footer">
			<modal-sidebar-button
				:img="false"
				success-text="Asignar"
				success-color="primary"
				:is-loading="isLoading"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="$emit('save-products-point')"
			/>
		</section>
	  </v-flex>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function totalItemsVisible() {
	return this.rows.length;
}

export default {
	name: 'pay-products-point',
	components: {
		appTable,
		modalSidebarButton,
	},
	computed: {
		totalItemsVisible,
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
		lastPage: {
			default: 1,
			type: Number,
		},
		currentPage: {
			type: Number,
			default: 1,
		},
		totalItems: {
			type: Number,
			default: 0,
		},
		checkAll: {
			type: Boolean,
			default: false,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style lang="scss" scoped>
.header-products {
	&-point {
		background-color: rgba(2, 151, 155, 0.1);
		color: map-get($colors, primary);
		font-size: map-get($sizes, small);
		padding: 11px 0 11px 26px;
	}
}
</style>