<template>
	<section>
		<header-page
			:columns="columns"
			:rows="summaryData.data"
			name="amortizations-history"
			:title="$route.meta.title"
			to-show
			export-to-pdf
			:show-excel="false"
			:show-clean="false"
			@download-dispatch="downloadData"
		/>
		<general-filter>
			<v-layout wrap align-end my-3>
				<v-flex xs3 pr-3>
					<autocomplete-component
						label-value="Cliente"
						item-value="id"
						:item-text="'typePerson.fullName'"
						:on-clean="onClean"
						:properties-to-show="properties"
						:resource-url="'/customers'"
						:http-code="'$httpSales'"
						:item="customerId"
						@return-data="setCustomer"
					></autocomplete-component>
				</v-flex>
				<v-flex xs3>
					<v-layout wrap>
						<v-flex xs6 pr-2>
							<app-date-select
								:date-formatted="startDate"
								label="Fecha de inicio"
								model="startDate"
								@input="getData"
							/>
						</v-flex>
						<v-flex xs6 pl-2>
							<app-date-select
								:date-formatted="endDate"
								label="Fecha de fin"
								model="endDate"
								@input="getData"
							/>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs1 pl-3 v-if="isPeru">
					<app-select
						:item="currency"
						item-text="code"
						item-value="id"
						:items="currencies"
						label="Moneda"
						model="currency"
						:return-object="false"
						@input="getData"
					/>
				</v-flex>
				<v-flex xs3 pl-3>
					<v-btn
						class="btn-action"
						color="success"
						:disabled="disabled"
						@click="loadData"
					>
						Buscar
					</v-btn>
					<v-btn class="btn-action" color="error" @click="cleanFilter">
						Limpiar Filtros
					</v-btn>
				</v-flex>
				<v-flex xs2 text-xs-right>
					TOTAL: {{ summaryData.total | round }}
				</v-flex>
			</v-layout>
		</general-filter>
		<amortizations-list-history
			:columns="columns"
			:rows="summaryData.data"
			:total="summaryData.total"
			:last-page="lastPage"
			:current-page="currentPage"
			@on-page="onPage"
			@print-voucher="onPrint"
			@show-signature="showSignature"
		>
		</amortizations-list-history>
		<action-sidebar title="FIRMA" :width="500" v-model="sidebarStatus">
			<div class="signature-container">
				<img :src="selectedRow.urlImage" width="385" height="271" />
			</div>
		</action-sidebar>
	</section>
</template>

<script>
import helper from '@/shared/helper';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import actionSidebar from '@/components/shared/action-sidebar';
import amortizationsListHistory from '@/components/amortizations/amortizations-list-history';
import appDateSelect from '@/components/shared/app-date-select';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import { isAfter, format, subMonths } from 'date-fns';

function data() {
	return {
		columns: [
			{
				id: 1,
				name: '#',
				value: 'amortization',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Fecha de pago',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Cliente',
				value: 'customer',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Documentos',
				value: 'serie',
				visible: true,
				checked: true,
			},
			{ id: 5, name: 'Firma', value: 'urlImage', visible: true, checked: true },
			{
				id: 6,
				name: 'Empleado',
				value: 'employee',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Tipo de Pago',
				value: 'payment',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Monto',
				value: 'amount',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currencies: [],
		currency: null,
		disabled: false,
		endDate: '',
		onClean: false,
		properties: ['id'],
		selectedRow: {},
		sidebarStatus: false,
		startDate: '',
		today: format(new Date(), 'YYYY-MM-DD'),
		lastPage: 0,
		currentPage: 1,
	};
}

function created() {
	this.endDate = this.today;
	this.startDate = format(subMonths(this.endDate, 1), 'YYYY-MM-DD');
	this.table.params.startDate = this.startDate;
	this.table.params.endDate = this.endDate;
	this.table.params.customerId = this.customerId || null;
	this.loadCurrencies();
}

function cleanFilter() {
	this.onClean = true;
	this.table.params.customerId = null;
	this.endDate = this.today;
	this.currency = this.$userInfo.company.currency;
	this.startDate = format(subMonths(this.endDate, 1), 'YYYY-MM-DD');
	this.table.params.startDate = this.startDate;
	this.table.params.endDate = this.endDate;
	this.table.params.page = 1;
	this.table.params.currency = null;
	this.loadData();
}

async function downloadData() {
	const params = {
		customerId: this.table.params.customerId,
		date: this.today,
		endDate: this.table.params.endDate,
		startDate: this.table.params.startDate,
	};
	const body = { code: 'amortizaciones' };
	const responseType = 'blob';
	const response = await this.$httpSales.post('amortizations/report', body, {
		params,
		responseType,
	});
	const blob = helper.generateBlob(response.data);
	helper.showDownloadDialog(
		blob,
		`amortización-${this.startDate}-${this.endDate}`,
		'pdf'
	);
}

function getData({ model, value }) {
	if (model !== 'currency') {
		this[model] = format(value, 'YYYY-MM-DD');
		this.table.params[model] = this[model];
		this.disabled = true;
		if (this.startDate && isAfter(this.endDate, this.startDate)) {
			this.disabled = false;
		}
	} else {
		this[model] = value;
		this.table.params[model] = this[model];
	}
}

async function loadCurrencies() {
	({ data: this.currencies } = await this.getCurrencies());
	this.currency = this.$userInfo.company.currency;
	this.table.params.currency = this.currency;
	this.loadData();
}

async function loadData() {
	const response = await this.$httpSales.get('amortizations', {
		params: this.table.params,
	});
	this.table.rows = response.data;
	this.lastPage = Number(response.headers['x-last-page']);
	this.onClean = false;
}

function onPage(page) {
	this.table.params.page = page;
	this.currentPage = page;
	this.loadData();
}

async function onPrint({ id, createdAt }) {
	const documentDate = helper.exactDate(createdAt, 'DD-MM-YYYY HH:mm:ss');
	const body = { code: 'billing-receipt-pdf' };
	const responseType = 'blob';
	const response = await this.$httpSales.post(
		`amortizations/${id}/report`,
		body,
		{ responseType }
	);
	const blob = helper.generateBlob(response.data);
	helper.showDownloadDialog(blob, `amortización-${documentDate}`, 'pdf');
}

function setCustomer(id) {
	if (id) {
		this.table.params.customerId = id;
	}
}

function showSignature(row) {
	this.selectedRow = row;
	this.sidebarStatus = true;
}

function summaryData() {
	if (this.table.rows.length > 0) {
		return this.table.rows.reduce(
			(acum, item, index) => {
				const newAcum = acum;
				const documents =
					(item.additionalInformation &&
						item.additionalInformation.documents) ||
					item.documents;
				const newItem = {
					amount: item.amount,
					id: item.id,
					index,
					createdAt: item.createdAt,
					documents: documents ? documents.join(', ') : '-',
					urlImage: item.urlImage,
					employeeName: item.employee
						? `${item.employee.name} ${item.employee.lastname}`
						: '',
					typePaymentName: item.typePayment ? item.typePayment.name : '',
					customerName: item.customer ? item.customer.typePerson.fullName : '',
				};
				newAcum.data.push(newItem);
				newAcum.total += newItem.amount;
				return newAcum;
			},
			{ data: [], total: 0 }
		);
	}
	return { data: [], total: 0 };
}

export default {
	name: 'pages-amortizations-history',
	components: {
		actionSidebar,
		amortizationsListHistory,
		appDateSelect,
		autocompleteComponent,
		generalFilter,
		headerPage,
	},
	computed: {
		summaryData,
	},
	created,
	data,
	methods: {
		cleanFilter,
		downloadData,
		getData,
		loadCurrencies,
		loadData,
		onPage,
		onPrint,
		setCustomer,
		showSignature,
	},
	props: {
		customerId: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.label {
	font-size: size(small);
}

.signature-container {
	align-items: center;
	display: flex;
	justify-content: center;
	margin-top: 34px;
}
</style>
