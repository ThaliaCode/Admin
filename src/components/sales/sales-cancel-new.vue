<template>
	<modal-items
		:title="titleModal"
		name-action="Aceptar"
		show-slot
		:disabled="
			isLoading || !commentary || (showBalance && !showBalanceCash && showTransactionBank)
		"
		@close-modal="$emit('cancel-button-clicked')"
		@action-modal="cancelSale"
	>
		<v-layout row justify-center v-if="isCreditNote">
			<v-flex xs10>
				<v-alert :value="true" type="warning">
					Las notas de crédito no pueden ser anuladas.
				</v-alert>
			</v-flex>
		</v-layout>
		<v-layout wrap px-4 py-3 class="sales-cancel-new">
			<v-flex xs12 v-if="sale && (isListSale ? documentSelect !== 'NTC' : true)">
				<v-layout wrap>
					<v-flex xs12 v-if="validSale.flagCancel && isPeru">
						<div class="layout">
							<v-icon>info</v-icon>
							<p class="ml-2">
								Los medios de pago relacionados al documento serán revertidos
								automáticamente
							</p>
						</div>
					</v-flex>
					<v-flex xs6 v-if="sale.customer">
						<p class="mb-0 sales-cancel-new--caption">Cliente</p>
						<p v-if="sale.customer.dni">
							{{ sale.customer.name }} {{ sale.customer.lastname }}
						</p>
						<p v-if="sale.customer.ruc">{{ sale.customer.rzSocial }}</p>
					</v-flex>
					<v-flex xs6>
						<p class="mb-0 sales-cancel-new--caption">Monto Total</p>
						<p>{{ sale.currencySymbol }} {{ sale.amount }}</p>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 v-if="!isEcuador && validSale.flagCancel && false" mb-3>
				<app-select
					label="Motivo de Anulación"
					item-text="description"
					item-value="id"
					model="typeCatalogSunatId"
					:item="typeCatalogSunatId"
					:items="catalogSunat"
					:return-object="false"
					@input="onInput"
				>
				</app-select>
			</v-flex>
			<v-flex xs12 mb-3 v-if="false">
				<app-select
					item-text="name"
					item-value="id"
					label="Método de Pago"
					:disabled="!validSale.flagCancel"
					:items="paymentMethods"
					:item="paymentMethodId"
					@input="getPaymentMethod"
				/>
			</v-flex>
			<v-flex xs12 v-if="!isEcuador && false" mb-3>
				<v-layout wrap v-if="showTypePayment">
					<v-flex xs12 white py-3>
						<v-layout wrap class="justify-center">
							<v-flex xs12>
								<v-select
									chips
									clearable
									solo
									multiple
									color="success"
									item-text="name"
									hide-details
									:disabled="!validSale.flagCancel"
									label="Seleccione tipos de pago"
									:items="typePayments"
									v-model="selectedCards"
								>
									<template slot="selection" slot-scope="data">
										<v-chip
											color="info"
											outline
											:selected="data.selected"
											close
											@input="remove(data.item)"
										>
											<strong>{{ data.item.name }}</strong
											>&nbsp;
										</v-chip>
									</template>
								</v-select>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<v-layout
							wrap
							align-center
							v-for="(cards, indexCards) in selectedCardsFn"
							:key="indexCards"
							pt-3
							pb-2
							px-5
						>
							<v-flex xs4 px-2>
								<label>{{ cards.name }}</label>
							</v-flex>
							<v-flex xs3>
								<v-text-field
									hide-details
									type="number"
									readonly
									v-model.number="cards.paid"
									class="filter-select shadow-inset"
									@input="updatePayAmounts"
								></v-text-field>
							</v-flex>
							<v-flex xs12 pt-4>
								<v-divider></v-divider>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-layout wrap px-3 pt-4 v-else>
					<v-flex xs6>
						<v-layout wrap align-center>
							<v-flex xs6>
								<span class="body-1">Número de cuotas:</span>
							</v-flex>
							<v-flex xs6>
								<v-text-field
									hide-details
									single-line
									placeholder="00"
									type="number"
									:disabled="!validSale.flagCancel"
									v-model.number="quotesNumber"
									class="filter-select shadow-inset"
									@input="addFees"
								></v-text-field>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<v-layout mt-3 pl-5 v-for="(fee, indexQ) in fees" :key="indexQ">
							<v-flex xs2 pt-4>
								<span>Cuota - {{ indexQ + 1 }}</span>
							</v-flex>
							<v-flex xs3 mr-5>
								<label class="caption">Monto a Pagar</label>
								<v-text-field
									hide-details
									single-line
									placeholder="00"
									type="number"
									:disabled="!validSale.flagCancel"
									v-model.number="fee.amount"
									class="filter-select shadow-inset"
								></v-text-field>
							</v-flex>
							<v-flex xs4>
								<app-date-mask
									:id="`${indexQ}-date`"
									label="Fecha de Pago"
									:disabled="!validSale.flagCancel"
									v-model="fee.dateWithOutFormat"
									@format-date="
										setValue({
											model: 'expirationDate',
											value: $event,
											index: indexQ,
										})
									"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12>
				<v-text-field
					id="comment"
					class="textarea-content filter-select shadow-inset mt-3 sales-cancel-new--textarea"
					label="Comentario"
					textarea
					hide-details
					v-model="commentary"
				></v-text-field>
			</v-flex>
			<v-flex v-if="showBalance === true">
				<p class="mb-0 error--text bold" v-if="!showBalanceCash">
					La caja no cubre el monto de transacciones, no puede ser anulado.
				</p>
			</v-flex>
			<v-layout column wrap v-if="showBalance === true">
				<v-flex class="error--text bold" v-if="!showBalanceCash">
					Actualmente la caja de origen del documento, no cuenta el saldo para hacer el
					egreso del monto , seleccione una caja destino:
				</v-flex>
				<v-layout align-center>
					<v-flex xs5 mt-2 mb-2>
						<app-select
							item-text="name"
							item-value="id"
							label="Seleccione caja"
							:items="cashs"
							@input="setDataCash"
							:item="cashId"
							model="cashId"
						/>
					</v-flex>
					<v-flex xs5 mt-3 ml-3>
						<span class="primary--text bold">Saldo:</span>
						{{ balanceCash | formatNumber }}
					</v-flex>
				</v-layout>
			</v-layout>
			<v-flex xs12>
				<v-checkbox
					label="Actualizar stock de productos?"
					v-model="flagKardex"
					:disabled="checkDisabled"
				>
				</v-checkbox>
			</v-flex>
		</v-layout>
	</modal-items>
</template>
<script>
import modalItems from '@/components/shared/modal-items';

import { format } from 'date-fns';
import helper from '@/shared/helper';
import lib from '@/shared/lib';

const { distributeAmount } = lib;
const { formatDate, exactDate } = helper;

function data() {
	const currentDate = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
	return {
		balanceCash: null,
		cashs: [],
		cashId: null,
		cashPay: 0,
		catalogSunat: [],
		typeCatalogSunatId: null,
		commentary: `${
			this.documentSelect === 'NTC' ? 'Nota de Crédito' : 'Venta'
		} anulada por ${this.$userInfo.name} ${this.$userInfo.lastname} el ${currentDate}`,
		isLoading: false,
		fees: [],
		flagKardex: true,
		paymentMethods: [],
		paymentMethodId: 1,
		quotesNumber: 0,
		selectedCards: [],
		typePayments: [],
		showBalanceCash: false,
		transactions: [],
		transactionsBank: [],
	};
}

async function cancelSale() {
	if (this.regularizeSale) {
		const body = {
			flagKardex: this.flagKardex,
		};
		this.$emit('set-regularize-sale', body);
		return;
	}
	this.isLoading = true;
	const typeDocument =
		this.sale && this.sale.typeDocument ? this.sale.typeDocument.code : '';
	let url = '';
	let body = {};

	if (this.isEcuador) {
		url = `sale-documents/${this.saleId}/cancel`;
	} else {
		url =
			this.validSale.flagCancel && typeDocument !== 'NTC'
				? `sale-documents/${this.saleId}/cancel`
				: 'summary-unsubscribe';
	}

	if (typeDocument === 'NDD') {
		body = {
			commentary: this.commentary,
			date: exactDate(this.date, 'YYYY-MM-DD'),
			cashId: this.cashId,
		};
	} else if (this.validSale.flagCancel && typeDocument !== 'NTC') {
		body = {
			commentary: this.commentary,
			flagKardex: this.flagKardex,
			// typeCatalogSunatId: this.typeCatalogSunatId || null,
			// paymentMethodId: this.paymentMethodId || null,
			// detailsPayments: this.paymentMethodId === 1 ? [] : this.quotes(),
		};
	} else {
		body = {
			date: exactDate(this.date, 'YYYY-MM-DD'),
			documentsRelated: [this.saleId],
			flagTypeReturn: this.flagKardex ? 1 : 0,
			commentary: this.commentary,
			cashId: this.showBalance ? this.cashId : undefined,
		};
	}
	try {
		if (typeDocument === 'NDD') {
			await this.$httpSales.delete(`sale-documents/${typeDocument}/${this.saleId}`, {
				data: body,
			});
		} else {
			await this.$httpSales.post(url, body);
		}

		const message =
			this.isListSale && this.documentSelect === 'NTC' ? 'Nota de crédito' : 'Venta';
		this.showNotification(`${message} anulada correctamente.`);
		this.$emit('sales-canceled', this.saleId);
	} catch (error) {
		const err = error.data.message;
		if (err === 'PAYMENTS_RELATED_TO_SALE') {
			this.showNotification(error.data.messageError, 'error');
		} else if (err === 'SALE_NOT_FINISHED') {
			this.showNotification('Esta venta ya ha sido anulada', 'warning');
		} else if (
			err === 'NOT_CANCEL_SALES_PARTIAL_ERROR' ||
			err === 'DOCUMENT_DELIVERY_TIME_EXCEEDED'
		) {
			this.showGenericError(error.data.messageError);
		} else {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}

function allowedCodes({ code }) {
	return ['01', '02', '03'].includes(code);
}

async function created() {
	this.flagKardex = this.status !== 'PXEN';
	const request = [
		this.getTypePayments('sales'),
		this.$httpSales.get('catalog-sunat-details-list/09'),
		this.getPaymentsMethods(),
		this.$httpSales.get('cash', { params: { flagActive: 1 } }),
	];
	const [
		{ data: typePayments },
		{ data: catalogSunat },
		{ data: paymentMethods },
		{ data: cashs },
	] = await Promise.all(request);
	this.typePayments = typePayments.reduce((acum, tp) => {
		if (tp.paymentType.code === 'efectivo') {
			const newTp = { ...tp.paymentType };
			newTp.paid = 0;
			acum.push(newTp);
		}
		return acum;
	}, []);
	this.selectedCards = this.typePayments.length > 0 ? [{ ...this.typePayments[0] }] : [];
	if (catalogSunat && catalogSunat.length > 0) {
		this.catalogSunat = catalogSunat.filter(allowedCodes);
		this.typeCatalogSunatId = this.catalogSunat[0].id;
	}
	this.paymentMethods = paymentMethods;
	this.cashs = cashs;
	if (this.flagOutbox && this.sale.accTransactions?.length) {
		const accTransactions = this.sale.accTransactions;
		this.transactions = accTransactions.filter((tx) => tx.accountTypeId === 1);
		this.transactionsBank = accTransactions.filter((tx) => tx.accountTypeId === 2);
	} else {
		this.transactions = this.sale.transactions || [];
		this.transactionsBank = this.sale.transactionsBank || [];
	}
}

function showBalance() {
	const symbol = this.sale.currency === 'PEN' ? 'PEN' : 'USD';
	if (this.amount > this.sale.cash.balance[symbol]) {
		if (this.sale.payment.code === 'CREDITO') {
			return false;
		} else if (this.sale.payment.code === 'CONTADO') {
			if (this.transactions.length === 1) {
				if (this.transactions[0].typePayment.code === 'efectivo') {
					return true;
				}
				return 'not-action';
			}
			return false;
		}
		return 'not-action';
	}
	return false;
}

function onInput(model) {
	this[model] = model.value;
}

function getPaymentMethod({ value }) {
	this.paymentMethodId = value.id;
	this.quotesNumber = value.code === 'CREDITO' ? 1 : 0;
	if (this.quotesNumber) {
		this.addFees();
	}
}

function showTypePayment() {
	return this.paymentMethodId === 1;
}

function addFees() {
	this.fees = [];
	for (let i = 1; i <= this.quotesNumber; i += 1) {
		if (this.quotesNumber) {
			const amount = this.getFeesAmounts(i);
			this.fees.push({
				amount,
				dateWithOutFormat: null,
				expirationDate: '',
				invalidDate: false,
			});
		} else {
			this.fees = [];
		}
	}
	if (this.fees.length > 0) {
		const currentDate = format(new Date(), 'YYYY-MM-DD');
		const currentDateWithOutFormat = format(new Date(), 'DD/MM/YYYY');
		this.fees[0].dateWithOutFormat = currentDateWithOutFormat;
		this.fees[0].expirationDate = currentDate;
	}
}

function getFeesAmounts(currentQuote) {
	const truncAmounts = Math.trunc(this.amount / this.quotesNumber);
	if (this.quotesNumber === 1) {
		return this.amount;
	} else if (currentQuote !== this.quotesNumber) {
		return truncAmounts;
	}
	const lastQuote = this.amount - truncAmounts * (currentQuote - 1);
	return Number(lastQuote.toFixed(2));
}

function setValue({ model, value, index }) {
	this.$set(this.fees[index], model, value);
}

function quotes() {
	return this.fees.map((fee) => {
		const newFee = { ...fee };
		delete newFee.dateWithOutFormat;
		delete newFee.invalidDate;
		newFee.amount = -fee.amount;
		return newFee;
	});
}

function selectedCardsFn() {
	let newSelectedCards = [...this.selectedCards];
	if (this.selectedCards.length > 0) {
		const divider = this.selectedCards.length;
		newSelectedCards = this.selectedCards.map(distributeAmount(this.amount, divider));
		this.setCashAndCreditAmount(newSelectedCards);
	}
	return newSelectedCards;
}

function setCashAndCreditAmount(collection) {
	const cashPayVal = collection.find(
		(c) => c.code === 'efectivo' || c.code === 'cash-dollars'
	);
	this.cashPay = cashPayVal ? cashPayVal.paid : 0;
}

function updatePayAmounts() {
	this.setCashAndCreditAmount(this.selectedCardsFn);
}

function getTransactionId(typePayments) {
	return typePayments.map((st) => st.id);
}

function getTransactions(typePayments) {
	const self = this;
	return typePayments.map((st) => {
		const newSt = {
			amount: -st.paid,
			currency: self.currency,
			paymentAmount: -st.paid,
			paymentDate: format(new Date(), 'YYYY-MM-DD'),
			typePaymentId: st.id,
		};
		return newSt;
	});
}

function disabledCancel() {
	return (
		(this.paymentMethodId === 1 && this.selectedCards.length === 0) ||
		(this.paymentMethodId === 2 && this.fees.length === 0) ||
		(this.paymentMethodId === 2 && this.fees.some((f) => !f.expirationDate)) ||
		(this.paymentMethodId === 2 &&
			this.fees.reduce((acum, fee) => Number(acum) + Number(fee.amount), 0) !==
				this.amount)
	);
}

function checkDisabled() {
	return this.status === 'PXEN';
}

function setDataCash({ model, value }) {
	this[model] = value.id;
	this.validatedBalanceCash(value);
}

function validatedBalanceCash(cash) {
	const amountCash = this.transactions.reduce((acum, trans) => { 
		if (trans.typePayment.code === 'efectivo') {
			return acum + trans.amount;
		}
		return acum;
	}, 0);

	if (this.sale.currency === 'PEN') {
		this.showBalanceCash = amountCash <= cash.balance.PEN;
		this.balanceCash = cash.balance.PEN;
	} else {
		this.showBalanceCash = amountCash <= cash.balance.USD;
		this.balanceCash = cash.balance.USD;
	}
}

function showTransactionBank() {
	return this.transactionsBank.length > 0;
}

export default {
	name: 'sales-cancel-new',
	components: {
		modalItems,
	},
	computed: {
		showTransactionBank,
		showBalance,
		disabledCancel,
		selectedCardsFn,
		showTypePayment,
		checkDisabled,
	},
	created,
	data,
	methods: {
		addFees,
		cancelSale,
		getFeesAmounts,
		getPaymentMethod,
		getTransactionId,
		getTransactions,
		onInput,
		quotes,
		setCashAndCreditAmount,
		setValue,
		updatePayAmounts,
		setDataCash,
		validatedBalanceCash,
	},
	props: {
		titleModal: String,
		amount: [Number, String],
		currency: String,
		date: [Date, Number, String],
		isCreditNote: {
			default: false,
			type: Boolean,
		},
		saleId: {
			type: [String, Number],
		},
		validSale: {
			default: () => {},
			type: Object,
		},
		status: [Number, String],
		sale: {
			default: () => {},
			type: Object,
		},
		documentSelect: String,
		isListSale: {
			type: Boolean,
			default: false,
		},
		regularizeSale: {
			type: Boolean,
			default: false,
		},
	},
};
</script>
<style lang="scss" scoped>
.sales-cancel-new {
	&--caption {
		color: map-get($colors, brown-grey);
		font-size: 13px;
	}
}

.bold {
	font-family: map-get($fonts, lato-bold);
	font-size: 13px;
}
</style>
