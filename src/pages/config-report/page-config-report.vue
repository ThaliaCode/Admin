<template>
	<div>
		<header-page :show-excel="false" :title="$route.meta.title" />
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<v-layout px-5 pa-3 v-if="$route.name === 'report-external'">
			<v-flex xs2>
				<app-select
					:item="params.moduleId"
					item-text="name"
					item-value="id"
					:items="listModules"
					label="Tipo de Modulo"
					model="moduleId"
					place-holder="Seleccionar"
					@input="getModule"
				/>
			</v-flex>
		</v-layout>
		<v-flex px-4 xs12 pt-2>
			<app-table
				:check-all-disabled="allDisabled"
				name="table-config-report"
				:check-all="checkAll"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="data"
				selectable
				disabled-value="disabled"
				:items-quantity="data.length"
				:items-total-quantity="itemsTotalQuantity"
				@on-search-event="onSearch"
				@on-page="changePage"
				@on-selected-all="selectedAll"
				@row-is-selected="selectedRow"
			>
				<template slot="rows" slot-scope="props">
					<td
						v-show="showRow(columns, 1)"
						:class="{ disabled: props.row.disabled }"
					>
						{{ props.row.code }}
					</td>
					<td
						v-show="showRow(columns, 2)"
						:class="{ disabled: props.row.disabled }"
					>
						{{ props.row.name }}
					</td>
					<td
						v-show="showRow(columns, 3)"
						:class="{ disabled: props.row.disabled }"
					>
						<span :style="{ color: props.row.state ? '#64b161' : 'red' }">
							{{ props.row.state ? 'Asignado' : 'No Asignado' }}
						</span>
					</td>
					<td
						v-show="showRow(columns, 4)"
						:class="{ disabled: props.row.disabled }"
					>
						{{ props.row.description || '-' }}
					</td>
					<td
						v-show="showRow(columns, 5)"
						:class="{ disabled: props.row.disabled }"
					>
						{{ props.row.moduleId === 1 ? 'Ventas' : 'Productos' }}
					</td>
					<td v-show="showRow(columns, 6)">
						<app-tooltip-button
							color="primary"
							icon="panorama"
							text="Visualizar Reporte"
							:disabled="!props.row.additionalInformation"
							@click-icon="openVisualiPdf(props.row)"
						></app-tooltip-button>
					</td>
				</template>
			</app-table>
		</v-flex>
		<v-dialog v-model="dialogReport" persistent max-width="333">
			<v-card>
				<v-flex text-xs-right px-2 pa-2>
					<button type="button" @click="closeDialogReport">
						<v-icon color="primary">clear</v-icon>
					</button>
				</v-flex>
				<v-card-text>
					<v-flex pb-4 pt-2 text-xs-center class="text-dialog">
						¿Estas seguro que desea
						{{
							dataSelected.length > 1
								? 'asignar los reportes'
								: 'asignar el reporte'
						}}
						?
					</v-flex>
				</v-card-text>
				<v-card-actions class="background-dialog" pa-0>
					<v-layout row wrap justify-center ma-0 pa-1>
						<button
							@click="closeDialogReport"
							type="button"
							class="modal-items-btn--cancel"
						>
							NO
						</button>
						<button type="button" class="modal-items-btn" @click="assignReport">
							SI
						</button>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';

function created() {
	if (this.$route.name === 'report-external') {
		this.columns[4].visible = true;
		this.columns[3].visible = true;
	}
	this.loadData();
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

async function loadData() {
	this.params.page = this.currentPage;
	const params = { ...this.params };
	try {
		if (this.$route.name === 'report-external') {
			const responseMaster = await this.$httpReports.get(
				'reports/master-templates',
				{ params }
			);
			this.data = responseMaster.data.map((p) => {
				const newRow = { ...p };
				newRow.state = p.reportTemplate && p.reportTemplate.flagActive;
				newRow.disabledCheck = Boolean(p.reportTemplate);
				newRow.disabled = Number(!!p.reportTemplate);
				return newRow;
			});
			this.lastPage = Number(responseMaster.headers['x-last-page']);
			this.itemsTotalQuantity = Number(responseMaster.headers['x-quantity']);
		} else {
			const response = await this.$httpSalesRead.get('company-template-list', {
				params,
			});
			this.data = response.data.map((l) => {
				const newRow = { ...l };
				newRow.state = Number(!!l.reportTemplate);
				newRow.disabledCheck = Boolean(l.reportTemplate);
				newRow.disabled = Number(!!l.reportTemplate);
				return newRow;
			});
			this.lastPage = Number(response.headers['x-last-page']);
			this.itemsTotalQuantity = this.data.length;
		}
		this.dataSelected = [];
		this.checkAll = this.data.every((check) => check.isSelected);
		this.allDisabled = this.data.every((r) => !r.disabled === 1);
	} catch (error) {
		this.showGenericError();
	}
}

function runAction(item) {
	if (item.code === 'assign-report') {
		this.dialogReport = true;
	}
}
function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadData();
}

function closeDialogReport() {
	this.dialogReport = false;
}

function actionsDisabled() {
	const disabledAction = this.dataSelected.some((d) => d.disabled === 1);
	return [
		{
			code: 'assign-report',
			disabled: !this.dataSelected.length || disabledAction,
		},
	];
}

function selectedRow(row) {
	const index = this.dataSelected.findIndex((ds) => ds.id === row.id);
	if (index > -1) {
		this.dataSelected.splice(index, 1);
	} else {
		this.dataSelected.push(row);
	}
	this.checkAll = this.data.every((check) => check.isSelected);
}

function selectedAll(isSelected) {
	this.checkAll = isSelected;
	const dataTemplate = this.data.filter((d) => !d.reportTemplate);
	this.data = this.data.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = isSelected && !row.reportTemplate;
		return newRow;
	});
	this.dataSelected = isSelected ? [...dataTemplate] : [];
}

async function assignReport() {
	const body = {
		masterTemplateCodes: this.dataSelected.map((p) => p.code),
	};
	try {
		if (this.$route.name === 'report-external') {
			await this.$httpReports.post('reports/config-template', body);
			this.showNotification('Los reportes fueron asignados correctamente.');
		} else {
			await this.$httpSales.post('company-template-config', body);
			this.showNotification('Los reportes fueron asignados correctamente.');
		}
		this.dataSelected = [];
		this.loadData();
		this.closeDialogReport();
	} catch (error) {
		if (error.status === 400) {
			this.dialogReport = false;
			if (error.data.message === 'TEMPLATE_EXIST') {
				this.showGenericError('El reporte ya asignado anteriormente.');
			}
		} else {
			this.showGenericError();
		}
	}
}

function getModule({ model, value }) {
	if (value) {
		this.params[model] = value.code;
		this.loadData();
	}
}

function $route(value) {
	if (value.name === 'report-internal' || value.name === 'report-external') {
		this.loadData();
	}
	this.columns[3].visible = value.name === 'report-external';
	this.columns[4].visible = value.name === 'report-external';
}

function openVisualiPdf({ additionalInformation }) {
	if (additionalInformation) {
		window.open(additionalInformation.image.link, '_blank');
	}
}

function data() {
	return {
		allDisabled: false,
		checkAll: false,
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Estado', value: 'state', visible: true, checked: true },
			{
				id: 4,
				name: 'Descripción',
				value: 'description',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Tipo de módulo',
				value: 'code',
				visible: false,
				checked: false,
			},
			{ id: 6, name: 'Acciones', value: 'code', visible: true, checked: true },
		],
		currentPage: 1,
		data: [],
		dataSelected: [],
		dialogReport: false,
		lastPage: 1,
		listModules: [
			{
				id: 1,
				name: 'Ventas',
				code: 1,
			},
			{
				id: 2,
				name: 'Productos',
				code: 2,
			},
		],
		params: {
			limit: 20,
			moduleId: null,
			search: null,
			page: 0,
		},
		itemsTotalQuantity: 0,
	};
}

export default {
	name: 'page-config-report',
	created,
	data,
	components: {
		appActions,
		appTable,
		headerPage,
		runAction,
	},
	computed: {
		actionsDisabled,
	},
	methods: {
		assignReport,
		changePage,
		closeDialogReport,
		getModule,
		loadData,
		openVisualiPdf,
		onSearch,
		runAction,
		selectedAll,
		selectedRow,
	},
	watch: {
		$route,
	},
};
</script>

<style lang="scss" scoped>
.text-dialog {
	color: map-get($colors, primary);
	font-size: map-get($sizes, medium15);
	margin: 0 auto;
	max-width: 217px;
}

.modal-items {
	&-btn {
		border: 1px solid color(primary);
		border-radius: 5px;
		font-family: map-get($fonts, lato-bold);
		font-size: 14px;
		color: color(primary);
		padding: 4px 15px;
		width: 97px;

		&--cancel {
			border: 1px solid color(error);
			border-radius: 5px;
			font-family: map-get($fonts, lato-bold);
			font-size: 14px;
			color: color(error);
			margin-right: 20px;
			padding: 4px 15px;
			width: 97px;
		}
	}
}

.background-dialog {
	background-color: #f2fafa;
}
</style>
