<template>
	<div>
		<v-layout
			class="detail-header"
			:class="true ? 'silver-detail-bg' : 'primary'"
			row
			wrap
			align-center
			white--text
			justify-space-between
			@click.stop="toogleBoddy"
		>
			<!-- HEADER CARD -->
			<v-flex :class="point.orders && point.orders.total ? 'xs8' : 'xs10'">
				<v-layout row wrap align-center>
					<v-flex class="xs1 pl-2 mr-2 mt-2">
						<v-checkbox
							hide-details
							color="success"
							v-model="selecteds"
							@click.stop="stopClick"
							@change="$emit('row-is-selected', point)"
						></v-checkbox>
					</v-flex>
					<v-flex :class="true ? 'xs9 pl-2' : 'xs12 pl-2'">
						<label class="header-text small-text green-text" style="display: flex; align-items: center;">
							{{ fullNameCustomer(point) }}
							<v-tooltip bottom v-if="hasInvalidLocation">
								<v-icon slot="activator" color="warning" small class="ml-1">warning</v-icon>
								<span>Sin ubicación en el mapa</span>
							</v-tooltip>
						</label>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex v-if="isOrder">
				<v-layout>
					<v-flex xs5 class="ml-5">
						<span class="header-text" :class="{ 'medium-text green-text': true }">
							{{ point.orders.currencySymbol || 'S/' }}
							{{ point.orders.total | round }}
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex
				pr-2
				:class="true ? 'xs4' : 'xs1 header-border-left'"
				text-xs-right
				v-if="$route.name !== 'route-history-detail'"
			>
			</v-flex>
		</v-layout>
		<!-- BODDY CARD -->
		<v-layout row wrap white pa-2 class="order-detail-card" v-if="showBody">
			<v-flex xs12 pb-2 class="order-detail-body">
				<v-layout row wrap class="body-header">
					<!-- FECHA -->
					<v-flex xs6 px-2 class="pb-1" v-if="point.dateSimple">
						<label class="body-header-label small-text"> Fecha: </label>
						<span class="body-header-value small-text">
							{{ point.dateSimple }}
						</span>
					</v-flex>
					<!-- ESTADO -->
					<v-flex xs6 px-2 class="pb-1">
						<label class="body-header-label small-text"> Estado: </label>
						<span class="body-header-value small-text">
							{{ getStatus(point) }}
						</span>
					</v-flex>

					<!-- N° DE PEDIDO -->
					<v-flex xs6 px-2 class="pb-1" v-if="isOrder">
						<label class="body-header-label small-text"> Nro de pedido: </label>
						<span class="body-header-value small-text">
							{{ point.orders.documentNumber || 'point.number' }}
						</span>
					</v-flex>
					<v-flex xs6 px-2 class="pb-1">
						<label class="body-header-label small-text"> Vendedor: </label>
						<span class="body-header-value small-text">
							{{ point.employee.fullname }}
						</span>
					</v-flex>
					<!-- CONVERTIDO A -->
					<v-flex xs6 px-2 class="pb-1" v-if="isOrder">
						<label class="body-header-label small-text"> Convertido a: </label>
						<span class="body-header-value small-text">
							{{
								point.orders.documentNumberRelate
									? point.orders.documentNumberRelate
									: '-'
							}}
						</span>
					</v-flex>
					<v-flex xs6 px-2 class="pb-1" v-if="isOrder">
						<label class="body-header-label small-text"> Peso: </label>
						<span class="body-header-value small-text">
							{{ point.orders.weight }} Kg
						</span>
					</v-flex>
					<v-flex xs12 px-2 class="pb-1" v-if="point.comment">
						<label class="body-header-label small-text"> Comentario: </label>
						<span class="body-header-value small-text">
							{{ point.comment || '-' }}
						</span>
					</v-flex>
					<v-flex xs12 px-2 class="pb-1">
						<label class="body-header-label small-text"> Dirección: </label>
						<span class="body-header-value small-text">
							{{ getAddress(point) }}
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import orderProductsTable from '@/components/orders/order-products-table';
import TypePickUp from '@/shared/type-pick-up';
import OrderDeliveryStates from '@/shared/order-delivery-states';

function created() {
	this.homePickUp = this.pointflagPickUp === TypePickUp.HomeDelivery;
	this.storePickUp = this.pointflagPickUp === TypePickUp.PickUpStore;
}

function collapse() {
	if (this.list) {
		this.$emit('expand-body', this.order);
	}
}

function getEmployee() {
	// if (pointemployee) {
	// 	if (pointemployee.fullname) {
	// 		return pointemployee.fullname;
	// 	}
	// 	return '---';
	// }
	return '---';
}

// function showBody() {
// 	return (this.list && this.expandBody) || !this.list;
// }

function isFlowNew() {
	return !!this.$route.query.from;
}

function getTitleCard() {
	if (this.$route.query.from === 'pick-up-earrings') {
		return this.pointcommerce.name;
	}
	return this.pointcustomerName;
}

function getAddressCard() {
	if (this.$route.query.from === 'pick-up-earrings') {
		return this.pointdeliveryJson.pickUpPoint.addressLine;
	}
	return this.pointdeliveryJson.deliveryPoint.addressLine;
}

function data() {
	return {
		showBody: false,
		selecteds: [],
		columns: [
			{
				id: 1,
				name: 'Nombre',
				value: 'productName',
			},
			{
				id: 2,
				name: 'Unidad',
				value: 'unitName',
			},
			{
				id: 3,
				name: 'Cantidad',
				value: 'quantity',
			},
		],
		homePickUp: false,
		storePickUp: false,
	};
}

export default {
	name: 'route-detail-card',
	components: {
		orderProductsTable,
	},
	computed: {
		// showBody,
		isFlowNew,
		getTitleCard,
		getAddressCard,
		isOrder() {
			return this.code === 'order';
		},
		hasInvalidLocation() {
			const addr = this.point.customerAddress || this.point.customersAddress;
			if (!addr) return true;
			if (addr.latitude === null || addr.longitude === null) return true;
			if (isNaN(Number(addr.latitude)) || isNaN(Number(addr.longitude))) return true;
			return false;
		},
	},
	created,
	data,
	methods: {
		collapse,
		getEmployee,
		fullNameCustomer(point) {
			if (point.customerAddress && point.customerAddress.customer) {
				return point.customerAddress.customer.typePerson.fullName || '';
			}
			if (point.customer && point.customer.typePerson) {
				return point.customer.typePerson.fullName || '';
			}
			return '';
		},
		toogleBoddy() {
			this.showBody = !this.showBody;
		},
		getStatus({ orders }) {
			if (orders) {
				return orders.additionalInfo && orders.additionalInfo.deliveryState
					? OrderDeliveryStates[orders.additionalInfo.deliveryState]
					: 'No asignado';
			}
			return 'No asignado';
		},
		getAddress(point) {
			if (point.customerAddress) {
				return point.customerAddress.addressLine1;
			}
			if (point.customersAddress) {
				return point.customersAddress.addressLine1;
			}
			return 'No especificada';
		},
	},
	props: {
		checkAll: {
			default: false,
			type: Boolean,
		},
		checkAllDisabled: {
			default: false,
			type: Boolean,
		},
		expandBody: {
			default: false,
			type: Boolean,
		},
		list: {
			default: false,
			type: Boolean,
		},
		point: {
			default: () => {},
			type: Object,
		},
		code: {
			default: 'check-in',
			type: String,
		},
	},
};
</script>

<style lang="scss" scoped>
.detail-header {
	height: 50px;
}

.header-border-left {
	border-left: 1px solid color(white);
}

.body-header {
	background-color: color(background-modal);
	border: 1px solid color(silver-detail);
	border-radius: 4px;

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

.order-detail-card {
	border: 1px solid color(silver-detail) !important;
	border-bottom-left-radius: 10px;
	border-bottom-right-radius: 10px;
}

.order-detail-body {
	border: 1px solid color(silver-detail);
	border-radius: 4px;
}

.body-table {
	min-height: 250px;
}

.order-detail-footer {
	color: color(silver-footer);
	font-family: font(lato-regular);
	font-size: size(small13);
}

.silver-detail-bg {
	background-color: color(background-modal) !important;
	border: 1px solid color(silver-detail) !important;
	cursor: pointer !important;
}

.green-text {
	color: color(background-sidebar) !important;
}

.small-text {
	font-size: size(small) !important;
}

.medium-text {
	font-size: size(small13) !important;
	font-family: font(lato-bold);
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
