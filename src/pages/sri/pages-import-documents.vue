<template>
	<div>
		<div v-if="$route.name === 'import-documents'">
			<header-page title="Listas de archivos TXT" />
			<app-actions :resource-uri="$route.name" @run-action="runAction" />
			<general-filter>
				<v-layout mt-3>
					<v-flex xs12 sm4 lg3 px-1 my-2 class="align-col">
						<app-select
							label="Empresa"
							item-text="sucursalName"
							item-value="id"
							model="comSubsidiariesId"
							:item="params.comSubsidiariesId"
							:items="subsidiaries"
							:return-object="false"
							@input="onInput"
						></app-select>
					</v-flex>
					<v-flex xs12 sm1 mt-4 pt-2 ml-2 class="align-col">
						<v-btn
							type="button"
							color="success"
							class="btn-action btn-action-block"
							@click="loadData(1)"
						>
							Buscar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-flex>
					<v-flex xs12 sm1 mt-4 pt-2 ml-2 class="align-col">
						<v-btn
							type="button"
							color="error"
							class="btn-action btn-action-block"
							@click="cleanFilters"
						>
							Limpiar Filtro
						</v-btn>
					</v-flex>
				</v-layout>
			</general-filter>
			<app-table
				name="import-documents-sri"
				class="is-not-selectable px-4 mt-5"
				:clean-search="cleanSearch"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="rows"
				@on-page="loadData"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<template v-if="columns.length > 0">
						<td class="is-not-selectable" v-show="showRow(columns, 1)">
							<span v-if="props.row.subsidiary">
								{{ props.row.subsidiary.sucursalName }}
							</span>
						</td>
						<td v-show="showRow(columns, 2)">
							{{ props.row.dateStart | exactDate('YYYY-MM-DD') }} -
							{{ props.row.dateEnd | exactDate('YYYY-MM-DD') }}
						</td>
						<td v-show="showRow(columns, 3)">
							{{ getMonthInWords(props.row) }}
						</td>
						<td v-show="showRow(columns, 4)">
							<v-tooltip top>
								<span slot="activator">
									{{ props.row.description | limitTo(75) }}
								</span>
								<span>{{ props.row.description }}</span>
							</v-tooltip>
						</td>
						<template v-for="(column, columnIndex) in columns">
							<td
								:key="`${column.id}${columnIndex}${props.index}`"
								v-if="
									column.value !== 'sucursalName' &&
									column.value !== 'dateStart' &&
									column.value !== 'month' &&
									column.value !== 'description' &&
									column.value !== 'totalDocuments' &&
									column.value !== 'status' &&
									column.value !== 'action'
								"
								v-show="showRow(columns, column.id)"
							>
								{{ props.row.summary[column.name] }}
							</td>
						</template>
						<td
							v-show="
								showRow(columns, columns.find((c) => c.value === 'totalDocuments').id)
							"
						>
							{{ props.row.totalRegistered }}
						</td>
						<td v-show="showRow(columns, columns.find((c) => c.value === 'status').id)">
							<span :class="`${props.row.statusName.color}--text`">
								{{ props.row.statusName.name }} {{ props.row.totalProcessed }} /
								{{ props.row.totalDocuments }}
							</span>
						</td>
						<td v-show="showRow(columns, columns.find((c) => c.value === 'action').id)">
							<app-tooltip-button
								text="Detalle de Documento"
								icon="remove_red_eye"
								color="primary"
								@click-icon="goToDetail(props.row)"
							/>
							<app-tooltip-button
								text="Ver historico"
								icon="history"
								color="primary"
								@click-icon="showHistoric(props.row)"
							/>
						</td>
					</template>
				</template>
			</app-table>
			<action-sidebar
				:code-action="action.code"
				:title="action.title"
				:width="action.width"
				v-model="action.open"
				@close-modal="cancelModal"
			>
				<upload-documents
					v-if="action.code === 'upload-documents'"
					:loading="loading"
					@cancel-modal="cancelModal"
					@import-document="importDocument"
				/>
				<historic-import-documents
					v-if="action.code === 'show-historic'"
					:rows-history="rowsHistory"
					@cancel-modal="cancelModal"
				/>
			</action-sidebar>
		</div>
		<div v-else>
			<router-view></router-view>
		</div>
	</div>
</template>
<script>
import appActions from '@/components/shared/app-actions';
import { getMonth } from 'date-fns';
import actionSidebar from '@/components/shared/action-sidebar';
import appTable from '@/components/shared/table/app-table';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import uploadDocuments from '@/components/sri/upload-documents';
import historicImportDocuments from '@/components/sri/historic-import-documents';
import helper from '@/shared/helper';

const { exactDate } = helper;

function created() {
	if (this.$route.name === 'import-documents') {
		this.loadResources();
	}
}

function buildColumns() {
	const tdColumns = this.typeDocuments.map((td, index) => {
		const newTd = {
			checked: true,
			id: index + this.firstColumns.length + 1,
			name: td.code,
			tooltip: td.name,
			value: `summary.${td.code}`,
			visible: true,
		};
		return newTd;
	});
	const columns = this.firstColumns.concat(tdColumns);
	const lastColumnsId = this.lastColumns.map((lc, lcIndex) => {
		const newLc = { ...lc };
		newLc.id = columns.length + lcIndex + 1;
		return newLc;
	});
	this.columns = columns.concat(lastColumnsId);
	this.loadData();
}

function cancelModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
	this.action.width = 500;
}

function cleanFilters() {
	this.params = {
		comSubsidiariesId: null,
		limit: 30,
		page: 1,
		search: null,
	};
	this.loadData();
}

function getMonthInWords({ dateStart }) {
	const months = [
		'Enero',
		'Febrero',
		'Marzo',
		'Abril',
		'Mayo',
		'Junio',
		'Julio',
		'Agosto',
		'Setiembre',
		'Octubre',
		'Noviembre',
		'Diciembre',
	];
	const index = getMonth(dateStart) + 1;
	return months[index === 12 ? 0 : index];
}

function goToDetail({ id, dateStart, dateEnd, totalProcessed, name }) {
	if (totalProcessed > 0) {
		const newDateEnd = exactDate(dateEnd, 'YYYY-MM-DD');
		const newDateStart = exactDate(dateStart, 'YYYY-MM-DD');
		this.goTo('detail-import', {
			params: { id, dateStart: newDateStart, dateEnd: newDateEnd, name },
		});
	} else {
		this.showNotification('No se han encontrado documentos procesados.', 'info');
	}
}

function showHistoric(row) {
	const rowsHistory = row?.files?.map((f) => f?.additionalInformation) || [];
	const rowsHistoryData = rowsHistory.filter((f) => !!f);
	console.log(rowsHistoryData);
	if (!rowsHistoryData.length) {
		this.showGenericError('No se han encontrado registros para mostrar.');
		return;
	}
	this.rowsHistory = rowsHistoryData;
	this.action.code = 'show-historic';
	this.action.open = true;
	this.action.title = 'Ver Histórico';
	this.action.width = 900;
}

async function importDocument(modelDocument) {
	this.loading = true;
	const body = { ...modelDocument };
	try {
		await this.$httpSales.post('purchase-annex', body);
		this.showNotification('El documento ha sido importado correctamente.');
		this.cancelModal();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'SUBSIDIARY_DEFAULT_NOT_EXIST') {
				this.showGenericError(
					'La empresa a la que pertenece el archivo TXT que intenta subir no se encuentra registrada en la compañía.'
				);
			}
		}
	} finally {
		this.loading = false;
	}
}

async function loadData(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	const params = { ...this.params };
	try {
		const { data: files, headers } = await this.$httpSales.get('purchase-annex', {
			params,
		});
		this.rows = files.map((file) => {
			const newFile = { ...file };
			newFile.summary = file.summary || {};
			newFile.statusName = file.statusName || {};
			return newFile;
		});
		this.lastPage = Number(headers['x-last-page']);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadResources() {
	const requests = [this.getTypeDocuments('purchases'), this.subsidiariesList()];
	const [{ data: typeDocuments }, { data: subsidiaries }] = await Promise.all(requests);
	this.typeDocuments = typeDocuments.map((td) => td.documentType);
	this.subsidiaries = [...subsidiaries];
	this.buildColumns();
}

function onInput({ model, value }) {
	this.params[model] = value;
}

function onSearch(value) {
	this.params.search = value && value.trim() ? value.trim() : null;
	this.cleanSearch = !this.params.search;
	this.loadData();
}

function runAction({ code }) {
	if (code === 'upload-documents') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = 'Subir Documento';
	}
}

function newRoute({ name }) {
	if (name === 'import-documents') {
		this.loadResources();
	}
}

function data() {
	return {
		action: {
			code: null,
			open: false,
			title: '',
			width: 500,
		},
		cleanSearch: false,
		columns: [],
		currentPage: 1,
		firstColumns: [
			{ id: 1, name: 'Empresa', value: 'sucursalName', checked: true, visible: true },
			{ id: 2, name: 'Fecha', value: 'dateStart', checked: true, visible: true },
			{ id: 3, name: 'Mes', value: 'month', checked: true, visible: true },
			{
				id: 4,
				name: 'Desc.',
				value: 'description',
				tooltip: 'Descripción',
				checked: true,
				visible: true,
			},
		],
		lastColumns: [
			{
				id: 9,
				name: '# Doc.',
				value: 'totalDocuments',
				tooltip: 'Cantidad de Documentos',
				checked: true,
				visible: true,
			},
			{ id: 10, name: 'Estado', value: 'status', checked: true, visible: true },
			{
				id: 11,
				name: 'Acción',
				value: 'action',
				checked: true,
				visible: true,
				flagVisible: true,
			},
		],
		lastPage: 0,
		loading: false,
		params: {
			comSubsidiariesId: null,
			limit: 30,
			page: 1,
			search: null,
		},
		rows: [],
		subsidiaries: [],
		typeDocuments: [],
		rowsHistory: [],
	};
}
export default {
	name: 'page-import-documents',
	components: {
		appActions,
		actionSidebar,
		appTable,
		generalFilter,
		headerPage,
		uploadDocuments,
		historicImportDocuments,
	},
	created,
	data,
	methods: {
		buildColumns,
		cancelModal,
		cleanFilters,
		getMonthInWords,
		goToDetail,
		showHistoric,
		importDocument,
		loadData,
		loadResources,
		onInput,
		onSearch,
		runAction,
	},
	watch: {
		$route: newRoute,
	},
};
</script>
