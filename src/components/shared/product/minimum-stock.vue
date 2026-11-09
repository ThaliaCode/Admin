<template>
	<div class="pa-3">
		<v-layout row wrap>
			<v-flex xs4>
				<p class="stock-label">Stock actual:</p>
			</v-flex>
			<v-flex xs2>
				<span class="stock-value">{{ product.stock }}</span>
			</v-flex>
		</v-layout>
		<v-layout>
			<v-flex xs4>
				<p class="stock-label">Sin Stock mínimo:</p>
			</v-flex>
			<v-flex xs4>
				<v-checkbox v-model="withOutStock"></v-checkbox>
			</v-flex>
		</v-layout>
		<v-layout row wrap>
			<v-flex xs4>
				<p class="stock-label">Stock mínimo:</p>
			</v-flex>
			<v-flex xs4>
				<v-text-field
					type="number"
					v-model.number="model.stock"
					single-line
					hide-details
					:disabled="withOutStock"
					class="filter-select shadow-inset-table"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="applyFilter" />
		</section>
	</div>
</template>

<script>
	import modalSidebarButton from './../utils/modal-sidebar-button';

	function created() {
		this.model.stock = this.product.minStock;
		this.withOutStock = this.model.stock === null;
	}

	function applyFilter() {
		const newStock = this.model.stock || 0;
		this.$emit('config-minimum-stock', newStock);
	}

	function closeModal() {
		this.model.stock = 0;
		this.$emit('cancel-modal');
	}

	function withOutStock(val) {
		if (val) {
			this.model.stock = null;
		}
	}

	function data() {
		return {
			withOutStock: false,
			model: {
				stock: 0,
			},
		};
	}

	function disabledInput() {
		return this.withOutStock;
	}

	export default {
		name: 'minimum-stock',
		components: {
			modalSidebarButton,
		},
		computed: {
			disabledInput,
		},
		created,
		data,
		methods: {
			applyFilter,
			closeModal,
		},
		props: {
			product: {
				default: () => {},
				type: Object,
			},
		},
		watch: {
			withOutStock,
		},
	};
</script>

<style lang="scss" scoped>
	.stock {
		&-label {
			color: map-get($map: $colors, $key: paginationText);
			font-family: map-get($map: $fonts, $key: open-regular);
			font-size: 13px;
		}

		&-value {
			color: black;
			font-family: map-get($map: $fonts, $key: open-semibold);
			font-size: 13px;
		}
	}
</style>