<template>
	<div class="pa-4">
		<app-table
			name="historic-import-table"
			:columns="columns"
			:rows="rowsHistory"
			:is-not-selectable="true"
			:hide-pagination="true"
			class="historic-table shadow-sm"
			:inputSearch="false"
		>
			<template slot="rows" slot-scope="props" v-if="columns.length">
				<td class="text-center font-weight-bold">
					{{ props.row.totalFiles || 0 }}
				</td>
				<td class="text-center">
					{{ props.row.importedFiles || 0 }}
				</td>
				<td class="text-center">
					{{ props.row.updatedFiles || 0 }}
				</td>
				<td>
					<div v-if="props.row.employeeInfo">
						<div class="font-weight-medium text-capitalize">
							{{
								props.row.employeeInfo.name
									? props.row.employeeInfo.name.toLowerCase()
									: '-'
							}}
						</div>
						<div class="caption grey--text">
							{{ props.row.employeeInfo.email }}
						</div>
					</div>
					<div v-else class="grey--text italic">-</div>
				</td>
				<td class="caption">
					{{ getDateUpdated(props.row) }}
				</td>
				<td class="text-center">
					<app-tooltip-button
						v-if="props.row.urlFile"
						text="Descargar Archivo"
						icon="cloud_download"
						color="primary"
						@click-icon="downloadFile(props.row.urlFile)"
					/>
					<span v-else class="caption grey--text">No disponible</span>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import { format } from 'date-fns';

export default {
	name: 'historic-import-documents',
	props: {
		rowsHistory: {
			type: Array,
			default: () => [],
		},
	},
	components: {
		appTable,
	},
	data() {
		return {
			columns: [
				{
					id: 1,
					name: 'Cant. Archivos',
					value: 'totalFiles',
					checked: true,
					visible: true,
				},
				{
					id: 2,
					name: 'Reg. Importados',
					value: 'importedFiles',
					checked: true,
					visible: true,
				},
				{
					id: 3,
					name: 'Reg. Actualizados',
					value: 'updatedFiles',
					checked: true,
					visible: true,
				},
				{ id: 4, name: 'Empleado', value: 'employee', checked: true, visible: true },
				{ id: 5, name: 'Fecha', value: 'date', checked: true, visible: true },
				{ id: 6, name: 'Acción', value: 'action', checked: true, visible: true },
			],
		};
	},
	methods: {
		downloadFile(url) {
			if (url) {
				window.open(url, '_blank');
			}
		},
		getDateUpdated(row) {
			const date = row?.employeeInfo?.dateUpdated;
			return date ? format(date, 'YYYY-MM-DD hh:mm') : '-';
		},
	},
};
</script>
