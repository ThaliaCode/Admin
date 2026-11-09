<template>
	<div class="pt-2">
		<app-table
			name="pending-orders-list"
			:check-all="checkAll"
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			disabled-value="isDisabled"
			include-filter
			:last-page="lastPage"
			:padding="padding"
			:rows="rows"
			:selectable="isIcon"
			:items-quantity="rows.length"
			:items-total-quantity="
				this.$route.name === 'pending-orders-list' ? totalOrders : rows.length
			"
			:row-red="true"
			:input-search="this.$route.name === 'pending-orders-list'"
			:is-button="this.$route.name === 'pending-orders-list'"
			@on-column-sortable="$emit('column-sortable', $event)"
			@on-page="$emit('on-page', $event)"
			@on-search-event="$emit('on-search', $event)"
			@on-selected-all="$emit('on-selected-all', $event)"
			@row-is-selected="$emit('row-is-selected', $event)"
			@table-option-event="$emit('open-filter')"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="border-left">
					{{ props.row.createdAt | formatDate('DD/MM/YYYY HH:mm:ss') }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{
						(props.row.additionalInfo && props.row.additionalInfo.zoneName) ||
						'-'
					}}
				</td>
				<td v-show="showRow(columns, 3)">
					{{
						props.row.customerAddress && props.row.customerAddress.parish
							? props.row.customerAddress.parish.name
							: '--'
					}}
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.customer.typePerson.fullName }}
				</td>
				<td v-show="showRow(columns, 5)">
					<v-tooltip top>
						<span slot="activator"> PED </span>
						<span> Pedido </span>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 6)">
					<span>
						{{ props.row.documentNumber || props.row.number }}
					</span>
				</td>
				<td v-show="showRow(columns, 7)">
					<template v-if="props.row.document && props.row.document.length > 0">
						<span mt-2 v-for="(item, index) in props.row.document" :key="index">
							<a :href="`/sales/convert/${item.id}`" target="_blank">{{
								item.documentNumber
							}}</a
							><br />
						</span>
					</template>
					<template v-else> - </template>
				</td>
				<td v-show="showRow(columns, 26)">
					{{ props.row.number || '--' }}
				</td>
				<td v-show="showRow(columns, 8)">
					{{ props.row.currency }} {{ props.row.total | round }}
				</td>
				<td v-show="showRow(columns, 9)">
					<v-tooltip top>
						<span slot="activator" class="uppercase">
							{{ props.row.paymentTypeCode }}
						</span>
						<span>
							{{ props.row.paymentTypeName }}
						</span>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 10)">
					{{ props.row.user ? props.row.user.fullname : '-' }}
				</td>
				<td v-show="showRow(columns, 11)">
					<template v-if="props.row.documentNumber">
						{{
							props.row.routeName ||
							(props.row.route && props.row.route.name) ||
							'-'
						}}
					</template>
					<template v-else> - </template>
				</td>
				<td v-show="showRow(columns, 12)">
					<v-tooltip top>
						<span slot="activator" class="uppercase">
							{{ props.row.pickUpCode }}
						</span>
						<span>
							{{ props.row.pickUpName }}
						</span>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 13)">
					<span>
						{{ props.row.deliveryDate }}
					</span>
				</td>
				<td v-show="showRow(columns, 14)">
					<v-tooltip top>
						<span class="content-type" slot="activator">
							{{ labelTransport(props.row) }}
						</span>
						<span>
							{{ tooltipTranport(props.row) }}
						</span>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 15)">
					{{
						props.row.transportAgency ? props.row.transportAgency.name : '--'
					}}
				</td>
				<td v-show="showRow(columns, 16)">
					<span>
						{{ props.row.orderState ? props.row.orderState.name : undefined }}
					</span>
				</td>
				<td v-show="showRow(columns, 17)">
					<document-state
						:color="props.row.paymentStateColor"
						:tooltip="props.row.paymentStateName"
						@click-state="$emit('open-slide-state', props.row)"
					/>
				</td>
				<td v-show="showRow(columns, 18)">
					{{ props.row.delivery ? props.row.delivery.fullname : '--' }}
				</td>
				<td v-show="showRow(columns, 19)">
					{{ props.row.employee ? props.row.employee.fullname : '--' }}
				</td>
				<td v-show="showRow(columns, 20)">{{ props.row.weight || 0 }}</td>
				<td v-show="showRow(columns, 21)">
					<span
						v-if="
							$userInfo.company.settings.flagTypeOriginOrder &&
							$route.name === 'pending-orders-list'
						"
					>
						{{ props.row.referenceExternal || '-' }}
					</span>
					<span v-else>
						{{ props.row.originPlatformName || '-' }}
					</span>
				</td>
				<td v-show="showRow(columns, 22)">{{ props.row.comments || '-' }}</td>
				<td v-show="showRow(columns, 23)">{{ props.row.routeSort }}</td>
				<td v-show="showRow(columns, 24)">{{ props.row.deliveryAddress ? props.row.deliveryAddress.addressLine1 : (props.row.customerAddress ? props.row.customerAddress.address : '-') }}</td>
				<td v-show="showRow(columns, 25)">
					<app-tooltip-button
						icon="remove_red_eye"
						text="Ver Detalle"
						color="success"
						size="20"
						@click-icon="
							$emit('click-icon', {
								action: 'view-detail-order',
								row: props.row,
							})
						"
					/>
					<app-tooltip-button
						v-if="
							props.row.customerAddress
								? !props.row.customerAddress.latitude &&
								  !props.row.customerAddress.longitude
								: true
						"
						color="error"
						icon="report_problem"
						text="Este pedido no cuenta con localización de la dirección del cliente,
						no se podra visualizar en el mapa."
					/>
					<app-tooltip-button
						icon="call_split"
						text="Cambiar de estado a Confirmado"
						color="success"
						size="20"
						v-if="props.row.orderStateId === 1"
						@click-icon="
							$emit('click-icon', { action: 'change-state', row: props.row })
						"
					/>
					<!-- <app-tooltip-button
						:icon-rotate="props.row.arrowDirection"
						class="mr-2"
						color="success"
						text="Ver Detalle"
						icon="forward"
						@click-icon="$emit('click-icon', { action: 'show-detail', row: props.row })"
					/> -->
					<app-tooltip-button
						text="Liberar"
						icon="store"
						color="blue"
						:disabled="props.row.orderPickState !== 5"
						@click-icon="
							$emit('click-icon', { action: 'quit', row: props.row })
						"
					/>
					<app-tooltip-button
						v-if="isIcon"
						:disabled="props.row.orderStateId !== 1"
						class="mr-2"
						text="Editar"
						icon="edit"
						@click-icon="
							$emit('click-icon', { action: 'edit', row: props.row })
						"
					/>
					<app-tooltip-button
						v-if="isIcon"
						color="error"
						text="Anular"
						icon="not_interested"
						@click-icon="
							$emit('click-icon', { action: 'cancel', row: props.row })
						"
					/>
					<app-tooltip-button
						v-if="isIcon"
						text="Descargar Pedido"
						icon="save_alt"
						color="primary"
						@click-icon="$emit('click-icon', { action: 'download-order', row: props.row })"
					/>
					<app-tooltip-button
						text="Editar Información del Pedido"
						icon="public"
						color="success"
						@click-icon="$emit('open-edit-order', props.row)"
					/>
					<app-tooltip-button
						v-if="props.row.flagSale === 1"
						icon="open_in_new"
						text="Ver Detalle de la Venta"
						color="success"
						size="20"
						@click-icon="$emit('detail-sale', props.row)"
					/>
					<app-tooltip-button
						v-if="isDebt(props.row)"
						icon="arrow_forward"
						text="Ver Detalle de la Deuda"
						color="success"
						size="20"
						@click-icon="$emit('open-debt', props.row)"
					/>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import documentState from '@/components/shared/document-state';

function getEmployee(order) {
	if (order.employee) {
		if (order.employee.fullname) {
			return order.employee.fullname;
		}
		return '---';
	}
	return '---';
}

function labelTransport({ transportAgencyId }) {
	return transportAgencyId ? 'AT' : 'RP';
}

function tooltipTranport({ transportAgencyId }) {
	return transportAgencyId ? 'Agencia de Transporte' : 'Reparto Propio';
}

function idDocument({ saleDocument, additionalInfo }) {
	if (additionalInfo.saleDocumentId) {
		return additionalInfo.saleDocumentId;
	}
	return saleDocument.id;
}

export default {
	name: 'pending-orders-list',
	components: {
		appTable,
		documentState,
	},
	methods: {
		getEmployee,
		idDocument,
		labelTransport,
		tooltipTranport,
		isDebt(row) {
			const isCusDebt = Object.keys(row.customer.debtsSales).length === 0;
			return !isCusDebt;
		},
	},
	props: {
		isIcon: {
			default: true,
			type: Boolean,
		},
		arrowDirection: {
			default: false,
			type: Boolean,
		},
		checkAll: {
			default: false,
			type: Boolean,
		},
		cleanSearch: {
			default: false,
			type: Boolean,
		},
		columns: {
			default: () => [],
			type: Array,
		},
		currentPage: Number,
		lastPage: Number,
		totalOrders: Number,
		padding: {
			default: 'px-4',
			type: String,
		},
		rows: {
			default: () => [],
			type: Array,
		},
	},
};
</script>
<style lang="scss" scoped>
.uppercase {
	text-transform: uppercase !important;
}

.border-left {
	border-right: 1px solid #979797 !important;
}

.content-type {
	background-color: color(primary);
	border-radius: 4px;
	color: white;
	font-family: font(open-bold);
	font-size: 10px;
	padding: 4px 6px;
}
</style>
