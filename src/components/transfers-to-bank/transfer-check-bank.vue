<template>
	<div>
		<v-layout wrap px-2>
			<v-flex xs12 sm3 px-2 pb-3>
				<app-input-text
					label="Monto"
					model="amount"
					readonly
					:text="amount"
				/>
			</v-flex>
			<v-flex xs12>
				<check-form
					:amount="amount"
					:bank-account-id="bankAccountId"
					:bank-accounts="bankAccounts"
					:date-reference="dateReference"
					:document-number="documentNumber"
					:reference="reference"
					@get-data="getData"
				/>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('save')"
			/>
		</section>
	</div>
</template>

<script>
	import checkForm from '@/components/shared/type-payment-forms/check-form';
	import modalSidebarButton from './../shared/utils/modal-sidebar-button';

	function created() {
		this.loadResources();
	}

	function getData({ model, newValue }) {
		if (model === 'dateReference') {
			this.model.additionalInformation[model] = newValue;
		} else {
			this.model[model] = newValue;
		}
		this.$emit('get-data', { model, newValue });
	}

	async function loadResources() {
		({ data: this.bankAccounts } = await this.$httpSales.get('bank-account'));
	}

	function data() {
		return {
			bankAccounts: [],
			model: {
				additionalInformation: {
					dateReference: null,
				},
				bankAccountId: null,
				documentNumber: '',
				reference: '',
			},
		};
	}

	export default {
		name: 'transfer-check-bank',
		components: {
			checkForm,
			modalSidebarButton,
		},
		created,
		data,
		methods: {
			getData,
			loadResources,
		},
		props: {
			amount: [Number, String],
			bankAccountId: [Number, String],
			dateReference: [Date, String],
			disabled: {
				default: false,
				type: Boolean,
			},
			documentNumber: [Number, String],
			reference: String,
		},
	};
</script>

<style lang="scss" scoped>
	.label-title {
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-semibold);
		font-size: 13px;
		text-transform: uppercase;
	}
</style>
