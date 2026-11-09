<template>
	<div>
		<v-layout row mb-3 px-5>
			<v-flex xs6 d-flex justify-space-between mt-3>
				<v-flex xs5 d-flex justify-start align-center>
					<span class="bold-text">{{labelWarehouse()}}</span>
					<span>Almacén 1</span>
				</v-flex>
				<v-flex xs5 d-flex justify-start align-center>
					<span class="bold-text">Responsable: </span>
					<span>Empleado 2</span>
				</v-flex>
			</v-flex>
		</v-layout>
		<v-layout row mb-3 px-5>
			<v-flex xs8>
				<v-layout row mb-3>
					<v-flex xs4>
						<v-select
							v-bind:items="currencies"
							v-model="currency"
							label="Monedas"
							hide-details
							bottom
							class="filter-select"
							content-class="filter-select-content"
						></v-select>
					</v-flex>
				</v-layout>
				<v-layout row d-flex justify-start align-center>
					<v-flex xs3 mr-3>
						<v-select
							v-bind:items="typesDocuments"
							v-model="typeDocument"
							label="Tipo de Documento"
							hide-details
							bottom
							class="filter-select"
							content-class="filter-select-content"
						></v-select>	
					</v-flex>
					<v-flex xs3 mr-3>
						<v-select
							v-bind:items="typesExpenses"
							v-model="typeExpense"
							label="Tipo de Documento"
							hide-details
							bottom
							class="filter-select"
							content-class="filter-select-content"
						></v-select>
					</v-flex>
					<v-flex xs2>
						<v-btn
							type="button"
							class="btn-action"
							color="info">Filtrar</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs2 offset-xs1 class="grid-display">
				<div class="grid-head currency">Total</div>
					<span class="grid-cell currency">PEN</span>
					<span class="grid-cell currency">USD</span>
					<span class="grid-cell amount bold-text">S/.698</span>
					<span class="grid-cell amount bold-text">$509</span>
			</v-flex>
		</v-layout>
		<app-table
			name="cash-closing"
			:filterColumns="false"
			:includeFilter="false"
			:inputSearch="false"
			:columns="columns"
			:current-page="currentPage"
			:rows="data"
			include-filter
			local-storage
			:last-page="lastPage"
			:clean-search="isClean"
			v-on:on-page="changePage"
			class="is-not-selectable">
			<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.documentNumber }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.product }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.paidPen }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.paidUsd }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.payDate }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.typeDocument }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.quantity }}</td>
					<td v-show="showRow(columns, 9)">{{ props.row.amountPen }}</td>
					<td v-show="showRow(columns, 10)">{{ props.row.amountUsd }}</td>
					<td v-show="showRow(columns, 11)">{{ props.row.billingPen }}</td>
					<td v-show="showRow(columns, 12)">{{ props.row.billingUsd }}</td>
					<td v-show="showRow(columns, 13)"></td>
				</template>
		</app-table>
		<v-layout row d-flex justify-center align-center mt-5>
			<v-flex xs1>
				<v-btn
					type="button"
					class="btn-action btn-wide"
					color="success">Crear cierre de caja</v-btn>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import appTable from './../shared/table/app-table';

function changePage(page) {
	this.currentPage = page;
}

function data() {
	return {
		columns: [
			{ id: 1, name: '#DOC', value: 'documentNumber', visible: true, checked: true },
			{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 3, name: 'Producto', value: 'product', visible: true, checked: true },
			{ id: 4, name: 'Cobrado en PEN', value: 'paidPen', visible: true, checked: true },
			{ id: 5, name: 'Cobrado en USD', value: 'paidUsd', visible: true, checked: true },
			{ id: 6, name: 'Fecha de Cobro', value: 'payDate', visible: true, checked: true },
			{ id: 7, name: 'Tipo de documento', value: 'typeDocument', visible: true, checked: true },
			{ id: 8, name: 'Cantidad', value: 'quantity', visible: true, checked: true },
			{ id: 9, name: 'Monto en PEN', value: 'amountPen', visible: true, checked: true },
			{ id: 10, name: 'Monto en USD', value: 'amountUsd', visible: true, checked: true },
			{ id: 11, name: 'Pendiente en PEN', value: 'billingPen', visible: true, checked: true },
			{ id: 12, name: 'Pendiente en USD', value: 'billingUsd', visible: true, checked: true },
			{ id: 13, name: 'Acciones', visible: true, checked: true, flagVisible: true },
		],
		currencies: [],
		currency: {},
		currentPage: 1,
		data: [
			{
				id: 1,
				documentNumber: '02-344',
				code: 'fre34',
				product: 'Traje de fiesta',
				paidPen: 'S/. 133',
				paidUsd: null,
				payDate: '2018-05-05',
				typeDocument: 'Factura',
				quantity: 12,
				amountPen: 'S/. 333',
				amountUsd: null,
				billingPen: 'S/. 200',
				billingUsd: null,
			},
		],
		employee: {},
		isClean: false,
		lastPage: 1,
		salesAmount: 0,
		typeDocument: {},
		typesDocuments: [],
		typeExpense: {},
		typesExpenses: [],
		warehouse: {},
	};
}

export default {
	name: 'sales-cash-closing',
	components: {
		appTable,
	},
	data,
	methods: {
		changePage,
	},
};
</script>

<style lang="scss" scoped>
.btn-wide {
	width: 120px !important;
}

.grid-display {
	align-items: center;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 20px 20px 33px;
	text-align: center;
}

.grid-head {
	grid-column: 1 / 3;
}

.grid-cell {
	background-color: white;
	padding: 5px;
}

.currency {
	background-color: color(background-card-black);
	color: white;
	font-size: size(small);
}

.bold-text {
	font-weight: bold;
}
</style>
