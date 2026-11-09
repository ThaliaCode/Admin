<template>
	<div>
		<header-page
			:columns="columns"
			name="products-dispatch"
			:rows="dataSelected"
			:title="$route.meta.title"
			to-show
			@clean-product-filter="onCleanData"
		/>
		<general-filter>
			<v-layout column wrap>
				<v-flex xs12>
					<v-layout row wrap align-end ma-2>
						<v-flex xs12 sm6 md3 class="">
							<person-search-input
								ref="customerSearcher"
								ref-value="customerSearcher"
								id="customerSearcher"
								label=""
								:search-value="selectedCustomer"
								:flagInputEvent="true"
								@search="openSearchCustomer"
							/>
						</v-flex>
						<v-flex xs12 sm6 md3 px-1>
							<v-select
								v-bind:items="typeDocuments"
								v-model="params.typeDocumentCode"
								label="Tipo de documento"
								item-text="name"
								item-value="code"
								hide-details
								single-line
								bottom
								class="filter-select"
								content-class="filter-select-content"
								@input="loadData(currentPage)"
							></v-select>
						</v-flex>
						<v-flex xs12 sm6 md3 px-1>
							<v-select
								v-bind:items="warehouses"
								v-model="params.warehouseId"
								:label="labelWarehouse()"
								item-text="name"
								item-value="id"
								single-line
								bottom
								hide-details
								class="filter-select"
								content-class="filter-select-content"
								@input="loadData(currentPage)"
							></v-select>
						</v-flex>
						<v-flex xs12 sm6 md3 px-1>
							<v-select
								v-bind:items="status"
								v-model="params.status"
								label="Estado"
								item-text="name"
								item-value="code"
								single-line
								bottom
								hide-details
								class="filter-select"
								content-class="filter-select-content"
								@input="loadData(currentPage)"
							></v-select>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12>
					<v-layout row wrap justify-start>
						<v-flex xs12 sm6 md3 px-1 mt-0>
							<v-menu
								lazy
								v-model="menuStart"
								transition="scale-transition"
								offset-y
								full-width
								:nudge-right="50"
							>
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
									locale="es"
								></v-date-picker>
							</v-menu>
						</v-flex>
						<v-flex xs12 sm6 md3 px-1 mt-0>
							<v-menu
								lazy
								v-model="menuEnd"
								transition="scale-transition"
								offset-y
								full-width
								:nudge-right="50"
							>
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
									locale="es"
								></v-date-picker>
							</v-menu>
						</v-flex>

						<v-flex xs12 sm6 md3 px-1 mt-0>
							<v-btn
								type="button"
								color="success"
								class="btn-action"
								@click="searchByDate"
							>
								Buscar
								<v-icon color="white" size="16"> check_circle_outline </v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto">
			<app-table
				name="products-dispatch"
				:columns="columns"
				:current-page="currentPage"
				:rows="data"
				:key-value="keyValue"
				local-storage
				selectable
				:check-all="checkAll"
				:last-page="lastPage"
				:clean-search="isClean"
				:main-list="data.length > 0"
				:items-quantity="data.length"
				:items-total-quantity="itemsTotalQuantity"
				@on-toggle-columns="toggleColumns"
				@on-search-event="callServiceAndSearch"
				@on-page="changePage"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.warehouseName }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.customerData }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.docNumber }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.createdAt }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.typeDocumentName }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.statusName }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.typePaymentName }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.amount | round }}</td>
					<td v-show="showRow(columns, 9)">
						<v-layout row wrap justify-center>
							<app-tooltip-button
								icon="remove_red_eye"
								text="Ver Detalle"
								color="primary"
								size="16"
								class="mr-2"
								@click-icon="goToDetail(props.row)"
							/>
							<app-tooltip-button
								v-if="props.row.state && props.row.state.code === 'FIN'"
								icon="picture_as_pdf"
								text="Descargar Documento"
								color="success"
								size="16"
								@click-icon="downloadGuide(props.row)"
							/>
						</v-layout>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			:width="action.width"
			:code-action="action.code"
			:title="action.title"
			:active="action.active"
			:is-loading="loading"
			:header-color="action.color"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<person-search-form
				v-if="action.code === 'customer-searcher'"
				:search-value="searchValCustomer"
				@add-person="(p) => setCustomer(p, false, true)"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import { format, subDays } from 'date-fns';
import helper from '@/shared/helper';
import actionSidebar from '@/components/shared/action-sidebar';
import personSearchForm from '@/components/shared/searcher/person-search-form';
import personSearchInput from '@/components/shared/searcher/person-search-input';
import appTable from './../shared/table/app-table';
import generalFilter from './../shared/general-filter';
import headerPage from './../shared/header-page';

function created() {
	this.params.startDate = this.startDateDefault;
	this.params.endDate = this.endDateDefault;
	this.filterData();
	this.loadData();
}

function allIsSelected() {
	this.checkAll = this.data.every((check) => check.isSelected);
}

function callServiceAndSearch(search) {
	this.searchData = search;
	if (search) {
		this.params.search = search;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
	this.loadData();
}

function changePage(page) {
	this.currentPage = page;
	this.allIsSelected();
	this.loadData(page);
}

async function filterData() {
	const request = [
		this.getTypeDocuments('sales'),
		this.$httpProducts.get('warehouses'),
		this.$httpSales.get('sales/states'),
	];
	try {
		const responses = await Promise.all(request);
		this.typeDocuments = responses[0].data.map((typeDocument) => {
			const newTypeDocument = Object.assign({}, typeDocument);
			newTypeDocument.documentType.type = 'typeDocumentCode';
			return newTypeDocument.documentType;
		});
		this.warehouses = responses[1].data.map((warehouse) => {
			const newWarehouse = Object.assign({}, warehouse);
			newWarehouse.type = 'warehouseId';
			return newWarehouse;
		});
		this.status = responses[2].data.map((state) => {
			const newState = Object.assign({}, state);
			newState.type = 'status';
			return newState;
		});
	} catch (err) {
		this.showGenericError();
	}
}

async function loadData(page = 1) {
	this.params.page = page;
	this.currentPage = page;
	try {
		const { data: response, headers } = await this.$httpSalesRead.get(
			'sale-documents/remission-guides',
			{ params: this.params }
		);
		this.data = response.map((rowData) => {
			const newData = { ...rowData };
			const typeCustomer = rowData.customer ? rowData.customer.flagTypePerson : 0;
			newData.isSelected = false;
			if (rowData.customer) {
				newData.customerData =
					typeCustomer > 1
						? rowData.customer.rzSocial
						: `${rowData.customer.name} ${rowData.customer.lastname}`;
			} else {
				newData.customerData = '';
			}
			newData.createdAt = format(new Date(rowData.createdAt), 'DD-MM-YYYY');
			newData.docNumber = `${rowData.serie}-${rowData.number}`;
			newData.typeDocumentName = rowData.typeDocument.name;
			newData.statusName = rowData.state.name;
			newData.typePaymentName = rowData.payment ? rowData.payment.name : '';
			newData.hasProducts = rowData.details.every((detail) => detail.product);
			if (this.dataSelected.length > 0) {
				this.dataSelected.forEach((rowSelected) => {
					if (rowSelected.warProductId === rowData.warProductId) {
						newData.isSelected = rowSelected.isSelected;
					}
				});
			}
			return newData;
		});
		this.itemsTotalQuantity = Number(headers['x-quantity']);
		this.lastPage = Number(headers['x-last-page']);
	} catch (err) {
		this.showGenericError();
	} finally {
		this.isClean = false;
	}
}

function onCleanData() {
	this.params = {
		page: null,
		search: null,
		status: null,
		typeDocumentCode: null,
		warehouseId: null,
		startDate: this.startDateDefault,
		endDate: this.endDateDefault,
		customerId: null,
	};
	this.selectedCustomer = '';
	this.searchValCustomer = '';
	this.searchData = null;
	this.isClean = true;
	helper.removeLocalData('products-dispatch::search');
	this.callServiceAndSearch();
}

function rowIsSelected(row, all) {
	if (row.isSelected) {
		if (this.dataSelected.length > 0 && all) {
			const dataToAdd = this.dataSelected.find(
				(rowSelected) => rowSelected && rowSelected.id === row.id
			);
			if (!dataToAdd) {
				this.dataSelected.push(row);
			}
		} else {
			this.dataSelected.push(row);
		}
	} else {
		const index = this.dataSelected.findIndex(
			(rowData) => rowData[this.keyValue] === row[this.keyValue]
		);
		this.dataSelected.splice(index, 1);
	}
	this.checkAll = this.data.every((check) => check.isSelected);
}

function searchByDate() {
	if (this.params.startDate && this.params.endDate) {
		this.currentPage = 1;
		this.loadData();
	}
}

function selectedAll(value) {
	this.checkAll = value;
	this.data = this.data.map((dataSingle) => {
		const newData = Object.assign({}, dataSingle);
		newData.isSelected = value;
		if (newData.isSelected) {
			if (this.dataSelected.length > 0) {
				const dataToAdd = this.dataSelected.find(
					(rowSelected) => rowSelected && rowSelected.id === newData.id
				);
				if (!dataToAdd) {
					this.dataSelected.push(newData);
				}
			} else {
				this.dataSelected.push(newData);
			}
		} else {
			const index = this.dataSelected.findIndex(
				(rowData) => rowData[this.keyValue] === newData[this.keyValue]
			);
			this.dataSelected.splice(index, 1);
		}
		return newData;
	});
}

function toggleColumns() {
	return true;
}

function goToDetail(row) {
	this.goTo('reference-guide-detail-dispatch', {
		params: { saleId: row.id },
	});
}

async function downloadGuide(row) {
	try {
		const downloadDialog = this.$userInfo.company.settings.downloadSale;
		const model = { code: 'pdf' };
		const responseType = 'blob';
		const contentType = downloadDialog ? 'application/pdf' : 'text/html';

		const response = await this.$httpReportSales.post(
			`sale-documents/${row.id}/pdf`,
			model,
			{ responseType }
		);
		const blob = helper.generateBlob(response.data, contentType);
		helper.showDownloadDialog(blob, `Documento-${row.docNumber}`, downloadDialog);
	} catch (err) {
		if (err.status === 400 || err.status === 404) {
			this.showNotification('No se pudo encontrar el documento para esta venta.', 'error');
		} else {
			this.showGenericError();
		}
	}
}

function data() {
	return {
		checkAll: false,
		columns: [
			{
				id: 1,
				name: 'Tienda',
				value: 'warehouse',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Cliente',
				value: 'customerData',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: '# DOC',
				value: 'docNumber',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Fecha de creación',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Tipo de documento',
				value: 'typeDocumentName',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Estado',
				value: 'statusName',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Tipo de pago',
				value: 'typePaymentName',
				visible: true,
				checked: true,
			},
			{ id: 8, name: 'Total', value: 'amount', visible: true, checked: true },
			{
				id: 9,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		data: [],
		dataSelected: [],
		isClean: false,
		keyValue: 'warProductId',
		lastPage: 1,
		loading: false,
		menuEnd: false,
		menuStart: false,
		params: {
			startDate: null,
			endDate: null,
			page: 1,
			search: null,
			sortField: 'created_at',
			status: null,
			typeDocumentCode: null,
			warehouseId: null,
			customerId: null,
		},
		searchData: '',
		endDateDefault: this.$today(),
		startDateDefault: format(subDays(this.$today(), 7), 'YYYY-MM-DD'),
		status: [],
		typeDocuments: [],
		warehouses: [],
		itemsTotalQuantity: 0,
		selectedCustomer: '',
		searchValCustomer: '',
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 600,
		},
	};
}

export default {
	name: 'products-dispatch',
	components: {
		appTable,
		generalFilter,
		headerPage,
		actionSidebar,
		personSearchForm,
		personSearchInput,
	},
	created,
	data,
	methods: {
		allIsSelected,
		callServiceAndSearch,
		changePage,
		filterData,
		loadData,
		onCleanData,
		rowIsSelected,
		searchByDate,
		selectedAll,
		toggleColumns,
		goToDetail,
		downloadGuide,
		openSearchCustomer(value) {
			this.searchValCustomer = value ? value.trim() : '';
			this.action.code = 'customer-searcher';
			this.action.title = 'Clientes';
			this.action.width = 739;
			this.action.value = true;
			this.action.open = true;
		},
		customerFocused() {
			const input = this.$refs.customerSearcher.$el.querySelector('input');

			if (input) {
				input.focus();
			}
		},
		closeModal() {
			this.action.open = false;
			this.action.code = '';
			this.action.title = '';
		},
		setCustomer(customer) {
			this.params.customerId = customer?.id;
			this.selectedCustomer = customer?.person?.fullname || '';
			this.closeModal();
		},
	},
};
</script>

<style lang="scss" scoped>
.options-menu {
	button {
		box-shadow: none;
		margin: 0px;
		min-width: auto;

		&:hover {
			background-color: transparent;
		}
	}
}

.align-img {
	vertical-align: middle;
}

.pos-relative {
	position: relative;
}

.change-document-btn {
	background-color: transparent;
	box-shadow: none;
	height: auto;
	margin: 0px;
	min-width: auto;
	position: absolute;
	right: 5px;
	top: 10px;
}
</style>
