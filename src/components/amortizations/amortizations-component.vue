<template>
	<div>
		<v-layout wrap pa-3>
			<v-flex xs12 sm6 pr-2>
				<app-input-text
					type="number"
					:label="`Monto ${currencySymbol}`"
					:max="totalToPay"
					min="0"
					model="number"
					:text="amortization.number"
					@input="$emit('get-data-number', $event)"
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
					@input="$emit('get-data', $event)"
				/>
			</v-flex>
			<v-flex xs4 mt-2>
				<app-select
					:item="amortization.cashId"
					item-text="name"
					item-value="id"
					:items="cashs"
					label="Caja"
					model="cashId"
					return-object
					@input="$emit('get-data', $event)"
				/>
			</v-flex>
			<v-flex xs12 v-if="isDifferentCash" mt-3>
				<purchases-payment-form
					:show-concept="false"
					:bank-account-id="transactionData.bankAccountId"
					:card-id="amortization.typePaymentId"
					:date-reference="transactionData.additionalInformation.dateReference"
					:document-number="transactionData.documentNumber"
					:flag-form="transactionData.flagForm"
					:reference="transactionData.reference"
					:url-image="transactionData.urlImage"
					is-sale
					@get-data="$emit('get-transaction-data', $event, transaction)"
				/>
			</v-flex>
		</v-layout>
		<v-layout wrap px-3 mb-3 v-for="(sale, saleIdx) in dataSelected" :key="sale.id">
			<v-flex xs12 pa-2 primary lighten-1 white--text class="body-2">
				# DOC: {{ sale.documentNumber }}
			</v-flex>
			<v-flex xs12 py-2>
				<v-layout wrap pb-2>
					<v-flex xs1 text-xs-center pr-1>
						<span class="label-amortization">Estado</span>
					</v-flex>
					<v-flex xs2 text-xs-center px-1>
						<span class="label-amortization">Total</span>
					</v-flex>
					<v-flex xs2 text-xs-center px-1>
						<span class="label-amortization">Pagado</span>
					</v-flex>
					<v-flex xs2 text-xs-center px-1>
						<span class="label-amortization">Saldo</span>
					</v-flex>
					<v-flex xs2 text-xs-center px-1>
						<span class="label-amortization">A Pagar</span>
					</v-flex>
					<v-flex xs3 pl-1>
						<span class="label-amortization">Fecha de Pago</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex
				xs12
				py-2
				v-for="(quote, quoteIdx) in sale.caDocument.details"
				:key="quote.id"
			>
				<v-layout wrap>
					<v-flex xs1 text-xs-center pr-1>
						<p>
							<v-tooltip top>
								<v-icon slot="activator" :color="iconColor(quote)">
									radio_button_checked
								</v-icon>
								<span>{{ quote.statusName }}</span>
							</v-tooltip>
						</p>
					</v-flex>
					<v-flex xs2 px-1 text-xs-center pt-1>
						<span class="label-text">{{ quote.amount | round }}</span>
					</v-flex>
					<v-flex xs2 px-1 text-xs-center pt-1>
						<span class="label-text">{{ quote.amountPayment | round }}</span>
					</v-flex>
					<v-flex xs2 px-1 text-xs-center pt-1>
						<span class="label-text">{{ quote.amountToPayShow | round }}</span>
					</v-flex>
					<v-flex xs2 px-1>
						<v-text-field
							class="filter-select"
							:disabled="quote.status === 3"
							error
							hide-details
							label="Monto A Pagar"
							:max="quote.amount"
							min="0"
							:readonly="quote.status === 3"
							:rules="[(v) => v < quote.amount + 1 || 'Error :(']"
							type="number"
							:value="quote.amountToPay"
							@input="showErrorMessage($event, quote, sale.id, saleIdx, quoteIdx)"
						></v-text-field>
					</v-flex>
					<v-flex xs3 pl-1>
						<v-menu
							lazy
							v-model="quote.menu"
							transition="scale-transition"
							offset-y
							full-width
							readonly
							disabled
						>
							<v-text-field
								slot="activator"
								v-model="quote.expirationDate"
								append-icon="event"
								class="filter-select-calendar-calendar-requirement amortization-date"
								readonly
								disabled
							></v-text-field>
							<v-date-picker
								v-model="quote.expirationDate"
								no-title
								disabled
								readonly
								scrollable
							></v-date-picker>
						</v-menu>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabledCollect"
				@cancel-button-clicked="$emit('cancel')"
				@accept-button-clicked="$emit('save')"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import purchasesPaymentForm from '@/components/purchases/purchases-payment-form';

function created() {
	this.amortization = { ...this.amortizationData };
	this.transaction = { ...this.transactionData };
	this.amortization.cashId = this.$userInfo.cashId;
	this.loadCash();
}

async function loadCash() {
	try {
		const { data: response } = await this.$httpSales.get('cash');
		this.cashs = response;
		if (this.cashs.length === 1) {
			this.cash = [this.cashs[0]];
		}
	} catch (error) {
		this.showGenericError();
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

function showErrorMessage(value, q, sId, sIdx, qIdx) {
	this.$emit('show-error-message', q, sId, sIdx, qIdx, value);
}

function validTotal() {
	if (Number(this.amortization.number)) {
		const valid = Number(this.totalAmount).toFixed(2) > Number(this.amortization.number);
		if (valid) {
			this.showGenericError('La suma de las cuotas a pagar no debe ser mayor al total.');
		}
		return valid;
	}
	return null;
}

function watchAmortization(val) {
	this.amortization = { ...val };
}

function data() {
	return {
		amortization: {
			cashId: null,
			number: 0,
			amount: 0,
			typePaymentId: 0,
		},
		cashs: [],
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
	name: 'amortization-component',
	components: {
		modalSidebarButton,
		purchasesPaymentForm,
	},
	computed: {
		isCompletePayment,
		validTotal,
	},
	created,
	data,
	methods: {
		iconColor,
		loadCash,
		showErrorMessage,
	},
	props: {
		amortizationData: {
			default: () => {},
			type: Object,
		},
		currency: String,
		currencySymbol: String,
		customer: {
			default: () => {},
			type: Object,
		},
		dataSelected: {
			default: () => [],
			type: Array,
		},
		disabledCollect: {
			default: true,
			type: Boolean,
		},
		isDifferentCash: {
			default: false,
			type: Boolean,
		},
		quoteError: {
			default: false,
			type: Boolean,
		},
		showButtons: {
			default: false,
			type: Boolean,
		},
		totalAmount: [Number, String],
		totalToPay: [Number, String],
		transactionData: {
			default: () => {},
			type: Object,
		},
		typePayments: {
			default: () => [],
			type: Array,
		},
	},
	watch: {
		amortizationData: {
			deep: true,
			handler: watchAmortization,
		},
	},
};
</script>

<style lang="scss" scoped>
.label-amortization {
	color: color(paginationText);
	font-family: font(oepn-regular);
	font-size: size(small);
}

.label-text {
	color: color(paginationText);
	font-family: font(oepn-regular);
	font-size: size(medium);
}
</style>
