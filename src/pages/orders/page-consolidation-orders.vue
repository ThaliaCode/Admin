<template>
	<div class="page-consolidation-orders">
		<header-page
			:limit-title="80"
			class="header-consolidation"
			:caption-navigation="numberRoute"
			:title="titleConsolidation"
			to-show
			:show-clean="false"
			:show-excel="false"
			:show-excel-menu="
				$route.name === 'consolidation-order' && (active === '0' || active === '1')
			"
			:open-on-click="true"
			hide-and-print
			:align-end="false"
			column-class="xs12"
			:options="options"
			@emit-excel="emitExcel"
		>
			<v-layout row align-center justify-end class="header-routes">
				<v-flex xs2 class="name-total">
					Total Neto: <br />
					<span class="total"
						>{{ this.detailOrders.currencySymbol }}. {{ totalSales }}</span
					>
				</v-flex>
				<v-flex xs8>
					<v-layout mt-2 class="section-information-consolidations">
						<v-flex
							>Num. Productos:
							<span class="item-information">{{
								headerConsolidation.quantityitems
							}}</span></v-flex
						>
						<v-flex
							>Cant pedidos:
							<span class="item-information">{{
								headerConsolidation.quantityDirections
							}}</span></v-flex
						>
						<v-flex
							>Recorrido:
							<span class="item-information">{{
								headerConsolidation.distance
							}}</span></v-flex
						>
						<v-flex
							>Peso Total:
							<span class="item-information">{{
								headerConsolidation.weight
							}}</span></v-flex
						>
					</v-layout>
				</v-flex>
				<v-menu
					v-if="active === '1'"
					content-class="excel-menu-content"
					offset-y
					:nudge-bottom="5"
					:nudge-left="70"
				>
					<v-btn slot="activator" class="py-1 px-1 mr-3" flat>
						<v-icon color="primary">print</v-icon>
					</v-btn>
					<v-list>
						<v-list-tile
							v-for="item in itemsPrint"
							:key="item.id"
							@click="reportsPrint(item)"
						>
							<v-list-tile-title>
								{{ item.name }}
							</v-list-tile-title>
						</v-list-tile>
					</v-list>
				</v-menu>
				<v-flex xs2 text-xs-center v-else>
					<a @click.prevent="printDocument" class="table-icon print ml-2">
						<v-icon color="primary">print</v-icon>
					</a>
				</v-flex>
			</v-layout>

			<v-menu
				v-if="isVisiblePdf"
				content-class="excel-menu-content"
				offset-y
				:nudge-bottom="5"
				:nudge-left="70"
			>
				<v-btn slot="activator" class="btn-download-excel btn-auto py-1 px-1 mr-3">
					<img src="/static/img/icon-pdf.svg" height="17" class="align-img" />
				</v-btn>
				<v-list>
					<v-list-tile
						v-for="item in listItems"
						:key="item.id"
						@click="generateReport(item)"
					>
						<v-list-tile-title>
							{{ item.name }}
						</v-list-tile-title>
					</v-list-tile>
				</v-list>
			</v-menu>
		</header-page>
		<app-actions
			v-show="active === '2'"
			:resource-uri="$route.name"
			@run-action="runAction"
			:value-disabled="actionsDisabled"
		/>
		<v-layout>
			<v-flex ma-4 v-if="active === '2'">
				<v-layout>
					<v-flex xs3>
						<app-select
							chips
							multiple
							:item="subsidiaryIds"
							:items="subsidiaries"
							item-text="sucursalName"
							item-value="id"
							:label="labelSucursal()"
							model="subsidiaryIds"
							:return-object="false"
							@input="setData"
						/>
					</v-flex>
					<v-flex ml-3 xs3>
						<app-select
							chips
							multiple
							:item="warehouseIds"
							:items="warehouses"
							item-text="name"
							item-value="id"
							label="Tienda"
							model="warehouseIds"
							:return-object="false"
							@input="setData"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex mt-4 xs4 class="tabs-container">
				<v-tabs color="white" slider-color="primary" show-arrows v-model="active">
					<v-tabs-slider color="yellow"></v-tabs-slider>
					<v-tab v-for="tab in tabs" :key="tab.id">
						<span>{{ tab.name }}</span>
					</v-tab>
				</v-tabs>
			</v-flex>
		</v-layout>
		<h2 class="detail-type-document">Consolidación DE la RUTA</h2>
		<section :class="{ 'liquid-sales': active === '2' }">
			<v-layout row px-4 mt-4 justify-space-around class="container-details-routes">
				<v-layout wrap row align-center>
					<v-flex class="title-header"> NOMBRE DE RUTA </v-flex>
					<v-flex class="description-header">
						{{ informationOrders.name }}
					</v-flex>
				</v-layout>
				<v-layout row align-center>
					<v-flex class="title-header"> FECHA </v-flex>
					<v-flex class="description-header">
						{{ informationOrders.dateOrder }}
					</v-flex>
				</v-layout>
				<v-layout align-center>
					<v-flex class="title-header"> HORA </v-flex>
					<v-flex class="description-header">
						{{ informationOrders.hour }}
					</v-flex>
				</v-layout>
				<v-layout align-center>
					<v-flex class="title-header"> TIPO DISTRIB. </v-flex>
					<v-flex class="description-header">
						{{ informationOrders.typeDistributorName }}
					</v-flex>
				</v-layout>
				<!-- <v-layout align-center v-if="!isTwoDrivers">
					<v-flex class="title-header">
						TRANSPORTISTA
					</v-flex>
					<v-flex class="description-header">
						{{ informationOrders.nameCourier }}
					</v-flex>
				</v-layout>
				<v-layout align-center v-if="!isTwoDrivers && active !== '2'">
					<v-flex class="title-header">
						VEHICULO
					</v-flex>
					<v-flex class="description-header">
						{{ informationOrders.plateCourier }}
					</v-flex>
				</v-layout> -->
				<v-layout align-center v-if="!isTwoDrivers && isInternal">
					<v-flex class="title-header"> REPARTIDOR </v-flex>
					<v-flex class="description-header">
						{{ informationOrders.deliveryName }}
					</v-flex>
				</v-layout>
			</v-layout>
			<v-layout v-if="active === '2'" row px-4 mt-4 class="justify-space-end">
				<table class="table-routes" style="border-collapse: collapse">
					<thead class="head-table">
						<tr>
							<th>Total de Venta</th>
							<th>Total de Deuda</th>
							<th>Total pagado</th>
							<th v-if="totalAmountsLiqui.totalAnulados">Total anulado</th>
							<th v-if="totalAmountsLiqui.totalExtraDocs">Total de Venta NTC/NDD</th>
						</tr>
					</thead>
					<tbody class="body-head" style="background: #fff">
						<td>{{ totalAmountsLiqui.totalAmount }}</td>
						<td>
							{{ totalAmountsLiqui.totalPaid.toFixed(2) }}
						</td>
						<td>{{ totalAmountsLiqui.totalDueAmount }}</td>
						<td v-if="totalAmountsLiqui.totalAnulados">
							{{ totalAmountsLiqui.totalAnulados.toFixed(2) }}
						</td>
						<td v-if="totalAmountsLiqui.totalExtraDocs">
							{{ totalAmountsLiqui.totalExtraDocs.toFixed(2) }}
						</td>
					</tbody>
				</table>
			</v-layout>
		</section>
		<v-layout mt-4 mb-4 pb-5 column>
			<v-flex xs12 v-if="active === '0'">
				<table-order-summary
					:rows="rowFilter"
					:columns="columnsOrder"
					:current-page="currentPage"
					:total-items="totalItems"
					:last-page="lastPage"
					@change-page="changePage"
				/>
			</v-flex>
			<v-flex xs12 v-else-if="active === '1'">
				<table-product-overview
					:columns="columnsProduct"
					:rows="rowFilter"
					:current-page="currentPage"
					:total-items="totalItems"
					:last-page="lastPage"
					@change-page="changePage"
				/>
			</v-flex>
			<v-flex xs12 v-else>
				<table-product-liquidation
					:columns="columnsLiqui"
					:rows="rowsLiqui"
					:checkAll="checkAll"
					:current-page="currentPage"
					:total-items="totalItems"
					:last-page="lastPage"
					@on-row-selected="rowIsSelected"
					@on-selected-all="selectedAll"
					@change-page="changePage"
				/>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<v-flex text-xs-center>
				<v-btn
					type="button"
					class="btn-auto btn-return-distribution"
					@click="returnRoute"
				>
					Atras
				</v-btn>
			</v-flex>
		</section>
		<!-- MODAL CREATE REMISION GUIDE -->
		<simple-modal
			:open="modalRemisionGuide"
			@cancel="toggleModalGuide"
			@close="toggleModalGuide"
			@confirm="createRemisionGuide"
		>
			<span slot="title">¿Desea generar una guía de remisión?</span>
			<span slot="message">
				Los pedidos seleccionados se usarán para generar de manera automática, una guia de
				remisión al crear la ruta de distribución con los datos ingresados.
			</span>
		</simple-modal>
	</div>
</template>

<script>
import helper from '@/shared/helper';
import headerPage from '@/components/shared/header-page';
import tableOrderSummary from '@/components/orders/table-order-summary';
import tableProductOverview from '@/components/orders/table-product-overview';
import {
	LIST_SALES_BY_ROUTE,
	LIST_SALES_PENDING,
	LIST_SALES_NTC,
} from '@/shared/reports';
import tableProductLiquidation from '@/components/orders/table-product-liquidation';
import simpleModal from '@/components/field-sale/shared/simple-modal';
import appActions from '@/components/shared/app-actions';
import { getStockByWarehouse } from '@/shared/warehouse';
import { format } from 'date-fns';

const { getLocalData, generateBlob, showDownloadDialog } = helper;

function created() {
	this.getConsolidationOrders();
	if (this.isEcuador) {
		this.columnsOrder[2].name = 'Parroquia';
	} else {
		this.columnsOrder[2].name = 'Distrito';
	}
	this.columnsOrder[2].visible = !this.isTwoDrivers;

	// this.getLiquidationData();
	this.getLiquidationTotal();
	this.loadData();
}

async function getConsolidationOrders() {
	this.detailOrders = getLocalData('detail-route') || {};
	const newConsolitation = { ...this.detailOrders };
	this.numberRoute = `NRO DE RUTA: ${newConsolitation.code || ''}`;
	this.titleConsolidation = `Consolidación - ${newConsolitation.name}`;
	// this.totalAmount = newConsolitation.totalSales || 0;
	this.headerConsolidation.quantityitems = newConsolitation.totalProducts;
	this.headerConsolidation.quantityDirections = newConsolitation.orders.length;
	this.headerConsolidation.distance = newConsolitation.distance;
	this.headerConsolidation.weight = newConsolitation.weight;
	this.isInternal = newConsolitation.typeDistributor === 1;
	this.informationOrders = {
		name: newConsolitation.name,
		dateOrder: newConsolitation.dateRoute,
		hour: newConsolitation.hour,
		typeDistributorName: newConsolitation.typeDistributor === 1 ? 'Interno' : 'Externo',
		nameCourier: newConsolitation.responsibleUser
			? newConsolitation.responsibleUser.name
			: '',
		plateCourier: newConsolitation.vehicle ? newConsolitation.vehicle.plate : '',
		deliveryName: newConsolitation.delivery ? newConsolitation.delivery.name : '',
	};
	this.rowsProduct = newConsolitation.orders.reduce((acum, item) => {
		let newAcum = [...acum];
		if (item.details.length > 0) {
			const newDetails = item.details.map((det) => ({
				...det,
				documentNumber: item.documentNumber,
			}));
			newAcum = newAcum.concat(newDetails);
		}
		return newAcum;
	}, []);
	this.rowsOrder = newConsolitation.orders;
	this.displayPage(1);
	this.fetchStockRealForProducts();
}

async function fetchStockRealForProducts() {
	const productIds = [...new Set(this.rowsProduct.map((p) => p.productId).filter((id) => id))];
	const warehouseIds = [...new Set(this.rowsProduct.map((p) => p.warehouseId).filter((id) => id))];
	
	if (!productIds.length) {
		return;
	}
	
	this.rowsProduct = this.rowsProduct.map((p) => Object.assign({}, p, { stock: '...' }));
	
	getStockByWarehouse(productIds, warehouseIds)
		.then((stockMap) => {
			this.rowsProduct = this.rowsProduct.map((p) => {
				const key = `${p.productId}-${p.warehouseId}`;
				const newStock = stockMap[key];
				return Object.assign({}, p, { stock: newStock !== undefined ? newStock : p.stock });
			});
		});
}

async function getLiquidationData() {
	try {
		const paramsSales = {
			limit: 30,
			page: this.currentPage,
			relationAdd: 'customer,employee,typeDocument,state,payment',
			routeId: this.detailOrders.id,
		};

		const { data: responseSales, headers } = await this.$httpSales.get('sale-documents', {
			params: paramsSales,
		});

		this.totalItems = Number(headers['x-quantity']);
		this.lastPage = Number(headers['x-last-page']);

		this.rowsLiqui = responseSales.map((item) => {
			const {
				id,
				amount,
				debtAmount,
				createdAt,
				employee,
				documentNumber,
				state,
				typeDocument,
				customer,
				paymentStateName,
				paymentStateColor,
				balance,
				dueAmount,
			} = item;
			const { fullName: customerName } = customer.typePerson;
			const { name: employeeName, lastName: employeelastName } = employee;
			const { name: typeDocumentName, code } = typeDocument;
			return {
				id,
				customer: customerName,
				documentNumber,
				seller: `${employeeName} ${employeelastName || ''}`,
				createdAt: new Date(createdAt).toISOString().split('T')[0],
				typeDocument: typeDocumentName,
				totalAmount: amount,
				debtAmount: code === 'NTC' || code === 'NDD' ? balance - dueAmount : debtAmount,
				paymentState: paymentStateName,
				paymateColor: paymentStateColor,
				state: state.name,
				stateColor: state.color,
			};
		});
	} catch (error) {
		this.showGenericError();
	}
}

function returnRoute() {
	this.goBack();
}

async function printDocument() {
	const downloadDialog = this.$userInfo.company.settings.downloadSale;
	const typeReport = this.getTypeReport;
	const body =
		this.active === '2' ? { code: 'liquidacion-pdf' } : { code: 'route-orders-pdf' };
	const responseType = 'blob';
	const contentType = downloadDialog ? 'application/pdf' : 'text/html';
	try {
		const { data: response } = await this.$httpSales.post(
			`router/${this.detailOrders.id}/pdf?typeReport=${typeReport}`,
			body,
			{ responseType }
		);
		const blob = generateBlob(response, contentType);
		this.showNotification('El reporte de pedidos ha sido descargado correctamente.');
		showDownloadDialog(blob, 'reporte-de-pedidos', downloadDialog);
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		}
	}
}

function generateExportParams(codeReport, prefixName, pending = false) {
	const params = {
		routeId: this.detailOrders.id,
		pending,
	};
	this.onEmitExcel(codeReport, prefixName, params);
}

function emitExcel(code) {
	if (code === 'list-sales-by-route') {
		this.generateExportParams(LIST_SALES_BY_ROUTE, 'listado_de_ventas_por_ruta_');
	} else if (code === 'list-sales-pending') {
		this.generateExportParams(LIST_SALES_PENDING, 'listado_de_ventas_por_cobrar_', true);
	} else if (code === 'list-sales-ntc') {
		this.generateExportParams(LIST_SALES_NTC, 'listado_de_ventas_y_nota_credito');
	}
}

function data() {
	return {
		totalItems: 1,
		lastPage: 1,
		numberRoute: '',
		detailOrders: {},
		active: null,
		isInternal: null,
		currentPage: 1,
		rowsProduct: [],
		rowsOrder: [],
		rowFilter: [],
		rowsLiqui: [],
		dataSelected: [],
		modalRemisionGuide: false,
		tabs: [
			{
				id: 1,
				name: 'Resumen de pedidos',
			},
			{
				id: 2,
				name: 'Resumen de productos',
			},
			{
				id: 3,
				name: 'Liquidacion de ventas',
			},
		],
		columnsProduct: [
			{
				id: 1,
				name: '#Pedido',
				value: 'numberOrders',
				visible: true,
				checked: true,
			},
			{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
			{
				id: 3,
				name: 'Producto',
				value: 'productName',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Almacén',
				value: 'warehouse',
				visible: true,
				checked: true,
			},
			{ id: 5, name: 'Unidad', value: 'unit', visible: true, checked: true },
			{ id: 6, name: 'Cant.', value: 'quantity', visible: true, checked: true },
			{
				id: 7,
				name: 'Stock Act.',
				value: 'stock',
				visible: true,
				checked: true,
			},
			{ id: 8, name: 'Peso', value: 'weight', visible: true, checked: true },
			// {
			// 	id: 9,
			// 	name: 'Orden',
			// 	value: 'routeSort',
			// 	visible: true,
			// 	checked: true,
			// },
		],
		columnsOrder: [
			{
				id: 1,
				name: '#Pedido',
				value: 'numberOrders',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Cliente',
				value: 'customer',
				visible: true,
				checked: true,
			},
			{ id: 3, name: '', value: 'parishName', visible: true, checked: true },
			{
				id: 4,
				name: 'Guía de remisión',
				value: 'referenceGuid',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Cant. Items',
				value: 'quantityitems',
				visible: true,
				checked: true,
			},
			{ id: 6, name: 'Peso', value: 'weight', visible: true, checked: true },
			{ id: 7, name: 'Monto', value: 'amount', visible: true, checked: true },
			{
				id: 8,
				name: 'Orden',
				value: 'routeSort',
				visible: true,
				checked: true,
			},
		],
		columnsLiqui: [
			{
				id: 1,
				name: 'Cliente',
				value: 'customer',
				visible: true,
				checked: true,
			},
			{ id: 2, name: '#DOC', value: 'customer', visible: true, checked: true },
			{
				id: 3,
				name: 'Vendedor',
				value: 'parishName',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Fecha',
				value: 'referenceGuid',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'T. Doc',
				value: 'quantityitems',
				visible: true,
				checked: true,
			},
			{ id: 6, name: 'Total', value: 'weight', visible: true, checked: true },
			{ id: 7, name: 'Deuda', value: 'amount', visible: true, checked: true },
			{ id: 8, name: 'Estado', value: 'weight', visible: true, checked: true },
			{
				id: 9,
				name: 'Estado de pago',
				value: 'amount',
				visible: true,
				checked: true,
			},
			// {
			// 	id: 10,
			// 	name: 'Orden',
			// 	value: 'routeSort',
			// 	visible: true,
			// 	checked: true,
			// },
		],
		totalSales: null,
		totalAmountsLiqui: {
			totalAmount: null,
			debtAmount: null,
			totalDueAmount: null,
			totalAnulados: null,
		},
		headerConsolidation: {
			quantityitems: null,
			quantityDirections: null,
			distance: null,
		},
		informationOrders: {
			name: '',
			dateOrder: null,
			hour: '',
			typeDistributorName: null,
			nameCourier: '',
			plateCourier: '',
		},
		options: [
			{ id: 1, code: 'list-sales-by-route', name: 'Lista de Ventas' },
			{ id: 2, code: 'list-sales-pending', name: 'Ventas por cobrar' },
			{
				id: 3,
				code: 'list-sales-ntc',
				name: 'Reporte de Ventas y Notas de Credito',
			},
		],
		itemsOrders: [
			{
				id: 1,
				code: 'carge-composition-pdf',
				name: 'Reporte de composicion de carga',
			},
			{
				id: 2,
				code: 'carge-composition-details-pdf',
				name: 'Reporte de composicion de carga detallado',
			},
		],
		itemsProducts: [
			{
				id: 1,
				code: 'carge-sheet-pdf',
				name: 'Reporte de composicion de carga',
			},
			{
				id: 2,
				code: 'carge-max-sheet-pdf',
				name: 'Reporte de composicion agrupada',
			},
			{
				id: 3,
				code: 'carge-weighable-sheet',
				name: 'Reporte de composicion de carga pesable',
			},
			{
				id: 4,
				code: 'carge-max-sheet-pdf',
				name: 'Reporte de composicion sin pesables',
				params: {
					notWeighReport: true,
				},
			},
		],
		itemSettlement: [
			{
				id: 1,
				code: 'collection-sheet-pdf',
				name: 'Reporte de planilla de cobranza',
			},
			{
				id: 2,
				code: 'delivery-sheet-pdf',
				name: 'Reporte de planilla de entrega',
			},
			{
				id: 3,
				code: 'returned-report-pdf',
				name: 'Reporte de devoluciones',
			},
			{
				id: 4,
				code: 'returned-grouped-report-pdf',
				name: 'Reporte de devoluciones agrupada',
			},
		],
		checkAll: false,
		itemsPrint: [
			{
				id: 1,
				code: 'route-products-pdf',
				name: 'Reporte de productos',
			},
			{
				id: 2,
				code: 'route-products-category-pdf',
				name: 'Reporte de productos agrupados por categoria',
			},
		],
		subsidiaries: [],
		subsidiaryIds: [],
		warehouses: [],
		warehouseIds: [],
	};
}

export default {
	data,
	name: 'page-consolidation-orders',
	created,
	methods: {
		emitExcel,
		getConsolidationOrders,
		getLiquidationData,
		fetchStockRealForProducts,
		async getLiquidationTotal() {
			const paramsSalesTotal = {
				routeId: this.detailOrders.id,
				flagIsRoute: true,
			};
			const { data: responseTotal } = await this.$httpSales.get('sale-documents-total', {
				params: paramsSalesTotal,
			});
			this.totalSales = responseTotal.totalSales || 0;
			this.totalAmountsLiqui = {
				totalAmount: responseTotal.totalAmount || 0,
				totalPaid: responseTotal.totalPagado || 0,
				totalDueAmount: responseTotal.totalDueAmount,
				totalExtraDocs: responseTotal.totalExtraDocs || 0,
				totalAnulados: responseTotal.totalAnulados || 0,
			};
		},
		generateExportParams,
		printDocument,
		returnRoute,
		toggleModalGuide() {
			this.modalRemisionGuide = !this.modalRemisionGuide;
		},
		goToPreviousTab() {
			if (this.active > 0) {
				this.active -= 1;
			}
		},
		next() {
			const active = parseInt(this.active, 10);
			this.active = active < 2 ? active + 1 : 0;
		},
		async generateReport(item) {
			const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
			const { code, name, params = {} } = item;
			try {
				const body = {
					extension: 'pdf',
					filename: `${name}_${now}_${this.detailOrders.id}`,
					params: {
						...params,
						routeId: this.detailOrders.id,
						warehouseIds:
							this.warehouseIds.length && this.active === '2'
								? this.warehouseIds
								: undefined,
						subsidiaryIds:
							this.subsidiaryIds.length && this.active === '2'
								? this.subsidiaryIds
								: undefined,
					},
				};
				await this.$httpReports.post(`documents/${code}`, body);
				this.notificationReport();
			} catch (err) {
				if (err.status === 400) {
					if (err.data.message === 'NOT_FOUND_REPORT') {
						this.showGenericError(
							'El reporte no se encuentra activado para su compañía.'
						);
					}
				} else {
					this.showGenericError();
				}
			}
		},
		rowIsSelected(row) {
			({
				products: this.rowsLiqui,
				productsSelected: this.dataSelected,
				checkAll: this.checkAll,
			} = this.selectedRows(row, this.rowsLiqui, this.dataSelected));
		},
		selectedAll(val) {
			({
				products: this.rowsLiqui,
				productsSelected: this.dataSelected,
				checkAll: this.checkAll,
			} = this.selecteAll(val, this.rowsLiqui, this.dataSelected));
		},
		runAction({ code }) {
			if (code === 'create-group-guides') {
				this.toggleModalGuide();
			}
		},
		async reportsPrint(item) {
			const { code, name } = item;
			const downloadDialog = this.$userInfo.company.settings.downloadSale;
			const contentType = downloadDialog ? 'application/pdf' : 'text/html';
			const responseType = 'blob';
			const body = {
				code,
			};
			try {
				const { data: response } = await this.$httpSales.post(
					`router/${this.detailOrders.id}/pdf?typeReport=products`,
					body,
					{ responseType }
				);
				const blob = generateBlob(response, contentType);
				this.showNotification(`El ${name} ha sido descargado correctamente.`);
				showDownloadDialog(blob, name, downloadDialog);
			} catch (error) {
				if (error.status === 500) {
					this.showGenericError();
				}
			}
		},
		async createRemisionGuide() {
			const dateStart = new Date(this.detailOrders.dateStart);
			try {
				const body = {
					deliveryId: this.detailOrders.deliveryId,
					transportAgencyId: this.detailOrders.transportAgencyId,
					vehicleId: this.detailOrders.vehicleId,
					flagGroup: false,
					dateStart: dateStart.toISOString().split('T')[0],
					sales: this.dataSelected.map((p) => ({
						id: p.id,
						flagGuides: 1,
					})),
					description: this.detailOrders.description,
					name: this.detailOrders.name,
					routerId: this.detailOrders.id,
					typeRemissionGuide: this.typeRemissionGuide,
					flagRelationOrders: false,
				};
				await this.$httpSales.post('remission-guides-group', body);
				this.showNotification('Se generó la guía de remisión correctamente.');
			} catch (error) {
				this.showGenericError('No se pudo crear la guía de remisión correctamente');
				console.error(error);
			} finally {
				this.toggleModalGuide();
			}
		},
		async loadData() {
			const requests = [this.subsidiariesList(), this.warehousesList()];
			[{ data: this.subsidiaries }, { data: this.warehouses }] = await Promise.all(
				requests
			);
		},
		setData({ value, model }) {
			this[model] = value;
		},
		changePage(page) {
			this.currentPage = page;
			if (this.active === '2') {
				this.getLiquidationData();
			} else {
				const array = this.active === '1' ? this.rowsProduct : this.rowsOrder;
				if (page < 1 || page > Math.ceil(array.length / 30)) return;
				this.displayPage(page);
			}
		},
		displayPage(page) {
			const array = this.active === '1' ? this.rowsProduct : this.rowsOrder;
			const start = (page - 1) * 30;
			const end = start + 30;
			this.lastPage = Math.ceil(array.length / 30);
			this.rowFilter = array.slice(start, end);
			this.totalItems = array.length;
		},
	},
	watch: {
		active(newVal) {
			this.currentPage = 1;
			if (newVal === '2') {
				this.getLiquidationData();
			} else {
				this.getConsolidationOrders();
			}
		},
	},
	computed: {
		getTypeReport() {
			if (this.active === '0') {
				return 'order';
			} else if (this.active === '1') {
				return 'products';
			}
			return 'liquidacion-ventas';
		},
		actionsDisabled() {
			return [
				{
					code: 'create-group-guides',
					disabled: !this.dataSelected.length || this.active !== '2',
				},
			];
		},
		isVisiblePdf() {
			const allEmpty = this.rowsOrder.every(
				(row) => !Array.isArray(row.saleDocument) || row.saleDocument.length === 0
			);
			return (
				this.active === '0' || this.active === '1' || (this.active === '2' && !allEmpty)
			);
		},
		listItems() {
			this.subsidiaryIds = [];
			this.warehouseIds = [];
			if (this.active === '0') return this.itemsOrders;
			if (this.active === '1') return this.itemsProducts;
			if (this.active === '2') return this.itemSettlement;
			return [];
		},
	},
	components: {
		appActions,
		headerPage,
		simpleModal,
		tableOrderSummary,
		tableProductOverview,
		tableProductLiquidation,
	},
};
</script>

<style lang="scss" scoped>
.tabs-hidden {
	width: 170px;
	overflow: hidden;
}
.tab {
	background-color: color(primary);
}
.justify-space-end {
	justify-content: flex-end;
}
td {
	padding: 10px 6px;
	text-align: center;
	color: rgba(0, 0, 0, 0.87);
}
th {
	padding: 8px 6px;
}
.liquid-sales {
	display: flex;
}
.table-routes {
	border-radius: 4px;
	color: #4a4a4a;
	font-family: 'Lato_bold';
	font-size: 11px;
	background: #e0f3f3;
	border: 1px solid #d3dde6;
}
.head-table {
	padding: 8px;
	color: color(primary);
}
.body-head {
	background: #fff;
}
.tabs-container {
	margin: 1rem;
	margin-left: auto;
	justify-content: end;
}

.detail-type-document {
	color: #4a4a4a;
	font-family: Opens_bold;
	font-size: 16px;
	padding-bottom: 1rem;
	border-bottom: 1px solid rgba(2, 151, 155, 0.19);
	margin: 0rem 2rem;
	text-transform: uppercase;
}
.header-routes {
	padding: 1rem;
}
.container-details-routes {
	display: grid;
	gap: 15px;
	grid-template-columns: repeat(4, 1fr);
}

.container-details-routes > * {
	justify-self: flex-start;
}

.header-information-consolidation {
	background-color: #fbfbfb;
	border: 1px solid #f5f5f5;
	border-radius: 3px;
}

.total {
	color: map-get($colors, background-sideba);
	font-size: 17px;
	font-family: map-get($fonts, open-bold);
}

.section-information-consolidations {
	background-color: #fbfbfb;
	border: 1px solid #f5f5f5;
	border-radius: 3px;
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, lato-bold);
	font-size: map-get($sizes, small11);
	padding: 7px 11px;
}

.item-information {
	color: map-get($colors, number-header);
	font-family: map-get($fonts, lato-regular);
	font-size: map-get($sizes, small11);
}

.name-total {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, lato-bold);
	font-size: map-get($sizes, small11);
}

.btn-return-distribution {
	background-color: white !important;
	border: 1px solid map-get($colors, primary);
	border-radius: 3px;
	color: map-get($colors, primary) !important;
	padding: 7px 0;
	text-transform: initial !important;
	width: 97px !important;
}

.header-consolidation {
	align-items: center !important;
}

.title-header {
	background-color: #e0f3f3;
	color: map-get($colors, background-sidebar);
	font-size: 10px;
	font-family: map-get($fonts, open-bold);
	padding: 5px 10px;
}

.description-header {
	color: #4a4a4a;
	font-size: 10px;
	font-family: map-get($fonts, open-bold);
	height: 25px;
	padding: 5px 10px;
}

.width {
	width: 297px !important;
}
</style>
