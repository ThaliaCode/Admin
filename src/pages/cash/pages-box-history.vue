<template>
	<div>
		<header-page
			name="box-history"
			title="Historial de Cierre de Caja"
			:limit-title="50"
			to-show
			emit-excel
			show-excel
			@emit-excel="emitExcel"
			@clean-product-filter="clearFilter"
		>
		</header-page>
		<general-filter class="layout wrap align-end" v-if="isAdmin">
			<v-flex xs12 sm3 lg2>
				<app-date-select
					:date-formatted="params.startDate"
					label="Fecha de inicio"
					model="startDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs12 sm3 lg2 ml-2>
				<app-date-select
					:date-formatted="params.endDate"
					label="Fecha de fin"
					model="endDate"
					:min-date="params.startDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs12 sm3 lg2 ml-2>
				<app-select
					:items="employees"
					item-text="name"
					item-value="id"
					label="Empleado"
					model="employeeId"
					:item="params.employeeId"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 sm3 lg2 px-1 mt-2 mr-2>
				<app-select
					:item="subsidiaryId"
					:label="labelSucursal()"
					item-text="sucursalName"
					item-value="id"
					model="subsidiaryId"
					:items="subsidiaries"
					:return-object="false"
					@input="setData"
				>
				</app-select>
			</v-flex>
			<v-flex xs12 sm3 lg2 px-1 mt-2 mr-2>
				<app-select
					chips
					multiple
					:item="params.warehouseIds"
					:label="labelWarehouse()"
					item-text="name"
					item-value="id"
					model="warehouseIds"
					:items="warehouses"
					:return-object="false"
					@input="setData"
				>
				</app-select>
			</v-flex>
			<v-flex xs12 sm3 lg2 mt-2 mr-2>
				<app-select
					:item="params.cashId"
					:disabled="!subsidiaryId"
					label="Caja"
					item-text="name"
					item-value="id"
					model="cashId"
					:items="cash"
					:return-object="false"
					@input="setData"
				>
				</app-select>
			</v-flex>
			<v-flex xs12 sm3 lg2 mt-2 mr-2 v-if="isPeru && currencies.length > 1">
				<app-select
					chips
					item-text="name"
					item-value="code"
					label="Tipos de Moneda"
					model="currencies"
					:items="currencies"
					multiple
					:item="params.currencies"
					@input="getCurrenciesFilter"
				/>
			</v-flex>
			<v-flex xs3 sm2 lg1 px-1 mt-2>
				<v-btn
					type="button"
					color="primary"
					class="btn-action btn-action-block"
					@click="filterData"
				>
					Buscar
				</v-btn>
			</v-flex>
			<!-- <v-flex xs3 sm2 lg1 px-1 mt-2>
				<v-btn
					color="pink"
					class="btn-action btn-action-block"
					@click="clearFilter"
				>
					Limpiar
				</v-btn>
			</v-flex> -->
		</general-filter>
		<app-table
			name="box-history"
			class="is-not-selectable mt-3"
			:columns="columns"
			:current-page="current"
			:last-page="lastPage"
			:rows="rows"
			:items-quantity="rows.length"
			:items-total-quantity="itemsTotalQuantity"
			@on-page="onPage"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.cash ? props.row.cash.name : null }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{ helperFormatDateOpened(props.row.dateOpened) }}
				</td>
				<td v-show="showRow(columns, 3)">{{ closedAtRow(props.row) }}</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.employee ? props.row.employee.fullname : '---' }}
				</td>
				<td v-show="showRow(columns, 5)">
					{{ props.row.closedEmployee ? props.row.closedEmployee.fullname : '---' }}
				</td>
				<td v-show="showRow(columns, 6)">
					{{ props.row.currencySymbol }}{{ props.row.startAmount | round }}
				</td>
				<td v-show="showRow(columns, 7)">
					{{ props.row.currencySymbol }}{{ props.row.endAmount | round }}
				</td>
				<td v-show="showRow(columns, 8)">
					{{ props.row.currencySymbol }}{{ props.row.totalSales | round }}
				</td>
				<td v-show="showRow(columns, 9)">
					<app-tooltip-button
						v-if="
							!(
								props.row.cashRegisterInformation &&
								props.row.cashRegisterInformation.flagRecalculate
							)
						"
						color="warning"
						icon="upload_file"
						text="Calcular cierre"
						@click-icon="calculateClosure(props.row)"
					>
					</app-tooltip-button>
					<app-tooltip-button
						color="primary"
						icon="visibility"
						text="Ver Ventas"
						@click-icon="goToDetail(props.row)"
					>
					</app-tooltip-button>
					<app-tooltip-button
						img="/static/icon/a-icono-excel.svg"
						text="Descargar Reporte Detallado"
						@click-icon="downloadReport(props.row, 1, 'point-sale-tpv')"
					></app-tooltip-button>
					<app-tooltip-button
						img="/static/icon/a-icono-excel.svg"
						text="Descargar Reporte Detallado con Productos vendidos"
						@click-icon="downloadReport(props.row, 3, 'point-sale-tpv-products')"
					></app-tooltip-button>
					<app-tooltip-button
						img="/static/icon/a-icono-excel.svg"
						text="Descargar Resumen del Reporte"
						@click-icon="downloadReport(props.row, 2, 'point-sale-tpv')"
					></app-tooltip-button>
				</td>
			</template>
		</app-table>
	</div>
</template>
<script>
import { format } from 'date-fns';
import appDateSelect from '@/components/shared/app-date-select';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import generalFilter from '@/components/shared/general-filter';
import helper from '@/shared/helper';

function created() {
	if (!this.isAdmin) {
		this.params.cashId = this.$userInfo.cashId;
	}
	this.loadFilter();
	this.loadData();
}

async function loadFilter() {
	const request = [
		this.$httpSales.get('subsidiaries'),
		this.$httpSales.get('employees'),
		this.getCurrencies(),
		this.warehousesList(),
	];
	try {
		[
			{ data: this.subsidiaries },
			{ data: this.employees },
			{ data: this.currencies },
			{ data: this.warehouses },
		] = await Promise.all(request);
		if (this.subsidiaries.length === 1) {
			this.subsidiaryId = this.subsidiaries[0].id;
			this.loadResources(this.subsidiaryId);
		}
		this.warehouses.unshift({ id: 0, name: 'Seleccionar todos' });
	} catch (error) {
		this.showGenericError();
	}
}

async function loadData() {
	this.params.page = this.current;
	const params = { ...this.params };
	params.currency = this.params.currencies.map((cur) => cur.code).join(',');
	params.subsidiaryId = this.subsidiaryId;
	params.warehouseIds = this.params.warehouseIds.length
		? this.params.warehouseIds.join(',')
		: null;
	delete params.currencies;
	if (!this.isAdmin) {
		this.params.employeeId = this.$userInfo.id;
	}
	try {
		const response = await this.$httpSales('cash-closing', { params });
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
		this.itemsTotalQuantity = Number(response.headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

function onPage(page) {
	this.current = page;
	this.loadData();
}

function goToDetail({
	id,
	cashId,
	currency,
	cash,
	cashRegisterInformation,
	endAmount,
	startAmount,
}) {
	const query = {
		currency,
		cashId,
		cashName: cash ? cash.name : null,
		endAmount,
		startAmount,
		deposit: cashRegisterInformation ? cashRegisterInformation.deposit : null,
		cash: cashRegisterInformation ? cashRegisterInformation.cash : null,
		card: cashRegisterInformation ? cashRegisterInformation.card : null,
		voucher: cashRegisterInformation ? cashRegisterInformation.voucher : null,
		cashAmountKept: cashRegisterInformation
			? cashRegisterInformation.cashAmountKept
			: null,
	};
	const routeData = this.$router.resolve({
		name: 'box-history-detail',
		params: { id },
		query,
	});
	window.open(routeData.href, '_blank');
}

function isAdmin() {
	return Boolean(this.$userInfo.flagAdmin);
}

function setData({ model, value }) {
	if (model && value) {
		if (model === 'subsidiaryId') {
			this.subsidiaryId = value;
			this.loadResources(value);
		} else if (model === 'employeeId') {
			this.params[model] = value.id;
		} else if (model === 'warehouseIds') {
			const selectAllSelected = value.includes(0);
			if (selectAllSelected) {
				this.params[model] =
					this.params.warehouseIds.length === this.warehouses.length - 1
						? []
						: this.warehouses.map((w) => w.id).filter((id) => id !== 0);
			} else {
				this.params[model] = value;
			}
		} else {
			this.params[model] = value;
		}
	}
}

async function loadResources(subsidiaryId) {
	try {
		const { data: response } = await this.$httpSales.get('cash', {
			params: { flagActive: 1, subsidiaryId },
		});
		this.cash = response;
		if (this.cash.length === 1) {
			this.params.cashId = this.cash[0].id;
			this.loadData();
		}
	} catch (error) {
		this.showGenericError();
	}
}

function clearFilter() {
	this.current = 1;
	this.subsidiaryId = null;
	this.params = {
		currencies: [this.$userInfo.company.currencyDefault],
		cashId: null,
		limit: 20,
		closed: true,
		startDate: null,
		endDate: null,
		employeeId: null,
		warehouseIds: [],
	};
	this.loadData();
}

async function downloadReport({ dateOpened, closedAt, id }, report, code) {
	const body = {
		typeReport: report,
		endDate: closedAt
			? format(closedAt, 'YYYY-MM-DD')
			: format(closedAt, 'YYYY-MM-DD-HH-mm-ss'),
		startDate: format(dateOpened, 'YYYY-MM-DD'),
		salCashClosingId: id,
	};
	try {
		const responseType = 'blob';
		const response = await this.$httpReportSales.post(`reports/${code}`, body, {
			responseType,
		});
		const blob = helper.generateBlob(response.data);
		helper.showDownloadDialog(blob, 'pdf');
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'INVALID_TEMPLATE') {
				this.showGenericError(error.data.messageError);
			}
		} else {
			this.showGenericError();
		}
	}
}

function setDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function getCurrenciesFilter({ model, value }) {
	this.params[model] = [...value];
}

function helperFormatDateOpened(date) {
	if (date) {
		const originalDate = new Date(date);
		// Restar 5 horas
		originalDate.setHours(originalDate.getHours() - 5);
		// Obtener la fecha ajustada en el formato deseado
		const adjustedDate = originalDate.toISOString();
		const formattedDate = helper.exactDate(adjustedDate, 'DD/MM/YYYY HH:mm:ss');
		return formattedDate;
	}
	return null;
}

function closedAtRow(row) {
	if (row) {
		return helper.exactDate(row.closedAt, 'DD/MM/YYYY HH:mm:ss');
	}
	return null;
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Caja', value: 'cash', visible: true, checked: true },
			{
				id: 2,
				name: 'Fecha de apertura',
				value: 'dateStart',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Fecha de cierre ',
				value: 'dateEnd',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Emple. Apert.',
				value: 'employee',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Emple. Cierre',
				value: 'employee',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Saldo Inicial',
				value: 'mounStart',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Saldo final',
				value: 'mountEnd',
				visible: true,
				checked: true,
			},
			{ id: 8, name: 'Total', value: 'total', visible: true, checked: true },
			{ id: 9, name: 'Acción', value: 'actions', visible: true, checked: true },
		],
		currencies: [],
		employees: [],
		rows: [],
		lastPage: 0,
		itemsTotalQuantity: 0,
		current: 1,
		params: {
			limit: 20,
			closed: true,
			cashId: null,
			currencies: [this.$userInfo.company.currencyDefault],
			endDate: null,
			employeeId: null,
			startDate: null,
			warehouseIds: [],
		},
		cash: [],
		warehouses: [],
		subsidiaryId: null,
		subsidiaries: [],
	};
}
export default {
	name: 'page-box-history',
	data,
	created,
	components: {
		appTable,
		appDateSelect,
		headerPage,
		generalFilter,
	},
	computed: {
		isAdmin,
	},
	methods: {
		helperFormatDateOpened,
		closedAtRow,
		downloadReport,
		goToDetail,
		getCurrenciesFilter,
		onPage,
		loadFilter,
		loadData,
		setData,
		loadResources,
		clearFilter,
		setDate,
		async emitExcel() {
			if (!(this.params.startDate && this.params.endDate)) {
				this.showGenericError(
					'Para poder generar el reporte debe colocar las fechas de inicio y fin'
				);
				return;
			}
			if (this.params.currencies.length > 1) {
				this.showGenericError(
					'Para poder generar el reporte debe seleccionar solamente una moneda'
				);
				return;
			}
			const body = { ...this.params };
			body.currency = this.params.currencies.map((cur) => cur.code).join(',');
			body.typeRecipe = 'xlsx';
			const code = 'xlsx';
			const name = 'Reporte de Cierre de caja';
			delete body.page;
			delete body.limit;
			delete body.currencies;
			delete body.closed;
			body.warehouseIds = this.params.warehouseIds.length
				? this.params.warehouseIds
				: null;
			const cleanedObj = JSON.parse(
				JSON.stringify(body, (key, value) => (value === null ? undefined : value))
			);
			try {
				const response = await this.$httpSales.post(
					'reports/point-sale-tpv-list-xlsx',
					cleanedObj,
					{
						responseType: 'blob',
					}
				);
				const blob = helper.generateBlob(
					response.data,
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				);
				helper.showDownloadDialog(blob, name, code);
				this.showNotification('El reporte se genera correctamente');
			} catch (error) {
				this.showGenericError();
			}
		},
		async calculateClosure({ id }) {
			try {
				await this.$httpSales.post(`cash-desk-closing/${id}/recalculate`);
				this.showNotification('Se realizo correctamente el calculo del cierre de caja');
				this.loadData();
			} catch (error) {
				this.showGenericError();
			}
		},
		filterData() {
			this.current = 1;
			this.loadData();
		},
	},
};
</script>
