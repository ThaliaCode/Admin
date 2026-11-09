<template>
	<div>
		<header-page
			column-class="xs12"
			:show-excel="false"
			:title="$route.meta.title"
			to-show
			@clean-product-filter="cleanSupplier"
		>
			<v-flex xs12 text-xs-right>
				<header-detail
					v-if="supplierSelected.id"
					:detail="supplierSelected.person.fullname"
					title="Nombre de Proveedor"
				></header-detail>
			</v-flex>
		</header-page>
		<v-layout wrap pa-2 align-start>
			<v-flex xs12 ml-2>
				<v-layout row wrap align-end>
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
							ref="supplierSearcher"
							ref-value="supplierSearcher"
							id="supplierSearcher"
							label-searching="Proveedor"
							alert-message="del proveedor"
							:clean-input="cleanInput"
							:search-value="selectedSupplier"
							:flagInputEvent="true"
							@search="openSearch"
						/>
					</v-flex>
					<v-flex xs2 mr-2>
						<app-select
							multiple
							chips
							:item="warehouseIds"
							item-text="name"
							item-value="id"
							:items="warehouses"
							label="Tienda"
							model="warehouseIds"
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
					<v-flex xs2 mr-2>
						<app-select
							:item="documentsParams.status"
							item-text="name"
							item-value="id"
							:items="states"
							label="Estado de pago"
							place-holder="Selecciona un estado"
							model="status"
							:return-object="false"
							@input="setStatus"
						></app-select>
					</v-flex>
					<v-flex xs2>
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
			<v-flex md6 pr-2 pt-3>
				<heading-list title="Documentos por pagar">
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
									Pago Múltiple
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
								Pago Múltiple
							</button>
						</template>
					</template>
				</heading-list>
				<documents-list
				    @click-document-link="goToPurchaseDetail"
					:all-documents-checked="allDocumentsChecked"
					:btn-add-disabled="btnAddDocumentDisabled"
					:btn-add-text="btnAddText"
					:current-page="documentsParams.page"
					:documents="documents"
					:show-entity="showStateEntity"
					entity="proveedor"
					footer-label="Total de pagos pendientes"
					footer-show
					:footer-value="totalDebtsAmount"
					:last-page="lastDocumentsPage"
					:search="search"
					@add-document="addDocument"
					@all-documents-selected="allDocumentsSelected"
					@change-page="loadDocuments"
					@document-selected="onDocumentSelected"
					@edit-document="onEditDocument"
					@on-row-clicked="onRowClicked"
					@open-delete-confirmation="openDeleteConfirmation"
					@set-search="setSearch"
					@search-document="loadDocuments(1)"
				></documents-list>
			</v-flex>
			<v-flex md6 pl-2 pt-3>
				<heading-list class="pb-2 pt-3" :details="documentDetails"></heading-list>
				<movements-list
					show-detail
					:showSearch="false"
					:btnAdd="false"
					:btn-add-disabled="btnAddMovementDisabled"
					:load-message="loadMessage"
					:movements="movements"
					:search="searchMovement"
					:details="detailsMovement"
					:showCxp="true"
					:show-entity="showStateEntity"
					@on-click-icon="addMovement"
					@edit-movement="onEditMovement"
					@on-row-clicked="onRowClicked($event, 'movement')"
					@open-delete-confirmation="openDeleteConfirmation"
					@search-movement="searchMovementEvent"
					@set-search="setSearchMovement"
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
			@close-modal="closeSlide(documentSelected.id)"
		>
			<document-form
				v-if="actionCode('create-document')"
				:amount-required="$v.forms.newDocument.amount.$invalid"
				:document="forms.newDocument"
				:loading="loading"
				:type-transaction-required="$v.forms.newDocument.typeTransactionId.$invalid"
				:origin-code="accountsToPayCode"
				@set-data="onSetData"
				@set-date="onSetDate"
				@cancel="closeSlide(true)"
				@save="saveDocument"
				@set-data-amount="onSetDataAmount"
			></document-form>
			<movement-form
				v-if="actionCode('create-movement')"
				:amount-required="$v.forms.newMovement.amount.$invalid"
				:movement="forms.newMovement"
				:loading="loading"
				:origin-code="accountsToPayCode"
				:supplier-id="supplierSelected.id"
				:document="documentSelected"
				:type-documents="typeDocuments"
				@set-data="onSetData"
				@set-date="onSetDate"
				@cancel="closeSlide"
				@save="saveMovement"
				@set-data-amount="onSetDataAmount"
			></movement-form>
			<fees-to-pay-form
				v-if="actionCode('pay-multiple')"
				:is-loading="isLoading"
				:currency="$userInfo.company.currency"
				:currency-symbol="countryCurrencySymbol"
				:purchases-data="documentsSelected"
				:supplier-id="supplierSelected.id"
				:type-documents="typeDocuments"
				:transaction-data="transaction"
				@close="closeSlide"
				@save="save"
			/>
			<person-search-form
				v-if="slideData.code === 'supplier-searcher'"
				:search-value="searchVal"
				url="suppliers"
				@add-person="setSupplier"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import { format } from 'date-fns';
import { required } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import dateComponent from '@/components/shared/date-component';
import documentForm from '@/components/movements-in-accounts/document-form';
import documentsList from '@/components/movements-in-accounts/documents-list';
import feesToPayForm from '@/components/purchases/fees-to-pay-form';
import headerDetail from '@/components/movements-in-accounts/header-detail';
import headerPage from '@/components/shared/header-page';
import headingList from '@/components/movements-in-accounts/heading-list';
import movementForm from '@/components/movements-in-accounts/movement-form';
import movementsList from '@/components/movements-in-accounts/movements-list';
import registerDetail from '@/components/movements-in-accounts/register-detail';
import searchingByEntity from '@/components/movements-in-accounts/searching-by-entity';
import ModuleCode from '@/shared/module';
import helper from '@/shared/helper';
import personSearchInput from '@/components/shared/searcher/person-search-input';
import personSearchForm from '@/components/shared/searcher/person-search-form';
import typePaymentForm from '@/shared/type-payment-form';

const { debounce } = helper;

const initalDocumentsParams = {
	endDate: null,
	limit: 100,
	moduleCode: `${ModuleCode.AccountsToPay},${ModuleCode.Purchase}`,
	page: 1,
	status: null,
	subsidiaryId: null,
	startDate: null,
	warehouseIds: null,
};

function created() {
	this.loadStates();
}

function actionCode(code, anotherCode) {
	return (
		this.slideData.code === code || (anotherCode && this.slideData.code === anotherCode)
	);
}

function addDocument(id) {
	const slideTitle = id ? 'EDITAR' : 'NUEVO';
	this.slideData.code = 'create-document';
	this.slideData.title = `${slideTitle} DOCUMENTO POR PAGAR`;
	this.slideData.value = true;
}

function addMovement(id) {
	const slideTitle = id ? 'EDITAR' : 'NUEVA';
	this.slideData.title = `${slideTitle} TRANSACCIÓN DE PAGO`;
	this.slideData.code = 'create-movement';
	this.slideData.width = 553;
	this.slideData.value = true;
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
}

function btnAddDocumentDisabled() {
	return !this.supplierSelected.id;
}

function btnAddMovementDisabled() {
	return !this.supplierSelected.id || !this.documentSelected.id;
}

function btnAddText() {
	return this.supplierSelected.id
		? 'Crear un documento'
		: 'Es necesario seleccionar un proveedor o registro';
}

function cancelDelete() {
	this.dialog = false;
	this.typeSelected = '';
	this[`${this.typeSelected}Selected`] = {};
}

function setDate({ model, value }) {
	this.documentsParams[model] = format(value, 'YYYY-MM-DD');
	if (
		this.documentsParams.startDate &&
		this.documentsParams.endDate &&
		this.documentsParams.supplierId
	) {
		this.loadDocuments();
	}
}

function cleanSupplier() {
	this.supplierSelected = { person: {} };
	this.documentsParams = initalDocumentsParams;
	this.selectedSupplier = '';
	this.warehouseIds = [];
	this.documentSelected = {};
	this.allDocumentsChecked = false;
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
	this.documentsSelected = [];
	this.allDocumentsChecked = false;
	this.forms = {
		newDocument: {
			amount: null,
			typeTransactionId: null,
		},
		newMovement: {
			additionalInformation: {},
			amount: null,
			bankAccountId: null,
			currency: null,
			documents: [],
			documentNumberReference: null,
			typePaymentId: null,
			urlImage: null,
		},
	};
	if (isDocument || this.actionCode('create-document')) {
		this.documentSelected = {};
	}
	this.movementSelected = {};
	if (onSaved) {
		this.loadDocuments();
	}
}

async function deleteRegister() {
	this.loading = true;
	const isMovement = this.typeSelected === 'movement';
	const { id, amortization } = isMovement ? this.movementSelected : this.documentSelected;
	const idSelected = amortization ? amortization.id : id;
	const url = isMovement ? 'collection-transaction' : 'document-account-status';
	const params = isMovement
		? { purDocumentId: this.documentSelected.purDocumentId || undefined }
		: undefined;
	const message = isMovement ? 'movimiento' : 'documento';
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
			} else if (err.data.message === 'DOCUMENT_ACCOUNT_STATUS_NOT_FOUND') {
				this.showGenericError('El documento ya no existe.');
			}
		}
	} finally {
		this.cancelDelete();
		this.loading = false;
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
	try {
		const { data: response, headers } = await this.$httpSales.get(
			'document-account-status',
			{ params }
		);
		this.documents = response.map((document) => {
			const { typeTransaction, documentNumber } = document;
			const newDocument = { ...document };
			newDocument.isChecked = false;
			newDocument.isSelected = false;
			newDocument.documentNumberType = typeTransaction
				? `${typeTransaction.code} - ${documentNumber}`
				: '-';
			const warehouse = this.warehouses.find((w) => w.id === document.warehouseId);
			newDocument.warName = warehouse ? warehouse.name : '-';
			newDocument.disabled = document.debtAmount <= 0;
			const amortizationsQuotes = [
				{
					amount: this.roundInNumber(document.debtAmount + document.dueAmount),
					amountPayment: this.roundInNumber(document.dueAmount),
					amountToPayShow: this.roundInNumber(document.debtAmount),
					amountToPay: Number.parseFloat(document.debtAmount).toFixed(2),
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
		console.error(err);
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function loadMovements(registers) {
	this.movements = registers.map((movement) => {
		const newMovement = { ...movement };
		newMovement.type = movement.typePayment ? movement.typePayment.summaryCode : '';
		newMovement.typeTooltip = movement.typePayment ? movement.typePayment.name : '';
		newMovement.moduleName = movement.module ? movement.module.code : '';
		newMovement.moduleTooltip = movement.module ? movement.module.name : '';
		newMovement.documents = movement.documents || [];
		newMovement.isSelected = false;
		newMovement.typePaymentD = movement.typePayment
			? movement.typePayment.description
			: '';
		if (!newMovement.moduleTooltip) {
			newMovement.moduleTooltip = this.documentSelected.module
				? this.documentSelected.module.name
				: '';
		}
		if (movement.additionalInformation) {
			const { documentNumber, paymentDate } = movement.additionalInformation;
			newMovement.paymentDate = paymentDate && paymentDate.split()[0];
			newMovement.documentNumber = documentNumber;
		} else if (movement.transaction || movement.transactionBank) {
			const move = movement.transaction || movement.transactionBank || {};
			const { documentNumber, emissionDate, typeDocumentCode } =
				move.additionalInformation;

			newMovement.paymentDate = emissionDate && emissionDate.split()[0];
			newMovement.documentNumber = typeDocumentCode
				? `${typeDocumentCode} - ${documentNumber}`
				: documentNumber;
		}
		if (movement.amortization) {
			const amortization = movement.amortization;
			const { additionalInformation } = amortization || {};
			newMovement.operationNumber = amortization.operationNumber;
			newMovement.documentNumber =
				movement.documentNumber ||
				(additionalInformation && additionalInformation.documentNumber);
			newMovement.moduleName = amortization.module ? amortization.module.code : '-';
			newMovement.moduleTooltip = amortization.module ? amortization.module.name : '-';
			const isString =
				typeof (additionalInformation && additionalInformation.paymentDate) === 'string';

			newMovement.paymentDate = isString
				? additionalInformation.paymentDate
				: additionalInformation &&
				  additionalInformation.paymentDate &&
				  additionalInformation.paymentDate.emissionDate &&
				  additionalInformation.paymentDate.emissionDate.length &&
				  additionalInformation.paymentDate.emissionDate.split()[0];
		}
		return newMovement;
	});
	this.movements.sort((a, b) => {
		const dateA = new Date(a.paymentDate);
		const dateB = new Date(b.paymentDate);

		return dateB - dateA;
	});
}

async function loadStates() {
	const params = {
		module: `${ModuleCode.AccountsToPay},${ModuleCode.Purchase}`,
	};
	const requests = [
		this.getCurrencies(),
		this.$httpSales.get('payment-states', { params }),
		this.$httpSales.get('subsidiaries'),
		this.$httpSales.get('bank-account'),
		this.getTypePayments('purchases'),
		this.$httpSales.get(`cash/${this.$userInfo.cashId}`),
		this.warehousesList(),
		this.getTypeDocuments('purchases'),
	];
	try {
		const responses = await Promise.all(requests);
		[
			{ data: this.currencies },
			{ data: this.states },
			{ data: this.subsidiaries },
			{ data: this.accounts },
			{ data: this.typePayments },
			{ data: this.cashUser },
			{ data: this.warehouses },
			{ data: this.typeDocuments },
		] = responses;
		this.warehouses.unshift({ id: 0, name: 'Seleccionar todos' });
		this.typePayments = this.typePayments.map((tp) => tp.paymentType);
		const { subsidiary: subsidiaryUser } = this.$userInfo;
		const { configIntegrations } = subsidiaryUser;
		this.showStateEntity =
			configIntegrations &&
			((configIntegrations.accountingPlan &&
				configIntegrations.accountingPlan.flagConfig) ||
				(configIntegrations.accountingConfiguration &&
					configIntegrations.accountingConfiguration.flagConfig));
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
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
		? format(value.additionalInformation.paymentDate, 'YYYY-MM-DD')
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

function onRowClicked(value, type) {
	this.clearMovement();
	const rowsChanged = type ? 'movements' : 'documents';
	const rowSelected = type || 'document';
	this[rowsChanged] = this.propRowsChanged(
		this[rowsChanged],
		'isSelected',
		value.id,
		'id'
	);
	const rowChangeSelected = this[rowsChanged].find((rc) => rc.id === value.id) || {};
	const newValue = rowChangeSelected.isSelected ? { ...value } : {};
	this[`${rowSelected}Selected`] = { ...newValue };
	if (!type) {
		this.details = this.setDocumentDetails(this.details);
		this.documentDetails = this.setDocumentDetails(this.documentDetails);
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
					this.loadMovements(
						this.documentSelected.amortizations.concat(
							this.documentSelected.amortizationDocuments
						)
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
	} else {
		this.movementSelected.createdFormatted = format(
			new Date(this.movementSelected.createdAt),
			'DD-MM-YYYY HH:mm:ss'
		);
		this.detailsMovement = this.setDocumentMovement(this.movementSelected);
	}
	// this.onDocumentSelected(value, movementCreated);
}

function onSetData({ model, newValue, value }, module) {
	const valueValid = newValue || value;
	const newModule = module ? 'newMovement' : 'newDocument';
	if (
		model === 'currency' &&
		(typeof value === 'string' || (value && typeof value.id === 'string'))
	) {
		this.$set(this.forms[newModule], model, value.id || value);
	} else if (model !== 'currency') {
		const finalValue =
			model === 'typeTransactionId' ||
			model === 'employeeId' ||
			model === 'typePaymentId' ||
			model === 'currency'
				? (value && value.id) || value
				: valueValid;
		this.$set(this.forms[newModule], model, finalValue);
	}
}

function onSetDate({ model, valueDate }, module) {
	const newModule = module ? 'newMovement' : 'newDocument';
	this.forms[newModule][model] = format(valueDate, 'YYYY-MM-DD');
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

function openMultiPaysSlide() {
	if (this.cashUser.flagActive) {
		this.slideData = {
			code: 'pay-multiple',
			title: 'PAGO MÚLTIPLE',
			value: true,
			width: 600,
		};
	} else {
		this.showNotification(
			'Es necesario activar su caja para poder registrar los cobros.',
			'info'
		);
	}
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

async function save({ body, paymentType }) {
	this.isLoading = true;
	const paymentDate =
		(body.additionalInformation && body.additionalInformation.paymentDate) ||
		format(new Date(), 'YYYY-MM-DD');
	const newBody = {
		amount: body.amount,
		bankAccountId: body.bankAccountId,
		observations: body.description,
		typePaymentId: paymentType,
		urlImage: body.urlImage || '',
		additionalInformation: {
			documents: this.documentsSelected.map((doc) => {
				if (doc.typeTransaction) {
					return `${doc.typeTransaction.code}${doc.documentNumber}`;
				}
				return doc.documentNumber;
			}),
			documentNumber: body.documentNumber,
			paymentDocumentNumber: body.documentNumber,
			concept: body.description,
			reference: body.description,
			paymentDate,
		},
		ntcDocumentId: body.ntcDocumentId,
		cashId: this.cashUser.id,
		currency: body.currency,
		supplierId: body.supplierId,
		documentsAccountStatus: body.documents.map((ds) => ({
			id: ds.purDocumentId,
			amount: ds.payments.reduce((a, d) => a + Number(d.amountPayment), 0),
		})),
		moduleCode: body.moduleCode,
		customerId: null,
		warehouseIds: null,
	};
	if (this.documentsParams.subsidiaryId) {
		newBody.subsidiaryId = Number(this.documentsParams.subsidiaryId);
	}
	const documentsToPay = { ...newBody };
	documentsToPay.documentsAccountStatus = newBody.documentsAccountStatus.filter(
		(d) => d.amount
	);
	const url = 'collection-transaction/multiple';
	if (documentsToPay.documentsAccountStatus.length > 0) {
		try {
			await this.$httpSales.post(url, documentsToPay);
			this.closeSlide(false, true);
			this.setSupplier(this.supplierSelected);
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
		this.showNotification('No hay amortizaciones por realizar.', 'info');
	}
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
		body.moduleCode = this.accountsToPayCode;
		body.supplierId = this.documentsParams.supplierId;
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
				this.showGenericError('El proveedor no existe');
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
		documentNumber,
		additionalInformation,
		amount,
		cashId,
		ntcDocumentId,
		currency,
		documentReference,
		observations,
		typePaymentId,
		urlImage,
		paymentDate,
		reference,
	} = this.forms.newMovement;
	this.loading = true;
	const method = id ? 'patch' : 'post';
	const url = id ? `collection-transaction/${id}` : 'collection-transaction';
	const message = id ? 'editada' : 'creada';
	const typePayment = this.typePayments.find((tp) => tp.id === typePaymentId);
	const body = {
		additionalInformation: {
			dateReference: additionalInformation.dateReference,
			documentNumber,
			paymentDocumentNumber: documentNumber,
			paymentDate,
		},
		amount: Number(amount),
		bankAccountId:
			typePayment.flagForm === typePaymentForm.Deposit
				? (bankAccountId && bankAccountId.id) || bankAccountId
				: undefined,
		cashId,
		ntcDocumentId,
		currency: currency || this.$userInfo.company.currency,
		documentReference,
		observations,
		typePaymentId,
		urlImage,
	};
	if (reference) {
		body.additionalInformation.reference = reference;
	}
	if (!id) {
		body.documentAccountStatusId = this.documentSelected.id;
		body.moduleCode = this.accountsToPayCode;
	}
	try {
		const { data: itemCreated } = await this.$httpSales[method](url, body);
		this.showNotification(`La transacción ha sido ${message} correctamente.`);
		this.closeSlide(true);
		this.loadDocuments(this.documentsParams.page, itemCreated);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'BENEFICIARY_NOT_EXIST') {
				this.showGenericError('El cliente no existe');
			} else if (err.data.message === 'HEADER_AMOUNT_EXCEEDED') {
				this.showGenericError(
					'La sumatoria de montos de los movimientos excede al monto total del documento relacionado.'
				);
			} else if (err.data.message === 'CASH_CLOSING_USER_EXIST') {
				this.showGenericError(
					'La caja aperturada se encuentra en otro usuario, asegurese que la caja se encuentre cerrada para realizar el pago.'
				);
			} else {
				this.showGenericError();
			}
		}
	} finally {
		this.loading = false;
	}
}

function searchMovementEvent() {
	if (this.searchMovement) {
		if (this.documentSelected.amortizations) {
			const transactions = this.documentSelected.amortizations.filter(
				(transaction) =>
					(transaction.type.toLowerCase().indexOf(this.searchMovement.toLowerCase()) ||
						transaction.origin.toLowerCase().indexOf(this.searchMovement.toLowerCase())) >
					-1
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

function setSearch(value) {
	this.search = value && value.trim() ? value.trim() : null;
	this.documentsParams.search = this.search;
}

function setSearchMovement(value) {
	this.searchMovement = value && value.trim() ? value.trim() : null;
}

function setSupplier(supplier) {
	if (supplier) {
		this.closeSlide();
		this.cleanInput = true;
		this.selectedSupplier = supplier.fullName;
		const newSupplier = { ...supplier };
		newSupplier.person = supplier.person || { fullname: supplier.name };
		this.supplierSelected = { ...newSupplier };
		this.documentsParams.supplierId = this.supplierSelected.id;
		this.loadDocuments();
	}
}

function setStatus({ model, value }) {
	if (model === 'subsidiaryId' || model === 'status') {
		this.documentsParams[model] = value;
	} else if (model === 'currency') {
		this.documentsParams[model] = value;
	} else if (value.some((id) => id === 0)) {
		const wars = this.warehouses.reduce((list, w) => {
			if (w.id) {
				return list.concat(w.id);
			}
			return list;
		}, []);
		this.documentsParams[model] = !wars.length ? null : wars.join(',');
		this.warehouseIds = wars;
	} else {
		this.warehouseIds = value;
		this.documentsParams[model] = !value.length ? null : value.join(',');
	}
	if (this.documentsParams.supplierId) {
		this.loadDocuments();
	}
}

function totalDebtsAmount() {
	if (this.documents.length > 0) {
		const reduceAmount = this.documents.reduce((a, d) => {
			if (d.debtAmount !== d.dueAmount) {
				return a + d.debtAmount;
			}
			return a;
		}, 0);
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

function setDocumentMovement(row) {
	return this.detailsMovement.map((d) => {
		const newD = { ...d };
		if (d.id === 2) {
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
		} else if (d.id === 2) {
			newD.value = (row.module && row.module.name) || row[d.field] || '-';
		} else {
			newD.value = row[d.field] || '-';
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

function onSetDataAmount({ model, newValue, value }, module) {
	const valueValid = newValue || value;
	const newModule = module ? 'newMovement' : 'newDocument';
	this.forms[newModule][model] = Number.parseFloat(valueValid).toFixed(2);
}

function openSearch(value) {
	this.cleanInput = false;
	this.searchVal = value ? value.trim() : '';
	this.slideData.code = 'supplier-searcher';
	this.slideData.title = 'Proveedores';
	this.slideData.width = 739;
	this.slideData.value = true;
}

function data() {
	return {
		accounts: [],
		accountsToPayCode: ModuleCode.AccountsToPay,
		allDocumentsChecked: false,
		cashUser: {},
		currencies: [],
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
			...initalDocumentsParams,
		},
		documentsSelected: [],
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
			},
		},
		isLoading: false,
		lastDocumentsPage: 0,
		loading: false,
		loadMessage: 'Es necesario seleccionar un documento para ver los registros.',
		movements: [],
		movementSelected: {},
		search: null,
		searchMovement: null,
		slideData: {
			code: null,
			title: '',
			value: false,
			width: 553,
		},
		showStateEntity: false,
		states: [],
		subsidiaries: [],
		suppliers: [],
		supplierSelected: {
			person: {},
		},
		transaction: {
			bankAccountId: null,
			dateReference: null,
			documentNumber: '',
			flagForm: null,
			reference: '',
			urlImage: '',
		},
		typeDocuments: [],
		typeSelected: '',
		detailsMovement: [
			{ id: 1, field: 'typePaymentD', label: 'T.Pago', value: null },
			{ id: 2, field: 'documents', label: 'Tipo Doc.', tooltip: null, value: null },
			{ id: 3, field: 'operationNumber', label: 'Nro Ope.', value: null },
			{ id: 4, field: 'createdFormatted', label: 'Fecha', value: null },
			{ id: 5, field: 'typeAmortizationName', label: 'T. Trans', value: null },
			{ id: 6, field: 'amount', label: 'Importe', value: null },
			{ id: 7, field: 'moduleTooltip', label: 'Origen', value: null },
		],
		cleanInput: false,
		selectedSupplier: '',
		searchVal: null,
		warehouses: [],
		warehouseIds: null,
	};
}
function goToPurchaseDetail(document) {
    const routeData = this.$router.resolve({
        name: 'purchase-detail',
        params: { id: document.purDocumentId },
    });
    window.open(routeData.href, '_blank');
}

export default {
	name: 'page-accounts-to-pay',
	components: {
		actionSidebar,
		dateComponent,
		documentForm,
		documentsList,
		feesToPayForm,
		headerDetail,
		headerPage,
		headingList,
		movementForm,
		movementsList,
		registerDetail,
		searchingByEntity,
		personSearchInput,
		personSearchForm,
	},
	computed: {
		btnAddDocumentDisabled,
		btnAddMovementDisabled,
		btnAddText,
		totalDebtsAmount,
	},
	created,
	data,
	methods: {
		actionCode,
		addDocument,
		addMovement,
		allDocumentsSelected,
		cancelDelete,
		cleanSupplier,
		closeSlide,
		deleteRegister,
		eventOnRows,
		goToPurchaseDetail,
		loadDocuments,
		loadMovements,
		loadStates,
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
		searchMovementEvent,
		setDate,
		setDocumentDetails,
		setSearch,
		setSearchMovement,
		setStatus,
		setSupplier,
		setDocumentMovement,
		clearMovement,
		onSetDataAmount: debounce(onSetDataAmount),
		openSearch,
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
