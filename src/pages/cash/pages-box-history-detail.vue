<template>
	<div>
		<screen-loading v-if="isLoadData" />
		<header-page
			name="box-history-detail"
			:title="titleHeader"
			to-show
			emit-excel
			column-class="xs12"
			@emit-excel="emitExcel"
			:excel-loading="isLoading"
			show-excel
			@clean-product-filter="clearFilter"
		>
			<v-layout column mr-4>
				<v-flex text-xs-right class="header-title">
					{{ isDetailGraphic ? 'Total' : 'Saldo Final del cierre' }}:
				</v-flex>
				<v-flex text-xs-right class="text-bold">
					{{ symbol }} {{ balance | round }}
				</v-flex>
			</v-layout>
		</header-page>
		<general-filter mt-3 class="layout wrap align-end">
			<v-flex xs12 sm4 lg2 px-1 my-2 mr-3>
				<app-select
					chips
					:items="typePayments"
					item-text="paymentType.name"
					item-value="paymentType.id"
					label="Tipo de Pago"
					model="typePaymentParams"
					multiple
					:return-object="false"
					:item="typePaymentParams"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 sm4 lg2 px-1 my-2 mr-3>
				<app-select
					chips
					:items="typeMovements"
					item-text="name"
					item-value="id"
					label="Tipo de Movimiento"
					model="typeMovementsParams"
					multiple
					:return-object="false"
					:item="typeMovementsParams"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 sm4 lg2 px-1 my-2 mr-3 v-if="!flagOutbox">
				<app-select
					chips
					:items="typeModules"
					item-text="name"
					item-value="id"
					label="Origen"
					model="typeModuleParams"
					multiple
					:return-object="false"
					:item="typeModuleParams"
					@input="setData"
				/>
			</v-flex>
			<v-flex
				xs12
				sm4
				lg2
				px-1
				my-2
				mr-3
				v-if="$route.query.type === 'bank' && bankAccounts.length > 0"
			>
				<app-select
					item-text="name"
					item-value="id"
					label="Cuentas Bancarias"
					:items="bankAccounts"
					:item="bankAccount"
					model="bankAccount"
					@input="setBankAccount"
				/>
			</v-flex>
			<v-flex xs3 sm2 lg1 px-1 my-2>
				<v-btn
					type="button"
					color="primary"
					class="btn-action btn-action-block"
					@click="filterData"
				>
					Buscar
					<v-icon color="white" size="16"> check_circle_outline </v-icon>
				</v-btn>
			</v-flex>
		</general-filter>
		<v-layout wrap justify-center px-5 v-if="!isDetailGraphic" mt-3>
			<v-flex
				v-for="(detail, index) in details"
				:key="detail.id"
				class="register-detail-container mb-2 ml-1"
			>
				<register-detail
					:field="detail.field"
					:label="detail.label"
					:large="detail.large"
					:value="`${symbol || ''} ${detail.value}`"
					large-head
					:green-head="index === 6"
				></register-detail>
			</v-flex>
		</v-layout>
		<div class="layout wrap align-start justify-center mt-3">
			<v-flex :class="toShow || toShowTransactions ? 'xs8 active' : 'xs12'">
				<app-table
					name="box-history-detail"
					class="is-not-selectable"
					:class="{ 'pr-0': toShow || toShowTransactions }"
					:columns="columns"
					:current-page="current"
					:last-page="lastPage"
					:rows="rows"
					:items-quantity="rows.length"
					:items-total-quantity="itemsTotalQuantity"
					:input-search="false"
					:paint-row="['typeMovement', 2]"
					@on-page="onPage"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable" v-show="showRow(columns, 1)">
							{{ props.row.createdAt | formatDate('YYYY-MM-DD HH:mm:ss') }}
						</td>
						<td v-show="showRow(columns, 2)">
							{{ props.row.typeMovement === 1 ? 'Ingreso' : 'Egreso' }}
						</td>
						<td v-show="showRow(columns, 3)">
							{{
								props.row.typeTransaction === 1 || !props.row.bankId ? 'Caja' : 'Banco'
							}}
						</td>
						<td v-show="showRow(columns, 4)">
							{{ getModuleRow(props.row) || '-' }}
						</td>
						<td v-show="showRow(columns, 5)">
							{{ getTypePaymentRow(props.row) }}
						</td>
						<td v-show="showRow(columns, 6)">
							{{
								props.row.transaction &&
								props.row.transaction.additionalInformation &&
								props.row.transaction.additionalInformation.comment
									? props.row.transaction.additionalInformation.comment
									: props.row.concept
							}}
							-
							{{ props.row.joinDocuments || '' }}
							{{
								props.row.additionalInformation
									? props.row.additionalInformation.comment
									: ''
							}}
						</td>
						<td v-show="showRow(columns, 7)">
							{{ getAnnexNameByDetail(props.row) || '-' }}
						</td>
						<td v-show="showRow(columns, 8)">
							{{ currencyRow(props.row) }}
							{{ paymentAmountRow(props.row) }}
						</td>
						<td v-show="showRow(columns, 9)">
							<app-tooltip-button
								v-if="
									(props.row.module && props.row.module.code === 'VENTA') ||
									props.row.validAcoRec
								"
								:icon="props.row.iconArrow"
								text="Ver Detalle En Tabla"
								color="success"
								size="20"
								@click-icon="showDetail(props.row)"
							/>
							<app-tooltip-button
								:disabled="!props.row.validSale && !props.row.salDocumentId"
								class="ml-1"
								color="primary"
								icon="remove_red_eye"
								:text="`Ver Detalle de ${props.row.typeDoc}`"
								@click-icon="detailSale(props.row)"
							/>
						</td>
					</template>
				</app-table>
			</v-flex>
			<v-flex xs4 :class="{ active: toShow }" v-show="toShow" pr-4>
				<v-layout row wrap class="table-detail">
					<v-flex xs12 class="head-table">
						<v-layout row wrap>
							<v-flex xs8 class="date-table">{{
								rowDetailSelected.createdAt | formatDate('YYYY-MM-DD')
							}}</v-flex>
							<v-flex xs3>
								<div class="label-head">Importe</div>
								<div>
									{{ rowDetailSelected.currencySymbol
									}}{{ rowDetailSelected.paymentAmount }}
								</div>
							</v-flex>
							<v-flex xs1 pt-3>
								<button @click="closeDetail">
									<v-icon color="white">clear</v-icon>
								</button>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 wrap>
						<v-layout wrap pa-3 class="items-table">
							<v-layout xs12 row align-center>
								<v-flex xs6>
									<v-layout row wrap align-center>
										<v-flex d-flex align-center pl-2 class="column-label">
											Código:
										</v-flex>
										<v-flex d-flex align-center class="column-value">
											{{ rowDetailSelected.code }}
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs6 pl-2>
									<v-layout row wrap align-center>
										<v-flex d-flex align-center pl-2 class="column-label">
											Doc. Origen:
										</v-flex>
										<v-flex d-flex align-center class="column-value">
											{{ rowDetailSelected.documentNumberOrigin }}
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
							<v-flex xs12>
								<v-layout row wrap align-center mt-2>
									<v-flex d-flex align-center pl-2 class="column-label"> Fecha: </v-flex>
									<v-flex d-flex align-center class="column-value">
										{{ rowDetailSelected.createdAt | formatDate('YYYY-MM-DD') }}
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12>
								<v-layout row wrap align-center mt-2>
									<v-flex xs12 d-flex align-center pl-2 class="column-label w-100">
										Referencia:
									</v-flex>
									<v-flex xs12 d-flex align-center class="column-value">
										{{ rowDetailSelected.reference }}
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12>
								<v-layout row wrap align-center mt-2>
									<v-flex xs12 d-flex align-center pl-2 class="column-label w-100">
										Concepto:
									</v-flex>
									<v-flex xs12 d-flex align-center class="column-value">
										{{ rowDetailSelected.concept }}
									</v-flex>
								</v-layout>
							</v-flex>
							<v-layout xs12 mt-2 row align-center>
								<v-flex xs6>
									<v-layout row wrap align-center>
										<v-flex d-flex align-center pl-2 class="column-label">
											Asiento:
										</v-flex>
										<v-flex d-flex align-center class="column-value">
											{{ rowDetailSelected.accountingSeatCode }}
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs6 pl-2>
									<v-layout row wrap align-center>
										<v-flex d-flex align-center pl-2 class="column-label">
											Origen:
										</v-flex>
										<v-flex d-flex align-center class="column-value">
											{{ getModule }}
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
							<v-flex xs12>
								<v-layout row wrap align-center mt-2>
									<v-flex xs12 d-flex align-center pl-2 class="column-label w-100">
										Benef:
									</v-flex>
									<v-flex xs12 d-flex align-center class="column-value">
										{{ getCustomer }}
									</v-flex>
								</v-layout>
							</v-flex>
							<v-layout xs12 mt-2 row align-center>
								<v-flex xs6>
									<v-layout row wrap align-center>
										<v-flex d-flex align-center pl-2 class="column-label">
											Importe:
										</v-flex>
										<v-flex d-flex align-center class="column-value">
											{{ rowDetailSelected.currencySymbol
											}}{{ rowDetailSelected.paymentAmount }}
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs6 pl-2>
									<v-layout row wrap align-center>
										<v-flex d-flex align-center pl-2 class="column-label">
											Banco:
										</v-flex>
										<v-flex d-flex align-center class="column-value">
											{{ getBank }}
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
							<v-flex xs12>
								<v-layout row wrap align-center mt-2>
									<v-flex d-flex align-center pl-2 class="column-label"> Pago: </v-flex>
									<v-flex d-flex align-center class="column-value">
										{{ getTypePayment }}
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12>
								<v-layout row wrap align-center mt-2>
									<v-flex xs12 d-flex align-center pl-2 class="column-label w-100">
										Comentario:
									</v-flex>
									<v-flex xs12 d-flex align-center class="column-value">
										{{ getComment }}
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<transition name="fade-left" mode="out-in">
				<v-flex
					xs4
					id="details-info-document"
					:class="['item-details pl-4 pr-4', { active: toShowTransactions }]"
					v-show="toShowTransactions"
				>
					<app-documents-details
						:transaction="transaction"
						@close="closeTransaction"
						@close-detail="closeTransaction"
						@save="saveTransaction"
					/>
				</v-flex>
			</transition>
		</div>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import generalFilter from '@/components/shared/general-filter';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import registerDetail from '@/components/movements-in-accounts/register-detail';
import lib from '@/shared/lib';
import helper from '@/shared/helper';
import appDocumentsDetails from '@/components/cash-desk-closing/sub-components/documents-details';
import screenLoading from '@/components/shared/utils/screen-loading';

const { getDeeper } = lib;
function created() {
	const { startAmount, cash, card, voucher, cashAmountKept, deposit } = this.$route.query;
	this.details[0].value = startAmount || 0;
	this.details[1].value = Number(cash) || 0;
	this.details[2].value = Number(card) || 0;
	this.details[3].value = Number(voucher) || 0;
	this.details[4].value = cashAmountKept || 0;
	this.details[5].value = Number(deposit) || 0;
	const sumTotal =
		Number(
			this.details[1].value +
				this.details[2].value +
				this.details[3].value +
				this.details[5].value
		) || 0;
	this.details[6].value = Number(sumTotal.toFixed(2));
	this.typeMovement = this.$route.query.typeMovement;
	if (this.typeMovement) {
		this.typeMovDetail = parseInt(this.$route.query.typeMovement, 10);
	}
	this.loadResources();
	this.loadData();
	if (this.flagOutbox) {
		this.columns[3].visible = false;
		this.columns[3].checked = false;
	}
}

function onPage(page) {
	this.current = page;
	this.loadData();
}

function showDetail(row) {
	const { transaction, transactionBank } = row;
	if (row.validAcoRec) {
		if (transaction) {
			this.transaction = transaction;
			this.toShowTransactions = true;
			this.rows.forEach((d) => {
				const arrow = d.id === row.id ? 'arrow_back' : 'arrow_forward';
				this.$set(d, 'iconArrow', arrow);
			});
		} else if (this.$route.name === 'box-detail' && row) {
			this.transaction = row;
			this.toShowTransactions = true;
			this.rows.forEach((d) => {
				const arrow = d.id === row.id ? 'arrow_back' : 'arrow_forward';
				this.$set(d, 'iconArrow', arrow);
			});
		} else if (transactionBank) {
			this.transaction = transactionBank;
			this.toShowTransactions = true;
			this.rows.forEach((d) => {
				const arrow = d.id === row.id ? 'arrow_back' : 'arrow_forward';
				this.$set(d, 'iconArrow', arrow);
			});
		} else {
			this.showGenericError('Este documento no tiene transacciones asociadas');
		}
	} else {
		this.rowDetailSelected = this.rowDetailSelected.id === row.id ? {} : { ...row };
		this.toShow = !!this.rowDetailSelected.id;
		this.rows.forEach((d) => {
			const arrow = d.id === row.id && this.toShow ? 'arrow_back' : 'arrow_forward';
			this.$set(d, 'iconArrow', arrow);
		});
	}
}

function detailSale(row) {
	const { salDocumentId, salDocumentsId, transaction, transactionBank } = row;
	const saleDocument =
		salDocumentId ||
		salDocumentsId ||
		transaction?.documentId ||
		transactionBank?.documentId;
	const routeData = this.$router.resolve({
		name: 'convert',
		params: { id: saleDocument },
	});
	window.open(routeData.href, '_blank');
}

function closeDetail() {
	this.toShow = false;
	this.rows = this.rows.map((r) => {
		const newRow = { ...r };
		newRow.iconArrow = 'arrow_forward';
		return newRow;
	});
}

async function loadResources() {
	const subsidiaryId = this.$route.query.subsidiaryId;
	const requests = [
		this.getTypePayments('sales'),
		this.$httpSales('module'),
		this.$httpSales('type-movement'),
		this.$httpSales.get('bank-account', { params: { subsidiaryId } }),
	];
	[
		{ data: this.typePayments },
		{ data: this.typeModules },
		{ data: this.typeMovements },
		{ data: this.bankAccounts },
	] = await Promise.all(requests);
}

function setData({ model, value }) {
	this[model] = value;
}

async function loadData() {
	this.isLoadData = true;
	const currency = this.$route.query.currency;
	this.params.page = this.current;
	this.params.limit = 10;
	if (this.isDetailGraphic) {
		this.params.cashId = this.flagOutbox ? undefined : Number(this.id);
		this.params.typeMovement = this.typeMovDetail;
		this.params.salCashDeskClosingId = Number(this.$route.query.cashDeskClosingId);
	} else {
		this.params.salCashDeskClosingId = Number(this.id);
		this.params.typeMovement = this.typeMovDetail;
	}
	if (!this.isAdmin && this.isDetailGraphic) {
		this.params.employeeId = this.$userInfo.id;
	}
	let params = {};
	try {
		const typeTransaction = this.$route.query.type;
		let url = '';
		if (this.$route.query.type) {
			const isTypeBox = typeTransaction === 'box';
			params = this.params;
			if (isTypeBox) {
				params.relationAdd =
					'typeTransactionBank,employee,bankAccount,moduleOrigin,bank,typePayment,bankReconcilement,customer,annexTransaction';
				url = `transactions/${currency}`;
			} else {
				params.relationAdd =
					'saleDocument,state,typePayment,paymentMethod,cash,module,annexTransaction';
				url = 'transaction-bank-list';
			}
		} else {
			params.typePaymentIds =
				this.typePaymentParams.length > 0 ? this.typePaymentParams.join(', ') : undefined;
			params.moduleIds =
				this.typeModuleParams.length > 0 ? this.typeModuleParams.join(', ') : undefined;
			params.typeMovements =
				this.typeMovementsParams.length > 0
					? this.typeMovementsParams.join(', ')
					: undefined;
			url = `cash-closing/${this.id}/details`;
		}
		let response = '';
		if (this.$route.query.type) {
			response = await this.$httpSales.post(url, this.body, { params });
		} else {
			response = await this.$httpSales.get(url, { params }, this.body);
		}
		this.rows = response.data.map((row) => {
			const newRow = { ...row };
			newRow.iconArrow = 'arrow_forward';
			const validModuleCode = row.module ? row.module.code : null;
			const validModuleOriginCode = row.moduleOrigin ? row.moduleOrigin.code : null;
			const module = this.typeModules.find((t) => row.moduleOriginId === t.id);
			const validModule = module && module.code;
			const amount = row.typeMovement === 1 ? row.amount : row.amount * -1;
			if (this.$route.name === 'box-detail') {
				newRow.joinDocuments =
					row.documents && row.documents.length > 1 ? row.documents.join(', ') : null;
			}
			if (row.transactionBank) {
				newRow.moduleCode =
					row.transactionBank && row.transactionBank.moduleOrigin
						? row.transactionBank.moduleOrigin.code
						: validModuleCode || null;
				newRow.salDocumentId =
					row.transactionBank && row.transactionBank
						? row.transactionBank.salDocumentsId
						: null;
			} else {
				newRow.moduleCode =
					row.transaction && row.transaction.module
						? row.transaction.module.code
						: validModuleCode || validModule || validModuleOriginCode || null;
				newRow.salDocumentId =
					row.transaction && row.transaction
						? row.transaction.salSaleDocumentsId
						: row.salSaleDocumentsId || null;
			}
			newRow.typeDoc = newRow.moduleCode === 'VENTA' ? 'Venta' : 'Cuentas por Cobrar';
			newRow.validSale = newRow.moduleCode === 'VENTA';
			newRow.validAcoRec = newRow.moduleCode === 'CTAXCOB';
			newRow.amount = this.flagOutbox ? amount : row.amount;
			return newRow;
		});
		this.lastPage = Number(response.headers['x-last-page']);
		this.itemsTotalQuantity = this.rows.length;
		if (this.rows.length) {
			this.symbol = this.rows[0].currencySymbol;
			if (this.isDetailGraphic) {
				this.balance = this.rows.reduce((acum, r) => acum + r.amount, 0);
			} else {
				this.balance = this.$route.query ? this.$route.query.endAmount || 0 : 0;
			}
		} else {
			this.symbol = null;
			this.balance = null;
		}
	} catch (error) {
		this.showGenericError();
	} finally {
		this.isLoadData = false;
	}
}

function getModule() {
	return getDeeper('module', 'name')(this.rowDetailSelected);
}

function getTypePayment() {
	return getDeeper('typePayment', 'name')(this.rowDetailSelected);
}

function isAdmin() {
	return Boolean(this.$userInfo.flagAdmin);
}

function getCustomer() {
	return getDeeper('customer', 'name')(this.rowDetailSelected);
}

function getBank() {
	return getDeeper('bank', 'name')(this.rowDetailSelected);
}

function filterData() {
	this.body.typePaymentIds = this.typePaymentParams.length
		? this.typePaymentParams
		: undefined;
	this.body.moduleIds = this.typeModuleParams.length ? this.typeModuleParams : undefined;
	this.body.typeMovements = this.typeMovementsParams.length
		? this.typeMovementsParams
		: undefined;
	if (this.$route.query.type === 'bank') {
		this.body.bankAccountIds = this.bankAccount ? [this.bankAccount] : undefined;
	}
	this.loadData();
}

function isDetailGraphic() {
	return this.$route.name === 'box-detail';
}

function clearFilter() {
	this.typeMovementsParams = [];
	this.typePaymentParams = [];
	this.typeModuleParams = [];
	this.typeMovement = null;
	this.typeMovDetail = null;
	this.bankAccount = null;
	this.current = 1;
	this.filterData();
}

function getComment() {
	if (this.rowDetailSelected.transaction) {
		return getDeeper(
			'additionalInformation',
			'comment'
		)(this.rowDetailSelected.transaction);
	}
	return getDeeper(
		'additionalInformation',
		'comment'
	)(this.rowDetailSelected.transactionBank);
}

function goToBack() {
	const name = this.isDetailGraphic ? 'cash-box-close' : 'box-history';
	this.goTo(name, { query: { ...this.$route.query } });
}

function setTypeMovementDetail({ model, value }) {
	this[model] = value.type;
}

function titleHeader() {
	if (this.$route.query.type) {
		return this.$route.query.type === 'box'
			? this.$route.query.cashName
			: 'Detalle de Banco';
	}
	return this.$route.query.cashName;
}

function setMovement({ model, value }) {
	this[model] = value.type;
}

function setBankAccount({ model, value }) {
	this[model] = value.id;
}

function getModuleRow(row) {
	if (row.transaction) {
		if (row.transaction.module) {
			return row.transaction.module.name;
		}
	}
	if (row.transactionBank) {
		if (row.transactionBank.moduleOrigin) {
			return row.transactionBank.moduleOrigin.name;
		}
	}
	if (row.module) {
		return row.module.name;
	}
	if (row.moduleOrigin) {
		return row.moduleOrigin.name;
	}
	if (row.moduleOriginId) {
		const module = this.typeModules.find((t) => row.moduleOriginId === t.id);
		return module && module.name;
	}
	return null;
}

function currencyRow(row) {
	if (row.transaction) {
		if (row.transaction.currencySymbol) {
			return row.transaction.currencySymbol;
		}
	}
	if (row.transactionBank) {
		if (row.transactionBank.currency) {
			return row.transactionBank.currency === 'PEN' ? 'S/.' : 'USD';
		}
	}
	if (row.currencySymbol) {
		return row.currencySymbol;
	}
	return null;
}

function getTypePaymentRow(row) {
	if (row.transaction) {
		if (row.transaction.typePayment) {
			return row.transaction.typePayment.name;
		}
	}
	if (row.transactionBank) {
		if (row.transactionBank.typePayment) {
			return row.transactionBank.typePayment.name;
		}
	}
	if (row.typePayment) {
		return row.typePayment.name;
	}
	return null;
}

function paymentAmountRow(row) {
	if (row.transaction) {
		if (row.transaction.paymentAmount) {
			return row.transaction.paymentAmount;
		}
	}
	if (row.transactionBank) {
		if (row.transactionBank.paymentAmount) {
			return row.transactionBank.paymentAmount;
		}
	}
	if (row.paymentAmount) {
		return row.paymentAmount;
	}
	return null;
}

function emitExcel() {
	this.isLoading = true;
	const arrayFilter = this.rows.map((p) => {
		const newRow = {};
		newRow.date = helper.formatDate(p.createdAt, 'YYYY-MM-DD');
		newRow.typeMovement = p.typeMovement === 1 ? 'Ingreso' : 'Egreso';
		newRow.typeTransaction = p.typeTransaction === 1 || !p.bankId ? 'Caja' : 'Banco';
		newRow.origin = this.getModuleRow(p);
		newRow.typePayment = getTypePaymentRow(p);
		newRow.concept = `${
			p.transaction &&
			p.transaction.additionalInformation &&
			p.transaction.additionalInformation.comment
				? p.transaction.additionalInformation.comment
				: p.concept
		}`;
		newRow.amount = paymentAmountRow(p);
		return newRow;
	});
	this.exportTable(this.columnsToExport, arrayFilter, 'reporte-de-pedidos');
	this.isLoading = false;
}

function columnsToExport() {
	const newColumns = this.columns.map((col) => {
		const newCol = Object.assign({}, col);
		delete newCol.id;
		delete newCol.visible;
		delete newCol.checked;
		delete newCol.tooltip;
		delete newCol.flagVisible;
		return newCol;
	});
	return newColumns;
}

function data() {
	return {
		bankAccount: null,
		bankAccounts: [],
		transaction: null,
		columns: [
			{ id: 1, name: 'Fecha', value: 'date', visible: true, checked: true },
			{
				id: 2,
				name: 'Tipo de Mov.',
				value: 'typeMovement',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Tipo de Transac.',
				value: 'typeTransaction',
				visible: true,
				checked: true,
			},
			{ id: 4, name: 'Origen', value: 'origin', visible: true, checked: true },
			{
				id: 5,
				name: 'Tipo de Pago',
				value: 'typePayment',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Comentario',
				value: 'concept',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Anexo de caja',
				value: 'annexTransaction.name',
				visible: this.$userInfo.company.settings.flagAnnexTransactions,
				checked: this.$userInfo.company.settings.flagAnnexTransactions,
				flagVisible: !this.$userInfo.company.settings.flagAnnexTransactions,
			},
			{ id: 8, name: 'Importe', value: 'amount', visible: true, checked: true },
			{ id: 9, name: 'Acción', value: 'action', visible: true, checked: true },
		],
		itemsTotalQuantity: 0,
		rows: [],
		isLoading: false,
		isLoadData: false,
		lastPage: 0,
		current: 1,
		movementTypes: [],
		typeMovementsDetail: [
			{
				id: 1,
				name: 'Ingreso',
				type: 1,
			},
			{
				id: 2,
				name: 'Egreso',
				type: 2,
			},
		],
		typeMovDetail: null,
		toShow: false,
		toShowTransactions: false,
		rowDetailSelected: {},
		typePayments: [],
		typePaymentParams: [],
		typeModules: [],
		typeModuleParams: [],
		typeMovements: [],
		typeMovement: null,
		params: {},
		balance: null,
		body: {},
		symbol: null,
		typeMovementsParams: [],
		details: [
			{
				id: 1,
				label: 'Saldo anterior',
				value: '---',
			},
			{
				id: 2,
				label: 'EFECTIVO',
				value: '---',
			},
			{
				id: 3,
				label: 'Monto Tarj. de Créd.',
				value: '---',
			},
			{
				id: 4,
				label: 'Monto Cheque',
				value: '---',
			},
			{
				id: 5,
				label: 'Mantener en caja',
				value: '---',
			},
			{
				id: 6,
				label: 'Monto Deposito',
				value: '---',
			},
			{
				id: 7,
				label: 'TOTAL',
				value: '---',
			},
		],
	};
}
export default {
	name: 'page-box-history-detail',
	data,
	created,
	components: {
		appTable,
		headerPage,
		generalFilter,
		autocompleteComponent,
		registerDetail,
		appDocumentsDetails,
		screenLoading,
	},
	computed: {
		columnsToExport,
		getModule,
		getTypePayment,
		isAdmin,
		getCustomer,
		getBank,
		isDetailGraphic,
		getComment,
		titleHeader,
	},
	methods: {
		currencyRow,
		detailSale,
		emitExcel,
		paymentAmountRow,
		getTypePaymentRow,
		getModuleRow,
		setBankAccount,
		onPage,
		showDetail,
		closeDetail,
		setMovement,
		setTypeMovementDetail,
		loadResources,
		setData,
		loadData,
		filterData,
		clearFilter,
		goToBack,
		closeTransaction() {
			this.toShowTransactions = !this.toShowTransactions;
			this.rows = this.rows.map((r) => {
				const newRow = { ...r };
				newRow.iconArrow = 'arrow_forward';
				return newRow;
			});
		},
		async saveTransaction({ body, id }) {
			try {
				await this.$httpSales.patch(`transactions/${id}`, body);
				this.showNotification('El movimiento ha sido actualizado correctamente.');
			} catch (err) {
				if (err.status === 500) {
					this.showNotificationNew();
				} else if (err.status === 400) {
					this.showNotification('No se guardaron los cambios', 'error');
				}
			}
		},
		getAnnexNameByDetail(row) {
			if (!row) return null;
			const prop = row.transactionBank ? 'transactionBank' : 'transaction';
			return row[prop] && row[prop].annexTransaction && row[prop].annexTransaction.name;
		},
	},
	props: {
		id: [Number, String],
	},
};
</script>
<style lang="scss" scoped>
.head-table {
	background: color(primary);
	color: map-get($colors, white);
	font-weight: 800;
	height: 62px;
}
.date-table {
	font-size: 18px;
	padding: 10px;
}
.label-head {
	font-size: 13px;
	padding-top: 5px;
}
.table-detail {
	background: map-get($colors, white);
	border: 1px solid map-get($colors, blue-grey);
	border-radius: 0 0 19px 0;
}
.items-table {
	font-size: 15px;
}
.pr-0 {
	padding-right: 0 !important;
}
.text-bold {
	color: color(primary);
	font-family: map-get($fonts, open-bold);
	font-size: 19px;
}

.w-100 {
	max-width: 100% !important;
}

.header-title {
	color: color(background-sidebar);
	font-size: map-get($sizes, small);
	font-family: map-get($fonts, open-semibold);
}

.red {
	color: red;
}
</style>
