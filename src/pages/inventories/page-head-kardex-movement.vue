<template>
	<div>
		<header-page
			name="head-kardex-movement"
			title="Movimientos de Kardex"
			@clean-product-filter="clearFilter"
			to-show
			emit-excel
			show-excel
			@emit-excel="emitExcel"
		></header-page>
		<general-filter>
			<v-layout>
				<v-flex xs12 sm6 md3 pr-2 class="align-col">
					<label class="caption">Tipo de Documento</label>
					<v-select
						bottom
						single-line
						hide-details
						:items="typesDocuments"
						item-text="name"
						autocomplete
						item-value="id"
						label="Tipo de Documento"
						class="filter-select"
						content-class="filter-select-content"
						v-model="params.documentTypeId"
					></v-select>
				</v-flex>
				<v-flex xs12 sm6 md2 pr-2 class="align-col">
					<label class="caption">Empleado</label>
					<v-select
						bottom
						single-line
						hide-details
						:items="employees"
						item-text="fullname"
						autocomplete
						item-value="id"
						label="Empleado"
						class="filter-select"
						content-class="filter-select-content"
						v-model="params.userId"
					></v-select>
				</v-flex>
				<v-flex xs12 sm6 md2 pr-2 class="align-col">
					<label class="caption">Fecha de Inicio</label>
					<date-component
						:date="params.startDate"
						icon="/static/img/calendar.svg"
						@on-input="setDate({ model: 'startDate', value: $event })"
					></date-component>
				</v-flex>
				<v-flex xs12 sm6 md2 pr-2 class="align-col">
					<label class="caption">Fecha de Fin</label>
					<date-component
						:date="params.endDate"
						:disabled="!params.startDate"
						icon="/static/img/calendar.svg"
						@on-input="setDate({ model: 'endDate', value: $event })"
					></date-component>
				</v-flex>
				<v-flex xs12 sm6 md2 pt-4 class="align-col">
					<v-btn
						class="btn-action btn-auto px-4 py-2 w-100"
						color="primary"
						@click="filterList"
					>
						Filtrar
					</v-btn>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto">
			<app-table
				name="inventories-list-master"
				:columns="columns"
				:rows="data"
				:current-page="currentPage"
				:last-page="lastPage"
				:items-quantity="data.length"
				:items-total-quantity="totalItems"
				@on-page="changePage"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">
						{{ props.row.documentNumber }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.documentTypeName }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 4)">
						{{ getDateOperation(props.row, 1) || '-' }}
					</td>
					<td v-show="showRow(columns, 5)">
						{{ getDateOperation(props.row, 0) || '-' }}
					</td>
					<td v-show="showRow(columns, 6)">
						{{
							props.row.aditionalInformation
								? props.row.aditionalInformation.moduleName
								: ''
						}}
					</td>
					<td v-show="showRow(columns, 7)">{{ props.row.entityName }}</td>
					<td v-show="showRow(columns, 8)">
						<app-tooltip-button
							icon="remove_red_eye"
							text="Ver Detalle"
							color="primary"
							size="20"
							@click-icon="openNewDetail(props.row)"
						/>
						<app-tooltip-button
							icon="dynamic_feed"
							text="Ver Detalle En Tabla"
							color="primary"
							size="20"
							@click-icon="showDetail(props.row)"
						/>
						<app-tooltip-button
							icon="delete"
							text="Eliminar"
							color="error"
							size="20"
							@click-icon="openDialogDelete(props.row)"
						/>
					</td>
				</template>
			</app-table>
		</div>
		<v-dialog v-model="dialogDetail" persistent max-width="750">
			<modal-items
				v-if="dialogDetail"
				:show-btn-cancel="false"
				name-action="Cerrar"
				:title="`Detalle del Movimiento - #${rowSelect.documentNumber}`"
				show-slot
				@close-modal="closeModal"
				@action-modal="closeModal"
				@download-excel="downloadExcel"
				show-excel
			>
				<app-table
					name="detail-kardex-movement"
					:columns="columnsDetail"
					:rows="detailMovements"
					:filter-columns="false"
					:input-search="false"
					:main-list="false"
					class="no-main-list my-4"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">
							{{ props.row.documentNumber }}
						</td>
						<td v-show="showRow(columns, 2)">{{ props.row.documentType }}</td>
						<td v-show="showRow(columns, 3)">
							{{ props.row.product ? props.row.product.code : null }}
						</td>
						<td v-show="showRow(columns, 4)">
							{{ props.row.product ? props.row.product.name : null }}
						</td>
						<td v-show="showRow(columns, 5)">
							<span v-if="props.row.quantityIn">{{ props.row.quantityIn }}</span>
							<span v-else>-</span>
						</td>
						<td v-show="showRow(columns, 6)">
							<span v-if="props.row.quantityOut">{{ props.row.quantityOut }}</span>
							<span v-else>-</span>
						</td>
						<td v-show="showRow(columnsDetail, 7)">
							<span>{{ props.row.priceCost }}</span>
						</td>
						<td v-show="showRow(columnsDetail, 8)">
							<span v-if="props.row.quantityIn">{{
								props.row.createdAt | formatDate
							}}</span>
							<span v-else>-</span>
						</td>
						<td v-show="showRow(columnsDetail, 9)">
							<span v-if="props.row.quantityOut">{{
								props.row.createdAt | formatDate
							}}</span>
							<span v-else>-</span>
						</td>
					</template>
				</app-table>
				<v-flex px-4> Comentario: </v-flex>
				<v-flex px-4 mb-3>
					{{ rowSelect.aditionalInformation.commentary || '' }}
				</v-flex>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="dialogDelete" persistent max-width="390">
			<v-card>
				<v-card-title class="subheading">{{ dialogMessage }}</v-card-title>
				<v-card-actions class="justify-center">
					<v-btn class="btn-action" color="info" dark @click.native="closeDialog">
						Cancelar
					</v-btn>
					<v-btn class="btn-action" color="error" dark @click.native="deleteMovement">
						Eliminar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import { format, differenceInCalendarDays } from 'date-fns';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import dateComponent from '@/components/shared/date-component';
import modalItems from '@/components/shared/modal-items';
import helper from '@/shared/helper';

function openDialogDelete(row) {
	this.dialogDelete = true;
	this.dialogMessage = `¿Desea eliminar el movimiento '${row.description}' del listado?`;
	this.rowMovement = row;
}

function closeDialog() {
	this.dialogDelete = false;
	this.dialogMessage = '';
	this.rowMovement = {};
}

async function deleteMovement() {
	const params = {
		companyId: this.rowMovement.companyId,
		typeOperation: this.rowMovement.aditionalInformation.operation,
		documentKardexId: this.rowMovement.id,
	};
	try {
		await this.$httpProducts.post('kardex/recalculate', params);
		this.showNotification('El movimiento ha sido eliminado correctamente.');
		this.closeDialog();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			this.showNotification('El movimiento no puede ser eliminado.', 'error');
		}
	}
}
function clearFilter() {
	this.params.documentTypeId = null;
	this.params.userId = null;
	const today = new Date();
	this.params.endDate = today.toISOString().split('T')[0];

	const oneWeekAgo = new Date();
	oneWeekAgo.setDate(today.getDate() - 7);
	this.params.startDate = oneWeekAgo.toISOString().split('T')[0];
	this.loadData();
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function setDate({ value, model }) {
	this.params[model] = value;
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpProducts.get('kardex/list-header', {
			params: this.params,
		});
		this.data = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
		this.totalItems = Number(response.headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

async function loadResources() {
	const request = [this.globalEmployees(), this.$httpProducts.get('type-documents')];
	try {
		[{ data: this.employees }, { data: this.typesDocuments }] = await Promise.all(
			request
		);
	} catch (error) {
		this.showGenericError();
	}
}

function filterList() {
	const disabledValidate = this.params.startDate && !this.params.endDate;
	this.invalidEndDate =
		this.params.startDate &&
		differenceInCalendarDays(this.params.endDate, this.params.startDate) < 0;
	if (disabledValidate) {
		this.showNotification(
			'Selecciona una fecha final o limpia el filtro de fecha inical',
			'warning'
		);
	} else if (this.invalidEndDate) {
		this.showNotification(
			'La fecha final no debe ser menor a la fecha inicial',
			'warning'
		);
	} else {
		this.currentPage = 1;
		this.loadData();
	}
}

function created() {
	const today = new Date();
	this.params.endDate = today.toISOString().split('T')[0];

	const oneWeekAgo = new Date();
	oneWeekAgo.setDate(today.getDate() - 7);
	this.params.startDate = oneWeekAgo.toISOString().split('T')[0];

	this.loadResources();
	this.loadData();
}

function getDateOperation(row, type) {
	if (row.aditionalInformation) {
		if (Number(row.aditionalInformation.operation) === type) {
			return format(row.operationDate, 'YYYY-MM-DD HH:mm:ss');
		}
	}
	return null;
}

async function showDetail(row) {
	this.rowSelect = { ...row };
	const params = {
		page: 1,
		// documentTypeId: row.documentTypeId,
		// documentNumber: row.documentNumber,
		// operation: row.operation,
	};
	try {
		const { data: response } = await this.$httpProducts.get(
			`kardex/list-header/${row.id}`,
			{ params }
		);
		this.detailMovements = response.details.map((p) => {
			const newRow = { ...p };
			const productLots = p.additionalInformation.productLots;
			const lotDeuDate = productLots
				? helper.formatDate(productLots.dateDue, 'YYYY-MM-DD HH:mm:ss')
				: null;
			newRow.dueDate = p.dueDate || lotDeuDate || null;
			newRow.location = productLots ? productLots.location : null;
			newRow.lot = productLots ? productLots.code : p.lot || null;
			newRow.dateFormatted = p.quantityIn
				? helper.formatDate(p.createdAt, 'YYYY-MM-DD HH:mm:ss')
				: null;
			newRow.outFormatted = p.quantityOut
				? helper.formatDate(p.createdAt, 'YYYY-MM-DD HH:mm:ss')
				: null;
			newRow.quantityOutValue = p.quantityOut ? p.quantityOut : '-';
			newRow.productCode = p.product ? p.product.code : '';
			newRow.productName = p.product ? p.product.name : '';
			newRow.warehouseName = p.additionalInformation
				? p.additionalInformation.warehouseName
				: '';
			return newRow;
		});
		this.dialogDetail = true;
	} catch (error) {
		this.showGenericError();
	}
}

function openNewDetail(row) {
	this.goTo('detail-kardex-movement', { params: { id: row.id } });
}

function closeModal() {
	this.dialogDetail = false;
	this.detailMovements = [];
}

async function downloadExcel() {
	const code = 'xlsx';
	const name = 'Reporte de Movimiento de Kardex';
	const body = {
		columns: this.columnsDetail.reduce((acum, pl) => {
			const newAcum = [...acum];
			if (pl.value.length) {
				const newCol = {
					name: pl.name,
					value: pl.value,
				};
				newAcum.push(newCol);
			}
			return newAcum;
		}, []),
		code: 'xlsx',
		rows: this.detailMovements.map((movement) => {
			const newRow = {};
			newRow.documentNumber = movement.documentNumber;
			newRow.documentType = movement.documentType;
			newRow.productCode = movement.productCode;
			newRow.productName = movement.productName;
			newRow.quantityIn = movement.quantityIn;
			newRow.quantityOut = movement.quantityOut;
			newRow.dateFormatted = movement.dateFormatted;
			newRow.outFormatted = movement.outFormatted;
			// new column (unitary cost)
			newRow.unitCost = movement.priceCost;
			return newRow;
		}),
	};
	try {
		const response = await this.$httpReportSales.post('reports', body, {
			responseType: 'blob',
		});
		const blob = helper.generateBlob(
			response.data,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		helper.showDownloadDialog(blob, name, code);
		this.showNotification(
			'El reporte de Movimiento de Kardex fue descargado correctamente.'
		);
	} catch (error) {
		this.showGenericError();
	}
}

function onSearch(search) {
	this.params.search = search ? search.trim() : null;
	this.loadData();
}

function data() {
	return {
		currentPage: 1,
		totalItems: 1,
		data: [],
		columns: [
			{ id: 1, name: '# DOC', value: 'name', visible: true, checked: true },
			{
				id: 2,
				name: 'Documento',
				value: 'date-start',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Descripción',
				value: 'date-end',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Fecha de Entrada',
				value: 'type-inventories',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Fecha de Salida',
				value: 'inventories',
				visible: true,
				checked: true,
			},
			{ id: 6, name: 'Modulo', value: 'Estado', visible: true, checked: true },
			{ id: 7, name: 'Usuario', value: 'zone', visible: true, checked: true },
			{ id: 8, name: 'Acción', value: 'action', visible: true, checked: true },
		],
		dialogDelete: false,
		dialogMessage: '',
		lastPage: 0,
		typesDocuments: [],
		params: {
			documentTypeId: null,
			flagPhysicalTable: true,
			userId: null,
			page: 1,
			limit: 20,
			startDate: null,
			endDate: null,
			companyId: null,
			moduleId: null,
			typeOperation: null,
			documentKardexId: null,
		},
		employees: [],
		dialogDetail: false,
		detailMovements: [],
		columnsDetail: [
			{
				id: 1,
				name: '# DOC',
				value: 'documentNumber',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Documento',
				value: 'documentType',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Cod. Producto',
				value: 'productCode',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Producto',
				value: 'productName',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Entrada',
				value: 'quantityIn',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Salida',
				value: 'quantityOut',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Costo Unitario',
				value: 'unitCost',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Fecha de entrada',
				value: 'dateFormatted',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Fecha de salida',
				value: 'outFormatted',
				visible: true,
				checked: true,
			},
		],
		rowSelect: {},
		rowMovement: {},
	};
}

export default {
	name: 'page-head-kardex-movement',
	data,
	created,
	components: {
		generalFilter,
		headerPage,
		appTable,
		dateComponent,
		modalItems,
	},
	methods: {
		clearFilter,
		changePage,
		closeDialog,
		downloadExcel,
		setDate,
		loadData,
		loadResources,
		filterList,
		getDateOperation,
		showDetail,
		openNewDetail,
		closeModal,
		deleteMovement,
		openDialogDelete,
		onSearch,
		emitExcel() {
			const params = {
				documentTypeId: this.params.documentTypeId,
				startDate: this.params.startDate,
				endDate: this.params.endDate,
				companyId: this.$userInfo.company.id,
			};
			const validateReport =
				params.documentTypeId && params.startDate && params.endDate !== null;
			if (validateReport) {
				this.generalListKardex(params);
			} else {
				this.showGenericError('Coloque todos los filtros para generar el reporte');
			}
		},
	},
};
</script>
