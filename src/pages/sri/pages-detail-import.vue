<template>
	<div>
		<div v-if="$route.name === 'detail-import'">
			<header-page
				to-show
				:show-excel="false"
				:document="dateImport"
				:title="$route.meta.title"
				@clean-product-filter="cleanFilters"
			/>
			<general-filter>
				<v-layout mt-3>
					<v-flex xs2 lg2 px-1 my-2 class="align-col">
						<app-date-select
							label="Fecha Inicio"
							:date-formatted="startDate"
							model="startDate"
							@input="onDate"
						/>
					</v-flex>
					<v-flex xs2 lg2 px-1 my-2 class="align-col">
						<app-date-select
							label="Fecha Fin"
							:date-formatted="endDate"
							model="endDate"
							@input="onDate"
						/>
					</v-flex>
					<v-flex xs2 lg2 px-1 my-2 class="align-col">
						<app-select
							:label="`${labelWarehouse()} de Documento`"
							item-text="name"
							item-value="code"
							model="typeDocumentIds"
							multiple
							:item="bodyParams.typeDocumentIds"
							:items="typeDocuments"
							:return-object="false"
							@input="onInput"
						></app-select>
					</v-flex>
					<v-flex xs2 lg2 px-1 my-2 class="align-col">
						<app-select
							label="Estado de Recepción"
							item-text="name"
							item-value="id"
							model="stateIds"
							multiple
							:item="bodyParams.stateIds"
							:items="states"
							:return-object="false"
							@input="onInput"
						></app-select>
					</v-flex>
					<v-flex xs2 lg2 px-1 my-2 class="align-col">
						<app-select
							label="Método de Pago"
							item-text="name"
							item-value="id"
							model="paymentMethodId"
							:item="bodyParams.paymentMethodId"
							:items="paymentMethods"
							:return-object="false"
							@input="onInput"
						></app-select>
					</v-flex>
					<v-flex xs2 lg2 px-1 my-2 class="align-col">
						<v-btn
							type="button"
							color="success"
							class="btn-action btn-action-block"
							@click="loadData(1)"
						>
							Buscar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-flex>
					<v-flex xs2 lg2 px-1 my-2 class="align-col">
						<v-btn
							type="button"
							color="primary"
							class="btn-action btn-action-block"
							:disabled="!canOpenMultiPay()"
							@click="openMultiPaysSlide"
						>
							Pago Múltiple
						</v-btn>
					</v-flex>
				</v-layout>
			</general-filter>
			<app-table
				name="import-documents-detail"
				:check-all="checkAll"
				:columns="columns"
				:current-page="currentPage"
				selectable
				:rows="rows"
				:last-page="lastPage"
				class="px-4 mt-4 mb-5 pb-5"
				@on-page="loadData"
				@on-search-event="onSearch"
				@on-selected-all="onSelectedAll"
				@row-is-selected="onRowSelected"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">
						{{ props.row.emissionDate | exactDate('YYYY-MM-DD') }}
					</td>
					<td v-show="showRow(columns, 2)">
						{{ props.row.documentNumber }}
					</td>
					<td v-show="showRow(columns, 3)">{{ props.row.typeCode }}</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.emisor }}
					</td>
					<td v-show="showRow(columns, 5)">{{ props.row.igv | formatNumber }}</td>
					<td v-show="showRow(columns, 6)">
						{{ props.row.paymentMethodName }}
					</td>
					<td v-show="showRow(columns, 7)">
						{{ props.row.amount | formatNumber }}
					</td>
					<td v-show="showRow(columns, 8)">
						{{ getTooltipState(props.row) }}
					</td>
					<td v-show="showRow(columns, 9)">
						<app-tooltip-button
							text="Detalle de Documento"
							icon="remove_red_eye"
							color="primary"
							@click-icon="goToDetail(props.row)"
						/>
						<app-tooltip-button
							v-if="!(props.row.saleDocumentId || props.row.purDocumentId)"
							text="Eliminar Documento"
							icon="delete"
							color="pink"
							@click-icon="deleteDoc(props.row)"
						/>
					</td>
				</template>
			</app-table>
			<action-sidebar
				:title="slideData.title"
				:value="slideData.value"
				:width="slideData.width"
				@close-modal="closeSlide"
			>
				<fees-to-pay-form
					v-if="slideData.code === 'pay-multiple'"
					:is-loading="isLoading"
					is-detail-import-mode
					:currency="$userInfo.company.currency"
					:currency-symbol="countryCurrencySymbol"
					:subsidiaries="subsidiaries"
					:warehouses="warehouses"
					:purchases-data="rowsSelected"
					:type-documents="typeDocuments"
					:transaction-data="transaction"
					@close="closeSlide"
					@save="saveMultiple"
				/>
			</action-sidebar>
			<section class="modal-filter-footer py-0">
				<modal-sidebar-button
					hidden
					:img="false"
					success-color="success"
					success-text="Regresar"
					@accept-button-clicked="goTo('import-documents')"
				/>
			</section>
		</div>
		<div v-else>
			<router-view></router-view>
		</div>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import feesToPayForm from '@/components/purchases/fees-to-pay-form';
import documentState from '@/components/shared/document-state';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { format } from 'date-fns';

const { exactDate } = helper;

function created() {
	const page = Number(this.$route.query.page);
	const safePage = Number.isInteger(page) && page > 0 ? page : 1;
	this.currentPage = safePage;
	this.params.page = safePage;
	// this.params.endDate = exactDate(this.dateEnd, 'YYYY-MM-DD');
	// this.params.startDate = exactDate(this.dateStart, 'YYYY-MM-DD');
	// this.endDate = exactDate(this.dateEnd, 'DD/MM/YYYY');
	// this.startDate = exactDate(this.dateStart, 'DD/MM/YYYY');
	// this.dateImport = exactDate(this.dateStart, 'MM-YYYY');
	this.loadResources();
}

function cleanFilters() {
	this.bodyParams = {
		stateIds: [],
		typeDocumentIds: [],
		paymentMethodId: null,
	};
	this.params = {
		endDate: null,
		limit: 30,
		page: 1,
		search: null,
		startDate: null,
		typeDocumentCode: null,
		status: null,
	};
	this.rowsSelected = [];
	this.checkAll = false;
	this.loadData();
}

function goToDetail({ id }) {
	this.goTo('detail-purchase', {
		params: { purchaseId: id },
		query: { page: this.currentPage },
	});
}

function getFormattedDate(value) {
	if (!value) {
		return format(new Date(), 'YYYY-MM-DD');
	}
	if (typeof value === 'string') {
		const isIsoLike = value.includes('-');
		if (isIsoLike) {
			return exactDate(value, 'YYYY-MM-DD');
		}
	}
	const parsedDate = new Date(value);
	if (Number.isNaN(parsedDate.getTime())) {
		return format(new Date(), 'YYYY-MM-DD');
	}
	return format(parsedDate, 'YYYY-MM-DD');
}

function buildQuote(document) {
	return {
		amount: this.roundInNumber(Number(document.amount || 0)),
		amountPayment: this.roundInNumber(Number(document.dueAmount || 0)),
		amountToPayShow: this.roundInNumber(Number(document.debtAmount || 0)),
		amountToPay: Number.parseFloat(Number(document.debtAmount || 0)).toFixed(2),
		expirationDate: getFormattedDate(document.expirationDate),
		id: document.id,
		menu: false,
		status: Number(document.dueAmount || 0) ? 2 : 1,
		statusName: Number(document.dueAmount || 0) ? 'Parcial' : 'Pendiente',
	};
}

function getDocumentSupplierId(document) {
	if (!document) {
		return null;
	}
	return (
		document.supplierId ||
		(document.supplier && document.supplier.id) ||
		(document.additionalInformation && document.additionalInformation.supplierId) ||
		null
	);
}

async function loadData(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	this.params.purDocumentAnnexId = this.id;
	this.params.moduleCode = 'COMPRA';
	this.params.typeDocumentCode =
		this.bodyParams.typeDocumentIds && this.bodyParams.typeDocumentIds.length > 0
			? this.bodyParams.typeDocumentIds.toString()
			: null;
	this.params.status =
		this.bodyParams.stateIds && this.bodyParams.stateIds.length > 0
			? this.bodyParams.stateIds.toString()
			: null;
	this.params.paymentMethodId = this.bodyParams.paymentMethodId || null;
	this.status = this.states.map((l) => l.id);
	const params = { ...this.params };
	try {
		const { data: purchases, headers } = await this.$httpSales.get(
			'document-account-status',
			{ params }
		);
		const selectedMap = this.rowsSelected.reduce((accum, row) => {
			const newAccum = { ...accum };
			newAccum[row.id] = true;
			return newAccum;
		}, {});
		this.rows = purchases.map((purchase) => {
			const newPurchase = { ...purchase };
			const { additionalInformation = {} } = purchase;
			const { infoDocument } = additionalInformation;
			newPurchase.typeCode = purchase.typeTransaction
				? purchase.typeTransaction.code
				: '-';
			newPurchase.emisor = infoDocument
				? infoDocument.receiverName || infoDocument.razonSocialComprador
				: '-';
			newPurchase.amount = Math.abs(Number(purchase.amount || 0));
			newPurchase.igv = infoDocument
				? Math.abs(infoDocument.igv || infoDocument.totalImpuesto || 0)
				: 0;
			newPurchase.paymentMethodName =
				(infoDocument && infoDocument.medioPago && infoDocument.medioPago.codigo) ||
				'N/A';
			newPurchase.supplierId = getDocumentSupplierId(newPurchase);
			newPurchase.disabled =
				Number(newPurchase.debtAmount || 0) <= 0 ||
				!!newPurchase.saleDocumentId ||
				!!newPurchase.purDocumentId;
			newPurchase.isSelected = !!selectedMap[newPurchase.id];
			newPurchase.caDocument = {
				details: [buildQuote.call(this, newPurchase)],
			};
			return newPurchase;
		});
		this.rowsSelected = this.rows.filter((row) => row.isSelected);
		this.checkAll = this.rows
			.filter((row) => !row.disabled)
			.every((row) => row.isSelected);
		this.lastPage = Number(headers['x-last-page']);
	} catch (err) {
		console.log(err);
		this.showGenericError();
	}
}

async function loadResources() {
	const requests = [
		this.getTypeDocuments('purchases'),
		this.$httpSales.get('states'),
		this.getPaymentsMethods(),
		this.$httpSales.get(`cash/${this.$userInfo.cashId}`),
		this.$httpSales.get('subsidiaries'),
		this.warehousesList(),
	];
	try {
		const [
			{ data: typeDocuments },
			{ data: states },
			{ data: paymentMethods },
			{ data: cashUser },
			{ data: subsidiaries },
			{ data: warehouses },
		] = await Promise.all(requests);
		this.typeDocuments = typeDocuments.map((td) => td.documentType);
		this.states = states;
		this.paymentMethods = paymentMethods;
		this.cashUser = cashUser;
		this.subsidiaries = subsidiaries;
		this.warehouses = warehouses;
		this.loadData(this.currentPage);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function onDate({ value, model }) {
	this.params[model] = value;
}

function onInput({ model, value }) {
	this.bodyParams[model] = value;
}

function onSearch(search) {
	this.params.search = search ? search.trim() : null;
	this.loadData();
}

function getColorState({ saleDocumentId, purDocumentId }) {
	return saleDocumentId || purDocumentId ? 'success' : 'pink';
}

function getTooltipState({ saleDocumentId, purDocumentId }) {
	return saleDocumentId || purDocumentId ? 'Registrada' : 'Pendiente';
}

function onSelectedAll(isSelected) {
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = !row.disabled && isSelected;
		return newRow;
	});
	this.checkAll = isSelected;
	this.rowsSelected = this.rows.filter((row) => row.isSelected);
}

function onRowSelected(row) {
	if (row.paymentMethodName !== 'CONTADO') return;
	this.rows = this.rows.map((register) => {
		const newRegister = { ...register };
		if (register.id === row.id) {
			newRegister.isSelected = row.isSelected;
		}
		return newRegister;
	});
	this.rowsSelected = this.rows.filter((register) => register.isSelected);
	this.checkAll = this.rows
		.filter((register) => !register.disabled)
		.every((register) => register.isSelected);
}

function openMultiPaysSlide() {
	//Cambio para enviar un solo documento para pago multiple
	if (this.rowsSelected.length < 1) {
		this.showNotification(
			'Es necesario seleccionar al menos dos compras para activar esta opción.',
			'warning'
		);
		return;
	}
	if (!this.cashUser.flagActive) {
		this.showNotification(
			'Es necesario activar su caja para poder registrar los pagos.',
			'info'
		);
		return;
	}
	this.transaction = {
		...this.transaction,
		dateReference: format(new Date(), 'YYYY-MM-DD'),
		reference: 'Pago múltiple desde detalle de importación.',
	};
	this.slideData = {
		code: 'pay-multiple',
		title: 'PAGO MÚLTIPLE',
		value: true,
		width: 600,
	};
}

function closeSlide() {
	this.slideData = {
		code: null,
		title: '',
		value: false,
		width: 600,
	};
	this.isLoading = false;
	this.transaction = {
		bankAccountId: null,
		dateReference: '',
		documentNumber: '',
		flagForm: null,
		reference: '',
		urlImage: '',
	};
}

async function saveMultiple({ body, paymentType }) {
	this.isLoading = true;
	console.log('body => ', body);
	console.log('paymentType => ', paymentType);
	const newBody = {
		subsidiaryId: body.subsidiaryId || null,
		warehouseId: body.warehouseId || null,
		moduleCode: null,
		amount: body.amount,
		bankAccountId: body.bankAccountId || null,
		typePaymentId: paymentType,
		currency: body.currency || 'PEN',
		cashId: this.cashUser.id,
		documentsAccountStatus: body.documents.map((document) => ({
			id: document.purDocumentId,
			amount: document.payments.reduce(
				(accum, detail) => accum + Number(detail.amountPayment),
				0
			),
			observations: document.observations || null,
			urlImage: document.urlImage || null,
			additionalInformation: {
				documentNumber:
					(document.additionalInformation &&
						document.additionalInformation.documentNumber) ||
					null,
				paymentDate:
					(document.additionalInformation &&
						document.additionalInformation.paymentDate) ||
					(document.payments &&
						document.payments[0] &&
						document.payments[0].expirationDate) ||
					null,
				reference:
					(document.additionalInformation && document.additionalInformation.reference) ||
					null,
				concept:
					(document.additionalInformation && document.additionalInformation.concept) ||
					null,
			},
		})),
	};
	const documentsToPay = { ...newBody };
	documentsToPay.documentsAccountStatus = newBody.documentsAccountStatus.filter(
		(document) => document.amount
	);
	//const url = 'collection-transaction/batch';
	//se cambia a uno para realizar pagos multiples con una solo documento
	if (documentsToPay.documentsAccountStatus.length >= 1) {
		try {
			//await this.$httpSales.post(url, documentsToPay);
			this.closeSlide();
			this.rowsSelected = [];
			this.checkAll = false;
			this.loadData(this.currentPage);
			this.showNotification('El pago se realizó correctamente.');
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'BANK_ACCOUNT_NOT_FOUND') {
					this.showNotification('Seleccionar cuenta.', 'error');
				} else if (err.data.message === 'SALE_NOT_ALLOWED') {
					this.showGenericError(
						'La cuota que intenta pagar se encuentra con el estado de pago: "Pagado"'
					);
				} else if (err.data.message === 'HEADER_AMOUNT_EXCEEDED') {
					this.showNotification('Los montos son incorrectos', 'error');
				}
			}
		} finally {
			this.isLoading = false;
		}
	} else {
		this.showNotification(
			'Debes seleccionar al menos dos compras con monto para realizar el pago múltiple.',
			'info'
		);
		this.isLoading = false;
	}
}

function $route({ name }) {
	if (name === 'detail-import') {
		const page = Number(this.$route.query.page);
		const safePage = Number.isInteger(page) && page > 0 ? page : 1;
		this.currentPage = safePage;
		this.params.page = safePage;
		this.loadResources();
	}
}

function data() {
	return {
		typeDocumentCode: null,
		bodyParams: {
			stateIds: null,
			typeDocumentIds: null,
			paymentMethodId: null,
		},
		columns: [
			{ id: 1, name: 'Fecha', value: 'emissionDate', checked: true, visible: true },
			{
				id: 2,
				name: '# Documento',
				value: 'documentNumber',
				checked: true,
				visible: true,
			},
			{ id: 3, name: 'Cod. Tipo Doc.', value: 'typeCode', checked: true, visible: true },
			{ id: 4, name: 'Proveedor', value: 'emisor', checked: true, visible: true },
			{ id: 5, name: 'Impuestos', value: 'igv', checked: true, visible: true },
			{
				id: 6,
				name: 'Método de pago',
				value: 'paymentMethodName',
				checked: true,
				visible: true,
			},
			{ id: 7, name: 'Monto Total', checked: true, visible: true },
			{ id: 8, name: 'Estado', value: 'entityStateName', checked: true, visible: true },
			{ id: 9, name: 'Acción', value: 'action', checked: true, visible: true },
		],
		currentPage: 1,
		checkAll: false,
		dateImport: null,
		endDate: null,
		cashUser: {},
		isLoading: false,
		lastPage: 0,
		params: {
			endDate: null,
			limit: 30,
			page: 1,
			search: null,
			startDate: null,
			typeDocumentCode: null,
			status: null,
		},
		rows: [],
		rowsSelected: [],
		slideData: {
			code: null,
			title: '',
			value: false,
			width: 600,
		},
		startDate: null,
		state: null,
		states: [],
		subsidiaries: [],
		warehouses: [],
		paymentMethods: [],
		typeDocuments: [],
		typeDocument: null,
		transaction: {
			bankAccountId: null,
			dateReference: '',
			documentNumber: '',
			flagForm: null,
			reference: '',
			urlImage: '',
		},
	};
}
export default {
	name: 'page-detail-import',
	components: {
		actionSidebar,
		feesToPayForm,
		documentState,
		headerPage,
		appTable,
		generalFilter,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		cleanFilters,
		getColorState,
		getDocumentSupplierId,
		getTooltipState,
		goToDetail,
		loadData,
		loadResources,
		onRowSelected,
		onSelectedAll,
		onDate,
		onInput,
		onSearch,
		openMultiPaysSlide,
		canOpenMultiPay() {
			return (
				this.rowsSelected.length >= 1 &&
				this.rowsSelected.every(
					(document) =>
						(document.saleDocumentId || document.purDocumentId) && document.status !== 3
				)
			);
		},
		async deleteDoc(row) {
			console.log(row);
			try {
				await this.$httpSales.delete(`/document-account-status/${row.id}`);
				this.showNotification(
					`Se eliminó correctamente el documento ${row.documentNumber}`,
					'error'
				);
				this.loadData(this.currentPage);
			} catch (err) {
				this.showGenericError();
			}
		},
		closeSlide,
		saveMultiple,
	},
	props: {
		dateEnd: [Date, String, Number],
		dateStart: [Date, String, Number],
		id: [Number, String],
	},
	watch: {
		$route,
	},
};
</script>
