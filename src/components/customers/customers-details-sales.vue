<template>
	<div>
		<app-table
			class="is-not-selectable mt-4"
			name="customers-details-sales"
			:clean-search="isClean"
			:columns="columns"
			:current-page="currentPage"
			:key-value="keyValue"
			:last-page="lastPage"
			:rows="sales"
			:items-quantity="sales.length"
			:items-total-quantity="detailQuantity"
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
					<a @click="preGoTo(props.row)">
						{{ props.row.documentNumber }}
					</a>
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.currencySymbol }} {{ props.row.amount | round }}
				</td>
				<td v-show="showRow(columns, 5)" @click.stop="stopClick">
					<app-tooltip-button
						icon="remove_red_eye"
						text="Ver Detalle"
						color="primary"
						size="16"
						@click-icon="preGoTo(props.row)"
					/>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';
	import appTooltipButton from '@/components/shared/app-tooltip-button';

	function created() {
		this.loadData();
	}

	async function loadData(page = 1) {
		this.currentPage = page;
		// this.params.customerId = this.customerId;
		this.params.page = page;
		const params = { ...this.params };
		const customerId = this.customerId;
		try {
			({ data: this.sales, headers: this.headers } = await this.$httpSales.get(
				`customer/${customerId}/sales`, { params }));
			this.lastPage = Number(this.headers['x-last-page']);
			this.detailQuantity = Number(this.headers['x-quantity']);
			this.isClean = false;
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function onSearch(search) {
		const searchTrim = search ? search.trim() : '';
		this.params.search = searchTrim || null;
		this.loadData();
	}

	function stopClick() {
		return false;
	}

	function preGoTo(document) {
		const routeData = this.$router.resolve({ name: 'convert', params: { id: document.id } });
		window.open(routeData.href, '_blank');
	}

	function data() {
		return {
			data: {},
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
					name: 'Importe',
					value: 'amount',
					visible: true,
				},
				{
					id: 5,
					checked: false,
					name: 'Acciones',
					visible: false,
				},

			],
			currentPage: 1,
			detailQuantity: 0,
			headers: {},
			isClean: false,
			keyValue: 'warProductId',
			lastPage: 0,
			params: {
				limit: 20,
				page: 1,
			},
			sales: [],
		};
	}

	export default {
		name: 'customers-details-sales',
		components: {
			appTable,
			appTooltipButton,
		},
		created,
		data,
		methods: {
			loadData,
			onSearch,
			stopClick,
			preGoTo,
		},
		props: {
			customerId: [Number, String],
		},
	};
</script>
