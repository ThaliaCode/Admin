<template>
  <div>
		<header-page
			:title="this.$route.meta.title"
			to-show
			emit-excel
			show-excel
			column-class="xs12"
			justify-class="justify-start"
			@clean-product-filter="onCleanData"
			@emit-excel="downLoadExcelReport"
		>
			<v-layout class="header-modal-information" mr-2>
				<v-flex text-xs-center class="item-information">
					Tiempo Transcurrido <br> <span class="num-information">{{ header.totalTime }}</span>
				</v-flex>
				<v-flex text-xs-center class="item-information">
					Total Asignado <br> <span class="num-information">{{ header.totalAssig }}</span>
				</v-flex>
				<v-flex text-xs-center class="item-information">
					Total de Pedido <br> <span class="num-information">{{ header.totalOrder }}</span>
				</v-flex>
				<v-flex text-xs-center class="item-information">
					Total Cerrados <br> <span class="num-information">{{ header.totalClosed }}</span>
				</v-flex>
			</v-layout>
		</header-page>
		<v-layout pt-3 pb-4 px-4>
			<v-flex>
				<app-select
					item-text="name"
					item-value="id"
					label="Estado de Picking"
					:item="params.statePicking"
					:items="statesPicking"
					model="statePicking"
					@input="setFilter"
				></app-select>
			</v-flex>
			<v-flex ml-2>
				<app-select
					item-text="name"
					item-value="id"
					label="E. del Pedido"
					:item="params.orderStateId"
					model="orderStateId"
					:items="orderStates"
					@input="setFilter"
				></app-select>
			</v-flex>
			<v-flex ml-2>
				<app-select
					item-text="name"
					item-value="id"
					label="Empleado"
					:item="params.employeeId"
					model="employeeId"
					:items="employees"
					@input="setFilter"
				></app-select>
			</v-flex>
			<v-flex ml-2>
				<app-date-select
					label="Fecha de Inicio"
					model="startDate"
					:date-formatted="params.startDate"
					@input="getDate"
				/>
			</v-flex>
			<v-flex ml-2>
				<app-date-select
					:date-formatted="params.endDate"
					label="Fecha de Final"
					model="endDate"
					@input="getDate"
				/>
			</v-flex>
			<v-flex ml-2 xs1 mt-4>
				<v-btn
					type="button"
					color="success"
					class="btn-action btn-action-block"
					@click="searchFilterList">
					Buscar
					<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
		<app-table
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			:items-quantity="rows.length"
			:items-total-quantity="itemsTotalQuantity"
			class="is-not-selectable"
			:input-search="false"
			@on-search-event="onSearchEvent"
			@on-page="changePage"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">
					{{ props.row.number }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.customerName }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.orderState }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.statePicking }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.startDate | formatDate }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.endDate | formatDate }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.differenceMinutes }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.employee ? props.row.employee.fullname : null }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.employeeNamePicking }}</td>
				<td v-show="showRow(columns, 10)">
					<app-tooltip-button
						color="primary"
						icon="remove_red_eye"
						text="Ver Detalle"
						@click-icon="openDetail(props.row)"
					/>
				</td>
			</template>
		</app-table>
  </div>
</template>

<script>
import { format, differenceInDays, subDays, differenceInMinutes } from 'date-fns';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import { DISPATCH_HISTORY } from '@/shared/reports';

function created() {
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	this.params.statePicking = 3;
	this.loadResources();
	this.loadTotalDispatch();
	this.loadDispatchHistory();
}

function openDetail({ orderId }) {
	this.goTo('page-detail-order', { params: { orderId } });
}

async function loadResources() {
	const requests = [
		this.globalEmployees(),
		this.$httpSales.get('order-states'),
	];
	try {
		[
			{ data: this.employees },
			{ data: this.orderStates },
		] = await Promise.all(requests);
	} catch (error) {
		this.showGenericError();
	}
}

async function loadTotalDispatch() {
	const params = {
		state: 1,
		endDate: this.params.endDate,
		startDate: this.params.startDate,
		statePicking: this.params.statePicking,
		flagAll: this.params.flagAll,
		orderStateId: this.params.orderStateId,
		employeeId: this.params.employeeId,
	};
	const response = await this.$httpSales.get('picking-history-total', { params });
	const { elapsedMinute, totalOrder, totalItems, totalClosed, totalAssigned } = response.data;
	this.header = {
		totalAssig: totalAssigned,
		totalOrder,
		totalItems,
		totalClosed,
	};
	const minutos = String(elapsedMinute / 60);
	const result = minutos.split('.');
	const hours = result[0];
	const minutesDecimal = `0.${result[1]}`;
	const minutes = parseInt(minutesDecimal * 60, 10);
	this.header.totalTime = elapsedMinute > 0 ? `${hours}h ${minutes}m` : '';
}

function searchFilterList() {
	const datesValid = differenceInDays(this.params.endDate, this.params.startDate) >= 0;
	if (datesValid) {
		this.currentPage = 1;
		this.loadDispatchHistory();
		this.loadTotalDispatch();
	} else {
		this.showNotification('La fecha inicial no debe ser mayor a la final', 'info');
	}
}

async function loadDispatchHistory(page = 1) {
	this.params.page = page;
	try {
		const response = await this.$httpSales.get('picking-history', { params: this.params });
		this.lastPage = Number(response.headers['x-last-page']);
		this.itemsTotalQuantity = Number(response.headers['x-quantity']);
		this.rows = response.data.map((row) => {
			const rowDispatch = { ...row };
			rowDispatch.differenceMinutes = row.endDate ? `${differenceInMinutes(row.endDate || 0, row.startDate || 0)} min` : '';
			rowDispatch.orderState = row.orderState ? row.orderState.name : null;
			rowDispatch.customerName = row.customer && row.customer.typePerson ?
				row.customer.typePerson.fullName : `${row.customer.name} ${row.customer.lastname}`;
			return rowDispatch;
		});
	} catch (error) {
		this.showGenericError();
	}
}

function getDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function setFilter({ model, value }) {
	if (value) {
		this.params[model] = value.id;
		if (model === 'employeeId') {
			this.params.flagAll = undefined;
		}
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadDispatchHistory(page);
}

function onSearchEvent(search) {
	this.params.search = search ? search.trim() : null;
	this.loadData();
}

function onCleanData() {
	this.params = {
		state: 1,
		employeeId: null,
		orderStateId: null,
		flagAll: true,
	};
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	this.params.statePicking = 3;
	this.loadDispatchHistory();
}

function downLoadExcelReport() {
	const code = DISPATCH_HISTORY;
	const originName = 'despacho_historico_';
	const params = {
		employeeId: this.params.employeeId || undefined,
		orderStateId: this.params.orderStateId || undefined,
		startDate: this.params.startDate || undefined,
		endDate: this.params.endDate || undefined,
		statePicking: this.params.statePicking || undefined,
	};
	this.onEmitExcel(code, originName, params);
}

function data() {
	return {
		columns: [
			{ id: 1, name: '# Pedido', value: 'documentNumber', visible: true, checked: true },
			{ id: 2, name: 'Cliente', value: 'customerName', visible: true, checked: true },
			{ id: 3, name: 'Est. de Pedidos', tooltip: 'Estado de Despacho', value: 'code', visible: true, checked: true },
			{ id: 4, name: 'Est. de Picking', tooltip: 'Estado de Picking', value: 'code', visible: true, checked: true },
			{ id: 5, name: 'Fecha Inicio', value: 'code', visible: true, checked: true },
			{ id: 6, name: 'Fecha Final', value: 'code', visible: true, checked: true },
			{ id: 7, name: 'Tiempo Transcurrido', value: 'code', visible: true, checked: true },
			{ id: 8, name: 'Empleado', value: 'code', visible: true, checked: true },
			{ id: 9, name: 'Empleado Asignado', tooltip: 'Empleado Asignado al Despacho', value: 'code', visible: false, checked: false },
			{ id: 10, name: 'Acciones', value: 'actions', visible: true, checked: true },
		],
		currentPage: 1,
		employees: [],
		header: {
			totalTime: null,
			totalOrder: null,
			totalItems: null,
			totalClosed: null,
			totalAssigned: null,
		},
		itemsTotalQuantity: 0,
		lastPage: 0,
		params: {
			state: 1,
			endDate: null,
			employeeId: null,
			orderStateId: null,
			startDate: null,
			statePicking: null,
			flagAll: true,
		},
		rows: [],
		statesPicking: [
			{
				id: 3,
				name: 'Todos',
			},
			{
				id: 1,
				name: 'Asignado',
			},
			{
				id: 2,
				name: 'Cerrado',
			},
		],
		orderStates: [],
	};
}

export default {
	name: 'page-dispatch-history',
	created,
	data,
	components: {
		appTable,
		headerPage,
	},
	methods: {
		changePage,
		downLoadExcelReport,
		getDate,
		loadDispatchHistory,
		loadResources,
		loadTotalDispatch,
		setFilter,
		onSearchEvent,
		onCleanData,
		openDetail,
		searchFilterList,
	},
};
</script>