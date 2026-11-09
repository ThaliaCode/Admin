<template>
 <!-- tabla con productos -->
	<v-layout wrap>
		<v-flex v-if="!changesSent" py-3 px-4><p>¿Está seguro que desea cambiar el estado de los siguientes pedidos de <b>{{ confirmationText() }}</b>?</p></v-flex>
		<v-flex v-if="changesSent" py-3 px-4><p>Pedidos actualizados:</p></v-flex>
		<v-flex>
			<ecommerce-orders-list
				:columns="columns"
				:rows="dataSelected"
				:disabled-search="true"
				:showTotalOrders="false"
				:selectable="false"
				:showUpdateStatus="true"
				@view-error="viewError"
			/>
		</v-flex>
		<!-- <v-flex v-if="updateErrors.length > 0" py-3 px-4 >
			<p>Se produjeron errores al actualizar {{ updateErrors.length }} pedidos. </p>
			<div v-for="error in updateErrors" :key="error"> 
				<p v-if="error.orderResponse.message !== 'ORDER_STOCK_NOT_ENOUGH'">- N. Ped.: {{ error.number }}: {{ error.orderResponse.message }} - {{ error.orderResponse.messageError }}</p>
			</div>
		</v-flex> -->
		<v-flex v-if="errorMessage !== ''" py-3 px-4>
			<div class="errorMessage">
				<p v-if="error === 'ORDER_STOCK_NOT_ENOUGH'"> No hay stock suficiente de los productos: {{ productsWithError }}.</p>
				<p v-else>{{ errorMessage }}</p>
			</div>
		</v-flex>
		<section v-if="!changesSent" class="modal-filter-footer pa-2">
				<modal-sidebar-button
					success-text="Confirmar"
					@cancel-button-clicked="$emit('close-modal')"
					@accept-button-clicked="acceptAction"
				/>
		</section>
	</v-layout>
</template>

<script>
import ecommerceOrdersList from '@/components/ecommerce/ecommerce-orders-list';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function data() {
	return {
		changesSent: false,
		columns: [
			{
				id: 1,
				name: 'N. Ped.',
				tooltip: 'Número de Pedido',
				value: 'number',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'T. Despacho',
				tooltip: 'Tienda de Despacho',
				value: 'warehouseName',
				checked: true,
				visible: false,
			},
			{
				id: 3,
				name: 'Cliente',
				value: 'customerFullName',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Teléfono',
				value: 'responsiblePhone',
				checked: true,
				visible: false,
			},
			{
				id: 5,
				name: 'Dirección',
				value: 'addressLine',
				checked: true,
				visible: false,
			},
			{
				id: 6,
				name: 'F. Creación',
				value: 'createdAt',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'F. Entrega',
				value: 'deliveryDate',
				checked: true,
				visible: false,
			},
			{
				id: 8,
				name: 'T. Envío',
				value: 'pickUpName',
				checked: true,
				visible: false,
			},
			{
				id: 9,
				name: 'Origen',
				value: 'originPlatformName',
				checked: true,
				visible: false,
			},
			{
				id: 10,
				name: 'M. Pago',
				tooltip: 'Medio de Pago',
				value: 'wayPaymentName',
				checked: true,
				visible: false,
			},
			{
				id: 11,
				name: 'E. del Pedido',
				tooltip: 'Estado del Pedido',
				value: 'orderStateName',
				checked: true,
				visible: true,
			},
			{
				id: 12,
				name: 'Repartidor',
				value: 'deliveryFullName',
				checked: true,
				visible: false,
			},
			{
				id: 13,
				name: 'Monto',
				value: 'total',
				checked: true,
				visible: true,
			},
			{
				id: 14,
				name: 'Costo de Envió',
				value: 'costShipping',
				checked: true,
				visible: false,
			},
			{
				id: 15,
				name: 'E. de Pago',
				tooltip: 'Estado de Pago',
				value: 'paymentStateName',
				checked: true,
				visible: true,
			},
			{
				id: 16,
				name: 'Tipo de Documento',
				value: 'flagBillString',
				checked: true,
				visible: false,
			},
			{
				id: 17,
				name: 'Pago',
				value: 'flagApprovalString',
				checked: true,
				visible: false,
			},
			{
				id: 18,
				name: 'Gen. Venta',
				checked: true,
				visible: false,
				value: 'flagSale',
				tooltip: 'Generada desde una venta',
			},
			{
				id: 19,
				name: 'Est. Kardex',
				checked: false,
				visible: false,
				value: 'flagSale',
				tooltip: 'Estado de Kardex',
			},
			{
				id: 20,
				name: 'Empleado',
				checked: false,
				visible: false,
				value: 'employeeName',
			},
			{
				id: 21,
				name: 'Comentario',
				checked: false,
				visible: false,
				value: 'comments',
			},
			{
				id: 22,
				name: 'Peso',
				checked: true,
				visible: false,
				value: 'weight',
			},
			{
				id: 23,
				name: 'Acciones',
				value: 'actions',
				checked: true,
				visible: true,
				flagVisible: true,
			},
			// {
			// 	id: 11,
			// 	name: 'Comercio',
			// 	value: 'commerceName',
			// 	checked: true,
			// 	visible: true,
			// },
		],
		newState: '',
		errorMessage: '',
		error: '',
		productsWithError: '',
	};
}

function acceptAction() {
	this.$emit('update-state-orders', this.dataSelected.map(o => o.id), this.newState);
	// ocultar botones de footer
	this.changesSent = true;
}

function confirmationText() {
	const orderStateCode = this.dataSelected[0].orderState.code;
	if (orderStateCode === 'REQUESTED') {
		this.newState = 'CONFIRMED';
		return 'SOLICITADO a CONFIRMADO';
	}	else if (orderStateCode === 'CONFIRMED') {
		this.newState = 'READY_TO_DELIVER';
		return 'CONFIRMADO a LISTO PARA RECOGER';
	}	else if (orderStateCode === 'READY_TO_DELIVER') {
		if (this.dataSelected[0].flagPickUp === 2) {
			this.newState = 'IN_ROAD';
			return 'LISTO PARA RECOGER a EN CAMINO';
		}
	} else if (orderStateCode === 'IN_ROAD') {
		this.newState = 'GIVEN';
		return 'EN CAMINO a ENTREGADO';
	}
	return '?? a ??';
}

function viewError(id) {
	const order = this.dataSelected.find(d => d.id === id);
	this.errorMessage = order.messageError;
	this.error = order.message;
	if (this.error === 'ORDER_STOCK_NOT_ENOUGH') {
		this.productsWithError = order.orderResponse.details.map(d => d.name).join(', ');
	}
}

export default {
	name: 'slider-update-state-orders',
	components: {
		ecommerceOrdersList,
		modalSidebarButton,
	},
	props: {
		updateErrors: {
			default: () => [],
			type: Array,
		},
		dataSelected: {
			default: () => [],
			type: Array,
		},
		currentOrderStateId: {
			default: 0,
			type: Number,
		},
	},
	data,
	methods: {
		acceptAction,
		confirmationText,
		viewError,
	},
};
</script>

<style lang="scss" scoped>
.errorMessage {
	border: 1px solid red;
	padding: 10px;
	border-radius: 10px;
	background-color: rgba(255, 0, 0, 0.1);
	margin-top: -150px;
}
</style>