<template>
	<v-layout row mt-5>
		<v-flex xs12>
			<app-table
				name="warehouse-select"
				:filterColumns="false"
				:selectable="false"
				:rows="filteredRows"
				:columns="columns"
				:last-page="lastPage"
				:clean-search="isClean"
				v-on:on-page="changePage"
				:current-page="currentPage"
				@row-is-selected="warehouseSelected"
				@on-search-event="callServiceAndSearch"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable">{{ props.row.name }}</td>
					<td class="stock-input">
						<v-text-field
							type="number"
							class="filter-select shadow-inset"
							name="product-stok"
							v-model.number="props.row.productStock"
						></v-text-field>
					</td>
				</template>	
			</app-table>
		</v-flex>
		<section class="feature-footer">
			<modal-sidebar-button
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="aceptButton"/>
		</section>	
	</v-layout>
</template>

<script>
import l from '@/shared/lib';
import appTable from './../../shared/table/app-table';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';

const { map, setNewProperty, matchBetweenArrays } = l;

async function created() {
	try {
		({ data: this.rows } = await this.warehousesList());
		this.setProductStock();
	} catch (error) {
		this.showGenericError();
	}
}

function setProductStock() {
	this.rows = map(setNewProperty('productStock', 0), this.rows);
}

function aceptButton() {
	this.$emit('product-stock-by-warehouse', this.filteredRows);
}

function closeModal() {
	this.$emit('cancel-modal');
}

function warehouseSelected(warehouse) {
	this.rows = this.rows.map((r) => {
		const newR = { ...r };
		newR.isSelected = false;
		if (newR.id === warehouse.id) newR.isSelected = warehouse.isSelected;
		return newR;
	});
	this.warehouse = {};
	if (warehouse.isSelected) this.warehouse = { ...warehouse };
}

function callServiceAndSearch(search) {
	this.search = search;
}

function filteredRows() {
	return [...matchBetweenArrays([this.rows, 'id'], [this.warehouses, 'id'])];
}

function changePage(page) {
	this.currentPage = page;
}

function data() {
	return {
		columns: [
			{ id: 0, name: 'Almacén', visible: true, checked: true, flagVisible: true },
			{ id: 1, name: 'Stock', visible: true, checked: true, flagVisible: true },
		],
		currentPage: 0,
		isClean: false,
		lastPage: 0,
		rows: [],
		search: '',
		warehouse: {},
	};
}

export default {
	name: 'selecting-warehouse',
	components: {
		appTable,
		modalSidebarButton,
	},
	computed: {
		filteredRows,
	},
	created,
	data,
	methods: {
		aceptButton,
		callServiceAndSearch,
		changePage,
		closeModal,
		setProductStock,
		warehouseSelected,
	},
	props: {
		warehouses: {
			default: () => [],
			type: Array,
		},
	},
};
</script>
<style lang="scss" scoped>
	.stock-input {
		padding: 7px !important;
		width: 70px !important;
	}
</style>
