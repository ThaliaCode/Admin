<template>
	<div>
		<div>
			<app-loading
				:show-loading="showLoading"
				label="La carga terminará en un momento y podrás ver
            	toda la información del listado de ventas"
			/>
		</div>
		<header-page
			:clean-disabled="onLoadData"
			:columns="columns"
			export-to-pdf
			name="sales"
			:options="options"
			:rows="dataSelected"
			:title="salesTitle"
			to-show
			:show-excel="false"
			show-excel-menu
			@clean-product-filter="onCleanData"
			@download-dispatch="downloadSaleList"
			@emit-excel="emitExcel"
			@click-menu="clickMenu"
			:open-on-click="isSelectWarehouses"
		>
			<span class="mr-4">Total: {{ totalSalesAmount | round }}</span>
		</header-page>
		<app-actions
			v-if="!ballotSummaryId && !summaryUnsubscribeId"
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter class="layout wrap py-3">
			<v-flex xs12 sm6 md4 mb-2 pr-2>
				<autocomplete-component
					chips
					item-text="name"
					item-value="id"
					:items="warehouses"
					:label-value="labelWarehouse()"
					multiple
					resource-url="/warehouses"
					:return-object="false"
					:http-code="'$httpProducts'"
					:item="warehouseIds"
					@return-data="setData($event, 'warehouseIds')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12 sm6 md4 mb-2>
				<autocomplete-component
					chips
					item-text="name"
					item-value="id"
					:items="convertStates"
					label-value="Estado de conversion"
					multiple
					:return-object="false"
					:item="convertStatusIds"
					@return-data="setData($event, 'convertStatusIds')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12 sm6 md2 px-2 mb-2>
				<autocomplete-component
					item-text="name"
					item-value="code"
					:items="status"
					label-value="Estado"
					resource-url="/sales/states"
					return-object
					:http-code="'$httpSales'"
					:item="params.status"
					@return-data="setData($event, 'status')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12 sm6 md2 px-2 mb-2 v-if="isAdmin">
				<autocomplete-component
					chips
					multiple
					:return-object="false"
					item-text="fullname"
					item-value="id"
					:items="employees"
					label-value="Empleado"
					resource-url="/employees"
					:http-code="'$httpSales'"
					:item="employeeIds"
					@return-data="setData($event, 'employeeIds')"
				></autocomplete-component>
			</v-flex>
			<!-- <v-flex xs12 sm6 md3 pr-2 mb-2>
				<autocomplete-component
					chips
					item-text="name"
					item-value="id"
					:items="typePayments"
					label-value="T. Pago"
					multiple
					object-data="paymentType"
					resource-url="/type-payments?flagType=1"
					:return-object="false"
					:http-code="'$httpSales'"
					:item="typePaymentParams"
					@return-data="setData($event, 'typePaymentParams')"
				></autocomplete-component>
			</v-flex> -->
			<v-flex xs12 sm6 md3 px-2 mb-2>
				<autocomplete-component
					item-text="name"
					item-value="id"
					:items="paymentStates"
					label-value="E. Pago"
					resource-url="/payment-states"
					return-object
					:http-code="'$httpSales'"
					:item="params.paymentState"
					@return-data="setData($event, 'paymentState')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12 sm6 md3 mb-2>
				<person-search-input
					:search-value="selectedCustomer"
					:flagInputEvent="true"
					@search="openSearchCustomer"
				/>
			</v-flex>
			<v-flex xs12 sm6 md2 pr-2 ml-2 mb-2 v-if="isPeru && currencies.length > 1">
				<app-select
					chips
					:item="params.currencies"
					item-text="name"
					item-value="code"
					:items="currencies"
					label="Tipos de Moneda"
					model="currencies"
					multiple
					@input="getData"
				/>
			</v-flex>
			<v-flex xs12 sm6 md2 pr-2 mb-2 v-if="showStateEntity">
				<app-select
					item-text="name"
					item-value="id"
					:item="params.entityStateId"
					label="Estado de Entidad"
					:items="statesEntity"
					model="entityStateId"
					:return-object="false"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs12 sm6 md3 px-2 mb-2 v-if="!ballotSummaryId && !summaryUnsubscribeId">
				<v-layout wrap align-center>
					<v-flex xs6 pr-2>
						<label class="caption">Fecha inicial</label>
						<date-component
							:date="params.startDate"
							icon="/static/img/calendar.svg"
							@on-input="setDate({ model: 'startDate', value: $event })"
						></date-component>
					</v-flex>
					<v-flex xs6 pl-2>
						<label class="caption">Fecha Final</label>
						<date-component
							:date="params.endDate"
							icon="/static/img/calendar.svg"
							@on-input="setDate({ model: 'endDate', value: $event })"
						></date-component>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 sm6 md1 pl-2 pt-3>
				<v-layout wrap align-center>
					<v-flex xs12 pr-1>
						<v-btn
							:disabled="onLoadData"
							type="button"
							color="primary"
							class="btn-action pa-2 px-2"
							@click="searchDataFiltered"
						>
							Buscar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 sm6 md1 pl-2 pt-3 v-if="Number($route.query.statusTaxSri) === 4">
				<v-layout wrap align-center>
					<v-flex xs12 pr-1>
						<v-btn
							:disabled="onLoadData || !dataSelected.length"
							type="button"
							color="primary"
							class="btn-action btn-action-block"
							@click="unLinkDocuments"
						>
							Desvincular
						</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
		</general-filter>
		<div class="layout wrap align-start justify-center">
			<v-flex :class="toShow ? 'xs8 active' : 'xs12'">
				<app-table
					:indexes-cancel="indexesCancel"
					include-filter
					local-storage
					selectable
					name="sales"
					:check-all="checkAll"
					:clean-search="isTableClean"
					:columns="columns"
					:current-page="currentPage"
					:key-value="keyValue"
					:last-page="lastPage"
					:rows="data"
					:items-quantity="data.length"
					:items-total-quantity="itemsTotalQuantity"
					:disabled-search="disabledSearch"
					@on-page="changePage"
					@on-search-event="callServiceAndSearch"
					@on-selected-all="selectedAll"
					@set-search-text="setSearch"
					@on-toggle-columns="toggleColumns"
					@row-is-selected="rowIsSelected"
					@on-column-sortable="columnSortable"
					:include-filter="false"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">
							{{ props.row.subsidiary.sucursalName }}
						</td>
						<td v-show="showRow(columns, 2)">{{ props.row.warehouseName }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.customerData }}</td>
						<td class="document-column" v-show="showRow(columns, 4)">
							<app-tooltip-button
								v-if="!!props.row.flagOldSale"
								class="icon-container"
								:height="16"
								icon="history"
								text="Venta Histórica"
							></app-tooltip-button>
							<div
								v-if="props.row.originalRelatedDocument"
								@click="openRelatedModal(props.row)"
								class="related-document"
								:class="getCancelClass(props.row)"
							>
								{{ props.row.docNumber }}
							</div>
							<span :class="getCancelClass(props.row)" v-else>
								{{ props.row.docNumber }}
							</span>
						</td>
						<td v-show="showRow(columns, 5)">
							<v-tooltip top>
								<span slot="activator">{{ props.row.createdAt }}</span>
								<span>{{ props.row.createdAtOrigin }}</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 6)">
							<document-state
								:color="props.row.state.color"
								:tooltip="props.row.state.name"
							/>
						</td>
						<td v-show="showRow(columns, 7)">
							<document-state
								:color="props.row.paymentStateColor"
								:tooltip="props.row.paymentStateName"
								@click-state="showTransactions(props.row)"
							/>
						</td>
						<td v-show="showRow(columns, 8)">
							{{ props.row.convertStatus ? props.row.convertStatus.name : '' }}
						</td>
						<td v-show="showRow(columns, 9)">
							{{ props.row.convertStatus ? props.row.convertStatus.name : '' }}
						</td>
						<td v-show="showRow(columns, 10)">
							<span
								v-if="props.row.relatedDocuments && props.row.relatedDocuments.length"
							>
								<span
									mt-2
									mb-4
									v-for="(item, index) in props.row.relatedDocuments"
									:key="index"
								>
									<a :href="`#`" @click="goToDetail(item)" target="_blank">
										{{ item.typeDocument }} - {{ item.numberComplete }}
									</a>
									<br />
								</span>
							</span>
							<span v-else mt-2 mb-4>-</span>
						</td>
						<td v-show="showRow(columns, 11)">
							<document-state
								:color="colorSyncFirebase(props.row)"
								:tooltip="syncFirebase(props.row)"
							/>
						</td>
						<td v-show="showRow(columns, 12)" class="document-column">
							<document-state
								:color="colorSyncSend(props.row)"
								:tooltip="syncStatusSend(props.row)"
							/>
						</td>
						<td v-show="showRow(columns, 13)">
							{{ props.row.employee ? props.row.employee.fullname : null }}
						</td>
						<td v-show="showRow(columns, 14)">
							{{ props.row.currencySymbol }} {{ props.row.amount | round }}
						</td>
						<td v-show="showRow(columns, 15)" @click.stop="stopClick">
							<v-tooltip top>
								<a
									slot="activator"
									@click.stop.prevent="downloadSale(props.row)"
									class="table-icon"
								>
									<v-icon color="primary">save_alt</v-icon>
									<!-- <v-icon v-else color="primary">picture_as_pdf</v-icon> -->
								</a>
								<span>
									{{ labelConfigSale }}
								</span>
							</v-tooltip>
							<app-tooltip-button
								icon="picture_as_pdf"
								text="Descargar PDF"
								color="primary"
								size="16"
								@click-icon="downloadPdf(props.row)"
							/>
							<app-tooltip-button
								icon="remove_red_eye"
								text="Ver Detalle"
								color="primary"
								size="16"
								@click-icon="preGoTo(props.row)"
							/>
							<!-- <app-tooltip-button
								:img="`${$imageUrl}/setting.svg`"
								text="Visualizar Cotización"
								@click-icon="showDetails(props.row)"
							/> -->
							<app-tooltip-button
								icon="edit"
								color="primary"
								:text="
									props.row.convertStatus.id === 3
										? 'No se puede editar una cotización una vez que ya convertida a venta'
										: 'Editar Cotización'
								"
								:disabled="props.row.convertStatus.id === 3"
								@click-icon="goToDetailQuation(props.row.id)"
							/>
							<app-tooltip-button
								icon="control_point_duplicate"
								color="primary"
								text="Clonar cotización"
								:disabled="props.row.convertStatus.id === 3"
								@click-icon="goToCloneQuation(props.row.id)"
							/>
							<app-tooltip-button
								:disabled="
									$userInfo.company.settings
										? $userInfo.company.settings.flagMultipleSalesConversionsQuote &&
										  props.row.convertStatus.id === 3
										: false
								"
								:text="
									$userInfo.company.settings.flagMultipleSalesConversionsQuote &&
									props.row.convertStatus.id === 3
										? 'No se puede volver a convertir una cotización'
										: 'Convertir a Venta'
								"
								icon="content_paste_go"
								color="primary"
								size="16"
								@click-icon="convertCot(props.row)"
							/>
							<app-tooltip-button
								v-if="
									props.row.state.id === 2 && $userInfo.company.settings.COTMoveKardex
								"
								:disabled="props.row.convertStatus.id === 3"
								icon="inventory"
								color="blue"
								text="Reservar Stock"
								size="16"
								@click-icon="reserveStock(props.row)"
							/>
						</td>
					</template>
				</app-table>
			</v-flex>
		</div>
		<action-sidebar
			:width="action.width"
			v-model="action.open"
			:code-action="action.code"
			:title="action.title"
			:active="action.active"
			:img-src="action.imgSrc"
			:is-loading="loading"
			:header-color="action.color"
			:help-actions="actionsToHelp"
			@close-modal="cancelModal"
		>
			<person-search-form
				v-if="action.code === 'customer-searcher'"
				:search-value="searchValCustomer"
				@add-person="setCustomer"
			/>
			<fast-products-action
				v-if="action.code === 'CR' || action.code === 'VR'"
				:col-type-document="colTypeDocument"
				:data-selected="saleSelected"
				:page-code="action.code"
				:sale-data="saleData"
				@finish-action="loadData"
				@cancel-modal="cancelModal"
			/>
			<document-convert
				v-if="isDocumentConvert"
				:sale="saleData"
				:products="saleSelected"
				@cancel-modal="cancelModal"
				@convert="convert"
			/>
			<transactions-detail
				class="pa-4"
				v-if="showTransactionsDetails"
				:transactions="transactions"
			>
				<section class="modal-filter-footer">
					<modal-sidebar-button
						hidden
						success-color="primary"
						success-text="Cerrar"
						@accept-button-clicked="cancelModal(false)"
					/>
				</section>
			</transactions-detail>
			<amortizations-form
				v-if="showDebts"
				:bank-accounts="bankAccounts"
				:currency="sale.currency"
				:currency-symbol="sale.currencySymbol"
				:sale-data="amortization"
				:total-to-pay="sale.debtAmount"
				:type-payments="typePayments"
				is-sale
				@amortization-paid="onAmortizationPaid"
				@close-modal="cancelModal(false)"
			/>
			<related-documents
				v-if="isRelatedDocuments"
				:sale="originalDocument"
				@close="cancelModal(false)"
			/>
			<summary-unsubscribe
				v-if="action.code === 'summary-unsubscribe'"
				@close="cancelModal(false)"
				@send-summary="unsubscribeSales"
			/>
		</action-sidebar>
		<v-dialog v-model="dialogDetails" max-width="800">
			<v-card>
				<v-card-title v-if="rowSelected" class="headline justify-center"
					>Lista de productos de la venta {{ rowSelected.docNumber }}
				</v-card-title>
				<div class="overflow-auto pb-4">
					<app-table
						name="saleDetail"
						:columns="saleDetailsColumns"
						:rows="rowDetails"
						:key-value="saleDetailsKeyValue"
						local-storage
						local-search
						:main-list="false"
						:clean-search="isClean"
						@on-toggle-columns="toggleColumns"
					>
						<template slot="rows" slot-scope="props">
							<td class="is-not-selectable" v-show="showRow(saleDetailsColumns, 1)">
								{{ props.row.product.code }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 2)">
								{{ props.row.product.autoBarcode }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 3)">
								{{ props.row.product.name }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 4)">
								{{ props.row.product.inlineFeatures }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 5)">
								{{ props.row.product.description }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 6)">
								{{ props.row.product.location }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 7)">
								{{ props.row.product.brandName }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 8)">
								{{ props.row.price | round }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 9)">
								{{ props.row.quantity }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 10)">
								{{ props.row.product.warBrandStock || 0 }}
							</td>
							<td v-show="showRow(saleDetailsColumns, 11)">
								{{ props.row.product.weigth }}
							</td>
						</template>
					</app-table>
					<v-divider></v-divider>
				</div>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="green darken-1" flat="flat" @click.native="closeDialog"
						>Cerrar</v-btn
					>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="modal.open" persistent max-width="425">
			<v-card>
				<v-card-title class="headline justify-center">
					{{ modal.message }}
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-btn
							color="primary"
							class="btn-action white--text"
							@click.native="closeModalError"
						>
							{{ modal.btnText }}
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogSend" persistent max-width="450">
			<modal-items
				v-if="dialogSend"
				title="Enviar Comprobante"
				name-action="Enviar"
				:disabled="this.emails.length === 0"
				show-slot
				@close-modal="closeModalSend"
				@action-modal="sendRecords"
			>
				<v-flex class="pt-2 px-4">
					<label class="info--text bold"
						>Si desea enviar más de un correo, presione la tecla enter luego de escribir
						el primer email.</label
					>
				</v-flex>
				<div class="pa-4">
					<label class="caption">Correo Electrónico</label>
					<v-select
						class="filter-select shadow-inset tag-select"
						chips
						clearable
						label="Correo Electrónico"
						single-line
						tabindex="7"
						tags
						v-model="emails"
					>
						<template slot="selection" slot-scope="data">
							<v-chip class="tag-chip" close @input="removeEmail(data.item)">
								{{ data.item }}
							</v-chip>
						</template>
					</v-select>
					<span class="form-group__message" v-if="this.emails.length === 0">
						Se debe agregar al menos un correo electrónico
					</span>
				</div>
			</modal-items>
		</v-dialog>
		<app-show-dialog
			title-header="ANULAR DOCUMENTO"
			text-content="Este documento no puede ser anulado, por que aún esta activo en la SRI"
			:show-modal-init="showModalInit"
			max-width-dialog="571px"
			@close-dialog="closeDialogInit"
		/>
	</div>
</template>

<script>
import { differenceInDays, format, subDays } from 'date-fns';
import { LIST_QUOTATION, DETAIL_QUOTATION } from '@/shared/reports';
import actionSidebar from '@/components/shared/action-sidebar';
import amortizationsForm from '@/components/amortizations/amortizations-form';
import appActions from '@/components/shared/app-actions';
import appDateSelect from '@/components/shared/app-date-select';
import appSelect from '@/components/shared/app-select';
import appTable from '@/components/shared/table/app-table';
import appTooltipButton from '@/components/shared/app-tooltip-button';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import dateComponent from '@/components/shared/date-component';
import documentConvert from '@/components/sales/subcomponents/document-convert';
import documentState from '@/components/shared/document-state';
import fastProductsAction from '@/components/shared/product/fast-products-action';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import salesDetailsInTable from '@/components/sales/sales-details-in-table';
import salesSunatDetails from '@/components/sales/sales-sunat-details';
import salesCancel from '@/components/sales/sales-cancel';
import relatedDocuments from '@/components/sales/related-documents';
import transactionsDetail from '@/components/sales/subcomponents/transactions-detail';
import summaryUnsubscribe from '@/components/sales/summary-unsubscribe';
import modalItems from '@/components/shared/modal-items';
import appShowDialog from '@/components/shared/app-show-dialog';
import personSearchForm from '@/components/shared/searcher/person-search-form';
import personSearchInput from '@/components/shared/searcher/person-search-input';
import salesCancelNew from '@/components/sales/sales-cancel-new';
import lib from '@/shared/lib';
import quotationStates from '@/shared/quotation-states';

const { compose, getDeeper, reduce, setNewProperty, setNewPropertyByFunction } = lib;

function actionsDisabled() {
	const disabledSaleDelete = this.dataSelected.length !== 1;
	return [
		{ code: 'override', disabled: disabledSaleDelete },
		{ code: 'referral-guide', disabled: disabledSaleDelete },
		{ code: 'un-subscribe', disabled: disabledSaleDelete },
	];
}

function allIsSelected() {
	this.checkAll = this.data.every((check) => check.isSelected);
}

function callServiceAndSearch(search) {
	this.searchData = search;
	if (search) {
		this.params.search = search;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
	this.loadData();
}

function cancelModal(value) {
	this.action.code = null;
	this.action.open = value;
	this.showTransactionsDetails = false;
	this.showDebts = false;
	this.validSale = {};
}

function cancelSale() {
	const sale = this.dataSelected[0];
	const allowedDocCodes = this.isEcuador
		? ['BOL', 'NTV', 'FAC', 'NTC']
		: ['BOL', 'NTV', 'FAC'];
	const allowedDocs = allowedDocCodes.map((docCode) => {
		const item = this.typeDocuments.find((td) => td.code === docCode) || {};
		return item.name;
	});
	const message = this.documentSelect === 'NTC' ? 'Nota de Crédito' : 'Venta';
	if (allowedDocCodes.includes(sale.typeDocumentCode)) {
		this.rowSelected = sale;
		this.action.code = 'CANCEL-SALE';
		this.action.title =
			this.validSale.validated.flagCancel && this.isPeru
				? `Anular ${message} #${this.rowSelected.documentNumber} POR NOTA DE CRÉDITO`
				: `Anular ${message} #${this.rowSelected.documentNumber}`;
	} else {
		this.showNotification(`Solo se puede anular una ${allowedDocs.join(', ')}`, 'info');
	}
}

function changePage(page) {
	this.currentPage = page;
	this.allIsSelected();
	this.loadData(page);
}

function closeDialog() {
	this.dialog = false;
	this.dialogDetails = false;
	this.saleId = 0;
	this.rowSelected = null;
}

async function convert({ body, url }) {
	const newBody = { ...body };
	newBody.warehouseCodeTaxes = this.currentWarehouseData.warehouseCodeTaxes;
	newBody.warehouseName = this.currentWarehouseData.warehouseName;
	try {
		await this.$httpSales.post(url, newBody);
		this.showNotification(
			'Uno o más productos de los seleccionados ya ha sido usado al convertir documento.'
		);
		this.cancelModal(false);
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'SERIE_INVALID') {
				this.showNotification('La serie no corresponde al tipo de documento.', 'error');
			}
			if (err.data.message === 'SALE_DETAILS_FLAG_USE_INVALID') {
				this.showNotification('El documento ya ha sido convertido.', 'error');
			}
			if (err.data.message === 'SALE_DUPLICATE_ERROR') {
				this.showGenericError('La venta ya ha sido registrada');
			}
		}
	}
}

async function created() {
	const indexWarehouse = this.columns.findIndex((k) => k.value === 'sucursalName');
	this.columns[indexWarehouse].name = this.labelSucursal();
	this.columns[indexWarehouse].tooltip = `Nombre de ${this.labelSucursal()}`;
	this.isQuotationList = this.$route.fullPath.includes('quotation');
	this.showLoading = true;
	const showReservedStock = this.$userInfo.company.settings.COTMoveKardex || false;
	this.columns[11].visible = showReservedStock;
	this.columns[11].flagVisible = !showReservedStock;
	if (this.ballotSummaryId || this.summaryUnsubscribeId) {
		const { ballotSummaryDate, summaryUnsubscribeDate } = this.$route.query;
		const dateToSplit = ballotSummaryDate || summaryUnsubscribeDate;
		const newBallotDate = dateToSplit.split('-');
		const day = newBallotDate[0];
		const month = newBallotDate[1];
		const year = newBallotDate[2];
		this.params.startDate = `${year}-${month}-${day}`;
		this.params.endDate = `${year}-${month}-${day}`;
	} else {
		this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
		this.params.endDate = this.$today();
	}
	await this.filterData();
	if (this.$route.query.customerId) {
		this.loadCustomers(this.$route.query.customerId);
	} else if (!this.ballotSummaryId && !this.summaryUnsubscribeId) {
		this.loadData();
	}
}

async function downloadPdf({ id, serie, number }) {
	try {
		const url = `sale-documents/${id}/pdf`;
		const model = { code: 'pdf' };
		const params = { downloadSale: true };
		const contentType = 'application/pdf';
		const responseType = 'blob';
		const response = await this.$httpSales.post(url, model, {
			params,
			responseType,
		});
		const blob = helper.generateBlob(response.data, contentType);
		helper.showDownloadDialog(blob, `${serie}-${number}`, 'pdf', true);
	} catch (error) {
		this.showGenericError();
	}
}

async function downloadSale({ id, serie, number }) {
	try {
		const url = `sale-documents/${id}/pdf`;
		const downloadDialog = this.$userInfo.company.settings.downloadSale;
		const params = { html: downloadDialog || null };
		const model = { code: 'pdf' };
		const responseType = 'blob';
		const contentType = downloadDialog ? 'application/pdf' : 'text/html';
		if (this.$route.name === 'quotations-list' && this.showConfigurationQuotation) {
			model.code = 'pdf-quotitation';
		}
		const response = await this.$httpSales.post(url, model, {
			params,
			responseType,
		});
		const blob = helper.generateBlob(response.data, contentType);
		helper.showDownloadDialog(blob, `${serie}-${number}`, 'pdf', downloadDialog);
	} catch (error) {
		this.showGenericError();
	}
}

function generateExportParams(codeReport, prefixName) {
	let salStatesId;
	if (this.params.status) {
		salStatesId = this.status.find((td) => td.code === this.params.status).id;
	}
	const params = {
		countryCode: this.labelsByCountry.code,
		endDate: this.params.endDate,
		employeeId: this.params.employeeId || undefined,
		paymentState: this.params.paymentState || undefined,
		salStatesId,
		salTypeDocumentId: this.params.typeDocumentIds,
		search: this.params.search || undefined,
		startDate: this.params.startDate,
		statusTaxSri: this.params.statusTaxSri || undefined,
		currencies: this.params.currencies.reduce((a, c) => {
			const newA = { ...a };
			newA[c.code] = { typeSymbol: c.symbol, typeCurrency: c.code };
			return newA;
		}, {}),
		taxName: this.$userInfo.company.country.taxName,
	};
	if (this.warehouseIds.length > 0) {
		params.warehouseIds = this.warehouseIds;
	}
	if (this.convertStatusIds.length > 0) {
		params.convertStatusIds = this.convertStatusIds.join(',');
	}
	if (this.saleIds.length > 0) {
		params.saleIds = this.saleIds;
	}
	if (this.employeeIds.length > 0) {
		params.employeeIds = this.employeeIds;
	}
	if (this.typeDocumentIds.length > 0) {
		params.typeDocumentIds = this.typeDocumentIds;
	}
	if (codeReport === 'list-sales') {
		params.documentTypesNot = this.params.documentTypesNot || undefined;
		params.typePaymentIds = this.params.typePaymentIds || undefined;
		params.status = this.params.status || undefined;
		params.customerId = this.params.customerId || undefined;
		if (this.isPeru) {
			params.statusTax = params.statusTaxSri || undefined;
			params.statusTaxSri = undefined;
		}
	}
	if (codeReport === 'sellers-soles-boxes-xlsx') {
		params.documentTypesNot = this.params.documentTypesNot || undefined;
		params.typePaymentIds = this.params.typePaymentIds || undefined;
		params.status = this.params.status || undefined;
		params.customerId = this.params.customerId || undefined;
		params.saleIds = this.params.saleIds || undefined;
		if (this.isPeru) {
			params.statusTax = params.statusTaxSri || undefined;
			params.statusTaxSri = undefined;
		}
	}
	if (this.$userInfo.company.settings.flagTypeOriginOrder) {
		params.referenceExternal = this.params.referenceExternal || undefined;
	}
	this.onEmitExcel(codeReport, prefixName, params);
}

async function downloadSaleList() {
	const params = {
		typeDocumentIds: [...this.typeDocumentIds],
		companyId: this.$userInfo.companyId,
		typePaymentParams:
			this.typePaymentParams.length > 1 ? [...this.typePaymentParams] : undefined,
		aclFilters: this.$userInfo ? this.$userInfo.configFilters : null,
		startDate: this.params.startDate,
		endDate: this.params.endDate,
		employeeIds: this.employeeIds.length > 1 ? this.employeeIds : undefined,
		paymentState: this.params.paymentState || undefined,
		search: this.params.search || undefined,
		statusTaxSri: this.params.statusTaxSri || undefined,
		currencies: this.params.currencies.reduce((a, c) => {
			const newA = { ...a };
			newA[c.code] = { typeSymbol: c.symbol, typeCurrency: c.code };
			return newA;
		}, {}),
	};
	if (this.$userInfo.company.settings.flagTypeOriginOrder) {
		params.referenceExternal = this.params.referenceExternal || undefined;
	}
	this.onReportSale(params);
}

function emitExcel(code) {
	if (code === 'list-cot') {
		this.generateExportParams(LIST_QUOTATION, 'listado_de_cotizaciones_');
	} else if (code === 'detail-cot') {
		this.generateExportParams(DETAIL_QUOTATION, 'detalle_de_cotizaciones_');
	}
}

function electronicBillingActive() {
	return this.dataSelected.every(
		(c) =>
			(c.typeDocument.code === 'FAC' ||
				c.typeDocument.code === 'BOL' ||
				c.typeDocument.code === 'NTC' ||
				c.typeDocument.code === 'NTD') &&
			c.statusTaxSri !== 3
	);
}

function enableActions() {
	return this.dataSelected.length > 0;
}

async function filterData() {
	const request = [
		this.$httpProducts.get('warehouses'),
		this.$httpSales.get('sales/states'),
		// this.$httpSales.get('taxes/status'),
		this.$httpSales.get('payment-states'),
		this.globalEmployees(),
		this.getBankAccount(),
		this.getCurrencies(),
	];
	try {
		[
			{ data: this.warehouses },
			{ data: this.status },
			// { data: this.sunatStates },
			{ data: this.paymentStates },
			{ data: this.employees },
			{ data: this.bankAccounts },
			{ data: this.currencies },
		] = await Promise.all(request);
		this.typeDocuments = this.typeDocuments.map((typeDocument) => {
			const newTypeDocument = Object.assign({}, typeDocument);
			newTypeDocument.documentType.type = 'typeDocumentCode';
			return newTypeDocument.documentType;
		});
		this.warehouses = this.warehouses.map((warehouse) => {
			const newWarehouse = Object.assign({}, warehouse);
			newWarehouse.type = 'warehouseId';
			return newWarehouse;
		});
		this.status = this.status.map((state) => {
			const newState = Object.assign({}, state);
			newState.type = 'status';
			return newState;
		});
		this.employees = this.employees.map((emp) => {
			const newEmp = { ...emp };
			newEmp.fullname = emp.fullname || `${emp.name} ${emp.lastname}`;
			return newEmp;
		});
	} catch (err) {
		this.showGenericError();
	}
}

function isAdmin() {
	return this.$userInfo.flagAdmin;
}

function isDocumentConvert() {
	return this.action.code === 'TNV';
}

function isPeruvianAdmin() {
	return this.isAdmin && this.isPeru;
}

async function loadCustomers(customerId) {
	({ data: this.customer } = await this.$httpSales.get(`customers/${customerId}`));
	this.customers = [{ ...this.customer }];
	this.loadData();
}

async function loadAmortization() {
	if (this.sale.amount > this.sale.dueAmount) {
		try {
			// ({ data: this.amortization } = await this.$httpSales(
			// 	`checking-accounts/${this.sale.id}/payments`));
			// this.openDebtModal();
			const response = await this.$httpSales(
				`checking-accounts/${this.sale.id}/payments`
			);
			if (response.data) {
				this.amortization = response.data;
				this.openDebtModal();
			} else {
				this.action.active = true;
				this.action.code = 'collect-from-sale';
				this.action.open = true;
				this.action.title = 'Nueva transacción de cobro';
				this.action.width = 500;
			}
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	} else {
		this.showGenericError(
			'El pago ha sido al contado por lo que no quedan cuotas pendientes de pago.'
		);
	}
}

async function loadData(page = 1, showDetail) {
	this.disabledSearch = true;
	this.onLoadData = true;
	this.showLoading = true;
	this.params.page = page;
	this.currentPage = page;
	this.params.cashDeskClosingId = this.$route.query.cashDeskClosingId;
	this.params.typePaymentIds =
		this.typePaymentParams.length > 0 ? this.typePaymentParams.join() : null;
	this.params.warehouseIds =
		this.warehouseIds.length > 0 ? this.warehouseIds.join() : null;
	this.params.convertStatusIds =
		this.convertStatusIds.length > 0 ? this.convertStatusIds.join() : null;
	this.params.employeeIds = this.employeeIds.length > 0 ? this.employeeIds.join() : null;
	this.params.saleIds = this.saleIds.length > 0 ? this.saleIds.join() : null;
	this.params.ballotSummaryId = this.ballotSummaryId || null;
	this.params.summaryUnsubscribeId = this.summaryUnsubscribeId || null;
	try {
		this.params.customerId = this.$route.query.customerId || this.params.customerId;
		const filterP = { ...this.params };
		filterP.currencies = this.params.currencies.map((c) => c.code).join(',');
		if (this.isPeru) {
			filterP.statusTax = filterP.statusTaxSri;
			filterP.statusTaxSri = null;
		}
		filterP.entityStateId = this.params.entityStateId;
		const request = [
			this.$httpSalesRead.get('sale-documents', { params: filterP }),
			this.$httpSalesRead.get('sale-documents-total', { params: filterP }),
		];
		const [sales, amounts] = await Promise.all(request);
		this.setUpData(sales);
		this.dataSelected = this.data.filter((d) => d.isSelected);
		this.lastPage = Number(sales.headers['x-last-page']);
		this.itemsTotalQuantity = Number(sales.headers['x-quantity']);
		this.totalSalesAmount = amounts.data.totalSales;
		if (showDetail) {
			this.rowDetailSelected = {};
		}
	} catch (err) {
		this.showLoading = false;
		this.showGenericError();
	} finally {
		this.disabledSearch = false;
		this.showLoading = false;
		this.isClean = false;
		this.isTableClean = false;
		this.onLoadData = false;
	}
}

function setUpData(sales) {
	this.data = reduce(this.setUpNewProperties, sales.data);
	this.data = reduce(this.documentLinked, this.data);
	this.data = this.data.map((d) => {
		const newData = { ...d };
		const { typeDocument: rowTypeDocument } = d;
		const codeTypeDocument = rowTypeDocument ? rowTypeDocument.code : '';
		newData.flagUse = d.flagUse === 3 && codeTypeDocument !== 'NTC' ? true : d.flagUse;
		newData.flagUseNTC = !!d.flagUse && codeTypeDocument === 'NTC';
		return newData;
	});
	this.indexesCancel = [];
	this.data.forEach((s, i) => {
		if (s.state.code === 'ANUSUNAT' || s.state.code === 'ANU') {
			if (this.indexesCancel.every((ic) => ic !== i)) {
				this.indexesCancel.push(i);
			}
		}
	});
}

function documentLinked(list, doc) {
	const exist = this.documentsWhithRelated.has(doc.documentNumber);
	if (exist && (doc.typeDocument.code === 'BOL' || doc.typeDocument.code === 'FAC')) {
		return [...list, setNewProperty('originalRelatedDocument', true)(doc)];
	}
	return [...list, doc];
}

function setUpNewProperties(list, doc) {
	const newDoc = compose(
		setNewPropertyByFunction('isRelatedDocument', this.setIsRelatedDocument),
		setNewProperty('iconArrow', 'arrow_forward'),
		setNewPropertyByFunction('hasProducts', this.setHasProducts),
		setNewPropertyByFunction('typePaymentName', getDeeper('payment', 'name')),
		setNewPropertyByFunction('statusName', getDeeper('state', 'name')),
		setNewPropertyByFunction('typeDocumentCode', getDeeper('typeDocument', 'code')),
		setNewPropertyByFunction('typeDocumentName', getDeeper('typeDocument', 'name')),
		setNewPropertyByFunction('docNumber', this.setDocNumber),
		setNewPropertyByFunction('debtAmount', this.setDebtAmount),
		setNewPropertyByFunction('createdAt', this.setCreatedAt),
		setNewPropertyByFunction('typeDocument', getDeeper('typeDocument')),
		setNewPropertyByFunction('statusTaxName', getDeeper('statusTaxName')),
		setNewPropertyByFunction('state', getDeeper('state')),
		setNewPropertyByFunction(
			'customerData',
			getDeeper('customer', 'typePerson', 'fullName')
		),
		setNewPropertyByFunction('isSelected', this.setIsSelected),
		setNewPropertyByFunction('createdAtOrigin', this.setCreatedAtHour)
	)(doc);
	return [...list, newDoc];
}

function setCreatedAt(rowData) {
	return format(new Date(rowData.createdAt), 'DD-MM-YYYY');
}

function setDebtAmount(rowData) {
	return rowData.debtAmount || Number(rowData.amount) - Number(rowData.dueAmount);
}

function setDocNumber(rowData) {
	return `${rowData.serie}-${rowData.number}`;
}

function setHasProducts({ details }) {
	return details.every((detail) => detail.product);
}

function setIsSelected(rowData) {
	const { id } = rowData;
	return this.dataSelected.some((d) => d.id === id);
}

function setIsRelatedDocument(rowData) {
	const number = getDeeper('documentRelated', 'documentNumber')(rowData);
	if (number) {
		this.documentsWhithRelated.add(number);
	}
	return !!number;
}

async function loadTransactions() {
	if (this.sale.typePaymentName === 'CREDITO') {
		try {
			({ data: this.transactions } = await this.$httpSales.get(
				`transactions-related/${this.sale.id}/module/1`
			));
			this.transactions = this.transactions.map((transaction) => {
				const newTransaction = { ...transaction };
				newTransaction.additionalInformation = transaction.additionalInformation || {};
				newTransaction.typePayment = transaction.typeTransactionBank
					? transaction.typeTransactionBank || {}
					: transaction.typePayment || {};
				return newTransaction;
			});
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	} else {
		this.transactions = [
			...(this.sale.transactions || []).concat(this.sale.transactionsBank || []),
		];
	}
}

function onCleanData() {
	const { ballotSummaryDate, summaryUnsubscribeDate } = this.$route.query;
	const summaryDate = ballotSummaryDate || summaryUnsubscribeDate;
	this.groupClient = false;
	this.selectedCustomer = null;
	this.flagKardex = false;
	this.params = {
		groupId: null,
		originPlatform: null,
		customerId: null,
		endDate:
			this.ballotSummaryId || this.summaryUnsubscribeId
				? format(summaryDate, 'YYYY-DD-MM')
				: this.$today(),
		flagNotDocumentRelated: null,
		flagNotCancel: null,
		flagNotNtc: null,
		flagNotNtd: null,
		entityStateId: null,
		limit: 30,
		page: 1,
		paymentState: null,
		search: null,
		sortField: 'created_at',
		startDate:
			this.ballotSummaryId || this.summaryUnsubscribeId
				? format(summaryDate, 'YYYY-DD-MM')
				: format(subDays(this.$today(), 7), 'YYYY-MM-DD'),
		statusKardex: null,
		status: null,
		warehouseIds: null,
		convertStatusIds: null,
		saleIds: null,
		employeeIds: null,
		currencies: [this.$userInfo.company.currencyDefault],
		documentTypesNot: null,
	};
	if (this.ballotSummaryId) {
		const documentBol = this.typeDocuments.find((td) => td.code === 'BOL') || {};
		const documentNtc = this.typeDocuments.find((td) => td.code === 'NTC') || {};
		this.params.ballotSummaryId = this.ballotSummaryId;
		this.params.typeDocumentIds = `${documentBol.id}, ${documentNtc.id}`;
		this.typeDocumentIds = [documentBol.id, documentNtc.id];
		this.params.saleIds = this.saleIds;
	} else if (this.summaryUnsubscribeId) {
		const documentBol = this.typeDocuments.find((td) => td.code === 'BOL') || {};
		const documentFac = this.typeDocuments.find((td) => td.code === 'FAC') || {};
		const documentNtc = this.typeDocuments.find((td) => td.code === 'NTC') || {};
		this.params.summaryUnsubscribeId = this.summaryUnsubscribeId;
		this.params.typeDocumentIds = `${documentBol.id}, ${documentFac.id}, ${documentNtc.id}`;
		this.typeDocumentIds = [documentBol.id, documentFac.id, documentNtc.id];
		this.params.saleIds = this.saleIds;
	} else {
		this.params.typeDocumentIds = 4;
		this.typeDocumentIds = 4;
		this.params.saleIds = this.saleIds;
	}
	this.$route.query.cashDeskClosingId = null;
	this.typePaymentParams = [];
	this.warehouseIds = [];
	this.convertStatusIds = [];
	this.saleIds = [];
	this.employeeIds = [];
	this.searchData = null;
	this.localSearch = '';
	this.isClean = true;
	this.isTableClean = true;
	helper.removeLocalData('sales::search');
	helper.removeLocalData('saleDetail::search');
	this.callServiceAndSearch();
}

function openDebtModal() {
	this.showDebts = true;
	this.action.active = true;
	this.action.code = 'debts-details';
	this.action.open = true;
	this.action.title = 'Estado de Cobro';
	this.action.width = 500;
}

function openModal(value, rows, row) {
	this.loading = true;
	if (value === 'TNV' && rows.length > 0) {
		this.action = { ...this.actionSale };
		this.action.title =
			row.typeDocument.code === 'NTV'
				? 'Transformar Nota de Venta'
				: 'Transformar Cotización';
		this.saleSelected = rows;
		this.saleData = row;
		this.loading = false;
		this.action.width = 649;
	} else if (value.code === 'filter-by') {
		const newAction = { ...value };
		newAction.title = 'Filtro';
		newAction.width = 400;
		this.action = { ...newAction };
		this.loading = false;
	}
}

function preGoTo(document) {
	const routeData = this.$router.resolve({
		name: 'convert',
		params: { id: document.id },
		query: { showQuotation: true },
	});
	window.open(routeData.href, '_blank');
}

function rowIsSelected(row) {
	if (row.isSelected) {
		this.dataSelected.push(row);
	} else {
		const index = this.dataSelected.findIndex((ds) => ds.id === row.id);
		if (index > -1) {
			this.dataSelected.splice(index, 1);
		}
	}
}

function runAction({ code }) {
	if (code === 'override') {
		this.loadValidate('override');
	} else {
		const options = {
			'un-subscribe': this.unsubscribe,
			'referral-guide': this.referralGuide,
		};
		options[code].call();
	}
}

function electronicBilling(code) {
	const numBol = this.dataSelected.filter((d) => d.typeDocument.code === 'BOL');
	if (this.electronicBillingActive) {
		if (this.isPeru && numBol.length) {
			if (this.electronicDailySummary) {
				this.openElectronic(code);
			} else {
				this.showNotification(
					'Solo se pueden enviar BOLETAS no asociadas a un resumen diario',
					'warning'
				);
			}
		} else {
			this.openElectronic(code);
		}
	} else {
		this.showNotification(
			'Solo se pueden enviar FACTURAS, BOLETAS NOTAS DE DÉBITO o NOTAS DE CRÉDITO no validadas',
			'warning'
		);
	}
}

function salesCanceled(saleId) {
	const sale = this.data.find((s) => s.id === saleId);
	const statusCancel = this.status.find((state) => state.code === 'ANU');
	this.$set(sale, 'state', statusCancel);
	this.$set(sale, 'statusName', statusCancel.name);
	this.cancelModal(false);
}

function salesTitle() {
	let title = this.$route.meta.title;
	const {
		ballotSummaryCode,
		ballotSummaryDate,
		customerName,
		cashDeskClosingId,
		closedAt,
		summaryUnsubscribeCode,
		summaryUnsubscribeDate,
	} = this.$route.query;
	if (this.ballotSummaryId) {
		title += ` - Resumen Diario ${ballotSummaryCode} - ${ballotSummaryDate}`;
	} else if (this.summaryUnsubscribeId) {
		title += ` - Resumen de Anulaciones ${summaryUnsubscribeCode} - ${summaryUnsubscribeDate}`;
	} else if (customerName) {
		title += ` - ${customerName}`;
	} else if (cashDeskClosingId) {
		title += ` - Cierre de caja del ${closedAt}`;
	}
	return title;
}

function searchDataFiltered(close) {
	const datesValid = differenceInDays(this.params.endDate, this.params.startDate) >= 0;
	if (datesValid) {
		this.currentPage = 1;
		if (close) {
			this.cancelModal(false);
			this.loadData();
		} else {
			this.loadData();
		}
	} else {
		this.showNotification('La fecha inicial no debe ser mayor a la final', 'info');
	}
}

function selectedAll(value) {
	this.checkAll = value;
	this.data = this.data.map((dataSingle) => {
		const newData = Object.assign({}, dataSingle);
		newData.isSelected = value;
		if (newData.isSelected) {
			if (this.dataSelected.length > 0) {
				const dataToAdd = this.dataSelected.find(
					(rowSelected) => rowSelected.id === newData.id
				);
				if (!dataToAdd) {
					this.dataSelected.push(newData);
				}
			} else {
				this.dataSelected.push(newData);
			}
		} else {
			const index = this.dataSelected.findIndex((ds) => ds.id === newData.id);
			this.dataSelected.splice(index, 1);
		}
		return newData;
	});
}

function setData(value, model) {
	if (value) {
		if (
			model === 'typePaymentParams' ||
			model === 'warehouseIds' ||
			model === 'convertStatusIds' ||
			model === 'typeDocumentIds' ||
			model === 'employeeIds'
		) {
			this[model] = value;
		} else if (model === 'statusTaxSri') {
			this.params[model] = value.id;
			this.params.statusTaxIds = null;
		} else if (model === 'originPlatform') {
			this.params.referenceExternal = value.value ? value.value.code : null;
		} else {
			this.params[model] =
				model === 'status' || model === 'typeDocumentCode' ? value.code : value.id;
		}
	}
}

function setDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function columnSortable(col) {
	const newColumn = { ...col };
	newColumn.isSortable.down = !col.isSortable.down;
	newColumn.isSortable.up = !col.isSortable.up;
	this.columns = this.columns.map((c) => {
		const newCol = { ...c };
		if (c.isSortable) {
			newCol.isSortable.up = newColumn.isSortable.up;
			newCol.isSortable.down = newColumn.isSortable.down;
		}
		return newCol;
	});
	this.params.sortField = newColumn.isSortable.value;
	this.params.sortDirection = newColumn.isSortable.up ? 'asc' : 'desc';
	this.loadData();
}

function setSearch(value) {
	this.searchData = value || null;
	this.params.search = value || null;
	this.isTableClean = !value;
	if (this.isTableClean) {
		helper.removeLocalData('sales::search');
	}
}

function showDetails(row) {
	this.rowSelected = { ...row };
	this.rowDetails = [...this.rowSelected.details];
	this.dialogDetails = true;
}

function showTerminal(terminal) {
	return terminal ? terminal.name : '';
}

function showTransactions(row) {
	if (row) {
		this.loadTransactions(row);
	} else {
		this.loadTransactions();
	}
	this.showTransactionsDetails = true;
	this.action.active = true;
	this.action.code = 'transaction-details';
	this.action.open = true;
	this.action.title = 'Detalle de Transacciones';
	this.action.width = 500;
}

function stopClick() {
	return false;
}

function openRelatedModal(sale) {
	this.originalDocument = { ...sale };
	this.action = {
		active: true,
		code: 'history-related',
		open: true,
		title: 'Documentos Relacionados',
		width: 450,
	};
}

function isRelatedDocuments() {
	return this.action.code === 'history-related';
}

function isFilter() {
	return this.action.code === 'filter-by';
}

function onAction(actionName, values) {
	if (actionName === 'accept') {
		const {
			flagNotDocumentRelated,
			flagNotCancel,
			flagNotNtc,
			flagNotNtd,
			paramsGroupClient,
			groupClient,
			paramsStateKardex,
			stateShippingKardex,
		} = values;
		this.params.flagNotDocumentRelated = flagNotDocumentRelated || null;
		this.params.flagNotCancel = flagNotCancel || null;
		this.params.flagNotNtc = flagNotNtc || null;
		this.params.flagNotNtd = flagNotNtd || null;
		this.flagKardex = stateShippingKardex || null;
		this.params.statusKardex = paramsStateKardex || null;
		this.groupClient = groupClient || null;
		this.params.groupId = paramsGroupClient || null;
		this.searchDataFiltered(true);
	} else if (actionName === 'cancel') {
		this.cancelModal(false);
	}
}

function referralGuide() {
	this.goTo('reference-guide-detail', {
		params: { saleId: this.dataSelected[0].id },
		query: { listSale: true },
	});
}

function unsubscribe() {
	const taxeSunat = this.isPeru ? 'statusTax' : 'statusTaxSri';
	const validation = this.dataSelected.filter(
		(d) =>
			d.typeDocument.code === 'BOL' ||
			(d.typeDocument.code === 'FAC' && d[taxeSunat] === 3)
	);
	if (validation.length === this.dataSelected.length) {
		if (this.isPeru) {
			this.loadValidate();
		} else {
			this.action.active = true;
			this.action.code = 'summary-unsubscribe';
			this.action.open = true;
			this.action.title = 'Dar de Baja a Documentos de Venta';
			this.action.width = 459;
		}
	} else {
		this.showNotification(
			'Los documentos solo pueden ser Factura y/o Boletas, y las facturas deben estar validado por la sunat',
			'info'
		);
	}
}

async function unsubscribeSales(commentary) {
	const body = {
		documentsRelated: this.dataSelected.map((d) => d.id),
		date: this.$today(),
		commentary,
	};
	try {
		await this.$httpSales.post('summary-unsubscribe', body);
		this.cancelModal(false);
	} catch (error) {
		this.showGenericError();
	}
}

function electronicDailySummary() {
	return this.dataSelected.every(
		(c) => c.typeDocument.code === 'BOL' && !c.ballotSummaryId
	);
}

function openElectronic(code) {
	this.action.active = true;
	this.action.code = code;
	this.action.open = true;
	this.action.title = 'Facturación Electrónica';
	this.action.width = 800;
	this.loading = false;
}

function clickMenu() {
	if (!this.isSelectWarehouses) {
		this.showNotification(
			'Debe seleccionar al menos una tienda para generar un reporte',
			'warning'
		);
	}
}

function isSelectWarehouses() {
	return Boolean(this.warehouseIds.length);
}

function getData({ model, value }) {
	if (model === 'entityStateId') {
		this.params[model] = value;
	} else {
		this.params[model] = model === 'currencies' ? [...value] : value.code;
	}
}

async function loadValidate(code) {
	const id = this.dataSelected[0].id;
	this.documentSelect = this.dataSelected[0].typeDocumentCode;
	try {
		({ data: this.validSale } = await this.$httpSales.get(
			`sale-documents-validate/${id}`
		));
		this.validAction(code);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'WAS_ALREADY_CANCELED_SALE') {
				this.showGenericError(
					`La ${
						this.documentSelect === 'NTC' ? 'nota de crédito' : 'venta'
					} ya ha sido anulada anteriormente.`
				);
			} else if (err.data.message === 'DOCUMENTS_MUST_NOT_BE_CANCELED') {
				this.showGenericError('El documento ya se encuentra en proceso de anulación.');
			} else if (err.data.message === 'COUNTRY_DEFAULT_NOT_FOUND') {
				this.showGenericError('El documento no se encuentra configurado por país.');
			} else if (err.data.message === 'TYPE_DOCUMENT_NOT_FOUND') {
				this.showGenericError('Tipo de documento no encontrado.');
			} else if (err.data.message === 'PAYMENTS_RELATED_TO_SALE') {
				this.showGenericError(
					'No se puede anular el documento, hasta que sea cancelada completamente.'
				);
			} else if (err.data.message === 'DOCUMENTS_INFORMED_IN_COMMUNICATION') {
				this.showGenericError(
					'El documento ya ha sido informado en una comunicación anterior'
				);
			} else if (err.data.message === 'CONFIG_COUNTRY_NOT_FOUND') {
				this.showGenericError(
					'La configuración por país no fue encontrada, contacte con su proovedor.'
				);
			} else if (err.data.message === 'DOCUMENTS_MUST_BE_SENT') {
				this.showGenericError('Para poder anular, se debe relacionas el documento.');
			} else if (err.data.message === 'DOCUMENT_DELIVERY_TIME_EXCEEDED') {
				this.showGenericError('El tiempo de envío para el documento ha sido excedido.');
			}
		}
	}
}

function unLinkDocuments() {
	this.action.width = 400;
	this.action.code = 'unlink';
	this.action.active = true;
	this.action.open = true;
	this.action.title = 'Desvincular Documentos';
}

function toggleColumns() {
	return true;
}

function closeDetail() {
	this.sale = { customer: { typePerson: {} }, localDate: {} };
	this.inlineProducts = '';
	this.rowDetailSelected = {};
	this.toShow = false;
	this.data = this.data.map((d) => {
		const newD = { ...d };
		newD.iconArrow = 'arrow_forward';
		return newD;
	});
}

function validAction(code) {
	if (this.isPeru) {
		if (this.validSale.validated.errorCode) {
			if (
				this.validSale.validated.errorCode === 'DOCUMENT_WAS_NOT_INFORMED' &&
				!this.dataSelected[0].flagOldSale
			) {
				this.openModalError();
			} else if (this.validSale.validated.errorCode === 'PAYMENTS_RELATED_TO_SALE') {
				this.openModalErrorSale();
			} else {
				this.cancelSale();
			}
		} else {
			this.cancelSale();
		}
	} else if (this.isEcuador && code === 'override') {
		if (this.validSale.validated) {
			if (this.validSale.validated.flagCancel) {
				this.cancelSale();
			} else {
				this.showModalInit = true;
			}
		} else {
			this.cancelSale();
		}
	}
}

function openModalError() {
	this.modal.btnText = 'Entendido';
	this.modal.message =
		'Para poder realizar la anulación del documento, este debe haber sido informado a la SUNAT previamente.';
	this.modal.open = true;
}

function openModalErrorSale() {
	this.modal.btnText = 'Entendido';
	this.modal.message =
		'El documento tiene pagos relacionados y no se puede realizar la acción.';
	this.modal.open = true;
}

function closeModalError() {
	this.modal.open = false;
	this.modal.btnText = '';
	this.modal.message = '';
}

function convertCot({ id, typeDocumentCode }) {
	const queryConvert = typeDocumentCode === 'NTV' ? 'ntv' : 'cot';
	this.goTo('new-sale', { query: { cloneId: id, convert: queryConvert } });
}

function setCreatedAtHour(rowData) {
	return format(new Date(rowData.createdAt), 'DD-MM-YYYY HH:mm:ss');
}

function getCancelClass({ state }) {
	return state.code === 'ANU' || state.code === 'ANUSUNAT' ? 'cancel-style-text' : '';
}

function showModalSend({ id }) {
	this.saleSend = this.data.find((d) => d.id === id);
	if (this.saleSend.customer) {
		if (this.saleSend.customer.email) {
			this.emails.push(this.saleSend.customer.email);
		}
	}
	this.dialogSend = true;
}

async function sendRecords() {
	const body = {
		code: 'pdf',
		email: [...this.emails],
	};
	try {
		await this.$httpSales.post(`/sale-documents/${this.saleSend.id}/email`, body);
		this.showNotification('El comprobante se envió correctamente');
		this.closeModalSend();
	} catch (error) {
		this.showGenericError();
	}
}

function closeModalSend() {
	this.dialogSend = false;
}

function removeEmail(item) {
	const index = this.emails.indexOf(item);
	if (index > -1) {
		this.emails.splice(index, 1);
	}
}

function closeDialogInit() {
	this.showModalInit = false;
}

async function sendToKardex(typeOperation) {
	const body = {
		ids: this.dataSelected.map((d) => d.id),
		typeOperation,
		typeDocumentCode: 'COT',
	};
	try {
		this.$httpSales.post('kardex-movement-insert', body);
		this.showNotification('La acción se realizó correctamente');
		this.searchDataFiltered();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'NOT_DISPATCHABLE_SALES_ERROR') {
				this.showGenericError(error.data.messageError);
			}
		} else {
			this.showGenericError();
		}
	}
}

async function reserveStock(row) {
	try {
		const payload = {
			salDocumentsId: row.id,
			salStatesId: row.salStatesId,
			paymentMethodId: row.paymentMethodId || null,
			terminalId: row.terminalId || null,
			serieId: row.serieId || null,
			flagDispatch: true,
			details: row.details,
		};
		await this.$httpSales.patch(
			`sale-documents/${row.typeDocument.code}/confirm-cot`,
			payload
		);
		this.showNotification('Stock reservado correctamente');
		this.searchDataFiltered();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'NOT_DISPATCHABLE_SALES_ERROR') {
				this.showGenericError(error.data.messageError);
			} else {
				this.showGenericError(error.data.messageError || error.data.message);
			}
		} else {
			this.showGenericError();
		}
	}
}
function syncStatusSend({ sendKardexStatus }) {
	if (sendKardexStatus === 1) {
		return 'En Proceso';
	} else if (sendKardexStatus === 2) {
		return 'Pendiente de envió';
	} else if (sendKardexStatus === 3) {
		return 'Enviado al kardex';
	} else if (sendKardexStatus === 4) {
		return 'No despachable';
	} else if (sendKardexStatus === 5) {
		return 'Sin enviar';
	} else if (sendKardexStatus === 6) {
		return 'Enviado al Kardex reservado';
	} else if (sendKardexStatus === 7) {
		return 'Reversión de reserva en kardex';
	} else if (sendKardexStatus === 8) {
		return 'Error en proceso';
	} else if (sendKardexStatus === 9) {
		return 'Sin informacion temporal del estado';
	}
	return 'No Aplica';
}

function syncFirebase(row) {
	if (row.flagSyncFb === 1) {
		return 'Registrada/Pendiente';
	} else if (row.flagSyncFb === 2) {
		return 'Procesada/Finalizada';
	} else if (row.flagSyncFb === 3) {
		return 'No Registrada';
	} else if (row.flagSyncFb === 4) {
		return 'Pendiente';
	}
	return 'No Aplica';
}

function colorSyncSend({ sendKardexMessage }) {
	return sendKardexMessage && sendKardexMessage.color;
}

function colorSyncFirebase(row) {
	if (row.flagSyncFb === 1) {
		return 'primary';
	} else if (row.flagSyncFb === 2) {
		return 'primary';
	} else if (row.flagSyncFb === 3) {
		return 'error';
	} else if (row.flagSyncFb === 4) {
		return 'warning';
	}
	return 'black';
}

function labelConfigSale() {
	return this.$userInfo.company.settings.downloadSale
		? 'Descargar Documento'
		: 'Vista Previa del Documento';
}

function goToDetailQuation(id) {
	this.goTo('edit-quotation', { params: { id } });
}
function goToCloneQuation(id) {
	this.goTo('new-quotation', { query: { cloneId: id } });
}

function goToDetail(row) {
	const routeData = this.$router.resolve({
		name: 'convert',
		params: { id: row.id },
	});
	window.open(routeData.href, '_blank');
}

function openSearchCustomer(value) {
	this.searchValCustomer = value ? value.trim() : '';
	this.action.code = 'customer-searcher';
	this.action.title = 'Clientes';
	this.action.width = 739;
	this.action.open = true;
}

function setCustomer(customer) {
	const { id, typePerson } = customer;
	this.params.customerId = id;
	this.selectedCustomer = `${typePerson.fullName} - ${typePerson.documentNumber}` || '';
	this.cancelModal(false);
}

function data() {
	return {
		action: {
			active: false,
			code: null,
			open: false,
			title: 'titulo desde data',
			width: 500,
		},
		actionSale: {
			active: true,
			code: 'TNV',
			open: true,
			title: 'Transformar Nota de Venta',
			width: 850,
		},
		amortization: {},
		checkAll: false,
		columns: [
			{
				id: 1,
				name: 'Empresa',
				value: 'sucursalName',
				visible: false,
				checked: false,
				tooltip: 'Nombre de la Empresa',
			},
			{
				id: 2,
				name: 'Tienda',
				value: 'warehouseName',
				visible: true,
				checked: true,
				tooltip: 'Nombre de la Tienda',
			},
			{
				id: 3,
				name: 'Cliente',
				value: 'customerData',
				visible: true,
				checked: true,
				tooltip: 'Nombre de Cliente',
			},
			{
				id: 4,
				name: '# DOC',
				value: 'docNumber',
				visible: true,
				checked: true,
				tooltip: 'Número de Documento',
			},
			{
				id: 5,
				name: 'F. Emisión',
				value: 'createdAt',
				visible: true,
				checked: true,
				tooltip: 'Fecha de Emisión',
			},
			{
				id: 6,
				name: 'Estado',
				value: 'statusName',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'E. Pago',
				value: 'paymentStateName',
				visible: true,
				checked: true,
				tooltip: 'Estado de Pago',
			},
			{
				id: 8,
				name: 'Estado de C.',
				value: 'sucursalName',
				visible: true,
				checked: true,
				tooltip: 'Estado de Conversión a Venta',
			},
			{
				id: 9,
				name: 'Estado de E.',
				value: 'statusSend',
				visible: false,
				checked: false,
				tooltip: 'Estado de Envio',
			},
			{
				id: 10,
				name: 'Doc. Rel.',
				value: 'debtAmount',
				visible: true,
				checked: true,
				tooltip: 'Documentos Relacionados a la Venta',
			},
			{
				id: 11,
				name: 'Sinc. con Firebase',
				visible: false,
				checked: false,
				tooltip: 'Sincronización con Firebase',
			},
			{
				id: 12,
				name: 'Estado de Env.',
				visible: false,
				checked: false,
				tooltip: 'Estado de envio',
			},
			{
				id: 13,
				name: 'Empleado',
				visible: true,
				checked: true,
			},
			{
				id: 14,
				name: 'Total',
				value: 'amount',
				visible: true,
				checked: true,
				tooltip: 'Total de Venta',
				isSortable: {
					down: true,
					value: 'amount',
					up: false,
				},
			},
			{
				id: 15,
				name: 'Acciones',
				visible: true,
				checked: true,
			},
		],
		currentPage: 1,
		currentSaleId: 0,
		customers: [],
		data: [],
		dataSelected: [],
		dialog: false,
		disabledSearch: false,
		dialogDetails: false,
		documentsWhithRelated: new Set(),
		employees: [],
		employeeIds: [],
		endDate: null,
		groupClient: null,
		groupClients: [],
		flagKardex: null,
		inlineProducts: '',
		isClean: false,
		isLoading: false,
		isQuotationList: false,
		isTableClean: false,
		justifySpace: '',
		keyValue: 'warProductId',
		lastPage: 0,
		loading: false,
		loadingGeneral: true,
		localSearch: '',
		menuEnd: false,
		menuStart: false,
		modal: {
			btnText: '',
			message: '',
			open: false,
		},
		onLoadData: false,
		options: [
			{ id: 3, code: 'list-cot', name: 'Lista de Cotizaciones' },
			{ id: 4, code: 'detail-cot', name: 'Detalle de Cotizaciones' },
		],
		originConfig: [],
		originalDocument: {},
		params: {
			customerId: null,
			currencies: [this.$userInfo.company.currencyDefault],
			endDate: null,
			flagNotDocumentRelated: null,
			flagNotCancel: null,
			flagNotNtc: null,
			flagNotNtd: null,
			employeeIds: null,
			groupId: null,
			limit: 30,
			originPlatform: null,
			page: 1,
			entityStateId: null,
			paymentState: null,
			search: null,
			sortField: 'created_at',
			stateEntity: null,
			startDate: null,
			statusKardex: null,
			status: null,
			typeDocumentIds: 4,
			saleIds: null,
			warehouseIds: null,
			convertStatusIds: null,
		},
		paymentStates: [],
		properties: ['id'],
		rowDetails: [],
		rowDetailSelected: {},
		rowSelected: null,
		selectedCustomer: null,
		showLoading: false,
		sale: {
			customer: {
				typePerson: {},
			},
			localDate: {},
		},
		saleData: null,
		saleDetailsColumns: [
			{ id: 1, name: 'Código', visible: true, checked: true },
			{ id: 2, name: 'Cod. interno', visible: true, checked: true },
			{ id: 3, name: 'Nombre', visible: true, checked: true },
			{ id: 4, name: 'Características', visible: true, checked: true },
			{ id: 5, name: 'Descripción', visible: true, checked: true },
			{ id: 6, name: 'Ubicación', visible: true, checked: true },
			{ id: 7, name: 'Marca', visible: true, checked: true },
			{ id: 8, name: 'P. venta', visible: true, checked: true },
			{ id: 9, name: 'Cantidad', visible: true, checked: true },
			{ id: 10, name: 'Stock', visible: true, checked: true },
			{ id: 11, name: 'Kg', visible: true, checked: true },
		],
		saleDetailsKeyValue: 'warProductsId',
		saleId: null,
		saleSelected: [],
		showDetailsValidate: false,
		sunatSaleDetail: {},
		searchData: '',
		searchValCustomer: null,
		showDebts: false,
		showStateEntity: false,
		showTransactionsDetails: false,
		startDate: null,
		status: [],
		sunatStates: [],
		toShow: false,
		totalSalesAmount: 0,
		transactions: [],
		typeDocumentIds: [],
		saleIds: [],
		typeDocuments: [],
		typePaymentParams: [],
		typePayments: [],
		warehouseIds: [],
		convertStatusIds: [],
		warehouses: [],
		currencies: [],
		validSale: {},
		itemsTotalQuantity: 0,
		indexesCancel: [],
		dialogSend: false,
		emails: [],
		saleSend: null,
		documentSelect: null,
		showModalInit: false,
		convertStates: [
			{ name: 'Pendiente', id: quotationStates.PENDING },
			{ name: 'Convertido', id: quotationStates.CONVERTED },
			{ name: 'Parcialmente Convertido', id: quotationStates.PARTIALLY_CONVERTED },
		],
	};
}

export default {
	name: 'quotations-list',
	components: {
		actionSidebar,
		amortizationsForm,
		appActions,
		appDateSelect,
		appSelect,
		appTable,
		appTooltipButton,
		autocompleteComponent,
		dateComponent,
		documentConvert,
		documentState,
		fastProductsAction,
		generalFilter,
		headerPage,
		modalSidebarButton,
		relatedDocuments,
		salesCancel,
		salesDetailsInTable,
		salesSunatDetails,
		transactionsDetail,
		summaryUnsubscribe,
		modalItems,
		appShowDialog,
		personSearchInput,
		personSearchForm,
		salesCancelNew,
	},
	computed: {
		actionsDisabled,
		electronicBillingActive,
		electronicDailySummary,
		enableActions,
		labelConfigSale,
		isAdmin,
		isDocumentConvert,
		isFilter,
		isPeruvianAdmin,
		isRelatedDocuments,
		salesTitle,
		isSelectWarehouses,
	},
	created,
	data,
	methods: {
		allIsSelected,
		callServiceAndSearch,
		cancelModal,
		cancelSale,
		changePage,
		clickMenu,
		closeDetail,
		closeDialog,
		closeModalError,
		convert,
		convertCot,
		documentLinked,
		downloadSale,
		downloadPdf,
		downloadSaleList,
		electronicBilling,
		emitExcel,
		filterData,
		generateExportParams,
		getCancelClass,
		getData,
		goToDetail,
		goToDetailQuation,
		loadAmortization,
		loadCustomers,
		loadData,
		loadTransactions,
		loadValidate,
		onAction,
		onCleanData,
		openDebtModal,
		openElectronic,
		openModal,
		openModalError,
		openModalErrorSale,
		openRelatedModal,
		openSearchCustomer,
		preGoTo,
		referralGuide,
		rowIsSelected,
		runAction,
		salesCanceled,
		searchDataFiltered,
		selectedAll,
		setCreatedAt,
		setCreatedAtHour,
		setCustomer,
		setData,
		setDate,
		setDebtAmount,
		setDocNumber,
		setHasProducts,
		setIsRelatedDocument,
		setIsSelected,
		setSearch,
		setUpData,
		setUpNewProperties,
		showDetails,
		showTerminal,
		showTransactions,
		stopClick,
		syncFirebase,
		syncStatusSend,
		colorSyncFirebase,
		colorSyncSend,
		toggleColumns,
		unLinkDocuments,
		unsubscribe,
		unsubscribeSales,
		validAction,
		showModalSend,
		sendRecords,
		closeModalSend,
		removeEmail,
		closeDialogInit,
		sendToKardex,
		reserveStock,
		goToCloneQuation,
		columnSortable,
	},
	props: {
		ballotSummaryId: [Number, String],
		summaryUnsubscribeId: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.options-menu {
	button {
		box-shadow: none;
		margin: 0px;
		min-width: auto;

		&:hover {
			background-color: transparent;
		}
	}
}

.align-img {
	vertical-align: middle;
}

.pos-relative {
	position: relative;
}

.change-document-btn {
	background-color: transparent;
	box-shadow: none;
	height: auto;
	margin: 0px;
	min-width: auto;
	position: absolute;
	right: 5px;
	top: 10px;
}

.icon-centered {
	align-items: center;
	display: flex;
}

.related-document {
	cursor: pointer;
	text-decoration: underline;
}

.headline {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding-top: 37px !important;
	text-align: center;
}

.subtext {
	color: color(grey-border);
	font-family: font(open-regular);
	font-size: size(small) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding: 0px !important;
	text-align: center;
}

.btn-block {
	padding-bottom: 24px !important;
	padding-top: 28px !important;
}

.document-column {
	min-width: 65px !important;
	padding: 0px !important;
}

.icon-container {
	display: flex;
	justify-content: flex-end;
	padding-right: 10px;
}

.cancel-style-text {
	text-decoration: line-through;
}

.state-entity {
	border-radius: 4px;
	color: color(white);
	font-family: map-get($fonts, open-bold);
	padding: 3px 6px;
}

.btn-link {
	border-bottom: 1px solid map-get($colors, primary);
	color: map-get($colors, primary);
}
</style>
