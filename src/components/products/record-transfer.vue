<template>
	<div class="px-3 pt-4">
		<v-layout row align-center>
			<v-flex xs5>
				<v-layout row wrap align-center px-2>
                  <v-flex d-flex align-center pl-2 class="column-label">
                     Producto:
                  </v-flex>
                  <v-flex d-flex align-center class="column-value">
                     {{ nameProduct }}
                  </v-flex>
               </v-layout>
			</v-flex>
			<v-flex xs5 ml-2>
				<v-layout row wrap align-center px-2>
                  <v-flex d-flex align-center pl-2 class="column-label">
                    Almacen:
                  </v-flex>
                  <v-flex d-flex align-center class="column-value">
                     {{ namePoint }}
                  </v-flex>
               </v-layout>
			</v-flex>
		</v-layout>
		<v-layout mt-4>
			<v-flex xs12>
				<app-table
					:input-search="false"
					:columns="columns"
					:rows="rows"
					:current-page="currentPage"
					:last-page="lastPage"
					:items-quantity="rows.length"
					:items-total-quantity="detailQuantity"
					class="is-not-selectable"
					@on-page="changePage"
					@on-search-event="onSearch"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.createdAt | formatDate }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.warehouseSourceName }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.totalRequest }}</td>
						<td v-show="showRow(columns, 5)">{{ props.row.totalSend }}</td>
						<td v-show="showRow(columns, 4)">{{ props.row.statusName }}</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hidden
				:img="false"
				padding-success="px-4 py-2"
				success-text="Cerrar"
				success-color="error"
				@accept-button-clicked="$emit('close-slide')"
			/>
		</section>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadTransfers();
}

async function loadTransfers() {
	const params = {
		warehouseSourceId: this.warehouseId,
		productId: this.productId,
		...this.params,
	};
	try {
		const { data: response, headers } = await this.$httpProducts.get('transfers/list', { params });
		this.rows = response.results.map((row) => {
			const newRow = { ...row };
			const findProduct = row.details.find(p => p.productId === this.productId);
			newRow.totalRequest = findProduct.quantity;
			newRow.totalSend = findProduct.clearanceAmountSent;
			return newRow;
		});
		this.lastPage = Number(headers['x-last-page']);
		this.detailQuantity = Number(headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

function changePage(page) {
	this.currentPage = page;
	this.params.page = page;
	this.loadTransfers();
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim;
	this.loadTransfers();
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Fecha', value: 'name', visible: true, checked: true },
			{ id: 2, name: 'Almacen Solicitado', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Cantidad Solicitada', value: 'name', visible: true, checked: true },
			{ id: 4, name: 'Cantidad Enviada', value: 'name', visible: true, checked: true },
			{ id: 5, name: 'Estado', value: 'name', visible: true, checked: true },
		],
		currentPage: 1,
		detailQuantity: 0,
		lastPage: 0,
		rows: [],
		params: {
			limit: 20,
			page: 1,
			search: null,
		},
	};
}

export default {
	name: 'record-transfer',
	components: {
		appTable,
		modalSidebarButton,
	},
	data,
	created,
	methods: {
		changePage,
		loadTransfers,
		onSearch,
	},
	props: {
		nameProduct: [String],
		namePoint: [String],
		warehouseId: [String, Number],
		productId: [String, Number],
	},
};
</script>