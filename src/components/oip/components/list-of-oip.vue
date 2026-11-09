<template>
	<div>
		<header-page
			:columns="columns"
			name="projects"
			:rows="dataSelected"
			:title="$route.meta.title"
			to-show
			@clean-product-filter="onCleanData"
		/>
		<general-filter>
			<v-layout align-center>
				<!-- <v-flex xs3 px-1 class="align-col">
					<v-select autocomplete
						single-line
						bottom
						hide-details
						class="filter-select shadow-inset"
						content-class="filter-select-content"
						label="Buscar Cliente"
						item-id="id"
						item-text="typePerson.fullName"
						v-model="customer"
						:items="customers"
						:search-input.sync="search">
					</v-select>
				</v-flex> -->
				<v-flex xs2 px-1 class="align-col">
					<label class="caption">Fecha Inicial</label>
					<date-component
						:date="params.startDate"
						icon="/static/img/calendar.svg"
						@on-input="setDate({ model: 'startDate', value: $event })"
					></date-component>
				</v-flex>
				<v-flex xs2 px-1 class="align-col">
					<label class="caption">Fecha Final</label>
					<date-component
						:date="params.endDate"
						icon="/static/img/calendar.svg"
						@on-input="setDate({ model: 'endDate', value: $event })"
					></date-component>
				</v-flex>
				<v-flex xs3 pl-4 pt-3>
					<v-btn type="button" color="success" class="btn-action" @click="applyFilters">
						Buscar
						<v-icon color="white" size="16"> check_circle_outline </v-icon>
					</v-btn> </v-flex
				><v-flex xs3 pt-3>
					<v-btn
						type="button"
						color="primary"
						class="btn-action"
						@click="goTo('new-oip')"
					>
						Nueva OIP
					</v-btn>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto">
			<app-table
				name="projects"
				:columns="columns"
				:current-page="currentPage"
				:rows="data"
				local-storage
				selectable
				:check-all="checkAll"
				:last-page="lastPage"
				:items-quantity="data.length"
				:items-total-quantity="itemsTotalQuantity"
				:clean-search="isClean"
				:inputSearch="false"
				@on-search-event="callServiceAndSearch"
				@on-page="changePage"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.autoCode }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.employeeName || '-' }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.warehouseName }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.quantity }}</td>
					<td v-show="showRow(columns, 6)">
						{{ props.row.workData.timeExecution || '-' }}
					</td>
					<td v-show="showRow(columns, 7)">
						<document-state
							:color="getColorState(props.row)"
							icon="radio_button_checked"
							:tooltip="getTextState(props.row)"
						/>
					</td>
					<td v-show="showRow(columns, 8)">
						<app-tooltip-button
							height="18"
							color="warning"
							icon="edit"
							text="Editar OIP"
							@click-icon="goToEdit(props.row)"
						/>
						<app-tooltip-button
							height="18"
							color="error"
							icon="delete"
							text="Eliminar OIP"
							:disabled="props.row.states !== 8"
							@click-icon="deleteOIP(props.row)"
						/>
						<!-- <v-tooltip top>
							<v-btn slot="activator" icon small
								@click.stop.prevent="goToRequirement(props.row)">
								<v-icon>list</v-icon>
							</v-btn>
							<span>Ver Requerimiento</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn slot="activator" color="blue" flat icon small
								@click.stop.prevent="goToMovements(props.row)">
								<v-icon>transfer_within_a_station</v-icon>
							</v-btn>
							<span>Ver Movimientos</span>
						</v-tooltip>
						<v-tooltip top v-if="!operator">
							<v-btn slot="activator" color="green" flat icon small
								@click.stop.prevent="openCalendar(props.row)">
								<v-icon>date_range</v-icon>
							</v-btn>
							<span>Programación de OIT</span>
						</v-tooltip>
						<v-tooltip top v-if="!operator">
							<v-btn slot="activator" color="red" flat icon small
								@click.stop.prevent="goToExpenses(props.row)">
								<v-icon>money_off</v-icon>
							</v-btn>
							<span>Lista de Gastos</span>
						</v-tooltip>
						<v-tooltip top v-if="!operator">
							<v-btn slot="activator" color="purple" flat icon small
								@click.stop.prevent="downloadOit(props.row)">
								<v-icon>cloud_download</v-icon>
							</v-btn>
							<span>Descargar OIT</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn slot="activator" color="warning" flat icon small
								@click.stop.prevent="downloadReportOit(props.row)">
								<v-icon>monetization_on</v-icon>
							</v-btn>
							<span>Reporte de Liquidación</span>
						</v-tooltip> -->
					</td>
				</template>
			</app-table>
		</div>
		<!-- <action-sidebar
			:active="action.active"
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			v-model="action.open">
			<v-container v-if="operator" class="requirement-operator-info">
				<v-layout row wrap>
					<v-flex xs12>
						<p class="section-title">Cliente</p>
					</v-flex>
					<v-flex xs12 mb-3>
						<span>Nombre:</span>
						<span>{{operRequirement.customer.typePerson.fullName}}</span>
					</v-flex>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs6 mb-3>
						<span>Ruc:</span>
						<span>{{operRequirement.customer.typePerson.documentNumber}}</span>
					</v-flex>
					<v-flex xs6 mb-3>
						<span>email:</span>
						<span>{{operRequirement.customer.email}}</span>
					</v-flex>
					<v-flex xs6 mb-3>
						<span>Contacto:</span>
						<span>{{operRequirement.customer.contact}}</span>
					</v-flex>
					<v-flex xs6 mb-3>
						<span>Teléfono:</span>
						<span>{{operRequirement.customer.phone}}</span>
					</v-flex>
				</v-layout>
				<v-layout row wrap mt-3>
					<v-flex xs12>
						<p class="section-title">Requerimiento</p>
					</v-flex>
					<v-flex xs12>
						<span>Tipo:</span>
						<span>{{this.typeOfRequirement}}</span>
					</v-flex>
					<v-flex xs12 mb-3>
						<span>Dirección de la obra:</span>
						<span>{{operRequirement.requirement.address}}</span>
					</v-flex>
					<v-flex xs6 mb-3>
						<span>Horas Hombre:</span>
						<span>{{operRequirement.requirement.totalHours}}</span>
					</v-flex>
				</v-layout>
				<v-layout row wrap mt-3>
					<v-flex xs12>
						<p class="section-title">Descripción</p>
					</v-flex>
					<v-flex xs12 mb-3>
						<span>Título:</span>
						<span>{{operRequirement.requirement.title}}</span>
					</v-flex>
					<v-flex xs12 mb-3>
						<span>Descripción:</span>
						<span>{{operRequirement.requirement.description}}</span>
					</v-flex>
					<v-flex xs12 mb-3>
						<span>Observaciones:</span>
						<span>{{operRequirement.requirement.observation}}</span>
					</v-flex>
				</v-layout>
				<v-layout row wrap mt-3>
					<v-flex xs12>
						<p class="section-title">Especialista</p>
					</v-flex>
					<v-flex xs6 mb-3>
						<span>Nombre:</span>
						<span>{{operRequirement.employee.name}}</span>
						<span>{{operRequirement.employee.lastname}}</span>
					</v-flex>
					<v-flex xs6 mb-3>
						<span>Fecha:</span>
						<span>{{operRequirement.createdAt | formatDate}}</span>
					</v-flex>
				</v-layout>
			</v-container>
		</action-sidebar> -->
	</div>
</template>

<script>
import { format, subDays } from 'date-fns';
import dateComponent from '@/components/shared/date-component';
import documentState from '@/components/shared/document-state';
import helper from '@/shared/helper';
import appTable from './../../shared/table/app-table';
import generalFilter from './../../shared/general-filter';
import headerPage from '../../shared/header-page';
import actionSidebar from './../../shared/action-sidebar';

function created() {
	this.operator = this.$route.name === 'list-of-projects-op';
	this.loadData();
}

function applyFilters() {
	this.loadData();
}

function callServiceAndSearch(searchTerm) {
	this.searchData = searchTerm;
	this.params.search = searchTerm || null;
	this.currentPage = 1;
}

function changePage(page) {
	this.currentPage = page;
	this.allIsSelected();
}

// async function downloadOit({ id, autoCode }) {
// 	try {
// 		const model = { projectId: id };
// 		const responseType = 'blob';
// 		const response = await this.$httpProduction.post('reports/oit', model, { responseType });
// 		const blob = helper.generateBlob(response.data);
// 		helper.showDownloadDialog(blob, autoCode, 'pdf');
// 	} catch (error) {
// 		this.showGenericError();
// 	}
// }

// async function downloadReportOit({ id, autoCode }) {
// 	const body = {
// 		projectId: id,
// 	};
// 	const responseType = 'blob';
// 	const response = await this.$httpProduction.post('reports/oit-utility', body, { responseType });
// 	const blob = helper.generateBlob(response.data);
// 	helper.showDownloadDialog(blob, `liquidación-oit_${autoCode}`, 'pdf');
// }

function goToEdit({ id }) {
	this.goTo('oip-edit', { params: { id } });
}
async function deleteOIP(row) {
	try {
		await this.$httpProduction.delete(`projects/${row.id}`);
		this.showNotification('Se elimino el oip correctamente');
		this.loadData();
	} catch (error) {
		this.showGenericError(error);
	}
	// console.log({ row });
	// this.goTo('oit-edit', { params: { id } });
}

function goToExpenses({ id }) {
	const projectId = id;
	this.goTo('expenses', { query: { projectId } });
}

function goToMovements({ id, autoCode, requirement }) {
	const saleId = requirement.quotationId;
	this.goTo('project-movements', { params: { id, autoCode, saleId } });
}

function goToRequirement(row) {
	if (this.operator) {
		this.operRequirement = { ...row };
		this.getRequerimentsTypes();
		this.action = {
			active: true,
			open: true,
			title: 'Requerimiento',
			width: 500,
		};
	} else {
		const id = row.requirementId;
		this.goTo('edit-requirement', { params: { id } });
	}
}

async function getRequerimentsTypes() {
	try {
		const { data: response } = await this.$httpProduction.get('type-requirements');
		this.types = [...response];
	} catch (error) {
		this.showGenericError();
	}
}

function typeOfRequirement() {
	const currentType = this.types.find(
		(t) => t.id === this.operRequirement.requirement.typeRequirementId
	);
	return currentType ? currentType.name : '';
}

async function loadData() {
	this.params.page = this.currentPage;
	// this.params.customerId = this.customer.id || null;
	this.params.type = 2; // OIP
	const projects = await this.$httpProduction.get('projects', { params: this.params });
	this.data = projects.data.map((project) => {
		const newProject = { ...project };
		newProject.employeeName = project.employee && project.employee.name;
		newProject.requirementAutoCode = project.requirement.autoCode;
		return newProject;
	});
	this.lastPage = Number(projects.headers['x-last-page']);
	this.itemsTotalQuantity = Number(projects.headers['x-quantity']);
	this.isClean = false;
}

function onCleanData() {
	this.currentPage = 1;
	// this.customer.id = null;
	// this.customers = [];
	this.params = {
		// customerId: null,
		endDate: null,
		page: 1,
		search: null,
		startDate: null,
		limit: 20,
	};
	this.searchData = '';
	this.isClean = true;
	// helper.removeLocalData('projects::search');
	this.loadData();
}

function openCalendar(row) {
	helper.setLocalData('project-selected', row);
	this.goTo('calendar-by-project', { params: { projectId: row.id } });
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
		const index = this.dataSelected.findIndex((rowData) => rowData.id === row.id);
		this.dataSelected.splice(index, 1);
	}
	this.checkAll = this.data.every((check) => check.isSelected);
}

// function search(value) {
// 	const searchTrim = value ? value.trim() : '';
// 	// const customer = this.customers.findIndex(c => c.typePerson.fullName === searchTrim);
// 	if (customer === -1) {
// 		if (searchTrim) {
// 			this.searchCustomers(searchTrim);
// 		}
// 	}
// }

// async function searchCustomers(value) {
// 	try {
// 		const { data: customers } = await this.$httpSales.get(
// 			`customers?search=${value}`,
// 		);
// 		this.customers = customers;
// 	} catch (error) {
// 		this.showGenericError();
// 	}
// }

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
				const index = this.dataSelected.findIndex((rowData) => rowData.id === newData.id);
				this.dataSelected.splice(index, 1);
			}
			return newData;
		});
	}
}

function data() {
	return {
		action: {
			active: false,
			code: null,
			open: false,
			title: 'titulo desde data',
			width: 0,
		},
		actionDefault: {
			active: false,
			code: null,
			open: false,
			title: 'titulo desde data',
			width: 0,
		},
		checkAll: false,
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Empleado', visible: true, checked: true },
			{ id: 4, name: 'Almacen', value: 'warehouseName', visible: false, checked: false },
			{ id: 5, name: 'Cantidad', value: 'quantity', visible: false, checked: false },
			{ id: 6, name: 'Horas estimadas', value: 'time', visible: true, checked: true },
			{ id: 7, name: 'Estados', value: 'state', visible: true, checked: true },
			{ id: 8, name: 'Acciones', value: 'actions', visible: true, checked: true },
		],
		currentPage: 1,
		// customer: {
		// 	typePerson: {
		// 		id: null,
		// 		fullName: '',
		// 		documentNumber: '',
		// 	},
		// },
		// customers: [],
		data: [],
		dataSelected: [],
		isClean: false,
		lastPage: 1,
		itemsTotalQuantity: 0,
		menuEnd: false,
		menuStart: false,
		operator: false,
		// operRequirement: {
		// 	customer: {
		// 		typePerson: {
		// 			fullName: '',
		// 			documentNumber: '',
		// 		},
		// 	},
		// 	employee: {},
		// 	requirement: {},
		// 	type: {
		// 		name: '',
		// 	},
		// },
		params: {
			customerId: null,
			endDate: null,
			page: 1,
			limit: 20,
			search: null,
			startDate: null,
		},
		percentage: 0,
		project: '',
		searchData: '',
		// search: '',
		selectedProject: {
			progress: 0,
		},
		types: [],
		statesData: {
			8: {
				color: 'warning',
				text: 'Pendiente',
			},
			7: {
				color: 'primary',
				text: 'En Proceso',
			},
			2: {
				color: 'success',
				text: 'Finalizado',
			},
			1: {
				color: 'info',
				text: 'Registrado',
			},
		},
	};
}

export default {
	name: 'list-of-projects',
	created,
	components: {
		actionSidebar,
		appTable,
		generalFilter,
		headerPage,
		documentState,
		dateComponent,
	},
	computed: {
		typeOfRequirement,
	},
	data,
	methods: {
		applyFilters,
		callServiceAndSearch,
		changePage,
		// downloadOit,
		// downloadReportOit,
		getRequerimentsTypes,
		goToEdit,
		goToExpenses,
		goToMovements,
		goToRequirement,
		loadData,
		onCleanData,
		openCalendar,
		rowIsSelected,
		selectedAll,
		deleteOIP,
		getColorState(r) {
			return r.states ? this.statesData[r.states].color : null;
		},
		getTextState(r) {
			return r.states ? this.statesData[r.states].text : null;
		},
		setDate({ model, value }) {
			if (value) {
				this.params[model] = format(value, 'YYYY-MM-DD');
			} else if (model === 'startDate' && !value) {
				this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
			} else {
				this.params.endDate = this.$today();
			}
		},
		async changeState({ id, states }) {
			let newState = 0;
			if (states === 8) {
				newState = 7;
			} else if (states === 7) {
				newState = 2;
			}

			const body = { states: newState };
			try {
				await this.$httpProduction.patch(`project/${id}`, body);
				this.showNotification('Se cambio el estado del oip correctamente.');
				this.loadData();
			} catch (error) {
				this.showGenericError();
			}
		},
	},
};
</script>
<style lang="scss" scoped>
.percentage-form {
	padding: 10px;
}
.requirement-operator-info {
	font-size: map-get($sizes, medium);
}
.section-title {
	border-bottom: 1px solid map-get($colors, info);
	font-family: map-get($fonts, open-bold);
	font-size: map-get($sizes, medium16);
}
</style>
