<template>
	<v-container px-3>
		<v-layout row mb-3>
			<v-flex xs5 d-flex justify-start class="sale-document-info">
				<span>#{{sale.typeDocumentName}}</span>
				<span>{{sale.serie}} - {{sale.number}}</span>
			</v-flex>
		</v-layout>
		<v-layout row mb-3>
			<v-flex xs5>
				<v-select
					bottom
					hide-details
					:items="sunatCatalog"
					label="Tipo de nota de débito"
					item-text="description"
					item-value="id"
					v-model="debitType"
					class="filter-select"
					content-class="filter-select-content"
				></v-select>
			</v-flex>
		</v-layout>
		<v-layout wrap px-2 v-if="this.isEcuador">
			<v-text-field
				textarea
				multi-line
				no-resize
				label="Comentario"
				v-model="commentary"
				class="filter-select shadow-inset mt-3 textarea-content">
			</v-text-field>
		</v-layout>
		<v-layout wrap px-2 v-if="this.isEcuador && commentary.length === 0">
			<v-flex>
				<span class="form-group__message mb-3" >
					El comentario es requerido
				</span>
			</v-flex>
		</v-layout>
		<v-layout row mb-3>
			<v-flex xs12 class="product-list mt-3">Lista de productos</v-flex>
		</v-layout>
		<v-layout row d-flex justify-space-between mb-3>
			<v-flex xs3>
				<v-text-field
					hide-details
					label="Concepto"
					v-model="newItem.product.code"
					class="filter-select"
				></v-text-field>
			</v-flex>
			<v-flex xs3>
				<v-text-field
					hide-details
					label="Cantidad"
					v-model="newItem.quantity"
					class="filter-select"
				></v-text-field>
			</v-flex>
			<v-flex xs3>
				<v-text-field
					hide-details
					label="Precio"
					v-model="newItem.price"
					class="filter-select"
				></v-text-field>
			</v-flex>
			<v-flex xs1>
				<button
					:disabled="validateConcepts"
					:class="[validateConcepts ? 'opacyble' : null]"
					@click="addConcepts"
					class="pl-add-container size">
					<v-icon id="add-icon" color="white">add</v-icon>
				</button>
			</v-flex>
		</v-layout>
		<v-layout row mb-3>
			<v-flex xs12>
				<app-table
				name="credit-note"
				:include-filter="false"
				:inputSearch="false"
				:filterColumns="false"
				:main-list="false"
				:columns="columns"
				:rows="ntdProducts"
				class="is-not-selectable">
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.product.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.quantity }}</td>
					<td v-show="showRow(columns, 3)" class="d-flex justify-center">
						<v-flex xs6 v-if="!props.row.showInputText">
							<v-text-field
								hide-details
								single-line
								type="number"
								:max="props.row.quantity"
								v-model.number="props.row.ntcQuantity"
								class="filter-select"
								@change="validateNtcQuantity(props.row.quantity, props.row.ntcQuantity, props.index)"
							></v-text-field>
						</v-flex>
					</td>
					<td v-show="showRow(columns, 4)">{{ props.row.price }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.subTotal }}</td>
					<td v-show="showRow(columns, 6)">
						<button
							class="table-icon"
							@click.stop="removeProducts(props.index, props.row)">
							<v-icon
								color="pink"
								size="19">
								highlight_off
							</v-icon>
						</button>
					</td>
				</template>
			</app-table>	
			</v-flex>
		</v-layout>
		<section class="feature-footer">
			<modal-sidebar-button
				:isLoading="validating"
				@accept-button-clicked="convertDocument"
				@cancel-button-clicked="closeModal"
			/>
		</section>
	</v-container>
</template>

<script>
import appTable from './../../shared/table/app-table';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';

function created() {
	const newDate = new Date();
	this.dateOnline = newDate.getTime().toString();
	this.ntdProducts = this.formatProducts(this.ntdProducts);
	this.loadData();
}

async function loadData() {
	const url = 'catalog-sunat-details-list/10';
	try {
		const response = await this.$httpSales.get(url);
		this.sunatCatalog = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

function addConcepts() {
	this.newItem.subTotal = this.newItem.quantity * this.newItem.price;
	this.ntdProducts.unshift(this.newItem);
	this.newItem = {
		showInputText: true,
		isSelected: true,
		product: {
			code: '',
		},
		quantity: 0,
		price: 0,
		subTotal: 0,
	};
}

function removeProducts(index, product) {
	this.ntdProducts.splice(index, 1);
	const newProduct = { ...product };
	newProduct.isSelected = false;
	this.$emit('update-data-selected', newProduct);
}

function formatProducts(products) {
	return products.map((p) => {
		const newP = { ...p };
		newP.ntcQuantity = 0;
		return newP;
	});
}

function validateNtcQuantity(quantity, ntcQuantity, index) {
	if (Number(ntcQuantity) > Number(quantity)) this.ntdProducts[index].ntcQuantity = quantity;
}

function productDetails(products) {
	return products.map((product) => {
		const newProduct = {};
		const discount = product.priceDiscount ? product.priceDiscount : 0;
		const subtotalWithoutTax = ((product.unitPrice || 0) - discount) * (product.quantity || 0);
		newProduct.discountPercentage = product.discountPercentage || 0;
		newProduct.salePrice = product.salePrice || 0;
		newProduct.subtotalWithoutTax = subtotalWithoutTax;
		newProduct.tax = product.tax || 0;
		newProduct.taxAmount = product.taxAmount || 0;
		newProduct.unitCode = product.unitCode || null;
		newProduct.unitConversion = product.unitConversion || null;
		newProduct.unitId = product.unitId || null;
		newProduct.unitName = product.unitName || null;
		newProduct.unitPrice = product.unitPrice || 0;
		newProduct.unitQuantity = (product.quantity || 0) * (product.unitConversion || 0);
		newProduct.brandId = product.brandId || null;
		newProduct.discount = product.discount || 0;
		newProduct.quantity = product.quantity;
		newProduct.price = product.price;
		newProduct.productType = product.product.typeId || 0;
		newProduct.stockQuantity = product.stockQuantity || 0;
		newProduct.warProductsId = product.warProductsId || null;
		newProduct.warWarehousesId = product.warWarehousesId || null;
		if (this.isEcuador) {
			newProduct.taxes = product.taxes || null;
			newProduct.codeTaxes = product.codeTaxes || null;
		}
		return newProduct;
	});
}

function buildBody(sale, type, products) {
	const listTransactions = sale.transactions ? sale.transactions.map((tr) => {
		const newTransaction = {
			typePaymentId: tr.typePaymentId,
			paymentDate: tr.paymentDate,
			paymentAmount: tr.paymentAmount,
			currency: tr.currency,
			amount: tr.amount,
			additionalInformation: tr.additionalInformation,
			ntcDocumentId: tr.ntcDocumentId,
			documentNumber: tr.documentNumber,
			reference: tr.reference,
			documentReference: tr.documentReference,
			bankAccountId: tr.bankAccountId,
			bankId: tr.bankId,
			urlImage: tr.urlImage,
		};
		return newTransaction;
	}) : [];
	return {
		salDocumentsId: sale.id,
		typeCatalogSunatId: type,
		amount: sale.amount,
		commentary: this.isEcuador ? this.commentary : sale.commentary,
		currency: sale.currency,
		discount: sale.discount,
		exchangeRate: sale.exchangeRate,
		paymentMethodId: sale.paymentMethodId,
		subtotal: sale.subtotal,
		taxes: sale.taxes,
		details: this.productDetails(products),
		amountCash: sale.amountCash,
		transactions: this.isEcuador ? listTransactions : sale.transactions || [],
		transactionId: sale.transactionId || [],
		totalTaxesAmount: this.getEcuadorTaxesAmounts(products),
	};
}

async function convertDocument() {
	const url = `sale-documents/${this.code}/type-note`;
	const body = this.buildBody(this.sale, this.debitType, this.ntdProducts);
	body.dateOnline = this.dateOnline;
	try {
		await this.$httpSales.post(url, body);
		this.showNotification('Nota de Débito generada exitosamente.');
		this.closeModal();
		this.$emit('note-was-registered');
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		} else if (error.status === 400) {
			if (error.data.message === 'SALE_DUPLICATE_ERROR') {
				this.showGenericError('La venta ya ha sido registrada');
			}
		}
	}
}

function validateConcepts() {
	return !(this.newItem.product.code && this.newItem.quantity
		&& this.newItem.price);
}

function validating() {
	const commentValidate = (this.isEcuador ? this.commentary.length === 0 : true);
	return !this.debitType
		|| commentValidate;
}

function closeModal() {
	this.$emit('close-modal');
}

function getEcuadorTaxesAmounts(products) {
	if (products.length > 0) {
		const amounts = products.reduce((acum, currentProduct) => {
			const discount = currentProduct.priceDiscount ? currentProduct.priceDiscount : 0;
			const newAcum = acum;
			newAcum.subtotal += currentProduct.tax && currentProduct.tax > 0 ?
				currentProduct.subtotalWithoutTax : 0;
			newAcum.subtotalIva += currentProduct.tax && currentProduct.tax > 0 ?
				0 : (currentProduct.subtotalWithoutTax || 0);
			newAcum.subtotalNoObjIva = 0;
			newAcum.subtotalExtIva = 0;
			newAcum.discount += discount;
			newAcum.subtotalWithoutTax += ((currentProduct.subtotalWithoutTax || 0) +
				(currentProduct.taxAmount || 0));
			newAcum.iva += currentProduct.taxAmount || 0;
			newAcum.ice = 0;
			newAcum.irbpnr = 0;
			newAcum.tip = 0;
			newAcum.total += ((currentProduct.subtotalWithoutTax || 0) + (currentProduct.taxAmount || 0));
			return newAcum;
		}, { ...this.totalTaxesAmount });
		return amounts;
	}
	return this.totalTaxesAmount;
}

function data() {
	return {
		code: 'NTD',
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Cantidad', value: 'quantity', visible: true, checked: true },
			{ id: 3, name: 'Agregar', value: 'add', visible: true, checked: true },
			{ id: 4, name: 'Precio', value: 'price', visible: true, checked: true },
			{ id: 5, name: 'Total', value: 'total', visible: true, checked: true },
			{ id: 6, name: '', value: 'actions', visible: true, checked: true },
		],
		dateOnline: '',
		debitType: 0,
		newItem: {
			showInputText: true,
			isSelected: true,
			price: 0,
			product: {
				code: '',
			},
			subTotal: 0,
			quantity: 0,
		},
		ntdProducts: [...this.data],
		sunatCatalog: [],
		commentary: '',
		totalTaxesAmount: {
			subtotal: 0,
			subtotalIva: 0,
			subtotalNoObjIva: 0,
			subtotalExtIva: 0,
			discount: 0,
			subtotalWithoutTax: 0,
			iva: 0,
			ice: 0,
			irbpnr: 0,
			tip: 0,
			total: 0,
		},
	};
}

export default {
	name: 'debit-note',
	components: {
		appTable,
		modalSidebarButton,
	},
	computed: {
		validateConcepts,
		validating,
	},
	created,
	data,
	methods: {
		addConcepts,
		buildBody,
		closeModal,
		convertDocument,
		formatProducts,
		loadData,
		productDetails,
		removeProducts,
		validateNtcQuantity,
		getEcuadorTaxesAmounts,
	},
	props: {
		data: {
			type: Array,
			default: () => [],
		},
		sale: {
			type: Object,
			default: () => {},
		},
	},
};
</script>

