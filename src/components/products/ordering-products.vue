<template>
	<div class="px-4">
		<v-layout wrap mb-2 v-for="product in products" :key="product.id">
			<v-flex xs12 mb-3>
				<p class="mb-3">{{ product.name}}</p>
				<v-text-field
					class="filter-select"
					name="order"
					label="Orden"
					v-model="product.order"
					type="number"
				></v-text-field>
			</v-flex>
		</v-layout>

		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="false"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="saveProductOrdering"
			/>
		</section>

	</div>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function closeModal() {
		this.$emit('close-modal');
	}

	function reloadProducts() {
		this.$emit('reload');
	}

	async function saveProductOrdering() {
		const url = `commerce-company/assign-order/${this.commerceId}/commerce`;
		const body = this.buildBody();
		try {
			await this.$httpProducts.patch(url, body);
			this.closeModal();
			this.reloadProducts();
		} catch (error) {
			this.showNotification('no se pudieron actualizar los productos');
		}
	}

	function buildBody() {
		const productsOrder = this.products.map(p => ({
			productId: p.id,
			order: p.order || 0,
		}));

		return { productsOrder };
	}

	export default {
		name: 'ordering-products',
		components: {
			modalSidebarButton,
		},
		methods: {
			buildBody,
			closeModal,
			reloadProducts,
			saveProductOrdering,
		},
		props: {
			commerceId: [Number, String],
			products: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>

<style lang="scss"></style>
