<template>
	<section>
		<header-page name="purchases-perception" :title="$route.meta.title">
		</header-page>
		<general-filter class="layout wrap align-end">
			<v-flex xs12 my-2>
				<v-alert :value="isValidStartDate" type="info">
					Fecha de Inicio Inválida. (YYYY/MM/DD)
				</v-alert>
				<v-alert :value="isValidEndDate" type="info">
					Fecha Fin Inválida. (YYYY/MM/DD)
				</v-alert>
				<v-alert :value="disabledButton" type="info">
					La fecha de inicio no puede ser mayor a la fecha final
				</v-alert>
			</v-flex>
			<v-flex xs12 sm4 md3 px-1 my-2>
				<app-select
					item-text="sucursalName"
					item-value="id"
					:items="subsidiaries"
					:item="params.subsidiaryId"
					model="subsidiaryId"
					label="Seleccione una Empresa"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs12 sm6 md4 px-1 my-2>
				<app-select
					autocomplete
					return-object
					label="Proveedor"
					item-text="autocomplete"
					:items="suppliers"
					@input="setParamsData($event, 'supplierId')"
				>
				</app-select>
			</v-flex>
			<v-flex xs12 sm6 md2 px-1 my-2>
				<app-select
					chips
					label="Estado de Pago"
					item-text="name"
					item-value="id"
					model="paymentStateIds"
					multiple
					:item="bodyParams.paymentStateIds || []"
					:items="paymentStates"
					:return-object="false"
					@input="onInput"
				>
				</app-select>
			</v-flex>
			<v-flex xs12 sm8 md2 px-1 my-2>
				<app-select
					chips
					label="Estado de Recepción"
					item-text="name"
					item-value="id"
					model="stateIds"
					multiple
					:item="bodyParams.stateIds || []"
					:items="states"
					:return-object="false"
					@input="onInput"
				>
				</app-select>
			</v-flex>
			<v-flex xs12 sm4 md2 px-1 my-2>
				<app-select
					label="Modo de Pago"
					item-text="name"
					item-value="id"
					model="paymentMethodId"
					:item="params.paymentMethodId"
					:items="paymentMethods"
					@input="getData"
				>
				</app-select>
			</v-flex>
			<v-flex xs12 sm6 md2 px-1 my-2>
				<app-select
					multiple
					chips
					:return-object="false"
					item-value="id"
					model="warehouseIds"
					label="Tienda"
					:item="warehouseIds || []"
					item-text="name"
					:items="warehouses"
					@input="onInput"
				>
				</app-select>
			</v-flex>
			<v-flex xs12 sm12 md3 px-1 my-2>
				<app-select
					chips
					label="Tipo de Documento"
					item-text="documentType.name"
					item-value="comTypeDocumentId"
					model="typeDocumentIds"
					multiple
					:item="bodyParams.typeDocumentIds || []"
					:items="typeDocuments"
					:return-object="false"
					@input="onInput"
				>
				</app-select>
			</v-flex>
			<v-flex xs12 sm6 md1 pr-2 mb-2 v-if="isPeru && currencies.length > 1">
				<app-select
					:item="purchases.currencies"
					item-text="name"
					item-value="code"
					:items="currencies"
					label="Tipo de Moneda"
					model="currencies"
					@input="setDataCurrencies"
				/>
			</v-flex>
			<v-flex xs12 sm6 md2 pr-2 mb-2 v-if="showStateEntity">
				<app-select
					item-text="name"
					item-value="id"
					:items="statesEntity"
					:item="params.entityStateId"
					label="Estado de Entidad"
					model="entityStateId"
					:return-object="false"
					@input="setStateEntity"
				/>
			</v-flex>
			<v-flex xs12 sm6 md2 px-1 my-2>
				<label class="caption">Fecha Inicio</label>
				<date-component
					:date="startDate"
					icon="/static/img/calendar.svg"
					@on-input="setDate({ model: 'startDate', value: $event })"
				></date-component>
			</v-flex>
			<v-flex xs12 sm6 md2 px-1 my-2>
				<label class="caption">Fecha Final</label>
				<date-component
					:date="endDate"
					icon="/static/img/calendar.svg"
					@on-input="setDate({ model: 'endDate', value: $event })"
				></date-component>
			</v-flex>
			<v-flex xs12 sm6 md2 px-1 my-2>
				<app-select
					label="Kardex Status"
					item-text="name"
					item-value="id"
					model="sendKardexStatus"
					:item="params.sendKardexStatus || []"
					:items="kardexStatusTypes"
					@input="getData"
				>
				</app-select>
			</v-flex>
			<v-flex xs2 sm2 px-1 my-2>
				<v-btn
					type="button"
					color="primary"
					class="btn-action btn-action-block"
					:disabled="disabledButton"
					@click="filterList()"
				>
					Filtrar
					<v-icon color="white" size="16"> check_circle_outline </v-icon>
				</v-btn>
			</v-flex>
			<v-flex xs3 sm2 px-1 my-2>
				<v-btn
					color="pink"
					class="btn-action btn-action-block"
					@click="filterList('clean')"
				>
					Limpiar
				</v-btn>
			</v-flex>
		</general-filter>
		<purchases-list-perception
			:columns="columns"
			:check-all="checkAll"
			:indexes-cancel="indexesCancel"
			:current-page="params.page"
			:last-page="lastPage"
			:rows="summaryData"
			:validate-currency="currencies.length > 1"
			:show-entity="showStateEntity"
			:disabled-search="disabledSearch"
			@on-page="onPage"
			@open-detail="openDetail"
			@open-edit="openEdit"
			@open-retention="openRetention"
			@on-selected-all="onSelectedAll"
			@row-is-selected="rowIsSelected"
			@show-dispatch="showDispatch"
			@update-state="onUpdateState"
			@open-dialog-sri="openDialogSri"
			@delete-purchase="openDialogDelete"
			@on-search="onSearch"
			@create-document="goToConvertDocument"
			@download-pdf="exportToPdf"
			@on-toggle-columns="toggleColumns"
		>
		</purchases-list-perception>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:limit-text="action.limit"
			:title="action.title"
			:value="action.value"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="close"
		>
			<purchases-details-form
				v-if="action.code === 'DETAILS'"
				:check-all="checkAllDetails"
				:data-selected="detailsSelected"
				:payment-method="paymentMethodName"
				:rows="transactions"
				:selected-id="selectedId"
				@all-is-selected="allIsSelected"
				@row-is-selected="detailIsSelected"
				@close="close"
				@save="save"
			/>
			<purchases-dispatch-confirm
				v-if="action.code === 'DISPATCH'"
				:is-loading="isLoading"
				:purchase="selectedPurchase"
				@dispatch="dispatch"
				@cancel-button-clicked="close('dispatch')"
			>
			</purchases-dispatch-confirm>
			<purchases-update-state
				v-if="action.code === 'UPDATE-STATE'"
				@close="close"
				@save="updateState"
			/>
			<retentions-form
				v-if="action.code === 'WITHHOLDING-TAX'"
				:bases="typeTaxes"
				is-loading
				:purchase="purchase"
				:purchase-details="purchase.details"
				:retention-data="purchase.withholdingTaxActive"
				:supplier="purchase.supplier"
				:type-document-code="purchase.typeDocument.code"
				readonly
				@close="close"
			></retentions-form>
		</action-sidebar>
		<v-dialog v-model="dialogSri" persistent max-width="335">
			<v-card>
				<v-card-title class="header-dialog">
					<v-layout row align-center>
						<v-flex xs11>
							<template v-if="titleDialogSri.length > 26">
								<v-tooltip top>
									<v-flex
										text-xs-center
										slot="activator"
										class="title-dialog"
										>{{ titleDialogSri | limitTo(25) }}</v-flex
									>
									<v-flex>
										{{ titleDialogSri }}
									</v-flex>
								</v-tooltip>
							</template>
							<template v-else>
								<v-flex class="title-dialog">
									{{ titleDialogSri }}
								</v-flex>
							</template>
						</v-flex>
						<v-flex xs1 text-xs-right>
							<button type="button" @click="closeDialogSri">
								<v-icon color="primary">clear</v-icon>
							</button>
						</v-flex>
					</v-layout>
				</v-card-title>
				<v-divider></v-divider>
				<v-card-text>
					<v-flex xs12 mt-1 mb-3 text-xs-center>
						<v-layout row align-center justify-center>
							<a
								:href="linkXml"
								class="btn-dowload-xml btn-auto"
								target="_blank"
							>
								<v-flex xs1>
									<img
										src="/static/icon/xml-file-format-symbol.svg"
										alt="icono-descarga-xml"
									/>
								</v-flex>
								<span class="outline-none ml-4"> Descargar XML </span>
							</a>
						</v-layout>
					</v-flex>
					<v-layout pb-3 column>
						<v-flex class="text-dialog" text-xs-center>
							Fecha de Auto: {{ authorizationDate }}
						</v-flex>
						<v-flex text-xs-center class="text-dialog">
							Nº Autorización: {{ authorizationNumber }}
						</v-flex>
					</v-layout>
				</v-card-text>
				<v-flex text-xs-center class="modal-items-action">
					<button
						@click="closeDialogSri"
						color="success"
						class="modal-items-btn--cancel"
					>
						Cerrar
					</button>
				</v-flex>
			</v-card>
		</v-dialog>
		<v-dialog v-model="dialogKardex" persistent max-width="335">
			<modal-items
				:title="titleDialogKardex"
				name-action="SI"
				name-cancel="NO"
				v-if="dialogKardex"
				show-slot
				@close-modal="closeDialogKardex"
				@action-modal="sendKardex"
			>
				<v-flex class="py-2 px-4">
					<label class="bold"
						>¿Esta seguro de enviar al kardex las compras seleccionadas?</label
					>
				</v-flex>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="dialogDeletePurchase" max-width="500px">
			<modal-items
				title="Eliminar Compra"
				name-action="Aceptar"
				name-cancel="Cancelar"
				v-if="dialogDeletePurchase"
				show-slot
				@close-modal="closeDialogDelete"
				@action-modal="deletePurchase"
			>
				<v-flex class="py-2 px-4">
					<label class="bold">{{ titleDialogDelete }}</label>
				</v-flex>
			</modal-items>
		</v-dialog>
	</section>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import { minLength } from 'vuelidate/lib/validators';
import { subDays, differenceInDays, format } from 'date-fns';
import { LIST_PURCHASES, LIST_PURCHASES_DETAILS } from '@/shared/reports';
import actionSidebar from '@/components/shared/action-sidebar';
import appDateSelect from '@/components/shared/app-date-select';
import autoCompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import dateComponent from '@/components/shared/date-component';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalItems from '@/components/shared/modal-items';
import purchasesDetailsForm from '@/components/purchases/purchases-details-form';
import PurchasesListPerception from '@/components/purchases/purchases-list-perception';
import purchasesDispatchConfirm from '@/components/purchases/purchases-dispatch-confirm';
import purchasesUpdateState from '@/components/purchases/purchases-update-state';
import retentionsForm from '@/components/purchases/retentions-form';
import tableCode from '@/shared/table-code';

function toggleColumns() {
	return true;
}

async function created() {
	this.endDate = format(this.$today(), 'YYYY-MM-DD');
	this.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	const { subsidiary: subsidiaryUser } = this.$userInfo;
	const { configIntegrations } = subsidiaryUser;
	this.showStateEntity =
		configIntegrations &&
		((configIntegrations.accountingPlan &&
			configIntegrations.accountingPlan.flagConfig) ||
			(configIntegrations.accountingConfiguration &&
				configIntegrations.accountingConfiguration.flagConfig));
	if (this.showStateEntity) {
		this.columns[13].visible = true;
		this.columns[13].flagVisible = false;
	}
	this.updateColumns();
	const requests = [
		this.getPaymentsMethods(),
		this.$httpSales.get('payment-states'),
		this.$httpSales.get('states'),
		this.getTypeDocuments('purchases'),
		this.$httpSales.get('suppliers'),
		this.$httpSales.get(`catalog-sunat-details-list/${tableCode.IvaRate}`),
		this.getCurrencies(),
		this.$httpSales.get('subsidiaries'),
	];
	[
		{ data: this.paymentMethods },
		{ data: this.paymentStates },
		{ data: this.states },
		{ data: this.typeDocuments },
		{ data: this.suppliers },
		{ data: this.typeTaxes },
		{ data: this.currencies },
		{ data: this.subsidiaries },
	] = await Promise.all(requests);
	this.warehouses = this.globalList();
	this.loadFeatures();
	this.currencyPurchase = this.$userInfo.company.currencyDefault.code;
	this.purchases.currencies = this.$userInfo.company.currencyDefault.code;
	this.params.currencies = this.$userInfo.company.currencyDefault.code;
	if (this.subsidiaries.length === 1) {
		this.params.subsidiaryId = this.subsidiaries[0].id;
	}
	this.filterList();
}

function updateColumns() {
	const that = this;
	this.columns = this.columns.reduce((list, item) => {
		const newItem = { ...item };
		if (item.value === 'taxes') {
			newItem.name = that.isEcuador ? 'IVA' : 'IGV';
		}

		if (that.isPeru && item.value === 'withholdingTaxActive') {
			return list;
		}

		return list.concat(newItem);
	}, []);
}

function allIsSelected(isSelected) {
	this.checkAllDetails = isSelected;
	this.transactions = this.transactions.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = isSelected;
		return newRow;
	});
	this.detailsSelected = [...this.rows.filter((row) => row.isSelected)];
}

function close(isDispatch) {
	this.action.value = false;
	this.action.open = false;
	this.action.code = '';
	if (!isDispatch) {
		this.transactions = [];
		this.loadData();
	}
}

function detailIsSelected({ id, isSelected }) {
	this.checkAllDetails = this.transactions.every((t) => t.isSelected);
	if (isSelected) {
		this.detailsSelected.push(this.transactions.find((row) => row.id === id));
		this.selectedId = id;
	} else {
		const index = this.detailsSelected.findIndex((row) => row.id === id);
		this.detailsSelected.splice(index, 1);
		this.selectedId = 0;
	}
}

async function showDispatch({ id, documentNumber }) {
	const purchase = this.rows.find((p) => p.id === id);
	this.selectedPurchase.id = purchase.id;
	this.selectedPurchase.documentNumber = purchase.documentNumber;
	this.selectedPurchase.details = purchase.details;
	this.action.code = 'DISPATCH';
	this.action.value = true;
	this.action.open = true;
	this.action.title = `Recepcionar compra #${documentNumber}`;
	this.action.width = 600;
}

async function dispatch({ id, documentNumber }) {
	this.isLoading = true;
	try {
		await this.$httpSales.post(`purchase-documents-kardex/${id}`);
		const rowIndex = this.rows.findIndex((p) => p.id === id);
		this.rows[rowIndex].stateId = 2;
		this.rows[rowIndex].state.id = 2;
		this.rows[rowIndex].state.code = 'NIN';
		this.rows[rowIndex].state.name = 'NO INGRESO';
		this.action.value = false;
		this.action.open = false;
		this.showNotification(`La compra #${documentNumber} ha sido recepcionada`);
		this.loadData();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'PURCHASE_CODE_NOT_NIN') {
				this.showNotification('La compra ya ha sido recepcionada.', 'error');
			}
		}
	} finally {
		this.isLoading = false;
	}
}

function emitExcel(code) {
	if (code === 'heading') {
		this.generateExportParams(LIST_PURCHASES, 'listado_de_compras_');
	} else if (code === 'detail-features') {
		this.generateExportParams(
			LIST_PURCHASES_DETAILS,
			'detalle_de_compras_separadas_'
		);
	} else {
		// detail
		this.generateExportParams(LIST_PURCHASES_DETAILS, 'detalle_de_compras_');
	}
}

async function loadFeatures() {
	try {
		({ data: this.features } = await this.$httpProducts.get('features', {
			params: { flagSeparator: 1 },
		}));
		this.filterFeatures = this.features.map((feature) => {
			const newRow = {};
			newRow.id = feature.id;
			newRow.name = feature.name;
			return newRow;
		});
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function checkAll() {
	return this.rowsSelected.length === this.rows.length;
}

async function filterList(clean) {
	if (clean) {
		this.endDate = format(this.$today(), 'YYYY-MM-DD');
		this.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
		this.bodyParams = {
			paymentStateIds: null,
			stateIds: null,
			typeDocumentIds: null,
		};
		this.params.page = 1;
		this.params.search = null;
		this.params.subsidiaryId = null;
		this.params.endDate = null;
		this.params.startDate = null;
		this.params.supplierId = null;
		// this.params.warehouseId = null;
		this.params.warehouseIds = null;
		this.params.paymentMethodId = null;
		this.params.entityStateId = null;
		this.params.sendKardexStatus = null;
		this.purchases.currencies = this.$userInfo.company.currencyDefault.code;
		this.cleanData = true;
		const labelAutoComplete = document.querySelector(
			'.input-group__selections__comma'
		);
		if (labelAutoComplete) {
			labelAutoComplete.textContent = '';
		}
	}
	if (this.startDate && this.endDate) {
		this.params.startDate = this.startDate;
		this.params.endDate = this.endDate;
	}
	await this.loadData();
}

function generateExportParams(codeReport, prefixName) {
	const params = {
		features: this.filterFeatures,
		paymentMethodId: this.params.paymentMethodId,
		typeDocumentIds: this.bodyParams.typeDocumentIds,
		stateIds: this.bodyParams.stateIds ? this.bodyParams.stateIds : undefined,
		paymentStateIds: this.bodyParams.paymentStateIds
			? this.bodyParams.paymentStateIds
			: undefined,
		endDate: this.params.endDate,
		startDate: this.params.startDate,
		subsidiaryId: this.bodyParams.subsidiaryId,
		warehouseIds: this.params.warehouseIds
			? this.params.warehouseIds.split(',').map(Number)
			: [],
		subsidiaries:
			this.$userInfo.configFilters &&
			this.$userInfo.configFilters.purchases &&
			this.$userInfo.configFilters.purchases.subsidiaries &&
			this.$userInfo.configFilters.purchases.subsidiaries.values.length > 0
				? this.$userInfo.configFilters.purchases.subsidiaries.values
				: undefined,
		warehouses:
			this.$userInfo.configFilters &&
			this.$userInfo.configFilters.purchases &&
			this.$userInfo.configFilters.purchases.warehouses &&
			this.$userInfo.configFilters.purchases.warehouses.values.length > 0
				? this.$userInfo.configFilters.purchases.warehouses.values
				: undefined,
		currencies: this.params.currencies,
	};
	if (!this.$userInfo.flagAdmin) {
		params.employeeId = this.$userInfo.id;
	}
	if (this.params.supplierId) {
		params.supplierId = this.params.supplierId;
	}
	if (prefixName === 'detalle_de_compras_') {
		delete params.features;
	}
	this.onEmitExcel(codeReport, prefixName, params);
}

function getData({ model, value }) {
	this.params[model] = value.id;
}

async function loadData() {
	this.disabledSearch = true;
	const request = [
		this.$httpSales.post('purchase-documents', this.bodyParams, {
			params: this.params,
		}),
	];
	const [purchases] = await Promise.all(request);
	this.currencyPurchase = this.purchases.currencies;
	this.lastPage = Number(purchases.headers['x-last-page']);
	this.rows = purchases.data.map((purchase) => {
		const newPurchase = { ...purchase };
		newPurchase.paymentName = purchase.payment ? purchase.payment.name : '';
		return newPurchase;
	});
	this.rowsSelected = [...this.rows.filter((row) => row.isSelected)];
	this.disabledSearch = false;
	this.indexesCancel = [];
	purchases.data.forEach((s, i) => {
		if (s.state.code === 'ANU') {
			if (this.indexesCancel.every((ic) => ic !== i)) {
				this.indexesCancel.push(i);
			}
		}
	});

	return purchases.data;
}

async function onPage(page) {
	this.params.page = page;
	await this.loadData();
}

function onInput(input) {
	if (input.model === 'warehouseIds') {
		this.warehouseIds = input.value;
		this.params[input.model] =
			input.value.length === 0 ? null : input.value.join(',');
	} else {
		this.bodyParams[input.model] =
			input.value.length === 0 ? null : input.value;
	}
}

function onDate(input, model) {
	this[model] = format(input, 'YYYY-MM-DD');
	this.disabledButton = differenceInDays(this.startDate, input) > 0;
	this.$v[model].$touch();
}

function onSelectedAll(isSelected) {
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = isSelected;
		this.rowIsSelected(newRow);
		return newRow;
	});
}

function openDetail(row) {
	const { documentNumber, id, payment, transactions } = row;
	this.documentNumber = documentNumber;
	this.selectedId = id;
	this.paymentMethodName = payment.name;
	this.transactions = [...transactions];
	this.purchase = { ...row };
	this.action.value = true;
	this.action.open = true;
	this.action.title = `Detalle de Compra #${documentNumber}`;
	this.action.code = 'DETAILS';
	this.action.width = 960;
}

function openEdit({ id }) {
	this.goTo('purchases-edit', { params: { id } });
}

function rowIsSelected(row) {
	const index = this.rowsSelected.findIndex((ds) => ds.id === row.id);
	if (row.isSelected) {
		if (index === -1) {
			this.rowsSelected.push(row);
		}
	} else {
		this.rowsSelected.splice(index, 1);
	}
	this.rowSelected =
		this.rowsSelected.length === 1 ? { ...this.rowsSelected[0] } : {};
}

function setParamsData({ value }, paramsName) {
	if (value) {
		this.params[paramsName] = value.id;
	}
}

function setCheckAll(isSelected) {
	this.checkAll = isSelected;
}

function summaryData() {
	const result = this.rows.map((row) => {
		const newRow = {
			flagUse: row.flagUse,
			documentsRelated: row.relatedDocuments
				? row.relatedDocuments
						.map(
							(document) =>
								`${document.typeDocument}: (${document.numberComplete})`
						)
						.join(',  ')
				: '',
			accounted: row.accounted,
			amount: row.amount || 0,
			flagEditPriceSale: row.additionalInformation
				? row.additionalInformation.flagEditPriceSale
				: null,
			createdAt: row.createdAt || new Date(),
			currencySymbol: row.currencySymbol || row.currency,
			dateDocument: row.dateDocument,
			details: row.details || [],
			documentNumber: row.documentNumber || '000-00001',
			dueAmount: row.debtAmount,
			flagIncomeStatus: row.flagIncomeStatus,
			iconArrow: 'arrow_forward',
			id: row.id,
			isSelected: row.isSelected || false,
			payment: row.payment,
			paymentName: row.paymentName || 'CONTADO',
			paymentStateName: row.paymentStateName || 'Pagado',
			statusOrcId: row.statusOrcId,
			sendKardexStatus: row.sendKardexStatus,
			subTotal: row.subTotal || 0,
			supplier: row.supplier || {},
			qrUrl: row.qrUrl,
			supplierName: row.supplier ? row.supplier.name : 'Proveedor Genérico',
			taxes: row.taxes || 0,
			transactions: row.transactions || [],
			typeDocument: row.typeDocument || {},
			typeDocumentCode: row.typeDocument ? row.typeDocument.code : '',
			urlImages: row.urlImages,
			warehouseName: row.warehouse ? row.warehouse.name : '-',
			withholdingTax: row.withholdingTax,
			withholdingTaxActive: row.withholdingTaxActive || null,
			withholdingTaxId: row.withholdingTaxId,
			state: row.state || {},
			totalPerception: row.perception ? row.perception.totalPerception : 0,
		};
		return newRow;
	});
	return result;
}

async function save({ body, paymentType }) {
	try {
		await this.$httpSales.post(
			`amortizations-multiple/${paymentType}/payment`,
			body
		);
		this.showNotification('El pago se realizó correctamente.');
		this.close();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function validations() {
	const rules = {
		endDate: {
			isValidDate: helper.isValidDate,
			minLength: minLength(10),
		},
		startDate: {
			isValidDate: helper.isValidDate,
			minLength: minLength(10),
		},
	};
	return rules;
}

function isValidEndDate() {
	return this.endDate && this.$v.endDate.$dirty && this.$v.endDate.$invalid;
}

function isValidStartDate() {
	return (
		this.startDate && this.$v.startDate.$dirty && this.$v.startDate.$invalid
	);
}

function onUpdateState(row) {
	const { documentNumber } = row;
	this.currentPurchase = { ...row };
	this.action.code = 'UPDATE-STATE';
	this.action.limit = 27;
	this.action.title = `Compra #${documentNumber} - Actualizar Estado`;
	this.action.width = 400;
	this.action.value = true;
	this.action.open = true;
}

async function updateState(orcState) {
	try {
		await this.$httpSales.patch(
			`purchase-documents/${this.currentPurchase.id}/orc`,
			orcState
		);
		this.showNotification(
			'El estado del documento ha sido actualizado correctamente.'
		);
		this.close();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function clickMenu() {
	if (!this.params.warehouseIds) {
		this.showNotification(
			'Debe seleccionar una tienda para generar un reporte',
			'warning'
		);
	}
}

function openRetention(row) {
	const newRow = { ...row };
	newRow.details = row.details.map((detail) => {
		const newDetail = { ...detail };
		newDetail.productCode = detail.product.code;
		return newDetail;
	});
	this.purchase = { ...newRow };
	this.action.code = 'WITHHOLDING-TAX';
	this.action.title = `RETENCIÓN - ${row.typeDocument.code} ${row.documentNumber}`;
	this.action.width = 921;
	this.action.open = true;
	this.action.value = true;
}

function openDialogSri(row) {
	this.dialogSri = true;
	this.linkXml = row.qrUrl;
	this.titleDialogSri = `LIQUIDACIÓN ${row.documentNumber} - ${row.supplierName}`;
	this.authorizationDate = row.authorizationDate;
	this.authorizationNumber = row.authorizationNumber;
	this.idPurchases = row.id;
}

function openDialogKardex() {
	this.dialogKardex = true;
}

function closeDialogKardex() {
	this.dialogKardex = false;
}

function downloadXml() {
	try {
		this.closeDialogSri();
	} catch (error) {
		this.showGenericError();
	}
}

function closeDialogSri() {
	this.dialogSri = false;
	this.closeDialogSri = null;
	this.titleDialogSri = null;
	this.idPurchases = null;
}

async function deletePurchase() {
	try {
		await this.$httpSales.delete(`purchase-documents/${this.idPurchase}`);
		this.showNotification('La compra se eliminó correctamente.');
		this.closeDialogDelete();
		this.loadData();
	} catch (error) {
		this.disabledDelete = false;
		this.showNotification(error.data.messageError, 'error');
	} finally {
		this.disabledDelete = false; // Enable the button
	}
}

function openDialogDelete(row) {
	this.dialogDeletePurchase = true;
	this.titleDialogDelete = '¿Esta seguro que desea eliminar esta compra?';
	this.idPurchase = row.id;
}

function closeDialogDelete() {
	this.dialogDeletePurchase = false;
	this.idPurchase = null;
}

function setDate({ model, value }) {
	this[model] = format(value, 'YYYY-MM-DD');
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function setDataCurrencies({ model, value }) {
	this.purchases[model] = value.code;
	this.params[model] = value.code;
	// this.purchases[model] = model === 'currencies' ? [...value] : value.code;
}

function setStateEntity({ model, value }) {
	this.params[model] = value;
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadData();
}

async function sendKardex() {
	const rowIds = [];
	this.rowsSelected.forEach((row) => {
		rowIds.push(row.id);
	});

	const body = {
		ids: rowIds,
		typeOperation: 1,
		moduleCode: 'COMPRA',
	};

	try {
		await this.$httpSales.post('kardex-movement-insert', body);
		this.showNotification('Se agrego al kardex');
		this.closeDialogKardex();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function goToConvertDocument({ id }) {
	this.goTo('purchases-new', { query: { cloneId: id } });
}

async function exportToPdf({ id }) {
	this.onReportPurchase(id);
}

function data() {
	return {
		nameColumn: '',
		action: {
			code: '',
			open: false,
			limit: 37,
			title: '',
			value: false,
			width: 960,
		},
		warehouseIds: [],
		authorizationDate: null,
		authorizationNumber: null,
		bodyParams: {
			paymentStateIds: null,
			stateIds: null,
			typeDocumentIds: null,
		},
		checkAllDetails: false,
		cleanData: false,
		currencyPurchase: '',
		toggleColumns,
		columns: [
			{
				id: 1,
				name: 'Nro de Documento',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Tipo de documento',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Proveedor',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Estado de pago',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Medio pago',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'IGV',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Subtotal',
				value: 'paymentName',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Total Percepción',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Total',
				visible: true,
				checked: true,
			},
		],
		indexesCancel: [],
		currencies: [],
		detailsSelected: [],
		dialogDeletePurchase: false,
		dialogKardex: false,
		dialogSri: false,
		disabledSearch: false,
		disabledDelete: false,
		disabledButton: false,
		documentNumber: '',
		endDate: null,
		idPurchases: null,
		idPurchase: null,
		isLoading: false,
		kardexStatusTypes: [
			{ id: 1, code: '1', name: 'Pendiente' },
			{ id: 2, code: '2', name: 'En proceso' },
			{ id: 3, code: '3', name: 'Enviado' },
		],
		linkXml: null,
		lastPage: 1,
		features: [],
		filterFeatures: [],
		params: {
			search: null,
			endDate: null,
			limit: 20,
			page: 1,
			startDate: null,
			entityStateId: null,
			sortDirection: 'desc',
			sortField: 'created_at',
			supplierId: null,
			// warehouseId: null,
			warehouseIds: null,
			statusPerception: 2,
		},
		paymentMethods: [],
		paymentMethodName: '',
		paymentStates: [],
		purchases: {
			currencies: [this.$userInfo.company.currencyDefault],
		},
		titleDialogDelete: '',
		titleDialogKardex: 'ENVIAR AL KARDEX',
		titleDialogSri: '',
		rows: [],
		rowsSelected: [],
		rowSelected: {},
		search: '',
		selectedPurchase: {
			id: '',
			documentNumber: '',
			details: [],
		},
		selectedId: 0,
		subsidiaries: [],
		showStateEntity: false,
		startDate: null,
		states: [],
		suppliers: [],
		transactions: [],
		typeDocuments: [],
		typeTaxes: [],
		warehouses: [],
		purchase: {},
	};
}

export default {
	name: 'pages-purchases-list',
	components: {
		appActions,
		actionSidebar,
		autoCompleteComponent,
		appDateSelect,
		dateComponent,
		generalFilter,
		headerPage,
		modalItems,
		purchasesDetailsForm,
		purchasesDispatchConfirm,
		PurchasesListPerception,
		purchasesUpdateState,
		retentionsForm,
	},
	computed: {
		checkAll: {
			get: checkAll,
			set: setCheckAll,
		},
		isValidEndDate,
		isValidStartDate,
		summaryData,
	},
	created,
	data,
	methods: {
		allIsSelected,
		close,
		closeDialogDelete,
		closeDialogSri,
		closeDialogKardex,
		deletePurchase,
		detailIsSelected,
		dispatch,
		downloadXml,
		emitExcel,
		filterList,
		exportToPdf,
		generateExportParams,
		getData,
		goToConvertDocument,
		loadData,
		loadFeatures,
		onDate,
		onInput,
		onPage,
		onSearch,
		onSelectedAll,
		onUpdateState,
		updateSelection(newSelection) {
			this.warehouseIds = newSelection;
		},
		toggleColumns,
		openDetail,
		openDialogDelete,
		openDialogKardex,
		openDialogSri,
		openEdit,
		openRetention,
		rowIsSelected,
		setDate,
		save,
		sendKardex,
		setStateEntity,
		setDataCurrencies,
		setParamsData,
		showDispatch,
		updateColumns,
		updateState,
		clickMenu,
	},
	validations,
};
</script>

<style lang="scss" scoped>
.align-end {
	align-items: flex-end !important;
}

.title-dialog {
	color: color(primary);
	font-family: map-get($fonts, lato-regular);
	font-size: 14px;
	font-weight: 900;
}

.header-dialog {
	background-color: #f2fafa;
}

.text-dialog {
	color: #4a4a4a;
	font-family: map-get($fonts, lato-regular);
	font-size: 14px;
}

.modal-items {
	&-btn {
		border: 1px solid color(primary);
		border-radius: 5px;
		color: color(primary);
		font-weight: 600;
		padding: 4px 15px;

		&--cancel {
			border: 1px solid color(error);
			border-radius: 5px;
			color: color(error);
			font-family: map-get($fonts, lato-bold);
			padding: 4px 0;
			width: 97px;
		}
		&--success {
			border: 1px solid color(primary);
			border-radius: 5px;
			color: color(primary);
			font-family: map-get($fonts, lato-bold);
			padding: 4px 0;
			width: 97px;
		}
	}

	&-action {
		background-color: rgba(195, 231, 232, 0.21);
		padding: 12px 0;
	}
}

.btn-dowload-xml {
	background-color: white !important;
	border: 1px solid color(primary);
	box-shadow: none !important;
	border-radius: 23px;
	color: color(primary);
	display: flex;
	font-family: map-get($fonts, lato-bold);
	padding: 2% 7%;
	width: 199px !important;
}

.outline-none {
	text-decoration: none;
}

.currency-purchase {
	color: color(primary);
	font-weight: bold;
}
</style>
