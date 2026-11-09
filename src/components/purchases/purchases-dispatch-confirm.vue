<template>
	<section>
		<delete-confirm
			message="¿Está seguro que desea recepcionar esta compra?"
			:name="`${purchase.details.length} productos serán ingresados al inventario`"
		>
		</delete-confirm>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="isLoading"
				@cancel-button-clicked="$emit('cancel-button-clicked')"
				@accept-button-clicked="$emit('dispatch', purchase)"
			>
			</modal-sidebar-button>
		</section>
	</section>
</template>

<script>
import deleteConfirm from '@/components/shared/delete-confirm';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

export default {
	name: 'purchases-dispatch-confirm',
	components: {
		deleteConfirm,
		modalSidebarButton,
	},
	props: {
		purchase: {
			default: () => {},
			type: Object,
		},
		isLoading: {
			default: false,
			type: Boolean,
		},
	},
};
</script>
