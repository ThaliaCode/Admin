<template>
  <div>
		<v-layout wrap px-4 py-3>
			<v-flex mb-4>
				Grupo: Centro de Costo
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-4>
				<v-text-field
				class="filter-select shadow-inset"
				label="Nombre de Centro de Costo"
				v-model="model.name"
				></v-text-field>
				<span class="form-group__message" v-if="$v.model.name.$invalid">
					El nombre es requerido.
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-4>
				<v-text-field
				label="Codigo"
				class="filter-select shadow-inset"
				v-model="model.code"
				:readonly="!!id"
				></v-text-field>
				<span
					class="text-not-code-blank"
					v-if="checkBlankCode(model.code)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-4>
				<v-switch
					hide-details
					color="success"
					:label="stateName"
					:true-value="true"
					:false-value="false"
					v-model="model.flagActive"
				></v-switch>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
			:is-loading="$v.model.$invalid || checkBlankCode(model.code)"
			@cancel-button-clicked="closeModal"
			@accept-button-clicked="getCost"
			></modal-sidebar-button>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import groupTable from '@/shared/group-table';
import { required } from 'vuelidate/lib/validators';

function validations() {
	return {
		model: {
			code: { required },
			name: { required },
		},
	};
}
async function getCost() {
	const method = this.id ? 'patch' : 'post';
	const message = this.id ? 'Actualizó' : 'Creó';
	try {
		await this.urlLoadData(method, groupTable.CostCenter, null, this.id, this.model);
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
function created() {
	if (this.id) {
		this.loadData();
	}
}
async function loadData() {
	try {
		const response = await this.urlLoadData('get', groupTable.CostCenter, null, this.id);
		this.model.name = response.data.name;
		this.model.code = response.data.code;
		this.model.flagActive = !!response.data.flagActive;
	} catch (error) {
		this.showGenericError();
	}
}
function closeModal() {
	this.$emit('close-modal');
}

function stateName() {
	return this.model.flagActive ? 'Activo' : 'Inactivo';
}

function data() {
	return {
		costCode: false,
		model: {
			name: '',
			code: '',
			flagActive: false,
		},
	};
}
export default {
	name: 'create-cost',
	data,
	created,
	validations,
	props: {
		id: {
			type: [String, Number],
		},
	},
	methods: {
		closeModal,
		getCost,
		loadData,
	},
	components: {
		modalSidebarButton,
	},
	computed: {
		stateName,
	},
};
</script>