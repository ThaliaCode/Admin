<template>
	<div>
		<v-layout wrap>
			<v-flex xs6 pr-2 mb-2>
				<app-input-text
					label="# Voucher"
					model="documentNumber"
					:text="model.documentNumber"
					:readonly="readonly"
					@input="setData"
				/>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	import appSelect from '@/components/shared/app-select';

	function created() {
		this.loadResources();
	}

	function cardId(value) {
		if (value > 0 && !this.isSale) {
			this.setData({ model: 'bankAccountId', value: this.bankAccounts[0] });
		} else if (this.isSale) {
			this.model.bankAccountId = null;
		}
	}

	function loadResources() {
		if (!this.isSale) {
			this.model.bankAccountId = this.bankAccountId || this.model.bankAccountId ||
				(this.bankAccounts && this.bankAccounts.length > 0 ? this.bankAccounts[0].id : null);
			this.setData({ model: 'bankAccountId', value: this.model.bankAccountId });
		}
		this.model.documentNumber = this.documentNumber || this.model.documentNumber;
	}

	function setData({ model, value }) {
		if (value) {
			this.model[model] = value.id || value;
			const body = { code: this.code, model, newValue: this.model[model] };
			this.$emit('get-data', body);
		}
	}

	function data() {
		return {
			model: {
				bankAccountId: null,
				documentNumber: null,
			},
		};
	}

	export default {
		name: 'card-form',
		components: {
			appSelect,
		},
		created,
		data,
		methods: {
			loadResources,
			setData,
		},
		props: {
			bankAccountId: [Number, String],
			bankAccounts: {
				default: () => [],
				type: Array,
			},
			cardId: [Number, String],
			code: [String, Number],
			documentNumber: [Number, String],
			readonly: {
				default: false,
				type: Boolean,
			},
			isSale: {
				default: false,
				type: Boolean,
			},
		},
		watch: {
			cardId,
		},
	};
</script>
