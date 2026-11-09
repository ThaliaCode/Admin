<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12 title>
				¿Desea eliminar la sección {{ name }} del listado?
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="loading"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('on-delete')"
			/>
		</section>
	</div>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	export default {
		name: 'section-delete-form',
		components: {
			modalSidebarButton,
		},
		props: {
			name: String,
			loading: {
				default: false,
				type: Boolean,
			},
		},
	};
</script>
