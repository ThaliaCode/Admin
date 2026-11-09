<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					label="Código"
					class="filter-select shadow-inset mt-3"
					v-model="model.code"
					@input="completeName">
				</v-text-field>
				<span class="form-group__message" v-if="$v.model.code.$invalid">
					El código es requerido
				</span>
				<span
					class="text-not-code-blank"
					v-if="checkBlankCode(model.code)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<v-flex xs12 md4 pr-2 mb-3 pt-4>
				<v-select
					label="Tipo de Rol"
					:items="type"
					single-line
					item-text="name"
					item-value="id"
					bottom
					hide-details
					v-model="model.typePayrollId"
					class="filter-select shadow-inset"
				></v-select>
				<span class="form-group__message" v-if="$v.model.typePayrollId.$invalid">
					El tipo de rol es requerido
				</span>
			</v-flex>
			<v-flex xs12 md4 pr-2 mb-3>
				<app-date-mask
					label="Fecha Inicio"
					v-model="dateStart"
					@format-date="onDate($event, 'dateStart')"
					@input="completeName"
				>
				</app-date-mask>
				<span class="form-group__message" v-if="$v.model.dateStart.$invalid">
					La fecha inicial es requerido
				</span>
			</v-flex>
			<v-flex xs12 md4 pr-2 mb-3>
				<app-date-mask
					label="Fecha Final"
					v-model="dateEnd"
					@format-date="onDate($event, 'dateEnd')"
					@input="completeName"
				>
				</app-date-mask>
				<span class="form-group__message" v-if="$v.model.dateEnd.$invalid">
					La fecha final es requerido
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					label="Nombre"
					class="filter-select shadow-inset mt-3"
					v-model="model.name">
				</v-text-field>
				<span class="form-group__message" v-if="$v.model.name.$invalid">
					El nombre es requerido
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					label="Descripción"
					class="filter-select shadow-inset mt-3"
					v-model="model.description">
				</v-text-field>
			</v-flex>
			<v-flex xs6 pr-2 mb-3>
				<v-checkbox
					v-model="model.flagLocked"
					hide-details
					label="Bloqueado"
				>
				</v-checkbox>
			</v-flex>
			<v-flex xs6 pr-2 mb-3>
				<v-checkbox
					v-model="model.flagProvision"
					hide-details
					label="Sumar Provisiones"
				>
				</v-checkbox>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					label="Num. Decimales"
					class="filter-select shadow-inset mt-3"
					v-model="model.decimal"
					type="number">
				</v-text-field>
				<span class="form-group__message" v-if="$v.model.decimal.$invalid">
					El decimal es requerido
				</span>
			</v-flex>
			<v-flex xs12 pr-2 mb-3>
				<v-select
					label="Establecimiento"
					:items="subsidiaries"
					single-line
					item-text="sucursalName"
					item-value="id"
					bottom
					hide-details
					v-model="model.comSubsidiariesId"
					class="filter-select shadow-inset"
				></v-select>
				<span class="form-group__message" v-if="$v.model.comSubsidiariesId.$invalid">
					El establecimiento de rol es requerido
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					label="Observación"
					v-model="model.observation"
					no-resize
					class="filter-select shadow-inset textarea-content"
				></v-text-field>
			</v-flex>
			<v-flex xs6 pr-2 mb-3>
				<v-text-field
					label="Asiento Método 1"
					class="filter-select shadow-inset mt-3"
					v-model="model.accountingSeat"
				>
				</v-text-field>
			</v-flex>
			<v-flex xs6 pr-2 mb-3 pt-3>
				<v-checkbox
					v-model="model.flagAccounted"
					hide-details
					label="Contabilizado"
				>
				</v-checkbox>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid || checkBlankCode(model.code)"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="createRole"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import groupTable from '@/shared/group-table';
import { required } from 'vuelidate/lib/validators';
import helper from '@/shared/helper';

const { exactDate } = helper;

function onDate(value, modelName) {
	this.model[modelName] = value;
}

function data() {
	return {
		type: [],
		subsidiaries: [],
		model: {
			code: null,
			dateStart: null,
			dateEnd: null,
			description: null,
			decimal: null,
			typePayrollId: null,
			observation: null,
			accountingSeat: null,
			name: null,
			flagActive: true,
			flagProvision: false,
			flagLocked: false,
			flagAccounted: false,
			comSubsidiariesId: null,
		},
		dateStart: null,
		dateEnd: null,
	};
}

async function loadData() {
	const request = [
		this.urlLoadData('get', groupTable.TypePayroll),
		this.$httpSales.get('subsidiaries'),
	];
	[
		{ data: this.type },
		{ data: this.subsidiaries },
	] = await Promise.all(request);
}

function created() {
	this.loadData();
	if (this.id) {
		this.editRole();
	}
}

function completeName() {
	if (this.model.code && this.model.dateStart && this.model.dateEnd) {
		this.model.name = `${this.model.code}_${this.model.dateStart}_${this.model.dateEnd}`;
	}
}

function validations() {
	return {
		model: {
			code: { required	},
			name: { required },
			dateStart: { required },
			dateEnd: { required },
			typePayrollId: { required },
			decimal: { required },
			comSubsidiariesId: { required },
		},
	};
}

async function createRole() {
	const method = this.id ? 'patch' : 'post';
	const url = this.id ? `payroll-heading/${this.id}` : 'payroll-heading';
	const message = this.id ? 'actualizó' : 'creó';
	try {
		await this.$httpSales[method](url, this.model);
		this.showNotification(`Se ${message} correctamente`);
		this.$emit('update-role');
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'PAYROLL_EXIST') {
				this.showGenericError('El código ya existe');
			} else if (error.data.message === 'PAYROLL_LOCKED_ERROR') {
				this.showGenericError('No se puede editar un rol bloqueado');
			}
		} else {
			this.showGenericError();
		}
	}
}

async function editRole() {
	try {
		const response = await this.$httpSales.get(`payroll-heading/${this.id}`);
		this.model.code = response.data.code;
		this.model.typePayrollId = response.data.typePayroll.id;
		this.model.name = response.data.name;
		this.model.dateStart = exactDate(response.data.dateStart, 'YYYY-MM-DD');
		this.dateStart = exactDate(response.data.dateStart, 'DD/MM/YYYY');
		this.model.dateEnd = exactDate(response.data.dateEnd, 'YYYY-MM-DD');
		this.dateEnd = exactDate(response.data.dateEnd, 'DD/MM/YYYY');
		this.model.description = response.data.description;
		this.model.flagProvision = !!response.data.flagProvision;
		this.model.flagLocked = !!response.data.flagLocked;
		this.model.decimal = response.data.decimal;
		this.model.comSubsidiariesId = response.data.comSubsidiariesId;
		this.model.observation = response.data.observation;
		this.model.accountingSeat = response.data.accountingSeat;
		this.model.flagAccounted = !!response.data.flagAccounted;
	} catch (error) {
		this.showGenericError();
	}
}

export default {
	name: 'create-role-payments',
	data,
	created,
	methods: {
		onDate,
		loadData,
		completeName,
		createRole,
		editRole,
	},
	components: {
		modalSidebarButton,
	},
	props: {
		id: [Number, String],
	},
	validations,
};
</script>

