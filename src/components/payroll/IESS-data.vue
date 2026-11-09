<template>
	<div class="payroll-iess-create grey-background pa-5">
		<div>
			<div>
				<h4 class="py-2 pl-2 mb-2 title-payroll">DATOS DE LA EMPRESA</h4>
			</div>
			<v-layout row wrap>
				<v-flex xs6 pr-3>
					<v-layout row wrap>
						<v-flex xs12 md12 pr-2 mb-3>
							<label class="caption">Origen de Pagos</label>
							<v-select
								label="Origen de Pagos"
								:items="originOfPayments"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select"
								v-model="model.originPaymentId"
							></v-select>
							<span class="form-group__message" v-if="$v.model.originPaymentId.$invalid">
								Origen de Pagos es requerido
							</span>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3>
							<label class="caption">Tipo de Empleador</label>
							<v-select
								label="Tipo de Empleador"
								:items="typeOfEmployer"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select"
								v-model="model.typeEmployerId"
								@change="loadworkingRelationship($event)"
							></v-select>
							<span class="form-group__message" v-if="$v.model.typeEmployerId.$invalid">
								Tipo de Empleador es requerido
							</span>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs6 pl-3>
					<v-layout row wrap>
						<v-flex xs12 md12 pr-2 mb-2>
							<label class="caption">Relación de Trabajo</label>
							<v-select
								label="Relación de Trabajo"
								:items="workingRelationship"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select"
								v-model="model.workRelationshipId"
							></v-select>
							<span class="form-group__message" v-if="$v.model.typeEmployerId.$invalid">
								Seleccionar Tipo de Empleador
							</span>
							<span class="form-group__message" v-if="$v.model.workRelationshipId.$invalid && model.typeEmployerId">
								Relación de Trabajo es requerido
							</span>
						</v-flex>
						<v-flex xs12 md12 pr-2 mb-3>
							<label class="caption">Actividad Sectorial</label>
							<v-select
								label="Actividad Sectorial"
								:items="sectoralActivity"
								single-line
								item-text="name"
								item-value="id"
								bottom
								hide-details
								class="filter-select"
								v-model="model.sectoralActivityId"
							></v-select>
							<span class="form-group__message" v-if="$v.model.sectoralActivityId.$invalid">
								Actividad Sectorial es requerido
							</span>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</div>
		<div>
			<div>
				<h4 class="py-2 pl-2 mb-2 title-payroll">DATOS PERSONAL</h4>
				<v-layout row wrap>
					<v-flex xs6 pr-3>
						<v-layout row wrap>
							<v-flex xs12 md12 pr-2 mb-3>
								<label class="caption">Dcto.IESS</label>
								<v-select
									label="Dcto.IESS"
									:items="documentsIESS"
									single-line
									item-text="name"
									item-value="id"
									bottom
									hide-details
									class="filter-select"
									v-model="model.discountInsuredId"
								></v-select>
								<span class="form-group__message" v-if="$v.model.discountInsuredId.$invalid">
									Dcto.IESS es requerido
								</span>
							</v-flex>
							<v-flex xs12 md12 pr-2 mb-3>
								<v-text-field
									label="Número de afiliación del IESS"
									v-model="model.affiliationNumber"
									class="filter-select"
								></v-text-field>
							</v-flex>
							<v-flex xs12 md12 pr-2 mb-3>
								<v-text-field
									label="Historia clinica del IESS"
									v-model="model.medicalHistory"
									class="filter-select"
								></v-text-field>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs6 pl-3>
						<v-layout row wrap>
							<v-flex xs12 md12 pr-2 mb-3 pt-4>
								<v-text-field
									label="Alergias"
									v-model="model.allergies"
									class="filter-select"
								></v-text-field>
							</v-flex>
							<v-flex xs12 md12 pr-2 mb-3>
								<v-text-field
									label="Enfermedades"
									v-model="model.diseases"
									class="filter-select"
								></v-text-field>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</div>
		</div>
	</div>
</template>
<script>
import groupTable from '@/shared/group-table';
import { required } from 'vuelidate/lib/validators';

function created() {
	this.loadData();
}

function validations() {
	return {
		model: {
			typeEmployerId: { required },
			workRelationshipId: { required },
			originPaymentId: { required },
			sectoralActivityId: { required },
			discountInsuredId: { required },
		},
	};
}

async function loadworkingRelationship(id) {
	if (id) {
		try {
			const response = await this.$httpSales.get(`type-employer/${id}/type-working`);
			this.workingRelationship = response.data;
		} catch (error) {
			this.showGenericError();
		}
	}
}

async function loadEmployeer() {
	try {
		const response = await this.urlLoadData('get', groupTable.TypeEmployer);
		this.typeOfEmployer = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function setData({ value }, modelName) {
	this.model[modelName] = value;
}

async function loadData() {
	const request = [
		this.urlLoadData('get', groupTable.TypeEmployer),
		this.urlLoadData('get', groupTable.OriginPayment),
		this.urlLoadData('get', groupTable.DiscountTypeInsurance),
		this.urlLoadData('get', groupTable.TypeSectoralActivity),
	];
	[
		{ data: this.typeOfEmployer },
		{ data: this.originOfPayments },
		{ data: this.documentsIESS },
		{ data: this.sectoralActivity },
	] = await Promise.all(request);
}

function flagChange() {
	this.loadworkingRelationship(this.model.typeEmployerId);
}

function data() {
	return {
		originOfPayments: [],
		typeOfEmployer: [],
		workingRelationship: [],
		sectoralActivity: [],
		documentsIESS: [],
	};
}
export default {
	name: 'IESS-data',
	data,
	created,
	validations,
	methods: {
		loadworkingRelationship,
		loadEmployeer,
		setData,
		loadData,
	},
	props: {
		model: {
			type: [Object, Array],
			default: () => {},
		},
		flagLoad: {
			type: Boolean,
			default: false,
		},
	},
	watch: {
		flagLoad: flagChange,
	},
};
</script>
<style lang="scss" scoped>
	.payroll-iess-create {

		.title-payroll {
			border-bottom: 1px solid map-get($colors , blue-grey);
		}
	}
</style>

