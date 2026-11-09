<template>
	<div>
		<v-form method="post" @click.prevent="save" class="mb-5 form-height">
			<v-layout wrap pa-3>
				<v-flex xs12 sm6 px-2>
					<app-input-text
						type="number"
						:label="`Monto ${currencySymbol}`"
						:max="totalToPay"
						min="0"
						model="total"
						:text="model.total"
						@input="getData"
					/>
				</v-flex>
				<v-flex xs12 sm6 px-2>
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
				<v-flex xs12 v-if="isDifferentCash" mt-3>
					<purchases-payment-form
						:bank-account-id="transaction.bankAccountId"
						:card-id="model.paymentType"
						:date-reference="transaction.additionalInformation.dateReference"
						:document-number="transaction.documentNumber"
						:flag-form="transaction.flagForm"
						:reference="transaction.reference"
						:url-image="transaction.urlImage"
						@get-data="getTransactionData($event, transaction)"
					/>
				</v-flex>
			</v-layout>
			<v-layout wrap px-3 mb-3>
				<v-flex xs12 pa-2 primary lighten-1 white--text class="body-2">
					# DOC: {{ purchase.purchaseDocument.documentNumber }}
				</v-flex>
				<v-flex xs12 py-2 v-for="quote in purchase.details" :key="quote.id">
					<v-layout wrap justify-center>
						<v-flex xs1>
							<label class="caption">Estado</label>
							<p>
								<v-icon :color="iconColor(quote)">radio_button_checked</v-icon>
							</p>
						</v-flex>
						<v-flex xs2 pr-2>
							<app-input-text
								label="Total Deuda"
								model="amount"
								readonly
								:text="quote.amount"
								type="number"
							/>
						</v-flex>
						<v-flex xs2 px-2>
							<app-input-text
								label="Monto Pagado"
								:max="quote.amount"
								model="amountPayment"
								readonly
								:text="quote.amountPayment"
								type="number"
							/>
						</v-flex>
						<v-flex xs3 px-2>
							<app-input-text
								error-class
								label="Monto a Pagar"
								:max="quote.amount"
								min="0"
								:model="`${quote.id}`"
								:readonly="quote.status === 3"
								:rules="[(v) => v < quote.amount + 1 || 'Error :(']"
								:text="quote.amountToPay"
								type="number"
								@input="setQuoteData"
								@show-error="showErrorMessage($event, quote)"
							/>
						</v-flex>
						<v-flex xs4 pl-2>
							<app-date-select
								:date-formatted="
									quote.expirationDate | formatDate('YYYY-MM-DD')
								"
								label="Fecha de pago"
								readonly
							/>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="quoteError || validTotal || disabled"
					success-text="Pagar"
					@cancel-button-clicked="close"
					@accept-button-clicked="save"
				/>
			</section>
		</v-form>
	</div>
</template>

<script>
import appDateSelect from '@/components/shared/app-date-select';
import appSelect from '@/components/shared/app-select';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import purchasesPaymentForm from '@/components/purchases/purchases-payment-form';

function created() {
	if (this.id > 0) {
		this.loadResources();
		this.loadData();
	}
}

function accountingActive() {
	return this.paymentCode === 'deposito-bancario';
}

function close() {
	this.$emit('close');
}

function getData({ model, value }) {
	this.model[model] = model !== 'total' ? value.id : value;
	if (model === 'paymentType') {
		this.paymentCode = value.code;
		this.transaction = {
			bankAccountId: null,
			additionalInformation: {
				dateReference: null,
			},
			documentNumber: '',
			reference: '',
			urlImage: '',
		};
		this.transaction.flagForm = value.flagForm;
	}
	if (model === 'total') {
		this.setQuotes(value);
	}
}

function getQuoteData(value, id) {
	this.purchase.details = this.purchase.details.map((detail) => {
		const newDetail = { ...detail };
		if (detail.id === id) {
			newDetail.amountToPay = value;
		}
		return newDetail;
	});
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
	return this.paymentCode !== 'efectivo';
}

async function loadData() {
	({ data: this.purchase } = await this.$httpSales.get(
		`checking-accounts/${this.id}/purchase`
	));
	this.purchase = this.purchase || {};
	this.purchase.purchaseDocument = this.purchase.purchaseDocument || {};
	if (this.purchase.details) {
		this.purchase.details = this.purchase.details.map((detail) => {
			const newDetail = { ...detail };
			const toPay =
				this.roundInNumber(detail.amount) -
				this.roundInNumber(detail.amountPayment);
			newDetail.amountToPay = this.roundInNumber(toPay);
			return newDetail;
		});
		this.disabled = this.purchase.details.every((pd) => pd.status === 3);
	} else {
		this.purchase.details = [];
	}
	this.currency = this.purchase.purchaseDocument.currency;
	this.currencySymbol =
		(this.purchase.purchaseDocument &&
			this.purchase.purchaseDocument.currencySymbol) ||
		this.$userInfo.company.currencyDefault.symbol;
	this.model.total = this.totalToPay;
	this.totalQuotes();
}

async function loadResources() {
	const request = [
		this.$httpSales.get('bank-account'),
		this.getTypePayments('purchases'),
	];
	[{ data: this.bankAccountings }, { data: this.paymentTypes }] =
		await Promise.all(request);
	this.paymentTypes = this.paymentTypes.map((pt) => pt.paymentType);
	const typePayment = this.paymentTypes.find((pt) => pt.code === 'efectivo');
	this.model.paymentType = typePayment.id;
	this.paymentCode = typePayment.code;
}

function purchase(value) {
	if (value && value.details.length > 0) {
		value.details.forEach((det) => {
			const validate = Number(det.amountToPay) > det.amount;
			if (validate) {
				this.quoteError = validate;
				this.showNotification(
					'El monto a pagar no debe superar el de la cuota',
					'error'
				);
			}
		});
	}
}

function save() {
	const supplierId =
		this.purchase.purchaseDocument.supplierId ||
		this.purchase.additionalInformation.supplierId;
	const body = {
		moduleCode: 'CTAXPAG',
		additionalInformation: this.transaction.additionalInformation,
		bankAccountId: this.transaction.bankAccountId,
		documentNumber: this.transaction.documentNumber,
		reference: this.transaction.reference,
		urlImage: this.transaction.urlImage,
		description: 'Pago de cuotas pendientes',
		currency: this.currency,
		supplierId,
		documents: [
			{
				purDocumentId: this.id,
				caDocumentId: this.purchase.id,
				amount: this.purchase.amount,
				payments: this.purchase.details.reduce((accum, quote) => {
					if (quote.status && quote.status < 3) {
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
				}, []),
			},
		],
	};
	const paymentType = this.model.paymentType;
	this.$emit('save', { body, paymentType });
}

function setQuoteData({ model, value }) {
	const quoteId = Number(model);
	this.purchase.details = this.purchase.details.map((detail) => {
		const newDetail = { ...detail };
		if (detail.id === quoteId) {
			newDetail.amountToPay = Number(value);
		}
		return newDetail;
	});
}

function setQuotes(total) {
	let newTotal = total;
	const resultPerQuote = this.purchase.details.reduce((acumQ, quote) => {
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

function showErrorMessage(event, { id, amount }) {
	const pay = event.target.value;
	if (pay > amount) {
		this.showNotification(
			'El monto a pagar no debe superar el de la cuota',
			'error'
		);
	}
	if (pay < 0) {
		this.showNotification(
			'El monto a pagar debe ser un valor positivo',
			'error'
		);
	}
	this.getQuoteData(event.target.value, id);
	this.quoteError = !pay || pay < 0 || pay > amount;
}

function totalQuotes() {
	this.totalAmount = this.purchase.details.reduce(
		(accum, detail) => accum + this.roundInNumber(detail.amountToPay),
		0
	);
}

function totalToPay() {
	return this.purchase.amount;
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

function data() {
	return {
		bankAccountings: [],
		currency: '',
		currencySymbol: '',
		disabled: false,
		model: {
			paymentType: 0,
			total: 0,
		},
		paymentCode: '',
		paymentTypes: [],
		purchase: {
			details: [],
			purchaseDocument: {},
		},
		quoteError: false,
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
	};
}

export default {
	name: 'fees-per-purchase',
	components: {
		appDateSelect,
		appSelect,
		modalSidebarButton,
		purchasesPaymentForm,
	},
	computed: {
		accountingActive,
		isDifferentCash,
		totalToPay,
		validTotal,
	},
	created,
	data,
	methods: {
		close,
		getData,
		getQuoteData,
		getTransactionData,
		iconColor,
		isCompletePayment,
		loadData,
		loadResources,
		save,
		setQuoteData,
		setQuotes,
		showErrorMessage,
		totalQuotes,
	},
	props: {
		id: {
			type: [Number, String],
		},
	},
	watch: {
		purchase,
	},
};
</script>
