<template>
	<div class="layout wrap align-start justify-center">
		<v-flex :class="toShow ? 'column-table active' : 'xs12'">
			<app-table
				name="purchases-list"
				selectable
				:indexes-cancel="indexesCancel"
				:columns="columns"
				:check-all="checkAll"
				:rows="rows"
				v-bind="$attrs"
				:items-quantity="rows.length"
				:items-total-quantity="totalQuantity"
				:disabled-search="disabledSearch"
				@on-page="$emit('on-page', $event)"
				@on-selected-all="$emit('on-selected-all', $event)"
				@row-is-selected="$emit('row-is-selected', $event)"
				@on-search-event="$emit('on-search', $event)"
				@on-toggle-columns="$emit('on-toggle-columns', $event)"
				@on-column-sortable="$emit('on-column-sortable', $event)"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.warehouseName }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.supplierName }}</td>
					<td v-show="showRow(columns, 3)">
						<v-tooltip top>
							<span slot="activator" class="primary--text semi-bold">{{
								props.row.typeDocumentCode
							}}</span>
							{{ props.row.typeDocument.name }}
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 4)">
						<span :class="getCancelClass(props.row)">
							{{ props.row.documentNumber }}
						</span>
					</td>
					<td v-show="showRow(columns, 5)">
						{{ props.row.typePaymentCodes.toUpperCase() }}
					</td>
					<td v-show="showRow(columns, 6)">{{ props.row.paymentName }}</td>
					<td v-show="showRow(columns, 7)">
						{{ props.row.dateDocument | exactDate('DD-MM-YYYY HH:mm:ss', true) }}
					</td>
					<td v-show="showRow(columns, 8)">{{ props.row.paymentStateName }}</td>
					<td v-show="showRow(columns, 9)">{{ props.row.accounted }}</td>
					<td v-show="showRow(columns, 10)" @click.stop="stopClick">
						<v-btn
							flat
							small
							color="red"
							:ripple="false"
							class="due-btn ma-0"
							@click="openDetail(props.row)"
						>
							<span class="text-underline">{{ props.row.dueAmount | round }}</span>
						</v-btn>
					</td>
					<td v-show="showRow(columns, 11)">
						{{ props.row.subTotal | round }}
					</td>
					<td v-show="showRow(columns, 12)">
						{{ getFlatTaxes(props.row) | round }}
					</td>
					<td v-show="showRow(columns, 13)">-{{ getRetentions(props.row) | round }}</td>
					<td v-show="showRow(columns, 14)">
						{{ props.row.currencySymbol }}
					</td>
					<td v-show="showRow(columns, 15)" v-if="showEntity">
						<v-tooltip top>
							<span
								:style="
									props.row.entityStateId === 4
										? 'background-color: #2abca4'
										: 'background-color: #f40029'
								"
								slot="activator"
								class="state-entity"
							>
								{{ props.row.entityStateId === 4 ? 'C' : 'SC' }}
							</span>
							<span>{{
								props.row.entityStateId === 4 ? 'Contabilizado' : 'Sin Contabilizar'
							}}</span>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 16)">
						<v-tooltip top>
							<v-icon slot="activator" :color="iconColor(props.row.sendKardexStatus)">
								radio_button_checked
							</v-icon>
							<span>{{ getKardexStatus(props.row.sendKardexStatus) }}</span>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 17)">
						<v-tooltip top>
							<v-icon slot="activator" :color="props.row.state.color">
								radio_button_checked
							</v-icon>
							<span>{{ props.row.state.description }}</span>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 18)">
						{{ props.row.createdAt | formatDate }}
					</td>
					<td v-show="showRow(columns, 19)">
						{{ getTotal(props.row) | round }}
					</td>
					<td v-show="showRow(columns, 20)">
						{{ (props.row.debtAmount || 0) | round }}
					</td>
					<td v-show="showRow(columns, 21)">
						{{ props.row.documentsRelated || '' }}
					</td>
					<td v-show="showRow(columns, 22)">
						<v-tooltip top>
							<v-icon
								slot="activator"
								:color="iconColorPrice(props.row.flagEditPriceSale)"
							>
								radio_button_checked
							</v-icon>
							<span>{{ getStatePrice(props.row.flagEditPriceSale) }}</span>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 23)">
						<app-tooltip-button
							:disabled="disabledConvertDocument(props.row)"
							:text="
								disabledConvertDocument(props.row)
									? 'No se puede volver a convertir el documento'
									: 'Convertir Documento'
							"
							icon="content_paste_go"
							@click-icon="$emit('create-document', props.row)"
						/>
						<app-tooltip-button
							v-if="
								isEditable(props.row) && $userInfo.additionalInformation
									? !($userInfo.additionalInformation.flagAllowEditingPurchases === false)
									: true
							"
							icon="edit"
							text="Editar"
							:disabled="props.row.flagUse === 1 || props.row.state.code === 'ANU'"
							@click-icon="openEdit(props.row)"
						>
						</app-tooltip-button>
						<app-tooltip-button
							:disabled="
								disabledDispatchMovement(props.row) || props.row.state.code === 'ANU'
							"
							color="blue"
							icon="transfer_within_a_station"
							text="Recepcionar"
							@click-icon="$emit('show-dispatch', props.row)"
						>
						</app-tooltip-button>
						<app-tooltip-button
							color="warning"
							icon="refresh"
							text="Actualizar Estado"
							:disabled="disabledByDocument(props.row) || props.row.state.code === 'ANU'"
							@click-icon="$emit('update-state', props.row)"
						>
						</app-tooltip-button>
						<app-tooltip-button
							color="purple"
							icon="list_all"
							text="Convertir Documento"
							:disabled="disabledConversion(props.row)"
							@click-icon="
								goTo('purchases-edit', {
									params: { id: props.row.id },
									query: { type: 'transform' },
								})
							"
						>
						</app-tooltip-button>
						<app-tooltip-button
							icon="remove_red_eye"
							text="Ver Detalle"
							color="info"
							size="20"
							@click-icon="goToDetail(props.row)"
						/>
						<app-tooltip-button
							icon="autorenew"
							text="Actualizar Kardex por compra"
							color="secondary"
							size="20"
							@click-icon="$emit('update-kardex', props.row)"
						/>
						<app-tooltip-button
							:icon="props.row.iconArrow"
							text="Ver Detalle En Tabla"
							color="success"
							size="20"
							@click-icon="setPurchase(props.row)"
						/>
						<v-btn
							v-if="props.row.typeDocument.code === 'LQC'"
							class="btn-auto"
							color="primary"
							small
							@click="$emit('open-dialog-sri', props.row)"
						>
							SRI
						</v-btn>
						<app-tooltip-button
							color="error"
							icon="delete"
							text="Eliminar"
							:disabled="props.row.flagUse === 1 || props.row.state.code === 'ANU'"
							@click-icon="$emit('delete-purchase', props.row)"
						/>
						<app-tooltip-button
							color="success"
							icon="edit_calendar"
							text="Editar periodo contable"
							@click-icon="$emit('edit-accounting-period', props.row)"
						/>
						<a
							slot="activator"
							@click.stop.prevent="$emit('download-pdf', props.row)"
							class="table-icon"
						>
							<v-icon color="primary">picture_as_pdf</v-icon>
						</a>
					</td>
				</template>
			</app-table>
		</v-flex>
		<transition name="fade-left" mode="out-in">
			<v-flex class="detail-in-table" :class="{ active: toShow }" v-show="toShow">
				<sales-details-in-table
					purchase
					:customer="currentPurchase.supplier"
					:date="currentPurchase.createdAt"
					:inline-products="inlineProducts"
					:sale="currentPurchase"
					:show-debt="false"
					@close-detail="closeDetail"
					@go-to-detail="goToDetail"
					@open-retention="$emit('open-retention', $event)"
				/>
			</v-flex>
		</transition>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import salesDetailsInTable from '@/components/sales/sales-details-in-table';

function disabledByDocument({ typeDocument, statusOrcId }) {
	return typeDocument.code !== 'ORC' || statusOrcId !== 1;
}

function disabledConversion({ typeDocument, statusOrcId }) {
	return !typeDocument.flagConvertDocument || statusOrcId !== 2;
}

function disabledConvertDocument({ flagUse, typeDocument, state }) {
	const flagNotLimitInORC = !!this.$userInfo.company?.settings?.flagNotLimitInORC;
	const isConverted = typeDocument?.flagConvertDocument === 1 && flagUse === 1;
	const isANU = state.code === 'ANU';
	const isORC = typeDocument.code === 'ORC';

	if (isORC && !flagNotLimitInORC) return false;

	return isConverted || isANU;
}

function openDetail(row) {
	this.$emit('open-detail', row);
}

function openEdit(row) {
	this.$emit('open-edit', row);
}

function stopClick() {
	return false;
}

function toggleColumns() {
	return true;
}

function setPurchase(row) {
	this.currentPurchase = { ...row };
	this.currentPurchase.supplier.fullName = row.supplier.commercialName;
	const namesArray = this.currentPurchase.details.map(
		(c) => `${c.product.name} (Cantidad: ${c.quantity})`
	);
	this.inlineProducts = namesArray.join(', ');
	this.rowDetailSelected = this.rowDetailSelected.id === row.id ? {} : { ...row };
	this.toShow = !!this.rowDetailSelected.id;
	this.rows.forEach((d) => {
		const arrow = d.id === row.id && this.toShow ? 'arrow_back' : 'arrow_forward';
		this.$set(d, 'iconArrow', arrow);
	});
	if (row.withholdingTaxActive) {
		this.currentPurchase.viewTax = row.withholdingTaxActive.details.reduce(
			(acum, item) => {
				const newAcum = [...acum];
				const index = acum.findIndex((a) => a.codeTax === item.codeTax);
				if (index > -1) {
					newAcum[index].amountTax += item.amountTax;
				} else {
					const newItem = {
						name: item.nameTax,
						amountTax: item.amountTax,
						codeTax: item.codeTax,
					};
					newAcum.push(newItem);
				}
				return newAcum;
			},
			[]
		);
	}
}

function getCancelClass({ state }) {
	return state.code === 'ANU' || state.code === 'ANUSUNAT' ? 'cancel-style-text' : '';
}

function closeDetail(row) {
	const rowSelected = this.rows.find((r) => r.id === row.id);
	this.$set(rowSelected, 'iconArrow', 'arrow_forward');
	this.currentPurchase = {
		supplier: {},
	};
	this.inlineProducts = '';
	this.rowDetailSelected = {};
	this.toShow = false;
}

function goToDetail(row) {
	const routeData = this.$router.resolve({
		name: 'purchase-detail',
		params: { id: row.id },
	});
	window.open(routeData.href, '_blank');
}

function getRetentions(purchase) {
	if (this.isEcuador) {
		if (purchase.withholdingTaxActive) {
			const {
				withholdingTaxActive: { details },
			} = purchase;
			const totalRetentions = details.reduce((acc, item) => acc + item.amountTax, 0);
			return totalRetentions;
		}
		return 0;
	}
	return 0;
}

function getFlatTaxes(purchase) {
	const { amount, subTotal } = purchase;
	const totalRetentions = this.getRetentions(purchase);
	return amount + totalRetentions - subTotal;
}

function isEditable(purchase) {
	if (this.isEcuador) {
		if (purchase.withholdingTaxActive) {
			const {
				withholdingTaxActive: { stateDocumentTax },
			} = purchase;
			return stateDocumentTax === 1;
		}
		return false;
	}
	return true;
}

function iconColor(status) {
	if (status === 2) {
		return 'warning';
	}
	return status === 3 ? 'success' : 'error';
}

function iconColorPrice(status) {
	if (status === 1) {
		return 'error';
	}
	return status === 2 ? 'success' : 'gray';
}

function getStatePrice(status) {
	if (status === 0) {
		return 'No tiene actualización precio';
	}
	return status === 1 ? 'Pendiente de actualizar' : 'Precio Actualizado';
}

function getKardexStatus(status) {
	if (status === 2) {
		return 'En proceso';
	}
	return status === 3 ? 'Enviado' : 'Pendiente';
}

function data() {
	return {
		currentPurchase: {
			supplier: {},
		},
		inlineProducts: '',
		toShow: false,
		rowDetailSelected: {},
	};
}

export default {
	name: 'purchases-list',
	components: {
		appTable,
		salesDetailsInTable,
	},
	data,
	inheritAttrs: false,
	methods: {
		toggleColumns,
		closeDetail,
		disabledByDocument,
		disabledConvertDocument,
		disabledConversion,
		getFlatTaxes,
		getKardexStatus,
		getStatePrice,
		getRetentions,
		goToDetail,
		iconColor,
		iconColorPrice,
		isEditable,
		openDetail,
		openEdit,
		setPurchase,
		stopClick,
		getCancelClass,
		getTotal(purchase) {
			return purchase.amount || 0;
			// return purchase.perception
			// 	? purchase.perception.totalPerception + purchase.amount
			// 	: purchase.amount || 0;
		},
	},
	props: {
		indexesCancel: {
			type: Array,
			default: () => [],
		},
		columns: {
			type: Array,
			default: () => [],
		},
		checkAll: {
			type: Boolean,
			default: false,
		},
		rows: {
			type: Array,
			default: () => [],
		},
		validateCurrency: {
			type: Boolean,
			default: false,
		},
		showEntity: {
			type: Boolean,
			default: false,
		},
		disabledSearch: {
			type: Boolean,
			default: false,
		},
		totalQuantity: {
			type: Number,
			default: 0,
		},
	},
};
</script>

<style lang="scss" scoped>
.cancel-style-text {
	text-decoration: line-through;
}
.due-btn {
	min-width: auto;
}

.text-underline {
	text-decoration: underline;
}

.detail-in-table {
	max-width: 364px;
}

.column-table {
	max-width: calc(100% - 364px);
}

.semi-bold {
	font-family: map-get($fonts, lato-regular);
	font-weight: 600;
}

.state-entity {
	border-radius: 4px;
	color: color(white);
	font-family: map-get($fonts, open-bold);
	padding: 3px 6px;
}
</style>
