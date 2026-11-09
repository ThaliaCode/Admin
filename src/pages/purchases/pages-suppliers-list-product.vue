<template>
	<div>
		<app-loading
			:show-loading="showLoading"
			label="La carga terminará en un momento y podrás ver
        	toda la información del listado de ventas"
		/>
		<header-page
			name="suppliers-list-product"
			:title="$route.meta.title"
			to-show
			:show-clean="false"
			show-excel
			:emit-excel="true"
			@emit-excel="emitExcel"
		/>
		<v-layout class="text-xs-left mb-2 ml-4 mt-4">
			<div class="value-container mr-3">
				<div class="label-container">
					<label class="label-detail secondary--text caption mr-2"
						>Total de productos comprados:</label
					>
				</div>
				<p class="value-detail caption">
					<strong>{{ totalItems }}</strong>
				</p>
			</div>
			<div class="value-container">
				<div class="label-container">
					<label class="label-detail secondary--text caption mr-2"
						>Proveedor:</label
					>
				</div>
				<p class="value-detail caption">
					<strong>{{ rows[0] ? rows[0].supplierName : '' }}</strong>
				</p>
			</div>
		</v-layout>
		<v-flex xs3 mt-3 ml-4>
			<app-select
				:item="salPriceListId"
				:items="listPrices"
				item-text="name"
				item-value="id"
				label="Lista de precio"
				model="salPriceListId"
				:return-object="false"
				@input="setPriceList"
			></app-select>
		</v-flex>
		<div class="overflow-auto">
			<app-table
				name="suppliers-list-product"
				class="is-not-selectable mt-4"
				:columns="columns"
				:rows="rows"
				:current-page="currentPage"
				:last-page="lastPage"
				:items-quantity="rows.length"
				@on-search-event="searchProduct"
				@on-column-sortable="columnSortable"
				@on-page="changePage"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">
						{{ props.row.typeDocumentName }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.documentNumber }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.purDate }}</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.productCode || '-' }}
					</td>
					<td v-show="showRow(columns, 5)">{{ props.row.productName }}</td>
					<td v-show="showRow(columns, 6)">
						{{ props.row.stock || '-' }}
					</td>
					<td v-show="showRow(columns, 7)">
						{{ props.row.quantity || '-' }}
					</td>
					<td v-show="showRow(columns, 8)">
						{{ props.row.priceSale || '-' }}
					</td>
					<td v-show="showRow(columns, 9)">
						{{ props.row.price || '-' }}
					</td>
					<td v-show="showRow(columns, 10)">
						{{ props.row.categoryName || '-' }}
					</td>
					<td v-show="showRow(columns, 11)">
						<app-tooltip-button
							height="22"
							class="ml-1"
							color="primary"
							icon="manage_search"
							text="Visualizar Stock"
							@click-icon="viewSlide(props.row, 'vs')"
						></app-tooltip-button>
						<app-tooltip-button
							height="22"
							class="ml-1"
							icon="list"
							text="Lista de compras por producto"
							@click-icon="viewSlide(props.row, 'lp')"
						></app-tooltip-button>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			:width="action.width"
			:title="action.title"
			:value="action.open"
			@close-modal="closeModal"
		>
			<view-stock
				v-if="action.code === 'vs'"
				:product-id="productId"
				:brand-product="brandNameProduct"
				@close-modal="closeModal"
				@save="closeModal"
			/>
			<list-products
				v-if="action.code === 'lp'"
				:product-id="productId"
				@close-modal="closeModal"
			/>
		</action-sidebar>
	</div>
</template>
<script>
import actionSidebar from '@/components/shared/action-sidebar';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import viewStock from '@/components/products/view-stock';
import listProducts from '@/components/products/list-products';
import helper from '@/shared/helper';

function data() {
	return {
		rows: [],
		showLoading: false,
		currentPage: 1,
		lastPage: 0,
		columns: [
			{
				id: 1,
				name: 'Tipo de Documento',
				value: 'typeDocumentName',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Numero de Documento',
				value: 'documentNumber',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Fecha',
				value: 'purDate',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Codigo',
				value: 'productCode',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Producto',
				value: 'productName',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Stock',
				value: 'stock',
				visible: true,
				checked: true,
				isSortable: { down: true, value: 'stock', up: false },
			},
			{
				id: 7,
				name: 'Cantidad',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'PV',
				value: 'priceSale',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Costo Unitario',
				value: 'price',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Categoria',
				value: 'categoryName',
				visible: false,
				checked: false,
			},
			{
				id: 11,
				name: 'Acción',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		totalItems: 0,
		productId: null,
		brandNameProduct: null,
		action: {
			code: '',
			open: false,
			title: '',
			width: 900,
		},
		params: {
			search: null,
			limit: 30,
			page: 1,
		},
		listPrices: [],
		salPriceListId: null,
	};
}

function created() {
	this.loadData();
}

async function loadData(page = 1) {
	const { id } = this.$route.params;
	this.params.flagProductDistinct = true;
	this.params.page = page;
	this.showLoading = true;
	this.currentPage = page;
	try {
		({ data: this.listPrices } = await this.$httpSales.get('sal-price-lists'));
		const firstRow = await this.$httpSales.get('purchase-details-report', {
			params: {
				...this.params,
				supplierId: id,
			},
		});
		this.lastPage = Number(firstRow.headers['x-last-page']);
		this.salPriceListId = this.$userInfo.salPriceList.id;
		if (firstRow.data.length) {
			const body = {
				ids: firstRow.data.map(({ productId }) => productId),
			};
			const { data: rowsData } = await this.$httpProducts.post(
				'e-products/by-ids',
				body
			);
			this.rows = rowsData.map((item1) => {
				const match = firstRow.data.find(
					(item2) => item2.productId === item1.id
				);
				return {
					priceSale: item1.priceList[this.salPriceListId].price,
					...item1,
					...match,
				};
			});
		} else {
			this.rows = [];
		}
		this.totalItems = firstRow.data.reduce(
			(total, item) => total + item.quantity,
			0
		);
	} catch (error) {
		this.showGenericError();
	} finally {
		this.showLoading = false;
	}
}

export default {
	name: 'suppliers-list-product',
	created,
	data,
	components: {
		headerPage,
		appTable,
		actionSidebar,
		viewStock,
		listProducts,
	},
	methods: {
		loadData,
		changePage(page) {
			this.currentPage = page;
			this.loadData(page);
		},
		columnSortable(col) {
			const newColumn = { ...col };
			newColumn.isSortable.down = !col.isSortable.down;
			newColumn.isSortable.up = !col.isSortable.up;
			this.columns = this.columns.map((c) => {
				const newCol = { ...c };
				if (c.isSortable) {
					newCol.isSortable.up = newColumn.isSortable.up;
					newCol.isSortable.down = newColumn.isSortable.down;
				}
				return newCol;
			});
			if (newColumn.isSortable.up) {
				this.rows.sort((a, b) => b.stock - a.stock);
			} else {
				this.rows.sort((a, b) => a.stock - b.stock);
			}
		},
		async emitExcel() {
			const columns = this.columns.map((col) => ({
				value: col.value,
				name: col.name,
			}));
			const code = 'xlsx';
			const name = 'Reporte de Listado de Productos';
			columns.pop();
			const body = {
				code,
				columns,
				rows: this.rows,
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
				this.showNotification('El reporte fue descargado correctamente.');
			} catch (error) {
				this.showGenericError();
			}
		},
		setPriceList({ value }) {
			this.salPriceListId = value;
		},
		closeModal() {
			this.action.open = false;
			this.action.code = '';
			this.action.title = '';
		},
		viewSlide(item, code) {
			this.action = {
				open: true,
				code,
				title: `${item.productName}`,
				width: 900,
			};
			this.productId = item.productId;
			this.brandNameProduct = item.brandSimple ? item.brandSimple.name : '';
		},
		searchProduct(searchValue) {
			if (searchValue) {
				this.params.search = searchValue;
			} else {
				this.params.search = null;
			}
			this.currentPage = 1;
			this.loadData();
		},
	},
	watch: {
		salPriceListId(priceListId) {
			this.rows = this.rows.map((row) => ({
				...row,
				priceSale: row.priceList[priceListId]
					? row.priceList[priceListId].price
					: 'S/P',
			}));
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
