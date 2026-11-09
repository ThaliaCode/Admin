<template>
	<div>
		<v-layout wrap px-2>
			<v-flex xs6 pr-2 mb-2>
				<app-select
					:item="model.bankAccountId"
					item-text="name"
					item-value="id"
					:items="bankAccounts"
					label="Cuenta Bancaria"
					model="bankAccountId"
					:readonly="readonly"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs6 pl-2 mb-2>
				<app-input-text
					label="Número de Cheque"
					model="documentNumber"
					:text="model.documentNumber"
					:readonly="readonly"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs6 pr-2>
				<app-date-select
					:date-formatted="model.additionalInformation.dateReference"
					label="Fecha de Cheque"
					model="dateReference"
					:readonly="readonly"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs6 pl-2>
				<app-input-text
					label="Beneficiario"
					model="reference"
					:text="model.reference"
					:readonly="readonly"
					@input="setData"
				/>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	import { format } from 'date-fns';
	import appDateSelect from '@/components/shared/app-date-select';
	import appSelect from '@/components/shared/app-select';

	function created() {
		this.loadResources();
	}

	async function loadResources() {
		this.model.additionalInformation.dateReference = this.dateReference ||
			this.model.additionalInformation.dateReference;
		this.model.documentNumber = this.documentNumber || this.model.documentNumber;
		this.model.reference = this.reference || this.model.reference;
		if (!this.isSale) {
			this.model.bankAccountId = this.bankAccountId || this.model.bankAccountId ||
				(this.bankAccounts && this.bankAccounts.lenght > 0 ? this.bankAccounts[0].id : null);
			this.setData({ model: 'bankAccountId', value: this.model.bankAccountId });
		}
	}

	function setData({ model, value }) {
		if (value) {
			this.model[model] = value.id || value;
			const body = { code: this.code, model, newValue: this.model[model] };
			this.$emit('get-data', body);
		}
	}

	function setDate({ model, value }) {
		this.model.additionalInformation[model] = format(value, 'YYYY-MM-DD');
		const body = { code: this.code, model, newValue: this.model.additionalInformation[model] };
		this.$emit('get-data', body);
	}

	function data() {
		return {
			model: {
				additionalInformation: {
					dateReference: null,
				},
				bankAccountId: null,
				documentNumber: null,
				reference: '',
			},
		};
	}

	export default {
		name: 'check-form',
		components: {
			appDateSelect,
			appSelect,
		},
		created,
		data,
		methods: {
			loadResources,
			setData,
			setDate,
		},
		props: {
			bankAccountId: [Number, String],
			bankAccounts: {
				default: () => [],
				type: Array,
			},
			code: [String, Number],
			documentNumber: [Number, String],
			dateReference: [Date, String, Number],
			readonly: {
				default: false,
				type: Boolean,
			},
			reference: [Number, String],
			isSale: {
				default: false,
				type: Boolean,
			},
		},
	};
</script>
