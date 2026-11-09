<template>
	<div>
		<v-layout wrap pa-3>
			<v-flex xs6 pr-1 mb-2>
				<app-input-text
					label="Saldo"
					readonly
					model="totalToPay"
					:text="totalToPay"
					type="number"
				></app-input-text>
			</v-flex>
			<v-flex xs6 pl-1 mb-2>
				<app-select
					:item="movement.typePaymentId"
					item-text="name"
					item-value="id"
					:items="paymentsType"
					label="Tipo de Pago"
					model="typePaymentId"
					@input="isActiveForm($event)"
				></app-select>
			</v-flex>
			<v-flex xs6 pr-1 mb-2>
				<label class="caption">Fecha de pago</label>
				<date-component
					:date="date"
					icon="/static/img/calendar.svg"
					@on-input="setDate({ value: $event, model: 'paymentDate' })"
				></date-component>
				<span class="form-group__message" v-if="!movement.additionalInformation.paymentDate">
					La fecha de pago es requerida
				</span>
			</v-flex>
			<v-flex xs6 pl-1 mb-2>
				<app-input-text
					label="Importe"
					model="amount"
					:text="movement.amount"
					type="number"
					@input="setDataAmount({ value: $event, model: 'amount' })"
				></app-input-text>
				<span v-if="showErrAmount" class="form-group__message">
					El monto es requerido
				</span>
			</v-flex>
			<v-flex xs12>
				<bank-deposit-form
					v-if="forms.Deposit"
					:bank-account-id="bankAccountId"
					:bank-accounts="bankAccounts"
					:document-number="movement.documentReference"
					:date-reference="movement.additionalInformation.dateReference"
					:url-image="movement.urlImage"
					@get-data="setData"
				/>
			</v-flex>
			<v-flex xs12 py-1 px-2>
				<card-form
					v-if="forms.Card"
					:bank-account-id="bankAccountId"
					:bank-accounts="bankAccounts"
					:document-number="movement.documentReference"
					@get-data="setData"
				/>
			</v-flex>
			<v-flex xs12 py-1>
				<check-form
					v-if="forms.Check"
					:bank-account-id="bankAccountId"
					:bank-accounts="bankAccounts"
					:document-number="movement.documentReference"
					:date-reference="movement.additionalInformation.dateReference"
					:reference="movement.reference"
					@get-data="setData"
				/>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabledButton"
				@cancel-button-clicked="$emit('cancel')"
				@accept-button-clicked="savePay"
			></modal-sidebar-button>
		</section>
	</div>
</template>
<script>
import { format } from 'date-fns';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import dateComponent from '@/components/shared/date-component';
import TypePaymentForm from '@/shared/type-payment-form';
import bankDepositForm from '@/components/shared/type-payment-forms/bank-deposit-form';
import cardForm from '@/components/shared/type-payment-forms/card-form';
import checkForm from '@/components/shared/type-payment-forms/check-form';

function setDate({ model, value }) {
	this.date = value;
	this.movement.additionalInformation[model] = format(value, 'YYYY-MM-DD');
}

function isActiveForm(typePayment) {
	if (typePayment) {
		const paymentTypeSelected = this.paymentsType.find(pt => pt.id === typePayment.value.id) ||
			{};
		const typeForms = Object.keys(TypePaymentForm);
		const typeForm = typeForms.find(tf =>
			TypePaymentForm[tf] === paymentTypeSelected.flagForm) || {};
		this.forms = { [typeForm]: true };
		if (typeForm === 'Cash') {
			this.bankAccountId = null;
			this.movement.bankAccountId = this.bankAccountId;
		}
		this.movement.typePaymentId = typePayment.value.id;
	}
}

function setDataAmount({ model, value }) {
	this.movement[model] = Number(value.value);
	this.showErrAmount = Number(value.value) <= 0;
}

function setData({ model, newValue }) {
	this.movement[model] = newValue;
}

function disabledButton() {
	return this.showErrAmount || !this.movement.additionalInformation.paymentDate || this.loading;
}

function created() {
	this.totalToPay = this.sale.debtAmount;
	this.movement.moduleCode = 'CTAXCOB';
	this.movement.cashId = this.sale.cashId;
	this.movement.currency = this.sale.currency;
	this.movement.additionalInformation.documentNumber = this.sale.documentNumber;
	this.movement.additionalInformation.salDocumentId = this.sale.id;
	this.bankAccountId = this.sale.bankAccountId || this.bankAccounts[0].id;
}

async function savePay() {
	const body = { ...this.movement };
	try {
		await this.$httpSales.post('collection-transaction', body);
		this.showNotification('La acción se realizó correctamente');
		this.$emit('update-list');
	} catch (error) {
		this.showGenericError();
	}
}


function data() {
	return {
		movement: {
			additionalInformation: {},
		},
		totalToPay: 0,
		date: null,
		bankAccountId: null,
		forms: {
			Deposit: false,
			Card: false,
			Check: false,
		},
		loading: false,
		showErrAmount: true,
	};
}

export default {
	name: 'collect-from-sale',
	data,
	created,
	components: {
		modalSidebarButton,
		dateComponent,
		bankDepositForm,
		cardForm,
		checkForm,
	},
	methods: {
		setDate,
		setDataAmount,
		isActiveForm,
		setData,
		savePay,
	},
	computed: {
		disabledButton,
	},
	props: {
		paymentsType: {
			type: Array,
			default: () => [],
		},
		sale: {
			type: Object,
			default: () => {},
		},
		bankAccounts: {
			type: Array,
			default: () => [],
		},
	},
};
</script>