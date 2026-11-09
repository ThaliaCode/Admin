<template>
	<section>
		<v-layout
			mb-2
			mt-2
			v-if="supplier.flagPerceptionAgent && $userInfo.company.settings.flagPerception"
		>
			<v-flex xs4 mb-2 mt-1 pl-4>
				<v-checkbox
					class="label-switch"
					color="primary"
					hide-details
					label="¿Aplicar percepción?"
					:true-value="1"
					:false-value="0"
					v-model="isPerception"
					@change="changeValue"
				></v-checkbox>
			</v-flex>
			<v-flex v-if="isPerception" xs3 mt-2>
				<v-text-field
					class="filter-select shadow-inset total-cell"
					label="Monto"
					type="number"
					v-model.number="perceptionAmount"
					@input="setData"
				/>
			</v-flex>
		</v-layout>
		<v-layout column wrap class="back-summary">
			<v-flex>
				<v-layout row wrap justify-center>
					<v-flex xs2 ml-1 text-xs-center>
						<span>
							{{ isPeru ? 'IGV' : 'IVA' }}: {{ currencySelect.symbol }}
							{{ summaryData.taxes | round }}
						</span>
					</v-flex>
					<span class="line"> | </span>
					<v-flex xs2 ml-1 text-xs-center>
						<span>
							Subtotal: {{ currencySelect.symbol }}
							{{ summaryData.subTotal | round }}
						</span>
					</v-flex>
					<span class="line"> | </span>
					<v-flex xs2 ml-1 text-xs-center>
						<span> Total: {{ currencySelect.symbol }} {{ total | round }} </span>
					</v-flex>
					<span class="line" v-if="isEcuador"> | </span>
					<v-flex xs2 ml-1 v-if="isEcuador" text-xs-center>
						<span>
							Retención: {{ currencySelect.symbol }}
							{{
								isEcuador ? retentionAmount + retentionTaxAmount : retentionAmount | round
							}}
						</span>
					</v-flex>
					<span class="line" v-if="tip"> | </span>
					<v-flex xs2 ml-1 text-xs-center v-if="tip">
						<span>
							Otros cargos: {{ currencySelect.symbol }}
							{{ tip | round }}
						</span>
					</v-flex>
					<span
						class="line"
						v-if="
							supplier.flagPerceptionAgent &&
							$userInfo.company.settings.flagPerception &&
							perceptionAmount
						"
					>
						|
					</span>
					<v-flex
						xs2
						ml-1
						text-xs-center
						v-if="
							supplier.flagPerceptionAgent &&
							$userInfo.company.settings.flagPerception &&
							perceptionAmount
						"
					>
						<span>
							Percepción: {{ currencySelect.symbol }}
							{{ perceptionAmount | round }}
						</span>
					</v-flex>
					<span class="line" v-if="detraction.amount"> | </span>
					<v-flex xs2 ml-1 text-xs-center v-if="detraction.amount">
						<span>
							Detracción: {{ currencySelect.symbol }}
							{{ detraction.amount | round }}
						</span>
					</v-flex>
					<span class="line-total"> | </span>
					<v-flex xs2 ml-1 text-xs-center>
						<span>
							Tot. pagar: {{ currencySelect.symbol }}
							{{ amountTotal | round }}
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout wrap pt-3>
			<v-flex xs12 px-4>
				<app-select
					label="Forma de Pago"
					item-text="name"
					item-value="id"
					model="paymentMethodId"
					:item="paymentMethodId"
					:items="paymentMethods"
					:return-object="false"
					@input="$emit('input', $event)"
					:disabled="!!supplier.paymentMethod"
				>
				</app-select>
			</v-flex>
		</v-layout>
		<v-layout wrap align-end mt-3>
			<v-flex xs6 pl-4 v-if="isCash">
				<app-select
					label="Seleccione Caja:"
					:disabled="!!idPurchase"
					item-text="name"
					item-value="id"
					:items="cashs"
					:item="cashId"
					hide-details
					@input="$emit('set-cash-purchase', $event)"
				></app-select>
			</v-flex>
		</v-layout>
		<v-layout wrap align-end mt-3>
			<v-flex xs6 pl-4 class="d-flex align-end">
				<proof-payment
					hide-details
					:url-images="summaryData.urlImages"
					@add-proof-payment-image="setImages"
					@image-deleted="setImages"
				/>
			</v-flex>
		</v-layout>
		<hr class="spacer mt-3" v-if="showDetraction || showDetractionV2" />
		<v-layout wrap mt-3 px-4 v-if="showDetraction || showDetractionV2">
			<v-flex xs4>
				<v-checkbox
					class="label-switch"
					color="primary"
					hide-details
					label="¿Aplicar detracción?"
					v-model="useDetraction"
					@change="setData($event, 'useDetraction')"
				></v-checkbox>
			</v-flex>
		</v-layout>
		<v-layout wrap my-3 px-4 v-if="useDetraction">
			<v-flex xs6 ml-3>
				<label class="caption">Tipo de detracción</label>
				<v-select
					bottom
					single-line
					hide-details
					class="filter-select"
					content-class="filter-select-content"
					item-text="description"
					item-value="id"
					:items="typesDetraction"
					v-model="detraction.typeDetraction"
					@change="setData($event, 'detraction')"
				></v-select>
			</v-flex>

			<v-flex xs4 ml-3 mt-1>
				<label class="caption">Porcentaje</label>
				<v-text-field
					bottom
					single-line
					hide-details
					disabled
					class="filter-select shadow-inset"
					content-class="filter-select-content"
					v-model="detraction.percentage"
				></v-text-field>
			</v-flex>
		</v-layout>
		<v-layout wrap mt-3 px-4 v-if="useDetraction">
			<v-flex xs4>
				<v-checkbox
					class="label-switch"
					color="primary"
					hide-details
					label="Detracción Pagada"
					v-model="detraction.detractionPaid"
					@change="setData($event, 'detractionPaid')"
				></v-checkbox>
			</v-flex>
		</v-layout>
		<v-layout wrap my-3 px-4 v-if="detraction.detractionPaid">
			<v-flex xs5 ml-3 mt-1>
				<label class="caption">Nro de constancia</label>
				<v-text-field
					bottom
					single-line
					hide-details
					class="filter-select shadow-inset"
					content-class="filter-select-content"
					v-model="detraction.receiptNumber"
				></v-text-field>
			</v-flex>
			<v-flex xs5 ml-3>
				<label class="caption">Fecha de pago</label>
				<date-component
					:date="detraction.paymentDate"
					icon="/static/img/calendar.svg"
					@on-input="setData($event, 'paymentDate')"
				></date-component>
			</v-flex>
		</v-layout>
		<hr class="spacer mt-2 mb-4" />
		<v-layout wrap v-if="isCash" px-4>
			<v-flex xs12>
				<app-select
					label="Tipos de Pago"
					item-text="paymentType.name"
					item-value="paymentType.id"
					model="paymentTypeIds"
					multiple
					:item="paymentTypeIds"
					:items="paymentTypes"
					:return-object="true"
					@input="onPaymentType"
				>
				</app-select>
			</v-flex>
			<v-flex xs12>
				<v-layout
					align-center
					v-for="tx in transactions"
					pt-3
					pb-2
					px-5
					wrap
					:key="tx.id"
				>
					<v-flex xs4 px-2>
						<label>{{ tx.label }}</label>
					</v-flex>
					<v-flex xs1 primary--text class="bold">
						{{ currencySelect.symbol }}
					</v-flex>
					<v-flex :class="tx.code === 'cntc' ? 'xs2' : 'xs3'">
						<v-text-field
							class="filter-select"
							hide-details
							:disabled="tx.code === 'cntc'"
							type="number"
							v-model.number="tx.amount"
							@input="setAmount(tx)"
						>
						</v-text-field>
					</v-flex>
					<v-flex text-xs-center v-if="tx.code === 'cntc'" xs2 ml-2>
						<v-btn
							class="btn-action btn-auto btn-width-auto px-2 py-1"
							color="success"
							small
							@click.stop="openListNtc(tx)"
						>
							Seleccione documento
						</v-btn>
					</v-flex>
					<v-flex text-xs-center v-if="tx.hasForm" xs2>
						<v-btn icon flat @click="openForm(tx)">
							<v-icon color="info">
								<template v-if="selectedPayment.id === tx.id">
									remove_circle_outline
								</template>
								<template v-else> add_circle_outline </template>
							</v-icon>
						</v-btn>
					</v-flex>
					<v-flex xs12 v-if="tx.id === selectedPayment.id">
						<purchases-payment-form
							:subsidiary-id="subsidiary.id"
							:bank-account-id="tx.bankAccountId"
							:date-reference="tx.additionalInformation.dateReference"
							:document-number="tx.documentNumber"
							:flag-form="tx.flagForm"
							:reference="tx.reference"
							:url-image="tx.urlImage"
							:show-operation-number="tx.code !== 'cntc'"
							@get-data="getData($event, tx)"
						/>
					</v-flex>
					<v-layout wrap px-2 align-end mt-2 v-if="tx.code === 'cntc' && docNtc">
						<v-flex xs3 caption mb-2>Nro. Documento</v-flex>
						<v-flex xs5 px-1 mb-2>
							<v-layout wrap align-end subheading>
								{{ docNtc && docNtc.documentNumber }}
							</v-layout>
						</v-flex>
					</v-layout>
					<v-flex xs12 pt-4>
						<v-divider></v-divider>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout v-else px-4>
			<v-flex xs8>
				<v-layout mb-3 row justify-start px-2>
					<v-flex xs5 mt-2 mr-5>
						<app-input-text
							label="# Cuotas"
							model="numberQuotes"
							:text="numberQuotes"
							@input="
								$emit(
									'update-details-payments',
									$event,
									selectedDistribution,
									perceptionAmount
								)
							"
						>
						</app-input-text>
					</v-flex>
					<v-flex xs5 mt-2>
						<app-select
							label="Distribución de cuotas"
							item-text="text"
							item-value="value"
							:item="selectedDistribution"
							:items="feesDistribution"
							:return-object="false"
							v-model="selectedDistribution"
							@input="
								$emit('update-details-payments', numberQuotes, $event, perceptionAmount)
							"
						>
						</app-select>
					</v-flex>
				</v-layout>
				<v-layout mb-3 mt-2 v-for="fee in detailsPayments" :key="fee.id" px-2>
					<v-flex xs5 mr-5>
						<label class="label">
							Monto
							<v-text-field
								class="filter-select"
								hide-details
								type="number"
								min="1"
								v-model.number="fee.amount"
								@input="$emit('update-detail-payment', { fee, fieldName: 'amount' })"
							/>
						</label>
					</v-flex>
					<v-flex xs5>
						<app-date-mask
							label="Fec. Pago"
							v-model="fee.expirationDate"
							@change="
								$emit('update-detail-payment', {
									fee,
									fieldName: 'expirationDate',
								})
							"
						>
						</app-date-mask>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs4 mt-2>
				<v-flex
					:class="['outstanding-balance', { negativeBalance: balanceComputed < 0 }]"
					v-if="balanceComputed !== 0"
				>
					<span>Saldo Pendiente:</span>
					<output>{{ balanceComputed }}</output>
				</v-flex>
			</v-flex>
		</v-layout>
		<v-layout>
			<v-flex>
				<v-alert
					:value="!validatePerception && transactions.length > 0 && isCash"
					type="error"
				>
					<span> Montos inválidos </span>
				</v-alert>
				<v-alert :value="!validatePerception && detailsPayments.length > 0" type="error">
					<span> Fecha (Día/Mes/Año) o Montos inválidos </span>
				</v-alert>
			</v-flex>
		</v-layout>
		<v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					success-color="primary"
					:is-loading="
						isInvalidForm || !validatePerception || isLoading || isIncome || isDetraction
					"
					@cancel-button-clicked="$emit('cancel-button-clicked')"
					@accept-button-clicked="acceptButtonClicked"
				>
				</modal-sidebar-button>
			</section>
		</v-layout>
		<hr class="spacer mt-2 mb-4" />
		<v-layout align-center mt-4 px-4>
			<v-flex xs5>
				<v-checkbox
					color="primary"
					label="Ingresar Stock"
					v-model="flagIncome"
					hide-details
					:disabled="disabledFlagIncome"
					@change="$emit('change-flag', $event)"
				>
				</v-checkbox>
			</v-flex>
			<v-flex xs5>
				<autocomplete-component
					append-icon="arrow_drop_down"
					clearable
					http-code="$httpProducts"
					:item="warehouseId"
					item-text="name"
					item-value="id"
					:items="warehouses"
					label-value="Almacén"
					model="warehouseId"
					placeholder="Seleccionar"
					prop="name"
					resource-url="warehouses"
					return-object
					select-create
					@return-data="$emit('input', { model: 'warehouseId', value: $event })"
				></autocomplete-component>
			</v-flex>
		</v-layout>
		<v-layout mt-4 px-4 v-if="flagIncome">
			<v-flex xs5 pr-3>
				<app-date-select
					:date-formatted="dateIncome"
					:readonly="disabledFlagIncome"
					label="Fecha de ingreso"
					model="dateIncome"
					@input="$emit('set-date', $event)"
				/>
			</v-flex>
		</v-layout>
		<v-dialog persistent v-model="openNtc" max-width="700px">
			<modal-select-ntc
				v-if="openNtc"
				:id-supplier="supplier.id"
				:type-document="documents"
				@add-document-ntc="addDocNtc"
				@close-modal="openListNtc"
			/>
		</v-dialog>
	</section>
</template>

<script>
import { format } from 'date-fns';
import lib from '@/shared/lib';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import proofPayment from '@/components/shared/sales/proof-payment';
import purchasesPaymentForm from '@/components/purchases/purchases-payment-form';
import dateComponent from '@/components/shared/date-component';
import modalSelectNtc from '@/components/modal-select-ntc';

const { round } = lib;
const twoDecimals = round(2);

function created() {
	this.flagIncome = this.idPurchase ? this.flagIncomeStatus : true;
	this.tip = Number(this.summaryData?.additionalInformation?.tip || 0);
	if (this.perception) {
		this.isPerception = Boolean(this.perception.totalPerception);
		this.perceptionAmount = this.perception.totalPerception;
		this.amountTotal = this.getBaseAmount() + this.perceptionAmount;
	} else {
		this.amountTotal = this.getBaseAmount();
	}
	this.showDetractionV2 =
		this.summaryData.additionalInformation &&
		this.summaryData.additionalInformation.detraction;
	if (this.showDetractionV2) {
		this.useDetraction = true;
		this.detraction = this.summaryData.additionalInformation.detraction;
		this.detraction.typeDetraction = this.typesDetraction.find(
			(d) => d.code === this.detraction.sunatCode
		).id;
		this.detraction.amount = this.detraction.detractionAmount;
	}
}

function balanceComputed() {
	const totalFees = this.detailsPayments.reduce(
		(acc, item) => acc + Number(item.amount),
		0
	);
	if (
		this.supplier.flagPerceptionAgent &&
		this.$userInfo.company.settings.flagPerception
	) {
		const balance = this.amountTotal - totalFees;
		return Number(balance.toFixed(2));
	}
	const balance = this.amountTotal - totalFees;
	return Number(balance.toFixed(2));
}

function data() {
	return {
		feesDistribution: [
			{ value: 2, text: 'Ninguno' },
			{ value: 7, text: 'Semanal' },
			{ value: 15, text: 'Quincenal' },
			{ value: 30, text: 'Mensual' },
		],
		images: [],
		selectedDistribution: 2,
		selectedPayment: {
			id: null,
		},
		flagIncome: false,
		isLoadingLocal: this.isLoading,
		isPerception: 0,
		perceptionAmount: 0,
		amountTotal:
			Number(this.summaryData.amount || 0) +
			Number(this.summaryData?.additionalInformation?.tip || 0),
		openNtc: false,
		docNtc: null,
		useDetraction: false,
		detraction: {
			typeDetraction: null,
			percentage: null,
			amount: null,
			detractionPaid: false,
			paymentDate: null,
			receiptNumber: null,
		},
		typeDocument: null,
		showDetractionV2: false,
		tip: 0,
	};
}

function acceptButtonClicked() {
	const allExpirDate = this.detailsPayments.every((item) => item.expirationDate !== '');
	const payments = this.isCash ? this.transactions : this.detailsPayments;
	const allAmount = payments.every((item) => item.amount > 0);
	if (!allExpirDate && !this.isCash) {
		this.showNotification('Debe agregar la fecha de pago a todas las cuotas', 'error');
		return;
	}
	if (this.amountTotal && !allAmount) {
		this.showNotification('Debe agregar el monto a todas las cuotas', 'error');
		return;
	}
	const today = new Date();
	const date = today.toISOString().split('T')[0];
	this.isLoadingLocal = true;
	const perception = {
		statusPerception: this.isPerception ? 2 : undefined,
		totalPerception: this.perceptionAmount,
		perception: {
			percentagePerception: this.supplier.percentagePerception,
			datePerception: date,
			totalPerception: this.perceptionAmount,
			baseAmount: this.total,
			total: this.total + this.perceptionAmount, // El total de la compras mas la percepcion
		},
	};
	this.$emit('accept-button-clicked', {
		transactions: this.transactions,
		detailsPayments: this.detailsPayments,
		urlImages: this.images,
		perception,
		detraction: this.detraction,
	});
	// this.isLoadingLocal = false;
}

function getData({ model, newValue }, tx) {
	if (model === 'dateReference') {
		this.$set(tx.additionalInformation, model, newValue);
	} else {
		this.$set(tx, model, newValue);
	}
}

function isCash() {
	const cashMethod = this.paymentMethods.find((p) => p.code === 'CONTADO');
	if (cashMethod) {
		return this.paymentMethodId === cashMethod.id;
	}
	return false;
}

function isInvalidForm() {
	if (this.paymentMethodId === 1) {
		return this.transactions.length === 0;
	}
	return this.detailsPayments.length === 0;
}

function areCreditDatesValid() {
	return this.detailsPayments.every(
		(item) =>
			helper.isValidDate(item.expirationDate) && item.expirationDate.length === 10
	);
}

function onInput({ value }) {
	this.numberFees = value;
}

function openForm(tx) {
	if (this.selectedPayment.id) {
		this.selectedPayment.id = tx.id === this.selectedPayment.id ? null : tx.id;
	} else {
		this.selectedPayment.id = tx.id;
	}
}

function paymentMethodId() {
	if (this.paymentMethodId === 2) {
		this.$emit('update-transactions', { value: [] });
	} else {
		this.$emit('update-details-payments', { value: [] });
	}
}

function setAmount(tx) {
	this.$emit('update-transaction', tx);
}

function setImages(collection) {
	this.images = Array.isArray(collection) ? [...collection] : [];
}

function transactionsWatcher(val) {
	if (val && val.length) {
		const deposit = val.find((t) => t.code === 'deposito-bancario');
		if (deposit && !this.selectedPayment.id) {
			this.selectedPayment.id = deposit.id;
		}
	}
}

export default {
	name: 'purchases-payments',
	computed: {
		balanceComputed,
		isCash,
		isInvalidForm,
		isIncome() {
			if (this.flagIncome) {
				return Boolean(!this.dateIncome);
			}
			return false;
		},
		validatePerception() {
			const methodPayment = this.isCash ? this.transactions : this.detailsPayments;
			const total = methodPayment.reduce((acc, item) => acc + Number(item.amount), 0);
			const isAmountValid =
				Number(total.toFixed(2)) === Number(this.amountTotal.toFixed(2));
			if (!isAmountValid) return false;
			return this.isCash ? true : this.areCreditDatesValid();
		},
		isDetraction() {
			const useDetraction = this.useDetraction && !this.detraction.typeDetraction;
			if (useDetraction) return true;
			const isDetractionPaid =
				this.detraction.detractionPaid &&
				!(this.detraction.paymentDate && this.detraction.receiptNumber);
			if (isDetractionPaid) return true;
			return false;
		},
	},
	components: {
		modalSidebarButton,
		proofPayment,
		purchasesPaymentForm,
		dateComponent,
		modalSelectNtc,
	},
	created,
	data,
	props: {
		cashs: {
			default: () => [],
			type: Array,
		},
		detailsPayments: {
			default: () => [],
			type: Array,
		},
		isLoading: {
			default: false,
			type: Boolean,
		},
		isValid: {
			default: false,
			type: Boolean,
		},
		numberQuotes: {
			default: 0,
			type: Number,
		},
		paymentMethodId: {
			type: [Number, String],
		},
		summaryData: {
			default: () => {},
			type: Object,
		},
		paymentTypeIds: {
			default: () => [],
			type: Array,
		},
		paymentMethods: {
			default: () => [],
			type: Array,
		},
		paymentTypes: {
			default: () => [],
			type: Array,
		},
		transactions: {
			default: () => [],
			type: Array,
		},
		supplier: {
			default: () => {},
			type: Object,
		},
		retentionAmount: {
			default: 0,
			type: Number,
		},
		retentionTaxAmount: {
			default: 0,
			type: Number,
		},
		warehouses: {
			default: () => [],
			type: Array,
		},
		terminalName: String,
		total: {
			default: 0,
			type: Number,
		},
		warehouseId: Number,
		dateIncome: [Date, String],
		showUpdateStock: Boolean,
		flagIncomeStatus: Boolean,
		currencySelect: {
			default: () => {},
			type: Object,
		},
		cashId: [String, Number],
		idPurchase: [Number, String],
		subsidiary: {
			type: Object,
		},
		disabledFlagIncome: {
			type: Boolean,
			default: false,
		},
		perception: {
			type: Object,
		},
		documents: {
			default: () => [],
			type: Array,
		},
		showDetraction: {
			type: Boolean,
			default: false,
		},
		typesDetraction: {
			default: () => [],
			type: Array,
		},
	},
	watch: {
		transactions: {
			handler: transactionsWatcher,
			immediate: true,
		},
		paymentMethodId,
	},
	methods: {
		acceptButtonClicked,
		getData,
		onInput,
		openForm,
		setAmount,
		setImages,
		areCreditDatesValid,
		getBaseAmount() {
			return Number(this.summaryData.amount || 0) + Number(this.tip || 0);
		},
		onPaymentType(paymentTypes) {
			this.docNtc = null;
			this.$emit('update-transactions', paymentTypes, this.perceptionAmount);
		},
		addDocNtc(row) {
			this.docNtc = row;
			this.openListNtc();
			const obj = this.transactions.find((d) => d.code === 'cntc');
			obj.amount = row.amount;
			obj.ntcDocumentId = row.id;
			this.setAmount(obj);
		},
		setData(value, model) {
			if (model === 'detractionPaid') {
				this.detraction.receiptNumber = null;
				this.detraction.paymentDate = null;
			} else if (model === 'paymentDate') {
				this.$set(this.detraction, 'paymentDate', format(value, 'YYYY-MM-DD'));
			} else if (model === 'useDetraction') {
				this.useDetraction = value;
				this.detraction = {
					amount: 0,
					typeDetraction: null,
					percentage: 0,
					sunatCode: '',
					sunatName: '',
					detractionPaid: false,
					paymentDate: null,
					receiptNumber: null,
				};
			} else if (model === 'detraction') {
				this.detraction.typeDetraction = value;
				const detractionObj = this.typesDetraction.find((d) => d.id === value);
				this.detraction.percentage = detractionObj.percentage;
				this.detraction.amount = twoDecimals(
					(this.total * detractionObj.percentage) / 100
				);
				this.detraction.sunatCode = detractionObj.code;
				this.detraction.sunatName = detractionObj.description;
			} else {
				this.perceptionAmount = Number(value);
				this.amountTotal = this.getBaseAmount() + Number(value);
				if (this.detailsPayments.length) {
					this.$emit('update-details-perception', this.amountTotal);
				}
				if (this.transactions.length) {
					this.docNtc = null;
					const ids = this.paymentTypeIds.map((p) => p.paymentType.id);
					const typesPayment = this.paymentTypes.filter((p) =>
						ids.includes(p.paymentType.id)
					);

					this.$emit(
						'update-transactions',
						{
							value: typesPayment,
						},
						this.perceptionAmount
					);
				}
			}
		},
		changeValue(value) {
			if (!value) {
				this.amountTotal = this.getBaseAmount();
				this.perceptionAmount = 0;
				if (this.detailsPayments.length) {
					this.$emit('update-details-perception', this.amountTotal);
				}
				if (this.transactions.length) {
					const ids = this.paymentTypeIds.map((p) => p.paymentType.id);
					const typesPayment = this.paymentTypes.filter((p) =>
						ids.includes(p.paymentType.id)
					);
					this.$emit(
						'update-transactions',
						{
							value: typesPayment,
						},
						this.perceptionAmount
					);
				}
			}
		},
		openListNtc() {
			this.openNtc = !this.openNtc;
		},
	},
};
</script>

<style lang="scss" scoped>
.label {
	font-size: size(small);
}

.payments-container {
	padding: 20px;
}

.back-summary {
	background: map-get($colors, summary);
	color: map-get($colors, header);
	font-size: map-get($sizes, small);
	height: 55px;
	padding: 13px 9px 0;
	position: sticky;
	top: 0;
	z-index: 10;
}

.line-total {
	font-size: 31px;
	margin-top: -13px;
}

.spacer {
	border: 1px solid map-get($colors, blue-grey);
}

.line {
	font-size: 19px;
	margin-top: -5px;
}

.outstanding-balance {
	font-size: size(medium);
	position: sticky;
	top: 10%;
}

output {
	font-size: size(medium16);
}

.negativeBalance {
	color: color(error);
}

.bold {
	font-weight: bold;
}

.total-cell {
	width: 100px;
}
</style>
