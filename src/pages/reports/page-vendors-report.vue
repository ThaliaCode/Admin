<template>
	<div>
		<header-page
			:title="$route.meta.title"
			:show-excel="false"
			to-show
			@clean-product-filter="cleanFilter"
		/>
		<general-filter class="layout wrap align-center" pt-2>
			<v-flex xs12 md3 px-2>
				<label class="caption">Reporte</label>
				<v-select
					:items="reports"
					v-model="selectedReport"
					class="filter-select shadow-inset"
					item-text="name"
				></v-select>
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
					:min-date="params.startDate"
					label="Fecha de fin"
					model="endDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs12 sm2 md2 px-2 pt-3 hidden-sm-and-down>
				<v-btn
					:disabled="isLoading"
					:loading="isLoading"
					color="primary"
					block
					@click="downloadReport('download')"
				>
					<v-icon> image_search </v-icon>
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
					<v-icon> cloud_download </v-icon>
				</v-btn>
			</v-flex>
		</general-filter>
		<div ref="viewer" id="result" class="hidden-sm-and-down"></div>
	</div>
</template>

<script>
import helper from '@/shared/helper';
import format from 'date-fns/format';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import subDays from 'date-fns/sub_days';
import typeEntityId from '@/shared/type-entity';

async function created() {
	const params = { typeEntityId: typeEntityId.Customer };
	const requests = [this.$httpSalesRead.get('group', { params })];
	[{ data: this.groups }] = await Promise.all(requests);
	if (this.reports.length) {
		this.selectedReport = this.reports[0];
	}
	if (this.groups.length) {
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
		const params = {
			responseType: 'blob',
			params: {
				startDate: this.params.startDate,
				endDate: this.params.endDate,
				groupId: this.groupId,
				flagEcu: this.isEcuador,
			},
		};
		const { fileName, post, extension } = this.selectedReport;
		const name = `${fileName}-${this.params.startDate}-${this.params.endDate}`;
		const url = 'vendors/pdf';
		const { data: blobData } = await this.$httpReportSales.post(
			url,
			post,
			params
		);
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
	}
}
function cleanFilter() {
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
}
function getGroup({ model, value }) {
	this[model] = value;
}
function data() {
	return {
		groupId: null,
		selectedReport: null,
		groups: [],
		params: {
			startDate: null,
			endDate: null,
		},
		isLoading: false,
		reports: [
			{
				id: 1,
				fileName: 'listado-caja',
				name: 'Reporte Listado de Proveedores',
				code: 'list-vendors',
				post: {
					code: 'list-vendors',
				},
			},
		],
	};
}
export default {
	name: 'page-vendors-report',
	created,
	data,
	components: {
		headerPage,
		generalFilter,
	},
	methods: {
		cleanFilter,
		downloadReport,
		getGroup,
		setDate,
	},
};
</script>
