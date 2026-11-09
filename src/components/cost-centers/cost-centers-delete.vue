<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12 px-2 mb-1 title>
				¿Desea eliminar el centro de costos {{ name }}?
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="loading"
				@cancel-button-clicked="$emit('on-close')"
				@accept-button-clicked="$emit('on-delete')"
			/>
		</section>
	</div>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	export default {
		name: 'cost-centers-delete',
		components: {
			modalSidebarButton,
		},
		props: {
			id: [Number, String],
			loading: {
				default: false,
				type: Boolean,
			},
			name: String,
		},
	};
</script>
