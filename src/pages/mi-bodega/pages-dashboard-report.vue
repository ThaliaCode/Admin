<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			:label="`La carga terminará en un momento y podrás ver
				toda la información para dashboard pedido.`"
		/>
		<header-page
			:align-end="false"
			caption-navigation="Mira tus ventas, pedidos y cotizaciones"
			:show-clean="false"
			:show-excel="false"
			:title="$route.meta.title"
			to-show
		>
			<app-select
				append-icon="keyboard_arrow_down"
				class="border-select select-outline border-outline"
				content-class="content-outline"
				:item="params.period"
				item-text="name"
				item-value="id"
				:items="items"
				place-holder="Valores"
				model="period"
				:return-object="false"
				@input="setData"
			></app-select>
			<template v-if="isPeru">
				<app-select
					append-icon="arrow_drop_down"
					class="border-select select-outline border-outline mx-2"
					content-class="content-outline"
					:item="params.currency"
					item-text="name"
					item-value="code"
					:items="currencies"
					model="currency"
					:return-object="false"
					@input="setData"
				></app-select>
			</template>
			<span class="total-caption">
				<p class="total-label caption mb-0">Total de Pedidos</p>
				<p class="total-value mb-0">
					{{ countryCurrencySymbol }}{{ ordersTotalAmount | round }}
				</p>
			</span>
		</header-page>
		<v-flex v-if="commerce.length === 0" text-xs-center class="text-opacity">
			Usted no cuenta con un comercio asociado.
		</v-flex>
		<v-flex v-else>
			<v-layout row wrap align-center justify-space-between px-4 pt-3>
				<v-flex xs2>
					<dashboard-report-filter
						:commerce="commerce"
						:commerce-id="params.commerceId"
						@get-data="setData"
					></dashboard-report-filter>
				</v-flex>
				<v-flex xs7 pr-4>
					<v-layout row wrap align-center justify-end>
						<v-flex
							xs4
							class="container-statistics-cards"
							v-for="info in statistics"
							:key="info.id"
						>
							<statistics-cards :info="info"></statistics-cards>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout row wrap px-4 py-5>
				<v-flex xs4>
					<dashboard-card-top
						:top="top"
						@set-unit="setUnit"
						@download-excel-products="downloadExcelProducts"
					></dashboard-card-top>
				</v-flex>
				<v-flex xs8>
					<customers-report-list
						:columns="columns"
						:customers="customers"
						@click-icon="goToWhatsapp"
						@download-excel-customer="downloadExcelCustomer"
					></customers-report-list>
				</v-flex>
			</v-layout>
		</v-flex>
	</div>
</template>

<script>
import { format, subDays } from 'date-fns';
import customersReportList from '@/components/dashboard-report/customers-report-list';
import dashboardCardTop from '@/components/dashboard-report/dashboard-card-top';
import dashboardReportFilter from '@/components/dashboard-report/dashboard-report-filter';
import headerPage from '@/components/shared/header-page';
import statisticsCards from '@/components/dashboard-report/statistics-cards';
import helper from '@/shared/helper';

function created() {
	this.loadResources();
}

function goToWhatsapp({ phone }) {
	const url = `https://web.whatsapp.com/send?phone=${this.labelsByCountry.phoneCode}${phone}`;
	window.open(url, '_blank');
}

async function loadData() {
	this.loadingGeneral = true;
	const body = {
		top: 10,
		topProduct: 10,
	};
	const params = {
		commerceId: this.params.commerceId,
		startDate:
			this.params.period === 1
				? format(subDays(this.$today(), 7), 'YYYY-MM-DD')
				: this.$today(),
		endDate: this.$today(),
	};
	if (this.isPeru) {
		params.currency = this.params.currency;
	}
	try {
		({ data: this.dashboard } = await this.$httpSales.post(
			'orders/report-top',
			body,
			{ params }
		));
		this.columns[2].name = `Total ${this.params.currency}`;
		this.statistics[0].currency = this.params.currency;
		this.statistics[1].currency = this.params.currency;
		this.ordersTotalAmount = this.dashboard.paymentAmount.total;
		this.customers = this.dashboard.customerTop.map((customer) => {
			const newCustomer = { ...customer };
			newCustomer.fullName = customer.typePerson
				? customer.typePerson.fullName
				: `${customer.name} ${customer.lastname}`;
			return newCustomer;
		});
		this.top = this.dashboard.productsTop.map((product) => {
			const newProduct = { ...product };
			newProduct.unitId = product.units[0].id;
			newProduct.quantityShow = product.units[0].quantity;
			return newProduct;
		});
		this.statistics = this.statistics.map((statistic) => {
			const newStatistic = { ...statistic };
			newStatistic.total = this.dashboard.paymentAmount[statistic.code];
			return newStatistic;
		});
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loadingGeneral = false;
	}
}

async function loadResources() {
	const request = [
		this.$httpSales.get('com-ecommerce-companies'),
		this.getCurrencies(),
	];
	[{ data: this.commerce }, { data: this.currencies }] = await Promise.all(
		request
	);
	const currency =
		this.currencies.find((c) => c.code === this.$userInfo.company.currency) ||
		{};
	this.params.currency = currency.code || this.$userInfo.company.currency;
	if (this.commerce.length > 0) {
		this.params.commerceId = this.commerce[0].id;
		this.loadData();
	}
}

function setData({ model, value }) {
	this.params[model] = value;
	if (this.params.commerceId) {
		this.loadData();
	}
}

function setUnit({ row, unit }) {
	this.$set(row, 'unitId', unit.id);
	this.$set(row, 'quantityShow', unit.quantity);
}

async function downloadExcelCustomer() {
	const code = 'xlxs';
	const name = 'Reporte de Clientes';
	const body = {
		code: 'ORDERS_DASHBORD_CUSTOMERS',
	};
	const startDate =
		this.params.period === 1
			? format(subDays(this.$today(), 7), 'YYYY-MM-DD')
			: this.$today();
	try {
		const response = await this.$httpSales.post(
			`reports-dashboard?commerceId=${
				this.params.commerceId
			}&endDate=${this.$today()}&startDate=${startDate}`,
			body,
			{ responseType: 'blob' }
		);
		const blob = helper.generateBlob(
			response.data,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		helper.showDownloadDialog(blob, name, code);
		this.showNotification(
			'El reporte de Clientes fue descargado correctamente.'
		);
	} catch (error) {
		this.showGenericError();
	}
}

async function downloadExcelProducts() {
	const code = 'xlxs';
	const name = 'Reporte de Productos más solicitados.';
	const body = {
		code: 'ORDERS_DASHBORD_PRODUCTS',
	};
	const startDate =
		this.params.period === 1
			? format(subDays(this.$today(), 7), 'YYYY-MM-DD')
			: this.$today();
	try {
		const response = await this.$httpSales.post(
			`reports-dashboard?commerceId=${
				this.params.commerceId
			}&endDate=${this.$today()}&startDate=${startDate}`,
			body,
			{ responseType: 'blob' }
		);
		const blob = helper.generateBlob(
			response.data,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		helper.showDownloadDialog(blob, name, code);
		this.showNotification(
			'El reporte de los Productos más solicitados fue descargado correctamente.'
		);
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Cliente',
				value: 'fullName',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Celular',
				value: 'phone',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: `Total ${this.$userInfo.company.currency}`,
				value: 'purchasesTotalAmount',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: '',
				value: 'action',
				checked: true,
				visible: true,
				flagVisible: true,
			},
		],
		commerce: [],
		currencies: [],
		customers: [],
		items: [
			{
				id: 1,
				name: 'Última semana',
			},
			{
				id: 2,
				name: 'Hoy',
			},
		],
		loadingGeneral: false,
		ordersTotalAmount: 0,
		params: {
			commerceId: null,
			currency: null,
			period: 1,
		},
		statistics: [
			{
				id: 1,
				background: '#B2DD00',
				code: 'total',
				color: '#02979b',
				currency: '',
				title: 'Pedidos de la semana',
				total: 0,
				urlImage: '/static/img/icon-cards-1.svg',
			},
			{
				id: 2,
				background: '#ddc219',
				code: 'cancel',
				color: '#ffffff',
				currency: '',
				title: 'Pedidos Anulados',
				total: 0,
				urlImage: '/static/img/icon-cards-2.svg',
			},
			{
				id: 3,
				background: '#02979b',
				code: 'quantity',
				color: '#ffffff',
				labelTotal: 'tickets',
				title: 'Promedio ticket',
				total: 0,
				urlImage: '/static/img/icon-cards-3.svg',
			},
		],
		top: [],
	};
}

export default {
	name: 'dashboard-report',
	components: {
		customersReportList,
		dashboardCardTop,
		dashboardReportFilter,
		headerPage,
		statisticsCards,
	},
	created,
	data,
	methods: {
		downloadExcelCustomer,
		downloadExcelProducts,
		goToWhatsapp,
		loadData,
		loadResources,
		setData,
		setUnit,
	},
};
</script>

<style lang="scss" scoped>
.total {
	&-caption {
		border-left: 1px solid color(map-cation);
		margin-left: 13px;
		margin-top: 5px;
		padding-left: 13px;
		padding-top: 3px;
	}

	&-label {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-weight: 500;
		line-height: normal;
	}

	&-value {
		color: color(background-sidebar);
		font-family: font(open-bold);
		font-size: size(medium21);
		line-height: normal;
	}
}

.text-opacity {
	background-color: color(white);
	border: 3px solid color(primary);
	border-style: dashed;
	color: #828282;
	font-size: 25px;
	font-family: map-get($fonts, open-semibold);
	margin: 17% auto 0 auto;
	padding: 15px 20px;
	max-width: 550px;
}
</style>
