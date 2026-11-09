<template>
	<div>
		<header-page :title="$route.meta.title" />
		<general-filter class="layout wrap align-center mt-4">
			<v-flex xs12 sm4 md3 pr-2 mb-4>
				<v-layout wrap>
					<v-flex xs10>
						<v-select
							:items="inventories"
							v-model="warInventoryId"
							label="Inventario Padre"
							item-text="name"
							item-value="id"
							single-line
							bottom
							hide-details
							class="filter-select"
							content-class="filter-select-content"
						></v-select>
					</v-flex>
					<v-flex xs2>
						<button class="btn-inventory" @click="openInventory">
							<!-- <img
								src="https://s3.amazonaws.com/apprunn-acl/icons/wsog1jABBxCxhy5tEx1ZBHasqzbclH.svg"
								alt="crear inventario"
							/> -->
							<v-icon id="add-icon" color="white" size="14">add</v-icon>
						</button>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 sm4 md6 px-2 mb-4>
				<v-select
					:items="warehouses"
					v-model="warehouse"
					label="Almacén"
					item-text="name"
					item-value="id"
					single-line
					bottom
					hide-details
					class="filter-select"
					content-class="filter-select-content"
					disabled
				></v-select>
			</v-flex>
			<v-flex xs4 pr-2 mb-4>
				<products-search-input
					ref="productSearcher"
					ref-value="productSearcher"
					id="productSearcher"
					:search-value="selectedProduct"
					@search="openSearch"
				/>
			</v-flex>
			<v-flex xs12 sm4 md3 pl-2 mb-4>
				<v-text-field
					class="filter-select"
					placeholder="Ubicación"
					v-model="newProduct.product.location"
				></v-text-field>
			</v-flex>
			<v-flex xs12 sm6 md3 px-2 mb-4>
				<v-layout row justify-space-between align-center>
					<v-flex>
						<span mr-2>Cantidad:</span>
					</v-flex>
					<v-flex mx-2>
						<v-text-field
							bottom
							single-line
							hide-details
							type="number"
							v-model.number="newProduct.quantity"
							label="0"
							class="filter-select"
							content-class="filter-select-content"
						></v-text-field>
					</v-flex>
					<button
						class="pl-add-container size"
						@click="addProduct"
						:disabled="disabledAdd"
					>
						<v-icon id="add-icon" color="white">add</v-icon>
					</button>
				</v-layout>
			</v-flex>
			<v-flex xs11 v-if="inventoryType.id === 2">
				<v-alert type="warning" :value="inventoryType.id === 2">
					<h4>{{ inventoryType.msg.title }}</h4>
					<p class="mb-0">{{ inventoryType.msg.text }}</p>
				</v-alert>
			</v-flex>
		</general-filter>
		<div class="overflow-auto">
			<app-table
				name="inventory-create"
				:columns="columns"
				:rows="rows"
				:key-value="keyValue"
				local-storage
				local-search
				selectable
				:check-all="checkAll"
				:main-list="false"
				@column-input="columnInput"
				@on-toggle-columns="toogleColumns"
				@on-local-search="callServiceAndSearch"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
				class="no-main-list"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.index }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.warehouseName }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.autoBarcode }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.inlineFeatures }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.brandName }}</td>
					<td v-show="showRow(columns, 9)" class="text-xs-center small-td">
						<v-text-field
							label="00"
							type="number"
							v-model.number="props.row.quantity"
							single-line
							hide-details
							class="filter-select shadow-inset-table"
							@click.stop="stopClick"
							@input="changeSelected('quantity', props.row)"
						></v-text-field>
					</td>
					<td v-show="showRow(columns, 10)">{{ props.row.stock }}</td>
					<td v-show="showRow(columns, 11)">
						<v-text-field
							type="text"
							v-model="props.row.location"
							single-line
							hide-details
							class="filter-select shadow-inset-table"
							@click.stop="stopClick"
							@input="changeSelected('location', props.row)"
						></v-text-field>
					</td>
					<td v-show="showRow(columns, 12)">
						{{ getTotalCost(props.row) | round }}
					</td>
					<td v-show="showRow(columns, 13)">{{ props.row.price | round }}</td>
					<td v-show="showRow(columns, 14)">{{ props.row.weigth }}</td>
					<td @click.stop="stopClick">
						<button class="table-icon" v-on:click="deleteRow(props.row)">
							<v-icon color="pink" size="19"> highlight_off </v-icon>
						</button>
					</td>
				</template>
			</app-table>
		</div>
		<div class="companies-btn text-xs-center">
			<v-btn
				type="button"
				color="red"
				class="btn-action"
				title="Atrás"
				@click.native="$router.go(-1)"
			>
				Atrás
			</v-btn>
			<v-btn
				type="button"
				color="primary"
				class="btn-action"
				title="Debe seleccionar los productos que se agregarán al inventario"
				:disabled="dataIncomplete || loading"
				@click.native="createInventory"
			>
				Crear inventario
			</v-btn>
		</div>
		<v-dialog v-model="productAlreadyExist" max-width="500px">
			<v-card>
				<v-card-title>
					<v-layout d-flex justify-center>
						<p class="text-xs-center">
							El producto ya existe en la lista con una cantidad de:
							{{ productRepeated.quantity }}
						</p>
					</v-layout>
				</v-card-title>
				<v-card-text>
					<v-layout row wrap>
						<v-flex xs12>
							<h2 class="text-xs-center">¿Desea sumarlo?</h2>
						</v-flex>
						<v-flex xs12>
							<p class="text-xs-center">
								Cantidad en la lista: {{ productRepeated.quantity }}
							</p>
						</v-flex>
						<v-flex xs12>
							<p class="text-xs-center">Cantidad ingresante: {{ newProduct.quantity }}</p>
						</v-flex>
						<v-flex xs12>
							<p class="text-xs-center">Cantidad total: {{ totalQuantity }}</p>
						</v-flex>
					</v-layout>
				</v-card-text>
				<v-card-actions>
					<v-layout d-flex justify-space-between>
						<v-btn
							type="button"
							@click="cancelAddProduct"
							color="pink"
							class="btn-action mr-1"
						>
							Cancelar
							<v-icon color="white" size="16"> highlight_off </v-icon>
						</v-btn>
						<v-btn
							type="button"
							color="success"
							@click="addProductToTheList"
							class="btn-action ml-1"
						>
							Aceptar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="cancelModal"
		>
			<new-master
				v-if="action.code === 'new-inventory'"
				:warehouses="warehouses"
				:warehouse-id="warehouse"
				@cancel-modal="cancelModal"
				@update="saveMasterInventory"
			/>
			<products-search-form
				v-if="action.code === 'product-searcher'"
				url-products="v2/products"
				:search-value="searchVal"
				:show-filter="false"
				@add-product="setProduct"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import helper from '@/shared/helper';
import actionSidebar from '@/components/shared/action-sidebar';
import newMaster from '@/components/shared/inventories/new-master';
import appTable from './../shared/table/app-table';
import generalFilter from './../shared/general-filter';
import headerPage from './../shared/header-page';

function created() {
	const warehouse = helper.getLocalData('warehouse-selected') || {};
	this.action.title = this.isPeru ? 'CREAR INVENTARIO MAESTRO' : 'CREAR TOMA FÍSICA';
	this.warehouse = warehouse.id;
	const indexWarehouse = this.columns.findIndex((i) => i.value === 'warehouseName');
	this.columns[indexWarehouse].name = this.labelWarehouse();
	this.loadWarehouses();
	this.loadData();
	this.loadInventory();
}

function toogleColumns() {
	return true;
}

function callServiceAndSearch(searchTable) {
	this.localSearch = searchTable ? searchTable.trim() : '';
	if (searchTable) {
		const rowsFilter = this.rows.filter(
			(item) =>
				(item.name.toLowerCase().indexOf(searchTable.toLowerCase()) > -1 &&
					!item.isDeleted) ||
				(item.code.toLowerCase().indexOf(searchTable.toLowerCase()) > -1 &&
					!item.isDeleted)
		);
		this.rows = rowsFilter;
	} else {
		this.updateBackUpRows();
		this.rows = this.reOrderCollection(this.backUpRows.reverse());
	}
}

function updateBackUpRows() {
	this.backUpRows = helper.getLocalData('products-selected') || [];
}

function columnInput(colValue) {
	const value = Number(colValue.event.target.value);
	this.rows.forEach((row) => {
		this.updateAmounts(row, value);
	});
}

async function createInventory() {
	this.loading = true;
	const user = this.$userInfo;
	const modelDetails = this.dataSelected.map((item) => {
		const newItem = { ...item };
		newItem.dataToSend = {
			productId: item.product ? item.product.id : item.id,
			computed: item.quantity,
			location: item.location,
			brandId: item.brandId,
		};
		return newItem.dataToSend;
	});
	const model = {
		warehouseId: this.warehouse,
		inventoryDate: new Date().toISOString(),
		responsible: [`${user.name} ${user.lastname}`],
		details: modelDetails,
		zone: '',
		warInventoryId: this.warInventoryId,
	};
	const errorMessageByCountry = this.isPeru ? 'el inventario maestro' : 'la toma física';
	const messageClosedByCountry = this.isPeru
		? 'El inventario está cerrado'
		: 'La toma física está cerrada';
	const messageRangeByCountry = this.isPeru
		? 'No se puede realizar esta acción , ya que el inventario maestro esta fuera del rango de las fechas permitidas. Modificar el rango de fechas'
		: 'La toma física no está en el rango de fecha';
	try {
		await this.$httpProducts.post('inventories/child', model);
		this.showNotification('El inventario se creó correctamente');
		this.goTo('products');
		helper.removeLocalData('products-selected');
		helper.removeLocalData('inventory-mode-on');
		this.loading = false;
	} catch (err) {
		if (err.data.message === 'ZERO_PRODUCTS') {
			this.showNotification(
				'Al menos 1 producto no pertenece al almacén seleccionado',
				'error'
			);
		} else if (err.data.message === 'INVENTORY_OUT_OF_RANGE') {
			this.showNotification(messageRangeByCountry, 'error');
		} else if (err.data.message === 'INVENTORY_NOT_FOUND') {
			this.showNotification(`No existe ${errorMessageByCountry}`, 'error');
		} else if (err.data.message === 'INVENTORY_ALREADY_CLOSED') {
			this.showNotification(messageClosedByCountry, 'error');
		} else if (err.data.message === 'USER_NO_ACCESS') {
			this.showNotification(
				err.data.messageError || 'El usuario no tiene permiso para el inventario',
				'error'
			);
		} else {
			this.showGenericError(
				`Ocurrió un error al intentar crear ${errorMessageByCountry}`
			);
		}
		this.loading = false;
	}
}

function dataIncomplete() {
	let isIncomplete = true;
	if (this.dataSelected.length > 0) {
		const rowsQuantity = this.dataSelected.every((row) => row.quantity >= 0);
		if (this.warInventoryId && this.warehouse && rowsQuantity) {
			isIncomplete = false;
		}
	}
	return isIncomplete;
}

function deleteRow({ warWarehouseProductBrandId }) {
	this.rows = this.rows
		.filter((p) => p.warWarehouseProductBrandId !== warWarehouseProductBrandId)
		.reverse();
	this.rows = this.reOrderCollection(this.rows);
	this.backUpRows = this.backUpRows.filter(
		(p) => p.warWarehouseProductBrandId !== warWarehouseProductBrandId
	);
	this.dataSelected = this.dataSelected
		.filter((p) => p.warWarehouseProductBrandId !== warWarehouseProductBrandId)
		.reverse();
	helper.setLocalData('products-selected', this.backUpRows);
}

function reOrderCollection(collection) {
	return collection
		.map((item, indexItem) => {
			const newItem = { ...item };
			newItem.index = indexItem + 1;
			return newItem;
		})
		.reverse();
}

function loadData() {
	const localData = helper.getLocalData('products-selected') || [];
	this.rows = localData
		.map((rowData, rowIndex) => {
			const newData = { ...rowData };
			newData.autoBarcode = rowData.product
				? rowData.product.autoBarcode || rowData.autoBarcode
				: rowData.autoBarcode;
			newData.brandName = rowData.brand ? rowData.brand.name : rowData.brandName;
			newData.code = rowData.product
				? rowData.product.code || rowData.code
				: rowData.code;
			newData.description = rowData.product
				? rowData.product.description || rowData.description
				: rowData.description;
			newData.inlineFeatures = rowData.product
				? rowData.product.inlineFeatures || rowData.inlineFeatures
				: rowData.inlineFeatures;
			newData.index = rowIndex + 1;
			newData.isDeleted = false;
			newData.isSelected = false;
			newData.name = rowData.product
				? rowData.product.name || rowData.name
				: rowData.name;
			newData.price = rowData.product
				? rowData.product.price || rowData.price
				: rowData.price;
			newData.quantity = rowData.quantity || 0;
			newData.warehouseName = rowData.warehouse
				? rowData.warehouse.name
				: rowData.warehouseName;
			newData.weigth = rowData.weigth ? rowData.weigth : rowData.weigth;
			return newData;
		})
		.reverse();
	this.backUpRows = [...this.rows];
}

async function loadWarehouses() {
	try {
		({ data: this.warehouses } = await this.$httpProducts.get('warehouses'));
	} catch (err) {
		this.showNotification('Ocurrió un error al intentar cargar las almacenes', 'error');
	}
}

function rowIsSelected(row) {
	({
		products: this.rows,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selectedRows(row, this.rows, this.dataSelected, true));
}

function selectedAll(value) {
	({
		products: this.rows,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.rows, this.dataSelected));
}

function updateRow(row) {
	if (row.isSelected) {
		this.dataSelected = this.dataSelected.map((p) => {
			const newP = { ...p };
			if (p.id === row.id) {
				newP.quantity = row.quantity;
			}
			return newP;
		});
	}
	helper.setLocalData('products-selected', this.rows);
	this.updateAmounts(row, row.quantity);
}

function totalQuantity() {
	const numA = this.newProduct.quantity || 0;
	const numB = this.productRepeated.quantity || 0;
	return numA + numB;
}

function addProduct() {
	const newProduct = { ...this.newProduct.product };
	const productRepeated = this.rows.find(
		(r) =>
			r.code === newProduct.code &&
			r.warehouseId === newProduct.warehouseId &&
			r.location === newProduct.location
	);
	if (productRepeated) {
		this.productRepeated = productRepeated;
		this.productAlreadyExist = true;
	} else {
		this.addProductToTheList.call(this);
	}
}

function cancelAddProduct() {
	this.productAlreadyExist = false;
	this.clearNewProduct();
}

function clearNewProduct() {
	this.newProduct = {
		product: '',
		quantity: 0,
		selectedPriceListId: 0,
	};
	this.productRepeated = {
		quantity: 0,
	};
}

function addProductToTheList() {
	const newProduct = { ...this.newProduct.product };
	newProduct.inlineFeatures = this.newProduct.product.inlineFeatures;
	newProduct.quantity = this.newProduct.quantity;
	newProduct.location = this.newProduct.product.location;
	if (this.productRepeated.code) {
		const index = this.rows.findIndex(
			(r) => r.code === newProduct.code && r.warehouseId === newProduct.warehouseId
		);
		this.rows[index].quantity += newProduct.quantity;
	} else {
		newProduct.index = this.rows.length + 1;
		this.rows.unshift(newProduct);
	}
	helper.setLocalData('products-selected', this.rows);
	this.cancelAddProduct();
}

function updateAmounts(row, value) {
	const index = this.rows.findIndex(
		(r) =>
			r.warehouseId === row.warehouseId &&
			r.location === row.location &&
			r.warProductId === row.warProductId
	);
	if (index !== -1) {
		const detail = this.rows[index];
		detail.quantity = value;
		detail.price = row.price;
	}
}

async function loadInventory() {
	const warehouse = helper.getLocalData('warehouse-selected') || {};
	try {
		const response = await this.$httpProducts.get(
			`inventories/father?warehouseId=${warehouse.id}&status=1`
		);
		response.data.forEach((e) => {
			if (e.name) {
				this.inventories.push(e);
			}
		});
		if (this.inventories.length === 1) {
			this.warInventoryId = this.inventories[0].id;
		} else if (this.inventories.length > 1) {
			this.warInventoryId = this.id ? Number(this.id) : '';
		}
	} catch (error) {
		this.showNotification('Ocurrió un error al intentar cargar inventario', 'error');
	}
}

function openInventory() {
	this.action.open = true;
	this.action.code = 'new-inventory';
}

function cancelModal() {
	this.action.open = false;
	this.action.code = null;
}

async function saveMasterInventory() {
	this.cancelModal();
	this.loadInventory();
}

function stopClick() {
	return false;
}

function disabledAdd() {
	return !this.newProduct.product.id;
}

function changeSelected(model, { id, quantity, location }) {
	const select = this.dataSelected.filter((d) => d.id === id);
	if (select.length) {
		select[0][model] = model === 'quantity' ? quantity : location;
	}
}

function data() {
	return {
		backUpRows: [],
		checkAll: false,
		columns: [
			{ id: 1, name: '#', value: 'index', visible: true, checked: true },
			{
				id: 2,
				name: 'Tienda',
				value: 'warehouseName',
				visible: false,
				checked: false,
			},
			{ id: 3, name: 'Código', value: 'code', visible: true, checked: true },
			{
				id: 4,
				name: 'Cod. interno',
				value: 'autoBarcode',
				visible: true,
				checked: false,
			},
			{ id: 5, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 6,
				name: 'Descripción',
				value: 'description',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Características',
				value: 'inlineFeatures',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Marca',
				value: 'brandName',
				visible: false,
				checked: false,
			},
			{
				id: 9,
				checked: true,
				isEditable: true,
				name: 'Cantidad',
				value: 'quantity',
				visible: true,
				showInput: false,
			},
			{ id: 10, name: 'Stock', value: 'stock', visible: true, checked: true },
			{
				id: 11,
				name: 'Ubicación',
				value: 'location',
				visible: true,
				checked: false,
			},
			{
				id: 12,
				name: 'P. costo',
				value: 'priceCost',
				visible: false,
				checked: false,
			},
			{
				id: 13,
				name: 'P. venta',
				value: 'price',
				visible: false,
				checked: false,
			},
			{ id: 14, name: 'Kg', value: 'weigth', visible: false, checked: false },
			{
				id: 15,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		dataSelected: [],
		inventoryType: 0,
		keyValue: 'warProductId',
		loading: false,
		localSearch: '',
		menu: false,
		newProduct: {
			product: {
				autocomplete: '',
			},
		},
		products: [],
		productAlreadyExist: false,
		productRepeated: {
			quantity: 0,
		},
		rows: [],
		searchVal: null,
		selectedProduct: '',
		warehouse: 0,
		warehouses: [],
		zone: '',
		inventories: [],
		warInventoryId: '',
		action: {
			active: false,
			code: 'new-inventory',
			open: false,
			title: '',
			width: 570,
		},
	};
}

export default {
	name: 'new-inventory',
	components: {
		appTable,
		generalFilter,
		headerPage,
		actionSidebar,
		newMaster,
		productsSearchForm,
		productsSearchInput,
	},
	computed: {
		dataIncomplete,
		totalQuantity,
		disabledAdd,
	},
	created,
	data,
	methods: {
		addProduct,
		addProductToTheList,
		callServiceAndSearch,
		cancelAddProduct,
		cancelModal,
		clearNewProduct,
		columnInput,
		createInventory,
		deleteRow,
		loadData,
		loadWarehouses,
		loadInventory,
		openInventory,
		reOrderCollection,
		rowIsSelected,
		saveMasterInventory,
		selectedAll,
		toogleColumns,
		updateAmounts,
		updateBackUpRows,
		updateRow,
		stopClick,
		changeSelected,
		openSearch(value) {
			this.searchVal = value ? value.trim() : '';
			if (this.searchVal) {
				this.action.code = 'product-searcher';
				this.action.title = 'Productos';
				this.action.width = 930;
				this.action.open = true;
			}
		},
		getTotalCost(row) {
			const { totalCost, product, priceCost } = row;
			if (totalCost) {
				return totalCost;
			} else if (product) {
				return product.totalCost;
			}
			return priceCost;
		},
		setProduct(prod) {
			this.newProduct.product = { ...prod };
			this.cancelModal();
		},
	},
	props: {
		id: {
			type: [String, Number],
		},
	},
};
</script>
<style lang="scss" scoped>
.btn-inventory {
	background: map-get($colors, primary);
	border-radius: 0px 5px 5px 0px;
	height: 33px;
	width: 45px;
}
</style>
