<template>
	<div>
		<header-page
			name="sales-category"
			:title="$route.meta.title"
			to-show
			@emit-excel="emitExcel"
			:emit-excel="true"
			:excel-loading="isLoading"
		></header-page>
		<v-layout px-4 py-3>
			<v-flex xs3>
				<p><span class="bold">{{labelWarehouse()}}: </span><span>{{$route.query.warehouseName}}</span></p>
			</v-flex>
			<v-flex xs3>
				<p><span class="bold">Categoría: </span><span>{{$route.query.categoryName}}</span></p>
			</v-flex>
			<v-flex xs3>
				<p><span class="bold">UND: </span><span>{{$route.query.unitName}}</span></p>
			</v-flex>
		</v-layout>
		<div class="overflow-auto mt-4">
			<app-table
				name="sales-detail-category"
				:columns="columns"
				:rows="rows"
				:current-page="currentPage"
				:last-page="lastPage"
				@on-page="changePage"
				:input-search="false"
				:filter-columns="false"
				class="is-not-selectable"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.productCode }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.totalQuantity }}</td>
				</template>
			</app-table>
		</div>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import helper from '@/shared/helper';

function data() {
	return {
		columns: [
			{ id: 1, name: 'Código', visible: true, checked: true },
			{ id: 2, name: 'Producto', visible: true, checked: true },
			{ id: 3, name: 'Cantidad', visible: true, checked: true },
		],
		rows: [],
		lastPage: 0,
		currentPage: 1,
		params: {
			page: '',
		},
		isLoading: false,
	};
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

async function loadData() {
	const params = {
		startDate: this.$route.query.startDate,
		endDate: this.$route.query.endDate,
		page: this.currentPage,
	};
	const body = {
		categoryId: this.$route.query.categoryId,
		unitId: this.$route.query.unitId,
		warehouseId: this.$route.query.warehouseId,
	};
	try {
		const response = await this.$httpSales.post('sales-category-detail-report', body, { params });
		this.rows = response.data.results;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError('Error');
	}
}

function created() {
	this.loadData();
}

async function emitExcel() {
	this.isLoading = true;
	const body = {
		categoryId: Number(this.$route.query.categoryId),
		unitId: Number(this.$route.query.unitId),
		warehouseId: Number(this.$route.query.warehouseId),
		code: 'xlsx',
	};
	const params = {
		startDate: this.$route.query.startDate,
		endDate: this.$route.query.endDate,
	};
	try {
		const { data: blobData } = await this.$httpSales.post('report-sale-category-detail', body, { responseType: 'blob', params });
		const blobResponse = helper.generateBlob(blobData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		helper.showDownloadDialog(blobResponse, 'report-sales-category-detail', 'xlsx');
	} catch (error) {
		this.showGenericError();
	} finally {
		this.isLoading = false;
	}
}

export default {
	name: 'detail-reports-sales',
	data,
	components: {
		headerPage,
		appTable,
	},
	created,
	methods: {
		changePage,
		loadData,
		emitExcel,
	},
	props: {
		id: [Number, String],
	},
};
</script>
<style lang="scss" scoped>
	.bold {
		color: color(primary);
		font-weight: 800,
	}
</style>


