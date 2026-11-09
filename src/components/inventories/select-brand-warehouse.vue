<template>
	<div>
		<div class="px-3 my-2 layout">
			<img src="/static/icon/alert.svg" alt="info" height="20px">
			<p class="mb-0 ml-3 text--information">Para hacer el calculo de stock y costo promedio es necesario que 
				seleccionar {{ labelWarehouse() }} y Marca del producto
			</p>
		</div>
		<v-layout wrap pa-3>
			<v-flex xs12 mb-2 v-if="warehouses.length > 1">
				<app-select
					:item="model.warehouseId"
					:items="warehouses"
					item-text="name"
					item-value="id"
					:label="labelWarehouse(true)"
					model="warehouseId"
					:return-object="false"
					@input="setData"
				></app-select>
			</v-flex>
			<v-flex xs12 v-if="brands.length > 1">
				<app-select
					:item="model.brandId"
					:items="brands"
					item-text="name"
					item-value="id"
					label="Marcas"
					model="brandId"
					:return-object="false"
					@input="setData"
				></app-select>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="!model.brandId || !model.warehouseId"
				@accept-button-clicked="$emit('send-information', model)"
				@cancel-button-clicked="$emit('close')"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function data() {
	return {
		model: {
			warehouseId: null,
			brandId: null,
		},
	};
}

function setData({ model, value }) {
	this.model[model] = value;
}

function created() {
	if (this.brands.length === 1) {
		this.model.brandId = this.brands[0].id;
	}
	if (this.warehouses.length === 1) {
		this.model.warehouseId = this.warehouses[0].id;
	}
}

export default {
	name: 'select-brand-warehouse',
	data,
	methods: {
		setData,
	},
	components: {
		modalSidebarButton,
	},
	created,
	props: {
		warehouses: {
			default: () => [],
			type: Array,
		},
		brands: {
			default: () => [],
			type: Array,
		},
	},
};
</script>
<style lang="scss" scoped>
.text--information {
	color: color(paginationText);
	font-size: 14px;
}
</style>