<template>
	<div>
		<v-form method="post" @click.prevent="save" class="mb-5">
			<v-layout wrap pa-3>
				<v-flex xs6 pr-2>
					<app-input-text
						type="number"
						:label="`Monto ${currencySymbol}`"
						:disabled="paymentCode === 'cntc'"
						:max="totalToPay"
						min="0"
						model="total"
						:text="model.total"
						@input="getDataTotal"
					/>
				</v-flex>
				<v-flex xs6>
					<app-select
						:item="model.paymentType"
						item-text="name"
						item-value="id"
						:items="paymentTypes"
						label="Tipo de Pago"
						model="paymentType"
						return-object
						@input="getData"
					/>
				</v-flex>
				<v-flex xs6 pr-2 mt-2>
					<app-select
						:item="model.cashId"
						item-text="name"
						item-value="id"
						:items="cashs"
						label="Caja"
						model="cashId"
						return-object
						@input="$emit('get-data', $event)"
					/>
				</v-flex>
				<v-flex xs6 mt-2 v-if="isDetailImportMode">
					<app-select
						:item="model.subsidiaryId"
						item-text="sucursalName"
						item-value="id"
						:items="subsidiaries"
						:label="labelSucursal()"
						model="subsidiaryId"
						:return-object="false"
						@input="setData"
					/>
				</v-flex>
				<v-flex xs6 pr-2 mt-2 v-if="isDetailImportMode">
					<app-select
						:item="model.warehouseId"
						item-text="name"
						item-value="id"
						:items="warehouses"
						:label="labelWarehouse()"
						model="warehouseId"
						:return-object="false"
						@input="setData"
					/>
				</v-flex>
				<v-flex v-if="paymentCode === 'cntc'" xs12 px-2 mt-3 mb-1>
					<v-btn
						class="btn-action btn-auto btn-width-auto px-2 py-1"
						color="success"
						small
						@click.stop="openListNtc()"
					>
						Seleccione documento
					</v-btn>

					<v-layout wrap px-2 align-end mt-2 v-if="documentNtc">
						<v-flex xs3 caption mb-2>Nro. Documento:</v-flex>
						<v-flex xs5 px-1 mb-2>
							<v-layout wrap align-end subheading>
								{{ documentNtc.documentNumber }}
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 v-if="!isDetailImportMode && isDifferentCash" mt-2>
					<purchases-payment-form
						:bank-account-id="model.bankAccountId"
						:card-id="model.paymentType"
						:date-reference="transaction.dateReference"
						:document-number="transaction.documentNumber"
						:flag-form="transaction.flagForm"
						:reference="transaction.reference"
						:url-image="transaction.urlImage"
						:show-operation-number="paymentCode !== 'cntc'"
						is-sale
						@get-data="getTransactionData($event, transaction)"
					/>
				</v-flex>
				<v-flex xs12 v-if="isDetailImportMode && isDepositPaymentImport" mt-2>
					<app-select
						:item="model.bankAccountId"
						item-text="name"
						item-value="id"
						:items="bankAccountings"
						label="Cuenta"
						model="bankAccountId"
						:return-object="false"
						@input="setBankAccountData"
					/>
				</v-flex>
			</v-layout>
			<v-layout wrap px-3 mb-3 v-for="purchase in purchases" :key="purchase.id">
				<v-flex
					xs12
					pa-2
					primary
					lighten-1
					white--text
					class="body-2 d-flex align-center"
				>
					<span># DOC: {{ purchase.documentNumber }}</span>
					<span class="ml-auto"></span>
					<app-tooltip-button
						v-if="isDetailImportMode"
						color="white"
						:icon="
							purchaseInputsVisible[purchase.id] ? 'arrow_drop_down' : 'arrow_drop_up'
						"
						:show-text="false"
						@click-icon="togglePurchaseInputs(purchase.id)"
					></app-tooltip-button>
				</v-flex>
				<v-flex
					xs12
					py-2
					v-for="(quote, quoteIdx) in purchase.caDocument.details"
					:key="quote.id"
				>
					<v-layout>
						<v-flex xs1 mr-2 pt-1 v-if="!isDetailImportMode">
							<label class="status-label">Estado</label>
							<v-tooltip top>
								<v-icon slot="activator" :color="iconColor(quote)">
									radio_button_checked
								</v-icon>
								<span>{{ quote.statusName }}</span>
							</v-tooltip>
						</v-flex>
						<v-flex xs2 pr-2 pt-1>
							<label class="status-label">Total</label>
							<p class="label-text">{{ quote.amount | round }}</p>
						</v-flex>
						<v-flex xs2 pr-2 pt-1>
							<label class="status-label">Monto</label>
							<p class="label-text">{{ quote.amountPayment | round }}</p>
						</v-flex>
						<v-flex xs2 pt-1>
							<label class="status-label">Saldo</label>
							<p class="label-text">{{ quote.amountToPayShow | round }}</p>
						</v-flex>
						<v-flex xs3 pr-2>
							<label class="status-label">A Pagar</label>
							<v-text-field
								class="filter-select"
								:disabled="quote.status === 3"
								error
								hide-details
								:max="quote.amount"
								min="0"
								:readonly="quote.status === 3"
								:rules="[(v) => v < quote.amount + 1 || 'Error :(']"
								type="number"
								:value="quote.amountToPay"
								@input="showErrorMessage($event, quote, purchase.id)"
							></v-text-field>
							<span
								class="form-group__message"
								v-if="quote.amountToPay === '0.00' || quote.amountToPay === 'NaN'"
								>Monto es requerido</span
							>
						</v-flex>
						<v-flex xs3 v-if="!isDetailImportMode">
							<app-date-select
								:date-formatted="quote.expirationDate | exactDate('YYYY-MM-DD')"
								label="Fecha de pago"
								readonly
							/>
						</v-flex>
						<v-flex xs3 v-else-if="isDetailImportMode && !isDepositPaymentImport">
							<app-date-select
								:date-formatted="quote.expirationDate | exactDate('YYYY-MM-DD')"
								label="Fecha de pago"
								model="expirationDate"
								@input="setQuotePaymentDate($event, purchase.id, quoteIdx)"
							/>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex
					xs12
					mt-2
					v-if="
						isDetailImportMode &&
						isDepositPaymentImport &&
						purchaseInputsVisible[purchase.id]
					"
				>
					<bank-deposit-form
						:code="purchase.id"
						:bank-accounts="bankAccountings"
						:bank-account-id="model.bankAccountId"
						:date-reference="purchaseTransactions[purchase.id].dateReference"
						:document-number="purchaseTransactions[purchase.id].documentNumber"
						:reference-deposit="purchaseTransactions[purchase.id].reference"
						:concept-deposit="purchaseTransactions[purchase.id].concept"
						:url-image="purchaseTransactions[purchase.id].urlImage"
						is-detail-import-mode
						:show-bank-account="false"
						is-sale
						@get-data="setPurchasePaymentData($event, purchase.id)"
					/>
				</v-flex>
				<v-flex
					xs12
					mt-2
					v-if="
						isDetailImportMode &&
						isCheckPaymentImport &&
						purchaseInputsVisible[purchase.id]
					"
				>
					<check-form
						:code="purchase.id"
						:bank-accounts="bankAccountings"
						:bank-account-id="purchaseTransactions[purchase.id].bankAccountId"
						:date-reference="purchaseTransactions[purchase.id].dateReference"
						:document-number="purchaseTransactions[purchase.id].documentNumber"
						:reference="purchaseTransactions[purchase.id].reference"
						is-sale
						@get-data="setPurchasePaymentData($event, purchase.id)"
					/>
				</v-flex>
				<v-flex
					xs12
					mt-2
					v-if="
						isDetailImportMode &&
						isCardPaymentImport &&
						purchaseInputsVisible[purchase.id]
					"
				>
					<v-layout wrap>
						<v-flex xs6>
							<app-input-text
								label="# Voucher"
								model="documentNumber"
								:text="purchaseTransactions[purchase.id].documentNumber"
								@input="setPurchaseField($event, purchase.id)"
							/>
						</v-flex>
						<v-flex xs12 mt-2>
							<app-input-text
								textarea
								no-resize
								label="Referencia"
								model="reference"
								:text="purchaseTransactions[purchase.id].reference"
								@input="setPurchaseField($event, purchase.id)"
							/>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex
					xs12
					mt-2
					v-if="
						isDetailImportMode &&
						(isCashPayment || isAdvancePaymentImport) &&
						purchaseInputsVisible[purchase.id]
					"
				>
					<v-layout wrap>
						<v-flex xs12>
							<app-input-text
								textarea
								no-resize
								label="Referencia"
								model="reference"
								:text="purchaseTransactions[purchase.id].reference"
								@input="setPurchaseField($event, purchase.id)"
							/>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="
						quoteError ||
						validTotal ||
						!Number(model.total) ||
						Number(totalAmount) < Number(model.total) ||
						(isDetailImportMode && (!model.subsidiaryId || !model.warehouseId)) ||
						(paymentCode === 'cntc' && !documentNtc) ||
						(isDetailImportMode &&
							(isDepositPaymentImport || isCheckPaymentImport) &&
							!model.bankAccountId) ||
						totalQuotesAmount ||
						isLoading
					"
					@cancel-button-clicked="close"
					@accept-button-clicked="save"
				/>
			</section>
		</v-form>
		<v-dialog persistent v-model="openNtc" max-width="700px">
			<modal-select-ntc
				v-if="openNtc"
				:id-supplier="supplierId"
				:type-document="typeDocuments"
				@add-document-ntc="addDocNtc"
				@close-modal="openListNtc"
			/>
		</v-dialog>
	</div>
</template>

<script>
import { format } from 'date-fns';
import appDateSelect from '@/components/shared/app-date-select';
import appSelect from '@/components/shared/app-select';
import bankDepositForm from '@/components/shared/type-payment-forms/bank-deposit-form';
import checkForm from '@/components/shared/type-payment-forms/check-form';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import ModuleCode from '@/shared/module';
import purchasesPaymentForm from '@/components/purchases/purchases-payment-form';
import TypePaymentForm from '@/shared/type-payment-form';
import modalSelectNtc from '@/components/modal-select-ntc';
import helper from '@/shared/helper';

const { debounce } = helper;

function created() {
	this.purchases =
		this.purchasesData && this.purchasesData.length > 0
			? [...this.purchasesData]
			: [this.purchase];
	this.initPurchaseTransactions();
	const newTransaction = { ...this.transactionData };
	newTransaction.dateReference = format(new Date(), 'YYYY-MM-DD');
	this.transaction = { ...newTransaction };
	this.loadResources();
	this.loadCash();
}

function initPurchaseTransactions() {
	this.purchaseTransactions = this.purchases.reduce((accum, purchase) => {
		const newAccum = { ...accum };
		newAccum[purchase.id] = {
			bankAccountId: null,
			concept: '',
			dateReference: format(new Date(), 'YYYY-MM-DD'),
			documentNumber: '',
			reference: '',
			urlImage: '',
		};
		return newAccum;
	}, {});
	this.purchaseInputsVisible = this.purchases.reduce((accum, purchase) => {
		const newAccum = { ...accum };
		newAccum[purchase.id] = true;
		return newAccum;
	}, {});
}

function togglePurchaseInputs(purchaseId) {
	const currentValue = !!this.purchaseInputsVisible[purchaseId];
	this.$set(this.purchaseInputsVisible, purchaseId, !currentValue);
}

function accountingActive() {
	return this.paymentCode === 'deposito-bancario';
}

function close() {
	this.$emit('close');
}

function getData({ model, value }) {
	this.model[model] = model !== 'total' ? value.id || value : value;
	if (model === 'paymentType') {
		this.paymentCode = value.code;
		this.transaction.flagForm = value.flagForm;
		this.documentNtc = null;
		if (value.code === 'cntc') {
			this.getDataTotal({ model: 'total', value: 0 });
		}
		if (!this.isDetailImportMode) {
			if (
				TypePaymentForm.Cash === value.flagForm ||
				TypePaymentForm.Card === value.flagForm
			) {
				this.model.bankAccountId = null;
				this.transaction.bankAccountId = null;
			} else if (this.bankAccountings.length > 0) {
				this.model.bankAccountId = this.bankAccountings[0].id;
				this.transaction.bankAccountId = this.bankAccountings[0].id;
			}
		} else if (
			this.isCashPayment ||
			this.isCardPaymentImport ||
			this.isAdvancePaymentImport
		) {
			this.model.bankAccountId = null;
			this.transaction.bankAccountId = null;
		} else if (this.bankAccountings.length > 0) {
			this.model.bankAccountId = this.bankAccountings[0].id;
			this.transaction.bankAccountId = this.bankAccountings[0].id;
		}
	}
	if (model === 'total') {
		this.setQuotes(value);
	}
}

function setData(payload) {
	getData.call(this, payload);
}

function getDataTotal({ model, value }) {
	if (this.roundInNumber(value) < this.totalToPay) {
		this.model[model] = Number.parseFloat(value).toFixed(2);
		this.setQuotes(value);
	} else {
		this.model[model] = Number.parseFloat(this.totalToPay).toFixed(2);
	}
}

function getQuoteData(value, id, purId) {
	this.purchases = this.purchases.map((purchase) => {
		const newPurchase = { ...purchase };
		if (purchase.id === purId && purchase.caDocument.details.length > 0) {
			newPurchase.caDocument.details = purchase.caDocument.details.map((detail) => {
				const newDetail = { ...detail };
				if (detail.id === id) {
					newDetail.amountToPay = Number.parseFloat(value).toFixed(2);
				}
				return newDetail;
			});
		}
		return newPurchase;
	});
	this.totalQuotes();
}

function getTransactionData({ model, newValue }) {
	this.$set(this.transaction, model, newValue);
}

function setPurchasePaymentData({ model, newValue }, purchaseId) {
	if (!this.purchaseTransactions[purchaseId]) {
		return;
	}
	if (model === 'bankAccountId') {
		this.$set(this.purchaseTransactions[purchaseId], model, newValue);
		this.model.bankAccountId = newValue;
		this.transaction.bankAccountId = newValue;
		return;
	}
	this.$set(this.purchaseTransactions[purchaseId], model, newValue);
}

function setPurchaseField(payload, purchaseId) {
	if (!this.purchaseTransactions[purchaseId]) {
		return;
	}
	const { model = 'reference', value = '' } = payload || {};
	this.$set(this.purchaseTransactions[purchaseId], model, value || '');
}

function setQuotePaymentDate({ value }, purchaseId, quoteIdx) {
	this.purchases = this.purchases.map((purchase) => {
		const newPurchase = { ...purchase };
		if (
			purchase.id === purchaseId &&
			purchase.caDocument &&
			purchase.caDocument.details
		) {
			newPurchase.caDocument = { ...purchase.caDocument };
			newPurchase.caDocument.details = purchase.caDocument.details.map((quote, idx) => {
				const newQuote = { ...quote };
				if (idx === quoteIdx) {
					newQuote.expirationDate = value || quote.expirationDate;
				}
				return newQuote;
			});
		}
		return newPurchase;
	});
}

function normalizeDateOnly(dateValue) {
	if (!dateValue) {
		return null;
	}
	if (typeof dateValue === 'string') {
		if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
			return dateValue;
		}
		const [datePart] = dateValue.split('T');
		if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
			return datePart;
		}
	}
	if (dateValue instanceof Date) {
		const year = dateValue.getFullYear();
		const month = String(dateValue.getMonth() + 1).padStart(2, '0');
		const day = String(dateValue.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
	return null;
}

function setBankAccountData({ value }) {
	this.model.bankAccountId = value;
	this.transaction.bankAccountId = value;
}

function isCompletePayment(quote) {
	return quote.amountToPay + quote.amountPayment === quote.amount;
}

function isDifferentCash() {
	return this.paymentCode !== 'efectivo';
}

function isCashPayment() {
	return this.paymentCode === 'efectivo';
}

function isCardPaymentImport() {
	return this.isDetailImportMode && this.transaction.flagForm === TypePaymentForm.Card;
}

function isDepositPaymentImport() {
	const code = String(this.paymentCode || '').toLowerCase();
	const isYape = code.includes('yape');
	return (
		this.isDetailImportMode &&
		(this.transaction.flagForm === TypePaymentForm.Deposit || isYape)
	);
}

function isCheckPaymentImport() {
	return this.isDetailImportMode && this.transaction.flagForm === TypePaymentForm.Check;
}

function isAdvancePaymentImport() {
	const code = String(this.paymentCode || '').toLowerCase();
	return this.isDetailImportMode && code.includes('anticipo');
}

async function loadResources() {
	const request = [
		this.$httpSales.get('bank-account'),
		this.getTypePayments('purchases'),
	];
	[{ data: this.bankAccountings }, { data: this.paymentTypes }] = await Promise.all(
		request
	);
	this.paymentTypes = this.paymentTypes.map((pt) => pt.paymentType);
	if (this.isDetailImportMode) {
		this.paymentTypes = this.paymentTypes.filter(
			(paymentType) => paymentType.code !== 'cntc'
		);
	}
	const paymentTypeSelected = this.paymentTypes.find((pt) => pt.code === 'efectivo');
	this.model.paymentType = paymentTypeSelected.id;
	this.paymentCode = paymentTypeSelected.code;
	this.transaction.flagForm = paymentTypeSelected.flagForm;
	this.totalAmount = this.purchases.reduce((a, p) => a + p.debtAmount, 0);
	this.model.total = Number.parseFloat(this.totalAmount).toFixed(2);
	this.totalQuotes();
}

function save() {
	if (!this.isDetailImportMode) {
		const paymentDate =
			normalizeDateOnly(this.transaction && this.transaction.dateReference) ||
			format(new Date(), 'YYYY-MM-DD');
		const body = {
			urlImage: this.transaction.urlImage,
			amount: Number(this.model.total),
			moduleCode: ModuleCode.AccountsToPay,
			bankAccountId: this.transaction.bankAccountId || undefined,
			description: 'Pago de cuotas pendientes',
			currency: this.$userInfo.company.currency,
			supplierId: this.supplierId,
			ntcDocumentId: this.documentNtc ? this.documentNtc.id : undefined,
			documentNumber:
				(this.documentNtc && this.documentNtc.documentNumber) ||
				(this.transaction && this.transaction.documentNumber),
			additionalInformation: {
				paymentDate,
			},
			documents: this.purchases.map((purchase) => {
				const newPurchase = {};
				newPurchase.purDocumentId = purchase.id;
				newPurchase.caDocumentId = purchase.caDocument.id;
				newPurchase.amount = purchase.caDocument.amount;
				newPurchase.payments = purchase.caDocument.details.reduce((accum, quote) => {
					if (quote.status !== 3) {
						const newQuote = {};
						newQuote.amount = quote.amount;
						const isTotalPayment = isCompletePayment(quote);
						if (isTotalPayment) {
							if (quote.amountToPay < quote.amount) {
								newQuote.amountPayment = quote.amountToPay;
							} else {
								newQuote.amountPayment = quote.amount;
							}
						} else {
							newQuote.amountPayment = quote.amountToPay;
						}
						newQuote.expirationDate = quote.expirationDate;
						newQuote.id = quote.id;
						newQuote.observations = 'ninguna';
						accum.push(newQuote);
					}
					return accum;
				}, []);
				return newPurchase;
			}),
		};
		const paymentType = this.model.paymentType;
		this.$emit('save', { body, paymentType });
		return;
	}
	if (!this.model.subsidiaryId || !this.model.warehouseId) {
		this.showNotification(
			'Selecciona sucursal y tienda para registrar el pago.',
			'warning'
		);
		return;
	}
	const firstPurchase = this.purchases[0] || {};
	const firstTransaction = this.purchaseTransactions[firstPurchase.id] || {};
	const globalReference =
		firstTransaction.reference || (this.transaction && this.transaction.reference) || '';
	const globalConcept =
		firstTransaction.concept || globalReference || 'Pago de cuotas pendientes';
	const globalDocumentNumber =
		(this.documentNtc && this.documentNtc.documentNumber) ||
		firstTransaction.documentNumber ||
		(this.transaction && this.transaction.documentNumber) ||
		'';
	const globalDateReference =
		firstTransaction.dateReference ||
		(this.transaction && this.transaction.dateReference) ||
		format(new Date(), 'YYYY-MM-DD');
	const globalUrlImage =
		firstTransaction.urlImage || (this.transaction && this.transaction.urlImage) || '';
	const body = {
		urlImage: globalUrlImage,
		amount: Number(this.model.total),
		subsidiaryId: this.model.subsidiaryId || null,
		warehouseId: this.model.warehouseId || null,
		moduleCode: ModuleCode.AccountsToPay,
		bankAccountId:
			this.model.bankAccountId || this.transaction.bankAccountId || undefined,
		description: globalConcept,
		currency: this.$userInfo.company.currency,
		supplierId: this.supplierId,
		ntcDocumentId: this.documentNtc ? this.documentNtc.id : undefined,
		documentNumber: globalDocumentNumber,
		documents: this.purchases.map((purchase) => {
			const purchaseTransaction = this.purchaseTransactions[purchase.id] || {};
			const newPurchase = {};
			newPurchase.purDocumentId = purchase.id;
			newPurchase.caDocumentId = purchase.caDocument.id;
			newPurchase.amount = purchase.caDocument.amount;
			newPurchase.payments = purchase.caDocument.details.reduce((accum, quote) => {
				if (quote.status !== 3) {
					const newQuote = {};
					newQuote.amount = quote.amount;
					const isTotalPayment = isCompletePayment(quote);
					if (isTotalPayment) {
						if (quote.amountToPay < quote.amount) {
							newQuote.amountPayment = quote.amountToPay;
						} else {
							newQuote.amountPayment = quote.amount;
						}
					} else {
						newQuote.amountPayment = quote.amountToPay;
					}
					newQuote.expirationDate = quote.expirationDate;
					newQuote.id = quote.id;
					newQuote.observations =
						purchaseTransaction.reference ||
						purchaseTransaction.concept ||
						globalReference ||
						'ninguna';
					accum.push(newQuote);
				}
				return accum;
			}, []);
			newPurchase.observations =
				purchaseTransaction.reference || purchaseTransaction.concept || null;
			newPurchase.urlImage = purchaseTransaction.urlImage || null;
			const firstPayment = newPurchase.payments[0] || {};
			const paymentDate = this.isDepositPaymentImport
				? normalizeDateOnly(purchaseTransaction.dateReference)
				: normalizeDateOnly(firstPayment.expirationDate);
			newPurchase.additionalInformation = {
				documentNumber: purchaseTransaction.documentNumber || null,
				paymentDate,
				reference: purchaseTransaction.reference || null,
				concept: purchaseTransaction.concept || null,
			};
			return newPurchase;
		}),
		additionalInformation: {
			dateReference: globalDateReference,
			documents: this.purchases.map((purchase) => purchase.documentNumber),
			documentNumber: globalDocumentNumber,
			paymentDocumentNumber: globalDocumentNumber,
			concept: globalConcept,
			reference: globalReference,
			paymentDate: normalizeDateOnly(globalDateReference),
		},
	};
	const paymentType = this.model.paymentType;
	this.$emit('save', { body, paymentType });
}

function setQuoteData({ model, value }) {
	const modelValues = model.split('-');
	const id = Number(modelValues[0]);
	const quoteId = Number(modelValues[1]);
	this.purchases = this.purchases.map((purchase) => {
		const newPurchase = { ...purchase };
		if (purchase.id === id && newPurchase.caDocument.details.length > 0) {
			newPurchase.caDocument.details = purchase.caDocument.details.map((detail) => {
				const newDetail = { ...detail };
				if (detail.id === quoteId) {
					newDetail.amountToPay = Number(value);
				}
				return newDetail;
			});
		}
		return newPurchase;
	});
}

function setQuotes(total) {
	// let newTotal = total;
	this.purchases.forEach((purchase) => {
		purchase.caDocument.details.reduce((acumQ, quote) => {
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
			newQuote.amountToPay = this.roundInNumber(total / this.purchases.length);
			newQuote.amountToPay = Number.parseFloat(newQuote.amountToPay).toFixed(2);

			return acumQ + parseFloat(quote.amountToPay);
		}, 0);
	});
	this.totalQuotes();
}

function showErrorMessage(event, { id, amount }, purId) {
	const pay = event;
	if (pay > amount) {
		this.showNotification('El monto a pagar no debe superar el de la cuota', 'error');
	}
	if (pay < 0) {
		this.showNotification('El monto a pagar debe ser un valor positivo', 'error');
	}
	this.getQuoteData(event, id, purId);
	this.quoteError = !pay || pay < 0 || pay > amount;
}

function totalQuotes() {
	const newTotal = this.purchases.reduce(
		(accum, purchase) =>
			accum +
			purchase.caDocument.details.reduce(
				(accumD, detail) =>
					accumD +
					(detail.amountToPay !== 'NaN' ? this.roundInNumber(detail.amountToPay) : 0),
				0
			),
		0
	);
	this.totalAmount = Number.parseFloat(newTotal).toFixed(2);
	this.model.total = this.totalAmount;
}

function totalToPay() {
	return this.roundInNumber(
		this.purchases.reduce(
			(accum, purchase) =>
				accum + this.roundInNumber(purchase.amount - purchase.dueAmount),
			0
		)
	);
}

function validTotal() {
	const valid = Number(this.totalAmount) > Number(this.model.total);
	if (valid) {
		this.showNotification(
			'La suma de las cuotas a pagar no debe ser mayor al total.',
			'error'
		);
	}
	return valid;
}

function iconColor({ status }) {
	if (status === 2) {
		return 'warning';
	}
	return status === 3 ? 'success' : 'error';
}

function data() {
	return {
		bankAccountings: [],
		model: {
			bankAccountId: null,
			paymentType: 0,
			subsidiaryId: null,
			total: 0,
			warehouseId: null,
		},
		paymentCode: 'efectivo',
		paymentTypes: [],
		purchases: [],
		quoteError: false,
		totalAmount: 0,
		transaction: {
			bankAccountId: null,
			dateReference: '',
			documentNumber: '',
			flagForm: null,
			reference: '',
			urlImage: '',
		},
		openNtc: false,
		documentNtc: null,
		purchaseTransactions: {},
		purchaseInputsVisible: {},
		cashs: [],
	};
}

export default {
	name: 'fees-to-pay-form',
	components: {
		appDateSelect,
		appSelect,
		bankDepositForm,
		checkForm,
		modalSidebarButton,
		purchasesPaymentForm,
		modalSelectNtc,
	},
	computed: {
		accountingActive,
		isAdvancePaymentImport,
		isCardPaymentImport,
		isCashPayment,
		isCheckPaymentImport,
		isDepositPaymentImport,
		isDifferentCash,
		totalToPay,
		validTotal,
		totalQuotesAmount() {
			const hasZeroAmount = this.purchases
				.map((purchase) =>
					purchase.caDocument.details.reduce(
						(acc, det) => acc + Number(det.amountToPay),
						0
					)
				)
				.reduce((total, sum) => total + sum, 0);
			return !Number(this.model.total) === hasZeroAmount;
		},
	},
	created,
	data,
	methods: {
		initPurchaseTransactions,
		close,
		getData,
		setData,
		getQuoteData: debounce(getQuoteData),
		getTransactionData,
		iconColor,
		isCompletePayment,
		loadResources,
		save,
		setBankAccountData,
		setPurchaseField,
		setPurchasePaymentData,
		setQuotePaymentDate,
		setQuoteData,
		setQuotes,
		showErrorMessage,
		normalizeDateOnly,
		togglePurchaseInputs,
		totalQuotes,
		getDataTotal: debounce(getDataTotal),
		openListNtc() {
			this.openNtc = !this.openNtc;
		},
		addDocNtc(row) {
			this.documentNtc = row;
			this.getDataTotal({ model: 'total', value: row.amount });
			this.openListNtc();
		},
		async loadCash() {
			try {
				const { data: response } = await this.$httpSales.get('cash');
				this.cashs = response;
				this.model.cashId = this.$userInfo.cashId;
			} catch (error) {
				this.showGenericError();
			}
		},
	},
	props: {
		currency: {
			type: String,
		},
		currencySymbol: {
			type: String,
		},
		purchase: {
			default: () => {},
			type: Object,
		},
		purchasesData: {
			default: () => [],
			type: Array,
		},
		supplierId: {
			type: [Number, String],
		},
		transactionData: {
			default: () => {},
			type: Object,
		},
		typeDocuments: {
			type: Array,
		},
		subsidiaries: {
			default: () => [],
			type: Array,
		},
		warehouses: {
			default: () => [],
			type: Array,
		},
		isLoading: Boolean,
		isDetailImportMode: {
			default: false,
			type: Boolean,
		},
	},
};
</script>
<style lang="scss" scoped>
.status-label {
	font-size: size(small);
	color: color(paginationText);
	font-family: font(oepn-regular);
}

.label-text {
	color: color(paginationText);
	font-family: font(oepn-regular);
	font-size: size(medium);
}
</style>
