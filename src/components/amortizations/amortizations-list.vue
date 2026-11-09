<template>
	<section>
		<header-page
			to-show
			export-to-pdf
			showExcelMenu
			:showExcel="false"
			:exportToPdf="false"
			:exportToPdfList="true"
			show-clean
			@clean-product-filter="cleanFilter"
			:columns="columns"
			:rows="data"
			:title="$route.meta.title"
			name="amortizations"
			@emit-excel="emitExcel"
			:open-on-click="true"
			:options="options"
			@download-dispatch-list="downloadDispatch"
			:optionsAmortizations="optionsAmortizations"
		/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter class="layout wrap align-end my-3">
			<v-flex xs3>
				<label class="caption">Buscar Cliente</label>
				<v-select
					autocomplete
					hide-details
					class="filter-select"
					content-class="filter-select-content"
					label="Buscar Cliente"
					item-id="id"
					item-text="autocomplete"
					single-line
					v-model="customer"
					@input="loadSales(1)"
					:items="customers"
					:search-input.sync="search"
				>
				</v-select>
			</v-flex>
			<v-flex xs3 pr-3 ml-2>
				<autocomplete-component
					chips
					multiple
					:return-object="false"
					item-text="fullname"
					item-value="id"
					:items="employees"
					label-value="Empleado"
					resource-url="/employees"
					:http-code="'$httpSales'"
					:item="employeeIds"
					@return-data="setDataEmployee($event, 'employeeIds')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs2 pr-3>
				<autocomplete-component
					chips
					multiple
					:item="params.groupIds"
					item-text="name"
					item-value="id"
					:items="groups"
					label-value="Grupo"
					model="groupIds"
					placeholder-value="Selecciona el grupo"
					@return-data="setData({ value: $event, model: 'groupIds' })"
				></autocomplete-component>
			</v-flex>
			<v-flex xs2 pr-3 v-if="isPeru">
				<label class="caption">Tipo de Moneda</label>
				<v-select
					hide-details
					class="filter-select"
					content-class="filter-select-content"
					label="Tipo de Moneda"
					item-text="name"
					item-value="code"
					single-line
					:value="currencyId"
					@input="setCurrencyData"
					return-object
					:items="currencies"
				>
				</v-select>
			</v-flex>
			<v-flex xs3 pr-3>
				<app-select
					:item="params.salTypeDocumentId"
					item-text="name"
					item-value="id"
					:items="typeDocuments"
					label="Tipo de Documento"
					model="salTypeDocumentId"
					:return-object="false"
					@input="setData"
				></app-select>
			</v-flex>
			<v-flex xs2 pr-3>
				<app-select
					:item="params.paymentState"
					item-text="name"
					item-value="id"
					:items="paymentStates"
					label="Estado de Pago"
					model="paymentState"
					:return-object="false"
					@input="setData"
				></app-select>
			</v-flex>
			<v-flex xs4>
				<v-layout row wrap>
					<v-flex xs6 pr-3>
						<label class="caption">Fecha inicial</label>
						<date-component
							:date="params.startDate"
							icon="/static/img/calendar.svg"
							@on-input="setData({ model: 'startDate', value: $event })"
						></date-component>
					</v-flex>
					<v-flex xs6 pr-3>
						<label class="caption">Fecha final</label>
						<date-component
							:date="params.endDate"
							:disabled="!params.startDate"
							icon="/static/img/calendar.svg"
							@on-input="setData({ model: 'endDate', value: $event })"
						></date-component>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs6 v-show="totalDueAmount" text-xs-right>
				TOTAL POR COBRAR: {{ totalDueAmount | round }}
			</v-flex>
		</general-filter>
		<v-layout wrap>
			<v-flex :class="show ? 'xs8 active' : 'xs12'">
				<app-table
					name="amortizations"
					:columns="columns"
					:current-page="currentPage"
					:last-page="lastPage"
					:key-value="keyValue"
					:checkAll="checkAll"
					:rows="data"
					:check-all-disabled="!customer.id"
					disabled-value="disabled"
					dispatch-detail
					selectable
					:items-quantity="data.length"
					:items-total-quantity="itemsTotalQuantity"
					@on-page="loadSales"
					@on-selected-all="selectedAll"
					@row-is-selected="selectedRow"
					@on-search-event="onSearch"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">{{ getFullName(props.row) }}</td>
						<td v-show="showRow(columns, 2)">
							<a @click="preGoTo(props.row)">
								{{ props.row.documentNumber }}
							</a>
						</td>
						<td v-show="showRow(columns, 3)">
							{{ props.row.createdAt | formatDate }}
						</td>
						<td v-show="showRow(columns, 4)">
							{{ props.row.typeDocument.name }}
						</td>
						<td v-show="showRow(columns, 5)">
							{{ props.row.employee ? props.row.employee.fullname : null }}
						</td>
						<td v-show="showRow(columns, 6)">
							<document-state
								:color="props.row.state.color"
								:tooltip="props.row.state.name"
							/>
						</td>
						<td v-show="showRow(columns, 7)">
							<document-state
								:color="props.row.paymentStateColor"
								:tooltip="props.row.paymentStateName"
							/>
						</td>
						<td v-show="showRow(columns, 8)">{{ props.row.payment.name }}</td>
						<td v-show="showRow(columns, 9)">{{ props.row.dueAmount }}</td>
						<td v-show="showRow(columns, 10)">
							{{ props.row.debtAmount | round }}
						</td>
						<td v-show="showRow(columns, 11)">
							{{ props.row.amount | round }}
						</td>
						<td v-show="showRow(columns, 12)">
							<app-tooltip-button
								:icon="props.row.iconArrow"
								text="Ver Detalle en Tabla"
								color="success"
								size="20"
								@click-icon="openModalAmortization(props.row)"
							/>
						</td>
					</template>
				</app-table>
			</v-flex>
			<transition xs4 name="fade-left" mode="out-in">
				<v-flex xs4 :class="{ active: show }" v-show="show">
					<detail-amortizations
						:amortization-id="amortizationSelected.id"
						@close-slider="closeSlider"
					/>
				</v-flex>
			</transition>
		</v-layout>
		<action-sidebar
			title="Cuentas por cobrar"
			:width="500"
			:help-actions="actionsToHelp"
			v-model="sidebarStatus"
			@close-modal="closeModal"
		>
			<amortizations-component
				v-if="actionCode === 'collect-cxc'"
				:amortization-data="amortization"
				:currency="currency"
				:currency-symbol="currencySymbol"
				:customer="customer"
				:disabled-collect="disabledCollect"
				:is-different-cash="isDifferentCash"
				:quote-error="quoteError"
				:data-selected="dataSelected"
				show-buttons
				:total-amount="totalAmount"
				:total-to-pay="totalToPay"
				:transaction-data="transaction"
				:type-payment-code="typePaymentCode"
				:type-payments="typePayments"
				@cancel="closeModal"
				@get-data="getData"
				@get-transaction-data="getTransactionData"
				@save="save"
				@show-error-message="showErrorMessage"
			/>
		</action-sidebar>
	</section>
</template>

<script>
import { differenceInDays, subDays, format } from 'date-fns';
import amortizationsComponent from '@/components/amortizations/amortizations-component';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import dateComponent from '@/components/shared/date-component';
import documentState from '@/components/shared/document-state';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import purchasesPaymentForm from '@/components/purchases/purchases-payment-form';
import quickActions from '@/components/shared/quick-actions';
import lib from '@/shared/lib';
import { LIST_SALES, LIST_SALES_DUES_RECEIVABLE } from '@/shared/reports';
import detailAmortizations from '@/components/amortizations/detail-amortizations';

const { getDeeper } = lib;

function openModalAmortization(row) {
	this.amortizationSelected =
		this.amortizationSelected.id === row.id ? {} : { ...row };
	this.show = !!this.amortizationSelected.id;
	this.data = this.data.map((amortization) => {
		const newAmortization = { ...amortization };
		newAmortization.iconArrow =
			amortization.id === row.id && this.show ? 'arrow_back' : 'arrow_forward';
		return newAmortization;
	});
}

function closeSlider() {
	this.show = false;
	this.data = this.data.map((arrow) => {
		const newRow = { ...arrow };
		newRow.iconArrow = 'arrow_forward';
		return newRow;
	});
}

function cleanFilter() {
	this.customer = {
		id: 0,
		typePerson: {
			documentNumber: '',
			fullName: '',
		},
	};
	this.currencyId = this.$userInfo.company.currency;
	this.params = {
		startDate: format(subDays(this.$today(), 30), 'YYYY-MM-DD'),
		endDate: format(this.$today(), 'YYYY-MM-DD'),
		employeeIds: [],
		limit: 20,
		page: 1,
		search: null,
		paymentState: null,
		salTypeDocumentId: null,
		groupIds: [],
	};
	this.employeeIds = [];
	this.selectedAll(false);
	this.loadSales();
}

function getFullName(row) {
	return getDeeper('customer', 'typePerson', 'fullName')(row);
}

function buildBody(isDetail) {
	const body = {
		startDate: this.params.startDate || undefined,
		endDate: this.params.endDate || undefined,
		customerId: this.customer.id ? this.customer.id : undefined,
		currency: this.currencyId || undefined,
		employeeIds: this.employeeIds.length ? this.employeeIds : undefined,
		paymentState: this.params.paymentState || undefined,
		typeDocumentIds: this.params.salTypeDocumentId
			? [this.params.salTypeDocumentId]
			: undefined,
		groupIds: this.params.groupIds.length ? this.params.groupIds : undefined,
	};
	if (isDetail) {
		return body;
	}
	return {
		...body,
		accountReceivable: true || undefined,
		countryCode: this.$userInfo.company.country.countryCode,
		typeCurrency:
			this.typeCurrency || this.$userInfo.company.currencyDefault.id,
		typeSymbol:
			this.typeSymbol || this.$userInfo.company.currencyDefault.symbol,
	};
}

async function downloadAmortizationsList(code) {
	const report = this.optionsAmortizations.find((r) => r.code === code);
	report.originName = report.name;
	const params = this.buildBody();
	this.generateReportGlobalPdf(report, params);
}

async function downloadAmortizationsDetail(code) {
	const report = this.optionsAmortizations.find((r) => r.code === code);
	report.originName = 'Reporte cuentas por cobrar de cliente detallado';
	const params = this.buildBody(true);
	if (this.validateCustomer) {
		this.generateReportGlobalPdf(report, params);
	} else {
		this.showGenericError(
			'Seleccione un cliente para poder generar el reporte'
		);
	}
}

function created() {
	this.params.startDate = format(subDays(this.$today(), 30), 'YYYY-MM-DD');
	this.params.endDate = format(this.$today(), 'YYYY-MM-DD');
	this.currencyId = this.$userInfo.company.currency;
	this.loadData();
	this.loadSales();
}

function closeModal() {
	this.sidebarStatus = false;
	this.actionCode = null;
	this.transaction = {
		bankAccountId: null,
		additionalInformation: {
			dateReference: null,
		},
		documentNumber: '',
		flagForm: null,
		reference: '',
		urlImage: '',
	};
	this.customer = {
		id: 0,
		typePerson: {
			documentNumber: '',
			fullName: '',
		},
	};
	this.amortization.typePaymentId = null;
	this.selectedAll(false);
	this.totalAmount = 0;
	this.search = '';
	this.amortization.typePaymentId = this.typePayments[0].id;
	this.typePaymentCode = this.typePayments[0].code;
	this.amortization.accountBankId = this.accounts[0].id;
	this.transaction.bankAccountId = this.amortization.accountBankId;
	this.transaction.flagForm = this.typePayments[0].flagForm;
}

function search(value) {
	const searchTrim = value ? value.trim() : '';
	const customer = this.customers.findIndex(
		(c) => c.autocomplete.trim() === searchTrim
	);
	if (customer === -1) {
		if (searchTrim) {
			this.searchCustomers(searchTrim);
		}
	}
}

async function searchCustomers(value) {
	try {
		const url = this.$route.query.customerId
			? `customers?customerId=${this.$route.query.customerId}`
			: 'customers';
		const params = this.$route.query.customerId ? null : { search: value };
		const { data: customers } = await this.$httpSales.get(url, { params });
		this.customers = customers.id ? [{ ...customers }] : [...customers];
		const customerSelected = this.customers.find(
			(c) => c.autocomplete.toLowerCase().trim() === value.toLowerCase()
		);
		if (customerSelected) {
			this.customer = { ...customerSelected };
		}
		if (this.fromCustomer) {
			this.loadSales();
		}
	} catch (error) {
		this.showGenericError();
	}
}

async function loadSales(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	this.params.employeeIds =
		this.employeeIds.length > 0 ? this.employeeIds.join() : null;
	const params = {
		customerId: this.customer.id ? this.customer.id : null,
		currency: this.currencyId,
		...this.params,
	};
	params.groupIds = params.groupIds.length
		? params.groupIds.join(',')
		: undefined;
	this.validateCustomer = params.customerId;
	try {
		const { data: sales, headers } = await this.$httpSalesRead.get(
			'sale-documents/amortization-all',
			{ params }
		);
		this.data = sales.map((sale) => {
			const newSale = { ...sale };
			newSale.isSelected = false;
			newSale.disabled = 0;
			return newSale;
		});
		this.data = this.data.map((arrow) => {
			const newRow = { ...arrow };
			newRow.iconArrow = 'arrow_forward';
			return newRow;
		});
		this.currency = this.data.length > 0 ? this.data[0].currency : 'PEN';
		this.currencySymbol =
			this.data.length > 0 ? this.data[0].currencySymbol : 'S/.';
		this.lastPage = Number(headers['x-last-page']);
		this.itemsTotalQuantity = Number(headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	} finally {
		this.fromCustomer = false;
	}
}

function runAction(action) {
	this.actionCode = action.code;
	if (action.code === 'collect-cxc') {
		if (this.cashUser.flagActive) {
			if (this.dataSelected.length > 0) {
				this.sidebarStatus = true;
				this.customer.id = this.dataSelected[0].customer.id;
			} else {
				this.showNotification(
					'Es necesario seleccionar uno o más registros de un cliente para amortizar.',
					'warning'
				);
			}
		} else {
			this.showNotification(
				'Es necesario activar su caja para poder registrar los cobros.',
				'info'
			);
		}
	}
}

function getTransactionData({ model, newValue }) {
	if (model === 'dateReference') {
		this.$set(this.transaction.additionalInformation, model, newValue);
	} else {
		this.$set(this.transaction, model, newValue);
	}
}

function iconColor({ status }) {
	if (status === 2) {
		return 'warning';
	}
	return status === 3 ? 'success' : 'error';
}

function isCompletePayment(quote) {
	return quote.amountToPay + quote.amountPayment === quote.amount;
}

function isDifferentCash() {
	return this.typePaymentCode !== 'efectivo';
}

async function save() {
	const payment = {
		additionalInformation: this.transaction.additionalInformation,
		bankAccountId: this.transaction.bankAccountId,
		documentNumber: this.transaction.documentNumber,
		reference: this.transaction.reference,
		urlImage: this.transaction.urlImage,
		currency: this.currency,
		customerId: this.customer.id,
		documents: this.dataSelected.map((sale) => {
			const newSale = {};
			newSale.salDocumentId = sale.id;
			newSale.caDocumentId = sale.caDocument.id;
			newSale.amount = sale.caDocument.amount;
			newSale.payments = sale.caDocument.details.reduce((accum, detail) => {
				if (detail.status !== 3) {
					const newAccum = {};
					newAccum.amount = detail.amount;
					const isTotalPayment = isCompletePayment(detail);
					if (isTotalPayment) {
						if (detail.amountToPay < detail.amount) {
							newAccum.amountPayment = detail.amountToPay;
						} else {
							newAccum.amountPayment = detail.amount;
						}
					} else {
						newAccum.amountPayment = detail.amountToPay;
					}
					newAccum.expirationDate = detail.expirationDate;
					newAccum.id = detail.id;
					newAccum.observations = 'Amortizaciones';
					accum.push(newAccum);
				}
				return accum;
			}, []);
			return newSale;
		}),
	};
	const documentsToPay = { ...payment };
	documentsToPay.documents = payment.documents.filter(
		(d) => d.payments.length > 0
	);
	const url = `amortizations-multiple/${this.amortization.typePaymentId}`;
	if (documentsToPay.documents.length > 0) {
		try {
			await this.$httpSales.post(url, documentsToPay);
			this.showNotification('Amortización realizada correctamente');
			this.closeModal();
			this.loadData();
			this.loadSales();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'BANK_ACCOUNT_NOT_FOUND') {
					this.showNotification('Seleccionar cuenta.', 'error');
				} else if (err.data.message === 'SALE_NOT_ALLOWED') {
					this.showGenericError(
						'La cuota que intenta pagar se encuentra con el estado de pago: "Pagado"'
					);
				}
			}
		}
	} else {
		this.showNotification('No hay amortizaciones por realizar.', 'info');
	}
}

function showErrorMessage(quoteData, dataId, saleIdx, quoteIdx, val) {
	const newQuoteData = { ...quoteData };
	newQuoteData.amountToPay = Number(val);
	this.dataSelected[saleIdx].caDocument.details[quoteIdx] = { ...newQuoteData };
	const { id, amountToPay, amount } = newQuoteData;
	if (amountToPay > amount) {
		this.showNotification(
			'El monto a pagar no debe superar el de la cuota',
			'error'
		);
	}
	if (amountToPay < 0) {
		this.showNotification(
			'El monto a pagar debe ser un valor positivo',
			'error'
		);
	}
	this.getQuoteData(amountToPay, id, dataId);
	this.quoteError = !amountToPay || amountToPay < 0 || amountToPay > amount;
}

function setPayments(total) {
	let newTotal = total;
	if (this.dataSelected.length > 0) {
		this.dataSelected.forEach((sale) => {
			const resultPerQuote = sale.caDocument.details.reduce((acumQ, quote) => {
				const newQuote = quote;
				if (quote.status === 3) {
					return acumQ;
				}
				const op = acumQ - (newQuote.amount - newQuote.amountPayment);
				if (op >= 0) {
					newQuote.amountToPay = this.roundInNumber(
						newQuote.amount - newQuote.amountPayment
					);
					return op;
				}
				newQuote.amountToPay = acumQ === 0 ? 0 : this.roundInNumber(acumQ);
				return 0;
			}, newTotal);
			newTotal = resultPerQuote;
		});
		this.totalQuotes();
	} else {
		this.totalAmount = 0;
	}
}

function totalDueAmount() {
	return this.dataSelected.reduce(
		(total, sale) => total + (sale.amount - sale.dueAmount),
		0
	);
}

function changeAmortization(rows) {
	this.amortization.number = rows.reduce((acumSale, sale) => {
		if (sale.caDocument.details) {
			const totalByQuote = sale.caDocument.details.reduce((acumQ, quote) => {
				const newQuote = quote;
				const dateSplite = newQuote.expirationDate.split('T');
				this.$set(newQuote, 'menu', false);
				this.$set(newQuote, 'amountToPay', 0);
				newQuote.expirationDate = dateSplite[0];
				return acumQ + (quote.amount - quote.amountPayment);
			}, 0);
			return totalByQuote + acumSale;
		}
		return 0;
	}, 0);
	this.amortization.number = this.roundInNumber(this.amortization.number);
	if (this.amortization.number > 0) {
		this.setPayments(this.amortization.number);
	} else {
		this.totalAmount = 0;
	}
}

function selectedAll(check) {
	this.checkAll = check;
	this.data = this.data.map((d) => {
		const newD = { ...d };
		newD.isSelected = check;
		return newD;
	});
	this.dataSelected = [...this.data.filter((d) => d.isSelected)];
	this.changeAmortization(this.dataSelected);
}

function selectedRow(row) {
	const { id, isSelected, disabled } = row;
	if (disabled) {
		this.data = this.data.map((r) => {
			const newRow = { ...r };
			if (r.id === id) {
				this.$set(newRow, 'isSelected', false);
			}
			return newRow;
		});
	} else if (isSelected) {
		this.dataSelected.push(row);
		this.data = this.data.map((r) => {
			const newRow = { ...r };
			newRow.disabled = Number(r.customerId !== row.customerId);
			return newRow;
		});
	} else {
		const index = this.dataSelected.findIndex((ds) => ds.id === id);
		this.dataSelected.splice(index, 1);
		if (!this.dataSelected.length) {
			this.data = this.data.map((r) => {
				const newRow = { ...r };
				newRow.disabled = 0;
				return newRow;
			});
		}
	}
	this.checkAll = this.data.every((d) => d.isSelected);
	this.changeAmortization(this.dataSelected);
}

function totalToPay() {
	return this.roundInNumber(
		this.dataSelected.reduce(
			(accum, ds) => accum + this.roundInNumber(ds.amount),
			0
		)
	);
}

function totalQuotes() {
	this.totalAmount = this.dataSelected.reduce(
		(accum, ds) =>
			accum +
			ds.caDocument.details.reduce(
				(accumD, detail) => accumD + this.roundInNumber(detail.amountToPay),
				0
			),
		0
	);
}

function getData({ model, value }) {
	this.amortization[model] = model !== 'total' ? value.id : value;
	if (model === 'typePaymentId') {
		this.typePaymentCode = value.code;
		this.transaction.flagForm = value.flagForm;
		this.transaction.bankAccountId = null;
	}
	if (model === 'number') {
		this.setPayments(value);
	}
}

function validTotal() {
	const valid = Number(this.totalAmount) > Number(this.amortization.number);
	if (valid) {
		this.showNotification(
			'La suma de las cuotas a pagar no debe ser mayor al total.',
			'error'
		);
	}
	return valid;
}

function sidebarStatus(val) {
	if (val) {
		this.dataSelected = this.dataSelected.map((ds) => {
			const newDs = { ...ds };
			newDs.caDocument.details = ds.caDocument.details.map((detail) => {
				const newDetail = { ...detail };
				const toPay =
					this.roundInNumber(detail.amount) -
					this.roundInNumber(detail.amountPayment);
				newDetail.amountToPay = this.roundInNumber(toPay);
				return newDetail;
			});
			return newDs;
		});
		this.totalQuotes();
	}
}

function getQuoteData(value, id, dataId) {
	this.dataSelected = this.dataSelected.map((ds) => {
		const newDs = { ...ds };
		if (ds.id === dataId && ds.caDocument.details.length > 0) {
			newDs.caDocument.details = ds.caDocument.details.map((detail) => {
				const newDetail = { ...detail };
				if (detail.id === id) {
					newDetail.amountToPay = value;
				}
				return newDetail;
			});
			return newDs;
		}
		return newDs;
	});
	this.totalQuotes();
}

async function loadData() {
	const requests = [
		this.$httpSales.get('bank-account'),
		this.getTypePayments('sales'),
		this.$httpSales.get(`cash/${this.$userInfo.cashId}`),
		this.getCurrencies(),
		this.$httpSales.get('payment-states'),
		this.$httpSales.get('type-documents-all', { params: { flagType: 1 } }),
		this.globalEmployees(),
		this.$httpSalesRead.get('group', { typeEntityId: 2 }),
	];
	const [
		accounts,
		{ data: typePayments },
		{ data: cash },
		{ data: currencies },
		{ data: paymentStates },
		{ data: typeDocuments },
		{ data: employees },
		{ data: groups },
	] = await Promise.all(requests);
	this.cashUser = { ...cash };
	accounts.data = [{ id: null, accountNumber: 'NINGUNA' }].concat(
		accounts.data
	);
	this.groups = groups;
	this.typePayments = typePayments.map((tp) => tp.paymentType);
	this.accounts = accounts.data;
	this.amortization.typePaymentId = this.typePayments[0].id;
	this.typePaymentCode = this.typePayments[0].code;
	this.amortization.accountBankId = this.accounts[0].id;
	this.transaction.bankAccountId = this.amortization.accountBankId;
	this.transaction.flagForm = this.typePayments[0].flagForm;
	this.currencies = currencies;
	this.paymentStates = paymentStates;
	this.typeDocuments = typeDocuments;
	this.employees = employees;
	const query = this.$route.query;
	if (query.customerId) {
		this.customer.id = query.customerId;
		this.customer.typePerson.fullName = query.fullName;
		this.fromCustomer = true;
		this.search = query.fullName;
	} else if (this.customer.name) {
		this.search = this.customer.name;
		this.fromCustomer = true;
	}
}

function setCurrencyData(valCurrency) {
	this.currentPage = 1;
	this.currencyId = valCurrency.id;
	this.typeCurrency = valCurrency.id;
	this.typeSymbol = valCurrency.symbol;
	this.loadSales();
}

function setData({ model, value }) {
	this.currentPage = 1;
	this.params[model] = value;
	if (this.params.startDate && !this.params.endDate) {
		this.showNotification(
			'Es necesario elegir la fecha final para realizar el filtro por fechas.',
			'warning'
		);
	} else if (this.params.startDate && this.params.endDate) {
		const validDate =
			differenceInDays(this.params.endDate, this.params.startDate) < 0;
		if (validDate) {
			this.showNotification(
				'La fecha final no puede ser menor a la inicial.',
				'warning'
			);
		} else {
			this.loadSales();
		}
	} else {
		this.loadSales();
	}
}

function disabledCollect() {
	return (
		this.isLoading ||
		this.quoteError ||
		this.validTotal ||
		!this.totalAmount ||
		(this.isDifferentCash &&
			(this.transaction.flagForm === 3 || this.transaction.flagForm === 4) &&
			!this.transaction.bankAccountId)
	);
}

function onSearch(searchValue) {
	const searchTrim = searchValue ? searchValue.trim() : null;
	this.params.search = searchTrim;
	this.loadSales();
}

function setDataEmployee(value, model) {
	if (value) {
		if (model === 'employeeIds') {
			this.currentPage = 1;
			this[model] = value;
			this.loadSales();
		}
	}
}

function downloadDispatch(code) {
	if (
		code === 'cxc-report-pdf' ||
		code === 'list-document-account-status-pdf' ||
		code === 'cxc-details-pdf' ||
		code === 'cxc-grouped-report-pdf'
	) {
		this.downloadAmortizationsList(code);
	} else if (code === 'list-status-account-customers-details') {
		this.downloadAmortizationsDetail(code);
	}
}

function emitExcel(type) {
	const code = type === 'cxc' ? LIST_SALES : LIST_SALES_DUES_RECEIVABLE;
	const originName =
		type === 'cxc'
			? 'Reporte de cuentas por cobrar'
			: 'Reporte de cuentas por cobrar por cuotas';
	const params = this.buildBody();
	this.onEmitExcel(code, originName, params);
}

function data() {
	return {
		amortizationSelected: {},
		actionCode: null,
		show: false,
		accounts: [],
		amortization: {
			number: 0,
			amount: 0,
			typePaymentId: 0,
		},
		cashUser: {},
		columns: [
			{
				id: 1,
				name: 'Cliente',
				value: 'customer',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: '# Doc',
				value: 'documentNumber',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Fecha creación',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Tipo de documento',
				value: 'typeDocument.name',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Empleado',
				value: 'employee.name',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Est. Despacho',
				value: 'state.name',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Est. Pago',
				value: 'state.name',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Tipo de Pago',
				value: 'payment.name',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Saldo Abonado',
				value: 'dueAmount',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Deuda',
				value: 'debt',
				visible: true,
				checked: true,
			},
			{
				id: 11,
				name: 'Total',
				value: 'amount',
				visible: true,
				checked: true,
			},
			{
				id: 12,
				name: 'Acciones',
				value: 'actions',
				visible: true,
				checked: true,
			},
		],
		checkAll: false,
		currency: '',
		currencySymbol: '',
		currentPage: 1,
		customer: {
			id: 0,
			typePerson: {
				documentNumber: '',
				fullName: '',
			},
		},
		customers: [],
		data: [],
		dataSelected: [],
		fromCustomer: false,
		employees: [],
		employeeIds: [],
		isLoading: false,
		itemsTotalQuantity: 0,
		keyValue: 'amortizations-table',
		lastPage: 0,
		quoteError: false,
		sales: [],
		search: '',
		sidebarStatus: false,
		totalAmount: 0,
		transaction: {
			bankAccountId: null,
			additionalInformation: {
				dateReference: null,
			},
			documentNumber: '',
			flagForm: null,
			reference: '',
			urlImage: '',
		},
		typePaymentCode: '',
		typePayments: [],
		currencyId: null,
		typeCurrency: null,
		typeSymbol: null,
		currencies: [],
		params: {
			endDate: null,
			limit: 20,
			search: null,
			page: 1,
			paymentState: null,
			salTypeDocumentId: null,
			startDate: null,
			groupIds: [],
		},
		groups: [],
		paymentStates: [],
		typeDocuments: [],
		isMenuOpen: false,
		options: [
			{ id: 1, code: 'cxc', name: 'Reporte Cuentas por cobrar' },
			{
				id: 2,
				code: 'cxc_cuotas',
				name: 'Reporte Cuentas por cobrar por cuotas',
			},
		],
		optionsAmortizations: [
			{ id: 1, code: 'cxc-report-pdf', name: 'Reporte de cuentas por cobrar' },
			{
				id: 2,
				code: 'list-status-account-customers-details',
				name: 'Reporte cuentas por cobrar de cliente detallado',
			},
			{
				id: 3,
				code: 'cxc-details-pdf',
				name: 'Reporte CxC con Detalle de Productos',
			},
			{
				id: 4,
				code: 'cxc-grouped-report-pdf',
				name: 'Reporte de cuentas agrupado por cliente',
			},
		],
		validateCustomer: null,
	};
}

export default {
	name: 'amortizations-list',
	components: {
		actionSidebar,
		amortizationsComponent,
		appActions,
		appTable,
		dateComponent,
		detailAmortizations,
		documentState,
		generalFilter,
		headerPage,
		modalSidebarButton,
		purchasesPaymentForm,
		quickActions,
	},
	computed: {
		disabledCollect,
		isDifferentCash,
		totalDueAmount,
		totalToPay,
		validTotal,
	},
	created,
	data,
	methods: {
		buildBody,
		getFullName,
		openModalAmortization,
		changeAmortization,
		cleanFilter,
		closeModal,
		closeSlider,
		downloadAmortizationsList,
		downloadAmortizationsDetail,
		getData,
		getQuoteData,
		getTransactionData,
		iconColor,
		loadData,
		loadSales,
		runAction,
		save,
		searchCustomers: helper.debounce(searchCustomers),
		selectedAll,
		selectedRow,
		setCurrencyData,
		setData,
		setDataEmployee,
		setPayments,
		showErrorMessage,
		onSearch,
		totalQuotes,
		emitExcel,
		downloadDispatch,
		preGoTo(document) {
			const routeData = this.$router.resolve({
				name: 'convert',
				params: { id: document.id },
			});
			window.open(routeData.href, '_blank');
		},
	},
	watch: {
		search,
		sidebarStatus,
	},
};
</script>

<style lang="scss" scoped>
.amortization-header {
	background-color: map-get($colors, primary);
	color: white;
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, medium16);
	font-weight: bold;
	padding: 6px 18px;
}
</style>
