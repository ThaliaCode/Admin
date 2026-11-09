<template>
	<div>
		<header-page
			:columns="columns"
			name="projects-employees"
			:rows="dataSelected"
			:title="$route.meta.title"
			to-show
			v-on:clean-product-filter="onCleanData" />
		<div class="project-list">
			<div class="overflow-auto">
				<app-table
					:current-page="currentPage"
					selectable
					local-storage
					name="employees"
					:columns="columns"
					:rows="data"
					:check-all="checkAll"
					:last-page="lastPage"
					:clean-search="isClean"
					v-on:on-search-event="callServiceAndSearch"
					v-on:on-page="changePage"
					v-on:row-is-selected="rowIsSelected"
					v-on:on-selected-all="selectedAll"
					@on-toggle-columns="toggleColumns">
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">{{ props.row.fullName }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.numDocument }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.level }}</td>
						<td v-show="showRow(columns, 4)">{{ props.row.specialty }}</td>
						<td v-show="showRow(columns, 5)">
							<v-btn
								flat
								small
								type="button"
								class="table-icon"
								:color="props.row.color"
								@click="inactiveAction(props.row)">
								{{ props.row.flagActiveWord }}
							</v-btn>
						</td>
						<td v-show="showRow(columns, 6)">
							<v-tooltip top>
								<v-btn
									flat
									icon
									small
									type="button"
									class="table-icon"
									color="green"
									@click="openModal(actionJornal, props.row)"
									slot="activator"
								>
									<v-icon>attach_money</v-icon>
								</v-btn>
								<span>Asignar tarifa por hora</span>
							</v-tooltip>
							<v-tooltip top>
								<v-btn
									color="blue"
									@click="seeReport(props.row)"
									flat
									icon
									small
									slot="activator"
								>
									<v-icon>timelapse</v-icon>
								</v-btn>
								<span>Horas por OIT</span>
							</v-tooltip>
							<v-tooltip top>
								<v-btn
									@click="editEmployee(props.row)"
									flat
									icon
									small
									slot="activator"
								>
									<v-icon
										color="primary"
										size="19">
										edit
									</v-icon>
								</v-btn>
								<span>Editar Técnico</span>
							</v-tooltip>
						</td>
					</template>
				</app-table>
			</div>
			<quick-actions
				class="products-list-quick-actions"
				v-bind:actions="fastActions"
				v-on:open-modal="openModal" />
			<action-sidebar
				:width="action.width"
				v-model="action.open"
				:code-action="action.code"
				:title="action.title"
				:is-loading="isLoading"
				:help-actions="actionsToHelp"
				v-on:close-modal="closeModal">
				<v-layout row wrap justify-center px-3
					v-if="action.code === 'NO' || action.code === 'EO'">
					<v-flex xs12>
						<v-layout row wrap align-start mt-2>
							<v-flex xs12 sm6 pr-1>
								<v-text-field
									hide-details
									class="filter-select mt-3"
									:class="{ 'mb-4': !$v.newEmployee.name.$invalid}"
									label="Nombre"
									type="text"
									v-model="newEmployee.name">
								</v-text-field>
								<span class="form-group__message" v-if="$v.newEmployee.name.$invalid">
									El nombre del técnico es requerido.
								</span>
							</v-flex>
							<v-flex xs12 sm6 pl-1>
								<v-text-field
									class="filter-select mt-3"
									:class="{ 'mb-4': !$v.newEmployee.lastName.$invalid}"
									label="Apellidos"
									type="text"
									v-model="newEmployee.lastName">
								</v-text-field>
								<span class="form-group__message" v-if="$v.newEmployee.lastName.$invalid">
									El Apellido del técnico es requerido.
								</span>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-4>
						<v-layout row wrap>
							<v-flex xs12 sm6 pr-1>
								<v-select
									bottom
									hide-details
									label="Tipo de documento"
									class="filter-select"
									v-bind:items="typeDocuments"
									v-model="newEmployee.typeDocument"
									item-text="name"
									item-value="id"
									content-class="filter-select-content"
								></v-select>
							</v-flex>
							<v-flex xs12 sm6 pl-1>
								<v-text-field
									class="filter-select"
									label="# Documento (DNI, Extranjería, etc)"
									type="number"
									v-model="newEmployee.numDocument">
								</v-text-field>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-2>
						<v-layout row wrap align-center>
							<v-flex xs12 sm6 pr-1>
								<v-select
									bottom
									hide-details
									label="Nivel"
									class="filter-select"
									v-bind:items="levels"
									v-model="newEmployee.level"
									content-class="filter-select-content"
								></v-select>
							</v-flex>
							<v-flex xs12 sm6 pl-1>
								<v-text-field
									class="filter-select"
									label="Código"
									type="text"
									maxlength="10"
									v-model="newEmployee.employeeCode">
								</v-text-field>
								<span
									class="text-not-code-blank"
									v-if="checkBlankCode(newEmployee.employeeCode)">
									No se permite espacios en blanco
								</span>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<v-layout row wrap align-center>
							<v-flex xs12 sm3 pr-1>
								<v-text-field
									class="filter-select mt-3"
									label="Edad"
									type="number"
									v-model.number="age">
								</v-text-field>
							</v-flex>
							<v-flex xs12 sm9 pl-1>
								<v-text-field
									class="filter-select mt-3"
									label="Especialidad"
									type="text"
									v-model="newEmployee.specialty">
								</v-text-field>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<v-layout row wrap align-start mt-3>
							<v-flex xs12 sm3 pr-1>
								<v-text-field
									class="filter-select"
									label="Teléfono"
									type="number"
									v-model="newEmployee.phone">
								</v-text-field>
							</v-flex>
							<v-flex xs12 sm9 pl-1>
								<v-text-field
									class="filter-select"
									:class="{ 'mb-4': !$v.newEmployee.email.$invalid }"
									label="Correo electrónico"
									type="email"
									v-model="newEmployee.email">
								</v-text-field>
								<span class="form-group__message" v-if="$v.newEmployee.email.$invalid">
									El correo del técnico es requerido.
								</span>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<v-text-field
							class="textarea-content filter-select"
							label="Observaciones"
							textarea
							no-resize
							multi-line
							type="text"
							v-model="comment">
						</v-text-field>
					</v-flex>
				</v-layout>
				<v-layout row wrap justify-center px-4
					v-if="action.code === 'VT'">
					<v-flex xs12>
						<div class="overflow-auto pb-0">
							<app-table
								local-storage
								name="turns"
								:main-list="false"
								:input-search="false"
								:filter-columns="false"
								:columns="turnsColumns"
								:rows="turnsData"
								class="no-main-list is-not-selectable">
								<template slot="rows" slot-scope="props">
									<td
										class="is-not-selectable">{{ props.row.name }}</td>
									<td>{{ props.row.startTime }}</td>
									<td>{{ props.row.endTime }}</td>
									<td>
										<v-btn
											color="red"
											flat
											icon
											@click="deleteTurn(props.row)"
										>
											<v-icon>delete</v-icon>
										</v-btn>
									</td>
								</template>
							</app-table>
						</div>
					</v-flex>
					<v-flex xs12>
						<v-layout row wrap align-center mt-3>
							<v-flex xs12>
								<p class="title-form">Nuevo Turno</p>
							</v-flex>
						</v-layout>
						<v-layout row wrap align-center>
							<v-flex xs12 sm6>
								<v-text-field
									class="filter-select"
									label="Nombre"
									single-line
									v-model="newTurn.name">
								</v-text-field>
							</v-flex>
							<v-flex xs12 sm3 pl-3>
								<v-menu
									ref="startMenu"
									lazy
									:close-on-content-click="false"
									v-model="startMenu"
									transition="scale-transition"
									offset-y
									full-width
									max-width="290px"
									min-width="290px"
									:return-value.sync="newTurn.startTime">
									<v-text-field
										slot="activator"
										label="Inicio"
										class="filter-select input-time-picker"
										single-line
										v-model="newTurn.startTime"
										readonly>
									</v-text-field>
									<v-time-picker
										v-model="newTurn.startTime"
										@change="$refs.startMenu.save(newTurn.startTime)">
									</v-time-picker>
								</v-menu>
							</v-flex>
							<v-flex xs12 sm3 pl-3>
								<v-menu
									ref="endMenu"
									lazy
									:close-on-content-click="false"
									v-model="endMenu"
									transition="scale-transition"
									offset-y
									full-width
									max-width="290px"
									min-width="290px"
									:return-value.sync="newTurn.endTime">
									<v-text-field
										slot="activator"
										label="Termino"
										class="filter-select input-time-picker"
										single-line
										v-model="newTurn.endTime"
										readonly>
									</v-text-field>
									<v-time-picker
										v-model="newTurn.endTime"
										@change="$refs.endMenu.save(newTurn.endTime)">
									</v-time-picker>
								</v-menu>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-layout row wrap justify-center px-4
					v-if="action.code === 'JO'">
					<v-flex xs12>
						<h3 class="title-form name-form mt-3">
							{{ employeeName }}
						</h3>
					</v-flex>
					<v-flex xs12>
						<div class="overflow-auto pb-0">
							<app-table
								local-storage
								name="turns"
								:main-list="false"
								:input-search="false"
								:filter-columns="false"
								:columns="jornalColumns"
								:rows="jornalData"
								class="no-main-list is-not-selectable">
								<template slot="rows" slot-scope="props">
									<td
										class="is-not-selectable">
										{{ props.row.name }} {{ props.row.startTime }} {{ props.row.endTime }}
									</td>
									<td>({{ props.row.numHours }} hrs)</td>
									<td>
										<v-text-field
											type="number"
											v-model.number="props.row.amountHours"
											single-line
											hide-details
											v-on:keyup="calculateTotalAmount"
											class="filter-select shadow-inset-table"
										></v-text-field>
									</td>
									<td>{{ props.row.amountTotal | round }}</td>
								</template>
							</app-table>
						</div>
					</v-flex>
				</v-layout>
				<section class="modal-filter-footer">
					<modal-sidebar-button
						:isLoading="$v.$invalid || checkBlankCode(newEmployee.employeeCode)"
						v-on:cancel-button-clicked="closeModal"
						v-on:accept-button-clicked="applyFilter" />
				</section>
			</action-sidebar>
		</div>
		<v-dialog
			v-model="reportModal"
			max-width="800"
		>
			<v-card>
				<v-card-title>
					<h3>
						Total Horas por OIT de {{ selectedEmployee.name }} {{ selectedEmployee.lastName }}
					</h3>
				</v-card-title>
				<v-card-text>
					<app-table
						:main-list="false"
						:columns="reportColumns"
						:rows="reports"
						:include-filter="false"
						:filter-columns="false"
						:input-search="false"
					>
						<template slot="rows" slot-scope="props">
							<td>{{ props.row.code }} - {{ props.row.name }}</td>
							<td>{{ props.row.totalHours }}</td>
						</template>
					</app-table>
				</v-card-text>
			</v-card>
		</v-dialog>
		<v-dialog v-model="inactive" max-width="500px">
			<v-card>
				<v-card-title>
					<v-layout d-flex justify-center>
						<p class="text-xs-center">¿Esta seguro que desea <b>{{ userStatusWord }}</b> a este técnico?:</p>
					</v-layout>
				</v-card-title>
				<v-card-text>
					<v-layout d-flex justify-center>
						<h2 class="text-xs-center">{{ currentUser.name }} {{ currentUser.lastname }}</h2>
					</v-layout>
				</v-card-text>
				<v-card-actions>
					<v-layout d-flex justify-space-between>
						<v-btn
							type="button"
							@click="cancelInactive"
							color="pink"
							class="btn-action mr-1">
							Cancelar
							<v-icon
								color="white"
								size="16">
								highlight_off
							</v-icon>
						</v-btn>
						<v-btn
							type="button"
							color="success"
							@click="applyAction"
							class="btn-action ml-1">
							Aceptar
							<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators';
import helper from '@/shared/helper';
import actionSidebar from './../../shared/action-sidebar';
import appTable from './../../shared/table/app-table';
import headerPage from './../../shared/header-page';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';
import quickActions from './../../shared/quick-actions';

function created() {
	this.loadData();
}

function applyDisabled() {
	const disabled = ((this.newEmployee.level === '')
		|| (this.newEmployee.name === '') || (this.newEmployee.lastName === '')
		|| (this.newEmployee.typeDocument === 0) || (this.newEmployee.numDocument === '')
		|| (this.newEmployee.employeeCode === '') || (this.newEmployee.specialty === '')
		|| (this.newEmployee.phone === '') || (this.newEmployee.email === ''))
		&& ((this.newTurn.name === '') || (this.newTurn.startTime === '')
		|| (this.newTurn.endTime === ''));
	return disabled;
}

function applyFilter() {
	if (this.action.code === 'NO' || this.action.code === 'EO') {
		this.createEmployee();
	}
	if (this.action.code === 'VT') {
		this.createTurn();
	}
	if (this.action.code === 'JO') {
		this.assignRateByTurn();
	}
}

async function assignRateByTurn() {
	const model = this.jornalData.map((jornal) => {
		const newJornal = Object.assign({}, jornal);
		newJornal.rate = {
			turnId: jornal.id,
			amountHours: jornal.amountHours,
		};
		return newJornal.rate;
	});
	try {
		await this.$httpProduction.post(`rate-turn/${this.employeeId}`, model);
		this.showNotification(`La tarifas para el técnico ${this.employeeName} han sido actualizadas`);
		this.closeModal();
	} catch (err) {
		this.showGenericError();
	}
}

function calculateTotalAmount() {
	this.jornalData = this.jornalData.map((jornal) => {
		const newJornal = Object.assign({}, jornal);
		newJornal.amountTotal = (jornal.amountHours * jornal.numHours);
		return newJornal;
	});
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
	this.allIsSelected();
	this.loadData(page);
}

function closeModal() {
	this.action.code = '';
	this.action.title = '';
	this.action.open = false;
	this.isLoading = true;
	this.loading = false;
	this.newEmployee = {
		level: 'Practicante',
	};
	this.newTurn = {
		name: '',
		endTime: null,
		startTime: null,
	};
	this.age = null;
	this.comment = null;
}

async function createEmployee() {
	const id = this.newEmployee.id;
	const createMessage = 'Se ha creado un nuevo Técnico';
	const editMessage = 'El Técnico ha sido actualizado correctamente';
	const message = id ? editMessage : createMessage;
	const createUrl = 'employees';
	const editUrl = `employees/${id}`;
	const url = id ? editUrl : createUrl;
	const editBody = {
		typeDocument: this.newEmployee.typeDocument,
		numDocument: this.newEmployee.numDocument,
		name: this.newEmployee.name,
		lastName: this.newEmployee.lastName,
		email: this.newEmployee.email,
		phone: this.newEmployee.phone,
		specialty: this.newEmployee.specialty,
		level: this.newEmployee.level,
		flagActive: this.newEmployee.flagActive === 1,
		age: this.newEmployee.age,
	};
	const createBody = { ...this.newEmployee };
	delete createBody.flagActive;
	const body = id ? editBody : createBody;
	const createMethod = 'post';
	const editMethod = 'patch';
	const method = id ? editMethod : createMethod;
	try {
		await this.$httpProduction[method](url, body);
		this.showNotification(message);
		this.closeModal();
		this.loadData();
	} catch (err) {
		this.showGenericError();
	}
}

async function createTurn() {
	const endHour = Number(this.newTurn.endTime.split(':')[0]);
	const endMinutes = Number(this.newTurn.endTime.split(':')[1]) / 60;
	const startHour = Number(this.newTurn.startTime.split(':')[0]);
	const startMinutes = Number(this.newTurn.startTime.split(':')[1]) / 60;
	const totalEndHours = endHour + endMinutes;
	const totalStartHours = startHour + startMinutes;
	this.newTurn.numHours = totalEndHours - totalStartHours;
	if (this.newTurn.numHours < 0) this.newTurn.numHours = 24 + this.newTurn.numHours;
	try {
		await this.$httpProduction.post('turns', this.newTurn);
		this.showNotification('El turno fue creado correctamente');
		this.newTurn = {
			name: '',
			endTime: null,
			startTime: null,
		};
		this.loadTurnsData();
	} catch (err) {
		this.showGenericError();
	}
}

async function deleteTurn({ id }) {
	try {
		await this.$httpProduction.delete(`turns/${id}`);
		const turnIndex = this.turnsData.findIndex(t => t.id === id);
		this.turnsData.splice(turnIndex, 1);
	} catch (error) {
		if (error.data.message === 'TURN_DELETE_ERROR') {
			this.showNotification('El turno tiene técnicos asignados', 'error');
		} else {
			this.showGenericError();
		}
	}
}

async function loadData(page = 1) {
	this.params.page = page;
	this.currentPage = page;
	const requests = [this.$httpProduction.get('employees', { params: this.params })];
	try {
		const [employees] = await Promise.all(requests);
		this.data = employees.data.map((employee) => {
			const newEmployee = { ...employee };
			newEmployee.fullName = `${employee.name} ${employee.lastName}`;
			newEmployee.isSelected = false;
			newEmployee.color = employee.flagActive === 1 ? 'success' : 'error';
			newEmployee.flagActiveWord = employee.flagActive === 1 ? 'Activo' : 'Desactivado';
			return newEmployee;
		});
	} catch (err) {
		this.showGenericError();
	} finally {
		this.isClean = false;
	}
}

async function loadJornalData(employeeId) {
	try {
		const response = await this.$httpProduction.get(`rate-turn/${employeeId}`);
		this.jornalData = response.data.map((jornal) => {
			const newJornal = Object.assign({}, jornal);
			newJornal.amountTotal = (jornal.amountHours * jornal.numHours);
			return newJornal;
		});
	} catch (err) {
		this.showGenericError();
	}
}

async function loadTurnsData() {
	try {
		const response = await this.$httpProduction.get('turns');
		this.turnsData = response.data;
	} catch (err) {
		this.showGenericError();
	}
}

function openModal(value, employee) {
	this.isLoading = false;
	this.loading = true;
	if (value.code === 'JO') {
		this.action = Object.assign({}, this.actionJornal);
		this.employeeId = employee.id;
		this.employeeName = `${employee.name} ${employee.lastName}`;
		this.loadJornalData(employee.id);
		this.loading = false;
	} else if (value.code === 'VT') {
		this.action = value;
		this.loading = true;
		this.loadTurnsData();
	} else {
		this.action = value;
		this.loading = true;
	}
}

function onCleanData() {
	this.params = {
		page: null,
		search: null,
	};
	this.checkAll = false;
	this.dataSelected = [];
	this.searchData = null;
	this.isClean = true;
	helper.removeLocalData('employees::search');
	this.callServiceAndSearch();
}

function rowIsSelected(row, all) {
	if (row.isSelected) {
		if (this.dataSelected.length > 0 && all) {
			const dataToAdd = this.dataSelected.find(rowSelected =>
				rowSelected.id === row.id);
			if (!dataToAdd) {
				this.dataSelected.push(row);
			}
		} else {
			this.dataSelected.push(row);
		}
	} else {
		const index = this.dataSelected.findIndex(rowData => rowData.id
			=== row.id);
		this.dataSelected.splice(index, 1);
	}
	this.checkAll = this.data.every(check => check.isSelected);
}

function selectedAll(value) {
	this.checkAll = value;
	if (this.data.length > 0) {
		this.data = this.data.map((dataSingle) => {
			const newData = Object.assign({}, dataSingle);
			newData.isSelected = value;
			if (newData.isSelected) {
				if (this.dataSelected.length > 0) {
					const dataToAdd = this.dataSelected.find(rowSelected =>
						rowSelected.id === newData.id);
					if (!dataToAdd) {
						this.dataSelected.push(newData);
					}
				} else {
					this.dataSelected.push(newData);
				}
			} else {
				const index = this.dataSelected.findIndex(rowData => rowData.id
					=== newData.id);
				this.dataSelected.splice(index, 1);
			}
			return newData;
		});
	}
}

async function seeReport({ id, name, lastName }) {
	this.selectedEmployee = {
		id,
		name,
		lastName,
	};
	const today = new Date();
	const month = today.getMonth() + 1;
	const year = today.getFullYear();
	const { data: report } = await this.$httpProduction.get(`/employees-hours/${id}/${month}/${year}`);
	this.reports = report;
	this.reportModal = true;
}

function toggleColumns() {
	return true;
}

function toLink(link) {
	this.$router.push(link);
}

function editEmployee(employee) {
	this.actionEdit.title = employee.fullName;
	this.action = { ...this.actionEdit };
	this.newEmployee = { ...employee };
}

function inactiveAction(user) {
	this.currentUser = { ...user };
	this.userStatusWord = user.flagActive === 1 ? 'DESACTIVAR' : 'ACTIVAR';
	this.inactive = true;
}

function cancelInactive() {
	this.inactive = false;
	this.currentUser = {};
	this.userStatusWord = '';
}

async function applyAction() {
	const url = `employees-flag-active/${this.currentUser.id}`;
	const body = {
		flagActive: !(this.currentUser.flagActive === 1),
	};
	try {
		await this.$httpProduction.patch(url, body);
		this.showNotification('Usuario actualizado de forma exitosa');
		this.inactive = false;
		this.currentUser = {};
		this.userStatusWord = '';
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function validations() {
	let employee = {};
	if (this.action.code === 'NO' || this.action.code === 'EO') {
		employee = {
			newEmployee: {
				name: {
					required,
				},
				lastName: {
					required,
				},
				email: {
					required,
					email,
				},
			},
		};
	}
	return employee;
}

function data() {
	return {
		action: {
			code: '',
			color: '',
			img: '',
			open: false,
			title: '',
			width: 0,
		},
		actionJornal: {
			open: true,
			code: 'JO',
			title: 'JORNAL',
			width: 614,
		},
		actionEdit: {
			open: true,
			code: 'EO',
			title: '',
			width: 614,
		},
		age: null,
		checkAll: false,
		columns: [
			{ id: 1, name: 'Técnico', value: 'fullName', visible: true, checked: true },
			{ id: 2, name: 'Doc. de Identidad', value: 'numDocument', visible: true, checked: true },
			{ id: 3, name: 'Nivel', value: 'level', visible: true, checked: true },
			{ id: 4, name: 'Especialidad', value: 'specialty', visible: true, checked: true },
			{ id: 5, name: 'Estado', visible: true, checked: true, flagVisible: true },
			{ id: 6, name: 'Acciones', visible: true, checked: true, flagVisible: true },
		],
		comment: '',
		currentPage: 1,
		currentUser: {},
		customers: [],
		data: [],
		dataSelected: [],
		employeeId: 0,
		employeeName: '',
		endMenu: false,
		fastActions: [
			{
				active: true,
				code: 'NO',
				color: '#05579b',
				img: `${this.$imageUrl}/production-employee.svg`,
				text: 'NUEVO TÉCNICO',
				width: 500,
			},
			{
				active: true,
				code: 'VT',
				color: '#18324e',
				img: `${this.$imageUrl}/production-turns.svg`,
				text: 'VER TURNOS',
				width: 523,
			},
		],
		inactive: false,
		isClean: false,
		isLoading: true,
		jornalColumns: [
			{ id: 1, name: 'Turno', visible: true, checked: true },
			{ id: 2, name: 'Hrs. Total', visible: true, checked: true },
			{ id: 3, name: 'S/. x hora:', visible: true, checked: true },
			{ id: 4, name: 'Total S/.', visible: true, checked: true },
		],
		jornalData: [],
		lastPage: 1,
		levels: ['Supervisor', 'Técnico Líder', 'Técnico', 'Auxiliar', 'Practicante'],
		loading: false,
		newEmployee: {
			email: '',
			employeeCode: '',
			name: '',
			lastName: '',
			level: 'Supervisor',
			numDocument: '',
			phone: '',
			specialty: '',
			typeDocument: 0,
			flagActive: true,
		},
		newTurn: {
			name: '',
			endTime: null,
			startTime: null,
		},
		params: {
			page: 1,
			search: null,
		},
		reports: [],
		reportColumns: [
			{ id: 1, name: 'OIT', value: 'code', visible: true },
			{ id: 2, name: 'Total Horas', value: 'totalHours', visible: true },
		],
		reportModal: false,
		roles: [],
		searchData: null,
		selectedEmployee: {},
		startMenu: false,
		turnsColumns: [
			{ id: 1, name: 'Nombre', visible: true, checked: true },
			{ id: 2, name: 'Inicio', visible: true, checked: true },
			{ id: 3, name: 'Termino', visible: true, checked: true },
			{ id: 4, name: 'Acciones', visible: true, checked: true },
		],
		turnsData: [],
		typeDocuments: [
			{ id: 1, name: 'DNI' },
			{ id: 2, name: 'Carné de extranjería' },
		],
		userStatusWord: '',
	};
}

export default {
	name: 'employees',
	components: {
		actionSidebar,
		appTable,
		headerPage,
		modalSidebarButton,
		quickActions,
	},
	computed: {
		applyDisabled,
	},
	created,
	data,
	methods: {
		applyAction,
		applyFilter,
		assignRateByTurn,
		calculateTotalAmount,
		callServiceAndSearch,
		cancelInactive,
		changePage,
		closeModal,
		createEmployee,
		createTurn,
		deleteTurn,
		editEmployee,
		inactiveAction,
		loadData,
		loadJornalData,
		loadTurnsData,
		openModal,
		onCleanData,
		rowIsSelected,
		seeReport,
		selectedAll,
		toggleColumns,
		toLink,
	},
	validations,
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

.name-form {
	font-size: 18px;
	text-transform: capitalize;
}
</style>
