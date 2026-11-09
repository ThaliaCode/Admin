<template>
	<div>
		<header-page
			:title="`${$route.meta.title} ${transferNumber}`"
			to-show
			:limit-title="80"
			:show-excel="false"
			:show-clean="false"
		/>
		<general-filter class="layout pt-2 pb-3">
			<v-layout row wrap>
				<v-flex xs12 mb-3>
					<v-layout row wrap>
						<v-flex xs3>
							<label class="item-transfer-start">Número: </label>{{ transferNumber }}
						</v-flex>
						<v-flex xs3>
							<label class="item-transfer-start">T.Origen: </label> {{ transfer.warehouseOrigin ? transfer.warehouseOrigin.name : null }}
						</v-flex>
						<v-flex xs3>
							<label class="item-transfer-start">T.Destino: </label>{{ transfer.warehouseDestination ? transfer.warehouseDestination.name : null }}
						</v-flex>
						<v-flex xs3>
							<label class="item-transfer-start">Estado: </label>{{ transfer.statusName }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12>
					<v-layout row wrap>
						<v-flex xs3>
							<label class="item-transfer-start">Tipo de Doc: </label>{{ transfer.typeDocument.name }}
						</v-flex>
						<v-flex xs3>
							<label class="item-transfer-start">Fecha de Creación: </label>{{ transfer.createdAt | formatDate('YYYY-MM-DD') }}
						</v-flex>
						<v-flex xs3>
							<label class="item-transfer-start">Ultima Act.: </label>{{ transfer.updatedAt | formatDate('YYYY-MM-DD') }}
						</v-flex>
						<v-flex xs3>
							<label class="item-transfer-start">Fecha Anul: </label>{{ transfer.cancelDate | formatDate('YYYY-MM-DD') }}
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="border-bottom mt-3"></div>
		<div class="mt-5">
			<app-table
			class="is-not-selectable no-main-list table-transfers"
			:current-page="currentPage"
			:last-page="lastPage"
			name="page-returns-detail"
			:columns="columns"
			:filter-columns="false"
			:input-search="false"
			:rows="rows"
			>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.product.code }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.product.autoBarcode }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.product.name }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.product.inlineFeatures  }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.product.description }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.brand.name }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.clearanceAmountSent }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.devolution }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.reason }}</td>
				<td v-show="showRow(columns, 10)">{{ props.row.deliveryStockOrigin }}</td>
				</template>
			</app-table>
		</div>
	</div>
</template>
<script>
	import headerPage from '@/components/shared/header-page';
	import generalFilter from '@/components/shared/general-filter';
	import appTable from '@/components/shared/table/app-table';

	function created() {
		this.loadData();
	}

	async function loadData() {
		try {
			const response = await this.$httpProducts.get(`transfers/${this.id}`, { params: this.params });
			this.transfer = response.data;
			this.transfer.typeDocument = this.transfer.typeDocument ||
				{ id: this.transfer.typeDocumentId };
			this.transferNumber = `${this.transfer.serie}-${this.transfer.number}`;
			this.transfer.warehouseOrigin = this.transfer.warehouseOrigin || '';
			this.rows = [...this.transfer.details.map((detail) => {
				const newDetail = { ...detail };
				newDetail.brand = newDetail.brand || {};
				return newDetail;
			})];
			this.lastPage = Number(response.headers['x-last-page']);
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	
	function data() {
		return {
			transfer: {},
			transferNumber: '',
			columns: [
				{
					id: 1,
					name: 'Código',
					value: 'code',
					checked: true,
					visible: true,
				},
				{
					id: 2,
					name: 'Código interno',
					value: 'codeBar',
					checked: true,
					visible: true,
				},
				{
					id: 3,
					name: 'Nombre',
					value: 'name',
					checked: true,
					visible: true,
				},
				{
					id: 4,
					name: 'Caracteristicas',
					value: 'characteristics',
					checked: true,
					visible: true,
				},
				{
					id: 5,
					name: 'Descripción',
					value: 'description',
					checked: true,
					visible: true,
				},
				{
					id: 6,
					name: 'Marca',
					value: 'brand',
					checked: true,
					visible: true,
				},
				{
					id: 7,
					name: 'Cantidad enviada',
					value: 'quantity',
					checked: true,
					visible: true,
				},
				{
					id: 8,
					name: 'Cantidad rechazada',
					value: 'quantitySend',
					checked: true,
					visible: true,
				},
				{
					id: 9,
					name: 'Observación',
					value: 'observation',
					checked: true,
					visible: true,
				},
				{
					id: 10,
					name: 'Stock',
					value: 'stock',
					checked: true,
					visible: true,
				},
			],
			currentPage: 1,
			lastPage: 0,
			rows: [],
			params: {
				flagReturned: 1,
			},
		};
	}

	export default {
		name: 'page-returns-detail',
		components: {
			headerPage,
			generalFilter,
			appTable,
		},
		created,
		methods: {
			loadData,
		},
		data,
		props: {
			id: [Number, String],
		},
	};
</script>
<style lang="scss" scoped>
	.item-transfer-start {
		color: map-get($colors, background-sidebar);
		font-family: map-get($fonts, open-semibold);
		font-size: 14px;
	}

	.text-gray {
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-regular);
		font-size: 14px;
	}

	.border-bottom {
		border: 0.5px solid map-get($colors, grey-border);
		height: 1px;
	}
</style>
