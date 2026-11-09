<template>
  <div>
    <v-layout px-4 column pt-4>
			<v-flex xs12 mt-3>
				<v-text-field
					id="comment"
					class="textarea-content filter-select shadow-inset"
					label="Comentario"
					textarea
					hide-details
					no-resize
					single-line
					v-model="cancel.commentary"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@accept-button-clicked="$emit('cancel-withholding')"
				@cancel-button-clicked="$emit('cancel-dialog')"
			/>
		</section>
  </div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

export default {
	name: 'cancel-withholding',
	components: {
		modalSidebarButton,
	},
	props: {
		cancel: {
			type: Object,
			default: () => {},
		},
	},
};
</script>
