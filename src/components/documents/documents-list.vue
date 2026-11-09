<template>
	<div class="overflow-auto mt-4">
		<app-table
			class="is-not-selectable"
			:columns="columns"
			:current-page="currentPage"
			:filter-columns="false"
			:input-search="false"
			:last-page="lastPage"
			:rows="rows"
			:selectable="false"
			:filterColumns="true"
			@on-page="onPage"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.filename }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.statusName }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.email }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.createdAt | formatDate }}</td>
				<td class="description" v-show="showRow(columns, 5)">
					<span v-html="props.row.comment.split('/').join('<br>')"></span>
				</td>
				<td v-show="showRow(columns, 6)">
					<span class="mr-2">
						Descargar
					</span>
					<app-tooltip-button
						color="primary"
						icon="cloud_download"
						text="Descargar Documento"
						@click-icon="openFile(props.row)"
					>
					</app-tooltip-button>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Nombre de Archivo',
				value: 'fileName',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Estado',
				value: 'status',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Usuario',
				value: 'email',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Fecha',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Descripción',
				visible: false,
				checked: false,
			},
			{
				id: 6,
				name: 'Acciones',
				visible: true,
				checked: true,
			},
		],
		currentPage: 1,
	};
}

function onPage($event) {
	this.currentPage = $event;
	this.$emit('on-page', $event);
}

function openFile({ status, urlFile }) {
	if (status === 2) {
		window.open(urlFile, true);
	} else {
		this.showNotification('El documento aún no ha sido generado', 'info');
	}
}

export default {
	name: 'documents-list',
	components: {
		appTable,
	},
	data,
	props: {
		rows: {
			type: Array,
			default: () => [],
		},
		lastPage: {
			type: Number,
			default: 0,
		},
	},
	methods: {
		onPage,
		openFile,
	},
};
</script>
<style>
.description{
	text-align: left !important;
    padding: 10px !important;
}
</style>
