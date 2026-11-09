<template>
		<div>
			<v-layout wrap px-4 py-3>
				<v-flex xs12 md12 pr-2 mb-3>
					<v-text-field
						class="filter-select"
						label="Código"
						v-model="model.code"
						:readonly="!!editId"
					>
					</v-text-field>
					<span class="form-group__message"
						v-if="$v.model.code.$invalid">
						El código es requerido.
					</span>
					<span
						class="text-not-code-blank"
						v-if="checkBlankCode(model.code)">
						No se permite espacios en blanco
					</span>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-3>
					<app-date-mask
						id="company-income"
						label="Ingreso Empresa"
						v-model="companyIncome"
						@format-date="onDate($event, 'dateInput')"
						@change="calculateTime"
					>
					</app-date-mask>
					<span class="form-group__message"
						v-if="$v.model.dateInput.$invalid">
						La fecha de ingreso es requerido.
					</span>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-3>
					<app-date-mask
						id="company-income"
						label="Salida Empresa"
						v-model="companyExit"
						@format-date="onDate($event, 'dateOutput')"
						@change="calculateTime"
					>
					</app-date-mask>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-3>
					<v-text-field
						readonly
						class="filter-select"
						label="Tiempo total"
						v-model="timeCalculated"
					>
					</v-text-field>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-3>
					<v-select
						v-model="model.retireMotivateId"
						:items="retireMotive"
						label="Motivo de Salida Empresa"
						single-line
						item-text="name"
						item-value="id"
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-3>
					<v-switch
						hide-details
						label="IEES"
						color="success"
						v-model="model.flagInsured"
					></v-switch>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-3>
					<app-date-mask
						id="iees-income"
						label="Ingreso IEES"
						v-model="ieesIncome"
						@format-date="onDate($event, 'insuredIngress')"
					>
					</app-date-mask>
					<span class="form-group__message"
						v-if="$v.model.insuredIngress.$invalid">
						La fecha de ingreso IEES es requerido.
					</span>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-3>
					<app-date-mask
						id="iees-output"
						label="Salida IEES"
						v-model="ieesOutput"
						@format-date="onDate($event, 'insuredExit')"
					>
					</app-date-mask>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-3>
					<v-select
						v-model="model.retireMotivateInsuredId"
						:items="retireMotive"
						label="Motivo de Salida IEES"
						single-line
						item-text="name"
						item-value="id"
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-3>
					<v-text-field
						class="filter-select"
						label="Días"
						v-model="model.days"
						type="number"
					>
					</v-text-field>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-3>
					<v-text-field
						class="filter-select"
						label="Días Acumulados"
						v-model="model.accumulatedDays"
						type="number"
					>
					</v-text-field>
				</v-flex>
			</v-layout>
			<section class="fast-register-footer">
				<modal-sidebar-button
					:is-loading="$v.model.$invalid || checkBlankCode(model.code)"
					@cancel-button-clicked="closeModal"
					@accept-button-clicked="createControlDate"
				/>
			</section>
		</div>
</template>
<script>
import { differenceInCalendarDays } from 'date-fns';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { required, requiredIf } from 'vuelidate/lib/validators';
import helper from '@/shared/helper';

function onDate(value, modelName) {
	this.model[modelName] = value;
	if (modelName === 'dateInput') {
		this.ieesIncome = this.companyIncome;
	} else if (modelName === 'dateOutput') {
		this.ieesOutput = this.companyExit;
	}
}


function closeModal() {
	this.$emit('close');
}

async function createControlDate() {
	const method = this.editId ? 'patch' : 'post';
	const message = this.editId ? 'actualizó' : 'creó';
	const url = this.editId ? `employee/${this.id}/date-control/${this.editId}` : `employee/${this.id}/date-control`;
	try {
		await this.$httpSales[method](url, this.model);
		this.showNotification(`Se ${message} correctamente.`);
		this.$emit('update');
	} catch (error) {
		if (error.data.message === 'GROUP_EXISTS') {
			this.showGenericError('Código ya existe');
		} else {
			this.showGenericError();
		}
	}
}

function created() {
	if (this.editId) {
		this.loadData();
	}
}

async function loadData() {
	const response = await this.$httpSales.get(`employee/${this.id}/date-control/${this.editId}`);
	this.model.code = response.data.code || null;
	this.companyIncome = helper.exactDate(response.data.dateInput, 'DD/MM/YYYY') || null;
	this.model.dateInput = helper.exactDate(response.data.dateInput, 'YYYY-MM-DD') || null;
	this.companyExit = helper.exactDate(response.data.dateOutput, 'DD/MM/YYYY') || null;
	this.model.dateOutput = helper.exactDate(response.data.dateOutput, 'YYYY-MM-DD') || null;
	this.ieesIncome = helper.exactDate(response.data.insuredIngress, 'DD/MM/YYYY') || null;
	this.model.insuredIngress = helper.exactDate(response.data.insuredIngress, 'YYYY-MM-DD') || null;
	this.ieesOutput = helper.exactDate(response.data.insuredExit, 'DD/MM/YYYY') || null;
	this.model.insuredExit = helper.exactDate(response.data.insuredExit, 'YYYY-MM-DD') || null;
	this.model.retireMotivateId = response.data.retireMotivate ?
		response.data.retireMotivate.id : null;
	this.model.retireMotivateInsuredId = response.data.retireMotivateInsured ?
		response.data.retireMotivateInsured.id : null;
	this.model.flagInsured = !!response.data.flagInsured;
	this.model.days = response.data.days || null;
	this.model.accumulatedDays = response.data.accumulatedDays || null;
	this.timeCalculated = response.data.workTimeView || 0;
}

function validations() {
	return {
		model: {
			code: { required },
			dateInput: { required },
			insuredIngress: {
				required: requiredIf(() => this.model.flagInsured),
			},
		},
	};
}

function calculateTime() {
	if (this.model.dateOutput && this.model.dateInput) {
		this.model.insuredIngress = this.model.dateInput;
		this.model.insuredExit = this.model.dateOutput;
		const endDate = new Date(this.model.dateOutput);
		const initDate = new Date(this.model.dateInput);
		const totalDay = differenceInCalendarDays(endDate, initDate);
		const totalYear = totalDay / 365;
		const year = Math.trunc(totalYear);
		const totalMonth = (totalYear - year) * 12;
		const month = Math.trunc(totalMonth);
		const day = Math.trunc((totalMonth - month) * 30);
		const yearLetter = year > 0 ? `${year} año(s), ` : '';
		const monthLetter = month > 0 ? `${month} mese(s), ` : '';
		const dayLetter = day > 0 ? `${day} día(s)` : '';
		this.timeCalculated = `${yearLetter}${monthLetter}${dayLetter}`;
	}
}

function data() {
	return {
		model: {
			code: null,
			dateInput: null,
			dateOutput: null,
			flagInsured: false,
			insuredIngress: null,
			insuredExit: null,
			days: null,
			accumulatedDays: null,
			flagActive: true,
			retireMotivateId: null,
			retireMotivateInsuredId: null,
		},
		companyIncome: null,
		companyExit: null,
		ieesIncome: null,
		ieesOutput: null,
		timeCalculated: 0,
	};
}
export default {
	name: 'new-control-date',
	data,
	components: {
		modalSidebarButton,
	},
	created,
	methods: {
		calculateTime,
		closeModal,
		createControlDate,
		loadData,
		onDate,
	},
	props: {
		id: {
			type: [String, Number],
		},
		editId: {
			type: [String, Number],
		},
		retireMotive: {
			type: Array,
			default: () => [],
		},
	},
	validations,
};
</script>
