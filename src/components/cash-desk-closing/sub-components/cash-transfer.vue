<template>
	<div>
		<v-layout class="back-gray py-2 px-3" align-center>
			<v-flex>
				<v-layout column>
					<v-flex>
						<label class="label">Caja de Origen:</label>
					</v-flex>
					<v-flex class="primary--text bold">
						{{ cashOrigin }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs6 pr-3 pt-1>
				<app-select
					label="Caja Destino"
					model="cashDestinationId"
					item-text="name"
					item-value="id"
					:items="cashData"
					@input="getData"
				/>
				<span class="form-group__message" v-if="$v.model.cashDestinationId.$invalid">
					El destino es requerido
				</span>
			</v-flex>
		</v-layout>
		<v-divider></v-divider>
		<v-layout class="back-gray px-3 py-2">
			<v-flex xs8>EFECTIVO EN CAJA</v-flex>
			<v-flex xs4>{{ currentSymbol }} {{ amount.cash }}</v-flex>
		</v-layout>
		<v-divider></v-divider>
		<v-layout class="back-gray px-3 py-2">
			<v-flex xs7 pt-1>Monto en Efectivo a Transferir</v-flex>
			<v-flex xs5>
				<app-input-text
					model="amount"
					type="number"
					:text="model.amount"
					@input="getData"
				></app-input-text>
				<template v-if="!$v.model.amount.minValue">
					<span class="form-group__message"> El monto es debe ser mayor a 0. </span>
				</template>
				<template v-else-if="!$v.model.amount.maxValue">
					<span class="form-group__message">
						El monto no debe ser mayor a efectivo en caja
					</span>
				</template>
			</v-flex>
		</v-layout>
		<v-divider></v-divider>
		<v-layout class="back-gray px-3 py-2">
			<v-flex xs8>Monto Tarj. de Crédito a transferir</v-flex>
			<v-flex v-if="!amount.cash && !amount.card && !amount.check">
				<v-icon color="error" xs1>priority_high</v-icon>
			</v-flex>
			<v-flex xs3>{{ currentSymbol }} {{ amount.card }}</v-flex>
		</v-layout>
		<v-divider></v-divider>
		<v-layout class="back-gray px-3 py-2">
			<v-flex xs8>Monto Cheque a transferir</v-flex>
			<v-flex v-if="!amount.cash && !amount.card && !amount.check">
				<v-icon color="error" xs1>priority_high</v-icon>
			</v-flex>
			<v-flex xs3>{{ currentSymbol }} {{ amount.check }}</v-flex>
		</v-layout>
		<v-divider></v-divider>
		<v-container>
			<v-layout wrap mb-3>
				<!-- <v-flex xs6 pr-3 pt-1>
					<app-select
						label="Destino"
						model="cashDestinationId"
						item-text="name"
						item-value="id"
						:items="cashData"
						@input="getData"
					/>
					<span class="form-group__message" v-if="$v.model.cashDestinationId.$invalid">
						El destino es requerido
					</span>
				</v-flex> -->
				<v-flex xs6 pr-3>
					<label class="caption caption-date">Fecha</label>
					<date-component
						:date="model.paymentDate"
						icon="/static/img/calendar.svg"
						@on-input="getData({ model: 'paymentDate', value: $event })"
					></date-component>
					<span class="form-group__message" v-if="$v.model.paymentDate.$invalid">
						La fecha es requerida
					</span>
				</v-flex>
				<v-flex xs6>
					<app-text-field
						label="Número de documento (Opcional)"
						v-model="model.documentNumber"
					/>
				</v-flex>
			</v-layout>
			<v-layout wrap>
				<v-flex xs6 pr-3>
					<app-text-field label="Referencia" v-model="model.reference" />
				</v-flex>
				<v-flex xs6>
					<app-text-field label="Concepto" v-model="model.concept" />
					<!-- <span class="form-group__message" v-if="$v.model.concept.$invalid">
						El concepto es requerido
					</span> -->
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					success-color="primary"
					:is-loading="
						$v.$invalid || disabled || (!amount.cash && !amount.card && !amount.check)
					"
					@cancel-button-clicked="closeModal"
					@accept-button-clicked="acceptClicked"
				/>
			</section>
		</v-container>
	</div>
</template>

<script>
import { format } from 'date-fns';
import { minValue, required, maxValue } from 'vuelidate/lib/validators';
import appTextField from '@/components/shared/app-input-text';
import appSelect from '@/components/shared/app-select';
import appDateSelect from '@/components/shared/app-date-select';
import dateComponent from '@/components/shared/date-component';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import TypePaymentForm from '@/shared/type-payment-form';

function created() {
	this.currentSymbol = this.currency === 'USD' ? '$' : 'S/.';
	this.loadResources();
}

function acceptClicked() {
	this.$emit('cash-transfer', this.model, this.dataSelected);
}

function closeModal() {
	this.clearModal();
	this.$emit('close-modal');
}

function clearModal() {
	this.model = {
		amount: 0,
		concept: '',
		paymentDate: '',
		cashDestinationId: 0,
		documentNumber: '',
		reference: '',
	};
}

function getData({ model, value }) {
	if (model === 'amount') {
		this.model[model] = Number(value);
	} else {
		this.model[model] =
			model === 'paymentDate' ? format(value, 'YYYY-MM-DD-HH-mm-ss') : value.id;
	}
}

async function loadResources() {
	// const body = {
	// 	cashIds: [this.cashs[0].id],
	// 	warehouseId: this.$userInfo.warWarehousesId,
	// };
	const request = [
		this.getTypePayments('sales'),
		// this.$httpSales.get('cash', { params: { flagActive: 1, subsidiaryId: this.subsidiaryId } }),
		// this.$httpSales.post(`cash/${this.currency}/report`, body),
		this.$httpSales.get('cash', {
			params: { flagActive: 1, subsidiaryId: this.subsidiaryId },
		}),
		// this.$httpSales.post(`cash/${this.currency}/report`, body),
	];
	[
		{ data: this.typePayments },
		{ data: this.cashData },
		// { data: this.infoCash },
	] = await Promise.all(request);
	this.typePayments = this.typePayments.map((tp) => tp.paymentType);
	this.loadGetAmount();
	// this.filterTypePayment = this.typePayments.filter(p => p.flagForm === 1);
	// const indexCash = this.infoCash.detail.findIndex(i => i.code === 'efectivo');
	// this.amount.cash = indexCash > -1 ? this.infoCash.detail[indexCash].amount : 0;
	if (this.dataSelected.length > 0) {
		const selectCard = this.dataSelected.filter(
			(d) => d.typePayment.flagForm === TypePaymentForm.Card
		);
		const selectCheck = this.dataSelected.filter(
			(d) => d.typePayment.flagForm === TypePaymentForm.Check
		);
		this.amount.card = selectCard.length
			? selectCard.reduce((a, d) => a + d.amount, 0)
			: 0;
		this.amount.check = selectCheck.length
			? selectCheck.reduce((a, d) => a + d.amount, 0)
			: 0;
	}
}

function validations() {
	return {
		model: {
			amount: {
				minValue: minValue(1),
				required,
				maxValue: maxValue(this.amount.cash),
			},
			cashDestinationId: {
				minValue: minValue(1),
				required,
			},
			paymentDate: {
				required,
			},
		},
	};
}

async function loadGetAmount() {
	const filterPayment = this.typePayments.find((p) => p.code === 'efectivo');
	const typePayment = filterPayment && filterPayment.id;
	try {
		const params = {
			cashIds: this.cashsId,
			currency: this.currency,
			subsidiaryId: this.subsidiaryId,
			typePaymentIds: typePayment || undefined,
		};
		const response = await this.$httpSales.get(`cash-balance-total/${this.currency}`, {
			params,
		});
		this.amount.cash = response.data.totalCash;
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		model: {
			amount: 0,
			cashDestinationId: 0,
			concept: '',
			documentNumber: '',
			paymentDate: '',
			reference: '',
		},
		typePayments: [],
		cashData: [],
		infoCash: {},
		cashOnHand: 0,
		currentSymbol: '',
		amount: {
			cash: 0,
			check: 0,
			card: 0,
		},
	};
}

export default {
	name: 'cash-transfer',
	components: {
		appDateSelect,
		appSelect,
		appTextField,
		dateComponent,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		acceptClicked,
		clearModal,
		closeModal,
		getData,
		loadGetAmount,
		loadResources,
	},
	props: {
		dataSelected: {
			default: () => [],
			type: Array,
		},
		currency: String,
		cashs: {
			default: () => [],
			type: Array,
		},
		subsidiaryId: [String, Number],
		cashOrigin: String,
		cashsId: [String, Number],
		disabled: {
			default: false,
			type: Boolean,
		},
		// filterTypePayment: {
		// 	default: () => [],
		// 	type: Array,
		// },
	},
	validations,
};
</script>
<style lang="scss" scoped>
.back-gray {
	background: map-get($colors, background-gray);
}

.label {
	color: #8f8f8f;
	font-size: size(small);
}

.bold {
	font-weight: bold;
}
</style>
