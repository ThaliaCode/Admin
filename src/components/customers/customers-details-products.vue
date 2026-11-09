<template>
	<div>
		<app-table
			class="is-not-selectable no-main-list mt-4"
			name="customers-details-products"
			:clean-search="isClean"
			:columns="columns"
			:inputSearch="true"
			:current-page="currentPage"
			:last-page="lastPage"
			:items-quantity="products.length"
			:items-total-quantity="detailQuantity"
			:rows="productsFiltered"
			@on-search-event="callServiceAndSearch"
			@on-page="loadData"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.description }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{
						props.row.product ? props.row.product.name : props.row.productCode
					}}
				</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.document }}
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.date | formatDate }}
				</td>
				<td v-show="showRow(columns, 5)">
					{{ props.row.quantity }}
				</td>
				<td v-show="showRow(columns, 6)">
					{{ props.row.price | round }}
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

function created() {
	this.loadData();
}

async function loadData(page = 1) {
	this.currentPage = page;
	this.params.page = page;
	try {
		({ data: this.products, headers: this.headers } = await this.$httpSales.get(
			`customer/${this.customerId}/products`,
			{ params: this.params }
		));
		this.lastPage = Number(this.headers['x-last-page']);
		this.detailQuantity = Number(this.headers['x-quantity']);
		this.productsFiltered = [...this.products];
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function onLocalSearch(searchValue) {
	const searchTrim = searchValue ? searchValue.trim() : null;
	this.params.search = searchTrim;
	this.loadData();
}

function data() {
	return {
		columns: [
			{
				id: 1,
				checked: true,
				name: 'Nombre Prod.',
				tooltip: 'Nombre del Producto',
				value: 'product.name',
				visible: true,
			},
			{
				id: 2,
				checked: true,
				name: 'Código Prod.',
				tooltip: 'Código del Producto',
				value: 'product.name',
				visible: true,
			},
			{
				id: 3,
				checked: true,
				name: '# Doc.',
				value: 'document',
				visible: true,
			},
			{
				id: 4,
				checked: true,
				name: 'Fecha',
				value: 'date',
				visible: true,
			},
			{
				id: 5,
				checked: true,
				name: 'Cantidad',
				value: 'quantity',
				visible: true,
			},
			{
				id: 6,
				checked: true,
				name: 'Precio Unit.',
				value: 'price',
				visible: true,
			},
		],
		currentPage: 1,
		detailQuantity: 0,
		params: {
			limit: 20,
			page: 1,
			search: null,
		},
		isClean: false,
		lastPage: 0,
		products: [],
		productsFiltered: [
			{
				product: {
					name: '',
				},
			},
		],
	};
}

export default {
	name: 'customers-details-products',
	components: {
		appTable,
	},
	created,
	data,
	methods: {
		loadData,
		onLocalSearch,
		callServiceAndSearch(search) {
			this.searchData = search;
			this.params.search = search || null;
			this.loadData();
		},
	},
	props: {
		customerId: [Number, String],
	},
};
</script>
