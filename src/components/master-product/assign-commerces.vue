<template>
	<v-layout row mt-5>
		<v-flex xs12>
			<app-table
				:check-all="checkAll"
				name="assign-commerces"
				:rows="rows"
				:columns="columns"
				selectable
				:input-search="false"
				@on-selected-all="selectedAll"
				@row-is-selected="selectedRow"
			>
				<template slot="rows" slot-scope="props">
					<td>{{ props.row.name }}</td>
					<td>{{ props.row.code }}</td>
				</template>
			</app-table>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				success-text="Asignar"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="assignCommerce"
			/>
		</section>
	</v-layout>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function assignCommerce() {
	this.$emit('assign-commerce', this.dataSelected);
}

function selectedAll(checked) {
	this.$emit('selected-all', checked);
}

function selectedRow(row) {
	this.$emit('selected-row', row);
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Nombre', visible: true, checked: true },
			{ id: 2, name: 'Codigo', visible: true, checked: true },
		],
	};
}

export default {
	name: 'assign-commerces',
	data,
	components: {
		appTable,
		modalSidebarButton,
	},
	props: {
		dataSelected: {
			tpye: Array,
			default: () => [],
		},
		rows: {
			type: Array,
			default: () => [],
		},
		checkAll: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		assignCommerce,
		selectedAll,
		selectedRow,
	},
};
</script>