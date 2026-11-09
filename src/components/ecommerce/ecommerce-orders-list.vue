<template>
	<section class="overflow-auto">
		<app-table
			class="is-not-selectable"
			name="orders"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			:items-quantity="rows.length"
			:items-total-quantity="itemQuantity"
			:check-all="checkAll"
			:row-red="true"
			:disabled-search="disabledSearch"
			:selectable="selectable"
			include-filter
			dispatch-detail
			disabled-value="flagApproval"
			@on-page="$emit('on-page', $event)"
			@row-is-selected="$emit('row-is-selected', $event)"
			@on-selected-all="$emit('on-selected-all', $event)"
			@on-search-event="$emit('on-search', $event)"
			@table-option-event="$emit('table-option-event', $event)"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">
					{{ props.row.documentNumber }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.warehouseName }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.customerFullName }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.responsiblePhone }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.addressLine }}</td>
				<td v-show="showRow(columns, 6)">
					{{ props.row.createdAt | formatDate('DD/MM/YYYY HH:mm:ss') }}
				</td>
				<td v-show="showRow(columns, 7)">
					{{ props.row.deliveryDate || '-' }}
				</td>
				<td v-show="showRow(columns, 8)">{{ props.row.pickUpName }}</td>
				<td v-show="showRow(columns, 9)">{{ originOrder(props.row) }}</td>
				<td v-show="showRow(columns, 10)">
					{{ props.row.wayPaymentDetailName || props.row.wayPaymentDetailCode }}
				</td>
				<td v-show="showRow(columns, 11)">
					<v-tooltip top>
						<span slot="activator" class="uppercase">
							{{ props.row.paymentTypeCode }}
						</span>
						<span>
							{{ props.row.paymentTypeName }}
						</span>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 12)">{{ props.row.orderStateName }}</td>
				<td v-show="showRow(columns, 13)">{{ props.row.deliveryFullName }}</td>

				<td v-show="showRow(columns, 14)">{{ props.row.total | round }}</td>
				<td v-show="showRow(columns, 15)">
					{{ props.row.costShipping | round }}
				</td>
				<td v-show="showRow(columns, 16)">
					<document-state
						:color="props.row.paymentStateColor"
						:tooltip="props.row.paymentStateName"
						@click-state="$emit('open-slide-state', props.row)"
					/>
				</td>
				<td v-show="showRow(columns, 17)">
					<template v-if="props.row.document && props.row.document.length > 0">
						<span mt-2 v-for="(item, index) in props.row.document" :key="index">
							<a :href="`/sales/convert/${item.id}`" target="_blank">{{
								item.documentNumber
							}}</a
							><br />
						</span>
					</template>
					<template v-else> {{ getSalesDocument(props.row).toUpperCase() }} </template>
				</td>
				<td v-show="showRow(columns, 18)">
					{{ props.row.priceChangeStatusName }}
				</td>
				<td v-show="showRow(columns, 19)">
					<document-state
						:color="getColor(props.row)"
						:tooltip="props.row.flagApprovalString"
					/>
				</td>
				<td v-show="showRow(columns, 20)">
					<document-state
						:color="getColorSale(props.row)"
						:tooltip="labelGeneratedSale(props.row)"
					/>
				</td>
				<td v-show="showRow(columns, 21)">
					<document-state
						:color="getKardexStatus(props.row).color"
						:tooltip="getKardexStatus(props.row).tooltip"
					/>
				</td>
				<td v-show="showRow(columns, 22)">
					{{ props.row.employee ? props.row.employee.fullname : '' }}
				</td>
				<td v-show="showRow(columns, 23)">{{ props.row.comments || '' }}</td>
				<td v-show="showRow(columns, 24)">{{ props.row.weight || 0 }}</td>
				<td v-show="showRow(columns, 25)">
					<v-btn
						v-if="false"
						type="button"
						class="change-document-btn"
						:ripple="false"
						@click="editOrder(props.row)"
					>
						<img :src="`${$imageUrl}/editar.svg`" class="align-img" />
					</v-btn>
					<app-tooltip-button
						v-if="!showUpdateStatus"
						:disabled="!props.row.flagApproval"
						text="Convertir a Documento de Venta"
						icon="content_paste_go"
						size="16"
						color="primary"
						@click-icon="duplicateSale(props.row)"
					/>
					<app-tooltip-button
						v-if="!showUpdateStatus"
						:disabled="disabledAction(props.row)"
						icon="call_split"
						:text="textLabelSate(props.row)"
						color="primary"
						size="20"
						@click-icon="$emit('change-state', props.row)"
					/>
					<app-tooltip-button
						v-if="showCancel(props.row) && !showUpdateStatus"
						icon="cancel_presentation"
						text="Cancelar pedido"
						color="error"
						size="20"
						:disabled="isStateGiven(props.row)"
						@click-icon="$emit('cancel-order', props.row)"
					/>
					<app-tooltip-button
						v-if="props.row.flagSale === 1 && !showUpdateStatus"
						icon="open_in_new"
						text="Ver Detalle de la Venta"
						color="primary"
						size="20"
						@click-icon="$emit('detail-sale', props.row)"
					/>
					<app-tooltip-button
						v-if="!showUpdateStatus"
						icon="remove_red_eye"
						text="Ver Detalle"
						color="primary"
						size="20"
						@click-icon="$emit('click-icon', props.row)"
					/>
					<app-tooltip-button
						v-if="
							$userInfo.company.settings.flagPriceListChangeApproval &&
							props.row.priceChangeStatus === 1
						"
						icon="price_check"
						text="Cambiar estado de Lista de Precio"
						color="warning"
						size="20"
						@click-icon="$emit('on-change-price-status', props.row)"
					/>
					<app-tooltip-button
						v-if="!showUpdateStatus"
						text="Editar Información del Pedido"
						icon="edit"
						color="primary"
						@click-icon="$emit('edit-order', props.row)"
					/>
					<app-tooltip-button
						v-if="showChangeVoucher(props.row) && !showUpdateStatus"
						icon="wifi_protected_setup"
						text="Cambiar estado de voucher"
						color="primary"
						size="20"
						@click-icon="$emit('change-voucher', props.row)"
					/>
					<app-tooltip-button
						v-if="
							!showUpdateStatus &&
							($userInfo.roleCode === 'SUPER_ADMIN' ||
								$userInfo.codeTypeRol === 'ADMIN') &&
							props.row.orderStateId === 2
						"
						icon="block_flipped"
						text="Liberar Pedido"
						color="error"
						size="20"
						@click-icon="$emit('order-release', props.row)"
					/>
					<v-tooltip v-if="!showUpdateStatus" top>
						<a
							slot="activator"
							@click.stop.prevent="downloadOrder(props.row)"
							class="table-icon"
						>
							<v-icon color="primary">save_alt</v-icon>
						</a>
						<span> Descargar Pedido </span>
					</v-tooltip>
					<app-tooltip-button
						v-if="showUpdateStatus && props.row.message && props.row.message !== ''"
						icon="error"
						text="Ver error"
						color="error"
						size="20"
						@click-icon="$emit('view-error', props.row.id)"
					/>
					<v-tooltip v-if="showUpdateStatus && props.row.message === ''" top>
						<a slot="activator">
							<v-icon color="primary">task_alt</v-icon>
						</a>
						<span> Actualizado </span>
					</v-tooltip>
				</td>
				<!-- <td v-show="showRow(columns, 11)">{{ props.row.commerceName }}</td> -->
			</template>
			<template v-if="showTotalOrders" slot="footerSemi">
				<td colspan="18" class="footer-table pt-2 pb-2"></td>
				<td class="footer-table--select pt-2 pb-2" colspan="3">
					<span class="footer-table--text">TOTAL DE PEDIDOS:</span>
					<span>{{ itemQuantity }}</span>
				</td>
			</template>
		</app-table>
		<app-show-dialog
			title-header="Convertir a Documento de Venta"
			:text-content="textModal"
			:show-modal-init="showModal"
			color-dialog="error"
			color-hex="#D5331A"
			@close-dialog="closeDialogModal"
		/>
	</section>
</template>

<script>
import appShowDialog from '@/components/shared/app-show-dialog';
import appTable from '@/components/shared/table/app-table';
import documentState from '@/components/shared/document-state';
import lib from '@/shared/lib';
// import typeStatusKardex from '@/shared/type-status-kardex';
import helper from '@/shared/helper';
import voucherStatus from '@/shared/voucher-status';

const { getDeeper } = lib;
const { showDownloadDialog, generateBlob } = helper;

function disabledAction({ orderState }) {
	const { code } = orderState;
	return code === 'GIVEN' || code === 'CANCELED';
}

function duplicateSale({ id, orderStateId, orderState }) {
	if (orderStateId === 1 || orderStateId === 8 || orderStateId === 4) {
		this.showModal = true;
		this.textModal = `Un pedido ${orderState.name} no puede ser convertido a documento de venta`;
	} else {
		this.goTo('new-sale', { query: { orderId: id } });
	}
}

function closeDialogModal() {
	this.showModal = false;
}

function editOrder({ id }) {
	this.goTo('edit-order', { params: { id } });
}

function getColor({ flagApproval }) {
	return flagApproval ? 'success' : 'error';
}

function originOrder({ referenceExternal, originPlatformName }) {
	const validated = this.$userInfo.company.settings.flagTypeOriginOrder;
	if (validated) {
		const origin =
			referenceExternal && referenceExternal.trim() ? referenceExternal : '--';
		return origin;
	}
	return originPlatformName;
}

function getSalesDocument(row) {
	const bill = getDeeper('flagBill')(row);
	if (this.isEcuador) {
		return bill ? 'Si' : 'No';
	}
	if (bill === 0 || bill === 1) {
		return row.flagBillString;
	}
	if (row.dataBill != null) {
		return row.documentNumberRelate;
	}
	return '-';
}

function isStateGiven({ orderState: { code } }) {
	return code === 'GIVEN';
}

function showCancel({ orderState: { code } }) {
	return code === 'REQUESTED' || code === 'CONFIRMED';
}

function openEditOrder(row) {
	this.action = {
		code: 'address-slide',
		title: 'Editar Informacion del Pedido',
		open: true,
		width: 500,
	};
	this.idOrder = row.id;
	const { deliveryPoint } = row.deliveryJson;
	this.informationOrder = deliveryPoint;
	this.informationOrder.address = deliveryPoint.addressLine;
}

function isStateCancel({ orderState: { code } }) {
	return code === 'CANCELED';
}

function textLabelSate({ orderState: { code } }) {
	if (code === 'GIVEN') {
		return 'El pedido ya fue entregado';
	} else if (code === 'CANCELED') {
		return 'El pedido fue anulado';
	}
	return 'Cambiar de estado';
}

function showChangeVoucher({ paymentMethodCode, additionalInfo }) {
	if (paymentMethodCode) {
		if (additionalInfo.flagVoucherState) {
			return Number(additionalInfo.flagVoucherState) === voucherStatus.Sent;
		}
		return false;
	}
	return false;
}

function labelGeneratedSale({ flagSale }) {
	return flagSale === 0 ? 'No generada' : 'Generada desde la venta';
}

function getColorSale({ flagSale }) {
	return flagSale === 0 ? 'error' : 'primary';
}

async function downloadOrder(row) {
	try {
		const body = { code: 'order-details-pdf' };
		const downloadDialog = this.$userInfo.company.settings.downloadSale;
		const responseType = 'blob';
		const contentType = downloadDialog ? 'application/pdf' : 'text/html';
		const { data: response } = await this.$httpSales.post(`orders/${row.id}/pdf`, body, {
			responseType,
		});
		const blob = generateBlob(response, contentType);
		this.showNotification('Se genero el reporte correctamente');
		showDownloadDialog(blob, 'Reporte de Pedido', downloadDialog);
	} catch (error) {
		this.showGenericError();
	}
}

function getKardexStatus(row) {
	let color = 'red';
	let tooltip = 'Pendiente de envió';
	if (row.sendKardexMessage) {
		color = row.sendKardexMessage.color;
		tooltip = row.sendKardexMessage.name;
	}
	return {
		color,
		tooltip,
	};
}

function data() {
	return {
		showModal: false,
		textModal: '',
	};
}

export default {
	name: 'ecommerce-orders-list',
	data,
	components: {
		appShowDialog,
		appTable,
		documentState,
	},
	methods: {
		closeDialogModal,
		disabledAction,
		downloadOrder,
		duplicateSale,
		editOrder,
		openEditOrder,
		getColor,
		getColorSale,
		getKardexStatus,
		getSalesDocument,
		isStateGiven,
		labelGeneratedSale,
		showCancel,
		isStateCancel,
		textLabelSate,
		showChangeVoucher,
		originOrder,
	},
	props: {
		currentPage: {
			type: Number,
			default: 0,
		},
		lastPage: {
			type: Number,
			default: 0,
		},
		checkAll: {
			type: Boolean,
			default: false,
		},
		itemQuantity: {
			type: Number,
			default: 0,
		},
		disabledSearch: {
			type: Boolean,
			default: false,
		},
		columns: {
			type: Array,
			default: () => [],
		},
		rows: {
			type: Array,
			default: () => [],
		},
		showTotalOrders: {
			type: Boolean,
			default: true,
		},
		selectable: {
			type: Boolean,
			default: true,
		},
		showUpdateStatus: {
			type: Boolean,
			default: false,
		},
	},
};
</script>
<style lang="scss" scoped>
.change-document-btn {
	background-color: transparent;
	box-shadow: none;
	height: auto;
	margin: 0px;
	min-width: auto;
}
</style>
