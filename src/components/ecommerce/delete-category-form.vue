<template>
    <div>
		<v-layout wrap pa-4>
			<v-flex xs12 title>
				¿Desea eliminar la categoría {{ name }}?
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('on-close')"
				@accept-button-clicked="$emit('on-delete')"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

export default {
	name: 'delete-category-form',
	components: {
		modalSidebarButton,
	},
	props: {
		name: String,
	},
};
</script>
