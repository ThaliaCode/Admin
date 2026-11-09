<template>
	<div>
		<header-page
			:show-excel="false"
			:title="$route.meta.title"
			to-show
			@clean-product-filter="cleanFilter"
		/>
		<general-filter class="layout wrap align-center">
			<v-flex xs3 px-2>
				<label class="caption">Reporte</label>
				<v-select
					:items="reports"
					v-model="selectedReport"
					class="filter-select shadow-inset"
					item-text="name"
					@input="changeSelect($event)"
				>
				</v-select>
			</v-flex>
			<v-flex xs2 px-2>
				<autocomplete-component
					chips
					item-text="name"
					item-value="id"
					:items="warehouses"
					:label-value="labelWarehouse()"
					multiple
					resource-url="/warehouses"
					:return-object="false"
					:http-code="'$httpProducts'"
					:item="warehouseIds"
					@return-data="getWarehouseIds"
				></autocomplete-component>
			</v-flex>
			<v-flex xs2 px-2>
				<autocomplete-component
					chips
					item-text="name"
					item-value="id"
					:items="typeDocuments"
					label-value="T. Documento"
					multiple
					:object-data="'documentType'"
					resource-url="/type-documents?flagType=1"
					:return-object="false"
					:http-code="'$httpSales'"
					:item="typeDocumentIds"
					@return-data="getParamTypeDocuments($event, 'typeDocumentIds')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs2 px-2>
				<app-date-select
					:date-formatted="params.startDate"
					label="Fecha de inicio"
					model="startDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs2 px-2>
				<app-date-select
					:date-formatted="params.endDate"
					label="Fecha de fin"
					:min-date="params.startDate"
					model="endDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs2 px-2>
				<app-select
					:item="params.currency"
					item-text="name"
					item-value="code"
					:items="currencies"
					label="Moneda"
					model="currency"
					:return-object="false"
					@input="params.currency = $event.value"
				/>
			</v-flex>

			<v-flex xs12 sm1 md1 px-2 pt-3 ml-1>
				<v-btn
					:disabled="isDisabled"
					:loading="isLoading"
					color="primary"
					block
					@click="downloadReportExcel"
				>
					<img src="/static/img/excel.svg" alt="download" height="20" />
				</v-btn>
			</v-flex>
		</general-filter>
		<div ref="viewer" id="result" class="hidden-sm-and-down"></div>
	</div>
</template>

<script>
import appDateSelect from '@/components/shared/app-date-select';
import { format, subDays } from 'date-fns';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import helper from '@/shared/helper';

async function created() {
	const requests = [
		this.warehousesList(),
		this.getCurrencies(),
		// this.getTypeDocuments('sales'),
	];
	[
		{ data: this.warehouses },
		{ data: this.currencies },
		// { data: this.typeDocuments },
	] = await Promise.all(requests);
	this.selectedReport = this.reports[0];
	if (this.currencies && this.currencies.length) {
		this.params.currency = this.currencies[0].code;
	}
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	const documents = helper.getLocalData('documents');
	this.typeDocuments =
		documents.length && documents.map(({ documentType }) => documentType);
	const filterIds = [52, 3, 5, 1, 2];
	this.typeDocuments = this.typeDocuments.filter((typeDocument) =>
		filterIds.includes(typeDocument.id)
	);
}

function getParamTypeDocuments(value, model) {
	this[model] = value;
}

function getWarehouseIds(value) {
	const selectedIds = value;

	// Verificamos si "Seleccionar todos" está seleccionado
	const selectAllSelected = selectedIds.includes(0);

	if (selectAllSelected) {
		// Si "Seleccionar todos" está marcado, asignamos todos los ids
		this.warehouseIds =
			this.warehouseIds.length === this.warehousesFiltered.length - 1
				? []
				: this.warehousesFiltered.map((w) => w.id).filter((id) => id !== 0);
	} else {
		// Si "Seleccionar todos" no está seleccionado, asignamos solo los ids seleccionados
		this.warehouseIds = selectedIds;
	}
}

function changeSelect(select) {
	this.cleanFilter();
	this.selectedReport = select;
}

function cleanFilter() {
	// this.warehouseIds =
	// 	this.warehousesFiltered.length === 1 ? this.warehousesFiltered.map((p) => p.id) : [];
	this.warehouseIds = [];
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	this.typeDocumentIds = [];
	this.employeeIds = [];
}

function setDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

async function downloadReportExcel() {
	try {
		this.isLoading = true;
		const { name, fileName, code } = this.selectedReport;
		const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
		const currency = this.currencies.find((c) => c.code === this.params.currency);
		const body = {
			extension: 'xlsx',
			filename: `${fileName}_${now}_xlsx`,
			params: {
				flagUseRoute: true,
				startDate: this.params.startDate,
				endDate: this.params.endDate,
				countryCode: this.labelsByCountry.code,
				taxName: this.$userInfo.company.country.taxName,
				typeDocumentIds: this.typeDocumentIds.length ? this.typeDocumentIds : undefined,
				warehouseIds: this.warehouseIds.length ? this.warehouseIds : undefined,
				currencies: {
					[currency.code]: {
						typeSymbol: currency.symbol,
						typeCurrency: currency.code,
					},
				},
			},
		};

		await this.$httpReports.post(`documents/${code}`, body);
		this.notificationReport(`reporte de ${name}`);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'NOT_FOUND_REPORT') {
				this.showGenericError('El reporte no se encuentra activado para su compañía.');
			}
		}
	} finally {
		this.isLoading = false;
	}
}

function data() {
	return {
		currencies: [],
		typeDocumentIds: [],
		isLoading: false,
		selectedReport: {},
		typeDocuments: [],
		reports: [
			{
				id: 1,
				fileName: 'detalle_de_ventas_localización_',
				name: 'Reporte de Detalle de Ventas con localización',
				code: 'list-sales-details',
			},
		],
		params: {
			startDate: null,
			endDate: null,
			currency: null,
		},
		warehouses: [],
		warehousesFiltered: [],
		warehouseIds: [],
		warehouseId: null,
	};
}

export default {
	name: 'pages-custom-report',
	data,
	created,
	components: {
		appDateSelect,
		headerPage,
		generalFilter,
	},
	methods: {
		cleanFilter,
		changeSelect,
		downloadReportExcel,
		getParamTypeDocuments,
		getWarehouseIds,
		setDate,
	},
	computed: {
		isDisabled() {
			const conditions = {
				'list-sales-details': !(this.typeDocumentIds.length && this.warehouseIds.length),
			};

			return conditions[this.selectedReport.code] || false;
		},
	},
};
</script>
