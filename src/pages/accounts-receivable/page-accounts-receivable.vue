<template>
	<div>
		<app-loading
			:show-loading="loadingPage"
			label="La carga terminará en unos minutos
			para poder continuar con el proceso."
		/>
		<header-page
			column-class="xs12"
			:show-excel="false"
			:title="$route.meta.title"
			to-show
			@clean-product-filter="cleanCustomer"
		>
			<v-flex xs12 text-xs-right>
				<header-detail
					v-if="customerSelected.id"
					:detail="customerSelected.typePerson.fullName"
					title="Nombre de Cliente"
				></header-detail>
			</v-flex>
		</header-page>
		<v-layout wrap pa-2 align-start>
			<v-flex xs12>
				<v-layout ml-2>
					<v-flex xs2 mr-2>
						<app-select
							v-if="subsidiaries.length > 1"
							:item="documentsParams.subsidiaryId"
							item-text="sucursalName"
							item-value="id"
							:items="subsidiaries"
							:label="labelSucursal()"
							:place-holder="`Selecciona un ${labelSucursal()}`"
							model="subsidiaryId"
							:return-object="false"
							@input="setStatus"
						></app-select>
						<div v-else>
							<p class="mb-1 label-text">{{ labelSucursal() }}</p>
							<p class="mb-0" v-if="subsidiaries[0]">
								{{ subsidiaries[0].sucursalName }}
							</p>
						</div>
					</v-flex>
					<v-flex xs3 mr-2>
						<person-search-input
							ref="customerSearcher"
							ref-value="customerSearcher"
							id="customerSearcher"
							:clean-input="cleanInput"
							:search-value="selectedCustomer"
							flag-init
							@search="openSearch"
						/>
					</v-flex>
					<v-flex xs2 mr-2>
						<app-select
							:item="documentsParams.status"
							item-text="name"
							item-value="id"
							:items="states"
							label="Estado de cobro"
							place-holder="Selecciona un estado"
							model="status"
							:return-object="false"
							@input="setStatus"
						></app-select>
					</v-flex>
					<v-flex xs4 mr-2>
						<v-layout wrap align-center>
							<v-flex xs6 pr-2>
								<label class="caption">Fecha Inicial</label>
								<date-component
									:date="documentsParams.startDate"
									icon="/static/img/calendar.svg"
									@on-input="setDate({ model: 'startDate', value: $event })"
								></date-component>
							</v-flex>
							<v-flex xs6>
								<label class="caption">Fecha Final</label>
								<date-component
									:date="documentsParams.endDate"
									icon="/static/img/calendar.svg"
									@on-input="setDate({ model: 'endDate', value: $event })"
								></date-component>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex>
				<v-layout ml-2 xs12>
					<v-flex xs2 mr-2>
						<app-select
							multiple
							chips
							:item="documentsParams.warehouseIds"
							item-text="name"
							item-value="id"
							:items="warehouses"
							label="Tienda"
							model="warehouseIds"
							:return-object="false"
							@input="setStatus"
						></app-select>
					</v-flex>
					<v-flex xs2 mr-2>
						<app-select
							:item="documentsParams.currency"
							item-text="name"
							item-value="id"
							:items="currencies"
							label="Moneda"
							model="currency"
							:return-object="false"
							@input="setStatus"
						></app-select>
					</v-flex>
				</v-layout>
			</v-flex>

			<v-flex xs12 pt-3>
				<v-layout wrap justify-start>
					<div
						v-for="detail in details"
						:key="detail.id"
						class="register-detail-container mb-2 ml-1"
					>
						<register-detail
							:field="detail.field"
							:label="detail.label"
							:large="detail.large"
							:value="detail.value"
						></register-detail>
					</div>
				</v-layout>
			</v-flex>
			<v-flex md6 pr-2 pt-2>
				<heading-list title="Documentos por cobrar">
					<template slot="action-button">
						<template v-if="documentsSelected.length < 2">
							<v-tooltip top>
								<button
									class="multi-pay-button"
									disabled
									slot="activator"
									type="button"
									@click="openMultiPaysSlide"
								>
									Cobro Múltiple
								</button>
								<span
									>Es necesario seleccionar dos o más movimientos para activar esta
									opción.</span
								>
							</v-tooltip>
						</template>
						<template v-else>
							<button
								class="multi-pay-button"
								slot="activator"
								type="button"
								@click="openMultiPaysSlide"
							>
								Cobro Múltiple
							</button>
						</template>
					</template>
				</heading-list>
				<documents-list
				    @click-document-link="goToSaleDetail"
					:show-entity="showStateEntity"
					:all-documents-checked="allDocumentsChecked"
					:btn-add-disabled="btnAddDocumentDisabled"
					:btn-add-text="btnAddText"
					:current-page="documentsParams.page"
					:documents="documents"
					entity="cliente"
					footer-label="Total de cobros pendientes"
					footer-show
					:footer-value="totalDebtsAmount"
					:last-page="lastDocumentsPage"
					:search="search"
					@add-document="addDocument"
					@all-documents-selected="allDocumentsSelected"
					@change-page="loadDocuments"
					@edit-document="onEditDocument"
					@on-row-clicked="onRowClicked"
					@open-delete-confirmation="openDeleteConfirmation"
					@search-document="loadDocuments(1)"
					@set-search="setSearch"
					@document-selected="onDocumentSelected($event)"
				></documents-list>
			</v-flex>
			<v-flex md6 pl-2 pt-2>
				<heading-list class="pb-2 pt-3" :details="documentDetails"></heading-list>
				<movements-list
					show-cxc
					show-detail
					:show-entity="showStateEntity"
					:btn-add="false"
					:btn-add-disabled="btnAddMovementDisabled"
					:btn-retention-disabled="btnRetentionDisabled"
					:load-message="loadMessage"
					:movements="movements"
					:search="searchMovement"
					:show-search="false"
					:details="detailsMovement"
					@on-click-icon="onClickIcon"
					@edit-movement="onEditMovement"
					@print-movement="onPrintMovement"
					@on-row-clicked="onRowClicked($event, 'movement')"
					@open-delete-confirmation="openDeleteConfirmation"
					@set-search="setSearchMovement"
					@search-movement="searchMovementEvent"
				></movements-list>
			</v-flex>
		</v-layout>
		<v-dialog v-model="dialog" persistent max-width="360">
			<v-card>
				<v-card-text> ¿Desea eliminar {{ dialogMessage }}? </v-card-text>
				<v-card-actions>
					<v-layout row wrap>
						<v-flex xs6 pr-2 text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelDelete"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-2 text-xs-left>
							<v-btn
								:disabled="disabledBtnDelete"
								color="error"
								class="btn-action white--text"
								@click.native="deleteRegister"
							>
								Eliminar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<action-sidebar
			:title="slideData.title"
			:value="slideData.value"
			:width="slideData.width"
			@close-modal="closeSlide"
		>
			<document-form
				v-if="actionCode('create-document')"
				:amount-required="$v.forms.newDocument.amount.$invalid"
				:document="forms.newDocument"
				:loading="loading"
				:type-transaction-required="$v.forms.newDocument.typeTransactionId.$invalid"
				:origin-code="accountsReceivableCode"
				@set-data="onSetData"
				@set-data-amount="onSetDataAmount"
				@set-date="onSetDate"
				@cancel="closeSlide(true)"
				@save="saveDocument"
			></document-form>
			<movement-form
				v-if="actionCode('create-movement')"
				:amount-required="$v.forms.newMovement.amount.$invalid"
				:movement="forms.newMovement"
				:loading="loading"
				:customer="customerSelected"
				:type-documents="typeDocuments"
				:origin-code="accountsReceivableCode"
				@set-data="onSetData"
				@set-data-amount="onSetDataAmount"
				@set-date="onSetDate"
				@cancel="closeSlide"
				@save="saveMovement"
				@valid-sale="validSale"
			></movement-form>
			<amortizations-component
				v-if="actionCode('multipays')"
				:amortization-data="amortization"
				:currency="$userInfo.company.currency"
				:currency-symbol="countryCurrencySymbol"
				:customer="customerSelected"
				:disabled-collect="disabledCollect || savingMultiPay"
				:is-different-cash="isDifferentCash"
				:quote-error="quoteError"
				:data-selected="documentsSelected"
				show-buttons
				:total-amount="totalAmount"
				:total-to-pay="totalToPay"
				:transaction-data="transaction"
				:type-payment-code="typePaymentCode"
				:type-payments="typePayments"
				@cancel="closeSlide"
				@get-data="getData"
				@get-data-number="getDataNumber"
				@get-transaction-data="getTransactionData"
				@save="save"
				@show-error-message="showErrorMessage"
			/>
			<retentions-form
				v-if="actionCode('withholding-taxes')"
				:bases="typeTaxes"
				:date-formatted="false"
				:is-loading="retentionLoading"
				from-sale
				:purchase="sale"
				:purchase-details="sale.details"
				:purchase-disabled="!retentionExist"
				:retention-data="retentionData"
				:customer="customerSelected"
				:flag-includes-taxes="flagIncludesTaxes"
				@close="closeSlide"
				@save="saveRetention"
				@retention-amount="getRetentionAmount"
				@retention-iva-amount="getRetentionIvaAmount"
			></retentions-form>
			<person-search-form
				v-if="slideData.code === 'customer-searcher'"
				:search-value="searchVal"
				@add-person="setCustomer"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import { format } from 'date-fns';
import { required } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import amortizationsComponent from '@/components/amortizations/amortizations-component';
import documentForm from '@/components/movements-in-accounts/document-form';
import documentsList from '@/components/movements-in-accounts/documents-list';
import headerDetail from '@/components/movements-in-accounts/header-detail';
import headerPage from '@/components/shared/header-page';
import headingList from '@/components/movements-in-accounts/heading-list';
import movementForm from '@/components/movements-in-accounts/movement-form';
import movementsList from '@/components/movements-in-accounts/movements-list';
import registerDetail from '@/components/movements-in-accounts/register-detail';
import retentionsForm from '@/components/purchases/retentions-form';
import searchingByEntity from '@/components/movements-in-accounts/searching-by-entity';
import personSearchInput from '@/components/shared/searcher/person-search-input';
import ModuleCode from '@/shared/module';
import TableCode from '@/shared/table-code';
import helper from '@/shared/helper';
import personSearchForm from '@/components/shared/searcher/person-search-form';
import dateComponent from '@/components/shared/date-component';
import typePaymentForm from '@/shared/type-payment-form';

const { debounce } = helper;
const documentsParams = {
	limit: 100,
	customerId: null,
	moduleCode: `${ModuleCode.AccountsReceivable},${ModuleCode.Sale}`,
	page: 1,
	status: null,
	subsidiaryId: null,
	warehouseIds: [],
	endDate: null,
	startDate: null,
	currency: null,
};

function created() {
	const customerId = this.$route.params.customerId;
	if (customerId) {
		this.loadCustomers(customerId);
	}
	this.loadStates();
}

async function loadCustomers(customerId) {
	({ data: this.customer } = await this.$httpSales.get(`customers/${customerId}`));
	this.selectedCustomer = this.customer.typePerson
		? this.customer.typePerson.fullName
		: '';
	this.customerSelected = { ...this.customer };
	this.documentsParams.customerId = this.customerSelected.id;
	this.loadDocuments();
}

function actionCode(code, anotherCode) {
	return (
		this.slideData.code === code || (anotherCode && this.slideData.code === anotherCode)
	);
}

function addDocument(id) {
	const slideTitle = id ? 'EDITAR' : 'NUEVO';
	this.slideData.code = 'create-document';
	this.slideData.title = `${slideTitle} DOCUMENTO POR COBRAR`;
	this.slideData.width = 450;
	this.slideData.value = true;
	this.slideData.width = 553;
}

function addMovement(id) {
	const slideTitle = id ? 'EDITAR' : 'NUEVA';
	this.slideData.code = 'create-movement';
	this.slideData.title = `${slideTitle} TRANSACCIÓN DE COBRO`;
	this.slideData.width = 450;
	this.slideData.value = true;
	this.slideData.width = 553;
}

function allDocumentsSelected(value) {
	this.allDocumentsChecked = value;
	this.documents = this.documents.map((d) => {
		const newD = { ...d };
		if (!newD.disabled) {
			newD.isChecked = value;
		}
		return newD;
	});
	this.documents = this.propRowsChanged(this.documents, 'isChecked', value);
	this.documentsSelected = this.eventOnRows(this.documents, 'filter', {
		prop: 'isChecked',
		value: true,
	});
	this.amortization.number = this.roundInNumber(
		this.documentsSelected.reduce((a, ds) => a + this.roundInNumber(ds.debtAmount), 0)
	);
	this.amortization.number = Number.parseFloat(this.amortization.number).toFixed(2);
	this.totalQuotes();
}

function btnAddDocumentDisabled() {
	return !this.customerSelected.id;
}

function btnAddMovementDisabled() {
	return (
		!this.customerSelected.id ||
		!this.documentSelected.id ||
		this.documentSelected.debtAmount < 0
	);
}

function btnAddText() {
	return this.customerSelected.id
		? 'Crear un documento'
		: 'Es necesario seleccionar un cliente o registro';
}

function cancelDelete() {
	this.dialog = false;
	this.typeSelected = '';
	this[`${this.typeSelected}Selected`] = {};
}

function cleanCustomer() {
	this.customerSelected = { typePerson: {} };
	this.documentsParams = {
		...documentsParams,
	};
	this.selectedCustomer = '';
	this.allDocumentsChecked = false;
	this.documentSelected = {};
	this.documents = [];
	this.movements = [];
	this.lastDocumentsPage = 0;
	this.details = [
		{
			id: 1,
			field: 'module',
			label: 'Origen',
			value: null,
		},
		{
			id: 2,
			field: 'amount',
			label: 'Importe',
			value: null,
		},
		{
			id: 3,
			field: 'typeTransaction',
			label: 'Tipo',
			value: null,
		},
		{
			id: 4,
			field: 'receptionDate',
			label: 'F. Recep.',
			value: null,
		},
		{
			id: 5,
			field: 'emissionDate',
			label: 'Emisión',
			value: null,
		},
		{
			id: 6,
			field: 'expirationDate',
			label: 'Vence',
			value: null,
		},
		{
			id: 7,
			field: 'documentNumber',
			label: 'Doc.',
			value: null,
		},
		{
			id: 8,
			field: 'concept',
			label: 'Concep.',
			large: true,
			value: null,
		},
		{
			id: 9,
			field: 'reference',
			label: 'Ref.',
			value: null,
		},
		{
			id: 10,
			field: 'employee',
			label: 'Vend.',
			value: null,
		},
		{
			id: 11,
			field: 'currency',
			label: 'Moneda',
			value: null,
		},
	];
	this.documentDetails = [
		{
			id: 1,
			field: 'documentNumber',
			label: 'Doc',
			value: null,
		},
		{
			id: 2,
			field: 'emissionDate',
			label: 'Fecha',
			value: null,
		},
		{
			id: 3,
			field: 'reference',
			label: 'Referencia',
			value: null,
		},
		{
			id: 4,
			field: 'debtAmount',
			label: 'Saldo',
			value: null,
		},
	];
	this.documentsParams.subsidiaryId = null;
	this.clearMovement();
}

function closeSlide(isDocument, onSaved) {
	this.slideData.value = false;
	this.slideData.code = null;
	if (isDocument || this.actionCode('create-document')) {
		this.documentSelected = {};
	}
	this.forms = {
		newDocument: {
			amount: null,
			typeTransactionId: null,
		},
		newMovement: {
			additionalInformation: {},
			amount: null,
			bankAccountId: null,
			currency: (this.documentSelected && this.documentSelected.currency) || null,
			documents: [],
			documentNumberReference:
				(this.documentSelected && this.documentSelected.documentNumber) || null,
			moduleId: (this.documentSelected && this.documentSelected.moduleId) || null,
			typePaymentId: null,
			urlImage: null,
			totalToPay: 0,
		},
	};
	this.movementSelected = {};
	this.transaction = {
		bankAccountId: null,
		additionalInformation: {
			concept: '',
			documents: [],
			paymentDocumentNumber: '',
			paymentDate: '',
			reference: '',
		},
		documentNumber: '',
		flagForm: null,
		reference: '',
		urlImage: '',
	};
	this.amortization.typePaymentId = null;
	this.totalAmount = 0;
	this.amortization.typePaymentId = this.typePayments[0].id;
	this.typePaymentCode = this.typePayments[0].code;
	this.amortization.accountBankId = this.accounts[0].id;
	this.transaction.bankAccountId = this.amortization.accountBankId;
	this.transaction.flagForm = this.typePayments[0].flagForm;
	if (onSaved) {
		this.loadDocuments();
	}
}

async function deleteRegister() {
	this.loading = true;
	this.disabledBtnDelete = true;
	const url =
		this.typeSelected === 'movement'
			? 'collection-transaction'
			: 'document-account-status';
	const movementData = this.movementSelected.amortization || this.movementSelected;
	const idMovement = movementData.id;
	const idSelected =
		this.typeSelected === 'movement' ? idMovement : this.documentSelected.id;
	const message = this.typeSelected === 'movement' ? 'movimiento' : 'documento';
	const params = {
		salDocumentId: this.documentSelected.saleDocumentId || undefined,
		purDocumentId: this.documentSelected.purDocumentId || undefined,
	};
	try {
		await this.$httpSales.delete(`${url}/${idSelected}`, { params });
		this.showNotification(`El ${message} ha sido eliminado correctamente.`);
		this.loadDocuments();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'DOCUMENT_ACCOUNT_STATUS_ALREADY_RELATED') {
				this.showGenericError(err.data.messageError, 7000);
			}
		}
	} finally {
		this.cancelDelete();
		this.loading = false;
		this.disabledBtnDelete = false;
	}
}

function eventOnRows(registers, event, condition) {
	return condition.value
		? registers[event]((register) => register[condition.prop])
		: registers[event]((register) => !register[condition.prop]);
}

async function loadDocuments(page = 1, movementCreated) {
	this.documentsParams.page = page;
	const params = { ...this.documentsParams };
	if (params.warehouseIds.length) {
		params.warehouseIds = params.warehouseIds.join(',');
	}
	try {
		const { data: response, headers } = await this.$httpSales.get(
			'document-account-status',
			{ params }
		);
		const { subsidiary: subsidiaryUser } = this.$userInfo;
		const { configIntegrations } = subsidiaryUser;
		this.showStateEntity =
			configIntegrations &&
			((configIntegrations.accountingPlan &&
				configIntegrations.accountingPlan.flagConfig) ||
				(configIntegrations.accountingConfiguration &&
					configIntegrations.accountingConfiguration.flagConfig));
		this.documents = response.map((document) => {
			const newDocument = { ...document };
			const warehouse = this.warehouses.find((w) => w.id === document.warehouseId);
			newDocument.warName = warehouse ? warehouse.name : '-';
			newDocument.documentNumberType = `${document.typeTransaction.code} ${document.documentNumber}`;
			newDocument.isChecked = false;
			newDocument.isSelected = false;
			newDocument.disabled = document.debtAmount <= 0;
			const amortizationsQuotes = [
				{
					amount: this.roundInNumber(document.debtAmount + document.dueAmount),
					amountPayment: this.roundInNumber(document.dueAmount),
					// amountToPay: this.roundInNumber(document.debtAmount),
					amountToPay: Number.parseFloat(document.debtAmount).toFixed(2),
					amountToPayShow: this.roundInNumber(document.debtAmount),
					expirationDate: document.expirationDate
						? format(document.expirationDate, 'YYYY-MM-DD')
						: format(new Date(), 'YYYY-MM-DD'),
					id: document.id,
					menu: false,
					status: document.dueAmount ? 2 : 1,
					statusName: document.dueAmount ? 'Parcial' : 'Pendiente',
				},
			];
			newDocument.caDocument = {
				details: [...amortizationsQuotes],
			};
			return newDocument;
		});
		this.lastDocumentsPage = Number(headers['x-last-page']);
		if (movementCreated) {
			const { documentAccountStatusId } = movementCreated;
			const docClicked = this.documents.find((d) => d.id === documentAccountStatusId);
			this.onRowClicked(docClicked, null, movementCreated);
		} else {
			this.movements = [];
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function loadMovements(registers, saleDocumentId, purDocumentId) {
	this.movements = registers.map((movement) => {
		const newMovement = { ...movement };
		const additionalInfo = movement.additionalInformation;
		newMovement.type = movement.typePayment ? movement.typePayment.summaryCode : '';
		newMovement.typeTooltip = movement.typePayment ? movement.typePayment.name : '';
		newMovement.documentNumber =
			additionalInfo && additionalInfo.documentNumber
				? additionalInfo.documentNumber
				: '-';
		newMovement.paymentDate =
			additionalInfo && additionalInfo.paymentDate ? additionalInfo.paymentDate : '-';
		newMovement.moduleName = movement.module ? movement.module.code : 'CTAXCOB';
		newMovement.moduleTooltip = movement.module ? movement.module.name : '';
		newMovement.documents = movement.documents || [];
		newMovement.isSelected = false;
		newMovement.saleDocumentId = movement.saleDocumentId || saleDocumentId;
		newMovement.purDocumentId = movement.purDocumentId || purDocumentId;
		newMovement.typePaymentD = movement.typePayment
			? movement.typePayment.description
			: '';
		if (!newMovement.moduleTooltip) {
			newMovement.moduleTooltip = this.documentSelected.module
				? this.documentSelected.module.name
				: '';
		}
		if (movement.amortization) {
			// si tiene esta estructura posiblemente sea un item de AmortizationDocuments
			// amortizationDocuments[x].amortization.additionalInformation.paymentDate
			const addInfo =
				movement.amortization && movement.amortization.additionalInformation;
			newMovement.paymentDate =
				addInfo && addInfo.paymentDate ? addInfo.paymentDate : '-';
		}

		return newMovement;
	});
	this.movementsSearch = [...this.movements];
}

async function loadStates() {
	const params = {
		module: `${ModuleCode.AccountsReceivable},${ModuleCode.Sale}`,
	};
	const requests = [
		this.globalEmployees(),
		this.getCurrencies(),
		this.$httpSales.get('payment-states', { params }),
		this.$httpSales.get('subsidiaries'),
		this.$httpSales.get('bank-account'),
		this.getTypePayments('sales'),
		this.$httpSales.get(`cash/${this.$userInfo.cashId}`),
		this.$httpSales.get(`catalog-sunat-details-list/${TableCode.IvaRate}`),
		this.warehousesList(),
		this.getTypeDocuments('sales'),
	];
	try {
		const responses = await Promise.all(requests);
		[
			{ data: this.employees },
			{ data: this.currencies },
			{ data: this.states },
			{ data: this.subsidiaries },
			{ data: this.accounts },
			{ data: this.typePayments },
			{ data: this.cashUser },
			{ data: this.typeTaxes },
			{ data: this.warehouses },
			{ data: this.typeDocuments },
		] = responses;
		const newAccounts = [{ id: 0, accountNumber: 'NINGUNA' }].concat(this.accounts);
		this.typePayments = this.typePayments.map((tp) => tp.paymentType);
		this.accounts = [...newAccounts];
		this.amortization.typePaymentId = this.typePayments[0].id;
		this.typePaymentCode = this.typePayments[0].code;
		this.amortization.accountBankId = this.accounts[0].id;
		this.transaction.bankAccountId = this.amortization.accountBankId;
		this.transaction.flagForm = this.typePayments[0].flagForm;
		this.amortization.cashId = this.$userInfo.cashId;
		this.setTypeTaxes();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function onClickIcon(code) {
	if (code === 'retention') {
		const { currency, documentNumber, id, paymentDate, typeTransaction } =
			this.documentSelected;
		const { typePerson } = this.customerSelected;
		let slideTitle = '';
		if (typeTransaction && typePerson) {
			slideTitle = `${typeTransaction.code} ${documentNumber} ${typePerson.fullName}`;
		} else if (typeTransaction) {
			slideTitle = `${typeTransaction.code} ${documentNumber}`;
		} else if (typePerson) {
			slideTitle = `${documentNumber} ${typePerson.fullName}`;
		} else {
			slideTitle = documentNumber;
		}
		this.retentionModel.additionalInformation.documentNumber = typeTransaction
			? `${typeTransaction.code} ${documentNumber}`
			: documentNumber;
		this.retentionModel.additionalInformation.paymentDate =
			paymentDate || format(new Date(), 'YYYY-MM-DD');
		this.retentionModel.additionalInformation.paymentDocumentNumber = documentNumber;
		this.retentionModel.additionalInformation.reference = 'retención de venta desde cxc';
		this.retentionModel.currency = currency;
		this.retentionModel.documentAccountStatusId = id;
		this.loadSale(slideTitle);
	} else {
		this.addMovement();
	}
}

function onDocumentSelected(document, movementCreated) {
	this.documents = this.documents.map((doc) => {
		const newDoc = { ...doc };
		if (doc.id === document.id && !doc.disabled) {
			newDoc.isChecked = !document.isChecked;
		}
		return newDoc;
	});
	this.allDocumentsChecked = this.eventOnRows(this.documents, 'every', {
		prop: 'isChecked',
		value: true,
	});
	this.documentsSelected = this.eventOnRows(this.documents, 'filter', {
		prop: 'isChecked',
		value: true,
	});
	this.amortization.number = this.roundInNumber(
		this.documentsSelected.reduce(
			(a, ds) =>
				a +
				this.roundInNumber(
					ds.caDocument.details.reduce((ac, d) => ac + d.amountToPay, 0)
				),
			0
		)
	);
	this.amortization.number = Number.parseFloat(this.amortization.number).toFixed(2);
	this.totalQuotes();
	if (movementCreated) {
		this.onRowClicked(movementCreated, 'movement');
	}
}

function onEditDocument(value) {
	this.forms.newDocument = { ...value };
	this.forms.newDocument.amount = Number.parseFloat(value.amount).toFixed(2);
	this.addDocument(value.id);
}

function onEditMovement(value) {
	const newValue = { ...value };
	newValue.reference = value.additionalInformation
		? value.additionalInformation.reference
		: '';
	newValue.paymentDate = value.additionalInformation
		? value.additionalInformation.paymentDate
		: '';
	newValue.documentNumber = value.additionalInformation
		? value.additionalInformation.paymentDocumentNumber
		: '';
	newValue.documentNumberReference = value.documents.length > 0 ? value.documents[0] : '';
	newValue.observation = value.observations || '';
	newValue.documents = value.documents || [];
	this.forms.newMovement = { ...newValue };
	this.addMovement(value.id);
}

function onRowClicked(value, type, movementCreated) {
	this.clearMovement();
	const rowsChanged = type ? 'movements' : 'documents';
	const rowSelected = type || 'document';
	if (!value.isSelected) {
		this[rowsChanged] = this.propRowsChanged(
			this[rowsChanged],
			'isSelected',
			value.id,
			'id'
		);
	}
	const rowChangeSelected = this[rowsChanged].find((rc) => rc.id === value.id) || {};
	const newValue = rowChangeSelected.isSelected ? { ...value } : {};
	this[`${rowSelected}Selected`] = { ...newValue };
	if (!type) {
		this.details = this.setDocumentDetails(this.details);
		this.documentDetails = this.setDocumentDetails(this.documentDetails);
		this.documentSelected = { ...value };
		if (this.documentSelected.id) {
			this.forms.newMovement.documentNumberReference =
				this.documentSelected.documentNumber;
			this.forms.newMovement.currency = this.documentSelected.currency;
			this.forms.newMovement.moduleId = this.documentSelected.moduleId;
			this.forms.newMovement.totalToPay = Number.parseFloat(
				this.documentSelected.debtAmount
			).toFixed(2);
			if (this.documentSelected.amortizations) {
				if (this.documentSelected.amortizations.length === 0) {
					this.loadMessage =
						'No se encontraron transacciones en el documento seleccionado.';
				}
				if (this.searchMovement) {
					this.searchMovementEvent(this.searchMovement);
				} else {
					const mix = this.documentSelected.amortizations.concat(
						this.documentSelected.amortizationDocuments
					);
					this.loadMovements(
						mix,
						this.documentSelected.saleDocumentId,
						this.documentSelected.purDocumentId
					);
				}
			} else {
				this.loadMessage =
					'No se encontraron transacciones en el documento seleccionado.';
			}
		} else {
			this.movements = [];
			this.loadMessage = 'Es necesario seleccionar un documento para ver los registros.';
		}
		const { saleDocumentId } = this.documentSelected || {};
		this.btnRetentionDisabled = !saleDocumentId;
	} else {
		this.movementSelected.createdFormatted = format(
			new Date(this.movementSelected.createdAt),
			'DD-MM-YYYY HH:mm:ss'
		);
		this.detailsMovement = this.setDocumentMovement(this.movementSelected);
	}
	if (type) {
		this.onDocumentSelected(value, movementCreated);
	}
	const { subsidiary: subsidiaryUser } = this.$userInfo;
	const { configIntegrations } = subsidiaryUser;
	this.showStateEntity =
		configIntegrations &&
		((configIntegrations.accountingPlan &&
			configIntegrations.accountingPlan.flagConfig) ||
			(configIntegrations.accountingConfiguration &&
				configIntegrations.accountingConfiguration.flagConfig));
}

function onSetData({ model, newValue, value }, module) {
	let newModule = null;
	newModule = module ? 'newMovement' : 'newDocument';
	if (model === 'moduleId') {
		this.$set(this.forms[newModule], model, value.id);
		this.$set(this.forms[newModule], 'moduleCode', value.code);
	} else if (model === 'typeDocument') {
		this.$set(this.forms[newModule], model, value.documentType.id);
	} else if (model === 'serie' || model === 'number') {
		if (!isNaN(Number(value))) {
			const valueValid = newValue || value;
			this.$set(this.forms[newModule], model, valueValid);
		}
	} else {
		const valueValid = newValue || value;
		const finalValue =
			model === 'typeTransactionId' ||
			model === 'employeeId' ||
			model === 'typePaymentId' ||
			model === 'currency'
				? value.id
				: valueValid;
		this.$set(this.forms[newModule], model, finalValue);
	}
}

function onSetDataAmount({ model, newValue, value }, module) {
	const valueValid = newValue || value;
	const newModule = module ? 'newMovement' : 'newDocument';
	this.forms[newModule][model] = Number.parseFloat(valueValid).toFixed(2);
}

function onSetDate({ model, valueDate }, module) {
	const newModule = module ? 'newMovement' : 'newDocument';
	this.forms[newModule][model] = format(valueDate, 'YYYY-MM-DD');
}

function setDate({ model, value }) {
	this.documentsParams[model] = format(value, 'YYYY-MM-DD');
	if (
		this.documentsParams.startDate &&
		this.documentsParams.endDate &&
		this.documentsParams.customerId
	) {
		this.loadDocuments();
	}
}
function openDeleteConfirmation(value, type) {
	const documentMessage = value.documentNumber
		? `el documento #${value.documentNumber}`
		: 'el documento';
	const movementMessage = value.type
		? `el movimiento de tipo ${value.type}`
		: 'el movimiento';
	this.dialogMessage = type === 'movement' ? movementMessage : documentMessage;
	this.typeSelected = type;
	this[`${this.typeSelected}Selected`] = { ...value };
	this.dialog = true;
}

function propRowsChanged(registers, prop, value, condition) {
	return registers.map((register) => {
		const newRegister = { ...register };
		if (!register.disabled || prop === 'isSelected') {
			newRegister[prop] = condition
				? register[condition] === value && !register[prop]
				: value;
		}
		return newRegister;
	});
}

async function saveDocument() {
	this.loading = true;
	const method = this.forms.newDocument.id ? 'patch' : 'post';
	const url = this.forms.newDocument.id
		? `document-account-status/${this.forms.newDocument.id}`
		: 'document-account-status';
	const message = this.forms.newDocument.id ? 'editado' : 'creado';
	const body = {
		amount: Number(this.forms.newDocument.amount),
		concept: this.forms.newDocument.concept,
		currency: this.forms.newDocument.currency || this.$userInfo.company.currency,
		documentNumber: this.forms.newDocument.documentNumber,
		emissionDate: this.forms.newDocument.emissionDate,
		employeeId: this.forms.newDocument.employeeId,
		expirationDate: this.forms.newDocument.expirationDate,
		receptionDate: this.forms.newDocument.receptionDate,
		reference: this.forms.newDocument.reference,
		typeTransactionId: this.forms.newDocument.typeTransactionId,
	};
	if (!this.forms.newDocument.id) {
		body.customerId = this.documentsParams.customerId;
	}
	try {
		await this.$httpSales[method](url, body);
		this.showNotification(`El documento ha sido ${message} correctamente.`);
		this.closeSlide(true);
		this.loadDocuments();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'BENEFICIARY_NOT_EXIST') {
				this.showGenericError('El cliente no existe');
			}
		}
	} finally {
		this.loading = false;
	}
}

async function saveMovement() {
	const {
		bankAccountId,
		id,
		typePaymentId,
		additionalInformation,
		documentNumber,
		paymentDate,
		moduleCode,
		salDocumentId,
		cashId,
		currency,
		documentReference,
		observations,
		urlImage,
		reference,
		amount,
	} = this.forms.newMovement;
	this.loading = true;
	const documentNumberType =
		(this.documentSelected && this.documentSelected.documentNumberType) || '';
	const documents = documentNumberType
		? [documentNumberType.replace(' ', '')]
		: undefined;
	const method = id ? 'patch' : 'post';
	const url = id ? `collection-transaction/${id}` : 'collection-transaction';
	const message = id ? 'editada' : 'creada';
	const typePayment = this.typePayments.find((tp) => tp.id === typePaymentId);

	const body = {
		additionalInformation: {
			dateReference: additionalInformation && additionalInformation.dateReference,
			documentNumber,
			paymentDocumentNumber: documentNumber,
			paymentDate,
			documents,
			reference: reference || undefined,
		},
		salDocumentId,
		amount: Number(amount),
		bankAccountId:
			typePayment.flagForm === typePaymentForm.Deposit
				? (bankAccountId && bankAccountId.id) || bankAccountId
				: undefined,
		cashId,
		currency: currency || this.$userInfo.company.currency,
		documentReference,
		observations,
		typePaymentId,
		urlImage,
	};
	if (!id) {
		body.documentAccountStatusId = this.documentSelected.id;
		body.moduleCode = moduleCode;
	}
	try {
		await this.$httpSales[method](url, body);
		this.showNotification(`La transacción ha sido ${message} correctamente.`);
		this.closeSlide(true);
		this.loadDocuments();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'BENEFICIARY_NOT_EXIST') {
				this.showGenericError('El cliente no existe');
			} else if (err.data.message === 'HEADER_AMOUNT_EXCEEDED') {
				this.showGenericError(
					'La sumatoria de montos de los movimientos excede al monto total del documento relacionado.'
				);
			} else if (err.data.message === 'CASH_CLOSING_USER_EXIST') {
				this.showGenericError(
					'La caja aperturada se encuentra en otro usuario, asegurese que la caja se encuentre cerrada para realizar el cobro.'
				);
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function searchMovementEvent() {
	if (this.searchMovement) {
		if (this.movementsSearch) {
			const transactions = this.movementsSearch.filter(
				(transaction) =>
					transaction.type.toLowerCase().indexOf(this.searchMovement.toLowerCase()) >
						-1 ||
					transaction.moduleTooltip
						.toLowerCase()
						.indexOf(this.searchMovement.toLowerCase()) > -1
			);
			if (transactions.length > 0) {
				this.clearMovement();
				this.loadMovements(transactions);
			} else {
				this.movements = [];
				this.showNotification('No se encontraron coincidencias con la búsqueda', 'info');
			}
		} else {
			this.showNotification('No se encontraron transacciones', 'info');
		}
	} else {
		this.movements = [...this.movementsSearch];
	}
}

function setSearch(value) {
	this.search = value && value.trim() ? value.trim() : null;
	this.documentsParams.search = this.search;
}

function setSearchMovement(value) {
	this.searchMovement = value && value.trim() ? value.trim() : null;
}

function setCustomer(customer) {
	if (customer) {
		this.closeSlide();
		this.cleanInput = true;
		this.selectedCustomer = customer.fullName;
		this.customerSelected = { ...customer };
		this.documentsParams.customerId = this.customerSelected.id;
		this.loadDocuments();
		this.details = [
			{
				id: 1,
				field: 'module',
				label: 'Origen',
				value: null,
			},
			{
				id: 2,
				field: 'amount',
				label: 'Importe',
				value: null,
			},
			{
				id: 3,
				field: 'typeTransaction',
				label: 'Tipo',
				value: null,
			},
			{
				id: 4,
				field: 'receptionDate',
				label: 'F. Recep.',
				value: null,
			},
			{
				id: 5,
				field: 'emissionDate',
				label: 'Emisión',
				value: null,
			},
			{
				id: 6,
				field: 'expirationDate',
				label: 'Vence',
				value: null,
			},
			{
				id: 7,
				field: 'documentNumber',
				label: 'Doc.',
				value: null,
			},
			{
				id: 8,
				field: 'concept',
				label: 'Concep.',
				large: true,
				value: null,
			},
			{
				id: 9,
				field: 'reference',
				label: 'Ref.',
				value: null,
			},
			{
				id: 10,
				field: 'employee',
				label: 'Vend.',
				value: null,
			},
			{
				id: 11,
				field: 'currency',
				label: 'Moneda',
				value: null,
			},
		];
	}
}

function setDocumentDetails(registers) {
	return registers.map((detail) => {
		const newDetail = { ...detail };
		if (this.documentSelected[detail.field]) {
			if (detail.field === 'employee') {
				newDetail.value = this.documentSelected[detail.field].fullname;
			} else {
				newDetail.value =
					detail.field === 'module' || detail.field === 'typeTransaction'
						? this.documentSelected[detail.field].name
						: this.documentSelected[detail.field];
			}
		} else {
			newDetail.value = null;
		}
		return newDetail;
	});
}

function setStatus({ model, value }) {
	this.documentsParams[model] = value;
	if (this.documentsParams.customerId) {
		this.loadDocuments();
	}
}

function totalDebtsAmount() {
	if (this.documents.length > 0) {
		const reduceAmount = this.documents.reduce((a, d) => a + d.debtAmount, 0);
		// const reduceAmount = this.documents.reduce((a, d) => {
		// 	if (d.debtAmount !== d.dueAmount) {
		// 		return a + d.debtAmount;
		// 	}
		// 	return a;
		// }, 0);
		return `${this.documents[0].currency}${reduceAmount.toFixed(2)}`;
	}
	return 0;
}

function validations() {
	return {
		forms: {
			newDocument: {
				amount: { required },
				typeTransactionId: { required },
			},
			newMovement: {
				amount: { required },
			},
		},
	};
}

function showErrorMessage(quoteData, dataId, saleIdx, quoteIdx, val) {
	const newQuoteData = { ...quoteData };
	newQuoteData.amountToPay = Number.parseFloat(val).toFixed(2);
	this.documentsSelected[saleIdx].caDocument.details[quoteIdx] = {
		...newQuoteData,
	};
	const { id, amountToPay, amount } = newQuoteData;
	if (amountToPay > amount) {
		this.showNotification('El monto a pagar no debe superar el de la cuota', 'error');
	}
	if (amountToPay < 0) {
		this.showNotification('El monto a pagar debe ser un valor positivo', 'error');
	}
	this.amortization.number = this.roundInNumber(
		this.documentsSelected.reduce(
			(a, ds) =>
				a +
				this.roundInNumber(
					ds.caDocument.details.reduce((ac, d) => {
						if (d.amountToPay !== 'NaN') {
							return ac + d.amountToPay;
						}
						return ac;
					}, 0)
				),
			0
		)
	);
	this.getQuoteData(amountToPay, id, dataId.id);
	this.quoteError = !amountToPay || amountToPay < 0 || amountToPay > amount;
}

function openMultiPaysSlide() {
	if (this.cashUser.flagActive) {
		this.transaction.additionalInformation.documents = this.documentsSelected.map(
			(ds) => {
				if (ds.typeTransaction) {
					return `${ds.typeTransaction.code}${ds.documentNumber}`;
				}
				return ds.documentNumber;
			}
		);
		this.transaction.additionalInformation.reference =
			'Cobro múltiple desde movimientos cxc.';
		this.transaction.additionalInformation.concept =
			'Cobro múltiple desde movimientos cxc.';
		this.transaction.additionalInformation.paymentDate = format(new Date(), 'YYYY-MM-DD');
		this.slideData = {
			code: 'multipays',
			title: 'COBRO MÚLTIPLE',
			value: true,
			width: 635,
		};
	} else {
		this.showNotification(
			'Es necesario activar su caja para poder registrar los cobros.',
			'info'
		);
	}
}

function disabledCollect() {
	return (
		this.quoteError ||
		this.validTotal ||
		!this.totalAmount ||
		(this.isDifferentCash &&
			(this.transaction.flagForm === 3 || this.transaction.flagForm === 4) &&
			!this.transaction.bankAccountId)
	);
}

function isDifferentCash() {
	return this.typePaymentCode !== 'efectivo';
}

function totalToPay() {
	return this.roundInNumber(
		this.documentsSelected.reduce(
			(accum, ds) => accum + this.roundInNumber(ds.amount - ds.dueAmount),
			0
		)
	);
}

function getData({ model, value }) {
	this.amortization[model] = model !== 'number' ? value.id : value;
	if (model === 'typePaymentId') {
		this.typePaymentCode = value.code;
		this.transaction.flagForm = value.flagForm;
		this.transaction.bankAccountId = null;
	}
	if (model === 'number') {
		this.setPayments(value);
	}
	if (model === 'cashId') {
		this.amortization[model] = value.id;
		this.cashUser = value;
	}
}

function getDataNumber({ model, value }) {
	if (this.roundInNumber(value) < this.totalToPay) {
		this.amortization[model] = Number.parseFloat(value).toFixed(2);
		this.setPayments(value);
	} else {
		this.amortization[model] = Number.parseFloat(this.totalToPay).toFixed(2);
	}
}

function getTransactionData({ model, newValue }) {
	if (model === 'dateReference' || model === 'reference' || model === 'documentNumber') {
		const modelV = model === 'documentNumber' ? 'paymentDocumentNumber' : model;
		this.$set(this.transaction.additionalInformation, modelV, newValue);
	} else {
		this.$set(this.transaction, model, newValue);
	}
}

async function save() {
	if (this.savingMultiPay) {
		return;
	}

	this.savingMultiPay = true;

	try {
		const body = {
			amount: this.totalAmount,
			bankAccountId:
				this.transaction.bankAccountId === 0 ? undefined : this.transaction.bankAccountId,
			observations: this.transaction.reference,
			typePaymentId: this.amortization.typePaymentId,
			urlImage: this.transaction.urlImage,
			additionalInformation: this.transaction.additionalInformation,
			cashId: this.cashUser.id,
			currency: this.$userInfo.company.currency,
			customerId: this.customerSelected.id,
			documentsAccountStatus: this.documentsSelected.map((ds) => ({
				id: ds.id,
				amount: ds.caDocument.details.reduce(
					(a, d) => a + this.roundInNumber(d.amountToPay),
					0
				),
			})),
			moduleCode: ModuleCode.AccountsReceivable,
			supplierId: null,
			warehouseId: null,
		};
		if (this.documentsParams.subsidiaryId || this.documentsSelected[0].subsidiaryId) {
			body.subsidiaryId =
				Number(this.documentsParams.subsidiaryId) ||
				Number(this.documentsSelected[0].subsidiaryId);
		}
		body.additionalInformation.documentNumber =
			this.transaction.additionalInformation.paymentDocumentNumber;
		const documentsToPay = { ...body };
		documentsToPay.documentsAccountStatus = body.documentsAccountStatus.filter(
			(d) => d.amount
		);
		const url = 'collection-transaction/multiple';
		if (documentsToPay.documentsAccountStatus.length > 0) {
			try {
				await this.$httpSales.post(url, documentsToPay);
				this.closeSlide(false, true);
				this.setCustomer(this.customerSelected);
				this.showNotification('Amortización realizada correctamente');
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
					} else if (err.data.message === 'DOCUMENT_ACCOUNT_STATUS') {
						this.showGenericError('Los documentos ya están pagados');
					} else if (err.data.message === 'DOCUMENT_ACCOUNT_STATUS') {
						this.showGenericError(err.data.messageError);
					}
				}
			}
		} else {
			this.showNotification('No hay amortizaciones por realizar.', 'info');
		}
	} finally {
		this.savingMultiPay = false;
	}
}

function getQuoteData(value, id, dataId) {
	this.documentsSelected = this.documentsSelected.map((ds) => {
		const newDs = { ...ds };
		if (ds.id === dataId && ds.caDocument.details.length > 0) {
			newDs.caDocument.details = ds.caDocument.details.map((detail) => {
				const newDetail = { ...detail };
				if (detail.id === id) {
					newDetail.amountToPay = value;
				}
				return newDetail;
			});
			return newDs;
		}
		return newDs;
	});
	this.totalQuotes();
}

function totalQuotes() {
	this.totalAmount = this.documentsSelected.reduce(
		(accum, ds) =>
			accum +
			ds.caDocument.details.reduce(
				(accumD, detail) => accumD + this.roundInNumber(detail.amountToPay),
				0
			),
		0
	);
}

function validTotal() {
	if (this.amortization.number) {
		const valid = Number(this.totalAmount).toFixed(2) > Number(this.amortization.number);
		if (valid) {
			this.showGenericError('La suma de las cuotas a pagar no debe ser mayor al total.');
		}
		return valid;
	}
	return null;
}

function setDocumentMovement(row) {
	return this.detailsMovement.map((d) => {
		const newD = { ...d };
		if (d.id === 6) {
			newD.value =
				(row.amortization && row.amortization.module && row.amortization.module.name) ||
				(row.module && row.module.name) ||
				'-';
		} else if (d.id === 7) {
			const employee =
				row.employee || this.employees.find((e) => e.id === row.employeeId) || {};
			newD.value = employee.fullName || employee.name || '-';
		} else if (d.id === 4) {
			newD.value = row[d.field] || row.amortization[d.field] || '-';
		} else if (d.id === 2) {
			const documents =
				row.amortization && row.amortization.additionalInformation
					? row.amortization &&
					  row.amortization.additionalInformation &&
					  row.amortization.additionalInformation[d.field]
					: row[d.field];

			if (Array.isArray(documents) && documents.length) {
				newD.tooltip = documents.join(', ');

				if (documents.length > 2) {
					newD.value = `${documents.slice(0, 2).join(', ')}....`;
				} else {
					newD.value = documents.join(', ');
				}
			} else {
				newD.tooltip = '-';
				newD.value = '-';
			}
		} else {
			newD.value = row[d.field] || null;
		}
		return newD;
	});
}

function clearMovement() {
	this.detailsMovement = this.detailsMovement.map((d) => {
		const newD = { ...d };
		newD.value = null;
		return newD;
	});
}

// Retención

async function saveRetention(body) {
	const newBody = { ...body };
	newBody.details = body.details.map((det) => {
		const newDet = { ...det };
		if (det.nameTax !== 'IVA') {
			newDet.baseTax = Number(det.baseTax);
		} else {
			delete newDet.baseTax;
		}
		return newDet;
	});
	this.retentionModel.amount = newBody.details.reduce(
		(a, d) => Number(a) + Number(d.amountTax),
		0
	);
	const bodyData = {
		...this.retentionModel,
		withholdingTax: newBody,
	};
	try {
		await this.$httpSales.post('collection-transaction', bodyData);
		this.showNotification('La retención de venta se ha creado correctamente.');
		this.slideData.value = false;
		this.slideData.code = null;
		this.slideData.title = '';
		this.slideData.width = 450;
		this.retentionModel.amount = 0;
		this.customerSelected.codeTaxesGoods = null;
		this.customerSelected.codeTaxes = null;
		const docId = this.documentSelected.id;
		this.documentSelected = {};
		this.loadDocuments(this.documentsParams.page, {
			documentAccountStatusId: docId,
		});
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function getRetentionAmount(ret) {
	this.retentionAmount = ret;
}

function getRetentionIvaAmount(ret) {
	this.retentionTaxAmount = ret;
}

function setTypeTaxes() {
	this.typeTaxes = this.typeTaxes.map((type) => {
		const newType = {
			id: type.id,
			code: type.code,
			description: type.description,
			percentage: type.percentage,
			value: 0,
		};
		return newType;
	});
}

async function loadSale(slideTitle) {
	this.loadingPage = true;
	try {
		({ data: this.sale } = await this.$httpSales.get(
			`sale-documents/${this.documentSelected.saleDocumentId}`
		));
		this.slideData.code = 'withholding-taxes';
		this.slideData.title = `RET. DE LA ${slideTitle}`;
		this.slideData.width = 902;
		this.slideData.value = true;
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loadingPage = false;
	}
}

function setPayments(total) {
	let newTotal = total;
	this.documentsSelected.forEach((doc) => {
		const resultPerQuote = doc.caDocument.details.reduce((acumQ, quote) => {
			const newQuote = quote;
			if (quote.status === 3) {
				return acumQ;
			}
			const op = acumQ - (newQuote.amount - newQuote.amountPayment);
			if (op >= 0) {
				newQuote.amountToPay = this.roundInNumber(
					newQuote.amount - newQuote.amountPayment
				);
				newQuote.amountToPay = Number.parseFloat(newQuote.amountToPay).toFixed(2);
				return op;
			}
			newQuote.amountToPay = acumQ === 0 ? 0 : this.roundInNumber(acumQ);
			newQuote.amountToPay = Number.parseFloat(newQuote.amountToPay).toFixed(2);
			return 0;
		}, newTotal);
		newTotal = resultPerQuote;
	});
	this.totalQuotes();
}

function openSearch(value) {
	this.cleanInput = false;
	this.searchVal = value ? value.trim() : '';
	this.slideData.code = 'customer-searcher';
	this.slideData.title = 'Clientes';
	this.slideData.width = 739;
	this.slideData.value = true;
	// this.details = [];
}

async function validSale(movement, cashs) {
	const body = {
		comSubsidiaryId: this.documentSelected.subsidiaryId,
		typeSearch: 1,
		paymentMethodId: 1,
		customerId: this.documentSelected.customerId,
		serie: movement.serie || undefined,
		number: movement.number || undefined,
		salTypeDocumentId: movement.typeDocument || undefined,
	};
	try {
		const response = await this.$httpSales.post('sale-documents/type-search', body);
		const { documentNumber, createdAtSri, currencyName, amount, cashId, id } =
			response.data;
		const findCash = cashs.find((cash) => cash.id === cashId);
		this.forms.newMovement = {
			...this.forms.newMovement,
			amount,
			cashName: findCash.name,
			documentNumber,
			currencyName,
			documentNumberReference: documentNumber,
			currency: currencyName,
			paymentDate: createdAtSri,
			salDocumentId: id,
		};
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'SALE_NOT_FOUND') {
				this.showNotification(
					'No existe una documento relacionado con el cliente relacionado.',
					'info',
					7000
				);
			}
		} else if (error.status === 500) {
			this.showGenericError();
		}
	}
}

function data() {
	return {
		accounts: [],
		accountsReceivableCode: ModuleCode.AccountsReceivable,
		allDocumentsChecked: false,
		amortization: {
			number: 0,
			amount: 0,
			typePaymentId: 0,
		},
		btnRetentionDisabled: true,
		cashUser: {},
		currencies: [],
		customer: {},
		customers: [],
		customerSelected: {
			typePerson: {},
		},
		details: [
			{
				id: 1,
				field: 'module',
				label: 'Origen',
				value: null,
			},
			{
				id: 2,
				field: 'amount',
				label: 'Importe',
				value: null,
			},
			{
				id: 3,
				field: 'typeTransaction',
				label: 'Tipo',
				value: null,
			},
			{
				id: 4,
				field: 'receptionDate',
				label: 'F. Recep.',
				value: null,
			},
			{
				id: 5,
				field: 'emissionDate',
				label: 'Emisión',
				value: null,
			},
			{
				id: 6,
				field: 'expirationDate',
				label: 'Vence',
				value: null,
			},
			{
				id: 7,
				field: 'documentNumber',
				label: 'Doc.',
				value: null,
			},
			{
				id: 8,
				field: 'concept',
				label: 'Concep.',
				large: true,
				value: null,
			},
			{
				id: 9,
				field: 'reference',
				label: 'Ref.',
				value: null,
			},
			{
				id: 10,
				field: 'employee',
				label: 'Vend.',
				value: null,
			},
			{
				id: 11,
				field: 'currency',
				label: 'Moneda',
				value: null,
			},
		],
		dialog: false,
		dialogMessage: '',
		disabledBtnDelete: false,
		documentDetails: [
			{
				id: 1,
				field: 'documentNumber',
				label: 'Doc',
				value: null,
			},
			{
				id: 2,
				field: 'emissionDate',
				label: 'Fecha',
				value: null,
			},
			{
				id: 3,
				field: 'reference',
				label: 'Referencia',
				value: null,
			},
			{
				id: 4,
				field: 'debtAmount',
				label: 'Saldo',
				value: null,
			},
		],
		documents: [],
		documentSelected: {},
		documentsParams: {
			...documentsParams,
		},
		documentsSelected: [],
		employees: [],
		forms: {
			newDocument: {
				amount: null,
				typeTransactionId: null,
			},
			newMovement: {
				additionalInformation: {},
				amount: null,
				bankAccountId: null,
				cashId: null,
				currency: null,
				documents: [],
				documentNumberReference: null,
				totalToPay: null,
				typeDocument: null,
			},
		},
		lastDocumentsPage: 0,
		loading: false,
		loadMessage: 'Es necesario seleccionar un documento para ver los registros.',
		savingMultiPay: false,
		movements: [],
		movementSelected: {},
		quoteError: false,
		search: null,
		searchMovement: null,
		slideData: {
			code: null,
			title: '',
			value: false,
			width: 553,
		},
		states: [],
		subsidiaries: [],
		totalAmount: 0,
		transaction: {
			bankAccountId: null,
			additionalInformation: {
				concept: '',
				documents: [],
				paymentDocumentNumber: '',
				paymentDate: '',
				reference: '',
			},
			documentNumber: '',
			flagForm: null,
			reference: '',
			urlImage: '',
		},
		typePaymentCode: '',
		typePayments: [],
		typeSelected: '',
		detailsMovement: [
			{ id: 1, field: 'typePaymentD', label: 'T.Pago', value: null },
			{ id: 2, field: 'documents', label: 'Nro Doc.', tooltip: null, value: null },
			{ id: 3, field: 'createdFormatted', label: 'Fecha', value: null },
			{ id: 4, field: 'typeAmortizationName', label: 'T. Trans', value: null },
			{ id: 5, field: 'amount', label: 'Importe', value: null },
			{ id: 6, field: 'moduleTooltip', label: 'Origen', value: null },
			{ id: 7, field: 'employeeName', label: 'Empleado', value: null },
			// {
			// 	id: 7,
			// 	field: 'transactionDocNum',
			// 	label: 'Doc. Rela',
			// 	value: null,
			// },
		],
		movementsSearch: [],
		// retention data
		documentDetailsRetention: [],
		flagIncludesTaxes: false,
		loadingPage: false,
		retentionAmount: 0,
		retentionData: {},
		retentionExist: false,
		retentionLoading: false,
		retentionModel: {
			additionalInformation: {
				documentNumber: '',
				paymentDate: null,
				paymentDocumentNumber: '',
				reference: '',
			},
			amount: 0,
			bankAccountId: null,
			cashId: null,
			currency: null,
			documentAccountStatusId: null,
			observations: '',
			typePaymentId: null,
			urlImage: '',
		},
		retentionTaxAmount: 0,
		sale: {},
		selectedSupplier: {},
		typeTaxes: [],
		cleanInput: false,
		selectedCustomer: '',
		searchVal: null,
		showStateEntity: false,
		warehouses: [],
		typeDocuments: [],
	};
}
function goToSaleDetail(document) {
    const routeData = this.$router.resolve({
        name: 'convert',
        params: { id: document.saleDocumentId },
    });
    window.open(routeData.href, '_blank');
}

export default {
	name: 'page-accounts-receivable',
	components: {
		actionSidebar,
		amortizationsComponent,
		documentForm,
		documentsList,
		headerDetail,
		headerPage,
		headingList,
		movementForm,
		movementsList,
		registerDetail,
		retentionsForm,
		searchingByEntity,
		personSearchInput,
		personSearchForm,
		dateComponent,
	},
	computed: {
		btnAddDocumentDisabled,
		btnAddMovementDisabled,
		btnAddText,
		disabledCollect,
		isDifferentCash,
		totalDebtsAmount,
		totalToPay,
		validTotal,
	},
	created,
	data,
	methods: {
		goToSaleDetail,
		actionCode,
		addDocument,
		addMovement,
		allDocumentsSelected,
		cancelDelete,
		cleanCustomer,
		clearMovement,
		closeSlide,
		deleteRegister,
		eventOnRows,
		getData,
		getQuoteData,
		getRetentionAmount,
		getRetentionIvaAmount,
		getTransactionData,
		loadCustomers,
		loadDocuments,
		loadMovements,
		loadSale,
		loadStates,
		onClickIcon,
		onDocumentSelected,
		onEditDocument,
		onEditMovement,
		onRowClicked,
		onSetData,
		onSetDate,
		openMultiPaysSlide,
		openDeleteConfirmation,
		propRowsChanged,
		save,
		saveDocument,
		saveMovement,
		saveRetention,
		searchMovementEvent,
		setCustomer,
		setDocumentDetails,
		setDocumentMovement,
		setSearch,
		setSearchMovement,
		setStatus,
		setTypeTaxes,
		showErrorMessage: debounce(showErrorMessage),
		totalQuotes,
		onSetDataAmount: debounce(onSetDataAmount),
		setPayments,
		getDataNumber: debounce(getDataNumber),
		openSearch,
		validSale,
		setDate,
		async onPrintMovement(row) {
			try {
				const url = 'document-account-status/report';
				const params = {
					code: 'amortization-document-html',
					amortizationId: row.amortization ? row.amortization.id : row.id,
					salDocumentId: row.saleDocumentId || this.movementSelected.saleDocumentId,
					purDocumentId: row.purDocsumentId || this.movementSelected.purDocumentId,
					html: true,
				};
				if (params.purDocumentId === null) {
					delete params.purDocumentId;
				}
				const responseType = 'blob';
				const contentType = 'text/html';
				const response = await this.$httpSales.post(url, params, {
					responseType,
				});
				const blob = helper.generateBlob(response.data, contentType);
				helper.showDownloadDialog(blob, 'Reporte', 'pdf');
				this.showNotification('Se generó el reporte correctamente');
			} catch (error) {
				console.log(error);
				this.showGenericError();
			}
		},
	},
	validations,
};
</script>

<style lang="scss" scoped>
.register-detail-container {
	padding-right: 6px;
}

.multi-pay-button {
	background-color: white;
	border-radius: 5px;
	color: color(primary);
	font-size: size(small13);
	font-weight: bold;
	margin-left: -8px;
	margin-right: 8px;
	padding: 0.35rem 1rem;
}

.label-text {
	color: #8f8f8f;
	font-size: 13px;
}
</style>
