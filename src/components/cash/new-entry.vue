<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 mb-3>
				<span v-if="onlyRead" class="data-text">
					{{ readData.caja }}
				</span>
				<v-select
					v-else
					label="Caja"
					:items="cash"
					single-line
					item-text="name"
					item-value="id"
					bottom
					disabled
					hide-details
					v-model="model.cashId"
					class="filter-select"
				></v-select>
			</v-flex>
			<v-flex xs6 mb-3 pr-2>
				<app-date-select
					label="Fecha"
					:date-formatted="model.paymentDate"
					model="paymentDate"
					@input="setDate"
				/>
				<span class="form-group__message" v-if="!$v.model.paymentDate.required">
					La fecha es requerida.
				</span>
			</v-flex>
			<v-flex xs6 mb-3 pl-2>
				<label class="caption">Tipo de moneda</label>
				<span v-if="readData" class="data-text">
					{{ readData.moneda }}
				</span>
				<v-select
					v-else
					label="Tipo de Moneda"
					:items="currencies"
					single-line
					item-text="name"
					item-value="id"
					bottom
					disabled
					hide-details
					v-model="model.currency"
					class="filter-select"
				></v-select>
				<span class="form-group__message" v-if="!$v.model.currency.required">
					El campo es requerido.
				</span>
			</v-flex>
			<v-flex xs12 mb-3 v-if="type === 'new-entry'">
				<v-select
					label="Origen"
					:items="modulesActive"
					single-line
					item-text="name"
					item-value="id"
					bottom
					hide-details
					v-model="model.moduleOriginId"
					class="filter-select"
					@change="getTypePayments"
				></v-select>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-select
					label="Tipo de Pago"
					:items="typePayments"
					single-line
					item-text="paymentType.name"
					item-value="paymentType.id"
					bottom
					hide-details
					v-model="model.typePaymentId"
					class="filter-select"
				></v-select>
				<span class="form-group__message" v-if="!$v.model.typePaymentId.required">
					El tipo de pago es requerido.
				</span>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-text-field
					class="filter-select"
					label="Importe"
					v-model="model.amount"
					type="number"
				>
				</v-text-field>
				<span class="form-group__message" v-if="!$v.model.amount.required">
					El importe es requerido.
				</span>
			</v-flex>
			<v-flex xs12 mb-3 v-if="isBank">
				<v-select
					label="Cuenta Bancaria"
					:items="bankAccounts"
					single-line
					item-text="name"
					item-value="id"
					v-model="model.bankAccountId"
					bottom
					hide-details
					class="filter-select"
				></v-select>
			</v-flex>
			<v-flex xs12 mb-3 v-else>
				<v-text-field
					class="filter-select"
					label="# VOUCHER"
					v-model="model.documentNumber"
				></v-text-field>
			</v-flex>
			<v-flex xs12>
				<v-text-field
					no-resize
					multi-line
					class="textarea-content filter-select mt-3"
					label="Comentario"
					v-model="model.additionalInformation.comment"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid || loading"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="createEntry"
			/>
		</section>
	</div>
</template>
<script>
import { format } from 'date-fns';
import { required } from 'vuelidate/lib/validators';
import dateComponent from '@/components/shared/date-component';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import typePaymentForm from '@/shared/type-payment-form';

async function getTypePayments(id) {
	this.typePayments = [];
	const module = this.modulesActive.find((m) => m.id === id);
	const params = {
		flagType: 1,
		moduleCode: module ? module.code : 'CAJA',
	};
	const { data: typePayments } = await this.$httpSales.get('type-payments', { params });
	this.typePayments = typePayments;
}

function created() {
	this.model.cashId = this.cashId;
	this.model.currency =
		this.currencies.length === 1 ? this.currencies[0].id : this.currencyEntry;
	this.model.paymentDate = format(this.$today(), 'YYYY/MM/DD');
	this.model.moduleOriginId = 5; // 5 es caja
	this.getTypePayments(this.model.modelOrigin);
}

function changePaymentId(value) {
	const index = this.typePayments.findIndex((t) => t.comTypePaymentId === value);
	const payment = this.typePayments[index];
	if (index > -1) {
		this.isBank = payment.paymentType.flagForm === typePaymentForm.Deposit;
	}
}

function setData({ model, value }) {
	if (model === 'paymentDate') {
		let newValueModel;
		if (value) {
			if (value.indexOf('/') > -1) {
				const newValue = value.split('/');
				newValueModel = `20${newValue[2]}-${newValue[1]}-${newValue[0]}`;
			} else if (value.length === 6) {
				const newValue = value.split('');
				newValueModel = `20${newValue[4]}${newValue[5]}-${newValue[2]}${newValue[3]}-${newValue[0]}${newValue[1]}`;
			} else {
				newValueModel = value;
			}
		}
		this[model] = newValueModel || null;
	}
	this.model[model] = model === 'paymentDate' ? this[model] : value;
}

function setDate({ model, value }) {
	this.model[model] = format(value, 'YYYY/MM/DD');
}

async function createEntry() {
	this.loading = true;
	this.model.amount =
		this.type === 'new-entry'
			? Number(this.model.amount)
			: Number(this.model.amount) * -1;
	this.model.paymentDate = format(this.model.paymentDate, 'YYYY-MM-DD');
	this.model.paymentAmount = this.model.amount;
	this.model.typeMovement = this.type === 'new-entry' ? 1 : 2;
	this.model.subsidiaryId = Number(this.subsidiaryId);
	try {
		await this.$httpSales.post('transactions', this.model);
		this.$emit('update-cash');
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loading = false;
	}
}

function validations() {
	return {
		model: {
			amount: { required },
			cashId: { required },
			paymentDate: { required },
			currency: { required },
			typePaymentId: { required },
		},
	};
}
function data() {
	return {
		model: {
			amount: null,
			bankAccountId: null,
			cashId: null,
			currency: null,
			moduleOriginId: null,
			typePaymentId: null,
			documentNumber: null,
			paymentDate: null,
			typeTransaction: 1,
			typeMovement: 1,
			additionalInformation: {
				comment: null,
			},
		},
		loading: false,
		isBank: false,
		paymentDate: null,
		typePayments: [],
	};
}
export default {
	name: 'new-entry',
	components: {
		dateComponent,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		setData,
		setDate,
		createEntry,
		getTypePayments,
	},
	props: {
		cash: {
			default: () => [],
			type: Array,
		},
		currencies: {
			default: () => [],
			type: Array,
		},
		modules: {
			default: () => [],
			type: Array,
		},
		bankAccounts: {
			default: () => [],
			type: Array,
		},
		cashId: [String, Number],
		currencyEntry: [String, Number],
		subsidiaryId: [Number, String],
		modelOrigin: [Number, String],
		type: String,
		onlyRead: {
			default: false,
			type: Boolean,
		},
	},
	computed: {
		readData() {
			if (!this.cash.length) {
				return {
					caja: '',
					moneda: '',
				};
			}

			const caja = this.cash.find((obj) => obj.id === this.model.cashId).name;
			const moneda = this.currencies.find((obj) => obj.id === this.model.currency).name;

			return {
				caja,
				moneda,
			};
		},
		modulesActive() {
			if (!this.modules.length) {
				return [];
			}
			// 5 y 6 son caja y banco
			return this.modules.filter((m) => [5, 6].includes(m.id));
		},
	},
	validations,
	watch: {
		'model.typePaymentId': changePaymentId,
	},
};
</script>

<style lang="scss" scoped>
.data-text {
	border: 0.5px solid color(silver-detail-table) !important;
	background-color: color(white);
	border-radius: 5px;
	display: block;
	font-size: 0.9rem;
	padding: 5px;
}
</style>
