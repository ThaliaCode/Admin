<template>
	<div>
		<v-layout wrap py-3>
			<v-flex xs12 px-4 mb-2>
				<v-select
					class="japi-input-select"
					:items="filteredWarehouses"
					v-model="warehouseDestiny"
					label="Almacén de destino"
					item-text="name"
				></v-select>
				<span class="form-group__message" v-if="!$v.warehouseDestiny.required">
					El almacén de destino es requerido.
				</span>
			</v-flex>
			<!-- <v-flex xs12 px-4 mb-2>
				<v-text-field
					no-resize
					multi-line
					class="textarea-content filter-select shadow-inset mt-3"
					name="new-product-description"
					label="Comentario"
					v-model="commentary"
				></v-text-field>
			</v-flex> -->
			<v-flex xs12 px-4>
				<h3 class="title">Lista de traslado</h3>
			</v-flex>
		</v-layout>
		<app-table
			name="products-transfer"
			:columns="columns"
			:key-value="keyValue"
			:rows="filteredProducts"
			:items-quantity="filteredProducts.length"
			local-search
			@on-local-search="callServiceAndSearch"
			@column-input="columnInput"
			class="is-not-selectable"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.warehouseName || props.row.warehouse.name }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.autoBarcode }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.name }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.description }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.brandName }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.inlineFeatures }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.categoryName }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.stock }}</td>
				<td v-show="showRow(columns, 10)">{{ props.row.weigth }}</td>
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
						@click-icon="deleteProduct(props.index)"
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
		<section class="feature-footer">
			<v-flex text-xs-center pa-4>
				<v-btn
					class="btn-action mr-1"
					color="error"
					outline
					type="button"
					@click="closeDialogReturn"
				>
					Atrás
				</v-btn>
				<v-btn
					class="btn-action mr-1"
					color="error"
					outline
					type="button"
					@click="closeModal"
				>
					Cancelar
				</v-btn>
				<v-btn
					:disabled="disabledBtnAccept || !filteredProducts.length"
					class="btn-action mr-1"
					color="primary"
					outline
					type="button"
					@click="makeTransferProducts"
				>
					Guardar
				</v-btn>
			</v-flex>
		</section>
		<v-dialog v-model="showModalConversion" max-width="360px">
			<modal-items
				v-if="showModalConversion"
				:title="productSelected.name"
				show-slot
				@close-modal="closeModal"
				@action-modal="saveConversion"
			>
				<v-layout
					v-for="(item, index) in arrayConversion"
					:key="index"
					row
					d-flex
					justify-center
					align-center
					mb-2
					px-4
					pt-2
					pb-2
				>
					<v-flex xs4 class="label-info pt-2">
						<v-layout column>
							<v-flex>Cant.</v-flex>
							<v-flex pt-1 class="text-quantity"
								>{{ item.quantityConversion }}
								<span class="label-info">{{ productSelected.unitName }}</span>
							</v-flex>
						</v-layout>
					</v-flex>
					<small class="label-info pt-4">Equivale a</small>
					<v-flex ml-2 xs2>
						<app-input-text
							label="Cant."
							type="number"
							class="conversion-quantityTo"
							:text="item.quantityUnit"
							@input="setUnitQuantity($event, index, item)"
						/>
					</v-flex>
					<v-flex ml-2 class="label-info pt-4">
						{{ item.name }}
					</v-flex>
				</v-layout>
			</modal-items>
		</v-dialog>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import helper from '@/shared/helper';
import modalItems from '@/components/shared/modal-items';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';
import appTable from './../../shared/table/app-table';

function created() {
	this.onlyWithStock();
	const newDate = new Date();
	this.dateOnline = newDate.getTime().toString();
	this.loadData();
}
async function loadData() {
	const url = 'warehouses';
	const params = {
		all: 1,
		flagActive: 1,
		flagUserFilter: 1,
	};
	try {
		({ data: this.warehouses } = await this.$httpProducts.get(url, { params }));

		this.filteredWarehouses = this.warehouses.filter(
			(el) => el.id !== this.warehouseOriginId
		);
		if (this.filteredWarehouses.length === 1) {
			this.warehouseDestiny = this.filteredWarehouses[0];
		}
	} catch (error) {
		this.showGenericError();
	}
}

function onlyWithStock() {
	const storageProduct = Boolean(helper.getLocalData('translate-product'));
	if (storageProduct) {
		const productStorage = helper.getLocalData('translate-product');
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
				newItem.conversionNew = this.setConversionFromProduct(e);
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

function callServiceAndSearch(search) {
	const localSearch = search.toLowerCase();
	this.filteredProducts = this.productsWithStock.filter(
		(p) =>
			p.name.toLowerCase() === localSearch ||
			p.code.toLowerCase() === localSearch ||
			p.brandName.toLowerCase() === localSearch
	);
	if (this.filteredProducts.length === 0)
		this.filteredProducts = [...this.productsWithStock];
}

function deleteProduct(index) {
	this.productsWithStock.splice(index, 1);
}

function showConversion(row, index) {
	this.indexRow = index;
	this.showModalConversion = true;
	this.productSelected = row;
	this.arrayConversion = this.setConversionFromProduct(row);
}

function setConversionFromProduct({ conversions }) {
	const conversionsFromProduct = conversions
		? Object.keys(conversions).map((k) => {
				const newConversions = { ...conversions[k] };
				newConversions.quantityConversion = 0;
				newConversions.quantityUnit = 0;
				newConversions.id = Number([k]);
				return newConversions;
		  })
		: [];
	return [].concat(conversionsFromProduct);
}

function formattedProdutcs() {
	return this.filteredProducts.map((item) => {
		const filterProductConversion =
			item.arrayConversion &&
			item.arrayConversion.filter((p) => p.quantityConversion > 0);
		const keyToSend = {
			additionalInformation: {
				conversions:
					filterProductConversion &&
					filterProductConversion.map((conversion) => {
						const newRow = {};
						newRow.codeConversion = conversion.code;
						newRow.unitConversion = conversion.name;
						newRow.unitQuantity = Number(conversion.quantityConversion);
						newRow.quantityTo = Number(conversion.quantityUnit);
						newRow.conversionId = conversion.id;
						newRow.unitId = item.unitId;
						newRow.unitCode = item.unitCode;
						newRow.unitName = item.unitName;
						return newRow;
					}),
			},
			productId: item.id,
			productName: item.name,
			quantity: Number(item.quantity),
			brandId: item.brandId,
		};
		return keyToSend;
	});
}

function validationsData() {
	const quantityMajorStock = this.filteredProducts.every((e) => e.stock >= e.quantity);
	const quantityMajorCero = this.filteredProducts.every((e) => e.quantity > 0);
	const productLot = this.filteredProducts.some((p) => p.flagLotsEnabled);
	if (productLot) {
		this.isLoading = false;
		this.showNotification(
			'Para transferir productos con lote, dirígete al apartado de Control de Lotes',
			'warning'
		);
		return false;
	}
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

async function makeTransferProducts() {
	this.isLoading = true;
	this.disabledBtnAccept = true;
	if (this.validationsData()) {
		const newProducts = this.formattedProdutcs();
		const body = {
			// commentary: this.commentary,
			dateOnline: this.dateOnline,
			warehouseOriginId: this.warehouseOriginId,
			warehouseSourceId: this.warehouseDestiny.id,
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
		localStorage.removeItem(`${process.env.STORAGE_USER_KEY}::translate-product`);
		this.$emit('cancel-modal', false);
	}
}

function closeDialogReturn() {
	this.$emit('close-dialog-return', this.productsWithStock);
}

function columnInput(header) {
	const value = Number(header.event.target.value);
	this.filteredProducts.forEach((row) => {
		this.$set(row, 'quantity', value);
	});
}

function saveConversion() {
	this.closeModal();
	this.filteredProducts[this.indexRow].arrayConversion = this.arrayConversion;
	const quantityTotalConvertion = this.arrayConversion.reduce(
		(total, sale) => total + sale.quantityConversion,
		0
	);
	this.filteredProducts[this.indexRow].quantity = quantityTotalConvertion;
	this.showNotification('Se agregó la conversion correctamente');
}

function setQuantity({ value }, index) {
	this.filteredProducts[index].quantity = value;
	helper.setLocalData('products-selected', this.filteredProducts);
}

function setUnitQuantity({ value }, index, conversion) {
	this.arrayConversion[index].quantityConversion = value * conversion.quantity;
	this.arrayConversion[index].quantityUnit = value;
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

function validations() {
	return {
		warehouseDestiny: {
			required,
		},
	};
}

export default {
	name: 'product-transfer',
	components: {
		appTable,
		modalSidebarButton,
		modalItems,
	},
	created,
	data,
	methods: {
		callServiceAndSearch,
		cleanData,
		closeModal,
		closeDialogReturn,
		columnInput,
		deleteProduct,
		formattedProdutcs,
		loadData,
		showConversion,
		makeTransferProducts,
		saveConversion,
		setConversionFromProduct,
		setUnitQuantity,
		setQuantity,
		onlyWithStock,
		validationsData,
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

<style lang="scss" scoped>
.transfer-column {
	padding: 0 5px !important;
	width: 60px;
}

.text-quantity {
	font-size: 16px;
}
</style>
