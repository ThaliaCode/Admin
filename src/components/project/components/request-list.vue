<template>
	<div>
		<header-page
			:columns="columns"
			name="projects-requirements"
			:rows="dataSelected"
			:title="$route.meta.title"
			to-show
			@clean-product-filter="onCleanData"
		/>
		<div class="project-list">
			<v-layout row justify-center>
				<v-dialog v-model="projectConfirm" persistent max-width="600">
					<v-card>
						<v-card-title class="headline"
							>Está seguro qué desea generar una OIT?</v-card-title
						>
						<v-card-text v-if="selectedRequirement">
							Requerimiento con código
							<strong>{{ selectedRequirement.autoCode }}</strong> del cliente
							<strong>{{
								selectedRequirement.customer.typePerson.fullName
							}}</strong>
						</v-card-text>
						<v-card-actions>
							<v-spacer></v-spacer>
							<v-btn color="error" @click.native="projectConfirm = false"
								>Cancelar</v-btn
							>
							<v-btn
								color="primary"
								:loading="isProjectLoading"
								@click.native="convertToProject()"
								>Generar</v-btn
							>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</v-layout>
			<general-filter>
				<v-layout row wrap justify-start>
					<v-flex xs12 sm6 md3 pr-1 class="align-col">
						<v-select
							label="Cliente"
							autocomplete
							:loading="loading"
							:items="customers"
							item-text="fullName"
							:search-input.sync="search"
							v-model="params.customerId"
							single-line
							bottom
							hide-details
							@input="setParamCustomer"
							class="filter-select shadow-inset"
							content-class="filter-select-content"
						></v-select>
					</v-flex>
					<v-flex xs12 sm6 md3 px-1 class="align-col">
						<v-select
							bottom
							single-line
							hide-details
							label="Tipo"
							class="filter-select shadow-inset"
							:items="types"
							v-model="params.typeRequirementId"
							item-text="name"
							item-value="id"
							content-class="filter-select-content"
							@input="loadData()"
						></v-select>
					</v-flex>
					<v-flex xs12 sm6 md3 px-1 class="align-col">
						<v-select
							bottom
							single-line
							hide-details
							label="Estado"
							class="filter-select shadow-inset"
							:items="states"
							v-model="params.status"
							item-text="name"
							item-value="id"
							content-class="filter-select-content"
							@input="loadData()"
						></v-select>
					</v-flex>
				</v-layout>
			</general-filter>
			<div class="overflow-auto">
				<app-table
					:current-page="currentPage"
					selectable
					local-storage
					name="requests"
					:columns="columns"
					:rows="data"
					:check-all="checkAll"
					:last-page="lastPage"
					:clean-search="isClean"
					@on-search-event="callServiceAndSearch"
					@on-page="changePage"
					@row-is-selected="rowIsSelected"
					@on-selected-all="selectedAll"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">
							{{ props.row.autoCode }}
						</td>
						<td v-show="showRow(columns, 2)">
							{{ props.row.customer.typePerson.fullName }}
						</td>
						<td v-show="showRow(columns, 3)">
							{{ props.row.typeRequirementName }}
						</td>
						<td v-show="showRow(columns, 4)">
							<span :style="`color: ${props.row.statusColor}`">
								{{ props.row.statusName }}
								<img
									v-if="props.row.flagSpecialist"
									:src="`${$imageUrl}/flag-specialist.svg`"
									alt="Especialista Enviado"
								/>
							</span>
						</td>
						<td v-show="showRow(columns, 5)">
							{{ props.row.quotationDocument }}
							<img
								v-if="props.row.flagSendQuotation"
								:src="`${$imageUrl}/icon-message.svg`"
								alt=""
							/>
						</td>
						<td v-show="showRow(columns, 6)">
							{{ props.row.totalHours }}
						</td>
						<td v-show="$route.name === 'request-list'">
							{{ props.row.estimatedCost }}
						</td>
						<td v-show="showRow(columns, 8)">
							<app-tooltip-button
								color="green"
								icon="edit"
								text="Editar Requerimiento"
								@click-icon="openRequirement(props.row)"
							>
							</app-tooltip-button>
							<app-tooltip-button
								color="green"
								icon="check_circle"
								text="Aprobar Requerimiento"
								:disabled="!validateApproval(props.row)"
								@click-icon="sendNotification(props.row)"
							>
							</app-tooltip-button>
							<app-tooltip-button
								color="success"
								icon="cloud_download"
								text="Descargar Cotización"
								:disabled="!props.row.quotationId"
								@click-icon="downloadSale(props.row)"
							>
							</app-tooltip-button>
							<v-tooltip top>
								<v-btn
									slot="activator"
									icon
									:loading="props.row.isLoading"
									:disabled="props.row.flagProject === 1"
									@click.stop="showProjectModal(props.row)"
									class="table-icon"
								>
									<img :src="`${$imageUrl}/oit.svg`" alt="" class="align-img" />
								</v-btn>
								<span>Generar OIT</span>
							</v-tooltip>
						</td>
					</template>
				</app-table>
			</div>
			<quick-actions
				class="products-list-quick-actions"
				:actions="fastActions"
				@open-modal="openModal"
				@to-link="toLink"
			/>
			<action-sidebar
				:width="action.width"
				v-model="action.open"
				:code-action="action.code"
				:title="action.title"
				:active="action.active"
				:img-src="action.imgSrc"
				:is-loading="loading"
				:header-color="action.color"
			>
				<customer-register
					:register-action="newCustomerRegister"
					@form-error="customerValidation"
				/>
				<section class="modal-filter-footer">
					<modal-sidebar-button
						:isLoading="customerError"
						@cancel-button-clicked="closeModal"
						@accept-button-clicked="applyFilter"
					/>
				</section>
			</action-sidebar>
		</div>
	</div>
</template>

<script>
import { maxLength, minLength, required } from 'vuelidate/lib/validators';
import helper from '@/shared/helper';
import actionSidebar from './../../shared/action-sidebar';
import appTable from './../../shared/table/app-table';
import generalFilter from './../../shared/general-filter';
import headerPage from './../../shared/header-page';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';
import quickActions from './../../shared/quick-actions';
import customerRegister from './../../shared/customer-register';

function created() {
	this.loadData();
	this.loadFilterData();
}

async function applyFilter() {
	if (this.newCustomerRegister) {
		this.newCustomerRegister = false;
	}
}

function callServiceAndSearch(searchValue) {
	this.searchData = searchValue;
	if (searchValue) {
		this.params.search = searchValue;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
	this.loadData();
}

function changePage(page) {
	this.currentPage = page;
	this.loadData(page);
}

function closeModal() {
	this.action.title = '';
	this.action.open = false;
	this.action.width = 0;
	this.customerError = false;
}

async function convertToProject() {
	if (this.selectedRequirement) {
		try {
			this.isProjectLoading = true;
			await this.$httpProduction.patch(
				`requirements/project/${this.selectedRequirement.id}`
			);
			this.showNotification('OIT generada correctamente');
		} catch (error) {
			const message = error.data.message;
			if (message === 'REQUIREMENT_NOT_EXIST') {
				this.showNotification(
					'El requerimiento no existe o fue eliminado',
					'error'
				);
			} else if (message === 'REQUIREMENT_STATUS_INVALID') {
				this.showNotification('El requerimiento no ha sido aprobado', 'error');
			} else {
				this.showGenericError();
			}
		} finally {
			this.isProjectLoading = false;
			this.projectConfirm = false;
		}
		this.loadData();
	} else {
		this.showNotification('Error al seleccionar requerimiento', 'error');
	}
}

async function downloadSale({ quotationId, quotationDocument }) {
	try {
		const downloadDialog = this.$userInfo.company.settings.downloadSale;
		const model = { code: 'pdf' };
		const responseType = 'blob';
		const contentType = downloadDialog ? 'application/pdf' : 'text/html';
		const response = await this.$httpReportSales.post(
			`sale-documents/${quotationId}/pdf`,
			model,
			{ responseType }
		);
		const blob = helper.generateBlob(response.data, contentType);
		helper.showDownloadDialog(blob, quotationDocument, downloadDialog);
	} catch (error) {
		this.showGenericError();
	}
}

async function loadData(page = 1) {
	this.params.page = page;
	this.currentPage = page;
	try {
		const response = await this.$httpProduction.get('requirements', {
			params: this.params,
		});
		this.data = response.data.map((request) => {
			const newRequest = Object.assign({}, request);
			newRequest.typeRequirementName = request.typeRequirement.name;
			newRequest.isSelected = false;
			return newRequest;
		});
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (err) {
		this.showGenericError();
	} finally {
		this.isClean = false;
	}
}

async function loadFilterData() {
	try {
		const response = await this.$httpProduction.get('type-requirements');
		this.types = response.data;
	} catch (err) {
		this.showGenericError();
	}
}

function onCleanData() {
	this.params = {
		page: null,
		search: null,
		type: null,
		customer: null,
		status: null,
	};
	this.checkAll = false;
	this.dataSelected = [];
	this.searchData = null;
	this.isClean = true;
	helper.removeLocalData('requests::search');
	this.callServiceAndSearch();
}

function openModal(value) {
	this.action = value;
	this.newCustomerRegister = true;
}

function openRequirement({ id }) {
	this.goTo('edit-requirement', { params: { id } });
}

function rowIsSelected(row, all) {
	if (row.isSelected) {
		if (this.dataSelected.length > 0 && all) {
			const dataToAdd = this.dataSelected.find(
				(rowSelected) => rowSelected.id === row.id
			);
			if (!dataToAdd) {
				this.dataSelected.push(row);
			}
		} else {
			this.dataSelected.push(row);
		}
	} else {
		const index = this.dataSelected.findIndex(
			(rowData) => rowData.id === row.id
		);
		this.dataSelected.splice(index, 1);
	}
	this.checkAll = this.data.every((check) => check.isSelected);
}

function search(val) {
	return this.searchCustomers(val);
}

async function searchCustomers(value) {
	const searchTrim = value ? value.trim() : '';
	if (searchTrim) {
		this.loading = true;
		try {
			const response = await this.customerSelections(searchTrim);
			this.customers = response.data.map((customer) => {
				const newCustomer = Object.assign({}, customer);
				newCustomer.fullName = `${customer.name} ${customer.lastname}`;
				return newCustomer;
			});
			this.loading = false;
		} catch (err) {
			this.showGenericError();
			this.loading = false;
		}
	}
}

function selectedAll(value) {
	this.checkAll = value;
	if (this.data.length > 0) {
		this.data = this.data.map((dataSingle) => {
			const newData = Object.assign({}, dataSingle);
			newData.isSelected = value;
			if (newData.isSelected) {
				if (this.dataSelected.length > 0) {
					const dataToAdd = this.dataSelected.find(
						(rowSelected) => rowSelected.id === newData.id
					);
					if (!dataToAdd) {
						this.dataSelected.push(newData);
					}
				} else {
					this.dataSelected.push(newData);
				}
			} else {
				const index = this.dataSelected.findIndex(
					(rowData) => rowData.id === newData.id
				);
				this.dataSelected.splice(index, 1);
			}
			return newData;
		});
	}
}

function setParamCustomer({ id }) {
	this.params.customerId = id;
	this.loadData();
}

function toLink(link) {
	this.$router.push(link);
}

function validations() {
	let customer = {
		ruc: {
			required,
			maxLength: maxLength(11),
			minLength: minLength(11),
		},
		rzSocial: { required },
	};
	if (this.active === '0') {
		customer = {
			dni: {
				required,
				maxLength: maxLength(9),
				minLength: minLength(8),
			},
			lastname: { required },
			name: { required },
		};
	}
	return { customer };
}

async function sendNotification({ id }) {
	try {
		const url = `/requirements/approved/${id}`;
		this.approveLoading = true;
		await this.$httpProduction.patch(url);
		this.showNotification('Requerimiento aprobado correctamente');
		this.loadData();
	} catch (error) {
		if (error.data.message === 'EMPLOYEE_NOT_FOUND') {
			this.showNotification('No se ha asignado un especialista', 'warning');
		} else {
			this.showGenericError();
		}
	} finally {
		this.approveLoading = false;
	}
}

function showProjectModal(requirement) {
	this.selectedRequirement = requirement;
	this.projectConfirm = true;
}

function validateApproval(requirement) {
	if (requirement.flagSpecialist) {
		return false;
	}
	if (
		requirement.statusName === 'Nuevo' ||
		requirement.statusName === 'Pendiente'
	) {
		return true;
	}
	return false;
}

function customerValidation({ error }) {
	this.customerError = error;
}

function data() {
	return {
		approveLoading: false,
		action: {
			title: '',
			open: false,
			width: 0,
		},
		active: '0',
		checkAll: false,
		columns: [
			{
				id: 1,
				name: 'N Req.',
				value: 'autoCode',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Cliente',
				value: 'customerName',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Tipo',
				value: 'typeRequirementName',
				visible: true,
				checked: true,
			},
			{ id: 4, name: 'Estado', value: 'status', visible: true, checked: true },
			{
				id: 5,
				name: 'Cotizaciones',
				value: 'quotationDocument',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Horas Hombre',
				value: 'totalHours',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Costo Estimado',
				value: 'estimatedCost',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		customerError: true,
		customers: [],
		data: [],
		dataSelected: [],
		fastActions: [
			{
				active: true,
				code: 'NR',
				color: '#33CFC7',
				img: `${this.$imageUrl}/icon-new-requirement.svg`,
				text: 'NUEVO REQUERIMIENTO',
				link: { name: 'requirement-new' },
			},
			{
				active: true,
				code: 'IE',
				color: 'color(primary)',
				img: `${this.$imageUrl}/icon-enter-company.svg`,
				text: 'INGRESO DE EMPRESA',
				maxWidth: 60,
				width: 640,
			},
		],
		isClean: false,
		isProjectLoading: false,
		lastPage: 1,
		loading: false,
		newCustomerRegister: false,
		params: {
			customer: null,
			page: 1,
			search: null,
			status: null,
			type: null,
		},
		projectConfirm: false,
		search: null,
		searchData: null,
		selectedRequirement: null,
		states: [
			{
				id: 1,
				name: 'Nuevo',
			},
			{
				id: 2,
				name: 'Aprobado',
			},
			{
				id: 3,
				name: 'Rechazado',
			},
			{
				id: 4,
				name: 'Cancelado',
			},
		],
		types: [],
	};
}

export default {
	name: 'request-list',
	components: {
		actionSidebar,
		appTable,
		customerRegister,
		generalFilter,
		headerPage,
		modalSidebarButton,
		quickActions,
	},
	created,
	data,
	methods: {
		applyFilter,
		callServiceAndSearch,
		changePage,
		closeModal,
		convertToProject,
		customerValidation,
		downloadSale,
		loadData,
		loadFilterData,
		onCleanData,
		openModal,
		openRequirement,
		rowIsSelected,
		searchCustomers: helper.debounce(searchCustomers),
		selectedAll,
		sendNotification,
		setParamCustomer,
		showProjectModal,
		toLink,
		validateApproval,
	},
	validations,
	watch: {
		search,
	},
};
</script>

<style lang="scss" scoped>
.table-icon {
	text-decoration: none;
}

.table-link {
	color: map-get($colors, tableLink);
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, small10);
	text-transform: uppercase;
}

button {
	margin: 0;
}

button:disabled {
	cursor: not-allowed;
	opacity: 0.3;
}
</style>
