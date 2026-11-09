<template>
	<div>
		<general-filter>
			<v-layout row wrap align-center>
				<v-flex xs6>
					<v-layout row wrap align-center>
						<v-flex xs12 md2 px-1 class="align-col">
							<v-text-field
								class="filter-select shadow-inset"
								hide-details
								single-line
								readonly
								bottom
								type="text"
								label="Código Proyecto"
								v-model="labelProject"
							></v-text-field>
							<span
									class="text-not-code-blank"
									v-if="checkBlankCode(labelProject)">
									No se permite espacios en blanco
								</span>
						</v-flex>
						<v-flex xs12 md4 px-1 class="align-col">
							<v-text-field
								class="filter-select shadow-inset"
								hide-details
								single-line
								type="text"
								label="Cliente"
								bottom
								readonly
								id="customer-project"
								v-model="project.customer.typePerson.fullName"
							></v-text-field>
						</v-flex>
						<v-flex xs12 md6 px-1 class="align-col">
							<v-text-field
								class="filter-select shadow-inset"
								hide-details
								single-line
								readonly
								bottom
								type="text"
								label="Proyecto"
								v-model="project.name"
							></v-text-field>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</general-filter>
		<full-calendar
			ref="calendar"
			:config="calendarConfig"
			:events="events"
			@event-created="eventCreated"
			@event-selected="eventSelected"
			@render-event="renderEvent"
			@event-drop="updateSchedule"
			@event-resize="updateSchedule"
		>
		</full-calendar>
		<action-sidebar
			:code-action="action.code"
			:is-loading="loading"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="closeModal">
			<v-layout
				row wrap
				class="modal-assign">
				<v-flex sm6 v-if="!projectSelected.id">
					<div class="header-title" align-col sm12>
						<v-flex sm12 pl-2 class="op-pro">
							<p class="text-lg-left">OPERADOR</p>
						</v-flex>
						<v-layout>
							<v-flex sm12>
								<div class="overflow-auto">
									<app-table
										class="no-main-list"
										local-storage
										name="operators-list"
										selectable
										:check-all="checkAll"
										:columns="columnsEmployee"
										:filter-columns="false"
										:input-search="false"
										:main-list="false"
										:rows="employees"
										@row-is-selected="rowIsSelected"
										@on-selected-all="selectedAll"
									>
										<template slot="rows" slot-scope="props">
											<td v-show="showRow(columnsEmployee, 1)">
												{{ props.row.name }} {{ props.row.lastName }}
											</td>
											<td v-show="showRow(columnsEmployee, 1)">
												{{ props.row.scheduleEmployee.name }}
											</td>
										</template>
									</app-table>
								</div>
							</v-flex>
						</v-layout>
					</div>
				</v-flex>
				<v-flex sm6 :class="{ 'sm12' : projectSelected.id }">
					<v-layout wrap>
						<v-flex xs8 px-4 class="modal-assign-border">
							<label>
								{{ project.customer.typePerson.fullName }}
								<br>
								{{ project.name }}
								<br>
								Estado: {{ project.statesName }}
							</label>
						</v-flex>
						<v-flex xs3 px-4>
							<label class="modal-assign-hours">
								Horas:
								<span>{{ scheduleSelected.totalHours }}</span>
							</label>
						</v-flex>
						<v-flex xs12>
							<div class="modal-assign-date">
								{{ projectSelected.start }} - {{ projectSelected.end }}
							</div>
							<div class="overflow-auto">
								<app-table
									class="no-main-list is-not-selectable"
									local-storage
									name="assign-operators"
									:columns="columns"
									:rows="employeesSelected"
									:main-list="false"
									:input-search="false"
									:filter-columns="false"
									@row-is-selected="stopClick"
									@on-selected-all="stopClick"
									@click.stop="stopClick"
								>
									<template slot="rows" slot-scope="props">
										<td
											class="is-not-selectable"
											@click.stop="stopClick"
										>
											{{ props.row.name }} {{ props.row.lastName }}
										</td>
										<td @click.stop="stopClick">
											<v-select
												class="filter-select shadow-inset"
												content-class="filter-select-content"
												:items="props.row.rateTurn"
												v-model="props.row.turnId"
												item-value="id"
												item-text="name"
												@input="stopClick"
												@click.stop="stopClick"
												@change="stopClick"
											>
											</v-select>
										</td>
										<td @click.stop="stopClick">
											<v-text-field
												type="number"
												class="filter-select shadow-inset-table"
												v-model.number="props.row.hours"
												@input="stopClick"
												@change="stopClick"
												@click.stop="stopClick"
											>
											</v-text-field>
										</td>
										<td
											v-if="projectSelected.id"
											@click.stop="stopClick"
										>
											<v-btn
												icon
												@click="deleteRow(props.row)"
												:disabled="deleteDisabled"
											>
												<v-icon color="error">delete</v-icon>
											</v-btn>
										</td>
									</template>
								</app-table>
							</div>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<section class="footer-modal">
				<div class="footer-container">
					<v-btn
						type="button"
						color="success"
						class="btn-action"
						@click="saveSchedule"
						:disabled="isLoading">
						Aceptar
						<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
					</v-btn>
				</div>
			</section>
		</action-sidebar>
	</div>
</template>

<script>
	import { FullCalendar } from 'vue-full-calendar';
	import { differenceInHours, format, getMinutes } from 'date-fns';
	import actionSidebar from './../../shared/action-sidebar';
	import appTable from './../../shared/table/app-table';
	import generalFilter from './../../shared/general-filter';

	function created() {
		this.loadData();
	}

	function activeDay(day) {
		if (!day.active) {
			this.activeDays.push(day.value);
		} else {
			const index = this.activeDays.findIndex(activeD => activeD === day.value);
			this.activeDays.splice(index, 1);
		}
		this.days = this.days.map((singleDay) => {
			const newSingleDay = Object.assign({}, singleDay);
			if (singleDay.id === day.id) {
				newSingleDay.active = !day.active;
			}
			return newSingleDay;
		});
	}

	function closeModal() {
		this.action.code = '';
		this.action.open = false;
		this.action.title = '';
		this.action.width = 0;
		const columnsIndex = this.columns.findIndex(col => col.id === 4);
		if (columnsIndex > -1) {
			this.columns.splice(columnsIndex, 1);
		}
		this.scheduleSelected = {};
		this.employeesSelected = [];
		this.loadData();
	}

	function deleteDisabled() {
		return this.employeesSelected.length < 2;
	}

	async function deleteRow({ scheduleEmployeeId }) {
		const index = this.columns.findIndex(col => col.id === 4);
		const newEvent = {
			id: this.scheduleSelected.id,
			name: '',
			end: format(this.scheduleSelected.dateEnd, 'YYYY-MM-DD HH:mm:ss'),
			start: format(this.scheduleSelected.dateStart, 'YYYY-MM-DD HH:mm:ss'),
		};
		try {
			await this.$httpProduction.delete(`schedules-employee/${scheduleEmployeeId}/${this.scheduleSelected.id}`);
			this.showNotification('El operador ha sido eliminado de este horario correctamente.');
			this.columns.splice(index, 1);
			this.showScheduleModal(newEvent, 502);
		} catch (err) {
			this.showGenericError();
		}
	}

	function eventCreated(value) {
		const newEvent = {
			start: value.start.format('YYYY-MM-DD HH:mm:ss'),
			end: value.end.format('YYYY-MM-DD HH:mm:ss'),
		};
		this.$refs.calendar.$emit('render-event', newEvent, true);
	}

	async function updateSchedule(value) {
		const dateStart = value.start.local().format('YYYY-MM-DD HH:mm:ss');
		const dateEnd = value.end.local().format('YYYY-MM-DD HH:mm:ss');
		const body = {
			dateStart,
			dateEnd,
		};
		try {
			await this.$httpProduction.patch(`schedules/${value.id}`, body);
			this.showNotification('El horario ha sido modificado correctamente.');
			this.loadData();
		} catch (err) {
			this.showGenericError();
		}
	}

	function eventSelected(value) {
		const newEvent = {
			id: value.id,
			name: '',
			end: value.end.format('YYYY-MM-DD HH:mm:ss'),
			start: value.start.format('YYYY-MM-DD HH:mm:ss'),
		};
		this.showScheduleModal(newEvent, 502);
	}

	async function loadData() {
		const requests = [
			this.$httpProduction.get('turns'),
			this.$httpProduction.get(`projects/${this.projectId}`),
		];
		const [turns, project] = await Promise.all(requests);
		this.turns = turns.data;
		this.project = project.data;
		this.events = this.project.schedules.map((schedule) => {
			const newEvent = {
				id: schedule.id,
				start: schedule.dateStart,
				end: schedule.dateEnd,
				title: schedule.name,
			};
			return newEvent;
		});
	}

	function renderEvent(value) {
		this.events.push(value);
		const endMin = getMinutes(value.end);
		const startMin = getMinutes(value.start);
		const calculateMinutes = endMin > startMin ? (endMin - startMin) / 6 :
			(startMin - endMin) / 6;
		const hours = differenceInHours(value.end, value.start);
		const minutes = Number(calculateMinutes);
		this.scheduleSelected.totalHours = `${hours}.${minutes}`;
		this.showScheduleModal(value);
	}

	function rowIsSelected({ id, isSelected }) {
		this.employees = this.employees.map((emp) => {
			const newEmp = { ...emp };
			if (emp.id === id) {
				newEmp.isSelected = isSelected;
			}
			return newEmp;
		});
		this.checkAll = this.employees.every(check => check.isSelected);
		this.employeesSelected = this.employees.filter(e => e.isSelected);
	}

	async function saveSchedule() {
		const hoursAssigned = this.employeesSelected.every(e => e.hours > 0 && e.turnId);
		if (!this.projectSelected.id) {
			const newSchedule = {
				dateStart: this.projectSelected.start,
				dateEnd: this.projectSelected.end,
				name: '',
				scheduleEmployee: [],
			};
			if (this.employeesSelected.every(e => e.turnId)) {
				newSchedule.scheduleEmployee = this.employeesSelected.map((employee) => {
					const rateIndex = employee.rateTurn.findIndex(rt => rt.id === employee.turnId);
					const newRate = {
						rateTurnId: employee.rateTurn[rateIndex].rateTurnId,
						amountHours: employee.rateTurn[rateIndex].amountHours,
						hours: employee.hours,
					};
					return newRate;
				});
				if (newSchedule.scheduleEmployee.length > 0) {
					await this.$httpProduction
						.post(`schedules/${this.projectId}`, newSchedule)
						.catch(err => this.showGenericError(err));
					this.showNotification('Se asignaron los operadores correctamente');
					this.loadData();
					this.closeModal();
					this.checkAll = false;
				} else {
					this.showNotification('Debe asignar por lo menos un operador', 'warning');
				}
			} else {
				this.showNotification('Debe seleccionar el horario de todos los empleados seleccionados', 'warning');
			}
		} else if (this.projectSelected.id && hoursAssigned) {
			const updatedSchedules = this.employeesSelected.map((employee) => {
				const newRate = {
					id: employee.scheduleEmployeeId,
					rateTurnId: employee.allRateTurn.find(art => art.turnId === employee.turnId).id,
					hours: employee.hours,
				};
				return newRate;
			});
			try {
				await this.$httpProduction
					.patch(`schedules-employee/${this.scheduleSelected.id}`, updatedSchedules);
				this.showNotification('Se editó la asignación de operadores correctamente');
				this.loadData();
				this.closeModal();
			} catch (err) {
				this.showGenericError();
			}
		} else {
			this.showNotification('Cada operador debe contar con, por lo menos, 1 turno y 1 hora asignada',
				'warning');
		}
	}

	function selectedAll(value) {
		this.checkAll = value;
		this.employees = this.employees.map((ce) => {
			const newEmployee = { ...ce };
			newEmployee.isSelected = value;
			return newEmployee;
		});
		this.employeesSelected = this.employees.filter(e => e.isSelected);
	}

	async function showScheduleModal(eventInformation, actionWidth) {
		this.action.code = 'AO';
		this.action.title = 'Asignar operador(es)';
		this.action.width = actionWidth || 702;
		this.action.open = true;
		this.projectSelected = Object.assign({}, eventInformation);
		if (eventInformation.id) {
			const { data: schedule } = await this.$httpProduction.get(`schedules/${eventInformation.id}`);
			try {
				this.scheduleSelected = schedule;
				this.employeesSelected = schedule.scheduleEmployee.map((employee) => {
					const newRateTurn = employee.rateTurn.employee.rateTurn.filter(rt => rt.turn);
					const newEmployee = {
						name: employee.rateTurn.employee.name,
						lastName: employee.rateTurn.employee.lastName,
						rateTurn: newRateTurn.map(rate => rate.turn),
						scheduleEmployeeId: employee.id,
						hours: employee.hours,
						isSelected: true,
						rateTurnId: employee.rateTurn.employee.rateTurn.find(rate => rate.turnId
							=== employee.rateTurn.turnId).id,
						turnId: employee.rateTurn.turnId,
						allRateTurn: employee.rateTurn.employee.rateTurn,
					};
					return newEmployee;
				});
				this.columns.push({ id: 4, name: 'Acciones', visible: true });
			} catch (err) {
				this.showGenericError();
			}
		} else {
			const daySelected = eventInformation.start.split(' ')[0];
			const { data: employees } = await this.$httpProduction.get(`employees-project/${daySelected}`);
			const initialHours = this.scheduleSelected.totalHours;
			this.employees = employees.map((employee) => {
				const newEmployee = Object.assign({}, employee);
				newEmployee.scheduleEmployee = newEmployee.scheduleEmployee || { name: '' };
				newEmployee.cannotBeAssigned = newEmployee.scheduleEmployee.name.length > 0;
				newEmployee.hours = initialHours;
				return newEmployee;
			});
		}
	}

	function stopClick() {
		return false;
	}

	function labelProject() {
		return `OIT: ${this.project.autoCode}`;
	}

	function data() {
		return {
			action: {
				code: '',
				open: false,
				title: '',
				width: 0,
			},
			activeDays: [1, 2, 3, 4, 5, 6],
			calendarConfig: {
				businessHours: {
					start: '09:00',
					end: '18:30',
					dow: this.activeDays,
				},
				eventLimit: true,
			},
			checkAll: false,
			columnsEmployee: [
				{ id: 1, name: 'Operador', visible: true, checked: false },
				{ id: 2, name: 'Proyecto', visible: true, checked: true },
			],
			columns: [
				{ id: 1, name: 'Proyecto', visible: true },
				{ id: 2, name: 'Horario', visible: true },
				{ id: 3, name: 'Horas', visible: true },
			],
			dataSelected: [],
			days: [
				{
					id: 1,
					name: 'Lunes',
					active: true,
					shortName: 'Lun',
					value: 1,
				},
				{
					id: 2,
					name: 'Martes',
					active: true,
					shortName: 'Mar',
					value: 2,
				},
				{
					id: 3,
					name: 'Miércoles',
					active: true,
					shortName: 'Mie',
					value: 3,
				},
				{
					id: 4,
					name: 'Jueves',
					active: true,
					shortName: 'Jue',
					value: 4,
				},
				{
					id: 5,
					name: 'Viernes',
					active: true,
					shortName: 'Vie',
					value: 5,
				},
				{
					id: 6,
					name: 'Sábado',
					active: true,
					shortName: 'Sab',
					value: 6,
				},
				{
					id: 7,
					name: 'Domingo',
					active: false,
					shortName: 'Dom',
					value: 0,
				},
			],
			employees: [
				{
					scheduleEmployee: {
						name: '',
					},
				},
			],
			employeesSelected: [],
			endDate: null,
			events: [],
			isLoading: false,
			loading: false,
			menuEnd: false,
			menuStart: false,
			project: {
				name: '',
				status: {},
				customer: {
					typePerson: {},
				},
			},
			projectSelected: {
				id: null,
			},
			scheduleSelected: {},
			startDate: null,
			turns: [],
		};
	}

	export default {
		name: 'calendar-by-project',
		components: {
			actionSidebar,
			appTable,
			FullCalendar,
			generalFilter,
		},
		created,
		computed: {
			deleteDisabled,
			labelProject,
		},
		data,
		methods: {
			activeDay,
			closeModal,
			deleteRow,
			eventCreated,
			eventSelected,
			loadData,
			renderEvent,
			rowIsSelected,
			saveSchedule,
			selectedAll,
			showScheduleModal,
			stopClick,
			updateSchedule,
		},
		props: {
			projectId: {
				type: [Number, String],
			},
		},
	};
</script>

<style lang="scss" scoped>
	@import '~fullcalendar/dist/fullcalendar.css';

	.availability {
		&-title {
			color: map-get($colors, blue-card);
			font-family: map-get($fonts, open-regular);
			font-size: map-get($sizes, medium);
			font-weight: normal;
		}
		&-days {
			background-color: map-get($colors, btn-toggle-text);
			border: 1px solid map-get($colors, subheaderText);
			border-radius: 10px;
			box-shadow: none;
			color: map-get($colors, subheaderText);
			font-family: map-get($fonts, open-regular);
			font-size: map-get($sizes, small);
			height: 25px;
			margin-left: 10px;
			outline: none;
			text-align: center;
			text-transform: uppercase;
			width: 37px;
			&.active {
				background-color: map-get($colors, success);
				border-color: map-get($colors, border-green);
				color: white;
			}
		}
	}
	.modal-assign {
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-regular);
		font-size: map-get($sizes, medium18);
		font-weight: normal;
		&-name {
			white-space: pre-line;
		}
		&-border {
			border-right: 1px solid map-get($colors, subheaderText);
		}
		&-hours {
			span {
				font-size: 30px;
			}
		}
		&-date {
			font-family: map-get($fonts, open-bold);
			margin-top: 20px;
			padding-left: 24px;
		}
	}
	.footer-modal {
		background-color: white;
		border: 1px solid map-get($colors, grey);
		bottom: 0px;
		height: 9vh;
		position: fixed;
		width: 100%;
		.footer-container {
			@include flex-center;
			height: 100%;
		}
	}
	.btn-success{
		background: map-get($colors, success );
		border-radius: 5px;
		float: right;
		height: 25px;

	}
	.op-pro{
		border-bottom: 1px solid map-get($colors, subheaderText );
	}
</style>
