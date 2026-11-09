<template>
	<div>
		<v-form>
			<v-layout wrap pa-3>
				<v-flex xs12 sm6 pr-2>
					<app-input-text
						type="number"
						:label="`Monto ${currencySymbol}`"
						:max="totalToPay"
						min="0"
						model="number"
						:text="amortization.number"
						@input="getData"
					/>
				</v-flex>
				<v-flex xs12 sm6 pl-2>
					<app-select
						:item="amortization.typePaymentId"
						item-text="name"
						item-value="id"
						:items="typePayments"
						label="Tipo de Pago"
						model="typePaymentId"
						return-object
						@input="getData"
					/>
				</v-flex>
				<v-flex xs12 v-if="isDifferentCash" mt-3>
					<purchases-payment-form
						:bank-account-id="transaction.bankAccountId"
						:card-id="amortization.typePaymentId"
						:date-reference="transaction.additionalInformation.dateReference"
						:document-number="transaction.documentNumber"
						:flag-form="transaction.flagForm"
						:reference="transaction.reference"
						:url-image="transaction.urlImage"
						@get-data="getTransactionData($event, transaction)"
						:is-sale="isSale"
					/>
				</v-flex>
			</v-layout>
			<v-layout wrap px-3 mb-3>
				<v-flex xs12 pa-2 primary lighten-1 white--text class="body-2">
					# DOC: {{ sale.saleDocument.documentNumber }}
				</v-flex>
				<v-flex xs12 py-2>
					<v-layout wrap pb-3>
						<v-flex xs2 text-xs-center pr-1>
							<span>Estado</span>
						</v-flex>
						<v-flex xs2 text-xs-center px-1>
							<span>Total</span>
						</v-flex>
						<v-flex xs2 text-xs-center px-1>
							<span>Pagado</span>
						</v-flex>
						<v-flex xs2 text-xs-center px-1>
							<span>A Pagar</span>
						</v-flex>
						<v-flex xs4 pl-1>
							<span>Fecha de Pago</span>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 py-2 v-for="quote in sale.details" :key="quote.id">
					<v-layout wrap>
						<v-flex xs2 text-xs-center pr-1>
							<p>
								<v-tooltip top>
									<v-icon slot="activator" :color="iconColor(quote)">
										radio_button_checked
									</v-icon>
									<span>{{ quote.statusName }}</span>
								</v-tooltip>
							</p>
						</v-flex>
						<v-flex xs2 px-1>
							<v-text-field
								type="number"
								class="filter-select"
								label="Deuda"
								v-model="quote.amount"
								readonly
								disabled
							>
							</v-text-field>
						</v-flex>
						<v-flex xs2 px-1>
							<v-text-field
								class="filter-select"
								label="Pagado"
								:max="quote.amount"
								min="0"
								readonly
								disabled
								type="number"
								v-model.number="quote.amountPayment"
							>
							</v-text-field>
						</v-flex>
						<v-flex xs2 px-1>
							<v-text-field
								class="filter-select show-error"
								label="Monto Pagar"
								:max="quote.amount"
								min="0"
								:rules="[(v) => v < quote.amount + 1 || 'Error :(']"
								error
								:readonly="quote.status === 3"
								:disabled="quote.status === 3"
								type="number"
								@input="showErrorMessage(quote, sale.id)"
								v-model="quote.amountToPay"
							>
							</v-text-field>
						</v-flex>
						<v-flex xs4 pl-1>
							<v-menu
								lazy
								v-model="quote.menu"
								transition="scale-transition"
								offset-y
								disabled
								readonly
								full-width
							>
								<v-text-field
									slot="activator"
									label="Fecha Exp."
									v-model="quote.expirationDate"
									append-icon="event"
									class="filter-select-calendar-calendar-requirement"
									readonly
									disabled
								></v-text-field>
								<v-date-picker
									v-model="quote.expirationDate"
									readonly
									disabled
									no-title
									scrollable
								>
								</v-date-picker>
							</v-menu>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="disabled"
					@cancel-button-clicked="closeModal"
					@accept-button-clicked="save"
				/>
			</section>
		</v-form>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import purchasesPaymentForm from '@/components/purchases/purchases-payment-form';
import { format } from 'date-fns';

function created() {
	this.loadData();
}

function closeModal() {
	this.transaction = {
		bankAccountId: null,
		additionalInformation: {
			dateReference: null,
		},
		documentNumber: '',
		flagForm: null,
		reference: '',
		urlImage: '',
	};
	this.totalAmount = 0;
	this.$emit('close-modal');
}

function disabled() {
	return (
		this.isLoading || this.quoteError || this.validTotal || !this.totalAmount
	);
}

function getData({ model, value }) {
	this.amortization[model] = model !== 'total' ? value.id : value;
	if (model === 'typePaymentId') {
		this.transaction.bankAccountId = null;
		this.typePaymentCode = value.code;
		this.transaction.flagForm = value.flagForm;
	}
	if (model === 'number') {
		this.setPayments(value);
	}
}

function getQuoteData(value, id, dataId) {
	if (this.sale.documentId === dataId && this.sale.details.length > 0) {
		this.sale.details = this.sale.details.map((detail) => {
			const newDetail = { ...detail };
			if (detail.id === id) {
				newDetail.amountToPay = value;
			}
			return newDetail;
		});
	}
	this.totalQuotes();
}

function getTransactionData({ model, newValue }, transaction) {
	if (model === 'dateReference') {
		this.$set(transaction.additionalInformation, model, newValue);
	} else {
		this.$set(transaction, model, newValue);
	}
}

function iconColor({ status }) {
	if (status === 2) {
		return 'warning';
	}
	return status === 3 ? 'success' : 'error';
}

function isCompletePayment(quote) {
	return quote.amountToPay + quote.amountPayment === quote.amount;
}

function isDifferentCash() {
	return this.typePaymentCode !== 'efectivo';
}

function loadData() {
	this.amortization.number = this.totalToPay;
	this.amortization.accountBankId = this.bankAccounts[0].id;
	this.amortization.typePaymentId = this.typePayments[0].id;
	const newSale = { ...this.saleData };
	newSale.details = newSale.details.map((detail) => {
		const newDetail = { ...detail };
		const dateSplit = detail.expirationDate.split('T');
		newDetail.expirationDate = dateSplit[0];
		newDetail.amountToPay = this.roundInNumber(
			detail.amount - detail.amountPayment
		);
		return newDetail;
	});
	this.sale = { ...newSale };
	this.setPayments(this.totalToPay);
	this.currency = this.sale.saleDocument.currency;
	this.currencySymbol = this.sale.saleDocument.currencySymbol;
	this.customerId = this.sale.saleDocument.customerId;
}

async function save() {
	console.log(this.transaction);
	const payment = {
		additionalInformation: {
			paymentDate: format(this.$today(), 'YYYY-MM-DD'),
			...this.transaction.additionalInformation,
		},
		bankAccountId: this.transaction.bankAccountId || null,
		documentNumber: this.transaction.documentNumber,
		reference: this.transaction.reference,
		urlImage: this.transaction.urlImage,
		currency: this.currency,
		customerId: this.customerId,
		documents: [
			{
				salDocumentId: this.sale.documentId,
				caDocumentId: this.sale.id,
				amount: this.sale.amount,
				payments: this.sale.details.reduce((accum, detail) => {
					if (detail.status !== 3) {
						const newAccum = {};
						newAccum.amount = detail.amount;
						const isTotalPayment = isCompletePayment(detail);
						if (isTotalPayment) {
							if (detail.amountToPay < detail.amount) {
								newAccum.amountPayment = detail.amountToPay;
							} else {
								newAccum.amountPayment = detail.amount;
							}
						} else {
							newAccum.amountPayment = detail.amountToPay;
						}
						newAccum.expirationDate = detail.expirationDate;
						newAccum.id = detail.id;
						newAccum.observations = 'Amortizaciones';
						accum.push(newAccum);
					}
					return accum;
				}, []),
			},
		],
	};
	const documentsToPay = { ...payment };
	documentsToPay.documents = payment.documents.filter(
		(d) => d.payments.length > 0
	);
	const url = `amortizations-multiple/${this.amortization.typePaymentId}`;
	if (documentsToPay.documents.length > 0) {
		try {
			await this.$httpSales.post(url, documentsToPay);
			this.showNotification('Amortización realizada correctamente');
			this.$emit('amortization-paid');
		} catch (err) {
			if (err.status === 400) {
				if (err.data.message === 'BANK_ACCOUNT_NOT_FOUND') {
					this.showGenericError('Seleccionar cuenta bancaria');
				} else if (err.data.message === 'SALE_NOT_ALLOWED') {
					this.showGenericError(
						'La cuota que intenta pagar se encuentra con el estado de pago: "Pagado"'
					);
				}
			} else {
				this.showGenericError();
			}
		}
	} else {
		this.showNotification('No hay amortizaciones por realizar.', 'info');
	}
}

function setPayments(total) {
	if (this.sale && this.sale.details) {
		let newTotal = total;
		const resultPerQuote = this.sale.details.reduce((acumQ, quote) => {
			const newQuote = quote;
			if (quote.status === 3) {
				return acumQ;
			}
			const op = acumQ - (newQuote.amount - newQuote.amountPayment);
			if (op >= 0) {
				newQuote.amountToPay = this.roundInNumber(
					newQuote.amount - newQuote.amountPayment
				);
				return op;
			}
			newQuote.amountToPay = acumQ === 0 ? 0 : this.roundInNumber(acumQ);
			return 0;
		}, newTotal);
		newTotal = resultPerQuote;
		this.totalQuotes();
	}
}

function showErrorMessage({ id, amountToPay, amount }, dataId) {
	if (amountToPay > amount) {
		this.showNotification(
			'El monto a pagar no debe superar el de la cuota',
			'error'
		);
	}
	if (amountToPay < 0) {
		this.showNotification(
			'El monto a pagar debe ser un valor positivo',
			'error'
		);
	}
	this.getQuoteData(amountToPay, id, dataId);
	this.quoteError = !amountToPay || amountToPay < 0 || amountToPay > amount;
}

function totalQuotes() {
	this.totalAmount = this.sale.details.reduce(
		(acum, detail) => acum + this.roundInNumber(detail.amountToPay),
		0
	);
}

function validTotal() {
	const valid = Number(this.totalAmount) > Number(this.amortization.number);
	if (valid) {
		this.showNotification(
			'La suma de las cuotas a pagar no debe ser mayor al total.',
			'error'
		);
	}
	return valid;
}

function data() {
	return {
		amortization: {
			number: 0,
			amount: 0,
			typePaymentId: 0,
		},
		currency: '',
		currencySymbol: '',
		customerId: 0,
		isLoading: false,
		quoteError: false,
		sale: {},
		totalAmount: 0,
		transaction: {
			bankAccountId: null,
			additionalInformation: {
				dateReference: null,
			},
			documentNumber: '',
			flagForm: null,
			reference: '',
			urlImage: '',
		},
		typePaymentCode: '',
	};
}

export default {
	name: 'amortizations-form',
	components: {
		modalSidebarButton,
		purchasesPaymentForm,
	},
	computed: {
		disabled,
		isDifferentCash,
		validTotal,
	},
	created,
	data,
	methods: {
		closeModal,
		getData,
		getQuoteData,
		getTransactionData,
		iconColor,
		loadData,
		save,
		setPayments,
		showErrorMessage,
		totalQuotes,
	},
	props: {
		bankAccounts: {
			default: () => [],
			type: Array,
		},
		saleData: {
			default: () => {},
			type: Object,
		},
		totalToPay: Number,
		typePayments: {
			default: () => [],
			type: Array,
		},
		isSale: {
			default: false,
			type: Boolean,
		},
	},
};
</script>
