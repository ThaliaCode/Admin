<template>
	<div>
		<div class="value-container mr-3 ml-4 mt-4">
			<div class="label-container">
				<label class="label-detail secondary--text caption mr-2"
					>Cantidad total de productos vendidos:
				</label>
			</div>
			<p class="value-detail caption">
				<strong>{{ totalItems }}</strong>
			</p>
		</div>
		<v-flex xs12 pb-0 pt-3>
			<app-table
				name="list-products-by-seller"
				class="mb-0"
				:columns="columns"
				:rows="rows"
				:items-quantity="rows.length"
				:input-search="false"
				:last-page="lastPage"
				:items-total-quantity="itemsTotalQuantity"
				:current-page="params.page"
				@on-search-event="onSearch"
				@on-page="changePage"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="width-war">
						{{ props.row.productCode }}
					</td>
					<td v-show="showRow(columns, 2)" class="width-war">
						{{ props.row.description }}
					</td>
					<td v-show="showRow(columns, 3)" class="width-war">
						{{ props.row.typeDocumentCode }}
					</td>
					<td v-show="showRow(columns, 4)" class="width-war">
						<a
							:href="`/sales/convert/${props.row.salSaleDocumentsId}`"
							target="_blank"
							>{{ props.row.sale.documentNumber }}</a
						>
					</td>
					<td v-show="showRow(columns, 5)">{{ props.row.salePrice }}</td>
					<td v-show="showRow(columns, 6)" class="width-war">
						{{ props.row.totalCost }}
					</td>
					<td v-show="showRow(columns, 7)">{{ props.row.quantity }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.subTotal }}</td>
				</template>
			</app-table>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hiddenSaveBtn
				@cancel-button-clicked="$emit('close-modal')"
			/>
		</section>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

async function loadData() {
	const { warProductsId, unitId } = this.row;
	const params = {
		...this.params,
		typeDocumentIds: this.params.typeDocumentIds.join(','),
		productId: warProductsId,
		unitId,
	};
	try {
		const rows = await this.$httpSales.get('employee-product-details', {
			params,
		});
		this.totalItems = rows.data.reduce((acc, item) => acc + item.quantity, 0);
		this.lastPage = Number(rows.headers['x-last-page']);
		this.itemsTotalQuantity = Number(rows.headers['x-quantity']);
		this.rows = rows.data;
	} catch (error) {
		this.showGenericError();
	}
}

function changePage(page) {
	this.params.page = page;
	this.loadData();
}

function data() {
	return {
		rows: [],
		columns: [
			{
				id: 1,
				name: 'Codigo',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Nombre',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Tipo de Doc',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Nro de Documento',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Precio de Venta',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Precio de Costo',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Cantidad',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Total',
				checked: true,
				visible: true,
			},
		],
		itemsTotalQuantity: 0,
		lastPage: 0,
		totalItems: 0,
	};
}

export default {
	name: 'list-products',
	data,
	components: {
		appTable,
		modalSidebarButton,
	},
	created() {
		this.params.page = 1;
		this.loadData();
	},
	methods: {
		loadData,
		changePage,
		onSearch(searchValue) {
			if (searchValue) {
				this.params.search = searchValue;
			} else {
				this.params.search = null;
			}
			this.loadData();
		},
	},
	props: {
		params: {
			type: Object,
		},
		row: {
			type: Object,
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
