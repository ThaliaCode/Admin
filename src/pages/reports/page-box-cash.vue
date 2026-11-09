<template>
  <div>
		<header-page
			:title="$route.meta.title"
			:show-excel="false"
			to-show
			@clean-product-filter="cleanFilter"
		/>
		<general-filter class="layout wrap align-center">
			<v-flex xs12 md3 px-2>
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
			<v-flex xs12 md2 px-2 v-if="showTypeMovement">
				<app-select
					:item="typeMovement"
					item-text="name"
					item-value="id"
					:items="typeMovements"
					label="Tipo de Movimiento"
					model="typeMovement"
					@input="getTypeMovement"
					:return-object="false"
				></app-select>
			</v-flex>
			<v-flex>
				<label class="caption"> {{labelSucursal()}}</label>
				<v-select
					:items="subsidiaries"
					v-model="subsidiaryId"
					class="filter-select shadow-inset"
					item-value="id"
					item-text="rzSocial"
				>
				</v-select>
			</v-flex>
			<v-flex xs12 md3 px-2>
				<app-select
					chips
					:item="warehouseIds"
					item-text="name"
					item-value="id"
					:items="warehousesFiltered"
					multiple
					:label="labelWarehouse()"
					:return-object="false"
					@input="getWarehouseIds"
				/>
			</v-flex>
			<v-flex xs12 md2 px-2 v-if="isPeru">
				<app-select
					:item="currency"
					:items="currencies"
					item-text="name"
					item-value="code"
					label="Tipo de Moneda"
					model="currency"
					@input="getCurrency"
					:return-object="false"
				></app-select>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<app-date-select
					:date-formatted="params.startDate"
					label="Fecha de inicio"
					model="startDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<app-date-select
					:date-formatted="params.endDate"
					label="Fecha de fin"
					model="endDate"
					:min-date="params.startDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex
				xs12 sm2 md2 px-2 pt-3
				hidden-sm-and-down
			>
				<v-btn
				:disabled="isLoading"
				:loading="isLoading"
				color="primary"
				block
				@click="downloadReport('preview')"
				>
					<v-icon>
						image_search
					</v-icon>
				</v-btn>
			</v-flex>
			<v-flex xs12 sm2 px-2 pt-3>
				<v-btn
					:disabled="isLoading"
					:loading="isLoading"
					color="success"
					block
					@click="downloadReport('download')"
				>
					<v-icon>
						cloud_download
					</v-icon>
				</v-btn>
			</v-flex>
		</general-filter>
		<div ref="viewer" id="result" class="hidden-sm-and-down">
		</div>
	</div>
</template>

<script>
import appDateSelect from '@/components/shared/app-date-select';
import helper from '@/shared/helper';
import format from 'date-fns/format';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import subDays from 'date-fns/sub_days';

async function created() {
	const requests = [
		this.subsidiariesList(),
		this.warehousesList(),
	];
	[
		{ data: this.subsidiaries },
		{ data: this.warehouses },
	] = await Promise.all(requests);
	this.selectedReport = this.reports[0];
	this.subsidiaryId = this.subsidiaries[0].id;
	this.warehousesFiltered = this.warehouses.filter(w => w.subsidiaryId === this.subsidiaryId);
	if (this.warehousesFiltered.length === 1) {
		this.warehouseIds = this.warehousesFiltered.map(p => p.id);
	}
	if (this.isPeru) {
		this.currency = this.currencies[0].code;
	}
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
}

function setDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function getWarehouseIds({ value }) {
	this.warehouseIds = [...value];
}

function getTypeMovement({ model, value }) {
	if (value) {
		this[model] = value;
	}
}

function cleanFilter() {
	this.selectedReport = this.reports[0];
	this.warehouseIds = this.warehousesFiltered === 1 ?
		this.warehousesFiltered.map(p => p.id) : [];
	this.subsidiaryId = this.subsidiaries[0].id;
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
}

function getCurrency({ model, value }) {
	if (value) {
		this[model] = value;
	}
}

async function downloadReport(type) {
	try {
		this.isLoading = true;
		const params = { responseType: 'blob',
			params: {
				startDate: this.params.startDate,
				endDate: this.params.endDate,
				comSubsidiaryId: this.subsidiaryId,
				currency: this.isEcuador ? this.currencies[1].code : this.currency,
				typeMovement: this.typeMovement,
			},
		};
		const { fileName, post, extension } = this.selectedReport;
		const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
		const name = `${fileName}-${now}`;
		const url = 'cash/pdf';
		post.warehouseIds = this.warehouseIds.length ? this.warehouseIds : undefined;
		const { data: blobData } = await this.$httpReportSales.post(url, post, params);
		const blob = helper.generateBlob(blobData);
		if (type === 'preview') {
			const urlObject = URL.createObjectURL(blob);
			const iFrame = document.createElement('iframe');
			iFrame.setAttribute('src', urlObject);
			iFrame.setAttribute('style', 'height:100vh;width:100%');
			const childNodes = this.$refs.viewer.childNodes;
			if (childNodes.length > 0) {
				this.$refs.viewer.removeChild(this.$refs.viewer.childNodes[0]);
			}
			this.$refs.viewer.append(iFrame);
		} else {
			helper.showDownloadDialog(blob, name, extension || 'pdf');
		}
	} catch (error) {
		if (error.status === 400) {
			this.showNotification('Su compañía no cuenta con este reporte', 'warning');
		} else {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}

function changeSelect(select) {
	this.reportId = select.id;
	if (select.code === 'movement-transaction-bank-pdf') {
		this.showTypeMovement = true;
		this.typeMovement = this.typeMovements[0].id;
	} else {
		this.showTypeMovement = false;
	}
}

function data() {
	return {
		currencies: [
			{
				id: 1,
				code: 'PEN',
				name: 'Soles',
			},
			{
				id: 2,
				code: 'USD',
				name: 'Dolares',
			},
		],
		currency: null,
		dateWithOutFormat: null,
		dateWithOutFormatEnd: null,
		endDate: this.$today(),
		isLoading: false,
		reports: [
			{
				id: 1,
				fileName: 'listado-caja',
				name: 'Reporte Listado de Caja',
				code: 'list-cash',
				post: {
					code: 'list-cash-pdf',
				},
			},
			{
				id: 2,
				fileName: 'movimiento-caja',
				name: 'Reporte Movimiento de Caja',
				code: 'movement-box',
				post: {
					code: 'cash-movement-pdf',
				},
			},
			{
				id: 3,
				fileName: 'depositos-caja',
				name: 'Reporte Depósitos de Caja',
				code: 'movement-transaction-bank-pdf',
				post: {
					code: 'movement-transaction-bank-pdf',
				},
			},
			{
				id: 4,
				fileName: 'ingreso-egreso-caja',
				name: 'Reporte Ingreso/Egreso de Caja',
				code: 'cash-movement-details-pdf',
				post: {
					code: 'cash-movement-details-pdf',
				},
			},
		],
		showTypeMovement: false,
		typeMovements: [
			{
				id: 1,
				name: 'Ingreso',
			},
			{
				id: 2,
				name: 'Egreso',
			},
		],
		reportId: null,
		typeMovement: null,
		subsidiaryId: null,
		startDate: null,
		selectedReport: null,
		params: {
			endDate: null,
			startDate: null,
		},
		subsidiaries: [],
		warehouses: [],
		warehousesFiltered: [],
		warehouseIds: [],
	};
}

export default {
	name: 'page-box-cash',
	created,
	data,
	components: {
		appDateSelect,
		headerPage,
		generalFilter,
	},
	methods: {
		changeSelect,
		cleanFilter,
		downloadReport,
		getCurrency,
		getTypeMovement,
		getWarehouseIds,
		setDate,
	},
};
</script>
