<template>
	<section class="reconciliation">
		<v-layout wrap>
			<v-flex md6 pr-1>
				<bank-title-block title="Libro Diario de Bancos" />
				<table-scroll
					:all-checked="dailyCheckAll"
					heading
					:rows="dailyRows"
					selectable
					selectable-prop="isSelected"
					table-height="425px"
					@row-selected="rowSelected($event, 'bank', $event.isSelected)"
					@on-row-clicked="rowSelected($event, 'bank', $event.isSelected, true)"
					@selected-all="onSelectedAll"
				>
					<template slot="header">
						<v-flex xs3>
							Fecha
						</v-flex>
						<v-flex xs1>
							Orig.
						</v-flex>
						<v-flex xs1>
							Tipo
						</v-flex>
						<v-flex xs3>
							Documento
						</v-flex>
						<v-flex xs2>
							Importe
						</v-flex>
					</template>
					<template slot="body" slot-scope="props">
						<v-flex class="table-scroll-col w-63">
							<span class="table-scroll-text">
								{{ props.row.date | exactDate }}
							</span>
						</v-flex>
						<v-flex class="table-scroll-col w-50">
							<v-tooltip top>
								<span slot="activator" class="table-scroll-text">
									{{ props.row.originName | limitTo(4) }}
								</span>
								<span>
									{{ props.row.originName }}
								</span>
							</v-tooltip>
						</v-flex>
						<v-flex xs1 class="table-scroll-col">
							<v-tooltip top>
								<span slot="activator" class="table-scroll-text">
									{{ props.row.typeDocumentCode }}
								</span>
								<span>
									{{ props.row.typeDocumentName }}
								</span>
							</v-tooltip>
						</v-flex>
						<v-flex xs3 class="table-scroll-col">
							<span class="table-scroll-text">{{ props.row.document }}</span>
						</v-flex>
						<v-flex xs2 class="table-scroll-col">
							<span class="table-scroll-text">
								{{ currency }}
								{{ props.row.amount | round }}
							</span>
						</v-flex>
						<v-flex xs1 text-xs-center class="table-scroll-col">
							<app-tooltip-button
								color="success"
								icon="remove_red_eye"
								size="18"
								text="Ver Detalle"
								@click-icon="$emit('click-icon', props.row)"
							/>
						</v-flex>
					</template>
				</table-scroll>
				<bank-reconciliation-total
					:currency="currency"
					:payment-types="summaryData.daily.paymentTypes"
					:total-checked="summaryData.daily.totalChecked"
					:total-difference="summaryData.daily.totalDifference"
					:total-general="summaryData.daily.totalGeneral"
					:total-selected="summaryData.daily.totalSelected"
				/>
			</v-flex>
			<v-flex xs12 md6>
				<bank-title-block title="Estado de cuenta Bancaria" />
				<table-scroll
					:all-checked="bankCheckAll"
					disabled-prop="disabled"
					heading
					:rows="bankRows"
					selectable
					selectable-prop="isSelected"
					table-height="425px"
					@row-selected="rowSelected($event, 'daily', $event.isSelected)"
					@on-row-clicked="rowSelected($event, 'daily', $event.isSelected, true)"
					@selected-all="onSelectedAll"
				>
					<template slot="header">
						<v-flex xs3>
							Fecha
						</v-flex>
						<v-flex xs2>
							Tipo
						</v-flex>
						<v-flex xs3>
							Documento
						</v-flex>
						<v-flex xs3>
							Importe
						</v-flex>
					</template>
					<template slot="body" slot-scope="props">
						<v-flex xs3 class="table-scroll-col">
							<span class="table-scroll-text">
								{{ props.row.date | exactDate }}
							</span>
						</v-flex>
						<v-flex xs2 class="table-scroll-col">
							<v-tooltip top>
								<span slot="activator" class="table-scroll-text">
									{{ props.row.typeDocumentCode }}
								</span>
								<span>
									{{ props.row.typeDocumentName }}
								</span>
							</v-tooltip>
						</v-flex>
						<v-flex xs3 class="table-scroll-col">
							<span class="table-scroll-text">{{ props.row.document }}</span>
						</v-flex>
						<v-flex xs3 class="table-scroll-col">
							<span class="table-scroll-text">
								{{ currency }}
								{{ props.row.amount | round }}
							</span>
						</v-flex>
					</template>
				</table-scroll>
				<bank-reconciliation-total
					:currency="currency"
					:total-checked="summaryData.bank.totalChecked"
					:total-difference="summaryData.bank.totalDifference"
					:total-general="summaryData.bank.totalGeneral"
					:total-selected="summaryData.bank.totalSelected"
				/>
			</v-flex>
		</v-layout>
		<v-dialog
			v-model="modal.open"
			persistent
			max-width="425"
		>
			<v-card>
				<v-card-title
					class="headline justify-center"
				>
					{{ modal.title }}
				</v-card-title>
				<v-card-text
					class="subtext justify-center"
				>
					{{ modal.message }}
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-btn
							color="primary"
							class="btn-action white--text"
							@click.native="closeModalError"
						>
							{{ modal.btnCancel }}
						</v-btn>
						<v-btn
							color="error"
							class="btn-action white--text"
							@click.native="unselectRow"
						>
							{{ modal.btnSuccess }}
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</section>
</template>

<script>
import bankReconciliationTotal from '@/components/bank-reconciliation/bank-reconciliation-total';
import bankTitleBlock from '@/components/bank-reconciliation/bank-title-block';
import tableScroll from '@/components/shared/table/table-scroll';

function data() {
	return {
		bankCheckAll: false,
		dailyCheckAll: false,
		cleanSearchBank: false,
		cleanSearchDaily: false,
		modal: {
			btnCancel: '',
			btnSuccess: '',
			message: '',
			open: false,
			title: '',
		},
		rowData: {
			row: {},
			type: null,
			defaultSelectedValue: null,
			isRow: false,
		},
		selectedIds: [],
	};
}

function markAsSelected(row, value) {
	this.$set(row, 'isSelected', value);
}

function autoReconciliation(value = true) {
	this.dailyRows.forEach((row) => {
		markAsSelected.call(this, row, value);
		this.rowSelected(row, 'bank', value);
	});
}

function generateEventName(isSelected) {
	return isSelected ? 'reconciliation-bank-match' : 'reconciliation-bank-unmatch';
}

function generateReconciliation(newVal) {
	if (newVal > 0) {
		this.autoReconciliation();
	}
}

function onLocalSearch(search, type) {
	const searchTrim = search ? search.trim() : '';
	this.$emit('search-on-table', { search: searchTrim, type });
	this.cleanSearchBank = !searchTrim && (type === 'bankRows');
	this.cleanSearchDaily = !searchTrim && (type === 'bankDaily');
}

function onSelectedAll(value) {
	this.$emit('selectAllTransactions', value);
	// this.autoReconciliation(value);
}

function rowSelected(row, type, defaultSelectedValue, isRow) {
	const { amount, disabled, document, typeDocumentCode, bankReconcilementId, referenceId } = row;
	if (!disabled) {
		const selectedId = bankReconcilementId || referenceId;
		const valueSelected = isRow && !selectedId ? !defaultSelectedValue : defaultSelectedValue;
		if (!selectedId) {
			this.$set(row, 'isSelected', valueSelected);
		}
		let status = true;
		const rowInOtherTable = this[`${type}Rows`].find(r => r.amount === amount &&
			r.document.toString() === document.toString() &&
			r.typeDocumentCode.toString() === typeDocumentCode.toString());
		if (rowInOtherTable) {
			markAsSelected.call(this, rowInOtherTable, valueSelected || row.isSelected);
		}
		if (this.bankRows.length > 0 && row.isSelected && !rowInOtherTable) {
			this.showNotification(`No se encontró el documento #${document} en el estado de cuenta`, 'info');
			status = false;
		}
		this.bankCheckAll = this.bankRows.every(check => check.isSelected);
		this.$emit(generateEventName((valueSelected || row.isSelected) && status), row);
		this.$emit('set-row-selected', row, type);
		const daily = this.calculateAmounts(this.dailyRows, 'daily');
		this.$emit('summary', { daily, bank: this.summaryData.bank });
	} else {
		this.modal.title = `¿Deseas eliminar el documento #${document} de la conciliación?`;
		this.modal.message = 'Al quitar la selección del registro, se estará eliminando el documento de la conciliación creada.';
		this.modal.btnSuccess = 'Eliminar';
		this.modal.btnCancel = 'Cancelar';
		this.modal.open = true;
		this.rowData = { row, type, defaultSelectedValue, isRow };
	}
}

function calculateAmounts(arrayName, name) {
	const bank = arrayName.reduce((acum, row) => {
		const newAcum = { ...acum };
		const ptIndex = newAcum.paymentTypes[row.typeDocumentCode];
		if (!ptIndex) {
			newAcum.paymentTypes[row.typeDocumentCode] = {
				totalReconcilement: 0,
				totalBooks: name === 'daily' ? row.amount : 0,
				totalBank: name === 'bank' ? row.amount : 0,
			};
		} else if (name === 'daily') {
			newAcum.paymentTypes[row.typeDocumentCode].totalBooks += row.amount;
		} else if (name === 'bank') {
			newAcum.paymentTypes[row.typeDocumentCode].totalBank += row.amount;
		}
		if (row.isSelected) {
			const newPtIndex = newAcum.paymentTypes[row.typeDocumentCode];
			if (newPtIndex) {
				newAcum.paymentTypes[row.typeDocumentCode].totalReconcilement += row.amount;
				if (name === 'daily') {
					newAcum.paymentTypes[row.typeDocumentCode].totalBooks -= row.amount;
				}
				if (name === 'bank') {
					newAcum.paymentTypes[row.typeDocumentCode].totalBank -= row.amount;
				}
			}
		}
		newAcum.totalGeneral += row.amount;
		newAcum.totalDifference = newAcum.totalGeneral - newAcum.totalSelected;
		return newAcum;
	}, {
		paymentTypes: {},
		totalChecked: 0,
		totalDifference: 0,
		totalSelected: 0,
		totalGeneral: 0,
	});
	return bank;
}

function onValidClass({ amount }) {
	return amount < 0;
}

function summaryData() {
	const daily = calculateAmounts(this.dailyRows, 'daily');
	const bank = calculateAmounts(this.bankRows, 'bank');
	this.$emit('summary', { daily, bank });
	return { daily, bank };
}

function closeModalError(setLoading) {
	this.modal.open = false;
	this.modal.btnCancel = '';
	this.modal.btnSuccess = '';
	this.modal.message = '';
	this.modal.title = '';
	this.rowData = {
		row: {},
		type: null,
		defaultSelectedValue: null,
		isRow: false,
	};
	if (setLoading) {
		this.$emit('set-loading', true);
	}
}

function updateAllSelected(rows) {
	this.dailyCheckAll = rows.every(check => check.isSelected);
}

async function unselectRow() {
	const body = {
		transactionBankIds: [this.rowData.row.id],
	};
	try {
		await this.$httpSales.delete(`bank-reconcilement/${this.reconcilementId}`,
			{ data: body });
		this.$emit('transaction-deleted');
		this.showNotification('El movimiento ha sido eliminado de la conciliación.');
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'DELETED_ONLY_LAST_RECORD_ERROR') {
				this.showGenericError(
					'Solo se pueden eliminar movimientos de la última conciliación creada.',
				);
			}
		}
	} finally {
		this.closeModalError(true);
	}
}

export default {
	name: 'bank-table-reconciliation',
	components: {
		bankReconciliationTotal,
		bankTitleBlock,
		tableScroll,
	},
	computed: {
		summaryData,
	},
	data,
	methods: {
		autoReconciliation,
		calculateAmounts,
		closeModalError,
		onLocalSearch,
		onSelectedAll,
		onValidClass,
		rowSelected,
		unselectRow,
		updateAllSelected,
	},
	props: {
		bankRows: {
			default: () => [],
			type: Array,
		},
		bankTransactions: {
			default: () => [],
			type: Array,
		},
		currency: String,
		dailyRows: {
			default: () => [],
			type: Array,
		},
		reconcilementId: [Number, String],
		reconciliation: {
			default: 0,
			type: Number,
		},
	},
	watch: {
		reconciliation: generateReconciliation,
		dailyRows: {
			deep: true,
			handler: updateAllSelected,
		},
	},
};
</script>

<style lang="scss" scoped>
.reconciliation {
	display: flex;
}

.w-63 {
	width: 63px;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
}

.w-50 {
	width: 50px;
}

.headline {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding-top: 37px !important;
	text-align: center;
}

.subtext {
	color: color(grey-border);
	font-family: font(open-regular);
	font-size: size(small) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding: 0px !important;
	text-align: center;
}

.btn-block {
	padding-bottom: 24px !important;
	padding-top: 28px !important;
}
</style>

