<template>
  <div>
		<header-page
			:show-excel="false"
			:title="$route.meta.title"
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
			<v-flex xs12 md3 px-2 v-if="subsidiaries.length > 0">
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
			<v-flex xs12 md2 px-2>
				<app-date-select
					label="Fecha de inicio"
					:date-formatted="params.startDate"
					model="startDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<app-date-select
					:date-formatted="params.endDate"
					label="Fecha de fin"
					:min-date="params.startDate"
					model="endDate"
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
			<v-flex xs12 sm2 md2 px-2 pt-3>
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
import format from 'date-fns/format';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
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
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	if (this.isPeru) {
		this.reports.pop();
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
			},
		};
		const { fileName, post, extension } = this.selectedReport;
		const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
		const name = `${fileName}-${now}`;
		const url = 'purchase-documents/pdf';
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

function onDate(value, model) {
	this[model] = value;
}

function setDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function getWarehouseIds({ value }) {
	this.warehouseIds = [...value];
}

function cleanFilter() {
	this.warehouseIds = this.warehousesFiltered.length === 1 ?
		this.warehousesFiltered.map(p => p.id) : [];
	this.subsidiaryId = this.subsidiaries[0].id;
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
}

function changeSelect(select) {
	if (select.fileName === 'retencion-compras') {
		this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
		this.params.endDate = this.$today();
	}
	this.reportId = select.id;
}

function data() {
	return {
		isLoading: false,
		params: {
			startDate: null,
			endDate: null,
		},
		reports: [
			{
				id: 1,
				fileName: 'compras-detalladas',
				name: 'Reporte de Compras Detalladas',
				code: 'purchases-details',
				post: {
					code: 'purchases-details',
				},
			},
			{
				id: 2,
				fileName: 'resume-compras',
				name: 'Reporte Resumen de Compras',
				code: 'purchases-suppliers-totals',
				post: {
					code: 'purchases-suppliers-totals',
				},
			},
			{
				id: 3,
				fileName: 'retencion-compras',
				name: 'Reporte Retenciones de compras',
				code: 'purchase-retention',
				post: {
					code: 'purchase-retention',
				},
			},
		],
		selectedReport: null,
		subsidiaryId: null,
		subsidiaries: [],
		warehouses: [],
		warehousesFiltered: [],
		warehouseIds: [],
	};
}

export default {
	name: 'page-purchases-report',
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
		getWarehouseIds,
		onDate,
		setDate,
	},
};
</script>


