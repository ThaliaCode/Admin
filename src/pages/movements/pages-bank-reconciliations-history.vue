<template>
	<div>
		<header-page :title="$route.meta.title" />
		<bank-reconciliations-history-list
			class="mt-4"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="reconciliations"
			@on-page="onPage"
			@open-detail="openDetail"
		/>
	</div>
</template>

<script>
	import bankReconciliationsHistoryList from '@/components/bank-reconciliation/bank-reconciliations-history-list';
	import headerPage from '@/components/shared/header-page';

	function created() {
		this.loadData();
	}

	function customData(rows) {
		return rows.map((row) => {
			const newRow = { ...row };
			newRow.date = row.date.split('T')[0];
			return newRow;
		});
	}

	async function loadData() {
		const params = { ...this.params };
		try {
			({ data: this.reconciliations, headers: this.headers } = await this.$httpSales.get(
				'bank-reconcilement', { params }));
			this.reconciliations = this.customData(this.reconciliations);
			this.lastPage = Number(this.headers['x-last-page']);
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function onPage(page) {
		this.currentPage = page;
		this.params.page = page;
		this.loadData();
	}

	function openDetail({ id, date }) {
		const newDate = date.split('T');
		this.goTo('bank-movements', { params: { id, date: newDate[0] } });
	}

	function data() {
		return {
			columns: [
				{
					id: 1,
					name: 'Fecha de Conciliación',
					value: 'date',
					visible: true,
				},
				{
					id: 2,
					name: 'Fecha de Creación',
					value: 'createdAt',
					visible: true,
				},
				{
					id: 3,
					name: 'Importe',
					value: 'amount',
					visible: true,
				},
				{
					id: 4,
					name: 'Acciones',
					visible: true,
				},
			],
			currentPage: 1,
			headers: {},
			lastPage: 1,
			params: {
				page: 1,
			},
			reconciliations: [],
		};
	}

	export default {
		name: 'bank-reconciliations-history',
		components: {
			bankReconciliationsHistoryList,
			headerPage,
		},
		created,
		data,
		methods: {
			customData,
			loadData,
			onPage,
			openDetail,
		},
	};
</script>
