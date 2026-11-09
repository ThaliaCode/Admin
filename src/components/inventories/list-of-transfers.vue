<template>
	<div>
		<header-page
			to-show
			show-excel
			emit-excel
			:excel-loading="computedExcel"
			:export-to-pdf="false"
			@emit-excel="downLoadExcelReport"
			:title="$route.meta.title"
			:exportToPdfList="!$userInfo.flagNotShowCostPrice"
			:open-on-click="true"
			:optionsAmortizations="listReports"
			@clean-product-filter="cleanFilters"
			@download-dispatch-list="downLoadPdf"
		>
		</header-page>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter class="layout wrap align-center my-4">
			<v-flex xs12 md4 mb-3>
				<v-btn-toggle
					class="filter-toggle"
					v-model="params.status"
					@change="changeStatus($event)"
				>
					<v-btn
						v-for="filter in showDispatch"
						:key="filter.id"
						outline
						type="button"
						:disabled="filter.id === params.status"
						:value="filter.id"
					>
						{{ filter.name }}
					</v-btn>
				</v-btn-toggle>
			</v-flex>
			<v-flex xs12>
				<v-layout wrap align-center>
					<v-flex xs12 sm6 md2 pr-2>
						<autocomplete-component
							item-text="name"
							item-value="id"
							:items="warehouses"
							:label-value="`${labelWarehouse()} Origen`"
							:properties-to-show="properties"
							resource-url="/warehouses"
							return-object
							:http-code="'$httpProducts'"
							:item="params.warehouseOriginId"
							@return-data="setData($event, 'warehouseOriginId')"
						></autocomplete-component>
					</v-flex>
					<v-flex xs12 sm6 md2 px-2>
						<autocomplete-component
							item-text="name"
							item-value="id"
							:items="warehouses"
							:label-value="`${labelWarehouse()} Destino`"
							:properties-to-show="properties"
							resource-url="/warehouses"
							return-object
							:http-code="'$httpProducts'"
							:item="params.warehouseSourceId"
							@return-data="setData($event, 'warehouseSourceId')"
						></autocomplete-component>
					</v-flex>
					<v-flex xs12 sm6 md2 px-2>
						<app-date-select
							:date-formatted="params.startDate"
							:max-date="params.endDate"
							label="Fecha inicial"
							model="startDate"
							@input="getDate"
						/>
					</v-flex>
					<v-flex xs12 sm6 md2 px-2>
						<app-date-select
							:date-formatted="params.endDate"
							label="Fecha final"
							:min-date="params.startDate"
							model="endDate"
							@input="getDate"
						/>
					</v-flex>
					<v-flex xs12 sm6 md3 pl-2 pt-4>
						<v-btn
							class="btn-action mr-3"
							color="primary"
							:disabled="disabled"
							@click="loadData(1)"
						>
							Buscar
						</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
		</general-filter>
		<app-table
			name="transfers"
			local-storage
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="params.page"
			:last-page="lastPage"
			:rows="data"
			:check-all="checkAll"
			selectable
			:items-quantity="data.length"
			:items-total-quantity="itemsTotalQuantity"
			@on-toggle-columns="toggleColumns"
			@on-page="changePage"
			@on-search-event="searchTransfer"
			@on-selected-all="selectedAll"
			@row-is-selected="rowIsSelected"
			class="is-not-selectable"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.transferNumber }}
				</td>
				<td v-show="showRow(columns, 2)">
					<template>
						<v-tooltip top>
							<span>
								{{ props.row.name }}
							</span>
							<span slot="activator">
								{{ props.row.code }}
							</span>
						</v-tooltip>
					</template>
				</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.warehouseOriginName || '-' }}
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.warehouseSourceName }}
				</td>
				<td v-show="showRow(columns, 5)">{{ props.row.statusName }}</td>
				<td v-show="showRow(columns, 6)">
					{{ props.row.observations || '-' }}
				</td>
				<td v-show="showRow(columns, 7)">
					{{ props.row.createdAt | formatDate }}
				</td>
				<td v-show="showRow(columns, 8)">
					<span v-if="props.row.status === 2">
						{{ props.row.clearanceDate | formatDate }}
					</span>
					<span v-else-if="props.row.status === 3">
						{{ props.row.deliveryDate | formatDate }}
					</span>
					<span v-else>-</span>
				</td>
				<td v-show="showRow(columns, 9)">
					<span v-if="props.row.cancelDate">
						{{ props.row.cancelDate | formatDate }}
					</span>
					<span v-else>-</span>
				</td>
				<td v-show="showRow(columns, 10)">
					<app-tooltip-button
						color="success"
						icon="person_pin"
						text="Ver Usuarios"
						:size="18"
						@click-icon="openSidebar(props.row, 'users-transfer')"
					/>
					<app-tooltip-button
						icon="remove_red_eye"
						text="Ver Detalle"
						color="primary"
						size="16"
						@click-icon="preGoTo(props.row)"
					/>
					<v-tooltip top>
						<v-btn
							slot="activator"
							v-show="props.row.status === 3"
							class="table-icon create-sale green--text"
							@click.native="goToSaleCreate(props.row)"
						>
							<v-icon>receipt</v-icon>
						</v-btn>
						<span>Crear venta</span>
					</v-tooltip>
					<v-menu
						content-class="excel-menu-content"
						offset-y
						:nudge-bottom="5"
						:nudge-left="70"
					>
						<v-btn slot="activator" flat small class="btn-auto ma-0">
							<v-icon color="primary">local_printshop</v-icon>
						</v-btn>
						<v-list>
							<v-list-tile
								v-for="item in listReportsDetail"
								v-if="item.visible"
								:key="item.id"
								@click="goToPrint(item, props.row)"
							>
								<v-list-tile-title>
									{{ item.name }}
								</v-list-tile-title>
							</v-list-tile>
						</v-list>
					</v-menu>

					<app-tooltip-button
						v-if="params.status === 2 || params.status === 3"
						color="success"
						icon="transfer_within_a_station"
						text="Ver Tracking"
						:size="18"
						@click-icon="goToTracking(props.row)"
					/>
				</td>
			</template>
		</app-table>
		<v-dialog v-model="dialog" max-width="500">
			<v-card>
				<v-card-title v-if="transferSelected" class="headline justify-center">
					<span v-if="transferSelected.status === 1">
						¿Desea iniciar la transferencia
						{{ transferSelected.transferNumber }}?
					</span>
					<span v-else>
						¿Desea anular la transferencia
						{{ transferSelected.transferNumber }}?
					</span>
				</v-card-title>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="green darken-1"
						flat="flat"
						:disabled="isLoading"
						@click.native="closeDialog('dialog')"
						>Cancelar</v-btn
					>
					<v-btn
						color="green darken-1"
						flat="flat"
						@click.native="changeState"
						:disabled="isLoading"
						>Aceptar</v-btn
					>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<action-sidebar
			:is-loading="loading"
			:title="action.title"
			:value="action.open"
			:width="action.width"
			:help-actions="actionsToHelp"
			@close-modal="closeSidebar"
		>
			<modal-transfers
				v-if="action.code === 'cancel'"
				@close-modal="closeModal"
				:id="idSelect"
			/>
			<finished-transfer
				v-if="codeActionIs('finished-transfer')"
				:loading="loadingTransfer"
				:products="products"
				:warehouse="warehouseSourceName"
				@validate-data="validateData"
				@call-to-action="transferFinished"
				@cancel-to-action="closeSidebar"
			/>
			<users-transfer
				v-if="codeActionIs('users-transfer')"
				:cancel-user-info="cancelUserInfo"
				:clearance-user-info="clearanceUserInfo"
				:created-user-info="createdUserInfo"
				:delivery-user-info="deliveryUserInfo"
				@close="closeSidebar"
			/>
			<transfer-end
				v-if="action.code === 'finalize'"
				@close-modal="closeModal"
				:id="idSelect"
				:data="select"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import { format, subDays } from 'date-fns';
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import Sales from '@/shared/sale';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import modalTransfers from '@/components/transfers/modal-transfers';
import appDateSelect from '@/components/shared/app-date-select';
import appSelect from '@/components/shared/app-select';
import appTable from '@/components/shared/table/app-table';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import finishedTransfer from '@/components/shared/transfers/finished-transfer';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import usersTransfer from '@/components/transfers/users-transfer';
import transferEnd from '@/components/transfers/transfers-end';

const Sale = new Sales();
const { compose, equality, find, getDeeper, map, setNewProperty } = lib;

function created() {
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = format(this.$today(), 'YYYY-MM-DD');
	this.loadResources();
	this.loadData(this.params.page);
}

function actionsDisabled() {
	const nameFilter = this.filterData.filter((f) => f.id === this.params.status)[0].name;
	const disabledCancel = !(nameFilter === 'Pendientes' && this.dataSelected.length >= 1);
	const disabledStart = !(nameFilter === 'Pendientes' && this.dataSelected.length === 1);
	const disabledFinalize = !(
		nameFilter === 'Iniciadas' && this.dataSelected.length === 1
	);
	const everyDataSelected = this.dataSelected.map((p) => p.warehouseOriginId);
	const validArray = [...new Set(everyDataSelected)];
	const disabledActions = [
		{ code: 'cancel', disabled: disabledCancel },
		{ code: 'start', disabled: disabledStart },
		{ code: 'finalize', disabled: disabledFinalize },
		{
			code: 'consolidated-transfers',
			disabled: !(
				nameFilter === 'Pendientes' &&
				this.dataSelected.length >= 1 &&
				validArray.length === 1
			),
		},
	];
	return disabledActions;
}

function changePage(page) {
	this.params.page = page;
	this.loadData(page);
}

async function changeState() {
	this.isLoading = true;
	const isStart = this.transferSelected && this.transferSelected.status === 1;
	const url = isStart ? 'start' : 'cancel';
	const details = isStart ? {} : null;
	try {
		await this.$httpProducts.patch(`transfers/${this.transferSelected.id}/${url}`, {
			details,
		});
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'TRANSFER_SERIE_IS_ACTIVE') {
				this.showNotification(
					'Ya existe una transferencia activa para esta serie. Finalízala antes de iniciar una nueva..',
					'error'
				);
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.dialog = false;
		this.isLoading = false;
		this.loadData();
	}
}

function changeStatus(value) {
	if (value === 1) {
		this.labelStatus = 'Pendientes';
	} else if (value === 2) {
		this.labelStatus = 'Iniciadas';
	} else if (value === 3) {
		this.labelStatus = 'Finalizadas';
	} else {
		this.labelStatus = 'Anuladas';
	}
	helper.removeLocalData('list-transfer');
	this.loadData(1);
}

function cleanFilters() {
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = format(this.$today(), 'YYYY-MM-DD');
	this.params.warehouseOriginId = null;
	this.params.warehouseSourceId = null;
	this.dataSelected = [];
	helper.removeLocalData('list-transfer');
	this.loadData(this.params.page);
}

function closeDialog(name) {
	this[name] = false;
}

function closeModal() {
	this.action.open = false;
	this.action.code = null;
	this.idSelect = null;
	const indexWarehouse = this.columns.findIndex((p) => p.value === 'warehouseOriginName');
	this.columns[indexWarehouse].name = `${this.labelWarehouse()} origen`;
	const indexWarehouseSource = this.columns.findIndex(
		(u) => u.value === 'warehouseSourceName'
	);
	this.columns[indexWarehouseSource].name = `${this.labelWarehouse()} destino`;
	this.dataSelected = [];
	this.loadData();
}

function closeSidebar() {
	this.action.open = false;
	this.action.code = '';
	this.action.title = 'FINALIZAR TRANSFERENCIA';
	this.action.width = 600;
	this.cancelUserInfo = {};
	this.clearanceUserInfo = {};
	this.createdUserInfo = {};
	this.deliveryUserInfo = {};
	this.products = [];
	this.transferId = 0;
	this.warehouseOriginName = '';
}

function codeActionIs(code) {
	return this.action.code === code;
}

function disabled() {
	return (
		this.loadingData ||
		this.disabledSearch ||
		!(this.params.startDate && this.params.endDate)
	);
}

function getData({ model, value }) {
	this.params[model] = value.id;
}

function getDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
	if (model === 'startDate') {
		this.params.endDate = null;
	}
	if (model === 'endDate') {
		this.loadData(1);
	}
	// const validDate =
	// 	differenceInDays(this.params.endDate, this.params.startDate) < 0;
	// this.disabledSearch = this.params.endDate && validDate;
	// if (this.params.endDate && validDate) {
	// 	this.showNotification(
	// 		'La fecha final no puede ser menor a la inicial.',
	// 		'info'
	// 	);
	// }
}

function openSeries(row) {
	this.action.code = 'view-series';
	this.action.open = true;
	this.action.title = `${row.serie}-${row.number} - SERIES`;
	this.action.width = 700;
	this.transferSerie = row;
	this.transferProduct = row.details[0].product;
}

function goToSaleCreate(transfer) {
	const productSelect = transfer.details.filter(
		(d) => d.status !== 4 && d.clearanceAmountSent - d.devolution > 0
	);
	const products = map(this.setProductObject(transfer), productSelect);
	helper.setLocalData('products-selected', products);
	const { flagStockDiscountSaleTransfer } = getDeeper(
		'company',
		'settings'
	)(this.$userInfo);
	this.goTo('new-sale', {
		query: { flagTransfer: flagStockDiscountSaleTransfer },
	});
}

function goToTracking({ id, code }) {
	this.goTo('pages-transfers-tracking', {
		params: { id },
		query: { status: this.params.status, type: code },
	});
}

async function loadData(page = 1) {
	this.params.page = page;
	this.loadingData = true;
	try {
		const response = await this.$httpProducts.get('transfers/list', {
			params: this.params,
		});
		this.data = response.data.results.map((item) => {
			const newItem = Object.assign({}, item);
			newItem.isSelected = false;
			newItem.transferNumber = `${item.serie}-${item.number}`;
			if (item.status === 1) {
				newItem.statusName = 'Pendiente';
			} else if (item.status === 2) {
				newItem.statusName = 'Iniciadas';
			} else {
				newItem.statusName = 'Finalizada';
			}
			return newItem;
		});
		this.data = this.data.map((item) => {
			const details = item.details[0];
			const serie =
				details && details.additionalInformation
					? details.additionalInformation.series
					: null;
			return { ...item, confirmSeries: Boolean(serie) };
		});
		this.lastPage = Number(response.headers['x-last-page']);
		this.itemsTotalQuantity = Number(response.headers['x-quantity']);
		if (this.params.status === 1) {
			this.matchDataSelected();
		} else {
			this.dataSelected = [];
		}
	} catch (err) {
		this.showGenericError();
	} finally {
		this.loadingData = false;
		this.cleanSearch = false;
	}
}

function matchDataSelected() {
	const localSelected = helper.getLocalData('list-transfer');
	if (localSelected && localSelected.length > 0) {
		localSelected.forEach((ls) => {
			const index = this.dataSelected.findIndex((ds) => ds.id === ls.id);
			if (index === -1) {
				this.dataSelected.push(ls);
			}
		});
		if (this.dataSelected && this.dataSelected.length > 0) {
			this.data = this.data.map((mp) => {
				const newProduct = { ...mp };
				const indexP = this.dataSelected.findIndex((ds) => ds.id === mp.id);
				newProduct.isSelected = indexP > -1;
				return newProduct;
			});
			this.checkAll = this.data.every((mp) => mp.isSelected);
			helper.setLocalData('list-transfer', this.dataSelected);
		}
	}
}

async function loadResources() {
	const requests = [this.listOfUnits(), this.$httpProducts.get('warehouses')];
	[{ data: this.units }, { data: this.warehouses }] = await Promise.all(requests);
	Sale.units = [...this.units];
}

function openConfirm(row) {
	this.transferSelected = Object.assign({}, row);
	this.dialog = true;
}

function openSidebar(row, code = 'finished-transfer') {
	this.action.code = code;
	if (this.action.code === 'users-transfer') {
		const {
			cancelUserInfo,
			clearanceUserInfo,
			createdUserInfo,
			deliveryUserInfo,
			number,
			serie,
		} = row;
		this.cancelUserInfo = cancelUserInfo;
		this.clearanceUserInfo = clearanceUserInfo;
		this.createdUserInfo = createdUserInfo;
		this.deliveryUserInfo = deliveryUserInfo;
		this.action.title = `# ${serie}-${number} - Movimientos de Usuarios`;
		this.action.width = 431;
	} else {
		const { id, details, warehouseSourceName } = row;
		const newDetails = [...details];
		this.products = newDetails.map((detail) => {
			const newDetail = { ...detail };
			newDetail.product.brandId = detail.brandId;
			newDetail.product.devolution = detail.devolution || 0;
			newDetail.product.quantity = detail.quantity;
			newDetail.product.readonly =
				detail.devolution <= 0 || detail.devolution > detail.quantity;
			newDetail.product.reason = detail.reason || '';
			newDetail.product.status = detail.status;
			return newDetail.product;
		});
		this.transferId = id;
		this.warehouseSourceName = warehouseSourceName;
	}
	this.action.open = true;
}

function preGoTo(row) {
	const routeData = this.$router.resolve({
		name: 'pages-transfers-detail',
		params: { id: row.id },
		query: { status: this.params.status },
	});
	window.open(routeData.href, '_blank');
}

function rowIsSelected(row) {
	({
		products: this.data,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selectedRows(row, this.data, this.dataSelected));
	helper.setLocalData('list-transfer', this.dataSelected);
}

function runAction({ code }) {
	const idWarehouse = helper.getLocalData('admin-user').warWarehousesId;
	this.idSelect = this.dataSelected[0].id;
	this.select = this.dataSelected[0];
	const flagGlobal = this.$userInfo.company.settings.flagImmediateTransfer || false;
	const validUser = flagGlobal && this.$userInfo.flagAdmin === 1;
	if (code === 'cancel') {
		if (idWarehouse === this.dataSelected[0].warehouseOriginId) {
			this.action.code = code;
			this.action.title = 'ANULAR';
			this.action.width = 500;
			this.action.open = true;
		} else {
			this.showGenericError(
				`Usuario no permitido para anular transferencia, solo usuarios del almacen ${this.dataSelected[0].warehouseOriginName} puede incializar la transferencia`
			);
		}
	} else if (code === 'finalize') {
		if (validUser ? true : idWarehouse === this.dataSelected[0].warehouseSourceId) {
			this.action.code = code;
			this.action.title = 'FINALIZAR';
			this.action.open = true;
			this.action.width = 570;
		} else {
			this.showGenericError(
				`Usuario no permitido para finalizar transferencia, solo usuarios del almacen ${this.dataSelected[0].warehouseSourceName} puede incializar la transferencia`
			);
		}
	} else if (code === 'start') {
		if (
			idWarehouse === this.dataSelected[0].warehouseOriginId ||
			this.$userInfo.flagAdmin === 1
		) {
			this.goTo('page-transfers-start', {
				params: { id: this.dataSelected[0].id },
			});
		} else {
			this.showGenericError(`Usuario no permitido para inicializar transferencia,
				solo usuarios del almacen ${this.dataSelected[0].warehouseOriginName} puede
				incializar la transferencia`);
		}
	} else if (code === 'consolidated-transfers') {
		this.transferConsolidated();
	}
}

async function transferConsolidated() {
	const warehouseId = this.dataSelected.map((war) => war.warehouseSourceId);
	const transfersId = this.dataSelected.map((row) => row.id);
	const body = {
		transferIds: transfersId.length === 1 ? [transfersId[0]] : transfersId,
		warehouseOriginId: this.dataSelected[0].warehouseOriginId,
		warehouseId: warehouseId.length === 1 ? [warehouseId[0]] : warehouseId,
	};
	try {
		const response = await this.$httpProducts.post('transfers/consolidation', body);
		const { id } = response.data;
		const params = {
			idConsolidated: id,
		};
		this.goTo('pages-consolidated-transfer', { params });
	} catch (error) {
		this.showGenericError();
	}
}

function searchTransfer(search) {
	const searchTrim = search ? search.trim() : '';
	if (!searchTrim) {
		this.cleanSearch = true;
	}
	this.params.search = searchTrim || null;
	this.loadData();
}

function selectedAll(value) {
	({
		products: this.data,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.data, this.dataSelected));
}

function setData(value, model) {
	if (value) {
		this.params[model] = value.id;
	}
	if (model === 'warehouseOriginId') {
		this.loadData(1);
	}
}

function setProductObject(transfer) {
	const warehouseId = transfer.warehouseSourceId;
	const { name: warehouseName } = find(
		equality('id', transfer.warehouseSourceId),
		this.warehouses
	);
	return function inner(detail) {
		const { product, brandId } = detail;
		const obj = {
			id: product.id,
			taxes: product.taxes,
			type: product.type,
		};
		const quantity = Number(detail.clearanceAmountSent - detail.devolution);
		return compose(
			setNewProperty('units', Sale.unitsByProduct(product)),
			setNewProperty('warehouseName', warehouseName),
			setNewProperty('warehouseId', warehouseId),
			setNewProperty('brandId', brandId),
			setNewProperty('quantity', quantity),
			setNewProperty('product', obj)
		)(product);
	};
}

function showDispatch() {
	this.filterData = this.filterData.map((filter, index) => {
		const newFilter = { ...filter };
		if (index === 1) {
			newFilter.name =
				this.$route.name === 'dispatch-transfers' ? 'Por despachar' : 'Iniciadas';
		}
		return newFilter;
	});
	return this.filterData;
}

function toggleColumns() {
	return true;
}

async function transferFinished(model) {
	this.loadingTransfer = true;
	try {
		await this.$httpProducts.patch(`transfers/${this.transferId}/finished`, model);
		this.showNotification('La transferencia ha sido finalizada correctamente.');
		this.params.status = 3;
		this.closeSidebar();
		this.loadData();
	} catch (err) {
		this.showGenericError();
	} finally {
		this.loadingTransfer = false;
	}
}

function validateData({ id, products }) {
	this.products = products.map((prod) => {
		const newProduct = { ...prod };
		if (id === prod.id) {
			newProduct.readonly = prod.devolution > prod.quantity || prod.devolution <= 0;
		}
		return newProduct;
	});
}

async function goToPrint(report, transf) {
	const now = format(new Date(), 'YYYY_MM_HH_mm_ss');
	const { name, lastname } = this.$userInfo;
	const paramsDetail = {
		transferId: transf.id,
		status: 1,
	};
	const paramsvalued = {
		code: report.code,
		transfersId: [transf.id],
	};
	const documentData = {
		filename: `${report.name}_${now}`,
		extension: 'pdf',
		comment:
			report.id === 1
				? `detalle_de_transferencia_ generado_por_${name}_${lastname}`
				: undefined,
		params: report.id === 1 ? paramsDetail : paramsvalued,
	};
	await this.$httpReports.post(`documents/${report.code}`, documentData);
	this.notificationReport(report.name);
}

async function downLoadExcelReport() {
	if (!this.params.warehouseOriginId) {
		this.showGenericError(
			'Debe seleccionar una tienda de origen para generar el reporte'
		);
		return;
	}
	// const warehousesParams = this.dataSelected.reduce((acum, item) => {
	// 	const findData = acum.find((p) => p.id === item.warehouseSourceId);
	// 	if (!findData) {
	// 		acum.push({ id: item.warehouseSourceId, name: item.warehouseSourceName });
	// 	}
	// 	return acum;
	// }, []);
	const params = {
		startDate: this.params.startDate || undefined,
		endDate: this.params.endDate || undefined,
		transferIds:
			(this.dataSelected.length && this.dataSelected.map((p) => p.id)) || undefined,
		warehouseOriginId: this.params.warehouseOriginId,
		status: this.params.status,
		// warehouses: (warehousesParams.length && warehousesParams) || undefined,
	};
	const { name, lastname } = this.$userInfo;
	const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
	const body = {
		filename: `transferencias_pendientes - ${now} - Estado: ${this.labelStatus}`,
		extension: 'xlsx',
		comment: `REPORTE_DE_TRANSFERENCIAS_PENDIENTES_${name}_${lastname}`,
		params,
	};
	await this.$httpReports.post('documents/detail-transfer-inicial-master', body);
	helper.removeLocalData('list-transfer');
	this.showExcelGenerateMessage();
}

function computedExcel() {
	const everyDataSelected = this.dataSelected.map((p) => p.warehouseOriginId);
	const validArray = [...new Set(everyDataSelected)];
	if (this.params.startDate && this.params.endDate) return false;
	if (validArray.length === 1 && this.params.startDate && !this.params.endDate)
		return true;
	if (validArray.length === 1) return false;
	return true;
}

function data() {
	return {
		valueDisabled: [],
		action: {
			code: '',
			open: false,
			title: 'FINALIZAR TRANSFERENCIA',
			width: 600,
		},
		cancelUserInfo: {},
		clearanceUserInfo: {},
		cleanSearch: false,
		columns: [
			{
				id: 1,
				name: 'Número',
				value: 'transferNumber',
				visible: true,
				checked: true,
			},
			{ id: 2, name: 'T. Doc.', value: 'code', visible: true, checked: true },
			{
				id: 3,
				name: 'Tienda origen',
				value: 'warehouseOriginName',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Tienda destino',
				value: 'warehouseSourceName',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Estado',
				value: 'statusName',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Observaciones',
				value: 'observations',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Fecha de creación',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Última actualización',
				value: 'clearanceDate',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Fecha de anulación',
				value: 'cancelDate',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		createdUserInfo: {},
		data: [],
		deliveryUserInfo: {},
		dialog: false,
		dialogDetails: false,
		disabledSearch: false,
		filterData: [
			{ id: 1, name: 'Pendientes' },
			{ id: 2, name: 'Iniciadas' },
			{ id: 3, name: 'Finalizadas' },
			{ id: 4, name: 'Anuladas' },
		],
		filterValue: 1,
		isLoading: false,
		labelStatus: '',
		lastPage: 0,
		loading: false,
		loadingData: false,
		loadingTransfer: false,
		localSearch: '',
		showExcel: false,
		params: {
			endDate: null,
			page: 1,
			limit: 40,
			search: null,
			startDate: null,
			warehouseOriginId: null,
			warehouseSourceId: null,
			status: 1,
		},
		products: [],
		properties: ['name'],
		transferId: 0,
		transferSelected: null,
		units: [],
		warehouses: [],
		warehouseSourceName: '',
		dataSelected: [],
		checkAll: false,
		idSelect: null,
		select: [],
		clickOne: false,
		itemsTotalQuantity: 0,
		transferSerie: {},
		transferProduct: {},
		listReports: [
			{
				id: 1,
				code: 'transfer-product-group-pdf',
				name: 'Reporte de transferencia agrupado valorizado',
			},
		],
		listReportsDetail: [
			{
				id: 1,
				code: 'detail-transfer-pdf',
				name: 'Reporte del detalle de transferencias',
				visible: true,
			},
			{
				id: 2,
				code: 'transfer-product-details-pdf',
				name: 'Reporte de transferencia detallado valorizado',
				visible: !this.$userInfo.flagNotShowCostPrice,
			},
		],
	};
}

export default {
	name: 'list-of-transfers',
	components: {
		modalTransfers,
		actionSidebar,
		appDateSelect,
		appSelect,
		appActions,
		appTable,
		autocompleteComponent,
		finishedTransfer,
		generalFilter,
		headerPage,
		usersTransfer,
		transferEnd,
	},
	computed: {
		computedExcel,
		disabled,
		showDispatch,
		actionsDisabled,
	},
	created,
	data,
	methods: {
		changeStatus,
		matchDataSelected,
		closeModal,
		runAction,
		changePage,
		changeState,
		cleanFilters,
		closeDialog,
		closeSidebar,
		codeActionIs,
		downLoadExcelReport,
		getData,
		getDate,
		goToSaleCreate,
		loadData,
		loadResources,
		openConfirm,
		openSidebar,
		searchTransfer,
		setData,
		setProductObject,
		toggleColumns,
		transferConsolidated,
		transferFinished,
		validateData,
		selectedAll,
		rowIsSelected,
		goToTracking,
		preGoTo,
		goToPrint,
		openSeries,
		async downLoadPdf(code) {
			const report = this.listReports.find((r) => r.code === code);
			const ids = this.dataSelected.map((m) => m.id);
			if (report) {
				const body = {
					extension: 'pdf',
					filename: report.name,
					params: {
						code,
						transfersId: ids.length ? ids : undefined,
					},
				};

				try {
					await this.$httpReports.post(`documents/${code}`, body);
					this.notificationReport(report.name);
				} catch (error) {
					this.showGenericError();
				}
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.filter {
	&-toggle {
		box-shadow: none;

		.btn {
			color: map-get($colors, grey-border) !important;
			font-family: map-get($fonts, lato-regular);
			font-size: map-get($sizes, medium);
			height: 30px;
			text-transform: none;

			&--active {
				border-color: map-get($colors, grey-border);
				color: map-get($colors, blue-card) !important;
			}
		}
	}
}

.create-sale {
	background-color: transparent !important;
	box-shadow: none;
	margin: 0px;
	min-width: auto;

	.icon {
		font-size: 20px;
	}
}
</style>
