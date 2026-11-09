<template>
	<div>
		<v-tabs v-model="active" color="primary" right slider-color="blue darken-1">
			<v-tab href="#tab-sales" class="caption white--text"> Ventas </v-tab>
			<!-- SE REQUIRIÓ NO MOSTRAR DEVOLUCIONES -->
			<!-- <v-tab href="#tab-refund" class="caption white--text">
				Devoluciones
			</v-tab> -->
			<v-tab href="#tab-products" class="caption white--text">
				Productos
			</v-tab>
			<v-tab-item id="tab-sales">
				<customers-details-sales :customer-id="customerId" />
			</v-tab-item>
			<!-- <v-tab-item id="tab-refund">
				<customers-details-refund
					:customer-id="customerId"
				/>
			</v-tab-item> -->
			<v-tab-item id="tab-products">
				<customers-details-products :customer-id="customerId" />
			</v-tab-item>
		</v-tabs>
	</div>
</template>

<script>
import customersDetailsProducts from './customers-details-products';
// import customersDetailsRefund from './customers-details-refund';
import customersDetailsSales from './customers-details-sales';

function data() {
	return {
		active: null,
	};
}

export default {
	name: 'customers-details',
	components: {
		customersDetailsProducts,
		// customersDetailsRefund,
		customersDetailsSales,
	},
	data,
	props: {
		customerId: [Number, String],
	},
};
</script>
