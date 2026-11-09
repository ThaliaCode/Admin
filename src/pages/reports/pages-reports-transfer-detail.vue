<template>
	<div>
		<header-page
			name="transfer-detail"
			emit-excel
			:title="$route.meta.title"
			to-show
			@clean-product-filter="onCleanFilter"
			@emit-excel="emitExcel"
		/>
		<reports-filters
			:clean-filters="cleanFilters"
			show-code-product
			show-warehouse-origin
			show-warehouse-source
			@return-data="setData"
			@search-data="loadData"
			@valid-disabled="validDisabled"
		/>
		<reports-transfers-details-list
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@on-page="changePage"
		/>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import reportsFilters from '@/components/reports/reports-filters';
import reportsTransfersDetailsList from '@/components/reports/reports-transfers-details-list';
import { REPORT_TRANSFER_DETAIL } from '@/shared/reports';

function changePage(page) {
	this.currentPage = page;
	this.loadData(page);
}

async function emitExcel() {
	const params = {
		endDate: this.params.endDate,
		productId: this.body.productId || undefined,
		startDate: this.params.startDate,
		warehouseOriginId: this.body.warehouseOriginId || undefined,
		warehouseSourceId: this.body.warehouseSourceId || undefined,
	};
	this.onEmitExcel(REPORT_TRANSFER_DETAIL, 'reporte_de_transferencias_', params);
}

async function loadData(page = 1) {
	this.cleanFilters = false;
	if (this.disabled) {
		this.showGenericError('La fecha inicial no debe ser mayor a la final.');
	} else {
		this.params.page = page;
		const newBody = { ...this.body };
		const bodyKeys = Object.keys(newBody);
		bodyKeys.forEach((bk) => {
			if (!newBody[bk]) {
				delete newBody[bk];
			}
		});
		try {
			({ data: this.rows, headers: this.headers } = await this.$httpProductsSales.post(
				'transfers/products', newBody, { params: this.params }));
			this.rows = this.rows.map((row) => {
				const newRow = { ...row };
				newRow.deliveryUserInfo = row.deliveryUserInfo || {};
				return newRow;
			});
			this.lastPage = Number(this.headers['x-last-page']);
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}
}

function onCleanFilter() {
	this.cleanFilters = true;
}

function setData({ model, value }) {
	if (model === 'startDate' || model === 'endDate') {
		this.params[model] = value;
	} else {
		this.body[model] = value;
	}
}

function validDisabled(val) {
	this.disabled = val;
}

function data() {
	return {
		body: {},
		cleanFilters: false,
		columns: [
			{
				id: 1,
				checked: true,
				name: '# Tran',
				value: 'transferNumber',
				visible: true,
				tooltip: 'Número de Transferencia',
			},
			{
				id: 2,
				checked: true,
				name: 'Cód.',
				value: 'code',
				visible: true,
				tooltip: 'Código',
			},
			{
				id: 3,
				checked: true,
				name: 'Cód. Alterno',
				value: 'inlineAlternateCode',
				visible: true,
				tooltip: 'Código Alterno',
			},
			{
				id: 4,
				checked: true,
				name: 'Nombre',
				value: 'name',
				visible: true,
			},
			{
				id: 5,
				checked: true,
				name: 'T. Doc.',
				value: 'typeDocumentCode',
				visible: true,
				tooltip: 'Tipo de Documento',
			},
			{
				id: 6,
				checked: true,
				name: 'T. Origen',
				value: 'warehouseOriginName',
				visible: true,
				tooltip: 'Tienda Origen',
			},
			{
				id: 7,
				checked: true,
				name: 'T. Destino',
				value: 'warehouseSourceName',
				visible: true,
				tooltip: 'Tienda Destino',
			},
			{
				id: 8,
				checked: true,
				name: 'Emp. Rech.',
				value: 'employeeName',
				visible: true,
				tooltip: 'Empleado de Rechazo',
			},
			{
				id: 9,
				checked: true,
				name: '# Rech.',
				value: 'devolution',
				visible: true,
				tooltip: 'Número de Rechazos',
			},
			{
				id: 10,
				checked: true,
				name: 'Und.',
				value: 'unitCode',
				visible: true,
				tooltip: 'Unidad',
			},
			{
				id: 11,
				checked: true,
				name: 'Motivo',
				value: 'reason',
				visible: true,
				tooltip: 'Motivo de Rechazo',
			},
		],
		currentPage: 1,
		disabled: false,
		headers: {},
		lastPage: 0,
		params: {
			endData: null,
			page: 1,
			startDate: null,
		},
		rows: [],
	};
}

export default {
	name: 'report-transfer-detail',
	components: {
		headerPage,
		reportsFilters,
		reportsTransfersDetailsList,
	},
	data,
	methods: {
		changePage,
		emitExcel,
		loadData,
		onCleanFilter,
		setData,
		validDisabled,
	},
};
</script>

