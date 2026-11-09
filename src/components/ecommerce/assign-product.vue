<template>
  <div class="pt-4 px-4">
		<v-flex xs12>
			<app-select
				:item="idFair"
				model="idFair"
				item-text="name"
				item-value="id"
				:items="fairs"
				label="Feria"
				@input="setIdFair"
			></app-select>
		</v-flex>
		<v-flex class="products-selected" mt-3>
			Productos Seleccionados:
		</v-flex>
		<v-flex mt-4 px-4>
			<ul v-for="(item, index) in productsSelected" :key="index">
				<li class="products-selected">{{ item.name }}</li>
			</ul>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="saveModal(productsSelected)"
			/>
		</section>
	</div>  
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function setIdFair({ value }) {
	this.$emit('set-fair', value.id);
}

function saveModal(productsSelected) {
	this.$emit('save-modal', productsSelected);
}

function disabled() {
	return this.idFair === null;
}

export default {
	name: 'assign-product',
	components: {
		modalSidebarButton,
	},
	computed: {
		disabled,
	},
	methods: {
		saveModal,
		setIdFair,
	},
	props: {
		fairs: {
			default: () => [],
			type: Array,
		},
		productsSelected: {
			default: () => [],
			type: Array,
		},
		idFair: [String, Number],
	},
};
</script>

<style lang="scss" scoped>
.products-selected {
	color: #4a4a4a;
	font-family: map-get($fonts, open-semibold);
}
</style>