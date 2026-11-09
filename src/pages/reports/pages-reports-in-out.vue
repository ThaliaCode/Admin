<template>
	<div>
		<header-page
			:show-excel="false"
			:title="$route.meta.title"
			to-show
			@clean-product-filter="onCleanFilter"
		/>
		<reports-filters
			show-warehouse
			show-categories
			:clean-filters="cleanFilters"
			valid-range
			@return-data="setData"
			@search-data="loadData"
			@valid-disabled="validDisabled"
		/>
		<v-layout wrap mt-5>
			<v-flex xs2 pl-4 pr-5>
				<app-select
					class="primary-select"
					:item="months"
					item-disabled="disabled"
					item-text="name"
					item-value="id"
					:items="monthsSelected"
					multiple
					:readonly="monthsSelected.length === 1"
					:return-object="false"
					@input="getMonths"
				/>
			</v-flex>
		</v-layout>
		<reports-calendar
			class="px-4 mb-5"
			:current-page="currentPage"
			:days="days"
			:last-page="lastPage"
			:products="products"
			@on-page="changePage"
		/>
	</div>
</template>

<script>
	import { eachDay, getDate, getMonth, getYear, isSameDay } from 'date-fns';
	import appSelect from '@/components/shared/app-select';
	import headerPage from '@/components/shared/header-page';
	import reportsCalendar from '@/components/reports/reports-calendar';
	import reportsFilters from '@/components/reports/reports-filters';

	function buildDays(firstDate, secondDate) {
		return eachDay(firstDate, secondDate).map((date, index) => {
			const dayDate = getDate(date) > 9 ? getDate(date) : `0${getDate(date)}`;
			const day = {
				id: index + 1,
				date,
				month: getMonth(date) + 1,
				value: dayDate,
				year: getYear(date),
			};
			return day;
		});
	}

	function buildMonths(firstDate, secondDate) {
		return eachDay(firstDate, secondDate).reduce((acum, date) => {
			const month = this.monthsComplete.find(mc => mc.id === (getMonth(date) + 1));
			if (month) {
				const monthAdded = acum.findIndex(a => a.id === month.id);
				if (monthAdded < 0) {
					acum.push({ ...month });
				}
			}
			return acum;
		}, []);
	}

	function changePage(page) {
		this.currentPage = page;
		this.loadData(page);
	}

	function getMonths({ value }) {
		this.monthsSelected = this.monthsSelected.map((ms) => {
			const newMs = { ...ms };
			newMs.disabled = (value.length === 1) && (ms.id === value[0]);
			return newMs;
		});
		this.months = [...value];
		if (this.months.length === 1) {
			this.days = [...this.daysComplete.filter(dc => dc.month === this.months[0])];
			this.products = this.productsComplete.map((pc) => {
				const newPc = { ...pc };
				newPc.values = [...pc.values.reduce((acum, pv) => {
					const index = this.days.findIndex(d => isSameDay(pv.date, d.date));
					if (index > -1) {
						acum.push(pv);
					}
					return acum;
				}, [])];
				return newPc;
			});
		} else {
			this.days = [...this.daysComplete];
			this.products = [...this.productsComplete];
		}
	}

	async function loadData(page = 1) {
		this.cleanFilters = false;
		this.query.page = page;
		if (this.disabled) {
			this.showGenericError('La fecha inicial no debe ser mayor a la final y el rango no debe superar los 31 días');
		} else {
			this.daysComplete = this.buildDays(this.params.startDate, this.params.endDate);
			this.days = [...this.daysComplete];
			this.monthsSelected = this.buildMonths(this.params.startDate, this.params.endDate);
			this.months = [...this.monthsSelected.map(ms => ms.id)];
			this.params.categoryIds = this.params.categoryIds &&
				this.params.categoryIds.length === 0 ? null : this.params.categoryIds;
			const { data: dataComplete } = await this.$httpProductsSales.post('products/rotation-calendar',
				this.params, { params: this.query });
			this.productsComplete = dataComplete.values.map((product) => {
				const newProd = { ...product };
				newProd.totalIn = product.values.reduce((acum, prod) => acum + prod.totalIn, 0);
				newProd.totalOut = product.values.reduce((acum, prod) => acum + prod.totalOut, 0);
				return newProd;
			});
			this.products = [...this.productsComplete];
			this.lastPage = dataComplete.lastPage;
		}
	}

	function onCleanFilter() {
		this.cleanFilters = true;
	}

	function setData({ model, value }) {
		this.params[model] = value;
	}

	function validDisabled(val) {
		this.disabled = val;
	}

	function data() {
		return {
			cleanFilters: false,
			currentPage: 1,
			days: [],
			daysComplete: [],
			disabled: false,
			lastPage: 0,
			months: [],
			monthsComplete: [
				{
					id: 1,
					name: 'ENERO',
				},
				{
					id: 2,
					name: 'FEBRERO',
				},
				{
					id: 3,
					name: 'MARZO',
				},
				{
					id: 4,
					name: 'ABRIL',
				},
				{
					id: 5,
					name: 'MAYO',
				},
				{
					id: 6,
					name: 'JUNIO',
				},
				{
					id: 7,
					name: 'JULIO',
				},
				{
					id: 8,
					name: 'AGOSTO',
				},
				{
					id: 9,
					name: 'SETIEMBRE',
				},
				{
					id: 10,
					name: 'OCTUBRE',
				},
				{
					id: 11,
					name: 'NOVIEMBRE',
				},
				{
					id: 12,
					name: 'DICIEMBRE',
				},
			],
			monthsSelected: [],
			params: {
				categoryIds: null,
				endDate: null,
				startDate: null,
				warehouseId: null,
			},
			products: [],
			productsComplete: [],
			query: {
				limit: 20,
				page: 1,
			},
		};
	}

	export default {
		name: 'report-in-out',
		components: {
			appSelect,
			headerPage,
			reportsCalendar,
			reportsFilters,
		},
		data,
		methods: {
			buildDays,
			buildMonths,
			changePage,
			getMonths,
			loadData,
			onCleanFilter,
			setData,
			validDisabled,
		},
	};
</script>
