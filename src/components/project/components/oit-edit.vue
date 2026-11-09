<template>
	<div>
		<header-page
			name="projects"
			:title="`${$route.meta.title} #${project.autoCode}: ${project.name}`" />
		<div class="mt-5">
			<v-tabs
				v-model="activeTab"
				icons-and-text dark
				color="primary">
				<v-tabs-slider color="white"></v-tabs-slider>
				<v-tab href="#work-data">
					Datos del Trabajo
					<v-icon>work</v-icon>
				</v-tab>
				<v-tab href="#notes">
					Notas
					<v-icon>notes</v-icon>
				</v-tab>
				<v-tab href="#tasks">
					Actividades
					<v-icon>playlist_add_check</v-icon>
				</v-tab>
				<v-tab-item id="work-data">
					<v-card class="pa-4">
						<v-layout row wrap>
							<v-flex xs12 sm6 pr-4>
								<span class="request-title-client">Información</span>
								<v-layout row wrap mt-3>
									<v-flex xs12 sm6 pr-1>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Referencia"
											v-model="project.workData.reference">
										</v-text-field>
									</v-flex>
									<v-flex xs12 sm6 pl-1>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Tiempo de ejecución"
											v-model="project.workData.timeExecution">
										</v-text-field>
									</v-flex>
								</v-layout>
								<v-layout row wrap>
									<v-flex xs12 sm6 pr-1>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Nº de técnicos estimados"
											type="number"
											min="0"
											v-model="project.workData.numberTechnical">
										</v-text-field>
									</v-flex>
									<v-flex xs12 sm6 pl-1>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Contacto de Visita técnica"
											v-model="project.workData.contactTechnical"
										>
										</v-text-field>
									</v-flex>
								</v-layout>
								<v-layout row wrap>
									<v-flex xs12 sm6 pr-1>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Contacto para coordinación de ejecución"
											v-model="project.workData.contactExecution"
										>
										</v-text-field>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 sm6 pl-4>
								<v-layout row wrap mt-4 pt-3>
									<v-flex xs6 pr-1>
										<v-menu
											lazy
											v-model="menuInit"
											transition="scale-transition"
											full-width>
											<v-text-field
												slot="activator"
												label="Fecha de inicio"
												v-model="project.workData.dateStart"
												append-icon="event"
												class="filter-select shadow-inset shadow-inset-calendar
													shadow-inset-calendar-requirement"
												readonly
											></v-text-field>
											<v-date-picker
												v-model="project.workData.dateStart"
												no-title
												:min="$today()"
												@input="validateEndDate"
												scrollable
											></v-date-picker>
										</v-menu>
									</v-flex>
									<v-flex xs6 pl-1>
										<v-menu
											lazy
											v-model="menuEnd"
											transition="scale-transition"
											full-width>
											<v-text-field
												slot="activator"
												label="Fecha fin"
												v-model="project.workData.dateEnd"
												append-icon="event"
												class="filter-select shadow-inset shadow-inset-calendar
													shadow-inset-calendar-requirement"
												readonly
											></v-text-field>
											<v-date-picker
												v-model="project.workData.dateEnd"
												no-title
												:min="project.workData.dateStart"
												scrollable
											></v-date-picker>
										</v-menu>
									</v-flex>
								</v-layout>
								<v-layout row wrap my-4>
									<v-flex xs12>
										<label for="percentage">OIT avanzada al {{ project.progress | round }}%</label>
										<v-slider id="percentage" v-model="project.progress" step="0"></v-slider>
									</v-flex>
									<v-flex xs12>
										<v-select
											:disabled="projectCanceled"
											label="Estado"
											:items="states"
											v-model="project.states"
										>
										</v-select>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex xs12 text-xs-center>
								<v-btn
									type="button"
									color= "success"
									class="btn-action mt-4"
									v-on:click="saveData">
									Guardar
									<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
								</v-btn>
							</v-flex>
						</v-layout>
					</v-card>
				</v-tab-item>
				<v-tab-item id="notes">
					<v-card class="pa-4">
						<v-layout row wrap>
							<v-flex xs12 sm6 pr-4>
								<span class="request-title-client">Agregar Nota</span>
							</v-flex>
							<v-flex xs12 pr-1 mt-4>
								<v-text-field
									label="Motivo de rechazo"
									v-model="project.notes"
									hide-details
									textarea
									no-resize
									single-line
									class="filter-select shadow-inset textarea-content"
								></v-text-field>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex xs12 text-xs-center>
								<v-btn
									type="button"
									color= "success"
									class="btn-action mt-4"
									v-on:click="saveData">
									Guardar
									<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
								</v-btn>
							</v-flex>
						</v-layout>
					</v-card>
				</v-tab-item>
				<v-tab-item id="tasks">
					<v-card class="pa-4">
						<v-layout row wrap>
							<v-flex xs12 pr-4>
								<span class="request-title-client">Agregar Actividad</span>
							</v-flex>
						</v-layout>
						<v-layout row wrap>
							<v-flex xs12 pr-1 mt-4>
								<v-layout row wrap align-center>
									<v-flex xs9>
										<v-text-field
											label="Actividad"
											v-model="model.description"
											hide-details
											single-line
											textarea
											no-resize
											class="filter-select shadow-inset textarea-content"
										></v-text-field>
									</v-flex>
									<v-flex xs2>
										<v-checkbox
											label="Realizado"
											color="primary"
											size="small"
											:true-value="2"
											:false-value="1"
											class="min-checkbox min-checkbox-label"
											v-model="model.status"
											hide-details>
										</v-checkbox>
									</v-flex>
									<v-flex xs1>
										<v-btn
											color="primary"
											class="table-icon white--text"
											@click="addTask">
											<v-icon>add</v-icon>
										</v-btn>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-4>
								<app-table
									name="tasks-oit"
									:columns="columns"
									:rows="tasks"
									:input-search="false"
									:filter-columns="false"
									:main-list="false"
									local-storage
									class="no-main-list is-not-selectable">
									<template slot="rows" slot-scope="props">
										<td class="is-not-selectable py-2"
											v-show="showRow(columns, 1)">
											<v-text-field
												v-model="props.row.description"
												hide-details
												single-line
												@keyup.enter="updateTask(props.row)"
												class="filter-select shadow-inset"
											></v-text-field>
										</td>
										<td v-show="showRow(columns, 2)">
											<v-checkbox
												color="primary"
												size="small"
												class="min-checkbox"
												:true-value="2"
												:false-value="1"
												v-model="props.row.status"
												@change="updateState(props.row)"
												hide-details>
											</v-checkbox>
										</td>
										<td v-show="showRow(columns, 3)">
											<v-tooltip top>
												<v-btn slot="activator"
													icon
													class="red--text"
													@click.native="openConfirm(props.row)">
													<v-icon>delete</v-icon>
												</v-btn>
												<span>Eliminar Actividad</span>
											</v-tooltip>
										</td>
									</template>
								</app-table>
							</v-flex>
						</v-layout>
					</v-card>
				</v-tab-item>
			</v-tabs>
			<v-dialog
				v-model="dialog"
				persistent
				max-width="360">
				<v-card>
					<v-card-title class="headline">Eliminar Actividad</v-card-title>
					<v-divider></v-divider>
					<v-card-text>
						¿Desea eliminar la actividad seleccionada?
					</v-card-text>
					<v-card-actions>
						<v-layout row wrap>
							<v-flex xs6 pr-2
								text-xs-right>
								<v-btn
									color="info"
									class="btn-action white--text"
									@click.native="cancelDelete">
									Cancelar
								</v-btn>
							</v-flex>
							<v-flex xs6 pl-2
								text-xs-left>
								<v-btn
									color="error"
									class="btn-action white--text"
									@click.native="deleteTask">
									Eliminar
								</v-btn>
							</v-flex>
						</v-layout>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</div>
	</div>
</template>

<script>
	import { isAfter } from 'date-fns';
	import AppTable from './../../shared/table/app-table';
	import HeaderPage from '../../shared/header-page';

	function created() {
		this.loadData();
	}

	function activeTab(val) {
		if (val === 'tasks') {
			this.loadTasks();
		}
	}

	async function addTask() {
		this.model.projectId = this.id;
		try {
			await this.$httpProduction.post('activities', this.model);
			this.loadTasks();
			this.model = {
				description: '',
				status: 1,
			};
		} catch (err) {
			this.showGenericError();
		}
	}

	function cancelDelete() {
		this.dialog = false;
		this.taskId = 0;
	}

	async function deleteTask() {
		try {
			await this.$httpProduction.delete(`activities/${this.taskId}/${this.id}`);
			this.showNotification('La actividad ha sido eliminada.');
			this.cancelDelete();
			this.loadTasks();
		} catch (err) {
			this.showGenericError();
		}
	}

	async function loadData() {
		try {
			const { data: project } = await this.$httpProduction.get(`projects/${this.id}`);
			const workData = {
				reference: '',
				timeExecution: '',
				numberTechnical: null,
				contactTechnical: '',
				contactExecution: '',
				dateStart: '',
				dateEnd: '',
			};
			project.workData = project.workData ? project.workData : workData;
			project.notes = project.notes ? project.notes : '';
			this.project = project;
			this.projectCanceled = this.project.states === 5;
		} catch (err) {
			this.showGenericError();
		}
	}

	async function loadTasks() {
		try {
			const { data: tasks } = await this.$httpProduction.get(`activities/${this.id}`);
			this.tasks = tasks;
		} catch (err) {
			this.showGenericError();
		}
	}

	function openConfirm({ id }) {
		this.taskId = id;
		this.dialog = true;
	}

	async function saveData() {
		const projectModel = {
			name: this.project.name,
			code: this.project.code,
			description: this.project.description,
			states: this.project.states,
			customerId: this.project.customerId,
			dateStart: this.project.dateStart,
			dateEnd: this.project.dateEnd,
			requirementId: this.project.requirementId,
			employeeId: this.project.employeeId,
			options: this.project.options,
			progress: this.project.progress,
			workData: this.project.workData,
			notes: this.project.notes,
		};
		try {
			await this.$httpProduction.patch(`projects/${this.id}`, projectModel);
			this.showNotification('La OIT se actualizó correctamente.');
			this.loadData();
		} catch (err) {
			this.showGenericError();
		}
	}

	async function updateState({ id, status }) {
		try {
			await this.$httpProduction.patch(`activities-status/${id}/${status}`);
			this.showNotification('El estado de la actividad se actualizó correctamente.');
			this.loadTasks();
		} catch (err) {
			this.showGenericError();
		}
	}

	async function updateTask(row) {
		const id = row.id;
		const task = { ...row };
		delete task.id;
		delete task.statusName;
		try {
			await this.$httpProduction.patch(`activities/${id}`, task);
			this.showNotification('La actividad ha sido actualizada correctamente.');
			this.loadTasks();
		} catch (err) {
			this.showGenericError();
		}
	}

	function validateEndDate(date) {
		this.project.workData.dateEnd = isAfter(this.project.workData.dateEnd, date) ?
			this.project.workData.dateEnd : '';
	}

	function data() {
		return {
			activeTab: 0,
			columns: [
				{ id: 1, name: 'Actividad', visible: true },
				{ id: 2, name: 'Realizado', visible: true },
				{ id: 3, name: 'Acciones', visible: true },
			],
			dialog: false,
			menuEnd: false,
			menuInit: false,
			model: {
				description: '',
				status: 1,
			},
			project: {
				notes: '',
				progress: 0,
				workData: {
					reference: '',
					timeExecution: '',
					numberTechnical: null,
					contactTechnical: '',
					contactExecution: '',
					dateStart: '',
					dateEnd: '',
				},
			},
			projectCanceled: false,
			states: [
				{
					value: 1,
					text: 'Registrado',
				},
				{
					value: 6,
					text: 'Programado',
				},
				{
					value: 3,
					text: 'En ejecución',
				},
				{
					value: 4,
					text: 'Paralizado',
				},
				{
					value: 2,
					text: 'Finalizado',
				},
				{
					value: 5,
					text: 'Anulado',
				},
			],
			taskId: 0,
			tasks: [],
		};
	}

	export default {
		name: 'oit-edit',
		components: {
			AppTable,
			HeaderPage,
		},
		created,
		data,
		methods: {
			addTask,
			cancelDelete,
			deleteTask,
			loadData,
			loadTasks,
			openConfirm,
			saveData,
			updateState,
			updateTask,
			validateEndDate,
		},
		props: ['id'],
		watch: {
			activeTab,
		},
	};
</script>

<style lang="scss" scoped>
.min-checkbox {
	height: 24px;
	margin: 0 auto;
	max-width: 24px;

	&-label {
		max-width: 104px;
	}
}
</style>