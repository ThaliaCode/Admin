<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			label="La carga terminará en un momento y podrás ver
			toda la información de movimiento de bancos"
		/>
		<header-page
			:limit-title="40"
			:title="title"
			:show-excel="false"
			to-show
			columnClass="xs10"
			@clean-product-filter="cleanFilter"
			:track-filters="params"
		>
			<div class="mr-2 bold-text primary--text">
				<span class="mr-2 bold-text">
					<app-tooltip-button
						:height="16"
						icon="info"
						color="success"
						text="Total dinamico, se actualiza segun los filtros"
					></app-tooltip-button>
					Total: {{ totalBankAmount | round }}
				</span>

				<span class="success--text"> | </span>
				<span class="bold-text">
					<app-tooltip-button
						:height="16"
						icon="info"
						color="success"
						text="Total historico, no aplica el filtro de fechas"
					></app-tooltip-button>
					Total historico:
					<span v-if="showTotalBankAmotHistoric">
						{{ totalBankAmountHistoric }}
					</span>
					<app-tooltip-button
						v-else
						class="mr-1"
						color="primary"
						icon="visibility"
						text="Consultar el total historico"
						height="30"
						@click-icon="getHistoricalTotalBank"
					/>
				</span>
			</div>
			<v-menu
				content-class="excel-menu-content"
				offset-y
				:nudge-bottom="5"
				:nudge-left="120"
			>
				<v-btn
					slot="activator"
					class="btn-download-excel btn-auto py-1 px-1 mr-3"
					:disabled="false"
				>
					<img src="/static/img/excel.svg" height="17" class="align-img" />
				</v-btn>
				<v-list>
					<v-list-tile
						v-for="option in options"
						:key="option.id"
						@click="generateExcel(option)"
					>
						<v-list-tile-title>
							{{ option.name }}
						</v-list-tile-title>
					</v-list-tile>
				</v-list>
			</v-menu>
		</header-page>
		<app-actions
			v-if="$route.name === 'bank-movements'"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter class="layout wrap px-4 mb-4 mt-4">
			<v-flex xs2 pr-2>
				<app-select
					:item="subsidiaryId"
					item-text="rucNamefull"
					item-value="id"
					:items="subsidiaries"
					:label="labelSucursal()"
					model="subsidiaryId"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs2 pr-2 v-if="!flagOutbox">
				<app-select
					chips
					:items="cashs"
					item-text="name"
					item-value="id"
					label="Cajas"
					multiple
					:item="cash"
					@input="getCash"
				/>
			</v-flex>
			<v-flex xs2 pr-2 v-if="!flagOutbox">
				<app-select
					:item="flagReconcilement"
					item-text="name"
					item-value="id"
					:items="reconcilement"
					label="Estado de Conciliación"
					model="flagReconcilement"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs2 pr-2>
				<app-select
					autocomplete
					:item="bankAccount"
					item-text="name"
					item-value="id"
					:items="bankAccounts"
					label="Cuenta Bancaria"
					return-object
					@input="setBankAccountId"
				></app-select>
			</v-flex>
			<v-flex xs2 pr-2 v-if="!flagOutbox">
				<app-select
					:item="typeTransactionBankId"
					:items="transactions"
					item-text="name"
					item-value="id"
					label="Tipo de Transacción"
					model="typeTransactionBankId"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs2 pr-2>
				<app-select
					item-text="name"
					label="Tipo de Movimiento"
					item-value="id"
					model="typeMovement"
					:item="typeMovement"
					:items="typesMovements"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs2 pr-2 v-if="showStateEntity && !flagOutbox">
				<app-select
					item-text="name"
					item-value="id"
					label="Estado de Entidad"
					:items="statesEntity"
					model="entityStateId"
					:item="entityStateId"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs2 pr-2>
				<app-select
					return-object
					item-text="name"
					item-value="id"
					label="Tipo de Pago"
					:items="typePayments"
					model="typePayment"
					:item="typePayment"
					chips
					multiple
					@input="getDataTypePayment"
				/>
			</v-flex>
			<v-flex xs2 pr-2>
				<app-date-select
					:date-formatted="startDate"
					label="Fecha Inicio"
					model="startDate"
					@input="getDate"
				/>
			</v-flex>
			<v-flex xs2 pr-2>
				<app-date-select
					:readonly="!startDate"
					:date-formatted="endDate"
					:min-date="startDate"
					label="Fecha Fin"
					model="endDate"
					@input="getDate"
				/>
			</v-flex>
		</general-filter>
		<div class="container-table">
			<div v-if="!subsidiaryId || showOpacityTable" class="opacity-table">
				<p class="text-opacity">{{ messageTable }}</p>
			</div>
			<bank-movements-list
				:clean-search="cleanSearch"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="movements"
				:modules="modules"
				:type-payments="typePayments"
				:type-movement="typesMovements"
				:transactions="transactions"
				:show-entity="showStateEntity"
				:total-quantity="totalQuantity"
				@show-accounting="showDetailAccouting"
				@on-page="onPage"
				@on-search="onSearch"
				@show-voucher="showVoucher"
				@update="loadData"
				@delete="deleteBank"
				@update-rows="updateRows"
				@column-sortable="columnSortable"
			/>
		</div>
		<v-dialog v-model="dialogDetail" persistent max-width="660">
			<accounting-seat-detail
				v-if="dialogDetail"
				:detail="accoutingSeat"
				@close="closeDetail"
			/>
		</v-dialog>
		<v-dialog v-model="dialog" persistent max-width="360">
			<v-card>
				<v-card-title class="headline">Eliminar Movimiento</v-card-title>
				<v-divider></v-divider>
				<v-card-text> ¿Desea eliminar la cuenta movimiento? </v-card-text>
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
								@click.native="confirmationDelete"
							>
								Eliminar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<router-view @reload-data="loadData"></router-view>
	</div>
</template>

<script>
import accountingSeatDetail from '@/components/sales/accounting-seat-detail';
import appActions from '@/components/shared/app-actions';
import { differenceInDays, format } from 'date-fns';
import bankMovementsList from '@/components/movements/bank-movements-list';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';

function setData(value, model) {
	if (value) {
		if (model === 'typePaymentParams' || model === 'warehouseIds') {
			this[model] = value;
		} else {
			this.params[model] =
				model === 'status' || model === 'typeDocumentCode' ? value.code : value.id;
		}
	}
}

function created() {
	const { subsidiary: subsidiaryUser } = this.$userInfo;
	const { configIntegrations } = subsidiaryUser;
	const today = new Date();
	this.endDate = today.toISOString().split('T')[0];

	const oneWeekAgo = new Date();
	oneWeekAgo.setDate(today.getDate() - 7);
	this.startDate = oneWeekAgo.toISOString().split('T')[0];
	this.showStateEntity =
		configIntegrations &&
		((configIntegrations.accountingPlan &&
			configIntegrations.accountingPlan.flagConfig) ||
			(configIntegrations.accountingConfiguration &&
				configIntegrations.accountingConfiguration.flagConfig));
	this.columns[11].visible = !!this.showStateEntity && !this.flagOutbox;
	this.columns[11].flagVisible = !(!!this.showStateEntity && !this.flagOutbox);
	if (this.flagOutbox) {
		this.columns[3].visible = false;
		this.columns[3].flagVisible = true;
		this.columns[13].visible = false;
		this.columns[13].flagVisible = true;
	}
	if (this.id) {
		this.flagReconcilement = 2;
		this.endDate = this.date;
		this.startDate = this.date;
	}
	this.movements = [...this.movementsTemplate];
	this.loadResources();
}

function cleanFilter() {
	this.currentPage = 1;
	const today = new Date();
	this.endDate = today.toISOString().split('T')[0];

	const oneWeekAgo = new Date();
	oneWeekAgo.setDate(today.getDate() - 7);
	this.startDate = oneWeekAgo.toISOString().split('T')[0];
	this.table.params.page = 1;
	this.table.params.search = null;
	this.table.params.customerId = null;
	this.table.params.typeTransactionBankId = null;
	this.table.params.subsidiaryId = null;
	this.table.params.entityStateId = null;
	this.table.params.typePaymentIds = [];
	this.filterBank.sortField = 'created_at';
	this.filterBank.sortDirection = 'desc';
	this.cleanSearch = true;
	this.customerId = null;
	this.typeMovement = null;
	this.typeTransactionBankId = null;
	this.totalBankAmount = 0;
	this.totalBankAmountHistoric = 0;
	this.showTotalBankAmotHistoric = false;
	this.subsidiaries = this.subsidiaries.map((o) => {
		const newRow = { ...o };
		newRow.rucNamefull = `Ruc: ${o.ruc} - ${o.sucursalName}`;
		return newRow;
	});
	if (this.subsidiaries.length === 1) {
		this.subsidiaryId = this.subsidiaries[0].id;
		this.loadBankAccount();
	} else {
		this.subsidiaryId = null;
	}
	this.cashIds = [];
	this.cash = [];
	this.typePayment = [];
	this.typePaymentIds = [];
	this.entityStateId = null;
	this.table.params.bankAccount = null;
	this.cleanSearch = true;
	this.bankAccount = null;
	this.messageTable = `Es necesario seleccionar una ${this.labelSucursal().toLowerCase()} para visualizar la información.`;
	this.movements = [...this.movementsTemplate];
}

function currencySelected(code) {
	return this.currencies.find((c) => c.code === code);
}

function customData(rows) {
	return rows.map((row) => {
		const newRow = { ...row };
		const rowCurrency = this.currencySelected(row.currency);
		newRow.iconArrow = 'arrow_forward';
		newRow.bankAccount = row.bankAccount || {};
		newRow.currencySymbol = row.currency ? rowCurrency.symbol : '';
		newRow.moduleOrigin = row.moduleOrigin || {};
		return newRow;
	});
}

function getData({ model, value }) {
	this[model] = value.id;
	if (model === 'typeMovement' && value?.code === 'all') {
		this.typeMovement = null;
	}
	if (this.subsidiaryId) {
		// this.loadData();
		this.loadCash(this.subsidiaryId);
	}
}

async function loadCash(id) {
	const params = {
		subsidiaryId: id || this.subsidiaryId,
	};
	try {
		if (!this.cash) {
			const { data: response } = await this.$httpSales.get('cash', { params });
			this.cashs = response;
			if (this.cashs.length === 1) {
				this.cash = [this.cashs[0]];
				this.cashIds = this.cash.map((cas) => cas.id);
			} else {
				this.cash = [];
				this.cashIds = [];
			}
		}
		this.loadBankAccount();
	} catch (error) {
		this.showGenericError();
	}
}

function getDate({ model, value }) {
	this[model] = format(value, 'YYYY-MM-DD');
	if (this.endDate) {
		const validDate = differenceInDays(this.endDate, this.startDate) < 0;
		if (validDate) {
			this.showNotification('La fecha final no puede ser menor a la inicial.', 'info');
		} else if (this.subsidiaryId) {
			this.loadData();
		}
	}
}

async function loadResources() {
	const params = {
		moduleCode: 'BANCO',
		flagType: 1,
	};
	const requests = [
		this.getCurrencies(),
		this.$httpSales.get('module'),
		this.$httpSales.get('type-payments', { params }),
		this.$httpSales.get('type-movement'),
		this.$httpSales.get('type-transaction-bank'),
		this.subsidiariesList(),
	];
	[
		{ data: this.currencies },
		{ data: this.modules },
		{ data: this.typePayments },
		{ data: this.typesMovements },
		{ data: this.transactions },
		{ data: this.subsidiaries },
	] = await Promise.all(requests);
	this.typesMovements = [
		{
			code: 'all',
			id: 0,
			name: 'Todos',
		},
		...this.typesMovements,
	];
	this.typePayments = this.typePayments.map((tp) => tp.paymentType);
	this.subsidiaries = this.subsidiaries.map((o) => {
		const newRow = { ...o };
		newRow.rucNamefull = `Ruc: ${o.ruc} - ${o.rzSocial}`;
		return newRow;
	});
	if (this.subsidiaries.length === 1) {
		this.subsidiaryId = this.subsidiaries[0].id;
		this.loadCash();
	}
}

async function loadBankAccount() {
	// this.bankAccount = null;
	const params = {
		typeTransactionBankId: this.typeTransactionBankId,
		subsidiaryId: this.subsidiaryId,
	};
	({ data: this.bankAccounts } = await this.$httpSales.get('bank-account', {
		params,
	}));
	this.loadData();
}

async function loadData(page = 1) {
	this.totalBankAmountHistoric = 0;
	this.showTotalBankAmotHistoric = false;
	if (this.subsidiaryId) {
		this.loadingGeneral = true;
		const bodyList = {
			bankAccountIds: this.bankAccount ? [this.bankAccount] : undefined,
			typePaymentIds: this.typePaymentIds.length > 0 ? this.typePaymentIds : undefined,
			cashIds: this.cashIds.length > 0 ? this.cashIds : undefined,
		};
		const body = this.id
			? { bankReconcilementIds: [this.id], typeTransactionBankIds: [this.id] }
			: bodyList;
		this.currentPage = page;
		this.table.params.page = this.currentPage;
		this.table.params.endDate = this.endDate;
		this.table.params.flagReconcilement =
			this.flagReconcilement > 0 ? this.flagReconcilement : null;
		this.table.params.typeTransactionBank = this.typeTransactionBankId;
		this.table.params.customerId = this.customerId;
		this.table.params.startDate = this.startDate;
		this.table.params.customerId = this.customerId;
		this.table.params.bankAccount = this.bankAccount;
		this.table.params.subsidiaryId = this.subsidiaryId;
		this.table.params.sortField = this.filterBank.sortField;
		this.table.params.sortDirection = this.filterBank.sortDirection;
		this.table.params.entityStateId = this.entityStateId;
		this.table.params.typeMovement = this.typeMovement;
		const params = {
			...this.table.params,
			relationAdd: !this.flagOutbox
				? 'typeTransactionBank,employee,bankAccount,moduleOrigin,bank,typePayment,bankReconcilement,customer,annexTransaction'
				: undefined,
		};
		const totalParams = { ...params };
		if (this.id) {
			totalParams.bankReconcilementIds = [this.id];
			totalParams.typeTransactionBankIds = [this.id];
		}
		const paramsTotal = { ...params };
		paramsTotal.typeTransactionBankId = paramsTotal.typeTransactionBank;
		paramsTotal.typePaymentIds = this.typePayment
			? this.typePayment.map((p) => p.id).join(',')
			: undefined;
		paramsTotal.cashIds = this.cash ? this.cash.map((p) => p.id).join(',') : undefined;
		delete paramsTotal.typeTransactionBank;
		if (this.flagOutbox) {
			const ignored = [
				'moduleOriginIds',
				'typeTransactionBankIds',
				'bankReconcilementIds',
				'reconciliationId',
				'flagReconcilement',
				'entityStateId',
				'terminalId',
				'cashIds',
			];
			Object.keys(paramsTotal).forEach((key) => {
				if (ignored.includes(key)) delete paramsTotal[key];
			});
		}
		const request = [
			this.$httpSales.post('transaction-bank-list', body, { params }),
			this.$httpSales.get('transaction-bank-total', {
				params: { ...paramsTotal },
			}),
		];
		try {
			const [movements, amounts] = await Promise.all(request);
			this.movements = [...this.customData(movements.data)];
			this.lastPage = Number(movements.headers['x-last-page']);
			this.totalQuantity = Number(movements.headers['x-quantity']);
			this.totalBankAmount = amounts.data.totalBank || 0;
			this.movements = this.movements.map((m) => {
				const newM = { ...m };
				newM.cashName = m.cashName || m.salCashDeskClosing?.cash?.name;
				return newM;
			});
			this.cleanSearch = false;
			if (this.movements.length === 0) {
				this.movements = [...this.movementsTemplate];
				this.messageTable =
					'No se han encontrado registros que cumplan con los datos seleccionados en los filtros.';
				this.showOpacityTable = true;
			} else {
				this.messageTable = '';
				this.showOpacityTable = false;
			}
		} catch (err) {
			this.loadingGeneral = false;
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.loadingGeneral = false;
		}
	}
}

function onPage(page) {
	if (this.subsidiaryId) {
		this.loadData(page);
	}
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : null;
	this.cleanSearch = !search;
	this.table.params.search = searchTrim;
	if (this.subsidiaryId) {
		this.loadData();
	}
}

function runAction({ codeWeb }) {
	if (codeWeb === 'bank-movements-new') {
		this.goTo(codeWeb, { params: { bankAccountId: this.bankAccount } });
	}
	this.goTo(codeWeb);
}

function showVoucher({ urlImage, voucher }) {
	const img = urlImage || voucher.urlLink;
	if (img) {
		window.open(img);
	} else {
		this.showNotification('No se encontró ningún archivo.', 'info');
	}
}

function title() {
	return this.id && this.date
		? `${this.$route.meta.title} - Conciliación ${this.date}`
		: this.$route.meta.title;
}

async function loadCustomers(customerId) {
	({ data: this.customer } = await this.$httpSales.get(`customers/${customerId}`));
	this.customers = [{ ...this.customer }];
	if (this.subsidiaryId) {
		this.loadData();
	}
}

function deleteBank({ id, bankReconcilementId }) {
	if (!bankReconcilementId) {
		this.dialog = true;
		this.idDelete = id;
	} else {
		this.showGenericError(
			'El movimiento no puede ser eliminado porque se encuentra conciliado.'
		);
	}
}

function cancelDelete() {
	this.dialog = false;
}

async function confirmationDelete() {
	try {
		await this.$httpSales.delete(`transaction-bank/${this.idDelete}`);
		this.showNotification('Se eliminó correctamente');
		this.dialog = false;
		if (this.subsidiaryId) {
			this.loadData();
		}
		this.idDelete = null;
	} catch (error) {
		console.error('error => ', error);
		if (error.status === 400) {
			if (error.data.message === 'TRANSACTION_BANK_DELETE_INVALID_CAJA') {
				this.showGenericError(error.data.messageError);
			}
			if (error.response.message === 'TRANSACTION_RECONCILEMENT_DELETE_INVALID') {
				this.showGenericError(
					'El movimiento no puede ser eliminado porque se encuentra conciliado.'
				);
			}
		} else if (error.status === 500) {
			this.showGenericError();
		}
	}
}

function setBankAccountId({ value }) {
	if (value) {
		if (value.id) {
			const { id } = value;
			this.bankAccount = id;
			if (this.subsidiaryId) {
				this.loadData();
			}
		}
	}
}

function getDataTypePayment({ model, value }) {
	if (value) {
		this[model] = value;
		this.typePaymentIds = value.map((tp) => tp.id);
		if (this.subsidiaryId) {
			this.loadData();
		}
	}
}

function updateRows({ id, show }) {
	this.movements = this.movements.map((move) => {
		const newMove = { ...move };
		newMove.iconArrow = move.id === id && show ? 'arrow_back' : 'arrow_forward';
		return newMove;
	});
}

function generateExcel(obj) {
	if (this.table.params.subsidiaryId) {
		const { code, name, includeTypeMovement } = obj;
		const params = {
			subsidiaryId: this.table.params.subsidiaryId || undefined,
			bankAccount: this.table.params.bankAccount || undefined,
			currency: this.table.params.currency || undefined,
			customerId: this.table.params.customerId || undefined,
			endDate: this.table.params.endDate || undefined,
			flagReconcilement: this.table.params.flagReconcilement || undefined,
			search: this.table.params.search || undefined,
			startDate: this.table.params.startDate || undefined,
			typeTransactionBank: this.table.params.typeTransactionBank || undefined,
			cashIds: this.cashIds.length ? this.cashIds : undefined,
			typePaymentIds: this.typePaymentIds.length ? this.typePaymentIds : undefined,
		};
		if (includeTypeMovement) {
			params.typeMovement = this.typeMovement || undefined;
		}
		this.onEmitExcel(code, name, params);
	} else {
		this.showNotification(
			`Es necesario seleccionar una ${this.labelSucursal().toLowerCase()}`,
			'info'
		);
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
	this.filterBank.sortField = newColumn.isSortable.value;
	this.filterBank.sortDirection = newColumn.isSortable.up ? 'asc' : 'desc';
	this.loadData();
}

function showDetailAccouting(row) {
	this.dialogDetail = true;
	this.accoutingSeat = { ...row.accountingSeat };
}

function closeDetail() {
	this.dialogDetail = false;
}

function getCash({ value }) {
	this.cash = value;
	this.cashIds = value.map((c) => c.id);
	if (value.length === 1 && !value[0].flagActive) {
		this.showNotificationNew(
			'info',
			'#ffffff',
			'ERROR AL GENERAR MOVIMIENTOS',
			'La caja seleccionada está desactivada por lo que no se podrán generar movimientos.'
		);
	}
	if (this.subsidiaryId) {
		this.loadData();
	}
}

function data() {
	return {
		accoutingSeat: {},
		dialogDetail: false,
		entityStateId: null,
		transactions: [],
		customerId: null,
		isClean: false,
		customers: [],
		properties: ['id'],
		typeTransactionBankId: null,
		bankAccount: null,
		bankAccounts: [],
		cash: null,
		cashIds: [],
		cashs: [],
		cleanSearch: false,
		columns: [
			{ id: 1, name: '# Cuenta', checked: true, visible: true },
			{
				id: 2,
				name: 'Fecha de Creación',
				checked: true,
				visible: true,
				isSortable: { down: true, value: 'created_at', up: false },
			},
			{
				id: 3,
				name: 'Fecha de pago',
				checked: true,
				visible: true,
				isSortable: { down: true, value: 'payment_date', up: false },
			},
			{ id: 4, name: 'Origen', checked: true, visible: true },
			{ id: 5, name: 'Tipo de Pago', checked: true, visible: true },
			{ id: 6, name: 'Cajas', checked: true, visible: true },
			{ id: 7, name: 'T. Transacción', checked: true, visible: true },
			{
				id: 8,
				name: 'Anexo de caja',
				value: 'annexTransaction.name',
				visible: this.$userInfo.company.settings.flagAnnexTransactions,
				checked: this.$userInfo.company.settings.flagAnnexTransactions,
				flagVisible: !this.$userInfo.company.settings.flagAnnexTransactions,
			},
			{ id: 9, name: 'Nro de Operación', checked: true, visible: true },
			{ id: 10, name: 'Importe', checked: true, visible: true },
			{ id: 11, name: 'Concepto', checked: true, visible: true },
			{ id: 12, name: 'E. Entidad', checked: false, visible: false, flagVisible: false },
			{ id: 13, name: 'Beneficiario', checked: true, visible: true },
			{ id: 14, name: 'Est.', checked: true, visible: true },
			{
				id: 15,
				name: 'Acciones',
				checked: true,
				visible: true,
				flagVisible: true,
			},
		],
		currencies: [],
		currentPage: 1,
		endDate: null,
		filterBank: {
			sortField: 'created_at',
			sortDirection: 'desc',
		},
		flagReconcilement: 0,
		lastPage: 1,
		loadingGeneral: false,
		movements: [],
		showTotalBankAmotHistoric: false,
		movementsTemplate: [
			{
				additionalInformation: {
					beneficiary: null,
				},
				amount: null,
				bankAccount: {
					accountNumber: null,
				},
				concept: null,
				currencySymbol: null,
				documentNumber: null,
				id: 1,
				moduleOrigin: {
					name: null,
				},
				paymentDate: null,
				typeTransactionBank: {
					code: null,
					name: null,
				},
			},
			{
				additionalInformation: {
					beneficiary: null,
				},
				amount: null,
				bankAccount: {
					accountNumber: null,
				},
				concept: null,
				currencySymbol: null,
				documentNumber: null,
				id: 2,
				moduleOrigin: {
					name: null,
				},
				paymentDate: null,
				typeTransactionBank: {
					code: null,
					name: null,
				},
			},
			{
				additionalInformation: {
					beneficiary: null,
				},
				amount: null,
				bankAccount: {
					accountNumber: null,
				},
				concept: null,
				currencySymbol: null,
				documentNumber: null,
				id: 3,
				moduleOrigin: {
					name: null,
				},
				paymentDate: null,
				typeTransactionBank: {
					code: null,
					name: null,
				},
			},
			{
				additionalInformation: {
					beneficiary: null,
				},
				amount: null,
				bankAccount: {
					accountNumber: null,
				},
				concept: null,
				currencySymbol: null,
				documentNumber: null,
				id: 4,
				moduleOrigin: {
					name: null,
				},
				paymentDate: null,
				typeTransactionBank: {
					code: null,
					name: null,
				},
			},
			{
				additionalInformation: {
					beneficiary: null,
				},
				amount: null,
				bankAccount: {
					accountNumber: null,
				},
				concept: null,
				currencySymbol: null,
				documentNumber: null,
				id: 5,
				moduleOrigin: {
					name: null,
				},
				paymentDate: null,
				typeTransactionBank: {
					code: null,
					name: null,
				},
			},
			{
				additionalInformation: {
					beneficiary: null,
				},
				amount: null,
				bankAccount: {
					accountNumber: null,
				},
				concept: null,
				currencySymbol: null,
				documentNumber: null,
				id: 6,
				moduleOrigin: {
					name: null,
				},
				paymentDate: null,
				typeTransactionBank: {
					code: null,
					name: null,
				},
			},
			{
				additionalInformation: {
					beneficiary: null,
				},
				amount: null,
				bankAccount: {
					accountNumber: null,
				},
				concept: null,
				currencySymbol: null,
				documentNumber: null,
				id: 7,
				moduleOrigin: {
					name: null,
				},
				paymentDate: null,
				typeTransactionBank: {
					code: null,
					name: null,
				},
			},
			{
				additionalInformation: {
					beneficiary: null,
				},
				amount: null,
				bankAccount: {
					accountNumber: null,
				},
				concept: null,
				currencySymbol: null,
				documentNumber: null,
				id: 8,
				moduleOrigin: {
					name: null,
				},
				paymentDate: null,
				typeTransactionBank: {
					code: null,
					name: null,
				},
			},
			{
				additionalInformation: {
					beneficiary: null,
				},
				amount: null,
				bankAccount: {
					accountNumber: null,
				},
				concept: null,
				currencySymbol: null,
				documentNumber: null,
				id: 9,
				moduleOrigin: {
					name: null,
				},
				paymentDate: null,
				typeTransactionBank: {
					code: null,
					name: null,
				},
			},
			{
				additionalInformation: {
					beneficiary: null,
				},
				amount: null,
				bankAccount: {
					accountNumber: null,
				},
				concept: null,
				currencySymbol: null,
				documentNumber: null,
				id: 10,
				moduleOrigin: {
					name: null,
				},
				paymentDate: null,
				typeTransactionBank: {
					code: null,
					name: null,
				},
			},
		],
		reconcilement: [
			{ id: 0, name: 'Todos' },
			{ id: 1, name: 'No Conciliados' },
			{ id: 2, name: 'Conciliados' },
		],
		showStateEntity: false,
		startDate: null,
		totalBankAmount: 0,
		totalBankAmountHistoric: 0,
		modules: [],
		typePayment: null,
		typePaymentIds: [],
		typePayments: [],
		typesMovements: [],
		typeMovement: null,
		dialog: false,
		idDelete: null,
		messageTable: `Es necesario seleccionar una ${this.labelSucursal().toLowerCase()} para visualizar la información.`,
		subsidiaryId: null,
		showOpacityTable: false,
		subsidiaries: [],
		totalQuantity: 0,
		options: [
			{
				id: 1,
				name: 'Reporte de Movimientos de Bancos',
				code: 'list-transaction-bank',
				includeTypeMovement: true,
			},
			{
				id: 2,
				name: 'Reporte de Movimientos de Bancos de Starsoft',
				code: 'list-transaction-bank-starsoft',
			},
		],
		table: {
			params: {},
		},
		params: {},
	};
}

export default {
	name: 'bank-movements',
	components: {
		accountingSeatDetail,
		appActions,
		autocompleteComponent,
		bankMovementsList,
		generalFilter,
		headerPage,
	},
	computed: {
		title,
	},
	created,
	data,
	methods: {
		setData,
		loadCustomers,
		cancelDelete,
		columnSortable,
		cleanFilter,
		closeDetail,
		confirmationDelete,
		currencySelected,
		customData,
		deleteBank,
		getCash,
		getData,
		getDataTypePayment,
		getDate,
		loadBankAccount,
		loadCash,
		loadData,
		loadResources,
		onPage,
		onSearch,
		runAction,
		setBankAccountId,
		showDetailAccouting,
		showVoucher,
		updateRows,
		generateExcel,
		async getHistoricalTotalBank() {
			this.loadingGeneral = true;
			const params = {
				flagReconcilement: this.flagReconcilement > 0 ? this.flagReconcilement : null,
				subsidiaryId: this.subsidiaryId,
				typeTransactionBankId: this.typeTransactionBankId,
				relationAdd: !this.flagOutbox
					? 'typeTransactionBank,employee,bankAccount,moduleOrigin,bank,typePayment,bankReconcilement,customer,annexTransaction'
					: undefined,
			};

			if (this.typePayment && this.typePayment.length > 0) {
				params.typePaymentIds = this.typePayment.map((p) => p.id).join(',');
			}

			if (this.cash && this.cash.length > 0) params.cashIds = this.cashIds.join(',');
			params.bankAccount = this.bankAccount || undefined;
			try {
				const { data: dataTotal } = await this.$httpSales.get('transaction-bank-total', {
					params,
				});
				this.totalBankAmountHistoric = dataTotal.totalBank || 0;
				this.showTotalBankAmotHistoric = !this.showTotalBankAmotHistoric;
			} catch (error) {
				this.loadingGeneral = false;
				this.showGenericError(
					'No se pudo obtener el total, por favor intentelo nuevamente o pruebe con otros filtros.'
				);
			} finally {
				this.loadingGeneral = false;
			}
		},
	},
	props: {
		date: [Date, String],
		id: [Number, String],
	},
	watch: {
		$route(newVal) {
			if (newVal) {
				if (newVal.name === 'bank-movements') {
					this.loadResources();
				}
			}
		},
	},
};
</script>
<style lang="scss" scoped>
.container-table {
	position: relative;
}

.opacity-table {
	background-color: rgba(255, 255, 255, 0.52);
	bottom: 0;
	left: 0;
	padding-top: 5%;
	position: absolute;
	right: 0;
	top: 61px;
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

.bold-text {
	font-weight: bold;
}
</style>
