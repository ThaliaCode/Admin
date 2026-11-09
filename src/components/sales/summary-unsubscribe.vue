<template>
	<div>
		<v-layout px-4 py-4>
			<v-flex xs12>
				<v-text-field
					no-resize
					multi-line
					single-line
					class="textarea-content filter-select shadow-inset"
					name="new-product-description"
					label="Comentario"
					v-model="commentary"
				></v-text-field>
				<span class="form-group__message" v-if="!$v.commentary.required">
					El comentario es requerido
				</span>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('send-summary', commentary)"
			/>
		</section>
	</div>
</template>
<script>
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function validations() {
	return {
		commentary: { required },
	};
}

function data() {
	return {
		commentary: null,
	};
}

export default {
	name: 'summary-unsubscribe',
	data,
	components: {
		modalSidebarButton,
	},
	validations,
};
</script>