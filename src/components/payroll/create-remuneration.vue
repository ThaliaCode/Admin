<template>
  <div>
		<v-layout wrap px-4 py-3>
			<v-flex  xs12 md12 pr-2 mb-3>
				<v-text-field
					class="filter-select shadow-inset mt-3"
					label="Código"
					hide-details
					:readonly="!!id"
					v-model="model.code"
				></v-text-field>
				<span
					class="text-not-code-blank"
					v-if="checkBlankCode(model.code)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<span class="form-group__message"
				v-if="$v.model.code.$invalid">
				El código es requerido.
			</span>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					hide-details
					class="filter-select shadow-inset mt-3"
					label="Nombre"
					v-model="model.name">
				</v-text-field>
			</v-flex>
			<span class="form-group__message"
				v-if="$v.model.code.$invalid">
				El nombre es requerido.
			</span>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					hide-details
					textarea
					multi-line
					class="filter-select shadow-inset textarea-content mt-3"
					label="Descripción"
					v-model="model.description"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.model.$invalid || checkBlankCode(model.code)"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="createRemuneration"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { required } from 'vuelidate/lib/validators';
import groupTable from '@/shared/group-table';

function closeModal() {
	this.$emit('close');
}

function data() {
	return {
		model: {
			code: '',
			description: '',
			name: '',
		},
	};
}

function validations() {
	return {
		model: {
			code: { required },
			name: { required },
		},
	};
}

async function createRemuneration() {
	const method = this.id ? 'patch' : 'post';
	const message = this.id ? 'actualizó' : 'creó';
	try {
		await this.urlLoadData(method, groupTable.TypeRemuneration, null, this.id, this.model);
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
	this.loadData();
}

async function loadData() {
	try {
		const response = await this.urlLoadData('get', groupTable.TypeRemuneration, null, this.id);
		this.model.name = response.data.name || '';
		this.model.code = response.data.code || '';
		this.model.description = response.data.description || '';
	} catch (error) {
		this.showGenericError();
	}
}


export default {
	data,
	name: 'create-remuneration',
	components: {
		modalSidebarButton,
	},
	created,
	methods: {
		closeModal,
		createRemuneration,
		loadData,
	},
	validations,
	props: {
		id: {
			type: [String, Number],
		},
	},
};
</script>