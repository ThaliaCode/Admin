<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12 pr-2 mb-3>
				<p class="text-center">¿Desea cerrar inventario {{inventory.name}}?</p>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="isLoading"
				@cancel-button-clicked="$emit('cancel-modal')"
				@accept-button-clicked="$emit('close-inventory', inventory.id)"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from './../utils/modal-sidebar-button';

export default {
	name: 'close-inventory',
	components: {
		modalSidebarButton,
	},
	props: {
		inventory: {
			type: [Object, Array],
			default: () => {},
		},
		isLoading: {
			default: false,
			type: Boolean,
		},
	},
};
</script>
<style lang="scss" scoped>
	.text-center {
		text-align: center;
	}
</style>

