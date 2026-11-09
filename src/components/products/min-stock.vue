<template>
	<div>
		<header-page
			show-excel
			to-show
			name="stock-minimo"
			:columns="columns"
			:rows="products"
			:title="$route.meta.title"
			:show-clean="false"
		/>
		<general-filter>
			<v-layout row wrap>
				<v-flex xs12 sm6 md3 px-1 class="align-col">
					<v-select
						bottom
						class="filter-select"
						content-class="filter-select-content"
						hide-details
						item-text="name"
						item-value="id"
						label="Almacén de destino"
						single-line
						:items="warehouses"
						v-model="warehouse"
					></v-select>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto">
			<app-table
				name="min-stock-by-warehouse"
				:columns="columns"
				:rows="productsFilter"
				:key-value="keyValue"
				local-storage
				selectable
				:check-all="checkAll"
				:main-list="false"
				@on-toggle-columns="toggleColumns"
				@on-search-event="callServiceAndSearch"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
				class="no-main-list">
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.warehouseName }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.autoBarcode }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.inlineAlternateCode }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.categoryName }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.inlineFeatures }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 9)">{{ props.row.location }}</td>
					<td v-show="showRow(columns, 10)">{{ props.row.brandName }}</td>
					<td v-show="showRow(columns, 11)">{{ props.row.priceCost | round }}</td>
					<td v-show="showRow(columns, 12)">{{ props.row.price | round }}</td>
					<td v-show="showRow(columns, 13)">{{ props.row.stock }}</td>
					<td v-show="showRow(columns, 14)">
						<v-text-field
							class="filter-select shadow-inset-table"
							hide-details
							single-line
							min="0"
							type="number"
							v-model.number="props.row.quantity"
						></v-text-field>
					</td>
					<td v-show="showRow(columns, 15)">{{ props.row.minStock }}</td>
					<td v-show="showRow(columns, 16)">{{ props.row.weigth }}</td>
					<td v-show="showRow(columns, 17)">
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								class="table-icon red--text"
								@click.native.stop="confirmRemoveProduct(props.row)">
								<v-icon>delete</v-icon>
							</v-btn>
							<span>Eliminar</span>
						</v-tooltip>
					</td>
				</template>
			</app-table>
		</div>
		<v-layout row wrap justify-center>
			<v-flex xs12 sm6 md2
				text-xs-center>
				<v-btn
					class="btn-action"
					color="success"
					:disabled="disabledBtn"
					@click="requestProducts">
					Solicitar productos
				</v-btn>
			</v-flex>
		</v-layout>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="400">
			<v-card>
				<v-card-title class="headline">Eliminar Producto</v-card-title>
				<v-divider></v-divider>
				<v-card-text>¿Desea eliminar el producto {{ productName }}?</v-card-text>
				<v-card-actions>
					<v-layout row wrap justify-center>
						<v-flex xs3 pr-2>
							<v-btn
								class="btn-action"
								color="info"
								@click.native="closeModal">
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs3 pl-2>
							<v-btn
								class="btn-action"
								color="error"
								@click.native="removeProduct">
								Eliminar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	import appTable from './../shared/table/app-table';
	import generalFilter from './../shared/general-filter';
	import headerPage from './../shared/header-page';

	function created() {
		const indexWarehouse = this.columns.findIndex(i => i.value === 'warehouseName');
		this.columns[indexWarehouse].name = this.labelWarehouse();
		this.loadData();
	}

	function callServiceAndSearch(search) {
		if (search) {
			this.productsFilter = this.products.filter(p =>
				p.name.toLowerCase().indexOf(search) > -1
				|| p.code.toLowerCase().indexOf(search) > -1);
		} else {
			this.productsFilter = this.products;
		}
	}

	function closeModal() {
		this.dialog = false;
		this.indexProduct = 0;
	}

	function confirmRemoveProduct({ name, warProductId }) {
		this.productName = name;
		this.indexProduct = this.products.findIndex(p => p.warProductId === warProductId);
		this.dialog = true;
	}

	function disabledBtn() {
		return this.productsFilter.every(p => !p.isSelected) ||
			!!this.productsFilter.find(p => p.isSelected && p.quantity === 0)
			|| this.warehouse === 0;
	}

	async function loadData() {
		const params = {
			warehouses: this.id,
			minStock: 1,
		};
		const request = [
			this.$httpProducts.get('warehouses'),
			this.$httpProducts.get('v2/products', { params }),
		];
		try {
			const [warehouses, products] = await Promise.all(request);
			this.warehouses = warehouses.data;
			this.warehouse = this.warehouses[0].id;
			this.products = products.data.map((product) => {
				const newProduct = { ...product };
				newProduct.quantity = 1;
				newProduct.isSelected = true;
				return newProduct;
			});
			this.productsFilter = Object.assign([], this.products);
		} catch (err) {
			this.showGenericError();
		}
	}

	function removeProduct() {
		this.products.splice(this.indexProduct, 1);
		this.productsFilter = Object.assign([], this.products);
		this.closeModal();
		this.showNotification('El producto ha sido removido de la lista, correctamente.');
	}

	async function requestProducts() {
		if (Number(this.id) === this.warehouse) {
			this.showNotification('No se puede solicitar productos al almacén de origen. Seleccione otro almacén de destino e intente de nuevo',
				'error');
		} else {
			const productsToSend = this.productsFilter.filter(p => p.isSelected && (p.quantity > 0));
			const details = productsToSend.map((product) => {
				const newProduct = { ...product };
				newProduct.detail = {
					brandId: product.brandId,
					productId: product.id,
					productName: product.name,
					quantity: product.quantity,
				};
				return newProduct.detail;
			});
			const model = {
				subsidiaryId: this.$userInfo.comSubsidiariesId,
				warehouseOriginId: Number(this.id),
				warehouseSourceId: this.warehouse,
				details,
			};
			try {
				await this.$httpProducts.post('transfers', model);
				this.showNotification('La solicitud de productos se realizó correctamente.');
				this.goTo('list-of-products');
			} catch (err) {
				this.showGenericError();
			}
		}
	}

	function rowIsSelected(row, all) {
		this.productsFilter = this.productsFilter.map((p) => {
			const newP = Object.assign({}, p);
			if (newP.warProductId === row.warProductId) {
				newP.isSelected = row.isSelected;
			}
			return newP;
		});
		if (row.isSelected) {
			if (this.dataSelected.length > 0 && all) {
				const dataToAdd = this.dataSelected.find(rowSelected =>
					rowSelected.autoBarcode === row.autoBarcode
					&& rowSelected.warProductId === row.warProductId);
				if (!dataToAdd) {
					this.dataSelected.push(row);
				}
			} else {
				this.dataSelected.push(row);
			}
		} else {
			const index = this.dataSelected.findIndex(rowData => rowData[this.keyValue]
				=== row[this.keyValue]);
			this.dataSelected.splice(index, 1);
		}
		this.checkAll = this.productsFilter.every(check => check.isSelected);
	}

	function selectedAll(value) {
		this.checkAll = value;
		this.productsFilter = this.productsFilter.map((dataSingle) => {
			const newData = Object.assign({}, dataSingle);
			newData.isSelected = value;
			if (newData.isSelected) {
				if (this.dataSelected.length > 0) {
					const dataToAdd = this.dataSelected.find(rowSelected =>
						rowSelected.autoBarcode === newData.autoBarcode
						&& rowSelected.warProductId === newData.warProductId);
					if (!dataToAdd) {
						this.dataSelected.push(newData);
					}
				} else {
					this.dataSelected.push(newData);
				}
			} else {
				const index = this.dataSelected.findIndex(rowData => rowData[this.keyValue]
					=== newData[this.keyValue]);
				this.dataSelected.splice(index, 1);
			}
			return newData;
		});
	}

	function toggleColumns() {
		return true;
	}

	function data() {
		return {
			checkAll: true,
			columns: [
				{ id: 1, name: 'Tienda', value: 'warehouseName', visible: true, checked: true },
				{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
				{ id: 3, name: 'Cod. interno', value: 'autoBarcode', visible: true, checked: true },
				{ id: 4, name: 'Otros códigos', value: 'alternateCode', visible: true, checked: true },
				{ id: 5, name: 'Nombre', value: 'name', visible: true, checked: true },
				{ id: 6, name: 'Categorias', value: 'categories', visible: true, checked: true },
				{ id: 7, name: 'Características', value: 'inlineFeatures', visible: true, checked: true },
				{ id: 8, name: 'Descripción', value: 'description', visible: true, checked: true },
				{ id: 9, name: 'Ubicación', value: 'location', visible: true, checked: true },
				{ id: 10, name: 'Marca', value: 'brandName', visible: true, checked: true },
				{ id: 11, name: 'P. costo', value: 'priceCost', visible: true, checked: true },
				{ id: 12, name: 'P. venta', value: 'price', visible: true, checked: true },
				{ id: 13, name: 'Stock', value: 'stock', visible: true, checked: true },
				{ id: 14, name: 'Cantidad', value: 'quantity', visible: true, checked: true },
				{ id: 15, name: 'Stock min', value: 'minStock', visible: true, checked: true },
				{ id: 16, name: 'Kg', value: 'weigth', visible: true, checked: true },
				{ id: 17, name: 'Acciones', visible: true, checked: true, flagVisible: true },
			],
			dataSelected: [],
			dialog: false,
			indexProduct: 0,
			keyValue: 'warProductId',
			products: [],
			productsFilter: [],
			productName: '',
			warehouse: 0,
			warehouses: [],
		};
	}

	export default {
		name: 'min-stock',
		components: {
			appTable,
			generalFilter,
			headerPage,
		},
		computed: {
			disabledBtn,
		},
		created,
		data,
		methods: {
			callServiceAndSearch,
			closeModal,
			confirmRemoveProduct,
			loadData,
			removeProduct,
			requestProducts,
			rowIsSelected,
			selectedAll,
			toggleColumns,
		},
		props: ['id'],
	};
</script>

<style lang="scss" scoped>

</style>