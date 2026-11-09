<template>
	<div>
		<header-page
			:show-excel="false"
			:title="$route.meta.title"
			to-show
			@clean-product-filter="cleanFilter"
		/>
		<general-filter class="layout wrap align-center">
			<v-flex xs12 md2 px-2>
				<app-select
					multiple
					chips
					:item="typeDocumentIds"
					item-text="code"
					item-value="id"
					:items="typeDocuments"
					model="typeDocumentIds"
					label="T. Documento"
					:return-object="false"
					@input="setData('typeDocumentIds', $event)"
				></app-select>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<app-select
					multiple
					chips
					:item="employeeIds"
					model="employeeIds"
					item-text="name"
					item-value="id"
					:items="employees"
					label="Empleados"
					:return-object="false"
					@input="setData('employeeIds', $event)"
				></app-select>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<app-select
					chips
					:item="warehouseIds"
					item-text="name"
					item-value="id"
					:items="warehouses"
					multiple
					:label="labelWarehouse()"
					:return-object="false"
					@input="setData('warehouseIds', $event)"
				/>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<app-date-select
					:date-formatted="params.startDate"
					label="Fecha de inicio"
					@input="setData('startDate', $event)"
				/>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<app-date-select
					:date-formatted="params.endDate"
					label="Fecha de fin"
					:min-date="params.startDate"
					@input="setData('endDate', $event)"
				/>
			</v-flex>
		</general-filter>
		<app-table
			class="mt-4 mb-2 is-not-selectable"
			name="sales-report-detail"
			:selectable="false"
			:columns="columns"
			:rows="rows"
			:input-search="false"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">
					{{ props.row.code }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{ props.row.employeeName }}
				</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.cartera }}
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.coverage }}
				</td>
				<td v-show="showRow(columns, 5)">
					{{ props.row.porcentage }}
				</td>
				<td v-show="showRow(columns, 6)">
					{{ props.row.totalAmount }}
				</td>
			</template>
		</app-table>
		<v-layout row wrap px-4>
			<v-flex xs12 class="totales-section d-flex text-xs-center">
				<v-layout row wrap class="content-discount" py-2>
					<v-flex xs12 class="text-center">
						<span><strong>Total Cartera:</strong></span>
					</v-flex>
					<v-flex xs12 class="text-center">
						<span>{{ data.carteraTotal | round }}</span>
					</v-flex>
				</v-layout>
				<v-layout row wrap class="content-discount" py-2>
					<v-flex xs12 class="text-center">
						<span><strong>Total Cobertura:</strong></span>
					</v-flex>
					<v-flex xs12 class="text-center">
						<span>{{ data.coverageTotal | round }}</span>
					</v-flex>
				</v-layout>
				<v-layout row wrap class="content-discount" py-2>
					<v-flex xs12 class="text-center">
						<span><strong>Total Porcentaje (%):</strong></span>
					</v-flex>
					<v-flex xs12 class="text-center">
						<span>{{ data.porcentageTotal | round }}</span>
					</v-flex>
				</v-layout>
				<v-layout row wrap class="content-discount" py-2>
					<v-flex xs12 class="text-center">
						<span><strong>Total:</strong></span>
					</v-flex>
					<v-flex xs12 class="text-center">
						<span>{{ data.totalAmountReport | round }}</span>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import helper from '@/shared/helper';
import { format, subDays } from 'date-fns';

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Código',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Empleado',
				value: 'employee',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Cartera',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Cobertura',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Porcentaje(%)',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Total',
				value: 'total',
				checked: true,
				visible: true,
			},
		],
		employees: [],
		typeDocumentIds: [],
		warehouseIds: [],
		warehouses: [],
		employeeIds: [],
		params: {
			startDate: this.$route.query.startDate || format(subDays(this.$today(), 7), 'YYYY-MM-DD'),
			endDate: this.$route.query.endDate || this.$today(),
			employeeIds: [],
			typeDocumentIds: [],
			warehouseIds: [],
		},
		typeDocuments: [],
		data: [],
		currentPage: 1,
		lastPage: 1,
		rows: [],
	};
}

export default {
	name: 'page-sales-report-detail',
	data,
	components: {
		appTable,
		headerPage,
		generalFilter,
	},
	async created() {
		try {
			const { data: employees } = await this.globalEmployees();
			const { data: warehouses } = await this.warehousesList();
			this.warehouses = warehouses;
			this.employees = employees.map(({ id, name }) => ({ id, name }));
			const filterIds = [52, 3, 5, 1, 2];
			this.typeDocuments = helper
				.getLocalData('documents')
				.map(({ documentType }) => documentType)
				.filter(({ id }) => filterIds.includes(id));
			this.loadData();
		} catch (error) {
			this.showGenericError();
		}
	},
	methods: {
		setData(model, value) {
			if (model === 'startDate' || model === 'endDate') {
				this.params[model] = format(value.value, 'YYYY-MM-DD');
			} else {
				this.params[model] = value.value;
			}
			this.loadData();
		},
		cleanFilter() {
			this.params = {
				startDate: format(subDays(this.$today(), 7), 'YYYY-MM-DD'),
				endDate: this.$today(),
				employeeIds: [],
				typeDocumentIds: [],
				warehouseIds: [],
			};
			this.employeeIds = [];
			this.typeDocumentIds = [];
			this.warehouseIds = [];
			this.loadData();
		},
		async loadData() {
			const params = {
				startDate: this.params.startDate,
				endDate: this.params.endDate,
				typeDocumentIds:
					this.params.typeDocumentIds && this.params.typeDocumentIds.length
						? this.params.typeDocumentIds.join(',')
						: undefined,
				employeeIds:
					this.params.employeeIds && this.params.employeeIds.length
						? this.params.employeeIds.join(',')
						: undefined,
				warehouseIds:
					this.params.warehouseIds && this.params.warehouseIds.length
						? this.params.warehouseIds.join(',')
						: undefined,
			};
			try {
				const response = await this.$httpSales.get('coverage-clients', {
					params,
				});
				this.rows = response.data.sales;
				this.data = response.data;
			} catch (error) {
				this.showGenericError();
			}
		},
	},
};
</script>
<style scoped>
.content-discount {
	background-color: #daf4f4;
	color: black;
	font-size: 12px;
}
</style>
