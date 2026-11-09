<template>
  <div>
	<header-page
		:title="$route.meta.title"
	/>
	<v-layout align-end px-2 pt-4>
		<v-flex xs2 px-3>
			<app-date-select
				:date-formatted="params.startDate"
				label="Fecha Inicial"
				model="startDate"
				@input="getDate"
			/>
		</v-flex>
		<v-flex xs2 ml-2>
			<app-date-select
				:date-formatted="params.endDate"
				label="Fecha Final"
				model="endDate"
				@input="getDate"
			/>
		</v-flex>
		<v-flex xs1 ml-2>
			<v-btn
				:disabled="loadingButton"
				color="primary"
				class="btn-action btn-action-block"
				@click="loadKardexFix"
			>
				Buscar
			</v-btn>
		</v-flex>
	</v-layout>
	<v-layout mt-4>
		<v-flex xs12>
			<app-table
				:columns="columns"
				:rows="rows"
				:last-page="lastPage"
				:current-page="currentPage"
				:filter-columns="false"
				:input-search="false"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.transferId }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.createdAt | formatDate }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.hash }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.totalDuplicate }}</td>
					<td v-show="showRow(columns, 5)">
						<app-tooltip-button
							color="primary"
							icon="settings_backup_restore"
							text="Solucionar Duplicidad"
							:disabled="!props.row.totalDuplicate > 0"
							@click-icon="solutionDuplicate(props.row)"
						></app-tooltip-button>
					</td>
				</template>
			</app-table>
		</v-flex>
	</v-layout>
	<v-dialog
		v-model="showDialog"
		persistent
		max-width="400px"
	>
		<modal-items
			:show-regular="false"
			title="Solucionar Duplicidad"
			name-cancel="Cerrar"
			v-if="showDialog"
			show-slot
			@close-modal="cancelModal"
		>
			<div class="px-3 pt-2 pb-2">
				<p>Total Registro Kardex: {{ totalRegisterKardexDelete }} </p>
				<p>Registros: {{ kardexIds }} </p>
				<p>Comentario: {{ comment }} </p>
			</div>
		</modal-items>
	</v-dialog>
	</div>
</template>

<script>
import { format, subMonths } from 'date-fns';
import appDateSelect from '@/components/shared/app-date-select';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalItems from '@/components/shared/modal-items';

const { exactDate } = helper;

function created() {
	this.params.startDate = format(subMonths(this.$today(), 1), 'YYYY-MM-DD');
	this.params.endDate = exactDate(this.$today(), 'YYYY-MM-DD');
	this.loadKardexFix();
}

async function loadKardexFix() {
	this.loadingButton = true;
	const params = { ...this.params };
	try {
		const response = await this.$httpProducts.get('transfers-fix', { params });
		this.lastPage = Number(response.headers['x-last-page']);
		this.rows = response.data;
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loadingButton = false;
	}
}

function getDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

async function solutionDuplicate({ hash, totalDuplicate }) {
	const body = {
		hash,
		totalDuplicate,
	};
	try {
		const response = await this.$httpProducts.patch('transfers-fix', body);
		this.showNotification('Se realizo la acción correctamente');
		this.showDialog = true;
		this.totalRegisterKardexDelete = response.data.totalRegisterKardexDelete;
		this.date = response.data.createdAt;
		this.kardexIds = response.data.kardexIds;
		this.comment = response.data.comment;
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Transferencia', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Fecha', value: 'code', visible: true, checked: true },
			{ id: 3, name: 'Hash', value: 'code', visible: true, checked: true },
			{ id: 4, name: 'Total Duplicado', value: 'code', visible: true, checked: true },
			{ id: 5, name: 'Acciones', value: 'code', visible: true, checked: true },
		],
		comment: null,
		currentPage: 1,
		data: null,
		lastPage: 0,
		loadingButton: false,
		rows: [],
		params: {
			endDate: null,
			startDate: null,
		},
		showDialog: false,
		kardexIds: null,
		totalRegisterKardexDelete: null,
	};
}

function cancelModal() {
	this.showDialog = false;
}

export default {
	name: 'page-kardex-fix',
	created,
	data,
	components: {
		appDateSelect,
		appTable,
		headerPage,
		modalItems,
	},
	methods: {
		cancelModal,
		getDate,
		loadKardexFix,
		solutionDuplicate,
	},
};
</script>

<style>

</style>