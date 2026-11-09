<template>
	<div>
		<header-page
			:document="$route.meta.title"
			:title="` - ${code}`"
			:show-excel="false"
			to-show
			@clean-product-filter="onClean"
		/>
		<div class="d-block text-xs-right ma-3">
			<router-link :to="pathNewKardex">
				<v-icon color="primary">visibility</v-icon>
				Ir a versión nueva de kardex
			</router-link>
		</div>
		<general-filter class="layout px-4">
			<v-flex md3 mt-3>
				<v-layout wrap>
					<v-flex xs6 pr-2>
						<v-menu
							lazy
							v-model="menuStart"
							transition="scale-transition"
							offset-y
							full-width
						>
							<v-text-field
								slot="activator"
								label="Fecha de inicio"
								v-model="params.startDate"
								single-line
								append-icon="event"
								class="filter-select shadow-inset-calendar shadow-inset-calendar-start"
								readonly
							></v-text-field>
							<v-date-picker
								v-model="params.startDate"
								no-title
								scrollable
							></v-date-picker>
						</v-menu>
					</v-flex>
					<v-flex xs6 pl-2>
						<v-menu
							lazy
							v-model="menuEnd"
							transition="scale-transition"
							offset-y
							full-width
						>
							<v-text-field
								slot="activator"
								label="Fecha de fin"
								v-model="params.endDate"
								single-line
								append-icon="event"
								class="filter-select shadow-inset-calendar shadow-inset-calendar-end"
								readonly
							></v-text-field>
							<v-date-picker
								v-model="params.endDate"
								no-title
								scrollable
							></v-date-picker>
						</v-menu>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex md5 px-2 mt-3>
				<autocomplete-component
					placeholder-value="Tipo de Documento"
					item-text="name"
					item-value="id"
					:items="typeMovements"
					local-search
					:return-object="false"
					:item="params.documentType"
					@return-data="getValue({ model: 'documentType', value: $event })"
				></autocomplete-component>
			</v-flex>
			<v-flex pl-2 mt-3>
				<v-btn
					type="button"
					color="primary"
					class="btn-action"
					v-on:click="loadData"
				>
					Ver Kardex
				</v-btn>
			</v-flex>
		</general-filter>
		<div class="overflow-auto pb-0">
			<app-table
				name="kardex"
				:columns="columns"
				:rows="data"
				local-storage
				:filter-columns="false"
				:input-search="false"
				:main-list="false"
				class="is-not-selectable no-main-list"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">
						<a @click.prevent="showDocument(props.row)">
							{{ props.row.documentNumber }}
						</a>
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.documentType }}</td>
					<td v-show="showRow(columns, 3)">
						<span v-if="props.row.quantityIn">{{ props.row.quantityIn }}</span>
						<span v-else>-</span>
					</td>
					<td v-show="showRow(columns, 4)">
						<span v-if="props.row.quantityOut">{{
							props.row.quantityOut
						}}</span>
						<span v-else>-</span>
					</td>
					<td v-show="showRow(columns, 5)">
						<span v-if="props.row.quantityIn">{{
							props.row.operationDate | formatDate
						}}</span>
						<span v-else>-</span>
					</td>
					<td v-show="showRow(columns, 6)">
						<span v-if="props.row.quantityOut">{{
							props.row.operationDate | formatDate
						}}</span>
						<span v-else>-</span>
					</td>
					<td v-show="showRow(columns, 7)">{{ props.row.description }}</td>
				</template>
			</app-table>
		</div>
		<div class="actual-stock">
			<table width="100%">
				<tr>
					<td colspan="6" class="text-xs-right pr-1">Stock actual:</td>
					<td class="pl-1">{{ actualStock }}</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<script>
import format from 'date-fns/format';
import helper from '@/shared/helper';
import subMonths from 'date-fns/sub_months';
import appTable from './../shared/table/app-table';
import autocompleteComponent from './../shared/autocomplete/autocomplete-component';
import generalFilter from './../shared/general-filter';
import headerPage from './../shared/header-page';

async function created() {
	this.params.startDate = format(subMonths(this.$today(), 1), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	await this.filterData();
	await this.loadData();
	const masterProduct = await this.getMasterProduct();
	const warehouseProduct = masterProduct.warehouseProductDetails.find(
		(wp) => wp.id === Number(this.warehouseId)
	);
	const warProductId =
		warehouseProduct && warehouseProduct.warWarhouseProductId;
	this.pathNewKardex = `/inventories/${this.productId}/${this.warehouseId}/${this.brandId}/new-kardex?warProductId=${warProductId}`;
}

async function filterData() {
	try {
		({ data: this.typeMovements } = await this.$httpProducts.get(
			'kardex/type-movements'
		));
	} catch (err) {
		this.showGenericError();
	}
}

function getValue({ model, value }) {
	if (value) {
		this.params[model] = value;
	}
}

async function loadData() {
	const request = [
		this.$httpProducts.get(
			`products/${this.productId}/kardex/${this.warehouseId}/${this.brandId}`,
			{ params: this.params }
		),
		this.$httpProducts.get(
			`products/${this.productId}/kardex/${this.warehouseId}/${this.brandId}/total`
		),
	];
	try {
		const responses = await Promise.all(request);
		this.data = responses[0].data;
		const stock = responses[1].data[0];
		this.actualStock = stock.sumQuantityIn - stock.sumQuantityOut;
	} catch (err) {
		this.showGenericError();
	}
}

function onClean() {
	delete this.params.documentType;
	this.params.endDate = this.$today();
	this.params.startDate = format(subMonths(this.$today(), 1), 'YYYY-MM-DD');
	this.loadData();
}

function search(val) {
	return this.searchProducts(val);
}

function searchByDate() {
	this.params.startDate = this.startDate;
	this.params.endDate = this.endDate;
	if (this.params.startDate && this.params.endDate) {
		this.currentPage = 1;
		this.loadData();
	}
}

async function searchProducts(value) {
	const searchTrim = value ? value.trim() : '';
	if (searchTrim) {
		this.loading = true;
		try {
			const response = await this.$httpProducts.get('v2/products', {
				params: { code: searchTrim },
			});
			this.products = response.data;
			this.loading = false;
		} catch (err) {
			this.showGenericError();
			this.loading = false;
		}
	}
}

function data() {
	return {
		actualStock: null,
		brands: [],
		columns: [
			{
				id: 1,
				name: '# DOC',
				value: 'documentNumber',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Documento',
				value: 'documentType',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Entrada',
				value: 'quantityIn',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Salida',
				value: 'quantityOut',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Fecha de entrada',
				value: 'operationDate',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Fecha de salida',
				value: 'operationDate',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Descripción',
				value: 'description',
				visible: true,
				checked: true,
			},
		],
		data: [],
		loading: false,
		menuEnd: false,
		menuStart: false,
		params: {
			endDate: null,
			startDate: null,
		},
		products: [],
		search: null,
		typeMovements: [],
		warehouses: [],
		pathNewKardex: '',
	};
}

async function showDocument({
	documentId,
	documentType,
	moduleName,
	documentKardexId,
}) {
	const codes = ['IMI', 'SMI'];
	// const codesDetail = ['BOLETA', 'FACTURA', 'NOTA DE VENTA'];
	if (codes.includes(documentType)) {
		try {
			const { data: inventory } = await this.$httpProducts.get(
				`inventories/${documentId}/id`
			);
			this.goTo('inventory-detail', {
				params: { inventoryId: inventory.inventoryId },
			});
		} catch (error) {
			this.showGenericError('El documento de venta no fue encontrado.');
		}
	} else if (moduleName === 'TRANSFERENCIA') {
		this.goTo('pages-transfers-detail', {
			params: { id: documentId },
			query: { status: 3 },
		});
	} else if (moduleName === 'COMPRAS') {
		this.goTo('purchase-detail', { params: { id: documentId } });
	} else if (moduleName === 'VENTAS') {
		try {
			const { data: sale } = await this.$httpSales.get(
				`sale-documents/${documentId}`
			);
			this.goTo('convert', { params: { id: sale.id } });
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'SALE_NOT_FOUND') {
					this.showNotification(
						'El documento de venta no fue encontrado.',
						'error'
					);
				}
			}
		}
	} else {
		this.goTo('detail-kardex-movement', { params: { id: documentKardexId } });
	}
}

export default {
	name: 'kardex',
	components: {
		appTable,
		autocompleteComponent,
		generalFilter,
		headerPage,
	},
	created,
	data,
	methods: {
		filterData,
		getValue,
		loadData,
		onClean,
		searchByDate,
		searchProducts: helper.debounce(searchProducts),
		showDocument,
		async getMasterProduct() {
			const response = await this.$httpProducts.get(
				`products/master/${this.productId}`
			);
			return response.data;
		},
	},
	props: {
		code: String,
		productId: [Number, String],
		warehouseId: [Number, String],
		brandId: [Number, String],
	},
	watch: {
		search,
	},
};
</script>

<style lang="scss" scoped>
.actual-stock {
	table {
		td {
			color: map-get($colors, tableText);
			font-size: map-get($sizes, medium16);
		}
	}
}
</style>
