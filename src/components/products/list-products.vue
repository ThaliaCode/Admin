<template>
	<div>
		<v-flex xs12 pb-0 pt-3>
			<app-table
				name="list-products"
				class="mb-0"
				:columns="columns"
				:rows="rows"
				:items-quantity="rows.length"
				:items-total-quantity="itemsTotalQuantity"
				:last-page="lastPage"
				:current-page="params.page"
				@on-page="loadData"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="width-war">
						{{ props.row.typeDocumentName }}
					</td>
					<td v-show="showRow(columns, 2)" class="width-war">
						<a
							:href="`/purchase/${props.row.purchaseDocumentId}/detail`"
							target="_blank"
							>{{ props.row.documentNumber }}</a
						>
					</td>
					<td v-show="showRow(columns, 3)">{{ props.row.productCode }}</td>
					<td v-show="showRow(columns, 2)" class="width-war">
						{{ props.row.productName }}
					</td>
					<td v-show="showRow(columns, 3)">{{ props.row.quantity }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.price }}</td>
				</template>
			</app-table>
		</v-flex>
		<section class="modal-filter-footer pa-0">
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

async function loadData(page = 1) {
	this.params.page = page;
	const { id } = this.$route.params;
	try {
		const { data: rows, headers } = await this.$httpSales.get(
			'purchase-details-report',
			{
				params: {
					...this.params,
					supplierId: id,
					productId: this.productId,
				},
			}
		);
		this.rows = rows;
		this.lastPage = Number(headers['x-last-page']);
		this.itemsTotalQuantity = Number(headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		rows: [],
		columns: [
			{
				id: 1,
				name: 'Tipo de Documento',
				value: 'typeDocumentName',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Numero de Documento',
				value: 'documentNumber',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Codigo',
				value: 'productCode',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Producto',
				value: 'productName',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Cantidad',
				value: 'quantity',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Costo Unitario',
				value: 'price',
				checked: true,
				visible: true,
			},
		],
		params: {
			search: null,
			page: 1,
			limit: 10,
		},
		itemsTotalQuantity: 0,
		lastPage: 0,
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
		this.loadData();
	},
	methods: {
		loadData,
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
		productId: [String, Number],
	},
};
</script>
