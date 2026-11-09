<template>
    <div class="pt-4">
        <v-layout wrap pl-4 pr-4>
            <v-flex xs5 mb-3>
                <label class="list-title">Almacen de Destino</label>
            </v-flex>
        </v-layout>
        <v-layout wrap pl-4 pr-4>
			<v-flex xs7 mb-3>
				<v-select
					:items="filteredWarehouses"
					v-model="warehouseDestiny"
					label="Destino"
					item-text="name"
					item-value="id"
					single-line
					bottom
					hide-details
					class="filter-select"
					content-class="filter-select-content"
				></v-select>
			</v-flex>
		</v-layout>
        <v-layout wrap pl-4 pr-4>
			<v-flex xs12 mb-3>
				<label class="list-title">Lista de traslado</label>
			</v-flex>
		</v-layout>
        <v-layout wrap>
			<v-flex xs12>
				<app-table
					name="transfer-lots"
					:columns="columns"
					:rows="filteredProducts"
                    :items-quantity="filteredProducts.length"
					:input-search="false"
					class="is-not-selectable"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable" v-show="showRow(columns, 1)">
					        {{ props.row.warehouse.name }}
                        </td>
                        <td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
                        <td v-show="showRow(columns, 3)">{{ props.row.product.autoBarcode }}</td>
                        <td v-show="showRow(columns, 4)">{{ props.row.product.name }}</td>
                        <td v-show="showRow(columns, 5)">{{ props.row.product.description }}</td>
                        <td v-show="showRow(columns, 6)">{{ props.row.warehouseProduct.brand.name }}</td>
                        <td v-show="showRow(columns, 7)">{{ props.row.product.inlineFeatures }}</td>
                        <td v-show="showRow(columns, 8)">{{ props.row.product.category.name }}</td>
                        <td v-show="showRow(columns, 9)">{{ props.row.stock }}</td>
                        <td v-show="showRow(columns, 10)">{{ props.row.product.weigth }}</td>
                        <td v-show="showRow(columns, 11)" class="transfer-column">
                            <app-input-text
                                class="japi-input-text-table"
                                model="quantity"
                                :text="props.row.quantity"
                                @input="setQuantity($event, props.index)"
                            />
                            <!-- <v-text-field
                            class="japi-input-text-table"
                            type="number"
                            v-model.number="props.row.quantity"
                            ></v-text-field> -->
                        </td>
                        <td v-show="showRow(columns, 12)">
                            <app-tooltip-button
                                color="error"
                                icon="delete"
                                text="Eliminar Producto"
                                @click-icon="deleteRow(props.row)"
                            />
                            <app-tooltip-button
                                v-if="props.row.conversionNew && props.row.conversionNew.length > 0"
                                color="primary"
                                icon="done"
                                text="Seleccionar Conversión"
                                @click-icon="showConversion(props.row, props.index)"
                            />
                        </td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
        <section class="modal-filter-footer">
			<modal-sidebar-button
				:isLoading="!(!!productsWithStock.length && warehouseDestiny)"
				@cancel-button-clicked="$emit('cancel-modal')"
				@accept-button-clicked="makeTransferProducts"
			/>
		</section>
    </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import helper from '@/shared/helper';

function created() {
	this.onlyWithStock();
	const newDate = new Date();
	this.dateOnline = newDate.getTime().toString();
	this.loadData();
}

function data() {
    return {
        arrayConversion: [],
		commentary: '',
		dateOnline: null,
		disabledBtnAccept: false,
		keyValue: 'warProductId',
		isReturn: false,
		isLoading: false,
		productSelected: {},
		filteredProducts: [],
		filteredWarehouses: [],
		newColumns: [],
		productsWithStock: [],
		showModalConversion: false,
		warehouseDestiny: {},
		warehouses: [],
    };
}

function filterWarehouses(warehouses) {
	this.filteredWarehouses = warehouses.filter((el) => el.id !== this.warehouseId);
	if (this.filteredWarehouses.length === 1) {
		this.warehouse = this.filteredWarehouses[0];
	}
}

async function loadData() {
	const response = await this.$httpProducts.get('warehouses?all=1');
	this.warehouses = response.data;
	this.filterWarehouses(this.warehouses);
}

function deleteRow(rowSerie) {
	const id = rowSerie.id;
	const index = this.productsWithStock.map((row) => row.id).indexOf(id);
	this.productsWithStock.splice(index, 1);
}

function setQuantity({ value }, index) {
	this.filteredProducts[index].quantity = value;
	helper.setLocalData('products-selected', this.filteredProducts);
}

function onlyWithStock() {
	const storageProduct = Boolean(helper.getLocalData('transfer-lots'));
	if (storageProduct) {
        const productStorage = helper.getLocalData('transfer-lotss');
		const newProducts = [...this.products];
		this.productsWithStock = newProducts.filter((e) => e.stock > 0);
		this.productsWithStock = this.productsWithStock.map((p) => {
			const indexProd = productStorage.findIndex(
				(s) => s.warProductId === p.warProductId
			);
			const newRow = { ...p };
			if (indexProd > -1) {
				newRow.quantity = productStorage[indexProd].quantity;
			}
			return newRow;
		});
		this.filteredProducts = [...this.productsWithStock];
		if (this.productsWithStock.length < this.products.length) {
			this.showNotification('Solo se muestran los productos que tienen stock', 'warning');
		}
	} else {
        const newProducts = [...this.products];
		this.productsWithStock = newProducts
			.filter((e) => e.stock > 0)
			.map((e) => {
				const newItem = { ...e };
				newItem.quantity = 0;
				return newItem;
			});
        const productSerie = this.productsWithStock.some((p) => p.flagControlSerie);
        if (this.productsWithStock.length < this.products.length) {
			this.showNotification('Solo se muestran los productos que tienen stock', 'warning');
		}
		if (productSerie) {
			this.productsWithStock = this.productsWithStock.filter((p) => !p.flagControlSerie);
			this.showNotification(
				'Para transferir productos con serie, dirígete al apartado de Control de Series',
				'warning'
			);
		}
		this.filteredProducts = this.productsWithStock;
	}
}

function validationsData() {
	const quantityMajorStock = this.filteredProducts.every((e) => e.stock >= e.quantity);
	const quantityMajorCero = this.filteredProducts.every((e) => e.quantity > 0);
	if (!quantityMajorStock) {
		this.isLoading = false;
		this.showNotification(
			'La cantidad a transferir debe ser menor al stock disponible',
			'warning'
		);
		return false;
	}
	if (!quantityMajorCero) {
		this.isLoading = false;
		this.showNotification(
			'La cantidad a transferir debe ser mayor a cero "0"',
			'warning'
		);
		return false;
	}
	if (this.$v.$invalid) {
		this.isLoading = false;
		this.showNotification('Debe seleccionar un almacén de destino', 'warning');
		return false;
	}
	return true;
}

function formattedProdutcs() {
    return this.filteredProducts.map((item) => {
			const keyToSend = {
			additionalInformation: {
				codeLot: item.code,
			},
			productId: item.product.id,
			productName: item.product.name,
			quantity: Number(item.quantity),
			brandId: item.brandId,
		};
		return keyToSend;
	});
}

async function makeTransferProducts() {
	this.isLoading = true;
	this.disabledBtnAccept = true;
	if (this.validationsData()) {
		const newProducts = this.formattedProdutcs();
		const body = {
			// commentary: this.commentary,
			dateOnline: this.dateOnline,
			warehouseOriginId: this.warehouseOriginId,
			warehouseSourceId: this.warehouseDestiny,
			subsidiaryId: this.$userInfo.comSubsidiariesId,
			details: newProducts,
			entryDate: helper.exactDate(this.$today(), 'YYYY-MM-DD'),
			code: 'MPA',
		};
        try {
			await this.$httpProducts.post('transfers', body);
			this.$emit('transfer-product');
			this.showNotification('Transacción exitosa');
			this.cleanData();
			this.closeModal();
		} catch (e) {
			this.showNotification(
				'Se produjo un error inesperado. Recargue la página',
				'error'
			);
		}
	}
	this.disabledBtnAccept = false;
	this.isLoading = false;
}

function cleanData() {
	this.warehouseDestiny = {};
	this.dateOnline = null;
	this.productsWithStock = this.productsWithStock.map((l) => {
		const row = { ...l };
		row.quantity = 0;
		return row;
	});
}

function closeModal() {
	if (this.showModalConversion) {
		this.showModalConversion = false;
	} else {
		this.cleanData();
		localStorage.removeItem(`${process.env.STORAGE_USER_KEY}::transfer-lots`);
		this.$emit('cancel-modal', false);
	}
}

function validations() {
	return {
		warehouseDestiny: {
			required,
		},
	};
}

export default {
	name: 'transfer-lots',
	data,
	created,
	components: {
		appTable,
		modalSidebarButton,
	},
	methods: {
		deleteRow,
		loadData,
		onlyWithStock,
		makeTransferProducts,
		filterWarehouses,
        validationsData,
        formattedProdutcs,
        setQuantity,
		cleanData,
		closeModal,
	},
	props: {
		products: {
			type: Array,
			required: true,
			default: [],
		},
		warehouseOriginId: {
			type: Number,
			required: true,
			default: 0,
		},
		columns: {
			type: Array,
			required: true,
			default: [],
		},
	},
	validations,
};

</script>