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
				<v-layout wrap px-2>
					<v-flex xs5 pr-2 mb-2>
						<app-select
							:item="model.bankAccountId"
							item-text="name"
							item-value="id"
							:items="bankAccounts"
							label="Cuenta Bancaria"
							model="bankAccountId"
							:return-object="false"
							@input="getData"
						/>
					</v-flex>
					<v-flex xs3 px-2 mb-2>
						<app-date-mask
							label="Fecha"
							v-model="valueDateReference"
							@format-date="getData"
						/>
					</v-flex>
					<v-flex xs4 pl-2 pr-3 mb-2>
						<app-input-text
							label="# Documento"
							model="documentNumber"
							:text="model.documentNumber"
							@input="getData"
						/>
					</v-flex>
				</v-layout>
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
	import helper from '@/shared/helper';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	const { exactDate } = helper;

	function created() {
		this.loadResources();
	}

	function getData({ model, value }) {
		if (model === 'dateReference') {
			this.model.additionalInformation[model] = value;
		} else {
			this.model[model] = value;
		}
		this.$emit('get-data', { model, newValue: value });
	}

	async function loadResources() {
		({ data: this.bankAccounts } = await this.$httpSales.get('bank-account'));
		this.valueDateReference = exactDate(this.$today(), 'DD/MM/YYYY');
		this.getData({ model: 'dateReference', value: exactDate(this.$today(), 'YYYY-MM-DD') });
	}

	function data() {
		return {
			bankAccounts: [],
			model: {
				additionalInformation: {
					dateReference: null,
				},
				bankAccountId: null,
				documentNumber: null,
			},
			valueDateReference: null,
		};
	}

	export default {
		name: 'transfer-cash-bank',
		components: {
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
