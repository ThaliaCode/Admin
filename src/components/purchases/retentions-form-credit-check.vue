<template>
	<div>
		<!-- <p class="text-title mx-3 px-2">RETENCIÓN</p>
		<v-layout wrap align-end px-4 mb-3>
			<v-flex xs12 pb-2 body-1>
				<v-layout row wrap>
					<v-flex xs3 pt-2>
						<label class="caption">Retención Serie - Nro</label>
					</v-flex>
					<v-flex xs9>
						<v-layout row wrap>
							<v-flex xs5 pr-2>
								<app-input-text
									model="serie"
									:text="model.serie"
									:max-length="maxLengthSerie"
									@input="setRetentionData"
								></app-input-text>
							</v-flex>
							<v-flex xs5 pr-2>
								<app-input-text
									model="number"
									:text="model.number"
									type="number"
									@input="setRetentionData"
								></app-input-text>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout> -->
		<v-layout wrap class="container-totals" px-4 mt-4 py-3>
			<v-flex xs6>
				<v-flex xs9>
					<app-input-text
						label="Valor Neto"
						:text="netWorth | round"
						readonly
						type="number"
					/>
				</v-flex>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="isLoading || disabled"
				@cancel-button-clicked="$emit('cancel-modal')"
				@accept-button-clicked="save"
			/>
		</section>
	</div>
</template>

<script>
	import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
	import dateComponent from '@/components/shared/date-component';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function save() {
		this.$emit('save-check', this.netWorth);
	}
	
	function setRetentionData($event) {
		this.$emit('set-data', $event, 'modelCheck');
	}

	function netWorth() {
		return Number(this.totalCredited);
	}

	function changeNetWorth(value) {
		this.$emit('change-total', value);
	}

	function disabled() {
		return !this.model.dateDocument || !this.model.bankAccountId;
	}

	function maxLengthSerie() {
		return this.isEcuador ? 6 : null;
	}

	function data() {
		return {
			groupCodes: [
				{
					accountingCode: 0,
					bases: [
						{
							code: null,
							description: 'Base',
							id: null,
							percentage: 0,
							value: 0,
						},
					],
					basesTotal: 0,
					retentionAmount: 0,
					retentionCode: null,
					retentionPercentage: 0,
					subtotal: 0,
				},
			],
		};
	}

	export default {
		name: 'retentions-form',
		components: {
			autocompleteComponent,
			dateComponent,
			modalSidebarButton,
		},
		computed: {
			maxLengthSerie,
			netWorth,
			disabled,
		},
		data,
		methods: {
			save,
			setRetentionData,
		},
		props: {
			bases: {
				default: () => [],
				type: Array,
			},
			readonly: {
				deafult: false,
				type: Boolean,
			},
			fromSale: {
				deafult: false,
				type: Boolean,
			},
			model: {
				default: () => {},
				type: Object,
			},
			totalCredited: [String, Number],
			isLoading: {
				deafult: false,
				type: Boolean,
			},
		},
		watch: {
			netWorth: changeNetWorth,
		},
	};
</script>

<style lang="scss" scoped>
	.subheader-container {
		background-color: map-get($colors, hover-background-action);
		color: map-get($colors, paginationText);
	}

	.subheader {
		height: 34px;
	}

	.summary {
		background-color: map-get($colors, summary);
		border-bottom: 1px solid map-get($colors, blue-grey);
		border-right: 1px solid map-get($colors, blue-grey);

		.caption {
			font-weight: bold;
		}

		&-header {
			background-color: map-get($colors, summaryHeader);
			border-bottom: 1px solid map-get($colors, blue-grey);
		}

		&:last-of-type {
			border-right: 0px;
		}
	}

	.form-group__message {
		position: absolute;
	}

	.pos-relative {
		position: relative;
	}

	.margin-left-auto {
		margin-left: auto;
	}

	.error-caption {
		font-size: size(small10);
		position: absolute;
	}

	.label-customer {
		color: color(paginationText);
		font-family: font(open-regular);
		font-size: size(small13);
	}

	.label-document {
		font-family: font(open-semibold);
		padding-right: 15px;
	}

	.mx-datepicker {
		display: block !important;
	}

	.text-title {
		color: map-get($colors, paginationText);
		border-bottom: 1px solid map-get($colors, item-select);
		font-size: 14px;
	}

	.container-totals {
		background-color: map-get($colors, hover-background-action);
		border-top: 2px solid map-get($colors, primary);
	}
</style>
