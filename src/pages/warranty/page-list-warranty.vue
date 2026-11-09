<template>
	<div>
		<div>
			<header-page
				caption-navigation="Productos > Garantia"
				:title="$route.meta.title"
				show-clean
				:show-excel="false"
				to-show
				:clean-disabled="!params.customerId"
				@clean-product-filter="cleanFilters"
			/>
			<app-actions
				:resource-uri="$route.name"
				@open-help="openHelp"
				@run-action="runAction"
			/>
			<v-layout row align-center px-4 mt-4>
				<v-flex xs3>
					<autocomplete-component
						:item-text="'typePerson.fullName'"
						item-value="id"
						:items="customers"
						label-value="Cliente"
						:properties-to-show="properties"
						:resource-url="'/customers'"
						return-object
						:http-code="'$httpSales'"
						:item="params.customerId"
						@return-data="setCustomer($event, 'customerId')"
					></autocomplete-component>
					<!-- <app-select
						append-icon="search"
						item-text="autocomplete"
						item-value="id"
						:item="params.customerId"
						:items="customers"
						label="Buscar Cliente"
						model="customerId"
						:return-object="false"
						@input="setCustomer"
					/> -->
				</v-flex>
			</v-layout>
			<div class="mt-3">
				<app-table
					:columns="columns"
					:rows="rows"
					:last-page="lastPage"
					:current-page="currentPage"
					:items-quantity="rows.length"
					@on-page="changePage"
					@on-search-event="onSearchEvent"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable" v-show="showRow(columns, 1)">1</td>
						<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.startDate | exactDate('DD-MM-YYYY') }}</td>
						<td v-show="showRow(columns, 4)">{{ props.row.fullNameCustomer }}</td>
						<td v-show="showRow(columns, 5)">{{ props.row.fullNameEmployee }}</td>
						<td v-show="showRow(columns, 6)">{{ props.row.amount }}</td>
						<td v-show="showRow(columns, 7)">
							<span :style="`color: ${props.row.statusOperation.color}`" class="semibold">
								{{ props.row.statusOperation ? props.row.statusOperation.process : null }}
								 {{ props.row.statusOperation ? props.row.statusOperation.statusName : null }}
							</span>
						</td>
						<td v-show="showRow(columns, 8)">
							<app-tooltip-button
								color="success"
								icon="edit"
								text="Editar"
								@click-icon="goToEdit(props.row)"
							></app-tooltip-button>
						</td>
					</template>
				</app-table>
			</div>
		</div>
	</div>
</template>

<script>
	import appActions from '@/components/shared/app-actions';
	import appTable from '@/components/shared/table/app-table';
	import headerPage from '@/components/shared/header-page';

	function created() {
		this.loadWarranty();
		this.searchCustomers();
	}

	async function loadWarranty() {
		const params = {
			customerId: this.params.customerId,
			page: this.currentPage,
			limit: 20,
			search: this.params.search,
		};
		try {
			const response = await this.$httpProducts.get('warranties', { params });
			this.rows = response.data;
			this.lastPage = Number(response.headers['x-last-page']);
		} catch (error) {
			this.showGenericError();
		}
	}

	function changePage(page) {
		this.currentPage = page;
		this.loadData();
	}

	function runAction({ code }) {
		if (code === 'new-warranty') {
			this.goTo('new-warranty');
		}
	}

	function onSearchEvent(value) {
		const searchTrim = value ? value.trim() : '';
		this.params.search = searchTrim || null;
		this.loadWarranty();
	}

	async function searchCustomers() {
		try {
			const response = await this.$httpSales.get(
				'customers',
			);
			this.customers = response.data.map((o) => {
				const newRow = { ...o };
				newRow.fullNameCustomer = o.typePerson.fullName;
				return newRow;
			});
		} catch (error) {
			this.showGenericError();
		}
	}

	function setCustomer(value, model) {
		if (value) {
			this.params[model] = value.id;
			this.loadWarranty();
		}
	}

	function cleanFilters() {
		this.params = {
			page: 1,
		};
		this.params.customerId = null;
		this.loadWarranty();
	}

	function goToEdit({ id }) {
		this.goTo('new-warranty', { params: { id } });
	}

	function data() {
		return {
			columns: [
				{ id: 1, name: 'Número', value: 'name', visible: true, checked: true },
				{ id: 2, name: 'Código', value: 'unit', visible: true, checked: true },
				{ id: 3, name: 'Fecha', value: 'totalStock', visible: true, checked: true },
				{ id: 4, name: 'Cliente', value: 'totalCount', visible: true, checked: true },
				{ id: 5, name: 'Empleado', value: 'totalCount', visible: true, checked: true },
				{ id: 6, name: 'Saldo a Favor', value: 'totalDiff', visible: true, checked: true },
				{ id: 7, name: 'Estado', value: '', visible: true, checked: true },
				{ id: 8, name: 'Acciones', value: '', visible: true, checked: true },
			],
			customerId: null,
			customers: [],
			currentPage: 1,
			lastPage: 0,
			properties: ['id'],
			params: {
				customerId: null,
				search: null,
				page: 1,
			},
			rows: [],
		};
	}

	export default {
		name: 'page-list-warranty',
		created,
		data,
		components: {
			appActions,
			appTable,
			headerPage,
		},
		methods: {
			changePage,
			cleanFilters,
			goToEdit,
			loadWarranty,
			runAction,
			searchCustomers,
			onSearchEvent,
			setCustomer,
		},
	};
</script>

<style lang="scss" scoped>
.semibold {
	font-family: font(open-bold);
}
</style>
