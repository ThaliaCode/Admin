<template>
	<div>
		<header-page
			name="page-attendance-control"
			:title="$route.meta.title"
			to-show
			:show-excel="false"
			@clean-product-filter="onCleanData"
		></header-page>
		<general-filter class="mt-2">
			<v-flex xs2 mr-3>
				<label class="caption">Fecha Inicio</label>
				<app-date-select
					:date-formatted="params.startDate"
					label=""
					model="startDate"
					@input="setDate($event)"
				/>
			</v-flex>
			<v-flex xs2 mr-3>
				<label class="caption">Fecha Final</label>
				<app-date-select
					:date-formatted="params.endDate"
					:min-date="params.startDate"
					:max-date="maxDate"
					:readonly="!params.startDate"
					label=""
					model="endDate"
					@input="setDate($event)"
				/>
			</v-flex>
			<v-flex xs3 mr-3>
				<autocomplete-component
					chips
					multiple
					:return-object="false"
					item-text="fullname"
					item-value="id"
					:items="employees"
					label-value="Empleado"
					:item="params.employeeIds"
					@return-data="setData($event, 'employeeIds')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs1 mr-3>
				<v-btn
					class="mb-0"
					:disabled="isLoading"
					:loading="isLoading"
					color="primary"
					block
					@click="downloadReport('preview')"
				>
					<v-icon> image_search </v-icon>
				</v-btn>
			</v-flex>
			<v-flex xs1>
				<v-btn
					class="mb-0"
					@click="downloadReport('download')"
					:disabled="isLoading"
					:loading="isLoading"
					color="success"
					block
				>
					<v-icon> cloud_download </v-icon>
				</v-btn>
			</v-flex>
		</general-filter>
		<div ref="viewer" id="result" class="hidden-sm-and-down"></div>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import appDateSelect from '@/components/shared/app-date-select';
import helper from '@/shared/helper';
import { format } from 'date-fns';

function created() {
	this.loadData();
}

export default {
	name: 'page-attendance-control',
	created,
	data() {
		return {
			params: {
				startDate: null,
				endDate: null,
				employeeIds: [],
			},
			maxDate: null,
			employees: [],
			isLoading: false,
		};
	},
	components: {
		headerPage,
		generalFilter,
		appDateSelect,
	},
	methods: {
		async loadData() {
			const requests = [this.globalEmployees()];
			try {
				[{ data: this.employees }] = await Promise.all(requests);
			} catch (err) {
				this.showGenericError();
			}
		},
		setData(value, model) {
			this.params[model] = value;
		},
		setDate({ model, value }) {
			this.params[model] = format(value, 'YYYY-MM-DD');
			if (model === 'startDate') {
				this.params.endDate = null;
			}
			const date = new Date(this.params.startDate);
			date.setDate(date.getDate() + 30);
			this.maxDate = date.toISOString().split('T')[0];
		},
		async downloadReport(type) {
			if (!this.params.startDate || !this.params.endDate) {
				this.showNotification(
					'Debe seleccionar un rango de fecha de una semana como maximo'
				);
				return;
			}
			const params = {
				...this.params,
				employeeIds: this.params.employeeIds.length ? this.params.employeeIds : undefined,
			};
			this.isLoading = true;
			let body = {};
			let url = '';
			if (type === 'preview') {
				url = 'assistance-viewer';
				body = {
					...params,
					code: 'assistance-report-pdf',
				};
			} else {
				const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
				url = 'documents/assistance-report-pdf';
				body = {
					extension: 'pdf',
					filename: `Reporte_de_asistencia_${now}`,
					params: {
						...params,
					},
				};
			}
			try {
				if (type === 'preview') {
					const { data: blobData } = await this.$httpSales.post(url, body, {
						responseType: 'blob',
					});
					const blob = helper.generateBlob(blobData);
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
					await this.$httpReports.post(url, body);
					this.notificationReport('reporte de control de asistencia');
				}
			} catch (error) {
				console.log(error);
				this.showGenericError();
			} finally {
				this.isLoading = false;
			}
		},
		onCleanData() {
			this.params = {
				startDate: null,
				endDate: null,
				employeeIds: [],
			};
			this.maxDate = null;
		},
	},
};
</script>
