<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12 title>
				¿Desea eliminar el producto {{ productName }}?
			</v-flex>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					@cancel-button-clicked="$emit('on-close')"
					@accept-button-clicked="$emit('on-delete')"
				/>
			</section>
		</v-layout>
	</div>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	export default {
		name: 'delete-product-form',
		components: {
			modalSidebarButton,
		},
		props: {
			productName: String,
		},
	};
</script>
