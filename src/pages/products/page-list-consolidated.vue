<template>
	<div>
		<header-page :title="$route.meta.title" />
		<v-flex mt-5 ml-4>
			<app-table
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:items-quantity="data.length"
				:items-total-quantity="itemQuantity"
				:rows="data"
				class="is-not-selectable"
				@on-search-event="onSearch"
				@on-page="changePage"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">
						{{ props.row.consolidationDate | exactDate('DD-MM-YYYY HH:mm:ss', true) }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.warehouse.warehouseSourceName }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.responsibleName }}</td>
					<td v-show="showRow(columns, 4)">
						<app-tooltip-button
							icon="remove_red_eye"
							text="Ver Transferencia"
							color="primary"
							size="20"
							@click-icon="viewDetail(props.row)"
						/>
						<app-tooltip-button
							class="ml-2"
							img="/static/img/excel.svg"
							text="Descargar Transferencia"
							size="20"
							color="blue"
							@click-icon="downloadReport(props.row, 'excel')"
						/>
						<app-tooltip-button
							class="ml-2"
							icon="picture_as_pdf"
							text="Descargar Transferencia"
							size="20"
							color="primary"
							@click-icon="downloadReport(props.row, 'pdf')"
						/>
					</td>
				</template>
			</app-table>
		</v-flex>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import appTooltipButton from '@/components/shared/app-tooltip-button';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import { format } from 'date-fns';

function created() {
	this.loadConsolidated();
}

async function loadConsolidated() {
	const params = { ...this.params };
	try {
		const { data: response, headers } = await this.$httpProducts.get(
			'transfers/consolidation',
			{ params }
		);
		this.data = response.map((row) => {
			const newRow = { ...row };
			newRow.responsibleName =
				row.responsible && row.responsible.userCreate
					? `${row.responsible.userCreate.name} ${row.responsible.userCreate.lastname}`
					: '';
			return newRow;
		});
		this.lastPage = Number(headers['x-last-page']);
		this.itemQuantity = Number(headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

function viewDetail({ id }) {
	const params = {
		idConsolidated: id,
	};
	const query = {
		showDetail: true,
	};
	this.goTo('pages-consolidated-transfer', { params, query });
}

async function downloadReport({ id, warehouseOriginId }, type) {
	const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
	const { name, lastname } = this.$userInfo;
	const typeReport = type === 'excel' ? 'xlsx' : 'pdf';
	const warehouses = helper.getLocalData('warehouses') || [];
	const originWarehouse = warehouses.find((w) => Number(w.id) === Number(warehouseOriginId));
	const warehouseName = originWarehouse ? originWarehouse.name : '';
	const responsibleSegment = warehouseName
		? warehouseName.trim().replace(/\s+/g, '_')
		: '';
	const documentData = {
		filename: `Reporte_consolidacion_de_transferencia_${typeReport}_${name}_${responsibleSegment}_${now}`,
		extension: type === 'excel' ? 'xlsx' : 'pdf',
		params: {
			idConsolidation: id,
		},
		comment: `Reporte_consolidacion_de_transferencia_${typeReport} generado por ${name} ${lastname}`,
	};
	const typeUrl =
		type === 'excel' ? 'consolidation-transaction-xlsx' : 'consolidation-transaction-pdf';
	try {
		await this.$httpReports.post(`documents/${typeUrl}`, documentData);
		this.notificationReport('reporte de consolidación');
	} catch (error) {
		this.showGenericError();
	}
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadConsolidated();
}

function changePage(page) {
	this.currentPage = page;
	this.params.page = page;
	this.loadConsolidated();
}

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Fecha de Registro',
				value: 'dateRegister',
				visible: true,
				checked: true,
			},
			{ id: 2, name: 'Almacén Solicitante', value: 'warehouseName', visible: true, checked: true },
			{ id: 3, name: 'Responsable', value: 'employee', visible: true, checked: true },
			{ id: 4, name: 'Acciones', value: 'actions', visible: true, checked: true },
		],
		currentPage: 0,
		itemQuantity: 0,
		params: {
			limit: 20,
			page: 1,
			search: null,
		},
		lastPage: 0,
		data: [],
	};
}

export default {
	name: 'page-list-consolidated',
	created,
	data,
	components: {
		appTable,
		appTooltipButton,
		headerPage,
	},
	methods: {
		changePage,
		downloadReport,
		loadConsolidated,
		onSearch,
		viewDetail,
	},
};
</script>
