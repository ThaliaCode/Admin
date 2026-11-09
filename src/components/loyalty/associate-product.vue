<template>
	<div class="py-3">
		<app-table
			name="associate-product"
			selectable
			:columns="columns"
			:current-page="currentPage"
			:rows="data"
			:check-all="checkAll"
			:last-page="lastPage"
			:clean-search="isClean"
			@on-search-event="callServiceAndSearch"
			@on-page="changePage"
			@row-is-selected="rowIsSelected"
			@on-selected-all="selectedAll">
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">{{ props.row.warehouse.name }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.product.code }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.product.inlineAlternateCode }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.product.name }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.product.category.name }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.product.description }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.brand.name }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.account }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.priceCost | round }}</td>
				<td v-show="showRow(columns, 10)">{{ returnPriceList(props.row) | round }}</td>
				<td v-show="showRow(columns, 11)">{{ props.row.stock }}</td>
				<td>
					<router-link
						v-if="props.row.product.isCombo"
						:to="{ name: 'edit-composition-products', params: { id: props.row.id } }"
						class="table-icon">
						<v-icon
							color="primary"
							size="19">
							edit
						</v-icon>
					</router-link>
				</td>
			</template>
		</app-table>
		<section class="fast-register-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="$emit('create-category')"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import appTable from '@/components/shared/table/app-table';

function callServiceAndSearch() {}

function changePage() {}

function rowIsSelected() {}

function selectedAll() {}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre de Producto', value: 'name', visible: true, checked: true },
		],
		data: [],
		checkAll: false,
		lastPage: 0,
		isClean: false,
		currentPage: 1,
	};
}

export default {
	name: 'associate-product',
	data,
	components: {
		appTable,
		modalSidebarButton,
	},
	methods: {
		callServiceAndSearch,
		changePage,
		rowIsSelected,
		selectedAll,
	},
};
</script>