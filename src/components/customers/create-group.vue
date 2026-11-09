<template>
  <div>
		<v-layout pa-3 wrap align-center>
			<v-flex xs12>
				<v-text-field
				class="filter-select shadow-inset mt-4"
				label="Nombre de grupo"
				v-model="group.name"
				></v-text-field>
				<span class="form-group__message" v-if="$v.group.name.$invalid">
					El nombre es requerido.
				</span>
			</v-flex>
			<v-flex xs12>
				<v-text-field
				class="filter-select shadow-inset mt-4"
				label="Código"
				v-model="group.code"
				></v-text-field>
				<span class="form-group__message" v-if="$v.group.code.$invalid">
					El código es requerido.
				</span>
				<span
					class="text-not-code-blank"
					v-if="checkBlankCode(group.code)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<v-flex xs12 v-if="!isDelivery">
				<v-text-field
				class="filter-select shadow-inset mt-4"
				label="Descripción"
				v-model="group.description"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
			:is-loading="$v.$invalid || checkBlankCode(group.code)"
			success-text="Guardar"
			@cancel-button-clicked="cancelModal"
			@accept-button-clicked="createGroup"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { required } from 'vuelidate/lib/validators';

function cancelModal() {
	this.$emit('cancel-modal');
}

function createGroup() {
	this.$emit('create-group');
}

function validations() {
	return {
		group: {
			name: {
				required,
			},
			code: {
				required,
			},
		},
	};
}

export default {
	name: 'create-group',
	components: {
		modalSidebarButton,
	},
	methods: {
		cancelModal,
		createGroup,
	},
	props: {
		group: {
			type: Object,
			default: () => {},
		},
		isDelivery: {
			type: Boolean,
			default: false,
		},
	},
	validations,
};
</script>