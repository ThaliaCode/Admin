<template>
  <div class="wrapper-create-employee">
		<v-tabs
			align-with-title
			color="transparent"
			right
			slider-color="primary"
			class="mt-3 px-5"
			v-model="active"
		>
			<v-tab
				v-for="tab in tabs"
				:key="tab.id"
				:disabled="tab.disabled"
			>
				<span>{{ tab.name }}</span>
			</v-tab>
			<v-tab-item
				v-for="tab in tabs"
				:key="tab.id"
			>
				<v-card class="px-5 pt-5 mb-5">
					<employee-data 
						v-if="tab.id === 1"
						@next="nextTab"
						@cancel="cancel"
						:blood-type="bloodType"
						:type-documents="typeDocuments"
						:gender="gender"
						:civil-status="civilStatus"
						:model="model"
						:code="id"/>
					<company-data 
						v-else-if="tab.id === 2"
						@back="backTab"
						@cancel="cancel"
						@clear-boss-field="clearBossField"
						:model="modelCompany"
						:control-date="controlDate"
						:flag-load="flagLoad"
						:model-edit="modelEdit"/>
					<iess-data 
						v-else
						@back="backTab"
						@cancel="cancel"
						:model="modelIess"
						:flag-load="flagLoad"	
						/>
				</v-card>
			</v-tab-item>
		</v-tabs>
		<v-layout wrap align-center justify-center mb-4 class="wrapper-btns">
			<v-flex xs1 mr-4>
				<v-btn
					small
					dark
					color="pink"
					class="btn-action ml-1"
					@click.native="cancel"
				>
					Cancelar
				</v-btn>
			</v-flex>
			<v-flex xs1>
				<v-btn
					small
					dark
					color="success"
					class="btn-action"
					@click.native="saveEmployee"
					:disabled="$v.$invalid"
				>
					Guardar
				</v-btn>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>
import employeeData from '@/components/payroll/employee-data';
import companyData from '@/components/payroll/company-data';
import iessData from '@/components/payroll/IESS-data';
import groupTable from '@/shared/group-table';
import helper from '@/shared/helper';
import { required, email } from 'vuelidate/lib/validators';

function nextTab() {
	const active = parseInt(this.active, 10);
	this.active = (active < 3 ? active + 1 : 0).toString();
}

function backTab() {
	const active = parseInt(this.active, 10);
	this.active = (active < 3 ? active - 1 : 0).toString();
}

function cancel() {
	this.goTo('employee-control');
}

function clearBossField() {
	this.modelCompany.employeeBossId = null;
}

function data() {
	return {
		active: null,
		bloodType: [],
		gender: [
			{ id: 1, name: 'Masculino' },
			{ id: 2, name: 'Femenino' },
		],
		civilStatus: [
			{ id: 1, name: 'Soltero' },
			{ id: 2, name: 'Casado' },
			{ id: 3, name: 'Viudo' },
			{ id: 4, name: 'Divorciado' },
		],
		model: {
			code: null,
			typePersonId: null,
			documentNumber: null,
			accountingAccount: null,
			name: null,
			lastname: null,
			dateBirth: null,
			accountingExt: null,
			nationality: null,
			genderId: null,
			civilStatusId: null,
			bloodTypeId: null,
			driverLicense: null,
			phone: null,
			email: null,
			address: null,
			referencePhone: null,
			observation: null,
			urlImage: null,
			referenceFullName: null,
			flagActive: true,
			familyBurden: null,
		},
		modelCompany: {
			departamentId: null,
			chargeCenterId: null,
			staffId: null,
			comSubsidiariesId: null,
			workRegimeId: null,
			chargeId: null,
			typeEmployeeId: null,
			employeeBossId: null,
			flagBoss: false,
			years: null,
			months: null,
			days: null,
			contractNumber: null,
			contractDate: null,
			remunerationId: null,
			salary: null,
			worthySalary: null,
			flagExtraHours: false,
			flagLabor: false,
			categoryType: null,
			workedDays: null,
			maternityDays: null,
			medicalPermission: null,
			permitsDays: null,
			reserveFund: false,
			flagBonuses: false,
			methodPaymentId: null,
			bankId: null,
			accountTypeId: null,
			accountNumberBank: null,
			loanAmount: null,
			flagReentry: false,
		},
		controlDate: {
			dateInput: null,
			dateOutput: null,
			retireMotivateId: null,
			flagActive: true,
			flagBurden: false,
			insuredExit: null,
			insuredIngress: null,
			days: null,
			retireMotivateInsuredId: null,
		},
		modelIess: {
			originPaymentId: null,
			typeEmployerId: null,
			workRelationshipId: null,
			sectoralActivityId: null,
			discountInsuredId: null,
			affiliationNumber: null,
			medicalHistory: null,
			allergies: null,
			diseases: null,
		},
		flagLoad: false,
		contractDate: null,
		modelEdit: {},
		typeDocuments: [],
		edit: false,
	};
}

function created() {
	this.loadData();
	if (this.id) {
		this.edit = true;
		this.editEmployee();
	}
}

async function loadData() {
	const request = [
		this.urlLoadData('get', groupTable.BloodType),
		this.$httpSales.get('type-person'),
	];
	try {
		const responses = await Promise.all(request);
		this.bloodType = responses[0].data;
		this.typeDocuments = responses[1].data;
		const index = this.typeDocuments.findIndex(t => t.name === 'RUC');
		if (index > -1) {
			this.typeDocuments.splice(index, 1);
		}
	} catch (error) {
		this.showGenericError();
	}
}

async function saveEmployee() {
	const method = this.id ? 'patch' : 'post';
	const url = this.id ? `employees-company/${this.id}` : '/employees-company';
	const message = this.id ? 'actualizó' : 'creó';
	const body = Object.assign({}, this.model, this.modelCompany, this.modelIess);
	body.methodPaymentId = this.modelCompany.methodPaymentId ?
		this.modelCompany.methodPaymentId.id : null;
	body.years = this.modelCompany.years ? Number(this.modelCompany.years) : null;
	body.months = this.modelCompany.months ? Number(this.modelCompany.months) : null;
	body.days = this.modelCompany.days ? Number(this.modelCompany.days) : null;
	body.salary = this.modelCompany.salary ? Number(this.modelCompany.salary) : null;
	body.worthySalary = this.modelCompany.worthySalary ?
		Number(this.modelCompany.worthySalary) : null;
	body.workedDays = this.modelCompany.workedDays ? Number(this.modelCompany.workedDays) : null;
	body.maternityDays = this.modelCompany.maternityDays ?
		Number(this.modelCompany.maternityDays) : null;
	body.medicalPermission = this.modelCompany.medicalPermission ?
		Number(this.modelCompany.medicalPermission) : null;
	body.permitsDays = this.modelCompany.permitsDays ? Number(this.modelCompany.permitsDays) : null;
	body.loanAmount = this.modelCompany.loanAmount ? Number(this.modelCompany.loanAmount) : null;
	delete body.familyBurden;
	try {
		await this.$httpSales[method](url, body);
		this.showNotification(`Se ${message} correctamente`);
		this.goTo('employee-control');
	} catch (error) {
		this.showGenericError();
	}
}

async function editEmployee() {
	try {
		const response = await this.$httpSales.get(`employees-company/${this.id}`);
		this.flagLoad = true;
		this.modelEdit = response.data;
		this.model.code = response.data.code || null;
		this.model.typePersonId = response.data.typePersonId || null;
		this.model.documentNumber = response.data.documentNumber || null;
		this.model.accountingAccount = response.data.accountingAccount || null;
		this.model.name = response.data.name || null;
		this.model.lastname = response.data.lastname || null;
		this.model.accountingAccount = response.data.accountingAccount || null;
		this.model.nationality = response.data.nationality || null;
		this.model.genderId = response.data.genderId || null;
		this.model.civilStatusId = response.data.civilStatusId || null;
		this.model.bloodTypeId = response.data.bloodTypeId || null;
		this.model.driverLicense = response.data.driverLicense || null;
		this.model.phone = response.data.phone || null;
		this.model.email = response.data.email || null;
		this.model.address = response.data.address || null;
		this.model.referencePhone = response.data.referencePhone || null;
		this.model.observation = response.data.observation || null;
		this.model.urlImage = response.data.urlImage || null;
		this.model.referenceFullName = response.data.referenceFullName || null;
		this.model.accountingExt = response.data.accountingExt || null;
		this.model.driverLicense = response.data.driverLicense || null;
		this.model.familyBurden = Object.keys(response.data.familyBurden).length ?
			response.data.familyBurden : null;
		this.flagDriverLicense = !!response.data.driverLicense || null;
		this.modelCompany.departamentId = response.data.departamentId || null;
		this.modelCompany.chargeCenterId = response.data.chargeCenterId || null;
		this.modelCompany.staffId = response.data.staffId || null;
		this.modelCompany.comSubsidiariesId = response.data.comSubsidiariesId || null;
		this.modelCompany.workRegimeId = response.data.workRegimeId || null;
		this.modelCompany.chargeId = response.data.chargeId || null;
		this.modelCompany.typeEmployeeId = response.data.typeEmployeeId || null;
		this.modelCompany.employeeBossId = response.data.employeeBossId || null;
		this.modelCompany.flagBoss = response.data.flagBoss === 1;
		this.modelCompany.years = response.data.years || null;
		this.modelCompany.months = response.data.months || null;
		this.modelCompany.days = response.data.days || null;
		this.modelCompany.contractNumber = response.data.contractNumber || null;
		this.modelCompany.contractDate = helper.exactDate(response.data.contractDate, 'YYYY-MM-DD') || null;
		this.modelCompany.remunerationId = response.data.remunerationId || null;
		this.modelCompany.salary = response.data.salary || null;
		this.modelCompany.worthySalary = response.data.worthySalary || null;
		this.modelCompany.categoryType = response.data.categoryType || null;
		this.modelCompany.workedDays = response.data.workedDays || null;
		this.modelCompany.maternityDays = response.data.maternityDays || null;
		this.modelCompany.medicalPermission = response.data.medicalPermission || null;
		this.modelCompany.permitsDays = response.data.permitsDays || null;
		this.modelCompany.flagExtraHours = response.data.flagExtraHours === 1;
		this.modelCompany.flagLabor = response.data.flagLabor === 1;
		this.modelCompany.reserveFund = response.data.reserveFund === 1;
		this.modelCompany.flagBonuses = response.data.flagBonuses === 1;
		this.modelCompany.flagReentry = response.data.flagReentry === 1;
		this.modelCompany.methodPaymentId = response.data.methodPaymentId || null;
		this.modelCompany.bankId = response.data.bankId || null;
		this.modelCompany.accountTypeId = response.data.accountTypeId || null;
		this.modelCompany.accountNumberBank = response.data.accountNumberBank || null;
		this.modelCompany.loanAmount = response.data.loanAmount || null;
		this.modelIess.originPaymentId = response.data.originPaymentId || null;
		this.modelIess.typeEmployerId = response.data.typeEmployerId || null;
		this.modelIess.workRelationshipId = response.data.workRelationshipId || null;
		this.modelIess.sectoralActivityId = response.data.sectoralActivityId || null;
		this.modelIess.discountInsuredId = response.data.discountInsuredId || null;
		this.modelIess.affiliationNumber = response.data.affiliationNumber || null;
		this.modelIess.medicalHistory = response.data.medicalHistory || null;
		this.modelIess.allergies = response.data.allergies || null;
		this.modelIess.diseases = response.data.diseases || null;
		if (response.data.controlDate) {
			this.controlDate.dateInput = helper.exactDate(response.data.controlDate.dateInput, 'YYYY-MM-DD') || null;
			this.controlDate.dateOutput = helper.exactDate(response.data.controlDate.dateOutput, 'YYYY-MM-DD') || null;
			this.controlDate.days = response.data.controlDate.days || null;
			this.controlDate.flagActive = response.data.controlDate.flagActive === 1;
			this.controlDate.insuredIngress = helper.exactDate(response.data.controlDate.insuredIngress, 'YYYY-MM-DD') || null;
			this.controlDate.insuredExit = helper.exactDate(response.data.controlDate.insuredExit, 'YYYY-MM-DD') || null;
			this.controlDate.retireMotivateId = response.data.controlDate.retireMotivate ?
				response.data.controlDate.retireMotivate.id : null;
			this.controlDate.retireMotivateInsuredId = response.data.controlDate.retireMotivateInsured ?
				response.data.controlDate.retireMotivateInsured.id : null;
		}
	} catch (error) {
		this.showGenericError();
	}
}


function validations() {
	return {
		model: {
			code: { required },
			name: { required },
			lastname: { required },
			email: { email },
			documentNumber: { required },
			typePersonId: { required },
			genderId: { required },
			civilStatusId: { required },
			address: { required },
		},
		modelCompany: {
			comSubsidiariesId: { required },
			chargeId: { required },
			departamentId: { required },
			chargeCenterId: { required },
			typeEmployeeId: { required },
			remunerationId: { required },
		},
		modelIess: {
			typeEmployerId: { required },
			workRelationshipId: { required },
			originPaymentId: { required },
			sectoralActivityId: { required },
			discountInsuredId: { required },
		},
	};
}

export default {
	name: 'payroll-create-employee-tab',
	components: {
		employeeData,
		companyData,
		iessData,
	},
	data,
	created,
	methods: {
		clearBossField,
		editEmployee,
		nextTab,
		backTab,
		cancel,
		loadData,
		saveEmployee,
	},
	props: {
		tabs: {
			default: () => [],
			type: Array,
		},
		id: {
			type: [String, Number],
		},
		code: {
			type: Boolean,
			default: false,
		},
	},
	validations,
};
</script>

<style lang="scss">
	.blue--text {
		color: #05579b !important;
	}

	.wrapper-create-employee {
		position: relative;
	}

	.wrapper-btns {
		bottom: 38px;
		position: absolute;
    width: 100%;
	}
</style>


