<template>
	<div>
		<div class="mx-4 mt-4 px-5 py-3 wrapper-employee-data">
			<v-layout wrap row>
				<v-flex xs3>
					<span class="name">{{employee.name}}</span>
				</v-flex>
				<v-flex xs6>
					<p><span class="bold">Número de Documento: </span><span>{{employee.documentNumber}}</span></p>
				</v-flex>
				<v-flex xs3>
					<p><span class="bold">Empresa: </span><span>{{employee.subsidiary}}</span></p>
				</v-flex>
				<v-flex xs9>
					<p><span class="bold">Domicilio: </span><span>{{employee.address}}</span></p>
				</v-flex>
				<v-flex xs3>
					<p><span class="bold">Antiguedad: </span><span>{{employee.antiquityFormat}}</span></p>
				</v-flex>
				<v-flex xs9>
					<p><span class="bold">Periodo: </span><span>{{employee.dateStartFormat}} - {{employee.dateEndFormat}}</span></p>
				</v-flex>
				<v-flex xs3>
					<p><span class="bold">Total de Días: </span><span>{{employee.days}}</span></p>
				</v-flex>
			</v-layout>
		</div>
		<app-table
			class="mt-4 mb-1 is-not-selectable"
			name="list-employees"
			:columns="columns"
			:rows="rows"
			:main-list="false"
			:input-search="false"
			:filter-columns="false"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">{{props.row.code}}</td>
				<td v-show="showRow(columns, 2)">{{props.row.name}}</td>
				<td v-show="showRow(columns, 3)">{{props.row.value}}</td>
				<td v-show="showRow(columns, 4)">{{props.row.accrued}}</td>
				<td v-show="showRow(columns, 5)">{{props.row.deductions}}</td>
			</template>
		</app-table>
		<div class="mr-4 ml-4 py-2 wrapper-header">
			<v-layout wrap row>
				<v-flex xs3 class="center">
					<span>T. Devengados</span>
				</v-flex>
				<v-flex xs2 class="center">
					<span>-</span>
				</v-flex>
				<v-flex xs3  class="center">
					<span>T.A Deducir</span>
				</v-flex>
				<v-flex xs2  class="center">
					<span>=</span>
				</v-flex>
				<v-flex xs2  class="center">
					<span class="bold">TOTAL</span>
				</v-flex>
			</v-layout>
		</div>
		<div class="mr-4 ml-4 wrapper-body">
			<v-layout wrap row>
				<v-flex xs4 class="border center pr-8">
					<span>{{totalAccrued | round}}</span>
				</v-flex>
				<v-flex xs5 class="center border">
					<span>{{totalDeductions | round}}</span>
				</v-flex>
				<v-flex xs3 class="center pl-8">
					<span>{{total | round}}</span>
				</v-flex>
			</v-layout>
		</div>
	</div>
</template>

 <script>
 import appTable from '@/components/shared/table/app-table';

function data() {
	return {
		rows: [],
		columns: [
			{ id: 1, name: 'Código', visible: true, checked: true },
			{ id: 2, name: 'Concepto', visible: true, checked: true },
			{ id: 3, name: 'Valor', visible: true, checked: true },
			{ id: 4, name: 'Devengados', visible: true, checked: true },
			{ id: 5, name: 'Deducciones', visible: true, checked: true },
		],
		totalAccrued: 0,
		totalDeductions: 0,
		total: 0,
	};
}

function employee(value) {
	this.rows = value.payrollDetails.map((r) => {
		const newRow = { ...r };
		if (newRow.conceptType) {
			newRow.accrued = newRow.conceptType.code === 'I' ? newRow.conceptType.amount : null;
			newRow.deductions = newRow.conceptType.code === 'E' ? newRow.conceptType.amount : null;
			const name = newRow.conceptType.code === 'I' ? 'totalAccrued' : 'totalDeductions';
			this[name] = this[name] + newRow.conceptType.amount;
		}
		return newRow;
	});
	this.total = this.totalAccrued - this.totalDeductions;
}
 export default {
	name: 'detail-employee',
	components: {
		appTable,
	},
	data,
	props: {
		employee: {
			type: Object,
			default: () => {},
		},
	},
	watch: {
		employee,
	},
 };
 </script>
 <style lang="scss" scoped>
	.wrapper-employee-data {
		background: map-get($colors, white);
		font-size: 13px;

		.name {
			color: map-get($colors, table-inventory);
			font-size: 15px;
			font-weight: bold;
		}
	}

	.bold {
		font-weight: bold;
	}
	
	.center {
		text-align: center;
	}

	.border {
		border-right: 1px solid map-get($colors, border-table)
	}

	.wrapper-header {
		background: map-get($colors, blue-grey);
		border: 1px solid map-get($colors, border-table);
		font-size: 15px;
	}

	.wrapper-body {
		border: 1px solid map-get($colors, border-table);
		font-size: 15px;

		.pl-8 {
			padding-left: 8.5%;
		}

		.pr-8 {
			padding-right: 8.5%;
		}
	}
 </style>
 
 