<template>
	<div>
		<tab-buttons
			:tabs="tabs"
			@change-tab="changeTab"
			:wrap="false"
		></tab-buttons>
		<v-layout px-3 pa-2>
			<v-flex class="primary--text bold">
				Peso Total: <span class="grey--text">{{ totalWeight | round }}</span>
			</v-flex>
			<v-btn slot="activator" class="py-1 px-1 mr-3" flat @click="exportExcel">
				<v-icon color="primary">print</v-icon>
			</v-btn>
		</v-layout>
		<tabs-table
			v-if="code === 'orders' || code === 'products'"
			:clean-search="cleanSearch"
			:columns="columns"
			:rows="code === 'products' ? ordersWithStock : orders"
			:hide-stock-column="code === 'orders'"
			@on-search="$emit('on-search', $event)"
		></tabs-table>
		<div
			v-if="code === 'grouped'"
			v-for="(items, category) in getGroupedProductsForDisplay()"
			:key="category"
		>
			<div class="d-flex align-center">
				<span class="caption-navigation">
					{{ category }}
				</span>
				<v-btn v-if="$userInfo.company.settings.flagTransferRequestFromPendingOrders"
					class="btn-action btn-auto px-4 py-2 ml-auto"
					color="primary"
					:disabled="!warehouseFilterId"
					@click="solicitudTransfer(category, items)"
				>Solicitud transferencia
				</v-btn>
			</div>
			<div v-if="!warehouseFilterId" class="text-xs-right caption red--text mb-2">
				Debe seleccionar una tienda para realizar esta acción
			</div>
			<tabs-table
				:input-search="false"
				:clean-search="cleanSearch"
				:columns="columns"
				:rows="items"
				:styles="'mb-4'"
				:hide-stock-column="false"
				@on-search="$emit('on-search', $event)"
			></tabs-table>
		</div>
		<simple-modal
			:open="dialogTransfer"
			@cancel="toggleModalTransfer"
			@confirm="onTransferConfirm()"
			@close="toggleModalTransfer"
		>
			<span slot="title">Solicitud de Transferencia - Categoría: {{ categoryTransfer }}</span>
			<div slot="message">
				<div>
					<v-select
						v-model="warehouseOriginId"
						label="Almacén de Origen"
						:items="originWarehouses"
						item-text="name"
						item-value="id"
						:rules="[v => !!v || 'El almacén de origen es requerido']"
					></v-select>
				</div>
				<tabs-table
					:input-search="false"
					:columns="columnsTransfer"
					:rows="productsToTransfer"					
					:styles="'mb-4'"
					:hide-stock-column="false"
				></tabs-table>
			</div>
		</simple-modal>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hidden
				:img="false"
				height="5vh"
				padding-success="px-5 py-2"
				success-color="error"
				success-text="Cerrar"
				@accept-button-clicked="$emit('accept-action')"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import tabButtons from '@/components/orders/tab-buttons';
import tabsTable from '@/components/orders/tabs-table';
import simpleModal from '@/components/field-sale/shared/simple-modal';
import XLSX from 'xlsx';
import { getStockByWarehouse } from '@/shared/warehouse';

function created() {
	const tabActive = this.tabs.find((t) => t.active);
	this.$emit('update-active', tabActive.code);
	// this.totalWeight = this.orders.reduce((acum, p) => acum + p.weight, 0);
	this.fetchWarehouses();
}

async function fetchWarehouses() {
	try {
		const response = await this.warehousesList();
		this.warehouses = response.data || [];
	} catch (error) {
		this.showGenericError();
	}
}

function originWarehouses() {
	return this.warehouses.filter((w) => w.id !== this.warehouseFilterId);
}

function changeColumnsProps(code) {
	return this.columns.map((c) => {
		const newColumn = { ...c };
		if (c.id === 1) {
			newColumn.name = code === 'orders' ? 'Nro Doc.' : 'Cod. Producto';
			newColumn.tooltip =
				code === 'orders' ? 'Número de Documento' : 'Código de Producto';
			newColumn.value = code === 'orders' ? 'number' : 'productCode';
		} else if (c.id === 2) {
			newColumn.name = code === 'orders' ? 'Cliente' : 'Nombre';
			newColumn.value = code === 'orders' ? 'customerName' : 'productName';
		} else if (c.id === 3) {
			newColumn.name = code === 'orders' ? 'Monto' : 'Unidad';
			newColumn.value = code === 'orders' ? 'total' : 'unitName';
		} else if (c.id === 5) {
			newColumn.name = code === 'orders' ? 'Peso' : 'Peso';
			newColumn.value = code === 'orders' ? 'weight' : 'weight';
		} else if (c.id === 6) {
			newColumn.name = 'Stock';
			newColumn.value = 'stock';
		} else if (c.id === 7 && code === 'products') {
			newColumn.name = 'Categoria';
			newColumn.value = 'categoryName';
		} else if (c.id === 8 && code === 'products') {
			newColumn.name = 'Sub Categoria';
			newColumn.value = 'subCategoryName';			
		} else {
			newColumn.name = code === 'orders' ? '# de Items' : 'Cantidad';
			newColumn.value = code === 'orders' ? 'quantityProducts' : 'quantity';
		}
		return newColumn;
	});
}

function changeTab(code) {
	this.code = code;
	this.tabs = this.tabs.map((t) => {
		const newTab = { ...t };
		newTab.active = t.code === code;
		return newTab;
	});
	this.columns = this.changeColumnsProps(code);
	this.$emit('update-active', code);
	this.fetchAndUpdateStock();
}

async function fetchAndUpdateStock() {
	let items = [];
	if (this.code === 'grouped') {
		items = Object.values(this.groupedProducts).flat();
	} else if (this.code === 'products') {
		items = this.orders || [];
	}
	
	if (!items.length) {
		return;
	}
	
	const productIds = [...new Set(items.map((i) => i.productId).filter((id) => id))];
	const warehouseIds = [...new Set(items.map((i) => i.warehouseId).filter((id) => id))];
	
	if (!productIds.length) {
		return;
	}
	
	const itemsLoading = items.map((row) => Object.assign({}, row, { stock: '...' }));
	if (this.code === 'grouped') {
		this.groupedProductsWithStock = {};
		Object.keys(this.groupedProducts).forEach((cat) => {
			this.groupedProductsWithStock[cat] = itemsLoading.filter((i) => i.categoryName === cat);
		});
	} else {
		this.ordersWithStock = itemsLoading;
	}
	
	getStockByWarehouse(productIds, warehouseIds)
		.then((stockMap) => {
			const itemsWithStock = items.map((row) => {
				const key = `${row.productId}-${row.warehouseId}`;
				const newStock = stockMap[key];
				return Object.assign({}, row, { stock: newStock !== undefined ? newStock : row.stock });
			});
			
			if (this.code === 'grouped') {
				this.groupedProductsWithStock = {};
				Object.keys(this.groupedProducts).forEach((cat) => {
					this.groupedProductsWithStock[cat] = itemsWithStock.filter((i) => i.categoryName === cat);
				});
			} else {
				this.ordersWithStock = itemsWithStock;
			}
		});
}

function getTabTitle() {
	const tab = this.tabs.find(t => t.code === this.code);
	return tab ? tab.title : 'Consolidado';
}

function warehouseFilterId() {
	return this.warehouseId;
}

function solicitudTransfer(category, item) {
	if (!this.warehouseFilterId) {
		return;
	}
	this.categoryTransfer = category;
	this.productsToTransfer = item.map(i => ({
		brandId: i.brandId,
		productId: i.productId,
		productName: i.productName,
		quantity: i.unitConversion ? i.quantity * i.unitConversion : i.quantity,
	}));
	this.warehouseOriginId = null;
	this.dialogTransfer = true;
}

function toggleModalTransfer() {
	this.warehouseOriginId = null;
	this.productsToTransfer = [];
	this.categoryTransfer = '';
	this.dialogTransfer = !this.dialogTransfer;
}

async function onTransferConfirm() {
	try {
		const subsidiaryId = this.$userInfo.subsidiary && this.$userInfo.subsidiary.id;
		const payload = {
			code: 'IMR',
			details: this.productsToTransfer,
			subsidiaryId: subsidiaryId,
			warehouseOriginId: this.warehouseOriginId,
			warehouseSourceId: this.warehouseFilterId,
			entryDate: new Date().toISOString(),
		};
		await this.$httpProducts.post('transfers', payload);
		this.showNotification('Solicitud de transferencia creada correctamente');	
	} catch (error) {
		this.showGenericError();
	}
	this.dialogTransfer = false;
	this.categoryTransfer = '';
	this.productsToTransfer = [];
}

function exportExcel() {
	const columns = this.columns.filter(c => c.visible);
	const mapRow = row =>
			columns.reduce((acc, col) => {
				acc[col.name] = row[col.value];
				return acc;
			}, {});
	const wb = XLSX.utils.book_new();
	if (this.code === 'grouped') {
		const groupedData = this.getGroupedProductsForDisplay();
		Object.keys(groupedData).forEach(category => {
			const rowsData = groupedData[category].map(mapRow);
			const ws = XLSX.utils.json_to_sheet(rowsData);
			XLSX.utils.book_append_sheet(
				wb,
				ws,
				category.substring(0, 31)
			);
		});
	} else if (this.code === 'orders') {
		const rowsDataOrder = this.orders.map(mapRow);
		rowsDataOrder.forEach(e => {
			delete e.Stock;
			delete e.Categoria;
			delete e['Sub Categoria'];
		});
		const ws = XLSX.utils.json_to_sheet(rowsDataOrder);
		XLSX.utils.book_append_sheet(wb, ws, this.getTabTitle());
	} else {
		const productsData = this.ordersWithStock.length > 0 ? this.ordersWithStock : this.orders;
		const rowsData = productsData.map(mapRow);
		const ws = XLSX.utils.json_to_sheet(rowsData);
		XLSX.utils.book_append_sheet(wb, ws, this.getTabTitle());
	}
	XLSX.writeFile(wb, `consolidado-${this.code}.xlsx`);
}

function data() {
	return {
		cleanSearch: false,
		columns: [
			{
				id: 1,
				name: 'Nro Doc.',
				tooltip: 'Número de Documento',
				value: 'number',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Cliente',
				value: 'customerName',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Monto',
				value: 'total',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: '# de Items',
				value: 'quantityProducts',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Peso',
				value: 'weight',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Stock',
				value: 'stock',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Categoria',
				value: 'categoryName',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Sub Categoria',
				value: 'subCategoryName',
				checked: true,
				visible: true,
			},
		],
		rows: [],
		tabs: [
			{
				id: 1,
				active: true,
				code: 'orders',
				title: 'Resumen de Pedidos',
			},
			{
				id: 2,
				active: false,
				code: 'products',
				title: 'Resumen de Productos',
			},
			{
				id: 3,
				active: false,
				code: 'grouped',
				title: 'Productos Agrupados',
			},
		],
		code: 'orders',
		groupedProductsWithStock: {},
		ordersWithStock: [],
		dialogTransfer: false,
		categoryTransfer: '',
		productsToTransfer: [],
		warehouseOriginId: null,
		warehouses: [],
		columnsTransfer: [
			{
				id: 1,
				name: 'Producto',
				value: 'productName',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Cantidad',
				value: 'quantity',
				checked: true,
				visible: true,
			},
		]

	};
}

export default {
	name: 'consolidation-slide',
	components: {
		modalSidebarButton,
		tabButtons,
		tabsTable,
		simpleModal,
	},
	created,
	data,
	computed: {
		warehouseFilterId,
		originWarehouses,
	},
	methods: {
		changeColumnsProps,
		changeTab,
		exportExcel,
		getTabTitle,
		solicitudTransfer,
		fetchAndUpdateStock,
		fetchWarehouses,
		toggleModalTransfer,
		onTransferConfirm,
		getGroupedProductsForDisplay() {
			if (
				this.groupedProductsWithStock &&
				Object.keys(this.groupedProductsWithStock).length > 0
			) {
				return this.groupedProductsWithStock;
			}
			return this.groupedProducts;
		},
	},
	props: {
		orders: {
			default: () => [],
			type: Array,
		},
		totalWeight: {
			default: 0,
			type: Number,
		},
		groupedProducts: {
			default: () => {},
			type: Object,
		},
		warehouseId: {
			default: null,
			type: [Number, String],
		},
	},
	watch: {
		groupedProducts: {
			handler(val) {
				if (this.code === 'grouped' && val && Object.keys(val).length > 0) {
					this.$nextTick(() => {
						this.fetchAndUpdateStock();
					});
				}
			},
			deep: true,
		},
		orders: {
			handler(val) {
				if (this.code === 'products' && val && val.length > 0) {
					this.$nextTick(() => {
						this.fetchAndUpdateStock();
					});
				}
			},
			deep: true,
		},
	},
};
</script>

<style lang="scss" scoped>
.bold {
	font-weight: bold;
	font-size: 14px;
}

.caption-navigation {
	color: map-get($colors, paginationText);
	font-family: font(lato-regular);
	font-size: size(medium);
	line-height: 0.8;
	margin-left: 1rem;
	text-transform: uppercase;
}
</style>
