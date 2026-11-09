<template>
	<div>
		<v-layout wrap px-4 py-4>
			<v-flex xs12 md12 pr-2 mb-4>
				<v-text-field
					class="filter-select shadow-inset"
					label="Codigo"
					v-model="model.code"
					:readonly="!!id"
				>
				</v-text-field>
				<span class="form-group__message" v-if="$v.model.code.$invalid">
					Este campo es requerido.
				</span>
				<span
					class="text-not-code-blank"
					v-if="checkBlankCode(model.code)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					class="filter-select shadow-inset"
					label="Nombre"
					v-model="model.name"
				>
				</v-text-field>
				<span class="form-group__message" v-if="$v.model.name.$invalid">
					Este campo es requerido.
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-4>
				<v-select
					label="Tipo de Formato"
					:items="typeFormat"
					single-line
					item-text="name"
					item-value="id"
					bottom
					return-object
					hide-details
					v-model="type"
					class="filter-select shadow-inset"
					@change="getTypeFormat($event)"
				></v-select>
				<span class="form-group__message" v-if="$v.model.formatId.$invalid">
					Este campo es requerido.
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-4>
				<v-text-field
					class="filter-select shadow-inset"
					label="Cadena por Defecto"
					v-model="model.value"
					:disabled="!model.formatId"
					:type="typeInput"
				>
				</v-text-field>
			</v-flex>
			<v-flex xs4 pr-2 mb-2>
				<v-checkbox		
				:true-value="true"
				:false-value="false"
				class="pt-2"
				label="Activo"
				color="primary"
				v-model="model.flagActive"
				></v-checkbox>
			</v-flex>
			<v-flex xs4 pr-2 mb-2>
				<v-checkbox
					color="primary"
					:true-value="true"
					:false-value="false"
					class="pt-2"
					label="Vaciar Datos"
					v-model="model.flagEmpty"
				></v-checkbox>
			</v-flex>
			<v-flex xs4 pr-2 mb-2>
				<v-checkbox
					color="primary"
					:true-value="true"
					:false-value="false"
					class="pt-2"
					label="Activo Rol"
					v-model="model.flagRole"
				></v-checkbox>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					class="textarea-content filter-select shadow-inset"
					label="Observaciones"
					v-model="model.observation"
				>
				</v-text-field>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.model.$invalid || checkBlankCode(model.code)"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="editAdditional"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { required } from 'vuelidate/lib/validators';
import groupTable from '@/shared/group-table';

function created() {
	this.getFormat();
	if (this.id) {
		this.loadData();
	}
}

async function loadData() {
	try {
		const response = await this.$httpSales.get(`additional-fields/${this.id}`);
		this.model.code = response.data.code;
		this.model.name = response.data.name;
		this.model.value = response.data.value;
		this.model.flagEmpty = response.data.flagEmpty === 1;
		this.model.flagActive = response.data.flagActive === 1;
		this.model.flagRole = response.data.flagRole === 1;
		this.model.formatId = response.data.typeFormat.id;
		this.model.observation = response.data.observation;
		this.type = response.data.typeFormat.id;
	} catch (error) {
		this.showGenericError();
	}
}

function clearModal() {
	this.model = {
		value: '',
		flagEmpty: false,
		flagActive: false,
		flagRole: false,
		code: '',
		formatId: null,
		name: '',
		observation: '',
	};
}

async function editAdditional() {
	const url = this.id ? `additional-fields/${this.id}` : 'additional-fields';
	const method = this.id ? 'patch' : 'post';
	const message = this.id ? 'actualizó' : 'creó';
	try {
		await this.$httpSales[method](url, this.model);
		this.showNotification(`Se ${message} correctamente`);
		this.$emit('update');
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'GROUP_EXISTS') {
				this.showGenericError('El código ya existe');
			}
		} else {
			this.showGenericError();
		}
	}
}

async function getFormat() {
	try {
		const response = await this.urlLoadData('get', groupTable.TypeFormat);
		this.typeFormat = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function validations() {
	return {
		model: {
			code: {
				required,
			},
			name: {
				required,
			},
			formatId: {
				required,
			},
		},
	};
}

function closeModal() {
	this.clearModal();
	this.$emit('close');
}

function getTypeFormat(value) {
	this.model.formatId = value.id;
	this.typeInput = value.name === 'Numérico' ? 'number' : 'text';
	this.type = value.id;
}

function data() {
	return {
		typeFormat: [],
		numericalValue: [],
		model: {
			value: '',
			flagEmpty: false,
			flagActive: false,
			flagRole: false,
			code: '',
			formatId: null,
			name: '',
			observation: '',
		},
		typeInput: 'text',
		type: null,
	};
}

export default {
	name: 'create-additional-data',
	data,
	created,
	props: {
		id: {
			type: [String, Number],
		},
	},
	components: {
		modalSidebarButton,
	},
	methods: {
		loadData,
		editAdditional,
		getFormat,
		clearModal,
		closeModal,
		getTypeFormat,
	},
	validations,
};
</script>

