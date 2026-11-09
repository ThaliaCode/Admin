<template>
	<div>
		<v-layout row wrap px-4 pt-4 pb-5 mb-5>
			<slot></slot>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:cancel-text="cancelText"
				:is-loading="isLoading"
				:img="showImage"
				:success-text="successText"
				@accept-button-clicked="$emit('accept-button')"
				@cancel-button-clicked="$emit('cancel-button')"
			></modal-sidebar-button>
		</section>
	</div>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	export default {
		name: 'filter-by-master',
		components: {
			modalSidebarButton,
		},
		props: {
			cancelText: {
				default: 'Cancelar',
				type: String,
			},
			isLoading: {
				default: false,
				type: Boolean,
			},
			showImage: {
				default: true,
				type: Boolean,
			},
			successText: {
				default: 'Guardar',
				type: String,
			},
		},
	};
</script>

<style lang="scss" scoped>

</style>