<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			label="La carga terminará en un momento y podrás ver
			toda la información de movimientos de cajas"
		/>
		<header-page
			toShow
			name="cash-desk-closing"
			:title="cashClosingTitle"
			:emit-excel="true"
			show-excel
			:excel-loading="isLoading"
			@emit-excel="downLoadExcelReport"
			@clean-product-filter="onCleanData"
		>
			<h3 class="mr-5">{{ currency }} {{ totalAmount | round }}</h3>
		</header-page>
		<app-actions
			:resource-uri="$route.name"
			:value-disabled="actionDisabled"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<v-layout wrap mt-5 mb-3 px-4 justify-space-between align-start>
			<v-flex xs3 pr-2>
				<app-select
					:item="subsidiaryId"
					:items="subsidiaries"
					item-text="rucNamefull"
					item-value="id"
					:label="labelSucursal()"
					model="subsidiaryId"
					:return-object="false"
					@input="getSubsidiaryId"
				></app-select>
				<span class="form-group__message" v-if="!subsidiaryId"
					>La Razón Social es requerido</span
				>
			</v-flex>
			<v-flex xs3 pr-2>
				<app-select
					chips
					:items="cashs"
					item-text="name"
					item-value="id"
					label="Cajas"
					multiple
					:item="cashIds"
					:disabled="!!salCashDeskClosingId || !subsidiaryId"
					@input="getCash"
				/>
			</v-flex>
			<v-flex xs3 pr-2>
				<app-select
					chips
					:item="typePayment"
					item-text="name"
					item-value="code"
					:items="typesPayments"
					label="Tipo de Pago"
					multiple
					:disabled="!!salCashDeskClosingId"
					@input="getTypePayment"
				/>
			</v-flex>
			<v-flex xs3>
				<app-select
					item-text="name"
					label="Tipo de Movimiento"
					item-value="code"
					:item="typeMovement"
					:items="typesMovements"
					@input="getTypeMovement"
				/>
			</v-flex>
		</v-layout>
		<v-layout wrap mt-3 mb-4 px-4 align-end>
			<v-flex xs3 pr-2 v-if="!flagOutbox">
				<app-select
					autocomplete
					label="Usuario"
					item-text="fullname"
					item-value="id"
					:item="employee"
					:items="employees"
					@input="getEmployee"
				/>
			</v-flex>
			<v-flex xs2 pr-2 v-if="showStateEntity && !flagOutbox">
				<app-select
					label="Estado de Entidad"
					item-text="name"
					item-value="id"
					:return-object="false"
					model="entityStateId"
					:item="entityStateId"
					:items="statesEntity"
					@input="getStateEntity"
				/>
			</v-flex>
			<v-flex xs3 pr-2>
				<v-layout row wrap align-center>
					<v-flex xs6 pr-1>
						<label class="caption caption-date">Fecha Inicio</label>
						<date-component
							:date="initDate"
							icon="/static/img/calendar.svg"
							@on-input="getInitDate({ value: $event })"
						></date-component>
					</v-flex>
					<v-flex xs6 pl-2>
						<label class="caption caption-date">Fecha Fin</label>
						<date-component
							:date="endDate"
							:disabled="!initDate"
							icon="/static/img/calendar.svg"
							@on-input="getEndDate({ value: $event })"
						></date-component>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs3 pr-2>
				<v-layout>
					<v-flex xs6 pr-1>
						<app-select
							:items="currencies"
							item-text="code"
							item-value="code"
							label="Tipo de Moneda"
							:item="currency"
							@input="getCurrency"
						/>
					</v-flex>
					<v-flex xs6 pl-2 v-if="!flagOutbox">
						<app-input-text
							label="Monto"
							model="amountParams"
							:text="amountParams"
							@input="setAmount"
						></app-input-text>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs3 class="align-col">
				<v-btn
					type="button"
					color="primary"
					class="btn-action"
					:disabled="!this.subsidiaryId"
					@click="loadData"
				>
					Filtrar
				</v-btn>
			</v-flex>
		</v-layout>
		<div class="container-table">
			<div v-if="data.length === 0 || showOpacityTable" class="opacity-table">
				<p class="text-opacity">{{ messageTable }}</p>
			</div>
			<div class="layout wrap align-start justify-center">
				<v-flex :class="toShow ? 'xs8 active' : 'xs12'">
					<app-table
						:check-all="checkAll"
						:check-all-disabled="checkAllDisabled"
						:columns="columns"
						:current-page="currentPage"
						disabled-value="disabled"
						:dispatch-detail="rowDisabled"
						:last-page="lastPage"
						name="transactions"
						:padding="padding"
						:paint-row="['typeMovementName', 'Egreso']"
						:rows="data"
						selectable
						:items-quantity="data.length"
						:items-total-quantity="itemsTotalQuantity"
						@on-page="changePage"
						@on-selected-all="allIsSelected"
						@row-is-selected="rowSelected"
						@on-search-event="onSearch"
						@on-column-sortable="columnSortable"
					>
						<template slot="rows" slot-scope="props">
							<td v-show="showRow(columns, 1)">
								{{ props.index + 1 }}
							</td>
							<td v-show="showRow(columns, 2)">
								{{ props.row.cash ? props.row.cash.name : null }}
							</td>
							<td v-show="showRow(columns, 3)">
								{{ props.row.moduleName }}
							</td>
							<td v-show="showRow(columns, 4)">
								{{ props.row.typeMovementName }}
							</td>
							<td v-show="showRow(columns, 5)">
								{{ props.row.typePayment ? props.row.typePayment.name : null }}
							</td>
							<td v-show="showRow(columns, 6)">
								{{ getTypeDocument(props.row) }}
							</td>
							<td v-show="showRow(columns, 7)">
								{{ props.row.amount }}
							</td>
							<td v-show="showRow(columns, 8)">
								{{ props.row.createdAt | formatDate }}
							</td>
							<td v-show="showRow(columns, 9)">
								{{ props.row.paymentDate | formatPaymentDate }}
							</td>
							<td v-show="showRow(columns, 10)">
								{{ props.row.concept }}
							</td>
							<td v-show="showRow(columns, 11)">
								{{ getAnnexNameByDetail(props.row) }}
							</td>
							<td v-show="showRow(columns, 12)">
								<document-state
									:color="getColor(props.row)"
									:tooltip="getText(props.row)"
								/>
							</td>
							<td v-show="showRow(columns, 13)" v-if="showStateEntity">
								<v-tooltip top>
									<span
										slot="activator"
										:style="
											props.row.entityStateId === 4
												? 'background-color: #2abca4'
												: 'background-color: #f40029'
										"
										class="state-entity"
									>
										{{ props.row.entityStateId === 4 ? 'C' : 'SC' }}
									</span>
									<span>{{
										props.row.entityStateId === 4 ? 'Contabilizado' : 'Sin Contabilizar'
									}}</span>
								</v-tooltip>
							</td>
							<td v-show="showRow(columns, 14)" @click.stop="stopClick">
								<app-tooltip-button
									:icon="props.row.iconArrow"
									text="Ver Detalle"
									color="success"
									size="20"
									@click-icon="viewDetail(props.row)"
								/>
								<app-tooltip-button
									text="Eliminar"
									icon="delete"
									color="error"
									v-if="props.row.allowDelete"
									@click-icon="openDialog(props.row)"
								/>
							</td>
						</template>
					</app-table>
				</v-flex>
				<transition name="fade-left" mode="out-in">
					<v-flex
						xs4
						id="details-info-document"
						:class="['item-details pl-4 pr-4', { active: toShow }]"
						v-show="toShow"
					>
						<app-documents-details
							:id="selectedId"
							@close="setMovement"
							@save="save"
							@close-detail="closeDetail"
							@show-detail="showDetail"
						/>
					</v-flex>
				</transition>
			</div>
		</div>
		<action-sidebar-button
			:active="action.active"
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<cash-movements-new
				v-if="isCashMovementNew"
				:loading="loadingMovement"
				:type-payments="typesPayments"
				@close="closeModal"
				@save="createMovement"
				@send-date="getData"
			/>
			<cash-transfer
				v-if="isCashTransfer"
				:cash-data="cashFiltered"
				:data-selected="dataSelected"
				:currency="currency"
				:cash-origin="cashIds[0].name"
				:cashsId="cashIds[0].id"
				:cashs="cash"
				:disabled="disabledCashTransfer"
				@cash-transfer="cashTransferAction"
				:subsidiary-id="subsidiaryId"
				@close-modal="closeModal"
			/>
			<closing-cash-desk
				v-if="isClosingCash"
				:closed-at="closedAt"
				:currencies="currencies"
				:end-amount="endAmount"
				@accept="closeCash"
				@close="closeModal"
			/>
			<transfers-to-bank
				v-if="isTransferToBank"
				:cash-ids="cashIds"
				:cash-origin="cashIds[0].name"
				:cashs-id="cashIds[0].id"
				:amount="amount || transaction.amount"
				:bank-account-id="transaction.bankAccountId"
				:date-reference="transaction.additionalInformation.dateReference"
				:disabled="disabled"
				:document-number="transaction.documentNumber"
				:flag-form="transaction.flagForm"
				:readonly="false"
				:reference="transaction.reference"
				:url-image="transaction.urlImage"
				:currency="currency"
				:type-payments="typesPayments"
				:type-payment-ids-init="typePaymentIds"
				@close="closeModal"
				@save="saveTransaction"
				@get-data="setData"
				@set-account="setAccount"
			/>
			<credit-payment
				v-if="action.code === 'credit-payment'"
				:total-credited="totalCredited"
				:currency-symbol="currencySymbol"
				:data-selected="dataSelected"
				:currency="params.currency"
				@update="updateData"
				@cancel-modal="closeModal"
			/>
		</action-sidebar-button>
		<v-dialog v-model="dialog" persistent max-width="360">
			<v-card>
				<v-card-title class="headline">Eliminar Movimiento</v-card-title>
				<v-divider></v-divider>
				<v-card-text> ¿Desea eliminar movimiento"? </v-card-text>
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
								@click.native="deleteMovement"
							>
								Eliminar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<app-show-dialog
			:color-dialog="notification.colorDialog"
			:color-hex="notification.colorHex"
			:show-modal-init="notification.show"
			:text-content="notification.text"
			:title-header="notification.title"
			@close-dialog="closeNotification"
		></app-show-dialog>
		<v-dialog v-model="dialogDetail" persistent max-width="660">
			<accounting-seat-detail
				v-if="dialogDetail"
				:detail="accountingSeat"
				@close="closeDetailSeat"
			/>
		</v-dialog>
	</div>
</template>

<script>
import { format } from 'date-fns';
import lib from '@/shared/lib';
import appActions from '@/components/shared/app-actions';
import creditPayment from '@/components/cash-desk-closing/credit-payment';
import dateComponent from '@/components/shared/date-component';
import typePaymentForm from '@/shared/type-payment-form';
import typeTransaction from '@/shared/type-transaction';
import typeTransactionBank from '@/shared/type-transaction-bank';
import appTextField from '@/components/shared/app-input-text';
import documentState from '@/components/shared/document-state';
import appShowDialog from '@/components/shared/app-show-dialog';
import accountingSeatDetail from '@/components/sales/accounting-seat-detail';
import headerPage from './../shared/header-page';
import appTable from './../shared/table/app-table';
import appDocumentsDetails from './sub-components/documents-details';
import actionSidebarButton from './../shared/action-sidebar';
import appDateSelect from './../shared/app-date-select';
import appSelect from './../shared/app-select';
import autoComplete from './../shared/autocomplete/autocomplete-component';
import cashMovementsNew from './sub-components/cash-movements-new';
import cashTransfer from './sub-components/cash-transfer';
import closingCashDesk from './sub-components/closing-cash-desk';
import transfersToBank from './../transfers-to-bank/transfers-to-bank';

const { mergeObjects, setNewProperty } = lib;

function created() {
	this.currency = this.$userInfo.company.currency;
	this.params = setNewProperty('currency', this.currency)(this.params);
	this.closedAt = format(new Date(), 'YYYY-MM-DD');
	const { subsidiary: subsidiaryUser } = this.$userInfo;
	const { configIntegrations } = subsidiaryUser;
	this.showStateEntity =
		configIntegrations &&
		((configIntegrations.accountingPlan &&
			configIntegrations.accountingPlan.flagConfig) ||
			(configIntegrations.accountingConfiguration &&
				configIntegrations.accountingConfiguration.flagConfig));
	if (this.showStateEntity && !this.flagOutbox) {
		this.columns[11].visible = true;
	}
	if (this.flagOutbox) {
		this.columns[2].visible = false;
		this.columns[2].checked = false;
		this.columns[10].visible = false;
		this.columns[10].checked = false;
	}
	this.data = [...this.dataTemplate];
	this.loadFilterData();
}

function actionDisabled() {
	const closingCashDisabled = this.cashIds.length !== 1;
	const cashsDisabled = this.cashs.filter((c) => !c.flagActive);
	const cashDisabled =
		this.cashIds.length === 1 &&
		cashsDisabled.findIndex((c) => c.id === this.cashIds[0]) > -1;
	const cashTransferDisabled = closingCashDisabled || this.dataSelected.length === 0;
	const cardToBankDisable =
		cashTransferDisabled ||
		this.dataSelected.some((ds) => ds.typePayment.flagForm !== typePaymentForm.Card);
	const checkToBankDisable =
		cashTransferDisabled ||
		this.dataSelected.some((ds) => ds.typePayment.flagForm !== typePaymentForm.Check);
	// const cashToBankDisable = closingCashDisabled ||
	// 	this.dataSelected.some(ds => ds.typePayment.flagForm !== typePaymentForm.Cash);
	const CDBTdisabled = cashDisabled || closingCashDisabled || !this.totalAmount.totalCash;
	const creditPaymentDisabled =
		!this.dataSelected.length ||
		this.dataSelected.some(
			(ds) =>
				ds.typePayment.flagForm !== typePaymentForm.Card &&
				ds.typePayment.flagForm !== typePaymentForm.Check
		);
	const disabledActions = [
		{
			code: 'CDT',
			disabled: cashDisabled || closingCashDisabled || this.showOpacityTable,
		},
		{ code: 'CDBT', disabled: CDBTdisabled || this.showOpacityTable },
		{ code: 'CCD', disabled: closingCashDisabled || this.showOpacityTable },
		{
			code: 'deposit',
			disabled: cashDisabled || closingCashDisabled || this.showOpacityTable,
		},
		{
			code: 'transfer-card-bank',
			disabled: cashDisabled || cardToBankDisable || this.showOpacityTable,
		},
		{
			code: 'transfer-check-bank',
			disabled: cashDisabled || checkToBankDisable || this.showOpacityTable,
		},
		{ code: 'NMC', disabled: closingCashDisabled },
		{
			code: 'credit-payment',
			disabled: creditPaymentDisabled || this.showOpacityTable,
		},
	];
	return disabledActions;
}

function allIsSelected(isSelected) {
	this.checkAll = isSelected;
	this.data = this.data.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = row.typeMovementName === 'Ingreso' && isSelected;
		return newRow;
	});
	this.dataSelected = [...this.data.filter((row) => row.isSelected)];
}

function amount() {
	return this.dataSelected.reduce((accum, ds) => accum + ds.amount, 0);
}

function amountToTransfer() {
	return `-${this.dataSelected.reduce((accum, ds) => accum + ds.amount, 0)}`;
}

async function cashTransferAction(transferData, selected) {
	this.disabledCashTransfer = true;
	const {
		amount: amountTransfer,
		cashDestinationId,
		concept,
		documentNumber,
		paymentDate,
		reference,
		typePaymentId,
	} = transferData;
	const body = {
		amount:
			amountTransfer === 0 ? amountTransfer : -amountTransfer || this.amountToTransfer,
		cashDestinationId,
		cashId: this.cashIds[0].id,
		concept: concept.value,
		currency: this.currency,
		documentNumber: documentNumber.value || null,
		moduleOriginId: 5,
		paymentAmount:
			amountTransfer === 0 ? amountTransfer : -amountTransfer || this.amountToTransfer,
		paymentDate,
		reference: reference.value || null,
		transferredTransactions: null,
		typePaymentId,
		typeMovement: 2,
		typeTransaction: typeTransaction.ToBox,
	};
	if (selected.length) {
		body.transactions = selected.map((s) => {
			const newD = {
				id: s.id,
				amount: s.amount,
			};
			return newD;
		});
	}
	try {
		await this.$httpSales.post('transactions', body);
		this.showNotification('La transferencia a caja se realizó correctamente.');
		this.closeModal();
		this.onCleanData();
	} catch (err) {
		this.disabledCashTransfer = false;
		if (err.status === 400) {
			if (err.data.message === 'TRANSACTION_INVALID') {
				this.showNotificationNew(
					'error',
					'#D5331A',
					'ERROR AL REALIZAR TRANSFERENCIA',
					'Uno o más movimientos de los que se intentó transferir no son válidos.'
				);
			}
			if (err.data.message === 'TRANSACTION_STATE_NOT_FOUND') {
				this.showNotificationNew(
					'error',
					'#D5331A',
					'ERROR AL REALIZAR TRANSFERENCIA',
					'Uno o más movimientos de los que se intentó transferir no tienen configurado el estado FINALIZADO.'
				);
			}
		} else if (err.status === 500) {
			this.showNotificationNew();
		}
	} finally {
		this.disabledCashTransfer = false;
	}
}

function cashFiltered() {
	return this.cashs.filter((cash) => cash.id !== this.cashIds[0].id);
}

function changePage(page) {
	this.currentPage = page;
	// this.params.page = page;
	if (this.subsidiaryId) {
		this.loadData();
	}
}

async function closeCash({ currency }) {
	const params = {
		cashId: this.cashIds[0].id,
		currency,
	};
	try {
		await this.$httpSales.post('cash-desk-closing/mobile', null, { params });
		this.showNotification('El cierre de caja se realizó correctamente.');
		this.closeModal();
	} catch (err) {
		if (err.status === 500) {
			this.showNotificationNew();
		} else if (err.status === 400) {
			if (err.data.message === 'TRANSACTION_NOT_FOUND') {
				this.showNotificationNew(
					'error',
					'#D5331A',
					'ERROR AL CERRAR CAJA',
					'La caja no cuenta con transacciones por cerrar.'
				);
			} else if (err.data.message === 'CASH_ID_NOT_FOUND') {
				this.showNotificationNew(
					'error',
					'#D5331A',
					'ERROR AL CERRAR CAJA',
					'El código de caja no existe.'
				);
			} else if (err.data.message === 'CASH_DESK_CLOSING_EXIST') {
				this.showNotificationNew(
					'error',
					'#D5331A',
					'ERROR AL CERRAR CAJA',
					'La caja ya ha sido cerrada.'
				);
			} else if (err.data.message === 'CASH_DESK_CLOSING_NOT_FOUND') {
				this.showNotificationNew(
					'error',
					'#D5331A',
					'ERROR AL CERRAR CAJA',
					'No existe una caja abierta en la moneda seleccionada.'
				);
			}
		}
	}
}

function closeModal() {
	this.action = { ...this.actionDefault };
	this.newMovement = {
		additionalInformation: {
			beneficiary: '',
		},
		amount: null,
		cashId: null,
		concept: '',
		currency: this.$userInfo.company.currency,
		documentNumber: '',
		paymentAmount: null,
		paymentDate: null,
		reference: '',
		typeMovement: null,
		typePaymentId: null,
	};
	this.transaction = {
		additionalInformation: {
			dateReference: null,
		},
		amount: 0,
		bankAccountId: null,
		cashId: null,
		currency: '',
		documentNumber: '',
		paymentAmount: 0,
		paymentDate: null,
		reference: '',
		transferredTransactions: [],
		typeTransaction: 0,
		typeTransactionBankId: 0,
		urlImage: '',
	};
}

async function createMovement(model) {
	const newModel = { ...model };
	newModel.amount =
		model.typeMovement === 2 ? -Number(model.amount) : Number(model.amount);
	newModel.paymentAmount = newModel.amount;
	this.loadingMovement = true;
	try {
		await this.$httpSales.post('transactions', newModel);
		this.showNotification('El movimiento ha sido creado correctamente.');
		this.closeModal();
		if (this.subsidiaryId) {
			this.loadData();
		}
	} catch (err) {
		if (err.status === 500) {
			this.showNotificationNew();
		} else if (err.status === 400) {
			if (err.data.message === 'DOCUMENT_NUMBER_EXISTS') {
				this.showNotificationNew(
					'error',
					'#D5331A',
					'ERROR AL CREAR MOVIMIENTO',
					'El número de documento ingresado ya ha sido registrado en otro movimiento.'
				);
			}
		}
	} finally {
		this.loadingMovement = false;
	}
}

function customData(cashSetted) {
	this.data = this.data.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = false;
		newRow.moduleName = row.module ? row.module.name : '';
		newRow.disabled = row.typeMovementName === 'Egreso' || !!row.flagTransfer;
		newRow.line = !!row.flagTransfer;
		return newRow;
	});
	this.dataSelected = this.data.filter((row) => row.isSelected);
	if (!this.cashId && !cashSetted) {
		const cashsByData = this.data.reduce((a, d) => {
			const aIdx = a.findIndex((ai) => ai === d.cashId);
			if (aIdx < 0) {
				a.push(d.cashId);
			}
			return a;
		}, []);
		const cashsByDataFilter = cashsByData.filter((c) => c);
		if (cashsByDataFilter.length === 1) {
			this.cashIds = [this.data[0].cashId];
			this.cash = [this.cashs.find((c) => c.id === this.data[0].cashId)];
		}
	}
}

function getCash({ value }) {
	const valueNew = value.filter((item) => !!item);
	const prevSelected = this.prevCashIds.map((item) => item.id);
	const currentSelected = valueNew.map((item) => item.id);
	const deselected = prevSelected.filter((id) => currentSelected.includes(id));
	if (deselected.includes(1)) {
		this.cashs[0].name = 'Seleccionar Todos';
		this.prevCashIds = [];
		this.cashIds = [];
		return;
	}
	if (valueNew.some((row) => row.id === 1)) {
		this.cashs[0].name = 'Deseleccionar Todos';
		this.cashIds = this.cashs.reduce((list, w) => {
			if (w.id !== 1) {
				return list.concat(w);
			}
			return list;
		}, []);
	} else {
		this.cashs[0].name = 'Seleccionar Todos';
		this.cashIds = valueNew;
	}
	this.currentPage = 1;
	if (valueNew.length === 1 && !valueNew[0].flagActive) {
		this.showNotificationNew(
			'info',
			'#ffffff',
			'ERROR AL GENERAR MOVIMIENTOS',
			'La caja seleccionada está desactivada por lo que no se podrán generar movimientos.'
		);
	}
	this.prevCashIds = [...valueNew];
}

function getData({ model, newValue }) {
	if (model === 'beneficiary') {
		this.newMovement.additionalInformation[model] = newValue;
	} else {
		this.newMovement[model] = newValue;
	}
}

function getInitDate({ value }) {
	if (!this.endDate || this.endDate >= value) {
		this.initDate = value;
		this.params.startDate = value;
	} else {
		this.showNotification('La fecha fin debe ser posterior a la de inicio', 'error');
	}
}

function getCurrency({ value }) {
	this.currency = value.code;
	this.params = setNewProperty('currency', this.currency)(this.params);
	this.currentPage = 1;
}

function getEmployee({ value }) {
	if (value) {
		this.employee = value;
		this.params = setNewProperty('employeeId', value.id)(this.params);
	}
}

function getEndDate({ value }) {
	if (value >= this.initDate) {
		this.endDate = value;
		this.params.endDate = value;
	} else {
		this.showNotification('La fecha fin debe ser posterior a la de inicio', 'error');
	}
}

function getTypeDocument({ saleDocument, module }) {
	if (saleDocument) {
		return saleDocument && saleDocument.typeDocument
			? saleDocument.typeDocument.name
			: '';
	} else if (module.id === 5) {
		return 'INTERNO';
	} else if (module.id === 4) {
		return 'DOCUMENTOS DE VENTA';
	} else if (module.id === 3) {
		return 'DOCUMENTOS DE COMPRA';
	}
	return '-';
}

function getTypePayment({ value }) {
	this.typePayment = value;
	this.typePaymentIds = value.map((tp) => tp.id);
	this.currentPage = 1;
}

function getTypeMovement({ value }) {
	this.typeMovement = value.code;
	this.params = setNewProperty('typeMovement', value.id)(this.params);
	this.currentPage = 1;
}

function isCardToBankTransfer() {
	return this.action.code === 'transfer-card-bank';
}

function isCashMovementNew() {
	return this.action.code === 'NMC';
}

function isCashTransfer() {
	return this.action.code === 'CDT';
}

function isCheckToBankTransfer() {
	return this.action.code === 'transfer-check-bank';
}

function isClosingCash() {
	return this.action.code === 'CCD';
}

function isDeposit() {
	return this.action.code === 'deposit';
}

function isTransferToBank() {
	this.disabled =
		(this.isCardToBankTransfer ||
			this.isCheckToBankTransfer ||
			this.isDeposit ||
			this.action.code === 'CDBT') &&
		!this.transaction.bankDestinationId;
	return (
		this.isCardToBankTransfer ||
		this.isCheckToBankTransfer ||
		this.isDeposit ||
		this.action.code === 'CDBT'
	);
}

async function loadData() {
	this.loadingGeneral = true;
	const url = `transactions/${this.currency}`;
	let body = null;
	if (this.typePaymentIds.length > 0) {
		body = {
			typePaymentIds: this.typePaymentIds,
		};
	}
	const filterCashIds = this.cashIds.filter((p) => p.id !== 1);
	body = {
		cashIds: this.cashIds.length > 0 ? filterCashIds.map((p) => p.id || p) : undefined,
		typePaymentIds: this.typePaymentIds.length > 0 ? this.typePaymentIds : undefined,
	};
	if (this.salCashDeskClosingId) {
		this.params.salCashDeskClosingId = this.salCashDeskClosingId;
	}
	if (this.cashId) {
		this.params.cashId = this.cashId;
	}
	if (this.amountParams) {
		this.params.amount = Number(this.amountParams);
	}
	if (this.entityStateId) {
		this.params.entityStateId = this.entityStateId;
	}
	this.params.subsidiaryId = this.subsidiaryId;
	this.params.page = this.currentPage;

	const stateIds = this.flagOutbox ? [2, 3, 4, 5] : [2, 4];
	if (body) {
		body.stateIds = stateIds;
	} else {
		body = { stateIds };
	}
	const cahsTotalParams = this.buildParamsForCashBalance();
	const paramsCashAll = this.buildParamsForCashGet();
	const requests = [
		this.$httpSales.post(url, body, { params: paramsCashAll }),
		this.$httpSales.get(`cash-balance-total/${this.currency}`, {
			params: cahsTotalParams,
		}),
	];
	try {
		[{ data: this.data, headers: this.headers }, { data: this.totalAmount }] =
			await Promise.all(requests);
		this.totalAmount = this.totalAmount.totalCash || 0;
		this.currency = this.currency;
		this.$emit('total-amount', {
			totalAmount: this.totalAmount.totalCash,
			currency: this.currency,
		});
		this.data = this.data.map((d) => {
			const newData = { ...d };
			newData.cancelRow = [3, 4, 5].includes(d.stateId);
			newData.cashName = d.cash ? d.cash.name : null;
			newData.typePaymentRow = d.typePayment ? d.typePayment.name : null;
			newData.iconArrow = 'arrow_forward';
			newData.cashId = d.cashId || d.cash.id;
			return newData;
		});
		this.customData(this.cashIds.length > 0);
		if (this.cashId) {
			this.cashIds = [this.cashId];
		}
		this.rowDisabled = this.data.some((row) => row.typeMovementName === 'Egreso');
		this.lastPage = Number(this.headers['x-last-page']);
		this.itemsTotalQuantity = Number(this.headers['x-quantity']);
		if (this.data.length === 0) {
			this.data = [...this.dataTemplate];
			this.messageTable =
				'No se han encontrado registros que cumplan con los datos seleccionados en los filtros.';
			this.showOpacityTable = true;
		} else {
			this.messageTable = '';
			this.showOpacityTable = false;
		}
	} catch (err) {
		this.loadingGeneral = false;
		this.data = [...this.dataTemplate];
		this.showNotificationNew();
		this.loadingGeneral = false;
	} finally {
		this.loadingGeneral = false;
	}
	this.cleanData = false;
}

function buildParamsForCashBalance() {
	let cashIds = null;
	let typePaymentIds = null;
	if (this.cashIds.length > 0) {
		const cashFilter = this.cashIds.filter((p) => p.id !== 1);
		cashIds = cashFilter.map((p) => p.id).join(',');
	}
	if (this.typePaymentIds.length > 0) {
		typePaymentIds = this.typePaymentIds.join(',');
	}
	const params = { ...this.params };
	if (this.flagOutbox) {
		const ignored = [
			'stateId',
			'warehouseId',
			'cashClosingId',
			'notPaymentMethodId',
			'terminalId',
			'flagTransfer',
			'closedAlready',
			'stateOpening',
			'idsParcial',
			'employeeId',
			'entityStateId',
			'amount',
		];
		Object.keys(params).forEach((key) => {
			if (ignored.includes(key)) delete params[key];
		});
	}
	return mergeObjects({ cashIds, typePaymentIds }, params);
}

function buildParamsForCashGet() {
	let typePaymentIds = null;
	if (this.typePaymentIds.length > 0) {
		typePaymentIds = this.typePaymentIds.join(',');
	}
	return mergeObjects(
		{
			typePaymentIds,
			relationAdd: !this.flagOutbox
				? 'saleDocument,state,typePayment,paymentMethod,cash,module,annexTransaction,originCash'
				: undefined,
		},
		{ ...this.params }
	);
}

async function loadFilterData() {
	const params = {
		moduleCode: 'CAJA',
		flagType: 1,
	};
	const requests = [
		this.getCurrencies(),
		this.$httpSales.get('type-payments', { params }),
		this.$httpSales.get('type-movement'),
		this.globalEmployees(),
		this.$httpSales.get('type-transaction-bank'),
		this.subsidiariesList(),
	];
	try {
		[
			{ data: this.currencies },
			{ data: this.typesPayments },
			{ data: this.typesMovements },
			{ data: this.employees },
			{ data: this.typeTransactionBankItems },
			{ data: this.subsidiaries },
		] = await Promise.all(requests);
		this.typesPayments = this.typesPayments.map((tp) => tp.paymentType);
		this.currencies = this.currencyByCountry(this.currencies);
		this.subsidiaries = this.subsidiaries.map((o) => {
			const newRow = { ...o };
			newRow.rucNamefull = `Ruc: ${o.ruc} - ${o.rzSocial}`;
			return newRow;
		});
		if (this.$route.query.cashIds) {
			this.setCash();
		}
		if (this.subsidiaries.length === 1) {
			this.subsidiaryId = this.subsidiaries[0].id;
			this.loadCash();
		}
	} catch (error) {
		this.showNotificationNew();
	}
}

function onCleanData() {
	this.cleanData = true;
	this.employee = {};
	this.typeMovement = '';
	this.typePayment = [];
	this.initDate = '';
	this.endDate = '';
	this.cash = [];
	this.cashIds = [];
	this.subsidiaryId = this.subsidiaries.length === 1 ? this.subsidiaries[0].id : null;
	this.typePaymentIds = [];
	this.entityStateId = null;
	this.currency = this.$userInfo.company.currency;
	this.amountParams = null;
	this.data = [...this.dataTemplate];
	this.$emit('total-amount', { totalAmount: 0, currency: this.currency });
	this.params = {
		limit: 30,
		page: 1,
		search: null,
		sortField: 'created_at',
		sortDirection: 'desc',
	};
	this.showOpacityTable = true;
	this.messageTable = `Es necesario filtrar por ${this.labelSucursal().toLowerCase()} para visualizar la información.`;
}

function openCashTransfer() {
	return this.action === 'CT';
}

function padding() {
	return this.toShow ? 'pl-4' : 'px-4';
}

function rowIsDisabled(id) {
	this.data = this.data.map((row) => {
		const newRow = { ...row };
		if (row.id === id) {
			newRow.isSelected = false;
		}
		return newRow;
	});
}

function rowIsSelected(id, isSelected) {
	if (isSelected) {
		this.dataSelected.push(this.data.find((row) => row.id === id));
	} else {
		const index = this.dataSelected.findIndex((row) => row.id === id);
		this.dataSelected.splice(index, 1);
	}
}

function rowSelected(row) {
	this.selectRow(row);
}

function runAction({ code, languages }) {
	const arrayCash = this.dataSelected.map((d) => d.cashId);
	const flagCashSelects = arrayCash.reduce((acum, d, index) => {
		let newAcum = acum;
		if (index === 0) {
			newAcum = d;
		} else if (newAcum !== d) {
			newAcum += d;
		}
		return newAcum;
	}, 0);
	if (code === 'deposit') {
		const flagCash = this.dataSelected.some(
			(d) => d.typePayment.flagForm === typePaymentForm.Cash
		);
		if (flagCash) {
			this.showNotificationNew(
				'info',
				'#ffffff',
				'ERROR AL REALIZAR UN DEPOSITO',
				'No se permite depositar cuando es tipo de pago efectivo.'
			);
			return;
		}
		this.transaction.flagForm = typePaymentForm.Deposit;
	} else if (code === 'transfer-card-bank') {
		this.transaction.flagForm = typePaymentForm.Card;
	} else if (code === 'credit-payment') {
		const arrayType = this.dataSelected.map((d) => d.typePaymentId);
		const flag = arrayType.reduce((acum, d, index) => {
			let newAcum = acum;
			if (index === 0) {
				newAcum = d;
			} else if (newAcum !== d) {
				newAcum += d;
			}
			return newAcum;
		}, 0);
		if (flag === arrayType[0]) {
			if (flagCashSelects === arrayCash[0]) {
				this.totalCredited = this.dataSelected.reduce((acum, d) => acum + d.amount, 0);
				this.currencySymbol = this.dataSelected[0].currencySymbol;
				this.action.width = 580;
			} else {
				this.showNotificationNew(
					'info',
					'#ffffff',
					'ERROR AL ACREDITAR PAGO',
					'Solo debe seleccionar movimientos de una caja'
				);
				return;
			}
		} else {
			this.showNotificationNew(
				'info',
				'#ffffff',
				'ERROR AL ACREDITAR PAGO',
				'Solo debe seleccionar un tipo de pago.'
			);
			return;
		}
	} else if (code === 'CDT') {
		const flagCash = this.dataSelected.some(
			(d) => d.typePayment.flagForm === typePaymentForm.Cash
		);
		const flagTransfer = this.dataSelected.some((d) => d.flagTransfer);
		if (flagCash) {
			this.showNotificationNew(
				'info',
				'#ffffff',
				'ERROR AL REALIZAR TRANSFERENCIA A CAJA',
				'No se permite transferir tipo de pago efectivo.'
			);
			return;
		} else if (flagCashSelects !== arrayCash[0] && this.dataSelected.length) {
			this.showNotificationNew(
				'info',
				'#ffffff',
				'ERROR AL REALIZAR TRANSFERENCIA A CAJA',
				'Solo transferir movimientos de una sola caja.'
			);
			return;
		} else if (flagTransfer) {
			this.showNotificationNew(
				'info',
				'#ffffff',
				'ERROR AL REALIZAR TRANSFERENCIA A CAJA',
				'No se debe seleccionar movimientos transferidos.'
			);
			return;
		}
	} else if (code === 'CDBT') {
		this.action = {
			title: '',
			code: '',
			open: true,
		};
	} else if (code === 'transfer-check-bank') {
		this.action = {
			title: '',
			code: '',
			open: true,
		};
	} else {
		this.transaction.flagForm =
			code === 'transfer-check-bank' ? typePaymentForm.Check : typePaymentForm.Cash;
	}
	this.action.code = code;
	this.action.title = code === 'NMC' ? 'Nuevo Movimiento de Caja' : languages;
	this.action.open = true;
}

async function save({ body, id }) {
	try {
		await this.$httpSales.patch(`transactions/${id}`, body);
		this.showNotification('El movimiento ha sido actualizado correctamente.');
		if (this.subsidiaryId) {
			this.loadData();
		}
	} catch (err) {
		if (err.status === 500) {
			this.showNotificationNew();
		}
	}
}

async function saveTransaction(bodyAmount) {
	this.disabled = true;
	const dateReference = this.transaction.additionalInformation.dateReference;
	const typeTransactionBankItem =
		this.typeTransactionBankItems.find(
			(item) => item.code === typeTransactionBank.Deposit
		) || {};
	const body = {
		additionalInformation: dateReference ? this.transaction.additionalInformation : null,
		amount: -bodyAmount || -(this.amount || this.transaction.amount),
		bankDestinationId: this.transaction.bankAccountId,
		cashId: this.cashIds[0].id,
		concept: this.transaction.concept || undefined,
		currency: this.currency,
		documentNumber: this.transaction.documentNumber,
		paymentAmount: -bodyAmount || -(this.amount || this.transaction.amount),
		paymentDate: format(new Date(), 'YYYY-MM-DD-HH-mm-ss'),
		reference: this.transaction.reference,
		typeTransaction: typeTransaction.ToBank,
		typeTransactionBankId: typeTransactionBankItem.id,
		urlImage: this.transaction.urlImage || null,
	};
	if (this.transaction.flagForm !== typePaymentForm.Deposit) {
		body.transferredTransactions = this.dataSelected.map((ds) => ds.id);
	}
	try {
		await this.$httpSales.post('transactions', body);
		this.showNotification('La transacción se realizó correctamente.');
		if (this.subsidiaryId) {
			this.loadData();
		}
	} catch (err) {
		this.disabled = false;
		if (err.status === 500) {
			this.showNotification();
		} else if (err.status === 400) {
			if (err.data.message === 'EXCEEDED_CASH_BALANCE') {
				this.showNotificationNew(
					'error',
					'#D5331A',
					'ERROR AL REALIZAR UNA TRANSACCIÓN',
					'El monto ingresado excede al monto total de la caja seleccionada.'
				);
			} else if (err.data.message === 'TRANSACTION_ALREADY_TRANSFERRED') {
				this.showNotificationNew(
					'error',
					'#D5331A',
					'ERROR AL REALIZAR UNA TRANSACCIÓN',
					'Los movimientos seleccionados ya han sido transferidos.'
				);
			}
		}
	} finally {
		this.disabled = false;
		this.closeModal();
	}
}

function selectRow({ id, isSelected, typeMovementName, flagTransfer }) {
	this.selectedId = id;
	if (typeMovementName === 'Ingreso' && !flagTransfer) {
		this.rowIsSelected(id, isSelected);
	} else {
		this.rowIsDisabled(id);
	}
	this.checkAll = this.data
		.filter((row) => row.typeMovementName === 'Ingreso')
		.every((row) => row.isSelected);
}

function setCash() {
	const arrayCashIds = this.$route.query.cashIds.split(',');
	const arrayCash = arrayCashIds.reduce((accum, id) => {
		const cashSelected = this.cashs.find((c) => c.id === Number(id));
		if (cashSelected) {
			accum.push(cashSelected);
		}
		return accum;
	}, []);
	this.getCash({ value: arrayCash });
}

function setData({ model, newValue }) {
	if (model === 'dateReference') {
		this.transaction.additionalInformation[model] = newValue;
	} else {
		this.transaction[model] = newValue;
		this.disabled = model === 'amount' && newValue <= 0;
		if (this.disabled) {
			this.showNotificationNew(
				'info',
				'#ffffff',
				'ERROR AL REALIZAR DEPÓSITO',
				'Debe ingresar un monto mayor a cero (0) para realizar el depósito.'
			);
		}
	}
}

function showDetailsActive() {
	return this.toShow && this.selectedId;
}

function viewDetail({ id, iconArrow }) {
	this.toShow = iconArrow === 'arrow_forward';
	this.selectedId = id;
	this.data = this.data.map((d) => {
		const newData = { ...d };
		newData.iconArrow =
			d.id === id && iconArrow === 'arrow_forward' ? 'arrow_back' : 'arrow_forward';
		return newData;
	});
}

function closeDetail({ id, iconArrow }) {
	this.toShow = iconArrow === 'arrow_forward';
	this.selectedId = null;
	this.data = this.data.map((d) => {
		const newData = { ...d };
		newData.iconArrow =
			d.id === id && iconArrow === 'arrow_forward' ? 'arrow_back' : 'arrow_forward';
		return newData;
	});
}

function setMovement(row) {
	this.selectedId = row ? row.id : null;
	this.toShow = row && row.id;
	this.data = this.data.map((d) => {
		const newD = { ...d };
		if (row) {
			newD.iconArrow = d.id === row.id && this.toShow ? 'arrow_back' : 'arrow_forward';
		} else {
			newD.iconArrow = 'arrow_forward';
		}
		return newD;
	});
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	if (this.subsidiaryId) {
		this.loadData();
	}
}

function columnSortable(col) {
	const newColumn = { ...col };
	newColumn.isSortable.down = !col.isSortable.down;
	newColumn.isSortable.up = !col.isSortable.up;
	this.columns = this.columns.map((c) => {
		const newCol = { ...c };
		if (c.isSortable) {
			newCol.isSortable.up = newColumn.isSortable.up;
			newCol.isSortable.down = newColumn.isSortable.down;
		}
		return newCol;
	});
	this.params.sortField = newColumn.isSortable.value;
	this.params.sortDirection = newColumn.isSortable.up ? 'asc' : 'desc';
	this.currentPage = 1;
	this.loadData();
}

function openDialog(item) {
	this.idDelete = item.id;
	this.dialog = true;
}

function cancelDelete() {
	this.dialog = false;
	this.idDelete = null;
}

async function deleteMovement() {
	this.dialog = false;
	try {
		await this.$httpSales.delete(`transactions/${this.idDelete}`);
		this.showNotification('Se eliminó correctamente');
		this.cancelDelete();
		if (this.subsidiaryId) {
			this.loadData();
		}
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'CASH_DESK_CLOSING_EXIST') {
				this.showNotificationNew(
					'error',
					'#D5331A',
					'ERROR AL ELIMINAR TRANSACCIÓN',
					'No se pueden eliminar transacciones relacionadas a un cierre de caja.'
				);
			}
		} else if (error.status === 500) {
			this.showNotificationNew();
		}
	}
}

function getSubsidiaryId({ model, value }) {
	this[model] = value;
	this.loadCash(value);
}

function setAmount({ model, value }) {
	this[model] = value;
}

function getColor(row) {
	let color = '';
	if (
		row.typePayment.flagForm !== typePaymentForm.Card &&
		row.typePayment.flagForm !== typePaymentForm.Check
	) {
		color = 'black';
	} else if (row.stateId === 4) {
		color = 'success';
	} else {
		color = 'error';
	}
	return color;
}

function getText(row) {
	let text = '';
	if (
		row.typePayment.flagForm !== typePaymentForm.Card &&
		row.typePayment.flagForm !== typePaymentForm.Check
	) {
		text = 'Pendiente';
	} else if (row.stateId === 4) {
		text = 'Acreditado';
	} else {
		text = 'No Acreditado';
	}
	return text;
}

function updateData() {
	this.closeModal();
	this.loadData();
}

async function loadCash(id) {
	const params = {
		subsidiaryId: id,
	};
	try {
		const { data: response } = await this.$httpSales.get('cash', { params });
		this.cashs = response;
		this.cashs.unshift({ id: 1, name: 'Seleccionar Todos', flagActive: true });
		if (this.cashs.length === 1) {
			this.cashIds = [this.cashs[0]];
			this.cashIds = this.cash.map((cas) => cas.id);
			this.loadData();
		}
	} catch (error) {
		this.showGenericError();
	}
}

function setAccount({ model, value }) {
	this.transaction[model] = value;
}

function checkAllDisabled() {
	return this.showOpacityTable;
}

function getStateEntity({ model, value }) {
	this[model] = value;
}

function showDetail(seat) {
	this.accountingSeat = { ...seat };
	this.dialogDetail = true;
}

function closeDetailSeat() {
	this.dialogDetail = false;
}

async function downLoadExcelReport() {
	const filterCash = this.cashIds.map((p) => p.id);
	if (this.cashIds.length) {
		const params = {
			...this.params,
			cashIds: filterCash,
			typePaymentIds: this.typePaymentIds,
		};
		delete params.sortField;
		delete params.sortDirection;
		delete params.limit;
		delete params.page;
		this.onEmitExcel('movement-cash-xlsx', 'movimiento_de_cajas_', params);
	} else {
		this.showNotification('Seleccione una caja para descargar el excel.', 'warning');
	}
}

function cashClosingTitle() {
	return this.$route.meta.title;
}

function data() {
	return {
		prevCashIds: [],
		cash: [],
		cashIds: [],
		cashs: [],
		action: {
			active: false,
			code: null,
			title: '',
			open: false,
			width: 580,
		},
		actionCashTransfer: {
			active: true,
			code: 'CT',
			title: 'Transferencia a Caja',
			open: true,
			width: 500,
		},
		actionDefault: {
			active: false,
			code: null,
			title: '',
			open: false,
			width: 500,
		},
		actions: [],
		additionalInformation: {},
		checkAll: false,
		closedAt: '',
		columns: [
			{ id: 1, name: '# Num', value: 'index', visible: true, checked: true },
			{ id: 2, name: 'Caja', value: 'cashName', visible: true, checked: true },
			{
				id: 3,
				name: 'Origen',
				value: 'moduleName',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Tipo',
				value: 'typeMovementName',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'T. Pago',
				value: 'typePaymentRow',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Documento',
				value: 'saleDocument.typeDocument.name',
				visible: true,
				checked: true,
			},
			{ id: 7, name: 'Importe', value: 'amount', visible: true, checked: true },
			{
				id: 8,
				name: 'F. de Creación',
				tooltip: 'Fecha de Creación',
				visible: true,
				checked: true,
				isSortable: {
					down: true,
					value: 'created_at',
					up: false,
				},
			},
			{
				id: 9,
				name: 'F. Pago',
				value: 'paymentDate',
				tooltip: 'Fecha de Pago',
				visible: true,
				checked: true,
				isSortable: {
					down: true,
					value: 'payment_date',
					up: false,
				},
			},
			{
				id: 10,
				name: 'Concepto',
				value: 'concept',
				visible: true,
				checked: true,
			},
			{
				id: 11,
				name: 'Anexo de caja',
				value: 'annexTransaction.name',
				visible: this.$userInfo.company.settings.flagAnnexTransactions,
				checked: this.$userInfo.company.settings.flagAnnexTransactions,
				flagVisible: !this.$userInfo.company.settings.flagAnnexTransactions,
			},
			{
				id: 12,
				name: 'Acreditado',
				value: 'accredited',
				visible: true,
				checked: true,
			},
			{
				id: 13,
				name: 'E. Entidad',
				value: 'entityState',
				visible: false,
				checked: false,
			},
			{
				id: 14,
				name: 'Acciones',
				value: 'actions',
				visible: true,
				checked: true,
			},
		],
		cleanData: false,
		currency: '',
		currencies: [],
		currentPage: 1,
		data: [],
		dataSelected: [],
		dialog: false,
		disabledCashTransfer: false,
		disabled: false,
		documentData: {
			entityExternalData: {
				fullName: 'Nombre de Prueba',
			},
		},
		endAmount: 0,
		endDate: '',
		entityExternalData: {},
		employee: {},
		employees: [],
		headers: {},
		helpItems: [],
		isLoading: false,
		idDelete: null,
		initDate: '',
		itemsTotalQuantity: 0,
		lastPage: 1,
		loadingGeneral: false,
		loadingMovement: false,
		moveY: 0,
		newMovement: {
			additionalInformation: {
				beneficiary: '',
			},
			amount: null,
			cashId: null,
			concept: '',
			currency: '',
			documentNumber: '',
			paymentAmount: null,
			paymentDate: null,
			reference: '',
			typeMovement: null,
			typePaymentId: null,
		},
		params: {
			limit: 30,
			page: 1,
			sortField: 'created_at',
			sortDirection: 'desc',
		},
		rowDisabled: false,
		selectedId: 0,
		showStateEntity: false,
		subsidiaryId: null,
		subsidiaries: [],
		totalAmount: 0,
		transaction: {
			additionalInformation: {
				dateReference: null,
			},
			amount: 0,
			bankAccountId: null,
			cashId: null,
			currency: '',
			documentNumber: '',
			paymentAmount: 0,
			paymentDate: null,
			reference: '',
			transferredTransactions: [],
			typeTransaction: 0,
			typeTransactionBankId: 0,
			urlImage: '',
		},
		entityStateId: null,
		typePayment: [],
		typePaymentIds: [],
		typesPayments: [],
		toShow: false,
		typeMovement: null,
		typesMovements: [],
		typeTransactionBankItems: null,
		dataTemplate: [
			{
				amount: null,
				cash: {},
				concept: '',
				iconArrow: 'arrow_forward',
				id: 1,
				module: {},
				moduleName: '',
				paymentDate: null,
				saleDocument: {
					typeDocument: {},
				},
				typeMovementName: '',
				typePayment: {},
			},
			{
				amount: null,
				cash: {},
				concept: '',
				iconArrow: 'arrow_forward',
				id: 2,
				module: {},
				moduleName: '',
				paymentDate: null,
				saleDocument: {
					typeDocument: {},
				},
				typeMovementName: '',
				typePayment: {},
			},
			{
				amount: null,
				cash: {},
				concept: '',
				iconArrow: 'arrow_forward',
				id: 3,
				module: {},
				moduleName: '',
				paymentDate: null,
				saleDocument: {
					typeDocument: {},
				},
				typeMovementName: '',
				typePayment: {},
			},
			{
				amount: null,
				cash: {},
				concept: '',
				iconArrow: 'arrow_forward',
				id: 4,
				module: {},
				moduleName: '',
				paymentDate: null,
				saleDocument: {
					typeDocument: {},
				},
				typeMovementName: '',
				typePayment: {},
			},
			{
				amount: null,
				cash: {},
				concept: '',
				iconArrow: 'arrow_forward',
				id: 5,
				module: {},
				moduleName: '',
				paymentDate: null,
				saleDocument: {
					typeDocument: {},
				},
				typeMovementName: '',
				typePayment: {},
			},
			{
				amount: null,
				cash: {},
				concept: '',
				iconArrow: 'arrow_forward',
				id: 6,
				module: {},
				moduleName: '',
				paymentDate: null,
				saleDocument: {
					typeDocument: {},
				},
				typeMovementName: '',
				typePayment: {},
			},
			{
				amount: null,
				cash: {},
				concept: '',
				iconArrow: 'arrow_forward',
				id: 7,
				module: {},
				moduleName: '',
				paymentDate: null,
				saleDocument: {
					typeDocument: {},
				},
				typeMovementName: '',
				typePayment: {},
			},
			{
				amount: null,
				cash: {},
				concept: '',
				iconArrow: 'arrow_forward',
				id: 8,
				module: {},
				moduleName: '',
				paymentDate: null,
				saleDocument: {
					typeDocument: {},
				},
				typeMovementName: '',
				typePayment: {},
			},
			{
				amount: null,
				cash: {},
				concept: '',
				iconArrow: 'arrow_forward',
				id: 9,
				module: {},
				moduleName: '',
				paymentDate: null,
				saleDocument: {
					typeDocument: {},
				},
				typeMovementName: '',
				typePayment: {},
			},
			{
				amount: null,
				cash: {},
				concept: '',
				iconArrow: 'arrow_forward',
				id: 10,
				module: {},
				moduleName: '',
				paymentDate: null,
				saleDocument: {
					typeDocument: {},
				},
				typeMovementName: '',
				typePayment: {},
			},
		],
		messageTable: `Es necesario filtrar por ${this.labelSucursal().toLowerCase()} para visualizar la información.`,
		showOpacityTable: true,
		amountParams: null,
		totalCredited: null,
		dialogDetail: false,
		accountingSeat: {},
	};
}

export default {
	name: 'transactions',
	components: {
		actionSidebarButton,
		appDateSelect,
		appDocumentsDetails,
		appActions,
		appSelect,
		appTable,
		autoComplete,
		cashMovementsNew,
		cashTransfer,
		closingCashDesk,
		dateComponent,
		headerPage,
		transfersToBank,
		creditPayment,
		appTextField,
		documentState,
		appShowDialog,
		accountingSeatDetail,
	},
	computed: {
		actionDisabled,
		amount,
		amountToTransfer,
		cashClosingTitle,
		cashFiltered,
		checkAllDisabled,
		isCardToBankTransfer,
		isCashMovementNew,
		isCashTransfer,
		isCheckToBankTransfer,
		isClosingCash,
		isDeposit,
		isTransferToBank,
		openCashTransfer,
		padding,
		showDetailsActive,
	},
	created,
	data,
	methods: {
		allIsSelected,
		buildParamsForCashBalance,
		buildParamsForCashGet,
		cashTransferAction,
		changePage,
		closeCash,
		closeDetail,
		closeModal,
		createMovement,
		customData,
		downLoadExcelReport,
		getCash,
		getCurrency,
		getData,
		getEndDate,
		getEmployee,
		getInitDate,
		getStateEntity,
		getSubsidiaryId,
		getTypeDocument,
		getTypePayment,
		getTypeMovement,
		loadData,
		loadFilterData,
		onCleanData,
		rowIsDisabled,
		rowIsSelected,
		rowSelected,
		runAction,
		save,
		saveTransaction,
		selectRow,
		setAccount,
		setCash,
		setData,
		viewDetail,
		onSearch,
		columnSortable,
		setMovement,
		openDialog,
		cancelDelete,
		deleteMovement,
		setAmount,
		getColor,
		getText,
		updateData,
		loadCash,
		showDetail,
		closeDetailSeat,
		getAnnexNameByDetail(row) {
			if (!row) return null;
			return row.annexTransaction && row.annexTransaction.name;
		},
	},
	props: {
		cashId: [Number, String],
		salCashDeskClosingId: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.active-button.btn--active {
	background-color: color(success) !important;
	color: white;
}

.table-and-details {
	align-items: flex-start;
	display: flex;
	justify-items: center;
}

.caption-date {
	color: color(brown-grey);
	display: inherit;
	font-family: font(open-regular);
	font-size: size(small13);
	margin-bottom: 2px;
}

.container-table {
	position: relative;
}

.opacity-table {
	background-color: rgba(255, 255, 255, 0.52);
	bottom: 0;
	left: 0;
	padding-top: 7%;
	position: absolute;
	right: 0;
	top: 64px;
	z-index: 2;
}

.text-opacity {
	background-color: white;
	border: solid 3px color(primary);
	border-style: dashed;
	color: #828282;
	font-family: map-get($fonts, open-semibold);
	font-size: 14px;
	margin: 0 auto;
	max-width: 405px;
	padding: 28px 33px;
}

.state-entity {
	border-radius: 4px;
	color: white;
	font-family: map-get($fonts, open-bold);
	padding: 3px 6px;
}
</style>
