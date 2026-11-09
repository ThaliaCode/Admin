<template>
<div class="modal-detail-product">
	<v-layout pt-5>
		<v-tabs
			align-with-title
			color="transparent"
			centered
			dark
		 	v-model="active"
			slider-color="indigo lighten-5"
      >
				<v-tab
				class="tabs-detail"
				v-for="(item, index) in headers"
				:key="index"
				ripple
				>
				{{ item.name }}
				</v-tab>
			<v-tab-item>
				<v-layout row wrap>
					<v-card class="pa-4">
						<v-layout row wrap>
							<v-flex xs12 mb-2>
								<label class="item-modal">Nombre: <span class="ml-2">{{data.product.name}}</span></label>
							</v-flex>
							<v-flex xs12 mb-2>
								<label class="item-modal">Código: <span class="ml-2">{{data.product.code}}</span></label>
							</v-flex>
							<v-flex xs12 mb-2>
								<label class="item-modal">{{labelWarehouse()}}: <span class="ml-2">{{data.warehouse ? data.warehouse.name : null}}</span></label>
							</v-flex>
							<v-flex xs12 mb-2>
								<label class="item-modal">Cod. Barra: <span class="ml-2">{{data.product.autoBarcode}}</span></label>
							</v-flex>
							<v-flex xs12 mb-2>
								<label class="item-modal">Caracteristicas: <span class="ml-2">{{data.product.inlineFeatures}}</span></label>
							</v-flex>
							<v-flex xs12 mb-2>
								<label class="item-modal">Categorías: <span class="ml-2">{{data.product.category ? data.product.category.name : null}}</span></label>
							</v-flex>
							<v-flex xs12 mb-2>
								<label class="item-modal">Descripción: <span class="ml-2">{{data.product.description}}</span></label>
							</v-flex>
							<v-flex xs12 mb-2>
								<label class="item-modal">Ubicación: <span class="ml-2">{{data.location}}</span></label>
							</v-flex>
							<v-flex xs12 mb-2>
								<label class="item-modal">Marca: <span class="ml-2">{{data.brand ? data.brand.name : null}}</span></label>
							</v-flex>
							<v-flex xs12 mb-2>
								<label class="item-modal">Precio de Venta: <span class="ml-2">{{data.product.price}}</span></label>
							</v-flex>
							<v-flex xs12 mb-2>
								<label class="item-modal">Stock: <span class="ml-2">{{data.stock}}</span></label>
							</v-flex>
						</v-layout>
					</v-card>
				</v-layout>
			</v-tab-item>
		</v-tabs>
	</v-layout>
			<section class="modal-filter-footer">
			<modal-sidebar-button
				:hiddenSaveBtn="true"
				@cancel-button-clicked="closeModal"
			/>
		</section>
</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	const indexWarehouse = this.tabs.findIndex(p => p.value === 'warehouse');
	this.tabs[indexWarehouse].name = this.labelWarehouse();
}

function closeModal() {
	this.$emit('close-modal');
}

function data() {
	return {
		detail: [],
		active: null,
		headers: [
			{
				id: 1,
				name: 'DETALLE',
				href: '#detail',
			},
		],
		tabs: [
			{
				id: 1,
				name: 'Nombre',
			},
			{
				id: 2,
				name: 'Código',
			},
			{
				id: 3,
				name: 'Tienda',
				value: 'warehouse',
			},
			{
				id: 4,
				name: 'Cod. Barra',
			},
			{
				id: 5,
				name: 'Caracteristicas',
			},
			{
				id: 6,
				name: 'Categorías',
			},
			{
				id: 7,
				name: 'Descripción',
			},
			{
				id: 8,
				name: 'Ubicación',
			},
			{
				id: 9,
				name: 'Marca',
			},
			{
				id: 10,
				name: 'Precio de Venta',
			},
			{
				id: 11,
				name: 'Stock',
			},
		],
	};
}

export default {
	name: 'detail-product',
	created,
	methods: {
		closeModal,
	},
	components: {
		modalSidebarButton,
	},
	data,
	props: {
		data: {
			type: Object,
			default: () => {},
		},
	},
};
</script>

<style lang="scss" scoped>
.tabs-detail {
	background-color:map-get($colors, header) !important;
}

.tabs {
	background-color: map-get($colors, header);
	width:  100% !important;
}

.tabs__container {
	display: flex;
	height: 49px;
	justify-content: center;
}

.modal-detail-product {
	.tabs__item {
		.tabs__item--active {
			color: map-get($colors, white) !important;
		}
	}
}

.item-modal {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-semibold);
	font-size: 13px;
}

.tabs__item--active {
	color: map-get($colors, white);
}

.theme--light .card {
	background: map-get($colors, background-table);
}
</style>