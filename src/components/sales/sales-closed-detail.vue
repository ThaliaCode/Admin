<template>
	<div>
		<header-page
			:title="$route.meta.title"
			to-show
			:columns="columns"
			:rows="rows"
			:name="`cierre-de-caja-${id}`"
			@clean-product-filter="onCleanData" />
		<general-filter>
			<v-layout row wrap>
				<v-flex xs12>
					<v-layout row wrap justify-start>
						<v-flex xs12 md3 px-1 class="align-col">
							<label class="filter-label">{{labelWarehouse()}}</label>
							<span class="filter-span">{{ warehouseName }}</span>
						</v-flex>
						<v-flex xs12 md3 px-1 class="align-col">
							<label class="filter-label">Responsable:</label>
							<span class="filter-span">{{ employeeName }}</span>
						</v-flex>
						<v-flex xs12 md2 px-1 class="align-col">
							<label class="filter-label">Venta total:</label>
							<span class="filter-span">{{ amountTotal }}</span>
						</v-flex>
						<v-flex xs12 md2 px-1 class="align-col">
							<label class="filter-label">Fecha inicio:</label>
							<span class="filter-span">{{ initDate }}</span>
						</v-flex>
						<v-flex xs12 md2 px-1 class="align-col">
							<label class="filter-label">Fecha fin:</label>
							<span class="filter-span">{{ endingDate }}</span>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</general-filter>
		<app-table
			name="sales-closed-detail"
			:columns="columns"
			:rows="rows"
			local-storage
			:main-list="false"
			:input-search="false"
			:filter-columns="false"
			class="no-main-list is-not-selectable">
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable">{{ props.row.product.code }}</td>
				<td>{{ props.row.product.name }}</td>
				<td>{{ props.row.serie }} - {{ props.row.number }}</td>
				<td>{{ props.row.date | formatDate }}</td>
				<td>{{ props.row.typeDocument.name }}</td>
				<td>{{ props.row.quantity }}</td>
				<td>{{ props.row.amountProduct }}</td>
			</template>
		</app-table>
		<v-layout row wrap justify-center mt-5>
			<v-flex xs12 md2>
				<v-btn
					color="primary"
					class="btn-action"
					:to="{ name: 'sales-closed' }">
					Volver
				</v-btn>
				<v-btn
					color="success"
					class="btn-action"
					@click="saveCashClosing">
					Cierre de caja
				</v-btn>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	import appTable from './../shared/table/app-table';
	import generalFilter from './../shared/general-filter';
	import headerPage from './../shared/header-page';
	import helper from './../../shared/helper';

	const { getLocalData, setLocalData, removeLocalData } = helper;

	function created() {
		if (!this.employId || !this.warehouseId || !this.initDate || !this.endingDate) {
			this.getDataFromLocalStorage(
				'sales-close-details',
				'amountTotal',
				'warehouseName',
				'employeeName',
				'employId',
				'warehouseId',
				'initDate',
				'endingDate',
			);
		} else {
			setLocalData('sales-close-details', {
				amountTotal: this.amount,
				warehouseName: this.warehouse,
				employeeName: this.employee,
				employId: this.employeeId,
				warehouseId: this.warehousesId,
				initDate: this.startDate,
				endingDate: this.endDate,
			});
		}
		this.loadData();
	}

	async function loadData() {
		const url = `products/${this.employId}/${this.warehouseId}/warehouses`;
		const queryDate = `?startDate=${this.initDate}&endDate=${this.endingDate}`;
		const finalUrl = `${url}${queryDate}`;
		try {
			({ data: this.rows } = await this.$httpSales.get(finalUrl));
		} catch (error) {
			this.showGenericError();
		}
	}

	function getDataFromLocalStorage(key, ...arg) {
		const dateObject = getLocalData(key);
		[...arg].forEach((el) => {
			this[el] = dateObject[el];
		});
	}

	async function saveCashClosing() {
		const url = `cash-desk-closing/${this.employId}/employee`;
		try {
			await this.$httpSales.post(url);
			this.goTo('sales-closed');
		} catch (error) {
			this.showGenericError();
		}
	}

	function onCleanData() {
		this.filter = {
			endDate: '',
			startDate: '',
		};
		this.loadData();
	}

	function beforeDestroy() {
		removeLocalData('sales-close-details');
	}

	function data() {
		return {
			amountTotal: this.amount,
			cash: {
				warehouse: 'Artesanía 10',
				responsible: 'Ramón Molina',
				quantity: 500,
			},
			columns: [
				{ id: 1, name: 'Cod.', value: 'code', visible: true },
				{ id: 2, name: 'Producto', value: 'name', visible: true },
				{ id: 3, name: '# DOC', value: 'documentNumber', visible: true },
				{ id: 4, name: 'F. Creación', value: 'createdAt', visible: true },
				{ id: 5, name: 'Tipo de documento', value: 'typeDocument', visible: true },
				{ id: 6, name: 'Cantidad', value: 'quantity', visible: true },
				{ id: 7, name: 'Monto', value: 'amount', visible: true },
			],
			employId: this.employeeId,
			employeeName: this.employee,
			endingDate: this.endDate,
			id: 0,
			initDate: this.startDate,
			rows: [],
			warehouseId: this.warehousesId,
			warehouseName: this.warehouse,
		};
	}

	export default {
		name: 'sales-closed-detail',
		beforeDestroy,
		components: {
			appTable,
			generalFilter,
			headerPage,
		},
		created,
		data,
		methods: {
			getDataFromLocalStorage,
			loadData,
			onCleanData,
			saveCashClosing,
		},
		props: {
			amount: [String, Number],
			warehouse: String,
			employee: String,
			employeeId: Number,
			warehousesId: Number,
			endDate: String,
			startDate: String,
		},
	};
</script>

<style lang="scss" scoped>
.filter {
	&-label {
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-bold);
		font-size: map-get($sizes, medium);
		margin-right: 8px;
	}

	&-span {
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-regular);
		font-size: map-get($sizes, medium);
	}
}
</style>