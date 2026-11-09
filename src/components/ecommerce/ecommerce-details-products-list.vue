<template>
	<section class="mb-0">
		<div class="table">
			<div class="row header">
				<div
					v-for="column in visibleColumns"
					:key="column.id"
					class="cell header-cell"
				>
					{{ column.name }}
				</div>
			</div>
			<div
				v-for="(row, rowIndex) in products"
				:key="rowIndex"
				class="row-group"
			>
				<div class="row">
					<div
						v-for="column in visibleColumns"
						:key="column.id"
						class="cell border-table"
					>
						<span v-if="column.id === 3">{{ getAttribute(row) }}</span>
						<div v-else-if="column.id === 4">
							<v-text-field
								v-if="row.product && row.product.flagWeighable && isEditProduct"
								class="filter-select shadow-inset"
								type="number"
								:min="0.0001"
								v-model.number="row.quantity"
							/>
							<span v-else>
								{{ row.quantity }}
							</span>
						</div>
						<span v-else-if="[5, 10].includes(column.id)">{{
							row[column.value] | round
						}}</span>
						<div v-else-if="column.id === 11">
							<app-tooltip-button
								:disabled="!row.commentary"
								color="primary"
								height="24"
								icon="comment"
								text="Ver Comentario"
								@click-icon="viewCommentary(row)"
							/>
						</div>
						<span v-else>
							{{ row[column.value] }}
						</span>
					</div>
				</div>
				<div
					class="additional-info"
					v-if="row.commentary && row.visibleComment"
				>
					<v-flex xs3>
						<v-layout row wrap align-center px-2>
							<v-flex
								d-flex
								align-center
								pl-2
								pr-2
								mb-1
								class="column-label caption"
							>
								Comentario:
							</v-flex>
							<v-flex d-flex align-center class="column-value caption">
								{{ row.commentary }}
							</v-flex>
						</v-layout>
					</v-flex>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

function getAttribute(order) {
	if (order.additionalInformation) {
		const attributes = order.additionalInformation.attributes;
		return attributes
			? attributes
					.reduce((acum, a) => {
						let att = a.name || a.attributeCode;
						att = att.length > 30 ? `${att.substring(0, 30)}...` : att;
						acum.push(` ${att}`);
						return acum;
					}, [])
					.join()
			: '-';
	}
	return order.additionalInformation ? order.additionalInformation.a : '-';
}

function data() {
	return {
		rowSelected: {
			index: null,
			visibleComment: false,
		},
		products: [...this.rows],
		columns: [
			{
				id: 1,
				name: 'Código',
				value: 'productCode',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Nombre',
				value: 'productName',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Atributos',
				value: 'attribute',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Cant.',
				tooltip: 'Cantidad',
				value: 'quantity',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Precio',
				value: 'salePrice',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Almacen',
				value: 'warehouseName',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Stock',
				value: 'stock',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Peso',
				value: 'weight',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'Unidad',
				value: 'unitName',
				checked: true,
				visible: true,
			},
			{
				id: 10,
				name: 'Total',
				value: 'total',
				checked: true,
				visible: true,
			},
			{
				id: 11,
				name: 'Acciones',
				checked: true,
				visible: true,
			},
		],
	};
}

export default {
	name: 'ecommerce-details-products-list',
	components: {
		appTable,
	},
	methods: {
		getAttribute,
		viewCommentary(row) {
			this.products = this.products.map((d) => {
				const newR = { ...d };
				newR.visibleComment = row.id === d.id;
				return newR;
			});
		},
	},
	computed: {
		visibleColumns() {
			return this.columns.filter((column) => column.visible);
		},
	},
	data,
	props: {
		rows: {
			type: Array,
			default: () => [],
		},
		modal: {
			type: Boolean,
			default: false,
		},
		isEditProduct: {
			type: Boolean,
			default: false,
		},
	},
};
</script>
<style scoped lang="scss">
.table {
	display: table;
	width: 100%;
	margin: 0 0 20px 0;
	border-collapse: collapse;

	.row-group {
		display: table-row-group;
		border-bottom: 1px solid #dddddd00;
	}

	.row.header {
		background-color: #e0f3f3;
		color: white;
		font-weight: bold;
	}

	.row {
		display: table-row;
	}

	.border-table {
		border: 1px solid #979797;
	}

	.cell {
		display: table-cell;
		padding: 10px;
		text-align: center;
		background-color: #f3fafb;
		font-size: 12px;
		font-weight: 500;
	}

	.header-cell {
		padding: 12px;
		font-weight: bold;
		background-color: color(primary);
		font-size: 12px;
	}

	.additional-info {
		padding: 10px 0;
		width: 50px;
	}
}
</style>
