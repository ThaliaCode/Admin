<template>
    <div>
			<v-layout wrap px-4 py-3>
				<v-flex xs12 md12 pr-2 mb-4>
					<v-text-field
					class="filter-select shadow-inset"
					label="Código"
					v-model="model.code"
					:readonly="!!id"
					></v-text-field>
					<span class="form-group__message" v-if="$v.model.code.$invalid">
						El codigo es requerido.
					</span>
					<span
						class="text-not-code-blank"
						v-if="checkBlankCode(model.code)">
						No se permite espacios en blanco
					</span>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-4>
					<v-text-field
					class="filter-select shadow-inset"
					label="Nombre"
					v-model="model.name"
					></v-text-field>
					<span class="form-group__message" v-if="$v.model.name.$invalid">
						El nombre es requerido
					</span>
				</v-flex>
				<v-flex xs12 md12 pr-2 mb-4>
					<v-text-field
					class="filter-select shadow-inset textarea-content"
					label="Descripción"
					v-model="model.description"
					></v-text-field>
				</v-flex>
			</v-layout>
			<section class="fast-register-footer">
				<modal-sidebar-button
				:is-loading="$v.model.$invalid || checkBlankCode(model.code)"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="createArea"
				/>
			</section>
		</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { required } from 'vuelidate/lib/validators';
import groupTable from '@/shared/group-table';

function validations() {
	return {
		model: {
			code: { required },
			name: { required },
		},
	};
}

function created() {
	if (this.id) {
		this.loadArea();
	}
}

function closeModal() {
	this.$emit('close');
}

async function loadArea() {
	try {
		const response = await this.urlLoadData('get', groupTable.AreasCompany, null, this.id);
		this.model.name = response.data.name || '';
		this.model.code = response.data.code || '';
		this.model.description = response.data.description || '';
	} catch (error) {
		this.showGenericError();
	}
}

async function createArea() {
	const method = this.id ? 'patch' : 'post';
	const message = this.id ? 'crear' : 'actualizo';
	try {
		await this.urlLoadData(method, groupTable.AreasCompany, null, this.id, this.model);
		this.showNotification(`Área se ${message} correctamente`);
		this.closeModal();
		this.$emit('update');
	} catch (error) {
		if (error.data.message === 'GROUP_EXISTS') {
			this.showGenericError('Código ya existe');
		} else {
			this.showGenericError();
		}
	}
}

function data() {
	return {
		model: {
			code: null,
			name: null,
			description: '',
		},
	};
}

export default {
	name: 'create-area',
	data,
	created,
	props: {
		id: {
			type: [String, Number],
		},
	},
	validations,
	components: {
		modalSidebarButton,
	},
	methods: {
		loadArea,
		createArea,
		closeModal,
	},
};
</script>
