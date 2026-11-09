<template>
	<div>
		<v-layout wrap align-center pa-3>
			<v-flex xs3 px-2 pb-3>
				<app-input-text
					label="Monto"
					model="amount"
					readonly
					:text="amount"
				/>
			</v-flex>
			<v-flex xs12>
				<card-form
					:bank-account-id="bankAccountId"
					:bank-accounts="bankAccounts"
					:card-id="cardId"
					:document-number="documentNumber"
					@get-data="setValue"
				/>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	import appInputText from '@/components/shared/app-input-text';
	import appSelect from '@/components/shared/app-select';
	import cardForm from '@/components/shared/type-payment-forms/card-form';

	function created() {
		this.loadResources();
	}

	async function loadResources() {
		({ data: this.bankAccounts } = await this.$httpSales.get('bank-account'));
	}

	function setValue({ model, newValue }) {
		const body = { model, newValue };
		this.$emit('set-data', body);
	}

	function data() {
		return {
			bankAccounts: [],
		};
	}

	export default {
		name: 'general-data',
		components: {
			appInputText,
			appSelect,
			cardForm,
		},
		created,
		data,
		methods: {
			loadResources,
			setValue,
		},
		props: {
			amount: [Number, String],
			bankAccountId: [Number, String],
			cardId: [Number, String],
			documentNumber: [Number, String],
		},
	};
</script>
