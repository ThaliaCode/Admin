<template>
	<v-dialog :value="value" max-width="450px" persistent>
		<v-card>
			<v-card-title class="headline primary--text justify-center">
				{{ title }}
			</v-card-title>

			<v-card flat class="px-4">
				<v-form ref="form" v-model="valid">
					<label class="caption">Tipos de detracciones</label>
					<v-select
						bottom
						single-line
						hide-details
						class="filter-select mb-2"
						content-class="filter-select-content"
						item-text="description"
						item-value="id"
						:items="typesDetraction"
						v-model="detractionId"
						@change="onDetractionChange"
					></v-select>

					<div v-if="showBankAccount">
						<label class="caption">Nro de cuenta bancaria</label>
						<v-text-field
							bottom
							single-line
							hide-details
							disabled
							class="filter-select shadow-inset mb-2"
							content-class="filter-select-content"
							v-model="localCreateDetraction.bankAccount"
						></v-text-field>
					</div>

					<label class="caption">Porcentaje</label>
					<v-text-field
						bottom
						single-line
						hide-details
						disabled
						class="filter-select shadow-inset mb-3"
						content-class="filter-select-content"
						v-model="localCreateDetraction.percentage"
					></v-text-field>

					<div v-if="!showBankAccount">
						<v-checkbox
							class="label-switch mb-2"
							color="primary"
							hide-details
							label="Detracción Pagada"
							v-model="localCreateDetraction.detractionPaid"
							@change="setData($event, 'detractionPaid')"
						></v-checkbox>
					</div>

					<div v-if="localCreateDetraction.detractionPaid">
						<label class="caption">Nro de constancia</label>
						<v-text-field
							bottom
							single-line
							hide-details
							class="filter-select shadow-inset mb-2"
							content-class="filter-select-content"
							v-model="localCreateDetraction.receiptNumber"
						></v-text-field>

						<label class="caption">Fecha de pago</label>
						<date-component
							class="mb-2"
							:key="`date-${localCreateDetraction.paymentDate || 'empty'}`"
							:date="localCreateDetraction.paymentDate"
							icon="/static/img/calendar.svg"
							@on-input="setData($event, 'paymentDate')"
						></date-component>
					</div>
				</v-form>
			</v-card>

			<v-card-actions class="justify-center">
				<modal-sidebar-button
					:is-loading="!localCreateDetraction.percentage"
					@cancel-button-clicked="$emit('cancel')"
					@accept-button-clicked="onAccept"
				/>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import dateComponent from '@/components/shared/date-component';
import lib from '@/shared/lib';

const { round } = lib;
const twoDecimals = round(2);

export default {
	name: 'modal-detraction',
	components: {
		modalSidebarButton,
		dateComponent,
	},
	props: {
		value: {
			type: Boolean,
			default: false,
		},
		showBankAccount: {
			type: Boolean,
			default: true,
		},
		detractionPaid: {
			type: Boolean,
			default: false,
		},
		title: {
			type: String,
			default: 'Registrar datos de detracción',
		},
		detraction: {
			type: Object,
			default: () => ({
				amount: null,
				percentage: null,
				bankAccount: null,
				detractionTypeId: null,
				detractionTypeName: null,
			}),
		},
		totalAmount: {
			type: Number,
			default: 0,
		},
	},
	data() {
		return {
			valid: true,
			typesDetraction: [],
			detractionId: null,
			localCreateDetraction: {
				amount: null,
				percentage: null,
				bankAccount: null,
				detractionTypeId: null,
				detractionTypeName: null,
				paymentDate: null,
				receiptNumber: null,
				detractionPaid: false,
			},
			detractionSelect: null,
		};
	},
	watch: {
		value(val) {
			if (val) {
				this.loadSunat();
				this.localCreateDetraction = {
					...this.localCreateDetraction,
					...this.detraction,
					paymentDate: this.detraction.paymentDate || null,
					receiptNumber: this.detraction.receiptNumber || null,
					detractionPaid: this.detraction.detractionPaid || false,
				};
			}
		},
	},
	methods: {
		async loadSunat() {
			const code = 'TABLA23';
			try {
				const { data } = await this.$httpSales.get(`catalog-sunat-details-list/${code}`);
				this.typesDetraction = data.map((type) => {
					const newRow = {
						...type,
						description: `${type.code} ${type.description} - ${type.percentage}%`,
					};
					return newRow;
				});
				if (this.localCreateDetraction.sunatCode) {
					const found = this.typesDetraction.find(
						(d) => d.code === this.localCreateDetraction.sunatCode
					);
					if (found) {
						this.detractionId = found.id;
						this.detractionSelect = found;
					}
				}
			} catch (err) {
				console.error(err);
				if (this.showGenericError) {
					this.showGenericError();
				}
			}
		},
		onDetractionChange(val) {
			const detrac = this.typesDetraction.find((d) => d.id === val);
			this.detractionSelect = detrac;
			if (detrac) {
				this.localCreateDetraction.percentage = detrac.percentage;
				this.localCreateDetraction.amount = twoDecimals(
					(this.totalAmount * detrac.percentage) / 100
				);
				this.localCreateDetraction.detractionTypeId = detrac.code;
				this.localCreateDetraction.detractionTypeName = detrac.description;
				this.localCreateDetraction.sunatCode = detrac.code;
				this.localCreateDetraction.sunatName = detrac.description;
			}
		},
		onCancel() {
			this.$emit('cancel');
		},
		onAccept() {
			this.$emit('accept', {
				detractionId: this.detractionId,
				detractionSelect: this.detractionSelect,
				...this.localCreateDetraction,
			});
		},
		setData(value, model) {
			if (model === 'detractionPaid') {
				this.localCreateDetraction.receiptNumber = null;
				this.localCreateDetraction.paymentDate = null;
			} else if (model === 'paymentDate') {
				this.localCreateDetraction.paymentDate = value;
				this.$forceUpdate();
			}
		},
	},
};
</script>
<style lang="scss" scoped>
.headline {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	text-align: center;
}
</style>
