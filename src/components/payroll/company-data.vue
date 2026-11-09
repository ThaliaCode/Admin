<template>
	<div class="payroll-company-data grey-background pa-5">
		<div>
			<div>
				<h4 class="py-2 pl-2 mb-2 title-payroll">DEPARTAMENTO Y SECCIÓN</h4>
			</div>
			<v-layout row wrap>
				<v-flex xs6 pr-3>
					<v-layout row wrap>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Departamento</label>
							<v-select
								label="Departamento"
								:items="department"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.departamentId"
							></v-select>
							<span class="form-group__message" v-if="$v.model.departamentId.$invalid">
								El Departamento es requerido
							</span>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Centro de costo</label>
							<v-select
								label="Centro de costo"
								:items="costCenter"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.chargeCenterId"
							></v-select>
							<span class="form-group__message" v-if="$v.model.chargeCenterId.$invalid">
								Centro de costo es requerido
							</span>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Tipo de Personal</label>
							<v-select
								label="Tipo de Personal"
								:items="typeOfStaff"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.staffId"
								@change="filterCarge($event)"
							></v-select>
						</v-flex>
						<span class="form-group__message" v-if="$v.model.staffId.$invalid">
								El Tipo de Personal es requerido
							</span>
					</v-layout>
				</v-flex>
				<v-flex xs6 pl-3>
					<v-layout row wrap>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Establecimiento</label>
							<v-select
								label="Establecimiento"
								:items="establishment"
								single-line
								item-text="Name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.comSubsidiariesId"
							></v-select>
							<span class="form-group__message"
								v-if="$v.model.comSubsidiariesId.$invalid">
								El establecimiento es requerido.
							</span>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Régimen</label>
							<v-select
								label="Régimen"
								:items="regime"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.workRegimeId"
							></v-select>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</div>
		<div>
			<div>
				<h4 class="py-2 pl-2 mb-2 title-payroll">DATOS DE CONTRATO</h4>
			</div>
			<v-layout row wrap>
				<v-flex xs6 pr-3>
					<v-layout row wrap>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Cargo</label>
							<v-select
								label="Cargo"
								:items="positions"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.chargeId"
							></v-select>
							<span class="form-group__message" v-if="$v.model.staffId.$invalid">
								Seleccionar Tipo de Personal
							</span>
							<span class="form-group__message"
								v-if="$v.model.chargeId.$invalid && model.staffId">
								El cargo es requerido.
							</span>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Tipo de Empleado</label>
							<v-select
								label="Tipo de Empleado"
								:items="typeOfEmployee"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.typeEmployeeId"
							></v-select>
							<span class="form-group__message" v-if="$v.model.typeEmployeeId.$invalid">
								Tipo de Empleado es requerido
							</span>
						</v-flex>
						<v-flex xs8 md10 mb-3 pr-3>
							<label class="caption">Jefe</label>
							<v-select
								:disabled="model.flagBoss"
								label="Jefe"
								:items="boss"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.employeeBossId"
							></v-select>
						</v-flex>
						<v-flex xs4 md2 mb-3 pt-4>
							<v-checkbox
								label="Jefe"
								hide-details
								v-model="model.flagBoss"
								@change="clearBossField"
							></v-checkbox>
						</v-flex>
						<v-flex xs4 md4 pr-2 mb-3>
							<v-text-field
								label="Años"
								v-model="model.years"
								class="filter-select shadow-inset"
								type="Number"
							></v-text-field>
						</v-flex>
						<v-flex xs4 md4 pr-2 mb-3>
							<v-text-field
								label="Meses"
								v-model="model.months"
								class="filter-select shadow-inset"
								type="Number"
							></v-text-field>
						</v-flex>
						<v-flex xs4 md4 pr-2 mb-3>
							<v-text-field
								label="Días"
								v-model="model.days"
								class="filter-select shadow-inset"
								type="Number"
						></v-text-field>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3>
							<v-text-field
								label="Número de Contrato"
								v-model="model.contractNumber"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3>
							<app-date-mask
									id="contract-date"
									label="Fecha de Contrato"
									v-model="contractDate"
									@format-date="onDate($event, 'contractDate')"
								>
							</app-date-mask>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Tipo de Remuneración</label>
							<v-select
								label="Tipo de Remuneración"
								:items="typeOfRemuneration"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.remunerationId"
							></v-select>
							<span class="form-group__message" v-if="$v.model.remunerationId.$invalid">
								Tipo de Remuneración es requerido
							</span>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs6 pl-3>
					<v-layout row wrap>
						<v-flex xs6 md6 pr-2 mb-3 pt-4>
							<v-text-field
								label="Salario"
								v-model="model.salary"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs6 md6 pr-2 mb-3 pt-4>
							<v-text-field
								label="Salario Digno"
								v-model="model.worthySalary"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Categoría</label>
							<v-select
								label="Categoría"
								:items="category"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.categoryType"
							></v-select>
						</v-flex>
						<v-flex xs6 md6 mb-3 pr-2>
							<v-text-field
								label="Días Trabajos"
								v-model="model.workedDays"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs6 md6 mb-3 pl-2>
							<v-text-field
								label="Maternidad"
								v-model="model.maternityDays"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs6 md6 mb-3 pr-2>
							<v-text-field
								label="Permiso Médico"
								v-model="model.medicalPermission"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs6 md6 mb-3 pl-2>
							<v-text-field
								label="Faltas"
								v-model="model.permitsDays"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
						<v-flex xs6 md6 pt-4>
							<label class="caption">Recibe Horas Extras</label>
							<v-switch
								hide-details
								color="success"
								v-model="model.flagExtraHours"
							></v-switch>
						</v-flex>
						<v-flex xs6 md6 pl-2 pt-4>
							<label class="caption">Mano de Obra Directa</label>
							<v-switch
								hide-details
								color="success"
								v-model="model.flagLabor"
							></v-switch>
						</v-flex>		
						<v-flex xs6 md6 pt-4>
							<v-checkbox
								label="Fondos Reserva"
								hide-details
								v-model="model.reserveFund"
							></v-checkbox>
						</v-flex>
						<v-flex xs6 md6 pl-2 pt-4>
							<v-checkbox
								label="Décimos"
								hide-details
								v-model="model.flagBonuses"
							></v-checkbox>
						</v-flex>		
					</v-layout>
				</v-flex>
			</v-layout>
		</div>
		<div>
			<div>
				<h4 class="py-2 pl-2 mb-2 title-payroll">DATOS DE INGRESO A LA EMPRESA /ANTIGÜEDAD</h4>
			</div>
			<v-layout row wrap>
				<v-flex xs6 pr-3>
					<v-layout row wrap>
						<v-flex xs12 md12 mb-3>
							<app-date-mask
								id="company income"
								label="Ingreso Empresa"
								v-model="entryToCompany"
								@format-date="onDateControl($event, 'dateInput')"
								disabled
							>
							</app-date-mask>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<app-date-mask
								id="company exit"
								label="Salida Empresa"
								v-model="exitToCompany"
								@format-date="onDateControl($event, 'dateOutput')"
								disabled
							>
							</app-date-mask>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs6 pl-3>
					<v-layout row wrap>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Motivos</label>
							<v-select
								label="Motivos"
								:items="reasonsForDeparture"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="controlDate.retireMotivateId"
								disabled
							></v-select>
						</v-flex>
						<v-flex xs6 md6 mb-3>
							<label class="caption">Inactivo / Activo</label>
							<v-switch
								hide-details
								color="success"
								v-model="controlDate.flagActive"
								disabled
							></v-switch>
						</v-flex>
						<v-flex xs6 md6 mb-3>
							<label class="caption">Reingreso</label>
							<v-switch
								hide-details
								color="success"
								v-model="model.flagReentry"
							></v-switch>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</div>
		<div>
			<div>
				<h4 class="py-2 pl-2 mb-2 title-payroll">DATOS DE INGRESO AL IESS / ANTIGÜEDAD</h4>
			</div>
			<v-layout row wrap>
				<v-flex xs6 pr-3>
					<v-layout row wrap>
						<v-flex xs12 md12 mb-3>
							<app-date-mask
								id="date of admission"
								label="Fecha de Ingreso"
								v-model="dateOfAdmission"
								@format-date="onDateControl($event, 'insuredIngress')"
								disabled
							>
							</app-date-mask>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<app-date-mask
								id="departure date"
								label="Fecha de Salida"
								v-model="departureDate"
								@format-date="onDateControl($event, 'insuredExit')"
								disabled
							>
							</app-date-mask>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex x6 pl3>
					<v-layout row wrap>
						<v-flex xs12 md12 pr-2 mb-3 pt-4>
							<v-text-field
								label="Días"
								v-model="controlDate.days"
								class="filter-select shadow-inset"
								type="Number"
								disabled
							></v-text-field>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Motivos de Salida</label>
							<v-select
								label="Motivos de Salida"
								:items="reasonsForDeparture"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="controlDate.retireMotivateInsuredId"
								disabled
							></v-select>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</div>
		<div>
			<div>
				<h4 class="py-2 pl-2 mb-2 title-payroll">FORMA DE PAGO</h4>
			</div>
			<v-layout row wrap>
				<v-flex xs6 pr-3>
					<v-layout row wrap>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Forma de Pago</label>
							<v-select
								label="Forma de Pago"
								:items="wayToPay"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								return-object
								class="filter-select shadow-inset"
								v-model="model.methodPaymentId"
								@change="changePayment($event)"
							></v-select>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Banco</label>
							<v-select
								label="Banco"
								:items="banks"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.bankId"
								:disabled="!disbaledBank"
							></v-select>
						</v-flex>
						<v-flex xs12 md12 mb-3>
							<label class="caption">Tipo de Cuenta</label>
							<v-select
								label="Tipo de Cuenta"
								:items="accountType"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select shadow-inset"
								v-model="model.accountTypeId"
								:disabled="!disbaledBank"
							></v-select>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex x6 pl3>
					<v-layout row wrap>
						<v-flex xs12 md12 mb-3 pl-2 pt-4>
							<v-text-field
								label="Cuenta Banco"
								v-model="model.accountNumberBank"
								class="filter-select shadow-inset"
								:disabled="!disbaledBank"
							></v-text-field>
						</v-flex>
						<v-flex xs12 md12 mb-3 pl-2>
							<v-text-field
								label="Préstamo"
								v-model="model.loanAmount"
								class="filter-select shadow-inset"
							></v-text-field>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</div>
	</div>
</template>
<script>
import groupTable from '@/shared/group-table';
import { required } from 'vuelidate/lib/validators';
import helper from '@/shared/helper';

function validations() {
	return {
		model: {
			staffId: { required },
			comSubsidiariesId: { required },
			chargeId: { required },
			departamentId: { required },
			chargeCenterId: { required },
			typeEmployeeId: { required },
			remunerationId: { required },
		},
	};
}

async function filterCarge(id) {
	if (id) {
		try {
			const response = await this.$httpSales.get(`type-staff/${id}/changes`);
			this.positions = response.data;
		} catch (error) {
			this.showGenericError();
		}
	}
}

function created() {
	this.loadData();
}

function setData({ value }, modelName) {
	this.model[modelName] = value;
}

function onDate(value, modelName) {
	this.model[modelName] = value;
}

async function loadData() {
	const params = { flagBoss: 1 };
	const flag = { flagActive: 1 };
	const request = [
		this.urlLoadData('get', groupTable.TypeStaff),
		this.urlLoadData('get', groupTable.TypeEmployee),
		this.$httpSales.get('employees-company', { params }),
		this.urlLoadData('get', groupTable.TypeRemuneration),
		this.urlLoadData('get', groupTable.RetireMotivate),
		this.$httpSales.get('subsidiaries'),
		this.urlLoadData('get', groupTable.TypeDepartament),
		this.urlLoadData('get', groupTable.CostCenter, flag),
		this.urlLoadData('get', groupTable.TypeRegime),
		this.urlLoadData('get', groupTable.PaymentMethods),
		this.getBanks(),
		this.getAccountType(),
	];
	[
		{ data: this.typeOfStaff },
		{ data: this.typeOfEmployee },
		{ data: this.boss },
		{ data: this.typeOfRemuneration },
		{ data: this.reasonsForDeparture },
		{ data: this.establishment },
		{ data: this.department },
		{ data: this.costCenter },
		{ data: this.regime },
		{ data: this.wayToPay },
		{ data: this.banks },
		{ data: this.accountType },
	] = await Promise.all(request);
}

function onDateControl(value, modelName) {
	this.controlDate[modelName] = value;
}

function changePayment({ name }) {
	this.disbaledBank = name === 'Transferencia Banco';
}

function flagChange() {
	this.filterCarge(this.model.staffId);
	this.contractDate = helper.exactDate(this.modelEdit.contractDate, 'DD/MM/YYYY') || null;
	if (this.modelEdit.controlDate) {
		this.entryToCompany = helper.exactDate(this.modelEdit.controlDate.dateInput, 'DD/MM/YYYY') || null;
		this.exitToCompany = helper.exactDate(this.modelEdit.controlDate.dateOutput, 'DD/MM/YYYY') || null;
		this.dateOfAdmission = helper.exactDate(this.modelEdit.controlDate.insuredIngress, 'DD/MM/YYYY') || null;
		this.departureDate = helper.exactDate(this.modelEdit.controlDate.insuredExit, 'DD/MM/YYYY') || null;
	}
}

function clearBossField(flagBoss) {
	if (flagBoss) {
		this.$emit('clear-boss-field');
	}
}

function data() {
	return {
		department: [],
		typeOfRemuneration: [],
		costCenter: [],
		typeOfStaff: [],
		establishment: [],
		regime: [],
		positions: [],
		typeOfEmployee: [],
		receivesExtraHours: [],
		boss: [],
		directLabor: [],
		category: [
			{ id: 1, name: '1' },
			{ id: 2, name: '2' },
			{ id: 3, name: '3' },
			{ id: 4, name: '4' },
			{ id: 5, name: '5' },
		],
		activeDesactive: [],
		grounds: [],
		reasonsForDeparture: [],
		reEntry: [],
		wayToPay: [],
		banks: [],
		accountType: [],
		contractDate: null,
		entryToCompany: null,
		exitToCompany: null,
		dateOfAdmission: null,
		departureDate: null,
		disbaledBank: false,
	};
}

export default {
	name: 'company-data',
	data,
	created,
	validations,
	methods: {
		changePayment,
		clearBossField,
		filterCarge,
		setData,
		onDate,
		loadData,
		onDateControl,
	},
	props: {
		model: {
			type: [Array, Object],
			default: () => {},
		},
		controlDate: {
			type: [Array, Object],
			default: () => {},
		},
		flagLoad: {
			type: Boolean,
			default: false,
		},
		modelEdit: {
			type: [Object, Array],
			default: () => {},
		},
	},
	watch: {
		flagLoad: flagChange,
	},
};
</script>
<style lang="scss" scoped>
	.payroll-company-data {
		
		.title-payroll {
			border-bottom: 1px solid map-get($colors , blue-grey);
		}
	}
</style>
