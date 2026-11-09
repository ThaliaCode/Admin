<template>
	<div>
		<app-table
			class="is-not-selectable mt-4"
			name="customers-details-refund"
			:clean-search="isClean"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			local-storage
			:rows="refund"
			@on-search-event="onSearch"
			@on-page="loadData"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable"
					v-show="showRow(columns, 1)">
					{{ props.row.createdAt | formatDate('YYYY-MM-DD') }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{ props.row.typeDocument.code }}
				</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.documentNumber }}
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.quantity }}
				</td>
				<td v-show="showRow(columns, 5)">
					{{ props.row.currencySymbol }} {{ props.row.amount | round }}
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';

	async function loadData(page = 1) {
		this.currentPage = page;
		this.params.customerId = this.customerId;
		this.params.page = page;
		const params = { ...this.params };
		try {
			({ data: this.refund, headers: this.headers } = await this.$httpSales.get('refund',
				{ params }));
			this.lastPage = Number(this.headers['x-last-page']);
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function onSearch(search) {
		const searchTrim = search ? search.trim() : '';
		this.params.search = searchTrim || null;
	}

	function data() {
		return {
			columns: [
				{
					id: 1,
					checked: true,
					name: 'Fecha',
					value: 'createdAt',
					visible: true,
				},
				{
					id: 2,
					checked: true,
					name: 'Tipo',
					value: 'typeDocument.code',
					visible: true,
				},
				{
					id: 3,
					checked: true,
					name: '# Documento',
					value: 'documentNumber',
					visible: true,
				},
				{
					id: 4,
					checked: true,
					name: 'Cantidad',
					value: 'quantity',
					visible: true,
				},
				{
					id: 5,
					checked: true,
					name: 'Importe',
					value: 'amount',
					visible: true,
				},
			],
			currentPage: 1,
			headers: {},
			isClean: false,
			lastPage: 0,
			params: {
				limit: 20,
				page: 1,
			},
			refund: [],
		};
	}

	export default {
		name: 'customers-details-refund',
		components: {
			appTable,
		},
		data,
		methods: {
			loadData,
			onSearch,
		},
		props: {
			customerId: [Number, String],
		},
	};
</script>
