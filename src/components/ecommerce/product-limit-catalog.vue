<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					label="Cantidad de productos en catálogo"
					class="filter-select shadow-inset"
					type="number"
					v-model="quantity"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="!quantity"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('change-limit-product', quantity, commerce.id)">
			</modal-sidebar-button>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function data() {
	return {
		quantity: null,
	};
}

function created() {
	if (this.commerce.settings) {
		if (this.commerce.settings.limitCatalog) {
			this.quantity = this.commerce.settings.limitCatalog;
		}
	}
}

export default {
	name: 'product-limit-catalog',
	created,
	data,
	components: {
		modalSidebarButton,
	},
	props: {
		commerce: {
			type: Object,
			default: () => {},
		},
	},
};
</script>