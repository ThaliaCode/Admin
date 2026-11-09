<template>
	<div>
		<header-page
			:title="$route.meta.title"
			to-show
			:show-excel="false"
			:show-clean="false"
		></header-page>
		<app-actions
			v-if="dailyRoute || cancelRoute"
			:resource-uri="$route.name"
			:value-disabled="valueDisabled"
			@run-action="runAction"
		/>
		<general-filter class="layout wrap align-end px-4 mt-3">
			<v-flex xs12 sm3 md2 pr-4>
				<app-date-select
					label="Fecha Inicial"
					:date-formatted="startDate"
					model="startDate"
					@input="getDate"
				/>
			</v-flex>
			<v-flex xs12 sm3 md2 pr-4>
				<app-date-select
					label="Fecha Final"
					:date-formatted="endDate"
					model="endDate"
					@input="getDate"
				/>
			</v-flex>
			<v-flex xs12 sm3 pr-4>
				<app-select
					:item="params.comSubsidiaryId"
					item-text="rzSocial"
					item-value="id"
					:items="subsidiaries"
					:label="labelSucursal()"
					model="comSubsidiaryId"
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 sm3 md2>
				<v-btn
					class="btn-action btn-auto px-4 py-2"
					color="primary"
					:disabled="onLoading"
					@click="loadData(1)"
				>
					Buscar
				</v-btn>
			</v-flex>
		</general-filter>
		<daily-summary-list
			:check-all="checkAll"
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@all-is-selected="allIsSelected"
			@go-to-detail="goToDetail"
			@on-page="loadData"
			@row-is-selected="rowIsSelected"
			@open-sunat="openSunat"
			@close-modal="cancelModal"
		/>
		<action-sidebar
			v-model="action.open"
			:active="action.active"
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
		>
			<!-- <summary-sunat-detail
				v-if="action.code === 'SSD'"
				:summary="summary"
				@close="cancelModal"
			/> -->
			<sales-sunat-details
				:summary-code="$route.query.summaryCode"
				:sale="summary"
				:typeDocuments="typeDocuments"
				v-if="action.code === 'SSD'"
			></sales-sunat-details>
		</action-sidebar>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import appDateSelect from '@/components/shared/app-date-select';
import dailySummaryList from '@/components/daily-summary/daily-summary-list';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import TypeSummary from '@/shared/type-summary';
import actionSidebar from '@/components/shared/action-sidebar';
import summarySunatDetail from '@/components/sales/summary-sunat-detail';
import salesSunatDetails from '@/components/sales/sales-sunat-details';
import { format, subDays } from 'date-fns';

const { exactDate } = helper;

function created() {
	this.dailyRoute = this.$route.name === 'daily-summary';
	this.cancelRoute = this.$route.name === 'cancel-summary';
	this.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.endDate = format(this.$today(), 'YYYY-MM-DD');
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = format(this.$today(), 'YYYY-MM-DD');
	this.loadExtra();
	this.loadData();
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

function disabled() {
	return this.dataSelectedEmpty || this.loading;
}

function dataSelectedEmpty() {
	return this.dataSelected.length === 0;
}

function goToDetail({
	id,
	numericalIdentification,
	emissionDate,
	statusTax,
	typeSummary,
}) {
	const name =
		this.$route.name === 'cancel-summary'
			? 'cancel-summary-detail'
			: 'daily-summary-detail';
	const params =
		this.$route.name === 'cancel-summary'
			? { summaryUnsubscribeId: id }
			: { ballotSummaryId: id };
	const query =
		this.$route.name === 'cancel-summary'
			? {
					summaryUnsubscribeCode: numericalIdentification,
					summaryUnsubscribeDate: exactDate(emissionDate, 'DD-MM-YYYY'),
			  }
			: {
					ballotSummaryCode: numericalIdentification,
					ballotSummaryDate: exactDate(emissionDate, 'DD-MM-YYYY'),
					statusTax,
			  };
	query.summaryCode = typeSummary === TypeSummary.Ballot ? 'RC' : 'RA';
	this.goTo(name, { params, query });
}

async function loadData(page = 1) {
	this.onLoading = true;
	this.currentPage = page;
	this.params.page = this.currentPage;
	const url = this.dailyRoute ? 'ballot-summary' : 'summary-unsubscribe';
	const params = this.params;
	try {
		const { data: response, headers } = await this.$httpSales.get(url, { params });
		this.rows = response.map((row) => {
			const newRow = { ...row };
			newRow.isSelected = false;
			newRow.statusTaxName = row.statusTaxName || {};
			newRow.createdAtSub = format(new Date(newRow.createdAt), 'YYYY-MM-DD');
			return newRow;
		});
		this.dataSelected = [];
		this.lastPage = Number(headers['x-last-page']);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.onLoading = false;
	}
}

async function loadExtra() {
	try {
		const request = [
			this.$httpSales.get('subsidiaries'),
			this.$httpSales.get('type-documents'),
		];
		const [subsidiaries, typeDocuments] = await Promise.all(request);
		this.subsidiaries = subsidiaries.data;
		this.typeDocuments = typeDocuments.data.filter((t) => t.code !== 'COT');
		if (this.subsidiaries.length === 1) {
			this.params.comSubsidiaryId = this.subsidiaries[0].id;
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function rowIsSelected() {
	this.checkAll = this.rows.every((r) => r.isSelected);
	this.dataSelected = this.rows.filter((r) => r.isSelected);
}

function runAction({ code }) {
	if (code === 'generate-summary') {
		this.goTo('daily-summary-create');
	} else if (code === 'send-summary') {
		const invalid = this.dataSelected.some((ds) => ds.statusTax === 3);
		if (invalid) {
			this.showGenericError(
				'Uno o más de los registros seleccionados ya ha sido enviado, quitar la selección y volver a intentar'
			);
		} else {
			this.sendSummaries();
		}
	}
}

async function sendSummaries() {
	this.loading = true;
	const body = {
		ids: this.dataSelected.map((ds) => ds.id),
	};
	if (!this.dailyRoute) {
		body.typeSummary = TypeSummary.Cancel;
	}
	try {
		await this.$httpSales.post('facturacion-resumen', body);
		this.showNotification('Los registros seleccionados han sido enviados correctamente.');
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'SUBSIDIARY_TAXES_ERROR') {
				this.showGenericError(
					`Ocurrió un error en la configuración de impuestos de la ${this.labelSucursal()}.`
				);
			} else if (err.data.message === 'DOCUMENTS_WAS_ALREADY_INFORMED') {
				this.showGenericError('Los documentos ya han sido informados.');
			}
		}
	} finally {
		this.loading = false;
	}
}

function setData({ model, value }) {
	this.params[model] = value;
}

function watchRoute(routeValue) {
	if (routeValue) {
		this.dailyRoute = routeValue.name === 'daily-summary';
		this.cancelRoute = routeValue.name === 'cancel-summary';
		this.loadData();
	}
}

function openModal(row) {
	const title = row.numericalIdentification.slice(3);
	this.summary = { ...row };
	this.action.code = 'SSD';
	this.action.title = `#${title}`;
	this.action.open = true;
	this.action.width = 600;
}

async function loadSunatInvoicing(row) {
	try {
		const { data: sunatData } = await this.$httpSales.get(
			`facturacion-sunat/${row.id}/document`,
			{
				params: { documentTypeCode: 'summary' }
			}
		);
		return sunatData;
	} catch (err) {
		this.showGenericError('No se pudo obtener la información de SUNAT.');
		return null;
	}
}

async function openSunat(row) {
	const { dataResponseTaxes } = row;
	const xmlUrl = dataResponseTaxes && dataResponseTaxes.xmlUrl;
	const cdrUrl = dataResponseTaxes && dataResponseTaxes.cdrUrl;
	
	if (xmlUrl && cdrUrl) {
		this.openModal(row);
	} else {
		const sunatData = await this.loadSunatInvoicing(row);
		await this.loadData(this.params.page);
		if (sunatData && sunatData.message) {
			this.showGenericError(sunatData.message);
		}
		const rowUpdate = this.rows.find((r) => r.id === row.id);
		this.openModal(rowUpdate);
	}
}

function cancelModal() {
	this.action.code = null;
	this.action.open = false;
	this.summary = {};
}

function valueDisabled() {
	const disabledCancel = this.cancelRoute && this.dataSelected.length === 0;
	return [{ code: 'send-summary', disabled: disabledCancel }];
}

function getDate({ model, value }) {
	this[model] = format(value, 'YYYY-MM-DD');
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function data() {
	return {
		cancelRoute: false,
		checkAll: false,
		cleanSearch: false,
		columns: [
			{
				id: 1,
				name: 'Boleta - Cod Documento',
				value: 'number',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Factura - Cod Documento',
				value: 'number',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Razón Social',
				value: 'rzSocial',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'F. Emisión',
				value: 'emissionDate',
				tooltip: 'Fecha de Emisión',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'F. Generación',
				value: 'generationDate',
				tooltip: 'Fecha de Generación',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: '# Doc. Relac.',
				value: 'documentsRelated',
				tooltip: 'Cantidad de Documentos Relacionados',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'T. Moneda',
				value: 'currencySymbol',
				tooltip: 'Tipo de Moneda',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'E. Sunat',
				value: 'state.name',
				tooltip: 'Estado de Sunat',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'ID',
				value: 'id',
				checked: false,
				visible: false,
			},
			{
				id: 10,
				name: 'Acciones',
				checked: true,
				visible: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		dailyRoute: true,
		dataSelected: [],
		endDate: null,
		lastPage: 0,
		loading: false,
		onLoading: false,
		params: {
			comSubsidiaryId: null,
			endDate: null,
			limit: 20,
			page: 1,
			startDate: null,
		},
		rows: [],
		startDate: null,
		subsidiaries: [],
		action: {
			active: false,
			code: null,
			open: false,
			title: '#',
			width: 400,
		},
		summary: {},
	};
}

export default {
	name: 'pages-daily-summary',
	components: {
		appActions,
		appDateSelect,
		dailySummaryList,
		headerPage,
		generalFilter,
		actionSidebar,
		summarySunatDetail,
		salesSunatDetails,
	},
	computed: {
		dataSelectedEmpty,
		disabled,
		valueDisabled,
	},
	created,
	data,
	methods: {
		allIsSelected,
		getDate,
		goToDetail,
		loadSunatInvoicing,
		openModal,
		loadData,
		loadExtra,
		rowIsSelected,
		runAction,
		sendSummaries,
		setData,
		openSunat,
		cancelModal,
	},
	watch: {
		$route: watchRoute,
	},
};
</script>

