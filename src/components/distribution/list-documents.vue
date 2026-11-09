<template>
	<v-card>
		<v-card-title class="modal-items-title">
			Seleccione el documento
		</v-card-title>
		<v-card-text>
			<div class="mx-3" v-if="isFlagUse" style="min-height: 1.4rem">
				<p class="text-warning">
					Si uno o mas documentos estan deshabilitados, no se podran
					seleccionar.
				</p>
			</div>
			<app-table
				class="mt-4"
				name="list-documents"
				selectable
				:no-select-all="false"
				:columns="columns"
				:input-search="false"
				:filter-columns="false"
				:rows="rows"
				:check-all-disabled="true"
				@row-is-selected="rowIsSelected"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="pa-2">
						{{ props.row.numberDocument }}
					</td>
					<td v-show="showRow(columns, 2)" class="pa-2">
						{{ props.row.warehouseName }}
					</td>
				</template>
			</app-table>
		</v-card-text>
		<v-card-actions>
			<v-layout row wrap justify-center>
				<v-flex xs3 text-xs-center>
					<v-btn
						color="error"
						class="btn-action white--text"
						@click="$emit('close-modal')"
					>
						Cancelar
					</v-btn>
				</v-flex>
				<v-flex xs3 text-xs-center>
					<v-btn
						color="primary"
						class="btn-action white--text"
						@click="$emit('send-data', dataSelected[0])"
						:disabled="!(dataSelected.length === 1)"
					>
						Aceptar
					</v-btn>
				</v-flex>
			</v-layout>
		</v-card-actions>
	</v-card>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import appTable from '@/components/shared/table/app-table';

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Nro. Documento',
				value: 'series',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Tienda',
				value: 'comments',
				visible: true,
				checked: true,
			},
		],
		dataSelected: [],
		rows: [],
		checkAllDisabled: false,
	};
}

async function created() {
	const typeDocuments = await this.getTypeDocuments('sales');
	this.rows = this.order.saleDocument.map((row) => {
		const newRow = { ...row };
		const code = typeDocuments.data.find(
			(d) => d.documentType.id === row.salTypeDocumentId
		).documentType.code;
		newRow.codeDocument = code;
		newRow.numberDocument = `${code} - ${row.documentNumber}`;
		return newRow;
	});
}

export default {
	name: 'list-documents',
	components: {
		appTable,
		modalSidebarButton,
	},
	created,
	props: {
		order: {
			type: Object,
		},
		type: {
			type: Number,
			default: 0,
		},
	},
	data,
	computed: {
		isFlagUse() {
			return this.rows.some((r) => r.flagUse === 1 || r.cancelUserId);
		},
	},
	methods: {
		rowIsSelected({ id, isSelected }) {
			if (isSelected) {
				this.dataSelected.push(this.rows.find((row) => row.id === id));
			} else {
				const index = this.dataSelected.findIndex((row) => row.id === id);
				this.dataSelected.splice(index, 1);
			}
		},
	},
};
</script>
<style>
.modal-items-title {
	background-color: rgba(195, 231, 232, 0.21);
	color: color(primary);
	font-weight: 600;
	padding: 13px 29px;
	text-transform: uppercase;
}

.text-warning {
	width: 100%;
	min-height: 1rem;
	font-size: 0.78rem;
	text-align: center;
	color: red;
}
</style>
