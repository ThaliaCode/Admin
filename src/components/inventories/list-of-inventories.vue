<template>
	<div>
		<header-page
			:title="$route.meta.title"
			to-show
			:show-excel="false"
			@clean-product-filter="cleanFilters"
		/>
		<general-filter class="layout wrap py-3">
			<v-flex xs12 sm6 md3 pr-2>
				<app-select
					:item="params.warehouseId"
					item-text="name"
					item-value="id"
					:items="warehouses"
					:label="labelWarehouse()"
					model="warehouseId"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs12 sm6 md2 px-2>
				<app-select
					:item="params.status"
					item-text="name"
					item-value="id"
					:items="status"
					label="Estado"
					model="status"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs12 sm6 md2 px-2>
				<app-select
					:item="params.type"
					item-text="name"
					item-value="id"
					:items="inventoriesType"
					label="Tipo"
					model="type"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs12 sm6 md2 px-2>
				<app-date-select
					:date-formatted="params.startDate"
					label="Fecha inicial"
					model="startDate"
					@input="getDate"
				/>
			</v-flex>
			<v-flex xs12 sm6 md2 pl-2>
				<app-date-select
					:date-formatted="params.endDate"
					label="Fecha final"
					:min-date="params.startDate"
					model="endDate"
					@input="getDate"
				/>
			</v-flex>
		</general-filter>
		<div class="overflow-auto mt-0">
			<app-table
				name="inventories"
				:columns="columns"
				:current-page="currentPage"
				:rows="data"
				:input-search="false"
				local-storage
				:last-page="lastPage"
				@on-toggle-columns="toggleColumns"
				@on-page="changePage"
				class="is-not-selectable"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">
						{{ props.row.id }}
					</td>
					<td v-show="showRow(columns, 2)">
						{{ props.row.inventoryDate | formatDate('DD/MM/YYYY, HH:MM:SS a') }}
					</td>
					<td v-show="showRow(columns, 3)">{{ props.row.warehouseName }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.inlineResponsibles }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.stateComplete }}</td>
					<td v-show="showRow(columns, 6)">
						<router-link
							class="table-icon"
							:to="{
								name: 'inventory-detail',
								params: { inventoryId: props.row.id, status: props.row.status },
							}"
						>
							<v-icon color="primary" size="19"> remove_red_eye </v-icon>
						</router-link>
					</td>
				</template>
			</app-table>
		</div>
	</div>
</template>

<script>
import { differenceInDays, format } from 'date-fns';
import appTable from './../shared/table/app-table';
import generalFilter from './../shared/general-filter';
import headerPage from './../shared/header-page';

function created() {
	const indexWarehouse = this.columns.findIndex((p) => p.value === 'warehouseName');
	this.columns[indexWarehouse].name = this.labelWarehouse();
	this.loadResources();
	this.loadData();
}

function changePage(page) {
	this.currentPage = page;
	this.loadData(page);
}

function cleanFilters() {
	this.params = {
		endDate: null,
		page: 1,
		startDate: null,
	};
	this.loadData();
}

function getData({ model, value }) {
	this.params[model] = value.id;
	this.loadData(this.params.page);
}

function getDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
	const validDate = differenceInDays(this.params.endDate, this.params.startDate) < 0;
	if (this.params.endDate) {
		if (validDate) {
			this.showNotification('La fecha final no puede ser menor a la inicial.', 'info');
		} else {
			this.loadData(this.params.page);
		}
	}
}

async function loadResources() {
	({ data: this.warehouses } = await this.$httpProducts.get('warehouses'));
}

async function loadData(page = 1) {
	this.params.page = page;
	try {
		const response = await this.$httpProducts.get('inventories', { params: this.params });
		this.data = response.data.results.map((rowData) => {
			const newData = Object.assign({}, rowData);
			newData.warehouseName = rowData.warehouse.name;
			newData.inlineResponsibles = rowData.responsible.join(', ');
			newData.stateComplete =
				rowData.status === 1
					? 'Inventariado'
					: `Cerrado ${format(new Date(rowData.closedAt), 'DD/MM/YYYY, HH:MM:SS a')}`;
			return newData;
		});
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (err) {
		console.log(err);
		this.showGenericError();
	}
}

function toggleColumns() {
	return true;
}

function data() {
	return {
		columns: [
			{ id: 1, name: '#', value: 'id', visible: true, checked: true },
			{
				id: 2,
				name: 'Fecha/hora de entrada',
				value: 'inventoryDate',
				visible: true,
				checked: true,
			},
			{ id: 3, name: 'Tienda', value: 'warehouseName', visible: true, checked: true },
			{
				id: 4,
				name: 'Responsable',
				value: 'inlineResponsibles',
				visible: true,
				checked: true,
			},
			{ id: 5, name: 'Estado', value: 'stateComplete', visible: true, checked: true },
			{ id: 6, name: 'Acciones', visible: true, checked: true, flagVisible: true },
		],
		currentPage: 1,
		data: [],
		lastPage: 0,
		params: {
			endDate: null,
			page: 1,
			startDate: null,
		},
		status: [
			{ id: 1, name: 'Inventariado' },
			{ id: 2, name: 'Cerrado' },
		],
		warehouses: [],
	};
}

export default {
	name: 'inventories',
	components: {
		appTable,
		generalFilter,
		headerPage,
	},
	created,
	data,
	methods: {
		changePage,
		cleanFilters,
		getData,
		getDate,
		loadData,
		loadResources,
		toggleColumns,
	},
};
</script>

<style lang="scss" scoped>
.overflow-auto {
	&.overflow-background {
		background-color: map-get($colors, background-table);
		border-top: 2px solid map-get($colors, header);
		min-height: calc(100vh - 145px);
		padding: 30px 11.5px;
	}
}
</style>
