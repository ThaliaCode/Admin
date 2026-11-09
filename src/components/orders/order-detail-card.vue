<template>
	<div>
		<v-layout
			class="detail-header"
			:class="list ? 'silver-detail-bg' : 'primary'"
			row
			wrap
			align-center
			white--text
			justify-space-between
			@click.stop="collapse"
		>
			<v-flex xs5>
				<v-layout row wrap align-center>
					<v-flex v-if="list" xs3 pl-2>
						<v-checkbox
							v-if="$route.name === 'pending-orders-map'"
							hide-details
							:disabled="order.isDisabled"
							color="success"
							v-model="order.isSelected"
							@click.stop="stopClick"
							@change="$emit('row-is-selected', order)"
						></v-checkbox>
					</v-flex>
					<v-flex :class="list ? 'xs9 pl-1' : 'xs12 pl-2'">
						<label
							v-if="
								$route.name === 'pending-routes-map' ||
								$route.name === 'route-history-detail'
							"
							class="header-text"
							:class="{ 'small-text green-text': list }"
						>
							{{
								order.customer.typePerson
									? order.customer.typePerson.fullName
									: ''
							}}
						</label>
						<label
							v-if="$route.name === 'route-history-detail'"
							class="header-text"
							:class="{ 'small-text green-text': list }"
						>
							{{ order.fullName }}
						</label>
						<label
							v-else-if="isFlowNew"
							class="header-text"
							:class="{ 'small-text green-text': list }"
						>
							{{ getTitleCard }}
						</label>
						<label
							v-else
							class="header-text name-client"
							:class="{ 'small-text green-text': list }"
						>
							{{ order.customerName }}
						</label>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex
				:class="list ? 'xs3 pr-2' : 'xs6 pr-3'"
				text-xs-right
				v-if="$route.name === 'pending-routes-map'"
			>
				<v-layout row wrap align-center>
					<v-flex xs5>
						<template v-if="homePickUp">
							<app-tooltip-button
								height="28"
								img="/static/img/home-delivery.svg"
								:text="order.pickUpName"
							></app-tooltip-button>
						</template>
						<template v-if="storePickUp">
							<app-tooltip-button
								height="28"
								img="/static/img/pick-up-store.svg"
								:text="order.pickUpName"
							></app-tooltip-button>
						</template>
					</v-flex>
					<v-flex xs7>
						<span
							class="total-detail"
							:class="{ 'medium-text green-text': list }"
						>
							{{ order.currencySymbol }} {{ order.total | round }}
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex v-if="$route.name === 'route-history-detail'">
				<v-layout>
					<v-flex xs5 class="ml-5">
						<label
							class="header-text"
							:class="{ 'medium-text green-text': list }"
						>
							Total:
						</label>
						<span
							class="header-text"
							:class="{ 'medium-text green-text': list }"
						>
							{{ order.currencySymbol }} {{ order.total | round }}
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex
				pr-2
				:class="list ? 'xs4' : 'xs1 header-border-left'"
				text-xs-right
				v-if="$route.name !== 'route-history-detail'"
			>
				<template v-if="list && !isFlowNew">
					<span
						class="px-1"
						v-if="
							!order.customerAddress.latitude ||
							!order.customerAddress.longitude
						"
					>
						<app-tooltip-button
							color="error"
							icon="report_problem"
							text="Este pedido no cuenta con localización de la dirección del cliente,
							no se podra visualizar en el mapa."
						/>
					</span>
					<v-tooltip top>
						<v-btn
							slot="activator"
							color="primary"
							class="btn-action btn-auto px-2 py-2 mr-1"
						>
							{{ order.transportAgencyId ? 'AT' : 'RP' }}
						</v-btn>
						<span>
							{{
								order.transportAgencyId
									? 'Agencia Transporte'
									: 'Reparto Propio'
							}}
						</span>
					</v-tooltip>
					<v-btn
						v-if="$route.name === 'pending-orders-map'"
						class="btn-action btn-auto px-2 py-2 mr-2"
						color="success"
						:disabled="order.orderPickState !== 5"
						@click.stop="$emit('click-icon', { action: 'quit', row: order })"
					>
						Liberar
					</v-btn>
				</template>
				<template v-else>
					<v-btn
						flat
						depressed
						class="btn-auto ma-0"
						@click="$emit('close-detail')"
					>
						<img src="/static/img/close-icon.svg" height="16" />
					</v-btn>
				</template>
			</v-flex>
		</v-layout>
		<v-layout row wrap white pa-2 class="order-detail-card" v-if="showBody">
			<v-flex
				xs12
				pb-2
				class="order-detail-body"
				v-if="
					$route.name === 'route-history-detail' ||
					$route.name === 'pending-orders-map'
				"
			>
				<v-layout row wrap class="body-header">
					<v-flex xs6 px-2 :class="{ 'pb-1': !list }">
						<label class="body-header-label" :class="{ 'small-text': list }">
							Fecha:
						</label>
						<span class="body-header-value" :class="{ 'small-text': list }">
							{{ order.createdAt | exactDate }}
						</span>
					</v-flex>
					<v-flex
						xs6
						px-2
						:class="{ 'pb-1': !list }"
						v-if="$route.name === 'route-history-detail'"
					>
						<label class="body-header-label" :class="{ 'small-text': list }">
							Hora:
						</label>
						<span class="body-header-value" :class="{ 'small-text': list }">
							{{ order.createdAt | exactTime }}
						</span>
					</v-flex>
					<v-flex v-if="list" xs6 px-2 :class="{ 'pb-1': !list }">
						<label class="body-header-label" :class="{ 'small-text': list }">
							Estado:
						</label>
						<span class="body-header-value" :class="{ 'small-text': list }">
							{{ getStatus }}
						</span>
					</v-flex>
					<v-flex v-if="list" xs6 px-2 :class="{ 'pb-1': !list }">
						<label class="body-header-label" :class="{ 'small-text': list }">
							Tipo Doc.:
						</label>
						<span class="body-header-value" :class="{ 'small-text': list }">
							{{ order.documentTypeName || 'Pedido' }}
						</span>
					</v-flex>
					<v-flex
						xs12
						px-2
						:class="{ 'pb-1': !list }"
						v-if="$route.name === 'route-history-detail'"
					>
						<label class="body-header-label" :class="{ 'small-text': list }">
							Nro de documento:
						</label>
						<span class="body-header-value" :class="{ 'small-text': list }">
							{{ order.documentNumber }}
						</span>
					</v-flex>
					<v-flex xs6 px-2 :class="{ 'pb-1': !list }">
						<label class="body-header-label" :class="{ 'small-text': list }">
							Nro de pedido:
						</label>
						<span class="body-header-value" :class="{ 'small-text': list }">
							{{ order.number }}
						</span>
					</v-flex>
					<v-flex v-if="list" xs12 px-2 :class="{ 'pb-1': !list }">
						<label class="body-header-label" :class="{ 'small-text': list }">
							Tipo de Entrega:
						</label>
						<span class="body-header-value" :class="{ 'small-text': list }">
							{{ order.pickUpName }}
						</span>
					</v-flex>
					<v-flex
						xs12
						px-2
						:class="{ 'pb-1': !list }"
						v-if="$route.name === 'route-history-detail'"
					>
						<label class="body-header-label" :class="{ 'small-text': list }">
							Almacén:
						</label>
						<span class="body-header-value" :class="{ 'small-text': list }">
							{{ order.warehouseName }}
						</span>
					</v-flex>
					<v-flex
						xs12
						px-2
						:class="{ 'pb-1': !list }"
						v-if="$route.name === 'pending-orders-map'"
					>
						<label class="body-header-label" :class="{ 'small-text': list }">
							Ubigeo:
						</label>
						<span
							v-if="isFlowNew"
							class="body-header-value"
							:class="{ 'small-text': list }"
						>
							{{ getAddressCard }}
						</span>
						<span
							v-else
							class="body-header-value"
							:class="{ 'small-text': list }"
						>
							{{ order.addressCustomer }}
						</span>
					</v-flex>
					<v-flex
						xs12
						px-2
						v-if="!isFlowNew && $route.name === 'pending-orders-map'"
					>
						<label class="body-header-label" :class="{ 'small-text': list }">
							Vendedor:
						</label>
						<span class="body-header-value" :class="{ 'small-text': list }">
							{{ getEmployee(order) }}
						</span>
					</v-flex>
					<v-flex
						xs12
						px-2
						v-if="!isFlowNew && $route.name === 'pending-orders-map'"
					>
						<label class="body-header-label" :class="{ 'small-text': list }">
							Agencia de Transporte:
						</label>
						<span class="body-header-value" :class="{ 'small-text': list }">
							{{ order.transportAgency ? order.transportAgency.name : '---' }}
						</span>
					</v-flex>
					<v-flex
						xs5
						px-2
						:class="{ 'pb-1': !list }"
						v-if="$route.name === 'pending-orders-map'"
					>
						<label class="body-header-label" :class="{ 'small-text': list }">
							Departamento:
						</label>
						<span class="body-header-value" :class="{ 'small-text': list }">
							{{
								order.deliveryAddress && order.deliveryAddress.city
									? order.deliveryAddress.city.name
									: null
							}}
						</span>
					</v-flex>
					<v-flex
						v-if="list && $route.name === 'pending-orders-map'"
						xs7
						px-2
						:class="{ 'pb-1': !list }"
					>
						<label class="body-header-label" :class="{ 'small-text': list }">
							Provincia:
						</label>
						<span class="body-header-value" :class="{ 'small-text': list }">
							{{
								order.deliveryAddress && order.deliveryAddress.province
									? order.deliveryAddress.province.name
									: null
							}}
						</span>
					</v-flex>
					<v-flex
						v-if="list && $route.name === 'pending-orders-map'"
						xs12
						px-2
						:class="{ 'pb-1': !list }"
					>
						<label class="body-header-label" :class="{ 'small-text': list }">
							Distrito:
						</label>
						<span class="body-header-value" :class="{ 'small-text': list }">
							{{
								order.deliveryAddress && order.deliveryAddress.parish
									? order.deliveryAddress.parish.name
									: null
							}}
						</span>
					</v-flex>
				</v-layout>
				<v-layout
					row
					wrap
					align-content-start
					align-start
					:class="{ 'body-table': !list }"
				>
					<v-flex
						xs12
						px-2
						pt-1
						pb-1
						v-if="$route.name === 'pending-orders-map'"
					>
						<label class="body-header-label" :class="{ 'small-text': list }">
							Productos:
						</label>
					</v-flex>
					<v-flex xs12 v-if="$route.name === 'pending-orders-map'">
						<order-products-table
							:check-all="checkAll"
							:check-all-disabled="checkAllDisabled"
							:columns="columns"
							:rows="order.details"
						></order-products-table>
					</v-flex>
				</v-layout>
				<v-layout
					v-if="!isTwoDrivers"
					row
					wrap
					px-2
					align-center
					:class="{ 'pt-2': list }"
					class="order-detail-footer"
				>
					<v-flex xs6 text-xs-left>
						<img src="/static/img/whatsapp.svg" alt="" height="20" />
						<span class="pl-2">{{ order.customerWhatsapp }}</span>
					</v-flex>
					<v-flex xs6 text-xs-right>
						<img src="/static/img/call.svg" alt="" height="20" />
						<span class="pl-2">{{
							order.customerPhone || order.customer ? order.customer.phone : ''
						}}</span>
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
	this.homePickUp = this.order.flagPickUp === TypePickUp.HomeDelivery;
	this.storePickUp = this.order.flagPickUp === TypePickUp.PickUpStore;
}

function collapse() {
	if (this.list) {
		this.$emit('expand-body', this.order);
	}
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

function showBody() {
	return (this.list && this.expandBody) || !this.list;
}

function isFlowNew() {
	return !!this.$route.query.from;
}

function getTitleCard() {
	if (this.$route.query.from === 'pick-up-earrings') {
		return this.order.commerce.name;
	}
	return this.order.customerName;
}

function getAddressCard() {
	if (this.$route.query.from === 'pick-up-earrings') {
		return this.order.deliveryJson.pickUpPoint.addressLine;
	}
	return this.order.deliveryJson.deliveryPoint.addressLine;
}

function getStatus() {
	const { deliveryState } = this.order.additionalInfo;
	return deliveryState
		? OrderDeliveryStates[deliveryState] || 'No asignado'
		: 'No asignado';
}

function data() {
	return {
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
	name: 'order-detail-card',
	components: {
		orderProductsTable,
	},
	computed: {
		showBody,
		isFlowNew,
		getTitleCard,
		getAddressCard,
		getStatus,
	},
	created,
	data,
	methods: {
		collapse,
		getEmployee,
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
		order: {
			default: () => {},
			type: Object,
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
