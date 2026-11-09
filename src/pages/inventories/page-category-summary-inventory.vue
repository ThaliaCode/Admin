<template>
	<div>
		<header-page
			name="summary-inventory-category"
			to-show
			:title="$route.meta.title"
		></header-page>
		<general-filter>
			<v-layout mt-5>
				<v-flex xs12>
					<p>Inventario: {{summary.name}}</p>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="container-table">
			<app-table
				name="summary-inventory-category"
				:filter-columns="false"
				:input-search="false"
				:main-list="false"
				:columns="columns"
				:rows="rows"
				class="is-not-selectable"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.unit }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.totalStock }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.totalCount }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.totalDiff }}</td>
					<td v-show="showRow(columns, 6)">
						<router-link
							:to="{ name: 'summary-inventory-category', params: { id: props.row.id } }"
							class="link-table"
						>
							<v-tooltip top>
								<v-btn
									slot="activator"
									icon
								>
									<v-icon color="primary">remove_red_eye</v-icon>
								</v-btn>
								<span>Detalle de inventario</span>
							</v-tooltip>
						</router-link>
					</td>
				</template>
			</app-table>
		</div>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';

function created() {
	({ id: this.id } = this.$route.params);
	this.loadData();
}

async function loadData() {
	const url = `inventories/${this.id}/by-categories`;
	({ data: this.summary } = await this.$httpProducts(url));
	this.rows = this.summary.details;
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Categoría', value: 'name', visible: true, checked: true },
			{ id: 2, name: 'UND', value: 'unit', visible: true, checked: true },
			{ id: 3, name: 'stock', value: 'totalStock', visible: true, checked: true },
			{ id: 4, name: 'Conteo', value: 'totalCount', visible: true, checked: true },
			{ id: 5, name: 'Diferencia', value: 'totalDiff', visible: true, checked: true },
			{ id: 6, name: '', value: '', visible: true, checked: true },
		],
		id: 0,
		rows: [
			{ category: 'categoría', unit: 'und', stock: 3, accounting: 6, diff: 3 },
			{ category: 'categoría', unit: 'und', stock: 3, accounting: 6, diff: 3 },
		],
		summary: {},
	};
}

export default {
	name: 'page-category-summary-inventory',
	components: {
		appTable,
		generalFilter,
		headerPage,
	},
	created,
	data,
	methods: {
		loadData,
	},
};
</script>
<style lang="scss">
	.link-icon, .link-table {
		text-decoration: none;
	}
</style>

