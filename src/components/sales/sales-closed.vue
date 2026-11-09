<template>
	<div>
		<header-page
			:title="$route.meta.title"
			to-show
			:export-to-pdf="false"
			:show-excel="false"
			@clean-product-filter="onCleanData" />
		<general-filter>
			<v-layout row wrap>
				<v-flex xs12 md6>
					<v-layout row wrap justify-start>
						<v-flex xs12 md5 px-1 class="align-col">
							<v-menu
								lazy
								v-model="menuStart"
								transition="scale-transition"
								offset-y
								full-width
								:nudge-right="50">
								<v-text-field
									slot="activator"
									label="Fecha de inicio"
									v-model="params.startDate"
									single-line
									append-icon="event"
									class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-start"
									readonly
								></v-text-field>
								<v-date-picker
									v-model="params.startDate"
									no-title
									scrollable
								></v-date-picker>
							</v-menu>
						</v-flex>
						<v-flex xs12 md5 px-1 class="align-col">
							<v-menu
								lazy
								v-model="menuEnd"
								transition="scale-transition"
								offset-y
								full-width
								:nudge-right="50">
								<v-text-field
									slot="activator"
									label="Fecha de fin"
									v-model="params.endDate"
									single-line
									append-icon="event"
									class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-end"
									readonly
								></v-text-field>
								<v-date-picker
									v-model="params.endDate"
									no-title
									scrollable
								></v-date-picker>
							</v-menu>
						</v-flex>
						<v-flex xs12 md2 px-1 mt-2 class="align-col">
							<v-btn
								type="button"
								color="primary"
								class="btn-action"
								@click="loadData(1)">
								Filtrar
							</v-btn>
						</v-flex>
					</v-layout>
					<v-layout>
						<v-flex px-1 class="align-col">
							<a @click.prevent="goTo('cash-closing')">Historial de Cierres de Caja</a>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</general-filter>
		<app-table
			name="sales-closed"
			selectable
			:columns="columns"
			:current-page="currentPage"
			:rows="rows"
			local-storage
			:last-page="lastPage"
			:clean-search="isClean"
			@on-toggle-columns="toggleColumns"
			v-on:on-search-event="callServiceAndSearch"
			v-on:on-page="changePage"
			class="is-not-selectable">
			<template slot="rows" slot-scope="props">
				<td
					class="is-not-selectable"
					v-show="showRow(columns, 1)">
					{{ props.row.warehouse.name }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.address }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.employee.name }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.quantity }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.amountTotal }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.amountTotal }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.costs }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.expenseAmount }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.utilities }}</td>
				<td v-show="showRow(columns, 10)">
					<app-tooltip-button
						text="Detalle"
						icon="visibility"
						color="info"
						@click-icon="goDetails(props.row)"/>
					<app-tooltip-button
						text="Caja"
						icon="swap_horiz"
						color="success"
						@click-icon="goTo"/>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
	import helper from '@/shared/helper';
	import appTable from './../shared/table/app-table';
	import generalFilter from './../shared/general-filter';
	import headerPage from './../shared/header-page';

	function created() {
		const indexWarehouse = this.columns.findIndex(y => y.value === 'warehouse');
		this.columns[indexWarehouse].name = this.labelWarehouse();
		const page = helper.getLocalData('current-page::cash-closing') || 1;
		this.params.page = page;
		const datesFilter = helper.getLocalData('cash-close::dates-filter');
		if (datesFilter) {
			this.params.endDate = datesFilter.endDate;
			this.params.startDate = datesFilter.startDate;
		} else {
			this.defaultDates();
		}
		this.loadData();
	}

	function defaultDates() {
		const currentDate = new Date();
		let day = currentDate.getDate();
		let month = currentDate.getMonth();
		let year = currentDate.getFullYear();
		const daysAgo = 10;
		if (day > daysAgo) {
			day -= daysAgo;
		} else {
			day = (30 - daysAgo) + day;
			if (month === 0) {
				month = 12;
				year -= 1;
			}
		}
		this.params.endDate = helper.formatDate(currentDate, 'YYYY-MM-DD');
		this.params.startDate = `${year}-${month}-${day}`;
	}

	function callServiceAndSearch(search) {
		this.params.page = 1;
		if (search) {
			this.params.search = search;
		} else {
			this.params.search = null;
		}
		helper.setLocalData('sales-closed::search', search);
		this.loadData();
	}

	function changePage(page) {
		this.params.page = page;
		helper.setLocalData('current-page::cash-closing', page);
		this.loadData();
	}

	async function loadData() {
		const url = 'employees-warehouses';
		try {
			({ data: this.rows } = await this.$httpSales.get(url, { params: this.params }));
		} catch (error) {
			this.showGenericError();
		}
		this.isClean = false;
	}

	function onCleanData() {
		this.params = {
			page: 1,
			search: null,
		};
		this.isClean = true;
		helper.removeLocalData('sales-closed::search');
		helper.removeLocalData('cash-close::dates-filter');
		this.defaultDates();
		this.callServiceAndSearch();
	}

	function toggleColumns() {
		return true;
	}

	function goDetails(row) {
		const params = {
			amount: row.amountTotal,
			employee: row.employee.email,
			employeeId: row.comEmployeeId,
			endDate: this.params.endDate,
			startDate: this.params.startDate,
			warehouse: row.warehouse.name,
			warehousesId: row.warWarehousesId,
		};
		const name = 'sales-closed-detail';
		const objectDates = {
			endDate: this.params.endDate,
			startDate: this.params.startDate,
		};
		helper.setLocalData('cash-close::dates-filter', objectDates);
		this.goTo(name, { params });
	}

	function data() {
		return {
			columns: [
				{ id: 1, name: 'Tienda/almacén', value: 'warehouse', visible: true, checked: true },
				{ id: 2, name: 'Dirección', value: 'address', visible: true, checked: true },
				{ id: 3, name: 'Responsable', value: 'responsible', visible: true, checked: true },
				{ id: 4, name: 'Unid. vendidas', value: 'quantity', visible: true, checked: true },
				{ id: 5, name: 'Ingreso en PEN', value: 'PenValue', visible: true, checked: true },
				{ id: 6, name: 'Ingreso en USD', value: 'UsdValue', visible: true, checked: true },
				{ id: 7, name: 'Costo', value: 'price', visible: true, checked: true },
				{ id: 8, name: 'Gastos', value: 'expenses', visible: true, checked: true },
				{ id: 9, name: 'Utilidades', value: 'utilities', visible: true, checked: true },
				{ id: 10, name: 'Acción', visible: true, checked: true, flagVisible: true },
			],
			currentPage: 1,
			endDate: '',
			startDate: '',
			isClean: false,
			lastPage: 1,
			menuEnd: false,
			menuStart: false,
			params: {
				endDate: '',
				page: 1,
				search: null,
				startDate: '',
			},
			rows: [],
		};
	}

	export default {
		name: 'sales-closed',
		components: {
			appTable,
			generalFilter,
			headerPage,
		},
		created,
		data,
		methods: {
			callServiceAndSearch,
			changePage,
			defaultDates,
			goDetails,
			loadData,
			onCleanData,
			toggleColumns,
		},
	};
</script>

<style lang="scss" scoped>

</style>