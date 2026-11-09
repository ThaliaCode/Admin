<template>
	<div class="table-kardex pb-4 mx-4 dev1">
		<div
			class="container-table dev2"
			:class="{ open: openAction, maxh: !showPagination }"
		>
			<div class="modal-caption" v-if="caption">
				<div class="modal-card">
					<p class="modal-card-caption">{{ caption }}</p>
				</div>
			</div>
			<table>
				<thead class="sticky-header">
					<tr class="header">
						<template v-if="!openAction">
							<th colspan="5" class="border-gray"></th>
						</template>
						<template>
							<th
								:colspan="showTotalKardex && showCostPrice ? 3 : showCostPrice ? 2 : 1"
								class="border-gray"
							>
								ENTRADA
							</th>
							<th
								:colspan="showTotalKardex && showCostPrice ? 3 : showCostPrice ? 2 : 1"
								class="border-gray"
							>
								SALIDAS
							</th>
							<th
								v-if="showTotalKardex"
								:colspan="!showCostPrice ? 1 : 3"
								class="border-gray px-2"
							>
								SALDOS POR ALMACÉN
							</th>
							<th class="border-gray"></th>
							<th class="header-big">
								<button
									class="btn-filter"
									type="button"
									v-if="$route.name === 'list-kardex-gen'"
									@click="openSlider"
								>
									<v-icon color="success">filter_list</v-icon>
								</button>
							</th>
						</template>
					</tr>
					<tr class="header">
						<template v-if="!openAction">
							<td class="sub-top header-small">Almacén</td>
							<td class="sub-top header-small">Fecha</td>
							<td class="sub-top header-small">
								<v-tooltip top>
									<span slot="activator">Ref.</span>
									<span>Referencia</span>
								</v-tooltip>
							</td>
							<template v-if="showDescription">
								<td colspan="2" class="sub-top header-small">
									<v-tooltip top>
										<span slot="activator">Descripción</span>
										<span>Descripción</span>
									</v-tooltip>
								</td>
							</template>
							<template v-else>
								<td class="sub-top header-small">
									<v-tooltip top>
										<span slot="activator">Tipo Mov.</span>
										<span>Tipo de Movimiento</span>
									</v-tooltip>
								</td>
								<td class="border-gray sub-top header-small">
									<v-tooltip top>
										<span slot="activator">Mod.</span>
										<span>Módulo</span>
									</v-tooltip>
								</td>
							</template>
						</template>
						<td class="sub-top header-small">Cant</td>
						<td class="sub-top header-small" v-if="showCostPrice">Costos</td>
						<td
							class="border-gray sub-top header-small"
							v-if="showTotalKardex && showCostPrice"
						>
							Total
						</td>
						<td class="sub-top header-small">Cant</td>
						<td class="sub-top header-small" v-if="showCostPrice">Costos</td>
						<td
							class="border-gray sub-top header-small"
							v-if="showTotalKardex && showCostPrice"
						>
							Total
						</td>
						<td
							class="sub-top header-small"
							v-if="showTotalKardex"
							:class="{ 'border-gray': byProduct }"
						>
							Cant
						</td>
						<td v-if="showTotalKardex && showCostPrice" class="sub-top header-small">
							Costos
						</td>
						<td
							v-if="showTotalKardex && showCostPrice"
							class="border-gray sub-top header-small"
						>
							Total
						</td>
						<td class="border-gray sub-top header-small">Despacho</td>
						<td class="sub-top header-small">Accion</td>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="item in rows"
						:key="item.id"
						class="row-kardex-table"
						:class="{
							'row-disabled': item.flagShowUser === 2,
							'row-in': item.quantityIn > 0,
							'row-out': item.quantityOut > 0,
						}"
					>
						<template v-if="!openAction">
							<td>
								{{ item.warehouse ? item.warehouse.name : null }}
							</td>
							<td>
								<p class="mb-1">
									{{ item.createdAt | formatDate('YYYY-MM-DD') }}
								</p>
								<p class="mb-0 date-small">
									{{
										item.documentTypeCode === 'IM'
											? getHourProp(item.dateBalance || item.createdAt)
											: getHourProp(item.createdAt)
									}}
								</p>
							</td>
							<td v-if="isLink(item.moduleName)">
								<button @click="goToReference(item)" class="btn-link">
									{{ item.documentNumber }}
								</button>
							</td>
							<td v-else>
								{{ item.documentNumber }}
							</td>
							<template v-if="showDescription">
								<td colspan="2">
									{{ item.documentType }}
								</td>
							</template>
							<template v-else>
								<td>
									<v-tooltip v-if="item.documentTypeName" top>
										<span slot="activator">{{ item.documentTypeCode }}</span>
										<span>{{ item.documentTypeName }}</span>
									</v-tooltip>
								</td>
								<td>
									{{ item.moduleName }}
								</td>
							</template>
						</template>
						<!-- IN -->
						<td class="in-cell">{{ item.quantityIn || 0 }}</td>
						<td class="in-cell" v-if="showCostPrice">
							<v-tooltip top>
								<template v-if="item.additionalInformation && item.additionalInformation.flagFree">
									<span slot="activator">
										{{ option(0, 1, item.operation) | round(4) }}
									</span>
									<span>{{ option(0, 1, item.operation) | round(4) }}</span>

								</template>
								<template v-else>
									<span slot="activator">
										{{ option(item.priceCost, 1, item.operation) | round(4) }}
									</span>
									<span>{{ option(item.priceCost, 1, item.operation) | round(4) }}</span>

								</template>
							</v-tooltip>
						</td>
						<td class="in-cell" v-if="showTotalKardex && showCostPrice">
							{{ option(item.total, 1, item.operation) | round }}
						</td>

						<!-- OUT -->
						<td class="out-cell">{{ item.quantityOut || 0 }}</td>
						<td class="out-cell" v-if="showCostPrice">
							<v-tooltip top>
								<span slot="activator">
									{{ option(item.priceCost, 0, item.operation) | round(4) }}
								</span>
								<span>
									{{ option(item.priceCost, 0, item.operation) | round(4) }}
								</span>
							</v-tooltip>
						</td>
						<td class="out-cell" v-if="showTotalKardex && showCostPrice">
							{{ option(item.total, 0, item.operation) | round }}
						</td>

						<!-- BALANCE -->

						<td v-if="showTotalKardex">
							{{ getBalanceProperties(item).quantity }}
						</td>
						<td v-if="showTotalKardex && showCostPrice">
							<v-tooltip top>
								<span slot="activator">
									{{ getBalanceProperties(item).cost }}
								</span>
								<span>
									{{ getBalanceProperties(item).cost }}
								</span>
							</v-tooltip>
						</td>
						<td v-if="showTotalKardex && showCostPrice">
							{{ getBalanceProperties(item).total }}
						</td>

						<td>
							{{ showDispatchInWords(item.flagDispatch) }}
						</td>
						<td>
							<!-- SALDO SYNC HIDDEN -->
							<!-- <span>
								<v-tooltip top>
									<button class="cursor-default" slot="activator">
										<span>
											<img
												:src="`/static/img/sincronizar-${
													isSyncBalance(item) ? 'green' : 'yellow'
												}.svg`"
												height="25"
												alt="boton-sincronizacion-saldo"
											/>
										</span>
									
									</button>
									<span>
										{{ textBalance(item) }}
									</span>
								</v-tooltip>
							</span> -->

							<v-tooltip top v-if="!item.isOpen">
								<v-btn
									icon
									class="btn-action-table ma-0"
									slot="activator"
									:ripple="false"
									@click="open(item)"
								>
									<v-icon color="primary">visibility</v-icon>
								</v-btn>
								<span>Ver Detalle</span>
							</v-tooltip>
							<v-tooltip top v-else>
								<v-btn
									icon
									slot="activator"
									class="btn-action-table ma-0"
									:ripple="false"
									@click="closeAction(item)"
								>
									<v-icon color="error">highlight_off</v-icon>
								</v-btn>
								<span>Cerrar Detalle</span>
							</v-tooltip>
							<app-tooltip-button
								:disabled="item.flagShowUser === 2"
								v-if="validateCostIcon(item) && $userInfo.codeTypeRol !== 'MAKI_VENDOR'"
								text="Editar Costo de Entrada"
								icon="edit"
								color="primary"
								@click-icon="openDialogEditCost(item)"
							/>
							<app-tooltip-button
								:disabled="item.flagShowUser === 2"
								v-if="validateStockIcon(item) && $userInfo.codeTypeRol !== 'MAKI_VENDOR'"
								text="Calcular Stock"
								color="primary"
								icon="low_priority"
								@click-icon="calcStock(item)"
							/>
						</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<template v-if="!openAction">
							<td colspan="2">
								<p class="text-blue border-footer" v-if="byProduct">
									Fecha Ult. Compra:
									<span class="text-gray">{{
										product.lastDatePurchase | formatDate('YYYY-MM-DD')
									}}</span>
								</p>
							</td>
							<td colspan="3">
								<p class="text-blue border-footer" v-if="byProduct">
									Fecha Ult. Venta:
									<span class="text-gray">{{
										product.lastDateSale | formatDate('YYYY-MM-DD')
									}}</span>
								</p>
							</td>
						</template>
						<td>
							<p class="number-td border-footer">
								Total <br />{{ totals ? totals.summaryQuantityIn : 0 }}
							</p>
						</td>
						<td class="border-footer" v-if="showCostPrice"></td>
						<td v-if="showTotalKardex && showCostPrice">
							<p class="number-td border-footer">
								Total <br />{{ totals ? totals.summaryTotalIn : 0 }}
							</p>
						</td>
						<td>
							<p class="number-td border-footer">
								Total <br />{{ totals ? totals.summaryQuantityOut : 0 }}
							</p>
						</td>
						<td class="border-footer" v-if="showCostPrice"></td>
						<td v-if="showTotalKardex && showCostPrice">
							<p class="number-td border-footer">
								Total <br />{{ totals ? totals.summaryTotalOut : 0 }}
							</p>
						</td>
						<td v-if="showTotalKardex">
							<p class="number-td border-footer">
								Actual <br />{{
									warehouseIds.length
										? balances.balanceQuantity
										: balances.balanceQuantityMaster
								}}
							</p>
						</td>
						<td v-if="showTotalKardex && showCostPrice">
							<p class="number-td border-footer">
								Actual <br />{{
									warehouseIds.length || !$userInfo.company.settings.flagKardexValued
										? '-'
										: balances.averageCost
								}}
							</p>
						</td>
						<td v-if="showTotalKardex && showCostPrice">
							<p class="number-td border-footer">
								Actual <br />{{
									warehouseIds.length || !$userInfo.company.settings.flagKardexValued
										? '-'
										: balances.balanceTotal
								}}
							</p>
						</td>
						<td colspan="2"></td>
					</tr>
					<tr>
						<td colspan="16" class="pag text-xs-right">
							<p class="ma-2" v-if="showPagination && rows.length > 0">
								<a
									v-for="(page, index) in pages"
									:key="index"
									:class="{ 'active-page': page === currentPage }"
									@click="selectPage(page)"
									>{{ page }}</a
								>
								<span>|</span>
								<a @click="selectLastPage">>></a>
							</p>
						</td>
					</tr>
				</tfoot>
			</table>
		</div>
		<detail-kardex
			v-if="openAction"
			by-product
			:data-select="dataSelect"
			class="container-table-action"
			@close-detail="closeDetail"
			@go-to-reference="goToReference"
		/>
		<action-sidebar
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			:code-action="action.code"
			@close-modal="actionModal('close-modal')"
		>
			<filters-kardex
				v-if="isActive"
				:product-code="product.code"
				:product-description="product.description"
				:product-id="product.id"
				:product-stock="product.stock"
				:product-unit="product.unitCode"
				:warehouse-ids="warehouseIds"
				@close-modal="actionModal('close-modal')"
				@filter-modal="actionModal('filter-modal', $event)"
			/>
		</action-sidebar>
		<v-dialog v-model="openDialog" persistent max-width="470">
			<v-card>
				<v-card-title class="border-bottom">
					<v-layout d-flex justify-center text-xs-center>
						{{ textDialogCost }}
					</v-layout>
				</v-card-title>
				<v-divider></v-divider>
				<v-card-text justify-center px-5>
					<v-flex xs4>
						<app-input-text
							label="Costo sin IGV"
							model="priceCost"
							:text="priceCost"
							@input="setPriceCost"
						/>
					</v-flex>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions class="justify-center">
					<v-btn class="btn-action" color="error" dark @click="closeDialogCost">
						Cancelar
					</v-btn>
					<v-btn
						type="button"
						class="btn-action"
						color="primary"
						dark
						@click="saveCostDialog"
					>
						Guardar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<app-show-dialog
			title-header="Referencia"
			text-content="Este movimiento se realizo desde la pantalla editar PRODUCTO MAESTRO."
			:show-modal-init="showModalKardex"
			color-dialog="error"
			color-hex="#D5331A"
			@close-dialog="closeDialogModal"
		/>
	</div>
</template>

<script>
//import { getHours, getMinutes, format } from 'date-fns';
import { format } from 'date-fns';
import actionSidebar from '@/components/shared/action-sidebar';
import appShowDialog from '@/components/shared/app-show-dialog';
import detailKardex from '@/components/inventories/detail-kardex';
import filtersKardex from '@/components/inventories/filters-kardex';

function pagination(pageNumber, totalRecords) {
	const current = pageNumber;
	const last = totalRecords;
	const delta = 2;
	const left = current - delta;
	const right = current + delta + 1;
	const range = [];
	const rangeWithDots = [];
	let l = null;
	for (let i = 1; i <= last; i += 1) {
		/* eslint-disable no-mixed-operators */
		if (i === 1 || i === last || (i >= left && i < right)) {
			range.push(i);
		}
	}
	/* eslint-disable no-restricted-syntax */
	for (const i of range) {
		if (l) {
			if (i - l === 2) {
				rangeWithDots.push(l + 1);
			} else if (i - l !== 1) {
				rangeWithDots.push('...');
			}
		}
		rangeWithDots.push(i);
		l = i;
	}
	return rangeWithDots;
}

function closeAction(row) {
	this.dataSelect = {};
	this.closeItem = true;
	this.openAction = !this.closeItem;
	this.$emit('close-detail', row);
}

function open(row) {
	this.dataSelect = { ...row };
	this.closeItem = false;
	this.openAction = !this.closeItem;
	this.$emit('open-detail', row);
}

function runAction({ code }) {
	if (code === 'list-kardex-general') {
		this.action.open = true;
	} else if (code === 'production-register') {
		this.action.title = 'NUEVO PRODUCTO';
		this.action.code = code;
		this.action.open = true;
	}
}

function changePage(page) {
	if (page !== '...') {
		if (page !== this.currentPage) {
			this.$emit('on-page', page);
		}
	}
}

function selectPage(page) {
	let newPage = page > this.lastPage ? this.lastPage : page;
	newPage = newPage <= 0 ? 1 : newPage;
	changePage.call(this, Number(newPage));
}

function selectLastPage() {
	changePage.call(this, this.lastPage);
}

function pages() {
	return pagination(this.currentPage, this.lastPage);
}

function option(model, number, numbeData) {
	if (number === numbeData) {
		return model || 0;
	}
	return 0;
}

function balances() {
	if (this.rows.length) {
		return this.rows[this.rows.length - 1];
	}
	return 0;
}

function isLink(moduleName) {
	const isInventario = moduleName === 'INVENTARIO';
	const isIngreso = moduleName === 'INGRESO';
	const isVenta = moduleName === 'VENTAS';
	const isTransferencia = moduleName === 'TRANSFERENCIA';
	const isCompra = moduleName === 'COMPRAS';
	const isOrder = moduleName === 'PEDIDO ECOMMERCE';
	return isInventario || isIngreso || isVenta || isTransferencia || isCompra || isOrder;
}

function goToReference(item) {
	let url = {};
	if (item.moduleId === 1 || item.moduleId === 2) {
		if (item.documentType === 'GUIA DE REMISION' && item.moduleId === 1) {
			url = { name: 'reference-guide-detail', params: { id: item.documentId } };
		} else if (item.documentType === 'GUIA DE REMISION' && item.moduleId === 2) {
			url = { name: 'purchase-detail', params: { id: item.documentId } };
		} else {
			const pageOptions = {
				COMPRAS: 'purchase-detail',
				VENTAS: 'convert',
			};
			const pageName = pageOptions[item.moduleName] || 'convert';
			url = { name: pageName, params: { id: item.documentId } };
		}
	} else if (item.moduleId === 9) {
		if (item.documentId) {
			this.isStatusTransfer(item.documentId);
		} else {
			this.showModalKardex = true;
		}
		return false;
	} else if (item.moduleId === 8) {
		if (item.documentType === 'GUIA DE REMISION') {
			url = { name: 'reference-guide-detail', params: { id: item.documentId } };
		} else if (item.documentKardexId) {
			url = {
				name: 'detail-kardex-movement',
				params: { id: item.documentKardexId },
			};
		} else {
			url = { name: 'detail-child-inventory', params: { id: item.documentId } };
		}
	} else if (item.moduleId === 7) {
		const parseDocument = JSON.parse(item.documentId);
		url = { name: 'page-detail-order', params: { orderId: parseDocument } };
	}
	const routeData = this.$router.resolve(url);
	window.open(routeData.href, '_blank');
	return true;
}

async function isStatusTransfer(id) {
	try {
		const { data: response } = await this.$httpProducts(`transfers/${id}`);
		const url = {
			name: 'pages-transfers-detail',
			params: { id },
			query: { status: response.status },
		};
		const routeData = this.$router.resolve(url);
		window.open(routeData.href, '_blank');
	} catch (error) {
		this.showGenericError();
	}
}

function closeDetail() {
	this.dataSelect = {};
	this.closeItem = true;
	this.openAction = false;
	this.$emit('close-total');
}

function openSlider() {
	this.action.open = true;
	this.isActive = true;
}

function actionModal(action, value) {
	this.action.open = false;
	this.isActive = false;
	this.$emit(action, value);
}

function showDispatchInWords(value) {
	return value ? 'Sí' : 'No';
}

function getHourProp(date) {
	return format(date, 'HH:mm');
}

function openDialogEditCost(item) {
	const dateFormat = format(item.createdAt, 'DD-MM-YYYY');
	this.idKardex = item.id;
	this.textDialogCost = `Al guardar con un nuevo costo se recalculará el saldo del stock y
		costo promedio desde ${dateFormat} en adelante`;
	this.openDialog = true;
}

function closeDialogCost() {
	this.openDialog = false;
	this.priceCost = null;
	this.idKardex = null;
	this.textDialogCost = '';
}

async function saveCostDialog() {
	const body = {
		priceCost: Number(this.priceCost),
	};
	try {
		await this.$httpProducts.patch(`kardex/${this.idKardex}`, body);
		this.showNotification('Se actualizó el costo correctamente.');
		this.$emit('load-kardex');
		this.closeDialogCost();
	} catch (error) {
		this.showGenericError();
	}
}

function setPriceCost({ model, value }) {
	this[model] = value;
}

function calcStock(row) {
	this.$emit('calc-stock', row);
}

function data() {
	return {
		action: {
			code: null,
			open: false,
			title: 'Almacenes de Producto',
			width: 553,
		},
		closeItem: true,
		textDialogCost: '',
		idKardex: null,
		iconReturn:
			'https://s3.amazonaws.com/apprunn-acl/COM-PRU-01/ARQ88/image/fill-1-copy.svg',
		iconOpen: 'https://s3.amazonaws.com/apprunn-acl/COM-PRU-01/ARQ88/image/fill-1.svg',
		isActive: false,
		openAction: false,
		openDialog: false,
		dataSelect: {},
		priceCost: null,
		showModalKardex: false,
		showCostPrice: !this.$userInfo.flagNotShowCostPrice,
	};
}

function quantityBalance(item) {
	// const validatedQuantity = this.$userInfo.company.settings.flagKardexValued;
	if (this.warehouseIds.length) {
		return item.balanceQuantity;
	}
	return item.balanceQuantityMaster || 0;
}

function itemAvarageCost(item) {
	const validatedQuantity = this.$userInfo.company.settings.flagKardexValued;
	if (this.warehouseIds.length) {
		return '-';
	}
	return validatedQuantity ? item.averageCost && item.averageCost.toFixed(4) : '-';
}

function textBalance(item) {
	const isValuedKardex = this.$userInfo.company.settings.flagKardexValued;
	const hasWarehouses = this.warehouseIds.length > 0;
	const isDisabled = item.flagShowUser === 2;

	const name = isValuedKardex ? 'Saldo' : 'Costo promedio';
	let status = `${name} ${
		this.isSyncBalance(item) ? ' sincronizado' : 'sin sincronizar'
	} `;

	if ((isValuedKardex || hasWarehouses) && isDisabled) {
		status = `${status} / Registro inhabilitado para recalculo`;
	}

	return status;
}

function itemBalanceTotal(item) {
	const validatedQuantity = this.$userInfo.company.settings.flagKardexValued;
	if (this.warehouseIds.length) {
		return '-';
	}
	return validatedQuantity ? item.balanceTotal || 'no balance' : '-';
}

function validateCostIcon(row) {
	return row.moduleName === 'INGRESO' || row.moduleName === 'INVENTARIO';
}

function validateStockIcon(row) {
	return row.moduleName === 'COMPRAS' || row.moduleName === 'INVENTARIO';
}

function closeDialogModal() {
	this.showModalKardex = false;
}

export default {
	data,
	name: 'table-kardex',
	computed: {
		balances,
		pages,
	},
	components: {
		actionSidebar,
		appShowDialog,
		detailKardex,
		filtersKardex,
	},
	methods: {
		actionModal,
		calcStock,
		closeAction,
		closeDialogCost,
		closeDialogModal,
		runAction,
		open,
		selectPage,
		changePage,
		saveCostDialog,
		selectLastPage,
		option,
		isLink,
		openDialogEditCost,
		openSlider,
		goToReference,
		isStatusTransfer,
		textBalance,
		closeDetail,
		setPriceCost,
		showDispatchInWords,
		getHourProp,
		itemAvarageCost,
		itemBalanceTotal,
		getBalanceProperties(item) {
			const hasFilterWarehouse = !!this.warehouseIds.length;
			const flagKardexOptimized = !!this.$userInfo.company.settings.flagKardexOptimized;
			const validatedQuantity = !!this.$userInfo.company.settings.flagKardexValued;

			if (flagKardexOptimized) {
				const { balanceQuantity, balanceQuantityMaster, balanceCostMaster, balanceTotalMaster } =
					item.kardexBalance || {};
				return {
					quantity: hasFilterWarehouse ? balanceQuantity : balanceQuantityMaster,
					cost: hasFilterWarehouse ? '-' : balanceCostMaster,
					total: hasFilterWarehouse ? '-' : balanceTotalMaster,
				};
			}

			if (hasFilterWarehouse) {
				const balanceQuantity = hasFilterWarehouse
					? item.balanceQuantity
					: item.balanceQuantityMaster;
				return {
					quantity: !this.isSyncBalance(item) ? 0 : balanceQuantity,
					cost: '-',
					total: '-',
				};
			}

			return {
				quantity: hasFilterWarehouse ? item.balanceQuantity : item.balanceQuantityMaster,
				cost: validatedQuantity ? item.averageCost : '-',
				total: validatedQuantity ? item.balanceTotal : '-',
			};
		},
		quantityBalance,
		validateCostIcon,
		validateStockIcon,
		isSyncBalance(item) {
			if (!item) return false;
			const { statusBalance, statusBalanceStock, statusBalanceStockMaster } = item;
			return statusBalance + statusBalanceStock + statusBalanceStockMaster === 3;
		},
	},
	props: {
		caption: {
			type: String,
			default: '',
		},
		columns: {
			type: Array,
			default: () => [],
			required: true,
		},
		rows: {
			type: Array,
			default: () => [],
			required: true,
		},
		actions: {
			type: Array,
			default: () => [],
			required: true,
		},
		currentPage: {
			type: Number,
			default: 1,
		},
		lastPage: {
			type: Number,
			default: 0,
		},
		totals: {
			type: Object,
			default: () => {},
		},
		product: {
			type: Object,
			default: () => ({
				product: {},
				warehouse: {},
			}),
		},
		byProduct: {
			default: false,
			type: Boolean,
		},
		warehouseIds: {
			default: () => [],
			type: Array,
		},
		showPagination: {
			default: true,
			type: Boolean,
		},
		showRoleWarehouse: {
			default: true,
			type: Boolean,
		},
		showDescription: {
			default: false,
			type: Boolean,
		},
		showTotalKardex: {
			default: false,
			type: Boolean,
		},
	},
};
</script>

<style lang="scss" scoped>
table {
	background-color: map-get($colors, white);
	border-collapse: collapse;
	font-size: 14px;
	width: 100%;
}

.header-blue-bold {
	background-color: map-get($colors, table-header);
	border-left: 1px solid #d3dde6;
	color: map-get($colors, white);
	font-family: map-get($fonts, open-semibold);
	height: 40px;
}

.container-table {
	flex: 1 1 66%;
	// overflow-y: auto;
	position: relative;

	&.open {
		padding-right: 0 !important;
	}

	&.maxh {
		height: calc(100vh - 250px);
	}
}

.header {
	&-small {
		background-color: map-get($colors, table-inventory) !important;
	}
}
.sticky-header {
	position: sticky;
	top: 40px;
	z-index: 5;
}
.header {
	color: map-get($colors, white);
	font-family: map-get($fonts, open-semibold);
	height: 40px;
}

.border-gray {
	border-right: 1px solid map-get($colors, background-table);
}

td {
	padding: 10px 0px;
	text-align: center;
}

tr:nth-child(even) {
	background-color: map-get($colors, background-table);
}

.table-footer {
	background: map-get($colors, summary);
}

.text-blue {
	color: map-get($colors, white);
	font-family: map-get($fonts, open-semibold);
	font-size: 12px;
	margin-bottom: 0;
}

.text-gray {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-regular);
	font-size: 12px;
}

.table-kardex {
	display: flex;
	flex-direction: row;
	gap: 10px;
	justify-content: space-around;
	align-items: baseline;
	position: relative;

	tfoot {
		td {
			background: map-get($colors, primary);
			border-right: 1px solid color(border-footer);
			bottom: 34px;
			color: white;
			padding: 0 !important;
		}

		.pag {
			background: map-get($colors, white) !important;
			box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.2);
			bottom: 0px !important;
			border-bottom-right-radius: 10px;
			border-bottom-left-radius: 10px;
			height: 35px;

			a {
				color: map-get($colors, paginationText) !important;
				font-size: 15px;
				font-weight: lighter;
				line-height: 10px;
				margin-left: 9px;

				&.active-page {
					color: map-get($colors, primary) !important;
				}

				&:hover {
					font-size: 18px;
				}
			}

			span {
				color: map-get($colors, grey-border);
			}
		}
	}

	thead {
		th {
			background-color: map-get($colors, primary) !important;
			// position: sticky;
			// top: 0;
			// z-index: 1;
		}
	}
}

.item-action {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, small13);
	margin-bottom: 12px;
}

.container-table-action {
	flex: 1 1 30%;
	position: sticky;
	top: 40px;
}

.number-td {
	margin-bottom: 0;
}

.btn-action-table {
	height: auto !important;
}

.unique-input {
	border: 1px solid map-get($colors, black);
	opacity: 0.1;
	padding-left: 5px;
	width: 50px;
}

.unique-input:focus-within {
	opacity: 1;
}

.border-footer {
	align-items: center;
	display: flex;
	justify-content: center;
	height: 62px;
}

.top {
	position: sticky;
	top: 0;
	z-index: 1;
}

.sub-top {
	position: sticky;
	top: 40px;
	z-index: 1;
}

.btn-link {
	border-bottom: 1px solid map-get($colors, primary);
	color: map-get($colors, primary);
}

.btn-filter {
	background-color: #ffffff;
	border-radius: 4px;
	padding: 2px;
}

.cursor-default {
	cursor: default;
}

.date-small {
	font-size: 11px;
}

.pb-100 {
	padding-bottom: 100px;
}

.border-bottom {
	font-size: 14px;
}

.modal-caption {
	background-color: rgba(255, 255, 255, 0.4);

	position: absolute;
	bottom: 0;
	width: 100%;
	height: calc(100% - 40px);
	display: flex;
	align-content: center;
	align-items: center;
	justify-content: center;
	z-index: 6;
}

.modal-card {
	background-color: color(white);
	border: 3px dashed color(primary);
	border-radius: 3px;
	padding: 1rem;

	&-caption {
		color: color(caption-grey);
		font-family: font(open-semibold);
		font-size: size(medium);
		margin: 0px !important;
		text-align: center;
	}
}

.row-kardex-table {
	td {
		border-right: 3px solid map-get($colors, border-body);
	}

	&.row-disabled {
		td {
			opacity: 0.5;
		}
	}

	&.row-in {
		td.in-cell {
			background-color: #e8f5e9;
			color: #2e7d32;
			font-weight: 600;
		}
	}

	&.row-out {
		td.out-cell {
			background-color: #ffebee;
			color: #c62828;
			font-weight: 600;
		}
	}
}
</style>
