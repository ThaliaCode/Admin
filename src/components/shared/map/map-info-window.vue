<template>
	<div class="content-info">
		<h5 class="customer" v-if="orderSelected.customer">
			{{ orderSelected.customer.name }} {{ orderSelected.customer.lastname }}
		</h5>
		<v-layout v-if="orderSelected" row wrap white pa-2>
			<v-flex xs12 pb-2>
				<v-layout row wrap class="body-header">
					<v-flex xs6 class="item-info" px-2 v-if="orderSelected.createdAt">
						<label class="body-header-label"> Fecha: </label>
						<span class="body-header-value">
							{{ orderSelected.createdAt | exactDate }}
						</span>
					</v-flex>
					<v-flex xs6 class="item-info" px-2>
						<label class="body-header-label"> Nro de pedido: </label>
						<span class="body-header-value">
							{{ getOrderNumber(orderSelected) }}
						</span>
					</v-flex>
					<v-flex xs6 class="item-info" px-2 v-if="getTotal(orderSelected)">
						<label class="body-header-label"> Total: </label>
						<span class="body-header-value">
							{{ orderSelected.currencySymbol }}
							{{ getTotal(orderSelected) | round }}
						</span>
					</v-flex>
					<v-flex xs6 class="item-info" px-2>
						<label class="body-header-label"> Estado: </label>
						<span class="body-header-value">
							{{ getStatus(orderSelected) }}
						</span>
					</v-flex>
					<v-flex xs12 class="item-info" px-2>
						<label class="body-header-label"> Tipo Doc.: </label>
						<span class="body-header-value">
							{{ orderSelected.documentTypeName || 'Pedido' }}
						</span>
					</v-flex>
					<v-flex xs12 class="item-info" px-2 v-if="orderSelected.pickUpName">
						<label class="body-header-label"> Tipo de Entrega: </label>
						<span class="body-header-value">
							{{ orderSelected.pickUpName }}
						</span>
					</v-flex>
					<v-flex xs12 class="item-info" px-2>
						<label class="body-header-label"> Vendedor: </label>
						<span class="body-header-value">
							{{ getEmployee(orderSelected) }}
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import OrderDeliveryStates from '@/shared/order-delivery-states';

function getStatus(order) {
	if (order && order.orderState) {
		const { name } = order.orderState;
		return name || '-';
	}
	if (order && order.orders && order.orders.additionalInfo) {
		const deliveryState = order.orders.additionalInfo.deliveryState;
		return deliveryState ? OrderDeliveryStates[deliveryState] : 'No asignado';
	}
	return 'No asignado';
}

function getEmployee(order) {
	if (order.employee) {
		if (order.employee.fullname) {
			return order.employee.fullname;
		}
		return '---';
	}
	return '---';
}

export default {
	name: 'map-info-window',
	methods: {
		getEmployee,
		getOrderNumber(order) {
			if (order && order.orders) {
				return order.orders.documentNumber;
			}
			return order.number || 'S/N';
		},
		getTotal(order) {
			if (order && order.orders) {
				return order.orders.total;
			}
			return order.total;
		},
		getStatus,
	},
	props: {
		orderSelected: {
			required: true,
			type: Object,
			default: () => ({}),
		},
	},
};
</script>

<style lang="scss" scoped>
.content-info {
	width: 300px;
}
.customer {
	font-size: size(small);
	color: color(background-sidebar);
}

.item-info {
	margin-bottom: 5px;
}

.body-header {
	background-color: color(background-modal);
	border: 1px solid color(silver-detail);
	border-radius: 4px;
	padding: 5px 0 5px 0;
	&-label {
		color: color(background-sidebar);
		font-family: font(lato-bold);
		font-size: size(small);
	}

	&-value {
		color: color(paginationText);
		font-family: font(lato-regular);
		font-size: size(small);
	}
}

.total-detail {
	background-color: white;
	color: color(primary);
	font-family: map-get($fonts, open-semibold);
	font-size: 13px;
	padding: 4px 9px;
}

.name-client {
	font-family: map-get($fonts, open-semibold);
	font-size: 12px;
}
</style>
