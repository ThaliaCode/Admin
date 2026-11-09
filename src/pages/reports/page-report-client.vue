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
			<v-flex xs12 md3 px-2>
				<label class="caption">Empresa</label>
				<v-select
					:items="subsidiaries"
					v-model="subsidiaryId"
					class="filter-select shadow-inset"
					item-value="id"
					item-text="rzSocial"
				>
				</v-select>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<label class="caption">Grupos</label>
				<v-select
					:items="groups"
					v-model="groupId"
					class="filter-select shadow-inset"
					item-value="id"
					item-text="name"
					@input="getGroup"
				>
				</v-select>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<label class="caption">Deuda</label>
				<v-select
					:items="status"
					v-model="stateId"
					class="filter-select shadow-inset"
					item-value="id"
					item-text="name"
					@input="getState"
				>
				</v-select>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<app-date-select
					:date-formatted="params.startDate"
					label="Fecha inicial"
					model="startDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<app-date-select
					:date-formatted="params.endDate"
					:min-date="params.startDate"
					label="Fecha de fin"
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
import typeEntityId from '@/shared/type-entity';

async function created() {
	const params = { typeEntityId: typeEntityId.Customer };
	const requests = [
		this.subsidiariesList(),
		this.$httpSalesRead.get('group', { params }),
	];
	[
		{ data: this.subsidiaries },
		{ data: this.groups },
	] = await Promise.all(requests);
	this.subsidiaryId = this.subsidiaries[0].id;
	this.selectedReport = this.reports[0];
	if (this.groups.length === 1) {
		this.groupId = this.groups[0].id;
	}
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
}

function setDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

async function downloadReport(type) {
	try {
		this.isLoading = true;
		const params = { responseType: 'blob',
			params: {
				startDate: this.startDate,
				endDate: this.endDate,
				comSubsidiaryId: this.subsidiaryId,
				groupId: this.groupId,
				flagDebts: this.stateId,
			},
		};
		const { fileName, post, extension } = this.selectedReport;
		const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
		const name = `${fileName}-${now}`;
		const url = 'customer/pdf';
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
		// this.$ga.event({
		// 	eventCategory: 'Reporte',
		// 	eventAction: type,
		// 	eventValue: post.code,
		// });
	} catch (error) {
		this.showGenericError();
	} finally {
		this.isLoading = false;
	}
}

function changeSelect(select) {
	const number = select.fileName === 'retencion-compras' ? '7' : '30';
	const dateFormat = format(subDays(this.$today(), number), 'DD/MM/YYYY');
	this.reportId = select.id;
	this.onDate(format(subDays(this.endDate, number), 'YYYY-MM-DD'), 'startDate');
	this.setDate(dateFormat, 'dateWithOutFormat');
}

function cleanFilter() {
	this.groupId = this.groups.length === 1 ? this.groups[0].id : null;
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	this.state = null;
}

function getGroup({ value }) {
	this.groupId = value;
}

function getState({ value }) {
	this.stateId = value === 1;
}

function data() {
	return {
		groups: [],
		groupId: null,
		isLoading: false,
		reports: [
			{
				id: 1,
				fileName: 'listado-clientes',
				name: 'Listado de Clientes',
				code: 'list-customer',
				post: {
					code: 'list-customer-pdf',
				},
			},
			// {
			// 	id: 2,
			// 	name: 'Estado de Cuenta Cliente (General)',
			// 	fileName: 'cuenta-cliente',
			// 	code: 'customer-account-statement-pdf',
			// 	post: {
			// 		code: 'customer-account-statement-pdf',
			// 	},
			// },
			// {
			// 	id: 3,
			// 	name: 'Estado de Cuenta Cliente (Código Contable)',
			// },
			// {
			// 	id: 4,
			// 	name: 'Libro Diario CXC',
			// },
			// {
			// 	id: 5,
			// 	name: 'Cartera Clientes',
			// 	fileName: 'cartera-cliente',
			// 	code: 'customer-portfolio-pdf',
			// 	post: {
			// 		code: 'customer-portfolio-pdf',
			// 	},
			// },
			// {
			// 	id: 6,
			// 	name: 'Cheques PostFechados',
			// },
		],
		reportId: null,
		state: null,
		stateId: null,
		params: {
			endDate: null,
			startDate: null,
		},
		status: [
			{
				id: 1,
				name: 'Con deuda',
			},
			{
				id: 2,
				name: 'Sin deuda',
			},
		],
		selectedReport: null,
		subsidiaries: [],
		subsidiaryId: null,
	};
}

export default {
	name: 'page-report-clients',
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
		getGroup,
		getState,
		// onDate,
		setDate,
	},
};
</script>
