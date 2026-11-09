<template>
<v-form method="post" @submit.prevent="$emit('save')">
		<v-layout wrap pt-3 px-2>
				<v-flex xs12 px-2>
					<app-input-text
							label="Nombre"
							model="name"
							:text="name"
							@input="$emit('set-data', $event)"
					/>
					<span class="form-group__message" v-if="!$v.name.required">
							El nombre de la unidad es requerido
					</span>
			</v-flex>
			<v-flex xs12 px-2 mt-2>
					<app-input-text
							label="Código"
							model="code"
							:text="code"
							@input="$emit('set-data', $event)"
					/>
					<span class="form-group__message" v-if="!$v.code.required">
							El código de la unidad es requerido
					</span>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
		<modal-sidebar-button
			:is-loading="$v.$invalid"
			@cancel-button-clicked="$emit('close-modal')"
			@accept-button-clicked="$emit('save')"
		/>
	</section>
</v-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function validations() {
	return {
		code: {
			required,
		},
		name: {
			required,
		},
	};
}

export default {
	name: 'brand-form',
	components: {
		modalSidebarButton,
	},
	props: {
		code: String,
		name: String,
	},
	validations,
};
</script>
