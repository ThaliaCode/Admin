<template>
  <div>
		<v-layout wrap pa-4>
			<v-flex xs4>
				<label class="item-modal">Código:<span class="ml-2">{{information.product.code}}</span></label>
			</v-flex>
			<v-flex xs4>
				<label class="item-modal">Unidad:<span class="ml-2">{{information.product.unit.name}}</span></label>
			</v-flex>
			<v-flex xs4>
				<label class="item-modal">Stock:<span class="ml-2">{{information.product.stock}}</span></label>
			</v-flex>
		</v-layout>
		<v-layout wrap mt-1 ml-4>
			<v-flex xs12>
				<label class="item-modal">Descripción:<span class="ml-2">{{information.product.description}}</span></label>
			</v-flex>
		</v-layout>
		<div class="border-detail-warehouse"></div>
		<div class="mt-3">
			<app-table
			name="detail-warehouse"
			:rows="rows"
			:columns="columns"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable w-47" v-show="showRow(columns, 1)">{{props.row.warehouse ? props.row.warehouse.name : null}}</td>
					<td v-show="showRow(columns,2)">{{props.row.stock}}</td>
					<td v-show="showRow(columns,3)">{{props.row.location}}</td>
				</template>
			</app-table>
		</div>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:hiddenSaveBtn="true"
				@cancel-button-clicked="closeModal"
			/>
		</section>
	</div>  
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function closeModal() {
	this.$emit('close-modal');
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Almacén', value: 'warehouse', visible: true, checked: true },
			{ id: 2, name: 'Stock', value: 'stock', visible: true, checked: true },
			{ id: 3, name: 'Ubicación', value: 'ubication', visible: true, checked: true },
		],
		rows: [],
	};
}

function created() {
	this.loadData();
}

async function loadData() {
	try {
		const { data: response } = await this.$httpProducts.get(`products/${this.information.productId}/${this.information.brandId}/stocks/warehouses`);
		this.rows = response;
	} catch (error) {
		this.showGenericError();
	}
}

export default {
	name: 'detail-warehouse',
	data,
	methods: {
		closeModal,
		loadData,
	},
	components: {
		modalSidebarButton,
		appTable,
	},
	created,
	props: {
		information: {
			type: Object,
			default: () => {},
		},
	},
};
</script>

<style lang="scss" scoped>
.item-modal {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-semibold);
	font-size: 13px;
}
.border-detail-warehouse {
	border: 1px solid map-get($colors, grey);
	margin: 20px 0;
}

.w-47 {
	width: 57%;
}
</style>