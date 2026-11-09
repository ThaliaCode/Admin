<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
				label="Código"
				class="filter-select mt-3"
				:readonly="!!id"
				v-model="model.code">
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
				<v-text-field
				label="Nombre"
				class="filter-select mt-3"
				v-model="model.name">
			</v-text-field>
			<span class="form-group__message"
				v-if="$v.model.name.$invalid">
				El nombre es requerido.
			</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					textarea
					multi-line
					no-resize
					label="Descripción"
					v-model="model.description"
					class="filter-select mt-3 textarea-content">
				</v-text-field>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
			:is-loading="$v.model.$invalid || checkBlankCode(model.code)"
			@cancel-button-clicked="closeModal"
			@accept-button-clicked="createTypePerson">
		</modal-sidebar-button>
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

async function createTypePerson() {
	const method = this.id ? 'patch' : 'post';
	const message = this.id ? 'actualizó' : 'creó';
	try {
		await this.urlLoadData(method, groupTable.TypeStaff, null, this.id, this.model);
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
		this.loadData();
	}
}

async function loadData() {
	try {
		const response = await this.urlLoadData('get', groupTable.TypeStaff, null, this.id);
		this.model.name = response.data.name || '';
		this.model.code = response.data.code || '';
		this.model.description = response.data.description || '';
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		model: {
			code: '',
			name: '',
			description: '',
		},
	};
}
export default {
	name: 'create-type-person',
	data,
	methods: {
		closeModal,
		createTypePerson,
		loadData,
	},
	components: {
		modalSidebarButton,
	},
	created,
	props: {
		id: {
			type: [String, Number],
		},
	},
	validations,
};
</script>
