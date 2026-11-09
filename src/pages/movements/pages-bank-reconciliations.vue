<template>
	<div>
		<app-loading
			:show-loading="loadingPage"
			label="La carga terminará en un momento y podrás ver
				toda la información actualizada."
		/>
		<header-page
			:title="$route.meta.title"
			column-class="xs12"
			justify-class="justify-start"
			to-show
			:show-clean="false"
			:show-excel="false"
		>
			<v-flex xs12>
				<v-layout wrap align-center justify-space-between>
					<v-flex xs9>
						<v-layout wrap align-center justify-end>
							<v-checkbox
								label="Importar Excel"
								color="success"
								small
								class="body-1 reconcilement-checkbox"
								:disabled="!params.bankAccountId"
								v-model="importExcel"
								hide-details
							>
							</v-checkbox>
							<label
								v-if="importExcel"
								ref="label"
								for="upload-file-reconciliation"
								class="mx-2"
							>
								<vue-six-four
									id="upload-file-reconciliation"
									hidden
									@vue-six-four="getFile"
								/>
								<v-btn
									@click="showDialog"
									class="ma-0 btn-auto"
									small
									color="info"
									style="padding: 4px 10px"
								>
									<v-icon color="white" size="20">file_download</v-icon>
								</v-btn>
							</label>
							<a
								href="/static/excel/bank-reconciliation-template.xlsx"
								download="plantilla-conciliacion-bancaria"
								v-if="importExcel"
								class="btn-download-excel-template"
							>
								Descargar Plantilla Excel
							</a>
						</v-layout>
					</v-flex>
					<v-flex xs3 text-xs-right>
						<span class="small-text">saldo:</span>
						<span class="big-text">{{ balance }}</span>
					</v-flex>
				</v-layout>
			</v-flex>
		</header-page>
		<v-layout wrap px-4 mt-2 mb-5 pb-5>
			<v-flex xs4 pr-1>
				<app-select
					class="app-select-full"
					:item="bankAccountId"
					item-text="name"
					item-value="id"
					:items="bankAccounts"
					place-holder="Cuenta Bancaria"
					model="bankAccountId"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs8>
				<bank-title-bar
					:conciliation-amount="reconciliation.daily.totalGeneral | round"
					:currency-symbol="currencySymbol"
					:difference-amount="differenceAmount | round"
				>
					<v-flex xs12 md4>
						<v-layout wrap align-center>
							<v-flex xs9>
								<span class="text-uppercase title-bar white--text">
									Total de cuenta bancaria:
								</span>
							</v-flex>
							<v-flex xs3>
								<app-input-text
									model="bankAccountAmount"
									:text="bankAccountAmount"
									type="number"
									@input="getData"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
				</bank-title-bar>
			</v-flex>
			<v-flex xs12 md4 pr-1 my-1>
				<v-layout wrap align-center mb-1 py-2 px-4 primary lighten-2>
					<v-flex xs12 class="title">
						<v-layout wrap>
							<v-flex :class="inputVisible ? 'xs2' : 'xs12'">
								<v-btn
									flat
									class="btn-action btn-auto ma-0"
									:disabled="inputVisible || !params.bankAccountId"
									@click="showInput"
								>
									<span class="btn-action btn-auto px-1 white">
										<v-icon size="30" color="primary"> add </v-icon>
									</span>
									<span
										class="pl-2 text-uppercase title-bar white--text"
										v-if="!inputVisible"
									>
										Nueva conciliación
									</span>
								</v-btn>
							</v-flex>
							<v-flex v-if="inputVisible" xs10>
								<v-layout row wrap>
									<v-flex xs7 pr-2>
										<date-component
											:date="date"
											icon="/static/img/calendar.svg"
											@on-input="setData({ model: 'date', value: $event })"
										></date-component>
									</v-flex>
									<v-flex xs4 pt-1>
										<v-btn
											class="btn-action btn-auto px-3 py-2"
											color="success"
											:disabled="!date"
											type="button"
											@click="createReconcilement"
										>
											Crear
										</v-btn>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
				<bank-movements-detail
					class="mb-1"
					:currency="currencySymbol"
					:rows="rowsReconcilement"
					@on-click-icon="openDeleteConfirmation"
					@reconcilement-selected="reconciliationSelection"
				/>
				<bank-reconciliation-total-detail
					:bank-transactions="typeTransactionBank"
					:payment-types="reconciliation"
					:bank-account-amount="bankAmount"
					:journal-amount="journalAmount"
					:diference-payment="differenceAmount"
				></bank-reconciliation-total-detail>
			</v-flex>
			<v-flex xs12 md8 mt-1>
				<bank-table-reconciliation
					:bank-rows="bankTransactions"
					:currency="currencySymbol"
					:daily-rows="reconcilementTransactions"
					:reconciliation="generateReconciliation"
					:bank-transactions="typeTransactionBank"
					:reconcilement-id="reconcilementId"
					@click-icon="loadTransactinDetail"
					@reconciliation-bank-match="reconciliationBankMatch($event, 'add')"
					@reconciliation-bank-unmatch="
						reconciliationBankMatch($event, 'delete')
					"
					@search-on-table="searchOnTable"
					@set-row-selected="getRowSelected"
					@summary="summary"
					@transaction-deleted="onTransactionDeleted"
					@set-loading="onSetLoading"
					@selectAllTransactions="selectAllTransactions"
				/>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:img="false"
				:is-loading="disabledButton"
				padding-cancel="px-4 py-2"
				padding-success="px-4 py-2"
				success-text="Conciliar"
				@cancel-button-clicked="cancel"
				@accept-button-clicked="accept(true)"
			>
				<v-btn
					class="btn-action mx-1"
					color="primary"
					:disabled="disabledButtonSave"
					type="button"
					@click="accept(false, true)"
				>
					Guardar
				</v-btn>
			</modal-sidebar-button>
		</section>
		<action-sidebar
			:title="action.title"
			:value="action.value"
			:width="action.width"
			@close-modal="closeModal"
		>
			<bank-transaction-detail
				:currency="currencySymbol"
				:detail="transactionDetail"
				@close-detail="closeModal"
			></bank-transaction-detail>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="360">
			<v-card>
				<v-card-title class="headline">Eliminar Conciliación</v-card-title>
				<v-divider></v-divider>
				<v-card-text> ¿Desea eliminar la conciliación? </v-card-text>
				<v-card-actions>
					<v-layout row wrap>
						<v-flex xs6 pr-2 text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelDelete"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-2 text-xs-left>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="deleteRecord"
							>
								Eliminar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="modal.open" persistent max-width="425">
			<v-card>
				<v-card-title class="headline justify-center">
					{{ modal.message }}
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-btn
							color="error"
							class="btn-action white--text"
							@click.native="closeModalError"
						>
							Cancelar
						</v-btn>
						<v-btn
							color="primary"
							class="btn-action white--text"
							@click.native="accept(reconcilementStatus)"
						>
							Aceptar
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { isDate } from 'date-fns';
import VueSixFour from 'vue-six-four';
import actionSidebar from '@/components/shared/action-sidebar';
import bankMovementsDetail from '@/components/movements/bank-movements-detail';
import bankReconciliationTotalDetail from '@/components/bank-reconciliation/bank-reconciliation-total-detail';
import bankTableReconciliation from '@/components/bank-reconciliation/bank-table-reconciliation';
import bankTitleBar from '@/components/bank-reconciliation/bank-title-bar';
import bankTitleBlock from '@/components/bank-reconciliation/bank-title-block';
import bankTransactionDetail from '@/components/bank-reconciliation/bank-transaction-detail';
import dateComponent from '@/components/shared/date-component';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

const { exactDate } = helper;

function created() {
	this.loadBankAccounts();
}

async function accept(reconcilementStatus, showMessage) {
	const selectedTransactions = this.reconcilementTransactions.filter(
		(rt) => rt.isSelected
	);
	if (selectedTransactions.length === 0 && showMessage) {
		this.reconcilementStatus = reconcilementStatus;
		this.modal.message = 'La conciliación se generará sin transacciones.';
		this.modal.open = true;
	} else {
		const self = this;
		const body = {
			ids: this.reconcilementTransactions.reduce((acum, dr) => {
				if (dr.isSelected && !dr.bankReconcilementId) {
					acum.push(dr.id);
				}
				return acum;
			}, []),
			flagStatus: reconcilementStatus ? 2 : 1,
			operationIds: this.bankTransactions.reduce((acum, bt) => {
				const transactionBank = self.reconcilementTransactions.find(
					(rt) =>
						rt.typeDocumentCode === bt.typeDocumentCode &&
						rt.amount === bt.amount &&
						rt.document === bt.document
				);
				if (bt.isSelected && !bt.referenceId) {
					acum.push({
						operationBankId: bt.id,
						transactionBankId: transactionBank.id,
					});
				}
				return acum;
			}, []),
		};
		if (this.bankAccountAmount) {
			// backend calcula este valor con los [ids]
			body.amount = 0;
			body.amountBank = Number(this.bankAccountAmount);
		}
		const id = this.reconcilementId || this.rowsReconcilement[0].id;
		this.loading = true;
		try {
			await this.$httpSales.patch(`bank-reconcilement/${id}`, body);
			this.showNotification('La conciliación ha sido realizada correctamente.');
			this.closeModalError();
			this.loadData();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'BANK_RECONCILEMENT_ONE_MAX') {
					this.showGenericError(
						'Se superó el máximo permitido para realizar una conciliación por día'
					);
				} else if (err.data.message === 'TRANSACTION_RECONCILEMENT_ERROR') {
					this.showGenericError(
						'Las transacciones enviadas ya han sido conciliadas.'
					);
				}
			}
		} finally {
			this.loading = false;
		}
	}
}

function cancel() {
	this.reconcilementTransactions = [];
	this.bankTransactions = [];
	this.reconcilementId = null;
	this.loadData();
}

function cancelDelete() {
	this.dialog = false;
	this.reconciliationId = null;
}

function customData(rows, setMatch) {
	return rows.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = this.reconcilementId === row.id;
		newRow.statusColor = !row.flagLocked ? 'success' : 'error';
		newRow.statusLabel = !row.flagLocked ? 'Abierto' : 'Bloqueado';
		newRow.journalAmount = row.amount;
		newRow.bankAmount = row.amountBank;
		if (this.reconcilementId === row.id && setMatch) {
			this.reconciliationSelection(row);
		}
		return newRow;
	});
}

function cleanFilters() {
	this.bankId = null;
	this.bankAccountId = null;
	this.params = {
		bankAccountId: null,
		date: null,
	};
	this.loadData();
}

function closeModal() {
	this.action.value = false;
	this.action.title = '';
	this.action.code = null;
	this.transactionDetail = {};
}

async function createReconcilement() {
	const body = {
		ids: [],
		date: this.date,
	};
	if (isDate(new Date(this.date))) {
		try {
			await this.$httpSales.post(
				`bank-reconcilement/${this.params.bankAccountId}/bank-account`,
				body
			);
			this.showNotification(
				`Conciliación del ${this.date} creada correctamente.`
			);
			this.inputVisible = false;
			this.dateWithOutFormat = null;
			this.date = null;
			this.loadData();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'BANK_RECONCILEMENT_ONE_MAX') {
					this.showGenericError(
						'Ya existe una conciliación realizada en la fecha enviada.'
					);
				}
			}
		}
	} else {
		this.showNotification('Ingrese una fecha válida', 'warning');
	}
}

async function deleteRecord() {
	const body = { transactionBankIds: null };
	try {
		await this.$httpSales.delete(`bank-reconcilement/${this.reconcilementId}`, {
			data: body,
		});
		this.showNotification('La conciliación ha sido eliminada correctamente.');
		this.cancelDelete();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'DELETED_ONLY_LAST_RECORD_ERROR') {
				this.showGenericError(
					'Solo se puede eliminar la última conciliación creada'
				);
			}
		}
	}
}

function differenceAmount() {
	return (
		this.reconciliation.daily.totalGeneral - Number(this.bankAccountAmount)
	);
}

function disabledButton() {
	return (
		this.disabledButtonSave ||
		this.reconcilementTransactions.length === 0 ||
		this.reconcilementTransactions.filter((rt) => rt.isSelected).length === 0
	);
}

function disabledButtonSave() {
	return (
		this.loading ||
		this.rowsReconcilement.length === 0 ||
		this.rowsReconcilement.every((rr) => !rr.isSelected) ||
		(this.reconcilementTransactions.every((rt) => !rt.isSelected) &&
			!this.bankAccountAmount)
	);
}

function getData({ model, value }, changeLoading) {
	if (model === 'bankAccountId') {
		const currencySymbol = value.currencySymbol;
		this.setData({ model, newValue: value.id, currencySymbol }, changeLoading);
		this.balance = value.balance;
	} else if (model === 'date') {
		this.setData({ model, newValue: value });
	} else {
		this[model] = Number(value);
	}
}

async function getFile(fileInfo) {
	const name = fileInfo.name.replace(/\s/g, '-');
	const newFile = {
		base64: fileInfo.sixFour,
		newColumns: ['date', 'type', 'document', 'concept', 'amount'],
		replace: true,
		bankAccountId: this.params.bankAccountId,
	};
	this.fileLoading = true;
	try {
		const words = name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: file } = await this.$httpSales.post(
				'bank-operation',
				newFile
			);
			const body = { model: 'excel', newValue: file };
			this.setData(body);
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		} else if (error.status === 400) {
			if (error.data.message === 'READ_FILE_XLSX_ERROR') {
				this.showNotification(
					'No se pudo leer el archivo excel. Recargue la página e inténtelo de nuevo.',
					'error'
				);
			} else if (error.data.message === 'WRITE_FILE_XLSX_ERROR') {
				this.showNotification(
					'Se produjo un error de escritura en el archivo. Recargue la página e inténtelo de nuevo.',
					'error'
				);
			}
		}
	} finally {
		this.fileLoading = false;
	}
}

function getRowSelected(row, type) {
	this.movementSelected = { ...row };
	this.updateReconcilementTransactions(row, type);
}

function updateReconcilementTransactions(transaction, type) {
	if (type === 'daily') {
		this.bankTransactions = this.bankTransactions.map((r) => {
			if (transaction.id === r.id) {
				const newReconcilement = { ...r };
				newReconcilement.isSelected = !newReconcilement.isSelected;
				return newReconcilement;
			}

			return r;
		});
	} else {
		this.reconcilementTransactions = this.reconcilementTransactions.map((r) => {
			if (transaction.id === r.id) {
				const newReconcilement = { ...r };
				newReconcilement.isSelected = !newReconcilement.isSelected;
				return newReconcilement;
			}

			return r;
		});
	}
}

function selectAllTransactions(checked) {
	this.reconcilementTransactions = this.reconcilementTransactions.map((r) => {
		const newReconcilement = { ...r };
		newReconcilement.isSelected = checked;
		return newReconcilement;
	});
}

async function loadBankAccounts() {
	const request = [
		this.$httpSales.get('bank-account'),
		this.$httpSales.get('type-transaction-bank'),
	];
	[{ data: this.bankAccounts }, { data: this.typeTransactionBank }] =
		await Promise.all(request);
}

async function loadData(changeLoading) {
	this.loading = true;
	const params = {
		bankAccountId: this.params.bankAccountId,
	};
	try {
		({ data: this.dailyRowsComplete } = await this.$httpSales.get(
			'bank-reconcilement',
			{ params }
		));
		this.dailyRowsComplete = this.customData(this.dailyRowsComplete);
		this.rowsReconcilement = this.customData(this.dailyRowsComplete, true);
		this.cleanSearch = false;
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.dailyRows = this.customData(this.dailyRowsComplete);
		this.loading = false;
		if (this.excelData && this.excelData.length > 0) {
			this.bankRowsComplete = [...this.excelData];
			this.bankRows = [...this.bankRowsComplete];
		}
		if (this.rowsReconcilement.length > 0) {
			if (this.reconcilementToSelect.id) {
				this.reconciliationSelection(this.reconcilementToSelect, changeLoading);
			}
		}
	}
}

async function loadTransactions(date, changeLoading) {
	const params = {
		endDate: exactDate(date, 'YYYY-MM-DD'),
		reconciliationId: this.reconcilementId,
	};
	const body = { bankReconcilementIds: null };
	const paramsBank = {
		bankAccountId: this.params.bankAccountId,
		endDate: exactDate(date, 'YYYY-MM-DD'),
		reconciliationId: this.reconcilementId,
	};
	const request = [
		this.$httpSales.post('transaction-bank-list', body, { params }),
		this.$httpSales.get('bank-operation', { params: paramsBank }),
	];
	try {
		[
			{ data: this.reconcilementTransactions },
			{ data: this.bankTransactions },
		] = await Promise.all(request);
		this.reconcilementTransactions = this.reconcilementTransactions.map(
			(rt) => {
				const newRt = { ...rt };
				newRt.disabled = !!rt.bankReconcilementId;
				newRt.isSelected = !!rt.bankReconcilementId;
				newRt.date = rt.paymentDate;
				newRt.document = rt.documentNumber;
				newRt.origin = rt.moduleOrigin ? rt.moduleOrigin.summaryCode : '';
				newRt.originName = rt.moduleOrigin ? rt.moduleOrigin.name : '';
				newRt.typeDocumentCode = rt.typeTransactionBank
					? rt.typeTransactionBank.code
					: '';
				newRt.typeDocumentName = rt.typeTransactionBank
					? rt.typeTransactionBank.name
					: '';
				return newRt;
			}
		);
		this.bankTransactions = this.bankTransactions.map((bt) => {
			const newBt = { ...bt };
			newBt.disabled = !!bt.referenceId;
			newBt.isSelected = !!bt.referenceId;
			newBt.date = bt.dateOperation;
			newBt.document = bt.numberOperation;
			newBt.typeDocumentCode = bt.typeTransactionBank
				? bt.typeTransactionBank.code
				: '';
			newBt.typeDocumentName = bt.typeTransactionBank
				? bt.typeTransactionBank.name
				: '';
			return newBt;
		});
	} catch (err) {
		this.showGenericError();
	} finally {
		if (changeLoading) {
			this.onSetLoading(!changeLoading);
		}
	}
}

async function loadTransactinDetail({ id }) {
	try {
		({ data: this.transactionDetail } = await this.$httpSales.get(
			`transaction-bank/${id}`
		));
		this.action.code = 'transaction-detail';
		this.action.title = this.transactionDetail.documentNumber;
		this.action.value = true;
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function onDate(value) {
	this.date = value;
	this.getData({ model: 'date', value });
}

function openDeleteConfirmation({ id }) {
	this.dialog = true;
	this.reconcilementId = id;
}

function readonly() {
	return (
		this.bankTransactions.length === 0 &&
		this.reconcilementTransactions.length === 0
	);
}

function reconciliationBankMatch(row, value) {
	if (value === 'add') {
		this.reconciliationFinal.push(row);
	} else {
		const index = this.reconciliationFinal.findIndex((rf) => rf.id === row.id);
		if (index > -1) {
			this.reconciliationFinal.splice(index, 1);
		}
	}
}

function reconciliationSelection({ id, date }, changeLoading) {
	this.reconcilementId = id;
	this.rowsReconcilement = this.rowsReconcilement.map((rr) => {
		const newRr = { ...rr };
		newRr.isSelected = rr.id === this.reconcilementId;
		return newRr;
	});
	const rowReconcilement = this.rowsReconcilement.find((rr) => rr.isSelected);
	this.bankAccountAmount = rowReconcilement.amountBank || 0;
	this.loadTransactions(date, changeLoading);
}

function searchOnTable({ search, type }) {
	if (search) {
		this[type] = this[`${type}Complete`].filter(
			(row) => row.document.toLowerCase() === search.toLowerCase()
		);
	} else {
		this[type] = [...this[`${type}Complete`]];
	}
}

function setData({ model, value, newValue, currencySymbol }, changeLoading) {
	if (model === 'excel') {
		this.excelData = newValue;
		this.loadData();
	}
	if (model === 'date') {
		this[model] = value;
	} else {
		this.params[model] = newValue;
	}
	if (currencySymbol) {
		this.currencySymbol = currencySymbol;
		this.loadData(changeLoading);
	}
	this.importExcel = !!this.params.bankAccountId;
}

function setDate(input) {
	this.dateWithOutFormat = input;
}

function showDialog() {
	this.$refs.label.click();
}

function showInput() {
	this.inputVisible = true;
}

function summary(summaryData) {
	this.reconciliation = summaryData;
}

function closeModalError() {
	this.modal.open = false;
	this.modal.message = '';
}

function onTransactionDeleted() {
	this.reconcilementToSelect = this.rowsReconcilement.find(
		(rr) => rr.id === Number(this.reconcilementId)
	);
	this.bankAccountSelected = this.bankAccounts.find(
		(ba) => ba.id === this.reconcilementToSelect.bankAccountId
	);
	this.getData(
		{ model: 'bankAccountId', value: this.bankAccountSelected },
		true
	);
}

function journalAmount() {
	const dailyAmount = this.reconcilementTransactions.reduce((a, rt) => {
		if (rt.isSelected) {
			return a + rt.amount;
		}
		return a;
	}, 0);
	return dailyAmount + this.bankAccountAmount;
}

function bankAmount() {
	return this.bankTransactions.reduce((a, bt) => {
		if (bt.isSelected) {
			return a + bt.amount;
		}
		return a;
	}, 0);
}

function onSetLoading(value) {
	this.loadingPage = value;
}

function data() {
	return {
		action: {
			code: null,
			title: '',
			value: false,
			width: 400,
		},
		allowedFiles: ['xls', 'xlsx'],
		balance: 0,
		bankAccountAmount: 0,
		bankAccountId: 0,
		bankAccounts: [],
		bankAccountSelected: null,
		bankId: null,
		bankTransactions: [],
		bankRows: [],
		bankRowsComplete: [],
		conciliationAmount: 474,
		currencySymbol: '',
		dailyRows: [],
		dailyRowsComplete: [],
		date: null,
		dateWithOutFormat: null,
		dialog: false,
		excelData: null,
		fileLoading: false,
		generateReconciliation: 0,
		importExcel: false,
		inputVisible: false,
		loading: false,
		loadingPage: false,
		movementSelected: {},
		params: {
			bankAccountId: null,
			date: null,
		},
		reconciliation: {
			bank: {},
			daily: {},
		},
		reconcilementId: null,
		reconcilementTransactions: [],
		reconciliationFinal: [],
		records: [],
		rowsReconcilement: [],
		transactionDetail: {},
		typeTransactionBank: [],
		modal: {
			message: '',
			open: false,
		},
		reconcilementStatus: false,
		reconcilementToSelect: {},
	};
}

export default {
	name: 'bank-reconciliations',
	components: {
		actionSidebar,
		bankMovementsDetail,
		bankReconciliationTotalDetail,
		bankTableReconciliation,
		bankTitleBar,
		bankTitleBlock,
		bankTransactionDetail,
		dateComponent,
		headerPage,
		modalSidebarButton,
		VueSixFour,
	},
	computed: {
		bankAmount,
		differenceAmount,
		disabledButton,
		disabledButtonSave,
		journalAmount,
		readonly,
	},
	created,
	data,
	methods: {
		accept,
		cancelDelete,
		cancel,
		cleanFilters,
		closeModal,
		closeModalError,
		createReconcilement,
		customData,
		deleteRecord,
		getData,
		getFile,
		getRowSelected,
		loadBankAccounts,
		loadData,
		loadTransactions,
		loadTransactinDetail,
		onDate,
		onSetLoading,
		onTransactionDeleted,
		openDeleteConfirmation,
		reconciliationBankMatch,
		reconciliationSelection,
		searchOnTable,
		selectAllTransactions,
		setData,
		setDate,
		showDialog,
		showInput,
		summary,
		updateReconcilementTransactions,
	},
};
</script>
<style lang="scss" scoped>
.btn-download-excel-template {
	background-color: color(primary);
	border-radius: 5px;
	color: color(white);
	font-family: font(open-semibold);
	font-size: size(small10);
	padding: 7px 10px;
	text-decoration: none;
}

.small-text {
	color: color(primary);
	font-family: font(open-semibold);
	font-size: size(small13);
	font-variant: small-caps;
}

.big-text {
	color: color(primary);
	font-family: font(open-semibold);
	font-size: size(medium20);
}

.title-bar {
	font-family: font(open-semibold);
	font-size: size(small13);
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
