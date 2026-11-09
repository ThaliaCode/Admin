<template>
	<div>
		<app-table
			class="composing-table"
			name="composing-products-list"
			padding="px-0"
			:input-search="false"
			:columns="composingColumns"
			:rows="rows"
			:mainList="false"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable cell-code">{{ props.row.code }}</td>
				<td class="cell-name">{{ props.row.name }}</td>
				<td class="cell-stock">{{ props.row.stock }}</td>
				<td class="cell-pricesCost">
					{{ getUnitCost(props.row) | round }}
				</td>
				<td class="cell-pricesCost">
					{{ getPriceCost(props.row) | round }}
				</td>
				<td @click.stop="stopClick" class="cell-unit">
					<app-select
						v-if="props.row.units.length > 1"
						item-text="code"
						item-value="id"
						:item="props.row.unitId"
						:items="props.row.units"
						model="unitId"
						@input="changeUnit($event, props.row)"
					/>
					<span v-else>{{props.row.unitCode}}</span>
				</td>
				<td class="cell-quantity">
					<v-text-field
						:id="`input-quantity-sale-${props.index}`"
						hide-details
						single-line
						type="number"
						class="filter-select shadow-inset input-max-width"
						:ref="`quantity${props.index}`"
						v-model="props.row.quantity"
						@input="updateQuantity(props.row)"
					></v-text-field>
				</td>
				<td class="cell-unitPrice">
						{{ props.row.unitPrice | round }}
				</td>
				<td class="cell-taxes">
						{{ props.row.price | round }}
				</td>
				<td class="cell-unitPrice">
					{{ getTaxes(props.row) }}
				</td>
				<td class="cell-subTotal">
					{{ getProductSubtotal(props.row) }}
				</td>
				<td class="cell-subTotal">
					{{ getProductTotal(props.row) | round }}
				</td>
				<td class="cell-actions">
					<app-tooltip-button
						text="Eliminar"
						color="pink"
						icon="delete"
						@click-icon="removeProduct(props.row)"
					></app-tooltip-button>
				</td>
			</template>
		</app-table>
		<div class="composing-total" v-if="this.rows.length > 0">
			<table>
				<tr>
					<td class="cell-code">Total:</td>
					<td class="cell-name"></td>
					<td class="cell-stock"></td>
					<td class="cell-pricesCost">{{getTotalCost()}}</td>
					<td class="cell-unit"></td>
					<td class="cell-unit"></td>
					<td class="cell-quantity"></td>
					<td class="cell-unitPrice"></td>
					<td class="cell-taxes"></td>
					<td class="cell-taxes">{{getTotalTaxes()}}</td>
					<td class="cell-subTotal">{{composingTotal()}}</td>
					<td class=""></td>
				</tr>
			</table>
		</div>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import lib from '@/shared/lib';

const { getDeeper } = lib;

function created() {
	this.updateColumns();
}

function updateColumns() {
	const columnLabel = this.isPeru ? 'IGV' : 'IVA';

	this.composingColumns = this.composingColumns.map((c) => {
		if (c.value === 'tax') {
			const newC = { ...c };
			newC.name = columnLabel;
			return newC;
		}

		return c;
	});
}

function changeUnit({ value }, product) {
	this.$emit('changed-unit', { value, product });
}

function removeProduct(product) {
	const localRows = [...this.rows];
	const index = localRows.findIndex(r => r.id === product.id);
	localRows.splice(index, 1);
	this.$emit('removed-product-from-rows', localRows);
}

function composingTotal() {
	const total = this.rows.reduce((acc, item) => {
		const subTotal = this.getProductSubtotal(item);
		return acc + subTotal;
	}, 0);

	return Number(total.toFixed(2));
}

function getProductSubtotal({ unitPrice, quantity }) {
	const subTotal = unitPrice > 0 ? unitPrice * quantity : 0;
	return Number(subTotal.toFixed(2));
}

function getProductTotal({ quantity, price }) {
	return Number(quantity * price);
}

function getTotalCost() {
	const totalCost = this.rows.reduce((acc, { product }) => acc + product.cost, 0);
	return Number(totalCost.toFixed(2));
}

function getTotalTaxes() {
	const totalTaxes = this.rows.reduce((acc, item) => {
		const taxes = this.getTaxes(item);
		return acc + taxes;
	}, 0);
	return Number(totalTaxes.toFixed(2));
}

function getTaxes(product) {
	const subTotal = this.getProductSubtotal(product);
	const taxes = (product.taxes) / 100;
	const taxesAmount = taxes * subTotal;
	return Number(taxesAmount.toFixed(2));
}

function updateQuantity(product) {
	this.getProductSubtotal(product);
	this.getTaxes(product);
	this.$emit('uddate-quantity', product);

	// Actualizando totales
	this.composingTotal();
	this.getTotalCost();
	this.getTotalTaxes();
}

function getUnitCost(product) {
	return getDeeper('product', 'cost')(product) || 0;
}

function getPriceCost(product) {
	const filterTax = product.product && product.product.taxes ? product.product.taxes : null;
	const taxValue = filterTax.find(p => p.code === '02' || p.code === '03');
	const percentage = taxValue ? 0 : this.labelsByCountry.percentage;
	return getDeeper('product', 'cost')(product) * Number(`1.${percentage}`);
}

function data() {
	return {
		composingColumns: [
			{
				id: 1,
				value: 'code',
				name: 'Codigo',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				value: 'name',
				name: 'Nombre',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				value: 'stock',
				name: 'Stock',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				value: 'cost',
				name: 'Cost Unit',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				value: 'cost',
				name: 'Precio Cost.',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				value: 'unit',
				name: 'Unidad',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				value: 'quantity',
				name: 'Cantidad',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				value: 'unitaryPrice',
				name: 'Precio Unitario',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				value: 'priceSale',
				name: 'Precio Venta',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				value: 'tax',
				name: '',
				visible: true,
				checked: true,
			},
			{
				id: 11,
				value: 'subtotal',
				name: 'subTotal',
				visible: true,
				checked: true,
			},
			{
				id: 12,
				value: 'total',
				name: 'Total',
				visible: true,
				checked: true,
			},
			{
				id: 13,
				name: 'Acciones',
				value: 'actions',
				visible: true,
				checked: true,
			},
		],
	};
}

export default {
	name: 'composing-products-list',
	components: {
		appTable,
	},
	created,
	data,
	methods: {
		changeUnit,
		composingTotal,
		getPriceCost,
		getUnitCost,
		getProductTotal,
		getProductSubtotal,
		getTaxes,
		getTotalCost,
		getTotalTaxes,
		removeProduct,
		updateQuantity,
		updateColumns,
	},
	props: {
		rows: {
			default: () => [],
			type: Array,
		},
		idProduct: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.composing-total {
	align-items: flex-end;
	background-color: color(border-green-light);
	color: color(primary);
	display: flex;
	font-family: font(lato-bold);
	font-size: 13px;
	padding: 0.5rem 0;

	table {
		border-collapse: collapse;
		width: 100%;

		tr td {
			padding: 5px;
		}
	}
}

.composing-table {
	margin-bottom: 0;
}

.cell {

	&-code {
		text-align: center;
		width: 9%;
	}

	&-name {
		width: 15%;

		@media screen and (min-width: 1024px) {
			width: 16%;
		}
		@media screen and (min-width: 1440px) {
			width: 12.1%;
		}
	}

	&-pricesCost {
		text-align: center;
		width: 5%;
	}
	
	&-stock {
		text-align: center;
		width: 6%;
	}

	&-unit {
		width: 5.5%;
	}

	&-quantity {
		width: 8%;

		@media screen and (min-width: 1440px) {
			width: 10%;
		}
	}

	&-unitPrice {
		text-align: center;
		width: 7%;
	}

	&-taxes {
		text-align: center;
		width: 7%;
	}

	&-subTotal {
		text-align: center;
		width: 10%;
	}

	&-actions {
		width: 6%;
	}
}
</style>