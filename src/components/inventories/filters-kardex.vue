<template>
  	<div>
		<v-layout row wrap pl-4 pt-3>
			<v-flex xs4>
				<span class="label-filter">Código:</span>
				<span class="value-filter">{{ productCode }}</span>
			</v-flex>
			<v-flex xs4>
				<span class="label-filter">Unidad:</span>
				<span class="value-filter">{{ productUnit }}</span>
			</v-flex>
			<v-flex xs4>
				<span class="label-filter">Stock:</span>
				<span class="value-filter">{{ productStock }}</span>
			</v-flex>
			<v-flex xs12>
				<span class="label-filter label-filter-grey">Descripción:</span>
				<span class="value-filter">{{ productDescription }}</span>
			</v-flex>
			<v-flex xs12>
				<span class="label-filter label-filter-grey">*Información:</span>
				<span class="value-filter">Al seleccionar uno o más Almacenes se mostraran los saldos de estos.</span>
			</v-flex>
		</v-layout>
		<app-table
			class="mt-3"
			:check-all="checkAll"
			:columns="columns"
			:current-page="currentPage"
			:filter-columns="false"
			:input-search="false"
			:last-page="lastPage"
			name="table-filters"
			:rows="warehouses"
			selectable
			@row-is-selected="rowIsSelected"
			@on-selected-all="selectedAll"
			@on-page="onPage"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">{{ props.row.warehouse ? props.row.warehouse.name : null }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.product ? props.row.product.code : null }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.product ? props.row.product.name : null }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.stock }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.brandName || props.row.brand ? props.row.brand.name : '' }}</td>
			</template>
		</app-table>
		<section class="feature-footer">
			<modal-sidebar-button
				:is-loading="disabledBtn"
				success-text="Filtrar"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="onAccept"
			/>
		</section>
	</div>  
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.listWarehouses();
	this.showLot = this.$userInfo.company.settings.flagWorkWithBatches || false;
	this.columns[4].visible = this.showLot;
	this.columns[4].checked = this.showLot;
}

function rowIsSelected() {
	this.dataSelected = this.warehouses.filter(w => w.isSelected);
	this.checkAll = this.warehouses.every(w => w.isSelected);
}

function selectedAll(value) {
	this.checkAll = value;
	this.warehouses = this.warehouses.map((w) => {
		const newW = { ...w };
		newW.isSelected = value;
		return newW;
	});
	this.dataSelected = this.warehouses.filter(w => w.isSelected);
}

function closeModal() {
	this.$emit('close-modal');
}

async function listWarehouses(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	this.params.productId = this.productId;
	try {
		const { data: response, headers } = await this.$httpProducts.get('products',
			{ params: this.params });
		this.warehouses = response.map((product) => {
			const newProduct = { ...product };
			newProduct.isSelected = this.warehouseIds.length > 0 ?
				this.warehouseIds.findIndex(w => w === product.warehouse.id) >= 0 : false;
			return newProduct;
		});
		this.checkAll = this.warehouses.every(w => w.isSelected);
		this.dataSelected = this.warehouses.filter(w => w.isSelected);
		this.lastPage = Number(headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function onPage(page) {
	this.listWarehouses(page);
}

function onAccept() {
	this.$emit('filter-modal', this.dataSelected);
}

function disabledBtn() {
	return this.warehouseIds.length === 0 && this.dataSelected.length === 0;
}

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Almacén',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Código',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Nombre',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Stock',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Marca',
				visible: false,
				checked: false,
			},
		],
		currentPage: 1,
		checkAll: false,
		dataSelected: [],
		lastPage: 0,
		params: {
			page: 1,
			limit: 15,
		},
		rows: [],
		warehouses: [],
	};
}

export default {
	name: 'filters-kardex',
	created,
	data,
	components: {
		appTable,
		modalSidebarButton,
	},
	computed: {
		disabledBtn,
	},
	methods: {
		closeModal,
		listWarehouses,
		rowIsSelected,
		onAccept,
		onPage,
		selectedAll,
	},
	props: {
		productCode: String,
		productDescription: String,
		productId: [Number, String],
		productStock: [Number, String],
		productUnit: String,
		warehouseIds: {
			default: () => [],
			type: Array,
		},
	},
};
</script>

<style lang="scss" scoped>
	.label-filter {
		color: color(background-sidebar);
		font-family: font(open-bold);
		font-size: size(small11);
		padding-right: 15px;

		&-grey {
			color: color(paginationText);
		}
	}

	.value-filter {
		color: color(paginationText);
		font-family: font(open-regular);
		font-size: size(small11);
	}
</style>