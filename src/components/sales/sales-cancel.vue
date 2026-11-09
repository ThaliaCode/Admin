<template>
	<layouts-slide-container>
		<v-layout px-4 wrap>
			<template v-if="sale && (isListSale ? documentSelect !== 'NTC' : true)">
				<v-flex pb-3 xs12 v-if="sale.customer">
					<p class="text-cancel mb-0">
						<span class="bold">Cliente:</span> {{ sale.customer.name }}
						{{ sale.customer.lastname }}
					</p>
				</v-flex>
				<v-flex pb-3 xs12>
					<p class="text-cancel mb-0">
						<span class="bold">Monto Total:</span> {{ sale.currencySymbol }}
						{{ sale.amount }}
					</p>
				</v-flex>
			</template>
			<v-flex xs12 v-if="validSale.flagCancel && isPeru" mb-3>
				<div class="layout">
					<v-icon>info</v-icon>
					<span class="ml-2"
						>Los medios de pago relacionados al documento serán revertidos
						automáticamente</span
					>
				</div>
			</v-flex>
			<v-flex pb-2 xs12 v-if="!isEcuador && validSale.flagCancel && false">
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
			<v-flex pb-2 xs12 v-if="false"
				>>
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
			<v-flex xs12 pb-2 v-if="!isEcuador && false">
				<v-layout wrap v-if="showTypePayment">
					<v-flex xs12 white py-3>
						<v-layout wrap class="justify-center">
							<v-flex xs10>
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
										setValue({ model: 'expirationDate', value: $event, index: indexQ })
									"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex pb-2 xs12>
				<v-text-field
					id="comment"
					class="textarea-content filter-select shadow-inset mt-3"
					label="Comentario"
					textarea
					hide-details
					v-model="commentary"
				></v-text-field>
			</v-flex>
			<v-flex xs12>
				<v-checkbox
					label="Actualizar stock de productos?"
					v-model="flagKardex"
					:disabled="checkDisabled"
				>
				</v-checkbox>
			</v-flex>
			<v-layout row justify-center v-if="isCreditNote">
				<v-flex xs10>
					<v-alert :value="true" type="warning">
						Las notas de crédito no pueden ser anuladas.
					</v-alert>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="isLoading || isCreditNote || !commentary"
					@accept-button-clicked="cancelSale"
					@cancel-button-clicked="$emit('cancel-button-clicked')"
				/>
			</section>
		</v-layout>
	</layouts-slide-container>
</template>

<script>
import { format } from 'date-fns';
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

const { distributeAmount } = lib;
const { formatDate, exactDate } = helper;

function data() {
	const currentDate = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
	return {
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
	};
}

async function cancelSale() {
	this.isLoading = true;
	const urlPeru = this.validSale.flagCancel
		? `sale-documents/${this.saleId}/cancel`
		: 'summary-unsubscribe';
	const url = this.isEcuador ? `sale-documents/${this.saleId}/cancel` : urlPeru;
	const saleBody = {
		commentary: this.commentary,
		flagKardex: this.flagKardex,
		// typeCatalogSunatId: this.typeCatalogSunatId || null,
		// paymentMethodId: this.paymentMethodId || null,
		// detailsPayments: this.paymentMethodId === 1 ? [] : this.quotes(),
	};
	// saleBody.transactions = saleBody.detailsPayments.length === 0 ?
	// 	this.getTransactions(this.selectedCardsFn) : [];
	const saleFlagCancel = {
		date: exactDate(this.date, 'YYYY-MM-DD'),
		documentsRelated: [this.saleId],
		flagTypeReturn: this.flagKardex ? 1 : 0,
		commentary: this.commentary,
	};
	const body = this.validSale.flagCancel ? saleBody : saleFlagCancel;
	try {
		await this.$httpSales.post(url, body);
		const message =
			this.isListSale && this.documentSelect === 'NTC' ? 'Nota de crédito' : 'Venta';
		this.showNotification(`${message} anulada correctamente.`);
		this.$emit('sales-canceled', this.saleId);
	} catch (error) {
		if (error.data.message === 'SALE_NOT_FINISHED') {
			this.showNotification('Esta venta ya ha sido anulada', 'warning');
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
	];
	const [{ data: typePayments }, { data: catalogSunat }, { data: paymentMethods }] =
		await Promise.all(request);
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

export default {
	name: 'sales-cancel',
	components: {
		modalSidebarButton,
	},
	computed: {
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
	},
	props: {
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
	},
};
</script>
<style lang="scss" scoped>
.text-cancel {
	color: color(generalText);
	font-size: 13px;
}

.bold {
	font-weight: bold;
}
</style>
