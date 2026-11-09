<template>
	<v-layout wrap pa-4>
		<v-flex xs12 mb-3>
			<app-select
				:item="model.bankAccountTypeId"
				item-text="name"
				item-value="id"
				:items="types"
				label="Tipo de cuenta bancaria"
				model="bankAccountTypeId"
				:return-object="false"
				@input="setData"
			/>
			<span class="form-group__message" v-if="!$v.model.bankAccountTypeId.required">
				El tipo de cuenta bancaria es requerido.
			</span>
		</v-flex>
		<v-flex xs12 mb-3>
			<app-input-text
				label="Nombre de la cuenta"
				model="name"
				:text="model.name"
				@input="setData"
			></app-input-text>
			<span class="form-group__message" v-if="!$v.model.name.required">
				El nombre de la cuenta es requerido.
			</span>
		</v-flex>
		<v-flex xs12 mb-3>
			<app-input-text
				label="Número de la cuenta"
				model="accountNumber"
				:text="model.accountNumber"
				@input="setData"
			></app-input-text>
			<span class="form-group__message" v-if="!$v.model.accountNumber.required">
				El número de la cuenta es requerido.
			</span>
		</v-flex>
		<v-flex xs12 mb-3>
			<app-select
				:item="model.currency"
				item-text="code"
				item-value="id"
				:items="currencies"
				label="Moneda"
				model="currency"
				@input="setData"
			/>
		</v-flex>
		<v-flex xs12>
			<app-select
				:item="model.bankId"
				item-text="name"
				item-value="id"
				:items="banks"
				label="Banco"
				model="bankId"
				@input="setData"
				:return-object="false"
			/>
			<span class="form-group__message" v-if="!$v.model.bankId.required">
				El banco es requerido.
			</span>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="createNewBank"
			/>
		</section>
	</v-layout>
</template>
<script>
import { required } from 'vuelidate/lib/validators';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadData();
}

async function loadData() {
	const requests = [this.getBanks(), this.getAccountType(), this.getCurrencies()];
	try {
		const [banks, types, currencies] = await Promise.all(requests);
		this.banks = banks.data;
		this.types = types.data;
		this.currencies = this.currencyByCountry(currencies.data);
		const userCurrency = this.$userInfo.company.currency;
		const currentCurrency = this.currencies.find((c) => c.code === userCurrency) || {};
		this.model.currency = currentCurrency.id;
		this.model.currencySymbol = currentCurrency.symbol;
	} catch (error) {
		this.showGenericError();
	}
}

function setData({ model, value }) {
	if (model === 'currency') {
		this.model.currency = value.id;
		this.model.currencySymbol = value.symbol;
	} else {
		this.model[model] = value;
	}
}

async function createNewBank() {
	const body = {
		...this.model,
		subsidiaries: [this.subsidiary],
	};
	try {
		await this.$httpSales.post('bank-account', body);
		this.showNotification('Cuenta creada con éxito');
		this.$emit('update-banks');
	} catch (error) {
		this.showGenericError();
	}
}

function validations() {
	return {
		model: {
			bankId: { required },
			cutoffDate: { required },
			initialBalance: { required },
			name: { required },
			accountNumber: { required },
			bankAccountTypeId: { required },
			currency: { required },
		},
	};
}

function data() {
	return {
		banks: [],
		currencies: [],
		model: {
			name: null,
			accountNumber: null,
			bankAccountTypeId: null,
			currency: null,
			bankId: null,
			cutoffDate: helper.formatDate(new Date(), 'YYYY-MM-DD'),
			initialBalance: 0,
			currencySymbol: null,
		},
		types: [],
	};
}
export default {
	name: 'new-account-bank-slider',
	created,
	components: {
		modalSidebarButton,
	},
	data,
	props: {
		subsidiary: {
			type: Number,
		},
	},
	methods: {
		loadData,
		setData,
		createNewBank,
	},
	validations,
};
</script>
