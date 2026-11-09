<template>
	<div>
		<header-page
			name="sales-category"
			:title="$route.meta.title"
			@clean-product-filter="clearFilter"
			@emit-excel="emitExcel"
			:emit-excel="true"
			:excel-loading="isLoading"
			to-show
		></header-page>
		<general-filter>
			<v-layout>
				<v-flex xs4 mt-2 d-flex align-end>
					<autocomplete-component
						chips
						item-text="name"
						item-value="id"
						:items="warehouses"
						label-value="Tienda"
						multiple
						:return-object="false"
						:item="warehouseIds"
						@return-data="setData($event)"
					></autocomplete-component>
				</v-flex>
				<v-flex xs2 ml-3 pt-2 d-flex align-end>
					<app-date-select
						:date-formatted="params.startDate"
						label="Fecha de inicio"
						model="startDate"
						@input="getDate"
					/>
				</v-flex>
				<v-flex xs2 ml-3 pt-2 d-flex align-end>
					<app-date-select
						:date-formatted="params.endDate"
						label="Fecha de fin"
						model="endDate"
						@input="getDate"
					/>
				</v-flex>
				<v-flex xs1 ml-3 mt-2 pt-4 class="wrapper-btn" d-flex align-end>
					<v-btn
						type="button"
						color="success"
						class="btn-action btn-action-block"
						@click="searchDataFiltered"
					>
						Buscar
						<v-icon color="white" size="16"> check_circle_outline </v-icon>
					</v-btn>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto mt-4">
			<app-table
				name="sales-category"
				:inputSearch="false"
				:filterColumns="false"
				:columns="columns"
				:rows="rows"
				:main-list="false"
				class="is-not-selectable"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">
						{{ props.row.warehouseName }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.categoryName }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.totalQuantity }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.unitName }}</td>
					<td v-show="showRow(columns, 5)">
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click.stop="goToDetail(props.row)"
								:disabled="!(params.endDate && params.startDate)"
							>
								<v-icon color="primary">remove_red_eye</v-icon>
							</v-btn>
							<span>Detalle</span>
						</v-tooltip>
					</td>
				</template>
			</app-table>
		</div>
	</div>
</template>
<script>
import appDateSelect from '@/components/shared/app-date-select';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import appTable from '@/components/shared/table/app-table';
import { differenceInDays, subMonths, format } from 'date-fns';
import helper from '@/shared/helper';

function clearFilter() {
	this.warehouseIds = [];
	this.loadReports();
}

function created() {
	this.params.startDate = format(subMonths(this.$today(), 1), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	this.loadData();
	this.loadReports();
}

async function loadData() {
	const { data: response } = await this.$httpProducts.get('warehouses');
	this.warehouses = response;
	this.warehouses.unshift({ id: 0, name: 'Seleccionar todos' });
}

function setData(value) {
	const selectAllSelected = value.includes(0);
	if (selectAllSelected) {
		// Si "Seleccionar todos" está marcado, asignamos todos los ids
		this.warehouseIds =
			this.warehouseIds.length === this.warehouses.length - 1
				? []
				: this.warehouses.map((w) => w.id).filter((id) => id !== 0);
	} else {
		// Si "Seleccionar todos" no está seleccionado, asignamos solo los ids seleccionados
		this.warehouseIds = value;
	}
}

function onDate(value, modelName) {
	this.params[modelName] = value;
}

function searchDataFiltered() {
	if (this.params.startDate && this.params.endDate) {
		const flag =
			differenceInDays(this.params.endDate, this.params.startDate) >= 0;
		if (flag && this.warehouseIds.length) {
			this.loadReports({ warehouseIds: this.warehouseIds });
		} else if (flag) {
			this.loadReports();
		} else {
			this.showNotification(
				'La fecha inicial no debe ser mayor a la final',
				'info'
			);
		}
	} else if (this.warehouseIds.length) {
		this.loadReports({ warehouseIds: this.warehouseIds });
	}
}

async function loadReports(body = null) {
	try {
		const { data: response } = await this.$httpReportSales.post(
			'sales-category-report',
			body,
			{ params: this.params }
		);
		this.rows = response;
	} catch (error) {
		this.showGenericError('Error');
	}
}

function goToDetail(item) {
	const query = {
		startDate: this.params.startDate,
		endDate: this.params.endDate,
		categoryId: item.categoryId,
		unitId: item.unitId,
		warehouseId: item.warWarehousesId,
		warehouseName: item.warehouseName,
		categoryName: item.categoryName,
		unitName: item.unitName,
	};
	this.goTo('detail-report-category', { query });
}

async function emitExcel() {
	const arrayWarehouses = this.warehouses.map((w) => w.id);
	this.isLoading = true;
	const body = {
		warehouseIds: this.warehouseIds.length
			? this.warehouseIds
			: arrayWarehouses,
		code: 'xlsx',
	};
	const params = {
		startDate: this.params.startDate,
		endDate: this.params.endDate,
	};
	try {
		const { data: blobData } = await this.$httpReportSales.post(
			'report-sale-categories',
			body,
			{ responseType: 'blob', params }
		);
		const blobResponse = helper.generateBlob(
			blobData,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		helper.showDownloadDialog(blobResponse, 'report-sales-categories', 'xlsx');
	} catch (error) {
		this.showGenericError();
	} finally {
		this.isLoading = false;
	}
}

function getDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function data() {
	return {
		warehouses: [],
		warehouseIds: [],
		params: {
			startDate: null,
			endDate: null,
		},
		rows: [],
		columns: [
			{ id: 1, name: 'Tienda', visible: true, checked: true },
			{ id: 2, name: 'Categoría', visible: true, checked: true },
			{ id: 3, name: 'Cantidad', visible: true, checked: true },
			{ id: 4, name: 'UND', visible: true, checked: true },
			{ id: 5, name: 'Acciones', visible: true, checked: true },
		],
		isLoading: false,
	};
}

export default {
	name: 'report-sales-category',
	components: {
		appDateSelect,
		autocompleteComponent,
		headerPage,
		generalFilter,
		appTable,
	},
	created,
	data,
	methods: {
		clearFilter,
		getDate,
		loadData,
		setData,
		onDate,
		searchDataFiltered,
		loadReports,
		goToDetail,
		emitExcel,
	},
};
</script>
<style lang="scss" scoped>
.link-icon {
	text-decoration: none;
}

.wrapper-btn {
	height: 74px;
}
</style>
