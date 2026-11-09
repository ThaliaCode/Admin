<template>
  <div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12 pr-2 mb-2>
				<v-text-field
				type="Number"
				class="filter-select mt-3 "
				label="Código"
				:readonly="!!id"
				v-model="model.code"></v-text-field>
				<span class="form-group__message" v-if="$v.model.code.$invalid">
				El Codigo es requerido
			</span>
			<span
				class="text-not-code-blank"
				v-if="checkBlankCode(model.code)">
				No se permite espacios en blanco
			</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-2>
				<v-select
				class="filter-select mt-3 "
				label="Tipo de Entidad"
				v-model="model.groupId"
				item-text="name"
				item-value="id"
				:items="entities"
				></v-select>
				<span class="form-group__message" v-if="$v.model.groupId.$invalid">
				Tipo de Entidad es requerido
			</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-2>
				<v-text-field
				label="Nombre"
				class="filter-select mt-3  textarea-content" 	
				v-model="model.name"></v-text-field>
				<span class="form-group__message" v-if="$v.model.name.$invalid">
				Este Campo es requerido
			</span>
			</v-flex>
			<v-flex>
				<v-text-field
				label="Descripción"
				class="filter-select mt-4 textarea-content"
				v-model="model.description"></v-text-field>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.model.$invalid || checkBlankCode(model.code)"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="createEmployeer"></modal-sidebar-button>
		</section>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import groupTable from '@/shared/group-table';

function closeModal() {
	this.$emit('close');
}

function created() {
	if (this.id) {
		this.loadData();
	}
	this.listEntity();
}

async function createEmployeer() {
	try {
		const method = this.id ? 'patch' : 'post';
		const message = this.id ? 'actualizó' : 'creó';
		await this.urlLoadData(method, groupTable.TypeEmployer, null, this.id, this.model);
		this.showNotification(`Se ${message} correctamente`);
		this.$emit('update');
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'GROUP_EXISTS') {
				this.showGenericError('Código ya existe');
			} else if (error.data.message === 'TYPE_GENERAL_CODE_NOT_FOUND') {
				this.showGenericError('Tipo de Código no existe');
			}
		} else {
			this.showGenericError();
		}
	}
}

function data() {
	return {
		entities: [],
		model: {
			code: '',
			description: '',
			groupId: null,
			name: '',
		},
	};
}

async function listEntity() {
	try {
		const response = await this.urlLoadData('get', groupTable.typeFinancialEntity);
		this.entities = response.data;
	} catch (error) {
		this.showGenericError();
	}
}


async function loadData() {
	try {
		const response = await this.urlLoadData('get', groupTable.TypeEmployer, null, this.id);
		this.model.code = response.data.code || '';
		this.model.groupId = response.data.financialEntity.id || '';
		this.model.name = response.data.name || '';
		this.model.description = response.data.description || '';
	} catch (error) {
		this.showGenericError();
	}
}

function validations() {
	return {
		model: {
			code: { required },
			groupId: { required },
			name: { required },
		},
	};
}

export default {
	name: 'page-created-employee',
	created,
	components: {
		modalSidebarButton,
	},
	data,
	methods: {
		closeModal,
		createEmployeer,
		listEntity,
		loadData,
	},
	props: {
		id: {
			type: [String, Number],
		},
	},
	validations,
};
</script>
