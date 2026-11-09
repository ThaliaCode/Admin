<template>
	<div>
		<v-layout wrap px-2 py-3 xs12 md10>
			<v-flex xs12 md12>
				<app-table
					:check-all="checkAll"
					:columns="columns"
					:current-page="currentPage"
					:filter-columns="false"
					:last-page="lastPage"
					:rows="rows"
					selectable
					@on-page="$emit('on-page', $event)"
					@on-search-event="$emit('on-search', $event)"
					@row-is-selected="$emit('on-row-selected', $event)"
					@on-selected-all="$emit('on-selected-all', $event)"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">{{ props.row.code }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.description }}</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('save')"
			/>
		</section>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function data() {
	return {
		columns: [
			{ id: 1, name: 'Orden', value: 'order', visible: true, checked: true },
			{ id: 2, name: 'Nombre de Producto', value: 'name-product', visible: true, checked: true },
			{ id: 3, name: 'Descripción', value: 'description', visible: true, checked: true },
		],
	};
}

export default {
	name: 'related-products',
	data,
	components: {
		modalSidebarButton,
		appTable,
	},
	props: {
		checkAll: {
			default: false,
			type: Boolean,
		},
		currentPage: {
			default: 1,
			type: Number,
		},
		lastPage: {
			default: 0,
			type: Number,
		},
		id: [Number, String],
		rows: {
			default: () => [],
			type: Array,
		},
	},
};
</script>
