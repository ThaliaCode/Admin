<template>
	<div class="payment">
		<v-layout wrap pl-4 my-2 justify-space-between>
			<v-flex>
				<h3 class="subheading primary--text open-bold">Total venta: {{ amountSale }}</h3>
			</v-flex>
			<v-flex>
				<h3 class="body-2 open-bold">Pagado: {{ updatePay.paid | round }}</h3>
			</v-flex>
			<v-flex>
				<h3 class="body-2 open-bold">Pendiente: {{ updatePay.rest | round }}</h3>
			</v-flex>
			<v-flex v-if="totalAdvance && totalAdvance > 0">
				<h3 class="body-2 open-bold">T. Anticipo: {{ totalAdvance | round }}</h3>
			</v-flex>
			<v-flex>
				<h3 class="body-2 open-bold">Vuelto: {{ updatePay.change | round }}</h3>
			</v-flex>
		</v-layout>
		<v-layout wrap pl-4 my-2 justify-space-between v-if="detraction.percentage">
			<v-flex>
				<h4 class="subheading primary--text open-bold">
					M. detracción ({{ detraction.percentage }}%):
					{{ detraction.amount | round }}
				</h4>
			</v-flex>
		</v-layout>
		<v-flex pl-4 my-2 v-if="totalSurcharge > 0">
			<h3 class="body-2 open-bold">Total Neto: {{ totalAmountNeto | round }}</h3>
		</v-flex>
		<v-flex xs5 pl-4 my-2 v-if="withholdingSale">
			<h3>
				<span class="subheading primary--text open-bold">
					{{ textWithholding }}
				</span>
				<span class="body-2 open-bold ml-1">
					{{ amountWithholding | round }}
				</span>
			</h3>
		</v-flex>
		<v-layout row>
			<v-flex xs6 mb-2 mt-1 pl-4 v-if="showValid">
				<v-checkbox
					class="label-switch"
					color="primary"
					hide-details
					label="¿Tiene retención de igv?"
					v-model="withholdingSale"
					:true-value="1"
					:false-value="0"
					@change="changeWithholding($event)"
				></v-checkbox>
				<v-flex v-if="withholdingSale" mt-1>
					<app-select
						label="Código de Retención SUNAT"
						item-text="description"
						item-value="id"
						model="idWithholding"
						:item="idWithholding"
						:items="listWithHolding"
					/>
				</v-flex>
			</v-flex>
			<v-flex wrap xs4 px-4 v-if="$userInfo.company.settings.flagTip">
				<app-input-text
					label="Recargo al Consumo"
					model="tip"
					:readonly="merchantId"
					:text="tip"
					@input="setTip"
				/>
			</v-flex>
		</v-layout>
		<v-flex xs12>
			<v-alert type="error" v-model="showLimitTotal">
				<p class="mb-0">{{ textLimitAlert }}</p>
			</v-alert>
		</v-flex>
		<v-layout wrap my-4 pl-4 justify-start align-center>
			<v-flex xs4 class="body-1"> Forma de pago: </v-flex>
			<v-flex xs5>
				<v-radio-group
					row
					class="sale-radio"
					@change="resetPayment"
					v-model="modePaymentSelected"
				>
					<v-radio
						v-for="(t, index) in paymentsTypes"
						:key="index"
						:disabled="validateCreditPayment(t) || validatePayment(t) || t.disabled"
						:value="t.code"
						:label="t.name"
						color="success"
					></v-radio>
				</v-radio-group>
			</v-flex>
			<v-flex xs4>
				<span class="info--text" style="font-size: small">
					{{
						validateCreditPayment && !amountSale
							? 'No se puede realizar esta venta a credito porque el total es 0'
							: ''
					}}
				</span>
			</v-flex>
		</v-layout>
		<v-layout wrap>
			<v-flex xs12>
				<v-alert type="error" v-model="showAlert">
					<p class="mb-0">{{ alertMessage }}</p>
				</v-alert>
			</v-flex>
		</v-layout>
		<v-divider></v-divider>
		<v-layout v-if="isModeCash" wrap>
			<v-flex xs12 white py-3>
				<v-layout wrap class="justify-center">
					<v-flex xs10>
						<vue-multiselec
							ref="paymentSelector"
							placeholder="Seleccione tipos de pago"
							label="name"
							:close-on-select="false"
							:options="typePayments"
							:multiple="true"
							@remove="remove"
							@select="selectedCardsHandle"
							:value="selectedCards"
						></vue-multiselec>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12>
				<!-- {{ selectedCardsFn }} -->

				<v-layout
					wrap
					align-center
					v-for="(card, indexCards) in selectedCardsFn"
					:key="indexCards"
					pt-3
					pb-2
					px-5
				>
					<v-flex xs12 v-if="card.percentage">
						<v-layout class="wrapper-information" px-4 py-2>
							<v-flex xs1>
								<img src="/static/img/alert.svg" alt="alert" height="25" />
							</v-flex>
							<v-flex xs11>
								<p class="mb-0">
									Advertencia, se le recarga {{ card.percentage }}% al total por pago con
									{{ card.name }}
								</p>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs4 px-2>
						<label>{{ card.name }}</label>
					</v-flex>
					<v-flex xs3 v-if="card.code !== 'cntc'">
						<v-text-field
							hide-details
							type="number"
							v-model.number="card.paid"
							class="filter-select shadow-inset"
							@input="setCardValue(card, indexCards, $event)"
						></v-text-field>
					</v-flex>
					<v-flex xs3 v-else>
						<v-text-field
							hide-details
							type="number"
							readonly
							v-model.number="creditNote.amount"
							class="filter-select shadow-inset"
							@input="updatePayAmounts"
						></v-text-field>
					</v-flex>
					<v-flex xs2 ml-3 v-if="card.percentage">
						<v-text-field
							hide-details
							type="number"
							readonly
							label="Monto Adicional"
							v-model.number="card.amountPercentage"
							class="filter-select shadow-inset"
						></v-text-field>
					</v-flex>
					<v-flex xs2 text-xs-center v-if="isNotTypeCash(card)">
						<v-btn icon flat @click="openForm(card, indexCards)">
							<v-icon color="info">{{ card.icon }}</v-icon>
						</v-btn>
					</v-flex>
					<v-flex xs12>
						<bank-deposit-form
							:show-concept="false"
							:key="indexCards"
							v-show="isActiveForm(card, 'Deposit')"
							:code="card.code"
							:loading-img="loadingImg"
							:bank-account-id="card.deposit.bankAccountId"
							:bank-accounts="bankAccounts"
							:document-number="card.deposit.documentNumber"
							:date-reference="card.deposit.additionalInformation.dateReference"
							:url-image="card.deposit.urlImage"
							@get-data="setDepositData($event, indexCards)"
							@update-loading="updateLoading"
						/>
						<check-form
							v-if="isActiveForm(card, 'Check')"
							:code="card.code"
							:bank-account-id="card.check.bankAccountId"
							:bank-accounts="bankAccounts"
							:document-number="card.check.documentNumber"
							:date-reference="card.check.additionalInformation.dateReference"
							:reference="card.check.reference"
							@get-data="setCheckData($event, indexCards)"
							is-sale
						/>
						<card-form
							v-if="isActiveForm(card, 'Card')"
							:code="card.code"
							:bank-account-id="card.card.bankAccountId"
							:bank-accounts="bankAccounts"
							:document-number="card.card.documentNumber"
							@get-data="setCardData($event, indexCards)"
							is-sale
						/>
						<credit-note-form
							v-if="isActiveForm(card, 'Note')"
							:date="creditNote.date"
							:serie="creditNote.serie"
							:number="creditNote.number"
							:icon="icon"
							:validate-color="validateColor"
							:loading="noteLoading"
							:validate="noteValidated"
							:value-date="valueDate"
							@valid-note="validNote"
							@set-data="setNoteData"
						/>
					</v-flex>
					<v-flex xs12 pt-4>
						<v-divider></v-divider>
					</v-flex>
				</v-layout>

				<!-- <span style="font-size: 12px">
					{{selectedCardsFn}}
				</span> -->
			</v-flex>
		</v-layout>
		<v-layout
			v-else-if="!isModeCash && customer.flagGeneric"
			wrap
			class="my-4 px-5 d-flex justify-center"
		>
			<v-flex xs12 class="text-center pink--text">
				<span>Debe seleccionar a un cliente para crear una venta a crédito.</span>
			</v-flex>
		</v-layout>
		<v-layout wrap class="my-3 px-4" v-else>
			<v-flex xs12 mt-3>
				<proof-payment @add-proof-payment-image="proofImageArray" />
			</v-flex>
			<v-flex xs12 px-5 mb-3 v-if="!!getCustomerCreditLimitDays">
				<v-alert :value="true" type="warning">
					Máximo días de crédito para el cliente:
					{{ getCustomerCreditLimitDays }} días
				</v-alert>
			</v-flex>
			<v-flex xs12 px-5 mb-3 v-if="validateDateLimit">
				<v-alert :value="true" type="warning">
					La distribución de fecha seleccionada supera el limite de días de crédito. Por
					favor cambiar las fechas o reducir el numero de cuotas.
				</v-alert>
			</v-flex>
			<v-layout wrap align-end mb-3>
				<v-flex xs12>
					<span class="body-1">Número de cuotas:</span>
				</v-flex>
				<v-flex xs5 pr-4>
					<span v-show="!isPositiveInteger(quotesNumber)" class="pink--text caption">
						El número debe ser un entero positivo
					</span>
					<v-text-field
						hide-details
						single-line
						placeholder="00"
						type="number"
						v-model.number="quotesNumber"
						class="filter-select shadow-inset"
						@input="addFees"
					/>
				</v-flex>
				<v-flex xs5>
					<app-select
						label="Distribución de cuotas"
						item-text="text"
						item-value="value"
						:item="selectedDistribution"
						:items="feesDistribution"
						:return-object="false"
						v-model="selectedDistribution"
						@input="changeDistributionDates"
					>
					</app-select>
				</v-flex>
			</v-layout>
			<v-layout mt-3 pl-5 v-for="(fee, indexQ) in fees" :key="indexQ">
				<v-flex xs2>
					<span>Cuota - {{ indexQ + 1 }}</span>
				</v-flex>
				<v-flex xs2 mr-5>
					<v-text-field
						hide-details
						single-line
						placeholder="00"
						type="number"
						v-model.number="fee.amount"
						class="filter-select shadow-inset"
						@input="recalculateFee(indexQ, $event)"
					></v-text-field>
				</v-flex>
				<v-flex xs4>
					<v-menu
						lazy
						v-model="fee.menu"
						transition="scale-transition"
						offset-y
						full-width
					>
						<v-text-field
							readonly
							single-line
							slot="activator"
							label="Fecha de inicio"
							v-model="fee.expirationDate"
							append-icon="event"
							class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-end"
						></v-text-field>
						<v-date-picker
							no-title
							scrollable
							locale
							:min="today"
							v-model="fee.expirationDate"
							:allowed-dates="allowedDates"
							@change="amountsUpdated(indexQ, $event)"
						></v-date-picker>
					</v-menu>
				</v-flex>
			</v-layout>
		</v-layout>
	</div>
</template>

<script>
import { addDays, format, isWithinRange, differenceInDays } from 'date-fns';
import vueMultiselec from 'vue-multiselect';
import lib from '@/shared/lib';
import bankDepositForm from '@/components/shared/type-payment-forms/bank-deposit-form';
import cardForm from '@/components/shared/type-payment-forms/card-form';
import checkForm from '@/components/shared/type-payment-forms/check-form';
import creditNoteForm from '@/components/shared/type-payment-forms/credit-note-form';
import helper from '@/shared/helper';
import typePaymentForm from '@/shared/type-payment-form';
import proofPayment from '@/components/shared/sales/proof-payment';

const { setNewProperty, distributeAmount, round } = lib;
const { exactDate, quotesDistribution } = helper;
const twoDecimals = round(2);

function created() {
	this.today = format(addDays(this.$today(), 1), 'YYYY-MM-DD');
	this.modePaymentSelected = 'CONTADO';
	this.totalAmountSale = this.amountSale;
	this.tip = this.costShipping || 0;
	if (this.tip > 0 && this.$userInfo.company.settings.flagTip) {
		this.totalAmountSale += this.tip;
	}
	this.showAlert = this.showEmitAlert;
	this.showValid = this.flagSubsidiary;
	if (this.showValid) {
		this.loadHolding();
	}
	this.loadData();
}

async function loadHolding() {
	const { data: response } = await this.$httpSales.get(
		'catalog-sunat-details-list/TABLA20'
	);
	this.listWithHolding = response;
	this.idWithholding = this.listWithHolding[0].id;
	this.percentageWithholding = this.listWithHolding[0].percentage;
	this.codeWithholding = this.listWithHolding[0].value;
	this.textWithholding = `M.Retencion (${this.listWithHolding[0].percentage}%):`;
	this.labelWithholding = this.listWithHolding[0].description;
}

function mounted() {
	this.focusOnPaymentSelector();
}

function focusOnPaymentSelector() {
	const { paymentSelector } = this.$refs;
	paymentSelector.activate();
}

function changeDistributionDates({ value }) {
	this.selectedDistribution = value;
	const initialDate = format(addDays(this.$today(), value), 'YYYY-MM-DD');
	this.fees = this.fees.map((f, index) => {
		const newF = f;
		newF.expirationDate = this.distributionDates(initialDate, index);
		return newF;
	});
}

function distributionDates(initialDate, iterator) {
	return format(addDays(initialDate, iterator * this.selectedDistribution), 'YYYY-MM-DD');
}

function addFees() {
	const feesArray = this.fees;
	this.fees = [];
	const valid = this.isPositiveInteger(this.quotesNumber);
	this.$emit('disabled-button', !valid);
	if (!valid) {
		this.alertMessage = 'El número de cuotas debe ser un número entero';
		this.showAlert = true;
		return;
	}
	this.alertMessage = null;
	this.showAlert = false;

	let totalAmount = 0;
	if (this.withholdingSale) {
		totalAmount = this.totalWithholding;
	} else {
		totalAmount = this.percentage
			? twoDecimals(this.totalAmountSale - this.totalSurcharge)
			: this.totalAmountSale - (this.totalAdvance || 0);
	}
	if (this.quotesNumber) {
		const quotesArray = quotesDistribution(totalAmount, this.quotesNumber);
		for (let i = 1; i <= this.quotesNumber; i += 1) {
			const index = i - 1;
			const amount = quotesArray[index];
			const existDate = feesArray[index] && feesArray[index].expirationDate;
			const initialDate = format(
				addDays(this.$today(), this.selectedDistribution),
				'YYYY-MM-DD'
			);
			const expirationDate = index
				? existDate || this.distributionDates(this.fees[0].expirationDate, index)
				: existDate || format(initialDate, 'YYYY-MM-DD');
			this.fees.push({ amount, menu: false, expirationDate });
		}
	}
	this.amountsUpdated();
}

function calculateCreditPay() {
	return this.fees.reduce((a, i) => {
		const newAmount = typeof i.amount === 'string' ? 0 : i.amount;
		return a + newAmount;
	}, 0);
}

function cardPay(value) {
	const creditNote = this.selectedCardsFn.find((sc) => sc.code === 'cntc');
	if (value) {
		const existCash = this.cashPay > 0;
		const greaterThan = twoDecimals(value - this.totalSurcharg) > this.totalAmountSale;
		const payByType = creditNote
			? !creditNote.creditNote.amount
			: this.selectedCardsFn.some((sc) => !sc.paid);
		const same = this.cardPay === this.totalAmountSale;
		if (greaterThan) {
			this.alertMessage =
				'El monto a pagar con tarjetas de crédito, depósito bancario, cheque o nota de crédito no puede ser mayor al monto total de la venta.';
		} else if (same && existCash) {
			this.alertMessage =
				'El vuelto no puede ser igual al monto en EFECTIVO. Las transacciones por tipo de pago se deben generar con un monto mayor a cero (0).';
		} else if (payByType) {
			this.alertMessage =
				'Uno o más tipos de pago seleccionados se encuentran con monto cero (0). Puede eliminar la selección y continuar con el proceso.';
		}
		this.showAlert = greaterThan || (same && existCash) || payByType;
	} else if (creditNote) {
		const noAmount = !this.creditNote.amount;
		if (noAmount) {
			this.alertMessage =
				'Uno o más tipos de pago seleccionados se encuentran con monto cero (0). Puede eliminar la selección y continuar con el proceso.';
		}
		this.showAlert = noAmount;
	}
	this.$emit('disabled-button', this.showAlert);
}

function cashPay(value) {
	const same = this.cardPay === this.totalAmountSale && value > 0;
	const isSelected =
		this.selectedCardsFn.find(
			(c) => c.code === 'efectivo' || c.code === 'cash-dollars'
		) && !value;
	if (same) {
		this.alertMessage =
			'El vuelto no puede ser igual al monto en efectivo. Las transacciones por tipo de pago se deben generar con un monto mayor a cero (0).';
	} else if (isSelected) {
		this.alertMessage =
			'Uno o más tipos de pago seleccionados se encuentran con monto cero (0). Puede eliminar la selección y continuar con el proceso.';
	}
	this.showAlert = same || isSelected;
	this.$emit('disabled-button', this.showAlert);
}

function emitSale(val) {
	const body = {
		amountCash: this.cashPay,
		amountCredit: this.cardPay,
		cardsUsedToPay: [...this.selectedCardsFn],
		creditNoteData: this.creditNote,
		change: this.updatePay.change,
		paymentMethodId: this.paymentsTypes.find((t) => t.code === this.modePaymentSelected)
			.id,
		paymentsMethods: this.paymentsTypes,
		quotes: this.fees,
		tip: this.tip || this.costShipping,
		urlImages: this.images,
		totalSurchage: this.totalSurcharge,
		totalWithoutWithholding: this.totalWithholding,
		statusWithholding: this.withholdingSale,
		percentageWithholding: this.percentageWithholding,
		codeWithholding: this.codeWithholding,
		labelWithholding: this.labelWithholding,
		amountWithholding: this.amountWithholding,
		totalWithholding: this.totalWithholding,
	};
	if (val) {
		this.$emit('make-sale', body);
	}
}

function errorsPayments(rest) {
	if (this.modePaymentSelected === 'CONTADO') {
		this.$emit('fee-error', twoDecimals(rest) > 0);
	} else {
		const errFees = this.fees.every((f) => f.expirationDate);
		const totalFees = this.fees.reduce((ac, item) => ac + item.amount, 0).toFixed(2);
		const invalidAmount = Number(totalFees) > twoDecimals(this.totalAmountSale);
		const error = rest > 0 || !errFees || this.quotesNumber === 0 || invalidAmount;
		this.$emit('fee-error', error);
	}
}

function getPaid(type, cash, cards, quotes) {
	if (type === 'CONTADO') {
		return cash + cards;
	}
	return quotes.reduce((acc, quote) => acc + (quote.amount || 0), 0);
}

function isActiveForm({ flagForm, open }, type) {
	return open && typePaymentForm[type] === flagForm;
}

function isModeCash() {
	return this.modePaymentSelected === 'CONTADO';
}

function isNotTypeCash({ code }) {
	return code !== 'efectivo' && code !== 'cash-dollars';
}

function changeWithholding(value) {
	const percentageValue = this.percentageWithholding / 100;
	this.amountWithholding = value ? this.totalAmountSale * percentageValue : 0;
	this.totalWithholding = value ? this.totalAmountSale - this.amountWithholding : 0;
	this.withholdingSale = value;
	this.$emit('valid-withholding', value, this.amountWithholding);
	this.addFees();
}

async function loadData() {
	try {
		const bankAccountsStorage = helper.getLocalData('banks-account');
		this.bankAccounts = bankAccountsStorage;
		const paymentMethods = helper.getLocalData('payments-methods');
		this.paymentsTypes = paymentMethods;
		const typePayments = helper.getLocalData('type-payments');
		const dateReference = helper.formatDate(new Date(), 'YYYY-MM-DD');
		this.typePayments = typePayments.map((c) => {
			let newC = { ...c.paymentType };
			newC = setNewProperty('paid', 0)(newC);
			newC.open = newC.code === 'deposito-bancario';
			newC.icon = 'add_circle_outline';
			newC.card = {
				bankAccountId: null,
				documentNumber: '',
			};
			newC.check = {
				additionalInformation: {
					dateReference,
				},
				bankAccountId: null,
				documentNumber: '',
				reference: '',
			};
			newC.deposit = {
				additionalInformation: {
					dateReference,
				},
				bankAccountId: null,
				documentNumber: '',
				urlImage: '',
				reference: null,
			};
			newC.percentage = c.aditionalInformation
				? twoDecimals(c.aditionalInformation.surcharge * 100)
				: null;
			newC.amountPercentage = 0;
			newC.disabled = false;
			return newC;
		});
		if (this.customer.id) {
			const filterPayment = this.paymentsTypes.filter(
				(p) => p.id === this.customer.paymentMethodId
			);
			if (filterPayment.length) {
				this.modePaymentSelected = filterPayment[0].code;
			}
		}
		if (this.customerGeneric) {
			this.paymentsTypes = this.paymentsTypes.map((p) => {
				const newPayment = { ...p };
				newPayment.disabled = p.code === 'CREDITO';
				return newPayment;
			});
			this.selectedCards = this.typePayments.filter((t) => t.code === 'efectivo');
		}
		if (this.showCash) {
			this.selectedCards = this.typePayments.filter((tp) => tp.code === 'efectivo');
		}
	} catch (error) {
		this.showGenericError();
	}
}

function openForm(cards, idx) {
	const { id, open, code } = cards;
	let cc;
	if (idx === null) {
		cc = this.selectedCards.find((c) => c.id === id);
	} else {
		cc = this.selectedCards[idx];
	}
	this.$set(cc, 'open', !open);
	this.$set(cc, 'icon', !open ? 'remove_circle_outline' : 'add_circle_outline');
	let typeCard = '';
	if (code === 'deposito-bancario') {
		typeCard = 'Deposit';
	} else if (code === 'cntc') {
		typeCard = 'Note';
	} else {
		typeCard = code === 'cheque' ? 'Check' : 'Card';
	}
	this.isActiveForm(cards, typeCard);
}

function remove(item) {
	this.selectedCards.splice(this.selectedCards.indexOf(item), 1);
	this.typePayments = this.typePayments.map((t) => {
		const newType = { ...t };
		if (t.id === item.id && t.percentage) {
			this.showMessagePercentage = false;
			this.paymentPercentage = null;
			this.percentage = 0;
		}
		return newType;
	});
	this.amountsUpdated();
	this.alertMessage = '';
	this.showAlert = false;
}

function resetPayment() {
	this.alertMessage = null;
	this.showAlert = false;
	if (this.modePaymentSelected === 'CONTADO') {
		this.quotesNumber = 0;
		this.fees = [];
	} else {
		this.cashPay = 0;
		this.cardPay = 0;
		this.selectedCards = [];
		this.quotesNumber = 1;
		this.addFees();
	}
}

function selectedCards(values) {
	const isSelected =
		values.find((c) => c.code === 'efectivo' || c.code === 'cash-dollars') &&
		this.cashPay === 0;
	if (isSelected) {
		this.alertMessage =
			'Uno o más tipos de pago seleccionados se encuentran con monto cero (0). Puede eliminar la selección y continuar con el proceso.';
		this.showAlert = this.showEmitAlert ? isSelected : false;
	}
	const idxNTC = values.findIndex((v) => v.code === 'cntc');
	if (idxNTC !== -1) {
		this.openForm(values[idxNTC], idxNTC);
	}
	const percentage = values.find((v) => v.percentage);
	const percentageNot = values.filter((v) => !v.percentage);
	const editTotal = this.selectedCards.findIndex((v) => v.edit);
	this.typePayments = this.typePayments.map((t) => {
		const self = this;
		let newType = {};
		const edit = self.selectedCards.find((s) => s.id === t.id);
		if (edit) {
			newType = { ...edit };
		} else {
			newType = { ...t };
		}
		if (percentage) {
			newType.disabled = t.id !== percentage.id;
		} else if (percentageNot.length) {
			newType.disabled = Boolean(t.percentage);
		} else if (values.length === 0) {
			newType.disabled = false;
		}
		return newType;
	});
	if (editTotal === -1) {
		if (percentage) {
			this.paymentPercentage = percentage.name;
			this.percentage = percentage.percentage;
			this.$emit('add-percentage', percentage.percentage);
			this.showMessagePercentage = true;
		} else if (this.percentage) {
			this.showMessagePercentage = false;
			this.$emit('remove-percentage', this.percentage);
			this.paymentPercentage = null;
			this.percentage = 0;
		}
	}
	this.$emit('disabled-button', this.showAlert);
}

function selectedCardsFn() {
	let newSelectedCards = this.selectedCards;
	if (this.selectedCards.length >= 0) {
		const creditNote = this.selectedCards.find((sc) => sc.code === 'cntc');
		const disabledPay = creditNote && !this.creditNote.amount;
		if (disabledPay) {
			this.alertMessage =
				'Uno o más tipos de pago seleccionados se encuentran con monto cero (0). Puede eliminar la selección y continuar con el proceso.';
			this.showAlert = disabledPay;
			this.$emit('disabled-button', this.showAlert);
		}
		if (this.detraction) {
			this.totalAmountSale = this.amountSale - this.detraction.amount;
		}
		const divider = this.selectedCards.length;
		newSelectedCards = this.selectedCards.map(
			distributeAmount(this.totalAmountSale, divider, this.selectedCards, creditNote)
		);
		newSelectedCards = newSelectedCards.map((item) => {
			const newRow = { ...item };
			newRow.amountPercentage = twoDecimals((item.percentage * item.paid) / 100);
			return newRow;
		});
		this.setCashAndCreditAmount(newSelectedCards);
	}
	return newSelectedCards;
}

function setCardData({ model, newValue }, idx) {
	const card = this.selectedCards[idx];
	this.$set(card.card, model, newValue);
}

function setCashAndCreditAmount(collection) {
	const cashPayVal = collection.find(
		(c) => c.code === 'efectivo' || c.code === 'cash-dollars'
	);
	const filterAmount = this.selectedCards.filter(
		(p) => p.code !== 'efectivo' && p.code !== 'cash-dollars'
	);
	const validCard =
		filterAmount && filterAmount.length > 0
			? filterAmount.some((card) => card.paid > this.amountSale)
			: false;
	const validExceded =
		filterAmount && filterAmount.length > 0
			? filterAmount.reduce((acc, item) => acc + Number(item.paid), 0) > this.amountSale
			: false;
	const valid = validCard || validExceded;
	this.showLimitTotal = validCard || validExceded;
	this.textLimitAlert =
		validCard || validExceded ? 'El monto a pagar, supera al total de la venta.' : '';
	this.$emit('disabled-limit', valid);
	this.totalSurcharge = 0;
	this.totalAmountNeto = this.totalAmountSale;
	this.cashPay = cashPayVal ? cashPayVal.paid : 0;
	const creditNote = collection.find((c) => c.code === 'cntc');
	const newCardPay = collection
		.filter(
			(f) => f.code !== 'efectivo' && f.code !== 'cash-dollars' && f.code !== 'cntc'
		)
		.map((c) => {
			const newC = { ...c };
			if (!c.paid || (creditNote && this.creditNote.amount > this.totalAmountSale)) {
				newC.paid = 0;
			}
			if (c.amountPercentage && c.amountPercentage > 0) {
				newC.paid += c.amountPercentage;
				this.totalSurcharge += c.amountPercentage;
				this.totalAmountNeto += c.amountPercentage;
			}
			return newC;
		})
		.reduce((acc, el) => acc + el.paid, 0);
	this.cardPay =
		this.creditNote.amount && creditNote
			? newCardPay + this.creditNote.amount
			: newCardPay;
	if (!creditNote) {
		this.creditNote = {
			amount: null,
			date: null,
			documentNumber: null,
			serie: null,
			number: null,
		};
	}
	this.amountsUpdated();
}

function setCheckData({ model, newValue }, idx) {
	const check = this.selectedCards[idx];
	if (model === 'dateReference') {
		this.$set(check.check.additionalInformation, model, newValue);
	} else {
		this.$set(check.check, model, newValue);
	}
}

function setDepositData({ model, newValue }, idx) {
	if (model === 'dateReference') {
		this.$set(this.selectedCards[idx].deposit.additionalInformation, model, newValue);
	} else {
		this.$set(this.selectedCards[idx].deposit, model, newValue);
	}
}

function totalAmountSale(value) {
	if (value >= 0) {
		this.setCashAndCreditAmount(this.selectedCardsFn);
	}
}

function updatePayAmounts() {
	this.setCashAndCreditAmount(this.selectedCardsFn);
}

function proofImageArray(collection) {
	this.images = [...collection];
}

function validateCustomerLimitAmountCredit() {
	const { limitAmountCredit } = this.customer;
	let invalid = false;
	if (
		limitAmountCredit &&
		this.totalAmountSale > limitAmountCredit &&
		(!this.customer.paymentMethodId || this.customer.paymentMethodId === 2)
	) {
		invalid = true;
		this.showNotification(
			`El crédito máximo para este cliente es de ${this.countryCurrencySymbol}${this.getCustomerCreditLimit}. Solo es permitido el pago de Contado`,
			'warning'
		);
	}
	return invalid;
}

function validateCreditPayment({ code }) {
	return (
		code === 'CREDITO' && (this.validateCustomerLimitAmountCredit || !this.amountSale)
	);
}

function allowedDates(date) {
	const newDates = format(date, 'YYYY-MM-DD');
	const { creditLimitDays } = this.customer;
	if (creditLimitDays) {
		const today = format(new Date(), 'YYYY-MM-DD');
		const finalDay = addDays(today, creditLimitDays);
		return isWithinRange(newDates, today, finalDay);
	}
	return true;
}

function getCustomerCreditLimitDays() {
	const { creditLimitDays } = this.customer;
	return creditLimitDays;
}

function getCustomerCreditLimit() {
	const { limitAmountCredit } = this.customer;
	return `${limitAmountCredit}`;
}

async function validNote(model) {
	if (!this.noteValidated) {
		this.noteLoading = true;
		const body = {
			customerId: this.customer.id,
			serie: model.serie,
			number: model.number,
		};
		try {
			const { data: response } = await this.$httpSales.post(
				'sale-documents-validate',
				body
			);
			this.valueDate = exactDate(response.localDate.date, 'DD/MM/YYYY', false, ' ');
			this.creditNote = {
				id: response.id,
				amount:
					(response.balanceDiscount && response.balanceDiscount.amountPending) ||
					response.amount,
				date: exactDate(response.localDate.date, 'YYYY-MM-DD', false, ' '),
				serie: response.serie,
				number: response.number,
				documentNumber: response.documentNumber,
			};
			if (response.flagUse === 1) {
				this.showGenericError(
					'No se puede proceder con la venta porque la Nota de Crédito ya fue utilizada.'
				);
			}
			const idxNTC = this.selectedCards.findIndex((sc) => sc.code === 'cntc');
			const card = this.selectedCards[idxNTC];

			this.$set(
				card,
				'documentNumber',
				`${this.creditNote.serie}-${this.creditNote.number}`
			);
			this.$set(card, 'creditNote', this.creditNote);
			this.openForm(card, idxNTC);
			this.cardPay = this.cardPay + this.creditNote.amount;
			this.icon = 'check';
			this.validateColor = 'success';
		} catch (err) {
			this.icon = 'close';
			this.validateColor = 'error';
			if (err.data && err.data.message === 'DOCUMENT_NUMBER_NOT_FOUND') {
				this.showGenericError(
					`No se ha encontrado el documento #${model.serie}-${model.number} en el sistema.`
				);
			} else if (err.data && err.data.message === 'CUSTOMER_GENERIC_NOT_FOUND') {
				this.showGenericError('La compañía no cuenta con cliente genérico registrado.');
			} else if (err.data && err.data.message === 'CUSTOMER_SALES_EXIST_ERROR') {
				this.showGenericError('El cliente no existe en la compañía.');
			} else if (err.data && err.data.message === 'CUSTOMER_NOT_ACTIVE_ERROR') {
				this.showGenericError('El cliente no se encuentra activo para la compañía.');
			} else {
				this.showGenericError();
			}
		} finally {
			this.noteLoading = false;
			this.noteValidated = true;
		}
	}
}

function setNoteData({ model, value }) {
	this.creditNote[model] = value;
	if (model === 'serie' || model === 'number') {
		this.creditNote.amount = null;
		this.noteValidated = false;
		this.validateColor = 'primary';
	}
}

function setTip({ value }) {
	this.tip = Number(value) || 0;
	const total = Number(this.amountSale) + Number(this.tip);
	this.totalAmountSale = total.toFixed(2);
}

function amountsUpdated(index, value) {
	// if (!index && this.modePaymentSelected === 'CREDITO') {
	// 	this.changeDistributionDates({ value: this.selectedDistribution });
	// }
	if (this.fees.length > 0 && index) {
		this.fees[index].expirationDate = value;
	}
	const paid = this.getPaid(
		this.modePaymentSelected,
		this.cashPay,
		this.cardPay,
		this.fees
	);
	let rest = 0;
	rest =
		Number(this.totalAmountSale.toFixed(2)) > Number(paid.toFixed(2))
			? Number(this.totalAmountSale.toFixed(2)) - paid - (this.totalAdvance || 0)
			: 0;
	if (this.withholdingSale) {
		rest = 0;
	}
	let change =
		paid > this.totalAmountSale ? Number((paid - this.totalAmountSale).toFixed(2)) : 0;
	if (this.totalSurcharge && this.totalSurcharge > 0) {
		change -= Number(this.totalSurcharge.toFixed(2));
	}
	this.errorsPayments(rest);
	this.updatePay = {
		change,
		paid,
		rest: Number(rest.toFixed(2)),
	};
}

function setCardValue(card, index, value) {
	const newCard = this.selectedCards[index];
	if (newCard && card) {
		this.$set(this.selectedCardsFn[index], 'paid', Number(value));
		this.$set(newCard, 'paid', Number(value));
		this.$set(this.selectedCardsFn[index], 'edit', true);
		this.$set(newCard, 'edit', true);
	}
	this.updatePayAmounts();
}

function validatePayment({ id }) {
	return this.customer.paymentMethodId ? this.customer.paymentMethodId !== id : false;
}

function validateDateLimit() {
	let flag = false;
	if (this.fees.length && this.getCustomerCreditLimitDays) {
		if (
			differenceInDays(this.fees[this.fees.length - 1].expirationDate, this.$today()) >
			this.getCustomerCreditLimitDays
		) {
			flag = true;
		}
	}
	this.$emit('not-sale', flag);
	return flag;
}

function modePaymentSelected(value) {
	this.$emit('set-payment', value);
}

function recalculateFee(indexFee, value) {
	let amountTotal = 0;
	if (this.withholdingSale) {
		amountTotal = this.totalWithholding - Number(value);
	} else {
		amountTotal = this.totalAmountSale - Number(value);
	}
	const newQuotesNumber = this.quotesNumber - 1;
	const quotesAmount = quotesDistribution(amountTotal, newQuotesNumber);
	let quoteIndex = 0;
	this.fees = this.fees.map((fee, i) => {
		const newFee = { ...fee };
		if (i !== indexFee) {
			newFee.amount = quotesAmount[quoteIndex];
			quoteIndex += 1;
		}
		return newFee;
	});
	const noValid = this.fees.some((e) => Number(e.amount) <= 0);
	this.$emit('fee-error', noValid);
}

function selectedCardsHandle(card) {
	const cardCopy = JSON.parse(JSON.stringify(card));
	const noRepeatList = [typePaymentForm.Cash, typePaymentForm.Note];
	if (noRepeatList.includes(cardCopy.flagForm)) {
		const already = this.selectedCards.find((sc) => sc.code === card.code);
		if (already) return;
	}
	if (cardCopy) {
		this.selectedCards = this.selectedCards.concat({ ...cardCopy });
	}
	// const index = this.selectedCards.findIndex(sc => sc.code === card.code);
	// if (index > -1) {
	// 	this.selectedCards.splice(index, 1);
	// } else {
	// 	this.selectedCards = this.selectedCards.concat(card);
	// }
}

function data() {
	return {
		alertMessage: '',
		bankAccounts: [],
		cashPay: 0,
		change: 0,
		creditCard: {},
		creditNote: {
			amount: null,
			date: null,
			documentNumber: null,
			id: null,
			serie: null,
			number: null,
		},
		cardPay: 0,
		codeWithholding: null,
		idWithholding: null,
		fees: [],
		feesDistribution: [
			{ value: 1, text: 'Diaria' },
			{ value: 7, text: 'Semanal' },
			{ value: 15, text: 'Quincenal' },
			{ value: 30, text: 'Mensual' },
		],
		icon: '',
		images: [],
		isActive: false,
		labelWithholding: '',
		listWithHolding: [],
		modePaymentSelected: '',
		noteLoading: false,
		noteValidated: false,
		paymentsTypes: [],
		quotesNumber: 0,
		selectedCards: [],
		selectedDistribution: 1,
		showAlert: false,
		textLimitAlert: '',
		showLimitTotal: false,
		percentageWithholding: 0,
		textWithholding: '',
		tip: 0,
		today: null,
		typePayments: [],
		totalAmountSale: 0,
		totalSurcharge: 0,
		totalWithholding: 0,
		amountWithholding: 0,
		updatePay: {
			change: 0,
			paid: 0,
			rest: 0,
		},
		validateColor: 'primary',
		valueDate: null,
		showMessagePercentage: false,
		percentage: 0,
		paymentPercentage: null,
		withholdingSale: 0,
	};
}

export default {
	name: 'payment-mode',
	components: {
		bankDepositForm,
		cardForm,
		checkForm,
		creditNoteForm,
		proofPayment,
		vueMultiselec,
	},
	computed: {
		calculateCreditPay,
		isModeCash,
		getCustomerCreditLimit,
		getCustomerCreditLimitDays,
		selectedCardsFn,
		validateCustomerLimitAmountCredit,
		validateDateLimit,
	},
	created,
	data,
	methods: {
		addFees,
		allowedDates,
		amountsUpdated,
		changeDistributionDates,
		changeWithholding,
		distributionDates,
		emitSale,
		errorsPayments,
		focusOnPaymentSelector,
		getPaid,
		isActiveForm,
		isNotTypeCash,
		loadData,
		loadHolding,
		openForm,
		proofImageArray,
		recalculateFee,
		remove,
		resetPayment,
		selectedCardsHandle,
		setCardData,
		setCardValue,
		setCashAndCreditAmount,
		setCheckData,
		setDepositData,
		setNoteData,
		setTip,
		updatePayAmounts,
		validNote,
		validateCreditPayment,
		validatePayment,
		isPositiveInteger(value) {
			return Number.isInteger(value) && value > 0;
		},
		updateLoading(value) {
			this.$emit('update-loading', value);
		},
	},
	mounted,
	props: {
		amountSale: {
			default: 0,
			type: [String, Number],
		},
		customer: {
			default: () => {},
			type: Object,
		},
		getSale: {
			default: false,
			type: Boolean,
		},
		salesCurrency: {
			default: '',
			type: String,
		},
		costShipping: [Number, String],
		merchantId: {
			default: false,
			type: Boolean,
		},
		customerGeneric: {
			default: false,
			type: Boolean,
		},
		showCash: {
			default: false,
			type: Boolean,
		},
		flagSubsidiary: {
			default: false,
			type: Boolean,
		},
		showEmitAlert: {
			default: false,
			type: Boolean,
		},
		showLimit: {
			default: false,
			type: Boolean,
		},
		totalAdvance: [Number, String],
		detraction: {
			default: () => {},
			type: Object,
		},
		loadingImg: {
			default: false,
			type: Boolean,
		},
	},
	watch: {
		cardPay,
		cashPay,
		getSale: emitSale,
		selectedCards,
		totalAmountSale,
		modePaymentSelected,
	},
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style lang="scss" scoped>
.radio-group.sale-radio {
	height: 19px;
	padding: 0px;
}
.container-quote {
	background-color: white;
}

.open-bold {
	font-family: map-get($fonts, open-bold);
}

.wrapper-information {
	background-color: map-get($colors, green-opacity);
	color: map-get($colors, background-sidebar);
}

.label-switch {
	font-size: 13px;
}
</style>
