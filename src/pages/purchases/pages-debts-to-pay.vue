<template>
	<div>
		<header-page
			:title="$route.meta.title"
			to-show
			@clean-product-filter="clear"
			:emit-excel="true"
			@emit-excel="emitExcel"
		/>
		<app-actions
			:resource-uri="$route.name"
			:value-disabled="actionsDisabled"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter class="layout wrap mt-2 align-end justify-space-between">
			<v-flex class="d-flex align-end" xs12>
				<v-flex xs4 mr-1>
					<app-select
						autocomplete
						return-object
						label="Proveedor"
						item-text="autocomplete"
						:items="suppliers"
						:item="supplier"
						@input="setSupplierId"
					>
					</app-select>
				</v-flex>
				<v-flex xs3 px-2>
					<autocomplete-component
						chips
						multiple
						:return-object="false"
						item-text="name"
						item-value="id"
						:items="warehouses"
						label-value="Tienda"
						:item="warehouseIds"
						@return-data="setWarehouseIds"
					></autocomplete-component>
				</v-flex>
				<v-flex xs2 px-2 v-if="isPeru">
					<app-select
						:item="params.currency"
						item-text="name"
						item-value="code"
						:items="currencies"
						label="Moneda"
						model="currency"
						@input="setCurrency"
					/>
				</v-flex>
				<v-flex xs3 pr-3>
					<app-select
						:item="params.purTypeDocumentId"
						item-text="documentType.name"
						item-value="comTypeDocumentId"
						:items="typeDocuments"
						label="Tipo de Documento"
						model="purTypeDocumentId"
						:return-object="false"
						@input="setData"
					></app-select>
				</v-flex>
				<v-flex xs2 pr-3>
					<app-select
						:item="params.daysDue"
						item-text="name"
						item-value="id"
						:items="dates"
						label="Fecha de Vencimiento"
						model="daysDue"
						:return-object="false"
						@input="setData"
					></app-select>
				</v-flex>
			</v-flex>
		</general-filter>
		<general-filter class="layout wrap mt-2 align-end justify-space-between">
			<v-flex class="d-flex align-end" xs12>
				<v-flex xs2 pr-3>
					<label class="caption">Fecha inicial</label>
					<date-component
						:date="params.startDate"
						icon="/static/img/calendar.svg"
						@on-input="setData({ model: 'startDate', value: $event })"
					></date-component>
				</v-flex>
				<v-flex xs2 pr-3>
					<label class="caption">Fecha final</label>
					<date-component
						:date="params.endDate"
						:disabled="!params.startDate"
						icon="/static/img/calendar.svg"
						@on-input="setData({ model: 'endDate', value: $event })"
					></date-component>
				</v-flex>
				<v-flex xs4 text-xs-right>
					<h3 class="body-2">
						TOTAL POR PAGAR: {{ currencySymbol }} {{ totalAmountToPay | round }}
					</h3>
				</v-flex>
			</v-flex>
		</general-filter>
		<v-layout wrap>
			<v-flex :class="toShow ? 'xs8 active' : 'xs12'">
				<debts-to-pay-list
					:isClean="isClean"
					:current-page="params.page"
					:last-page="lastPage"
					@row-is-selected="rowSelected"
					:columns="columns"
					:rows="rows"
					:total-quantity="itemsTotalQuantity"
					@on-page="changePage"
					@on-search="onSearch"
					@click-icon="openAction"
				/>
			</v-flex>
			<transition xs4 name="fade-left" model="out-in">
				<v-flex xs4 :class="{ active: toShow }" v-show="toShow">
					<debs-detail-payment
						:debs-id="orderSelected.id"
						:order-selected="orderSelected"
						@close-modal="closeDetail"
					/>
				</v-flex>
			</transition>
		</v-layout>
		<action-sidebar
			title="Cuotas por Pagar"
			:value="showSlide"
			:width="540"
			@close-modal="close"
		>
			<fees-to-pay-form
				v-if="showSlide"
				:currency="params.currency"
				:currency-symbol="currencySymbol"
				:supplier-id="supplierId"
				:purchase="currentSelected"
				@close="close"
				@save="save"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import appSelect from '@/components/shared/app-select';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import debtsToPayList from '@/components/purchases/debts-to-pay-list';
import feesToPayForm from '@/components/purchases/fees-to-pay-form';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import dateComponent from '@/components/shared/date-component';
import lib from '@/shared/lib';
import debsDetailPayment from '@/components/purchases/debs-detail-payment';
import { format } from 'date-fns';

function created() {
	this.loadResources();
}

function openAction(row) {
	this.orderSelected = this.orderSelected.id === row.id ? {} : { ...row };
	this.toShow = !!this.orderSelected.id;
	this.rows = this.rows.map((deb) => {
		const newDebs = { ...deb };
		newDebs.iconArrow = deb.id === row.id && this.toShow ? 'arrow_back' : 'arrow_forward';
		return newDebs;
	});
}

function changePage(page) {
	this.params.page = page;
	this.loadData(this.params.supplierId);
}

function closeDetail() {
	this.rows = lib.map(lib.setNewProperty('iconArrow', 'arrow_forward'), this.rows);
	this.toShow = false;
}

function actionsDisabled() {
	const disabled = lib.isEmpty(this.currentSelected);
	return [{ code: 'pay-debts', disabled }];
}

async function loadData(supplierId) {
	this.params.supplierId = supplierId || null;
	({ data: this.rows, headers: this.headers } = await this.$httpSales.get(
		'purchase-documents/amortization-all',
		{ params: this.params }
	));
	this.rows = this.rows.map((r) => ({
		...r,
		dateDocument: new Date(r.dateDocument)
			.toLocaleDateString()
			.split('/')
			.reverse()
			.join('-'),
	}));

	this.lastPage = Number(this.headers['x-last-page']);
	this.itemsTotalQuantity = Number(this.headers['x-quantity']);
	this.rows = lib.map(lib.setNewProperty('iconArrow', 'arrow_forward'), this.rows);
	this.isClean = false;
}

async function loadResources() {
	const defaultCurrency = this.$userInfo.company.currency;
	const requests = [
		this.$httpSales.get('suppliers'),
		this.getCurrencies(),
		this.getTypeDocuments('purchases'),
		this.warehousesList(),
		// this.$httpSales.get('type-documents-all', { params: { flagType: 1 } }),
	];
	[
		{ data: this.suppliers },
		{ data: this.currencies },
		{ data: this.typeDocuments },
		{ data: this.warehouses },
	] = await Promise.all(requests);
	const currency = this.currencies.find((c) => c.code === defaultCurrency).code;
	this.warehouses = this.warehouses.map((w) => {
		const newW = { ...w };
		newW.isSelected = false;
		return newW;
	});
	this.warehouses.unshift({ id: 0, name: 'Seleccionar todos' });
	this.params.currency = currency;
	this.params.currency = currency;
	this.setCurrencySymbol(this.params.currency);
}

function runAction() {
	this.showSlide = true;
	this.supplierId = this.currentSelected.supplierId;
}

function setCurrency({ model, value }) {
	this.params.currency = value.code;
	this.params[model] = value.code;
	this.setCurrencySymbol(value.code);
	if (this.supplierId > 0) {
		this.params.page = 1;
		this.loadData(this.supplierId);
	}
}

function setCurrencySymbol(currentCurrency) {
	this.currencySymbol = this.currencies.find((c) => c.code === currentCurrency).symbol;
	this.params.page = 1;
	this.loadData();
}

function setSupplierId({ value }) {
	if (value) {
		const { id, name } = value;
		this.params.supplierId = id;
		if (id) {
			this.supplierId = id;
			this.supplierName = name;
			this.supplier = value;
			this.params.page = 1;
			this.loadData(id);
		}
	}
}

function totalAmountToPay() {
	return this.rows.reduce(
		(accum, row) => accum + this.roundInNumber(row.amount - row.dueAmount),
		0
	);
}

function clear() {
	this.isClean = true;
	const defaultCurrency = this.$userInfo.company.currency;
	const currency = this.currencies.find((c) => c.code === defaultCurrency).code;
	this.params = {
		supplierId: null,
		purTypeDocumentId: null,
		warehouseIds: null,
		currency,
		page: 1,
		search: null,
	};
	this.warehouseIds = [];
	this.supplierId = 0;
	this.supplierName = '';
	this.supplier = {};
	this.loadData();
}

function rowSelected(row) {
	this.rows = this.rows.map((r) => {
		const newR = lib.setNewProperty('isSelected', false)(r);
		if (newR.id === row.id) {
			newR.isSelected = row.isSelected;
			this.currentSelected = row.isSelected ? { ...row } : {};
		}
		return newR;
	});
}

async function save({ body, paymentType }) {
	try {
		await this.$httpSales.post(`amortizations-multiple/${paymentType}/payment`, body);
		this.showNotification('El pago se realizó correctamente.');
		this.close();
		this.setSupplierId({ value: this.supplier });
		this.currentSelected = {};
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function close() {
	this.showSlide = false;
}

function setData({ model, value }) {
	this.params[model] = value;
	this.params.page = 1;
	this.loadData(this.supplierId);
}

function data() {
	return {
		autocompleteItems: [],
		autocompleteProperties: ['name'],
		isClean: false,
		params: {
			page: 1,
			currency: null,
			supplierId: null,
			purTypeDocumentId: null,
			warehouseIds: null,
			daysDue: null,
			startDate: null,
			endDate: null,
			search: null,
		},
		columns: [
			{ id: 1, name: 'Tienda', checked: true, visible: true },
			{ id: 2, name: 'Proveedor', checked: true, visible: true },
			{ id: 3, name: '# Doc', checked: true, visible: true },
			{ id: 4, name: 'Fecha creación', checked: false, visible: false },
			{ id: 5, name: 'Fecha vencimiento', checked: true, visible: true },
			{ id: 6, name: 'Fecha compra', checked: true, visible: true },
			{ id: 7, name: 'Tipo de documento', checked: true, visible: true },
			{ id: 8, name: 'Estado', checked: true, visible: true },
			{ id: 9, name: 'Tipo de pago', checked: true, visible: true },
			{
				id: 10,
				name: 'Total Percepción',
				checked: this.$userInfo.company.settings.flagPerception,
				visible: this.$userInfo.company.settings.flagPerception,
				flagVisible: !this.$userInfo.company.settings.flagPerception,
			},
			{ id: 11, name: 'Saldo Pendiente', checked: true, visible: true },
			{ id: 12, name: 'Saldo Abonado', checked: true, visible: true },
			{ id: 13, name: 'Total', checked: true, visible: true },
			{ id: 14, name: 'Acciones', checked: true, visible: true },
		],
		dates: [
			{
				id: 7,
				name: 'Semanal',
			},
			{
				id: 15,
				name: 'Quincenal',
			},
			{
				id: 30,
				name: 'Mes',
			},
			{
				id: 60,
				name: 'Bimestre',
			},
		],
		currencies: [],
		currencySymbol: '',
		currentSelected: {},
		detailId: null,
		itemsTotalQuantity: null,
		lastPage: 0,
		open: false,
		orderSelected: {},
		rows: [],
		rowDetailSelected: {},
		sale: {
			customer: {
				typePerson: {},
			},
			localDate: {},
		},
		showSlide: false,
		supplier: {},
		suppliers: [],
		supplierId: 0,
		supplierName: '',
		toShow: false,
		typeDocuments: [],
		warehouses: [],
		warehouseIds: [],
	};
}

export default {
	name: 'debts-to-pay',
	created,
	components: {
		appActions,
		actionSidebar,
		appSelect,
		autocompleteComponent,
		debtsToPayList,
		feesToPayForm,
		generalFilter,
		headerPage,
		debsDetailPayment,
		dateComponent,
	},
	computed: {
		actionsDisabled,
		totalAmountToPay,
	},
	data,
	methods: {
		changePage,
		clear,
		close,
		closeDetail,
		loadData,
		loadResources,
		rowSelected,
		runAction,
		save,
		setCurrency,
		setCurrencySymbol,
		setData,
		setSupplierId,
		openAction,
		setWarehouseIds(value) {
			let newVal;
			if (value.includes(0)) {
				newVal =
					this.warehouseIds.length === this.warehouses.length - 1
						? []
						: this.warehouses.filter((wh) => wh.id).map((w) => w.id);
			} else {
				newVal = value;
			}
			this.warehouseIds = newVal;
			this.params.warehouseIds =
				this.warehouseIds.length === 0 ? null : this.warehouseIds.join(',');
			this.params.page = 1;
			this.loadData(this.supplierId);
		},
		async emitExcel() {
			delete this.params.search;
			const params = Object.fromEntries(
				Object.entries(this.params).filter(([, value]) => value !== null)
			);
			const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
			const { name, lastname } = this.$userInfo;
			const documentData = {
				filename: `Reporte de cuentas por pagar ${now}`,
				extension: 'xlsx',
				comment: `Reporte de cuentas por pagar generado por ${name} ${lastname}`,
				params,
			};
			try {
				await this.$httpReports.post(
					'documents/amortizations-headers-all-xlsx',
					documentData
				);
				this.notificationReport();
			} catch (error) {
				if (error.data.statusCode === 400) {
					this.showGenericError(
						'No esta habilitado el reporte, activelo en la sección de reporte externo'
					);
				}
			}
		},
		onSearch(search) {
			this.params.search = search ? search.trim() : null;
			this.loadData();
		},
	},
	watch: {
		$route(newVal) {
			if (newVal) {
				if (newVal.name === 'debts-to-pay') {
					this.loadData(this.supplierId);
				}
			}
		},
	},
};
</script>
<style lang="scss" scoped>
.clean-btn {
	margin: 0 8px !important;
}
</style>
