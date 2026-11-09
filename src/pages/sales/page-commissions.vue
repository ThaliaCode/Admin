<template>
	<div>
		<header-page
			name="box-history"
			:title="$route.meta.title"
			to-show
			:show-excel="false"
			:show-clean="false"
			export-to-pdf
			@download-dispatch="downloadSaleList"
		>
			<v-layout class="mr-4" justify-end>
				<v-flex xs3>
					<span class="blue-number f-14 text-right">Porcentaje de <br>comisión(%)</span>
				</v-flex>
				<v-flex xs2 pt-2>
					<v-text-field
						type="number"
						class="filter-select shadow-inset"
						prefix="%"
						v-model="commission"
						@input="changeCommission"
					></v-text-field>
				</v-flex>
			</v-layout>
		</header-page>
		<general-filter class="layout wrap align-end mt-3">
			<v-flex xs12 mb-2>
				<v-layout wrap>
					<v-flex xs2 mr-3>
						<app-date-select
							:date-formatted="params.startDate"
							label="Fecha de inicio"
							model="startDate"
							@input="setDate"
						/>
					</v-flex>
					<v-flex xs2 mr-3>
						<app-date-select
							:date-formatted="params.endDate"
							label="Fecha de final"
							model="endDate"
							@input="setDate"
						/>
					</v-flex>
					<v-flex xs2 mr-3>
						<autocomplete-component
							item-text="fullname"
							item-value="id"
							:items="employees"
							label-value="Vendedor Asignado"
							resource-url="/employees"
							return-object
							:http-code="'$httpSales'"
							:item="params.employeeId"
							@return-data="setDataEmployee($event, 'employeeId')"
						></autocomplete-component>
					</v-flex>
					<v-flex xs2 mr-3>
						<app-select
							:item="params.warehouseId"
							label="Tienda"
							item-text="name"
							item-value="id"
							model="warehouseId"
							:items="warehouses"
							:return-object="false"
							@input="setData"
						>
						</app-select>
					</v-flex>
					<v-flex xs3 sm1 px-1 mb-2 mt-4>
						<v-btn
							type="button"
							color="success"
							class="btn-action btn-action-block"
							@click="loadFilter"
						>
							Filtrar
							<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
						</v-btn>
					</v-flex>
					<v-flex xs3 sm1 px-1 mb-2 mt-4>
						<v-btn
							color="pink"
							class="btn-action btn-action-block"
							@click="clearFilter"
						>
							Limpiar
						</v-btn>	
					</v-flex>
				</v-layout>
			</v-flex>
		</general-filter>
		<app-table
			name="box-history"
			class="is-not-selectable mt-3 mb-0"
			:columns="columns"
			:current-page="current"
			:last-page="lastPage"
			:rows="rows"
			@on-page="onPage"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.createdAt | formatDate('YYYY-MM-DD') }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.warehouseName }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.user ? props.row.user.fullname : null }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.typeDocument ?  props.row.typeDocument.name : props.row.typeDocumentName }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.documentNumber }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.currencySymbol }}{{ props.row.amount | round }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.currencySymbol }}{{ props.row.commission | round }}</td>
			</template>
		</app-table>
	</div>	
</template>
<script>
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import generalFilter from '@/components/shared/general-filter';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import { format, subDays } from 'date-fns';

function created() {
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	this.loadResources();
	this.loadData();
}

async function loadData() {
	this.params.page = this.current;
	try {
		const response = await this.$httpSalesRead.get('sale-documents', { params: this.params });
		this.rows = response.data.map((r) => {
			const newRow = { ...r };
			newRow.commission = this.commission !== '' ? r.amount * this.commission * 0.01 : 0;
			return newRow;
		});
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function onPage(page) {
	this.current = page;
	this.loadData();
}

function setData({ model, value }) {
	if (model && value) {
		this.params[model] = value;
	}
}

async function loadResources() {
	const requests = [
		this.getCurrencies(),
		this.$httpSales.get('cash', { params: { flagActive: 1 } }),
		this.$httpProducts.get('warehouses'),
		this.globalEmployees(),
	];
	[
		{ data: this.currencies },
		{ data: this.cash },
		{ data: this.warehouses },
		{ data: this.employees },
	] = await Promise.all(requests);
}

function clearFilter() {
	this.params.warehouseId = null;
	this.params.employeeId = null;
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	this.commission = null;
	this.loadData();
}

function setDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function loadFilter() {
	this.loadData();
}

function setDataEmployee(value, model) {
	if (value) {
		this.params[model] = value.id;
	}
}

function changeCommission(value) {
	this.rows = this.rows.map((r) => {
		const newRow = { ...r };
		newRow.commission = value !== '' ? r.amount * value * 0.01 : 0;
		return newRow;
	});
}

function downloadSaleList() {
	if (this.commission === null || this.commission === '') {
		this.showNotification('Ingresar porcentaje de comisión', 'warning');
	} else if (this.params.warehouseId === null || this.params.employeeId === null) {
		this.showNotification('Filtrar por tienda y empleado', 'warning');
	} else {
		const params = {
			companyId: this.$userInfo.companyId,
			typeCurrency: this.$userInfo.company.currencyDefault.id,
			typeSymbol: this.$userInfo.company.currencyDefault.symbol,
			startDate: this.params.startDate || undefined,
			endDate: this.params.endDate || undefined,
			employeeId: this.params.employeeId || undefined,
			currency: this.$userInfo.company.currencyDefault.id,
			commission: Number(this.commission),
			warehouseId: this.params.warehouseId,
			report: true,
			flagNotCancel: 3,
		};
		this.onReportSaleCommissions(params);
	}
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Fecha', value: 'date', visible: true, checked: true },
			{ id: 2, name: 'Tienda', value: 'warehouse', visible: true, checked: true },
			{ id: 3, name: 'Vendedor Asignado', value: 'employee', visible: true, checked: true },
			{ id: 4, name: 'Tipo Documento', value: 'document', visible: true, checked: true },
			{ id: 5, name: '#DOC', value: 'doc', visible: true, checked: true },
			{ id: 6, name: 'Total', value: 'total', visible: true, checked: true },
			{ id: 7, name: 'Comisión', value: 'quantity', visible: true, checked: true },
		],
		rows: [],
		lastPage: 0,
		current: 1,
		params: {
			startDate: null,
			endDate: null,
			warehouseId: null,
			employeeId: null,
			report: true,
			flagNotCancel: 3,
		},
		warehouses: [],
		employees: [],
		commission: null,
	};
}
export default {
	name: 'page-commissions',
	data,
	created,
	components: {
		appTable,
		headerPage,
		generalFilter,
		autocompleteComponent,
	},
	methods: {
		onPage,
		loadData,
		setData,
		loadResources,
		clearFilter,
		setDate,
		loadFilter,
		setDataEmployee,
		changeCommission,
		downloadSaleList,
	},
	props: {
		id: [Number, String],
	},
};
</script>
<style lang="scss" scoped>
	.blue-number {
		color: map-get($colors, header);
	}

	.text-right {
		text-align: right;
	}

	.f-14 {
		font-size: 14px;
	}
</style>