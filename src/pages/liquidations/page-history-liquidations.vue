<template>
	<div>
		<header-page
			:showClean="false"
			toShow
			:showExcel="false"
			caption-navigation="Liquidaciones"
			:title="$route.meta.title"
			name="page-history"
		>
			<v-layout column>
				<v-flex class="title-header" text-xs-right>Total de Liquidación</v-flex>
				<v-flex class="total-header" text-xs-right
					>{{ countryCurrencySymbol }} {{ total.amount || 0 }}</v-flex
				>
			</v-layout>
		</header-page>
		<v-flex mt-5 px-4>
			<v-layout align-end>
				<v-flex xs2>
					<app-date-select
						label="Fecha de Liquidación"
						:date-formatted="params.operationDate"
						model="operationDate"
						@input="setParams"
					/>
				</v-flex>
				<v-flex xs2 ml-2>
					<app-select
						item-text="name"
						item-value="id"
						:items="states"
						:item="params.liquidStatusId"
						model="liquidStatusId"
						label="Estado de Liquidación"
						:return-object="false"
						@input="setParams"
					/>
				</v-flex>
				<v-flex xs2 ml-2>
					<app-select
						item-text="name"
						item-value="code"
						:items="typesLiquidations"
						:item="params.type"
						model="type"
						label="Tipo de Liquidación"
						:return-object="false"
						@input="setParams"
					/>
				</v-flex>
				<v-flex xs1 ml-2>
					<v-btn
						color="primary"
						class="btn-action btn-action-block"
						@click="filterLiquidation"
					>
						Buscar
					</v-btn>
				</v-flex>
				<v-flex xs1 ml-2>
					<v-btn
						color="error"
						class="btn-action btn-action-block"
						@click="clearFilters"
					>
						Limpiar
					</v-btn>
				</v-flex>
			</v-layout>
			<v-flex xs12 mt-4>
				<app-table
					class="px-0"
					:rows="rows"
					:columns="columns"
					:current-page="currentPage"
					:last-page="lastPage"
					@on-search-event="onSearch"
					@on-page="changePage"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">
							{{ props.row.number }}
						</td>
						<td v-show="showRow(columns, 2)">
							{{ props.row.operationDate | formatDate }}
						</td>
						<td v-show="showRow(columns, 3)" class="text-uppercase">
							{{ props.row.type }}
						</td>
						<td v-show="showRow(columns, 4)">
							{{
								props.row.type === 'repartidor'
									? `${props.row.delivery.name || ''} ${
											props.row.delivery.lastname || ''
									  }`
									: props.row.commerce
									? props.row.commerce.name
									: null
							}}
						</td>
						<td v-show="showRow(columns, 5)">{{ props.row.quantity }}</td>
						<td v-show="showRow(columns, 6)">{{ props.row.amount }}</td>
						<td v-show="showRow(columns, 7)">
							<document-state
								:color="getColor(props.row)"
								:tooltip="getTextLiq(props.row)"
							/>
						</td>
						<td v-show="showRow(columns, 8)">
							<app-tooltip-button
								icon="remove_red_eye"
								text="Ver Detalle"
								color="primary"
								size="16"
								@click-icon="viewDetail(props.row)"
							/>
							<app-tooltip-button
								v-if="$route.name === 'history-liquidations'"
								class="hide-and-print"
								color="info"
								icon="print"
								text="Imprimir Liquidación"
								@click-icon="printLiquidation(props.row)"
							></app-tooltip-button>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-flex>
	</div>
</template>

<script>
import { format } from 'date-fns';
import helper from '@/shared/helper';
import appDateSelect from '@/components/shared/app-date-select';
import appTable from '@/components/shared/table/app-table';
import documentState from '@/components/shared/document-state';
import headerPage from '@/components/shared/header-page';

function created() {
	this.loadStatus();
	this.loadHistoryLiquidations();
	this.loadTotalHistoryLiquidations();
}

async function loadTotalHistoryLiquidations() {
	const params = {
		operationDate: this.params.operationDate,
		liquidStatusId: this.params.liquidStatusId,
	};
	try {
		const response = await this.$httpSales.get('liquidations-total', {
			params,
		});
		this.total = response.data;
	} catch (e) {
		this.showGenericError();
	}
}

async function loadHistoryLiquidations() {
	const params = { ...this.params };
	try {
		params.page = this.currentPage;
		const response = await this.$httpSales.get('liquidations', { params });
		this.lastPage = Number(response.headers['x-last-page']);
		this.rows = response.data;
	} catch (e) {
		this.showGenericError();
	}
}

async function loadStatus() {
	try {
		const response = await this.$httpSales.get('liquidation-status');
		this.states = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function setParams({ model, value }) {
	if (model === 'operationDate') {
		this.params[model] = format(value, 'YYYY-MM-DD');
	} else {
		this.params[model] = value;
	}
}

function viewDetail({ id, type }) {
	this.goTo('page-detail-liquidations', {
		params: { id, typeLiquidation: type },
	});
}

function filterLiquidation() {
	this.loadHistoryLiquidations();
	this.loadTotalHistoryLiquidations();
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.filterLiquidation();
}

function changePage(page) {
	this.currentPage = page;
	this.loadHistoryLiquidations();
}

function getColor({ liquidStatus }) {
	if (liquidStatus) {
		return liquidStatus.colorCode;
	}
	return 'red accent-4';
}

function getTextLiq({ liquidStatus }) {
	if (liquidStatus) {
		return liquidStatus.name;
	}
	return 'No Liquidado';
}

async function printLiquidation(row) {
	try {
		const params = { responseType: 'blob' };
		const body = {
			code: row.commerceId
				? 'com-liquidation-commerce'
				: 'com-liquidation-driver',
		};
		const name = 'Reporte de Liquidación';
		const url = `liquidations-orders/${row.id}/pdf`;
		const { data: blobData } = await this.$httpReportSales.post(
			url,
			body,
			params
		);
		const blob = helper.generateBlob(blobData);
		helper.showDownloadDialog(blob, name, 'pdf');
	} catch (error) {
		this.showGenericError();
	}
}

function clearFilters() {
	this.params = {
		operationDate: null,
		liquidStatusId: null,
		type: null,
	};
	this.loadHistoryLiquidations();
	this.loadTotalHistoryLiquidations();
}

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Nro de Liquidación',
				value: 'number',
				visible: true,
				checked: true,
			},
			{ id: 2, name: 'Fecha de Liquidación', visible: true, checked: true },
			{ id: 3, name: 'Tipo de Liquidación', visible: true, checked: true },
			{
				id: 4,
				name: 'N. del Repartidor',
				tooltip: 'Nombre del Repartidor',
				visible: true,
				checked: true,
			},
			{ id: 5, name: 'Cantidad', visible: true, checked: true },
			{ id: 6, name: 'Total Liquidación', visible: true, checked: true },
			{ id: 7, name: 'Est. Liqui', visible: true, checked: true },
			{ id: 8, name: 'Acciones', visible: true, checked: true },
		],
		states: [],
		typesLiquidations: [
			{
				id: 1,
				name: 'Comercio',
				code: 'commerce',
			},
			{
				id: 2,
				name: 'Repartidor',
				code: 'delivery',
			},
		],
		currentPage: 1,
		lastPage: 0,
		params: {
			page: 1,
			limit: 20,
			search: null,
			operationDate: null,
			liquidStatusId: null,
			type: null,
		},
		total: {},
		rows: [],
	};
}

export default {
	name: 'page-history-liquidations',
	created,
	data,
	components: {
		appDateSelect,
		appTable,
		documentState,
		headerPage,
	},
	methods: {
		changePage,
		clearFilters,
		filterLiquidation,
		getColor,
		getTextLiq,
		loadHistoryLiquidations,
		loadTotalHistoryLiquidations,
		loadStatus,
		setParams,
		printLiquidation,
		onSearch,
		viewDetail,
	},
};
</script>

<style lang="scss" scoped>
.px-0 {
	padding: 0 !important;
}

.title-header {
	color: #494949;
	font-family: map-get($fonts, open-semibold);
	font-size: 10px;
}

.total-header {
	color: color(primary);
	font-family: map-get($fonts, open-bold);
	font-size: 16px;
}

.text-uppercase {
	text-transform: capitalize;
}
</style>
