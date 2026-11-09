<template>
	<div>
		<header-page :title="$route.meta.title" :limit-title="80"></header-page>
		<app-actions
			:resource-uri="$route.name"
			:value-disabled="actionsDisabled"
			@run-action="runAction"
		/>
		<daily-summary-create-filter
			:date="params.startDate"
			:com-subsidiary-id="params.comSubsidiaryId"
			:currency="params.currency"
			:currencies="currencies"
			:subsidiaries="subsidiaries"
			@set-date="onSetDate"
			@set-data="onSetData"
			@on-filter="loadData"
		/>
		<daily-summary-create-list
			:current-page="currentPage"
			:last-page="lastPage"
			:clean-search="cleanSearch"
			:columns="columns"
			:rows="rows"
			:check-all="checkAll"
			@on-search="onSearchData"
			@all-is-selected="allIsSelected"
			@row-is-selected="rowIsSelected"
			@on-page="onPage"
		/>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hidden
				success-color="primary"
				success-text="Atrás"
				:img="false"
				@accept-button-clicked="cancel"
			/>
		</section>
		<action-sidebar
			:width="action.width"
			v-model="action.open"
			:code-action="action.code"
			:title="action.title"
			:active="action.active"
			@close-modal="cancelModal"
		>
			<generate-summary
				:loading="loading"
				v-if="action.code === 'generate-summary'"
				@remove-document="removeDocument"
				@send-documents="sendDocuments"
				@cancel-modal="cancelModal"
				:rows="dataSelected"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import dailySummaryCreateFilter from '@/components/daily-summary/daily-summary-create-filter';
import dailySummaryCreateList from '@/components/daily-summary/daily-summary-create-list';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import actionSidebar from '@/components/shared/action-sidebar';
import generateSummary from '@/components/sales/generate-summary';
import { format } from 'date-fns';

const { exactDate } = helper;

function created() {
	const terminalIndex = this.columns.findIndex((i) => i.value === 'terminalId');
	this.columns[terminalIndex].name = this.labelTerminal();
	this.columns[terminalIndex].tooltip = this.isPeru
		? 'Nombre de Punto de Venta'
		: 'Nombre de Terminal';
	const sucursalIndex = this.columns.findIndex(
		(h) => h.value === 'sucursalName'
	);
	this.columns[sucursalIndex].name = this.labelSucursal();
	this.columns[sucursalIndex].tooltip = `Nombre de ${this.labelSucursal()}`;
	this.params.currency = this.$userInfo.company.currency;
	this.params.startDate = exactDate(this.$today(), 'YYYY-MM-DD');
	this.loadResources();
}

function cancel() {
	this.$router.go(-1);
}

function close() {
	this.goTo('daily-summary');
}

function disabled() {
	return this.rows.length === 0;
}

async function loadData() {
	this.params.endDate = this.params.startDate;
	this.params.page = this.currentPage;
	const params = this.params;
	try {
		const { data: rows, headers } = await this.$httpSalesRead.get(
			'sale-documents',
			{ params }
		);
		this.rows = rows.map((row) => {
			const newRow = { ...row };
			newRow.isSelected = false;
			newRow.customerData =
				row.customer && row.customer.typePerson
					? row.customer.typePerson.fullName
					: '';
			newRow.state = row.state || {};
			newRow.statusTaxName = row.statusTaxName || {};
			newRow.typeDocument = row.typeDocument || {};
			newRow.debtAmount =
				row.debtAmount || Number(row.amount) - Number(row.dueAmount);
			newRow.docNumber = `${row.serie}-${row.number}`;
			newRow.typeDocumentName = row.typeDocument ? row.typeDocument.name : '';
			newRow.typeDocumentCode = row.typeDocument ? row.typeDocument.code : '';
			newRow.statusName = row.state ? row.state.name : '';
			newRow.typePaymentName = row.payment ? row.payment.name : '';
			return newRow;
		});
		this.lastPage = Number(headers['x-last-page']);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadResources() {
	const requests = [this.getCurrencies(), this.$httpSales.get('subsidiaries')];
	[{ data: this.currencies }, { data: this.subsidiaries }] = await Promise.all(
		requests
	);
	this.params.comSubsidiaryId = this.subsidiaries[0].id;
	this.loadData();
}

function onSearchData(search) {
	this.params.search = search ? search.trim() : null;
	this.loadData();
}

function onSetData({ model, value }) {
	this.params[model] = value;
}

function onSetDate(value) {
	this.params.startDate = format(value, 'YYYY-MM-DD');
}

function allIsSelected(checked) {
	this.checkAll = checked;
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = checked;
		return newRow;
	});
	this.dataSelected = this.rows.filter((r) => r.isSelected);
}

function rowIsSelected() {
	this.checkAll = this.rows.every((r) => r.isSelected);
	this.dataSelected = this.rows.filter((r) => r.isSelected);
}

function runAction({ code }) {
	if (code === 'generate-summary') {
		this.action.title = 'Generar Resumen';
		this.action.active = true;
		this.action.code = code;
		this.action.open = true;
	}
}

function actionsDisabled() {
	const disabledAction = this.dataSelected.length === 0;
	return [{ code: 'generate-summary', disabled: disabledAction }];
}

function removeDocument({ id }) {
	const saleIndex = this.dataSelected.findIndex((s) => s.id === id);
	const saleIndexTable = this.rows.findIndex((s) => s.id === id);
	this.dataSelected.splice(saleIndex, 1);
	if (saleIndexTable > -1) {
		this.rows[saleIndexTable].isSelected = false;
	}
}

async function sendDocuments(documents) {
	this.loading = true;
	const body = {
		date: this.params.startDate,
		documentsRelated: documents.map((r) => r.id),
		currency: this.params.currency,
		commentary: 'Resumen de Boletas Enviado',
	};
	try {
		await this.$httpSales.post('ballot-summary', body);
		this.showNotification(
			'El resumen diario de boletas ha sido enviado correctamente.'
		);
		this.close();
	} catch (err) {
		console.error(err);
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'DOCUMENTS_MUST_NOT_BE_CANCELED') {
				this.showGenericError(
					'Los documentos seleccionados no pueden ser enviados.'
				);
			} else if (err.data.message === 'DOCUMENTS_MUST_HAVE_SAME_EMPLOYEE') {
				this.showGenericError(
					'Algunas de las boletas mostradas pertenecen a otro usuario.'
				);
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function cancelModal() {
	this.action.code = null;
	this.action.open = false;
	this.active.active = false;
}

function onPage(page) {
	this.currentPage = page;
	this.loadData();
}

function data() {
	return {
		cleanSearch: false,
		columns: [
			{
				id: 1,
				name: 'Empresa',
				value: 'sucursalName',
				visible: true,
				checked: true,
				tooltip: 'Nombre de la Empresa',
			},
			{
				id: 2,
				name: 'Terminal',
				value: 'terminalId',
				visible: true,
				checked: true,
				tooltip: 'Nombre de Terminal',
			},
			{
				id: 3,
				name: 'Cliente',
				value: 'customerData',
				visible: true,
				checked: true,
				tooltip: 'Nombre de Cliente',
			},
			{
				id: 4,
				name: '# DOC',
				value: 'docNumber',
				visible: true,
				checked: true,
				tooltip: 'Número de Documento',
			},
			{
				id: 5,
				name: 'F. Creación',
				value: 'createdAt',
				visible: true,
				checked: true,
				tooltip: 'Fecha de Creación',
			},
			{
				id: 6,
				name: 'T. Doc',
				value: 'typeDocumentName',
				visible: true,
				checked: true,
				tooltip: 'Tipo de Documento',
			},
			{
				id: 7,
				name: 'E. Desp.',
				value: 'statusName',
				visible: true,
				checked: true,
				tooltip: 'Estado de Despacho',
			},
			{
				id: 8,
				name: 'E. Pago',
				value: 'paymentStateName',
				visible: true,
				checked: true,
				tooltip: 'Estado de Pago',
			},
			{
				id: 9,
				name: 'M. Pago',
				value: 'typePaymentName',
				visible: true,
				checked: true,
				tooltip: 'Modo de Pago',
			},
			{
				id: 10,
				name: 'T. Pago',
				value: 'typePaymentNames',
				visible: true,
				checked: true,
				tooltip: 'Tipo de Pago',
			},
			{
				id: 11,
				name: 'Total',
				value: 'amount',
				visible: true,
				checked: true,
				tooltip: 'Total de Venta',
			},
			{
				id: 12,
				name: 'T. Deuda',
				value: 'debtAmount',
				visible: true,
				checked: true,
				tooltip: 'Total de Deuda',
			},
			{
				id: 13,
				name: 'Sunat',
				value: 'statusTaxInfo',
				visible: true,
				checked: true,
				tooltip: 'Estado de Sunat',
			},
		],
		currentPage: 1,
		currencies: [],
		lastPage: 0,
		loading: false,
		params: {
			limit: 250,
			comSubsidiaryId: null,
			currency: null,
			endDate: null,
			flagSummaryBallot: 1,
			startDate: null,
			typeDocumentIds: '1,5',
			statusTaxIds: '1,5,6',
		},
		rows: [],
		subsidiaries: [],
		dataSelected: [],
		checkAll: false,
		action: {
			active: false,
			code: null,
			open: false,
			title: '#',
			width: 800,
		},
	};
}

export default {
	name: 'pages-daily-summary-create',
	components: {
		appActions,
		dailySummaryCreateFilter,
		dailySummaryCreateList,
		headerPage,
		modalSidebarButton,
		actionSidebar,
		generateSummary,
	},
	computed: {
		disabled,
		actionsDisabled,
	},
	created,
	data,
	methods: {
		cancel,
		close,
		loadData,
		loadResources,
		onSearchData,
		onSetData,
		onSetDate,
		onPage,
		allIsSelected,
		rowIsSelected,
		runAction,
		removeDocument,
		sendDocuments,
		cancelModal,
	},
};
</script>
