<template>
	<v-layout pa-4 wrap>
		<v-flex xs12 pa-3 class="section-tab-alert">
			<img
				src="/static/icon/alert.svg"
				alt="alerta"
				height="24px"
				class="mr-3"
			/>
			<label>
				El producto se mostrará en el catálogo si esta activo en el producto maestro
			</label>
		</v-flex>
		<v-flex xs12>
			<p>{{ flagShowCatalog ? 'Activados' : 'Desactivados'}}</p>
			<v-switch
				color="success"
				hide-details
				v-model="flagShowCatalog"
			></v-switch>
		</v-flex>
		<v-flex xs12>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					@cancel-button-clicked="$emit('close')"
					@accept-button-clicked="$emit('change-status-catalog', flagShowCatalog)"
				/>
			</section>
		</v-flex>
	</v-layout>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function data() {
	return {
		flagShowCatalog: false,
	};
}
export default {
	name: 'status-catalog',
	data,
	components: {
		modalSidebarButton,
	},
};
</script>
<style lang="scss" scoped>
	.section-tab {
		&-alert {
			background: color(green-opacity);
			color: color(background-sidebar);
			font-family: font(open-bold);
			font-size: size(medium);
		}
	}
</style>