<template>
  <div>
		<div class="px-4 mt-4">
			<app-table
				selectable
				:rows="rows"
				:columns="columns"
				:input-search="false"
				:filter-columns="false"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.id }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.id }}</td>
				</template>
			</app-table>
		</div>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('cancel-modal')"
				@accept-button-clicked="$emit('save-process')"
			/>
		</section>
	</div>  
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import appTable from '@/components/shared/table/app-table';

function data() {
	return {
		rows: [],
		columns: [
			{ id: 1, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 2, name: 'Módulo', value: 'moduleName', visible: true, checked: true },
			{ id: 3, name: 'Ambito', value: 'ambit', visible: true, checked: true },
			{ id: 4, name: 'Tipo de notificación', value: 'typeNotification', visible: true, checked: true },
		],
	};
}

export default {
	name: 'new-process',
	components: {
		appTable,
		modalSidebarButton,
	},
	data,
};
</script>