<template>
	<div>
		<header-page :title="$route.meta.title" />
		<div class="overflow-auto overflow-background">
			<app-table
				name="products-history"
				:columns="columns"
				:current-page="currentPage"
				:rows="data"
				local-storage
				:check-all="checkAll"
				:last-page="lastPage"
				@on-toggle-columns="toggleColumns"
				v-on:on-search-event="callServiceAndSearch"
				v-on:on-page="changePage">
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable"
						v-show="showRow(columns, 1)">{{ props.row.entryNumber }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.warehouseName }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.entryDate }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.productsNumber }}</td>
					<td v-show="showRow(columns, 5)">
						<v-tooltip top>
							<v-btn
								slot="activator"
								class="table-icon"
								icon
								type="button"
								v-on:click="downloadDocument(props.row)">
								<img :src="`${$imageUrl}/icon-excel-green.svg`" alt="">
							</v-btn>
							<span>Descargar excel</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								class="table-icon btn-action btn-auto"
								type="button"
								icon
								v-on:click="seeDetails(props.row)">
								<img :src="`${$imageUrl}/see-details.svg`" alt="">
							</v-btn>
							<span>Ver detalle</span>
						</v-tooltip>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			v-if="rowSelected"
			v-model="action.open"
			v-on:close-modal="closeModal"
			:code-action="action.code"
			:is-loading="loading"
			:help-actions="actionsToHelp"
			:title="`Ingreso #${rowSelected.entryNumber}`"
			:width="action.width">
			<div class="overflow-auto">
				<app-table
					name="entryDetails"
					:columns="columnsDetail"
					:rows="rowsDetail"
					local-storage
					:main-list="false"
					:input-search="false"
					:filter-columns="false">
					<template slot="rows" slot-scope="props">
						<td
							class="is-not-selectable"
							v-show="showRow(columnsDetail, 1)">{{ props.row.name }}</td>
						<td v-show="showRow(columnsDetail, 2)">{{ props.row.code }}</td>
						<td v-show="showRow(columnsDetail, 3)">{{ props.row.model }}</td>
						<td v-show="showRow(columnsDetail, 4)">{{ props.row.inlineFeatures }}</td>
						<td v-show="showRow(columnsDetail, 5)">{{ props.row.categoryName }}</td>
						<td v-show="showRow(columnsDetail, 6)">{{ props.row.quantity }}</td>
					</template>
				</app-table>
			</div>
		</action-sidebar>
	</div>
</template>

<script>
	import actionSidebar from './../shared/action-sidebar';
	import appTable from './../shared/table/app-table';
	import headerPage from './../shared/header-page';

	function callServiceAndSearch(search) {
		this.searchData = search;
		if (search) {
			this.params.search = search;
		} else {
			this.params.search = null;
		}
		this.currentPage = 1;
		const indexWarehouse = this.columns.findIndex(p => p.value === 'warehouseName');
		this.columns[indexWarehouse].name = this.labelWarehouse();
		this.loadData();
	}

	function changePage(page) {
		this.currentPage = page;
		this.loadData(page);
	}

	function closeModal() {
		this.rowsDetail = [];
		this.rowSelected = null;
		this.action.open = false;
	}

	function columnsToExport() {
		const newColumns = this.columnsDetail.map((col) => {
			const newCol = Object.assign({}, col);
			delete newCol.id;
			delete newCol.visible;
			delete newCol.checked;
			return newCol;
		});
		return newColumns;
	}

	function created() {
		const indexWarehouse = this.columns.findIndex(o => o.value === 'warehouseName');
		this.columns[indexWarehouse].name = this.labelWarehouse();
		this.loadData();
	}

	function dataToExport() {
		let tableDataToExport = [];
		const columnsValues = this.columnsDetail.map((colVal) => {
			const newColVal = Object.assign({}, colVal);
			return newColVal.value;
		});
		if (this.rowsDetail.length > 0) {
			tableDataToExport = this.rowsDetail.map((dataExport) => {
				const newData = Object.assign({}, dataExport);
				const keysData = Object.keys(dataExport);
				keysData.forEach((keyData) => {
					if (columnsValues.every(keyCol => keyCol !== keyData)) {
						delete newData[keyData];
					}
				});
				return newData;
			});
		}
		return tableDataToExport;
	}

	function downloadDocument(row) {
		this.rowSelected = Object.assign({}, row);
		this.export = true;
	}

	async function loadData(page = 1) {
		this.params.page = page;
		try {
			const response = await this.$httpProducts.get('transfers/IM/type-document', { params: this.params });
			this.data = response.data.map((rowData) => {
				const newData = Object.assign({}, rowData);
				newData.entryNumber = `${rowData.serie}-${rowData.number}`;
				newData.warehouseName = rowData.warehouseDestination.name;
				newData.productsNumber = rowData.details.length;
				return newData;
			});
			this.lastPage = Number(response.headers['x-last-page']);
		} catch (err) {
			this.showGenericError();
		}
	}

	async function loadDetails(id) {
		try {
			const response = await this.$httpProducts.get(`transfers/${id}/list-details`);
			this.rowsDetail = response.data;
			if (this.export) {
				this.exportTable(this.columnsToExport, this.dataToExport, `Ingreso #${this.rowSelected.entryNumber}`);
				this.export = false;
			}
		} catch (err) {
			this.showGenericError();
		}
	}

	function rowSelected(val) {
		if (val) {
			return this.loadDetails(val.id);
		}
		return null;
	}

	function seeDetails(row) {
		this.rowSelected = Object.assign({}, row);
		this.action.open = true;
	}

	function toggleColumns() {
		return true;
	}

	function data() {
		return {
			action: {
				code: 'DIM',
				open: false,
				width: 674,
			},
			checkAll: false,
			columns: [
				{ id: 1, name: 'Número', value: 'entryNumber', visible: true, checked: true },
				{ id: 2, name: 'Tienda', value: 'warehouseName', visible: true, checked: true },
				{ id: 3, name: 'Fecha de ingreso', value: 'entryDate', visible: true, checked: true },
				{ id: 4, name: '# Productos', value: 'productsNumber', visible: true, checked: true },
				{ id: 5, name: 'Acciones', visible: true, checked: true, flagVisible: true },
			],
			columnsDetail: [
				{ id: 1, name: 'Producto', value: 'name', visible: true, checked: true },
				{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
				{ id: 3, name: 'Model', value: 'model', visible: true, checked: true },
				{ id: 4, name: 'Características', value: 'inlineFeatures', visible: true, checked: true },
				{ id: 5, name: 'Categoría', value: 'categoryName', visible: true, checked: true },
				{ id: 6, name: 'Cantidad', value: 'quantity', visible: true, checked: true },
			],
			currentPage: 1,
			data: [],
			export: false,
			lastPage: 0,
			loading: false,
			params: {
				page: null,
				search: null,
			},
			rowsDetail: [],
			rowSelected: null,
			searchData: '',
		};
	}

	export default {
		name: 'products-history',
		components: {
			actionSidebar,
			appTable,
			headerPage,
		},
		computed: {
			columnsToExport,
			dataToExport,
		},
		created,
		data,
		methods: {
			callServiceAndSearch,
			changePage,
			closeModal,
			downloadDocument,
			loadData,
			loadDetails,
			seeDetails,
			toggleColumns,
		},
		watch: {
			rowSelected,
		},
	};
</script>

<style lang="scss" scoped>
	.overflow-auto {
		&.overflow-background {
			background-color: map-get($colors, background-table);
			border-top: 2px solid map-get($colors, header);
			min-height: calc(100vh - 145px);
			padding: 30px 11.5px;
		}
	}
</style>
