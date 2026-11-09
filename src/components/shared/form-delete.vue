<template>
	<div>
		<v-form method="post" @submit.prevent="deleteRegister">
			<delete-confirm :name="name" :message="message" />
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:success-text="successText"
					success-color="error"
					@cancel-button-clicked="cancel"
					@accept-button-clicked="deleteRegister"
				/>
			</section>
		</v-form>
	</div>
</template>

<script>
	import deleteConfirm from './delete-confirm';
	import modalSidebarButton from './../shared/utils/modal-sidebar-button';

	function cancel() {
		this.$emit('cancel');
	}

	function deleteRegister() {
		this.$emit('delete-register');
	}

	export default {
		name: 'form-delete',
		components: {
			deleteConfirm,
			modalSidebarButton,
		},
		methods: {
			cancel,
			deleteRegister,
		},
		props: {
			message: {
				type: String,
			},
			name: {
				type: String,
			},
			successText: {
				default: 'Eliminar',
				type: String,
			},
		},
	};
</script>
