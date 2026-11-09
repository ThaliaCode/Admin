<template>
	<section>
		<header-page
			name="withholding"
			emit-excel
			title="LISTA DE RETENCIONES EMITIDAS"
			to-show
			@clean-product-filter="cleanFilter"
			@emit-excel="emitExcel"
		>
		</header-page>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter>
			<v-layout
				mb-3
				mt-3
				wrap
			>
				<v-flex xs3 mr-3>
					<app-select
						:items="suppliers"
						:item="params.supplierId"
						item-text="name"
						item-value="id"
						label="Proveedor"
						model="supplierId"
						@input="getData"
					/>
				</v-flex>
				<v-flex xs2 mr-3 >
					<app-date-select
						:date-formatted="params.startDate"
						label="Fecha de inicio"
						model="startDate"
						@input="onDate"
					/>
				</v-flex>
				<v-flex xs2 mr-3>
					<app-date-select
						:date-formatted="params.endDate"
						label="Fecha de fin"
						:min-date="params.startDate"
						model="endDate"
						@input="onDate"
					/>
				</v-flex>
				<v-flex xs2 pt-4>
					<v-btn
						type="button"
						color="success"
						class="btn-action"
						@click="search"
					>
						Buscar
						<img :src="`${$imageUrl}/icon-apply.svg`" alt="Buscar Retenciones" />
					</v-btn>
				</v-flex>
			</v-layout>
		</general-filter>
		<withholding-list
			:last-page="lastPage"
			:current-page="currentPage"
			:check-all="checkAll"
			:rows="rows"
			@on-page="onPage"
			@click-icon="downloadRetention"
			@see-detail="slideModal($event, 'WITHHOLDING-TAX')"
			@slide-modal="slideModal"
			@on-search="onSearch"
			@cancel-retention="slideModal($event, 'cancel-retention')"
			@send-data="onSelect"
			@is-selected="rowIsSelected"
			@all-selected="selectedAll"
		>
		</withholding-list>
		<action-sidebar
			v-model="action.open"
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			@close-modal="closeModal"
		>
			<sales-sunat 
				v-if="actionCodeIs('electronic-billing')"
				referenceWithholding
				:rows="dataSelected"
				@cancel-modal="close"
				@remove-sales-sunat="remove"
				@reload-sales-sunat="reload"
			></sales-sunat>
			<v-flex v-else>
				<retentions-form
					v-if="action.code === 'WITHHOLDING-TAX'"
					:bases="typeTaxes"
					is-loading
					:purchase="purchase"
					:purchase-details="purchase.details"
					:retention-data="withholdingSelected"
					:supplier="purchase.supplier"
					:type-document-code="withholdingSelected.typeDocumentCode"
					readonly
					@close="closeModal"
				></retentions-form>
				<cancel-withholding
					:cancel="cancelDialog"
					v-else-if="action.code === 'cancel-retention'"
					@cancel-withholding="cancelWithholdingId"
					@cancel-dialog="closeModal"
				></cancel-withholding>
				<withholding-detail
					v-else
					:date="withholdingSelected.authorizationDate"
					:message="withholdingSelected.msgSri"
					:number="withholdingSelected.authorizationNumber"
					:xml="withholdingSelected.urlXml"
				/>
			</v-flex>
		</action-sidebar>
		<app-show-dialog
			color-dialog="error"
			color-hex="#D5331A"
			title-header="ANULAR RETENCIÓN"
			text-content="Este documento no puede ser anulado, por que aún esta activo en la SRI"
			:show-modal-init="showDialogCancelWithholding"
			max-width-dialog="571px"
			@close-dialog="closeDialogCancelWithholding"
		/>
	</section>
</template>

<script>
import { format, subDays } from 'date-fns';
import appDateSelect from '@/components/shared/app-date-select';
import appSelect from '@/components/shared/app-select';
import appShowDialog from '@/components/shared/app-show-dialog';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import cancelWithholding from '@/components/withholding/cancel-withholding';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import retentionsForm from '@/components/purchases/retentions-form';
import withholdingDetail from '@/components/withholding/withholding-detail';
import withholdingList from '@/components/withholding/withholding-list';
import salesSunat from '@/components/sales/sales-sunat';
import tableCode from '@/shared/table-code';
import helper from '../../shared/helper';

function data() {
	return {
		checkAll: false,
		data: [],
		dataSelected: [],
		action: {
			code: '',
			open: false,
			title: '',
			width: 450,
		},
		cancelDialog: {
			commentary: '',
		},
		idWithHolding: null,
		lastPage: 1,
		params: {
			endDate: null,
			limit: 20,
			page: 1,
			startDate: null,
			supplierId: null,
			sortField: 'created_at',
		},
		rows: [],
		showDialogCancelWithholding: false,
		withholdingSelected: {},
		suppliers: [],
		isLoading: false,
		typeTaxes: [],
		purchase: {},
	};
}

async function loadData() {
	const { data: withholdings, headers } = await this.$httpSales.get('withholding-tax', {
		params: this.params,
	});
	this.lastPage = Number(headers['x-last-page']);
	this.rows = withholdings.map((item) => {
		const supplier = item.purchase.supplier || {};
		const typeDocument = item.purchase.typeDocument || {};
		const newItem = {
			id: item.id,
			authorizationDate: item.authorizationDate || '',
			authorizationNumber: item.authorizationNumber || '',
			createdAt: item.createdAt,
			currency: item.purchase.currency,
			currencySymbol: item.purchase.currencySymbol,
			details: item.details,
			msgSri: item.msgSri,
			password: item.password,
			purchaseAmount: item.purchase.amount,
			purchaseId: item.purchase.id,
			purchaseDate: item.purchase.dateDocument,
			purchaseNumber: item.purchase.documentNumber,
			stateDocumentTax: item.stateDocumentTax,
			statusTaxName: item.statusTaxName,
			supplierName: supplier.commercialName,
			supplierNumber: supplier.documentNumber,
			typeDocumentCode: typeDocument.code,
			typeDocumentName: typeDocument.name,
			withholdingNumber: item.numberOperation,
			urlXml: item.urlXml,
			retIvaTotal: item.details.reduce((a, d) => {
				if (d.nameTax === 'IVA') {
					return a + d.amountTax;
				}
				return a;
			}, 0),
			retRentaTotal: item.details.reduce((a, d) => {
				if (d.nameTax === 'RENTA') {
					return a + d.amountTax;
				}
				return a;
			}, 0),
			total: item.details.reduce((a, d) => a + d.amountTax, 0),
		};
		return newItem;
	});
	return this.rows;
}

function created() {
	this.loadData();
	this.loadTypeTaxes();
	this.loadSuppliers();
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
}

async function cleanFilter() {
	this.params.startDate = null;
	this.params.endDate = null;
	this.params.supplierId = null;
	await this.loadData();
}

function closeModal() {
	this.action.code = '';
	this.action.title = '';
	this.action.open = false;
	this.withholdingSelected = {};
	this.idWithHolding = null;
	this.cancelDialog = {
		commentary: '',
		flagKardex: null,
	};
}

function currentPage() {
	return this.params.page;
}

async function downloadRetention({ purchaseId, withholdingNumber }) {
	const model = { code: 'withholding-tax' };
	const downloadDialog = this.$userInfo.company.settings.downloadSale;
	const responseType = 'blob';
	const contentType = downloadDialog ? 'application/pdf' : 'text/html';
	const response = await this.$httpReportSales.post(`withholding-tax/${purchaseId}/pdf`, model, { responseType });
	const blob = helper.generateBlob(response.data, contentType);
	helper.showDownloadDialog(blob, `retencion_${withholdingNumber}`, downloadDialog);
}

function onDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

async function onPage(page) {
	this.params.page = page;
	await this.loadData();
}

async function search() {
	await this.loadData();
}

function slideModal(row, code) {
	this.withholdingSelected = { ...row };
	if (code === 'cancel-retention') {
		this.idWithHolding = row.id;
		this.loadCancelWithHolding(row);
	} else {
		this.loadPurchase(row.purchaseId);
		this.action.code = code || 'withholding-detail';
		this.action.title = `Retención #${row.withholdingNumber} - ${row.supplierName}`;
		this.action.width = code ? 921 : 450;
		this.action.open = true;
	}
}

async function loadCancelWithHolding(row) {
	try {
		const response = await this.$httpSales.get(`withholding-tax/${this.idWithHolding}/validate`);
		this.flagCancelRetention = response.data.validated.flagCancel;
		if (this.flagCancelRetention) {
			this.action = {
				open: true,
				code: 'cancel-retention',
				title: `Anular Retención - ${row.purchaseNumber}`,
				width: 450,
			};
		} else {
			this.showDialogCancelWithholding = true;
		}
	} catch (error) {
		this.showGenericError();
	}
}

async function loadSuppliers() {
	const { data: response } = await this.$httpSales.get('suppliers');
	this.suppliers = response;
}

function getData({ model, value }) {
	this.params[model] = value.id;
}

function emitExcel() {
	const params = {
		startDate: this.params.startDate,
		endDate: this.params.endDate,
		supplierId: this.params.supplierId,
	};
	const codeReport = 'list-withholding-tax';
	const prefixName = 'Lista_de_retenciones_';
	this.onEmitExcel(codeReport, prefixName, params);
}

function onSearch(value) {
	const searchTrim = value ? value.trim() : '';
	this.params.search = searchTrim || null;
	this.loadData();
}

async function loadTypeTaxes() {
	({ data: this.typeTaxes } = await this.$httpSales.get(
		`catalog-sunat-details-list/${tableCode.IvaRate}`));
}

async function loadPurchase(purchaseId) {
	try {
		const { data: purchaseData } = await this.$httpSales.get(
			`purchase-documents/${purchaseId}`);
		purchaseData.details = purchaseData.details.map((detail) => {
			const newDetail = { ...detail };
			const subtotal = detail.price * detail.quantity;
			const discount = detail.discountPercentage ?
				subtotal * (detail.discountPercentage / 100) : detail.discountAmount;
			const total = (subtotal + detail.taxAmount) - discount;
			newDetail.brandName = detail.product.brandName;
			newDetail.discount = discount;
			newDetail.productCode = detail.product.code;
			newDetail.productName = detail.product.name;
			newDetail.subtotal = subtotal;
			newDetail.taxes = detail.taxAmount;
			newDetail.total = total;
			newDetail.unitName = detail.product.unitName;
			return newDetail;
		});
		this.purchase = { ...purchaseData };
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}
async function cancelWithholdingId() {
	const body = {
		commentary: this.cancelDialog.commentary,
	};
	try {
		await this.$httpSalesRead.post(`withholding-tax/${this.idWithHolding}/cancel`, body);
		this.showNotification('La retención fue anulada correctamente.');
		this.loadData();
		this.closeModal();
	} catch (error) {
		this.showGenericError();
	}
}

function closeDialogCancelWithholding() {
	this.idWithHolding = null;
	this.showDialogCancelWithholding = false;
}

function runAction({ code }) {
	if (code === 'electronic-billing') {
		this.action.code = code;
		this.action.title = 'Facturación Electrónica';
		this.action.open = true;
	}
}

function actionsDisabled() {
	const disabled = this.dataSelected.length === 0;
	return [{ code: 'electronic-billing', disabled }];
}

function onSelect(childrenSelected) {
	this.dataSelected = childrenSelected;
}

function actionCodeIs(code) {
	return this.action.code === code;
}

function remove({ id }) {
	const index = this.dataSelected.findIndex(d => d.id === id);
	const indexTable = this.rows.findIndex(d => d.id === id);
	this.dataSelected.splice(index, 1);
	if (indexTable > -1) {
		this.rows[indexTable].isSelected = false;
	}
	this.checkAll = false;
}

function reload() {
	this.close();
	this.dataSelected = [];
	this.loadData();
}

function close() {
	this.action.open = false;
	this.action.code = '';
	this.action.title = '';
}

function rowIsSelected(row, all) {
	if (row.isSelected) {
		if (this.dataSelected.length > 0 && all) {
			const dataToAdd = this.dataSelected.find(rowSelected =>
				rowSelected.id === row.id);
			if (!dataToAdd) {
				this.dataSelected.push(row);
			}
		} else {
			this.dataSelected.push(row);
		}
	} else {
		const index = this.dataSelected.findIndex(rowData => rowData.id
			=== row.id);
		this.dataSelected.splice(index, 1);
	}
	this.checkAll = this.rows.every(check => check.isSelected);
}

function selectedAll(value) {
	this.checkAll = value;
	if (this.rows.length > 0) {
		this.rows = this.rows.map((dataSingle) => {
			const newData = Object.assign({}, dataSingle);
			newData.isSelected = value;
			if (newData.isSelected) {
				if (this.dataSelected.length > 0) {
					const dataToAdd = this.dataSelected.find(rowSelected =>
						rowSelected.id === newData.id);
					if (!dataToAdd) {
						this.dataSelected.push(newData);
					}
				} else {
					this.dataSelected.push(newData);
				}
			} else {
				const index = this.dataSelected.findIndex(rowData => rowData.id
					=== newData.id);
				this.dataSelected.splice(index, 1);
			}
			return newData;
		});
	}
}

export default {
	name: 'pages-withholding-list',
	components: {
		actionSidebar,
		appShowDialog,
		cancelWithholding,
		generalFilter,
		headerPage,
		retentionsForm,
		withholdingDetail,
		withholdingList,
		appSelect,
		appActions,
		salesSunat,
		appDateSelect,
	},
	computed: {
		currentPage,
		actionsDisabled,
	},
	created,
	data,
	methods: {
		cancelWithholdingId,
		cleanFilter,
		closeDialogCancelWithholding,
		closeModal,
		downloadRetention,
		loadCancelWithHolding,
		loadData,
		loadPurchase,
		loadTypeTaxes,
		onDate,
		onPage,
		search,
		slideModal,
		loadSuppliers,
		getData,
		emitExcel,
		onSearch,
		runAction,
		onSelect,
		actionCodeIs,
		remove,
		reload,
		close,
		rowIsSelected,
		selectedAll,
	},
};
</script>
