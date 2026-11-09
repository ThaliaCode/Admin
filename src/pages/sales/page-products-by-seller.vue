<template>
	<div>
		<app-loading
			:show-loading="showLoading"
			label="La carga terminará en un momento y podrás ver
        	toda la información del listado de productos por vendedor"
		/>
		<header-page
			name="suppliers-list-product"
			:title="$route.meta.title"
			show-clean
			to-show
			:show-excel="false"
			@clean-product-filter="cleanFilter"
		>
			<v-menu
				content-class="excel-menu-content"
				offset-y
				:nudge-bottom="5"
				:nudge-left="70"
			>
				<v-btn slot="activator" class="btn-download-excel btn-auto py-1 px-1 mr-3">
					<img src="/static/img/excel.svg" height="17" class="align-img" />
				</v-btn>
				<v-list>
					<v-list-tile
						v-for="item in reportsExcel"
						:key="item.id"
						@click="emitExcel(item)"
					>
						<v-list-tile-title>
							{{ item.name }}
						</v-list-tile-title>
					</v-list-tile>
				</v-list>
			</v-menu>
		</header-page>
		<v-layout>
			<div class="value-container mr-3 ml-4 mt-4">
				<div class="label-container">
					<label class="label-detail secondary--text caption mr-2"
						>Total de Precio de Venta:
					</label>
				</div>
				<p class="value-detail caption">
					<strong>{{ totalPv | round }}</strong>
				</p>
			</div>
			<div class="value-container mr-3 ml-4 mt-4">
				<div class="label-container">
					<label class="label-detail secondary--text caption mr-2"
						>Total de Precio de Compra:
					</label>
				</div>
				<p class="value-detail caption">
					<strong>{{ totalPp | round }}</strong>
				</p>
			</div>
		</v-layout>
		<v-layout class="text-xs-left mb-2 ml-4 mt-4">
			<v-flex xs2 ml-2>
				<autocomplete-component
					chips
					item-text="fullname"
					item-value="id"
					:items="employees"
					label-value="Empleado"
					multiple
					:item="employeeIds"
					@return-data="setData($event, 'employeeIds')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs2 ml-2>
				<products-search-input
					ref="productSearcher"
					ref-value="productSearcher"
					id="productSearcher"
					:clean-input="cleanInput"
					:search-value="selectedProduct"
					:flagInputEvent="true"
					@search="openSearch"
				/>
			</v-flex>
			<v-flex xs2 ml-2>
				<app-date-select
					:date-formatted="startDate"
					label="Fecha Inicial"
					:max-date="params.endDate || maxDate"
					@input="setData($event, 'startDate')"
				/>
			</v-flex>
			<v-flex xs2 ml-2>
				<app-date-select
					:date-formatted="endDate"
					:readonly="!startDate"
					label="Fecha Final"
					:max-date="maxDate"
					:min-date="params.startDate"
					@input="setData($event, 'endDate')"
				/>
			</v-flex>
			<v-flex xs2 ml-2>
				<autocomplete-component
					chips
					item-text="name"
					item-value="id"
					:items="brands"
					label-value="Marca"
					multiple
					:item="brandIds"
					@return-data="setData($event, 'brandIds')"
				></autocomplete-component>
			</v-flex>
		</v-layout>
		<v-layout class="text-xs-left mb-2 ml-4">
			<v-flex xs2 ml-2>
				<categories-autocomplete
					:is-multiple="true"
					multiple
					:item="allCategoryIds"
					:items="categories"
					item-text="name"
					:slot-custom="true"
					item-value="id"
					label-value="Categoría"
					:return-object="false"
					@return-data="setData($event, 'allCategoryIds')"
				></categories-autocomplete>
			</v-flex>
			<v-flex xs2 ml-2>
				<autocomplete-component
					chips
					item-text="name"
					item-value="id"
					:items="units"
					label-value="Unidad"
					multiple
					:item="unitIds"
					@return-data="setData($event, 'unitIds')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs2 ml-2>
				<app-select
					item-text="name"
					item-value="id"
					:items="bonuses"
					label="Bonificados"
					:item="params.flagIsFree"
					@input="setData($event, 'flagIsFree')"
				/>
			</v-flex>
		</v-layout>
		<app-table
			class="mt-3"
			name="products-by-seller"
			:rows="data"
			:columns="columns"
			:input-search="false"
			:last-page="lastPage"
			:items-total-quantity="itemsTotalQuantity"
			:current-page="params.page"
			:items-quantity="data.length"
			@on-search-event="searchEvent"
			@on-page="changePage"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">
					{{ props.row.productCode }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{ props.row.description }}
				</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.categoryName }}
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.brandName || '-' }}
				</td>
				<td v-show="showRow(columns, 5)">
					{{ props.row.benefitGeneral }}
				</td>
				<td v-show="showRow(columns, 6)">
					{{ props.row.unitName }}
				</td>
				<td v-show="showRow(columns, 7)">
					{{ props.row.sale.employee ? props.row.sale.employee.fullname : '-' }}
				</td>
				<td v-show="showRow(columns, 8)">
					{{ props.row.cantidadProducto }}
				</td>
				<td v-show="showRow(columns, 9)">
					{{ props.row.totalPrecioVenta }}
				</td>
				<td v-show="showRow(columns, 10)">
					{{ props.row.totalPrecioCompra }}
				</td>
				<td v-show="showRow(columns, 11)">
					<app-tooltip-button
						icon="remove_red_eye"
						text="Ver Detalle"
						color="primary"
						size="16"
						@click-icon="viewDetail(props.row)"
					/>
				</td>
			</template>
		</app-table>
		<action-sidebar
			:width="action.width"
			:title="action.title"
			:value="action.open"
			@close-modal="closeModal"
		>
			<products-search-form
				v-if="action.code === 'product-searcher'"
				:search-value="searchVal"
				:show-free="allowProductFree"
				@add-product="setProduct"
				is-sale
			/>
			<list-products-by-seller
				v-if="action.code === 'list-products-by-seller'"
				:params="params"
				:row="rowSelected"
				@close-modal="closeModal"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import headerPage from '@/components/shared/header-page';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import listProductsBySeller from '@/components/sales/list-products-by-seller';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import categoriesAutocomplete from '@/components/shared/autocomplete/categories-autocomplete';

const { getDeeper } = lib;

function data() {
	return {
		action: {
			open: false,
			code: '',
			title: '',
			width: 600,
		},
		allCategoryIds: [],
		categoryIds: [],
		subCategoryIds: [],
		bonuses: [
			{
				id: 1,
				name: 'Productos bonificados',
			},
			{
				id: 0,
				name: 'Productos no bonificados',
			},
		],
		brands: [],
		brandIds: [],
		categories: [],
		cleanInput: false,
		columns: [
			{
				id: 1,
				name: 'Código',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Nombre',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Categoria',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Marca',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Beneficio',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Unidad',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Empleado',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Cantidad total',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Total Precio de Venta',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Total Precio de Compra',
				visible: true,
				checked: true,
			},
			{
				id: 11,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		data: [],
		employees: [],
		employeeIds: [],
		maxDate: new Date().toISOString().split('T')[0],
		startDate: null,
		endDate: null,
		searchVal: null,
		selectedProduct: '',
		showLoading: false,
		params: {
			page: 1,
			limit: 20,
			currencies: 'PEN',
			sortField: 'created_at',
			documentTypesNot: 'COT',
			startDate: null,
			endDate: null,
			typeDocumentIds: [52, 3, 5, 1, 2],
			employeeIds: null,
			productId: null,
			search: null,
			categoryIds: null,
			subCategoryIds: null,
		},
		reportsExcel: [
			{
				code: 'product-employee-xlsx',
				name: 'Reporte de producto por vendedor detallado',
			},
			{
				code: 'product-employee-group-xlsx',
				name: 'Reporte de producto por vendedor agrupado',
			},
		],
		rowSelected: null,
		itemsTotalQuantity: 0,
		lastPage: 0,
		totalPp: 0,
		totalPv: 0,
		units: [],
		unitIds: [],
	};
}

async function created() {
	const paramsCat = { flagMain: 1, relationAdd: 'subCategories' };
	const requests = [
		this.globalEmployees(),
		this.brandsList(),
		this.categoriesList(paramsCat),
		this.listOfUnits(),
	];
	const [{ data: employees }, { data: brands }, { data: categories }, { data: units }] =
		await Promise.all(requests);
	this.employees = employees;
	this.brands = brands;
	this.categories = categories;
	this.units = units;
	this.loadData();
}

export default {
	name: 'page-products-by-seller',
	components: {
		headerPage,
		productsSearchInput,
		appTable,
		actionSidebar,
		productsSearchForm,
		listProductsBySeller,
		categoriesAutocomplete,
	},
	created,
	data,
	computed: {
		allowProductFree() {
			const adminUser = helper.getLocalData('admin-user');
			return getDeeper('subsidiary', 'settings', 'allowProductFree')(adminUser);
		},
	},
	methods: {
		setData(value, model) {
			if (model === 'startDate' || model === 'endDate') {
				this[model] = value.value;
				this.params[model] = value.value;
			} else if (model === 'flagIsFree') {
				this.params[model] = value.value.id;
			} else if (model === 'allCategoryIds') {
				this[model] = value;
				const cat = value.filter((id) => this.categories.some((c) => c.id === id));
				const subCat = value.filter((id) =>
					this.categories.some((c) => c.subCategories.some((sc) => sc.id === id))
				);
				this.categoryIds = cat;
				this.subCategoryIds = subCat;
				this.params.categoryIds = cat.length ? cat.join(',') : undefined;
				this.params.subCategoryIds = subCat.length ? subCat.join(',') : undefined;
			} else {
				this[model] = value;
				this.params[model] = value.join(',');
			}
			this.params.page = 1;
			this.loadData();
		},
		openSearch(value) {
			this.cleanInput = false;
			this.searchVal = value ? value.trim() : '';
			if (this.searchVal) {
				this.action.code = 'product-searcher';
				this.action.title = 'Productos';
				this.action.width = 1070;
				this.action.open = true;
			}
		},
		setProduct(prod) {
			this.selectedProduct = prod.name;
			this.params.productId = prod.product.id;
			this.action.open = false;
			this.action.code = null;
			this.loadData();
		},
		closeModal() {
			this.action.open = false;
			this.action.code = null;
			this.action.title = '';
			this.action.width = 0;
			this.searchVal = null;
			this.selectedProduct = '';
		},
		viewDetail(row) {
			if (!this.params.employeeIds) {
				this.showGenericError(
					'Debe seleccionar un empleado para ver el detalle de los productos'
				);
				return;
			}
			this.action.code = 'list-products-by-seller';
			this.action.title = 'Productos';
			this.action.width = 800;
			this.action.open = true;
			this.rowSelected = row;
		},
		async loadData() {
			try {
				this.showLoading = true;
				const params = {
					...this.params,
					typeDocumentIds: this.params.typeDocumentIds.join(','),
				};

				const paramsTotals = { ...params };
				delete paramsTotals.page;
				delete paramsTotals.limit;

				const rows = await this.$httpSales.get('employee-product-details', {
					params: { ...params, flagGroupMode: true },
				});
				const totales = await this.$httpSales.get('employee-product-details', {
					params: { ...paramsTotals, flagShowTotals: true },
				});
				this.lastPage = Number(rows.headers['x-last-page']);
				this.itemsTotalQuantity = Number(rows.headers['x-quantity']);
				this.data = rows.data;
				this.totalPp = totales.data[0].totalCost;
				this.totalPv = totales.data[0].totalPrice;
			} catch (error) {
				this.showGenericError();
			} finally {
				this.showLoading = false;
			}
		},
		changePage(page) {
			this.params.page = page;
			this.loadData();
		},
		cleanFilter() {
			this.cleanInput = true;
			this.params = {
				page: 1,
				limit: 20,
				currencies: 'PEN',
				sortField: 'created_at',
				documentTypesNot: 'COT',
				startDate: null,
				endDate: null,
				typeDocumentIds: [52, 3, 5, 1, 2],
				employeeIds: null,
				productId: null,
				search: null,
				flagIsFree: null,
			};
			this.employeeIds = [];
			this.brandIds = [];
			this.categoryIds = [];
			this.unitIds = [];
			this.searchVal = null;
			this.selectedProduct = '';
			this.startDate = null;
			this.endDate = null;
			this.loadData();
		},
		async emitExcel(report) {
			const { code, name } = report;
			if (!this.params.employeeIds) {
				this.showGenericError(
					'Debe seleccionar solo un empleado para poder generar el reporte'
				);
				return;
			}

			const idsEmployeesSelected = this.params.employeeIds.split(',').map(Number);
			const employees = this.employees.filter((emp) =>
				idsEmployeesSelected.includes(emp.id)
			);

			const employeesNames = employees.map((e) => e.name).join(', ');
			const params = { ...this.params };
			params.code = code;
			params.brandIds = this.brandIds.length ? this.brandIds : null;
			params.categoryIds = this.categoryIds.length ? this.categoryIds : null;
			params.employeeIds = this.employeeIds.length ? this.employeeIds : null;
			params.subCategoryIds = this.subCategoryIds.length ? this.subCategoryIds : null;
			params.unitIds = this.unitIds.length ? this.unitIds : null;
			delete params.page;
			delete params.limit;
			delete params.search;
			delete params.unitId;
			const paramsClean = Object.fromEntries(
				Object.entries(params).filter(([key]) => params[key] !== null)
			);
			const body = {
				filename: `${name} del empleado ${employeesNames}`,
				extension: 'xlsx',
				params: paramsClean,
			};
			try {
				await this.$httpReports.post(`documents/${code}`, body);
				this.notificationReport('reporte de productos por vendedor');
			} catch (error) {
				this.showGenericError();
			}
		},
		searchEvent(searchValue) {
			if (searchValue) {
				this.params.search = searchValue;
			} else {
				this.params.search = null;
			}
			this.params.page = 1;
			this.loadData();
		},
	},
};
</script>
<style lang="scss" scoped>
.label-container {
	background-color: color(border-green-light);
	display: inline-flex;
	height: 31px;
	line-height: 31px;
	padding-left: 5px;
}

.label-detail {
	font-family: font(open-semibold);
}

.value-container {
	align-items: center;
	background-color: color(green-extra-l);
	display: flex;
	height: 31px;
	min-width: 205px;
	padding-right: 11px;
	width: fit-content;
}

.value-detail {
	color: color(paginationText);
	font-family: font(open-regular);
	display: inline-flex;
	margin-bottom: 0px;
	padding-left: 15px;
}
</style>
